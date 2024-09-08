import { getBezierPath, useInternalNode, EdgeText } from '@xyflow/react';
import { getEdgeParams } from './utils.js';
import './FlowChartComponent.css';

function FloatingEdge({ id, source, target, markerEnd, style, label }) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

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
      
      {/* Add the EdgeText component for the label */}
      {label && (
        <EdgeText
          x={(sx + tx) / 2} // Position the label in the middle of the edge
          y={(sy + ty) / 2} // Adjust the y-position as needed
          label={label}
          className="react-flow__edge-text" // Apply your custom CSS class
        />
      )}
    </>
  );
}

export default FloatingEdge;