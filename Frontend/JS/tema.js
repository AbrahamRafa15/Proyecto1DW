const THEME_KEY = 'bs-theme'; 
const htmlElement = document.documentElement;


// Carga el tema guardado en localStorage al iniciar la página.
 
function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        htmlElement.setAttribute('data-bs-theme', savedTheme);
    }
}


//  Alterna el tema entre 'light' y 'dark' y lo guarda en localStorage.
 
function toggleDarkMode() {
    const currentTheme = htmlElement.getAttribute('data-bs-theme');
    let newTheme;

    if (currentTheme === 'light') {
        newTheme = 'dark';
    } else {
        newTheme = 'light';
}
    htmlElement.setAttribute('data-bs-theme', newTheme);
    
    localStorage.setItem(THEME_KEY, newTheme);
}
loadTheme();