import React, {useEffect, useRef, useState} from "react";
import "./styles/Dashboard.css";
import Sidebar from "../components/Sidebar";
import Searcher from "../components/Searcher";
import Timer from "../components/Timer";
import Calendar from "../components/Calendar";
import NavTabs from "../components/NavTabs";
import Tasks from "../components/Tasks";
import Modal from "../components/Modal";
import {useAuth} from "../context/AuthContext";
import Projects from "../components/Projects";
import ProfileModalDesktop from "../components/ProfileModalDesktop";

const Dashboard = () => {
    const [showTimerModal, setShowTimerModal] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [overdueTasksDeadline, setOverdueTasksDeadline] = useState([]);
    const [todayTasksDeadline, setTodayTasksDeadline] = useState([]);
    const [thisWeekTasksDeadline, setThisWeekTasksDeadline] = useState([]);
    const [nextWeekTasksDeadline, setNextWeekTasksDeadline] = useState([]);
    const [noDueDateTasksDeadline, setNoDueDateTasksDeadline] = useState([]);

    const [projects, setProjects] = useState([]);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => setIsMenuOpen(prev => !prev);
    const [activeTab, setActiveTab] = useState("Задачи");

    const {authFetch, user} = useAuth();

    const buttons = [
        {
            to: "/login",
            text: 'Авторизация',
        },
        {
            to: "/signup",
            text: 'Регистрация',
        },
    ];


    const fetchAndSetTasks = async (url, setState) => {
        try {
            const response = await authFetch(url, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
            });


            const data = await response.json();

            if (data.status === false) {
                setState([]);
            } else {
                setState(data);
            }
        } catch (error) {
            console.error(`Ошибка загрузки задач с ${url}:`, error);
        }
    };

    const fetchAndSetProjects = async (url, setState) => {
        try {
            const response = await authFetch(url, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
            });


            const data = await response.json();

            if (data.status === false) {
                setState([]);
            } else {
                setState(data);
            }
        } catch (error) {
            console.error(`Ошибка загрузки проектов с ${url}:`, error);
        }
    };

    useEffect(() => {
        fetchAndSetProjects("http://localhost:8012/api/project/get/list", setProjects);
    }, []);

    useEffect(() => {
        fetchAndSetTasks("http://localhost:8012/api/task/get/user", setTasks);
    }, []);

    useEffect(() => {
        fetchAndSetTasks("http://localhost:8012/api/task/get/expired", setOverdueTasksDeadline);
    }, []);

    useEffect(() => {
        fetchAndSetTasks("http://localhost:8012/api/task/get/today", setTodayTasksDeadline);
    }, []);

    useEffect(() => {
        fetchAndSetTasks("http://localhost:8012/api/task/get/thisweek", setThisWeekTasksDeadline);
    }, []);

    useEffect(() => {
        fetchAndSetTasks("http://localhost:8012/api/task/get/nextweek", setNextWeekTasksDeadline);
    }, []);

    useEffect(() => {
        fetchAndSetTasks("http://localhost:8012/api/task/get/notdeadline", setNoDueDateTasksDeadline);
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [modalPosition, setModalPosition] = useState(null);
    const buttonRef = useRef(null);

    const handleTimerClick = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setModalPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX
            });
            setShowTimerModal(true);
        }
    };
    return (
        <div className={`dashboard-container ${isMenuOpen ? "menu-open" : ""}`}>
            <Sidebar buttonsList={buttons} isMenuOpen={isMenuOpen} toggleMenu={toggleMenu}/>

            <div className="main-content">
                <div className="top-bar">
                    <Searcher></Searcher>
                    <div className="top-buttons">
                        <Timer onClick={handleTimerClick} buttonRef={buttonRef} />
                        <Calendar onClick={setShowCalendarModal}></Calendar>
                    </div>
                    <div className="user-button" onClick={() => {
                        setIsModalOpen(true);
                    }}>
                        {user ? user.name : "Гость"}
                    </div>
                </div>

                <NavTabs activeTab={activeTab} setActiveTab={setActiveTab}/>

                {
                    activeTab === "Задачи" && <Tasks tasks={tasks} overdueTasksDeadline={overdueTasksDeadline}
                                                     todayTasksDeadline={todayTasksDeadline}
                                                     thisWeekTasksDeadline={thisWeekTasksDeadline}
                                                     nextWeekTasksDeadline={nextWeekTasksDeadline}
                                                     noDueDateTasksDeadline={noDueDateTasksDeadline}/>
                }
                {
                    activeTab === "Проекты" && <Projects projects={projects}/>
                }


                {showTimerModal && (
                    <Modal
                        onClick={setShowTimerModal}
                        text={"Рабочий день"}
                        position={modalPosition}
                    />
                )}

                {showCalendarModal && (
                    <Modal onClick={setShowCalendarModal} text={"Календарь"}></Modal>
                )}
            </div>

            {isModalOpen && (
                <ProfileModalDesktop onClose={() => {
                    setIsModalOpen(false);
                }}/>
            )}
        </div>
    );
};

export default Dashboard;