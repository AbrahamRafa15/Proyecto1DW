// administracion.js (versión corregida)
// Conventions: API_URL, manejo de errores, selectores consistentes

const API_URL = "http://127.0.0.1:8000";

//
// Helper: hace fetch y devuelve JSON si OK, o lanza error.
//
async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        const msg = text || `HTTP ${res.status}`;
        throw new Error(`Fetch error: ${msg}`);
    }
    // intentar parsear JSON, si no hay cuerpo retorna null
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return res.json();
    return null;
}

//
// --- ARTISTAS
//
async function listarArtistas() {
    try {
        const tbody = document.querySelector("#tablaArtistas tbody");
        tbody.innerHTML = "";

        let artistas = [];

        try {
            const data = await fetchJson(`${API_URL}/artistas`);
            artistas = (data && data.artistas) ? data.artistas : [];
            localStorage.setItem("artistas", JSON.stringify(artistas));
        }
        catch(err) {
            console.error("listarArtistas: ", err);
            showAlert("No se pudieron cargar datos desde la API. Usando datos locales.", "warning");
            artistas = JSON.parse(localStorage.getItem("artistas")) || [];
        }

        // Backend responde { artistas: [...], count: N }
        artistas.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${a.id}</td>
            <td>${a.name ?? a.nombre ?? ""}</td>
            <td>${a.top ?? ""}</td>
            <td>${a.reproductions ?? ""}</td>
            <td>
            <button class="btn btn-sm btn-primary" onclick="abrirModalEditarArtista(${a.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarArtista(${a.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("listarArtistas:", err);
        // mostrar alerta simple al usuario
        showAlert("No se pudieron cargar artistas. Revisa la API.", "danger");
    }
}

async function crearArtista(artista) {
    try {
        await fetchJson(`${API_URL}/artistas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artista)
        });
        await listarArtistas();
        showAlert("Artista creado.", "success");
    } catch (err) {
        console.error("crearArtista:", err);
        showAlert("Error al crear artista.", "danger");
    }
}

async function actualizarArtista(id, artista) {
    try {
        await fetchJson(`${API_URL}/artistas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artista)
        });
        await listarArtistas();
        showAlert("Artista actualizado.", "success");
    } catch (err) {
        console.error("actualizarArtista:", err);
        showAlert("Error al actualizar artista.", "danger");
    }
}

async function eliminarArtista(id) {
    if (!confirm("¿Seguro que deseas eliminar este artista?")) return;
    try {
        await fetchJson(`${API_URL}/artistas/${id}`, { method: "DELETE" });
        await listarArtistas();
        showAlert("Artista eliminado.", "warning");
    } catch (err) {
        console.error("eliminarArtista:", err);
        showAlert("Error al eliminar artista.", "danger");
    }
}

