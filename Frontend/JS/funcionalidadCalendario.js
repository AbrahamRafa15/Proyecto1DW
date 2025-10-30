// === Config ===
const API_URL = "http://127.0.0.1:8000"; // mismo host
const STORAGE_KEY_SELECTED = "mm_selected_artist";

// === Estado global sencillo ===
let cal;                  // instancia de Calendar.js
let artists = [];         // { id, name, ... }
let concerts = [];        // { id, attendance, city, date, id_artist, ... }

async function fetchArtists() {
    const res = await fetch(`${API_URL}/artistas`);
    const json = await res.json();

    return Array.isArray(json) ? json : (json.artistas || []);
}

async function fetchConcerts() {
    const res = await fetch(`${API_URL}/conciertos`);
    const json = await res.json();
    return Array.isArray(json) ? json : (json.conciertos || []);
}

// ====== Calendar.js ======
function ensureCalendar() {
    if (!cal) {
        cal = new calendarJs("calendar");
        cal.setOptions({
        viewToOpenOnFirstLoad: "full-month",
        useLocalStorageForEvents: false,
        // atajos “UX” cómodos sin recargar
        manualEditingEnabled: false,
        dragAndDropForEventsEnabled: false
        });
    }
}

// Mapear conciertos 
function mapConcertsToEvents(concertList, selectedArtistId = "all") {
    const now = new Date();
    return concertList
        .filter(c => {
        // parse de fecha robusto (YYYY-MM-DD o ISO)
        const d = new Date(c.date);
        if (Number.isNaN(d.getTime())) return false;

        const isFuture = d >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const matchesArtist = (selectedArtistId === "all") || (String(c.id_artist) === String(selectedArtistId));
        return isFuture && matchesArtist;
        })
        .map(c => {
        const start = new Date(c.date);
        // duración por defecto 2h si no hay hora-fin
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

        // Encontrar nombre de artista 
        const a = artists.find(x => String(x.id) === String(c.id_artist));
        const artistName = a ? a.name : `Artista #${c.id_artist}`;

        return {
            from: start,
            to: end,
            title: `${artistName} — ${c.city}`,
            description: `Asistencia estimada: ${c.attendance ?? "N/D"}`,
            location: c.city || "",
            color: "#0d6efd"
        };
        });
}

// Actualizar/Render calendario
function renderCalendar(selectedArtistId = "all") {
    ensureCalendar();
    const events = mapConcertsToEvents(concerts, selectedArtistId);

    // Calendar.js permite setear el dataset completo
    cal.setOptions({ data: events });
    }

    // Dropdown de artistas
    function populateArtistDropdown() {
    const sel = document.getElementById("artistFilter");
    sel.innerHTML = '<option value="all">Todos</option>';

    artists
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(a => {
        const opt = document.createElement("option");
        opt.value = a.id;
        opt.textContent = `#${a.id} — ${a.name}`;
        sel.appendChild(opt);
        });

  // Restaurar la selección
    const saved = localStorage.getItem(STORAGE_KEY_SELECTED) || "all";
    if ([...sel.options].some(o => o.value === saved)) {
        sel.value = saved;
    }

    // Cambio -> re-render + persistir
    sel.addEventListener("change", (e) => {
        const val = e.target.value;
        localStorage.setItem(STORAGE_KEY_SELECTED, val);
        renderCalendar(val);
    });
}

// Bootstrap
(async function init() {
    try {
        // 1) Cargar
        [artists, concerts] = await Promise.all([fetchArtists(), fetchConcerts()]);

        // 2) Filtro
        populateArtistDropdown();

        // 3) Selección guardada o all
        const selected = localStorage.getItem(STORAGE_KEY_SELECTED) || "all";
        renderCalendar(selected);
    } catch (err) {
        console.error("Error inicializando calendario:", err);
    }
})();