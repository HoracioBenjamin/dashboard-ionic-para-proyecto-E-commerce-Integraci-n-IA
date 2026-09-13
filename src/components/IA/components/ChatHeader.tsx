import { IonButton, IonIcon } from "@ionic/react";
import { closeOutline } from "ionicons/icons";

interface Props {

    onClose: () => void;

}

const ChatHeader: React.FC<Props> = ({ onClose }) => {

    return (

        <div className="chat-header">

            <div>

                <h2>

                    ✨ ShoesDuoc AI

                </h2>

                <p>

                    Tu asistente inteligente

                </p>

            </div>

            <IonButton
                fill="clear"
                onClick={onClose}
                className="close-button"
            >

                <IonIcon
                    icon={closeOutline}
                />

            </IonButton>

        </div>

    );

}

export default ChatHeader;