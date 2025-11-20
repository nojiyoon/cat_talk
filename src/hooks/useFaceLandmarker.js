import { useState, useEffect, useRef, useCallback } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export function useFaceLandmarker() {
    const [emotion, setEmotion] = useState('neutral')
    const [emotionScores, setEmotionScores] = useState({ smile: 0, frown: 0 })
    const [isReady, setIsReady] = useState(false)
    const [isModelLoading, setIsModelLoading] = useState(true)
    const [isFaceDetected, setIsFaceDetected] = useState(false)
    const faceLandmarkerRef = useRef(null)
    const videoRef = useRef(null)
    const animationFrameRef = useRef(null)

    useEffect(() => {
        let mounted = true

        async function initializeFaceLandmarker() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                )

                const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                        delegate: 'GPU'
                    },
                    outputFaceBlendshapes: true,
                    runningMode: 'VIDEO',
                    numFaces: 1
                })

                if (mounted) {
                    faceLandmarkerRef.current = faceLandmarker
                    setIsReady(true)
                    setIsModelLoading(false)
                }
            } catch (error) {
                console.error('Failed to initialize Face Landmarker:', error)
                if (mounted) {
                    setIsModelLoading(false) // Stop loading even on error
                }
            }
        }

        initializeFaceLandmarker()

        return () => {
            mounted = false
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [])

    const startDetection = useCallback(async (videoElement) => {
        if (!faceLandmarkerRef.current || !videoElement) return

        videoRef.current = videoElement

        const detect = async () => {
            if (!videoRef.current || videoRef.current.readyState !== 4) {
                animationFrameRef.current = requestAnimationFrame(detect)
                return
            }

            const results = faceLandmarkerRef.current.detectForVideo(
                videoRef.current,
                performance.now()
            )

            if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                setIsFaceDetected(true)
                const blendshapes = results.faceBlendshapes[0].categories

                // Improved emotion detection
                const smileLeft = blendshapes.find(b => b.categoryName === 'mouthSmileLeft')?.score || 0
                const smileRight = blendshapes.find(b => b.categoryName === 'mouthSmileRight')?.score || 0
                const avgSmile = (smileLeft + smileRight) / 2

                const frownLeft = blendshapes.find(b => b.categoryName === 'mouthFrownLeft')?.score || 0
                const frownRight = blendshapes.find(b => b.categoryName === 'mouthFrownRight')?.score || 0
                const avgFrown = (frownLeft + frownRight) / 2

                // Update scores for debugging
                setEmotionScores({ smile: avgSmile, frown: avgFrown })

                if (avgSmile > 0.25) {
                    setEmotion('happy')
                } else if (avgFrown > 0.25) {
                    setEmotion('sad')
                } else {
                    setEmotion('neutral')
                }
            } else {
                setIsFaceDetected(false)
            }

            animationFrameRef.current = requestAnimationFrame(detect)
        }

        detect()
    }, [])

    const stopDetection = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
        }
    }, [])

    return {
        emotion,
        emotionScores,
        isReady,
        isModelLoading,
        isFaceDetected,
        startDetection,
        stopDetection
    }
}
