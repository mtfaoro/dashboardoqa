'use strict';

/**
 * @ngdoc overview
 * @name dashboardApp
 * @description
 * # dashboardApp
 *
 * Main module of the application.
 */
var app = angular.module('dashboardApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngAnimate',
    
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap',
    'ui.bootstrap.modal',
    'angular-momentjs',
    'toaster',
    'smart-table',
    'angular-momentjs',
    'angular-loading-bar',
    'angular-confirm',
    'ui.calendar',
    'ui.bootstrap',
    'jkuri.timepicker',
    'ngMask',
    'ngStorage'
  ]);  // --  definitions
  //'ngMessages',
  app.factory('Person', function(){  
    var Person = [];
    Person._person   = {};
    Person._customer = {};

    /* ---------------- USER data -------------*/
    Person.setPerson = function(person, token){
        Person._person = person;
        Person._person.token = token;
    }; 
    Person.getPerson = function(){
        return Person._person;
    };
    Person.getPersonId = function(){
        return Person._person._id;
    };

    /*--------- CUSTOMER(Doctor) data ----------*/
    Person.setCustomer = function(customer){
      Person._customer = customer;
    };
    Person.getCustomer = function(){
      return Person._customer;
    };

    Person.setCustomerId = function(customerId){
      Person._person.customerId = customerId;
    };
    Person.getCustomerId = function(){
      return Person._customer._id;
    };

    Person.getToken = function(){
      if(Person._person){
        return Person._person.token;
      }else{
        return '';
      } 
    };

    Person.delPerson = function(){
       Person = [];
       Person._person   = {};
       Person._customer = {}; 
    };
    

    return Person; 
  }); // --  Factory

  app.factory('$toast', ['toaster',
    function (toaster) {
        return {
            //'show': function (type, title, text) {
            'show': function (toastObj) {
                return toaster.pop({
                    type: toastObj.status,
                    //title: title,
                    body: toastObj.message,
                    showCloseButton: false
                });
            }
        };
  }]); // -- Service TOASTER

