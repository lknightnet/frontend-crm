import React from "react";
import "./styles/HeaderSmall.css"

const defaultText = "G U S T A V"
const HeaderSmall = ({text = defaultText}) => {
    return (
        <header className="header-small">{text}</header>
    )
};

export default HeaderSmall;