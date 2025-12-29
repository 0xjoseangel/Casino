# 🎰 Casino Online - Lasaña Team

Este proyecto implementa un sistema de casino online utilizando una arquitectura moderna y separada (Headless):

* **Backend:** Django (Python) + Oracle Database (UGR).
* **Frontend:** React + Vite (Javascript).

---

## 📁 1. Estructura del Proyecto

El repositorio está dividido en dos grandes carpetas. No mezcléis archivos de una en la otra.

```text
CasinoLasana/
├── backend/                # TODO lo relacionado con Python y Django
│   ├── manage.py           # Script para ejecutar el servidor
│   ├── requirements.txt    # Lista de librerías Python necesarias
│   ├── .env                # (CREAR MANUALMENTE) Tus claves de Oracle
│   ├── casino_project/     # Configuración global de Django
│   ├── usuarios/           # App: Jugadores y Admins
│   ├── juegos/             # App: Catálogo de juegos
│   ├── transacciones/      # App: Pagos y apuestas
│   ├── eventos/            # App: Torneos y Promociones
│   └── sesiones/           # App: Control de tiempo de juego
│
└── frontend/               # TODO lo relacionado con React
    ├── package.json        # Lista de librerías JS necesarias
    ├── vite.config.js      # Configuración del servidor frontend
    ├── src/                # Código fuente de la web (componentes, páginas)
    └── public/             # Imágenes y recursos estáticos

```

---

## 🛠️ 2. Prerrequisitos (Instalar antes de empezar)

Para que esto funcione en tu ordenador necesitas instalar:

1. **Anaconda o Miniconda:** Para gestionar el entorno de Python de forma aislada. [Descargar aquí](https://docs.conda.io/en/latest/miniconda.html).
2. **Node.js (LTS):** Para poder ejecutar React. [Descargar versión LTS aquí](https://nodejs.org/es/).
3. **VPN de la UGR:** **IMPRESCINDIBLE**. Sin la VPN conectada (Cisco AnyConnect), no podrás conectarte a la base de datos Oracle y el backend fallará.

---

## 🐍 3. Configuración del Backend (Django)

Sigue estos pasos la primera vez que descargues el proyecto:

### A. Crear el entorno Conda

Abre tu terminal (Anaconda Prompt en Windows o Terminal en Mac/Linux) y ejecuta:

```bash
# 1. Crear el entorno con Python 3.11 (versión estable)
conda create --name casino_django python=3.11

# 2. Activar el entorno (¡Haz esto siempre que vayas a trabajar!)
conda activate casino_django

```

### B. Instalar dependencias

Vete a la carpeta del backend e instala las librerías:

```bash
cd backend
pip install -r requirements.txt

```

### C. Configurar las Claves de Oracle (`.env`)

Por seguridad, las contraseñas no se suben a GitHub. Tienes que crear un archivo llamado `.env` dentro de la carpeta `backend/` y pegar esto con TUS datos:

```ini
# Archivo: backend/.env
ORACLE_HOST=oracle0.ugr.es
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=practbd
ORACLE_USER=x1234567     <-- TU USUARIO (DNI modificado)
ORACLE_PASSWORD=tu_clave <-- TU CONTRASEÑA

```

### D. Probar la conexión

Asegúrate de tener la **VPN conectada** y ejecuta:

```bash
python manage.py migrate

```

*Si ves muchos "OK" en verde, ¡felicidades! Estás conectado a Oracle.*

---

## ⚛️ 4. Configuración del Frontend (React)

Abre **otra terminal** nueva (para no cerrar la de Django) y configura la parte visual:

```bash
# 1. Entrar en la carpeta frontend
cd frontend

# 2. Instalar todas las librerías de Node.js
npm install

```

---

## 🚀 5. Cómo arrancar el proyecto (Día a día)

Para trabajar, necesitarás tener **dos terminales abiertas** simultáneamente:

### Terminal 1: Backend (Django)

```bash
conda activate casino_django
cd backend
python manage.py runserver

```

*El backend estará funcionando en: `http://127.0.0.1:8000/*`

### Terminal 2: Frontend (React)

```bash
cd frontend
npm run dev

```

*El frontend estará funcionando en: `http://localhost:5173/` (o el puerto que te diga Vite).*

---

## ⚠️ Solución de Problemas Comunes

**1. Error `DPY-6003` o `ORA-12170` (Time out)**

* **Causa:** No estás conectado a la VPN de la universidad o el firewall te bloquea.
* **Solución:** Conecta Cisco AnyConnect y prueba a hacer `ping oracle0.ugr.es`.

**2. Error `DPY-4001: no credentials specified**`

* **Causa:** Django no encuentra tu archivo `.env`.
* **Solución:** Asegúrate de que el archivo se llama exactamente `.env` (no `.env.txt`) y está dentro de la carpeta `backend/`.

**3. Error `ModuleNotFoundError**`

* **Causa:** No tienes el entorno conda activado o no instalaste los requisitos.
* **Solución:** Ejecuta `conda activate casino_django` y luego `pip install -r requirements.txt`.

---

## 🤝 Normas de Git para el equipo

1. **NUNCA subáis el archivo `.env**` al repositorio (contiene vuestras contraseñas).
2. Antes de hacer `git push`, haced siempre `git pull` para bajar los cambios de los compañeros.
3. Si instaláis una librería nueva en Python: avisad y ejecutad `pip freeze > requirements.txt` para actualizar la lista.