import React, { useState } from 'react';
import { Handle } from '@xyflow/react';

// Define colors for each FolderIndex
const folderColors = ['color-0', 'color-1', 'color-2', 'color-3'];

const CustomNode = ({ data }) => {
  const [showMethods, setShowMethods] = useState(false);

  // Assign color based on FolderIndex
  const colorClass = folderColors[data.folderIndex % folderColors.length];

  const handleClick = () => {
    setShowMethods((prev) => !prev);
  };

  // Make the click handler accessible outside the component
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
    </div>
  );
};

export default CustomNode;
