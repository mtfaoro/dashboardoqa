// =================================================================
// get the packages we need ========================================
// =================================================================
var express 	= require('express'),
	app         = express(),
	bodyParser  = require('body-parser'),
	morgan      = require('morgan'),
	mongoose    = require('mongoose'),
	moment      = require('moment'),
	MongoClient = require('mongodb').MongoClient,
	assert 	    = require('assert'),
	https       = require('https');

var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config      = require('./config'); // get our config file
var User        = require('./app/models/user'); // get our mongoose model

var Speciality  = require('./app/models/speciality'),
	Person      = require('./app/models/person'),
	City		= require('./app/models/city'),
	Event       = require('./app/models/event'),
	Settings    = require('./app/models/settings');



var objectId    = require('mongoose').Types.ObjectId;
// =================================================================
// configuration ===================================================
// =================================================================
var port = process.env.PORT || 3000; // used to create, sign, and verify tokens
var connStatus = "";

// ADD em Libs ... :     
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};
/* -------------- Status ------------|
  | Cod | Desc          | by who?      |
  |  00 | marcada       | Admin/user   |
  |  01 | Confirmada    | Admin        |
  |  02 | Cancelada      User          |
  |  03 | Realizada     | User/Admin   | 
  |  04 | Não Realizada | User/Admin   |56040e7a9569d76c06456d2e
  |------------------------------------|*/
var statusEnum = {HIT: 0,
			    CONFIRMED: 1,
			     CANCELED: 2,
			     REALIZED: 3,
			  NOTREALIZED: 4, 
			   properties: {
						0: {description: "Marcada",       value: 0, code: "H"},
						1: {description: "Confirmada",    value: 1, code: "C"},
						2: {description: "Cancelada",     value: 2, code: "D"},
						3: {description: "Realizada",     value: 3, code: "R"},
						4: {description: "Não Realizada", value: 4, code: "N"}
				  }};

// Conecta com base de dados... 
mongoose.connect(config.database, function (err, res) {
  if (err) { 
    connStatus = 'ERRO, Falha ao conectar base de dados: '  + err; // + config.database + '. ' + err;
  } else {
    connStatus = 'Conexão realizada com suscesso: '; // + config.database;
  }
});

app.use(express.static(__dirname + '/dist'));  // set the static files location /public/img will be /img for users
app.set('superSecret', config.secret);           // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =================================================================
// routes ==========================================================
// =================================================================
app.get('/setup', function(req, res) {
	res.json({ status: 'success'});

	// create a sample user
	/*var nick = new User({ 
		name: 'Nick Cerminara', 
		password: 'password',
		admin: true 
	});
	nick.save(function(err) {
		if (err) throw err;

		console.log('User saved successfully');
		res.json({ success: true });
	});*/

});

// basic route (http://localhost:8080)
app.get('/', function(req, res) {
	//res.send('Hello! The API is at http://localhost:' + port + '/api');
	res.sendfile('./dist/index.html');
});

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router(); 

apiRoutes.put('/password/:id', function(req, res){

	User.findOne({_id: objectId(req.params.id) }, function(err, user){
		//console.log(req.body);
		
		user.password = req.body.password;
		user.save();

		if(user){
			res.json({status: 'success',
					 message: 'Senha alterada com sucesso.', //Colocar alguma mensagem
						data: []});
		}else{
			res.json({status: 'error',
					 message: 'Não foi possivel alterar senha.', //Colocar alguma mensagem
						data: []});
		}

	});

});
// ---------------------------------------------------------
// singup (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
apiRoutes.post('/signup', function(req, res) {

   /* var user = {login: 'menegat',
                password: 'totvs',
                admin: true};*/

    var usuario = new User({login: req.body.user.email, 
						   password: req.body.user.password, 
						   email: req.body.user.email,
						   number: req.body.user.phone,
						   isAdmin: true, //verificar se sera setado como admin ou nao
                		   isActive: false});

   var newUser = new User(usuario);
   //console.log(req.body.user);   
	// find the user
	User.findOne({
		email: usuario.email //req.param.email
	}, function(err, user) { 		
		if (err) throw err;
		//console.log(req.body.user.password);
		if (user) {			
			res.json({ status: 'error', message: 'Já existe um usuário cadastrado com esse email.' });
		} else if (!user) {
			newUser.save(function(err, result){				
				if(err){
					res.json({ status: 'error', message: 'Falha a criar novo usuário.' });
				}else{				
					// create a token
					var token = jwt.sign(result, app.get('superSecret'), {
						expiresInMinutes: 1440 // 1440 expires in 24 hours
					});
					res.json({user : newUser,
						 	 status: 'success',					
					        message: 'Cadastro realizado com sucesso! Os administradores entrão em contato com você.',
					     	  token: token
					    });
					//rETORNO ESPERADO SE ok
					/*{
					  "usuario": {
					    "__v": 0,
					    "login": "menegat",
					    "password": "totvs",
					    "email": "menegat.marcelo@gmail.com",
					    "number": 5499544269,
					    "isAdmin": true,
					    "isActive": true,
					    "_id": "5660e0aea3df9f1811898439"
					  },
					  "success": true,
					  "message": "Cadastro realizado com sucesso! Os administradores entrão em contato com você.",
					  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfX3YiOjAsImxvZ2luIjoibWVuZWdhdCIsInBhc3N3b3JkIjoidG90dnMiLCJlbWFpbCI6Im1lbmVnYXQubWFyY2Vsb0BnbWFpbC5jb20iLCJudW1iZXIiOjU0OTk1NDQyNjksImFkbWluIjp0cnVlLCJhY3RpdmUiOnRydWUsIl9pZCI6IjU2NjBlMGFlYTNkZjlmMTgxMTg5ODQzOSJ9.kiZ_Mv5MFdnSiWMhQm3XIb_q3cWpoQ81hcUBVa1u0yY"
					}*/
				}
			});
		}
	});

});
// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
// http://localhost:8080/api/authenticate
apiRoutes.post('/authenticate', function(req, res) {

    /*var user = {login: 'menegat',
                password: 'totvs',
                admin: true};

    var usuario = new User({login: 'menegat', 
						   password: 'totvs', 
						   email: 'menegat.marcelo@gmail.com',
						   number: 5499544269,
						   isAdmin: true,
                		   isActive: true});*/

    //console.log(req.body.user);   
	// find the user
	User.findOne({
		email: req.body.user.email //req.body.name
	}).populate('personID')
	  .exec(function(err, user){ 
		if (err) throw err;

		//console.log(req.body.user.password);
	/*setTimeout(function() {*/
		if (!user) {
			res.json({ status: 'error', message: 'Falha de Autenticação. Usuário não encontrado.' });
			console.log('Error nao encontrado.');
		} else if (user) {

			// check if password matches
			if (user.password != req.body.user.password) {
				res.json({ status: 'error', message: 'Falha de Autenticação. Usuário/Senha incorreto.' });
				console.log('Error falha senha.');
			} else {

				// if user is found and password is right
				// create a token
				var token = jwt.sign(user, app.get('superSecret'), {
					expiresInMinutes: 1440 // 1440 expires in 24 hours
				});
				user.token    = token;
				user.password = '';


				//Find provisorio ate a adequação do populate no find do User;
				if(user.personID){
					Person.findOne({_id: user.personID._id }).populate('doctor.speciality').exec(function(err, person){
						user.personID = person;

						res.json({user : user,
								 status: 'success',					
								 message: 'Login realizado com sucesso!',
							     token: token 
							    });

					});
				}else{
					res.json({user : user,
						 status: 'success',					
						 message: 'Login realizado com sucesso!',
					     token: token 
					    });
				}


				
			}		

		}
	//}, 10000);

	});

});
apiRoutes.post('/logout', function(req, res) {


});
// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
apiRoutes.use(function(req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];


	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {			
			if (err) {
				return res.json({ status: 'error', message: 'Falha de Autenticação do token.' });		
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;	
				next();
			}
		});

	} else {
		// if there is no token
		// return an error
		//@AKI
		/*return res.status(403).send({ 
			success: 'error', 
			message: 'Token de Autenticação não foi gerado, contate o Administrador.'
		});*/
		
		res.header("Access-Control-Allow-Origin", "*");
 		res.header("Access-Control-Allow-Methods", "GET,POST,PUT");
 		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 		
		next();
		
	}
	
});

// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------
apiRoutes.get('/', function(req, res) {
	res.json({ message: 'Welcome to the coolest API on earth!' });
});

/**
* ===================================================================================================
* ================================= SETUP/ADMIN ROUTES ==============================================
* ===================================================================================================
*/
apiRoutes.get('/users', function(req, res) {	
	User.find({}, function(err, users) {
		res.json(users);
	});
});

apiRoutes.get('/check', function(req, res) {
	res.json(req.decoded);
});

apiRoutes.get('/conn', function(req, res, next){
	res.json({ status: 'success',
			   connected: connStatus });
});

//, cors()
apiRoutes.get('/setupSpecs', function(req, res){
	var newSpec = {},
	    contadorSpec = 0,
	    contMedico   = 0,
	    specialities = require('./app/setup/speciality.json');

	specialities.forEach(function(element, index, array){
		contadorSpec++;
		newSpec = new Speciality({description: element.description.toProperCase()});
	   	newSpec.save(function(err) {
			if (err) throw err;		
			contadorSpec++;
		});
	}); 

	res.json([{Especialides: contadorSpec},
		      {Medicos: contMedico}]);

});


apiRoutes.get('/setupSchedule', function(req, res, next){

   var specialityId  = objectId('55b0c7d6b206dc1c1114681f'),
   	   doctorId      = objectId("55c3eeb240c3f93c13faa201"), //55dfb017e1b6cb7c11d1c29f
       year          = 2016,
       monthIni      = 2,
       monthend      = 12,

       inicialDay = 1,
       finalDay   = 31,
       appointmenDuration = 15,
       startMorningTime = 8,
       endMorningTime = 12,
       startAfteernoonTime = 14,
       endAfteernoonTime = 18

       hoursPerDay  = [],
       time    = startMorningTime,
       minutes = 0,
       fullTime = time,
       hours = [],
       appointmentDate = Date(),
       //month = 1,
       //hoursPerDay = [],
       fullSchedule = [];
    

	    //var query = Speciality.find().where({'description' : 'Ortopedia E Traumatologia'});
	    //query.exec(function(err, result){

    for(month = monthIni; month <= monthend; month++){ //Intervalo de meses para o ano em questão.

                newSchedule            = new Schedule();
                newSchedule.month      = month;
                newSchedule.year       = year
		    	newSchedule.doctor     = doctorId, 
				newSchedule.speciality = specialityId;		


			while (fullTime <= endAfteernoonTime) {
				if ((time + (minutes / 100) + (appointmenDuration / 100)) < (time + 0.6) ){
		            minutes += appointmenDuration;

			 	} else {
			 		minutes += appointmenDuration - 60;
		    		time++;
			 	}

			 	fullTime = time + (minutes / 100);

			 	if (fullTime >= endMorningTime && fullTime < startAfteernoonTime) {
			 		time = startAfteernoonTime;
			 		minutes = 0;
			 		fullTime = time;
			 	}

				if (fullTime < endAfteernoonTime){
		          hours = new Object();
		          hours.hour = time + ":" + minutes;
		          //console.log("Horas: " + hours.hour);
		          //Atribui horas.
		          hoursPerDay.push(hours);
		       }
		    } //While

		    for (currenteDay = 1; currenteDay <= 31; currenteDay++){
		        appointmentDate = new Date(year,month-1,currenteDay);
		       //somente dias de semana
		        if (appointmentDate.getDay () > 0 && appointmentDate.getDay () < 6){

		        	//Atribui dias.
		            newSchedule.scheduleDate.push({day : currenteDay,
		            							   scheduleTime: hoursPerDay});
			    }
			}

			fullSchedule.push(newSchedule);
			newSchedule.save(function(err){
					///res.json(newSchedule);
			});


	} // 'for'  dos meses
		//}); // especialidade

	res.json(fullSchedule);
	
});

