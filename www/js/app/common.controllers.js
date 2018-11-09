angular.module('common.controllers', [])

    .controller('landingCtrl', function($scope, $state, $http, $ionicPopup, $ionicPopover, $ionicLoading, $timeout, mappingService, ionicDatePicker) {


      //   if (_.isUndefined(window.localStorage.admin) || window.localStorage.admin == '') {
      //       $state.go('main.app.login');
      //   }

      //   //last regenerate date not set
      //   if (_.isUndefined(window.localStorage.lastRegenerate) || window.localStorage.lastRegenerate == '') {
      //       var d = new Date();
      //       window.localStorage.lastRegenerate = d.getDate();
      //   } else {
      //       var date = new Date();
      //       var today = date.getDate();
      //       if (window.localStorage.lastRegenerate != today) {

      //           var mydata = {};
      //           mydata.token = window.localStorage.admin;

      //           //Regenrating token
      //           $http({
      //                   method: 'POST',
      //                   url: 'https://www.zaitoon.online/services/admintokenregenerate.php',
      //                   data: mydata,
      //                   headers: {
      //                       'Content-Type': 'application/x-www-form-urlencoded'
      //                   },
						// timeout : 10000
      //               })
      //               .success(function(response) {
						// $ionicLoading.hide();
      //                   if (response.status) {
      //                       window.localStorage.admin = response.response;
      //                       window.localStorage.lastRegenerate = today;
      //                   } else {
      //                       window.localStorage.admin = "";
      //                       window.localStorage.lastRegenerate = "";
      //                       $state.go('main.app.login');
      //                   }

      //               })
      //               .error(function(data) {});
      //       } else {
      //           //Do not regenerate
      //       }

      //   }


        $scope.logoutNow = function() {
            window.localStorage.admin = "";
            window.localStorage.lastRegenerate = "";
            $state.go('main.app.login');
        }


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

        $scope.dateListSize = $scope.dateList.length;

        //Choose Date
        $timeout(function() { //Time delay is added to give time gap for popup to load!!
            $ionicPopover.fromTemplateUrl('views/common/date-chooser-popover.html', {
                scope: $scope
            }).then(function(popover) {
                $scope.date_popover = popover;
            });
        }, 1000);

        $scope.openDatePopover = function($event) {
            $scope.date_popover.show($event);
        };

        $scope.setDate = function(date) {
            mappingService.setDate(date.value, date.name);
            $scope.dateSelected = date;
            $scope.date_popover.hide();
        };



        $scope.fetchReservations = function(){
            $state.go('main.reservationsapp.upcoming');
        };

        $scope.newReservation = function(){
            $state.go('main.app.walkin');
        }

       	$scope.goToPunchOrder = function(){
            $state.go('main.app.punch');
        };




        //Date Picker stuff
        var dateSelector = {
            callback: function(val) { //Mandatory

                var monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                var temp = new Date(val);
                var mm = temp.getMonth() + 1;
                var dd = temp.getDate();
                var yyyy = temp.getFullYear();
                if (mm < 10) mm = '0' + mm;
                if (dd < 10) dd = '0' + dd;
                var date = dd + '-' + mm + '-' + yyyy;
                var fancyDate = dd + ' ' + monthNames[temp.getMonth()] + ', ' + yyyy;
                mappingService.setDate(date, fancyDate);

                var mydate = {};
                mydate.value = date;
                mydate.name = fancyDate;
                $scope.dateSelected = mydate;
            },
            disabledDates: [ //Optional
            ],
            inputDate: new Date(), //Optional
            mondayFirst: true, //Optional
            disableWeekdays: [], //Optional
            closeOnSelect: false, //Optional
            templateType: 'popup' //Optional
        };

        $scope.selectCalendarDate = function() {
            ionicDatePicker.openDatePicker(dateSelector);
        }





 

    })

;
