const express = require('express');
const api = express.Router();
var md_auth = require('../middleware/authenticated');
const Controller = require("../controllers/libros.controller");
const multer = require('multer');

const storage = multer.diskStorage({
    destination:"Libros/",
    filename: function(req,file,cb){
        console.log(file.filename);
        cb("", file.fieldname == "Libro"? "Libros/"+file.originalname:"Portadas/"+file.originalname)
    }
});

const upload = multer({
    storage:storage, limits: { fileSize: 1024 * 1024 * 50 }
});


// Ruta de registro
api.post("/",md_auth.ensureAuth,upload.fields([{name:'Libro',maxCount:1},{name:'Portada',maxCount:1}]),Controller.registrar);

// Ruta para consultar libross
api.get("/",md_auth.ensureAuth,Controller.verAll);

// Consulta de libros por id
api.get("/:id",md_auth.ensureAuth,Controller.ver1);

// Consulta de libros PDF
api.get("/libros/:libro",Controller.verLibro);

// Consulta de libros por id
api.get("/portadas/:portada",Controller.verPortada);

// Ruta para actualiza libross
api.put("/",md_auth.ensureAuth,upload.fields([{name:'Libro',maxCount:1},{name:'Portada',maxCount:1}]),Controller.editar);

// Ruta para poner a los libross como activos e inactivos
api.delete("/:id",md_auth.ensureAuth,Controller.eliminar);

module.exports = api;