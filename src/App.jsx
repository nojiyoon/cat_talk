import { useState, useEffect, useRef } from 'react'
import Scene from './components/Scene'
import { useSpeech } from './hooks/useSpeech'
import { useFaceLandmarker } from './hooks/useFaceLandmarker'
import { getCatResponse } from './services/aiService'
import { supabase } from './services/supabase'
import './App.css'

function App() {
  const { isListening, isSpeaking, transcript, startListening, stopListening, speak } = useSpeech()
  const { emotion, emotionScores, isReady, isModelLoading, isFaceDetected, startDetection, stopDetection } = useFaceLandmarker()
  const [lastResponse, setLastResponse] = useState('')
  // Initialize chat history from localStorage
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('cat_talk_history')
    return saved ? JSON.parse(saved) : []
  })
  const videoRef = useRef(null)
  const [cameraActive, setCameraActive] = useState(false)

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cat_talk_history', JSON.stringify(chatHistory))
  }, [chatHistory])

  // Initialize camera for face detection
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraActive(true)

          if (isReady) {
            startDetection(videoRef.current)
          }
        }
      } catch (error) {
        console.error('Camera access denied:', error)
      }
    }

    setupCamera()

    return () => {
      stopDetection()
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [isReady, startDetection, stopDetection])

  // Handle transcript changes
  useEffect(() => {
    if (transcript && !isSpeaking) {
      handleUserInput(transcript)
    }
  }, [transcript])

  const handleUserInput = async (userMessage) => {
    if (!userMessage.trim()) return

    stopListening()

    try {
      // Send only the last 10 messages for context to save tokens
      const contextHistory = chatHistory.slice(-10)
      const response = await getCatResponse(userMessage, emotion, contextHistory)

      // Update history with user message and assistant response (keep all history)
      const newHistory = [
        ...chatHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response }
      ]

      setChatHistory(newHistory)
      setLastResponse(response)
      speak(response)

      // Save to Supabase (Fire and forget)
      try {
        await supabase.from('chat_history').insert([
          { role: 'user', content: userMessage, emotion: emotion },
          { role: 'assistant', content: response, emotion: 'neutral' } // Assistant emotion could be refined later
        ])
      } catch (dbError) {
        console.error('Failed to save to DB:', dbError)
      }

    } catch (error) {
      console.error('Failed to get response:', error)
      speak('미안하다냥... 무슨 말인지 못 알아들었냥')
    }
  }

  return (
    <div className="app-container">
      {/* Video for face detection and user feedback */}
      <video
        ref={videoRef}
        className="camera-feed"
        playsInline
        muted
      />

      {/* Model Status Overlay */}
      <div className="model-status-overlay">
        {isModelLoading ? (
          <>
            <span>🟡</span>
            <span>📷 모델 준비 중...</span>
          </>
        ) : !isFaceDetected ? (
          <>
            <span>⚪</span>
            <span>얼굴을 보여주세요</span>
          </>
        ) : (
          <>
            <span>🟢</span>
            <span>
              {emotion === 'happy' ? 'Happy' : emotion === 'sad' ? 'Sad' : 'Neutral'} /{' '}
              {emotion === 'neutral'
                ? Math.max(0, (1 - (emotionScores.smile + emotionScores.frown)) * 100).toFixed(0)
                : ((emotion === 'happy' ? emotionScores.smile : emotionScores.frown) * 100).toFixed(0)}
              %
            </span>
          </>
        )}
      </div>

      {/* 3D Scene */}
      <div className="scene-container">
        <Scene isSpeaking={isSpeaking} />
      </div>

      {/* UI Overlay */}
      <div className="ui-overlay">
        <h1 className="title">🐱 Talking Cat</h1>

        <div className="status-panel">
          <div className="status-item">
            <span className="status-label">Emotion:</span>
            <span className={`status-value emotion-${emotion}`}>
              {emotion === 'happy' ? '😊' : emotion === 'sad' ? '😢' : '😐'} {emotion}
            </span>
          </div>

          <div className="status-item">
            <span className="status-label">Camera:</span>
            <span className={`status-value ${cameraActive ? 'active' : 'inactive'}`}>
              {cameraActive ? '✓' : '✗'}
            </span>
          </div>
        </div>

        <button
          className={`mic-button ${isListening ? 'listening' : ''}`}
          onClick={isListening ? stopListening : startListening}
          disabled={isSpeaking}
        >
          {isListening ? '🎤 Listening...' : isSpeaking ? '💬 Speaking...' : '🎤 Click to Talk'}
        </button>

        {transcript && (
          <div className="transcript-box">
            <strong>You:</strong> {transcript}
          </div>
        )}

        {lastResponse && (
          <div className="response-box">
            <strong>Cat:</strong> {lastResponse}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
