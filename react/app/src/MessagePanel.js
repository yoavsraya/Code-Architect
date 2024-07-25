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

  const handleExpand = async (topic) => {
    const files = topic.match(/`([^`]*)`/g)?.map(match => match.slice(1, -1)) || [];
    console.log('Expanding topic:', topic);
    console.log('Files to fetch:', files);

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

    const content = initialData[0];
    console.log('Message content:', content);

    const topics = content.match(/### (.*?)(?=###|$)/gs) || [];
    console.log('Parsed topics:', topics);

    return topics.map((topic, index) => {
      const matches = topic.match(/- \*\*(.*?)\*\*/g) || [];
      const topicTitle = topic.split('\n')[0].replace('### ', '');

      return (
        <div key={index}>
          <h3>{topicTitle}</h3>
          {matches.map((match, idx) => {
            const buttonLabel = match.replace('- **', '').replace('**', '');
            return (
              <button
                key={idx}
                onClick={() => handleExpand(buttonLabel)}
                className="topic-button"
              >
                {buttonLabel}
              </button>
            );
          })}
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
