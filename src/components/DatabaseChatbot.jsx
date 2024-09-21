import React, { useState, useRef, useEffect } from 'react';

const DatabaseChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const botMessage = { text: data.response, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { text: 'Sorry, there was an error processing your request.', sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <div className={`fixed bottom-5 right-5 transition-all ${isMinimized ? 'w-16 h-16 border-0' : 'w-80 h-96 border-2 border-blue-500 rounded-lg shadow-lg'} bg-white flex flex-col overflow-hidden`}>
      {isMinimized ? (
        <img 
          width="50" 
          height="50" 
          src="https://img.icons8.com/ios/50/message-bot.png" 
          alt="message-bot" 
          onClick={toggleMinimize}
          className="cursor-pointer"
        />
      ) : (
        <>
          <div className="flex items-center justify-between bg-blue-500 text-white p-2">
            <h2 className="text-lg">Chatbot Assistant</h2>
            <button onClick={toggleMinimize} className="text-xl">
              &#10005; {/* Cross icon */}
            </button>
          </div>
          
          <div className="flex-grow p-2 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded-lg text-sm ${message.sender === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-200 text-left'}`}
              >
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex p-2 border-t border-gray-300">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-grow p-2 border border-gray-300 rounded-lg mr-2"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="p-2 bg-blue-500 text-white rounded-lg"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default DatabaseChatbot;
