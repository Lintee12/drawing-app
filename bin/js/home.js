const appMain = 'project.html';

const createProject = () => {
    const input = prompt("Please enter a project name...");

    if (input !== '' && input !== ' ') {
        newProject(input);
        const encodedInput = encodeURIComponent(input);
        window.location.href = `${appMain}?name=${encodedInput}`;
    }
    else {
        console.log('invalid name')
    }
}