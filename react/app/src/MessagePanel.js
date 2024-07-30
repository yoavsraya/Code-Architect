import React, { useState, useEffect } from 'react';
import './MessagePanel.css';

const MessagePanel = () => {
  const [expandedContent, setExpandedContent] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchAIResponse = async () => {
      console.log("Fetching initial AI response...");
      try {
        const response = await fetch('http://54.243.195.75:3000/api/runAI');
        if (!response.ok) {
          throw new Error('Failed to fetch AI response');
        }
        const aiData = await response.json();
        console.log('Initial AI response received:', aiData);
        setInitialData(aiData);
        setConversationHistory(aiData.conversationHistory || []);
      } catch (error) {
        console.error('Error fetching initial AI response:', error);
      }
    };

    fetchAIResponse();
  }, []);

  const handleExpand = async (bullet) => {
    console.log('Expanding bullet:', bullet);
    const topic = bullet.split(':')[0].trim();
    const files = []; // Adjust as needed to provide relevant files for the request

    try {
      console.log('Sending expand request...');
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

      if (!response.ok) {
        throw new Error('Failed to fetch expanded content');
      }

      const expandedData = await response.json();
      console.log('Expanded data received:', expandedData);
      setExpandedContent(expandedData.content);
      setConversationHistory(expandedData.conversationHistory);
    } catch (error) {
      console.error('Error expanding topic:', error);
    }
  };

  const renderButtons = () => {
    if (!initialData || !initialData.length) {
      console.log("No data or message content available");
      return null;
    }

    return initialData.map((section, sectionIndex) => {
      const sectionLines = section.split('\n').filter(line => line.trim().length > 0);
      const sectionTitle = sectionLines[0].replace('###', '').trim();
      const bullets = sectionLines.slice(1).map(line => line.replace('- ', '').trim());

      console.log('Section:', sectionTitle);
      console.log('Bullets:', bullets);

      return (
        <div key={sectionIndex}>
          <h3>{sectionTitle}</h3>
          {bullets.map((bullet, bulletIndex) => (
            <button
              key={bulletIndex}
              onClick={() => handleExpand(bullet)}
              className="topic-button"
            >
              <strong>{bullet.split(': ')[0]}</strong>: {bullet.split(': ')[1]}
            </button>
          ))}
        </div>
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
