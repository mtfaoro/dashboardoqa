'use strict';
/**
 * @ngdoc function
 * @name dashboardApp.controller:EventsCtrl
 * @description
 * # EventsCtrl
 * Controller of the dashboardApp
 */
app.factory('EventsFactory', function(){

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
    calendar.addItemList = function(item){
      calendar.data.push(item);
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
/*.service('EventsSrvc', function($http, Data, Person){
    var service = this,
          route = 'events/';

   function getUrl(path){
       //return Doctappbknd.tableUrl + path;
       return 'teste';
   }
   service.all = function (param){
      //return $http.post(getUrl(route), param);
      //var jsonData = [];     
      console.log("@Passo 2");  
      Data.getById(route, Person.getCustomerId()).then(function(results) {
           //Data.toast(results);
           //console.log(results.events);
           console.log("Retorna dados da API");
           var teste2 = results.events;
           if(teste2){
		    	for (var i = 0; i < teste2.length; i++) {
		    	    var event = {};
		    	    console.log('Tamanho: ' + (teste2.length - 1) );
		    	    if (i === teste2.length - 1) {
		    	        event = {
		    	            title: teste2[i].title,
		    	            start: teste2[i].start,
		    	              end: teste2[i].end,
		    	             allday: false
		    	        };
		    	    } else {
		    	        event = {
		    	            title: teste2[i].title,
		    	            start: teste2[i].start,
		    	              end: teste2[i].end,
		    	              allday: false
		    	        };
		    	    }
		    	    $scope.events.push(teste2)
		    	}	   
  			}
       });
   };
 })*/
 .controller('EventsCtrl', function($scope,$compile,uiCalendarConfig, $uibModal, $rootScope, $http, EventsFactory, Person, Data, $toast, $moment) {

	var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    var //service = EventsSrvc,
        factory = EventsFactory;

    /* event source that pulls from google.com */
    /*
    $scope.eventSource = {
            url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event',           // an option!
            currentTimezone: 'America/Chicago' // an option!
    };
    */
    
    /* event source that contains custom events on the scope */
    $scope.events = []; //factory.getList();           

    $scope.getAllEvents = function(){
    	var route = 'events/';
    	Data.getById(route, Person.getCustomerId()).then(function(results) {
    		//$scope.events = [];
        	var eventsData = results.events;
         // console.log($scope.events);
        	if(eventsData){  
  		    	for (var i = 0; i < eventsData.length; i++) {
  		    	    //var event = {};		        		    	      		    	    
                /*factory.addItemList({
                                 id: eventsData[i].id,
                              title: eventsData[i].title,
                              start: $moment(eventsData[i].start).toDate(),
                                end: $moment(eventsData[i].end).toDate()
                                });*/
                  $scope.events.push(eventsData[i]);	 
  		    	}	   
            
  			}
       });
    	         
    };
    
    $scope.addEvents = function(action, event){
      //if(!event){ //view
        //alert("Adição da consulta clicada.");
        $scope.openModal('lm', event, false);
      //}else{ $scope.openModal('lm', event, true); }
    };
    
    /* alert on eventClick */    
    $scope.updEvents = function(date, jsEvent, view){
    	//console.log(date);
      //if(!date){ //view
        //alert("Adição da consulta clicada.");
        //$scope.openModal('lm', date, false);
      //}else{ 
      	$scope.openModal('lm', date, true); //}
    };
    /*$scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
    };*/
    /* alert on Drop */
     $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
       $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function(sources,source) {
      var canAdd = 0;
      angular.forEach(sources,function(value, key){
        if(sources[key].hourId === source.hourId){
          //console.log('Remove item');
          sources.splice(key,1);
          canAdd = 1;
        }
      });
      /*if(canAdd === 0){
        sources.push(source);
      }*/
    };
    
    /* add custom event @MMenegat conferir refatorar*/
    $scope.insertEvent = function(newEvent) {
        if(newEvent.hitStatus != 0 && 
           newEvent.hitStatus != 1 ){
            $scope.addRemoveEventSource($scope.events, newEvent);
            //factory.delItem(newEvent);          
        }else{
            $scope.events.push(newEvent);    
            //factory.addItemList(newEvent);
        }
    };
    
    /* remove event */
    $scope.remove = function(index) {
      console.log("remove - Index: " + index);
      $scope.events.splice(index,1);
    };
    /* Change View */
    $scope.changeView = function(view,calendar) {
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
    };
    /* Change View */
    $scope.renderCalender = function(calendar) {
      //if(uiCalendarConfig.calendars[calendar]){
        uiCalendarConfig.calendars[calendar].fullCalendar('render');
      //}
    };
     /* Render Tooltip */
    $scope.eventRender = function( event, element, view ) { 
        element.attr({'uibTooltip': event.title, //tooltip
                     'tooltip-append-to-body': true});
        $compile(element)($scope);
    };    
    /* config object */
    $scope.uiConfig = {
      calendar:{
      	lang: "pt-br",
        height: 500,
        editable: false,
        //header: {
			//left: 'prev,next today',
			//enter: 'title',
			//right: 'month,agendaWeek,agendaDay'
		//},
        header:{
          left: 'title',
          center: 'today prev,next',
           right: 'month,agendaWeek,agendaDay' 
        },        
        //dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
        //monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        //monthNamesShort: [''],
	    //buttonText: {
	    //   today:'Hoje',
	    //   month: 'Mês',
			//week: 'Semana',
			// day: 'Dia'
	    // },
        eventClick: $scope.updEvents, // $scope.alertOnEventClick, //
         eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender
      }
    };
       
    
    $scope.openModal = function (size, appointmentData, isEvent) {
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
      modalInstance.result.then(function (eventData) {
        //$scope.selected = selectedItem;
        //console.log('add item');
        //console.log(eventData);
        $scope.insertEvent(eventData);          
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
          
      });
    }; //openModal()

    //console.log($scope.events); 
    angular.element(document).ready(function () {
	    $scope.getAllEvents(); 
      /* event sources array*/   
      $scope.eventSources = [$scope.events]; //@aki     
      
    })
      
    

})
  // Please note that $modalInstance represents a modal window (instance) dependency.
  // It is not the same as the $uibModal service used above.
 .controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, eventData, isEvent, Data, $toast) {

 	var oldRecord = {},
 	    route = 'schedule/';
 	    
 	    //console.log(eventData);

 	$scope.statusList = [{description: "Marcada",       value: 0 },
						 {description: "Confirmada",    value: 1 },
						 {description: "Cancelada",     value: 2 },
						 {description: "Realizada",     value: 3 },
						 {description: "Não Realizada", value: 4 }];	

    //Config timepicker
    $scope.isUpdated  = isEvent; //true;
    //$scope.isEdit = false;
    $scope.ismeridian = false; //Mostra horario em formato 24h
    $scope.hstep      = 1;     // Define range de acrescimo/decrascimo no Timepicker
    $scope.mstep      = 15;    //           //        //         //          //


    /* @REFACTOR - codigo duplicado para utilziação do datepicker */
    $scope.openSchedule = function($event) {
      $scope.status.opened = true;
    };    
    // Disable weekend selection
    $scope.disabled = function(date, mode) {
      return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };
    $scope.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };
    $scope.status = {
      opened: false
    };

    /* @END @REFACTOR */

    //console.log(eventData.start);
    //$scope.items = items;
    if(isEvent){
    	//oldRecord = eventData;
    	var oldHitStatus = eventData.hitStatus;
    	//console.log(eventData.start); 
      $scope.appointmentData = eventData;
      $scope.appointmentData.periodT    = moment(eventData.start).format('DD/MM/YYYY'); //'01/11/2015 16:00:00';
      $scope.appointmentData.periodH    = moment(eventData.start).format('HH:mm'); //'01/11/2015 16:00:00';       
      $scope.appointmentData.hitStatus  = eventData.hitStatus;
      
      //$scope.selection = eventData.hitStatus;
      //console.log($scope.appointmentData.periodT);
		  //console.log($scope.appointmentData.periodH);
    }else{
      $scope.appointmentData = {hitStatus:  1,
                                period: moment().format('DD/MM/YYYY - HH:mm')
                               };
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
    $scope.confirmEvent = function () {
    	//console.log('É Evento: ' + isEvent );
    	//console.log('Novo: ' + $scope.appointmentData.hitStatus );
    	//console.log($scope.appointmentData);
    	if(isEvent){    		
    		if($scope.appointmentData.hitStatus != oldHitStatus){    	    		
      			//$uibModalInstance.close($scope.appointmentData);      		
      			//console.log("Alterou status");
      			var objectData = { _id: $scope.appointmentData.dayId,
      		    			       _hourId: $scope.appointmentData.hourId,
                  			    status: $scope.appointmentData.hitStatus,
      			  				       score: $scope.appointmentData.score,
      		               updOption: 2 };      							
                
      			Data.put(route, objectData).then(function(results){
      				if(results){
      					$toast.show(results);        
                        $uibModalInstance.close($scope.appointmentData);
      				}
      			});
    		}else{
    			$uibModalInstance.dismiss('cancel');
    		}
    	}else{ 
    		//chama post do events.
    		//console.log("Add consulta 1");
        //console.log(moment($scope.appointmentData.periodT).format('YYYYMMDD'));
        //console.log($scope.appointmentData.periodH);
        var objectData = {  eventDate: moment($scope.appointmentData.periodT).format('YYYYMMDD'), // 'DD/MM/YYYY - HH:mm'
                            appmtTime: moment($scope.appointmentData.periodH, 'HH:mm').format('HH:mm'),
                            userId: $scope.appointmentData.userId,
                       patientName: $scope.appointmentData.title,
                         patientId: $scope.appointmentData.user_id,
                            status: $scope.appointmentData.hitStatus,
                             score: 0,                         
                         updOption: 1, //Add Consulta
                            },
            periodAux = moment($scope.appointmentData.periodT).format('DD/MM/YYYY') + ' - ' + $scope.appointmentData.periodH,
            events = { dayId: 0,
                      hourId: 0, 
                       title: objectData.patientName,
                       start: moment(periodAux, 'DD/MM/YYYY - HH:mm').format(),
                         end: moment(periodAux, 'DD/MM/YYYY - HH:mm').add(15, 'm').format(),
                       score: objectData.score,
                   hitStatus: objectData.status,
                      userId: objectData.userId,
                healthCareId: 0 };      
        //console.log(events);              
                
        Data.put(route, objectData).then(function(results){
          if(results){
            $toast.show(results);  
            //console.log(events); 
            //return results;     
            $uibModalInstance.close(events);
          }
        });
    	}
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.getBeenfByPhone = function(userID){
      if(!$scope.isUpdated){
        Data.getById('person/', userID).then(function(results){
          //console.log(results);
          if(results){
            $scope.appointmentData.user_id = results._id;
          }else{
            $scope.appointmentData.user_id = 0;
          }
        });
      }
    }

  });