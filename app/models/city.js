// Pega as instancias de mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var City = new Schema({
    description: String,           
      city_ibge: Number,
          state: String,
      state_ibge: Number
});

City.index({city_ibge : 1}, { unique: true });
City.index({description : "text" });

module.exports = mongoose.model('City', City);