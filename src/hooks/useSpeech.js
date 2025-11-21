import { useState, useEffect, useRef, useCallback } from 'react'
import OpenAI from 'openai'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY
let openai

if (apiKey) {
    openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
    })
}

export function useSpeech() {
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [transcript, setTranscript] = useState('')
    const recognitionRef = useRef(null)
    const audioRef = useRef(null)

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported')
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'ko-KR'

        recognition.onresult = (event) => {
            const current = event.resultIndex
            const transcriptText = event.results[current][0].transcript

            if (event.results[current].isFinal) {
                setTranscript(transcriptText)
            }
        }

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error)
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        recognitionRef.current = recognition
    }, [])

    // Base64 silent MP3 to unlock audio context
    const SILENT_AUDIO_URL = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAADxMYXZjNTguMTM0LjEwMAAAAAAAAAAAAAAA//OEAAABAAAAAB0AAAAAAAAAAAAAAJFi'

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            // Mobile Audio Unlock: Initialize and play silent audio on user gesture
            if (!audioRef.current) {
                audioRef.current = new Audio()
            }

            // Play silent audio to unlock the element
            audioRef.current.src = SILENT_AUDIO_URL
            audioRef.current.play().catch(e => console.log('Audio unlock failed:', e))

            recognitionRef.current.start()
            setIsListening(true)
            setTranscript('')
        }
    }, [isListening])

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        }
    }, [isListening])

    const speak = useCallback(async (text) => {
        setIsSpeaking(true)

        // Helper to play audio from a URL
        const playAudio = async (url) => {
            if (!audioRef.current) {
                audioRef.current = new Audio()
            }
            audioRef.current.src = url

            return new Promise((resolve, reject) => {
                audioRef.current.onended = () => {
                    setIsSpeaking(false)
                    URL.revokeObjectURL(url)
                    resolve()
                }
                audioRef.current.onerror = (e) => {
                    setIsSpeaking(false)
                    reject(e)
                }
                audioRef.current.play().catch(reject)
            })
        }

        // 1. Try ElevenLabs TTS
        try {
            const elevenLabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY
            const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID

            if (!elevenLabsKey || !voiceId) {
                throw new Error('ElevenLabs credentials not found')
            }

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': elevenLabsKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    model_id: "eleven_multilingual_v2",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    }
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(`ElevenLabs API Error: ${response.status} ${JSON.stringify(errorData)}`)
            }

            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            await playAudio(url)
            return // Success, exit function

        } catch (elevenLabsError) {
            console.warn('ElevenLabs TTS failed, switching to OpenAI Fallback:', elevenLabsError)
            // Fallback proceeds to next block
        }

        // 2. Fallback: OpenAI TTS
        try {
            if (!openai) throw new Error('OpenAI API Key missing')

            const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: "nova", // 'nova' fits the cat persona
                input: text,
            })

            const blob = await mp3.blob()
            const url = URL.createObjectURL(blob)
            await playAudio(url)
            return // Success

        } catch (openAIError) {
            console.error('OpenAI TTS also failed:', openAIError)

            // 3. Fallback: Browser TTS
            setIsSpeaking(false) // Reset state before browser TTS
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'ko-KR'
            utterance.onend = () => setIsSpeaking(false)
            utterance.onerror = () => setIsSpeaking(false)
            window.speechSynthesis.speak(utterance)
            setIsSpeaking(true)
        }
    }, [])

    return {
        isListening,
        isSpeaking,
        transcript,
        startListening,
        stopListening,
        speak
    }
}