apiRoutes.get('/settings/:id', function(req, res, next){

	Settings.findOne({doctor: objectId(req.params.id) }, function(err, result){
		//console.log(result);
		if(result){
			res.json({status: 'success',
					 message: '', //Colocar alguma mensagem
						data: result});
		}else{
			res.json({status: 'error',
					 message: '', //Colocar alguma mensagem
						data: result});
		}

	});

});

apiRoutes.post('/settings', function(req, res, next){

	var retorno = {},
		optSett  = req.body,
		lgCreateEvents = false,
		//lgLimitChanged = false,
		limitDateOld   = 0;

	//console.log("ID: " + req.body._id);
	Settings.find({doctor: objectId(req.body.doctor)}, function(err, results) {
		//console.log('results');
		//console.log(results[0]);

	    if (results && results.length != 0) {
	    	//console.log('Encontra Settings');
	    	if(results[0].limitDate != optSett.limitDate){
	    		//console.log('Cria events: ' +  results[0].limitDate + ' != ' + optSett.limitDate);
	    		lgCreateEvents = true;	    			    		
	    	}
	    	Settings.remove({doctor:  objectId(req.body.doctor)}, function(err, returns){
	    		//console.log("Remove: " + req.body._id)
	    		addNewSettings(req.body);
	    	})
	    	/*results.remove(function(err){
	    		//console.log("Remove: " + req.body._id)
	    		addNewSettings(req.body);	    	
	    	});	    	       */
	    } else { 
	        lgCreateEvents = true;	                
	        addNewSettings(req.body);
	    }
	});

	function addNewSettings(settingArr){
		//var setting = new Settings(settingArr);
		//setting.save();
		//console.log(req.body);
		var settings = new Settings({'limitDate' : settingArr.limitDate,
		        				      'startDate': settingArr.startDate,
		        				  'particularQtd': settingArr.particularQtd,
		        				      'duration' : settingArr.duration,
		        				        'doctor' : objectId(settingArr.doctor),
		        				    'speciality' : objectId(settingArr.speciality),
		        				          'city' : settingArr.city,
		        				      'saturday' : [],
		        				        'friday' : [],
		        				     'thuersday' : [],
		        				     'wednesday' : [],
		        				       'tuesday' : [],
		        				        'monday' : [],
		        			 	         'sunday': []
		});		

		/*for (var i = settingArr.saturday.length - 1; i >= 0; i--) {
			console.log(settingArr.saturday[i]);
			settings.saturday.push(settingArr.saturday[i]);
		};*/
		for (var i = settingArr.friday.length - 1; i >= 0; i--) {
			//console.log(settingArr.friday[i]);
			settings.friday.push(settingArr.friday[i]);
		};
		for (var i = settingArr.thuersday.length - 1; i >= 0; i--) {
			//console.log(settingArr.thuersday[i]);
			settings.thuersday.push(settingArr.thuersday[i]);
		};
		for (var i = settingArr.wednesday.length - 1; i >= 0; i--) {
			//console.log(settingArr.wednesday[i]);
			settings.wednesday.push(settingArr.wednesday[i]);
		};
		for (var i = settingArr.tuesday.length - 1; i >= 0; i--) {
			//console.log(settingArr.tuesday[i]);
			settings.tuesday.push(settingArr.tuesday[i]);
		};
		for (var i = settingArr.monday.length - 1; i >= 0; i--) {
			//console.log(settingArr.monday[i]);
			settings.monday.push(settingArr.monday[i]);
		};
		/*for (var i = settingArr.sunday.length - 1; i >= 0; i--) {
			console.log(settingArr.sunday[i]);
			settings.sunday.push(settingArr.sunday[i]);
		};*/

    	settings.save(function(err){
    		console.log("@MMENEGAT - lgCreateEvents: " + lgCreateEvents);
	    	if(err){   
	    		console.log(err);
	    	 	retorno = {status:'error',
				           message: 'Não foi possível salvar as configurações!',
						   settings: [],
						   lgCreateEvents: lgCreateEvents
						  }
	    	}else{
	    		retorno = {status:'success',
				          message: 'Configurações salvas com sucesso!',
				          settings: settings,
						   lgCreateEvents: lgCreateEvents
						  }

	    	} 
	    	res.json(retorno);	    	
    	});
	};

});

