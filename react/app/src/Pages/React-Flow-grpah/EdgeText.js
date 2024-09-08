import React, { useState } from 'react';
import { getBezierPath } from '@xyflow/react';

// Custom Edge Component with Manual Label as Option Menu
const CustomFloatingEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
}) => {
  const [menuOpen, setMenuOpen] = useState(false); // State to manage menu visibility

  // Generate the path for the edge
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Toggle menu visibility
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <>
      {/* Draw the edge path */}
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {/* Manually add the label as a clickable element */}
      <foreignObject
        x={(sourceX + targetX) / 2 - 50} // Adjust x position as needed
        y={(sourceY + targetY) / 2 - 15} // Adjust y position as needed
        width={100} // Width of the clickable area
        height={50} // Height of the clickable area
      >
        <div
          style={{ display: 'inline-block', cursor: 'pointer', ...labelStyle }}
          onClick={toggleMenu}
          className="edge-label"
        >
          {label}
          {/* Render the dropdown menu if menuOpen is true */}
          {menuOpen && (
            <div className="edge-menu" style={{ position: 'absolute', background: 'white', border: '1px solid #ddd', padding: '5px' }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                <li onClick={() => alert('Option 1 clicked')}>Option 1</li>
                <li onClick={() => alert('Option 2 clicked')}>Option 2</li>
                <li onClick={() => alert('Option 3 clicked')}>Option 3</li>
              </ul>
            </div>
          )}
        </div>
      </foreignObject>
    </>
  );
};

export default CustomFloatingEdge;
