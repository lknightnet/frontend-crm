import Select from 'react-select';
import {useState, useEffect, useRef} from 'react';
import {useAuth} from "../context/AuthContext";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {ru} from "date-fns/locale";
import DatePickerWithIcon from "./DatePickerWithIcon";


const TaskModalDesktop = ({task, onClose}) => {
    const [selectedExecutors, setSelectedExecutors] = useState([]);
    const [options, setOptions] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {authFetch, user} = useAuth();
    const [deadline, setDeadline] = useState(null);
    const [priority, setPriority] = useState('low');
    const capitalize = (str) => str.charAt(0).toLowerCase() + str.slice(1);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    const debounceTimeout = useRef(null);

    useEffect(() => {
        if (user && user.id && user.name) {
            setSelectedExecutors([{id: user.id, name: user.name}]);
        }
    }, [user]);

    const fetchExecutors = async (query) => {
        setIsLoading(true);
        try {
            const response = await authFetch('http://gustav.website:8010/api/user/get/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username: query}),
            });

            if (!response.ok) {
                return [];
                // throw new Error('Ошибка загрузки исполнителей');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);
            return [];
        } finally {
            setIsLoading(false);
        }
    }

    const handleInputChange = (value) => {
        setInputValue(value);
    };
    const handleSelectChange = (selectedOption) => {
        if (selectedOption) {
            const executorId = selectedOption.value;
            if (!selectedExecutors.find((ex) => ex.id === executorId)) {
                setSelectedExecutors([...selectedExecutors, {id: executorId, name: selectedOption.label}]);
            }
            setInputValue(''); // очистить поле поиска после выбора
        }
    };
    useEffect(() => {
        if (inputValue.length < 3) {
            setOptions([]); // очищаем опции если символов меньше 3
            return;
        }

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            fetchExecutors(inputValue).then((executors) => {
                // Гарантируем, что executors — это массив
                const list = Array.isArray(executors) ? executors : [];

                const filteredExecutors = list.filter(
                    (ex) => !selectedExecutors.find((sel) => sel.id === ex.id)
                );

                setOptions(filteredExecutors.map((ex) => ({value: ex.id, label: ex.name})));
            });
        }, 500); // задержка 500мс

        // Очистка таймаута при unmount или inputValue изменении
        return () => clearTimeout(debounceTimeout.current);
    }, [inputValue, selectedExecutors]);


    const removeExecutor = (id) => {
        setSelectedExecutors(selectedExecutors.filter((ex) => ex.id !== id));
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
        fetchAndSetProjects("http://gustav.website:8012/api/project/get/list", setProjects);
    }, []);


    const [title, setTitle] = useState(task?.name || "");
    const [description, setDescription] = useState(task?.description || "");
    const handleCreateTask = async () => {
        const taskData = {
            name: title, // поле Name в Go
            description: description ? description : null, // *string, может быть null
            level_priority: (() => {
                switch (priority) {
                    case 'low':
                        return 1;
                    case 'medium':
                        return 2;
                    case 'high':
                        return 3;
                    case 'critical':
                        return 4;
                    default:
                        return 1;
                }
            })(),
            deadline: deadline ? deadline.toISOString() : null, // *time.Time, в ISO формате или null
            project_id: selectedProject ? selectedProject.id : 0, // int, если нет - 0
            executors: selectedExecutors.map(ex => ex.id), // []int
        };

        console.log('Создаётся задача:', taskData);


        try {
            const response = await authFetch('http://gustav.website:8012/api/task/create', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(taskData),
            });

            if (response.ok) {
                // window.location.reload(); // 🔄 Перезагрузка страницы
            } else {
                const errorData = await response.json();
                console.error('Ошибка при создании задачи:', errorData);
            }
        } catch (error) {
            console.error('Сетевая ошибка:', error);
        }
    };
    const handleUpdateTask = async () => {
        const taskData = {
            task_id: task.id,
            name: title ? title : null,
            description: description ? description : null,
            level_priority: (() => {
                switch (priority) {
                    case 'low':
                        return 1;
                    case 'medium':
                        return 2;
                    case 'high':
                        return 3;
                    case 'critical':
                        return 4;
                    default:
                        return 1;
                }
            })(),
            deadline: deadline ? deadline.toISOString() : null,
            project_id: selectedProject ? selectedProject.id : null,
            executors: selectedExecutors.length > 0
                ? selectedExecutors.map((ex) => ex.id)
                : null,
        };

        try {
            const response = await authFetch('http://gustav.website:8012/api/task/update', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(taskData),
            });

            if (response.ok) {
                // window.location.reload();
            } else {
                const errorData = await response.json();
                console.error('Ошибка при обновлении задачи:', errorData);
            }
        } catch (error) {
            console.error('Сетевая ошибка при обновлении задачи:', error);
        }
    };

    const isEditMode = task !== null;
    const isEditAllowed = !task || (user && task && user.id === task.created_id);

    useEffect(() => {
        if (task) {
            setTitle(task.name || "");
            setDescription(task.description || "");

            // Установка исполнителей из task.executors
            if (Array.isArray(task.executors)) {
                const executorsFromTask = task.executors.map(ex => ({
                    id: ex.executor_id,
                    name: ex.executor_name
                }));
                setSelectedExecutors(executorsFromTask);
            }

            // Установка дедлайна
            if (task.deadline) {
                setDeadline(new Date(task.deadline));
            }

            // Установка приоритета из числа
            if (task.priority) {
                const priorityMap = {
                    1: 'low',
                    2: 'medium',
                    3: 'high',
                    4: 'critical'
                };
                setPriority(priorityMap[task.priority] || 'low');
            }

            setSelectedProject({
                id: task.project_id,
                name: task.project_name,
            })
        }
    }, [task]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-task-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>Закрыть</button>
                <p className="modal-title">
                    {isEditMode
                        ? (isEditAllowed ? `Редактирование задачи №${task.id}` : `Просмотр задачи №${task.id}`)
                        : "Новая задача"}
                </p>

                <textarea
                    className="task-title-textarea"
                    placeholder="Введите название задачи"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    readOnly={!isEditAllowed}
                />
                <textarea
                    className="task-description-textarea"
                    placeholder="Введите описание задачи"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    readOnly={!isEditAllowed}
                />

                <div className="task-extra-rectangle">
                    <div className="executor-row">
                        <p className="task-label">Исполнители</p>

                        <div style={{display: "flex", gap: "0.5rem", flexWrap: "wrap"}}>
                            {selectedExecutors.map((executor) => (
                                <div key={executor.id} className="executor-info-box">
                                    {executor.name}
                                    <button
                                        className="executor-remove-button"
                                        onClick={() => removeExecutor(executor.id)}
                                        title="Удалить исполнителя"
                                        disabled={!isEditAllowed}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}

                            <div style={{width: 270, flex: 1}}>
                                <Select
                                    options={options}
                                    onChange={isEditAllowed ? handleSelectChange : undefined}
                                    onInputChange={isEditAllowed ? handleInputChange : undefined}
                                    inputValue={inputValue}
                                    placeholder="Добавить исполнителя"
                                    isSearchable={isEditAllowed}
                                    classNamePrefix="react-select"
                                    isLoading={isLoading}
                                    noOptionsMessage={() =>
                                        inputValue.length < 3
                                            ? 'Введите минимум 3 символа для поиска'
                                            : 'Исполнители не найдены'
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="deadline-row">
                        <p className="task-label">Крайний срок</p>
                        <div className="datepicker-wrapper">
                            <DatePicker
                                selected={deadline}
                                onChange={isEditAllowed ? (date) => setDeadline(date) : undefined}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="Pp"
                                locale={ru}
                                customInput={<DatePickerWithIcon/>}
                                disabled={!isEditAllowed}
                            />
                        </div>
                    </div>
                    <div className="priority-row">
                        <p className="task-label">Приоритет</p>
                        <div className="priority-select-wrapper">
                            <Select
                                classNamePrefix="priority-select"
                                options={[
                                    {value: 'low', label: 'low'},
                                    {value: 'medium', label: 'medium'},
                                    {value: 'high', label: 'high'},
                                    {value: 'critical', label: 'critical'},
                                ]}
                                value={{value: priority, label: capitalize(priority)}}
                                onChange={isEditAllowed ? (selectedOption) => setPriority(selectedOption.value) : undefined}
                                isSearchable={false}
                                theme={(theme) => ({
                                    ...theme,
                                    colors: {
                                        ...theme.colors,
                                        primary: 'transparent', // убираем синий цвет выделения
                                    },
                                })}
                                isDisabled={!isEditAllowed}
                            />
                        </div>
                    </div>
                    <div className="projects-row">
                        <p className="task-label">Проект</p>
                        <div style={{width: '100%', maxWidth: 270}}>
                            <Select
                                classNamePrefix="project-select"
                                options={projects.map((project) => ({
                                    value: project.id,
                                    label: project.name
                                }))}
                                value={
                                    selectedProject
                                        ? {
                                            value: selectedProject.id,
                                            label: selectedProject.name
                                        }
                                        : null
                                }
                                onChange={isEditAllowed ? (selectedOption) => setSelectedProject({
                                    id: selectedOption.value,
                                    name: selectedOption.label
                                }) : undefined}
                                placeholder="Выберите проект"
                                isSearchable
                                noOptionsMessage={() =>
                                    projects.length === 0
                                        ? 'Нет доступных проектов'
                                        : 'Проекты не найдены'
                                }
                                isDisabled={!isEditAllowed}
                            />
                        </div>
                    </div>
                </div>
                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem'}}>
                    <button
                        className="create-task-button"
                        onClick={isEditMode ? handleUpdateTask : handleCreateTask}
                        disabled={!selectedProject}
                        style={{
                            cursor: !selectedProject ? 'not-allowed' : 'pointer',
                            opacity: !selectedProject ? 0.5 : 1,
                        }}
                    >
                        {isEditMode
                            ? (isEditAllowed ? `Редактировать задачу` : `Редактирование запрещено`)
                            : "Создать задачу"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskModalDesktop;