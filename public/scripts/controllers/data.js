'use strict';

app.factory("Data", ['$http', 'toaster', 'Person',
    function($http, ngAnimate, toaster, Person,$window) { // This service connects to our REST API

        ///var serviceBase = 'api/v1/';
        //'Authorization' : 'AlterarParaKEY' 
        var config = {},
            //serviceBase = '/api/',
            serviceBase = 'http://oquantoantes.herokuapp.com/api/',
            //serviceBase = 'http://localhost:3000/api/',
            obj = {};
        /*
        var req = { method: 'GET',
                      url : getUrl(path),
                   headers: {'Content-Type'  : 'application/json'},
                     data : {token: 'teste'}

                   };   
                      //,'x-access-token' : 'MenegatTeste'    

        */
        function getReq(param, data){
                //console.log(Person.getToken());
                var req = { method: 'GET',
                              url : serviceBase + param,
                            params: data, 
                           /*headers: {'Content-Type'   : 'application/json',
                                     'x-token-access' : Person.getToken() }*/
                          }
                return req;
        };      

        function postReq(param){
                var req = { method: 'POST',
                              url : serviceBase,
                             data : param,
                           headers: {'Content-Type'  : 'application/json',
                                     'x-token-access' : Person.getToken() }                             
                          }
                return req;
        };   
        function getConfig(){
            return {headers: {'Content-Type'   : 'application/json',
                              'x-token-access' : Person.getToken() }};
        };

        obj.toast = function (data) {

            //toaster.success({ title: "Success", body: "Cancelled successfully!" });
            //toaster.pop(data.status, "", data.message, 10000, 'trustedHtml');            

            return toaster.pop(data.status, "title", data.message, 5000, 'trustedHtml');
            //toaster.pop('success', "title", '<ul><li>Mensagem fixa</li></ul>', 5000, 'trustedHtml');

            //$scope.$apply();
            //$toasterservice.show('error', 'TITLE', 'BODY');
             
        };   
        
        obj.get = function (q) {
            return $http.get(serviceBase + q).then(function(results) {
            //return $http.get(getReq(q)).then(function (results) {
                return results.data;
            });
        };

        obj.getById = function (q,id) {
            q += id;            
            //console.log(getConfig());
            return $http(getReq(q)).then(function(results){                
                return results.data;
            });
            config = getConfig();

            /*
            return $http.get(serviceBase + q, config).then(function (results) {
               return results.data;
            });*/

            /*console.log('Data.getByID: ' + q);
            return $http.get(serviceBase + q).then(function (results) {
               return results.data;
            });*/
        };
        obj.post = function (q, object) {
            return $http.post(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };
        obj.put = function (q, object) {
            return $http.put(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };
        obj.delete = function (q) {
            return $http.delete(serviceBase + q).then(function (results) {
                return results.data;
            });
        };

        return obj;
}]);
