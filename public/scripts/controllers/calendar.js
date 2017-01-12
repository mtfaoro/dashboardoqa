'use strict';
/**
 * @ngdoc function
 * @name dashboardApp.controller:CalendarCtrl
 * @description
 * # CalendarCtrl
 * Controller of the dashboardApp
 */
/*angular.module('dashboardApp')*/
 app.factory('CalendarFactory', function(){

    var calendar = {};
        //calendar.updated = new Date(),
    calendar.data = [];

    calendar.isEvents = function(){
      if (calendar.data !== null || calendar.data !== []){
        return true;
      }else{ return false; }
    };
    calendar.getList = function(){
      return calendar.data;
    };
    calendar.addList = function(list){
      calendar.data = list;
      //calendar.updated = new Date();
    };
    calendar.delItem = function(hIndex, dIndex){
      //Elimina horario da lista
      calendar.data[dIndex].scheduleTime.splice(hIndex,1);
      //Verifica se existe algum horario para o dia, caso não elimina o dia da lista tbm.
      if(calendar.data[dIndex].scheduleTime.length === 0){
        calendar.data.splice(dIndex, 1);
      }
    };

    return calendar;

  })
  .service('CalendarService', function($http, Data, Person){
    var service = this,
          route = 'events/';

   function getUrl(path){
       //return Doctappbknd.tableUrl + path;
       return 'teste';
   }
   service.all = function (param){
       //return $http.post(getUrl(route), param);
       var jsonData = [];
        /* Desconmentar :)*/

       /* function waitfunction() {
            var a = 5000 + new Date().getTime(),
                testeAux = true;
            console.log('----------------------------------------');
            console.log(jsonData);
            while (testeAux){
              if (jsonData.length  != 0){
                  testeAux = false;
              }
            }            
            console.log('waitfunction() context will be popped after this line');
            console.log(jsonData);
            console.log('----------------------------------------');
            return jsonData;
        }*/
       
       Data.getById(route, Person.getCustomerId()).then(function(results) {
           //Data.toast(results);
           console.log(results.events);
           console.log("Retorna dados da API");
           jsonData = results.events;

           return results.events;
       });  

       //waitfunction();
           

       /*
       var jsonData = [{
                          "id": "56f59e50f2ac0c3407826f80",
                          "title": "Maurício Faoro",
                          "start": "2016-03-27T19:00:00-03:00",
                          "end": "2016-03-27T19:15:00-03:00"
                        },
                        {
                          "id": "56f59e50f2ac0c3407826f80",
                          "title": "Algum user ",
                          "start": "2016-03-27T20:40:00-03:00",
                          "end": "2016-03-27T20:55:00-03:00"
                        },
                        {
                          "id": "56f59e50f2ac0c3407826f7f",
                          "title": "Algum user ",
                          "start": "2016-03-26T09:00:00-03:00",
                          "end": "2016-03-26T09:15:00-03:00"
                        }
                        ];
       return jsonData;
       */
       
   };
 })
  .controller('CalendarCtrl', function($scope, $uibModal, $log, CalendarService, CalendarFactory ) {
    var service = CalendarService,
        factory = CalendarFactory;

//CalendarService
    $scope.appointmentData = {};


    $scope.openView = function(action, event){

      if(!event){ //view
        //alert("Adição da consulta clicada.");
        $scope.open('lm', event, false);
      }else{ $scope.open('lm', event, true); }

    }; //openView()

    $scope.getEvents = function(){

      //$log.info(factory.isEvents());

      //if (factory.isEvents()){
        //$log.info('Carrega lista do db');
        factory.addList(service.all());
      //}

      return factory.getList();

            /*.then(function (result) {
                console.log(result.data);
                //return result;
            });*/
      //return teste;
    };

    //$scope.items = ['item1', 'item2', 'item3'];
    $scope.open = function (size, appointmentData, isEvent) {
      var modalInstance = $uibModal.open({
        animation: true, //$scope.animationsEnabled,
        templateUrl: 'myModalContent.html',
        controller: 'ModalInstanceCtrl',
        size: size,
        resolve: {
          eventData: function () {
            return appointmentData;
          },
          isEvent: isEvent
        }
      });

      //Retorno do Modal
      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    }; //open()
    
  })

  /*controller('ModalDemoCtrl', function ($scope, $uibModal, $log) {

  })*/
  // Please note that $modalInstance represents a modal window (instance) dependency.
  // It is not the same as the $uibModal service used above.
  .controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, eventData, isEvent) {

    //Config timepicker
    $scope.isUpdated  = isEvent; //true;
    //$scope.isEdit = false;
    $scope.ismeridian = false; //Mostra horario em formato 24h
    $scope.hstep      = 1;     // Define range de acrescimo/decrascimo no Timepicker
    $scope.mstep      = 15;    //           //        //         //          //

    //console.log(eventData.start);
    //$scope.items = items;
    if(isEvent){
      $scope.appointmentData = eventData;
      $scope.appointmentData.period = '01/11/2015 16:00:00';
    }
    //$scope.timeIni       = eventData.start; //Define horario da consulta
    //$scope.timeEnd       = new Date();      //Define horario da consulta

    $scope.changed = function () {
      //$log.log('Time changed to: ' + $scope.mytime);
      //Seta horario alterado para sugerir ao beneficiario.
    };
    /*
    $scope.selected = {
      item: $scope.items[0]
    };
    */
    $scope.ok = function () {
      $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  });
