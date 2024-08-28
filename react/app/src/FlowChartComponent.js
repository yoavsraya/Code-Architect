import React, { useEffect, useState, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Handle,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from 'react-flow-renderer';
import Dropdown from 'react-bootstrap/Dropdown'; // Import the Bootstrap Dropdown component
import './FlowChartComponent.css'; // Import your CSS styles

// Define colors for each FolderIndex
const folderColors = ['color-0', 'color-1', 'color-2', 'color-3'];

// Custom Node Component
const CustomNode = ({ data }) => {
  const [showMethods, setShowMethods] = useState(false);
  const colorClass = folderColors[data.folderIndex % folderColors.length]; // Assign color based on FolderIndex

  // Handle click to toggle method visibility
  const handleClick = () => {
    setShowMethods((prev) => !prev);
  };

  return (
    <div
      onClick={handleClick}
      className={`custom-node ${colorClass}`}
      style={{ display: 'inline-block', maxWidth: '200px' }} // Ensuring block size adjusts to text
    >
      <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {data.label}
      </strong>
      {showMethods && (
        <ul className="method-list">
          {data.methods.map((method, index) => (
            <li key={index} className="method-item">
              {method}
            </li>
          ))}
        </ul>
      )}
      <Handle type="source" position="right" />
      <Handle type="target" position="left" />
    </div>
  );
};

// Define nodeTypes outside of the component to avoid recreation on each render
const nodeTypes = { custom: CustomNode };

// Main Flow Chart Component wrapped with ReactFlowProvider
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
  const [searchTerm, setSearchTerm] = useState('');
  const reactFlowInstance = useReactFlow(); // Use hook to control viewport

  useEffect(() => {
    fetch('http://54.243.195.75:3000/api/getGraphData')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        const { transformedNodes, transformedEdges } = transformGraphData(data.Vertices, data.Edges);
        setNodes(transformedNodes);
        setEdges(transformedEdges);
      })
      .catch((err) => {
        console.log('Error fetching data', err);
        setError(err);
      });
  }, []);

  // Function to transform vertices and edges into React Flow format
  const transformGraphData = (vertices, edges) => {
    const xSpacing = 350;
    const ySpacing = 150;
    const maxNodesPerColumn = 4;

    const groupedNodes = {};
    vertices.forEach((vertex) => {
      const { FolderIndex } = vertex;
      if (!groupedNodes[FolderIndex]) groupedNodes[FolderIndex] = [];
      groupedNodes[FolderIndex].push(vertex);
    });

    const transformedNodes = [];
    Object.keys(groupedNodes).forEach((folderIndex) => {
      groupedNodes[folderIndex].forEach((vertex, index) => {
        const column = Math.floor(index / maxNodesPerColumn);
        const row = index % maxNodesPerColumn;

        transformedNodes.push({
          id: vertex.Label,
          type: 'custom',
          data: {
            label: vertex.Label,
            methods: vertex.methods,
            folderIndex: vertex.FolderIndex,
            triggerClick: null, // Placeholder for triggering clicks externally
          },
          position: {
            x: folderIndex * xSpacing + column * xSpacing,
            y: row * ySpacing,
          },
          draggable: true,
        });
      });
    });

    const transformedEdges = edges.map((edge) => ({
      id: `${edge.From}-${edge.To}`,
      source: edge.From,
      target: edge.To,
      label: edge.Label,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#000' },
      labelStyle: { fontSize: 12 },
    }));

    return { transformedNodes, transformedEdges };
  };

  const onConnect = (params) => setEdges((eds) => addEdge(params, eds));

  // Handle class search and zoom to selected node
  const handleSearch = (className) => {
    setSearchTerm(className);

    // Find the node by label (id) and zoom to it
    const node = nodes.find((node) => node.id === className);
    if (node) {
      reactFlowInstance.setCenter(node.position.x, node.position.y - 100, {
        zoom: 1.5,
        duration: 800,
      });

      // Simulate a click on the node after zooming
      setTimeout(() => {
        if (node.data.triggerClick) {
          node.data.triggerClick(); // Trigger the click function to open the method list
        }
      }, 800); // Delay to allow zoom animation to complete
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {error ? (
        <p>Error loading graph: {error.message}</p>
      ) : (
        <>
          <div className="dropdown-container">
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic" className="custom-dropdown-toggle">
                Select a Class
              </Dropdown.Toggle>

              <Dropdown.Menu className="custom-dropdown-menu">
                {nodes.map((node) => (
                  <Dropdown.Item
                    key={node.id}
                    onClick={() => handleSearch(node.id)}
                    className="custom-dropdown-item"
                  >
                    {node.id}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={true}
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
          >
            <Background variant="none" />
            <Controls />
          </ReactFlow>
        </>
      )}
    </div>
  );
};

export default FlowChartComponentWrapper;
