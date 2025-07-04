import React, {useEffect, useState} from "react";
import "./styles/Modal.css";

const Modal = ({onClick, text, position, tasks = [], tasksPlan = [], setTasksPlan}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]); // Результаты поиска после нажатия +
    const [showResults, setShowResults] = useState(false); // Показывать ли результаты поиска

    const handleOverlayClick = () => {
        onClick(false);
    };

    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    const first_task_name = tasksPlan.length > 0 ? tasksPlan[0].name : "Название задачи";


    // Поиск задач при нажатии +
    const handleSearchTasks = () => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        // Находим задачи, где имя содержит термин
        const results = tasks.filter(task => task.name.toLowerCase().includes(term));
        setSearchResults(results);
        setShowResults(true);
    };

    // Добавить или удалить задачу из плана при клике на чекбокс
    const handleCheckTask = (taskId) => {
        if (tasksPlan.some(task => task.id === taskId)) {
            setTasksPlan(tasksPlan.filter(task => task.id !== taskId));
        } else {
            const taskToAdd = tasks.find(task => task.id === taskId);
            if (taskToAdd) {
                setTasksPlan([...tasksPlan, taskToAdd]);
            }
        }
    };
    return (
        text === "Рабочий день" &&
        <div
            className="modal-overlay-timer"
            onClick={handleOverlayClick}
        >
            <div
                className="modal-timer"
                onClick={handleModalClick}
                style={{
                    top: position?.top || 0,
                    left: position?.left - 50 || 0,
                }}
            >
                <div className="timer-text">00:00:00</div>
                <p className="workday-text">{text}</p>

                <button
                    className="workday-button"
                    // onClick={onButtonClick}
                    type="button"
                >
                    {/* s v g 1 */}
                    Начать рабочий день
                </button>

                <p className="workday-text-tasks">Начать таймер для задачи</p>
                <button
                    className="worktask-button"
                    // onClick={onButtonClick}
                    type="button"
                >
                    {/* s v g 2 */}
                    {first_task_name}
                </button>
                <div className="rectangle">

                    <button className="tab active">План на день</button>
                    <button className="tab" style={{
                        marginLeft: 5
                    }}>Сделано за день</button>
                    <div className="tab-container">
                        <p className="task-on-day">Задачи на день</p>
                        <div className={`list-tasks${tasksPlan.length === 0 ? ' empty' : ''}`}>
                            {tasksPlan.length > 0 && tasksPlan.map(task => (
                                <div key={task.id} className="task-item">
                                    <p>{task.name}</p>
                                    <input
                                        type="checkbox"
                                        checked
                                        onChange={() => handleCheckTask(task.id)}
                                    />
                                </div>
                            ))}
                        </div>
                        {showResults && (
                            <>
                                <p>Результаты поиска:</p>
                                {searchResults.length > 0 ? (
                                    searchResults.map(task => {
                                        // Отмечена ли задача уже в плане
                                        const isChecked = tasksPlan.some(t => t.id === task.id);
                                        return (
                                            <div key={task.id} className="task-item">
                                                <p>{task.name}</p>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleCheckTask(task.id)}
                                                />
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p>Задачи не найдены</p>
                                )}
                            </>
                        )}

                        <div className="input-row">
                            <input
                                type="text"
                                className="input-searcher-modal-timer"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Введите текст задачи"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearchTasks();
                                    }
                                }}
                            />
                            <input
                                type="button"
                                className="input-button-modal-timer"
                                value="+"
                                onClick={handleSearchTasks}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;

