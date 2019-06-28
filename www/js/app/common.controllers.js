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
                    url: 'https://www.accelerateengine.app/apis/posactivateapplication.php',
                    data: JSON.stringify(admin_data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    timeout: 10000
                })
                .success(function(response) {
                    $ionicLoading.hide();


                      if(response.status){

                            var sampleObj = {
                              "device_name" : "",
                              "device_license_code" : "ACCELERATE_TAPS_201",
                              "branch_code" : "JPNAGAR",
                              "branch_name" : "JP Nagar",
                              "activation_date" : "27-02-2019",
                              "expiry_date" : "26-02-2020"
                            }



                        window.localStorage.deviceRegistrationData = JSON.stringify(sampleObj);
                        deviceLicenseService.setLicense(sampleObj);
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
     
        $scope.navToggled = false;

        $scope.showOptionsMenu = function() {
            $ionicSideMenuDelegate.toggleLeft();
            $scope.navToggled = !$scope.navToggled;
        };

        $scope.defaultServer = {};
        $scope.defaultServer.ip_address = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@localhost:5984/';

        $scope.saveServerAddress = function(){
            window.localStorage.defaultServerIPAddress = $scope.defaultServer.ip_address;
        }

        $scope.usedLicense = deviceLicenseService.getLicense();


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
