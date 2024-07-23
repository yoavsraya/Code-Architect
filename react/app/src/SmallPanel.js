import React from 'react';
import './SmallPanel.css';

const SmallPanel = ({ children }) => {
  return (
    <div className="small-panel">
      {children}
    </div>
  );
};

export default SmallPanel;
