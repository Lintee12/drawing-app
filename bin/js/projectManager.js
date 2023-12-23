class Project {
    constructor(name, preview, lastSaveDate, canvasSizeX, canvasSizeY, gridSize, content) {
        this.name = name;
        this.preview = preview;
        this.lastSaveDate = lastSaveDate;
        this.canvasSizeX = canvasSizeX;
        this.canvasSizeY = canvasSizeY;
        this.gridSize = gridSize;
        this.content = content;
    }
}

let projects = JSON.parse(localStorage.getItem("projects")) || [];
console.log(projects)
if (!Array.isArray(projects)) {
    projects = [];
}
let currentProject;

function newProject(projectName) {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    currentProject = new Project(projectName, null, formattedDate, defaultCanvas[0], defaultCanvas[1], 16, []);
    projects.push(currentProject);
    localStorage.setItem("projects", JSON.stringify(projects));
}

function saveProjectToStorage(projectName) {
    const foundProjectIndex = projects.findIndex(project => project.name === projectName);
    if (foundProjectIndex !== -1) {
        projects[foundProjectIndex].name = currentProject.name;
        projects[foundProjectIndex].preview = currentProject.preview;
        projects[foundProjectIndex].lastSaveDate = currentProject.lastSaveDate;
        projects[foundProjectIndex].canvasSizeX = currentProject.canvasSizeX;
        projects[foundProjectIndex].canvasSizeY = currentProject.canvasSizeY;
        projects[foundProjectIndex].gridSize = currentProject.gridSize;
        projects[foundProjectIndex].content = currentProject.content;
    }
    localStorage.setItem("projects", JSON.stringify(projects));
}


function loadProjectFromStorage(projectName) {
    projects.forEach(project => {
        if(project.name === projectName) {
            currentProject = project;
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const loadProjects = () => {
        if(window.location.href.includes('index.html')) {
            const container = document.querySelector('.projects-container');
            console.log("loading projects...")
            projects.forEach(project => {
                const element = document.createElement('div');
                const date = document.createElement('span');
                const img = document.createElement('img');
                const name = document.createElement('span');
                element.classList.add('project');
                element.dataset.project = project.name;
                date.classList.add('project-date');
                date.innerText = project.lastSaveDate;
                img.classList.add('project-preview');
                img.alt = 'project image'
                img.src = project.preview;
                img.draggable = false;
                name.classList.add('project-name');
                name.innerText = project.name;
                element.appendChild(date);
                element.appendChild(img);
                element.appendChild(name);
                container.insertBefore(element, container.firstChild);
            });
            if(window.location.href.includes('index.html')) {
                const projectPreviews = document.querySelectorAll('.project');
            
                projectPreviews.forEach(project => {
                    project.addEventListener('click', event => {
                        const foundProjectIndex = projects.findIndex(found => found.name === project.dataset.project);
                        currentProject = projects[foundProjectIndex];
                        console.log(currentProject.name);
                        const encodedInput = encodeURIComponent(currentProject.name);
                        window.location.href = `${appMain}?name=${encodedInput}`;
                    });
                });
            }
        }
    } 

    loadProjects();

    if(window.location.href.includes('index.html')) {
        const projectElements = document.querySelectorAll('.project');

        function deleteProjectFromStorage(projectName, projectElement) {
            const projectIndex = projects.findIndex(project => project.name === projectName);
            
            if (projectIndex !== -1) {
                projects.splice(projectIndex, 1);
                localStorage.setItem("projects", JSON.stringify(projects));
                projectElement.remove();
            }
        }

        function showContextMenu(event, projectName, projectElement) {
            const existingContextMenu = document.querySelector('.context-menu');
            if (existingContextMenu) {
                existingContextMenu.remove();
            }

            event.preventDefault();
            const contextMenu = document.createElement('div');
            contextMenu.classList.add('context-menu');
            contextMenu.innerHTML = '<div class="delete-option tool-section tool-p"><span title="alert" style="width: fit-content; display: flex;" role="alert" id="warning" aria-label="warning"></span>Delete</div>';

            contextMenu.style.top = `${event.clientY}px`;
            contextMenu.style.left = `${event.clientX}px`;

            contextMenu.querySelector('.delete-option').addEventListener('click', () => {
                deleteProjectFromStorage(projectName, projectElement);
                contextMenu.remove();
            });

            //Close the context menu when the mouse leaves it
            contextMenu.addEventListener('mouseleave', () => {
                contextMenu.remove();
            });

            document.body.appendChild(contextMenu);

            const closeContextMenu = () => {
                contextMenu.remove();
                document.removeEventListener('click', closeContextMenu);
            };

            document.addEventListener('click', closeContextMenu, { once: true });
        }

        projectElements.forEach(project => {
            project.addEventListener('contextmenu', event => {
                event.preventDefault();
                const projectName = event.target.closest('.project').dataset.project;
                const clickedProject = event.target.closest('.project');

                showContextMenu(event, projectName, clickedProject);
            });
        });
    }
});