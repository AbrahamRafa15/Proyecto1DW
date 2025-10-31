
const API_URL = "http://127.0.0.1:8000"; // mismo host
const STORAGE_KEY_SELECTED = "mm_selected_artist";

let cal;                  // instancia de Calendar.js
let artists = [];         //  id, name
let concerts = [];        //  id, attendance, city, date, id_artist


// Fetch con manejo 2xx / 4xx / 5xx
async function fetchJsonWithStatus(url, options = {}) {
    try {
        const res = await fetch(url, options);

        // --- Manejo de 2xx (éxito) ---
        if (res.ok) {
            const ct = res.headers.get("content-type") || "";
            if (ct.includes("application/json")) {
                return await res.json();
            } else {
                console.warn("Respuesta sin JSON:", url);
                return null;
            }
        }

        // --- Manejo de 4xx / 5xx (error HTTP) ---
        const errorText = await res.text();
        console.error(`Error HTTP ${res.status} (${res.statusText}): ${errorText}`);
        throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
    } catch (err) {
        console.error("Error de red o parseo:", err);
        throw err;
    }
}

//  Calendario

function mountCalendarWith(options = {}) {
    const mount = document.getElementById("calendar");
    // Reset completo (evita duplicados)
    mount.innerHTML = "";
    cal = new calendarJs("calendar");
    cal.setOptions({
        viewToOpenOnFirstLoad: "full-month",
        useLocalStorageForEvents: false,
        manualEditingEnabled: false,
        dragAndDropForEventsEnabled: false,
        ...options, // mantiene compatibilidad
    });
}


//  Carga de datos con manejo de errores HTTP

async function fetchArtists() {
    const key = "mm_artistas";
    try {
        const json = await fetchJsonWithStatus(`${API_URL}/artistas`);
        const data = Array.isArray(json) ? json : (json.artistas || []);
        localStorage.setItem(key, JSON.stringify(data));
        console.log("Artistas cargados desde API y guardados en localStorage");
        return data;
    } catch (err) {
        console.warn("Fallo al obtener artistas. Usando localStorage...", err);
        const cached = localStorage.getItem(key);
        return cached ? JSON.parse(cached) : [];
    }
}

async function fetchConcerts() {
    const key = "mm_conciertos";
    try {
        const json = await fetchJsonWithStatus(`${API_URL}/conciertos`);
        let data = Array.isArray(json) ? json : (json.conciertos || []);

        // Resolver id_artist si solo viene artist_name
        data = data.map(c => {
            if (!c.id_artist && c.artist_name) {
                const match = artists.find(a => a.name === c.artist_name);
                if (match) c.id_artist = match.id;
            }
            return c;
        });

        localStorage.setItem(key, JSON.stringify(data));
        console.log("Conciertos cargados desde API y guardados en localStorage");
        return data;
    } catch (err) {
        console.warn("Fallo al obtener conciertos. Usando localStorage...", err);
        const cached = localStorage.getItem(key);
        return cached ? JSON.parse(cached) : [];
    }
}


//  Calendar.js

function ensureCalendar() {
    if (!cal) {
        cal = new calendarJs("calendar");
        cal.setOptions({
            viewToOpenOnFirstLoad: "full-month",
            useLocalStorageForEvents: false,
            manualEditingEnabled: false,
            dragAndDropForEventsEnabled: false
        });
    }
}

// Mapeo de conciertos - eventos del calendario

function mapConcertsToEvents(concertList, selectedArtistId = "all") {
    const now = new Date();
    return concertList
        .filter(c => {
            const d = new Date(c.date);
            if (Number.isNaN(d.getTime())) return false;

            const isFuture = d >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const matchesArtist =
                (selectedArtistId === "all") || (String(c.id_artist) === String(selectedArtistId));
            return isFuture && matchesArtist;
        })
        .map(c => {
            const start = new Date(c.date);
            const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 horas por defecto

            const artistName =
                c.artist_name ??
                (artists.find(x => String(x.id) === String(c.id_artist))?.name) ??
                `Artista #${c.id_artist ?? "?"}`;

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

// Calendario sin duplicados
function renderCalendar(selectedArtistId = "all") {
    const events = mapConcertsToEvents(concerts, selectedArtistId);
    mountCalendarWith({ data: events });
}

//  Dropdown de artistas

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

    // Re-render + persistir
    sel.addEventListener("change", (e) => {
        const val = e.target.value;
        localStorage.setItem(STORAGE_KEY_SELECTED, val);
        renderCalendar(val);
    });
}

//  Inicialización

(async function init() {
    try {
        [artists, concerts] = await Promise.all([fetchArtists(), fetchConcerts()]);
        populateArtistDropdown();

        const selected = localStorage.getItem(STORAGE_KEY_SELECTED) || "all";
        renderCalendar(selected);

        console.log("Calendario inicializado correctamente.");
    } catch (err) {
        console.error("Error inicializando calendario:", err);
        alert("Error al inicializar el calendario. Revisa la API o la conexión.");
    }
})();