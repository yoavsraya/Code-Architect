import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { BoxGeometry } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import './GraphComponent.css';

const SpinningGroup = React.memo(({ children, isSpinning }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current && isSpinning) {
      groupRef.current.rotation.y += 0.0015;
    }
  });

  return <group ref={groupRef}>{children}</group>;
});

const GraphComponent = React.memo(() => {
  const [graphData, setGraphData] = useState({ Vertices: [], Edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVertex, setSelectedVertex] = useState(null);
  const [isSpinning, setIsSpinning] = useState(true);


  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchGraphData = () => {
      console.log("Fetching graph data...");
      fetch('http://54.243.195.75:3000/api/getGraphData', { signal })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log("Data fetched", data);
          setGraphData(data);
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.log("Error fetching data", err);
            setError(err);
          }
        });
    };


    return () => {
      controller.abort(); // Abort fetch request if component unmounts
    };
  }, []);

  const xSpread = 20; // Adjust as needed for x-axis spread
  const ySpread = 20; // Adjust as needed for y-axis spread
  const zSpread = 10; // Adjust as needed for z-axis spread

  const vertices = useMemo(() => {
    return graphData.Vertices.map(vertex => {
      const position = [
        (Math.random() - 0.5) * xSpread,
        (Math.random() - 0.5) * ySpread,
        (Math.random() - 0.5) * zSpread,
      ];
      return {
        id: vertex.Label,
        position: position,
        degree: vertex.degree,
      };
    });
  }, [graphData.Vertices, xSpread, ySpread, zSpread]);

  const edges = useMemo(() => {
    return graphData.Edges.map((edge) => {
      const fromVertex = vertices.find((v) => v.id === edge.From);
      const toVertex = vertices.find((v) => v.id === edge.To);
      const midpoint = [
        (fromVertex.position[0] + toVertex.position[0]) / 2,
        (fromVertex.position[1] + toVertex.position[1]) / 2,
        (fromVertex.position[2] + toVertex.position[2]) / 2,
      ];
      return {
        from: fromVertex.position,
        to: toVertex.position,
        midpoint,
        label: edge.Label,
      };
    });
  }, [vertices]);

  const handleCubeClick = (vertex) => {
    setSelectedVertex(vertex);
    setIsSpinning(false);
  };

  const handleCloseNote = () => {
    setSelectedVertex(null);
    setIsSpinning(true);
  };

  return (
    <div className="graph-container">
      <Canvas className="canvas-container">
        <OrbitControls />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />

        <SpinningGroup isSpinning={isSpinning}>
          {vertices.map((vertex, index) => (
            <mesh
              key={vertex.id || index}
              position={vertex.position}
              onClick={() => handleCubeClick(vertex)}
            >
              <boxGeometry args={[1.5, 1.5, 1.5]} />
              <meshStandardMaterial color="#81E979" opacity={1} transparent={false} />

              <lineSegments>
                <edgesGeometry attach="geometry" args={[new BoxGeometry(1.5, 1.5, 1.5)]} />
                <lineBasicMaterial attach="material" color="black" linewidth={1} />
              </lineSegments>

              {/* Left Face */}
              <Html
                position={[-0.75, 0, 0]}
                distanceFactor={10}
                transform rotation={[0, Math.PI / 2, 0]}
                scale={[1, 1, -1]}>
                <div className="vertex-label mirrored">{vertex.id}</div>
              </Html>

              {/* Right Face */}
              <Html position={[0.75, 0, 0]} distanceFactor={10} transform rotation={[0, -Math.PI / 2, 0]} scale={[1, 1, -1]}>
                <div className="vertex-label mirrored">{vertex.id}</div>
              </Html>
            </mesh>
          ))}

          {edges.map((edge, index) => {
            const points = new Float32Array([...edge.from, ...edge.to]);
            const lineGeometry = new LineGeometry();
            lineGeometry.setPositions(points);

            return (
              <React.Fragment key={index}>
                <primitive
                  object={
                    new Line2(
                      lineGeometry,
                      new LineMaterial({
                        color: 0x000000,
                        linewidth: 2.4, // Adjust the linewidth as needed
                        resolution: [window.innerWidth, window.innerHeight], // Add resolution for proper scaling
                      })
                    )
                  }
                />
                <Html position={edge.midpoint} distanceFactor={10}>
                  <div className="edge-label">
                    {edge.label}
                  </div>
                </Html>
              </React.Fragment>
            );
          })}
        </SpinningGroup>

        {selectedVertex && (
          <>
            <Line
              points={[
                selectedVertex.position, // Start of the line (cube position)
                [selectedVertex.position[0], selectedVertex.position[1] + 2, selectedVertex.position[2] + 2], // End of the line (note position)
              ]}
              color="white"
              lineWidth={2}
            />
            <Html position={[selectedVertex.position[0], selectedVertex.position[1] + 2, selectedVertex.position[2] + 2]} distanceFactor={8}>
              <div className="popup-note">
                <button className="close-button" onClick={handleCloseNote}>✕</button>
                <strong>{selectedVertex.id}</strong>
                <p>Additional information about this vertex.</p>
              </div>
            </Html>
          </>
        )}
      </Canvas>
    </div>
  );
});

export default GraphComponent;
