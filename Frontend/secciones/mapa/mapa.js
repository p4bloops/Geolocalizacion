function cargarMapa() {
    fetch('/Frontend/secciones/mapa/mapa.html')
        .then(response => response.text())
        .then(data => {
            const mapContainer = document.getElementById('map-container');
            mapContainer.innerHTML = data;

            const mapElement = document.getElementById('map');
            if (mapElement) {
                inicializarMapa();
            } else {
                console.error("Error: Contenedor 'map' no encontrado después de cargar el HTML.");
            }
        })
        .catch(error => console.error('Error al cargar el mapa:', error));
}

function inicializarMapa() {
    mapboxgl.accessToken = 'pk.eyJ1IjoicDRibG9vcHMiLCJhIjoiY20wYTBjZXYzMTk4eDJrb21lYXdjMTNhNSJ9.xpNscmVRs2kIFt-oVJuVuQ';
    const map = new mapboxgl.Map({
        container: 'map',
        style: localStorage.getItem("mode") === "dark-mode" 
            ? 'mapbox://styles/mapbox/dark-v11' 
            : 'mapbox://styles/mapbox/light-v11',
        center: [-70.6483, -33.4569],
        zoom: 10,
    });

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    const modeToggle = document.querySelector(".dark-light");

    let puntosGuardados = [];

    function obtenerPuntos() {
        fetch('http://localhost:3001/api/puntos')
        .then(response => response.json())
        .then(puntos => {
            puntosGuardados = puntos;
            puntos.forEach(punto => {
                agregarPuntoAlMapa(punto);
            });
        })
        .catch(error => console.error('Error:', error));
    }

    function agregarPuntoAlMapa(punto) {
        const colorCirculo = localStorage.getItem("mode") === "dark-mode" ? 'yellow' : 'red';
        const sourceId = `punto-${punto.id_laboral}`;
        const radiusInM = 150;
        const circle = turf.circle([punto.lng, punto.lat], radiusInM, { units: 'meters' });
    
        // Verificar si la fuente del círculo ya existe, si es así, no volver a agregarla
        if (!map.getSource(`${sourceId}-circle`)) {
            map.addSource(`${sourceId}-circle`, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            geometry: circle.geometry,
                            properties: {}
                        }
                    ]
                }
            });
        }
    
        // Verificar si la fuente del punto ya existe, si es así, no volver a agregarla
        if (!map.getSource(`${sourceId}-point`)) {
            map.addSource(`${sourceId}-point`, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [punto.lng, punto.lat]
                            },
                            properties: {
                                nombre: punto.nombre_empresa
                            }
                        }
                    ]
                }
            });
        }
    
        // Verificar si la capa del círculo ya existe antes de agregarla
        if (!map.getLayer(`${sourceId}-circle-fill`)) {
            map.addLayer({
                id: `${sourceId}-circle-fill`,
                type: 'fill',
                source: `${sourceId}-circle`,
                paint: {
                    'fill-color': colorCirculo,
                    'fill-opacity': 0.05,
                }
            });
        }
    
        // Verificar si la capa del punto ya existe antes de agregarla
        if (!map.getLayer(`${sourceId}-point-circle`)) {
            map.addLayer({
                id: `${sourceId}-point-circle`,
                type: 'circle',
                source: `${sourceId}-point`,
                paint: {
                    'circle-radius': 2,
                    'circle-color': colorCirculo,
                }
            });
    
            map.on('click', `${sourceId}-point-circle`, (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const nombre = e.features[0].properties.nombre;
    
                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`<strong>${nombre}</strong>`)
                    .addTo(map);
            });
    
            map.on('mouseenter', `${sourceId}-point-circle`, () => {
                map.getCanvas().style.cursor = 'pointer';
            });
    
            map.on('mouseleave', `${sourceId}-point-circle`, () => {
                map.getCanvas().style.cursor = '';
            });
        }
    }    

    map.on('styledata', () => {
        if (puntosGuardados.length > 0) {
            puntosGuardados.forEach(punto => {
                agregarPuntoAlMapa(punto);
            });
        }
    });

    obtenerPuntos();

    if (modeToggle) {
        modeToggle.addEventListener("click", () => {
            const body = document.querySelector("body");
            const isDarkMode = body.classList.contains("dark");

            const currentStyle = isDarkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';
            map.setStyle(currentStyle);
        });
    }
}

cargarMapa();