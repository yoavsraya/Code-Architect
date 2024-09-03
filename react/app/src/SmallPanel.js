import React from 'react';
import './SmallPanel.css';

const SmallPanel = React.memo(({ children }) => {
  console.log('SmallPanel rendered');
  return (
    <div className="small-panel">
      {children}
    </div>
  );
}, areEqual);

function areEqual(prevProps, nextProps) {
  return prevProps.children === nextProps.children;
}

export default SmallPanel;