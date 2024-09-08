import React from 'react';
import { getBezierPath, EdgeText } from '@xyflow/react';

// Custom Edge Component with Manual Label
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
  // Generate the path for the edge
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

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
      {/* Manually add the label using EdgeText */}
      {label && (
        <EdgeText
          x={(sourceX + targetX) / 2} // Position label in the middle
          y={(sourceY + targetY) / 2} // Position label in the middle
          label={label}
          labelStyle={labelStyle} // Optional: apply custom styles
          className="react-flow__edge-text" // Add any additional class for styling
        />
      )}
    </>
  );
};

export default CustomFloatingEdge;
