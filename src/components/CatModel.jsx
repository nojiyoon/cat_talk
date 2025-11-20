import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

export default function CatModel({ isSpeaking }) {
    const meshRef = useRef()
    const { scene } = useGLTF('/cat.glb')

    // Clone the scene so we can use it multiple times if needed
    const clone = scene.clone()

    useFrame((state) => {
        if (!meshRef.current) return

        if (isSpeaking) {
            // Bounce animation when speaking
            const bounce = Math.sin(state.clock.elapsedTime * 8) * 0.2
            meshRef.current.position.y = bounce - 1 // Adjusted base position

            // Scale pulsing effect
            const scale = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.1
            meshRef.current.scale.set(scale, scale, scale)
        } else {
            // Gentle idle animation
            const idle = Math.sin(state.clock.elapsedTime * 2) * 0.05
            meshRef.current.position.y = idle - 1 // Adjusted base position
            meshRef.current.scale.set(1, 1, 1)
        }

        // Gentle rotation
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    })

    return (
        <primitive
            ref={meshRef}
            object={clone}
            scale={2} // Fixed scale
            position={[0, -1, 0]} // Fixed position
        />
    )
}

// Preload the model
useGLTF.preload('/cat.glb')
