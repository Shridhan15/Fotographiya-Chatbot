import React, { useState, useRef, useEffect } from 'react';
import '../styles/ChatBot.css';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  // ✅ Fix: Focus on mount
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, []);

  // ✅ Fix: Focus after loading
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (trimmedInput && !isLoading) {
      onSendMessage(trimmedInput);
      setInput(''); // Clear immediately
      // Focus back
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={input || ''}
          onChange={(e) => setInput(e.target.value || '')}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          className="chat-input-field"
          autoFocus={true}
        />
        <button 
          type="submit" 
          disabled={!input || !input.trim() || isLoading}
          className="send-btn"
        >
          ➤
        </button>
      </div>
    </form>
  );
};

export default ChatInput;