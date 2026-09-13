import React from 'react';

interface Props {
  sender: 'user' | 'assistant';
  text: string;
}

const ChatBubble: React.FC<Props> = ({ sender, text }) => {
  const isUser = sender === 'user';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '10px',
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          padding: '10px 14px',
          borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
          backgroundColor: isUser ? '#002855' : 'rgba(255, 255, 255, 0.12)',
          color: '#ffffff',
          fontSize: '14px',
          lineHeight: '1.4',
          wordBreak: 'break-word',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default ChatBubble;
