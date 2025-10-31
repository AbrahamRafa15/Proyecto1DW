# Proyecto1DW
Nuestro proyecto consistió en hacer una plataforma web que asista al usuario para poder visualizar información de artistas, fechas/planificación de conciertos y estadísticas sobre los artistas . La plataforma va dirigida a un usuario que tenga interés en la administración de talentos artísticos como managers o agencias de este tipo.

El proyecto utiliza un backend realizado con **FastAPI** y un frontend con HTML, CSS, JavaScript y Bootstrap, conectados mediante API REST.

## Autores

<div style="display: flex; align-items: center;">
  <img src="Proyecto1DW/Imagenes/AbrahamMC.png" alt="Abraham Martínez Cerón" width="80" style="margin-right: 10px;"/>
  <div>
    <strong>Abraham Martínez Cerón</strong><br/>
    Roles: Backend, administracion.html, estadisticas.html, administracion.js, estadisticas.js, requirements.txt y gitignore. Documentación de Backend.
  </div>
</div>

<div style="display: flex; align-items: center;">
  <img src="Proyecto1DW/Imagenes/GiuseppeValencia.jpg" alt="Giuseppe Valencia Carrillo" width="80" style="margin-right: 10px;"/>
  <div>
    <strong>Giuseppe Valencia Carrillo </strong><br/>
    Roles: Frontend, index.js, index.html, administracion.html, calendario.html, estadisticas.html
  </div>
</div>

<div style="display: flex; align-items: center;">
  <img src="Proyecto1DW/Imagenes/diegoAda.jpg" alt="Diego Adabache" width="80" style="margin-right: 10px;"/>
  <div>
    <strong>Diego Azahed Adabache Gutiérrez  </strong><br/>
    Roles: Frontend, tema.js, estilos.css, html en general.
  </div>
</div>
 
<div style="display: flex; align-items: center;">
  <img src="Proyecto1DW/Imagenes/DiegoMT.png" alt="Diego Martínez" width="80" style="margin-right: 10px;"/>
  <div>
    <strong>Diego Martínez Tinoco</strong><br/>
    Roles: Frontend, calendario.html. funcionalidadCalendario.js, vendor/, estilosCalendario.css
  </div>
</div>

## Front End 
La estructura de los archivos es la siguiente:
```
Proyecto1DW/
├── Frontend/
│   ├── CSS/
│   │   ├── estilos.css
│   │   └── estilosCalendario.css
│   ├── HTML/
│   │   ├── administracion.html
│   │   ├── calendario.html
│   │   ├── estadisticas.html
│   │   └── index.html
│   ├── JS/
│   │   ├── administracion.js
│   │   ├── estadisticas.js
│   │   ├── funcionalidadCalendario.js
│   │   └── tema.js
```

### Archivos de HTML
**Index.html** es la página principal de la página. En esta se encuentra en forma de base de datos todos los artistas que se manejan en la página. Se muestra una descripción con la información destacada del artista.

**estadisticas.html** es una página en la que, a través de la API, forma gráficos en los que se refleja popularidad (en forma de reproducciones) y otro gráfico que mide asistencia a conciertos.

**calendario.html** es una página donde se almacenan las fechas de los conciertos de todos los artistas o individualmente. A través de la API se recibe la información y se almacena dentro de el calendario que está en la página.

**administracion.html** es una página que sirve para agregar artistas a la base de datos de una manera fácil y rápida. Cuenta con opciones en la interfaz para permitir que se introduzcan artistas nuevos y su información, además de poder introducir fechas y lugares para conciertos.

### Archivos de CSS

**estilos.css** es un archivo en donde se controla el diseño de el modo oscuro de todas las páginas.

**estilosCalendario.css** es un archivo específico para el archivo calendario.html, donde se personaliza, con ayuda de la librería externa, el diseño del calendario.


### Archivos de Java Script

**administracion.js** es el archivo más completo ya que, conectándose a la API, pide la lista de artistas y conciertos y los organiza en tablas. A través de ella también se crean nuevos artistas y conciertos, actualizar información y eliminar.

**estadisticas.js** es un documento que, al conectarse a la API, hace gráficos.

