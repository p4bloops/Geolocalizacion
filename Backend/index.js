const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'mapa_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos MySQL.');
});

app.get('/api/puntos', (req, res) => {
    db.query(`
        SELECT id_laboral, nombre_empresa, lat, lng 
        FROM laboral 
        WHERE fecha_salida IS NULL OR fecha_salida > CURDATE()
    `, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/api/estudiantes/:rut', (req, res) => {
    const { rut } = req.params;
    const sql = 'SELECT nombres, apellidos FROM estudiantes WHERE rut = ?';
    db.query(sql, [rut], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.json(null);
        }
    });
});


app.post('/api/laboral', (req, res) => {
    const {
        rut, nombre_empresa, direccion, comuna, region, pais,
        lat, lng, tipo_laboral, fecha_ingreso, fecha_salida
    } = req.body;

    const sql = `
        INSERT INTO laboral (
            rut, nombre_empresa, direccion, comuna, region, pais, 
            lat, lng, tipo_laboral, fecha_ingreso, fecha_salida
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [rut, nombre_empresa, direccion, comuna, region, pais, lat, lng, tipo_laboral, fecha_ingreso, fecha_salida || null], (err, result) => {
        if (err) throw err;
        res.json({ success: true, id_laboral: result.insertId });
    });
});

app.put('/api/puntos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, lat, lng } = req.body;
    const sql = 'UPDATE puntos_geograficos SET nombre = ?, descripcion = ?, lat = ?, lng = ? WHERE id = ?';
    db.query(sql, [nombre, descripcion, lat, lng, id], (err, result) => {
        if (err) throw err;
        res.json({ id, ...req.body });
    });
});

app.delete('/api/puntos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM puntos_geograficos WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.json({ success: true });
    });
});

app.listen(3001, () => {
    console.log('Servidor corriendo en http://localhost:3001');
});
