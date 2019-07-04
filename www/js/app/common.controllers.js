angular.module('common.controllers', [])


   .controller('loginCtrl', function(changeSlotService, deviceLicenseService, $scope, $ionicPopup, ionicTimePicker, ionicDatePicker, $state, $http, $ionicPopover, $ionicLoading, $timeout, mappingService, currentBooking) {


        $scope.myactivation = {};
        $scope.myactivation.code = "";

        //Check if device is regsitered
        $scope.isApplicationActivated = false;
        if (!_.isUndefined(window.localStorage.deviceRegistrationData) && window.localStorage.deviceRegistrationData != '') {
            deviceLicenseService.setLicense(JSON.parse(window.localStorage.deviceRegistrationData));
            $scope.isApplicationActivated = true;
        }
        else{
            $scope.isApplicationActivated = false;
            $scope.myactivation.code = "";
            $scope.activationError = "";
        }          

        //Device Activation 
        $scope.doActivation = function(){

            if($scope.myactivation.code == ""){
                $ionicLoading.show({
                        template: "Enter Activation Code",
                        duration: 2000
                    });

                return "";
            }

            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });

            var admin_data = {
                "code": $scope.myactivation.code,
                "secret": "ACCELERATE_TAPS"
            }

            $http({
                    method: 'POST',
                    url: 'https://www.accelerateengine.app/apis/posactivatedevice.php',
                    data: JSON.stringify(admin_data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    timeout: 10000
                })
                .success(function(response) {
                    
                      $ionicLoading.hide();

                      if(response.status){

                        var licenceObject = response.response;
                        licenceObject.defaultPrinters = {
                            "VIEW": "",
                            "BILL": ""
                        }

                        window.localStorage.deviceRegistrationData = JSON.stringify(licenceObject);
                        deviceLicenseService.setLicense(licenceObject);
                        $scope.isApplicationActivated = true;   

                      }
                      else{
                        if(response.errorCode == 404){
                          $ionicLoading.show({
                                template: response.error,
                                duration: 3000
                          });
                          return '';
                        }
                        else{
                          $ionicLoading.show({
                                template: "Activation Failed",
                                duration: 3000
                          });
                          return '';
                        }
                      }

                })
                .error(function(data) {
                    $ionicLoading.hide();
                    $ionicLoading.show({
                        template: "Not responding. Check your connection.",
                        duration: 3000
                    });
                });
        }



        //Already Logged in case
        if (!_.isUndefined(window.localStorage.admin) && window.localStorage.admin != '') {
            $state.go('main.app.landing');
        }
        else{
            $state.go('main.app.login');
        }

        $scope.loginError = "";
        $scope.mydata = {};
        $scope.mydata.mobile = "";
        $scope.mydata.password = "";
        $scope.doLogin = function() {

            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });
            $http({
                    method: 'POST',
                    url: 'https://www.zaitoon.online/services/adminlogin.php',
                    data: $scope.mydata,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    timeout: 10000
                })
                .success(function(response) {
                    $ionicLoading.hide();
                    if (response.status) {
                        window.localStorage.admin = response.response;
                        $state.go('main.app.landing');
                    } else {
                        $scope.loginError = response.error;
                    }

                })
                .error(function(data) {
                    $ionicLoading.hide();
                    $ionicLoading.show({
                        template: "Not responding. Check your connection.",
                        duration: 3000
                    });
                });
        }



        

    })



    .controller('landingCtrl', function(deviceLicenseService, $ionicLoading, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicSideMenuDelegate, ShoppingCartService, mappingService) {
        
        if(deviceLicenseService.isActive()){

        }
        else{
            $state.go('main.app.login');
        }


        if (_.isUndefined(window.localStorage.admin) || window.localStorage.admin == '') {
            $state.go('main.app.login');
        }


        
        //last regenerate date not set
        if (_.isUndefined(window.localStorage.lastRegenerate) || window.localStorage.lastRegenerate == '') {
            var d = new Date();
            window.localStorage.lastRegenerate = d.getDate();
        } else {
            var date = new Date();
            var today = date.getDate();
            if (window.localStorage.lastRegenerate != today) {

                var mydata = {};
                mydata.token = window.localStorage.admin;

                //Regenrating token
                $http({
                        method: 'POST',
                        url: 'https://www.zaitoon.online/services/admintokenregenerate.php',
                        data: mydata,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        timeout : 10000
                    })
                    .success(function(response) {
                        $ionicLoading.hide();
                        if (response.status) {
                            window.localStorage.admin = response.response;
                            window.localStorage.lastRegenerate = today;
                        } else {
                            window.localStorage.admin = "";
                            window.localStorage.lastRegenerate = "";
                            $state.go('main.app.login');
                        }

                    })
                    .error(function(data) {});
            } else {
                //Do not regenerate
            }

        }


        $scope.logoutNow = function() {
            window.localStorage.admin = "";
            window.localStorage.lastRegenerate = "";
            $state.go('main.app.login');
        }
        
        $scope.goToPunchOrder = function(){
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
            $state.go('main.app.punch');
        }

        $scope.fetchReservations = function() {
            $state.go('main.reservationsapp.upcoming');
        };

        $scope.newReservation = function() {
            $state.go('main.app.walkin');
        };
        
        $scope.goToFeedback = function() {
            $state.go('main.app.feedbacklanding');
        }

        $scope.goToSettings = function() {
            $state.go('main.app.settings');
        }


        //SET DATE IN ADVANCE

        $scope.dateList = [];

        //Pre-populate time and date list:
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        var i = 0;
        var today = new Date();
        var dd, mm, yyyy;
        while (i < 7) {

            var date = new Date();
            date.setDate(today.getDate() + i);

            dd = date.getDate();
            mm = date.getMonth() + 1;
            yyyy = date.getFullYear();

            //Format Date and Month
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }

            if (i == 0) { //Today
                $scope.dateList.push({
                    value: dd + '-' + mm + '-' + yyyy,
                    name: "Today, " + date.getDate() + ' ' + months[date.getMonth()]
                });
            } else if (i == 1) { //Tomorrow
                $scope.dateList.push({
                    value: dd + '-' + mm + '-' + yyyy,
                    name: "Tomorrow, " + date.getDate() + ' ' + months[date.getMonth()]
                });
            } else { //Day Name
                $scope.dateList.push({
                    value: dd + '-' + mm + '-' + yyyy,
                    name: days[date.getDay()] + ", " + date.getDate() + ' ' + months[date.getMonth()]
                });
            }
            i++;
        }

        //Date DEFAULT option
        $scope.dateSelected = $scope.dateList[0];
        mappingService.setDate($scope.dateSelected.value, $scope.dateSelected.name);        

    })



    .controller('SettingsCtrl', function(deviceLicenseService, $ionicLoading, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicSideMenuDelegate, ShoppingCartService) {
 


        var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@localhost:5984/';



        $scope.navToggled = false;



        $scope.showOptionsMenu = function() {
            $ionicSideMenuDelegate.toggleLeft();
            $scope.navToggled = !$scope.navToggled;
        };


        var server_config_data = window.localStorage.defaultServerDetails && window.localStorage.defaultServerDetails != '' ? JSON.parse(window.localStorage.defaultServerDetails) : {};

        $scope.defaultServer = {};
        $scope.defaultServer.port = server_config_data.port && server_config_data.port != '' ? server_config_data.port : '5984';
        $scope.defaultServer.username = server_config_data.username && server_config_data.username != '' ? server_config_data.username : 'admin';
        $scope.defaultServer.password = server_config_data.password && server_config_data.password != '' ? server_config_data.password : 'admin';
        $scope.defaultServer.ip_address = server_config_data.ip_address && server_config_data.ip_address != '' ? server_config_data.ip_address : 'localhost';


        $scope.saveServerAddress = function(){
 
            var configured_url = '';

            if($scope.defaultServer.username != '' && $scope.defaultServer.username != ''){
              configured_url = 'http://'+$scope.defaultServer.username+':'+$scope.defaultServer.username+'@'+$scope.defaultServer.ip_address+':'+$scope.defaultServer.port+'/';
            }
            else{
              configured_url = 'http://'+$scope.defaultServer.ip_address+':'+$scope.defaultServer.port+'/';
            }         

            window.localStorage.defaultServerIPAddress = configured_url;

            var server_config_data = {};
            server_config_data.port = $scope.defaultServer.port;
            server_config_data.ip_address = $scope.defaultServer.ip_address;
            server_config_data.password = $scope.defaultServer.password;
            server_config_data.username = $scope.defaultServer.username;

            window.localStorage.defaultServerDetails = JSON.stringify(server_config_data);
        }

        $scope.usedLicense = deviceLicenseService.getLicense();


        //Device Name change
        $scope.current_value = deviceLicenseService.getLicense();
        
        $scope.submitDeviceNameChange = function(){
            
            $scope.usedLicense.device_name = $scope.current_value.device_name;
            deviceLicenseService.setDeviceName($scope.usedLicense.device_name);


                            var requestData = {
                              "selector"  :{ 
                                            "identifierTag": "ACCELERATE_REGISTERED_DEVICES" 
                                          },
                              "fields"    : ["_rev", "identifierTag", "value"]
                            }


                          //LOADING
                          $ionicLoading.show({
                            template:  '<ion-spinner></ion-spinner>'
                          });

                                  //Post to local Server
                                  $http({
                                        method  : 'POST',
                                        url     : COMMON_IP_ADDRESS+'/accelerate_settings/_find',
                                        data    : JSON.stringify(requestData),
                                        headers : {'Content-Type': 'application/json'},
                                        timeout : 10000
                                    })
                                    .success(function(data) { 

                                        if(data.docs.length > 0){
                                          if(data.docs[0].identifierTag == 'ACCELERATE_REGISTERED_DEVICES'){

                                             var machinesList = data.docs[0].value;

                                             for (var i=0; i<machinesList.length; i++) {
                                               if(machinesList[i].device_license_code == $scope.usedLicense.device_license_code){
                                                  
                                                  machinesList[i].device_name = $scope.current_value.device_name;

                                                  break;
                                               }
                                             }


                                              var remember_rev = data.docs[0]._rev;
                                              
                                              updateDetails();
                                              
                                              function updateDetails(){

                                                        //Update configured machines
                                                        var updateData = {
                                                          "_rev": remember_rev,
                                                          "identifierTag": "ACCELERATE_REGISTERED_DEVICES",
                                                          "value": machinesList
                                                        }

                                                      $http({
                                                            method  : 'PUT',
                                                            url     : COMMON_IP_ADDRESS+'accelerate_settings/ACCELERATE_REGISTERED_DEVICES/',
                                                            data    : JSON.stringify(updateData),
                                                            headers : {'Content-Type': 'application/json'},
                                                            timeout : 10000
                                                        })
                                                        .success(function(data) { 
                                                                            
                                                            $ionicLoading.hide();

                                                            //Update local storage
                                                            var myData = window.localStorage.deviceRegistrationData && window.localStorage.deviceRegistrationData != '' ? JSON.parse(window.localStorage.deviceRegistrationData) : {};
                                                            myData.device_name = $scope.current_value.device_name;

                                                            window.localStorage.deviceRegistrationData = JSON.stringify(myData);

                                                        })
                                                        .error(function(data) {
                                                                $ionicLoading.hide();

                                                                $ionicLoading.show({
                                                                    template: "Not responding. Check your connection.",
                                                                    duration: 3000
                                                                });
                                                            
                                                        });
                                                }


                                          }
                                          else{
                                            $ionicLoading.hide();
                                            $ionicLoading.show({ template: "Not responding. Check your connection.", duration: 3000 });
                                          }
                                        }
                                        else{
                                            $ionicLoading.hide();
                                            $ionicLoading.show({ template: "Not responding. Check your connection.", duration: 3000 });
                                        }

                                    })
                                    .error(function(data) {
                                        $ionicLoading.hide();

                                        $ionicLoading.show({
                                                template: "Not responding. Check your connection.",
                                                duration: 3000
                                        });
                                    
                                    });

        }   



        $scope.isLicenseMappedToLocalServer = window.localStorage.licence_server_mapping_flag && window.localStorage.licence_server_mapping_flag != '' ? window.localStorage.licence_server_mapping_flag : false;


        $scope.tryLocalServerRegistration = function(){
            

                        var device_licence = deviceLicenseService.getLicense();

                        if(!device_licence.device_license_code || device_licence.device_license_code == ''){
                            $ionicLoading.show({ template: "Something went wrong. Try again.", duration: 3000 });
                            return '';
                        }                          

                            var requestData = {
                              "selector"  :{ 
                                            "identifierTag": "ACCELERATE_REGISTERED_DEVICES" 
                                          },
                              "fields"    : ["_rev", "identifierTag", "value"]
                            }


                          //LOADING
                          $ionicLoading.show({
                            template:  '<ion-spinner></ion-spinner>'
                          });

                                  //Post to local Server
                                  $http({
                                        method  : 'POST',
                                        url     : COMMON_IP_ADDRESS+'/accelerate_settings/_find',
                                        data    : JSON.stringify(requestData),
                                        headers : {'Content-Type': 'application/json'},
                                        timeout : 10000
                                    })
                                    .success(function(data) { 

                                        if(data.docs.length > 0){
                                          if(data.docs[0].identifierTag == 'ACCELERATE_REGISTERED_DEVICES'){

                                             var machinesList = data.docs[0].value;

                                             for (var i=0; i<machinesList.length; i++) {
                                               if(machinesList[i].device_license_code == device_licence.device_license_code){
                                                  $ionicLoading.show({ template: "Activation Error: Licence already used.", duration: 3000 });
                                                  return '';
                                               }
                                             }

                                              machinesList.push(device_licence);
                                              var remember_rev = data.docs[0]._rev;
                                              
                                              updateDetails();
                                              

                                              function updateDetails(){

                                                        //Update configured machines
                                                        var updateData = {
                                                          "_rev": remember_rev,
                                                          "identifierTag": "ACCELERATE_REGISTERED_DEVICES",
                                                          "value": machinesList
                                                        }

                                                      $http({
                                                            method  : 'PUT',
                                                            url     : COMMON_IP_ADDRESS+'accelerate_settings/ACCELERATE_REGISTERED_DEVICES/',
                                                            data    : JSON.stringify(updateData),
                                                            headers : {'Content-Type': 'application/json'},
                                                            timeout : 10000
                                                        })
                                                        .success(function(data) { 
                                                                            
                                                            $ionicLoading.hide();

                                                            $ionicLoading.show({
                                                                template: "Activation Successful",
                                                                duration: 3000
                                                            });

                                                            window.localStorage.licence_server_mapping_flag = true;
                                                            $scope.isLicenseMappedToLocalServer = true;

                                                        })
                                                        .error(function(data) {
                                                                $ionicLoading.hide();

                                                                $ionicLoading.show({
                                                                    template: "Not responding. Check your connection.",
                                                                    duration: 3000
                                                                });
                                                            
                                                        });
                                                }


                                          }
                                          else{
                                            $ionicLoading.hide();
                                            $ionicLoading.show({ template: "Not responding. Check your connection.", duration: 3000 });
                                          }
                                        }
                                        else{
                                            $ionicLoading.hide();
                                            $ionicLoading.show({ template: "Not responding. Check your connection.", duration: 3000 });
                                        }

                                    })
                                    .error(function(data) {
                                        $ionicLoading.hide();

                                        $ionicLoading.show({
                                                template: "Not responding. Check your connection.",
                                                duration: 3000
                                        });
                                    
                                    });


        }





        $scope.resetDevice = function(){
            window.localStorage.admin = "";
            window.localStorage.deviceRegistrationData = "";

            $state.go('main.app.login')
        }


        $scope.refreshModesList = function(){
                var data = {};
                data.token = window.localStorage.admin;
                
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });
                
                
                    $http({
                        method: 'POST',
                        url: 'https://www.zaitoon.online/services/deskreservationchannels.php',
                        data: data,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        timeout : 10000
                    })
                    .success(function(data) {
                        $ionicLoading.hide();
                        if(data.status){
                            window.localStorage.modeList = JSON.stringify(data.response);
                            $scope.channels = data.response;
                            $scope.selectedChannelCode = $scope.channels[1].code;

                            $ionicLoading.show({
                                template: "Updated Successfully!",
                                duration: 3000
                            });
                        }
                        else{
                            $ionicLoading.show({
                                template: "Update Failed"+(data.error != "" ? ": "+data.error : ""),
                                duration: 3000
                            });
                        }
                    })
                    .error(function(data) {

                        $ionicLoading.hide();

                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });

                    });                
        }

    })
;
