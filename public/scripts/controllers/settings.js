'use strict';
/**
 * @ngdoc function
 * @name dashboardApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the dashboardApp
 */
/*angular.module('dashboardApp')*/
app.controller('SettingsCtrl', function($scope, $uibModal, $log, $moment, Data, Person, $toast){

    var route = 'settings/',
        limitDateOld = 0,
        settingsCollection = {};

    $scope.selectedTab = '';
    $scope.workTimeConfig = {};
    $scope.hasConfigs = false;


    var createComplete = function() {
      var customer = Person.getCustomer();     
      
      if(customer._id || customer._id != null){        
        Data.getById(route, Person.getCustomerId() ).then(function(results) {
            //Data.toast(results);   
            //console.log(results);
            if(results.status == 'success'){
              settingsCollection = results.data;
              $scope.workTimeConfig = settingsCollection,
              //console.log($scope.workTimeConfig);
              /*
              $scope.workTimeConfig.limitDate = $moment(settingsCollection.limitDate, 'YYYYMMDD').format('DD/MM/YYYY'),
              limitDateOld                    = settingsCollection.limitDate,
              $scope.workTimeConfig.startDate = $moment(settingsCollection.startDate, 'YYYYMMDD').format('DD/MM/YYYY');
              */

              //console.log("Pega bancoo 1 " + settingsCollection.limitDate );

              limitDateOld                    = settingsCollection.limitDate; // $moment(settingsCollection.limitDate, 'YYYYMMDD').format(), //settingsCollection.limitDate,
              $scope.workTimeConfig.limitDate = $moment(settingsCollection.limitDate, 'YYYYMMDD').format();              
              $scope.workTimeConfig.startDate = $moment(settingsCollection.startDate, 'YYYYMMDD').format();
              
              
              //console.log("Pega bancoo OLD 2 " + limitDateOld );
              //console.log("Pega bancoo OLD 3 " + $moment(limitDateOld).format('YYYYMMDD') );

              $scope.hasConfigs = true;
            }else{
              /*$scope.workTimeConfig.startDate = $moment(),
              $scope.workTimeConfig.limitDate = $moment().add(1, 'y'),
              $scope.workTimeConfig.doctor    = Person.getCustomerId();*/
              //console.log($moment().format('DD/MM/YYYY'));
              //console.log($moment().format());

              $scope.workTimeConfig = {
                       doctor: Person.getCustomerId(),
                   speciality: customer.doctor.speciality._id,
                         city: customer.doctor.address.cityId,
                    startDate: $moment().format(),
                    limitDate: $moment().add(1, 'y').format(),
                     duration: 20,
                    particularQtd: 5,
                    monday: [],
                    tuesday: [],
                    wednesday: [],
                    thuersday: [],
                    friday: []
                  }
              $scope.hasConfigs = false;
            } 
            //console.log($scope.workTimeConfig);
         });    
      }
    };

    var addWorkTime = function(worktime){
      //console.log(worktime);
      switch(worktime.dayOfWeek){
        case '1': //'m'
          $scope.workTimeConfig.monday.push({WorkTime:{
            ini: worktime.timeIni, //$moment(worktime.timeIni).format('HH:mm'), //worktime.timeIni,
            end: worktime.timeEnd //$moment(worktime.timeEnd).format('HH:mm')
            } //worktime.timeEnd
          });
        break;
        case '2': //'t'
          $scope.workTimeConfig.tuesday.push({WorkTime:{
            ini: worktime.timeIni, //$moment(worktime.timeIni).format('HH:mm'), //worktime.timeIni,
            end: worktime.timeEnd //$moment(worktime.timeEnd).format('HH:mm')
            } //worktime.timeEnd
          });
        break;
        case '3':
          $scope.workTimeConfig.wednesday.push({WorkTime:{
            ini: worktime.timeIni, //$moment(worktime.timeIni).format('HH:mm'), //worktime.timeIni,
            end: worktime.timeEnd //$moment(worktime.timeEnd).format('HH:mm')
            } //worktime.timeEnd
          });
        break;
        case '4':
          $scope.workTimeConfig.thuersday.push({WorkTime:{
            ini: worktime.timeIni, //$moment(worktime.timeIni).format('HH:mm'), //worktime.timeIni,
            end: worktime.timeEnd //$moment(worktime.timeEnd).format('HH:mm')
            } //worktime.timeEnd
          });
        break;
        case '5':
          $scope.workTimeConfig.friday.push({WorkTime:{
            ini: worktime.timeIni, //$moment(worktime.timeIni).format('HH:mm'), //worktime.timeIni,
            end: worktime.timeEnd //$moment(worktime.timeEnd).format('HH:mm')
            } //worktime.timeEnd
          });
        break;
      }
    };
    
    
    //Executa construção de dados da tela.
    //$scope.workTimeConfig = {};
    createComplete();    
    $scope.workingTime  = { dayOfWeek: 'm', 
                              timeIni: $moment('00:00','HH:mm'),
                              timeEnd: $moment('00:00','HH:mm')
                          };    
    

      /*$scope.tabs = [
        { title:'Dynamic Title 1', content:'Dynamic content 1' },
        { title:'Dynamic Title 2', content:'Dynamic content 2', disabled: true }
      ];*/

    $scope.options = {
      hstep: [1, 2, 3],
      mDuration: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
      return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    /*$scope.toggleMin = function() {
      $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();
    $scope.maxDate = new Date(2020, 5, 22);*/

    $scope.openSchedule = function($event) {
      $scope.status.opened = true;
    };

    /*$scope.setDate = function(year, month, day) {
      $scope.dt = new Date(year, month, day);
    };*/

    $scope.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    //$scope.formats = ['dd/MM/yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = 'dd/MM/yyyy'; //$scope.formats[0];

    $scope.status = {
      opened: false
    };

    /*var tomorrow = new Date();
    var afterTomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    afterTomorrow.setDate(tomorrow.getDate() + 2);
    $scope.events =
      [
        {
          date: tomorrow,
          status: 'full'
        },
        {
          date: afterTomorrow,
          status: 'partially'
        }
      ];*/

    /*$scope.getDayClass = function(date, mode) {
      if (mode === 'day') {
        var dayToCheck = new Date(date).setHours(0,0,0,0);

        for (var i=0;i<$scope.events.length;i++){
          var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

          if (dayToCheck === currentDay) {
            return $scope.events[i].status;
          }
        }
      }
      re0turn '';
    };*/


    //Remove Periodo dentro de um determinado dia da semana.
    $scope.removePeriod = function(workTimeA, dayOfWeekA){      
      dayOfWeekA.splice(workTimeA, 1);              
    }

    $scope.setTabSelected = function(selectedTab){

      $scope.selectedTab = selectedTab;
    }

    /* ----------------------------------------------------------------------------------------------------------------------- */
    /* ----------------------------------------------------------------------------------------------------------------------- */
    /* ----------------------------------------------------------------------------------------------------------------------- */

    $scope.openView = function(action, event){
      //console.log($scope.selectedTab);
      if(!event){ //view        
        $scope.open('lm', event, false, $scope.selectedTab);
      }else{ 
        $scope.open('lm', event, true, $scope.selectedTab); 
      }
    }; //openView()
    $scope.open = function (size, appointmentData, isEvent, selectedTab) {
        var modalInstance = $uibModal.open({
          animation: true, //$scope.animationsEnabled,
          templateUrl: 'periodModalContent.html',
          controller: 'PeriodModalCtrl',
          size: size,

          resolve: {
            eventData: function () {
              return appointmentData;
            },
            isEvent: isEvent,
            selectedTab: selectedTab
          },
          
        });
        //Retorno do Modal
        modalInstance.result.then(function (selectedItem) {
          $scope.workTime = selectedItem;
          addWorkTime(selectedItem);
          //console.log($scope.workTime);
        }, function () {          
          //$log.info('Modal dismissed at: ' + new Date());
        });
    }; //open()


    /**
    * Salva a estrutura de Settings na base.
    **/
    $scope.saveSettings = function(settings){       
      //var customer   = Person.getCustomer(),  
      //console.log('Antes');    
      //console.log(settings.startDate);
      //console.log(settings.limitDate);

      settings.startDate = moment(settings.startDate).format('YYYYMMDD'), 
      settings.limitDate = moment(settings.limitDate).format('YYYYMMDD');
      //console.log('Meio');
      //console.log('Start: ' + settings.startDate);
      //console.log('Limit: ' + settings.limitDate);
      //console.log('OLD: ' + limitDateOld);

      if(limitDateOld != 0 && limitDateOld < settings.limitDate){
          //console.log('Troca Start Date: ' + limitDateOld);
          settings.startDate = limitDateOld; // Add 1 dia a o periodo final para considerar o novo inicio.
          //settings.limitDate = settings.limitDat;
      }

      ///console.log('Depois');
      //console.log('Start: ' + settings.startDate);
      //console.log('Limit: ' + settings.limitDate);
      //console.log('OLD: ' + limitDateOld);
     // console.log('Antes de salvar');
      //console.log(settings);
      //return;
      Data.post('settings', settings).then(function(results){
          $toast.show(results);  
          //console.log('voltou do save');
          //console.log("Results ID: " + results._id);
          //console.log(settings.startDate);
          //console.log(settings.limitDate);


          $scope.workTimeConfig.limitDate = $moment(settings.limitDate, 'YYYYMMDD').format(),              
          $scope.workTimeConfig.startDate = $moment(settings.startDate, 'YYYYMMDD').format(); 
          $scope.workTimeConfig._id       = results._id;
          //console.log(results);
          //console.log("results.settings.lgCreateEvents: " + results.settings.lgCreateEvents);
          if(results.lgCreateEvents) {            
            $scope.generateEvents(settings);
          }
          //console.log(results);
      });
      
    };   

    /**
    * Gera estrutura de Eventos(Agenda) para disponibilização de horarios para beneficiarios!
    **/
    $scope.generateEvents = function(eventSett){

      //console.log('generateEvents');
      //console.log(eventSett.startDate);
      //console.log(eventSett.limitDate);      

      var customer = Person.getCustomer(),
          generateConfigs = {doctor: eventSett.doctor,                         
                          limitDate: $moment(eventSett.limitDate).format('YYYYMMDD'),
                          startDate: $moment(eventSett.startDate).format('YYYYMMDD'),
                             cityId: customer.doctor.address.cityId,
                         speciality: customer.doctor.speciality._id};   
          /*console.log("generateEvents OBJ");          
          console.log(generateConfigs);*/


      /**
      * Salva CRUD do configurador na base.
      */
      Data.post('events', generateConfigs).then(function(results){
          $toast.show(results);  
          if(results.status == 'success'){
            $scope.hasConfigs = true;
          }      
      }); 


    };

  })
  .controller('PeriodModalCtrl', function ($scope, $uibModalInstance, $moment, eventData, isEvent, selectedTab, $toast) {

    //console.log('seta tab: ' + selectedTab)

    //Config timepicker
    $scope.isUpdated  = isEvent; //true;
    //$scope.isEdit = false;
    $scope.ismeridian = false; //Mostra horario em formato 24h
    $scope.hstep      = 1;     // Define range de acrescimo/decrascimo no Timepicker
    $scope.mstep      = 15;    //           //        //         //          //


    $scope.workTime = {dayOfWeek: String(selectedTab), 
                       timeIni: $moment('00:00','HH:mm').format('HH:mm'),
                       timeEnd: $moment('00:00','HH:mm').format('HH:mm')
                      };

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
      
      if($scope.workTime.timeIni >= $scope.workTime.timeEnd){
        $toast.show({status: 'error',
                     message: 'A hora inicial deve ser menor que hora final de antendimento.'}); 
      }else{
        $uibModalInstance.close($scope.workTime);
      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  });
