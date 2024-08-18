import React, { useState, useEffect } from 'react';
import './MessagePanel.css';

const MessagePanel = () => {
  const [expandedContent, setExpandedContent] = useState('');
  const [initialData, setInitialData] = useState(null);
  const [removedButtons, setRemovedButtons] = useState([]);

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
        setInitialData(aiData.content); // Ensure this matches the server response structure
      } catch (error) {
        console.error('Error fetching initial AI response:', error);
      }
    };

    fetchAIResponse();
  }, []);

  const handleExpand = async (topic) => {
    const filesSet = new Set();
    const regex = /'([^']*)'/g;
    let match;

    while ((match = regex.exec(topic)) !== null) {
      filesSet.add(match[1]);
    }

    const files = Array.from(filesSet);

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
          files,
        }),
      });
      const expandedData = await response.json();
      console.log('Expanded data received:', expandedData);

      if (Array.isArray(expandedData.content)) {
        const content = expandedData.content.join('\n');
        setExpandedContent(content); // Update with new expanded content
      } else {
        setExpandedContent(expandedData.content); // Update with new expanded content
      }
    } catch (error) {
      console.error('Error expanding topic:', error);
    }
  };

  const handleRemoveButton = (index) => {
    setRemovedButtons([...removedButtons, index]);
  };

  const parseContent = (content) => {
    if (Array.isArray(content)) {
      content = content.join('\n');
    }

    if (typeof content !== 'string') {
      console.error('Content is not a string:', content);
      return [];
    }

    const sections = content.split('###')
      .slice(1)
      .map(section => {
        const [title, ...bullets] = section.split('\n').filter(line => line.trim());
        return {
          title: title.trim(),
          bullets: bullets.map(bullet => bullet.trim()).filter(bullet => bullet.startsWith('- '))
        };
      });

    return sections;
  };

  const renderButtons = (sections) => {
    return sections.map((section, sectionIndex) => (
      <div key={sectionIndex}>
        <h3>{section.title}</h3>
        {section.bullets.map((bullet, bulletIndex) => {
          const index = `${sectionIndex}-${bulletIndex}`;
          if (removedButtons.includes(index)) {
            return null; // Skip rendering this button if it has been removed
          }
          const bulletParts = bullet.replace(/^- \*\*/, '').split('**:');
          return (
            <div key={index} className="button-container">
              <button
                onClick={() => handleExpand(bullet)}
                className="topic-button"
              >
                <strong>{bulletParts[0]}</strong>{bulletParts[1]}
              </button>
              <button
                onClick={() => handleRemoveButton(index)}
                className="remove-button"
              >
                 &#10006;
              </button>
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="panel">
      {expandedContent ? (
        renderButtons(parseContent(expandedContent))
      ) : (
        initialData && renderButtons(parseContent(initialData))
      )}
    </div>
  );
};

export default MessagePanel;
