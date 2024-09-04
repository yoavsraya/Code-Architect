import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './MessagePanel.css';
import LoadingScreenAI from './LoadingScreenAI';

const MessagePanel = ({ aiResult }) => {
  const initialMessages = useMemo(() => [
    { type: 'from-system', text: "Hello! I'm your architect AI Assistance!" },
    { type: 'from-system', text: "I went over your code and I have some suggestions for you." },
  ], []);

  const [expandedContent, setExpandedContent] = useState('');
  const [initialData, setInitialData] = useState([]);
  const [removedButtons, setRemovedButtons] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [isExpandedView, setIsExpandedView] = useState(false);
  const [isClickable, setIsClickable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  let ws;

  const initializeWebSocket = useCallback(() => {
    if (!ws) {
      ws = new WebSocket('ws://184.73.72.205:3000');
    }
    ws.onopen = () => {
      console.log('WebSocket message connection established');
    };

    ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      const message = JSON.parse(event.data);
      if (message.ExtandAI) {
        console.log('extand finished');
        setIsLoading(false);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket message connection closed.');
      ws = null;
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);
  }, []);

  useEffect(() => {
    console.log("AI Component rendered with aiResult:", aiResult);
    const savedAIResult = localStorage.getItem('aiResult');
    if (savedAIResult)
    {
      console.log("AI data is exist")
      console.log(savedAIResult);
      setInitialData(JSON.parse(savedAIResult));
    }
    else if (aiResult) 
    {
      console.log("fetching aiResult", aiResult);
      setInitialData(aiResult);
      localStorage.setItem('aiResult', JSON.stringify(aiResult));
    }
  }, [aiResult]);

  const handleExpand = useCallback(async (topic, index, sectionTitle) => {
    initializeWebSocket();
    setIsLoading(true);
    if (!isClickable) return;

    const cleanedTopic = topic.replace(/\*\*(.*?)\*\*/g, '$1');
    const additionalMessage = "Give me more information about this subject";

    setSelectedMessage({
      sectionTitle,
      texts: [additionalMessage, cleanedTopic],
    });

    setIsExpandedView(true);
    setIsClickable(false);

    const filesSet = new Set();
    const regex = /'([^']*)'/g;
    let match;

    while ((match = regex.exec(topic)) !== null) {
      filesSet.add(match[1]);
    }

    const files = Array.from(filesSet);

    try {
      const response = await fetch('http://184.73.72.205:3000/api/expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, files }),
      });
      const expandedData = await response.json();
      console.log('Expanded data received:', expandedData);

      if (Array.isArray(expandedData.content)) {
        setExpandedContent(expandedData.content.join('\n'));
      } else {
        setExpandedContent(expandedData.content);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Error expanding topic:', error);
    }
  }, [initializeWebSocket, isClickable]);

  const handleRemoveButton = useCallback((index) => {
    setRemovedButtons((prevButtons) => [...prevButtons, index]);
  }, []);

  const handleBack = useCallback(() => {
    setIsExpandedView(false);
    setSelectedMessage('');
    setExpandedContent('');
    setIsClickable(true);
  }, []);

  const parseContent = useCallback((content) => {
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
          bullets: bullets.map(bullet => bullet.trim()).filter(bullet => bullet.startsWith('- ')),
        };
      });

    return sections;
  }, []);

  const renderButtons = useCallback((sections) => {
    return sections.map((section, sectionIndex) => (
      <div key={sectionIndex}>
        {!isExpandedView && <h3>{section.title}</h3>}
        {section.bullets.map((bullet, bulletIndex) => {
          const index = `${sectionIndex}-${bulletIndex}`;
          if (removedButtons.includes(index)) {
            return null;
          }
          const bulletParts = bullet.replace(/^- \*\*/, '').split('**:');
          return (
            <button
              onClick={() => handleExpand(bullet, index, section.title)}
              className="from-them"
              key={index}
              disabled={!isClickable}
            >
              {bulletParts[0]}{bulletParts[1]}
              <span 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveButton(index);
                }}
                className="remove-button2"
              >
                &#10006;
              </span>
            </button>
          );
        })}
      </div>
    ));
  }, [handleExpand, isClickable, isExpandedView, removedButtons]);

  return (
    isLoading ? (
      <LoadingScreenAI />
    ) : (
      <div className="imessage">
        {isExpandedView && (
          <>
            <button className="back-button2" onClick={handleBack}>Back</button>
            {selectedMessage && (
              <>
                <h3>{selectedMessage.sectionTitle}</h3>
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
    )
  );
};

export default MessagePanel;