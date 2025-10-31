const API_URL = "http://127.0.0.1:8000";
const ctx = document.getElementById("grafica");
let chart;

// === fetchJson unificado ===
async function fetchJson(url) {
    const res = await fetch(url);
    if (res.ok) return await res.json();
    else if (res.status >= 400 && res.status < 500) throw new Error(`Error cliente ${res.status}`);
    else if (res.status >= 500) throw new Error(`Error servidor ${res.status}`);
    else throw new Error(`Error inesperado ${res.status}`);
}

// Función principal
async function cargarDatos(tipo) {
    let data = [];
    try {
        console.log("Intentando cargar datos desde la API...");
        const endpoint = tipo === "popularidad" ? "/artistas" : "/conciertos";
        const json = await fetchJson(`${API_URL}${endpoint}`);
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
        } else {
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
    } else {
        const agrupado = {};

        data.forEach(c => {
            const ciudad = c.city || "desconocido";
            const artista = c.artist_name || c.id_artist || "desconocido";
            const key = `${ciudad} — ${artista}`;
            if (!agrupado[key]) agrupado[key] = {total:0, count:0};
            agrupado[key].total += c.attendance || 0;
            agrupado[key].count += 1;
        });

        labels = Object.keys(agrupado);
        valores = labels.map(key => Math.round(agrupado[key].total / agrupado[key].count));
        titulo = "Asistencia promedio por ciudad y artista";
    }

    if(chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "bar",
        data: { labels, datasets:[{label:titulo, data:valores, borderWidth:1}] },
        options: { responsive:true, scales:{y:{beginAtZero:true}} }
    });
}

window.onload = () => {
    const selector = document.getElementById("tipoGrafica");
    cargarDatos(selector.value);

    selector.addEventListener("change", (e) => cargarDatos(e.target.value));
};