apiRoutes.post('/events', function(req, res, next){

    var duration = moment.duration({'days' : 1}),
		doctorId = objectId(req.body.doctor),
	specialityId = objectId(req.body.speciality),  		  
	 data_limite = req.body.limitDate, //moment('2016-12-31'), //moment().add({'days': 60}),
	    data_ini = req.body.startDate, //moment(), //Today
	   actualDay = data_ini,
	   eventcity = parseInt(req.body.cityId), //4305108, //Caxias do SUl	    
	       event = [],
	   eventsett = [],
	  settingArr = [],
	   contador  = 0;

	MongoClient.connect(config.database, function(err, db) {

	  	assert.equal(err, null);

	  	//db.collection('settings').find({doctor: doctorId}).toArray(function(err, settings) {
	  	var settings = db.collection('settings').find({doctor: doctorId});	  			  		
	  	   assert.equal(err, null);
      	   assert.notEqual(settings.length, 0);

      	   settings.forEach(function(setting){
      	   		// Gera Diarias(Events) conforme parametrização no Settings	
				while(moment(actualDay).format('YYYYMMDD') <= data_limite){
					//console.log('@PASSO 2: ' + actualDay);			
					//Verifica se o Settings considera o dia analisado para criação do registro.
					//console.log(isUsual(actualDay, setting));
					if(isWorkable(actualDay, setting)){
						//console.log('Cria registro');
						//Cria novo Event.
						event = new Event({
							  doctor: doctorId,  //objectId('56a660accb44ebac2fcf5345'),
					      speciality: specialityId, //objectId("56943300dd3628fc1356226e"),
					       eventcity: eventcity,
					       eventDate: moment(actualDay).format('YYYYMMDD'),
					       //eventDate: moment(actualDay).format('YYYYMMDD'), // D: 31 | MM: 12 | YYYY: 2016
						});
						event.save();
						eventsett.push(event);
						contador ++;
					}
					
					//Incrementa dias para geração.
					actualDay = incrementDay(actualDay); 				
			
				}; //While

      	   },function(err){
     	  		
	 			//res.json(eventsett);
	 			var retorno = {};
				if(eventsett.length > 0){
					retorno = {status:'success',
					           message: 'Agenda criada com sucesso!',
							   events: []
							  }
				}else{
					retorno = {status:'error',
					           message: 'Não foi possível realizar a criação da agenda!',
							   events: []
							  }
				}
				res.json(retorno);

	 			db.close();

      	   }); 
      	           		   
      	//}); //settingsdb
   
	}); 
	
	// Função tera que contemplar calendario de feriados - Versao futura	
	function incrementDay(actualDay){

		return moment(actualDay).add(duration);	

		//console.log('@PASSO 3: ' + actualDay.format());
		//moment().isoWeekday(1) 
		//Veriifica se é fim de semana.
		/*if(actualDay.day() !== 0 && actualDay.day() !== 6){
			console.log("Dia de semana");
		}else{
			console.log("Fim de semana");
		}*/

		//return moment(actualDay);
	}

	function isWorkable(eventDate, setting){
	   //var eventDate = new Date(2016,02,17); //Pegar do event.eventDate usando moment.
	   /*console.log('eventDate:  ' + eventDate);
	   console.log('eventDate 2 :  ' + moment(eventDate).day());*/
	   //console.log(setting);
	   //@REVIEW
	   return true;
	   /*switch(moment(eventDate).day()){
	   	  case 0: 
	   	  	//console.log("Domingo: " + setting.sunday.worktime);
	   	    if(setting.sunday.length > 0)	   	    
	   	    	return true;
	   	    else return false;	   	    
 		  break;
 		  case 1: 
	   	    if(setting.monday.length > 0)
	   	    return true;
	   	    else return false;
 		  break;
 		  case 2: 
 		  	//console.log("Terça: " + setting.tuesday.worktime.ini);
	   	    if(setting.tuesday.length > 0)
	   	    return true;
	   	    else return false;
 		  break;
 		  case 3: 
	   	    if(setting.wednesday.length > 0)
	   	    return true;
	   	    else return false;
 		  break;
	      case 4: 
	   	    if(setting.thuersday.length > 0)
	   	    return true;
	   	    else return false;
 		  break;
 		  case 5:  
	   	    if(setting.friday.length > 0)
	   	    return true;
	   	    else return false;
 		  break;
 		  case 6: 
	   	    if(setting.saturday.length > 0)
	   	    return true;
	   	    else return false;
		  break;
		  default:
		  	return false;
		  break;
	   }*/ 
	}
	
});


/**
* ===================================================================================================
* ======================================== PERSON ROUTES ============================================
* ===================================================================================================
*/

apiRoutes.route('/user/:id')
	.put(function(req, res, next) {
		var objResult = {};  


		console.log(req.body);
		console.log('-------------------------------');
		console.log('Id: ' + req.params.id);

		User.findById(req.params.id, function(err, user){
			if(err)
				res.json(err);		

			user.personID = objectId(req.body._id);		
			//console.log(user);
			user.save(function(){
				objResult = {status: 'success',
						    message: 'Usuário atualizado com sucesso',
							   user: user					
							};
				res.json(objResult);
			});
			/*
			user.save(function(err){		
				objResult.status = true;
				objResult.user    = user;
				res.json(user);
			});s
			*/

		});
	}); //Post person

// Add novos Users no DB
apiRoutes.route('/person')
	.post(function(req, res, next) {

		var newPerson = new Person(req.body);
		var objResult = {};   

		//console.log(req.body)
		//console.log("ID USER: " + newPerson.userId);
		//res.json(req.body);
		if(newPerson.userId){
			Person.findOne({'userId': newPerson.userId}, function(err, user){
					//console.log(user);
				if(user){
					user.verfifyID = newPerson.verfifyID;

					user.save(function(err){
							if(err){
								res.json(err);
							}else{
								objResult = {status: 'success',
											message: 'Usuário atualizado com sucesso.',
										     person: user
										};
								res.json(objResult);
							}
					});
				}
				else saveNewUser();
			});
		}else saveNewUser();
		
		function saveNewUser(){
			//console.log('CHAMA saveNewUser');
			//objResult.status = 'success';
		    //objResult.person = newPerson;
		    //res.json(objResult); 
			newPerson.save(function(err) {
				if(err){
					//console.log("ERRO NO USER");
					res.json(err);
				}else{
					objResult = {status: 'success',
								message: 'Usuário atualizado com sucesso.',
								 person: newPerson
								};
					res.json(objResult);
				}
			});
		};
	}); //Post person

