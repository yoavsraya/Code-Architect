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
    if (!initialData || !initialData[0]) {
      console.log("No data or message content available");
      return null;
    }

    const content = initialData[0];
    console.log('Message content:', content);

    const sections = content.split('### ').slice(1);
    console.log('Parsed sections:', sections);

    return sections.map((section, index) => {
      const lines = section.trim().split('\n').filter(line => line);
      const topicTitle = lines.shift().trim();
      const bullets = lines.join(' ').split('  - ').slice(1);

      console.log('Section:', topicTitle);
      console.log('Bullets:', bullets);

      return (
        <div key={index}>
          <h3>{topicTitle}</h3>
          {bullets.map((bullet, idx) => {
            const headlineMatch = bullet.match(/\*\*(.*?)\*\*/);
            const headline = headlineMatch ? headlineMatch[0] : '';
            const description = bullet.replace(headline, '').trim();
            const buttonLabel = `<strong>${headline.replace(/\*\*/g, '')}:</strong> ${description}`;
            return (
              <button
                key={idx}
                onClick={() => handleExpand(buttonLabel)}
                className="topic-button"
                dangerouslySetInnerHTML={{ __html: buttonLabel }}
              />
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
