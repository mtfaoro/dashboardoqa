'use strict';
/**
 * @ngdoc function
 * @name dashboardApp.controller:AuthCtrl
 * @description
 * # AuthCtrl
 * Controller of the dashboardApp
 */
/*angular.module('dashboardApp') */
app.controller('AuthCtrl', function($rootScope, $scope, $routeParams, $location, $http, Data, Person, $toast, authService ) {
    //initially set those objects to null to avoid undefined error
    $scope.login = {};
    $scope.signup = {};
    $scope.doLogin = function(user){
        //console.log(user);
        Data.post('authenticate', {
             user: user
        }).then(function (results) {

           /*var results = {};
           results.success = true;
           results.user    = {  _id: "569d6422a9ca369b02d2557b",
                                isActive: false,
                                isAdmin: true,
                                email: "menegat.marcelo@gmail.com",
                                login: "menegat.marcelo@gmail.com",
                                number: 5499995442,
                                password: "",
                                token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjlkNjQyMmE5Y2EzNjliMDJkMjU1N2IiLCJhY3RpdmUiOmZhbHNlLCJhZG1pbiI6dHJ1ZSwibnVtYmVyIjo1NDk5OTk1NDQyLCJlbWFpbCI6Im1lbmVnYXQubWFyY2Vsb0BnbWFpbC5jb20iLCJwYXNzd29yZCI6ImRvYyIsImxvZ2luIjoibWVuZWdhdC5tYXJjZWxvQGdtYWlsLmNvbSIsIl9fdiI6MH0.Qh5HHYqI80tXVQCLZIl5oPImNevhlr70YCvsf03VrVM"}; 
            results.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjlkNjQyMmE5Y2EzNjliMDJkMjU1N2IiLCJhY3RpdmUiOmZhbHNlLCJhZG1pbiI6dHJ1ZSwibnVtYmVyIjo1NDk5OTk1NDQyLCJlbWFpbCI6Im1lbmVnYXQubWFyY2Vsb0BnbWFpbC5jb20iLCJwYXNzd29yZCI6ImRvYyIsImxvZ2luIjoibWVuZWdhdC5tYXJjZWxvQGdtYWlsLmNvbSIsIl9fdiI6MH0.Qh5HHYqI80tXVQCLZIl5oPImNevhlr70YCvsf03VrVM";
            */

            //Data.toast(results);
            $toast.show(results);
            //console.log(results);
            if (results.status == 'success') {  
            //if (results.success) {  
                Person.setPerson(results.user, results.token);
                authService.setPerson(results.user);

                if(results.user.personID){
                    //console.log(results.user.personID);                    
                    Person.setCustomer(results.user.personID);
                    authService.setCustomer(results.user.personID);
                }

                $location.path('dashboard');
            }

        });

    };

    $scope.signup = {email:'',password:'',name:'',phone:'',address:''};

    $scope.doSignUp = function (user) {
        //console.log("New Customer: " );
        //console.log(user);

        if(user.password != user.password2){
            $toast.show({'status': 'error', 'message': 'As senhas informadas não coincidem!'});
        }else{
            Data.post('signup', {
                user: user
            }).then(function (results) {
                //Data.toast(results);
                $toast.show(results);
                /*console.log(results);
                console.log('---------------------------------');
                console.log(results.token);*/
                if (results.status == 'success') {     
                    Person.setPerson(results.user, results.token);
                    authService.setPerson(results.user);
                    //$location.path('dashboard');
                    $location.path('/profile');
                }
            });
       }
    };
    $scope.logout = function () {

        $rootScope.uid           = '',
        $rootScope.personID      = '',
        $rootScope.name          = '',
        $rootScope.email         = '',
        $rootScope.isActive      = '',
        $rootScope.isAdmin       = '',
        $rootScope.token         = '',                  
        $rootScope.userLoggedId     = '',
        $rootScope.customerLoggedId = '',
        $rootScope.isAthenticated    = false,
        $rootScope.isFirstAccess = false;

        Person.delPerson();
        authService.cleanSession();
        //console.log('isAthenticated: ' + $rootScope.isAthenticated);
        $location.path('login');

         //$location.path('login');   
        /*Data.get('logout').then(function (results) {
            Data.toast(results);            
        });*/
    }

    $scope.checkPassword = function(pass1, pass2){
        if(pass1 !== pass2){
            //console.log(pass1 + " != " + pass2 );
            $toast.show({'status': 'error', 'message': 'As senhas informadas não coincidem!'});
        }
    }


    /*var steps = [{
      content: '<p>First look at this thing</p>',
      highlightTarget: true,
      nextButton: true,
      target: $('#thing1'),
      my: 'bottom center',
      at: 'top center'
    }, {
      content: '<p>And then at this thing</p>',
      highlightTarget: true,
      nextButton: true,
      target: $('#thing2'),
      my: 'bottom center',
      at: 'top center'
    }]

    var tour = new Tourist.Tour({
      steps: steps,
      tipClass: 'Bootstrap',
      tipOptions:{ showEffect: 'slidein' }
    });

    if($rootScope.isFirstAccess){
       /// tour.start();
    }*/

});