apiRoutes.route('/person/:id')
	.put(function(req, res, next) {
		Person.findById(req.params.id, function(err, person){
			/*if(err)
				res.json(err);*/

			var customer = req.body;
			//console.log(customer);
			person.name  = customer.name,	
			person.lastname = customer.lastname			
			person.lastname = customer.lastname,  
			person.cardId = customer.cardId, //CPF/CNPJ
			person.userId = customer.userId, //Celular usuario/ID Medico  ou ID do User login sistema.
			person.verfifyID = customer.verfifyID; // Cod verificação do Numero de celular.  		

			if(customer.doctor){
				person.doctor.crmId = customer.doctor.crmId,
      			person.doctor.ranking = customer.doctor.ranking,   
  				person.doctor.evaluations = customer.doctor.evaluations,
       			person.doctor.cityId = customer.doctor.cityId,  //IBGE ID           
      			person.doctor.contact = customer.doctor.contact,
       				person.doctor.address.cityId = customer.doctor.address.cityId, //IBGE ID
				 	person.doctor.address.zipcode = customer.doctor.address.zipcode, 
				 	person.doctor.address.streetAdd = customer.doctor.address.streetAdd,                    
				 	person.doctor.address.cityState = customer.doctor.address.cityState,
				 	person.doctor.address.complemento = customer.doctor.address.complemento,
				 	person.doctor.address.formatted_address = customer.doctor.address.formatted_address,
				 	person.doctor.address.lat  = customer.doctor.address.lat,
				 	person.doctor.address.lng  = customer.doctor.address.lng,
       			person.doctor.speciality = customer.doctor.speciality;				
			}else{
				var birthday = parseInt(moment(customer.birthday.substring(0, 10)).format('YYYYMMDD'));
				person.healthCareId = parseInt(customer.healthCareId),
				person.birthday = birthday;
			}
			/*else{				
				//Atualiza Dados
	            person.name         = req.body.name;
				person.lastname     = req.body.lastname;
				person.birthday     = birthday;				
			}*/

			person.save(function(err){
				/*if(err)
					res.json(err);*/
					var result = {
						status: 'success',
						message: 'Perfil atualizado com sucesso!',
						person: person
					};

				res.json(result);
			});
		});
	}); //Post person

/**
* ===================================================================================================
* ========================================= APP ROUTES ==============================================
* ===================================================================================================
*/
// Pega todos os medicos no DB
apiRoutes.get('/doctors', function(req, res, next) {
	var param = [];

	//console.log(req.query);
	if(!req.query.specialityId)
		 param.push({'doctor' : {'$exists': true}});
	else param.push({'doctor' : {'$exists': true},
		  			 'doctor.speciality._id' : req.query.specialityId});

	//console.log(param);

	Person.find(param[0], function(err, doctors) {
		res.json(doctors);
	});

});

