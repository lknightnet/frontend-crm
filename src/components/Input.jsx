import React from "react";
import "./styles/Input.css"


const Input = ({ placeholder, type, value, onChange, className }) => {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`input ${className}`}
        />
    );
};
export default Input;