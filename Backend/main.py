from fastapi import FastAPI, HTTPException
from typing import List, Optional
import artists_db
import concerts_db

#Inicializar base de datos
artists_db.initialize_db()
concerts_db.initialize_db()

app = FastAPI(
    title="Plataforma de Managers de Música",
    description="API para gestión de artistas y conciertos",
    version="1.0.0"
)

# -----------------------
# ENDPOINTS DE ARTISTAS
# -----------------------
@app.get("/artistas")
def listar_artistas(limit: int=20, offset: int=0):
    artistas = artists_db.get_artist(limit=limit, offset=offset)
    return {"artistas":artistas, "count":len(artistas)}

@app.get("/artistas/{artist_id}")
def obtener_artista(artist_id: int):
    artista = artists_db.get_artist_by_id(artist_id=artist_id)
    if not artista:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    return {"artista":artista}

@app.post("/artistas")
def crear_artista(name: str, top:int, reproductions: int):
    artists_db.create_artist(name=name, top=top, reproductions=reproductions)
    return {"mensaje": "Artista creado exitosamente"}

@app.put("/artistas/{artist_id}")
def actualizar_artista(artist_id: int, name: str, top: int, reproductions: int):
    if not artists_db.get_artist_by_id(artist_id=artist_id):
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    artists_db.update_artist(artist_id=artist_id, name=name, top=top, reproductions=reproductions)
    return {"mensaje": "Artista actualizado exitosamente"}

@app.delete("/artistas/{artist_id}")
def eliminar_artista(artist_id: int):
    if not artists_db.get_artist_by_id(artist_id=artist_id):
        raise HTTPException(status_code=404,detail="Artista no encontrado")
    artists_db.delete_artist(artist_id=artist_id)
    return {"mensaje": "Artista eliminado exitosamente"}

# -----------------------
# ENDPOINTS DE CONCIERTOS
# -----------------------
@app.get("/conciertos")
def listar_conciertos(limit: int=20, offset: int=0):
    conciertos = concerts_db.get_concert(limit=limit, offset=offset)
    return {"conciertos": conciertos, "count":len(conciertos)}

@app.get("/conciertos/{concert_id}")
def obtener_concierto(concert_id:int):
    concierto = concerts_db.get_concert_by_id(concert_id)
    if not concierto:
        raise HTTPException(status_code=404, detail="Concierto no encontrado")
    return {"concierto": concierto}

@app.post("/conciertos")
def crear_concierto(attendance: int, city: str, date: str, id_artist: int):
    if not artists_db.get_artist_by_id(id_artist):
        raise HTTPException(status_code=400, detail="El artista no existe")
    concerts_db.create_concert(attendance, city, date, id_artist)
    return {"mensaje": "Concierto creado correctamente"}

@app.put("/conciertos/{concert_id}")
def actualizar_concierto(concert_id: int, attendance: int, city: str, date: str, id_artist: int):
    if not concerts_db.get_concert_by_id(concert_id):
        raise HTTPException(status_code=404, detail="Concierto no encontrado")
    concerts_db.update_concert(concert_id, attendance, city, date, id_artist)
    return {"mensaje": "Concierto actualizado correctamente"}

@app.delete("/conciertos/{concert_id}")
def eliminar_concierto(concert_id: int):
    if not concerts_db.get_concert_by_id(concert_id):
        raise HTTPException(status_code=404, detail="Concierto no encontrado")
    concerts_db.delete_concert(concert_id)
    return {"mensaje": "Concierto eliminado correctamente"}