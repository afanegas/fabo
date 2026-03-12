import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Center,
  Environment,
  Float,
  ContactShadows,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// --- 3D Components ---

const LuxuryCard: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  isHoverable?: boolean;
}> = ({ position, rotation = [0, 0, 0], isHoverable = false }) => {
  const meshRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const targetRotation = useRef(new THREE.Vector3(...rotation));

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smooth corner lift (peek) effect on hover
    if (isHoverable) {
      targetRotation.current.x = hovered ? rotation[0] + 0.25 : rotation[0];
      targetRotation.current.z = hovered ? rotation[2] + 0.15 : rotation[2];
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        hovered ? position[1] + 0.15 : position[1],
        delta * 6,
      );
    }

    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetRotation.current.x,
      delta * 6,
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotation.current.y,
      delta * 6,
    );
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      targetRotation.current.z,
      delta * 6,
    );
  });

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerOver={() => isHoverable && setHovered(true)}
      onPointerOut={() => isHoverable && setHovered(false)}
    >
      {/* Card Base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.7, 1, 0.015]} />
        <meshStandardMaterial
          color="#16162a" // cabo-surface
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Back Pattern (Subtle luxury texture) */}
      <mesh position={[0, 0, 0.008]}>
        <planeGeometry args={[0.62, 0.92]} />
        <meshStandardMaterial
          color="#0a0a0f" // cabo-dark
          roughness={0.8}
        />
      </mesh>

      {/* Gold Foil Accent (Cabo C) */}
      <mesh position={[0, 0, 0.0085]}>
        <ringGeometry args={[0.12, 0.15, 32]} />
        <meshStandardMaterial
          color="#d4af37" // cabo-accent
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
};

const DeckPile: React.FC<{ isShuffling: boolean }> = ({ isShuffling }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isShuffling) {
      groupRef.current.children.forEach((child, i) => {
        const offset = Math.sin(state.clock.elapsedTime * 15 + i * 0.5) * 0.08;
        const lift =
          Math.abs(Math.sin(state.clock.elapsedTime * 10 + i * 0.5)) * 0.05;
        child.position.x = THREE.MathUtils.lerp(
          child.position.x,
          offset,
          delta * 8,
        );
        child.position.y = THREE.MathUtils.lerp(
          child.position.y,
          lift,
          delta * 8,
        );
      });
    } else {
      groupRef.current.children.forEach((child) => {
        child.position.x = THREE.MathUtils.lerp(child.position.x, 0, delta * 5);
        child.position.y = THREE.MathUtils.lerp(child.position.y, 0, delta * 5);
      });
    }
  });

  return (
    <group
      ref={groupRef}
      position={[2.2, -0.05, -1]}
      rotation={[-Math.PI / 2, 0, 0.1]}
    >
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[0, 0, i * 0.016]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 1, 0.015]} />
          <meshStandardMaterial
            color="#16162a"
            roughness={0.7}
            metalness={0.1}
          />
          <mesh position={[0, 0, 0.008]}>
            <planeGeometry args={[0.62, 0.92]} />
            <meshStandardMaterial color="#0a0a0f" roughness={0.8} />
          </mesh>
        </mesh>
      ))}
    </group>
  );
};

const DiscardPile: React.FC = () => {
  return (
    <group position={[-2.2, -0.05, -0.8]} rotation={[-Math.PI / 2, 0, -0.15]}>
      {/* Card 1 */}
      <mesh position={[0.1, -0.1, 0]} castShadow>
        <boxGeometry args={[0.7, 1, 0.015]} />
        <meshStandardMaterial color="#16162a" roughness={0.7} />
      </mesh>
      {/* Card 2 (Face Up Example) */}
      <mesh
        position={[-0.05, 0.05, 0.016]}
        rotation={[0, 0, 0.2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.7, 1, 0.015]} />
        <meshStandardMaterial color="#16162a" roughness={0.7} />
        {/* Face white base */}
        <mesh position={[0, 0, 0.008]}>
          <planeGeometry args={[0.62, 0.92]} />
          <meshStandardMaterial color="#e8e8f0" roughness={0.6} />
        </mesh>
        {/* Simple Number 'Cabo' as face up */}
        <mesh position={[0, 0, 0.0085]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshStandardMaterial color="#6c3483" roughness={0.5} />{" "}
          {/* cabo-purple touch */}
        </mesh>
      </mesh>
    </group>
  );
};

// ─── Invisible Ground for Shadows ───
const ShadowCatcher: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.1, 0]}>
      <planeGeometry args={[100, 100]} />
      <shadowMaterial transparent opacity={0.4} />
    </mesh>
  );
};

// Glass title removed by user request -> shifting focus entirely to typography

