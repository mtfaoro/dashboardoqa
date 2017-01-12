// Pega as instancias de mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Settings = new Schema({
     doctor : {type: Schema.Types.ObjectId, ref: "Person"},
 speciality : {type: Schema.Types.ObjectId, ref: "Speciality"},
       city : Number,
   duration : Number, 
   startDate: Number,
  limitDate : Number, // (exemplo: 30/04/2016)
  particularQtd: Number,         
     sunday : [{WorkTime: {ini: String,
                           end: String}
              }],
     monday : [{WorkTime: {ini: String,
                           end: String}
               }],
     tuesday : [{WorkTime: {ini: String,
                            end: String}
              }],
     wednesday : [{WorkTime: {ini: String,
                              end: String}
                 }],
     thuersday : [{WorkTime: {ini: String,
                              end: String}
                  }],
     friday : [{WorkTime: {ini: String,
                           end: String}
               }],
     saturday : [{WorkTime: {ini: String,
                             end: String}
                 }]

});

Settings.index({doctor : 1});
module.exports = mongoose.model('Settings', Settings);