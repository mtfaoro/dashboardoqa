// Pega as instancias de mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Person = new Schema({
        name: String,
    lastname: String,  
      cardId: Number, //CPF/CNPJ
      userId: Number, //Celular usuario/ID Medico  ou ID do User login sistema.
   verfifyID: String, // Cod verificação do Numero de celular.  
healthCareId: Number,
    birthday: Number,
   doctor: { crmId: String,
            ranking: Number, 
        evaluations: Number,   /*novo campo*/
             cityId: String,  //IBGE ID           
            contact: Number,
            address: { cityId: Number, //IBGE ID
                      zipcode: Number, 
                    streetAdd: String,                    
                    cityState: String,
                  complemento: String, 
            formatted_address: String,
                         lat : Number,
                         lng : Number},                
         speciality: {type: Schema.Types.ObjectId, ref: "Speciality"},
         healthCare: {}}         
});

Person.index({userId : 1},  { unique: true });
module.exports = mongoose.model('Person', Person);