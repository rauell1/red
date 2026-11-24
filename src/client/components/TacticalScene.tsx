import { Float, Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const pointerTarget = new THREE.Vector2();

function Ring({ radius, tube, color, opacity = 1, ticks = 0 }: { radius: number; tube: number; color: string; opacity?: number; ticks?: number }) {
  const tickRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const instances = tickRef.current;
    if (!instances || ticks === 0) return;
    const dummy = new THREE.Object3D();
    for (let index = 0; index < ticks; index += 1) {
      const angle = (index / ticks) * Math.PI * 2;
      const longTick = index % 4 === 0;
      const tickRadius = radius + (longTick ? 0.02 : 0);
      dummy.position.set(Math.cos(angle) * tickRadius, Math.sin(angle) * tickRadius, 0);
      dummy.rotation.set(0, 0, angle);
      dummy.scale.set(longTick ? 1 : 0.54, 1, 1);
      dummy.updateMatrix();
      instances.setMatrixAt(index, dummy.matrix);
      instances.setColorAt(index, new THREE.Color(longTick ? '#f59e0b' : color));
    }
    instances.instanceMatrix.needsUpdate = true;
    if (instances.instanceColor) instances.instanceColor.needsUpdate = true;
  }, [color, radius, ticks]);

  return (
    <group>
      <mesh>
        <torusGeometry args={[radius, tube, 10, 128]} />
        <meshStandardMaterial color={color} metalness={0.82} roughness={0.28} emissive={color} emissiveIntensity={0.28} transparent opacity={opacity} />
      </mesh>
      {ticks > 0 && <instancedMesh ref={tickRef} args={[undefined, undefined, ticks]}>
        <boxGeometry args={[0.23, 0.026, 0.025]} />
        <meshBasicMaterial color={color} transparent opacity={0.72} />
      </instancedMesh>}
    </group>
  );
}

function Core() {
  const core = useRef<THREE.Group>(null);
  useFrame((_state, delta) => {
    if (!core.current) return;
    core.current.rotation.y += delta * 0.15;
    core.current.rotation.z = THREE.MathUtils.damp(core.current.rotation.z, pointerTarget.x * 0.1, 2.4, delta);
  });
  return (
    <group ref={core}>
      <mesh rotation={[0.2, 0.3, 0.1]}>
        <icosahedronGeometry args={[1.08, 1]} />
        <meshStandardMaterial color="#9b2430" metalness={0.88} roughness={0.24} emissive="#8b1a28" emissiveIntensity={0.62} flatShading />
      </mesh>
      <mesh rotation={[0.2, 0.3, 0.1]} scale={1.025}>
        <icosahedronGeometry args={[1.08, 1]} />
        <meshBasicMaterial color="#f59e0b" wireframe transparent opacity={0.44} />
      </mesh>
      <mesh position={[0, 0, 0.15]}>
        <octahedronGeometry args={[0.53, 0]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.2} emissive="#ef4444" emissiveIntensity={1.8} />
      </mesh>
      <pointLight color="#ef4444" intensity={2.1} distance={5} />
    </group>
  );
}

function PerspectiveGrid() {
  return (
    <group position={[0, -2.85, -1.1]}>
      <gridHelper args={[28, 28, '#ef4444', '#334155']} />
    </group>
  );
}

export default function TacticalScene() {
  const assembly = useRef<THREE.Group>(null);
  const outerRing = useRef<THREE.Group>(null);
  const innerRing = useRef<THREE.Group>(null);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointerTarget.set((event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1, 1 - (event.clientY / Math.max(window.innerHeight, 1)) * 2);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  useFrame((_state, delta) => {
    if (assembly.current) {
      assembly.current.rotation.y = THREE.MathUtils.damp(assembly.current.rotation.y, pointerTarget.x * 0.18, 2.4, delta);
      assembly.current.rotation.x = THREE.MathUtils.damp(assembly.current.rotation.x, -pointerTarget.y * 0.14, 2.4, delta);
      const scroll = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 0.45);
      assembly.current.position.y = THREE.MathUtils.damp(assembly.current.position.y, -scroll * 0.28, 1.8, delta);
    }
    if (outerRing.current) outerRing.current.rotation.z -= delta * 0.035;
    if (innerRing.current) innerRing.current.rotation.z += delta * 0.052;
  });

  return (
    <>
      <color attach="background" args={['#09090b']} />
      <fog attach="fog" args={['#09090b', 7, 18]} />
      <ambientLight intensity={0.62} color="#94a3b8" />
      <directionalLight position={[-4, 5, 4]} intensity={2.1} color="#dbeafe" />
      <pointLight position={[4, 2, -2]} intensity={3.3} color="#ef4444" distance={13} />
      <pointLight position={[-3, -1, 3]} intensity={1.8} color="#f59e0b" distance={10} />
      <PerspectiveGrid />
      <group ref={assembly} position={[1.52, 0.1, 0]}>
        <Float speed={1.05} rotationIntensity={0.12} floatIntensity={0.22} floatingRange={[-0.12, 0.12]}>
          <group>
            <group ref={outerRing} rotation={[0, 0, 0.12]}><Ring radius={2.12} tube={0.048} color="#ef4444" opacity={0.78} ticks={48} /></group>
            <group ref={innerRing} rotation={[0, 0, -0.2]}><Ring radius={1.72} tube={0.022} color="#f8fafc" opacity={0.52} ticks={32} /></group>
            <Ring radius={1.39} tube={0.055} color="#f59e0b" opacity={0.76} ticks={16} />
            <Ring radius={1.11} tube={0.018} color="#ef4444" opacity={0.55} />
            <Core />
            <mesh position={[0, 0, -0.42]}>
              <cylinderGeometry args={[0.68, 0.88, 2.35, 8, 1, true]} />
              <meshStandardMaterial color="#191a20" metalness={0.88} roughness={0.34} side={THREE.DoubleSide} transparent opacity={0.65} />
            </mesh>
            <Sparkles count={46} scale={[6.4, 5.2, 2.4]} size={2.1} speed={0.17} color="#ef4444" opacity={0.7} />
          </group>
        </Float>
      </group>
    </>
  );
}
