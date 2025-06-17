import React from "react";
import "./styles/Cluster.css"
import HeaderSmall from "../components/HeaderSmall";
import Input from "../components/Input";
import Button from "../components/Button";

const Cluster = () => {
    return (
        <div className="ccontainer">
            <HeaderSmall></HeaderSmall>
            <div className="ccontent">
                <h1 className="ctitle">Страница с кнопками и инпутами</h1>

                <div className="cinput-button-row">
                    {/* Первая пара инпут + кнопка */}
                    <div className="cinput-button-column">
                        {/*<input*/}
                        {/*    type="text"*/}
                        {/*    placeholder="Введите код кластера"*/}
                        {/*    className="cinput"*/}
                        {/*/>*/}
                        <Input type={"text"} placeholder={"Введите код кластера"} className={"cluster"}></Input>
                        <Button text={"Найти кластер"} className={"cluster"}></Button>
                    </div>


                    {/* Вторая пара инпут + кнопка */}
                    <div className="cinput-button-column">
                        {/*<input*/}
                        {/*    type="text"*/}
                        {/*    placeholder="Введите имя кластера"*/}
                        {/*    className="cinput"*/}
                        {/*/>*/}
                        <Input type={"text"} placeholder={"Введите название кластера"} className={"cluster"}></Input>
                        <Button text={"Создать кластер"} className={"cluster"}></Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cluster;