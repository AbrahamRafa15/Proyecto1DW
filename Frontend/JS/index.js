const API_URL = "http://127.0.0.1:8000";

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

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("artistCards");
  if (!container) return;

  container.innerHTML = "<p class='text-muted'>Cargando artistas…</p>";
  try {
    const artists = await fetchArtists();
    if (!artists.length) {
      container.innerHTML = "<p class='text-muted'>No hay artistas disponibles.</p>";
      return;
    }
    container.innerHTML = artists.map(({ id, name, top, reproductions }) => `
    <div class="col d-flex justify-content-center">
        <div class="card shadow-sm" style="width: 18rem;">
        <div class="card-body">
            <h5 class="card-title">${name}</h5>
            <p class="card-text">Top: ${top}</p>
            <p class="card-text">Reproducciones: ${reproductions}</p>
        </div>
        </div>
    </div>
    `).join("");
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p class='text-danger'>No se pudieron cargar los artistas.</p>";
  }
});
