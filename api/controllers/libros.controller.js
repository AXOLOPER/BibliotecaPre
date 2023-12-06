'use strict'

const { Global } = require('../models/Global.model');
const Modelo = require('../models/libros.model');
const BitacoraController = require("./bitacora.controller");

async function registrar(req, res){
    if(!req.usuario.privilegios.libros.create){
        return res.status(401).json({ message: "No tiene permiso para realizar esa operacion!" });
    }
    delete req.body._id;
    
    // Verificar si el libro ya existe en la base de datos
    const existing = await Modelo.findOne({"Clave":req.body.Clave});
    console.log(existing);
    if (existing) {
        return res.status(409).json({ message: "La clave de libro ya está en uso" });
    }
    
    req.body.Status = req.body.Status=='undefined'?false:req.body.Status;
    req.body.Free = req.body.Free=='undefined'?false:req.body.Free;
    if(req.files){
        if(req.files.Libro){
            req.body.URL = req.files.Libro[0].originalname;
            req.body.URL = Buffer.from(req.body.URL, 'utf-8').toString();
        }
        if(req.files.Portada){
            req.body.Img = req.files.Portada[0].originalname;
            req.body.Img = Buffer.from(req.body.Img, 'utf-8').toString();
        }
    }
    

    // Crear un nuevo libro con los datos proporcionados
    const New = new Modelo(req.body);
    console.log(New);

    // Guardar el libro en la base de datos
    const done = await New.save();
    console.log(done);

    if(done){
        BitacoraController.registrar("creo al libro: "+done.Titulo+", con ID: "+done._id, req.usuario.id);
    }
    
    console.log(existing);
    return res.status(201).json({ message: "Libro registrado exitosamente" });
}

async function verAll(req,res){
    const Config = await Global.findById("UNICO");
    const criterio = Config.Free?{}:{Free:false};
    const all = await Modelo.find(criterio).populate("Carrera");
    return res.status(200).json(all);
}

async function ver1 (req, res){
    if(!req.usuario.privilegios.libros.read){
        return res.status(401).json({ message: "No tiene permiso para realizar esa operacion!" });
    }
    const Data = await Modelo.findById(req.params.id);
    return res.status(200).json(Data);
}

async function editar(req, res){
    if(!req.usuario.privilegios.libros.update){
        return res.status(401).json({ message: "No tiene permiso para realizar esa operacion!" });
    }
    req.body.Status = req.body.Status=='undefined'?false:req.body.Status;
    req.body.Free = req.body.Free=='undefined'?false:req.body.Free;
    if(req.files){
        if(req.files.Libro){
            req.body.URL = req.files.Libro[0].originalname;
        }
        if(req.files.Portada){
            req.body.Img = req.files.Portada[0].originalname;
        }
    }

    const Data = req.body;

    const Edited = await Modelo.findByIdAndUpdate(Data._id,Data);
    if(Edited){
        BitacoraController.registrar("modifico al libro: "+Edited.Titulo+", con ID: "+Edited._id, req.usuario.id);
    }
    return res.status(200).json(Edited);
}

async function eliminar(req, res){
    if(!req.usuario.privilegios.libros.delete){
        return res.status(401).json({ message: "No tiene permiso para realizar esa operacion!" });
    }
    const id = req.params.id;
    const Consulted = await Modelo.findById(id);
    const estado = !Consulted.Status;
    const Edited = await Modelo.findByIdAndUpdate(id,{Status:estado});
    if(Edited){
        BitacoraController.registrar("elimino al libro: "+Edited.Titulo+", con ID: "+Edited._id, req.usuario.id);
    }
    return res.status(200).json(Edited);
}

async function verLibro(req,res){
    let libro  = req.params.libro;
    var path = require('path');
    var fs = require('fs');
    var file = path.join(__dirname,"../Libros/Libros/"+libro);
    if(!fs.existsSync(file)){
        file = path.join(__dirname, "../Libros/Libros/Default.pdf");
    }
    res.sendFile(file);
}

async function verPortada(req,res){
    let portada  = req.params.portada;
    var path = require('path');
    var fs = require('fs');
    var file = path.join(__dirname, "../Libros/Portadas/"+portada);
    if(!fs.existsSync(file)){
        file = path.join(__dirname, "../Libros/Portadas/Default.PNG");
    }
    res.sendFile(file);
}

module.exports = {
    registrar,
    verAll,ver1,
    editar,
    eliminar,
    verLibro,
    verPortada
}