/**
* ===================================================================================================
* ================================ TEMPORARY ROUTES ==============================================
* ===================================================================================================
*/
// PEGA TODAS AS CONSULTAS BY DOCTOR @aki
apiRoutes.get('/events/:id', function(req, res, next) {

	if(!req.params.id)
		res.json({status: 'error'});

	var period     = parseInt(moment().format('YYYYMMDD')),
		//month        = dateTime.getMonth() + 1,
		appointments = [],
		appmtHours   = [],
		lastDoctor   = objectId(),
		query		 = {},
		result       = {},
		//option       = parseInt(req.params.getOption)
		customerID       = objectId(req.params.id)
		aggregateQry = [],
		eventTimeAux = moment(),
		evenTimeIni = moment(),
		evenTimEnd = moment(),
		patientNameAux = '',
		patientHealthCareAux = 0,
		userIdAux = 0;

    //Apprimorar query e objeto de retorno.
	Event.aggregate( [{'$match': {'doctor' : customerID,
		  		 	'appointments.patient': {$exists: true }	                         
		              }},
		            {'$unwind': "$appointments"},

		            {'$match': { 
		             		     'appointments.status'  : {$nin : [statusEnum.REALIZED,
		               		   	                                 statusEnum.NOTREALIZED,
		                 		   	                                 statusEnum.CANCELED]} }},		                                          
		                       /* {'$project' : {patient   : '$doctor',
		                                       speciality: '$speciality',
		                                       eventDate  : '$eventDate',
		                                       time       : '$appointments.time',
		                                       timeID     : '$appointments._id' }},
		                        {'$sort' : { eventDate : 1} }*/ ] , function(err, events){		

		Person.populate(events, {path: 'appointments.patient'}, function(err, populatedEvents) {
            populatedEvents.forEach(function(eventsBy){ // Varre as os horarios disponivels para retorno	            
            	/*console.log('-----------------------------------------------------');
                console.log(eventsBy.appointments.patientName);		
                console.log('-----------------------------------------------------');*/
				eventTimeAux = eventsBy.eventDate+"-"+eventsBy.appointments.time,
				evenTimeIni = moment(eventTimeAux, 'YYYYMMDD-H:mm').format(),
				evenTimEnd  = moment(eventTimeAux, 'YYYYMMDD-H:mm').format();

				if(eventsBy.appointments.patient){
					patientNameAux = eventsBy.appointments.patient.name,
					patientHealthCareAux = eventsBy.appointments.patient.healthCareId,
					userIdAux = eventsBy.appointments.patient.userId;
				}else{
					patientNameAux = eventsBy.appointments.patientName,
					patientHealthCareAux = 0, // eventsBy.appointments.patient.healthCareId;
					userIdAux = eventsBy.appointments.userID; 
				}

				events = {id: eventsBy._id,					    
							dayId: eventsBy._id,
					    hourId: eventsBy.appointments._id, 
					     title: patientNameAux,
				         start: evenTimeIni,
				        score: eventsBy.appointments.score,
				    hitStatus: eventsBy.appointments.status,
				       userId: userIdAux,
				 healthCareId: patientHealthCareAux,
				          end: moment(evenTimEnd).add(15, 'm').format(),
				          stick: true
						};	
						/*console.log("Start DAte" + moment(evenTimeIni).toDate());
				events = {id: eventsBy._id,					    
					     title: patientNameAux,
				         start: evenTimeIni,
				          end: moment(evenTimEnd).add(15, 'm').format()
						};*/

										
				appmtHours.push(events);					
			});
            result = {status: 'success',
					 message: '',
					  events: appmtHours
			 		  };
			res.json(result);            
        });
	});

});
// Pega todos os horarios no DB - ROTA USADA PELO APP
apiRoutes.post('/schedule', function(req, res, next) { 
	/* @aki agora */

	if(!req.body)
		res.json({status: 'error'});

	var schdlGetFree = req.body, //JSON.parse(req.query.param),
		iniPer       = parseInt(moment(schdlGetFree.iniPer.substring(0, 10)).format('YYYYMMDD')), //new Date(schdlGetFree.perIni),
		endPer       = parseInt(moment(schdlGetFree.endPer.substring(0, 10)).format('YYYYMMDD')),  //new Date(schdlGetFree.perEnd),
		doctorId     = objectId(schdlGetFree.doctorId), //objectId('56a660accb44ebac2fcf5345'),
		getOption    = parseInt(schdlGetFree.getOption), 
		cityCode     = parseInt(schdlGetFree.cityCode), 
		specialityId = schdlGetFree.specialityId, 
		numMatches   = 0,
		createdDays  = [],
		settings     = [],
		events       = [],
		freeDay      = [], // Corresponde ao dia / horas
		avaiableTime     = [], // Corresponde a lista de Dias/hora disponiveis
		query    = {};

	/* ------------------------------------------------------------------------- /
	* getOption = 1 retorna apenas Prestadores por Espec/Cidade. //Possibilidade de melhoria ahaah	
	*/
	if(getOption == 1){

		
    var aggregateQry = [ {'$match' : {eventcity  : cityCode,
					                  speciality : objectId(specialityId), 
					                    fulldate : false,
					                   eventDate : { $gte: iniPer,
							                 			$lte: endPer }
					                        } } ,
		   			     {'$group' : { "_id" : "$doctor"}},
		   			    /* {'$lookup' : { 'from'         : 'people',
		                                'localField'   : '_id',
		                                'foreignField' : '_id',
		                                'as'           : 'doctorObj'}},
		                  {'$unwind' : "$doctorObj"},*/
		                  {'$project' : {doctor : '$_id',
		                                _id : 0} }


		                 ];
		               

	Event.aggregate(aggregateQry, function(err, events){
		//console.log(events);

		Person.populate(events, {path: 'doctor'}, function(err, populatedEvents) {

		//console.log(populatedEvents);
	    res.json(populatedEvents);
	    });
	});           

	}else{
		 var query      = [  { $match:{doctor  : doctorId, 
		                     		 eventDate: { $gte: iniPer,
		                     		 			  $lte: endPer },
		                     		   fulldate: false } },
		                     { $project: { fulldate: '$fulldate',
	                                       appoint : '$appointments.time',
	                                     eventdate : '$eventDate' }}
	                        ];

		Settings.find({doctor: doctorId}, function(err, settings){
	                    
			if (!settings || settings.length == 0){
				res.json( {});
			}

			Event.aggregate(query, function(err, events){

				if (!events || events.length == 0){
					res.json( {});
				}

				for (var i = 0; i < events.length; i++) {
					eventIteration(events[i], settings[0]);

					if (i == events.length - 1){
			           		  	res.json(avaiableTime);
					}
				};
							  	});
	        	});
	                  		   
	} // IF getOption

	function eventIteration(event, setting){
						//Pegar do event.eventDate usando moment. 01 12 2016

	   var dtConvertion = moment(event.eventdate,'YYYYMMDD').format(), //@Criar function para conversão de datas
	   		  eventDate = moment(dtConvertion).day();	
	                   //new Date(2016,02,17); //Pegar do event.eventDate usando moment.
	   switch(eventDate){
	   	  case 0: 
	   	     verifyFreeTime(setting.sunday, event, setting.duration);
 		  break;
 		  case 1: 
	   	     verifyFreeTime(setting.monday, event, setting.duration);
 		  break;
 		  case 2: 
	   	     verifyFreeTime(setting.tuesday, event, setting.duration);
 		  break;
 		  case 3: 
	   	     verifyFreeTime(setting.wednesday, event, setting.duration);
 		  break;
	      case 4: 
	   	     verifyFreeTime(setting.thuersday, event, setting.duration);
 		  break;
 		  case 5: 
	   	     verifyFreeTime(setting.friday, event, setting.duration);
 		  break;
 		  case 6: 
	   	     verifyFreeTime(setting.saturday, event, setting.duration);
		  break;
	   }
	}

	function verifyFreeTime(day, event, duration){

		//Utilizar o moment para formatar as horas/dias		
		var freeTime = {};
		freeTime = {_id  : event._id,
					 day : moment(event.eventdate,'YYYYMMDD').format('D/MM/YYYY'),
                    time : []
                   };


		for (x = 0; x < day.length; x++){

			var initialTime = day[x].WorkTime.ini;
			var finalTime   = day[x].WorkTime.end;
			var iniHour     = parseInt(initialTime.substring(0, 2));
			var iniMin      = parseInt(initialTime.substring(3, 5));
			var finHour     = parseInt(finalTime.substring(0, 2));
			var finMin      = parseInt(finalTime.substring(3, 5));
			var appTime     = '';

            while (iniHour <= finHour){             
                if (iniMin < 10){
                	appTime = iniHour + ':0' + iniMin;	
                } else {
                	appTime = iniHour + ':' + iniMin;	
                }

                /*verifica se tem horario ocupado:
				  - Se nao tiver, entao gravar o apptime como horario livre
				  - Se tiver entao desconsiderar o registro. 
				*/
                 if (event.appoint.indexOf(appTime) == -1){
                    freeTime.time.push(appTime);
                 }


				if ((iniMin + duration) < 60 ){
					iniMin = iniMin + duration;
				} else {
					iniHour++;
					iniMin  = iniMin - 60 + duration;
				}

				if ((iniMin + duration > 60) && (iniHour + 1 == finHour)){
					iniHour++;
				}

				if ( (iniHour == finHour) && (iniMin >= finMin) ){
					iniHour++;
				}
			};
		}
        if (freeTime.time.length > 0){
        	avaiableTime.push(freeTime);
        }
	}	// verifyFreeTime		


}); //GET Schedule


