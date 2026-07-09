import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

const ChatMessages = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  return (
    <div className="chat-messages">
      {messages.map((message, index) => {
        // ✅ BULLETPROOF LOGIC: Find the exact user prompt for THIS specific bot message
        let userPromptThatTriggeredThis = null;

        if (message.sender === "bot") {
          // Look backwards from this bot message to find the most recent user message
          for (let i = index - 1; i >= 0; i--) {
            if (messages[i].sender !== "bot") {
              userPromptThatTriggeredThis = messages[i].text;
              break;
            }
          }
        }

        return (
          <ChatMessage
            key={message.id || index}
            message={message}
            // ✅ Lock the buttons to the specific text that generated them!
            lastUserMessage={userPromptThatTriggeredThis}
          />
        );
      })}

      {isLoading && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
