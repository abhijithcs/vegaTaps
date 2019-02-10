angular.module('pos.controllers', ['ionic'])


    .controller('StatusCtrl', function($ionicLoading, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicSideMenuDelegate, ShoppingCartService) {
        
    })

    .controller('SettingsCtrl', function($ionicLoading, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicSideMenuDelegate, ShoppingCartService) {
     
        $scope.navToggled = false;

        $scope.showOptionsMenu = function() {
            $ionicSideMenuDelegate.toggleLeft();
            $scope.navToggled = !$scope.navToggled;
        };

        $scope.defaultServer = {};
        $scope.defaultServer.ip_address = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@127.0.0.1:5984/';


        $scope.saveServerAddress = function(){
            window.localStorage.defaultServerIPAddress = $scope.defaultServer.ip_address;
        }

    })

    

    .controller('StatusRunningCtrl', function($ionicLoading, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicSideMenuDelegate, ShoppingCartService) {
      

        var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@127.0.0.1:5984/';


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
                        url: COMMON_IP_ADDRESS+'/accelerate_kot/_design/kot-fetch/_view/fetchbytype?startkey=["DINE"]&include_docs=true',
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
                return moment(obj.timeKOT, "hhmm").format('h:mm a');
            }
            else{
                return moment(obj.timePunch, "hhmm").format('h:mm a');
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


        //Open order to edit
        $scope.openOrderToEdit = function(editOrder){


                //Set _id from Branch mentioned in Licence
                var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : 'NAVALUR'; 
                if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                  var alertPopup = $ionicPopup.alert({
                                            cssClass: 'popup-outer confirm-alert-view',
                                            title: 'Invalid Licence Error',
                                            template: '<p style="padding: 20px 0px; color: #444; margin: 0; font-size: 15px; font-weight: 400;">KOT can not be opened. Please contact Accelerate Support if problem persists.</p>'
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
                                            cssClass: 'popup-outer confirm-alert-view',
                                            title: 'Warning',
                                            template: '<p style="padding: 20px 0px; color: #444; margin: 0; font-size: 15px; font-weight: 400;">There is already an active order being modified. Please complete it to continue.</p>'
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
                                            cssClass: 'popup-outer confirm-alert-view',
                                            title: 'Not Found Error',
                                            template: '<p style="padding: 20px 0px; color: #444; margin: 0; font-size: 15px; font-weight: 400;">#'+kotID+' not found on Server. Please contact Accelerate Support.</p>'
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

            $state.go('main.app.punch');


        }

       

    })

    .controller('StatusTablesCtrl', function($ionicLoading, ShoppingCartService, currentGuestData, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicSideMenuDelegate) {
        

        var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@127.0.0.1:5984/';


        $scope.isRenderTableLoaded = false;

    
        $scope.openSeatPlanView = function(){

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
                        cssClass: 'popup-outer confirm-alert-alternate',
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

                                $state.go('main.app.punch');
                            }
                            else if(seat.status == 1){ //running order table
                                copyKOTtoCart(seat);
                                $scope.selectedTable = seat.table;
                                window.localStorage.current_table_selection = seat.table;
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
                else if(seat.status == 1){ //running order table
                    copyKOTtoCart(seat);
                }
            }
            else{ //The cart is not empty, fresh order being punched
                if(seat.status == 0){ //free table
                    $scope.selectedTable = seat.table;
                    window.localStorage.current_table_selection = seat.table;

                    $state.go('main.app.punch');
                }
                else if(seat.status == 1){ //running order table
                    
                    var confirmPopup = $ionicPopup.confirm({
                        cssClass: 'popup-outer confirm-alert-alternate',
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
                var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : 'NAVALUR'; 
                if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                  var alertPopup = $ionicPopup.alert({
                                            cssClass: 'popup-outer confirm-alert-view',
                                            title: 'Invalid Licence Error',
                                            template: '<p style="padding: 20px 0px; color: #444; margin: 0; font-size: 15px; font-weight: 400;">KOT can not be opened. Please contact Accelerate Support if problem persists.</p>'
                                        });
                  return '';
                }


                    var kot_request_data = accelerate_licencee_branch +"_KOT_"+ seat.KOT;

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

                            $state.go('main.app.punch');
                        }
                        else{
                                var alertPopup = $ionicPopup.alert({
                                    cssClass: 'popup-outer confirm-alert-view',
                                    title: 'Not Found Error',
                                    template: '<p style="padding: 20px 0px; color: #444; margin: 0; font-size: 15px; font-weight: 400;">#'+kotID+' not found on Server. Please contact Accelerate Support.</p>'
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



    })

    .controller('PunchCtrl', function(ShoppingCartService, currentGuestData, kitchen_comments, $timeout, $ionicLoading, $ionicPopup, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicPopover, $ionicSideMenuDelegate) {


    	var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@127.0.0.1:5984/';


    	if(window.localStorage.serverURL == '' || !window.localStorage.serverURL){
    		
    	}
    	else{
    		COMMON_IP_ADDRESS = window.localStorage.serverURL;
    	}	

        $scope.kitchenComments = kitchen_comments;

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


        //Receiving Broadcast - If Filter Applied
        $rootScope.$on('filter_applied', function(event, filter) {
            window.localStorage.customFilter = JSON.stringify(filter);
            $scope.reinitializeMenu();
        });


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

                    $http({
                        method: 'GET',
                        url: COMMON_IP_ADDRESS+'accelerate_settings/ACCELERATE_STAFF_PROFILES',
                        timeout: 10000
                    })
                    .success(function(response) {
                        $scope.allProfileData = response.value;

                        //Render Template
                        var i = 0;
                        var choiceTemplate = '<div style="margin-top: 10px">';
                        while (i < $scope.allProfileData.length) {
                            choiceTemplate = choiceTemplate + '<button class="button button-full" style="text-align: left; color: #c52031; margin-bottom: 8px;" ng-click="selectProfileFromWindow(\'' + $scope.allProfileData[i].name + '\', ' + $scope.allProfileData[i].code + ', \''+$scope.allProfileData[i].role+'\')">' + $scope.allProfileData[i].name + ' </button>';
                            i++;
                        }
                        choiceTemplate = choiceTemplate + '</div>';

                        var newCustomPopup = $ionicPopup.show({
                            cssClass: 'popup-outer new-shipping-address-view',
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

        $scope.guestData.name = temp_name;
        $scope.guestData.mobile = temp_mobile;
        $scope.guestData.count = temp_count;

        currentGuestData.setGuest(temp_name, temp_mobile, temp_count);

        $scope.guest_modal.hide();
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
        console.log($scope.guestData)
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
        $scope.help_modal = modal;
      });

      $scope.openItemDetails = function(itemData){

      	if(!itemData.isAvailable){
      		$ionicLoading.show({ template: "<b>"+itemData.name+"</b> is out of stock", duration: 1000 });
      		return "";
      	}

        $scope.myItem = itemData;
        $scope.help_modal.show();
      };

      $scope.addItemProcess = function(){

        var processed_item = {
        	"code" : $scope.myItem.code,
        	"name" : $scope.myItem.name,
        	"category" : $scope.renderingSubMenu,
        	"isCustom" : $scope.myItem.isCustom,
        	"comments" : $scope.myItem.comment,
        	"qty" : $scope.myItem.qty
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

        ShoppingCartService.addProduct(processed_item);
        $scope.help_modal.hide();

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








        $scope.navToggled = false;

        $scope.showOptionsMenu = function() {
            console.log('toggle sidemenu...', $scope.navToggled)
            $ionicSideMenuDelegate.toggleLeft();
            $scope.navToggled = !$scope.navToggled;
        };



        // Making request to server to fetch-menu
        var init = $scope.reinitializeMenu = function() {

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

                        $scope.renderFailed = false;
                        $scope.isRenderLoaded = true;
                    })
                    .error(function(data) {

                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });

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
                    //No results
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

                                $scope.subMenuList = chunk(short_listed, 2);
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
                        cssClass: 'popup-outer confirm-alert-alternate',
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
                        cssClass: 'popup-outer confirm-alert-alternate',
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
                var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : 'NAVALUR'; 
                if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                  var alertPopup = $ionicPopup.alert({
                                            cssClass: 'popup-outer confirm-alert-view',
                                            title: 'Invalid Licence Error',
                                            template: '<p style="padding: 20px 0px; color: #444; margin: 0; font-size: 15px; font-weight: 400;">KOT can not be opened. Please contact Accelerate Support if problem persists.</p>'
                                        });
                  return '';
                }


                    var kot_request_data = accelerate_licencee_branch +"_KOT_"+ seat.KOT;

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
                        }
                        else{
                                var alertPopup = $ionicPopup.alert({
                                    cssClass: 'popup-outer confirm-alert-view',
                                    title: 'Not Found Error',
                                    template: '<p style="padding: 20px 0px; color: #444; margin: 0; font-size: 15px; font-weight: 400;">#'+kotID+' not found on Server. Please contact Accelerate Support.</p>'
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

        $scope.table_modal.hide();
    }







    //SEARCH
    $scope.isSearching = false;
    $scope.search = {};
    $scope.search.query = "";

    $scope.startSearching = function(){
            $scope.isSearching = true;
            $scope.allSearchItemsList = [];

            for(var n = 0; n < $scope.menu.length; n++){
                $scope.allSearchItemsList = $scope.allSearchItemsList.concat($scope.menu[n].items);
            } 

            $scope.allSearchItemsList.sort(function(itemOne, itemTwo) {
                return itemOne.name.localeCompare(itemTwo.name);
            });  

            //document.getElementById("menu_search_input").focus();
    }

    $scope.resetSearch = function(){
        $scope.isSearching = false;
        $scope.search.query = "";
    }



        //Unavailable features
        $scope.notAvailable = function(text){
            $ionicLoading.show({
                template: text,
                duration: 3000
            });                 
        }



})



    .controller('FeedCtrl', function(outletService, menuService, locationChangeRouteTrackerService, $ionicLoading, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicSideMenuDelegate, ShoppingCartService) {
    

        $scope.getProductsInCart = function() {
            return ShoppingCartService.getProducts().length;
        };

        if (!_.isUndefined(window.localStorage.user)) {
            $scope.isEnrolledFlag = JSON.parse(window.localStorage.user).isRewardEnabled;
        } else {
            $scope.isEnrolledFlag = false;
        }


        $scope.selectedOutlet = outletService.getInfo();


        $scope.navToggled = false;

        $scope.showOptionsMenu = function() {
            $ionicSideMenuDelegate.toggleLeft();
            $scope.navToggled = !$scope.navToggled;
        };


        $scope.outletSelection = outletService.getInfo();
        if ($scope.outletSelection.outlet == "") {
            $myOutlet = "VELACHERY";
        } else {
            $myOutlet = $scope.outletSelection.outlet;
        }

        $scope.callSearch = function() {

                //Check if already cached
                var isCached = menuService.getIsLoadedFlag('SEARCH');
                if(isCached){
                            
                            $scope.searchMenuData = JSON.parse(window.localStorage.menuSearchCache);
                    
                            if ($scope.searchMenuData.length == 0) {
                                $scope.isEmpty = true;
                            } else {
                                $scope.isEmpty = false;
                            }

                            $rootScope.$broadcast('search_called', true);
                            $rootScope.$emit('search_called', true);
                }
                else{

                    $ionicLoading.show();

                    //Fetch Data for Search
                    $http({
                            method: 'GET',
                            url: 'https://www.zaitoon.online/services/fetchmenuallmob.php?outlet='+$myOutlet,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            timeout: 10000
                        })
                        .success(function(response) {

                            $ionicLoading.hide();

                            $scope.searchMenuData = response;
                            if ($scope.searchMenuData.length == 0) {
                                $scope.isEmpty = true;
                            } else {
                                $scope.isEmpty = false;
                            }

                            $rootScope.$broadcast('search_called', true);
                            $rootScope.$emit('search_called', true);

                            window.localStorage.menuSearchCache = JSON.stringify($scope.searchMenuData);
                            menuService.setLoadFlag('SEARCH', true);

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





    })




 .controller('ShoppingCartCtrl', function(products, currentGuestData, billing_modes, billing_parameters, $http, $scope, $ionicLoading, $ionicModal, $state, $rootScope, $ionicActionSheet, ShoppingCartService) {


    var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@127.0.0.1:5984/';


 	$scope.products = products;
    var cart_products = products;

    $scope.hasUnsavedChanges = false;
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



    //Clear all info after placing order
    $scope.orderPostClearData = function(){
        ShoppingCartService.clearCartToEmpty();
        $state.go('main.app.punch');
        window.localStorage.current_table_selection = '';
    }



    //Send KOT
    $scope.sendKOTToServer = function(){
         
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

                            sendKOTToServerAfterProcess(cartExtrasList) 

                        }
                        else{
                                var alertPopup = $ionicPopup.alert({
                                    cssClass: 'popup-outer confirm-alert-view',
                                    title: 'Not Found Error',
                                    template: '<p style="padding: 20px 0px; color: #444; margin: 0; font-size: 15px; font-weight: 400;">Billing Parameters not found on Server. Please contact Accelerate Support.</p>'
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
                          var time = moment().format('hhmm');

                          var specialRemarksInfo = window.localStorage.specialRequests_comments ? window.localStorage.specialRequests_comments : '';
                          var allergyData = window.localStorage.allergicIngredientsData ? JSON.parse(window.localStorage.allergicIngredientsData) : [];

                          var obj = {}; 
                          obj.KOTNumber = "";
                          obj.orderDetails = orderMetaInfo;
                          obj.table = $scope.selectedTable;

                          obj.customerName = guestData.name;
                          obj.customerMobile = guestData.mobile; 
                          obj.guestCount = guestData.count && guestData.count != null ? parseInt(guestData.count) : 0;
                          obj.machineName = window.localStorage.accelerate_licence_machine_id && window.localStorage.accelerate_licence_machine_id != '' ? window.localStorage.accelerate_licence_machine_id : 'TAPS_APP';
                          
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


                          var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@127.0.0.1:5984/';
                                
                          //LOADING
                          $ionicLoading.show({
                            template:  '<ion-spinner></ion-spinner>'
                          });

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
                                        $ionicLoading.show({
                                            template: "Success! Order has been placed.",
                                            duration: 3000
                                        });

                                        $scope.orderPostClearData();
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
       

        //fetch the first KOT
        if(!runningKOTNumber || runningKOTNumber == '' || runningKOTNumber == undefined){

            $ionicLoading.show({
                template: "Not responding. Check your connection.",
                duration: 3000
            });

            return '';
        }


                //Set _id from Branch mentioned in Licence
                var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : 'NAVALUR'; 
                if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                  var alertPopup = $ionicPopup.alert({
                                            cssClass: 'popup-outer confirm-alert-view',
                                            title: 'Invalid Licence Error',
                                            template: '<p style="padding: 20px 0px; color: #444; margin: 0; font-size: 15px; font-weight: 400;">KOT can not be opened. Please contact Accelerate Support if problem persists.</p>'
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
                                            cssClass: 'popup-outer confirm-alert-view',
                                            title: 'Not Found Error',
                                            template: '<p style="padding: 20px 0px; color: #444; margin: 0; font-size: 15px; font-weight: 400;">Billing Parameters not found on Server. Please contact Accelerate Support.</p>'
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
                                    cssClass: 'popup-outer confirm-alert-view',
                                    title: 'Not Found Error',
                                    template: '<p style="padding: 20px 0px; color: #444; margin: 0; font-size: 15px; font-weight: 400;">#'+kotID+' not found on Server. Please contact Accelerate Support.</p>'
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


                function sendAppendedKOT(originalKOT, selectedModeExtras){

                      var new_updated_cart = !_.isUndefined(window.localStorage.accelerate_cart) ? JSON.parse(window.localStorage.accelerate_cart) : [];


                      originalKOT.timeKOT = moment().format('hhmm');
                      originalKOT.guestCount = originalKOT.guestCount && originalKOT.guestCount != null && originalKOT.guestCount != '' ? parseInt(originalKOT.guestCount) : 0;
                      originalKOT.cart = new_updated_cart;

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
                                    $ionicLoading.show({
                                        template: "Success! Order has been placed.",
                                        duration: 3000
                                    });

                                    $scope.orderPostClearData();
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



.controller('FiltersCtrl', function($scope, $state, $rootScope, $ionicSlideBoxDelegate) {

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




.controller('AppCtrl', function(changeSlotService, $ionicSideMenuDelegate, $scope, $ionicPopup, ionicTimePicker, ionicDatePicker, $state, $http, $ionicPopover, $ionicLoading, $timeout, mappingService, currentBooking) {


})



;