/**
* Collection: Events
* Action: Retorna lista de consultas
* option: 1 - Retorna lista de consultas por Beneficiário.
*		  2 - Retorna lista de historico de consultas por Beneficiário.
*		  3 - Retorna lista de consultas por Médico. OBS: Analisar esta opção, talvez criar outra rota para esse /Events
* Called By: Mobile Aplication
**/
apiRoutes.get('/schedule/:userId/:getOption', function(req, res, next) {

    if(!req.params.userId)
		res.json({status: 'error'});

	var period     = parseInt(moment().format('YYYYMMDD')),
		//month        = dateTime.getMonth() + 1,
		appointments = [],
		appmtHours   = [],
		lastDoctor   = objectId(),
		query		 = {},
		result       = {},
		option       = parseInt(req.params.getOption)
		userID       = objectId(req.params.userId)
		aggregateQry = [];


		switch(option){			
			case 1:
				aggregateQry = [ {'$match': {'appointments.patient': {$exists: true },
		                                     'appointments.patient': userID
		                                }},
		                        {'$unwind': "$appointments"},
		                        {'$match': { 'appointments.patient': userID,
		                        		     'appointments.status'  : {$nin : [statusEnum.REALIZED,
		                        		   	                                 statusEnum.NOTREALIZED,
		                        		   	                                 statusEnum.CANCELED]} }},
		                                          
		                        {'$project' : {doctor   : '$doctor',
		                                       speciality: '$speciality',
		                                       eventDate  : '$eventDate',
		                                       time       : '$appointments.time',
		                                       timeID     : '$appointments._id' }},
		                        {'$sort' : { eventDate : 1} }];
		    break;
		    case 2:
				aggregateQry = [{'$match': {'appointments.patient': {$exists: true },
		                                    'appointments.patient': userID
		                                }},
		                        {'$unwind': "$appointments"},

		                        {'$match': { 'appointments.patient': userID,
		                                     'appointments.status' : { $nin : [statusEnum.HIT,
		                                     								   statusEnum.CONFIRMED] }
		                        				
		                    				}},
		                                                    
		                        {'$project' : {doctor     : '$doctor',
		                                       speciality : '$speciality',
		                                       eventDate  : '$eventDate',
		                                       time       : '$appointments.time',
		                                       timeID     : '$appointments._id',
		                                       status     : '$appointments.status',
		                                       score      : '$appointments.score' }},
		                        {'$sort' : { eventDate : -1} }];
		                      
		    break;
		    case 3:
				aggregateQry = [];
		    break;
        }

    //Apprimorar query e objeto de retorno.
	Event.aggregate( aggregateQry, function(err, events){
		Person.populate(events, {path: 'doctor'}, function(err, populatedEvents) {
            Speciality.populate(populatedEvents, {path: 'speciality'}, function(err, populatedEventswE) {
              //console.log(populatedEventswE);
              result = {status: 'success',
						message: '',
				 		events: populatedEventswE
			 		   };
			   res.json(result);
            });
        });
	});


});

