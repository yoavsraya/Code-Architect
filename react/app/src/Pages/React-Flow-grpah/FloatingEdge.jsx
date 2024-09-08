import React, { useState, useEffect } from 'react';
import { getBezierPath, useInternalNode } from '@xyflow/react';
import { getEdgeParams } from './utils.js';
import './FlowChartComponent.css';

function FloatingEdge({ id, source, target, markerEnd, style, label }) {
  const [menuVisible, setMenuVisible] = useState(false); // State to control menu visibility

  // Load label from local storage or use the initial label prop
  const [currentLabel, setCurrentLabel] = useState(() => {
    const savedLabel = localStorage.getItem(`edge-label-${id}`);
    return savedLabel || label;
  });

  // Ensure hooks are called before any return
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  // Save the current label to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(`edge-label-${id}`, currentLabel);
  }, [currentLabel, id]);

  // Check for null nodes after hooks
  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode,
  );

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  const handleLabelClick = () => {
    setMenuVisible((prev) => !prev); // Toggle menu visibility
  };

  const handleOptionClick = (option) => {
    setCurrentLabel(option); // Update the current label with the chosen option
    setMenuVisible(false); // Close the menu after selecting an option
    localStorage.setItem(`edge-label-${id}`, option); // Save the chosen label in local storage
  };

  // Determine which menu to display based on the current label
  const isMenu1 = currentLabel === 'Heritage' || currentLabel === 'Interface' || currentLabel === 'heritage';

  return (
    <>
      {/* Render the edge path */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
      />

      {/* Custom label as a button to open the menu */}
      {currentLabel && (
        <foreignObject
          x={(sx + tx) / 2 - 15} // Adjust x-position for the menu
          y={(sy + ty) / 2 - 10} // Adjust y-position for the menu
          width={100}
          height={100}
        >
          <div className="edge-label-container">
            <button onClick={handleLabelClick} className="edge-label-button">
              {currentLabel}
            </button>
            {menuVisible && (
              <div className="edge-label-menu">
                {isMenu1 ? (
                  // Menu 1
                  <>
                    <div onClick={() => handleOptionClick('Heritage')}>Heritage</div>
                    <div onClick={() => handleOptionClick('Interface')}>Interface</div>
                  </>
                ) : (
                  // Menu 2
                  <>
                    <div onClick={() => handleOptionClick('Composition')}>Composition</div>
                    <div onClick={() => handleOptionClick('Aggregation')}>Aggregation</div>
                    <div onClick={() => handleOptionClick('Association')}>Association</div>
                  </>
                )}
              </div>
            )}
          </div>
        </foreignObject>
      )}
    </>
  );
}

export default FloatingEdge;