**funcionalidadCalendario.js** se conecta a la API y, después de crear el calendario en el que se estructura, inserta los eventos y los almacena.

**tema.js** es un documento donde se almacena el método para poder cambiar al modo oscuro o modo claro, guardando las preferencias en LocalStorage.

**index.js** es un documento que se conecta con la API y obtiene la información de los artistas registrados y los despliega en tarjetas de bootstrap haciendo uso del DOM. 

### Levantar el Front End

Las 4 páginas con las que trabajamos fueron lanzadas por medio de Github Pages. Una vez listas en el main de nuestro repositorio, fueron desplegadas. 

https://abrahamrafa15.github.io/Proyecto1DW/

## Backend

La estructura de los archivos es la siguiente
```
PROYECTO1DW/
├── Backend/
│   ├── artists_db.py  # Gestión de la tabla de artistas
│   ├── backend_db.py  # Gestión de la base de datos 
│   ├── concerts_db.py # Gestión de la tabla de conciertos
│   ├── main.py        # Orquestador de la API 
```

### Archivo artists_db.py

Contiene un ID que autoincrementa, nombre, top y reproducciones. Además, sigue los principios CRUD: Create, Read, Update and Delete. Soporta concurrencia bloqueando la base de datos para operaciones de creación, actualización y eliminación

### Archivo backend_db.py

Se encarga de crear la base de datos con las tablas artists y concerts. En caso de que ya existan, se omite la inicialización. Además, los cambios son persistentes con journal_mode=WAL

### Archivo concerts_db.py

Contiene un ID que autoincrementa, asistencia, ciudad, fecha y el ID del artista como llave foránea. Sigue los principios CRUD: Create, Read, Update and Delete. Soporta concurrencia bloqueando la base de datos para operaciones de creación, actualización y eliminación. 

### Archivo main.py

Se encarga del manejo de la API. Al comienzo inicializa la base de datos y crea la app. 

Tiene dos modelos de Pydantic para tener un mejor manejo de los Artistas y Conciertos para menor sobrecarga desde el frontend.

#### Endpoints de Artistas

Tiene cinco funciones para implementar los métodos CRUD:
- Get: Para todos los artistas (/artistas)
- Get: Para obtener un artista (/artistas/{artistas_id})
- Post: Para crear un artista (/artistas)
- Put: Para actualizar un artista (/artistas/{artist_id})
- Delete: Para eliminar un artista (/artistas/{artist_id})
> [!Warning]
> En caso de que no exista el artista con el id (para obtener uno, actualizar o eliminar) se lanza una HTTPException 404

#### Endpoints de Conciertos

Tiene cinco funciones para implementar los métodos CRUD:
- Get: Para todos los conciertos (/conciertos)
- Get: Para obtener un concierto (/conciertos/{concert_id})
- Post: Para crear un concierto (/conciertos)
> [!Warning]
> En caso de que no exista el artista con el id necesario, se lanza una HTTPException 400
- Put: Para actualizar un concierto (/conciertos/{concert_id})
- Delete: Para eliminar un concierto (/conciertos/{concert_id})
> [!Warning]
> En caso de que no exista el concierto con el id (para obtener uno, actualizar o eliminar) se lanza una HTTPException 404

### Archivo requirements.txt

El archivo requirements.txt se genero a partir del comando
```bash
pip freeze > requirements.txt
```
Las dependencias principales son:
- fastapi
- uvicorn
- pydantic
- sqlite3

### Levantar el backend

Para levantar el backend, primero es necesario crear un ambiente virtual "fastapi" en la carpeta Proyecto1DW, después lo activamos y levantamos el servidor
```bash
python -m venv fastapi
source ./fastapi/bin/activate
fastapi dev Backend/main.py
```

### Enlace al health endpoint de la API

> [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

Este endpoint permite verificar que la API está activa y funcionando correctamente.  
Devuelve una respuesta JSON como la siguiente:
```json
{
  "status": "ok",
  "message": "API funcionando normal"
}
```

### Pruebas rápidas

Puedes probar los endpoints fácilmente desde Swagger UI:
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

O desde la terminal con `curl`:
```bash
curl http://127.0.0.1:8000/health
```
