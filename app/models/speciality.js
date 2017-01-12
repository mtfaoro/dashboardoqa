// Pega as instancias de mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var  Speciality = new Schema({ 	
     description: String
});

Speciality.index({description : "text" });
module.exports = mongoose.model('Speciality', Speciality);