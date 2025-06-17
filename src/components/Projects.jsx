import React, {useState} from "react";
import "./styles/Projects.css"
import ProjectModalDesktop from "./ProjectModalDesktop";

const Projects = ({
                      projects = []
                  }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const projectsPerPageList = 16;
    const totalPagesList = Math.max(1, Math.ceil(projects.length / projectsPerPageList));
    const indexOfLastProjectList = currentPage * projectsPerPageList;
    const indexOfFirstProjectList = indexOfLastProjectList - projectsPerPageList;

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


    const sortedProjects = [...projects].sort((a, b) => {
        return a.id - b.id;
    });
    const currentProjectList = sortedProjects.slice(indexOfFirstProjectList, indexOfLastProjectList);


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    return (
        <div className={`project-container`}>
            <h3>Проекты</h3>
            <div className="project-toolbar">
                <button className="action-button" onClick={() => {
                    setSelectedProject(null);
                    setIsModalOpen(true);
                }}>Создать</button>
            </div>
            <div className="project-header">
                <div className="project-header-cell">Название</div>
                <div className="project-header-cell">Описание</div>
                <div className="project-header-cell">Ответственный</div>
            </div>

            {currentProjectList.length > 0 ? (
                currentProjectList.map((project, index) => (
                    <div key={index} className="project-row"  onClick={() => {
                        setSelectedProject(project);
                        setIsModalOpen(true);
                    }}>
                        <div className="project-title">{project.name}</div>
                        <div className="project-description">{project.description}</div>
                        <div className="project-responsible">{project.created_username}</div>
                    </div>
                ))
            ) : (
                <div className="project-empty">Нет проектов</div>
            )}


            <div className="project-footer">
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

            {isModalOpen && (
                <ProjectModalDesktop project={selectedProject} onClose={() => {
                    setIsModalOpen(false);
                    setSelectedProject(null);
                }}/>
            )}
        </div>
    )
}


export default Projects;