//
// --- CONCIERTOS
//
async function listarConciertos() {
    try {
        const tbody = document.querySelector("#tablaConciertos tbody");

        tbody.innerHTML = "";

        let conciertos = []

        try {
            const data = await fetchJson(`${API_URL}/conciertos`);
            conciertos = (data && data.conciertos) ? data.conciertos : [];
            localStorage.setItem("conciertos", JSON.stringify(conciertos));
        }
        catch(err) {
            console.error("listarConciertos: ", err);
            showAlert("No se pudieron cargar conciertos desde la API. Usando datos locales.", "warning");
            conciertos = JSON.parse(localStorage.getItem("conciertos")) || [];
        }
        
        conciertos.forEach(c => {
            const fecha = c.date ?? c.fecha ?? "";
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${c.id}</td>
                <td>${c.artist_name ?? ""}</td>
                <td>${fecha ? new Date(fecha).toLocaleDateString() : ""}</td>
                <td>${c.city ?? c.lugar ?? ""}</td>
                <td>${c.attendance ?? ""}</td>
                <td>
                <button class="btn btn-sm btn-primary" onclick="abrirModalEditarConcierto(${c.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="eliminarConcierto(${c.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("listarConciertos:", err);
        showAlert("No se pudieron cargar conciertos. Revisa la API.", "danger");
    }
}

async function crearConcierto(concierto) {
    try {
        await fetchJson(`${API_URL}/conciertos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(concierto)
        });
        await listarConciertos();
        showAlert("Concierto creado.", "success");
    } catch (err) {
        console.error("crearConcierto:", err);
        showAlert("Error al crear concierto.", "danger");
    }
    }

    async function actualizarConcierto(id, concierto) {
    try {
        await fetchJson(`${API_URL}/conciertos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(concierto)
        });
        await listarConciertos();
        showAlert("Concierto actualizado.", "success");
    } catch (err) {
        console.error("actualizarConcierto:", err);
        showAlert("Error al actualizar concierto.", "danger");
    }
}

async function eliminarConcierto(id) {
    if (!confirm("¿Seguro que deseas eliminar este concierto?")) return;
    try {
        await fetchJson(`${API_URL}/conciertos/${id}`, { method: "DELETE" });
        await listarConciertos();
        showAlert("Concierto eliminado.", "warning");
    } catch (err) {
        console.error("eliminarConcierto:", err);
        showAlert("Error al eliminar concierto.", "danger");
    }
}

//
// --- FUNCIONES NUEVAS: cargarSelectArtistas
//
async function cargarSelectArtistas() {
    try {
        const data = await fetchJson(`${API_URL}/artistas`);
        const artistas = (data && data.artistas) ? data.artistas : [];
        const selectCrear = document.getElementById("crearConciertoIdArtist");
        const selectActualizar = document.getElementById("actualizarConciertoArtistId");
        if (selectCrear) {
            selectCrear.innerHTML = "";
            artistas.forEach(a => {
                const option = document.createElement("option");
                option.value = a.id;
                option.textContent = a.name ?? a.nombre ?? "";
                selectCrear.appendChild(option);
            });
        }
        if (selectActualizar) {
            selectActualizar.innerHTML = "";
            artistas.forEach(a => {
                const option = document.createElement("option");
                option.value = a.id;
                option.textContent = a.name ?? a.nombre ?? "";
                selectActualizar.appendChild(option);
            });
        }
    } catch (err) {
        console.error("cargarSelectArtistas:", err);
        showAlert("No se pudieron cargar artistas para los selects.", "danger");
    }
}

//
// --- MODALES: abrir + rellenar
//
async function abrirModalEditarArtista(id) {
    try {
        const data = await fetchJson(`${API_URL}/artistas/${id}`);
        const artista = data && data.artista ? data.artista : data;

        // Asigna los valores correctos según tu tabla
        document.getElementById("idArtistaActualizar").value = artista.id;
        document.getElementById("nombreArtistaActualizar").value = artista.name ?? "";
        document.getElementById("topArtistaActualizar").value = artista.top ?? 0;
        document.getElementById("reproduccionesArtistaActualizar").value = artista.reproductions ?? 0;

        // Mostrar el modal con Bootstrap
        const modalEl = document.getElementById("modalActualizarArtista");
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } catch (err) {
        console.error("abrirModalEditarArtista:", err);
        showAlert("No se pudo cargar el artista.", "danger");
    }
}

async function abrirModalEditarConcierto(id) {
    try {
        const data = await fetchJson(`${API_URL}/conciertos/${id}`);
        const concierto = data && data.concierto ? data.concierto : data;
        document.getElementById("actualizarConciertoId").value = concierto.id;
        document.getElementById("actualizarConciertoAttendance").value = concierto.attendance ?? "";
        document.getElementById("actualizarConciertoCity").value = concierto.city ?? concierto.lugar ?? "";
        document.getElementById("actualizarConciertoDate").value = concierto.date ?? concierto.fecha ?? "";
        document.getElementById("actualizarConciertoArtistId").value = concierto.id_artist ?? "";
        const modalEl = document.getElementById("modalActualizarConcierto");
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } catch (err) {
        console.error("abrirModalEditarConcierto:", err);
        showAlert("No se pudo cargar el concierto.", "danger");
    }
}

//
// --- UTILIDADES (alert simple)
//
function showAlert(message, type = "info") {
    // Busca un contenedor de alerts; si no existe, cae en console
    const container = document.querySelector(".alerts-container");
    if (!container) {
        console.log(`[${type}] ${message}`);
        return;
    }
    const el = document.createElement("div");
    el.className = `alert alert-${type} my-2`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

//
// Inicialización al cargar DOM
//
document.addEventListener("DOMContentLoaded", () => {
    cargarSelectArtistas();
    listarArtistas();
    listarConciertos();

    const formCrearArtista = document.getElementById("formCrearArtista");
    if (formCrearArtista) {
        formCrearArtista.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("nombreArtista").value.trim();
            const top = parseInt(document.getElementById("topArtista").value || "0", 10);
            const reproductions = parseInt(document.getElementById("reproduccionesArtista").value || "0", 10);
            await crearArtista({ name, top, reproductions });
            const modalEl = document.getElementById("modalCrearArtista");
            bootstrap.Modal.getInstance(modalEl).hide();
            formCrearArtista.reset();
        });
    }

    const formCrearConcierto = document.getElementById("formCrearConcierto");
    if (formCrearConcierto) {
        formCrearConcierto.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id_artist = document.getElementById("crearConciertoIdArtist").value;
            const attendance = parseInt(document.getElementById("crearConciertoAttendance").value || "0", 10);
            const city = document.getElementById("crearConciertoCity").value.trim();
            const date = document.getElementById("crearConciertoDate").value;
            await crearConcierto({ id_artist, attendance, city, date });
            const modalEl = document.getElementById("modalCrearConcierto");
            bootstrap.Modal.getInstance(modalEl).hide();
            formCrearConcierto.reset();
        });
    }

    const formActualizarConcierto = document.getElementById("formActualizarConcierto");
    if (formActualizarConcierto) {
        formActualizarConcierto.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("actualizarConciertoId").value;
            const id_artist = document.getElementById("actualizarConciertoArtistId").value;
            const attendance = parseInt(document.getElementById("actualizarConciertoAttendance").value || "0", 10);
            const city = document.getElementById("actualizarConciertoCity").value.trim();
            const date = document.getElementById("actualizarConciertoDate").value;
            await actualizarConcierto(id, { id_artist, attendance, city, date });
            const modalEl = document.getElementById("modalActualizarConcierto");
            bootstrap.Modal.getInstance(modalEl).hide();
            formActualizarConcierto.reset();
        });
    }
});