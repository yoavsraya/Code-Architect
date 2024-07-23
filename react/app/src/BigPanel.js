import React, { useRef, useState } from 'react';
import './BigPanel.css';
import SmallPanel from './SmallPanel';
import GraphComponent from './GraphComponent';

const BigPanel = ({ isOpen, data }) => {
  const containerRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(50);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
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

  return (
    <div className="big-panel-container">
      <div className="big-panel" ref={containerRef}>
        <div className="left-panel" style={{ width: `${leftWidth}%` }}>
          <SmallPanel>
            <GraphComponent />
          </SmallPanel>
        </div>
        <div className="resizer" onMouseDown={handleMouseDown} />
        <div className="right-panel" style={{ width: `${100 - leftWidth}%` }}>
          <SmallPanel>
            {isOpen && data && (
              <div className="MessagePanel">
                <div className="message" dangerouslySetInnerHTML={{ __html: data.message?.content || '' }} />
              </div>
            )}
          </SmallPanel>
        </div>
      </div>
    </div>
  );
};

export default BigPanel;