app.service('menuTour', [
    function (menuTour) {
           /*$rootScope.finishedTour = function(){
            console.log("Terminou >) ");
          }*/
        var menuSteps = [{content: '<p>Olá, você é novo por aqui certo? Vou te ajudar com seu primeiro acesso, vamos lá... </p>',
                         highlightTarget: true,
                         nextButton: true,
                         target: $('#menuStep1'),
                         my: 'bottom center',
                         at: 'bottom center'
                       }, {
                         content: '<p>Essa é a barra de menu, onde estão dispostos os menus que serão utilizados por você para gerenciar seus dados e suas consultas...</p>',
                         highlightTarget: true,
                         nextButton: true,
                         target: $('#menuStep2'),
                         my: 'top center',
                         at: 'bottom center'
                       },
                      {
                         content: '<p>O primeiro passo é, atualizar seu perfil médico, para isso utilizaremos o menu Perfil.</p>',
                         highlightTarget: true,
                         nextButton: true,
                         target: $('#menuStep3'),
                         my: 'top center',
                         at: 'bottom center'
                       },
                      {
                         content: '<p>Após atualizar o perfil, você deverá configurar seu horario de atendimento atravéz do Configurador, dessa forma seus pacientes poderam agendar consultas de acordo com sua agenda</p>',
                         highlightTarget: true,
                         nextButton: true,
                         target: $('#menuStep4'),
                         my: 'top center',
                         at: 'bottom center'
                       },
                      { 
                         content: '<p>O menu Agenda será seu grande amigo, é nele que você podera controlar suas consultas agendadas e adicionar novas consultas que não sejam provenientes do nosso App.</p>',
                         highlightTarget: true,
                         nextButton: true,
                         target: $('#menuStep5'),
                         my: 'top center',
                         at: 'bottom center'
                       }]

         
        return {
            //'show': function (type, title, text) {
            'show': function () {
                  var tour = new Tourist.Tour({steps: menuSteps,
                                              tipClass: 'Bootstrap',
                                              tipOptions:{ showEffect: 'slidein' }
                                              //successStep: $rootScope.finishedTour()
                                              });
                  return tour.start();

                    /*toaster.pop({
                    type: toastObj.status,
                    //title: title,
                    body: toastObj.message,
                    showCloseButton: false
                });*/
            }
        };
  }]); // -- Service TOASTER

  app.config(function($momentProvider){
    $momentProvider
      .asyncLoading(false)
      .scriptUrl('//cdnjs.cloudflare.com/ajax/libs/moment.js/2.5.1/moment.min.js');
  }); // --  config  -
  app.config(['$routeProvider',  function($routeProvider) {

    $routeProvider      
      .when('/calendar', {
        templateUrl: 'views/events.html',
        controller: 'EventsCtrl'
      })
      .when('/setting', {               
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
      })
      .when('/profile', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl'
      })
      /*.when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })*/
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'AuthCtrl'        
      })
      .when('/logout', {
        templateUrl: 'views/login.html',
        controller: 'AuthCtrl'        
      })
      .when('/signup', {
        title: 'Signup',
        templateUrl: 'views/signup.html',
        controller: 'AuthCtrl'
      })
      .when('/', {
        templateUrl: 'views/calendar.html',
        controller: 'CalendarCtrl'        
      })
      .otherwise({
        redirectTo: '/'
      });
  }]) // --   config 2
  .run(function($rootScope, $location, Data, Person, menuTour, authService, $sessionStorage) {

    $rootScope.finishedTour = function(){
      console.log("Terminou :) ");
    }

    $rootScope.$on('$routeChangeStart', function(event, next) {
      
      var nextUrl =  '' ;
      if(next.$$route){
        nextUrl =  next.$$route.originalPath;
      }
      //Captura Session
      var sessionOn = authService.loadSession();

      //console.log(sessionOn);

      if(!$sessionStorage.isAthenticated){
      //if(!sessionOn){

        var _connectedUser       = Person.getPerson(); 
     
      //Criar session atraves do angular!! Server ja valida o token por tempo!! 
        //Data.get('session').then(function (results) {
            //console.log( "TOKEN: " + _connectedUser.token);
            //_connectedUser.token = 'SADKOSdISJIe213e0912390qk';
            if (_connectedUser.token) {
                //console.log("TOKEN OK, redirecting to /Calendar: " + _connectedUser.token);
                sessionOn = _connectedUser;                
                authService.setSession(sessionOn);                                
                               
                $rootScope.uid           = _connectedUser._id;
                $rootScope.name          = _connectedUser.name;
                $rootScope.email         = _connectedUser.email;
                $rootScope.isActive      = _connectedUser.isActive;
                $rootScope.isAdmin       = _connectedUser.isAdmin;
                $rootScope.token         = _connectedUser.token;                  
                $rootScope.userLoggedId   = _connectedUser._id;
                $rootScope.isAthenticated = true;
                $sessionStorage.isAthenticated = true;
                
                //$rootScope.isFirstAccess  = true;
                
                if(_connectedUser.personID) {                  
                  $rootScope.personID         = _connectedUser.personID._id;
                  $rootScope.customerLoggedId = _connectedUser.personID.name;
                  $rootScope.isCustomer       = true;
                  //$rootScope.isFirstAccess    = false;

                  $location.path('/calendar');
                }else{
                  menuTour.show();
                  $location.path('/profile');
                }
                //console.log("Autenticaod!?: " + $rootScope.isAthenticated);               
            } else {
                $rootScope.isAthenticated   = false;
                $rootScope.userLoggedId     = '';
                $rootScope.customerLoggedId = '';
                $rootScope.isCustomer       = false;
                $rootScope.isFirstAccess    = false;

                // Limpa sessão
                authService.cleanSession();                 
                
                if (nextUrl === '/signup' || nextUrl === '/login') {
                     //$location.path('/login');
                } else {
                    //console.log("TOKEN OK, redirecting to /login ||| nextUrl " + nextUrl);
                    $location.path("/login");                    
                }
            }
        //});        
      } else{ // else rotescope               
          Person.setPerson(authService.getPerson(), sessionOn.token);
          Person.setCustomer(authService.getCustomer());

          $rootScope.uid           = sessionOn._id;
          $rootScope.name          = sessionOn.name;
          $rootScope.email         = sessionOn.email;
          $rootScope.isActive      = sessionOn.isActive;
          $rootScope.isAdmin       = sessionOn.isAdmin;
          $rootScope.token         = sessionOn.token;                  
          $rootScope.userLoggedId   = sessionOn._id;
          $rootScope.isAthenticated = true;
          //$sessionStorage.isAthenticated = true;          
          //$rootScope.isFirstAccess  = true;          
          if(sessionOn.personID) {                  
            $rootScope.personID         = sessionOn.personID._id;
            $rootScope.customerLoggedId = sessionOn.personID.name;
            $rootScope.isCustomer       = true;
        }
      }

    });
  });

  app.directive('ngConfirmClick', [
        function(){
            return {
                priority: 1,
                terminal: true,
                link: function (scope, element, attr) {
                    var msg = attr.ngConfirmClick || "Você tem certeza sobre isso?";
                    var clickAction = attr.ngClick;
                    element.bind('click',function (event) {
                        if ( window.confirm(msg) ) {
                            scope.$eval(clickAction)
                        }
                    });
                }
            };
    }]);

