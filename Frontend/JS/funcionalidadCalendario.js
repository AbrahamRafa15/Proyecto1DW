// === Config ===
const API_URL = "http://127.0.0.1:8000"; // mismo host
const STORAGE_KEY_SELECTED = "mm_selected_artist";

// === Estado global sencillo ===
let cal;                  // instancia de Calendar.js
let artists = [];         // { id, name, ... }
let concerts = [];        // { id, attendance, city, date, id_artist, ... }

async function fetchArtists() {
    const key = "mm_artistas";
    try {
        const res = await fetch(`${API_URL}/artistas`);
        if (!res.ok) throw new Error("Error al obtener artistas");
        const json = await res.json();
        const data = Array.isArray(json) ? json : (json.artistas || []);
        localStorage.setItem(key, JSON.stringify(data));
        console.log("Artistas cargados desde API y guardados en localStorage");
        return data;
    }
    catch (err) {
        console.warn("Fallo al obtener artistas. Usando localStorage...", err);
        const cached = localStorage.getItem(key);
        return cached ? JSON.parse(cached) : [];
    }
}

async function fetchConcerts() {
    const key = "mm_conciertos";
    try {
        const res = await fetch(`${API_URL}/conciertos`);
        if (!res.ok) throw new Error("Error al obtener conciertos");
        const json = await res.json();
        let data = Array.isArray(json) ? json : (json.conciertos || []);

        data = data.map(c =>{
            if(!c.id_artist && c.artist_name){
                const match = artists.find(a => a.name === c.artist_name);
                if (match) c.id_artist = match.id;
            }
            return c;
        });

        localStorage.setItem(key, JSON.stringify(data));
        console.log("Conciertos cargados desde API y guardados en localStorage");
        return data;
    }
    catch(err) {
        console.warn("Fallo al obtener conciertos. Usando localStorage...", err);
        const cached = localStorage.getItem(key);
        return cached ? JSON.parse(cached) : [];
    }
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

        const artistName = c.artist_name
                ?? (artists.find(x => String(x.id) === String(c.id_artist))?.name)
                ?? `Artista #${c.id_artist ?? "?"}`;

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