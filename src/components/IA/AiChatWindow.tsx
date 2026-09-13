import React, { useState } from "react";
import { IonCard } from "@ionic/react";

import ChatHeader from "./components/ChatHeader";
import AssistantAvatar from "./components/AssistantAvatar";
import ChatBubble from "./components/ChatBubble";
import ChatInput from "./components/ChatInput";
import { sendDashboardChatMessage, ChatMessage } from "../../services/aiService";
import "./styles/chat.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AiChatWindow: React.FC<Props> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    const response = await sendDashboardChatMessage(text, updatedMessages);
    setIsLoading(false);

    if (response.error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `⚠️ ${response.error}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } else {
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }
  };

  return (
    <div className="ai-window">
      <IonCard className="chat-card" style={{ display: 'flex', flexDirection: 'column', height: '480px', margin: 0 }}>
        <ChatHeader onClose={onClose} />

        <div className="chat-body" style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {messages.length === 0 ? (
            <div className="welcome-area">
              <AssistantAvatar />
              <div className="welcome-message">
                <h3>Hola 👋</h3>
                <p>Soy <strong>ShoesDuoc AI (Dashboard)</strong>.</p>
                <p>Estoy listo para ayudarte con la gestión de tu tienda, inventario y consultas del sistema.</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatBubble key={msg.id} sender={msg.sender} text={msg.text} />
            ))
          )}
        </div>

        <div className="chat-footer">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </IonCard>
    </div>
  );
};

export default AiChatWindow;