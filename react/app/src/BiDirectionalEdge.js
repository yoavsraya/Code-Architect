import React from 'react';
import { getBezierPath, getEdgeCenter, EdgeText } from 'react-flow-renderer';

const BiDirectionalEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  label,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const markerEnd = {
    orient: 'auto',
    viewBox: '0 0 12 12',
    refX: '5',
    refY: '5',
    markerUnits: 'strokeWidth',
    markerWidth: '8',
    markerHeight: '8',
  };

  return (
    <>
      <defs>
        <marker
          id={`arrow-${id}`}
          markerWidth="10"
          markerHeight="10"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          orient="auto"
        >
          <path d="M0,0 L0,10 L10,5 z" fill="#222" />
        </marker>
        <marker
          id={`arrow-${id}-reverse`}
          markerWidth="10"
          markerHeight="10"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L0,10 L10,5 z" fill="#222" />
        </marker>
      </defs>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={`url(#arrow-${id})`}
        markerStart={`url(#arrow-${id}-reverse)`}
      />
      {label && (
        <EdgeText
          x={labelX}
          y={labelY}
          label={label}
          labelStyle={{ fill: '#222', fontSize: 12 }}
          labelShowBg={false}
        />
      )}
    </>
  );
};

export default BiDirectionalEdge;