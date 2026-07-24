import { IonCard } from "@ionic/react";

import ChatHeader from "././components/ChatHeader";
import AssistantAvatar from "././components/AssistantAvatar";
import "./styles/chat.css";

interface Props {

    isOpen: boolean;

    onClose: () => void;

}

const AiChatWindow: React.FC<Props> = ({ isOpen, onClose }) => {

    if (!isOpen) return null;

    return (

        <div className="ai-window">

            <IonCard className="chat-card">

                <ChatHeader
                    onClose={onClose}
                />

                <div className="chat-body">

                    <div className="welcome-area">

                        <AssistantAvatar />

                        <div className="welcome-message">

                            <h3>

                                Hola 👋

                            </h3>

                            <p>

                                Soy <strong>Horacio AI</strong>.

                            </p>

                            <p>

                                Estoy listo para ayudarte a encontrar productos,
                                resolver dudas sobre el catálogo y recomendarte
                                prendas según tu estilo.

                            </p>

                        </div>

                    </div>

                </div>

                <div className="chat-footer">

                    Próximamente construiremos el input...

                </div>

            </IonCard>

        </div>

    );

}

export default AiChatWindow;