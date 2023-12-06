const mongoose = require('mongoose');

const carreraSchema = new mongoose.Schema({
  Clave:{type:String,unique: true,index:true},
  Nombre:{type:String},
  Abreviatura:{type:String,unique: true},
  Status:{type:Boolean, default:true}
});

const Carreras = mongoose.model('Carreras', carreraSchema);

module.exports = Carreras;