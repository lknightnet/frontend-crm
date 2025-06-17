import React, {useState} from "react"
import "./styles/Sidebar.css"
import {Link} from "react-router-dom";


const defaultText = "G U S T A V"
const Sidebar = ({text = defaultText, buttonsList = [], isMenuOpen, toggleMenu}) => {


    if (buttonsList.length === 0) {
        console.error("components/Sidebar.jsx buttonsList is empty");
    }

    return (
        <div className="sidebar">
            <div className="sidebar-header" onClick={toggleMenu}>
                <div className={`menu-icon ${isMenuOpen ? 'open' : ''}`}>&#9776;</div>
                <header className="sidebar-title">{text}</header>
            </div>
            {/*<div className="sidebar-footer">Что-то на умном</div>*/}


            {isMenuOpen && (
                <div className="sidebar-menu">
                    {buttonsList.map((btn, index) => (
                        btn.to ? (
                            <Link to={btn.to} style={{textDecoration: "none"}} key={index} className="sidebar-button">
                                {btn.text}
                            </Link>
                        ) : (
                            <button key={index} className="sidebar-button">
                                {btn.text}
                            </button>
                        )
                    ))}
                </div>
            )}
        </div>
    )
}

export default Sidebar;