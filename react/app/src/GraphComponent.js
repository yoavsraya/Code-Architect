// Import necessary hooks and components
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { BoxGeometry } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import './GraphComponent.css';

// Utility function to determine parent-child hierarchy and find roots
const buildHierarchy = (vertices, edges) => {
  const hierarchy = {};
  const incomingEdges = {}; // Track incoming edges to find roots

  vertices.forEach((vertex) => {
    hierarchy[vertex.id] = { children: [], added: false };
    incomingEdges[vertex.id] = 0; // Initialize incoming edge count
  });

  edges.forEach((edge) => {
    if (hierarchy[edge.From] && hierarchy[edge.To]) {
      hierarchy[edge.From].children.push(edge.To);
      incomingEdges[edge.To] += 1; // Increment incoming edge count for the child
    }
  });

  // Find root nodes (nodes with no incoming edges)
  const roots = Object.keys(incomingEdges).filter((id) => incomingEdges[id] === 0);
  return { hierarchy, roots };
};

// Recursive function to position nodes and mark them as added
const positionNodes = (nodeId, hierarchy, positions, level = 0, xOffset = 0, yOffset = 0) => {
  const node = hierarchy[nodeId];
  
  if (node.added) return; // Skip if node is already added

  // Mark the current node as added
  node.added = true;

  // Set the position of the current node
  positions[nodeId] = { x: xOffset, y: yOffset }; // Use xOffset and yOffset to control positioning

  // Recursively position children nodes from left to right
  node.children.forEach((childId, index) => {
    positionNodes(
      childId,
      hierarchy,
      positions,
      level + 1,
      xOffset + 5, // Move each child further to the right
      yOffset + (index * 3) - (node.children.length - 1) * 1.5 // Adjust vertical spacing
    );
  });
};

// Main loop to position nodes based on their added status
const runPositioning = (hierarchy, roots, positions) => {
  roots.forEach((rootId, index) => {
    // Position each root and its children
    positionNodes(rootId, hierarchy, positions, 0, index * 10, 0); // Start each root at a new vertical position
  });

  // Verify all nodes are positioned
  Object.keys(hierarchy).forEach((nodeId) => {
    if (!hierarchy[nodeId].added) {
      console.warn(`Vertex ${nodeId} was not positioned.`);
    }
  });
};

// Main component with graph rendering
const GraphComponent = React.memo(() => {
  const [graphData, setGraphData] = useState({ Vertices: [], Edges: [] });
  const [error, setError] = useState(null);
  const [selectedVertex, setSelectedVertex] = useState(null);
  const [isSpinning, setIsSpinning] = useState(true);

  // Fetch graph data on component mount
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchGraphData = () => {
      console.log("Fetching graph data...");
      fetch('http://54.243.195.75:3000/api/getGraphData', { signal })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          console.log("Data fetched", data);
          setGraphData(data);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.log("Error fetching data", err);
            setError(err);
          }
        });
    };

    fetchGraphData();
    return () => {
      controller.abort(); // Abort fetch request if component unmounts
    };
  }, []);

  // Calculate positions of nodes based on hierarchy
  const vertexPositions = useMemo(() => {
    const { hierarchy, roots } = buildHierarchy(graphData.Vertices, graphData.Edges);
    const positions = {};

    // Run the main positioning function for all roots
    runPositioning(hierarchy, roots, positions);

    return positions;
  }, [graphData.Vertices, graphData.Edges]);

  // Prepare vertices with assigned positions
  const vertices = useMemo(() => {
    return graphData.Vertices.map((vertex) => ({
      ...vertex,
      position: [
        vertexPositions[vertex.id]?.x || 0,
        vertexPositions[vertex.id]?.y || 0,
        0 // Keep z constant, or modify if needed
      ],
    }));
  }, [graphData.Vertices, vertexPositions]);

  // Prepare edges to connect positioned vertices
  const edges = useMemo(() => {
    return graphData.Edges.map((edge) => {
      const fromVertex = vertices.find((v) => v.id === edge.From);
      const toVertex = vertices.find((v) => v.id === edge.To);

      if (fromVertex && toVertex) {
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
      }
      return null;
    }).filter(Boolean);
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
              {/* Left Face */}
              <Html
                position={[-0.75, 0, 0]}
                distanceFactor={10}
                transform rotation={[0, Math.PI / 2, 0]}
                scale={[1, 1, -1]}
              >
                <div className="vertex-label mirrored">{vertex.id}</div>
              </Html>
              {/* Right Face */}
              <Html
                position={[0.75, 0, 0]}
                distanceFactor={10}
                transform rotation={[0, -Math.PI / 2, 0]}
                scale={[1, 1, -1]}
              >
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
                selectedVertex.position,
                [
                  selectedVertex.position[0],
                  selectedVertex.position[1] + 2,
                  selectedVertex.position[2] + 2,
                ],
              ]}
              color="white"
              lineWidth={2}
            />
            <Html
              position={[
                selectedVertex.position[0],
                selectedVertex.position[1] + 2,
                selectedVertex.position[2] + 2,
              ]}
              distanceFactor={8}
            >
              <div className="popup-note">
                <button className="close-button" onClick={handleCloseNote}>
                  ✕
                </button>
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
