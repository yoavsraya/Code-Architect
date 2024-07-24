import React, { useRef, useState } from 'react';
import './BigPanel.css';
import SmallPanel from './SmallPanel';
import GraphComponent from './GraphComponent';
import MessagePanel from './MessagePanel';

const BigPanel = ({ isOpen, data }) => {
  const containerRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(50);
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !leftPanelVisible || !rightPanelVisible) return;
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const newLeftWidth = ((e.clientX - containerRef.current.offsetLeft) / containerWidth) * 100;
    if (newLeftWidth >= 10 && newLeftWidth <= 90) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const toggleLeftPanel = () => {
    if (leftPanelVisible && !rightPanelVisible) return; // Ensure at least one panel is visible
    setLeftPanelVisible(!leftPanelVisible);
    if (!leftPanelVisible && !rightPanelVisible) {
      setRightPanelVisible(true);
    }
  };

  const toggleRightPanel = () => {
    if (rightPanelVisible && !leftPanelVisible) return; // Ensure at least one panel is visible
    setRightPanelVisible(!rightPanelVisible);
    if (!leftPanelVisible && !rightPanelVisible) {
      setLeftPanelVisible(true);
    }
  };

  return (
    <div className="big-panel-container">
      <div className="button-container">
        <button className={`toggle-button ${leftPanelVisible ? 'active' : ''}`} onClick={toggleLeftPanel}>Graph</button>
        <button className={`toggle-button ${rightPanelVisible ? 'active' : ''}`} onClick={toggleRightPanel}>AI Assistance</button>
      </div>
      <div className="big-panel" ref={containerRef}>
        {leftPanelVisible && (
          <div className="left-panel" style={{ width: rightPanelVisible ? `${leftWidth}%` : '100%' }}>
            <SmallPanel>
              <GraphComponent />
            </SmallPanel>
          </div>
        )}
        {leftPanelVisible && rightPanelVisible && <div className="resizer" onMouseDown={handleMouseDown} />}
        {rightPanelVisible && (
          <div className="right-panel" style={{ width: leftPanelVisible ? `${100 - leftWidth}%` : '100%' }}>
            <SmallPanel>
              <MessagePanel data={data} />
            </SmallPanel>
          </div>
        )}
      </div>
    </div>
  );
};

export default BigPanel;