// ─── Camera Parallax ───
const CameraRig: React.FC<{ isInputFocused: boolean }> = ({
  isInputFocused,
}) => {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isInputFocused) return;
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isInputFocused]);

  useFrame((state, delta) => {
    // Dynamic sizing for mobile
    const isMobile = window.innerWidth < 768;
    const baseZ = isMobile ? 8.0 : 4.5; // Pull camera further back on mobile
    const baseY = isMobile ? 4.5 : 2.5; // Raise camera angle significantly on mobile to push cards UP visually
    const targetYOffset = isMobile ? -1.5 : 0; // Look lower to shift objects higher on screen
    const parallaxDepthX = isMobile ? 0.2 : 0.5;
    const parallaxDepthY = isMobile ? 0.1 : 0.2;

    const targetX = isInputFocused ? 0 : mouse.current.x * parallaxDepthX;
    const targetY = isInputFocused
      ? baseY - 0.5
      : baseY + -mouse.current.y * parallaxDepthY;
    const targetZ = isInputFocused ? baseZ - 1 : baseZ;

    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      targetX,
      delta * 3,
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      targetY,
      delta * 3,
    );
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      targetZ,
      delta * 3,
    );

    camera.lookAt(0, targetYOffset, 0); // Focus slightly below center to bump cards UP
  });

  return null;
};