/* s v g  1*/
// <svg width="10.714355" height="12.000000" viewBox="0 0 10.7144 12" fill="none"
//      xmlns="http://www.w3.org/2000/svg">
//     <defs/>
//     <path id="path"
//           d="M1.92 11.82L10.05 7.14C10.1 7.11 10.15 7.08 10.2 7.04C10.24 7.01 10.29 6.97 10.33 6.93C10.37 6.89 10.4 6.84 10.44 6.8C10.47 6.75 10.51 6.7 10.53 6.65C10.56 6.6 10.59 6.55 10.61 6.5C10.63 6.45 10.65 6.39 10.66 6.34C10.68 6.28 10.69 6.22 10.7 6.17C10.71 6.11 10.71 6.05 10.71 6C10.71 5.94 10.71 5.88 10.7 5.82C10.69 5.77 10.68 5.71 10.66 5.65C10.65 5.6 10.63 5.54 10.61 5.49C10.59 5.44 10.56 5.39 10.53 5.34C10.51 5.29 10.47 5.24 10.44 5.19C10.4 5.15 10.37 5.1 10.33 5.06C10.29 5.02 10.24 4.98 10.2 4.95C10.15 4.91 10.1 4.88 10.05 4.85L1.92 0.17C1.82 0.11 1.72 0.07 1.61 0.04C1.5 0.01 1.4 0 1.28 0C1.17 0 1.06 0.01 0.95 0.04C0.85 0.07 0.74 0.11 0.65 0.17C0.55 0.22 0.46 0.29 0.38 0.38C0.29 0.46 0.22 0.55 0.17 0.65C0.11 0.75 0.07 0.86 0.04 0.97C0.01 1.08 -0.01 1.19 0 1.31L0 10.68C-0.01 10.8 0.01 10.91 0.04 11.02C0.07 11.13 0.11 11.24 0.17 11.34C0.22 11.44 0.29 11.53 0.38 11.61C0.46 11.7 0.55 11.76 0.65 11.82C0.74 11.88 0.85 11.92 0.95 11.95C1.06 11.98 1.17 11.99 1.28 12C1.39 12 1.5 11.98 1.61 11.95C1.72 11.92 1.82 11.88 1.92 11.82ZM1.08 11.08C1.01 11.04 0.95 10.98 0.91 10.91C0.87 10.84 0.85 10.76 0.85 10.68L0.85 1.31C0.85 1.23 0.87 1.15 0.91 1.08C0.95 1.01 1.01 0.95 1.08 0.91C1.14 0.87 1.21 0.85 1.28 0.85C1.36 0.85 1.43 0.87 1.49 0.91L9.63 5.59C9.66 5.62 9.69 5.64 9.72 5.67C9.75 5.7 9.77 5.73 9.79 5.77C9.81 5.8 9.83 5.84 9.84 5.88C9.85 5.92 9.85 5.96 9.85 6C9.85 6.04 9.85 6.08 9.84 6.12C9.83 6.15 9.81 6.19 9.79 6.23C9.77 6.26 9.75 6.29 9.72 6.32C9.69 6.35 9.66 6.38 9.63 6.4L1.49 11.08C1.43 11.12 1.36 11.14 1.28 11.14C1.21 11.14 1.14 11.12 1.08 11.08Z"
//           fill="#FFFFFF" fill-opacity="1.000000" fill-rule="nonzero"/>
// </svg>


