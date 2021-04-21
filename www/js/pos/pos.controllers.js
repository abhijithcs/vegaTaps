angular.module('pos.controllers', ['ionic'])

    .controller('SmartCtrl', function(ShoppingCartService, $interval, menuContentService, currentGuestData, kitchen_comments, deviceLicenseService, $timeout, $ionicLoading, $ionicPopup, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicPopover, $ionicSideMenuDelegate) {


        var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@localhost:5984/';
        $ionicLoading.hide();

        if(window.localStorage.serverURL == '' || !window.localStorage.serverURL){
            
        }
        else{
            COMMON_IP_ADDRESS = window.localStorage.serverURL;
        }   

        $scope.kitchenComments = kitchen_comments;
        $scope.kitchenComments.sort();

        //Check if already cached
        var isCached = false;

        if(isCached){
            $scope.renderFailed = false;
            $scope.isRenderLoaded = true;
        }

        //User Profile
        $scope.isProfileSelected = false;
        $scope.selectedUserProfile = '';

        $scope.setUserProfile = function(profile_name, profile_mobile, flag){

            $scope.selectedUserProfile = profile_name;
            window.localStorage.loggedInUser_name = profile_name;
            window.localStorage.loggedInUser_mobile = profile_mobile;

            if(flag && flag == 'ADMIN'){
                window.localStorage.loggedInUser_admin = 1;
            }
            else{
                window.localStorage.loggedInUser_admin = 0;
            }

            $scope.isProfileSelected = true;

        }
        

        //Choose User Profile
        $scope.chooseUserProfile = function(){

                    $scope.allProfileData = [];

                    $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });

                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'accelerate_settings/ACCELERATE_STAFF_PROFILES',
                        timeout: 10000
                    })
                    .success(function(response) {

                        $ionicLoading.hide();

                        $scope.allProfileData = response.value;
                        

                        //Render Template
                        var i = 0;
                        var choiceTemplate = '<div style="margin-top: 5px">';
                        while (i < $scope.allProfileData.length) {
                            if($scope.allProfileData[i].role == "STEWARD" || $scope.allProfileData[i].role == "ADMIN"){
                                choiceTemplate = choiceTemplate + '<button class="button button-full" style="text-align: left; color: #c52031; margin-bottom: 8px; font-size: 18px; height: 54px; font-weight: 500; " ng-click="selectProfileFromWindow(\'' + $scope.allProfileData[i].name + '\', ' + $scope.allProfileData[i].code + ', \''+$scope.allProfileData[i].role+'\')">' + $scope.allProfileData[i].name + ' </button>';
                            }
                            i++;
                        }
                        choiceTemplate = choiceTemplate + '</div>';

                        var newCustomPopup = $ionicPopup.show({
                            cssClass: 'popup-tiles new-shipping-address-view',
                            template: choiceTemplate,
                            title: 'Select User',
                            scope: $scope,
                            buttons: [{
                                text: 'Cancel'
                            }]
                        });

                                  var login_passcode_modal = $ionicModal.fromTemplateUrl('views/common/templates/enter-user-passcode.html', {
                                    scope: $scope,
                                    animation: 'slide-in-up'
                                  }).then(function(modal) {
                                    $scope.login_passcode_modal = modal;
                                  });



                        $scope.selectProfileFromWindow = function(user_name, user_mobile, user_role) {
                            
                            newCustomPopup.close();

                            if(window.localStorage.loggedInUser_mobile &&  window.localStorage.loggedInUser_mobile == user_mobile){

                                return '';
                            }


                            if(user_role != 'ADMIN'){
                                $scope.setUserProfile(user_name, user_mobile);
                            }
                            else{ //Ask for passcode

                                  $scope.login_passcode_modal.show();

                                  $scope.passcodeEntered = [];

                                  $scope.clearPasscode = function(){
                                    $scope.passcodeEntered = [];
                                  }

                                  $scope.appendToPasscode = function(key){

                                    if($scope.passcodeEntered.length >= 4){
                                        return '';
                                    }
                                    else{
                                        $scope.passcodeEntered.push(key);
                                        if($scope.passcodeEntered.length == 4){
                                            var code_string = $scope.passcodeEntered[0]+''+$scope.passcodeEntered[1]+''+$scope.passcodeEntered[2]+''+$scope.passcodeEntered[3];
                                            validatePasscode(parseInt(code_string));

                                            function validatePasscode(number){

                                                $ionicLoading.show({
                                                    template: '<ion-spinner></ion-spinner> Loading Tables...'
                                                });

                                                $http({
                                                    method: 'GET',
                                                    url: COMMON_IP_ADDRESS+'accelerate_settings/ACCELERATE_STAFF_PROFILES',
                                                    timeout: 10000
                                                })
                                                .success(function(response) {

                                                    $ionicLoading.hide();
                                                    
                                                    var profile_data = response.value;

                                                    var i = 0;
                                                    while (i < profile_data.length) {
                                                        if(profile_data[i].code == user_mobile){
                                                            
                                                            if(number == profile_data[i].password){
                                                                $scope.login_passcode_modal.hide();
                                                                $scope.setUserProfile(user_name, user_mobile, 'ADMIN');
                                                            }
                                                            else{
                                                                $ionicLoading.show({
                                                                    template: "Incorrect Passcode",
                                                                    duration: 1000
                                                                });

                                                                $scope.passcodeEntered = [];
                                                                return '';
                                                            }

                                                            break;
                                                        }

                                                        i++
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
                                        }
                                    }

                                  }
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

        $scope.initUserProfile = function(){
            if(window.localStorage.loggedInUser_name && window.localStorage.loggedInUser_name != ''){
                $scope.selectedUserProfile = window.localStorage.loggedInUser_name;
                $scope.isProfileSelected = true;
            }
            else{
                $scope.chooseUserProfile();
            }
        }

        $scope.initUserProfile();



        //Side Navbar
        $scope.navToggled = false;
        $scope.showOptionsMenu = function() {
            //console.log('toggle sidemenu...', $scope.navToggled)
            $ionicSideMenuDelegate.toggleLeft();
            $scope.navToggled = !$scope.navToggled;
        };


        //Current time display
        $scope.currentTimeDisplay = '00:00';

        function updateClock() {
            $scope.currentTimeDisplay = moment().format('hh:mm a');
        }

        function timedUpdate () {
          updateClock();
          setTimeout(timedUpdate, 1000);
        }

        timedUpdate();




        $scope.$on('guest_updated', function(event, guest_object) {
            $scope.guestData = guest_object;
        });

        $scope.getTimeAgo = function(date){
            return moment(date).fromNow();
        }

        $scope.getActiveClass = function(type){
            if(type == "NEW"){
                return "activeSmartOrder";
            }
            else if(type == "RUNNING"){
                return "runningSmartOrder";
            }
        }


        //Timers
        var fetchSmartOrdersTimer = $interval(function() {
            $scope.fetchSmartOrders();
        }, 15000);

        $scope.$on('$destroy', function() {
            $interval.cancel(fetchSmartOrdersTimer);
        });

        $scope.isFirstTimeLoading = true;
        $scope.doOrderRefresh = function(){
            $scope.isFirstTimeLoading = true; 
            $scope.fetchSmartOrders('REFRESH');
        }


        // Making request to server to fetch-menu
        $scope.fetchSmartOrders = function(optionalRequest) {

              $scope.myPendingOrders = [];
              
              //FIRST LOAD
              $scope.renderFailed = false;
              $scope.isRenderLoaded = false;
              let data = {
                    "token": "sHtArttc2ht+tMf9baAeQ9ukHnXtlsHfexmCWx5sJOjMmduTS8FqbWXZu3C46tTVWfJK2QlHYHIQvEmu05QacaIoEtT4ABkAPy3dnnxeGYI="
                }

                $http({
                    method: 'POST',
                    url: 'https://accelerateengine.app/smart-menu/apis/adminfetchorders.php',
                    data: data,
                    timeout: 10000
                })
                .success(function(response) {
                    $scope.isFirstTimeLoading = false;
                    var allOrders = response.myPendingOrders;
                    $scope.allOtherOrders = response.otherCaptainsPendingOrders;
                    $scope.allOtherOrders.sort((a, b) => {
                        return a.table - b.table;
                    })

                    $scope.myPendingOrders = allOrders;

                    if(optionalRequest && optionalRequest == 'REFRESH'){
                        $scope.$broadcast('scroll.refreshComplete');
                    }

                    $scope.renderFailed = false;
                    $scope.isRenderLoaded = true;
                })
                .error(function(data) {
                    $scope.isFirstTimeLoading = false;
                    $ionicLoading.show({
                        template: "Not responding. Check your connection.",
                        duration: 3000
                    });

                    if(optionalRequest && optionalRequest == 'REFRESH'){
                        $scope.$broadcast('scroll.refreshComplete');
                    }

                    $scope.renderFailed = true;
                });
        }

        $scope.fetchSmartOrders();


        $scope.getNotificationMetrics();
        $scope.getNotificationMetrics = function(){
                let data = {
                    "token": "sHtArttc2ht+tMf9baAeQ9ukHnXtlsHfexmCWx5sJOjMmduTS8FqbWXZu3C46tTVWfJK2QlHYHIQvEmu05QacaIoEtT4ABkAPy3dnnxeGYI="
                }

                $http({
                    method: 'POST',
                    url: 'https://accelerateengine.app/smart-menu/apis/adminfetchnotificationmetrics.php',
                    data: data,
                    timeout: 10000
                })
                .success(function(response) {
                    $ionicLoading.hide();
                    if(response.status){

                        //Service Requests
                        if(response.serviceRequests && response.serviceRequests.length > 0){
                            $rootScope.$broadcast('ACTIVE_REQUESTS_ALERT', response.serviceRequests);
                        }
                        else{
                            $rootScope.$broadcast('ACTIVE_REQUESTS_ALERT', []);
                        }

                        //Service Requests
                        if(response.pendingOrders && response.pendingOrders.length > 0){
                            $rootScope.$broadcast('ACTIVE_ORDERS_ALERT', response.pendingOrders);
                        }
                    }
                })
        }



      $ionicModal.fromTemplateUrl('views/common/templates/view-smart-order.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.viewSmartOrderModal = modal;
      });



    $scope.rejectSmartOrder = function(orderData){
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner> Please Wait...'
        });

        var data = {
            masterOrderId: orderData.masterOrderId,
            subOrderId: orderData.orderData.subOrderId
        }

        $http({
            method: 'POST',
            url: 'https://accelerateengine.app/smart-menu/apis/adminrejectorder.php',
            data: data,
            timeout: 10000
        })
        .success(function(data) {
            $ionicLoading.hide();
            if(data.status){
                $scope.viewSmartOrderModal.hide();
                $scope.fetchSmartOrders();
            }
            else {
                $ionicLoading.show({
                    template: data.data,
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



      $scope.acceptSmartOrder = function(orderData){
        let cart = orderData.orderData.cart;
        let filteredCart = [];
        let i = 0;
        let isCartChanged = 0;
        while(i < cart.length){
            if(cart[i].isAvailable){
                filteredCart.push(cart[i]);
            }
            else {
                isCartChanged = 1;
            }
            i++;
        }

        if(filteredCart.length == 0){
           var alertPopup = $ionicPopup.alert({
            cssClass: 'popup-outer confirm-alert-view',
            title: "Warning",
            template: '<p style="color: #444; margin: 20px 0; font-size: 14px;">You have marked all items unavailable, so please <b>REJECT</b> the order.</p>'
           });

           return;
        }
        else {
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner> Please Wait...'
            });

            let formattedOrderData = orderData;
            formattedOrderData.orderData.cart = filteredCart;
            $scope.sendOrderToServer(formattedOrderData, isCartChanged);
        }
      }

      $scope.acceptSmartOrderOnline = function(orderData, isCartChanged, filteredCart){
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner> Please Wait...'
            });

            var data = {
                masterOrderId: orderData.masterOrderId,
                subOrderId: orderData.orderData.subOrderId,
                cartChanged: isCartChanged,
                cartFinal: filteredCart
            }

            $http({
                method: 'POST',
                url: 'https://accelerateengine.app/smart-menu/apis/adminacceptorder.php',
                data: data,
                timeout: 10000
            })
            .success(function(data) {
                $ionicLoading.hide();
                if(data.status){
                    $scope.viewSmartOrderModal.hide();
                    $scope.fetchSmartOrders();
                }
                else {
                    $ionicLoading.show({
                        template: data.data,
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






    //Clear all info after placing order
    $scope.orderPostClearData = function(optionalFlag){
        $scope.isOrderConfirmationProgressing = true;
        if(optionalFlag == 'SUCCESS'){
            $ionicLoading.show({
                template: '<p style=\'margin: 20px 0 0 0; font-size: 36px; color: #82dc82; font-family: "Great Vibes"\'>Success!</p><br>Order has been placed.',
                duration: 2000
            }); 

            $timeout(function() {
                $state.go('main.app.smart');
            }, 2000);           
        }
        else{
            $state.go('main.app.smart');   
        }
    }



    //Send KOT
    $scope.sendOrderToServer = function(formattedOrderData, isCartChanged){
                
                $scope.isOrderConfirmationProgressing = true;

                isTableFreeCheck(formattedOrderData.table);
                function isTableFreeCheck(table_req){
                    table_req = 2;
                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+table_req+'"]&endkey=["'+table_req+'"]',
                        timeout: 10000
                    })
                    .success(function(data) {
                        $ionicLoading.hide();
                        if(data.rows.length >= 1){
                                var thisTable = data.rows[0].value;
                                if(thisTable.status != 0){
                                    var confirmPopup = $ionicPopup.confirm({
                                        cssClass: 'popup-clear confirm-alert-alternate',
                                        title: 'Order Already Exists',
                                        template: '<p style="color: #4e5b6a; padding: 0 10px 10px 10px; margin: 0; font-size: 15px; font-weight: 400;">The table <b>'+table_req+'</b> is not free. Running KOT for the existing order?</p>'
                                    });

                                    confirmPopup.then(function(res) {
                                        if(res){
                                            $scope.orderPostClearData();
                                        }
                                        else{
                                        
                                        }
                                    });                                    

                                    return;
                                }
                                else{
                                    sendKOTToServerAfterProcess();
                                }
                        }
                        else{
                            $ionicLoading.show({
                                template: "Please check if <b>Table " + table_req + "</b> exists",
                                duration: 3000
                            });
                        }
                    })
                    .error(function(data) {
                        $ionicLoading.hide();
                        $ionicLoading.show({
                            template: "Error: Unable to get Table details from local server",
                            duration: 3000
                        });
                    });    

                }

                function sendKOTToServerAfterProcess(){

                        if(formattedOrderData.table == ''){
                            $ionicLoading.show({
                                template: "Not table selected, please punch manually.",
                                duration: 3000
                            });
                            return '';
                        }

                        var deviceDetails = window.localStorage.deviceRegistrationData && window.localStorage.deviceRegistrationData != "" ? JSON.parse(window.localStorage.deviceRegistrationData) : {};
                    
                        var tapOrderMetaData = {
                            "source": "SMART",
                            "type": "DINE"
                        }

                        var orderData = {
                              "_id": 'SMART_'+formattedOrderData.masterOrderId+'_'+formattedOrderData.orderData.subOrderId,
                              "tapsSource": tapOrderMetaData,
                              "KOTNumber": "",
                              "orderDetails": {
                                "mode": "",
                                "modeType": "",
                                "reference": formattedOrderData.orderData.subOrderId,
                                "isOnline": true
                              },
                              "table": formattedOrderData.table,
                              "customerName": formattedOrderData.guestName,
                              "customerMobile": formattedOrderData.guestMobile,
                              "guestCount": 0,
                              "machineName": deviceDetails.deviceUID,
                              "sessionName": "",
                              "stewardName": formattedOrderData.stewardName,
                              "stewardCode": formattedOrderData.stewardCode,
                              "date": "",
                              "timePunch": "",
                              "timeKOT": "",
                              "timeBill": "",
                              "timeSettle": "",
                              "cart": formattedOrderData.orderData.cart,
                              "specialRemarks": formattedOrderData.orderData.comments,
                              "allergyInfo": "",
                              "extras": [],
                              "discount": {},
                              "customExtras": {}
                        }


                                  var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@localhost:5984/';
                                        
                                  //LOADING
                                  $ionicLoading.show({
                                    template:  '<ion-spinner></ion-spinner>'
                                  });

                                    
                                    //post to server
                                    var http = new XMLHttpRequest();   
                                    var url = COMMON_IP_ADDRESS+'accelerate_third_party_orders';
                                    http.open("POST", url);
                                    http.setRequestHeader("Content-Type", "application/json");

                                    http.onreadystatechange = function() {
                                        let errorString = "";
                                        $ionicLoading.hide();
                                        if(http.status == 201) {
                                            $scope.orderPostClearData('SUCCESS');
                                            $scope.acceptSmartOrderOnline(formattedOrderData, isCartChanged, formattedOrderData.orderData.cart);
                                        }
                                        else if(http.status == 409){
                                            errorString = "Aborted! This Order was punched already";
                                            $scope.acceptSmartOrderOnline(formattedOrderData, isCartChanged, formattedOrderData.orderData.cart);
                                        }
                                        else if(http.status == 404){
                                            errorString = "Local Server Error: Connection failed";
                                        }
                                        else{
                                            errorString = "Error: Punching order failed";
                                        }

                                        if(errorString != ""){
                                            $ionicLoading.show({
                                                template: errorString,
                                                duration: 3000
                                            });
                                        }
                                    }

                                    http.send(JSON.stringify(orderData));  
                }
    }





       $scope.toggleAvailability = function(item, status, isViewingOnly){
            if(isViewingOnly){
                return;
            }

            let i = 0;
            while(i < $scope.orderData.orderData.cart.length){
                if(item.code == $scope.orderData.orderData.cart[i].code && item.variant == $scope.orderData.orderData.cart[i].variant){
                    $scope.orderData.orderData.cart[i].isAvailable = status;
                    break;
                }
                i++;
            }
       }   

      $scope.openSmartOrder = function(orderData, optionalRequest){
            $scope.orderData = orderData;
            var cart = orderData.orderData.cart;
            
            let i = 0;
            while(i < cart.length){
                cart[i].isAvailable = true;
                i++;
            }
            $scope.orderData.orderData.cart = cart;
            


            $scope.viewSmartOrderModal.show();
            if(optionalRequest == 'VIEW'){
                $scope.isViewingOnly = true;
            }
            else{
                $scope.isViewingOnly = false;
            }
            

            return;

                    $ionicLoading.show({
                        template: '<ion-spinner></ion-spinner> Please Wait...'
                    });

                    //FIRST LOAD
                    $scope.renderTableFailed = false;
                    $scope.isRenderTableLoaded = false;


                    //PRELOAD TABLE MAPPING
                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_tables/_design/filter-tables/_view/all/',
                        timeout: 10000
                    })
                    .success(function(data) {

                        if(data.total_rows > 0){

                              var tableData = data.rows;
                              tableData.sort(function(obj1, obj2) {
                                return obj1.key - obj2.key; //Key is equivalent to sortIndex
                              });


                              //load table sections
                                $http({
                                    method: 'GET',
                                    url: COMMON_IP_ADDRESS+'accelerate_settings/ACCELERATE_TABLE_SECTIONS',
                                    timeout: 10000
                                })
                                .success(function(data) {

                                    var sections_list = data.value;

                                    $ionicLoading.hide();

                                    //process tableData
                                    var tables_list = [];
                                    var g = 0;
                                    while(tableData[g]){

                                        tables_list.push(tableData[g].value);

                                        if(g == tableData.length - 1){
                                            nowRender();
                                            break;
                                        }

                                        g++;
                                    }

                                    function nowRender(){

                                        var n = 0;
                                        while(sections_list[n]){
                                            var filtered_tables = [];
                                            for(var i = 0; i < tables_list.length; i++){
                                                if(tables_list[i].type == sections_list[n]){
                                                    filtered_tables.push(tables_list[i])
                                                }

                                                if(i == tables_list.length - 1){ //last iteration
                                                    $scope.tablesMasterList.push({
                                                        "section": sections_list[n],
                                                        "tables": filtered_tables
                                                    });
                                                }
                                            }
                                            n++;
                                        }

                                        $scope.renderTableFailed = false;
                                        $scope.isRenderTableLoaded = true;

                                        
                                    }


                                })
                                .error(function(data) {

                                    $ionicLoading.hide();

                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });

                                    $scope.renderTableFailed = true;

                                });




                        }
                        else{
                            
                            $ionicLoading.hide();

                            $ionicLoading.show({
                                template: "Tables data not found. Please contact Accelerate Support.",
                                duration: 3000
                            });

                            $scope.renderTableFailed = true;
                        }
                    })
                    .error(function(data) {

                        $ionicLoading.hide();

                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });

                        $scope.renderTableFailed = true;
                    });

        }



        //Broadcast for Request Counter
        $scope.serviceRequestCounter = 0;
        $rootScope.$on('ACTIVE_REQUESTS_ALERT', function(event, requestData) {
            $scope.serviceRequestCounter = requestData.length;
        });


      $ionicModal.fromTemplateUrl('views/common/templates/view-service-requests.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.viewServiceRequestsModal = modal;
      });

      $scope.isViewingSelfRequestsOnly = false;

        $scope.openActionRequests = function(){

            //Load Table data
            $scope.tableMasterData = [];

            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner> Loading Tables...'
            });

            //FIRST LOAD
            $scope.renderTableFailed = false;
            $scope.isRenderTableLoaded = false;


            //PRELOAD TABLE MAPPING
            $http({
                method: 'GET',
                url: COMMON_IP_ADDRESS+'/accelerate_tables/_design/filter-tables/_view/all/',
                timeout: 10000
            })
            .success(function(data) {

                if(data.total_rows > 0){

                      var tableData = data.rows;
                      tableData.sort(function(obj1, obj2) {
                        return obj1.key - obj2.key; //Key is equivalent to sortIndex
                      });


                      //load table sections
                        $http({
                            method: 'GET',
                            url: COMMON_IP_ADDRESS+'accelerate_settings/ACCELERATE_TABLE_SECTIONS',
                            timeout: 10000
                        })
                        .success(function(data) {

                            var sections_list = data.value;

                            $ionicLoading.hide();

                            //process tableData
                            var tables_list = [];
                            var g = 0;
                            while(tableData[g]){

                                tables_list.push(tableData[g].value);

                                if(g == tableData.length - 1){
                                    nowRender();
                                    break;
                                }

                                g++;
                            }

                            function nowRender(){

                                var n = 0;
                                while(sections_list[n]){
                                    var filtered_tables = [];
                                    for(var i = 0; i < tables_list.length; i++){
                                        if(tables_list[i].type == sections_list[n]){
                                            filtered_tables.push(tables_list[i])
                                        }

                                        if(i == tables_list.length - 1){ //last iteration
                                            $scope.tableMasterData.push({
                                                "section": sections_list[n],
                                                "tables": filtered_tables
                                            });
                                        }
                                    }
                                    n++;
                                }

                                $scope.renderTableFailed = false;
                                $scope.isRenderTableLoaded = true;

                                loadServiceRequestsFromCloud();
                            }


                        })
                        .error(function(data) {

                            $ionicLoading.hide();

                            $ionicLoading.show({
                                template: "Not responding. Check your connection.",
                                duration: 3000
                            });

                            $scope.renderTableFailed = true;

                        });
                }
                else{
                    $ionicLoading.hide();
                    $ionicLoading.show({
                        template: "Tables data not found. Please contact Accelerate Support.",
                        duration: 3000
                    });
                    $scope.renderTableFailed = true;
                }
            })
            .error(function(data) {
                $ionicLoading.hide();
                $ionicLoading.show({
                    template: "Not responding. Check your connection.",
                    duration: 3000
                });
                $scope.renderTableFailed = true;
            });


            function loadServiceRequestsFromCloud(){
                let data = {
                    "token": "sHtArttc2ht+tMf9baAeQ9ukHnXtlsHfexmCWx5sJOjMmduTS8FqbWXZu3C46tTVWfJK2QlHYHIQvEmu05QacaIoEtT4ABkAPy3dnnxeGYI="
                }

                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner> Loading Requests...'
                });

                $http({
                    method: 'POST',
                    url: 'https://accelerateengine.app/smart-menu/apis/adminfetchactionrequests.php',
                    data: data,
                    timeout: 10000
                })
                .success(function(response) {
                    $ionicLoading.hide();
                    if(response.status){
                        let allRequests = response.data;
                        let tableMapper = {};
                        for(let k = 0; k < allRequests.length; k++){
                            tableMapper[allRequests[k].table] = allRequests[k];
                        }

                        for(let i = 0; i < $scope.tableMasterData.length; i++){
                            for(let n = 0; n < $scope.tableMasterData[i].tables.length; n++){
                                let tableKey = $scope.tableMasterData[i].tables[n].table;
                                if(tableMapper[tableKey]){
                                    $scope.tableMasterData[i].tables[n].serviceRequest = tableMapper[tableKey];
                                }
                            }
                        }

                        $scope.viewServiceRequestsModal.show();
                    }
                    else {
                        $ionicLoading.show({
                            template: "Failed to fetch from Cloud Server",
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
        }

        $scope.acknowledgeServiceRequest = function(seat){
            if (seat.serviceRequest && seat.serviceRequest != "") {
                let key = seat.serviceRequest.id;

                let data = {
                    "token": "sHtArttc2ht+tMf9baAeQ9ukHnXtlsHfexmCWx5sJOjMmduTS8FqbWXZu3C46tTVWfJK2QlHYHIQvEmu05QacaIoEtT4ABkAPy3dnnxeGYI=",
                    "requestId": key
                }

                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });

                $http({
                    method: 'POST',
                    url: 'https://accelerateengine.app/smart-menu/apis/adminacknowledgerequest.php',
                    data: data,
                    timeout: 10000
                })
                .success(function(response) {
                    $ionicLoading.hide();
                    $scope.openActionRequests();
                })
                .error(function(data) {
                    $ionicLoading.hide();
                });

            }
        }


        $scope.hasTableARequest = function(seat){
            return seat.serviceRequest && seat.serviceRequest != "";
        }

        $scope.getIconOrTable = function(seat) {
            if (seat.serviceRequest && seat.serviceRequest != "") {
                if(seat.serviceRequest.activeServiceRequest == "CALL_CALL_STEWARD"){
                    return '<i class="fa fa-user" aria-hidden="true"></i>';
                }
                if(seat.serviceRequest.activeServiceRequest == "CALL_REQUEST_BILL"){
                    return '<i class="fa fa-file-text-o" aria-hidden="true"></i>';
                }
                if(seat.serviceRequest.activeServiceRequest == "CALL_SERVE_FAST"){
                    return '<i class="fa fa-bolt" aria-hidden="true"></i>';
                }
            }
            else{
                return seat.table;
            }
        }


        $scope.getMyClass = function(seat) {
            if (seat.serviceRequest && seat.serviceRequest != "") {
                if(seat.serviceRequest.activeServiceRequest == "CALL_CALL_STEWARD"){
                    return "serviceTableSteward";
                }
                if(seat.serviceRequest.activeServiceRequest == "CALL_REQUEST_BILL"){
                    return "serviceTableBill";
                }
                if(seat.serviceRequest.activeServiceRequest == "CALL_SERVE_FAST"){
                    return "serviceTableFast";
                }
            }
        }

        $scope.getMyRequestTitle = function(seat) {
            if (seat.serviceRequest && seat.serviceRequest != "") {
                if(seat.serviceRequest.activeServiceRequest == "CALL_CALL_STEWARD"){
                    return "Attend";
                }
                if(seat.serviceRequest.activeServiceRequest == "CALL_REQUEST_BILL"){
                    return "Take Bill";
                }
                if(seat.serviceRequest.activeServiceRequest == "CALL_SERVE_FAST"){
                    return "Serve Fast";
                }
            }
        }
})





    .controller('StatusRunningCtrl', function($ionicLoading, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicSideMenuDelegate, ShoppingCartService, deviceLicenseService, currentGuestData) {
      

        var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@localhost:5984/';

        $ionicLoading.hide();



        $scope.isRenderOrderLoaded = false;
    
        $scope.renderAllKOTs = function(specialRequest){

                    $scope.ordersMasterList = [];
                    $scope.isEmpty = false;

                    //FIRST LOAD
                    $scope.renderOrderFailed = false;
                    $scope.isRenderOrderLoaded = false;


                    //Get all the live KOTs
                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_kot/_design/kot-fetch/_view/fetchbytype?startkey=["DINE"]&endkey=["DINE"]&include_docs=true',
                        timeout: 10000
                    })
                    .success(function(data) {

                        if(specialRequest && specialRequest == 'REFRESH'){
                            $scope.$broadcast('scroll.refreshComplete');
                        }

                        if(data.total_rows > 0){

                                    var orderData = data.rows;
                                    orderData.sort(function(obj1, obj2) {
                                        return obj1.value.table - obj2.value.table;
                                    });

                                    $scope.orders_list = [];
                                    var g = 0;
                                    while(orderData[g]){

                                        $scope.orders_list.push(orderData[g].value);

                                        if(g == orderData.length - 1){
                                            break;
                                        }

                                        g++;
                                    }

                                    
                                    $scope.renderOrderFailed = false;
                                    $scope.isRenderOrderLoaded = true;

                        }
                        else{
                            
                            $ionicLoading.hide();
                            $scope.isRenderOrderLoaded = true;
                            $scope.isEmpty = true;
                        }
                    })
                    .error(function(data) {

                        $ionicLoading.hide();

                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });

                        $scope.renderOrderFailed = true;

                        if(specialRequest && specialRequest == 'REFRESH'){
                            $scope.$broadcast('scroll.refreshComplete');
                        }

                    });
        }

        $scope.renderAllKOTs();

        $scope.filterTime = function(obj){
            if(obj.timeKOT != ''){
                return moment(obj.timeKOT, "HHmm").format('h:mm a');
            }
            else{
                return moment(obj.timePunch, "HHmm").format('h:mm a');
            }
        }



        $scope.doStatusRefresh = function(){
            $scope.renderAllKOTs('REFRESH');   
        }


        $scope.openCommentsIfAdded = function(item){
            if(item.comments && item.comments != ''){

               var alertPopup = $ionicPopup.alert({
                cssClass: 'popup-outer confirm-alert-view',
                title: item.name + (item.isCustom ? ' ('+item.variant+')' : ''),
                template: '<p style="padding: 20px 0px; color: #444; margin: 0; font-style: italic; font-size: 15px; font-weight: bold;"><i class="fa fa-comments-o" style="font-size: 24px; color: #cccccc; margin-right: 5px"></i>' + item.comments + '</p>'
               });


            }
        }


        $scope.viewOrderOptions = function(orderData){

                        var choiceTemplate =    '<div class="row">'+
                                                    '<div class="col col-50">'+
                                                        '<div class="actionTile" ng-click="actionTileFunction(\'OPEN\')">'+
                                                            '<div class="actionTileIcon shadeGreenYellow">O</div>'+
                                                            '<div class="actionTileText" style="color: #88deba">Open Order</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                    '<div class="col col-50">'+
                                                        '<div class="actionTile" ng-click="actionTileFunction(\'PRINT_VIEW\')">'+
                                                            '<div class="actionTileIcon shadeYellowOrange">V</div>'+
                                                            '<div class="actionTileText" style="color: #e48345">Print View</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</div>'+
                                                '<div class="row" style="margin-top: 6px;">'+
                                                    '<div class="col col-50">'+
                                                        '<div class="actionTile" ng-click="actionTileFunction(\'PRINT_KOT\')">'+
                                                            '<div class="actionTileIcon shadeRedPink">K</div>'+
                                                            '<div class="actionTileText" style="color: #de6066">Duplicate KOT</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                    '<div class="col col-50">'+
                                                        '<div class="actionTile" ng-click="actionTileFunction(\'PRINT_BILL\')">'+
                                                            '<div class="actionTileIcon shadeBlueViolet">B</div>'+
                                                            '<div class="actionTileText" style="color: #5ca7dc">Print Bill</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</div>';

                        $scope.actionTilesDataContent = orderData;
                        $scope.actionTilesPopup = $ionicPopup.show({
                            cssClass: 'popup-actions tile-actions-view',
                            template: choiceTemplate,
                            title: '',
                            scope: $scope,
                            buttons: [{
                                text: 'Close'
                            }]
                        });

        }

        $scope.actionTileFunction = function(type){
            
            var orderData = $scope.actionTilesDataContent;
            $scope.actionTilesPopup.close();


            switch(type){
                case "OPEN":{
                    $scope.openOrderToEdit(orderData);
                    return '';
                }
                case "PRINT_VIEW":{

                    var success_text = '<b style="color: #5ada5f">Successful!</b><br><b>Items View</b> to be printed shortly.';
                    var duplicate_error_text = '<b style="color: #ef3d74">Failed!</b><br>There is already a pending Print View request. Please try later.';

                    var actionObject = {
                        "_id": "PRINT_VIEW_"+orderData._id,
                        "KOT": orderData._id,
                        "action": "PRINT_VIEW",
                        "table": orderData.table,
                        "staffName": window.localStorage.loggedInUser_name && window.localStorage.loggedInUser_name != "" ? window.localStorage.loggedInUser_name : "Unknown",
                        "staffCode": window.localStorage.loggedInUser_mobile && window.localStorage.loggedInUser_mobile != "" ? window.localStorage.loggedInUser_mobile : "Unknown",
                        "machine": deviceLicenseService.getDeviceName(),
                        "time": moment().format('HHmm'),
                        "date": moment().format('DD-MM-YYYY')
                    }

                    postActionRequest(actionObject, success_text, duplicate_error_text);
                    break;
                }
                case "PRINT_KOT":{

                    var success_text = '<b style="color: #5ada5f">Successful!</b><br><b>Duplicate KOT</b> to be printed shortly.';
                    var duplicate_error_text = '<b style="color: #ef3d74">Failed!</b><br>There is already a pending Print KOT request. Please try later.';

                    var actionObject = {
                        "_id": "PRINT_KOT_"+orderData._id,
                        "KOT": orderData._id,
                        "action": "PRINT_KOT",
                        "table": orderData.table,
                        "staffName": window.localStorage.loggedInUser_name && window.localStorage.loggedInUser_name != "" ? window.localStorage.loggedInUser_name : "Unknown",
                        "staffCode": window.localStorage.loggedInUser_mobile && window.localStorage.loggedInUser_mobile != "" ? window.localStorage.loggedInUser_mobile : "Unknown",
                        "machine": deviceLicenseService.getDeviceName(),
                        "time": moment().format('HHmm'),
                        "date": moment().format('DD-MM-YYYY')
                    }

                    postActionRequest(actionObject, success_text, duplicate_error_text);
                    break;
                }
                case "PRINT_BILL":{

                    /*
                        Important: Check if there are any un-printed KOT print requests pending to be processed.
                        A bug is causing infinite loop: When PRINT_BILL request is pressed immediately after cart is modified.
                        PRINT_BILL request is processed on priority than printing KOT changes. This cases the issue. 
                    */

                    //Check if any un-printed KOT changes existing?


                    //Set _id from Branch mentioned in Licence
                    var accelerate_licencee_branch = deviceLicenseService.getBranchCode();
                    if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                      var alertPopup = $ionicPopup.alert({
                                                cssClass: 'popup-clear confirm-alert-alternate',
                                                title: 'Invalid Licence Error',
                                                template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT can not be opened. Please contact Accelerate Support if problem persists.</p>'
                                            });
                      return '';
                    }

                    var kot_request_data = accelerate_licencee_branch +"_KOT_"+ orderData.KOTNumber;

                    $ionicLoading.show({ template: '<ion-spinner></ion-spinner> Checking...' });

                    $http({
                            method: 'GET',
                            url: COMMON_IP_ADDRESS+'/accelerate_taps_orders/'+kot_request_data,
                            timeout: 10000
                        })
                        .success(function(data) {
                            if(data._id != ""){

                                $ionicLoading.hide();

                                $ionicLoading.show({
                                    template: "Unsaved changes on this table. Please try again.",
                                    duration: 3000
                                });

                                return '';

                            }
                            else{
                                proceedToPrintBill();
                            }
                        })
                        .error(function(data) {
                            $ionicLoading.hide();
                            proceedToPrintBill();
                        });



                    function proceedToPrintBill(){
                        var success_text = '<b style="color: #5ada5f">Successful!</b><br><b>Bill</b> to be printed shortly.';
                        var duplicate_error_text = '<b style="color: #ef3d74">Failed!</b><br>Already requested to print the Bill.';

                        var actionObject = {
                            "_id": "PRINT_BILL_"+orderData._id,
                            "KOT": orderData._id,
                            "action": "PRINT_BILL",
                            "table": orderData.table,
                            "staffName": window.localStorage.loggedInUser_name && window.localStorage.loggedInUser_name != "" ? window.localStorage.loggedInUser_name : "Unknown",
                            "staffCode": window.localStorage.loggedInUser_mobile && window.localStorage.loggedInUser_mobile != "" ? window.localStorage.loggedInUser_mobile : "Unknown",
                            "machine": deviceLicenseService.getDeviceName(),
                            "time": moment().format('HHmm'),
                            "date": moment().format('DD-MM-YYYY')
                        }

                        postActionRequest(actionObject, success_text, duplicate_error_text);
                    }

                    break;
                }


            }

            function postActionRequest(actionObject, success_text, duplicate_error_text){

                          var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@localhost:5984/';
                                
                          //LOADING
                          $ionicLoading.show({
                            template:  '<ion-spinner></ion-spinner>'
                          });

                                  //Post to local Server
                                  $http({
                                        method  : 'POST',
                                        url     : COMMON_IP_ADDRESS+'accelerate_action_requests/',
                                        data    : actionObject,
                                        headers : {'Content-Type': 'application/json'},
                                        timeout : 10000
                                    })
                                    .success(function(response) { 
                                      if(response.ok){
                                        $ionicLoading.hide();
                                        $ionicLoading.show({
                                            template: success_text,
                                            duration: 2000
                                        });
                                      }
                                      else{
                                        $ionicLoading.hide();
                                        $ionicLoading.show({
                                            template: "Not responding. Check your connection.",
                                            duration: 3000
                                        });
                                      }

                                    })
                                    .error(function(data) {
                                        $ionicLoading.hide();
                                        if(data.error == "conflict"){
                                            $ionicLoading.show({
                                                template: duplicate_error_text,
                                                duration: 3000
                                            });
                                        }
                                        else{
                                            $ionicLoading.show({
                                                template: "Not responding. Check your connection.",
                                                duration: 3000
                                            });
                                        }
                                    });
            }
        }


        //Open order to edit
        $scope.openOrderToEdit = function(editOrder){


                //Set _id from Branch mentioned in Licence
                var accelerate_licencee_branch = deviceLicenseService.getBranchCode();
                if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                  var alertPopup = $ionicPopup.alert({
                                            cssClass: 'popup-clear confirm-alert-alternate',
                                            title: 'Invalid Licence Error',
                                            template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT can not be opened. Please contact Accelerate Support if problem persists.</p>'
                                        });
                  return '';
                }

                var kot_request_data = accelerate_licencee_branch +"_KOT_"+ editOrder.KOTNumber;


                $ionicLoading.show({ template: '<ion-spinner></ion-spinner> Loading Tables...' });


                    //PRELOAD TABLE MAPPING
                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_kot/'+kot_request_data,
                        timeout: 10000
                    })
                    .success(function(data) {
                        if(data._id != ""){

                            var kot = data;
                            $ionicLoading.hide();


                            if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){

                                var alreadyEditingKOT = JSON.parse(window.localStorage.edit_KOT_originalCopy);
                                if(alreadyEditingKOT.KOTNumber == kot.KOTNumber)//if thats the same order, neglect.
                                {
                                    $state.go('main.app.punch');
                                    return '';
                                }
                                else{
                                    //Editing order has unsaved changes
                                    if(window.localStorage.hasUnsavedChangesFlag && window.localStorage.hasUnsavedChangesFlag == 1){
                                        
                                           var alertPopup = $ionicPopup.alert({
                                            cssClass: 'popup-clear confirm-alert-alternate',
                                            title: 'Warning',
                                            template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">There is already an active order being modified. Please complete it to continue.</p>'
                                           });

                                           return '';
                                    }
                                }
                            }

                            $scope.overWriteCurrentRunningOrder(kot);

                        }
                        else{
                                $ionicLoading.hide();

                                    var alertPopup = $ionicPopup.alert({
                                            cssClass: 'popup-clear confirm-alert-alternate',
                                            title: 'Not Found Error',
                                            template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">#'+kotID+' not found on Server. Please contact Accelerate Support.</p>'
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


        $scope.overWriteCurrentRunningOrder = function(kot){

            var customerInfo = {};
            customerInfo.name = kot.customerName;
            customerInfo.mobile = kot.customerMobile;
            customerInfo.count = kot.guestCount && kot.guestCount != '' ? parseInt(kot.guestCount) : 0;
            customerInfo.mappedAddress = kot.table;
            customerInfo.mode = kot.orderDetails.mode;
            customerInfo.modeType = kot.orderDetails.modeType;
            customerInfo.reference = kot.orderDetails.reference;
            customerInfo.isOnline = kot.orderDetails.isOnline;

            window.localStorage.current_table_selection = kot.table;


            if(kot.specialRemarks && kot.specialRemarks != ''){
                window.localStorage.specialRequests_comments = kot.specialRemarks;
            }
            else{
                window.localStorage.specialRequests_comments = '';
            }

            if(kot.allergyInfo && kot.allergyInfo != []){
                window.localStorage.allergicIngredientsData = JSON.stringify(kot.allergyInfo);
            }
            else{
                window.localStorage.allergicIngredientsData = '';
            }


            //Pending new order will be removed off the cart.
            window.localStorage.accelerate_cart = JSON.stringify(kot.cart);
            //window.localStorage.customerData = JSON.stringify(customerInfo);

            //window.localStorage.edit_KOT_originalCopy = decodeURI(encodedKOT);
            window.localStorage.edit_KOT_originalCopy = JSON.stringify(kot);


            //record max cart index
                var i = 0;
                var maxCartIndex = 0;

                while(i < kot.cart.length){
                  if(maxCartIndex <= kot.cart[i].cartIndex){
                        maxCartIndex = kot.cart[i].cartIndex;
                  }

                  i++;
                }

            window.localStorage.maxCartIndex = maxCartIndex;

            //Update Guest details
            currentGuestData.setGuest(kot.customerName, kot.customerMobile, kot.guestCount ? parseInt(kot.guestCount) : '');
            
            $state.go('main.app.punch');

        }

       

    })

    .controller('StatusTablesCtrl', function($ionicLoading, ShoppingCartService, currentGuestData, deviceLicenseService, inoviceFeedbackMappingService, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicSideMenuDelegate) {
        

        var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@localhost:5984/';


        $scope.isRenderTableLoaded = false;

    
        $scope.openSeatPlanView = function(specialRequest){

                    $scope.tablesMasterList = [];

                    //FIRST LOAD
                    $scope.renderTableFailed = false;
                    $scope.isRenderTableLoaded = false;


                    //PRELOAD TABLE MAPPING
                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_tables/_design/filter-tables/_view/all/',
                        timeout: 10000
                    })
                    .success(function(data) {

                        if(data.total_rows > 0){

                              var tableData = data.rows;
                              tableData.sort(function(obj1, obj2) {
                                return obj1.key - obj2.key; //Key is equivalent to sortIndex
                              });



                              //load table sections
                                $http({
                                    method: 'GET',
                                    url: COMMON_IP_ADDRESS+'accelerate_settings/ACCELERATE_TABLE_SECTIONS',
                                    timeout: 10000
                                })
                                .success(function(data) {

                                    var sections_list = data.value;

                                    $ionicLoading.hide();

                                    if(specialRequest && specialRequest == 'REFRESH'){
                                        $scope.$broadcast('scroll.refreshComplete');
                                    }


                                    //process tableData
                                    var tables_list = [];
                                    var g = 0;
                                    while(tableData[g]){

                                        tables_list.push(tableData[g].value);

                                        if(g == tableData.length - 1){
                                            nowRender();
                                            break;
                                        }

                                        g++;
                                    }

                                    function nowRender(){

                                        var n = 0;
                                        while(sections_list[n]){
                                            var filtered_tables = [];
                                            for(var i = 0; i < tables_list.length; i++){
                                                if(tables_list[i].type == sections_list[n]){
                                                    filtered_tables.push(tables_list[i])
                                                }

                                                if(i == tables_list.length - 1){ //last iteration
                                                    $scope.tablesMasterList.push({
                                                        "section": sections_list[n],
                                                        "tables": filtered_tables
                                                    });
                                                }
                                            }
                                            n++;
                                        }

                                        $scope.renderTableFailed = false;
                                        $scope.isRenderTableLoaded = true;
                                    }


                                })
                                .error(function(data) {

                                    $ionicLoading.hide();

                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });

                                    $scope.renderTableFailed = true;
                                });




                        }
                        else{
                            
                            $ionicLoading.hide();

                            $ionicLoading.show({
                                template: "Tables data not found. Please contact Accelerate Support.",
                                duration: 3000
                            });

                            $scope.renderTableFailed = true;
                        }
                    })
                    .error(function(data) {

                        $ionicLoading.hide();

                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });

                        $scope.renderTableFailed = true;
                    });
        }

        $scope.openSeatPlanView();




        $scope.getMyClass = function(seat) {
            if (seat.status == 0) {
                return "button-balanced";
            } else if (seat.status == 1) {
                return "button-assertive";
            } else if (seat.status == 2) {
                return "button-energized";
            }
            else if (seat.status == 5) {
                return "mySpecialReservedButton";
            }
        }



    $scope.doTableRefresh = function(){
        $scope.openSeatPlanView('REFRESH');   
    }



    $scope.viewAvailableOptions = function(seat){

        if(seat.status == 0 || seat.status == 5){
            $scope.openFreeSeat(seat)
            return "";       
        }
        else if(seat.status == 2){ //Billed Order
                    
                        var choiceTemplate =    '<div class="row">'+
                                                    '<div class="col col-50">'+
                                                        '<div class="actionTile" ng-click="billedActionTileFunction(\'SETTLE_LATER\')">'+
                                                            '<div class="actionTileIcon shadeYellowOrange" style="background: #ffa25b"><i class="fa fa-check"></i></div>'+
                                                            '<div class="actionTileText" style="color: #ffa25b">Settle Later</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                    '<div class="col col-50">'+
                                                        '<div class="actionTile" ng-click="billedActionTileFunction(\'FEEDBACK\')">'+
                                                            '<div class="actionTileIcon shadeGreenYellow" style="background: #1fd4ae"><i class="fa fa-star"></i></div>'+
                                                            '<div class="actionTileText" style="color: #1fd4ae">Take Feedback</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</div>';


                        $scope.billedActionTilesDataContent = seat; //orderData;
                        $scope.billedActionTilesPopup = $ionicPopup.show({
                            cssClass: 'popup-actions tile-actions-view',
                            template: choiceTemplate,
                            title: '',
                            scope: $scope,
                            buttons: [{
                                text: 'Close'
                            }]
                        });   
        }
        else{

                        var choiceTemplate =    '<div class="row">'+
                                                    '<div class="col col-50">'+
                                                        '<div class="actionTile" ng-click="actionTileFunction(\'OPEN\')">'+
                                                            '<div class="actionTileIcon shadeGreenYellow" style="background: #8fda66">O</div>'+
                                                            '<div class="actionTileText" style="color: #8fda66">Open Order</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                    '<div class="col col-50">'+
                                                        '<div class="actionTile" ng-click="actionTileFunction(\'PRINT_VIEW\')">'+
                                                            '<div class="actionTileIcon shadeYellowOrange" style="background: #f49632">V</div>'+
                                                            '<div class="actionTileText" style="color: #f49632">Print View</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</div>'+
                                                '<div class="row" style="margin-top: 6px;">'+
                                                    '<div class="col col-50">'+
                                                        '<div class="actionTile" ng-click="actionTileFunction(\'PRINT_KOT\')">'+
                                                            '<div class="actionTileIcon shadeRedPink" style="background: #FF416C">K</div>'+
                                                            '<div class="actionTileText" style="color: #FF416C">Duplicate KOT</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                    '<div class="col col-50">'+
                                                        '<div class="actionTile" ng-click="actionTileFunction(\'PRINT_BILL\')">'+
                                                            '<div class="actionTileIcon shadeBlueViolet" style="background:#40abe1">B</div>'+
                                                            '<div class="actionTileText" style="color: #40abe1">Print Bill</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</div>';

                        $scope.actionTilesDataContent = seat; //orderData;
                        $scope.actionTilesPopup = $ionicPopup.show({
                            cssClass: 'popup-actions tile-actions-view',
                            template: choiceTemplate,
                            title: '',
                            scope: $scope,
                            buttons: [{
                                text: 'Close'
                            }]
                        });

        }

    }





        $scope.billedActionTileFunction = function(type){

            var seatData = $scope.billedActionTilesDataContent;
            $scope.billedActionTilesPopup.close();

            if(type == 'SETTLE_LATER'){
                freeBilledTable(seatData.table);
            }
            else if(type == 'FEEDBACK'){
                inoviceFeedbackMappingService.setInvoiceDetails(seatData.KOT, seatData.guestContact, seatData.guestName);
                $rootScope.$broadcast('feedback_opted', '');
                $state.go('main.app.feedbacklanding');
            }


            function freeBilledTable(tableNumber){

                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+tableNumber+'"]&endkey=["'+tableNumber+'"]',
                        timeout: 10000
                    })
                    .success(function(data) {
                        if(data.rows.length == 1){

                              var tableData = data.rows[0].value;

                              if(tableData.table == tableNumber){

                                tableData.assigned = "";
                                tableData.remarks = "";
                                tableData.KOT = "";
                                tableData.status = 0;
                                tableData.lastUpdate = "";  
                                tableData.guestName = ""; 
                                tableData.guestContact = ""; 
                                tableData.reservationMapping = ""; 
                                tableData.guestCount = "";



                                    //Update
                                    $http({
                                        method: 'PUT',
                                        url: COMMON_IP_ADDRESS+'accelerate_tables/'+tableData._id+'/',
                                        data: JSON.stringify(tableData),
                                        contentType: "application/json",
                                        dataType: 'json',
                                        timeout: 10000
                                    })
                                    .success(function(data) {
                                        $scope.openSeatPlanView();
                                    });

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


        }



        $scope.actionTileFunction = function(type){

            var seatData = $scope.actionTilesDataContent;
            $scope.actionTilesPopup.close();


            loadOrderData(seatData);

            //Load order data
            function loadOrderData(seat){

                    //Set _id from Branch mentioned in Licence
                    var accelerate_licencee_branch = deviceLicenseService.getBranchCode();
                    if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                      var alertPopup = $ionicPopup.alert({
                                                cssClass: 'popup-clear confirm-alert-alternate',
                                                title: 'Invalid Licence Error',
                                                template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT can not be opened. Please contact Accelerate Support if problem persists.</p>'
                                            });
                      return '';
                    }


                    var kot_request_data = accelerate_licencee_branch +"_KOT_"+ seat.KOT;
                    var kotID = seat.KOT;

                    //PRELOAD TABLE MAPPING
                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_kot/'+kot_request_data,
                        timeout: 10000
                    })
                    .success(function(data) {
                        if(data._id != ""){

                            var orderData = data;
                            processOrderAction(orderData)

                        }
                        else{
                                var alertPopup = $ionicPopup.alert({
                                    cssClass: 'popup-clear confirm-alert-alternate',
                                    title: 'Not Found Error',
                                    template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT #'+kotID+' not found on Server.</p>'
                                });
                        }
                    })
                    .error(function(data) {

                        $ionicLoading.hide();

                        if(data.error == "not_found"){
                            var alertPopup = $ionicPopup.alert({
                                cssClass: 'popup-clear confirm-alert-alternate',
                                title: 'Not Found Error',
                                template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT #'+kotID+' not found on Server.</p>'
                            });
                        }
                        else{
                            $ionicLoading.show({
                                template: "Not responding. Check your connection.",
                                duration: 3000
                            });
                        }
                    });
            }


            function processOrderAction(orderData){

                switch(type){
                    case "OPEN":{
                        $scope.openOrderToEdit(orderData);
                        return '';
                    }
                    case "PRINT_VIEW":{

                        var success_text = '<b style="color: #5ada5f">Successful!</b><br><b>Items View</b> to be printed shortly.';
                        var duplicate_error_text = '<b style="color: #ef3d74">Failed!</b><br>There is already a pending Print View request. Please try later.';

                        var actionObject = {
                            "_id": "PRINT_VIEW_"+orderData._id,
                            "KOT": orderData._id,
                            "action": "PRINT_VIEW",
                            "table": orderData.table,
                            "staffName": window.localStorage.loggedInUser_name && window.localStorage.loggedInUser_name != "" ? window.localStorage.loggedInUser_name : "Unknown",
                            "staffCode": window.localStorage.loggedInUser_mobile && window.localStorage.loggedInUser_mobile != "" ? window.localStorage.loggedInUser_mobile : "Unknown",
                            "machine": deviceLicenseService.getDeviceName(),
                            "time": moment().format('HHmm'),
                            "date": moment().format('DD-MM-YYYY')
                        }

                        postActionRequest(actionObject, success_text, duplicate_error_text);
                        break;
                    }
                    case "PRINT_KOT":{

                        var success_text = '<b style="color: #5ada5f">Successful!</b><br><b>Duplicate KOT</b> to be printed shortly.';
                        var duplicate_error_text = '<b style="color: #ef3d74">Failed!</b><br>There is already a pending Print KOT request. Please try later.';

                        var actionObject = {
                            "_id": "PRINT_KOT_"+orderData._id,
                            "KOT": orderData._id,
                            "action": "PRINT_KOT",
                            "table": orderData.table,
                            "staffName": window.localStorage.loggedInUser_name && window.localStorage.loggedInUser_name != "" ? window.localStorage.loggedInUser_name : "Unknown",
                            "staffCode": window.localStorage.loggedInUser_mobile && window.localStorage.loggedInUser_mobile != "" ? window.localStorage.loggedInUser_mobile : "Unknown",
                            "machine": deviceLicenseService.getDeviceName(),
                            "time": moment().format('HHmm'),
                            "date": moment().format('DD-MM-YYYY')
                        }

                        postActionRequest(actionObject, success_text, duplicate_error_text);
                        break;
                    }
                    case "PRINT_BILL":{

                        /*
                            Important: Check if there are any un-printed KOT print requests pending to be processed.
                            A bug is causing infinite loop: When PRINT_BILL request is pressed immediately after cart is modified.
                            PRINT_BILL request is processed on priority than printing KOT changes. This cases the issue. 
                        */

                        //Check if any un-printed KOT changes existing?


                        //Set _id from Branch mentioned in Licence
                        var accelerate_licencee_branch = deviceLicenseService.getBranchCode();
                        if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                          var alertPopup = $ionicPopup.alert({
                                                    cssClass: 'popup-clear confirm-alert-alternate',
                                                    title: 'Invalid Licence Error',
                                                    template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT can not be opened. Please contact Accelerate Support if problem persists.</p>'
                                                });
                          return '';
                        }

                        var kot_request_data = accelerate_licencee_branch +"_KOT_"+ orderData.KOTNumber;

                        $ionicLoading.show({ template: '<ion-spinner></ion-spinner> Checking...' });

                        $http({
                                method: 'GET',
                                url: COMMON_IP_ADDRESS+'/accelerate_taps_orders/'+kot_request_data,
                                timeout: 10000
                            })
                            .success(function(data) {
                                if(data._id != ""){

                                    $ionicLoading.hide();

                                    $ionicLoading.show({
                                        template: "Unsaved changes on this table. Please try again.",
                                        duration: 3000
                                    });

                                    return '';

                                }
                                else{
                                    proceedToPrintBill();
                                }
                            })
                            .error(function(data) {
                                $ionicLoading.hide();
                                proceedToPrintBill();
                            });



                        function proceedToPrintBill(){
                            var success_text = '<b style="color: #5ada5f">Successful!</b><br><b>Bill</b> to be printed shortly.';
                            var duplicate_error_text = '<b style="color: #ef3d74">Failed!</b><br>Already requested to print the Bill.';

                            var actionObject = {
                                "_id": "PRINT_BILL_"+orderData._id,
                                "KOT": orderData._id,
                                "action": "PRINT_BILL",
                                "table": orderData.table,
                                "staffName": window.localStorage.loggedInUser_name && window.localStorage.loggedInUser_name != "" ? window.localStorage.loggedInUser_name : "Unknown",
                                "staffCode": window.localStorage.loggedInUser_mobile && window.localStorage.loggedInUser_mobile != "" ? window.localStorage.loggedInUser_mobile : "Unknown",
                                "machine": deviceLicenseService.getDeviceName(),
                                "time": moment().format('HHmm'),
                                "date": moment().format('DD-MM-YYYY')
                            }

                            postActionRequest(actionObject, success_text, duplicate_error_text);
                        }

                        break;

                    }
                }


                function postActionRequest(actionObject, success_text, duplicate_error_text){

                          var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@localhost:5984/';
                                
                          //LOADING
                          $ionicLoading.show({
                            template:  '<ion-spinner></ion-spinner>'
                          });

                                  //Post to local Server
                                  $http({
                                        method  : 'POST',
                                        url     : COMMON_IP_ADDRESS+'accelerate_action_requests/',
                                        data    : actionObject,
                                        headers : {'Content-Type': 'application/json'},
                                        timeout : 10000
                                    })
                                    .success(function(response) { 
                                      if(response.ok){
                                        $ionicLoading.hide();
                                        $ionicLoading.show({
                                            template: success_text,
                                            duration: 2000
                                        });
                                      }
                                      else{
                                        $ionicLoading.hide();
                                        $ionicLoading.show({
                                            template: "Not responding. Check your connection.",
                                            duration: 3000
                                        });
                                      }

                                    })
                                    .error(function(data) {
                                        $ionicLoading.hide();
                                        if(data.error == "conflict"){
                                            $ionicLoading.show({
                                                template: duplicate_error_text,
                                                duration: 3000
                                            });
                                        }
                                        else{
                                            $ionicLoading.show({
                                                template: "Not responding. Check your connection.",
                                                duration: 3000
                                            });
                                        }
                                    });
                } //postActionRequest



            } //processOrderAction


        }






        //Open order to edit
        $scope.openOrderToEdit = function(editOrder){


                //Set _id from Branch mentioned in Licence
                var accelerate_licencee_branch = deviceLicenseService.getBranchCode();
                if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                  var alertPopup = $ionicPopup.alert({
                                            cssClass: 'popup-clear confirm-alert-alternate',
                                            title: 'Invalid Licence Error',
                                            template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT can not be opened. Please contact Accelerate Support if problem persists.</p>'
                                        });
                  return '';
                }

                var kot_request_data = accelerate_licencee_branch +"_KOT_"+ editOrder.KOTNumber;


                $ionicLoading.show({ template: '<ion-spinner></ion-spinner> Loading Tables...' });


                    //PRELOAD TABLE MAPPING
                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_kot/'+kot_request_data,
                        timeout: 10000
                    })
                    .success(function(data) {
                        if(data._id != ""){

                            var kot = data;
                            $ionicLoading.hide();


                            if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){

                                var alreadyEditingKOT = JSON.parse(window.localStorage.edit_KOT_originalCopy);
                                if(alreadyEditingKOT.KOTNumber == kot.KOTNumber)//if thats the same order, neglect.
                                {
                                    $state.go('main.app.punch');
                                    return '';
                                }
                                else{
                                    //Editing order has unsaved changes
                                    if(window.localStorage.hasUnsavedChangesFlag && window.localStorage.hasUnsavedChangesFlag == 1){
                                        
                                           var alertPopup = $ionicPopup.alert({
                                            cssClass: 'popup-clear confirm-alert-alternate',
                                            title: 'Warning',
                                            template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">There is already an active order being modified. Please complete it to continue.</p>'
                                           });

                                           return '';
                                    }
                                }
                            }

                            $scope.overWriteCurrentRunningOrder(kot);

                        }
                        else{
                                $ionicLoading.hide();

                                    var alertPopup = $ionicPopup.alert({
                                            cssClass: 'popup-clear confirm-alert-alternate',
                                            title: 'Not Found Error',
                                            template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">#'+kotID+' not found on Server. Please contact Accelerate Support.</p>'
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


        $scope.overWriteCurrentRunningOrder = function(kot){

            var customerInfo = {};
            customerInfo.name = kot.customerName;
            customerInfo.mobile = kot.customerMobile;
            customerInfo.count = kot.guestCount && kot.guestCount != '' ? parseInt(kot.guestCount) : 0;
            customerInfo.mappedAddress = kot.table;
            customerInfo.mode = kot.orderDetails.mode;
            customerInfo.modeType = kot.orderDetails.modeType;
            customerInfo.reference = kot.orderDetails.reference;
            customerInfo.isOnline = kot.orderDetails.isOnline;

            window.localStorage.current_table_selection = kot.table;


            if(kot.specialRemarks && kot.specialRemarks != ''){
                window.localStorage.specialRequests_comments = kot.specialRemarks;
            }
            else{
                window.localStorage.specialRequests_comments = '';
            }

            if(kot.allergyInfo && kot.allergyInfo != []){
                window.localStorage.allergicIngredientsData = JSON.stringify(kot.allergyInfo);
            }
            else{
                window.localStorage.allergicIngredientsData = '';
            }


            //Pending new order will be removed off the cart.
            window.localStorage.accelerate_cart = JSON.stringify(kot.cart);
            //window.localStorage.customerData = JSON.stringify(customerInfo);

            //window.localStorage.edit_KOT_originalCopy = decodeURI(encodedKOT);
            window.localStorage.edit_KOT_originalCopy = JSON.stringify(kot);


            //record max cart index
                var i = 0;
                var maxCartIndex = 0;

                while(i < kot.cart.length){
                  if(maxCartIndex <= kot.cart[i].cartIndex){
                        maxCartIndex = kot.cart[i].cartIndex;
                  }

                  i++;
                }

            window.localStorage.maxCartIndex = maxCartIndex;


            //Update Guest details
            currentGuestData.setGuest(kot.customerName, kot.customerMobile, kot.guestCount ? parseInt(kot.guestCount) : '');

            $state.go('main.app.punch');
        }





    $scope.openFreeSeat = function(seat){

        //Already an order being edited
        if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){ //Editing Mode

                var hasUnsavedChanges = !window.localStorage.hasUnsavedChangesFlag || window.localStorage.hasUnsavedChangesFlag == 0 ? false : true;
        
                if(hasUnsavedChanges){
                    var confirmPopup = $ionicPopup.confirm({
                        cssClass: 'popup-clear confirm-alert-alternate',
                        title: 'There are unsaved changes in the cart. Are you sure want to start a new order?'
                    });

                    confirmPopup.then(function(res) {
                        if(res){
                            if(seat.status == 0){ //free table
                                ShoppingCartService.clearCartToEmpty();
                                currentGuestData.clearGuest();
                                $scope.selectedTable = seat.table;
                                window.localStorage.current_table_selection = seat.table;

                                $state.go('main.app.punch');
                            }
                            else if(seat.status == 5){  //reserved - add guest data
                                ShoppingCartService.clearCartToEmpty();
                                currentGuestData.setGuest(seat.guestName, seat.guestContact, seat.guestCount);
                                $scope.selectedTable = seat.table;
                                window.localStorage.current_table_selection = seat.table;

                                $state.go('main.app.punch');
                            }
                        }
                    });            
                }
                else{
                            if(seat.status == 0){ //free table
                                ShoppingCartService.clearCartToEmpty();
                                currentGuestData.clearGuest();
                                $scope.selectedTable = seat.table;
                                window.localStorage.current_table_selection = seat.table;

                                $state.go('main.app.punch');
                            }
                            else if(seat.status == 5){  //reserved - add guest data
                                ShoppingCartService.clearCartToEmpty();
                                currentGuestData.setGuest(seat.guestName, seat.guestContact, seat.guestCount);
                                $scope.selectedTable = seat.table;
                                window.localStorage.current_table_selection = seat.table;

                                $state.go('main.app.punch');
                            }
                }

        }
        else{
            var cart_products = !_.isUndefined(window.localStorage.accelerate_cart) ? JSON.parse(window.localStorage.accelerate_cart) : [];

            if(cart_products.length == 0){ //cart is empty!
                if(seat.status == 0){ //free table
                    $scope.selectedTable = seat.table;
                    window.localStorage.current_table_selection = seat.table;

                    $state.go('main.app.punch');
                }
                else if(seat.status == 5){  //reserved - add guest data
                    $scope.selectedTable = seat.table;
                    window.localStorage.current_table_selection = seat.table;
                    currentGuestData.setGuest(seat.guestName, seat.guestContact, seat.guestCount);

                    $state.go('main.app.punch');
                }
            }
            else{ //The cart is not empty, fresh order being punched
                if(seat.status == 0){ //free table
                    $scope.selectedTable = seat.table;
                    window.localStorage.current_table_selection = seat.table;

                    $state.go('main.app.punch');
                }
                else if(seat.status == 5){ //reserved - add guest data
                    $scope.selectedTable = seat.table;
                    window.localStorage.current_table_selection = seat.table;
                    currentGuestData.setGuest(seat.guestName, seat.guestContact, seat.guestCount);

                    $state.go('main.app.punch');                        
                }
            }
        }
    
    }//openFreeTable

   
   })

    .controller('PunchCtrl', function(ShoppingCartService, menuContentService, currentGuestData, kitchen_comments, deviceLicenseService, $timeout, $ionicLoading, $ionicPopup, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicPopover, $ionicSideMenuDelegate) {


    	var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@localhost:5984/';
        $ionicLoading.hide();

    	if(window.localStorage.serverURL == '' || !window.localStorage.serverURL){
    		
    	}
    	else{
    		COMMON_IP_ADDRESS = window.localStorage.serverURL;
    	}	

        $scope.kitchenComments = kitchen_comments;
        $scope.kitchenComments.sort();

        //Check if already cached
        var isCached = false;

        if(isCached){
            $scope.renderFailed = false;
            $scope.isRenderLoaded = true;
        }


        var custom_filter = !_.isUndefined(window.localStorage.customFilter) ? window.localStorage.customFilter : [];

        //To display things if filter is applied
        if (custom_filter.length > 0)
            $scope.isFilter = true;
        else
            $scope.isFilter = false;


        $ionicModal.fromTemplateUrl('views/common/templates/smart-order-alert.html', {
            scope: $scope,
            animation: 'fade-in'
          }).then(function(modal) {
            $scope.smartOrderAlert = modal;
          });

        $ionicModal.fromTemplateUrl('views/common/templates/smart-request-alert.html', {
            scope: $scope,
            animation: 'fade-in'
          }).then(function(modal) {
            $scope.smartRequestAlert = modal;
          });

        $scope.isOrderAlertShown = false;

        //Warn about new order
        $rootScope.$on('ACTIVE_ORDERS_ALERT', function(event, orderData) {
            let timerLeft = window.localStorage.extendShowTimerInvisibility ? window.localStorage.extendShowTimerInvisibility : 0;
            if(timerLeft > 1){
                return;
            }

            $scope.passiveOrderCount = orderData.length;
            if(orderData.length > 0 && isOrderNotify(orderData)){
                $scope.isOrderAlertShown = true;
                orderData.sort(function(obj1, obj2) {
                    return obj1.table - obj2.table;
                  });

                var subOrderData = orderData;
                subOrderData.sort(function(obj1, obj2) {
                    return obj2.subOrderId - obj1.subOrderId;
                });
                $scope.currentLastOrder = subOrderData[0].subOrderId;
                $scope.triggerNotification("ORDER", subOrderData[0].table, orderData.length);
                $scope.passiveOrderList = orderData;
                $scope.smartOrderAlert.show();
            }
            else{
                $scope.isOrderAlertShown = false;
                $scope.smartOrderAlert.hide();
            }
        });

        function isOrderNotify(allOrders){
            var lastSeenOrderByCaptain = window.localStorage.lastSeenOrderByCaptain ? window.localStorage.lastSeenOrderByCaptain : 0;
            allOrders.sort(function(obj1, obj2) {
                return obj2.subOrderId - obj1.subOrderId;
            });
            var currentLastOrder = allOrders[0].subOrderId; 
            if(currentLastOrder > lastSeenOrderByCaptain){
                return true;
            }
            else{
                //order already seen by captain
                return false;
            }
        }

        $scope.closeSmartOrderAlert = function(currentLastOrder){
            window.localStorage.extendShowTimerInvisibility = 60;
            $scope.isOrderAlertShown = false;
            window.localStorage.lastSeenOrderByCaptain = currentLastOrder;
            $scope.smartOrderAlert.hide();
        }



        //Warn about service request
        $rootScope.$on('ACTIVE_REQUESTS_ALERT', function(event, requestData) {
            let timerLeft = window.localStorage.extendShowTimerInvisibility ? window.localStorage.extendShowTimerInvisibility : 0;
            if(timerLeft > 1){
                return;
            }
            $scope.passiveRequestCount = requestData.length;
            if(requestData.length > 0 && !$scope.isOrderAlertShown && isRequestNotify(requestData)){
                requestData.sort(function(obj1, obj2) {
                    return obj1.table - obj2.table;
                  });
                var myRequests = requestData;
                myRequests.sort(function(obj1, obj2) {
                    return obj2.id - obj1.id;
                });
                $scope.currentLastRequest = myRequests[0].id;
                $scope.triggerNotification("REQUEST", myRequests[0].table, requestData.length);
                $scope.passiveRequestList = requestData;
                $scope.smartRequestAlert.show();
            }
            else{
                $scope.smartRequestAlert.hide();
            }
        });

        function isRequestNotify(allRequests){
            var lastSeenRequestByCaptain = window.localStorage.lastSeenRequestByCaptain ? window.localStorage.lastSeenRequestByCaptain : 0;
            allRequests.sort(function(obj1, obj2) {
                return obj2.id - obj1.id;
            });
            var currentLastRequest = allRequests[0].id; 
            if(currentLastRequest > lastSeenRequestByCaptain){
                return true;
            }
            else{
                //order already seen by captain
                return false;
            }
        }

        $scope.closeSmartRequestAlert = function(currentLastRequest){
            window.localStorage.extendShowTimerInvisibility = 60;
            window.localStorage.lastSeenRequestByCaptain = currentLastRequest;
            $scope.smartRequestAlert.hide();
        }

        $scope.triggerNotification = function(type, table, count) {
            if (window.cordova && window.cordova.plugins.notification) {
                let title = "";
                let text = "";
                if(type == "ORDER"){
                    title = count + " New Order";
                    title = "New Order received on Table " + table;
                    if(count > 1){
                        title = title + " and "+ (count - 1) + "others"
                    }
                }
                else if(type == "REQUEST"){
                    title = count + " Service Requests";
                    title = "Service Request from Table " + table;
                    if(count > 1){
                        title = title + " and "+ (count - 1) + "others"
                    }
                }
                else {
                    return;
                }

                cordova.plugins.notification.local.schedule({
                    title: 'New Order #'+id,
                    text: 'Thats pretty easy...',
                    foreground: true
                });
            }
            else{
                console.log('cordova.notification not enabled')
            }
        }  


        //Receiving Broadcast - If Filter Applied
        $rootScope.$on('filter_applied', function(event, filter) {
            window.localStorage.customFilter = JSON.stringify(filter);
            $scope.reinitializeMenu();
        });

        $scope.doMenuRefresh = function(){
            $scope.reinitializeMenu('REFRESH');
        }


        $scope.clearFilter = function() {
            $scope.isFilter = false;
            window.localStorage.removeItem("customFilter");
            custom_filter = [];
            $scope.reinitializeMenu();
        }

        $scope.showNotAvailable = function(product) {
            $ionicLoading.show({
                template: '<b style="color: #e74c3c; font-size: 140%">Oops!</b><br>' + product.itemName + ' is not available.',
                duration: 1000
            });
        }

        //Selected Table
        $scope.selectedTable = '';

        if(window.localStorage.current_table_selection && window.localStorage.current_table_selection != ''){
            $scope.selectedTable = window.localStorage.current_table_selection;
        }


        //User Profile
        $scope.isProfileSelected = false;
        $scope.selectedUserProfile = '';

        $scope.setUserProfile = function(profile_name, profile_mobile, flag){

            $scope.selectedUserProfile = profile_name;
            window.localStorage.loggedInUser_name = profile_name;
            window.localStorage.loggedInUser_mobile = profile_mobile;

            if(flag && flag == 'ADMIN'){
                window.localStorage.loggedInUser_admin = 1;
            }
            else{
                window.localStorage.loggedInUser_admin = 0;
            }

            $scope.isProfileSelected = true;

        }




        //Choose User Profile
        $scope.chooseUserProfile = function(){

                    $scope.allProfileData = [];

                    $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });

                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'accelerate_settings/ACCELERATE_STAFF_PROFILES',
                        timeout: 10000
                    })
                    .success(function(response) {

                        $ionicLoading.hide();

                        $scope.allProfileData = response.value;
                        

                        //Render Template
                        var i = 0;
                        var choiceTemplate = '<div style="margin-top: 5px">';
                        while (i < $scope.allProfileData.length) {
                            if($scope.allProfileData[i].role == "STEWARD" || $scope.allProfileData[i].role == "ADMIN"){
                                choiceTemplate = choiceTemplate + '<button class="button button-full" style="text-align: left; color: #c52031; margin-bottom: 8px; font-size: 18px; height: 54px; font-weight: 500; " ng-click="selectProfileFromWindow(\'' + $scope.allProfileData[i].name + '\', ' + $scope.allProfileData[i].code + ', \''+$scope.allProfileData[i].role+'\')">' + $scope.allProfileData[i].name + ' </button>';
                            }
                            i++;
                        }
                        choiceTemplate = choiceTemplate + '</div>';

                        var newCustomPopup = $ionicPopup.show({
                            cssClass: 'popup-tiles new-shipping-address-view',
                            template: choiceTemplate,
                            title: 'Select User',
                            scope: $scope,
                            buttons: [{
                                text: 'Cancel'
                            }]
                        });

                                  var login_passcode_modal = $ionicModal.fromTemplateUrl('views/common/templates/enter-user-passcode.html', {
                                    scope: $scope,
                                    animation: 'slide-in-up'
                                  }).then(function(modal) {
                                    $scope.login_passcode_modal = modal;
                                  });



                        $scope.selectProfileFromWindow = function(user_name, user_mobile, user_role) {
                            
                            newCustomPopup.close();

                            if(window.localStorage.loggedInUser_mobile &&  window.localStorage.loggedInUser_mobile == user_mobile){

                                return '';
                            }


                            if(user_role != 'ADMIN'){
                                $scope.setUserProfile(user_name, user_mobile);
                            }
                            else{ //Ask for passcode

                                  $scope.login_passcode_modal.show();

                                  $scope.passcodeEntered = [];

                                  $scope.clearPasscode = function(){
                                    $scope.passcodeEntered = [];
                                  }

                                  $scope.appendToPasscode = function(key){

                                    if($scope.passcodeEntered.length >= 4){
                                        return '';
                                    }
                                    else{
                                        $scope.passcodeEntered.push(key);
                                        if($scope.passcodeEntered.length == 4){
                                            var code_string = $scope.passcodeEntered[0]+''+$scope.passcodeEntered[1]+''+$scope.passcodeEntered[2]+''+$scope.passcodeEntered[3];
                                            validatePasscode(parseInt(code_string));

                                            function validatePasscode(number){

                                                $ionicLoading.show({
                                                    template: '<ion-spinner></ion-spinner> Loading Tables...'
                                                });

                                                $http({
                                                    method: 'GET',
                                                    url: COMMON_IP_ADDRESS+'accelerate_settings/ACCELERATE_STAFF_PROFILES',
                                                    timeout: 10000
                                                })
                                                .success(function(response) {

                                                    $ionicLoading.hide();
                                                    
                                                    var profile_data = response.value;

                                                    var i = 0;
                                                    while (i < profile_data.length) {
                                                        if(profile_data[i].code == user_mobile){
                                                            
                                                            if(number == profile_data[i].password){
                                                                $scope.login_passcode_modal.hide();
                                                                $scope.setUserProfile(user_name, user_mobile, 'ADMIN');
                                                            }
                                                            else{
                                                                $ionicLoading.show({
                                                                    template: "Incorrect Passcode",
                                                                    duration: 1000
                                                                });

                                                                $scope.passcodeEntered = [];
                                                                return '';
                                                            }

                                                            break;
                                                        }

                                                        i++
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
                                        }
                                    }

                                  }
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

        $scope.initUserProfile = function(){
            if(window.localStorage.loggedInUser_name && window.localStorage.loggedInUser_name != ''){
                $scope.selectedUserProfile = window.localStorage.loggedInUser_name;
                $scope.isProfileSelected = true;
            }
            else{
                $scope.chooseUserProfile();
            }
        }

        $scope.initUserProfile();


        //Current time display
        $scope.currentTimeDisplay = '00:00';

        function updateClock() {
            $scope.currentTimeDisplay = moment().format('hh:mm a');
        }

        function timedUpdate () {
          updateClock();
          setTimeout(timedUpdate, 1000);
        }

        timedUpdate();



      //Guest details
      $scope.guestData = currentGuestData.getGuest();

      $scope.guestDataTemp = {};
      $scope.guestDataTemp.name = "";
      $scope.guestDataTemp.mobile = "";
      $scope.guestDataTemp.count = "";

      var guest_data_modal = $ionicModal.fromTemplateUrl('views/common/templates/enter-guest-details.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.guest_modal = modal;
      });

      $scope.openGuestDetails = function(){
        var temp_name = $scope.guestData.name;
        var temp_mobile = $scope.guestData.mobile;
        var temp_count = $scope.guestData.count;

        $scope.guestDataTemp = {};
        $scope.guestDataTemp.name = temp_name;
        $scope.guestDataTemp.mobile = temp_mobile;
        $scope.guestDataTemp.count = temp_count;
        $scope.guestDataTemp.countManual = temp_count;

        $scope.guest_modal.show();
      };

      $scope.saveGuestData = function(){

        var temp_name = $scope.guestDataTemp.name;
        var temp_mobile = $scope.guestDataTemp.mobile;
        var temp_count = $scope.guestDataTemp.count;

        if(temp_count == '' || temp_count == 0){
                $ionicLoading.show({
                    template: 'Please add number of guests',
                    duration: 1000
                });
                return "";
        }

        $scope.guestData.name = temp_name;
        $scope.guestData.mobile = temp_mobile;
        $scope.guestData.count = temp_count;

        currentGuestData.setGuest(temp_name, temp_mobile, temp_count);

        //Update KOT if Editing Order
        if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){ //Editing Mode
            var original_order = JSON.parse(window.localStorage.edit_KOT_originalCopy);
            $scope.updateGuestDetailsKOT(original_order.KOTNumber, temp_name, temp_mobile, temp_count);
        }


        $scope.guest_modal.hide();
      }

      $scope.updateGuestDetailsKOT = function(KOTNumber, temp_name, temp_mobile, temp_count){
                    
                    //Set _id from Branch mentioned in Licence
                    var accelerate_licencee_branch = deviceLicenseService.getBranchCode();
                    if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                      var alertPopup = $ionicPopup.alert({
                                                cssClass: 'popup-clear confirm-alert-alternate',
                                                title: 'Invalid Licence Error',
                                                template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT can not be opened. Please contact Accelerate Support if problem persists.</p>'
                                            });
                      return '';
                    }

                    
                    var kot_request_data = accelerate_licencee_branch +"_KOT_"+ KOTNumber;
                    var kotID = KOTNumber;

                    //PRELOAD TABLE MAPPING
                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_kot/'+kot_request_data,
                        timeout: 10000
                    })
                    .success(function(data) {
                        if(data._id != ""){

                            var modified_kot = data;

                            //Update Guest details
                            modified_kot.guestCount = temp_count;
                            modified_kot.customerName = temp_name.toUpperCase();
                            modified_kot.customerMobile = temp_mobile;

                                    //Update on Server
                                    $http({
                                        method: 'PUT',
                                        url: COMMON_IP_ADDRESS+'accelerate_kot/'+modified_kot._id+'/',
                                        data: JSON.stringify(modified_kot),
                                        contentType: "application/json",
                                        dataType: 'json',
                                        timeout: 10000
                                    })
                                    .success(function(data) {
                                        
                                    });

                        }
                        else{
                                var alertPopup = $ionicPopup.alert({
                                    cssClass: 'popup-clear confirm-alert-alternate',
                                    title: 'Not Found Error',
                                    template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT #'+kotID+' not found on Server.</p>'
                                });
                        }
                    })
                    .error(function(data) {

                        $ionicLoading.hide();

                        if(data.error == "not_found"){
                            var alertPopup = $ionicPopup.alert({
                                cssClass: 'popup-clear confirm-alert-alternate',
                                title: 'Not Found Error',
                                template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT #'+kotID+' not found on Server.</p>'
                            });
                        }
                        else{
                            $ionicLoading.show({
                                template: "Not responding. Check your connection.",
                                duration: 3000
                            });
                        }
                    });
      }


      $scope.isGuestDataEntered = function(){
        if($scope.guestData.name == "" && $scope.guestData.mobile == "" && $scope.guestData.count == ""){
            return false;
        }
        else
        {
            return true;
        }
      }

      $scope.getGuestContent = function(){
        if($scope.guestData.name != ""){
            if($scope.guestData.count > 2){
                return $scope.guestData.name +" and "+($scope.guestData.count - 1)+" others";
            }
            else{
                return $scope.guestData.name;
            }
        }
        else if($scope.guestData.count != "" && $scope.guestData.count > 0){
            return $scope.guestData.count + " guests";
        }
        else if($scope.guestData.mobile != ""){
            return $scope.guestData.mobile;
        }
      }



    $scope.$on('guest_updated', function(event, guest_object) {
        $scope.guestData = guest_object;
    });




      //Item Adding Part
      $scope.myItem = {};
      $scope.myItem.comment = "";
      $scope.manualQty = 0;

      $scope.commentsList = ['Less Salt', 'Less Sugar', 'Without Ice', 'Without Sugar'];

      $ionicModal.fromTemplateUrl('views/common/templates/enter-item-details.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.add_item_modal = modal;
      });

      $scope.openItemDetails = function(itemData, flag){

        if(!window.localStorage.current_table_selection || window.localStorage.current_table_selection == ''){ //No table selected
            $ionicLoading.show({
                template: "Table <b>not</b> selected",
                duration: 1500
            });            
            return '';
        }


        $scope.myLastWordInComment = '';

      	if(!itemData.isAvailable){
      		$ionicLoading.show({ template: "<b>"+itemData.name+"</b> is out of stock", duration: 1000 });
      		return "";
      	}

        if(flag == 'QUICK_PUNCH'){
            $scope.quickPunchSearchKey = '';
        }

        $scope.myItem = itemData;
        
        $scope.myItem.qty = 1;

        if(flag == 'SEARCHING'){
            $scope.search_item_modal.hide();
        }

        $scope.add_item_modal.show();
      };


      $scope.easyIncrementItem = function(){
        if($scope.myItem.qty < 5){
            $scope.myItem.qty = $scope.myItem.qty + 1;
        }
        else if($scope.myItem.qty == 5){
            $scope.myItem.qtyManual = 6;
            $scope.myItem.qty = $scope.myItem.qtyManual;
        }
        else if($scope.myItem.qty > 5){
            $scope.myItem.qtyManual = $scope.myItem.qtyManual + 1;
            $scope.myItem.qty = $scope.myItem.qtyManual;
        }
      }

      $scope.easyReduceItem = function(){
        if($scope.myItem.qty > 6){
            $scope.myItem.qtyManual = $scope.myItem.qtyManual - 1;
            $scope.myItem.qty = $scope.myItem.qtyManual;
        }
        else if($scope.myItem.qty == 6){
            $scope.myItem.qtyManual = '';
            $scope.myItem.qty = 5;
        }
        else if($scope.myItem.qty < 6 && $scope.myItem.qty > 1){
            $scope.myItem.qtyManual = '';
            $scope.myItem.qty = $scope.myItem.qty - 1;
        }
      }


      $scope.addItemProcess = function(optionalSource, optionalPriorityFlag){


        var priority_flag = false;
        if(optionalPriorityFlag && optionalPriorityFlag == 'PIN_TO_TOP'){
            priority_flag = true;
        }


        var processed_item = {
        	"code" : $scope.myItem.code,
        	"name" : $scope.myItem.name,
        	"category" : optionalSource == 'SEARCH_AND_ADD' ? $scope.myItem.category : $scope.renderingSubMenu,
        	"isCustom" : $scope.myItem.isCustom,
        	"comments" : $scope.myItem.comment,
        	"qty" : parseInt($scope.myItem.qty),
            "isPackaged": $scope.myItem.isPackaged
        }

        	if(!$scope.myItem.qty || $scope.myItem.qty == "" || $scope.myItem.qty == undefined){
        		$ionicLoading.show({
	                template: 'Please mention quantity',
	                duration: 1000
	            });
        		return "";
        	}


        if($scope.myItem.isCustom){
        	if(!$scope.myItem.variant || $scope.myItem.variant == "" || $scope.myItem.variant == undefined){
        		$ionicLoading.show({
	                template: 'Please select an option',
	                duration: 1000
	            });
        		return "";
        	}
        	else{
        		processed_item.variant = $scope.myItem.variant;
        	}

        	var n = 0;
        	while($scope.myItem.customOptions[n]){
        		if($scope.myItem.customOptions[n].customName == $scope.myItem.variant){
        			processed_item.price = $scope.myItem.customOptions[n].customPrice;
        			break;
        		}
        		n++;
        	}
        	
        }
        else{
        	processed_item.price = $scope.myItem.price;
        }


        ShoppingCartService.addProduct(processed_item, priority_flag);
        
        $scope.add_item_modal.hide();

        $scope.search.query = '';

      }

        $scope.getProductsInCart = function() {
            return ShoppingCartService.getProducts().length;
        };


      $scope.addCommentToItem = function(commentNew){
        if($scope.myItem.comment == '' || $scope.myItem.comment == undefined){
            $scope.myItem.comment = commentNew;
        }
        else{
            
            var temp_all = $scope.myItem.comment.split(', ');

            var n = 0;
            while(temp_all[n]){
                if(temp_all[n] == commentNew){
                    temp_all.splice(n, 1);
                    var new_comments = '';
                    for(var i = 0; i < temp_all.length; i++){
                        if(i == 0){
                            new_comments = temp_all[0];
                        }
                        else{
                            new_comments += ', ' + temp_all[i];
                        }
                    }

                    $scope.myItem.comment = new_comments;
                    
                    return "";
                }
                n++;
            }

            $scope.myItem.comment += ', '+commentNew;            
            
        }

      }

      $scope.isCommentAdded = function(comment){

        if($scope.myItem.comment == "" || $scope.myItem.comment == undefined){
            return false;
        }

        var comm_splits = ($scope.myItem.comment).split(', ');

        var n = 0;
        while(comm_splits[n]){
            if(comm_splits[n] == comment){
                return true;
            }
            n++;
        }

        return false;
      }




      /*
        
        QUICK PUNCH 

      */


      $scope.quickPunchSearchKey = '';
      $scope.isQuickPunching = false;


      $scope.appendToQuickPunch = function(key) {
        $scope.quickPunchSearchKey = $scope.quickPunchSearchKey.concat(key)
        $scope.tryQuickSearch();
      }

      $scope.quickPunchErase = function(){
        $scope.quickPunchSearchKey = $scope.quickPunchSearchKey.substring(0, $scope.quickPunchSearchKey.length - 1);
        $scope.tryQuickSearch();
      }


      $scope.enableQuickSearch = function(){
        if($scope.isQuickPunching){
            $scope.isQuickPunching = false;
        }
        else{
            $scope.quickPunchSearchKey = '';
            $scope.isQuickPunching = true;

            $scope.quickSearchResults = menuContentService.getMenuItems();
        }
      }


      //styling purpose
      $scope.getQuickPunchBottomPadding = function(){
        if($scope.selectedTable != ''){
            return {'bottom': '107px'};
        }
        else{
            return {'bottom': '107px'};
        }
      }

      $scope.getQuickTypingStyle = function(){
        if($scope.quickPunchSearchKey != '' && $scope.shortlistedQuick.length == 0){
            return 'quickPunchSearchWordRed';
        }
        else{
            return 'quickPunchSearchWordBlue';
        }
      }


      $scope.favoritesList = [];
      $scope.shortlistedQuick = [];

      $scope.tryQuickSearch = function(){

            if($scope.quickPunchSearchKey == ''){
                $scope.shortlistedQuick = [];
                return '';
            }

                        
                        var regex = new RegExp($scope.quickPunchSearchKey, "i");
                        var name_regex = new RegExp("^" + $scope.quickPunchSearchKey, "i");

                        $scope.shortlistedQuick = [];
                        var sub_list = [];

                        angular.forEach($scope.quickSearchResults, function (items, key) {

                                if(!items.shortCode){
                                    items.shortCode = '';
                                }

                                if(!items.shortNumber){
                                    items.shortNumber = '';
                                }

                                items.itemCode = items.shortNumber.toString();

                                if(items.itemCode.search(name_regex) != -1){
                                    $scope.shortlistedQuick.push(items);
                                }
                                else if(items.shortCode.search(name_regex) != -1){
                                    $scope.shortlistedQuick.push(items);
                                }
                                else{

                                        var item_name = items.name;

                                        if(item_name.search(name_regex) != -1){
                                            $scope.shortlistedQuick.push(items);
                                        }
                                        else if(item_name.search(regex) != -1){
                                            sub_list.push(items);
                                        }
                                }
                        });

                        $scope.shortlistedQuick = $scope.shortlistedQuick.concat(sub_list);
      }
      






        $scope.navToggled = false;

        $scope.showOptionsMenu = function() {
            //console.log('toggle sidemenu...', $scope.navToggled)
            $ionicSideMenuDelegate.toggleLeft();
            $scope.navToggled = !$scope.navToggled;
        };



        // Making request to server to fetch-menu
        var init = $scope.reinitializeMenu = function(optionalRequest) {

            var data = {};

            if (custom_filter.length > 0) {
                data.isFilter = true;
                data.filter = custom_filter;
            }


            if (data.isFilter || !isCached) {

                  //FIRST LOAD
                  $scope.renderFailed = false;
                  $scope.isRenderLoaded = false;

                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'accelerate_settings/ACCELERATE_MASTER_MENU',
                        timeout: 10000
                    })
                    .success(function(response) {

                        $scope.menu = response.value;
                        menuContentService.setMenu($scope.menu);

                        if(optionalRequest && optionalRequest == 'REFRESH'){
                            $scope.$broadcast('scroll.refreshComplete');
                        }

                        $scope.renderFailed = false;
                        $scope.isRenderLoaded = true;
                    })
                    .error(function(data) {

                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });

                        if(optionalRequest && optionalRequest == 'REFRESH'){
                            $scope.$broadcast('scroll.refreshComplete');
                        }

                        $scope.renderFailed = true;
                    });
            }
        }


        if(isCached) {
            init();
        } else {
            $timeout(function() {
                init();
            }, 799);
        }



        $scope.isRenderingItems = false;
        $scope.shortlistMainMenu = '';
        $scope.subMenuList = [];
        $scope.renderingSubMenu = '';
        $scope.allItemsList = [];




        $scope.openSubMenu = function(target){
            for(var n = 0; n < $scope.menu.length; n++){
                if($scope.menu[n].category == target){

                    $scope.renderingSubMenu = target;
                    $scope.allItemsList = $scope.menu[n].items;

                    $scope.isRenderingItems = true;

                    break;
                }

                if(n == $scope.menu.length - 1){
                    $ionicLoading.show({
                        template: "There are no items in <b>"+target+"</b>",
                        duration: 3000
                    });
                }
            }

            $scope.allItemsList.sort(function(itemOne, itemTwo) {
                return itemOne.name.localeCompare(itemTwo.name);
            });  
        }


        $scope.openCorresponsingMainMenu = function(target){
            
                $scope.shortlistMainMenu = target;            
            
                    //Menu Categories
                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'accelerate_settings/ACCELERATE_MENU_CATALOG',
                        timeout: 10000
                    })
                    .success(function(data) {

                        var menu_categories = data.value;

                        var short_listed = [];
                        var n = 0;
                        while(menu_categories[n]){

                            if(menu_categories[n].mainType == $scope.shortlistMainMenu){
                                short_listed.push(menu_categories[n].name);
                            }
                            
                            if(n == menu_categories.length - 1){ //last iteration

                                short_listed.sort(function(categoryOne, categoryTwo) {
                                    return categoryOne.localeCompare(categoryTwo);
                                });  

                                function chunk(arr, size) {
                                  var newArr = [];
                                  for (var i=0; i<arr.length; i+=size) {
                                    newArr.push(arr.slice(i, i+size));
                                  }
                                  return newArr;
                                }

                                var number_of_categories = short_listed.length;
                                if(number_of_categories % 2 == 1){
                                    number_of_categories++;
                                }

                                var chunk_length = number_of_categories/2;

                                $scope.subMenuList = chunk(short_listed, chunk_length);
                            }

                            n++;
                        }

                    })
                    .error(function(data) {

                        $ionicLoading.hide();

                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });

                        $scope.renderTableFailed = true;
                    });
        }

        $scope.openCorresponsingMainMenu('ARABIAN');

        $scope.goToMainSelection = function(){
            $scope.isRenderingItems = false;
        }

        //Open Cart
        $scope.openCartWindow = function(){
        	if(ShoppingCartService.getProducts().length == 0){
        		$ionicLoading.show({ template: "Your cart is Empty!", duration: 1000 });
        		return "";
        	}
        	else{
        		$state.go('main.app.shopping-cart');
        	}
        }



        /*
        	TABLES
        */

        $scope.getMyClass = function(seat) {
            if (seat.status == 0) {
                return "button-balanced";
            } else if (seat.status == 1) {
                return "button-assertive";
            } else if (seat.status == 2) {
                return "button-energized";
            }
            else if (seat.status == 5) {
                return "mySpecialReservedButton";
            }
        }



      $scope.tablesMasterList = [];

      $ionicModal.fromTemplateUrl('views/common/templates/choose-table.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.table_modal = modal;
      });




      $scope.openSeatPlanView = function(){


                    $scope.tablesMasterList = [];

                    $ionicLoading.show({
                        template: '<ion-spinner></ion-spinner> Loading Tables...'
                    });

                    //FIRST LOAD
                    $scope.renderTableFailed = false;
                    $scope.isRenderTableLoaded = false;


                    //PRELOAD TABLE MAPPING
                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_tables/_design/filter-tables/_view/all/',
                        timeout: 10000
                    })
                    .success(function(data) {

                        if(data.total_rows > 0){

                              var tableData = data.rows;
                              tableData.sort(function(obj1, obj2) {
                                return obj1.key - obj2.key; //Key is equivalent to sortIndex
                              });


                              //load table sections
                                $http({
                                    method: 'GET',
                                    url: COMMON_IP_ADDRESS+'accelerate_settings/ACCELERATE_TABLE_SECTIONS',
                                    timeout: 10000
                                })
                                .success(function(data) {

                                    var sections_list = data.value;

                                    $ionicLoading.hide();

                                    //process tableData
                                    var tables_list = [];
                                    var g = 0;
                                    while(tableData[g]){

                                        tables_list.push(tableData[g].value);

                                        if(g == tableData.length - 1){
                                            nowRender();
                                            break;
                                        }

                                        g++;
                                    }

                                    function nowRender(){

                                        var n = 0;
                                        while(sections_list[n]){
                                            var filtered_tables = [];
                                            for(var i = 0; i < tables_list.length; i++){
                                                if(tables_list[i].type == sections_list[n]){
                                                    filtered_tables.push(tables_list[i])
                                                }

                                                if(i == tables_list.length - 1){ //last iteration
                                                    $scope.tablesMasterList.push({
                                                        "section": sections_list[n],
                                                        "tables": filtered_tables
                                                    });
                                                }
                                            }
                                            n++;
                                        }

                                        $scope.renderTableFailed = false;
                                        $scope.isRenderTableLoaded = true;

                                        $scope.table_modal.show();
                                    }


                                })
                                .error(function(data) {

                                    $ionicLoading.hide();

                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });

                                    $scope.renderTableFailed = true;

                                });




                        }
                        else{
                            
                            $ionicLoading.hide();

                            $ionicLoading.show({
                                template: "Tables data not found. Please contact Accelerate Support.",
                                duration: 3000
                            });

                            $scope.renderTableFailed = true;
                        }
                    })
                    .error(function(data) {

                        $ionicLoading.hide();

                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });

                        $scope.renderTableFailed = true;
                    });

        }




    $scope.seatOptions = function(seat){


        if(seat.status == 2){
            //Billed Order
            $ionicLoading.show({
                template: "This order has been already billed",
                duration: 2000
            });    

            return "";       
        }



        //Already an order being edited
        if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){ //Editing Mode

                var hasUnsavedChanges = !window.localStorage.hasUnsavedChangesFlag || window.localStorage.hasUnsavedChangesFlag == 0 ? false : true;
        
                if(hasUnsavedChanges){
                    var confirmPopup = $ionicPopup.confirm({
                        cssClass: 'popup-clear confirm-alert-alternate',
                        title: 'There are unsaved changes in the cart. Are you sure want to start a new order?'
                    });

                    confirmPopup.then(function(res) {
                        if(res){
                            if(seat.status == 0){ //free table
                                ShoppingCartService.clearCartToEmpty();
                                currentGuestData.clearGuest();
                                $scope.selectedTable = seat.table;
                                window.localStorage.current_table_selection = seat.table;
                            }
                            else if(seat.status == 1){ //running order table
                                copyKOTtoCart(seat);
                            }
                        }
                    });            
                }
                else{
                            if(seat.status == 0){ //free table
                                ShoppingCartService.clearCartToEmpty();
                                currentGuestData.clearGuest();
                                $scope.selectedTable = seat.table;
                                window.localStorage.current_table_selection = seat.table;
                            }
                            else if(seat.status == 1){ //running order table
                                copyKOTtoCart(seat);
                                $scope.selectedTable = seat.table;
                            }
                }

        }
        else{
            var cart_products = !_.isUndefined(window.localStorage.accelerate_cart) ? JSON.parse(window.localStorage.accelerate_cart) : [];

            if(cart_products.length == 0){ //cart is empty!
                if(seat.status == 0){ //free table
                    $scope.selectedTable = seat.table;
                    window.localStorage.current_table_selection = seat.table;
                }
                else if(seat.status == 1){ //running order table
                    copyKOTtoCart(seat);
                }
            }
            else{ //The cart is not empty, fresh order being punched
                if(seat.status == 0){ //free table
                    $scope.selectedTable = seat.table;
                    window.localStorage.current_table_selection = seat.table;
                }
                else if(seat.status == 1){ //running order table
                    
                    var confirmPopup = $ionicPopup.confirm({
                        cssClass: 'popup-clear confirm-alert-alternate',
                        title: 'There are unsaved changes in the cart. Are you sure want to start a new order?'
                    });

                    confirmPopup.then(function(res) {
                        if(res){
                            $scope.selectedTable = seat.table;
                            window.localStorage.current_table_selection = seat.table;
                            copyKOTtoCart(seat);
                        }
                    });         

                }
            }
        }



            function copyKOTtoCart(seat){//Editing Order

                $scope.hasUnsavedChanges = false;
                window.localStorage.hasUnsavedChangesFlag = 0;
            
                //Set _id from Branch mentioned in Licence
                var accelerate_licencee_branch = deviceLicenseService.getBranchCode();
                if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                  var alertPopup = $ionicPopup.alert({
                                            cssClass: 'popup-clear confirm-alert-alternate',
                                            title: 'Invalid Licence Error',
                                            template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT can not be opened. Please contact Accelerate Support if problem persists.</p>'
                                        });
                  return '';
                }


                    var kot_request_data = accelerate_licencee_branch +"_KOT_"+ seat.KOT;
                    var kotID = seat.KOT;

                    //PRELOAD TABLE MAPPING
                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_kot/'+kot_request_data,
                        timeout: 10000
                    })
                    .success(function(data) {
                        if(data._id != ""){

                            var kot = data;

                            window.localStorage.edit_KOT_originalCopy = JSON.stringify(kot);
                            window.localStorage.accelerate_cart = JSON.stringify(kot.cart);

                            //Update Guest details
                            currentGuestData.setGuest(kot.customerName, kot.customerMobile ? parseInt(kot.customerMobile) : '', kot.guestCount ? parseInt(kot.guestCount) : '');
                            window.localStorage.current_table_selection = kot.table;

                            $scope.selectedTable = seat.table;
                        }
                        else{
                                var alertPopup = $ionicPopup.alert({
                                    cssClass: 'popup-clear confirm-alert-alternate',
                                    title: 'Not Found Error',
                                    template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT #'+kotID+' not found on Server.</p>'
                                });
                        }
                    })
                    .error(function(data) {

                        $ionicLoading.hide();

                        if(data.error == "not_found"){
                            var alertPopup = $ionicPopup.alert({
                                cssClass: 'popup-clear confirm-alert-alternate',
                                title: 'Not Found Error',
                                template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT #'+kotID+' not found on Server.</p>'
                            });
                        }
                        else{
                            $ionicLoading.show({
                                template: "Not responding. Check your connection.",
                                duration: 3000
                            });
                        }
                    });

            }

        $scope.table_modal.hide();
    }




    //SEARCH
    $scope.isSearching = false;
    $scope.search = {};
    $scope.search.query = "";

    var search_item_modal = $ionicModal.fromTemplateUrl('views/common/templates/item-search-window.html', {                                    scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.search_item_modal = modal;
    });

    $scope.getSearchBarClass = function(){
        if($scope.search.query != ''){
            return 'col-90';
        }
        else{
            return '';
        }
    }


    $scope.startSearching = function(){

            $scope.isSearching = true;
            $scope.search_item_modal.show();

            $scope.allSearchItemsList = menuContentService.getMenuItems();

            setTimeout(function(){
                document.getElementById("menu_search_input").focus();
            }, 2000);
    }

    $scope.resetSearch = function(){
        $scope.search.query = "";
        setTimeout(function(){
            document.getElementById("menu_search_input").focus();
        }, 1000);
    }



        //Unavailable features
        $scope.notAvailable = function(text){
            $ionicLoading.show({
                template: text,
                duration: 3000
            });                 
        }



})


 .controller('ShoppingCartCtrl', function(products, currentGuestData, kitchen_comments, billing_modes, billing_parameters, $ionicPopup, $http, $scope, $ionicLoading, $ionicModal, $timeout, $state, $rootScope, $ionicActionSheet, $ionicSideMenuDelegate, ShoppingCartService, deviceLicenseService) {


    var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@localhost:5984/';


 	$scope.products = products;
    var cart_products = products;

    $scope.hasUnsavedChanges = false;
    $scope.hasRestrictedEdits = false;
    $scope.isEditingOrder = false;
    $scope.runningKOTNumber = '';

    if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){
        $scope.isEditingOrder = true;

        var original_order = JSON.parse(window.localStorage.edit_KOT_originalCopy);
        $scope.runningKOTNumber = original_order.KOTNumber;
    }   
    else{
        $scope.isEditingOrder = false;
        $scope.runningKOTNumber = '';
    }

    $scope.senseItemChange = function(product){
        if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){
            var change_noticed = checkForItemChanges(product.code, product.variant, product.qty, product.cartIndex);
            
            if(change_noticed != '' && !$scope.hasUnsavedChanges){
                $scope.hasUnsavedChanges = true;
            }

            $scope.isEditingOrder = true;
            return change_noticed;
        }
        else{
            $scope.isEditingOrder = false;
        }
    }

    $scope.getBillingModeBarClass = function(){

        if($scope.hasUnsavedChanges){
            return 'billingModeBarOrange';
        }
        else{
            return 'billingModeBarGray';
        }
    }

    //Clear cart
    $scope.clearWholeCart = function() {
        $ionicActionSheet.show({
            buttons: [
                { text: '<i class="icon ion-trash-a assertive"></i> <i class="assertive">Remove All Items</i>' },
                { text: '<i class="icon"></i> <i class="dark">Close</i>' },
              ],
            titleText: 'Are you sure want to remove all the items from the cart?',
            buttonClicked: function(index) {
                if(index == 0){
                    ShoppingCartService.clearCartItems();
                }
                return true;
            },
        });
    };

    $scope.undoEditingOrder = function(){ //to recover original cart
        if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){

            var original_order = JSON.parse(window.localStorage.edit_KOT_originalCopy);
            window.localStorage.accelerate_cart = JSON.stringify(original_order.cart);

            $rootScope.$broadcast('cart_updated', original_order.cart);
            $rootScope.$emit('cart_updated', original_order.cart);


            $scope.hasUnsavedChanges = false;
            window.localStorage.hasUnsavedChangesFlag = 0;
        }
        else{
            $scope.hasUnsavedChanges = false;
            window.localStorage.hasUnsavedChangesFlag = 0;
        }
    }

    $scope.goToHomeMain = function(){
        $state.go('main.app.punch');
    }

    $scope.isCartEmpty = function(){
        var cart = window.localStorage.accelerate_cart && window.localStorage.accelerate_cart != '' ? JSON.stringify(window.localStorage.accelerate_cart) : [];
        
        if(cart.length == 0){
            return true;
        }
        else{
            return false;
        }
    }


    $scope.enableCheckPlaceOrderButton = function(cartProducts){
        if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){
            
            var hasUnsavedChanges = !window.localStorage.hasUnsavedChangesFlag || window.localStorage.hasUnsavedChangesFlag == 0 ? false : true;

            if(hasUnsavedChanges){ //has unsaved changes
                return true;
            }
            else{
                return false;
            }
        }
        else{
            if(cartProducts.length > 0){
                return true;
            }
            else{
                return false;
            }
        }
    }


    function checkForItemChanges(code, variant, quantity, cart_index){

    /*
        Check if a particular item in accelerate_cart has any change w.r.t originalCart 
        (useful while editing an order)
    */

        var isCustom = true;
        if(!variant || variant == ''){
            isCustom = false;
        }

        if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){

            var originalData = window.localStorage.edit_KOT_originalCopy ?  JSON.parse(window.localStorage.edit_KOT_originalCopy) : [];
            
            var changed_cart_products = window.localStorage.accelerate_cart ?  JSON.parse(window.localStorage.accelerate_cart) : [];
            if(changed_cart_products.length == 0){
                return 'ERROR';
            }


            //Compare changes in the Cart
            var original_cart_products = originalData.cart;
            if(original_cart_products.length == 0){
                return 'ERROR';
            }


                //Search for the item in orignal Cart
                for(var m = 0; m < original_cart_products.length; m++){
                    //check if item is found, not found implies New Item!
                    if(!isCustom && (code == original_cart_products[m].code && cart_index == original_cart_products[m].cartIndex)){
                        //Item Found
                        if(quantity > original_cart_products[m].qty){ //qty increased
                            return 'QUANTITY_INCREASE';
                        }
                        else if(quantity < original_cart_products[m].qty){ //qty decreased
                            return 'QUANTITY_DECREASE';
                        }
                        
                        break;
                    }
                    else if(isCustom && (code == original_cart_products[m].code && cart_index == original_cart_products[m].cartIndex) && (variant == original_cart_products[m].variant)){
                        //Item Found
                        if(quantity > original_cart_products[m].qty){ //qty increased
                            return 'QUANTITY_INCREASE';
                        }
                        else if(quantity < original_cart_products[m].qty){ //qty decreased
                            return 'QUANTITY_DECREASE';
                        }
                        break;
                    }

                    //Last iteration to find the item
                    if(m == original_cart_products.length-1){ //New item
                        return 'NEW_ITEM';
                    }
                } 
        }
        else{
            return 'ERROR';
        }

        return 'NO_CHANGE';
    }



    function checkIfItemDeleted(){

    /*
        Check if any item in accelerate_cart has been deleted w.r.t originalCart 
        (useful while editing an order)
    */

        if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){


            var originalData = window.localStorage.edit_KOT_originalCopy ?  JSON.parse(window.localStorage.edit_KOT_originalCopy) : [];

            var changed_cart_products = window.localStorage.accelerate_cart ?  JSON.parse(window.localStorage.accelerate_cart) : [];
            if(changed_cart_products.length == 0){
                return 'DELETED_ALL';
            }


            //Compare changes in the Cart
            var original_cart_products = originalData.cart;
            if(original_cart_products.length == 0){
                return 'ERROR';
            }

            //Search for changes in the existing items
            var n = 0;
            while(original_cart_products[n]){
                
                //Find each item in original cart in the changed cart
                var itemFound = false;
                for(var i = 0; i < changed_cart_products.length; i++){
                    //same item found, check for its quantity and report changes
                    if((original_cart_products[n].cartIndex == changed_cart_products[i].cartIndex) && (original_cart_products[n].code == changed_cart_products[i].code)){
                        itemFound = true;
                        break;
                    }

                    //Last iteration to find the item
                    if(i == changed_cart_products.length-1){
                        if(!itemFound){ //Item Deleted
                            return 'DELETED';
                        }
                    }
                } 

                n++;
            }

            return 'NONE';

        }
        else{
            return 'ERROR';
        }

    }


    //Billing Modes
    $scope.billingModes = billing_modes;
    $scope.billingParameters = billing_parameters;

    $scope.billingModesDine = [];
    var k = 0;
    while($scope.billingModes[k]){
    	if($scope.billingModes[k].type == 'DINE'){
    		$scope.billingModesDine.push($scope.billingModes[k]);
    	}

    	k++;
    }

    $scope.selectedBillingMode = $scope.billingModesDine[0];
    $scope.selectedTable = '';

    if(window.localStorage.current_table_selection && window.localStorage.current_table_selection != ''){
        $scope.selectedTable = window.localStorage.current_table_selection;
    }

    $scope.changeBillingMode = function(){

    	var n = 0;
    	while($scope.billingModesDine[n]){

    		if($scope.selectedBillingMode.name == $scope.billingModesDine[n].name){
	    		if($scope.billingModesDine[n + 1]){
	    			$scope.selectedBillingMode = $scope.billingModesDine[n+1];
	    		}
	    		else{
	    			$scope.selectedBillingMode = $scope.billingModesDine[0];
	    		}

	    		break;
	    	}

    		n++;
    	}

    	$scope.calculateExtrasList();
    }

    $scope.getBillingExtraExclusion = function(name){
    	var n = 0;
    	while($scope.billingParameters[n]){
    		if($scope.billingParameters[n].name == name){
    			return $scope.billingParameters[n].excludePackagedFoods; 
    			break;
    		}
    		n++;
    	}
    }

    $scope.getBillingExtraUnit = function(name){
    	var n = 0;
    	while($scope.billingParameters[n]){
    		if($scope.billingParameters[n].name == name){
    			return $scope.billingParameters[n].unit; 
    			break;
    		}
    		n++;
    	}
    }


    $scope.extrasList = [];
    $scope.totalExtras = 0;
    $scope.showExpandedExtras = false;
    $scope.calculateExtrasList = function() {

    	$scope.extrasList = [];
    	$scope.totalExtras = 0;

    	var n = 0;
    	while($scope.selectedBillingMode.extras[n]){

    		var unit = $scope.getBillingExtraUnit($scope.selectedBillingMode.extras[n].name);
    		var exclude_flag = $scope.getBillingExtraExclusion($scope.selectedBillingMode.extras[n].name);
    		var amount = $scope.getCharges($scope.selectedBillingMode.extras[n].value, unit, exclude_flag);

    		$scope.extrasList.push({
		      "name": $scope.selectedBillingMode.extras[n].name,
		      "value": $scope.selectedBillingMode.extras[n].value,
		      "unit": unit,
		      "amount": amount,
		      "isPackagedExcluded": exclude_flag
		    });

    		n++;
    	}
    };


    $scope.$on('cart_updated', function(event, cart_products) {
        $scope.products = cart_products;
        $scope.lookForChangesInCart();
        $scope.calculateExtrasList();
    });


    //If any item changed in cart (if Editing Mode)
    $scope.lookForChangesInCart = function(){

        $scope.hasUnsavedChanges = false;
        window.localStorage.hasUnsavedChangesFlag = 0;

        var cart_products = !_.isUndefined(window.localStorage.accelerate_cart) ? JSON.parse(window.localStorage.accelerate_cart) : [];


        if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){

            var i = 0;
            while(i < cart_products.length){

                var tempItemCheck = checkForItemChanges(cart_products[i].code, cart_products[i].variant, cart_products[i].qty, cart_products[i].cartIndex);

                switch(tempItemCheck){
                    case 'QUANTITY_INCREASE':{
                        $scope.hasUnsavedChanges = true;
                        window.localStorage.hasUnsavedChangesFlag = 1;
                        break;
                    }
                    case 'QUANTITY_DECREASE':{
                        $scope.hasUnsavedChanges = true;
                        window.localStorage.hasUnsavedChangesFlag = 1;
                        break;
                    }
                    case 'NEW_ITEM':{
                        $scope.hasUnsavedChanges = true;
                        window.localStorage.hasUnsavedChangesFlag = 1;
                        break;
                    }
                    default:{
                        break;
                    }
                }

                i++;
            }
        }
        else{
            $scope.hasUnsavedChanges = false;
            window.localStorage.hasUnsavedChangesFlag = 0;
        }


        //Delete test
        var itemDeleteTest = checkIfItemDeleted();
        if(itemDeleteTest == 'DELETED' || itemDeleteTest == 'DELETED_ALL'){
            $scope.hasUnsavedChanges = true;
            window.localStorage.hasUnsavedChangesFlag = 1;
        }

    }


    //Edit comments for the Item in Cart

      $ionicModal.fromTemplateUrl('views/common/templates/edit-item-comments.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.edit_item_modal = modal;
      });

      $scope.editCartItem = function(itemData){

        if(!window.localStorage.current_table_selection || window.localStorage.current_table_selection == ''){ //No table selected
            $ionicLoading.show({
                template: "Table <b>not</b> selected",
                duration: 1500
            });            
            return '';
        }


        //Already printed item in KOT 
        if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){
            var change_noticed = checkForItemChanges(itemData.code, itemData.variant, itemData.qty, itemData.cartIndex);
            
            if(change_noticed == 'QUANTITY_INCREASE' || change_noticed == 'QUANTITY_DECREASE' || change_noticed == 'NEW_ITEM'){
                
            }
            else {
                return '';
            }
        }


        $scope.kitchenCommentsForEdit = kitchen_comments.sort();
        $scope.myEditItem = angular.copy(itemData);

        $scope.edit_item_modal.show();
      };





    function checkForItemChanges(code, variant, quantity, cart_index){

    /*
        Check if a particular item in accelerate_cart has any change w.r.t originalCart 
        (useful while editing an order)
    */

        var isCustom = true;
        if(!variant || variant == ''){
            isCustom = false;
        }

        if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){

            var originalData = window.localStorage.edit_KOT_originalCopy ?  JSON.parse(window.localStorage.edit_KOT_originalCopy) : [];
            
            var changed_cart_products = window.localStorage.accelerate_cart ?  JSON.parse(window.localStorage.accelerate_cart) : [];
            if(changed_cart_products.length == 0){
                return 'ERROR';
            }


            //Compare changes in the Cart
            var original_cart_products = originalData.cart;
            if(original_cart_products.length == 0){
                return 'ERROR';
            }


                //Search for the item in orignal Cart
                for(var m = 0; m < original_cart_products.length; m++){
                    //check if item is found, not found implies New Item!
                    if(!isCustom && (code == original_cart_products[m].code && cart_index == original_cart_products[m].cartIndex)){
                        //Item Found
                        if(quantity > original_cart_products[m].qty){ //qty increased
                            return 'QUANTITY_INCREASE';
                        }
                        else if(quantity < original_cart_products[m].qty){ //qty decreased
                            return 'QUANTITY_DECREASE';
                        }
                        
                        break;
                    }
                    else if(isCustom && (code == original_cart_products[m].code && cart_index == original_cart_products[m].cartIndex) && (variant == original_cart_products[m].variant)){
                        //Item Found
                        if(quantity > original_cart_products[m].qty){ //qty increased
                            return 'QUANTITY_INCREASE';
                        }
                        else if(quantity < original_cart_products[m].qty){ //qty decreased
                            return 'QUANTITY_DECREASE';
                        }
                        break;
                    }

                    //Last iteration to find the item
                    if(m == original_cart_products.length-1){ //New item
                        return 'NEW_ITEM';
                    }
                } 
        }
        else{
            return 'ERROR';
        }

        return 'NO_CHANGE';
    }


      $scope.saveEditedItemComments = function(editedItem){
        var comments = '';

        if(editedItem.comments != "" && editedItem.comments != undefined){
            comments = editedItem.comments;
        }

        ShoppingCartService.updateComments(editedItem.cartIndex, comments)
        $scope.edit_item_modal.hide();
      }


      $scope.isCommentAddedEditedItem = function(comment){

        if($scope.myEditItem.comments == "" || $scope.myEditItem.comments == undefined){
            return false;
        }

        var comm_splits = ($scope.myEditItem.comments).split(', ');

        var n = 0;
        while(comm_splits[n]){
            if(comm_splits[n] == comment){
                return true;
            }
            n++;
        }

        return false;
      }


      $scope.addCommentToEditItem = function(commentNew){
        if($scope.myEditItem.comments == '' || $scope.myEditItem.comments == undefined){
            $scope.myEditItem.comments = commentNew;
        }
        else{
            
            var temp_all = $scope.myEditItem.comments.split(', ');

            var n = 0;
            while(temp_all[n]){
                if(temp_all[n] == commentNew){
                    temp_all.splice(n, 1);
                    var new_comments = '';
                    for(var i = 0; i < temp_all.length; i++){
                        if(i == 0){
                            new_comments = temp_all[0];
                        }
                        else{
                            new_comments += ', ' + temp_all[i];
                        }
                    }

                    $scope.myEditItem.comments = new_comments;
                    
                    return "";
                }
                n++;
            }

            $scope.myEditItem.comments += ', '+commentNew;            
            
        }

      }



    $scope.close = function() {
        var previous_view = _.last($rootScope.previousView);
        $state.go(previous_view.fromState, previous_view.fromParams );
    };

    $scope.removeFromCart = function(product) {
        $ionicActionSheet.show({
            buttons: [
        { text: '<i class="icon ion-trash-a assertive"></i> <i class="assertive">Remove from the Cart</i>' },
        { text: '<i class="icon"></i> <i class="dark">Cancel</i>' },
      ],
            titleText: 'Remove <b>'+product.name+'</b> from the Cart?',
            buttonClicked: function(index) {
                if(index == 0){
                    ShoppingCartService.removeProduct(product.cartIndex);
                }
        return true;
      },
        });
    };

    $scope.moreCount = function(product) {
        ShoppingCartService.moreProduct(product);
    };

    $scope.lessCount = function(product) {
        ShoppingCartService.lessProduct(product);
    };

    //update product quantities
    $scope.$watch('subtotal', function() {
        var updatedProducts = $scope.products;
        ShoppingCartService.updatedProducts(updatedProducts);
    });


    $scope.subtotal = 0;

    $scope.getSubtotal = function() {
        $scope.subtotal = _.reduce($scope.products, function(memo, product){
            return memo + (product.price * product.qty);
        }, 0);

        return $scope.subtotal;
    };


    $scope.getCharges = function(value, unit, isExcluded) {

    	var extras_sum = 0;

    	var n = 0;
    	while($scope.products[n]){
	    	if(isExcluded){
	    		if($scope.products[n].isPackaged){

	    		}
	    		else{

	    			var temp = 0;

	    			if(unit == 'PERCENTAGE'){
	    				temp = ($scope.products[n].price * $scope.products[n].qty * value)/100;
	    				temp = Math.round(temp * 100) / 100;
					}
					else if(unit == 'FIXED'){
	    				temp = Math.round(value * 100) / 100;
					}


					extras_sum += temp;
	    		}
	    	}
	    	else{
	    			var temp = 0;

	    			if(unit == 'PERCENTAGE'){
	    				temp = ($scope.products[n].price * $scope.products[n].qty * value)/100;
	    				temp = Math.round(temp * 100) / 100;
					}
					else if(unit == 'FIXED'){
	    				temp = Math.round(value * 100) / 100;
					}


					extras_sum += temp;
	    	}

	    	n++;
	    }

	    $scope.totalExtras += Math.round(extras_sum * 100) / 100;
	    return Math.round(extras_sum * 100) / 100;
    };

    $scope.getTotal = function() {
        var total_sum = $scope.subtotal + $scope.totalExtras;
        return Math.round(total_sum);
    };


    $scope.isOrderConfirmationProgressing = false;

    //Clear all info after placing order
    $scope.orderPostClearData = function(optionalFlag){
        $scope.isOrderConfirmationProgressing = true;
        ShoppingCartService.clearCartToEmpty();
        currentGuestData.clearGuest();
        window.localStorage.current_table_selection = '';

        if(optionalFlag == 'SUCCESS'){
            $ionicLoading.show({
                template: '<p style=\'margin: 20px 0 0 0; font-size: 36px; color: #82dc82; font-family: "Great Vibes"\'>Success!</p><br>Order has been placed.',
                duration: 2000
            }); 

            $timeout(function() {
                $state.go('main.app.punch');
            }, 2000);           
        }
        else{
            $state.go('main.app.punch');   
        }
    }



    //Send KOT
    $scope.sendKOTToServer = function(){

        $scope.isOrderConfirmationProgressing = true;
         
                    //fetch billing parameters
                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_settings/ACCELERATE_BILLING_PARAMETERS',
                        timeout: 10000
                    })
                    .success(function(data) {
                        if(data._id != ""){

                            var params = data.value;

                            var selectedModeExtrasList = $scope.selectedBillingMode.extras;
                            var cartExtrasList = [];

                            var n = 0;
                            var m = 0;
                            while(selectedModeExtrasList[n]){
                                m = 0;
                                while(params[m]){     
                                    if(selectedModeExtrasList[n].name == params[m].name){  
                                        params[m].value = parseFloat(selectedModeExtrasList[n].value);              
                                        cartExtrasList.push(params[m]);
                                    }
                                    
                                    m++;
                                }
                                n++;
                            }

                            isTableFreeCheck(cartExtrasList);

                        }
                        else{
                                var alertPopup = $ionicPopup.alert({
                                    cssClass: 'popup-clear confirm-alert-alternate',
                                    title: 'Not Found Error',
                                    template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">Billing Parameters not found on Server. Please contact Accelerate Support.</p>'
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


                function isTableFreeCheck(selectedModeExtras){

                    var table_req = $scope.selectedTable;
                    console.log(table_req)

                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+table_req+'"]&endkey=["'+table_req+'"]',
                        timeout: 10000
                    })
                    .success(function(data) {
                        if(data.rows.length >= 1){

                                var thisTable = data.rows[0].value;

                                if(thisTable.status != 0){
                                    var confirmPopup = $ionicPopup.confirm({
                                        cssClass: 'popup-clear confirm-alert-alternate',
                                        title: 'Order Already Exists',
                                        template: '<p style="color: #4e5b6a; padding: 0 10px 10px 10px; margin: 0; font-size: 15px; font-weight: 400;">The table <b>'+table_req+'</b> is not free. Refresh the table status or check in <b style="color: #E91E63">Live Orders</b> on the System.</p>'
                                    });


                                    confirmPopup.then(function(res) {
                                        if(res){
                                            $scope.orderPostClearData();
                                        }
                                        else{
                                        
                                        }
                                    });                                    

                                    return ''
                                }
                                else{
                                    sendKOTToServerAfterProcess(selectedModeExtras);
                                }
                        }
                        else{
                            $ionicLoading.show({
                                template: "Error: Unable to read Table info.",
                                duration: 3000
                            });
                        }
                    })
                    .error(function(data) {

                        $ionicLoading.hide();

                        $ionicLoading.show({
                            template: "Error: Unable to read Table info.",
                            duration: 3000
                        });
                    });    

                }



                function sendKOTToServerAfterProcess(selectedModeExtras){


                        if($scope.selectedTable == ''){
                            $ionicLoading.show({
                                template: "Please choose a table.",
                                duration: 3000
                            });
                            return '';
                        }
                    
                          var orderMetaInfo = {};
                            orderMetaInfo.mode = $scope.selectedBillingMode.name;
                            orderMetaInfo.modeType = $scope.selectedBillingMode.type;
                            orderMetaInfo.reference = '';
                            orderMetaInfo.isOnline = false;

                          var guestData = currentGuestData.getGuest();


                          var today = moment().format('DD-MM-YYYY');
                          var time = moment().format('HHmm');

                          var specialRemarksInfo = window.localStorage.specialRequests_comments ? window.localStorage.specialRequests_comments : '';
                          var allergyData = window.localStorage.allergicIngredientsData ? JSON.parse(window.localStorage.allergicIngredientsData) : [];

                          var obj = {}; 
                          obj.KOTNumber = "";
                          obj.orderDetails = orderMetaInfo;
                          obj.table = $scope.selectedTable;

                          obj.customerName = guestData.name;
                          obj.customerMobile = guestData.mobile; 
                          obj.guestCount = guestData.count && guestData.count != null ? parseInt(guestData.count) : 0;
                          
                          var licenceData = window.localStorage.deviceRegistrationData && window.localStorage.deviceRegistrationData != '' ? JSON.parse(window.localStorage.deviceRegistrationData) : {};

                          obj.machineName = licenceData.deviceUID;
                          
                          var sessionInfo = window.localStorage.setSessionData ? JSON.parse(window.localStorage.setSessionData) : {};
                          obj.sessionName = sessionInfo.name ? sessionInfo.name : '';

                          obj.stewardName = window.localStorage.loggedInUser_name && window.localStorage.loggedInUser_name != '' ? window.localStorage.loggedInUser_name : '';
                          obj.stewardCode = window.localStorage.loggedInUser_mobile && window.localStorage.loggedInUser_mobile != '' ? window.localStorage.loggedInUser_mobile : '';

                          obj.date = today;
                          obj.timePunch = time;
                          obj.timeKOT = "";
                          obj.timeBill = "";
                          obj.timeSettle = "";

                          var cart_products = window.localStorage.accelerate_cart ? JSON.parse(window.localStorage.accelerate_cart) : [];
                          obj.cart = cart_products;
                          obj.specialRemarks = '';
                          obj.allergyInfo = [];


                            /*Process Figures*/
                            var subTotal = 0;
                            var packagedSubTotal = 0;

                            var minimum_cooking_time = 0;

                            var n = 0;
                            while(cart_products[n]){

                                /* min cooking time */
                                if(cart_products[n].cookingTime && cart_products[n].cookingTime > 0){
                                    if(minimum_cooking_time <= cart_products[n].cookingTime){
                                        minimum_cooking_time = cart_products[n].cookingTime;
                                    }
                                }


                                subTotal = subTotal + cart_products[n].qty * cart_products[n].price;

                                if(cart_products[n].isPackaged){
                                    packagedSubTotal = packagedSubTotal + cart_products[n].qty * cart_products[n].price;
                                }

                                n++;
                            }


                          /*Calculate Taxes and Other Charges*/ 

                          //Note: Skip tax and other extras (with isCompulsary no) on packaged food Pepsi ect. (marked with 'isPackaged' = true)

                          var otherCharges = [];        
                          var k = 0;

                          if(selectedModeExtras.length > 0){
                            for(k = 0; k < selectedModeExtras.length; k++){

                                var tempExtraTotal = 0;

                                if(selectedModeExtras[k].value != 0){
                                    if(selectedModeExtras[k].excludePackagedFoods){
                                            if(selectedModeExtras[k].unit == 'PERCENTAGE'){
                                                tempExtraTotal = (selectedModeExtras[k].value * (subTotal-packagedSubTotal))/100;
                                            }
                                            else if(selectedModeExtras[k].unit == 'FIXED'){
                                                tempExtraTotal = selectedModeExtras[k].value;
                                            }                       
                                    }
                                    else{
                                            if(selectedModeExtras[k].unit == 'PERCENTAGE'){
                                                tempExtraTotal = selectedModeExtras[k].value * subTotal/100;
                                            }
                                            else if(selectedModeExtras[k].unit == 'FIXED'){
                                                tempExtraTotal = selectedModeExtras[k].value;
                                            }                               
                                    }


                                }

                                tempExtraTotal = Math.round(tempExtraTotal * 100) / 100;

                                otherCharges.push({
                                    "name": selectedModeExtras[k].name,
                                    "value": selectedModeExtras[k].value,
                                    "unit": selectedModeExtras[k].unit,
                                    "amount": tempExtraTotal,
                                    "isPackagedExcluded": selectedModeExtras[k].excludePackagedFoods
                                })
                            }
                          }


                          obj.extras = otherCharges;
                          obj.discount = {};
                          obj.customExtras = {};


                          var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@localhost:5984/';
                                
                          //LOADING
                          $ionicLoading.show({
                            template:  '<ion-spinner></ion-spinner>'
                          });

                          //Cart empty bug fix
                          if(obj.cart == null || obj.cart.length == 0){
                            $ionicLoading.hide();
                            return;
                          }

                                  //Post to local Server
                                  $http({
                                        method  : 'POST',
                                        url     : COMMON_IP_ADDRESS+'accelerate_taps_orders/',
                                        data    : obj,
                                        headers : {'Content-Type': 'application/json'},
                                        timeout : 10000
                                    })
                                    .success(function(response) { 
                                      if(response.ok){
                                        $ionicLoading.hide();

                                        $scope.orderPostClearData('SUCCESS');
                                      }
                                      else{
                                        $ionicLoading.hide();
                                        $ionicLoading.show({
                                            template: "Not responding. Check your connection.",
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
    }


    //Send changed KOT to server
    $scope.sendChangedKOT = function(runningKOTNumber){

        $scope.isOrderConfirmationProgressing = true;

        //Complete removed check
        var current_existing_cart = !_.isUndefined(window.localStorage.accelerate_cart) ? JSON.parse(window.localStorage.accelerate_cart) : [];
        if(current_existing_cart.length == 0){
        
                  var alertPopup = $ionicPopup.alert({
                                            cssClass: 'popup-clear confirm-alert-alternate',
                                            title: '<b>Order Cancellation not Allowed</b>',
                                            template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">Orders can be cancelled from <b>Desktop POS</b> only.<br>Do you want to Undo Changes?</p>'
                                        });

                    alertPopup.then(function(res){
                        if(res){
                            $scope.undoEditingOrder();
                        }
                        else{
                            
                        }
                    });


                return '';
        }




        $scope.hasRestrictedEdits = false;

        if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){

            var new_updated_cart = !_.isUndefined(window.localStorage.accelerate_cart) ? JSON.parse(window.localStorage.accelerate_cart) : [];
            var isAdmin = window.localStorage.loggedInUser_admin && window.localStorage.loggedInUser_admin != '' ? window.localStorage.loggedInUser_admin : 0;
            var i = 0;
            while(new_updated_cart[i]){

                var change_observed = checkForItemChanges(new_updated_cart[i].code, new_updated_cart[i].variant, new_updated_cart[i].qty, new_updated_cart[i].cartIndex);
                if(change_observed == 'QUANTITY_DECREASE'){

                   $scope.hasRestrictedEdits = true;

                   if(isAdmin == 0){ //not an admin
                        $ionicLoading.show({
                            template: "Only an Admin can make these changes.",
                            duration: 3000
                        });
                        return '';
                   } 
                }
                i++;
            }

                //Delete test
                var itemDeleteTest = checkIfItemDeleted();
                if(itemDeleteTest == 'DELETED' || itemDeleteTest == 'DELETED_ALL'){
                    $scope.hasRestrictedEdits = true;
                    
                    if(isAdmin == 0){ //not an admin
                        $ionicLoading.show({
                            template: "Only an Admin can make these changes.",
                            duration: 3000
                        });
                        return '';
                   } 
                }


        }
       

        //fetch the first KOT
        if(!runningKOTNumber || runningKOTNumber == '' || runningKOTNumber == undefined){

            $ionicLoading.show({
                template: "Not responding. Check your connection.",
                duration: 3000
            });

            return '';
        }


                //Set _id from Branch mentioned in Licence
                var accelerate_licencee_branch = deviceLicenseService.getBranchCode();
                if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                  var alertPopup = $ionicPopup.alert({
                                            cssClass: 'popup-clear confirm-alert-alternate',
                                            title: 'Invalid Licence error',
                                            template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT can not be opened. Please contact Accelerate Support if problem persists.</p>'
                                        });
                  return '';
                }    



                    var kot_request_data = accelerate_licencee_branch +"_KOT_"+ runningKOTNumber;

                    //PRELOAD TABLE MAPPING
                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_kot/'+kot_request_data,
                        timeout: 10000
                    })
                    .success(function(data) {
                        if(data._id != ""){

                            var kot = data;
                            delete kot._rev;

                            var originalDataCached = JSON.parse(window.localStorage.edit_KOT_originalCopy);

                            var cart_latest = JSON.stringify(kot.cart);
                            var cart_cached = JSON.stringify(originalDataCached.cart);
                            
                            if(cart_latest == cart_cached){
                                
                            }
                            else{
                                var confirmPopup = $ionicPopup.confirm({
                                    cssClass: 'popup-clear confirm-alert-alternate',
                                    title: 'Someone has modified this KOT while you were editing the order. Do you want to open the latest KOT and make your changes again?'
                                });

                                confirmPopup.then(function(res) {
                                    if(res){
                                        reopenOrderFromKOTNumber(kot.KOTNumber);
                                    }
                                    else{
                                        $scope.orderPostClearData();
                                    }
                                });                                    

                                return ''
                            }


                            //fetch billing parameters
                            $http({
                                method: 'GET',
                                url: COMMON_IP_ADDRESS+'/accelerate_settings/ACCELERATE_BILLING_PARAMETERS',
                                timeout: 10000
                            })
                            .success(function(data) {
                                if(data._id != ""){

                                    var params = data.value;

                                    var selectedModeExtrasList = '';

                                    var j = 0;
                                    while(billing_modes[j]){
                                        if(billing_modes[j].name == kot.orderDetails.mode){
                                            selectedModeExtrasList = billing_modes[j].extras;
                                            break;
                                        }
                                        j++;
                                    }



                                    var cartExtrasList = [];

                                    var n = 0;
                                    var m = 0;
                                    while(selectedModeExtrasList[n]){
                                        m = 0;
                                        while(params[m]){     
                                            if(selectedModeExtrasList[n].name == params[m].name){  
                                                params[m].value = parseFloat(selectedModeExtrasList[n].value);              
                                                cartExtrasList.push(params[m]);
                                            }
                                            
                                            m++;
                                        }
                                        n++;
                                    }

                                    sendAppendedKOT(kot, cartExtrasList);

                                }
                                else{
                                        var alertPopup = $ionicPopup.alert({
                                            cssClass: 'popup-clear confirm-alert-alternate',
                                            title: 'Not Found Error',
                                            template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">Billing Parameters not found on Server. Please contact Accelerate Support.</p>'
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
                        else{
                                var alertPopup = $ionicPopup.alert({
                                    cssClass: 'popup-clear confirm-alert-alternate',
                                    title: 'Not Found Error',
                                    template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">#'+kotID+' not found on Server. Please contact Accelerate Support.</p>'
                                });
                        }
                    })
                    .error(function(data) {

                        $ionicLoading.hide();

                        if(data.error == "not_found"){
                                var alertPopup = $ionicPopup.alert({
                                    cssClass: 'popup-clear confirm-alert-alternate',
                                    title: 'Not Found Error',
                                    template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">#'+runningKOTNumber+' not found on Server.<br>May be because <b>Bill already taken.</b></p>'
                                });                            
                        }
                        else{
                            $ionicLoading.show({
                                template: "Not responding. Check your connection.",
                                duration: 3000
                            });
                        }
                    });


                

                function reopenOrderFromKOTNumber(kotID){//re-open the order

                    $scope.hasUnsavedChanges = false;
                    window.localStorage.hasUnsavedChangesFlag = 0;
                
                    //Set _id from Branch mentioned in Licence
                    var accelerate_licencee_branch = deviceLicenseService.getBranchCode();
                    if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                      var alertPopup = $ionicPopup.alert({
                                                cssClass: 'popup-clear confirm-alert-alternate',
                                                title: 'Invalid Licence Error',
                                                template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT can not be opened. Please contact Accelerate Support if problem persists.</p>'
                                            });
                      return '';
                    }

                    var kot_request_data = accelerate_licencee_branch +"_KOT_"+ kotID;

                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'/accelerate_kot/'+kot_request_data,
                        timeout: 10000
                    })
                    .success(function(data) {
                        if(data._id != ""){

                            var kot = data;

                            window.localStorage.edit_KOT_originalCopy = JSON.stringify(kot);
                            window.localStorage.accelerate_cart = JSON.stringify(kot.cart);

                            //Update Guest details
                            currentGuestData.setGuest(kot.customerName, kot.customerMobile ? parseInt(kot.customerMobile) : '', kot.guestCount ? parseInt(kot.guestCount) : '');

                            $state.go('main.app.punch');
                        }
                        else{
                                var alertPopup = $ionicPopup.alert({
                                    cssClass: 'popup-clear confirm-alert-alternate',
                                    title: 'Not Found Error',
                                    template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT #'+kotID+' not found on Server.</p>'
                                });
                        }
                    })
                    .error(function(data) {

                        $ionicLoading.hide();

                        if(data.error == "not_found"){
                            var alertPopup = $ionicPopup.alert({
                                cssClass: 'popup-clear confirm-alert-alternate',
                                title: 'Not Found Error',
                                template: '<p style="padding: 0 10px 10px 10px; color: #E91E63; margin: 0; font-size: 15px; font-weight: 400;">KOT #'+kotID+' not found on Server.</p>'
                            });
                        }
                        else{
                            $ionicLoading.show({
                                template: "Not responding. Check your connection.",
                                duration: 3000
                            });
                        }
                    });

                }



                function sendAppendedKOT(originalKOT, selectedModeExtras){

                      var new_updated_cart = !_.isUndefined(window.localStorage.accelerate_cart) ? JSON.parse(window.localStorage.accelerate_cart) : [];


                      originalKOT.timeKOT = moment().format('HHmm');
                      originalKOT.cart = new_updated_cart;


                      //Update guest data
                      var updated_guest = currentGuestData.getGuest();

                      originalKOT.guestCount = updated_guest.count && updated_guest.count != null && updated_guest.count != '' ? parseInt(updated_guest.count) : 0;
                      originalKOT.customerName = updated_guest.name;
                      originalKOT.customerMobile = updated_guest.mobile;


                            //RECALCULATE EXTRAS
                            var cart_products = originalKOT.cart;

                            /*Process Figures*/
                            var subTotal = 0;
                            var packagedSubTotal = 0;

                            var minimum_cooking_time = 0;

                            var n = 0;
                            while(cart_products[n]){

                                /* min cooking time */
                                if(cart_products[n].cookingTime && cart_products[n].cookingTime > 0){
                                    if(minimum_cooking_time <= cart_products[n].cookingTime){
                                        minimum_cooking_time = cart_products[n].cookingTime;
                                    }
                                }


                                subTotal = subTotal + cart_products[n].qty * cart_products[n].price;

                                if(cart_products[n].isPackaged){
                                    packagedSubTotal = packagedSubTotal + cart_products[n].qty * cart_products[n].price;
                                }

                                n++;
                            }


                          /*Calculate Taxes and Other Charges*/ 

                          //Note: Skip tax and other extras (with isCompulsary no) on packaged food Pepsi ect. (marked with 'isPackaged' = true)

                          var otherCharges = [];        
                          var k = 0;

                          if(selectedModeExtras.length > 0){
                            for(k = 0; k < selectedModeExtras.length; k++){

                                var tempExtraTotal = 0;

                                if(selectedModeExtras[k].value != 0){
                                    if(selectedModeExtras[k].excludePackagedFoods){
                                            if(selectedModeExtras[k].unit == 'PERCENTAGE'){
                                                tempExtraTotal = (selectedModeExtras[k].value * (subTotal-packagedSubTotal))/100;
                                            }
                                            else if(selectedModeExtras[k].unit == 'FIXED'){
                                                tempExtraTotal = selectedModeExtras[k].value;
                                            }                       
                                    }
                                    else{
                                            if(selectedModeExtras[k].unit == 'PERCENTAGE'){
                                                tempExtraTotal = selectedModeExtras[k].value * subTotal/100;
                                            }
                                            else if(selectedModeExtras[k].unit == 'FIXED'){
                                                tempExtraTotal = selectedModeExtras[k].value;
                                            }                               
                                    }


                                }

                                tempExtraTotal = Math.round(tempExtraTotal * 100) / 100;

                                otherCharges.push({
                                    "name": selectedModeExtras[k].name,
                                    "value": selectedModeExtras[k].value,
                                    "unit": selectedModeExtras[k].unit,
                                    "amount": tempExtraTotal,
                                    "isPackagedExcluded": selectedModeExtras[k].excludePackagedFoods
                                })
                            }
                          }


                          originalKOT.extras = otherCharges;



                              //LOADING
                              $ionicLoading.show({
                                template:  '<ion-spinner></ion-spinner>'
                              });

                              //Post to local Server
                              $http({
                                    method  : 'POST',
                                    url     : COMMON_IP_ADDRESS+'accelerate_taps_orders/',
                                    data    : originalKOT,
                                    headers : {'Content-Type': 'application/json'},
                                    timeout : 10000
                                })
                                .success(function(response) { 
                                  if(response.ok){
                                    $ionicLoading.hide();
                                    
                                    $scope.orderPostClearData('SUCCESS');
                                  }
                                  else{
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });
                                  }

                                })
                                .error(function(data) {
                                    
                                    $ionicLoading.hide();
                                    
                                    if(data.error == 'conflict'){
                                        $ionicLoading.show({
                                            template: "System is already processing this order. Try again later.",
                                            duration: 4000
                                        });
                                    }
                                    else{
                                        $ionicLoading.show({
                                            template: "Not responding. Check your connection.",
                                            duration: 3000
                                        });
                                    }
                                });
                }


    }
    
})



.controller('FiltersCtrl', function($scope, $state, $rootScope, $ionicSlideBoxDelegate, $ionicSideMenuDelegate) {

    //For Non Veg Content
    $rootScope.nonvegUser = true;

    //For VEG or NON-VEG
    $rootScope.typevalue = '';
    $scope.category_filter = '';
    $scope.clearFlag = false;
    $scope.clearVegFlag = false;
    $scope.clearNonVegFlag  = false;

    $scope.typeSelected = function(){
        $scope.clearFlag = true;
        if($scope.category_filter == 'VEG'){
            $rootScope.typevalue = 'VEG';
            $scope.clearVegFlag = true;
            $scope.clearNonVegFlag  = false;

            //reset Non Veg Filters
            this.clearNonFilter();
        }
        else{
            $rootScope.typevalue = 'NONVEG';
            $scope.clearNonVegFlag  = true;
            $scope.clearVegFlag = false;

            this.setNonFilter();
        }

    }



    $scope.resetVegNonVeg = function(){
        $scope.clearFlag = false;
        $scope.clearVegFlag = false;
        $scope.clearNonVegFlag  = false;
        $scope.category_filter = '';
        $rootScope.typevalue = '';

        this.setNonFilter();
    }

    $scope.clearNonFilter = function(){
        $rootScope.nonvegUser = false;
        $scope.nonvegcontent_filter.chicken = false;
        $scope.nonvegcontent_filter.mutton = false;
        $scope.nonvegcontent_filter.fish = false;
        $scope.nonvegcontent_filter.prawns = false;
        $scope.nonvegcontent_filter.egg = false;
    }

    $scope.setNonFilter = function(){
        $rootScope.nonvegUser = true;
    }


    //NonVeg Contents.
    $rootScope.nonvegcontent_filter = {};
    $rootScope.nonvegcontent_filter.chicken = false;
    $rootScope.nonvegcontent_filter.mutton = false;
    $rootScope.nonvegcontent_filter.fish = false;
    $rootScope.nonvegcontent_filter.prawns = false;
    $rootScope.nonvegcontent_filter.egg = false;



    //Cooking Type
    $rootScope.type_filter = {};
    $rootScope.type_filter.gravy = false;
    $rootScope.type_filter.semi = false;
    $rootScope.type_filter.dry = false;
    $rootScope.type_filter.deep = false;


    //Spice Level
    $scope.spice_filter = {};
    $scope.spice_filter = 'any';
    $rootScope.spice = 'any';

    //Bone Type
    $scope.bone_filter = {};
    $scope.bone_filter = 'any';
    $rootScope.bone = 'any';

    //Fry Type
    $scope.fry_filter = {};
    $scope.fry_filter = 'any';
    $rootScope.fry = 'any';


    $scope.spiceSelected = function(){
        if($scope.spice_filter=='spicy')
            $rootScope.spice = 'spicy';
        else if($scope.spice_filter=='sweeened')
            $rootScope.spice = 'sweeened';
        else if($scope.spice_filter=='non')
            $rootScope.spice = 'non';
    }

    $scope.boneSelected = function(){
        if($scope.bone_filter=='bone')
            $rootScope.bone = 'bone';
        else if($scope.bone_filter=='boneless')
            $rootScope.bone = 'boneless';
    }

    $scope.frySelected = function(){
        if($scope.fry_filter=='tawa')
            $rootScope.fry = 'tawa';
        else if($scope.fry_filter=='oil')
            $rootScope.fry = 'oil';
    }

    $scope.cancelRefine = function(){
        var previous_view = _.last($rootScope.previousView);
        $state.go(previous_view.fromState, previous_view.fromParams );
    };

    $scope.applyRefine = function(){
        //Create the Filter Object
        if($rootScope.typevalue == ''){
            var vegtype={
                "showVeg" : true,
                "showNonVeg" : true
            }
        }
        else if($rootScope.typevalue == 'VEG'){
            var vegtype={
                "showVeg" : true,
                "showNonVeg" : false
            }
        }
        else if($rootScope.typevalue == 'NONVEG'){
            var vegtype={
                "showVeg" : false,
                "showNonVeg" : true
            }
        }


        //Content Obj.
        if($rootScope.nonvegcontent_filter.chicken || $rootScope.nonvegcontent_filter.mutton || $rootScope.nonvegcontent_filter.fish || $rootScope.nonvegcontent_filter.prawns || $rootScope.nonvegcontent_filter.egg)
        {
            var contains = {
            "skip" : false,
            "chicken" : $rootScope.nonvegcontent_filter.chicken,
            "mutton" : $rootScope.nonvegcontent_filter.mutton,
            "fish" : $rootScope.nonvegcontent_filter.fish,
            "prawns" : $rootScope.nonvegcontent_filter.prawns,
            "egg" : $rootScope.nonvegcontent_filter.egg
            }
        }
        else{
            var contains = {
            "skip" : true
            }
        }


        //Spice Level Obj.
        var spicelevel = {
            "skip" : $rootScope.spice == 'any' ? true : false,
            "spicy" : $rootScope.spice == 'spicy' ? true : false,
            "sweeened" : $rootScope.spice == 'sweeened' ? true : false,
            "non" :  $rootScope.spice == 'non' ? true : false
        }

        //Cooking Type
        if($rootScope.type_filter.gravy || $rootScope.type_filter.semi || $rootScope.type_filter.dry || $rootScope.type_filter.deep)
        {
            var cookingtype = {
            "skip" : false,
            "gravy" : $rootScope.type_filter.gravy,
            "semi" : $rootScope.type_filter.semi,
            "dry" : $rootScope.type_filter.dry,
            "deep" : $rootScope.type_filter.deep
            }
        }
        else{
            var cookingtype = {
            "skip" : true
            }
        }

        //Bone Type
        var boneless = {
            "skip" : $rootScope.bone == 'any' ? true : false,
            "bone" : $rootScope.bone == 'bone' ? true : false,
            "boneless" : $rootScope.bone == 'boneless' ? true : false
        }

        //Fry Type
        var frytype = {
            "skip" : $rootScope.fry == 'any' ? true : false,
            "oilfry" : $rootScope.fry == 'oil' ? true : false,
            "tawafry" : $rootScope.fry == 'tawa' ? true : false
        }

        var sampleFilter = {
            "vegtype" : vegtype,
            "contains" : contains,
            "spicelevel" : spicelevel,
            "frytype" : frytype,
            "cookingtype" : cookingtype,
            "boneless" : boneless
        }

        $rootScope.$broadcast('filter_applied', sampleFilter);

        var previous_view = _.last($rootScope.previousView);
        $state.go(previous_view.fromState, previous_view.fromParams );
    };


    $scope.lockSlide = function () {
        $ionicSlideBoxDelegate.$getByHandle('filter-tabs-slider').enableSlide(false);
    };
})




.controller('AppCtrl', function($state, $http, $ionicPopover, $ionicLoading, $timeout, $interval, $scope, $rootScope) {

        //Snooze Notifications
        $interval(function() {
            let timerLeft = window.localStorage.extendShowTimerInvisibility;
            if(timerLeft && timerLeft != null && timerLeft != ""){
                if(timerLeft < 0){
                    timerLeft = 0;
                }
                window.localStorage.extendShowTimerInvisibility = timerLeft - 1;
            }
            else{
                window.localStorage.extendShowTimerInvisibility = 0;
            }
        }, 1000);
        


        //App level background api calls:
        var fetchMetricsTimer = $interval(function() {
            $scope.getNotificationMetrics();
        }, 10000);

        $scope.getNotificationMetrics = function(){
                let data = {
                    "token": "sHtArttc2ht+tMf9baAeQ9ukHnXtlsHfexmCWx5sJOjMmduTS8FqbWXZu3C46tTVWfJK2QlHYHIQvEmu05QacaIoEtT4ABkAPy3dnnxeGYI="
                }

                $http({
                    method: 'POST',
                    url: 'https://accelerateengine.app/smart-menu/apis/adminfetchnotificationmetrics.php',
                    data: data,
                    timeout: 10000
                })
                .success(function(response) {
                    $ionicLoading.hide();
                    if(response.status){

                        //Service Requests
                        if(response.serviceRequests && response.serviceRequests.length > 0){
                            $rootScope.$broadcast('ACTIVE_REQUESTS_ALERT', response.serviceRequests);
                        }
                        else{
                            $rootScope.$broadcast('ACTIVE_REQUESTS_ALERT', []);
                        }

                        //Service Requests
                        if(response.pendingOrders && response.pendingOrders.length > 0){
                            $rootScope.$broadcast('ACTIVE_ORDERS_ALERT', response.pendingOrders);
                        }
                    }
                })
        }


})


;