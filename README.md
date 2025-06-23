# Ingeniería de Software para Sistemas Inteligentes

Escuela Superior de Cómputo | Proyecto Final | 6BM1 | Ingeniería en Inteligencia Artificial

## Autores

- Cazares Leyva Bryan Jhoan
- López López Rebeca
- Pérez Nuñez Miguel Alejandro 


## Descripción del proyecto

**Voice Bridge** es una extensión para navegador que permite la traducción en tiempo real del audio en videollamadas, generando subtítulos en la pantalla...…….

## Instalación y ejecución

### 1. Clonar el repositorio

Para ejecutar el proyecto, primero es necesario clonar el repositorio usando Git:

```bash
  git clone https://github.com/MrBryan12/voice-bridge.git
```

### 2. Estructura del proyecto

Después de clonar el repositorio, verás una carpeta principal que contiene otras dos carpetas:

```bash
voice-bridge/
│
├── extension/       # Carpeta con los archivos de la extensión del navegador
│   ├── manifest.json
│   ├── background.js
│   └── ...
│
└── transcriber/     # Carpeta con el script en Python
    └── main.py      # Ejecuta la transcripción y traducción del audio
```

### 3. Cargar la extensión en el navegador

1. Abre **Google Chrome** (o un navegador basado en Chromium como **Edge** o **Brave**).
2. Accede a `chrome://extensions/`.
3. Activa el **modo desarrollador** (esquina superior derecha).
4. Haz clic en **“Cargar extensión sin empaquetar”**.
5. Selecciona la carpeta `extension/` dentro del repositorio clonado.


### 4. Ejecutar el sistema

1. Asegurate de tener Python instalado (versión 3.8 o superior).
2. Navega a la carpeta 
```bash
   cd voice-bridge/transcriber
```
3. Una vez dentro de esta carpeta, ejecutar el siguiente comando que instalará todas las dependencias necesarias para ejecutar el proyecto:
```bash
   pip install -r requirements.txt
```

### Requisitos

- Python 3.8+
- Navegador basado en Chromium
- Conexión a internet
- Acceso al micrófono


### Archivos importantes

- `main.py`: Captura y traduce el audio (Python)
- `manifest.json`: Configuración de la extensión
- `popup.html`, `background.js`, etc.: Funcionalidad de la extensión
 
