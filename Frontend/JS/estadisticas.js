const API_URL = "http://127.0.0.1:8000";
const ctx = document.getElementById("grafica");
let chart;

// Función principal
async function cargarDatos(tipo) {
    let data;

    // Revisar si ya hay datos guardados en localStorage
    const cache = localStorage.getItem(tipo);
    if (cache) {
        data = JSON.parse(cache);
        console.log("Usando datos desde localStorage");
    } else {
        console.log("Cargando datos desde API...");
        const endpoint = tipo === "popularidad" ? "/artistas" : "/conciertos";
        const res = await fetch(`${API_URL}${endpoint}`);
        const json = await res.json();
        data = tipo === "popularidad" ? json.artistas : json.conciertos;

        // Guardar en localStorage
        localStorage.setItem(tipo, JSON.stringify(data));
    }

    mostrarGrafica(tipo, data);
}

function mostrarGrafica(tipo, data) {
    const labels = tipo === "popularidad"
        ? data.map(a => a.name)
        : data.map(c => c.city);

    const valores = tipo === "popularidad"
        ? data.map(a => a.reproductions)
        : data.map(c => c.attendance);

    const titulo = tipo === "popularidad"
        ? "Popularidad de artistas (reproducciones)"
        : "Asistencia promedio por ciudad";

    // Si ya había un gráfico, destruir para crear uno nuevo
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: titulo,
                data: valores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Al cargar la página
window.onload = () => {
    const selector = document.getElementById("tipoGrafica");
    cargarDatos(selector.value);

    selector.addEventListener("change", (e) => {
        cargarDatos(e.target.value);
    });
};