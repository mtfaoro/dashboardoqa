// Pega as instancias de mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Event = new Schema({
          doctor: {type: Schema.Types.ObjectId, ref: "Person"},
      speciality: {type: Schema.Types.ObjectId, ref: "Speciality"},
       eventcity: Number,
       eventDate: Number,
        fulldate: { type: Boolean, default: false },  
    appointments: [{ time : String, //(new Date()).getTime() 
                   patient : {type: Schema.Types.ObjectId, ref: "Person"}, 
                patientName: String,
                     userID: Number, // = userID (Celular)
                    status : Number,
                    score  : Number
                   }] 
});

Event.index({ speciality: 1, eventcity: 1, fulldate : 1, eventDate : 1});
Event.index({ _id : 1, 'appointments.time' : 1 });
Event.index({ 'appointments.patient' : 1, 'appointments.status' : 1});
Event.index({doctor : 1, fulldate: 1, eventDate : 1});
Event.index({doctor : 1, eventDate : 1},  { unique: true });
module.exports = mongoose.model('Event', Event);