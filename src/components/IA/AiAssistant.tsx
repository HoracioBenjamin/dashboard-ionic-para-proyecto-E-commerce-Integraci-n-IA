import { useState } from "react";

import AiChatButton from "./AiChatButton";
import AiChatWindow from "./AiChatWindow";

const AiAssistant: React.FC = () => {

    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>

            <AiChatWindow
                isOpen={isOpen}
                onClose={handleClose}
            />

            <AiChatButton
                isOpen={isOpen}
                onToggle={handleToggle}
            />

        </>
    );

};

export default AiAssistant;