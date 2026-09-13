import React, { useState } from 'react';
import { IonInput, IonButton, IonIcon, IonSpinner } from '@ionic/react';
import { sendOutline } from 'ionicons/icons';

interface Props {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<Props> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  return (
    <form className="chat-input-form" onSubmit={handleSend} style={{ display: 'flex', gap: '8px', padding: '8px 12px', alignItems: 'center' }}>
      <IonInput
        value={text}
        placeholder="Escribe tu consulta..."
        onIonInput={(e) => setText(e.detail.value!)}
        disabled={isLoading}
        style={{ '--background': 'rgba(255,255,255,0.08)', '--padding-start': '12px', borderRadius: '20px', color: '#fff' }}
      />
      <IonButton type="submit" fill="clear" disabled={!text.trim() || isLoading}>
        {isLoading ? <IonSpinner name="crescent" /> : <IonIcon icon={sendOutline} style={{ fontSize: '20px', color: '#002855' }} />}
      </IonButton>
    </form>
  );
};

export default ChatInput;
