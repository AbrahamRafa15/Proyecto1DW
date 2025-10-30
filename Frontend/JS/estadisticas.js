const API_URL = "http://127.0.0.1:8000";
const ctx = document.getElementById("grafica");
let chart;

// Función principal
async function cargarDatos(tipo) {
    let data = [];

    try {
        console.log("Intentando cargar datos desde la API...");
        const endpoint = tipo === "popularidad" ? "/artistas" : "/conciertos";
        const res = await fetch(`${API_URL}${endpoint}`);
        if(!res.ok) throw new Error(`Error al cargar ${endpoint}: ${res.status}`);
        const json = await res.json();
        
        data = tipo === "popularidad" ? json.artistas : json.conciertos;

        localStorage.setItem(tipo, JSON.stringify(data));
        console.log(`Datos de ${tipo} guardados en localStorage`);
    }
    catch (error) {
        console.warn("No se pudo acceder a la API. Usando localStorage...", error);
        const cache = localStorage.getItem(tipo);
        if (cache) {
            data = JSON.parse(cache);
            console.log("Datos cargados desde el localStorage.");
        }
        else {
            console.log(`No hay datos locales para ${tipo}.`);
        }
    }

    mostrarGrafica(tipo, data);
}

function mostrarGrafica(tipo, data) {
    let labels, valores, titulo;

    if(tipo === "popularidad") {
        labels = data.map(a => a.name);
        valores = data.map(a => a.reproductions);
        titulo = "Popularidad de artistas (reproducciones)";
    }
    else {
        const agrupado = {};

        data.forEach(c => {
            const ciudad = c.city || "desconocido";
            if (!agrupado[ciudad]) {
                agrupado[ciudad] = {total: 0, count: 0};
            }
            agrupado[ciudad].total += c.attendance || 0;
            agrupado[ciudad].count += 1;
        });

        labels = Object.keys(agrupado);
        valores = labels.map(ciudad => Math.round(agrupado[ciudad].total / agrupado[ciudad].count));

        titulo = "Asistencia promedio por ciudad";
    }

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