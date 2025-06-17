import React from "react";
import "./styles/Calendar.css"

const Calendar = ({onClick}) => {

    return (
        <button className="wide-button-calendar"
                onClick={() => onClick(true)}>
            Календарь
        </button>

    )
};

export default Calendar;