/**
* Collection: Events
* Action: Manipula dados de Eventos, 'Incluir', modificar.
* Option: 1 - Marca consulta
*         2 - Atualiza dados de Status/Score de uma consulta ja marcada. @aki
**/
apiRoutes.put('/schedule', function(req, res, next) {
    //console.log(req.body);
    var param  =  req.body,
        queryAdd = {},
        queryby = {},
        result = {};

        //console.log(param);
    /**
    * param.updOption: 1 - Marca consulta
    *				   2 - Atualiza dados de Status/Score de uma consulta ja marcada.
    **/
    if(param.updOption == 1){
    	//Verfica se horaio esta disponivel.
    	if(param._id){ // Chamada pelo APP
    		queryAdd = {'_id' : objectId(param._id),
    		           'appointments.time': param.appmtTime};
    		queryby = {'_id' : objectId(param._id)};   		

    	}else{ // Chamada pelo portal
    		queryAdd = {'eventDate' : param.eventDate,
    		           'appointments.time': param.appmtTime};    		
    		queryby = {'eventDate' : param.eventDate};
    	}

    	Event.findOne(queryAdd, function(err, result){    		
    		if(result){
    			res.json({status:'error',
    					 message: 'Horário já foi preenchido por outro paciente, por gentileza selecione um novo horário' });
    		}else {
    			/*res.json({status:'success',
    					 message: 'Horário disponível'});*/    					
    			
    			saveScheduleTime();
    		}

    	});	
	}else{		

		var query =  {'_id' : objectId(param._id),
	                  'appointments._id' : objectId(param._hourId),
	                 },
	    	uquery = {$set : {'appointments.$.status' : param.status,
	     	                  'appointments.$.score' : param.score }};
	    //console.log(query);
	    //console.log(uquery);               
	    Event.update(query, uquery,  function(err, isUpdated){

             /*ATUALIZA O RANKINGO DO MEDICO*/
             if (param.doctorId){
		         Person.findOne({'_id' : param.doctorId}, function (err, person){
		          if (person.doctor.evaluations && person.doctor.evaluations > 0){
		          	var evaluationsOld = person.doctor.evaluations;
		          	var rankingOld = person.doctor.ranking;
		          	
		          	person.doctor.evaluations = person.doctor.evaluations + 1;
		          	person.doctor.ranking = (rankingOld * (evaluationsOld / person.doctor.evaluations))
		          	                      + (param.score * (1 / person.doctor.evaluations));

		          } else {
		          	person.doctor.evaluations = 1;
		          	person.doctor.ranking = param.score;
		          }
				  person.save();
				  //console.log(isUpdated);   
                     
                  res.json({status: 'success',
		     		       message: 'Consulta atualziada.',
		     		     isUpdated: isUpdated });
				  
		          //res.json(isUpdated);

				});
		     } else {
		     	//res.json(isUpdated);
                res.json({status: 'success',
		     	         message: 'Consulta atualziada.',
		     		   isUpdated: isUpdated });
		     }
	    });
	}

	//Salva consulta caso horário esteja OK.
	function saveScheduleTime(){

	   var sendAt = moment(param.eventDate + param.appmtTime, "DD/MM/YYYYHH:mm").subtract(1, 'days').toDate();

	   console.log("Paciente: " + param.patientName + " - " + param.userId);
		Event.update( queryby, //'56c11425cc666351d2fa92b4'
		             { $push : {'appointments' : {'time' : param.appmtTime, //(new Date()).getTime() 
		    									'patient' : objectId(param.patientId),
		    								     'userID' : param.userId,
											'patientName' : param.patientName, //patientName
		     								     'status' : param.status, //statusEnum.HIT,
		     		  							  'score' : 0 } 
		     					}
		     		 }, function(err, isUpdated){

		     res.json({status: 'success',
		     		  message: 'Consulta agendada com sucesso',
		     		isUpdated: isUpdated });

             if ((moment().toDate() < sendAt) && (param.onesignalId) ) {
             	//console.log('enviou')
		     	var message = { app_id: "6941af11-bdad-4204-b8da-472b5e1172a5",
				                headings :  {"en": "O Quanto Antes"},
				                send_after : sendAt,
				                contents: {"en": "Você possui uma consulta agendada, clique aqui e verifique o horário da mesma para não se atrasar."},
				                include_player_ids: [param.onesignalId] };
				sendNotification(message);	 	
		     }

		     //res.json(isUpdated);
		});

		
	}

	function sendNotification(data){
		var headers = { 
			            "Content-Type": "application/json",
					    "Authorization": "Basic OGE3YWE0MmYtNDE1OC00Yzc4LTk3NTEtNjFmOGRhZDMxODNm"
					  };
         var options = {
					    host: "onesignal.com",
					    port: 443,
					    path: "/api/v1/notifications",
					    method: "POST",
					    headers: headers
					  };
         
         //console.log("oi");

		 var reqSignal = https.request(options, function(res) {  
		    res.on('data', function(data) {
		      //console.log("Response:");
		      //console.log(JSON.parse(data));
		    });
		 });

		 reqSignal.on('error', function(e) {
    	    //console.log("ERROR:");
		    //console.log(e);
		  });
		  
		 reqSignal.write(JSON.stringify(data));
		 reqSignal.end();
	}
    

});//PUT events

apiRoutes.get('/doctorsByIds/:params', function(req, res, next) {

	if(req.params.params){

		var param     = req.params.params.split(';'),
			condition = [];

		if(param[0] != 0 && param[1] != 0){
			condition.push({'doctor' : {'$exists': true},
			 'doctor.address.cityId' : param[1],
			 'doctor.speciality._id' : objectId(param[0])});
		}else if(param[0] != 0){
			condition.push({'doctor' : {'$exists': true},
			 'doctor.speciality._id' : objectId(param[0])});
		}else {
			condition.push({'doctor' : {'$exists': true},
			 'doctor.address.cityId' : param[1]});
		}
		Person.find(condition[0], function(err, doctors) {
			res.json(doctors);
		});

	}else{
		res.json({status: 'error'});
	}

});


/**
* ===================================================================================================
* ================================ SPECIALITIES ROUTES ==============================================
* ===================================================================================================
*/
// Pega todos as especialidades no DB
apiRoutes.get('/specialities', function(req, res) {
	var result = [];
	Speciality.find({}, function(err, specs) {
		res.json(specs);
	});
});

/**
* ===================================================================================================
* ===================================== ADDRESS ROUTES ==============================================
* ===================================================================================================
*http://api.postmon.com.br/v1/cep/95030470
*/
apiRoutes.route('/city')
	.get(function(req, res, next){
		City.find({}, function(err, cities) {
			res.json(cities);
		});
	})
	.post(function(req, res, next) {
		var city = new City(req.body);
					/*new City({city: "Caxias do Sul",           
			         	 city_ibge: 4305108,
			                 state: "RS",
			        	state_ibge: 43
					});*/
		
		City.findOne({city_ibge: city.city_ibge }, function(err, result) { 		

				if (err) throw err;

				if(!result) {
					city.save(function(err) {
						if (err){			
							res.json(err);
						} 				
						res.json({status: 'success',
								 message: 'Cidade inserida com suscesso.',
									city: city });
					});	
				}else{
					res.json({status: 'success',
						     message: 'Cidade já exise no sistema.',
								city: [] });
				}
		});
		
	});


apiRoutes.get('/person/:personId', function(req, res){
	//console.log("ola person");
	//console.log(req.params.personId);
	var query = {};	
	if(req.params.personId.length <= 15){
		query = {'userId' : req.params.personId };		
	}else{
		query = {'_id' : objectId(req.params.personId) };		
	}

	Person.findOne(query, function(err, doc){
		console.log(doc);
		res.json(doc);
	});
	    
});


app.use('/api', apiRoutes);

// =================================================================
// start the server ================================================
// =================================================================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
/*console.log("PORTA: " + process.env.PORT);
console.log("TYPE_ENV: " + process.env.TYPE_ENV);*/

