import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text3D, Center, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ─── Floating Card Mesh ───
const FloatingCard: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  delay?: number;
  color?: string;
}> = ({ position, rotation = [0, 0, 0], delay = 0, color = '#d4af37' }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime + delay;
    meshRef.current.rotation.x = rotation[0] + Math.sin(t * 0.5) * 0.1;
    meshRef.current.rotation.y = rotation[1] + Math.sin(t * 0.3) * 0.15;
    meshRef.current.rotation.z = rotation[2] + Math.cos(t * 0.4) * 0.05;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.15;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.15 : 1}
    >
      <boxGeometry args={[0.7, 1, 0.02]} />
      <meshStandardMaterial
        color={hovered ? '#f0d060' : '#1a1a2e'}
        emissive={color}
        emissiveIntensity={hovered ? 0.4 : 0.15}
        metalness={0.8}
        roughness={0.2}
      />
      {/* Card border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.7, 1, 0.02)]} />
        <lineBasicMaterial color={color} transparent opacity={hovered ? 0.9 : 0.4} />
      </lineSegments>
      {/* Card inner pattern */}
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[0.55, 0.85]} />
        <meshStandardMaterial
          color="#242445"
          emissive={color}
          emissiveIntensity={0.05}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Center C logo */}
      <mesh position={[0, 0, 0.012]}>
        <ringGeometry args={[0.1, 0.15, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.5}
        />
      </mesh>
    </mesh>
  );
};

// ─── Particles ───
const Particles: React.FC<{ count?: number }> = ({ count = 200 }) => {
  const mesh = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
      mesh.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#d4af37"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// ─── Glowing Table Surface ───
const CardTable: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.02 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
      <circleGeometry args={[4, 64]} />
      <meshStandardMaterial
        color="#0a1a0a"
        emissive="#1a4a2a"
        emissiveIntensity={0.03}
        metalness={0.1}
        roughness={0.9}
      />
    </mesh>
  );
};

// ─── Mouse-tracking Camera ───
const CameraRig: React.FC = () => {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.5 - camera.position.x) * 0.05;
    camera.position.y += (-mouse.current.y * 0.3 + 0.5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// ─── Main 3D Scene ───
const Scene3D: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 3, 2]} intensity={1.5} color="#d4af37" distance={12} />
      <pointLight position={[-3, 2, -1]} intensity={0.5} color="#6c3483" distance={10} />
      <pointLight position={[3, 2, -1]} intensity={0.5} color="#2ecc71" distance={10} />
      <spotLight
        position={[0, 5, 0]}
        angle={0.6}
        penumbra={0.8}
        intensity={1}
        color="#d4af37"
        castShadow
      />

      <CameraRig />
      <CardTable />
      <Particles count={300} />
      <Stars radius={15} depth={50} count={1000} factor={3} saturation={0} fade speed={1} />

      {/* Four floating cards */}
      <FloatingCard position={[-1.0, 0, 0.3]} rotation={[0.2, -0.3, 0.1]} delay={0} />
      <FloatingCard position={[-0.35, 0.1, -0.2]} rotation={[-0.1, 0.2, -0.05]} delay={1.5} />
      <FloatingCard position={[0.35, 0.05, 0.1]} rotation={[0.15, -0.1, 0.08]} delay={3} />
      <FloatingCard position={[1.0, -0.05, -0.3]} rotation={[-0.2, 0.3, -0.1]} delay={4.5} />

      {/* Deck pile */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[2.5, -1.3 + i * 0.025, 0]} rotation={[-Math.PI / 2 + 0.02, 0, 0.05]}>
          <boxGeometry args={[0.7, 1, 0.02]} />
          <meshStandardMaterial color="#1a1a2e" emissive="#d4af37" emissiveIntensity={0.02} />
        </mesh>
      ))}

      {/* Discard pile */}
      <mesh position={[-2.5, -1.3, 0]} rotation={[-Math.PI / 2 + 0.02, 0, -0.08]}>
        <boxGeometry args={[0.7, 1, 0.02]} />
        <meshStandardMaterial color="#e8e8f0" emissive="#d4af37" emissiveIntensity={0.1} />
      </mesh>
    </>
  );
};

