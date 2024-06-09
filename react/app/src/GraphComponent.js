// src/GraphComponent.js

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { graphData } from './GraphData';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';

const SpinningGroup = ({ children }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0015; // Adjust the rotation speed as needed
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

const GraphComponent = () => {
  const radius = 5; // Radius of the sphere
  const center = [0, 0, 0]; // Center point of the sphere

  const vertices = useMemo(() => {
    return graphData.vertices.map((vertex, index) => {
      const phi = Math.acos(-1 + (2 * index) / graphData.vertices.length);
      const theta = Math.sqrt(graphData.vertices.length * Math.PI) * phi;
      const x = center[0] + radius * Math.cos(theta) * Math.sin(phi);
      const y = center[1] + radius * Math.sin(theta) * Math.sin(phi);
      const z = center[2] + radius * Math.cos(phi);

      return {
        id: vertex.id,
        position: [x, y, z],
      };
    });
  }, []);

  const edges = useMemo(() => {
    return graphData.edges.map((edge) => {
      const fromVertex = vertices.find((v) => v.id === edge.from);
      const toVertex = vertices.find((v) => v.id === edge.to);
      return {
        from: fromVertex.position,
        to: toVertex.position,
      };
    });
  }, [vertices]);

  return (
    <Canvas style={{ background: 'transparent' }}>
      <OrbitControls />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      <SpinningGroup>
        {vertices.map((vertex) => (
          <mesh key={vertex.id} position={vertex.position}>
            <sphereGeometry args={[0.7, 32, 32]} />
            <meshStandardMaterial color="#81E979" />
            <Html distanceFactor={10}>
              <div
                style={{
                  color: 'white',
                  fontSize: '14px',
                  textAlign: 'center',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {vertex.id}
              </div>
            </Html>
          </mesh>
        ))}

        {edges.map((edge, index) => {
          const points = new Float32Array([...edge.from, ...edge.to]);
          const lineGeometry = new LineGeometry();
          lineGeometry.setPositions(points);

          return (
            <primitive
              key={index}
              object={
                new Line2(
                  lineGeometry,
                  new LineMaterial({
                    color: 0xffffff,
                    linewidth: 2.0, // Adjust the linewidth as needed
                    resolution: [window.innerWidth, window.innerHeight], // Add resolution for proper scaling
                  })
                )
              }
            />
          );
        })}
      </SpinningGroup>
    </Canvas>
  );
};

export default GraphComponent;
