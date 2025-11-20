import { useState, useEffect, useRef, useCallback } from 'react'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side usage
})

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

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
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
        try {
            setIsSpeaking(true)

            const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: "nova", // 'nova' is a good fit for a lively/cute persona
                input: text,
            })

            const blob = await mp3.blob()
            const url = URL.createObjectURL(blob)

            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }

            const audio = new Audio(url)
            audioRef.current = audio

            audio.onended = () => {
                setIsSpeaking(false)
                URL.revokeObjectURL(url)
            }

            audio.play()
        } catch (error) {
            console.error('OpenAI TTS error:', error)
            setIsSpeaking(false)
            // Fallback to browser TTS if OpenAI fails
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'ko-KR'
            window.speechSynthesis.speak(utterance)
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
