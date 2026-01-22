import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, Sparkles, PointMaterial, Points } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { usePerformance, QUALITY_LEVELS } from '../../contexts/PerformanceContext';

// Floating 3D Heart Component
function FloatingHeart({ position, scale, speed, rotationSpeed, delay }) {
    const meshRef = useRef();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), delay * 1000);
        return () => clearTimeout(timer);
    }, [delay]);

    // Create heart shape
    const heartShape = useMemo(() => {
        const shape = new THREE.Shape();
        const x = 0, y = 0;
        shape.moveTo(x + 0.25, y + 0.25);
        shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
        shape.bezierCurveTo(x - 0.35, y, x - 0.35, y + 0.35, x - 0.35, y + 0.35);
        shape.bezierCurveTo(x - 0.35, y + 0.55, x - 0.25, y + 0.77, x + 0.25, y + 0.95);
        shape.bezierCurveTo(x + 0.75, y + 0.77, x + 0.85, y + 0.55, x + 0.85, y + 0.35);
        shape.bezierCurveTo(x + 0.85, y + 0.35, x + 0.85, y, x + 0.5, y);
        shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
        return shape;
    }, []);

    const geometry = useMemo(() => {
        return new THREE.ExtrudeGeometry(heartShape, {
            depth: 0.2,
            bevelEnabled: true,
            bevelSegments: 3,
            steps: 1,
            bevelSize: 0.05,
            bevelThickness: 0.05
        });
    }, [heartShape]);

    useFrame((state) => {
        if (meshRef.current && visible) {
            meshRef.current.rotation.y += rotationSpeed * 0.01;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.1;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + delay) * 0.3;
        }
    });

    if (!visible) return null;

    return (
        <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh
                ref={meshRef}
                position={position}
                scale={scale}
                rotation={[Math.PI, 0, 0]}
                geometry={geometry}
            >
                <meshStandardMaterial
                    color="#FFD700"
                    emissive="#FFD700"
                    emissiveIntensity={0.6}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>
        </Float>
    );
}

// Golden Sparkle Particles
function GoldenSparkles() {
    const particlesRef = useRef();
    const count = 200;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return pos;
    }, []);

    const speeds = useMemo(() => {
        return Array.from({ length: count }, () => Math.random() * 0.5 + 0.3);
    }, []);

    useFrame((state) => {
        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                positions[i * 3 + 1] += speeds[i] * 0.02;
                if (positions[i * 3 + 1] > 8) {
                    positions[i * 3 + 1] = -8;
                    positions[i * 3] = (Math.random() - 0.5) * 20;
                }
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <Points ref={particlesRef} positions={positions} stride={3}>
            <PointMaterial
                transparent
                color="#FFD700"
                size={0.08}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

// Floating Light Orbs
function LightOrb({ position, color, intensity }) {
    const meshRef = useRef();
    const lightRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
            const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 1;
            meshRef.current.scale.setScalar(pulse * 0.3);
        }
        if (lightRef.current) {
            lightRef.current.intensity = intensity + Math.sin(state.clock.elapsedTime * 2) * 0.5;
        }
    });

    return (
        <group position={position}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshBasicMaterial color={color} transparent opacity={0.6} />
            </mesh>
            <pointLight ref={lightRef} color={color} intensity={intensity} distance={8} />
        </group>
    );
}

// Mouse Parallax Camera
function ParallaxCamera() {
    const { camera } = useThree();
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useFrame(() => {
        camera.position.x += (mouse.current.x * 0.5 - camera.position.x) * 0.02;
        camera.position.y += (-mouse.current.y * 0.3 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
    });

    return null;
}

// Main 3D Scene Background - Performance Adaptive
function Scene({ settings }) {
    // Adapt heart count based on settings
    const hearts = useMemo(() => {
        const allHearts = [
            { position: [-4, 2, -3], scale: 0.8, speed: 1.2, rotationSpeed: 0.5, delay: 0.2 },
            { position: [3, -1, -4], scale: 0.6, speed: 0.8, rotationSpeed: 0.7, delay: 0.5 },
            { position: [-2, -2, -2], scale: 0.5, speed: 1.5, rotationSpeed: 0.4, delay: 0.8 },
            { position: [4, 1, -5], scale: 0.7, speed: 1.0, rotationSpeed: 0.6, delay: 1.0 },
            { position: [0, 3, -4], scale: 0.9, speed: 0.9, rotationSpeed: 0.5, delay: 0.3 },
            { position: [-3, 0, -3], scale: 0.4, speed: 1.3, rotationSpeed: 0.8, delay: 1.2 },
            { position: [2, -2, -3], scale: 0.55, speed: 1.1, rotationSpeed: 0.6, delay: 0.7 },
        ];
        return allHearts.slice(0, settings?.heartCount || 7);
    }, [settings?.heartCount]);

    const starCount = settings?.starCount || 1500;
    const enableSparkles = settings?.enableSparkles !== false;
    const enableBloom = settings?.enableBloom !== false;

    return (
        <>
            {/* Ambient lighting */}
            <ambientLight intensity={0.3} color="#FFF5E1" />

            {/* Main directional light */}
            <directionalLight position={[5, 5, 5]} intensity={0.5} color="#FFD700" />

            {/* Fog for depth */}
            <fog attach="fog" args={['#FFF8E1', 5, 25]} />

            {/* Mouse parallax */}
            <ParallaxCamera />

            {/* Star field background */}
            <Stars
                radius={50}
                depth={50}
                count={starCount}
                factor={3}
                saturation={0.5}
                fade
                speed={0.5}
            />

            {/* Built-in sparkles - only on medium/high */}
            {enableSparkles && (
                <Sparkles
                    count={settings?.particleCount || 100}
                    scale={15}
                    size={3}
                    speed={0.3}
                    color="#FFD700"
                />
            )}

            {/* Custom golden particles - only on medium/high */}
            {enableSparkles && <GoldenSparkles />}

            {/* Floating hearts */}
            {hearts.map((heart, i) => (
                <FloatingHeart key={i} {...heart} />
            ))}

            {/* Light orbs */}
            <LightOrb position={[-5, 2, -6]} color="#FFD700" intensity={2} />
            <LightOrb position={[5, -1, -5]} color="#FFA500" intensity={1.5} />
            <LightOrb position={[0, 3, -7]} color="#FFE4B5" intensity={1.8} />

            {/* Post-processing effects - only on high quality */}
            {enableBloom && (
                <EffectComposer>
                    <Bloom
                        luminanceThreshold={0.2}
                        luminanceSmoothing={0.9}
                        intensity={0.8}
                    />
                    <Vignette eskil={false} offset={0.1} darkness={0.3} />
                </EffectComposer>
            )}
        </>
    );
}

// Exported Canvas Component - Performance Aware
export default function Scene3DBackground({ className }) {
    const { settings, quality } = usePerformance();

    // Don't render 3D at all on low quality devices
    if (quality === QUALITY_LEVELS.LOW || settings?.enable3D === false) {
        return null;
    }

    const pixelRatio = settings?.pixelRatio || [1, 2];

    return (
        <div
            className={className}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none'
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 8], fov: 60 }}
                dpr={typeof pixelRatio === 'number' ? [1, pixelRatio] : pixelRatio}
                gl={{
                    antialias: quality === QUALITY_LEVELS.HIGH,
                    alpha: true,
                    powerPreference: quality === QUALITY_LEVELS.HIGH ? 'high-performance' : 'default'
                }}
            >
                <Scene settings={settings} />
            </Canvas>
        </div>
    );
}
