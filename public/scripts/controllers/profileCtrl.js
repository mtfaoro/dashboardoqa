'use strict';
/**
 * @ngdoc function
 * @name dashboardApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the dashboardApp
 */
app.service('ProfileSrvc', function($http, Data){

	var service = this, 
	    zipRoute      = 'http://api.postmon.com.br/v1/cep/',
	    locationRoute = 'https://maps.googleapis.com/maps/api/geocode/json?address=',
	    compLocation  = '&region=br&key=AIzaSyCzLCvV7gRr0iA8_ub4TrgWSRYIX88jRPQ',
	    //routeAux = 'http://localhost:3000/api/specialities/',
	    arrayCollection = [];

    service.getByzipcode = function (param){	
	  return $http.get(zipRoute + param).then(function(results) {
            return results.data;
       });
	};

	service.getLocation = function(param){
		return $http.get(locationRoute+param+compLocation).then(function(results){
			return results.data;
		});
	};

	service.getSpecialities = function(){				
		Data.get('specialities').then(function(results) {
		 	//arrayCollection = results;		 	
            //if (results.success) {  
         	return results;                       
            //} //else return [{id: 0,
               //			   description: 'Especialidades não encontradas'}];
        });
	};

})
.controller('ProfileCtrl', function($scope, $rootScope, $routeParams, $location, $http, Data, Person, ProfileSrvc, $toast, $uibModal) {


    $scope.doctorFrm = {};    
    $scope.changePass = changePass;

    //var personID: Person.getPersonId();

    function changePass(){   

     	var modalInstance = $uibModal.open({
     	   animation: true, //$scope.animationsEnabled,
     	   templateUrl: 'changePassModal.html',
     	   controller: 'changePassModalCtrl',
     	   size: 'lm'
     	});
     	 //Retorno do Modal
     	modalInstance.result.then(function (returnData) {
     	   //$scope.selected = selectedItem;
     	   //console.log('add item');
     	   //console.log(returnData);
     	   //$scope.insertEvent(eventData);          
     	}, function () {
     	   //$log.info('Modal dismissed at: ' + new Date());
     	     
     	}); 	

    };    

    function setCustomerForm(){  
    	var customer     = Person.getCustomer();
    	//console.log(customer);
    	if(customer._id){
    		$scope.doctorFrm = Person.getCustomer();
    		//console.log("specialidade: ");
    		//console.log($scope.doctorFrm.doctor.speciality);
		}
    };
    
    //$scope.specialitieslist  =  ProfileSrvc.getSpecialities();
    //Busca provisoria, retorno atraves do Data esta retornando $$state
   	//
   	$http.get('/api/specialities/').then(function(results) {
	    $scope.specialitieslist  =  results.data;
    }); 
   

	//Function temporaria, verificar melhor modo de implemntar este trecho.
	function updateUser(customer){

		Data.put('user/'+Person.getPersonId(), customer ).then(function(results){
			//Data.toast(results);
			$toast.show(results); 
			//console.log(results.user);
			$rootScope.personID         = results.user.personID._id;
            $rootScope.customerLoggedId = results.user.personID._id;
            $rootScope.isCustomer       = true;		
            
            setCustomerForm();
		});

	};

    $scope.saveDoctor = function(customer){

    	var isNew = false;

    	//console.log("isNEW? " + $scope.doctorFrm._id);
    	if(!$scope.doctorFrm._id || $scope.doctorFrm._id === null || $scope.doctorFrm._id === "" )
    		isNew = true;

		customer.doctor.speciality = $scope.doctorFrm.doctor.speciality._id;
		if(isNew){
			Data.post('person', customer ).then(function(results){
				//Data.toast(results);
				$toast.show(results);
	            //console.log(results);       
	            if (results.status = 'success') {  
	                Person.setCustomer(results.person);
					//if(isNew){
		                Person.setCustomerId(results.person._id);             
		                $scope.doctorFrm._id = results.person._id;
		                updateUser(results.person);
	            	//}
	            }
			});
		}else{
			//$toast.show({status: 'error', message: 'Falha ao atualziar o usuário, entre em contato com um Administrator!'});
			/*console.log("Epesc ID: " + $scope.doctorFrm.doctor.speciality._id);
			console.log("Epesc : " + $scope.doctorFrm.doctor.speciality);*/
			//customer.doctor.speciality = $scope.doctorFrm.doctor.speciality._id;

			console.log(customer.doctor.speciality);
			Data.put('person/' + customer._id, customer ).then(function(results){
				//Data.toast(results);
				//console.log(results);				
				$toast.show(results);
				if(results.status = 'success'){
					//$scope.doctorFrm = results.person;
				}
			});
		}


	};

	
	$scope.getAddresByZipcode = function(zipCode){
		/*{
			"bairro": "Cinq\u00fcenten\u00e1rio",
			"cidade": "Caxias do Sul",
			"cep": "95012280",
			"logradouro": "Rua dos Jacarand\u00e1s",
			"estado_info": {
				"area_km2": "281.731,445",
				"codigo_ibge": "43",
				"nome": "Rio Grande do Sul (*)"
			},
			"cidade_info": {
				"area_km2": "1644,296",
				"codigo_ibge": "4305108"
			},
			"estado": "RS"
		}*/
		//console.log("Zip code: " + zipCode);
		ProfileSrvc.getByzipcode(zipCode).then(function(results){
			//Add um load :) 
			$scope.doctorFrm.doctor.address.streetAdd   = results.logradouro +', 00 ,' + results.bairro;
			$scope.doctorFrm.doctor.address.cityState   = results.cidade +' - ' + results.estado;
			$scope.doctorFrm.doctor.address.cityId      = results.cidade_info.codigo_ibge;

			var city = {description: results.cidade,
					city_ibge: results.cidade_info.codigo_ibge,
             		    state: results.estado,
        		   state_ibge: results.estado_info.codigo_ibge};

			Data.post('city', city);

		});
	};

	$scope.getLocationByAddres = function(address){
		ProfileSrvc.getLocation(address).then(function(data){
			if(data.status == 'OK'){
				/*console.log(data.results[0].geometry);
				console.log(data.results[0].geometry.location);*/
				$scope.doctorFrm.doctor.address.formatted_address = data.results[0].formatted_address,
				$scope.doctorFrm.doctor.address.lat               = data.results[0].geometry.location.lat,
				$scope.doctorFrm.doctor.address.lng               = data.results[0].geometry.location.lng;
			}			
		});
	};

	setCustomerForm();


})
// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.
.controller('changePassModalCtrl', function ($scope, $uibModalInstance, Person,  Data, $toast) {

	var oldRecord = {},
 	    route = 'password/' + Person.getPersonId();
 	    $scope.profile = {};

    $scope.confirmEvent = function () { 
    	if($scope.profile.newPassword != $scope.profile.confirmPassword){
    		$toast.show({status: 'error', message: 'Senhas não conferem, por gentileza informe novamente.'});
    		return;
	   	}	   	
	   	if($scope.profile.newPassword == "" && $scope.profile.confirmPassword == ""){
    		$toast.show({status: 'error', message: 'Campo senha em branco, por gentileza informe uma senha valida.'});
    		return;
	   	}	 

	   	//console.log("Nova Senha: " + $scope.profile.newPassword);

	   	var profile = {password: $scope.profile.newPassword}

	   	Data.put(route, profile).then(function(results){
      		if(results){
      			$toast.show(results);        
                $uibModalInstance.close();
      		}
      	});
    	
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

});