import React from 'react';
import logo from '../assets/logo/logo.jpeg';

const ChatToggle = ({ isOpen, toggleChat }) => {
  return (
    <button 
      className="chat-toggle-btn"
      onClick={toggleChat}
      aria-label={isOpen ? "Close chat" : "Open chat"}
      title={isOpen ? "Close chat" : "Open chat"}
    >
      <img 
        src={logo} 
        alt="Fotographiya Logo" 
        className="chat-logo-btn" 
      />
    </button>
  );
};

export default ChatToggle;