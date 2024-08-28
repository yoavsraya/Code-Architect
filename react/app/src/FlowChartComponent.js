import React, { useEffect, useState } from 'react';
import ReactFlow, { addEdge, Background, Controls } from 'react-flow-renderer';

// Example fetch function for graph data
const fetchGraphData = () => {
  console.log("Fetching graph data...");
  // Replace with your actual fetch logic
  return fetch('http://54.243.195.75:3000/api/getGraphData')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    });
};

// Function to transform vertices and edges to React Flow format
const transformGraphData = (vertices, edges) => {
  // Map vertices to React Flow nodes
  const nodes = vertices.map((vertex, index) => ({
    id: vertex.Label,
    data: { label: `${vertex.Label}\n${vertex.methods.join('\n')}` },
    position: { x: vertex.FolderIndex * 300, y: index * 100 }, // Position nodes based on FolderIndex
  }));

  // Map edges to React Flow edges
  const reactFlowEdges = edges.map((edge) => ({
    id: `${edge.From}-${edge.To}`,
    source: edge.From,
    target: edge.To,
    label: edge.Label,
    type: 'smoothstep', // Optional: can use 'straight', 'step', etc.
  }));

  return { nodes, reactFlowEdges };
};

const FlowChartComponent = () => {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data and set state
    fetchGraphData()
      .then((data) => {
        const { nodes, reactFlowEdges } = transformGraphData(data.Vertices, data.Edges);
        setGraphData({ nodes, edges: reactFlowEdges });
      })
      .catch((err) => {
        console.log("Error fetching data", err);
        setError(err);
      });
  }, []);

  const onConnect = (params) => setGraphData((gData) => ({
    ...gData,
    edges: addEdge(params, gData.edges),
  }));

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {error ? (
        <p>Error loading graph: {error.message}</p>
      ) : (
        <ReactFlow
          nodes={graphData.nodes}
          edges={graphData.edges}
          onConnect={onConnect}
          fitView
          nodesDraggable={false} // Optional: Disable node dragging
        >
          <Background variant="lines" />
          <Controls />
        </ReactFlow>
      )}
    </div>
  );
};

export default FlowChartComponent;
