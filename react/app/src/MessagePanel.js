import React, { useState, useEffect } from 'react';
import './MessagePanel.css';

const MessagePanel = () => {

  const initialMessages = [
    { type: 'from-system', text: "Hello! I'm your architect AI Assistance!" },
    { type: 'from-system', text: "I went over your code and I have some suggestions for you." },
  ];

  const [expandedContent, setExpandedContent] = useState('');
  const [initialData, setInitialData] = useState([]);
  const [removedButtons, setRemovedButtons] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [isExpandedView, setIsExpandedView] = useState(false); // Track if we are in the expanded view
  const [isClickable, setIsClickable] = useState(true); // Track whether messages are clickable

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

        // Only set the fetched AI data without adding initialMessages
        setInitialData(aiData.content);
      } catch (error) {
        console.error('Error fetching initial AI response:', error);
      }
    };

    fetchAIResponse();
  }, []);

  const handleExpand = async (topic, index, sectionTitle) => {
    if (!isClickable) return; // Prevent clicks if not clickable

    // Remove all '**' occurrences in the topic
    const cleanedTopic = topic.replace(/\*\*(.*?)\*\*/g, '$1');

    // Create the additional message
    const additionalMessage = "Give me more information about this subject";

    // Set the selected message with the title and texts
    setSelectedMessage({
      sectionTitle, // Pass the section title
      texts: [additionalMessage, cleanedTopic], // Store both messages
    });

    setRemovedButtons([...removedButtons, index]); // Remove the selected button
    setIsExpandedView(true); // Set to expanded view
    setIsClickable(false); // Disable clicks on other messages

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

      // Scroll to the top after content is fully rendered
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    } catch (error) {
      console.error('Error expanding topic:', error);
    }
  };

  const handleRemoveButton = (index) => {
    setRemovedButtons([...removedButtons, index]);
  };

  const handleBack = () => {
    setIsExpandedView(false); // Return to the initial view
    setSelectedMessage(''); // Clear the selected message
    setExpandedContent(''); // Clear expanded content
    setIsClickable(true); // Re-enable clicks on messages
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
        {!isExpandedView && <h3>{section.title}</h3>} {/* Only render the title if not in expanded view */}
        {section.bullets.map((bullet, bulletIndex) => {
          const index = `${sectionIndex}-${bulletIndex}`;
          if (removedButtons.includes(index)) {
            return null; // Skip rendering this button if it has been removed
          }
          const bulletParts = bullet.replace(/^- \*\*/, '').split('**:');
          return (
            <button
              onClick={() => handleExpand(bullet, index, section.title)}
              className="from-them"
              key={index}
              disabled={!isClickable} // Disable button if not clickable
            >
              {bulletParts[0]}{bulletParts[1]}
              <span 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the expand action from triggering
                  handleRemoveButton(index);
                }}
                className="remove-button"
              >
                &#10006;
              </span>
            </button>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="imessage">
      {isExpandedView && (
        <>
          <button className="back-button" onClick={handleBack}>Back</button>
          {selectedMessage && (
            <>
              <h3>{selectedMessage.sectionTitle}</h3> {/* Title appears before the messages */}
              <button className="from-me">
                {selectedMessage.texts[0]}
              </button>
              <button className="from-me">
                {selectedMessage.texts[1]}
              </button>
            </>
          )}
        </>
      )}
      {expandedContent && isExpandedView ? (
        renderButtons(parseContent(expandedContent))
      ) : (
        <>
          {initialMessages.map((msg, index) => (
            <button key={index} className={msg.type}>
              {msg.text}
            </button>
          ))}
          {initialData && renderButtons(parseContent(initialData))}
        </>
      )}
    </div>
  );
};

export default MessagePanel;
