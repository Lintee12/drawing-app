const appMain = 'project.html';

const createProject = () => {
    const input = prompt("Please enter a project name...");

    if (input.trim() !== '' && input !== null) {
      const trimmedInput = input.trim();
  
      if (!projects.some(item => item.name === trimmedInput)) {
        newProject(trimmedInput);
        const encodedInput = encodeURIComponent(trimmedInput);
        window.location.href = `${appMain}?name=${encodedInput}`;
      } 
      else {
        console.log('Name is already in use...');
      }
    } 
    else {
      console.log('Invalid name');
    }
};
  