/* s v g  2*/
// <svg width="10.714355" height="12.000000" viewBox="0 0 10.7144 12" fill="none"
//      xmlns="http://www.w3.org/2000/svg">
//     <defs/>
//     <path id="path"
//           d="M1.92 11.82L10.05 7.14C10.1 7.11 10.15 7.08 10.2 7.04C10.24 7.01 10.29 6.97 10.33 6.93C10.37 6.89 10.4 6.84 10.44 6.8C10.47 6.75 10.51 6.7 10.53 6.65C10.56 6.6 10.59 6.55 10.61 6.5C10.63 6.45 10.65 6.39 10.66 6.34C10.68 6.28 10.69 6.22 10.7 6.17C10.71 6.11 10.71 6.05 10.71 6C10.71 5.94 10.71 5.88 10.7 5.82C10.69 5.77 10.68 5.71 10.66 5.65C10.65 5.6 10.63 5.54 10.61 5.49C10.59 5.44 10.56 5.39 10.53 5.34C10.51 5.29 10.47 5.24 10.44 5.19C10.4 5.15 10.37 5.1 10.33 5.06C10.29 5.02 10.24 4.98 10.2 4.95C10.15 4.91 10.1 4.88 10.05 4.85L1.92 0.17C1.82 0.11 1.72 0.07 1.61 0.04C1.5 0.01 1.4 0 1.28 0C1.17 0 1.06 0.01 0.95 0.04C0.85 0.07 0.74 0.11 0.65 0.17C0.55 0.22 0.46 0.29 0.38 0.38C0.29 0.46 0.22 0.55 0.17 0.65C0.11 0.75 0.07 0.86 0.04 0.97C0.01 1.08 -0.01 1.19 0 1.31L0 10.68C-0.01 10.8 0.01 10.91 0.04 11.02C0.07 11.13 0.11 11.24 0.17 11.34C0.22 11.44 0.29 11.53 0.38 11.61C0.46 11.7 0.55 11.76 0.65 11.82C0.74 11.88 0.85 11.92 0.95 11.95C1.06 11.98 1.17 11.99 1.28 12C1.39 12 1.5 11.98 1.61 11.95C1.72 11.92 1.82 11.88 1.92 11.82ZM1.08 11.08C1.01 11.04 0.95 10.98 0.91 10.91C0.87 10.84 0.85 10.76 0.85 10.68L0.85 1.31C0.85 1.23 0.87 1.15 0.91 1.08C0.95 1.01 1.01 0.95 1.08 0.91C1.14 0.87 1.21 0.85 1.28 0.85C1.36 0.85 1.43 0.87 1.49 0.91L9.63 5.59C9.66 5.62 9.69 5.64 9.72 5.67C9.75 5.7 9.77 5.73 9.79 5.77C9.81 5.8 9.83 5.84 9.84 5.88C9.85 5.92 9.85 5.96 9.85 6C9.85 6.04 9.85 6.08 9.84 6.12C9.83 6.15 9.81 6.19 9.79 6.23C9.77 6.26 9.75 6.29 9.72 6.32C9.69 6.35 9.66 6.38 9.63 6.4L1.49 11.08C1.43 11.12 1.36 11.14 1.28 11.14C1.21 11.14 1.14 11.12 1.08 11.08Z"
//           fill="#FFFFFF" fill-opacity="1.000000" fill-rule="nonzero"/>
// </svg>
// <svg width="12.000000" height="12.000000" viewBox="0 0 12 12" fill="none"
//      xmlns="http://www.w3.org/2000/svg">
//     <defs/>
//     <path id="path"
//           d="M0.17 1.07C0.05 1.17 0 1.29 0 1.43L0 11.52C0 11.58 0.01 11.64 0.03 11.7C0.06 11.76 0.09 11.81 0.14 11.85C0.19 11.9 0.24 11.93 0.3 11.96C0.36 11.98 0.43 12 0.5 12C0.56 12 0.62 11.98 0.69 11.96C0.75 11.93 0.8 11.9 0.85 11.85C0.9 11.81 0.93 11.76 0.96 11.7C0.98 11.64 1 11.58 1 11.52L1 8.86C2.67 7.59 4.11 8.28 5.77 9.07C6.8 9.55 7.9 10.08 9.08 10.08C9.95 10.08 10.87 9.79 11.82 9C11.94 8.9 11.99 8.78 12 8.64L12 1.43C12 1.34 11.97 1.25 11.91 1.17C11.86 1.1 11.79 1.04 11.7 1C11.61 0.96 11.52 0.95 11.42 0.96C11.32 0.97 11.24 1.01 11.17 1.07C9.42 2.53 7.93 1.82 6.22 1.01C4.44 0.16 2.42 -0.8 0.17 1.07ZM10.99 8.41C9.32 9.68 7.88 8.99 6.22 8.21C4.65 7.46 2.92 6.64 1 7.7L1 1.66C2.67 0.39 4.11 1.08 5.77 1.87C7.33 2.61 9.07 3.43 10.99 2.37L10.99 8.41Z"
//           fill="#FFFFFF" fill-opacity="1.000000" fill-rule="nonzero"/>
// </svg>