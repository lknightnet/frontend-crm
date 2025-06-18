import "./styles/Searcher.css"
import {useAuth} from "../context/AuthContext";
import React, {useState, useEffect} from "react";
import ProjectModalDesktop from "./ProjectModalDesktop";
import TaskModalDesktop from "./TaskModalDesktop";


const Searcher = ({project =[], task = []}) => {
    // const {authFetch} = useAuth();

    // const fetchUsers = async (query) => {
    //     try {
    //         const response = await authFetch('http://gustav.website:8010/api/user/get/like', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({username: query}),
    //         });
    //
    //         if (!response.ok) {
    //             return [];
    //             // throw new Error('Ошибка загрузки исполнителей');
    //         }
    //
    //         const data = await response.json();
    //         return data;
    //     } catch (error) {
    //         console.error(error);
    //         return [];
    //     } finally {
    //     }
    // }

    const [query, setQuery] = useState("");
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);

    useEffect(() => {
        if (query.length >= 3) {
            const lowerQuery = query.toLowerCase();

            const filteredProj = project.filter(p =>
                p.name.toLowerCase().includes(lowerQuery)
            );

            const filteredTsk = task.filter(t =>
                t.name.toLowerCase().includes(lowerQuery)
            );

            setFilteredProjects(filteredProj);
            setFilteredTasks(filteredTsk);
        } else {
            setFilteredProjects([]);
            setFilteredTasks([]);
        }
    }, [query, project, task]);

    const [isModalProjectOpen, setIsModalProjectOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const [isModalTaskOpen, setIsModalTaskOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    return (
        <div>
            <input
                className="search-input"
                type="text"
                placeholder="Поиск"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            {(filteredProjects.length > 0 || filteredTasks.length > 0) && (
                <div className="search-results">
                    {filteredProjects.map(p => (
                        <div key={`project-${p.id}`} className="search-item" onClick={() => {
                            setSelectedProject(p);
                            setIsModalProjectOpen(true);
                        }}>
                            📁 {p.name}
                        </div>
                    ))}
                    {filteredTasks.map(t => (
                        <div key={`task-${t.id}`} className="search-item"  onClick={() => {
                            setSelectedTask(t);
                            setIsModalTaskOpen(true);
                        }}>
                            ✅ {t.name}
                        </div>
                    ))}
                </div>
            )}

            {isModalProjectOpen && (
                <ProjectModalDesktop project={selectedProject} onClose={() => {
                    setIsModalProjectOpen(false);
                    setSelectedProject(null);
                }}/>
            )}

            {isModalTaskOpen && (
                <TaskModalDesktop task={selectedTask} onClose={() => {
                    setIsModalTaskOpen(false);
                    setSelectedTask(null);
                }}/>
            )}
        </div>
    );
};

export default Searcher;