import React from "react"
import "./styles/Button.css"
import {Link} from "react-router-dom";

const Button = ({text, className, action, to, type}) => {
        if (to) {
            return (
                <Link to={to} className={`button ${className}`} style={{textDecoration: "none"}}>
                    {text}
                </Link>
            )
        }

        return (
            <button type={type} className={`button ${className}`} onClick={action}>{text}</button>
        )
    }
;

export default Button;