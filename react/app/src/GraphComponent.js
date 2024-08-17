import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import './GraphComponent.css';

const SpinningGroup = React.memo(({ children }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0015;
    }
  });

  return <group ref={groupRef}>{children}</group>;
});

const GraphComponent = React.memo(() => {
  console.log("Graph Component started");
  const [graphData, setGraphData] = useState({ Vertices: [], Edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("useEffect running");

    // Reset graph data before fetching new data
    setGraphData({ Vertices: [], Edges: [] });
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const signal = controller.signal;

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
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.log("Error fetching data", err);
          setError(err);
        }
        setLoading(false);
      });

    return () => {
      // Cleanup the fetch request if the component unmounts
      controller.abort();
    };
  }, []);

  const groupRadius = 12; // Radius for each group of vertices
  const folderSpacing = 3; // Minimum distance between different folder index groups
  const zRange = 20; // Range for the random z value

  // Helper function to get a random position within a radius
  const getRandomPosition = (center, radius, zRange) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    const x = center[0] + distance * Math.cos(angle);
    const y = center[1] + distance * Math.sin(angle);
    const z = center[2] + (Math.random() - 0.5) * zRange;
    return [x, y, z];
  };

  const vertices = useMemo(() => {
    const folderGroups = {};
    graphData.Vertices.forEach(vertex => {
      if (!folderGroups[vertex.folderIndex]) {
        folderGroups[vertex.folderIndex] = [];
      }
      folderGroups[vertex.folderIndex].push(vertex);
    });

    let currentFolderPosition = [0, 0, 0];
    const vertexPositions = [];

    Object.keys(folderGroups).sort().forEach((folderIndex, groupIndex) => {
      const group = folderGroups[folderIndex];
      group.forEach((vertex, index) => {
        const position = getRandomPosition(currentFolderPosition, groupRadius, zRange);
        vertexPositions.push({
          id: vertex.Label,
          position: position,
          degree: vertex.degree,
        });
      });
      // Move to a new random position for the next folder index group
      currentFolderPosition = [
        currentFolderPosition[0] + (Math.random() - 0.5) * folderSpacing * 2,
        currentFolderPosition[1] + (Math.random() - 0.5) * folderSpacing * 2,
        currentFolderPosition[2] + (Math.random() - 0.5) * folderSpacing * 2,
      ];
    });

    return vertexPositions;
  }, [graphData.Vertices]);

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-message">Loading graph data...</div>
      </div>
    );
  }

  if (error) {
    return <div>Error loading data: {error.message}</div>;
  }

  if (vertices.length === 0 || edges.length === 0) {
    return <div>No graph data available.</div>;
  }

  return (
    <div className="graph-container">
      <Canvas className="canvas-container">
        <OrbitControls />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />

        <SpinningGroup>
          {vertices.map((vertex, index) => (
            <mesh key={vertex.id || index} position={vertex.position}>
              <sphereGeometry args={[0.7, 32, 32]} />
              <meshStandardMaterial color="#81E979" />
              <Html distanceFactor={10}>
                <div className="vertex-label">
                  {vertex.id} (Degree: {vertex.degree})
                </div>
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
                        color: 0xffffff,
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
      </Canvas>
    </div>
  );
});

export default GraphComponent;