function cargarHTML(url, contenedorID, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(contenedorID).innerHTML = data;
            if (callback) callback();
        })
        .catch(error => console.error('Error cargando el archivo HTML:', error));
}

function inicializarPestanas() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function buscarEstudiante() {
    const rut = document.getElementById('rut').value;
    fetch(`http://localhost:3001/api/estudiantes/${rut}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.getElementById('nombre').value = `${data.nombres} ${data.apellidos}`;
            } else {
                alert('Estudiante no encontrado');
            }
        })
        .catch(error => console.error('Error:', error));
}

function buscarEmpresa() {
    const buscarEmpresa = document.getElementById('buscar_empresa').value;
    if (buscarEmpresa.trim() === '') {
        alert('Por favor ingresa el nombre de la empresa');
        return;
    }

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${buscarEmpresa},Chile`)
        .then(response => response.json())
        .then(data => {
            const resultadosContainer = document.createElement('div');
            resultadosContainer.id = 'resultados-busqueda';
            document.querySelector('.acciones-container').appendChild(resultadosContainer);

            resultadosContainer.innerHTML = '';

            if (data.length === 0) {
                resultadosContainer.innerHTML = '<p>No se encontraron resultados</p>';
                return;
            }

            const ul = document.createElement('ul');
            data.forEach((empresa, index) => {
                const li = document.createElement('li');
                li.textContent = empresa.display_name;
                li.style.cursor = 'pointer';
                li.addEventListener('click', () => completarDatosEmpresa(empresa));
                ul.appendChild(li);
            });

            resultadosContainer.appendChild(ul);
        })
        .catch(error => console.error('Error:', error));
}

function completarDatosEmpresa(empresa) {
    const nombreempresa = empresa.name || 'Sin nombre disponible';
    const latitud = empresa.lat || 'Sin latitud disponible';
    const longitud = empresa.lon || 'Sin longitud disponible';

    const nombreInput = document.getElementById('nombre_empresa');
    const latitudInput = document.getElementById('latitud');
    const longitudInput = document.getElementById('longitud');
    const paisInput = document.getElementById('pais');
    const regionInput = document.getElementById('region');
    const comunaInput = document.getElementById('comuna');
    const resultadosContainer = document.getElementById('resultados-busqueda');

    if (nombreInput) nombreInput.value = nombreempresa;
    if (latitudInput) latitudInput.value = latitud;
    if (longitudInput) longitudInput.value = longitud;

    if (paisInput && regionInput && comunaInput) {
        const partesDireccion = empresa.display_name.split(",").map(item => item.trim());
        paisInput.value = partesDireccion[partesDireccion.length - 1];
        regionInput.value = partesDireccion[partesDireccion.length - 2];
        comunaInput.value = partesDireccion[partesDireccion.length - 4];
    }

    // Llamar a la función para agregar el marcador
    if (latitud !== 'Sin latitud disponible' && longitud !== 'Sin longitud disponible') {
        // Asegúrate de que la función agregarMarcador esté disponible globalmente
        if (typeof agregarMarcador === 'function') {
            agregarMarcador(parseFloat(latitud), parseFloat(longitud));
        }
    }

    if (resultadosContainer) {
        resultadosContainer.innerHTML = '';
    }
}

function agregarLaboral() {
    const rut = document.getElementById('rut').value;
    const nombre_empresa = document.getElementById('nombre_empresa').value;
    const direccion = document.getElementById('direccion_empresa').value;
    const comuna = document.getElementById('comuna_empresa').value;
    const region = document.getElementById('region_empresa').value;
    const pais = document.getElementById('pais_empresa').value;
    const lat = document.getElementById('latitud').value;
    const lng = document.getElementById('longitud').value;
    const tipo_laboral = document.getElementById('tipo_trabajo').value;
    const fecha_ingreso = document.getElementById('fecha_ingreso').value;
    const fecha_salida = document.getElementById('fecha_salida').value;

    const laboral = {
        rut,
        nombre_empresa,
        direccion,
        comuna,
        region,
        pais,
        lat,
        lng,
        tipo_laboral,
        fecha_ingreso,
        fecha_salida
    };

    fetch('http://localhost:3001/api/laboral', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(laboral),
    })
    .then(response => response.json())
    .then(data => {
        alert('Registro laboral agregado con éxito');
    })
    .catch(error => console.error('Error:', error));
}

cargarHTML('/Frontend/secciones/acciones/acciones.html', 'acciones', inicializarPestanas);