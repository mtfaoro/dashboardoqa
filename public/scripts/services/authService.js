(function(){
  'use strict';
  app.service('authService', [
        '$q', '$sessionStorage',
      authServ
  ]);

  function authServ($q, $sessionStorage){
    var appSession = [];
    if($sessionStorage.mySession)
       appSession = $sessionStorage.mySession;

     //console.log(appSession);

    return {
      loadSession : function() {
        return $sessionStorage.mySession; //$q.when(appSession);
      },
      setSession : function(sessionData){
        //console.log('setSession');
        //console.log(sessionData);
        $sessionStorage.mySession = sessionData;
      },
      cleanSession : function(){
        $sessionStorage.mySession = [];
        $sessionStorage.personObj = [];
        $sessionStorage.customerObj = [];
        $sessionStorage.isAthenticated = false;
      },
      setPerson : function(person){
        $sessionStorage.personObj = person;
      },
      setCustomer : function(customer){
        $sessionStorage.customerObj = customer;
      },
      getPerson : function(){
        return $sessionStorage.personObj;
      },
      getCustomer : function(){
        return $sessionStorage.customerObj;
      }
    };
  }
})();