import Select from 'react-select';
import {useState, useEffect, useRef} from 'react';
import {useAuth} from "../context/AuthContext";
import "./styles/Projects.css"


const ProjectModalDesktop = ({project, onClose}) => {
    const [selectedProjectUsers, setSelectedProjectUsers] = useState([]);
    const [options, setOptions] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {authFetch, user} = useAuth();
    const [activeTab, setActiveTab] = useState('info');


    const debounceTimeout = useRef(null);

    const fetchProjectUsers = async (query) => {
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
            const projectUserId = selectedOption.value;
            if (!selectedProjectUsers.find((ex) => ex.id === projectUserId)) {
                setSelectedProjectUsers([...selectedProjectUsers, {id: projectUserId, name: selectedOption.label}]);
            }
            setInputValue('');
        }
    };
    useEffect(() => {
        if (inputValue.length < 3) {
            setOptions([]);
            return;
        }

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            fetchProjectUsers(inputValue).then((projectUsers) => {
                const list = Array.isArray(projectUsers) ? projectUsers : [];

                const filteredProjectUsers = list.filter(
                    (ex) => !selectedProjectUsers.find((sel) => sel.id === ex.id)
                );

                setOptions(filteredProjectUsers.map((ex) => ({value: ex.id, label: ex.name})));
            });
        }, 500);

        return () => clearTimeout(debounceTimeout.current);
    }, [inputValue, selectedProjectUsers]);


    const removeProjectUsers = (id) => {
        setSelectedProjectUsers(selectedProjectUsers.filter((ex) => ex.id !== id));
    };


    const [title, setTitle] = useState(project?.name || "");
    const [description, setDescription] = useState(project?.description || "");
    const handleCreateProject = async () => {
        const taskData = {
            name: title,
            description: description ? description : null,
            project_users: selectedProjectUsers.map(ex => ex.id),
        };

        console.log('Создаётся задача:', taskData);


        try {
            const response = await authFetch('http://gustav.website:8012/api/task/create', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(taskData),
            });

            if (response.ok) {
                window.location.reload();
            } else {
                const errorData = await response.json();
                console.error('Ошибка при создании задачи:', errorData);
            }
        } catch (error) {
            console.error('Сетевая ошибка:', error);
        }
    };

    const handleUpdateProject = async () => {
        const projectData = {
            project_id: project.id,
            name: title,
            description: description ? description : null,
            project_users: selectedProjectUsers.map(ex => ex.id),
        };

        try {
            const response = await authFetch(`http://gustav.website:8012/api/project/update`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(projectData),
            });

            if (response.ok) {
                window.location.reload();
            } else {
                const errorData = await response.json();
                console.error('Ошибка при обновлении проекта:', errorData);
            }
        } catch (error) {
            console.error('Сетевая ошибка:', error);
        }
    };

    const isEditMode = project !== null;
    const isEditAllowed = !project || (user && project && user.id === project.created_id);

    useEffect(() => {
        if (project) {
            setTitle(project.name || "");
            setDescription(project.description || "");

            if (Array.isArray(project.project_users)) {
                const usersFromProject = project.project_users.map(ex => ({
                    id: ex.user_id,
                    name: ex.user_name
                }));
                setSelectedProjectUsers(usersFromProject);
            }
        }
    }, [project]);


    const initialItems = [];
    const [items, setItems] = useState(initialItems);
    const [openItems, setOpenItems] = useState({});
    const [editedDetails, setEditedDetails] = useState({});
    const [editedTitles, setEditedTitles] = useState({});


    const toggleItem = (id) => {
        setOpenItems((prev) => ({...prev, [id]: !prev[id]}));

        // setEditedTitles((prev) => ({...prev, [id]: items.find(i => i.id === id)?.details || ''}));
        // setEditedDetails((prev) => ({...prev, [id]: items.find(i => i.id === id)?.details || ''}));
    };


    const handleDetailChange = (id, value) => {
        setEditedDetails((prev) => ({...prev, [id]: value}));
    };
    const handleTitleChange = (id, newTitle) => {
        setEditedTitles((prev) => ({...prev, [id]: newTitle}));
    };

    const handleSave = async (id) => {
        const newTitle = editedTitles[id];
        const newDetails = editedDetails[id];

        // Получаем item по id, чтобы проверить наличие listID
        const item = items.find(item => item.id === id);
        if (!item) return; // на всякий случай

        const isNew = item.isNew;

        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        title: newTitle !== undefined ? newTitle : item.title,
                        details: newDetails !== undefined ? newDetails : item.details,
                        isNew: false,
                    }
                    : item
            )
        );

        const projectId = project.id;

        const payload = {
            project_id: projectId,
            list_id: item.id,
            key: newTitle,
            value: newDetails,
        };

        // Определяем URL и метод
        const url = isNew
            ? "http://gustav.website:8012/api/lists/create"
            : "http://gustav.website:8012/api/lists/update";

        console.log(item);

        try {
            const response = await authFetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Ошибка при сохранении на бэкенде");
            }

            console.log(`Задача ${id} успешно сохранена:`, payload);
        } catch (error) {
            console.error("Ошибка при сохранении задачи:", error);
        }
    };

    useEffect(() => {
        if (!project?.id) return;

        const fetchProjectLists = async () => {
            try {
                const response = await authFetch(`http://gustav.website:8012/api/lists/get/project/${project.id}`);
                if (!response.ok) throw new Error("Ошибка загрузки списков");

                const data = await response.json();

                // Преобразуем в нужный формат
                const formatted = data.map((item, index) => ({
                    id: item.id || index + 1,
                    title: item.key,
                    details: item.value,
                }));

                setItems(formatted);
            } catch (error) {
                console.error("Ошибка загрузки списков проекта:", error);
            }
        };

        fetchProjectLists();
    }, [project]);

    const handleAddItem = () => {
        const newId = Date.now(); // простой уникальный ID
        const newItem = {id: newId, title: '', details: '', isNew: true};
        setItems(prev => [...prev, newItem]);
        setOpenItems(prev => ({...prev, [newId]: true}));
        setEditedTitles(prev => ({...prev, [newId]: ''}));
        setEditedDetails(prev => ({...prev, [newId]: ''}));
    };

    const handleDelete = async (id) => {
        const item = items.find((i) => i.id === id);

        // Если у item есть id от сервера, отправляем запрос на удаление
        const isPersisted = typeof id === 'number' && id < 1e12; // предполагаем, что id с сервера меньше чем Date.now()

        if (isPersisted) {
            try {
                const response = await authFetch(`http://gustav.website:8012/api/lists/delete/${id}`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    console.error('Ошибка при удалении записи на сервере');
                    return;
                }

                console.log(`Запись ${id} удалена с сервера`);
            } catch (error) {
                console.error('Сетевая ошибка при удалении записи:', error);
                return;
            }
        }

        // Удаляем локально
        setItems((prev) => prev.filter((i) => i.id !== id));
        setEditedTitles((prev) => {
            const next = {...prev};
            delete next[id];
            return next;
        });
        setEditedDetails((prev) => {
            const next = {...prev};
            delete next[id];
            return next;
        });
        setOpenItems((prev) => {
            const next = {...prev};
            delete next[id];
            return next;
        });
    };

    return (


        <div className="modal-overlay-project" onClick={onClose}>
            <div className="modal-project-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button-project" onClick={onClose}>Закрыть</button>
                <p className="modal-title-project">

                    {isEditMode
                        ? (isEditAllowed ? `Редактирование проекта №${project.id}` : `Просмотр проекта №${project.id}`)
                        : "Новый проект"}
                </p>
                <div className="tab-buttons-project">
                    <button onClick={() => setActiveTab('info')}
                            className={activeTab === 'info' ? 'active-tab-project' : ''}>
                        Информация
                    </button>
                    <button onClick={() => setActiveTab('informationLists')}
                            className={activeTab === 'informationLists' ? 'active-tab-project' : ''}>
                        Записи
                    </button>
                </div>
                {activeTab === 'info' && (
                    <>
                        <textarea
                            className="project-title-textarea"
                            placeholder="Введите название проекта"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            readOnly={!isEditAllowed}
                        />
                        <textarea
                            className="project-description-textarea"
                            placeholder="Введите описание проекта"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            readOnly={!isEditAllowed}
                        />

                        <div className="project-extra-rectangle">
                            <div className="users-row">
                                <p className="project-label">Пользователи проекта</p>

                                <div style={{display: "flex", gap: "0.5rem", flexWrap: "wrap"}}>
                                    {selectedProjectUsers.map((projectUser) => (
                                        <div key={projectUser.id} className="users-info-box">
                                            {projectUser.name}
                                            <button
                                                className="user-remove-button"
                                                onClick={() => removeProjectUsers(projectUser.id)}
                                                title="Удалить пользователя"
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
                                            placeholder="Добавить пользователя"
                                            isSearchable={isEditAllowed}
                                            classNamePrefix="react-select"
                                            isLoading={isLoading}
                                            noOptionsMessage={() =>
                                                inputValue.length < 3
                                                    ? 'Введите минимум 3 символа для поиска'
                                                    : 'Пользователи не найдены'
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem'}}>
                            <button
                                className="create-project-button"
                                onClick={isEditMode ? handleUpdateProject : handleCreateProject}
                            >
                                {isEditMode ? 'Сохранить изменения' : 'Создать проект'}
                            </button>
                        </div>
                    </>
                )}
                {activeTab === 'informationLists' && (
                    <div className="project-extra-rectangle" style={{minHeight: 760}}>
                        <button className="add-item-button" onClick={handleAddItem}>Добавить запись</button>
                        {items.map((item) => (
                            <div key={item.id} className="list-item-container">
                                <div className="list-row">
        <textarea
            className="title-list"
            placeholder="Заголовок"
            value={editedTitles[item.id] ?? item.title}
            onChange={(e) => handleTitleChange(item.id, e.target.value)}
        />
                                </div>

                                {openItems[item.id] && (
                                    <div className="expanded-info">
          <textarea
              className="value-list"
              placeholder="Описание"
              value={editedDetails[item.id] ?? item.details}
              onChange={(e) => handleDetailChange(item.id, e.target.value)}
          />
                                    </div>
                                )}

                                <div className="buttons-row">
                                    <button className="toggle-button" onClick={() => toggleItem(item.id)}>
                                        {openItems[item.id] ? 'Свернуть' : 'Развернуть'}
                                    </button>
                                    <button className="delete-button" onClick={() => handleDelete(item.id)}>Удалить
                                    </button>
                                    {openItems[item.id] && (
                                        <button className="save-button"
                                                onClick={() => handleSave(item.id)}>Сохранить</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectModalDesktop;