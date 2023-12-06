const mongoose = require('mongoose');

const librosSchema = new mongoose.Schema({
  Img: {type: String},
  Clave: {type: String},
  URL: {type: String},
  Titulo: {type: String},
  Autor: {type: String},
  Editorial: {type: String},
  Edicion: {type: String},
  Year: {type: Number},
  Carrera: {type: mongoose.Types.ObjectId, ref:"Carreras"},
  Free: {type: Boolean,default:true},
  Status: {type: Boolean,default:false}
});

const Libro = mongoose.model('Libros', librosSchema);

module.exports = Libro;