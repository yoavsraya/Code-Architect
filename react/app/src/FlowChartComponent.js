import React, { useEffect, useState } from 'react';
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
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './FlowChartComponent.css';
import BiDirectionalEdge from './BiDirectionalEdge';

// Define colors for each FolderIndex
const folderColors = ['color-0', 'color-1', 'color-2', 'color-3'];

// Custom Node Component
const CustomNode = ({ data }) => {
  const [showMethods, setShowMethods] = useState(false);
  const colorClass = folderColors[data.folderIndex % folderColors.length]; // Assign color based on FolderIndex

  const handleClick = () => {
    setShowMethods((prev) => !prev);
  };

  data.triggerClick = handleClick;

  return (
    <div
      onClick={handleClick}
      className={`custom-node ${colorClass}`}
      style={{ display: 'inline-block', maxWidth: '200px' }}
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
  const [showModal, setShowModal] = useState(false);
  const [newEdge, setNewEdge] = useState(null);
  const [edgeLabel, setEdgeLabel] = useState('');
  const [history, setHistory] = useState([]); // History state to keep track of changes
  const reactFlowInstance = useReactFlow();

  // Function to save current state to history
  const saveToHistory = () => {
    setHistory((prevHistory) => [
      ...prevHistory,
      { nodes: [...nodes], edges: [...edges] },
    ]);
  };

  // Handle undo by restoring the last state from history
  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setHistory(history.slice(0, history.length - 1)); // Remove the last entry from history
    }
  };

  useEffect(() => {
    // Load nodes and edges from local storage if available
    const savedNodes = JSON.parse(localStorage.getItem('flowchart-nodes')) || [];
    const savedEdges = JSON.parse(localStorage.getItem('flowchart-edges')) || [];

    if (savedNodes.length > 0) {
      setNodes(savedNodes);
      setEdges(savedEdges);
    } else {
      // Fetch nodes and edges from the server if not available in local storage
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
          setError(err);
        });
    }
  }, []);

  useEffect(() => {
    // Save nodes and edges to local storage whenever they change
    localStorage.setItem('flowchart-nodes', JSON.stringify(nodes));
    localStorage.setItem('flowchart-edges', JSON.stringify(edges));
  }, [nodes, edges]);

  const transformGraphData = (vertices, edges) => {
    // Transformation logic...
    return { transformedNodes, transformedEdges };
  };

  const onConnect = (params) => {
    setNewEdge(params);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!edgeLabel) return;
    const newEdgeWithLabel = {
      ...newEdge,
      label: edgeLabel,
      type: 'bidirectional', // Ensure edge type is bidirectional
      animated: false,
      style: { stroke: '#000', strokeWidth: 1.7 },
      labelStyle: { fontSize: 12 },
    };

    saveToHistory(); // Save current state before adding a new edge

    setEdges((eds) => addEdge(newEdgeWithLabel, eds));
    setShowModal(false);
    setEdgeLabel('');
  };

  const handleSearch = (className) => {
    const node = nodes.find((node) => node.id === className);
    if (node) {
      const yOffset = 150;
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

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {error ? (
        <p>Error loading graph: {error.message}</p>
      ) : (
        <>
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
            onNodesChange={(changes) => {
              onNodesChange(changes);
              saveToHistory();
            }}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes} // Pass edgeTypes to ReactFlow
            fitView
            nodesDraggable={true}
            defaultViewport={{ x: 0, y: 0, zoom: 0.1 }}
          >
            <Background variant="none" />
            <Controls />
          </ReactFlow>

          <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" keyboard={false} className="dark-modal">
            <Modal.Header closeButton>
              <Modal.Title>Enter Edge Label</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formEdgeLabel">
                  <Form.Label>Label</Form.Label>
                  <Form.Control
                    type="text"
                    value={edgeLabel}
                    onChange={(e) => setEdgeLabel(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Enter label for the edge"
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
};


export default FlowChartComponentWrapper;
