import React, { useRef, useState, useCallback, useMemo } from 'react';
import './BigPanel.css';
import SmallPanel from './SmallPanel';
import FlowChartComponent from './FlowChartComponent';
import MessagePanel from './MessagePanel';
const stop = true;

const BigPanel = ({ data, setData, aiResult }) => {
  const containerRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(50);
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || !leftPanelVisible || !rightPanelVisible) return;
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const newLeftWidth = ((e.clientX - containerRef.current.offsetLeft) / containerWidth) * 100;
    if (newLeftWidth >= 10 && newLeftWidth <= 90) {
      setLeftWidth(newLeftWidth);
    }
  }, [leftPanelVisible, rightPanelVisible]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const toggleLeftPanel = useCallback(() => {
    if (leftPanelVisible && !rightPanelVisible) return; // Ensure at least one panel is visible
    setLeftPanelVisible((prev) => !prev);
    if (!leftPanelVisible && !rightPanelVisible) {
      setRightPanelVisible(true);
    }
  }, [leftPanelVisible, rightPanelVisible]);

  const toggleRightPanel = useCallback(() => {
    if (rightPanelVisible && !leftPanelVisible) return; // Ensure at least one panel is visible
    setRightPanelVisible((prev) => !prev);
    if (!leftPanelVisible && !rightPanelVisible) {
      setLeftPanelVisible(true);
    }
  }, [leftPanelVisible, rightPanelVisible]);

  // Memoize the FlowChart and MessagePanel components
  const memoizedFlowChartComponent = useMemo(() => (
    <SmallPanel>
      <FlowChartComponent data={data} />
    </SmallPanel>
  ), [data]); // Only re-create if `data` changes

  const memoizedMessagePanel = useMemo(() => (
    <SmallPanel>
      {
        stop ? (
          // Content to display when `stop` is true
          null // or any other content you want to render
        ) : (
          // Content to display when `stop` is false
          <MessagePanel aiResult={aiResult} />
        )
      }
    </SmallPanel>
  ), [aiResult, stop]);

  return (
    <div className="big-panel-container">
      <div className="button-container">
        <button className={`toggle-button ${leftPanelVisible ? 'active' : ''}`} onClick={toggleLeftPanel}>Graph</button>
        <button className={`toggle-button ${rightPanelVisible ? 'active' : ''}`} onClick={toggleRightPanel}>AI Assistance</button>
      </div>
      <div className="big-panel" ref={containerRef}>
        {leftPanelVisible && (
          <div className="left-panel" style={{ width: rightPanelVisible ? `${leftWidth}%` : '100%' }}>
            {memoizedFlowChartComponent}
          </div>
        )}
        {leftPanelVisible && rightPanelVisible && <div className="resizer" onMouseDown={handleMouseDown} />}
        {rightPanelVisible && (
          <div className="right-panel" style={{ width: leftPanelVisible ? `${100 - leftWidth}%` : '100%' }}>
            {memoizedMessagePanel}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(BigPanel);
