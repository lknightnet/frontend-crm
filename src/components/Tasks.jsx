import React, {useRef, useState} from "react";
import "./styles/Tasks.css"
import TaskModalDesktop from "./TaskModalDesktop";
import {useAuth} from "../context/AuthContext";

const Tasks = ({
                   tasks = [],
                   overdueTasksDeadline = [],
                   todayTasksDeadline = [],
                   thisWeekTasksDeadline = [],
                   nextWeekTasksDeadline = [],
                   noDueDateTasksDeadline = []
               }) => {
    const [activeTool, setActiveTool] = useState('Список');
    const [currentPage, setCurrentPage] = useState(1);
    const {authFetch} = useAuth();

    const tasksPerPageList = 16;
    const totalPagesList = Math.max(1, Math.ceil(tasks.length / tasksPerPageList));
    const indexOfLastTaskList = currentPage * tasksPerPageList;
    const indexOfFirstTaskList = indexOfLastTaskList - tasksPerPageList;

    const handleNextPageList = () => {
        if (currentPage < totalPagesList) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPageList = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const tasksPerPageDeadline = 8;
    const totalPagesDeadline = Math.max(1, Math.ceil(tasks.length / tasksPerPageDeadline));
    const indexOfLastTaskDeadline = currentPage * tasksPerPageDeadline;
    const indexOfFirstTaskDeadline = indexOfLastTaskDeadline - tasksPerPageDeadline;

    const handleNextPageDeadline = () => {
        if (currentPage < totalPagesDeadline) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPageDeadline = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };


    const sortedTasks = [...tasks].sort((a, b) => {
        if (activeTool === 'Список' || activeTool === 'Сроки') {
            return new Date(b.created_at) - new Date(a.created_at);
        }
        return 0;
    });
    const currentTasksList = sortedTasks.slice(indexOfFirstTaskList, indexOfLastTaskList);

    const overdueTasks = overdueTasksDeadline.slice(indexOfFirstTaskDeadline, indexOfLastTaskDeadline);
    const todayTasks = todayTasksDeadline.slice(indexOfFirstTaskDeadline, indexOfLastTaskDeadline);
    const thisWeekTasks = thisWeekTasksDeadline.slice(indexOfFirstTaskDeadline, indexOfLastTaskDeadline);
    const nextWeekTasks = nextWeekTasksDeadline.slice(indexOfFirstTaskDeadline, indexOfLastTaskDeadline);
    const noDueDateTasks = noDueDateTasksDeadline.slice(indexOfFirstTaskDeadline, indexOfLastTaskDeadline);


    const handleSetActiveTool = (tool) => {
        setActiveTool(tool);
        setCurrentPage(1);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);


    const [timers, setTimers] = useState({}); // { [taskId]: { time, running, timerId } }
    const timerRefs = useRef({}); // хранит setInterval ID для каждой задачи

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60).toString().padStart(2, '0');
        const seconds = (time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };



    const startTimer = async (taskId) => {
        if (timers[taskId]?.running) return;

        try {
            const res = await fetch('/api/timers/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: taskId }),
            });
            if (!res.ok) throw new Error('Ошибка старта таймера');

            const data = await res.json();
            const timerId = data.id;

            timerRefs.current[taskId] = setInterval(() => {
                setTimers(prev => ({
                    ...prev,
                    [taskId]: {
                        ...prev[taskId],
                        time: (prev[taskId]?.time ?? 0) + 1,
                        running: true,
                        timerId,
                    }
                }));
            }, 1000);

            setTimers(prev => ({
                ...prev,
                [taskId]: {
                    time: prev[taskId]?.time ?? 0,
                    running: true,
                    timerId,
                }
            }));
        } catch (e) {
            console.error(e);
        }
    };

    const stopTimer = async (taskId) => {
        if (!timers[taskId]?.running) return;

        try {
            const res = await fetch('/api/timers/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: taskId }),
            });
            if (!res.ok) throw new Error('Ошибка остановки таймера');

            clearInterval(timerRefs.current[taskId]);
            timerRefs.current[taskId] = null;

            setTimers(prev => ({
                ...prev,
                [taskId]: {
                    ...prev[taskId],
                    running: false,
                }
            }));
        } catch (e) {
            console.error(e);
        }
    };



    const resumeTimer = async (taskId) => {
        if (timers[taskId]?.running) return;
        const timerId = timers[taskId]?.timerId;
        if (!timerId) {
            console.error('Нет ID таймера для резюма');
            return;
        }

        try {
            const res = await fetch(`/api/timers/${timerId}/resume`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error('Ошибка резюма таймера');

            timerRefs.current[taskId] = setInterval(() => {
                setTimers(prev => ({
                    ...prev,
                    [taskId]: {
                        ...prev[taskId],
                        time: (prev[taskId]?.time ?? 0) + 1,
                        running: true,
                    }
                }));
            }, 1000);

            setTimers(prev => ({
                ...prev,
                [taskId]: {
                    ...prev[taskId],
                    running: true,
                }
            }));
        } catch (e) {
            console.error(e);
        }
    };

    const handleButtonClick = (taskId) => {
        const timer = timers[taskId];
        if (!timer || (!timer.running && timer.time === 0)) {
            startTimer(taskId);
        } else if (timer.running) {
            stopTimer(taskId);
        } else {
            resumeTimer(taskId);
        }
    };

    const activeTaskId = Object.entries(timers).find(([_, t]) => t.running)?.[0];
    return (
        <div className={`task-container ${activeTool === 'Сроки' ? 'deadline-mode' : ''}`}>
            <h3>Мои задачи</h3>

            <div className="task-toolbar">
                <button
                    className={`action-button ${activeTool === 'Список' ? 'active' : ''}`}
                    onClick={() => handleSetActiveTool('Список')}
                >Список
                </button>
                <button
                    className={`action-button ${activeTool === 'Сроки' ? 'active' : ''}`}
                    onClick={() => handleSetActiveTool('Сроки')}
                >Сроки
                </button>
                <button className="action-button" onClick={() => {
                    setSelectedTask(null);
                    setIsModalOpen(true);
                }}>Создать
                </button>
            </div>

            {activeTool === 'Список' && (
                <>
                    <div className="task-header">
                        <div className="task-header-cell">Название</div>
                        <div className="task-header-cell">Описание</div>
                        <div className="task-header-cell">Статус</div>
                        <div className="task-header-cell no-border"></div>
                        {/* Пустая ячейка */}
                    </div>

                    {currentTasksList.length > 0 ? (
                        currentTasksList.map((task, index) => {
                            const timer = timers[task.id] || {time: 0, running: false};
                            const isDisabled = activeTaskId && activeTaskId !== task.id.toString();
                            return (
                                <div key={index} className="task-row" onClick={() => {
                                    setSelectedTask(task);
                                    setIsModalOpen(true);
                                }}>
                                    <div className="task-title">{task.name}</div>
                                    <div className="task-description">{task.description}</div>
                                    <div className="task-status">{task.status}</div>
                                    <button
                                        disabled={isDisabled}
                                        className="start-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleButtonClick(task.id);
                                        }}
                                    >
                                        {timer.running
                                            ? formatTime(timer.time)
                                            : timer.time === 0
                                                ? 'Начать'
                                                : `Продолжить (${formatTime(timer.time)})`}
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="task-empty">Нет задач</div>
                    )}


                    <div className="task-footer">
                        <button
                            className="action-button"
                            onClick={handlePrevPageList}
                            disabled={currentPage === 1}
                        >
                            Предыдущая
                        </button>
                        <div className="pagination">
                            Страница {currentPage} из {totalPagesList}
                        </div>
                        <button
                            className="action-button"
                            onClick={handleNextPageList}
                            disabled={currentPage === totalPagesList}
                        >
                            Следующая
                        </button>
                    </div>
                </>
            )}

            {activeTool === 'Сроки' && (
                <>
                    <div className="deadline-mode">
                        {/* Заголовки */}
                        <div className="task-deadline-row task-deadline-header">
                            {[
                                {title: "Просрочены", color: "#FF7070"},
                                {title: "Сегодня", color: "#00DB20"},
                                {title: "На этой неделе", color: "#00B8FF"},
                                {title: "На следующей неделе", color: "#00C9B5"},
                                {title: "Без срока", color: "#848484"},
                            ].map(({title, color}, index) => (
                                <div key={index} className="task-deadline-cell">
                                    <span className="task-deadline-label" style={{"--dot-color": color}}>
                                        {title}
                                        <span className="dot"/>
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Задачи */}
                        <div className="task-deadline-row task-deadline-columns">
                            {[overdueTasks, todayTasks, thisWeekTasks, nextWeekTasks, noDueDateTasks].map((tasks, index) => (
                                <div key={index} className="task-deadline-cell">
                                    {tasks.length > 0 ? (
                                        tasks.map((task, i) => (
                                            <div key={i} className="task-box" onClick={() => {
                                                setSelectedTask(task);
                                                setIsModalOpen(true);
                                            }}>
                                                <div className="task-title">{task.name}</div>
                                                <div className="task-description">{task.description}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="task-empty">Нет задач</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Мобильная вертикальная версия */}
                        <div className="task-deadline-mobile">
                            {[
                                {title: "Просрочены", tasks: overdueTasks, color: "#FF7070"},
                                {title: "Сегодня", tasks: todayTasks, color: "#00DB20"},
                                {title: "На этой неделе", tasks: thisWeekTasks, color: "#00B8FF"},
                                {title: "На следующей неделе", tasks: nextWeekTasks, color: "#00C9B5"},
                                {title: "Без срока", tasks: noDueDateTasks, color: "#848484"},
                            ].map(({title, tasks, color}, index) => (
                                <div key={index} className="task-deadline-mobile-section">
                                    <div className="task-deadline-label" style={{"--dot-color": color}}>
                                        {title}
                                        <span className="dot"/>
                                    </div>
                                    <div className="task-deadline-mobile-column">
                                        {tasks.length > 0 ? (
                                            tasks.map((task, i) => (
                                                <div key={i} className="task-box" onClick={() => {
                                                    setSelectedTask(task);
                                                    setIsModalOpen(true);
                                                }}>
                                                    <div className="task-title">{task.name}</div>
                                                    <div className="task-description">{task.description}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="task-empty">Нет задач</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="task-footer">
                        <button
                            className="action-button"
                            onClick={handlePrevPageDeadline}
                            disabled={currentPage === 1}
                        >
                            Предыдущая
                        </button>
                        <div className="pagination">
                            Страница {currentPage} из {totalPagesDeadline}
                        </div>
                        <button
                            className="action-button"
                            onClick={handleNextPageDeadline}
                            disabled={currentPage === totalPagesDeadline}
                        >
                            Следующая
                        </button>
                    </div>
                </>
            )}

            {isModalOpen && (
                <TaskModalDesktop task={selectedTask} onClose={() => {
                    setIsModalOpen(false);
                    setSelectedTask(null);
                }}/>
            )}

        </div>

    )
};

export default Tasks;