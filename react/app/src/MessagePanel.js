import React, { useState, useEffect } from 'react';
import './MessagePanel.css';

const MessagePanel = ({ data, setData }) => {
  const [expandedContent, setExpandedContent] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);

  useEffect(() => {
    if (data) {
      setConversationHistory(data.conversationHistory || []);
    }
  }, [data]);

  const handleExpand = async (topic) => {
    const files = topic.match(/`([^`]*)`/g)?.map(match => match.slice(1, -1)) || [];

    try {
      const response = await fetch('http://54.243.195.75:3000/api/expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          conversationHistory,
          files,
        }),
      });
      const expandedData = await response.json();
      setExpandedContent(expandedData.content);
      setConversationHistory(expandedData.conversationHistory);
      setData(expandedData); // Update the main data state
    } catch (error) {
      console.error('Error expanding topic:', error);
    }
  };

  const renderMessages = () => {
    if (!data) return null;

    const messages = data.message.content.split('\n').reduce((acc, line) => {
      if (line.startsWith('### ')) {
        acc.push({ type: 'headline', content: line.substring(4) });
      } else if (line.startsWith('- **')) {
        const match = line.match(/-\s\*\*(.*?)\*\*:\s(.*)/);
        if (match) {
          acc.push({ type: 'button', title: match[1], content: match[2] });
        }
      } else if (acc.length > 0) {
        acc[acc.length - 1].content += ' ' + line;
      }
      return acc;
    }, []);

    return messages.map((msg, index) => {
      if (msg.type === 'headline') {
        return <h3 key={index}>{msg.content}</h3>;
      } else if (msg.type === 'button') {
        return (
          <div key={index}>
            <button onClick={() => handleExpand(msg.content)}>
              {msg.title}
            </button>
            <p>{msg.content}</p>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="message-panel">
      {renderMessages()}
      {expandedContent && (
        <div className="expanded-content">
          <p>{expandedContent}</p>
        </div>
      )}
    </div>
  );
};

export default MessagePanel;
