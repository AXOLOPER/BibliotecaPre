const mongoose = require('mongoose');

const globalSchema = new mongoose.Schema({
  _id:{type:String,default:"UNICO"},
  Free:{type:Boolean},
  Idioma:{type:String},
  Miniaturas:{type:Boolean,default:false}
});

const Global = mongoose.model('Global', globalSchema);

module.exports = {
  Global
};