var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
var User = new Schema({ 	
	personID: {type: Schema.Types.ObjectId, ref: "Person"},	
	login: String, 
	password: String, 
	email: String,
	number: Number,
	isAdmin: Boolean,
	isActive: Boolean,
	token: String
});

User.index({email : 1});
module.exports = mongoose.model('User', User);