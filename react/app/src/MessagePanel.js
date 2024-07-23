import React, { useState, useEffect } from 'react';
import './MessagePanel.css';
import parse from 'html-react-parser';

const MessagePanel = ({ data, setData }) => {
  const [expandedContent, setExpandedContent] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);

  useEffect(() => {
    if (data) {
      setConversationHistory(data.conversationHistory);
    }
  }, [data]);

  const handleExpand = async (topic) => {
    try {
      const response = await fetch('http://54.243.195.75:3000/api/expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          conversationHistory,
        }),
      });
      const expandedData = await response.json();
      setExpandedContent(expandedData.content);
      setConversationHistory(expandedData.conversationHistory);
    } catch (error) {
      console.error('Error expanding topic:', error);
    }
  };

  const renderButtons = () => {
    if (!data) return null;

    const highlights = data.message.content.match(/<div class="highlight">.*?<\/div>/g);

    return highlights.map((highlight, index) => {
      const parsedHighlight = parse(highlight);
      const title = parsedHighlight.props.children[0].props.children;

      return (
        <button
          key={index}
          onClick={() => handleExpand(title)}
          className={`highlight-button highlight-${index + 1}`}
        >
          {title}
        </button>
      );
    });
  };

  return (
    <div className="panel">
      {renderButtons()}
      {expandedContent && (
        <div
          className="expanded-content"
          dangerouslySetInnerHTML={{ __html: expandedContent }}
        />
      )}
    </div>
  );
};

export default MessagePanel;
