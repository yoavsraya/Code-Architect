import React from 'react';
import './SmallPanel.css';

const SmallPanel = React.memo(({ children }) => {
  console.log('SmallPanel rendered');
  return (
    <div className="small-panel">
      {children}
    </div>
  );
});

export default SmallPanel;
