import React from "react";
import "./styles/NavTabs.css"

const NavTabs = ({ activeTab, setActiveTab }) => {
    return (
        <div className="nav-tabs">
            <button
                className={`oval-button ${activeTab === "Задачи" ? "active" : ""}`}
                onClick={() => setActiveTab("Задачи")}
            >
                Задачи
            </button>
            <button
                className={`oval-button ${activeTab === "Проекты" ? "active" : ""}`}
                onClick={() => setActiveTab("Проекты")}
            >
                Проекты
            </button>
        </div>
    );
};

export default NavTabs;