import {
  IonFab,
  IonFabButton,
  IonIcon
} from "@ionic/react";

import { sparklesOutline, closeOutline } from "ionicons/icons";

interface Props{
    isOpen:boolean;
    onToggle:()=>void;
}

const AiChatButton:React.FC<Props> = ({isOpen,onToggle})=>{

    return(

        <IonFab
            vertical="bottom"
            horizontal="end"
            slot="fixed"
            className="ai-fab"
        >

            <IonFabButton
                className={`ai-button ${!isOpen ? "pulse" : ""}`}
                onClick={onToggle}
            >

                <IonIcon
                    icon={isOpen ? closeOutline : sparklesOutline}
                />

            </IonFabButton>

        </IonFab>

    )

}

export default AiChatButton;