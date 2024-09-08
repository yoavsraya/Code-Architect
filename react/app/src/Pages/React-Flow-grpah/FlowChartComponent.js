import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import FloatingEdge from './FloatingEdge';
import FloatingConnectionLine from './FloatingConnectionLine';
import { createNodesAndEdges } from './utils';
import Dropdown from 'react-bootstrap/Dropdown';
import CustomNode from './CustomNode';
import './FlowChartComponent.css';

const edgeTypes = {floating: FloatingEdge};
const nodeTypes = { custom: CustomNode };

const LOCAL_STORAGE_KEY_NODES = 'flowchart-nodes';
const LOCAL_STORAGE_KEY_EDGES = 'flowchart-edges';

const fetchGraphData = async () => {
  console.log("calling graphdata api")
  const response = await fetch('http://184.73.72.205:3000/api/getGraphData');
  const data = await response.json();
  return data;
};

const FlowChartComponentWrapper = () => {
  return (
    <ReactFlowProvider>
      <FlowChartComponent />
    </ReactFlowProvider>
  );
};

const FlowChartComponent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [error, setError] = useState(null);
  const reactFlowInstance = useReactFlow();

  // Fetch data and initialize nodes and edges on component mount
  useEffect(() => {
    // Load nodes and edges from localStorage if available
    const savedNodes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_NODES)) || [];
    const savedEdges = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_EDGES)) || [];

    if (savedNodes.length > 0) {
      setNodes(savedNodes);
      setEdges(savedEdges);
    } else {
      fetchGraphData()
        .then((data) => {
          const { transformedNodes, transformedEdges } = createNodesAndEdges(data.Vertices, data.Edges);
          console.log(transformedNodes);
          console.log(transformedEdges);
          setNodes(transformedNodes);
          setEdges(transformedEdges);
        })
        .catch((err) => {
          setError(err);
          console.error('Error fetching graph data:', err);
        });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_NODES, JSON.stringify(nodes));
    localStorage.setItem(LOCAL_STORAGE_KEY_EDGES, JSON.stringify(edges));
  }, [nodes, edges]);
    
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'floating',
            markerEnd: { type: MarkerType.Arrow },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const handleSearch = (className) => {
    const node = nodes.find((node) => node.id === className);
    if (node) {
      const yOffset = 130;
      reactFlowInstance.setCenter(node.position.x, node.position.y + yOffset, {
        zoom: 1.5,
        duration: 800,
      });
      setTimeout(() => {
        if (node.data.triggerClick) {
          node.data.triggerClick();
        }
      }, 850);
    }
  };

  return (
    <div className="floatingedges">
       <Dropdown data-bs-theme="dark" className="mt-2" variant="secondary">
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              Select a Class
            </Dropdown.Toggle>

            <Dropdown.Menu menuVariant="dark">
              {nodes.map((node) => (
                <Dropdown.Item key={node.id} onClick={() => handleSearch(node.id)}>
                  {node.id}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        connectionLineComponent={FloatingConnectionLine}
        style={{ width: '100%', height: '100%' }} 
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

export default FlowChartComponentWrapper;
