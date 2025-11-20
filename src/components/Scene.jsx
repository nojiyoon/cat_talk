import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import CatModel from './CatModel'

export default function Scene({ isSpeaking }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ background: 'linear-gradient(to bottom, #FFE5E5, #FFF0F5)' }}
    >
      {/* Much brighter lighting setup */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-5, 5, -5]} intensity={1.0} />
      <pointLight position={[0, 5, 2]} intensity={0.8} /> {/* Front fill light */}

      <Environment preset="city" />

      <CatModel isSpeaking={isSpeaking} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
    </Canvas>
  )
}
