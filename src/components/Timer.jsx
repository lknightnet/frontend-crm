import React from "react";
import "./styles/Timer.css"

const Timer = ({ onClick, buttonRef }) => {
    return (
        <button
            ref={buttonRef}
            className="wide-button-timer"
            onClick={onClick}
        >
            Таймер
        </button>
    );
};

export default Timer;