// ─── Exported Component ───
export const HeroScene: React.FC<{
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  joinCode: string;
  setJoinCode: (code: string) => void;
  onSubmitJoin: () => void;
  error: string | null;
  onShowRules: () => void;
}> = ({ onCreateRoom, onJoinRoom, playerName, setPlayerName, joinCode, setJoinCode, onSubmitJoin, error, onShowRules }) => {
  const [showJoinInput, setShowJoinInput] = useState(false);

  return (
    <section id="hero" className="relative w-full h-screen overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0.5, 4], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Scene3D />
        </Canvas>
      </div>

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(6,6,9,0.6) 70%, rgba(6,6,9,0.9) 100%)',
        }}
      />

      {/* HTML Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        {/* Title */}
        <div className="text-center mb-2 pointer-events-auto">
          <h1
            className="text-7xl md:text-9xl font-display font-extrabold tracking-wider hero-title"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #f0d060 30%, #d4af37 50%, #f0d060 70%, #d4af37 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.4))',
            }}
          >
            CABO
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-cabo-textDim text-base md:text-lg font-body max-w-lg text-center mb-10 px-4"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
          Master your memory. Sabotage your friends. Survive the ultimate game of low scores.
        </p>

        {/* Name Input */}
        <div className="mb-6 pointer-events-auto w-72">
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Enter your name..."
            className="input-field text-center text-lg font-display"
            maxLength={16}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-cabo-red/20 border border-cabo-red/40 text-cabo-red text-sm">
            {error}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 pointer-events-auto">
          <button
            onClick={onCreateRoom}
            className="hero-btn-primary group relative px-10 py-4 rounded-2xl font-display font-bold text-lg text-cabo-dark overflow-hidden transition-all duration-500"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-2xl">🎴</span> Create Room
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cabo-accent via-cabo-accentLight to-cabo-accent bg-[length:200%_100%] animate-shimmer" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: 'inset 0 0 30px rgba(240,208,96,0.4)' }} />
          </button>

          {!showJoinInput ? (
            <button
              onClick={() => setShowJoinInput(true)}
              className="hero-btn-secondary group relative px-10 py-4 rounded-2xl font-display font-bold text-lg text-cabo-text border-2 border-cabo-accent/30 overflow-hidden transition-all duration-500 hover:border-cabo-accent/70"
              style={{ background: 'rgba(22,22,42,0.7)', backdropFilter: 'blur(10px)' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-2xl">🚪</span> Join Room
              </span>
            </button>
          ) : (
            <div className="flex gap-2 items-stretch h-14">
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                className="input-field text-center tracking-widest text-lg font-display w-44 rounded-xl border-2 border-cabo-accent/30 focus:border-cabo-accent bg-cabo-dark/50"
                maxLength={6}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && onSubmitJoin()}
              />
              <button 
                onClick={onSubmitJoin} 
                className="hero-btn-primary px-8 rounded-xl font-display font-black text-lg shadow-lg shadow-cabo-accent/20 hover:shadow-cabo-accent/40 transition-all flex items-center justify-center uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f0d060)',
                  color: '#0a0a0f',
                  textShadow: 'rgba(255, 255, 255, 0.5) 0px 1px 1px'
                }}
              >
                Join
              </button>
              <button
                onClick={() => setShowJoinInput(false)}
                className="px-4 rounded-xl text-cabo-textDim hover:text-cabo-text bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={onShowRules}
            className="group relative px-10 py-4 rounded-2xl font-display font-bold text-lg text-cabo-text bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cabo-accent/50 transition-all duration-500 backdrop-blur-md"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-2xl">📖</span> Game Rules
            </span>
          </button>
        </div>

        {/* Player count badge */}
        <p className="mt-8 text-cabo-textDim/60 text-xs font-display tracking-widest uppercase">
          2 – 8 Players · 5 – 30 Min · Memory · Strategy
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none">
        <span className="text-cabo-textDim/40 text-xs font-display tracking-widest uppercase">Scroll to explore</span>
        <div className="w-5 h-8 rounded-full border border-cabo-accent/30 flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-cabo-accent/50 animate-bounce" />
        </div>
      </div>
    </section>
  );
};
