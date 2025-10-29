// administracion.js

const API_URL = "http://127.0.0.1:8000"

// Artistas

// Listado de artistas
async function listarAristas(){
    try {
        const response = await fetch(`${API_URL}/artistas`);
        const artistas = await response.json();
        const tablaArtistas = document.getElementById("tabla-artistas-body");
        tablaArtistas.innerHTML = '';
        artistas.forEach ( artista => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${artista.id}</td>
                <td>${artista.name}</td>
                <td>${artista.top}</td>
                <td>${artista.reproductions}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="abrirModalEditarArtista(${artista.id})">Editar</button>
                    <button class="btn btn-sm btn-primary" onclick="eliminarArtista(${artista.id})">Eliminar</button>
                </td>
            `;
            tablaArtistas.appendChild(fila);    
        });
    }
    catch(error) {
        console.error("Error al listar los artistas: ", error)
    }
}

// Crear artista
async function crearArtista(artista) {
    try {
        const response = await fetch(`${API_URL}/artistas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(artista)
        });
        if (response.ok) {
            listarAristas();
        }
        else {
            console.error("Error al crear el artista");
        }

    }
    catch(error){
        console.error("Error al crear el artista: ", error);
    }
}

// Actualizar artista
async function actualizarArtista(id, artista) {
    try {
        const response = await fetch(`${API_URL}/artistas/${id}`, {
            methor: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(artista)
        });
        if (response.ok){
            listarAristas();
        }
        else {
            console.error("Error al actualizar el artista");
        }
    }
    catch (error) {
        console.error("Error al actualizar el artista: ", error)
    }
}

// Eliminar artista
async function eliminarArtista(id) {
    if (!confirm("¿Está seguro de eliminar este artista?")) return;
    try {
        const response = await fetch(`${API_URL}/artistas/${id}`, {
            method: "DELETE"
        });
        if (response.ok) {
            listarAristas();
        }
        else {
            console.error("Error al eliminar el artista");
        }
    }
    catch (error) {
        console.error("Error al eliminar el artista: ", error);
    }
}

// Conciertos

// Lista de conciertos
async function listarConciertos() {
    const response = await fetch(`${API_URL}/conciertos`);
    const conciertos = await response.json();
    const tablaConciertos = document.getElementById("tabla-conciertos-body");
    tablaConciertos.innerHTML = "";
    conciertos.forEach(concierto => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${concierto.id}</td>
            <td>${concierto.attendance}</td>
            <td>${concierto.city}</td>
            <td>${concierto.date}</td>
            <td>${concierto.id_artist}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="abrirModalEditarConcierto(${concierto.id})">Editar</button>
                <button class="btn btn-sm btn-primary" onclick="eliminarConcierto(${concierto.id})">Eliminar</button>
            </td>
        `;
        tablaConciertos.appendChild(fila);
    });
}

// Crear artista
async function crearConcierto(concierto) {
    try {
        const response = await fetch(`${API_URL}/conciertos`, {
            method: "POST",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(concierto)
        });
        if (response.ok) {
            listarConciertos();
        }
        else {
            console.error("Error al crear el concierto");
        }
    }
    catch (error) {
        console.error("Error al crear el concierto: ", error)
    }
}

// Actualizar artista
async function actualizarConcierto(id, concierto) {
    try {
        const response = await fetch(`${API_URL}/conciertos/${id}`, {
            methor: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(concierto)
        });
        if (response.ok){
            listarConciertos();
        }
        else {
            console.error("Error al actualizar el concierto");
        }
    }
    catch (error) {
        console.error("Error al actualizar el concierto: ", error)
    }
}

// Eliminar concierto
async function eliminarConcierto(id){
    if (!confirm("¿Está seguro de eliminar este concierto?")) return;
    try {
        const response = await fetch(`${API_URL}/conciertos/${id}`, {
            method: "DELETE"
        });
        if (response.ok) {
            listarConciertos();
        }
        else {
            console.error("Error al eliminar el concierto");
        }
    }
    catch (error) {
        console.error("Error al eliminar el concierto: ", error);
    }
}

function abrirModalEditarArtista(id) {
    // Aún está pendiente de implementar
    console.log("Abrir modal editar artista con id: ", id);
}

function abrirModalEditarConcierto(id) {
    // Aún está pendiente de implementar
    console.log("Abrir modal editar concierto con id: ", id);
}

document.addEventListener("DOMContentLoaded", () => {
    listarAristas();
    listarConciertos();
});