// ─── Main 3D Scene ───
const Scene3D: React.FC<{ isShuffling: boolean; isInputFocused: boolean }> = ({
  isShuffling,
  isInputFocused,
}) => {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      {/* Background disabled via alpha: true in Canvas, allowing CSS gradient to show through */}
      {/* Volumetric Studio Lighting */}
      <ambientLight intensity={1.5} color="#e8e8f0" />{" "}
      {/* Higher ambient for clarity */}
      {/* Key Light - Warm - Adjusted mapSize for performance */}
      <directionalLight
        position={[8, 12, 6]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
        color="#fef7e5"
      />
      {/* Fill Light - Cool */}
      <directionalLight
        position={[-8, 8, -6]}
        intensity={1.5}
        color="#dbeafe"
      />
      {/* Accent Point Light for the Glass Title */}
      <pointLight
        position={[0, 2, -1]}
        intensity={2}
        color="#d4af37"
        distance={8}
      />
      {/* Environment for pristine reflections */}
      <Environment preset="studio" blur={0.8} />
      <CameraRig isInputFocused={isInputFocused} />
      <ShadowCatcher /> {/* Transparent shadow receiver for the "table" */}
      {/* Foreground Player Cards (Hoverable for peek) */}
      <LuxuryCard
        position={[-1.2, 0, 1]}
        rotation={[-Math.PI / 2, 0, -0.05]}
        isHoverable
      />
      <LuxuryCard
        position={[-0.4, 0, 1.1]}
        rotation={[-Math.PI / 2, 0, -0.02]}
        isHoverable
      />
      <LuxuryCard
        position={[0.4, 0, 1.1]}
        rotation={[-Math.PI / 2, 0, 0.02]}
        isHoverable
      />
      <LuxuryCard
        position={[1.2, 0, 1]}
        rotation={[-Math.PI / 2, 0, 0.05]}
        isHoverable
      />
      <DeckPile isShuffling={isShuffling} />
      <DiscardPile />
      {/* Grounding shadow - Reduced resolution for performance */}
      <ContactShadows
        position={[0, -0.09, 0]}
        opacity={0.5}
        scale={15}
        blur={1}
        far={4}
        color="#000000"
        resolution={256}
      />
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
}> = ({
  onCreateRoom,
  onJoinRoom,
  playerName,
  setPlayerName,
  joinCode,
  setJoinCode,
  onSubmitJoin,
  error,
  onShowRules,
}) => {
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [isHoveringCreate, setIsHoveringCreate] = useState(false);

  return (
    <section
      id="hero"
      className="relative w-full h-screen overflow-hidden bg-cabo-darker"
    >
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cabo-surface via-cabo-dark to-cabo-darker">
        <Canvas
          shadows
          camera={{ position: [0, 2.5, 6], fov: 45 }}
          gl={{
            antialias: false,
            alpha: true,
            preserveDrawingBuffer: false,
            powerPreference: "high-performance",
          }}
          dpr={[1, 1.5]} /* Cap rendering resolution to 1.5x pixel ratio */
        >
          <Scene3D
            isShuffling={isHoveringCreate}
            isInputFocused={showJoinInput}
          />
        </Canvas>
      </div>

      {/* Global Error Toast (Top Right) */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex flex-col items-end gap-2 pointer-events-none">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="px-6 py-3 rounded-2xl bg-cabo-dark/90 backdrop-blur-xl border border-cabo-red/60 text-cabo-red text-sm md:text-base font-display font-medium shadow-[0_8px_32px_rgba(231,76,60,0.2)] max-w-[90vw] sm:max-w-sm pointer-events-auto flex items-center gap-3 drop-shadow-md"
            >
              <svg
                className="w-5 h-5 flex-shrink-0 text-cabo-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* HTML Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-0 pointer-events-none select-none z-20 absolute top-[10%] md:top-[8%] lg:top-[12%] px-4 w-full flex flex-col items-center">
          <h1
            className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-display font-extrabold tracking-[0.2em] text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #ffffff 0%, #d4af37 100%)",
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8))",
            }}
          >
            CABO
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mt-4 md:mt-6 opacity-70 rounded-full"></div>
          <p className="text-[#e8e8f0] text-sm md:text-base tracking-[0.2em] uppercase mt-6 md:mt-8 font-body font-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-lg mx-auto leading-relaxed">
            Memorize your cards.
            <br className="md:hidden" /> Get the lowest score to win.
          </p>
        </div>

        {/* Start Position Container for bottom elements */}
        <div className="flex flex-col items-center justify-end w-full h-full pb-32 sm:pb-8 lg:pb-8 gap-4 md:gap-6 pointer-events-none z-30">
          {/* How to play on mobile: sits ABOVE the input container */}
          <button
            onClick={onShowRules}
            className="pointer-events-auto flex items-center gap-2 px-6 py-2.5 mb-2 md:mt-24 md:-mb-1 rounded-full bg-cabo-accent/10 border border-cabo-accent/30 text-cabo-accent text-sm md:text-base font-display font-bold tracking-widest uppercase transition-all duration-300 hover:bg-cabo-accent/20 hover:border-cabo-accent/50 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:-translate-y-0.5"
          >
            <span>📖</span> How to Play
          </button>

          {/* Name Input */}
          <div className="pointer-events-auto w-full max-w-[20rem] px-4 sm:px-0">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full border-4 border-cabo-accent text-center text-base md:text-lg py-3 md:py-4 px-6 rounded-2xl bg-cabo-dark/40 backdrop-blur-md border-cabo-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] text-cabo-text placeholder-cabo-textDim focus:outline-none focus:ring-2 focus:ring-cabo-accent/50 focus:bg-cabo-dark/60 transition-all font-body font-light"
              maxLength={16}
            />
          </div>

          {/* CTA Buttons - Luxury Glassmorphism integrated with Cabo Theme */}
          <div className="flex flex-col items-center gap-3 md:gap-4 w-full pointer-events-auto max-w-[20rem] relative px-4 sm:px-0">
            <button
              onMouseEnter={() => setIsHoveringCreate(true)}
              onMouseLeave={() => setIsHoveringCreate(false)}
              onClick={onCreateRoom}
              className="group relative w-full py-4 px-8 rounded-2xl overflow-hidden transition-all duration-500 bg-gradient-to-br from-[#d4af37] to-[#b38d1d] shadow-[0_8px_32px_rgba(212,175,55,0.3)] hover:shadow-[0_12px_48px_rgba(212,175,55,0.5)] active:scale-[0.98] border border-[#f0d060]/50"
            >
              <span className="relative z-10 font-display font-extrabold text-[#060609] tracking-widest text-lg flex items-center justify-center gap-3">
                CREATE ROOM
              </span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            </button>

            <div
              className="w-full relative h-[64px]"
              onMouseLeave={() =>
                showJoinInput && !joinCode && setShowJoinInput(false)
              }
            >
              <AnimatePresence mode="wait">
                {!showJoinInput ? (
                  <motion.button
                    key="join-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={() => setShowJoinInput(true)}
                    onClick={() => setShowJoinInput(true)}
                    className="absolute inset-0 w-full py-4 px-8 rounded-2xl bg-cabo-surface/40 backdrop-blur-xl border border-cabo-border/60 text-cabo-text hover:bg-cabo-surface/60 hover:text-white hover:border-cabo-textDim shadow-[0_4px_16px_rgba(0,0,0,0.2)] active:scale-[0.98] font-display font-bold tracking-widest text-lg"
                  >
                    JOIN ROOM
                  </motion.button>
                ) : (
                  <motion.div
                    key="join-input"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute top-0 w-full flex flex-col gap-3 bg-cabo-surface/60 backdrop-blur-2xl rounded-2xl p-2 border border-cabo-border shadow-[0_16px_64px_rgba(0,0,0,0.4)]"
                  >
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) =>
                        setJoinCode(e.target.value.toUpperCase())
                      }
                      placeholder="ENTER CODE"
                      className="w-full text-center tracking-[0.4em] text-xl font-display font-bold py-3 px-4 rounded-xl bg-cabo-dark/60 border border-cabo-border focus:outline-none focus:bg-cabo-dark focus:border-cabo-accent transition-all text-white placeholder-cabo-textDim/50 uppercase"
                      maxLength={6}
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && onSubmitJoin()}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowJoinInput(false)}
                        className="flex-1 py-3 rounded-xl text-cabo-textDim hover:bg-cabo-surfaceLight hover:text-cabo-text transition-colors font-display font-semibold text-sm tracking-wider"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={onSubmitJoin}
                        className="flex-[2] py-3 rounded-xl bg-cabo-accent text-cabo-dark font-display font-bold tracking-widest text-sm shadow-md hover:bg-cabo-accentLight hover:shadow-lg transition-all active:scale-[0.98]"
                      >
                        ENTER
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
