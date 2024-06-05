import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { graphData } from './GraphData';

const GraphComponent = () => {
  const graphRef = useRef();

  const vertices = useMemo(() => {
    return graphData.vertices.map((vertex, index) => ({
      id: vertex.id,
      position: [Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5],
    }));
  }, []);

  const edges = useMemo(() => {
    return graphData.edges.map((edge) => ({
      from: vertices.find((v) => v.id === edge.from),
      to: vertices.find((v) => v.id === edge.to),
    }));
  }, [vertices]);

  return (
    <Canvas>
      <OrbitControls />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      {vertices.map((vertex) => (
        <mesh key={vertex.id} position={vertex.position}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      ))}

      {edges.map((edge, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attachObject={['attributes', 'position']}
              array={new Float32Array([...edge.from.position, ...edge.to.position])}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="black" />
        </line>
      ))}
    </Canvas>
  );
};

export default GraphComponent;
