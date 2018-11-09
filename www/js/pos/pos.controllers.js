angular.module('pos.controllers', ['ionic'])


    .controller('OrdersCtrl', function(outletService, menuService, locationChangeRouteTrackerService, $ionicLoading, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicSideMenuDelegate, ShoppingCartService) {
        
    })

    .controller('OrdersRunningCtrl', function(outletService, menuService, locationChangeRouteTrackerService, $ionicLoading, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicSideMenuDelegate, ShoppingCartService) {
        
    })

    .controller('OrdersTablesCtrl', function(outletService, menuService, locationChangeRouteTrackerService, $ionicLoading, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicSideMenuDelegate, ShoppingCartService) {
        
    })

    .controller('PunchCtrl', function(ShoppingCartService, $timeout, $ionicLoading, $ionicPopup, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicPopover, $ionicSideMenuDelegate) {


    	let COMMON_IP_ADDRESS = 'http://192.168.1.2:5984/';

    	if(window.localStorage.serverURL == '' || !window.localStorage.serverURL){
    		
    	}
    	else{
    		COMMON_IP_ADDRESS = window.localStorage.serverURL;
    	}	


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
                        url: COMMON_IP_ADDRESS+'zaitoon_settings/ZAITOON_MASTER_MENU',
                        timeout: 10000
                    })
                    .success(function(response) {

                    	console.log(response)

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

                    console.log($scope.allItemsList)
                    $scope.isRenderingItems = true;

                    break;
                }

                if(n == $scope.menu.length - 1){
                    //No results
                }
            }
        }


        $scope.openCorresponsingMainMenu = function(target){
            $scope.shortlistMainMenu = target;            
            
            //filter sub categories for say Arabian
            var temp_data = JSON.parse('{"_id":"ZAITOON_MENU_CATEGORIES","_rev":"25-6558009cc87f33b6b169ab3463074f8d","identifierTag":"ZAITOON_MENU_CATEGORIES","value":["Hummus & Salads","Arabian Rices","Grills & Barbeques","Tawa Kababs","Chinese Veg. Dry/Gravy","Chinese Chicken Gravy","Soups","Chinese Vegitarian Starters","Chinese Chicken Starters","Chinese SeaFood Starters","Fried Rice","Noodles","Chinese SeaFood Gravy","Lamb Dry Dishes","Chinese Macaroni","Rolls & Fries","Tandoor Starters","Egg Main Course","Indian Breads","Biriyani & Pulao","Raita & Pappad","Indian Veg. Main Course","Indian Mutton Main Course","Indian Chicken Main Course","Indian SeaFood Main Course","Milk Shakes","Ice Creams","Faloodas","Fruit Creams","Fresh Juices","Soft  Drinks","Hot Beverages","Grilled Sandwiches","Arabian Gravies","Combos","Shawarma","sizzlers","Temporary"]}')
            
            function chunk(arr, size) {
              var newArr = [];
              for (var i=0; i<arr.length; i+=size) {
                newArr.push(arr.slice(i, i+size));
              }
              return newArr;
            }

            $scope.subMenuList = chunk(temp_data.value, 2);
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

      	console.log('opening...')

	                $ionicLoading.show({
	                    template: '<ion-spinner></ion-spinner> Loading Tables...'
	                });

	                //FIRST LOAD
	              	$scope.renderTableFailed = false;
	               	$scope.isRenderTableLoaded = false;

	               	//Table Sections
                    $http({
                        method: 'GET',
                        url: 'https://www.zaitoon.online/services/fetchoutlets.php',
                        timeout: 10000
                    })
                    .success(function(data) {

								var sam_data1 = JSON.parse('{ "_id": "ZAITOON_TABLE_SECTIONS", "_rev": "19-4f024b3cfc35cbac381bb5c3151b40ef", "identifierTag": "ZAITOON_TABLE_SECTIONS", "value": [ "Main" ] }');
								var sections_list = sam_data1.value;

                    			//Tables
			                    $http({
			                        method: 'GET',
			                        url: 'https://www.zaitoon.online/services/fetchoutlets.php',
			                        timeout: 10000
			                    })
			                    .success(function(data) {	

			                    	$ionicLoading.hide();

			                    	var sam_data = JSON.parse('{ "_id": "ZAITOON_TABLES_MASTER", "_rev": "1843-2916fd2b4d73ea6207a87222b9af3f7e", "identifierTag": "ZAITOON_TABLES_MASTER", "value": [ { "table": "1", "capacity": 4, "type": "Main", "assigned": "", "KOT": "K54", "status": 1, "lastUpdate": "1153", "sortIndex": 1, "remarks": "" }, { "table": "2", "remarks": "", "capacity": 4, "type": "Main", "assigned": "", "KOT": "K53", "status": 1, "lastUpdate": "1342", "sortIndex": 2 }, { "table": "3", "remarks": "", "capacity": 4, "type": "Main", "sortIndex": 3, "KOT": "K50", "status": 1, "lastUpdate": "0445", "assigned": "" }, { "table": "4", "remarks": "", "capacity": 4, "type": "Main", "sortIndex": 4, "KOT": "K52", "status": 1, "lastUpdate": "0445", "assigned": "" }, { "table": "5", "remarks": "", "capacity": 4, "type": "Main", "sortIndex": 5, "KOT": "", "status": 0, "lastUpdate": "", "assigned": "" } ] }');
			                    	var tables_list = sam_data.value;

			                    	console.log(tables_list)


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

			                    				console.log($scope.tablesMasterList)
			                    			}
			                    		}
			                    		n++;
			                    	}



			                    	$scope.renderTableFailed = false;
			                        $scope.isRenderTableLoaded = true;

			                        $scope.table_modal.show();
			                    })
			                    .error(function(data) {

			                    	$ionicLoading.hide();

			                        $ionicLoading.show({
			                            template: "Not responding. Check your connection.",
			                            duration: 3000
			                        });

			                        $scope.renderTableFailed = true;
			                    });

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




 .controller('ShoppingCartCtrl', function(products, billing_modes, billing_parameters, $scope, $ionicLoading, $ionicModal, $state, $rootScope, $ionicActionSheet, ShoppingCartService) {

 	$scope.products = products;
 	

    //Billing Modes
    $scope.billingModes = billing_modes;
    $scope.billingParameters = billing_parameters;


    console.log($scope.billingModes)

    $scope.billingModesDine = [];
    var k = 0;
    while($scope.billingModes[k]){
    	if($scope.billingModes[k].type == 'DINE'){
    		$scope.billingModesDine.push($scope.billingModes[k]);
    	}

    	console.log($scope.selectedBillingMode)

    	k++;
    }

    $scope.selectedBillingMode = $scope.billingModesDine[0];
    $scope.selectedTable = null;

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
        $scope.calculateExtrasList();
    });

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



    //Send KOT
    $scope.sendKOT = function(){

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