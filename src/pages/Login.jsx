import React, {useState} from "react"
import Input from "../components/Input";
import Button from "../components/Button";
import HeaderSmall from "../components/HeaderSmall";

import "./styles/Login.css"
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://gustav.website:8008/api/auth/login", {  // поменяй URL под свой бек
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email, password}),
            });

            if (response.status === 401) {
                // ошибка логина
                console.log("response", response.status);
                alert("Неверный email или пароль");
                return;
            }

            const data = await response.json();

            // Предполагаем, что сервер возвращает { access_token, refresh_token }
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);

            login(data.access_token, data.refresh_token); // сохраняем токен в контекст

            navigate("/dashboard"); // редирект после успешного входа
        } catch (error) {
            console.error("Ошибка при входе:", error);
            alert("Ошибка сети, попробуйте позже");
        }
    };

    return (
        <div className="page-login">
            <HeaderSmall></HeaderSmall>
            <form className="login-form" onSubmit={handleSubmit}>
                <Input type={"email"} placeholder={"Email"} value={email}
                       onChange={(e) => setEmail(e.target.value)}></Input>
                <Input type={"password"} placeholder={"Пароль"} value={password}
                       onChange={(e) => setPassword(e.target.value)}></Input>
                <div className="button-group">
                    <Button text={"Войти"} className={"primary"} type="submit"></Button>
                    <Button text={"Регистрация"} className={"secondary"} to={"/signup"}></Button>
                </div>
            </form>
        </div>
    )
};

export default Login;