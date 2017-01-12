// Pega as instancias de mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/*scheduleDate : [{ scheduleTime: String, //Formato Date
                        pacient: {type: Schema.Types.ObjectId, ref: "Person"},
                         status: Number,
                        ranking: Number
     }]*/
      /*doctor: String, //Schema.Types.ObjectId,
       docName: String, //Paliativo
      specdesc: String, //Paliativo
    speciality: [{}],
    */
// Seta um modelo ('tabela') atribuindo ao module.exports
module.exports = mongoose.model('Schedule', new Schema({    
          doctor: {type: Schema.Types.ObjectId, ref: "Person"},
      speciality: {type: Schema.Types.ObjectId, ref: "Speciality"},
          period: Number,
           month: Number,
            year: Number, 
    scheduleDate:[{ day : Number,
           scheduleTime : [{hour : String,
                          pacient: {type: Schema.Types.ObjectId, ref: "Person"},
                           status: Number,
                          ranking: Number
                          }]
                  }]
}));