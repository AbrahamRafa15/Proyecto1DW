from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
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
# Modelos de Pydantic
# -----------------------

class Artist(BaseModel):
    name: str
    top: int
    reproductions: int

class Concert(BaseModel):
    attendance: int
    city: str
    date: str
    id_artist: int

# -----------------------
# ENDPOINTS DE ARTISTAS
# -----------------------
@app.get("/artistas")
def listar_artistas(limit: int=20, offset: int=0):
    artistas_raw = artists_db.get_artist(limit=limit, offset=offset)
    artistas = [
        {"id": a[0], "name": a[1], "top": a[2], "reproductions": a[3]}
        for a in artistas_raw
    ]
    return {"artistas":artistas, "count":len(artistas)}

@app.get("/artistas/{artist_id}")
def obtener_artista(artist_id: int):
    artista = artists_db.get_artist_by_id(artist_id=artist_id)
    if not artista:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    artista_dict = {"id": artista[0], "name": artista[1], "top": artista[2], "reproductions": artista[3]}
    return {"artista":artista_dict}

@app.post("/artistas")
def crear_artista(artista:Artist):
    artists_db.create_artist(name=artista.name, top=artista.top, reproductions=artista.reproductions)
    return {"mensaje": "Artista creado exitosamente"}

@app.put("/artistas/{artist_id}")
def actualizar_artista(artist_id: int, artista: Artist):
    if not artists_db.get_artist_by_id(artist_id=artist_id):
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    artists_db.update_artist(artist_id=artist_id, name=artista.name, top=artista.top, reproductions=artista.reproductions)
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
    conciertos_raw = concerts_db.get_concert(limit=limit, offset=offset)
    conciertos = [
        {
            "id": c[0],
            "city": c[1],
            "attendance": c[3],
            "artist_name": c[4]
        }
        for c in conciertos_raw
    ]
    return {"conciertos": conciertos, "count":len(conciertos)}

@app.get("/conciertos/{concert_id}")
def obtener_concierto(concert_id:int):
    concierto = concerts_db.get_concert_by_id(concert_id)
    if not concierto:
        raise HTTPException(status_code=404, detail="Concierto no encontrado")
    concierto_dict = {
        "id": concierto[0],
        "city": concierto[1],
        "date": concierto[2],
        "attendance": concierto[3],
        "artist_name": concierto[4]
    }
    return {"concierto": concierto_dict}

@app.post("/conciertos")
def crear_concierto(concierto: Concert):
    if not artists_db.get_artist_by_id(concierto.id_artist):
        raise HTTPException(status_code=400, detail="El artista no existe")
    concerts_db.create_concert(concierto.attendance, concierto.city, concierto.date, concierto.id_artist)
    return {"mensaje": "Concierto creado correctamente"}

@app.put("/conciertos/{concert_id}")
def actualizar_concierto(concert_id: int, concierto: Concert):
    if not concerts_db.get_concert_by_id(concert_id):
        raise HTTPException(status_code=404, detail="Concierto no encontrado")
    concerts_db.update_concert(concert_id, concierto.attendance, concierto.city, concierto.date, concierto.id_artist)
    return {"mensaje": "Concierto actualizado correctamente"}

@app.delete("/conciertos/{concert_id}")
def eliminar_concierto(concert_id: int):
    if not concerts_db.get_concert_by_id(concert_id):
        raise HTTPException(status_code=404, detail="Concierto no encontrado")
    concerts_db.delete_concert(concert_id)
    return {"mensaje": "Concierto eliminado correctamente"}

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API funcionando normal"}