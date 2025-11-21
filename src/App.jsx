import { useState, useEffect, useRef } from 'react'
import Scene from './components/Scene'
import { useSpeech } from './hooks/useSpeech'
import { useFaceLandmarker } from './hooks/useFaceLandmarker'
import { useTeachableMachine } from './hooks/useTeachableMachine'
import { getCatResponse } from './services/aiService'
import { supabase } from './services/supabase'
import './App.css'

function App() {
  const { isListening, isSpeaking, transcript, startListening, stopListening, speak } = useSpeech()
  const { emotion, emotionScores, isReady, isModelLoading: isFaceModelLoading, isFaceDetected, faceLandmarks, startDetection, stopDetection } = useFaceLandmarker()
  const { predict: predictAnimalFace, isModelLoading: isTMModelLoading } = useTeachableMachine()

  const isModelLoading = isFaceModelLoading || isTMModelLoading
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

  const analyzePhysiognomy = () => {
    if (!faceLandmarks) return null;

    const getDist = (i1, i2) => {
      const p1 = faceLandmarks[i1];
      const p2 = faceLandmarks[i2];
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    // Eye Size (Simple approximation)
    const leftEyeH = getDist(159, 145);
    const rightEyeH = getDist(386, 374);
    const faceWidth = getDist(234, 454);
    const eyeRatio = (leftEyeH + rightEyeH) / (2 * faceWidth);
    const eyeSize = eyeRatio > 0.06 ? "큼" : "작음";

    // Forehead Height
    const foreheadH = getDist(10, 168); // Top to Glabella
    const faceH = getDist(10, 152); // Top to Chin
    const foreheadRatio = foreheadH / faceH;
    const foreheadHeight = foreheadRatio > 0.3 ? "넓음" : "좁음";

    return { eyeSize, foreheadHeight };
  };

  const handlePhysiognomy = async () => {
    if (!videoRef.current) {
      speak("카메라가 안 보여유!")
      return
    }

    speak("어디 보자... 무슨 동물상인지 한번 봐볼까유?")
    setLastResponse("🔮 관상(동물상) 보는 중... (킁킁)")

    try {
      // 1. Analyze Animal Face
      const predictions = await predictAnimalFace(videoRef.current)

      let animalType = "알 수 없음"
      let description = ""

      if (predictions && predictions.length > 0) {
        const topPrediction = predictions[0]
        animalType = topPrediction.className
        const probability = (topPrediction.probability * 100).toFixed(1)
        description = `당신은 ${probability}% 확률로 '${animalType}'입니다.`
      }

      // 2. Analyze Geometric Features (Optional, keeping it for extra detail if landmarks exist)
      let featureText = ""
      if (faceLandmarks) {
        const features = analyzePhysiognomy()
        if (features) {
          featureText = `(추가 특징: 눈 ${features.eyeSize}, 이마 ${features.foreheadHeight})`
        }
      }

      const fullAnalysis = `${description} ${featureText}`.trim()

      // 3. Get AI Response
      const response = await getCatResponse(
        `내 동물상 좀 봐줘! 결과: ${fullAnalysis}`,
        emotion,
        chatHistory.slice(-5),
        { isPhysiognomyMode: true, animalType, features: fullAnalysis }
      )

      setLastResponse(response)
      speak(response)

      // Save to history
      const newHistory = [
        ...chatHistory,
        { role: 'user', content: "🔮 동물상 봐줘!" },
        { role: 'assistant', content: response }
      ]
      setChatHistory(newHistory)

      // Save to Supabase
      try {
        await supabase.from('physiognomy_logs').insert([
          {
            features: { animalType, fullAnalysis },
            response: response,
            emotion: emotion
          }
        ])
      } catch (dbError) {
        console.error('Failed to save physiognomy log to DB:', dbError)
      }

    } catch (error) {
      console.error('Physiognomy error:', error)
      speak("아이고, 잘 안 보이네유...")
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

        <div className="button-group">
          <button
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking}
          >
            {isListening ? '🎤 Listening...' : isSpeaking ? '💬 Speaking...' : '🎤 Click to Talk'}
          </button>

          <button
            className="physiognomy-button"
            onClick={handlePhysiognomy}
            disabled={isSpeaking || isListening || !isFaceDetected}
          >
            🔮 관상 봐주기
          </button>
        </div>

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
