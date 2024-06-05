// src/GraphComponent.js

import React, { useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { graphData } from './GraphData';

const GraphComponent = () => {
  const vertices = useMemo(() => {
    const verts = graphData.vertices.map((vertex) => ({
      id: vertex.id,
      position: [Math.random() * 5 - 2.5, Math.random() * 5 - 2.5, Math.random() * 5 - 2.5],
    }));
    console.log('Vertices:', verts); // Log vertices
    return verts;
  }, []);

  const edges = useMemo(() => {
    const edgesList = graphData.edges.map((edge) => {
      const fromVertex = vertices.find((v) => v.id === edge.from);
      const toVertex = vertices.find((v) => v.id === edge.to);
      if (fromVertex && toVertex) {
        return {
          from: fromVertex.position,
          to: toVertex.position,
        };
      }
      return null;
    }).filter(edge => edge !== null); // Filter out any null edges
    console.log('Edges:', edgesList); // Log edges
    return edgesList;
  }, [vertices]);

  useEffect(() => {
    console.log('Graph Component Rendered');
  }, []);

  return (
    <Canvas style={{ background: 'transparent' }}>
      <OrbitControls />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      {vertices.map((vertex) => (
        <mesh key={vertex.id} position={vertex.position}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial color="orange" />
          <Html distanceFactor={10}>
            <div style={{
              color: 'white',
              fontSize: '14px',
              textAlign: 'center',
              transform: 'translate(-50%, -50%)'
            }}>
              {vertex.id}
            </div>
          </Html>
        </mesh>
      ))}

      {edges.map((edge, index) => {
        const positions = new Float32Array([...edge.from, ...edge.to]);
        console.log('Edge positions:', positions); // Log edge positions to debug
        return (
          <line key={index}>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attachObject={['attributes', 'position']}
                array={positions}
                count={positions.length / 3}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="orange" />
          </line>
        );
      })}
    </Canvas>
  );
};

export default GraphComponent;
