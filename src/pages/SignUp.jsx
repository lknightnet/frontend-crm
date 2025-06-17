import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import HeaderSmall from "../components/HeaderSmall";

import "./styles/SignUp.css"

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://gustav.website:8008/api/auth/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password, name}),
            });

            if (!response.ok) {
                alert("Ошибка регистрации");
                return;
            }

            const data = await response.json();

            if (data.status === true) {
                navigate("/login");
            } else {
                alert("Ошибка регистрации");
            }
        } catch (error) {
            console.error("Ошибка при регистрации:", error);
            alert("Ошибка сети, попробуйте позже");
        }
    };

    return (
        <div className="page-login">
            <HeaderSmall></HeaderSmall>
            <form className="login-form" onSubmit={handleSubmit}>
                <Input type={"email"} placeholder={"Email"} value={email}
                       onChange={(e) => setEmail(e.target.value)}></Input>
                <Input type={"name"} placeholder={"Имя"} value={name}
                       onChange={(e) => setName(e.target.value)}></Input>
                <Input type={"password"} placeholder={"Пароль"} value={password}
                       onChange={(e) => setPassword(e.target.value)}></Input>
                <div className="button-group">
                    <Button text={"Регистрация"} className={"primary"} type="submit"></Button>
                    <Button text={"Авторизация"} className={"secondary"} to={"/login"}></Button>
                </div>
            </form>
        </div>
    )
};

export default SignUp;