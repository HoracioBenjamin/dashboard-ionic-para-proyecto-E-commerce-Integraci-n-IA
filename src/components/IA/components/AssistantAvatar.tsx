import { IonAvatar } from "@ionic/react";
import { sparklesOutline } from "ionicons/icons";
import { IonIcon } from "@ionic/react";

const AssistantAvatar: React.FC = () => {

    return (

        <IonAvatar className="assistant-avatar">

            <IonIcon
                icon={sparklesOutline}
            />

        </IonAvatar>

    );

}

export default AssistantAvatar;