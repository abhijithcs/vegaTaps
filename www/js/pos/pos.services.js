angular.module('pos.services', [])

.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
})


.service('currentGuestData', function ($http, $rootScope, $q){
  
  var guestName = '';
  var guestMobile = '';
  var guestCount = '';

  /* For Closure */ 
  this.getGuest = function(){

    var guestObject = {
      "name" : guestName,
      "mobile" : guestMobile,
      "count" : guestCount
    }

    return guestObject;
  }

  this.setGuest = function(name, mobile, count){

    if(count == null || count == ''){
      count = 0;
    }

    var formatted_phone = Number(mobile);

    if(formatted_phone == NaN || formatted_phone == 0){
      formatted_phone = '';
    }

    guestName = name.toUpperCase();
    guestMobile = formatted_phone;
    guestCount = count;

    var guestObject = {
      "name" : guestName,
      "mobile" : guestMobile,
      "count" : guestCount
    }

    $rootScope.$broadcast('guest_updated', guestObject);
    $rootScope.$emit('guest_updated', guestObject);
  }

  this.clearGuest = function(){
    guestName = '';
    guestMobile = '';
    guestCount = '';  

    var guestObject = {
      "name" : guestName,
      "mobile" : guestMobile,
      "count" : guestCount
    }

    $rootScope.$broadcast('guest_updated', guestObject);
    $rootScope.$emit('guest_updated', guestObject);  
  }

})






.service('menuContentService', function ($http, $q){
  
  //Default Parameters
  var menu = [];
  var itemsList = [];

  this.setMenu = function(menuData){

            var items_listed = [];
            
            for(var n = 0; n < menuData.length; n++){

                var sub_list_of_items = menuData[n].items;
                
                var q = 0;
                while(sub_list_of_items[q]){
                  sub_list_of_items[q].category = menuData[n].category;
                  q++;
                }

                items_listed = items_listed.concat(sub_list_of_items);
            } 

            items_listed.sort(function(itemOne, itemTwo) {
                return itemOne.name.localeCompare(itemTwo.name);
            });  

            itemsList = items_listed;
            menu = menuData;
  }

  this.getMenu = function(){
    return menu;
  }  

  this.getMenuItems = function(){
    return itemsList;
  }
})



.service('LocationService', function($q){
  var autocompleteService = new google.maps.places.AutocompleteService();
  var detailsService = new google.maps.places.PlacesService(document.createElement("input"));

  return {
    searchAddress: function(input) {

      var deferred = $q.defer();

      autocompleteService.getPlacePredictions({
        input: input,
        componentRestrictions: {country: 'in'}
      }, function(result, status) {
        if(status == google.maps.places.PlacesServiceStatus.OK){
          deferred.resolve(result);
        }else{
          deferred.reject(status)
        }
      });

      return deferred.promise;
    },
    getDetails: function(placeId) {
      var deferred = $q.defer();
      detailsService.getDetails({placeId: placeId}, function(result) {
        deferred.resolve(result);
      });
      return deferred.promise;
    }
  };
})

.directive('locationSuggestion', function($ionicModal, LocationService, userLocationService){
  return {
    restrict: 'A',
    scope: {
      location: '='
    },
    link: function($scope, element){
      $scope.search = {};
      $scope.search.suggestions = [];
      $scope.search.query = "";
      $ionicModal.fromTemplateUrl('views/common/partials/google-place-suggestions-modal.html', {
        scope: $scope,
        focusFirstInput: true
      }).then(function(modal) {
        $scope.modal = modal;
      });
      element[0].addEventListener('focus', function(event) {
        $scope.open();
      });
      $scope.$watch('search.query', function(newValue) {
        if (newValue) {
          LocationService.searchAddress(newValue).then(function(result) {
            $scope.search.error = null;
            $scope.search.suggestions = result;
          }, function(status){
            if(status == 'ZERO_RESULTS'){
              $scope.search.error = "No matching places found";
            }
            else{
              $scope.search.error = "Something went wrong";
            }
            
          });
        };
        $scope.open = function() {
          $scope.modal.show();
        };
        $scope.close = function() {
          $scope.modal.hide();
        };
        $scope.choosePlace = function(place) {
          LocationService.getDetails(place.place_id).then(function(location) {
            userLocationService.setCoords(location.geometry.location.lat(), location.geometry.location.lng());
            userLocationService.setText(location.name);
            $scope.location = location;
            $scope.close();
          });
        };
      });
    }
  }
})



.service('couponService', function () {
        var couponLock = false;
        var couponApplied = '';
        var discount = 0;

        return {
          getDiscount: function () {
            return discount;
          },
          setDiscount: function (value) {
            discount = value;
          },
          getStatus: function () {
              return couponLock;
          },
          setStatus: function(value) {
              couponLock = value;
          },
          getCoupon: function () {
                return couponApplied;
          },
          setCoupon: function(value) {
              couponApplied = value;
          }
        };
})

.service('CheckoutService', function ($http, $q){

  //Type of Order : Delivery OR Take away
  var checkoutMode = 'delivery';
  this.getCheckoutMode = function(){
    return checkoutMode;
  }
  this.setCheckoutMode = function(value){
    checkoutMode = value;
  }

  this.getUserShippingAddresses = function(){
    var dfd = $q.defer();

    var data = {};
    data.token = JSON.parse(window.localStorage.user).token;

    $http({
      method  : 'POST',
      url     : 'http://www.zaitoonrestaurant.com/services/fetchusers.php',
      data    : data,
      headers : {'Content-Type': 'application/x-www-form-urlencoded'}
     })
    .then(function(response) {
      dfd.resolve(response.data.savedAddresses);
    });

    return dfd.promise;
  };

  this.saveUserSelectedCard = function(card){
    window.localStorage.accelerateVegaTaps_selected_card = JSON.stringify(card);
  }
  this.saveUserSelectedAddress = function(address){
    window.localStorage.accelerateVegaTaps_selected_address = JSON.stringify(address);
  }
  this.getUserSelectedCard = function(){
    return JSON.parse(window.localStorage.accelerateVegaTaps_selected_card || '[]');
  };
  this.getUserSelectedAddress = function(){
    return JSON.parse(window.localStorage.accelerateVegaTaps_selected_address || '[]');
  };
})



.service('menuService', function ($http, $q){

  //Default Parameters
  var displayMenuType = "ARABIAN";

  var isArabianLoaded = false;
  var isChineseLoaded = false;
  var isIndianLoaded = false;
  var isDessertLoaded = false;

  var isSearchLoadedOnce = false;

  this.setDisplayMenuType = function(menutype){
    displayMenuType = menutype;
  }

  this.resetAll = function(){
     isArabianLoaded = false;
     isChineseLoaded = false;
     isIndianLoaded = false;
     isDessertLoaded = false;
  }

  this.setLoadFlag = function(type, flag){
    if(type == 'ARABIAN'){
      isArabianLoaded = flag;
    }
    else if(type == 'CHINESE'){
      isChineseLoaded = flag;
    }
    else if(type == 'INDIAN'){
      isIndianLoaded = flag;
    }
    else if(type == 'DESSERT'){
      isDessertLoaded = flag;
    }
    else if(type == 'SEARCH'){
      isSearchLoadedOnce = flag;
    }
  }

  this.getDisplayMenuType = function(){
    return displayMenuType;
  }

  this.getIsLoadedFlag = function(menutype){
    if(menutype == 'ARABIAN'){
      return isArabianLoaded;
    }
    else if(menutype == 'CHINESE'){
      return isChineseLoaded;
    }
    else if(menutype == 'INDIAN'){
      return isIndianLoaded;
    }
    else if(menutype == 'DESSERT'){
      return isDessertLoaded;
    }
    else if(menutype == 'SEARCH'){
      return isSearchLoadedOnce;
    }
  }

})





.service('ShoppingCartService', function ($http, $q, $rootScope){

  var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@localhost:5984/';

  //Billing Modes
  this.getBillingModes = function(){
    var dfd = $q.defer();

    $http({
      method  : 'GET',
      url     : COMMON_IP_ADDRESS + 'accelerate_settings/ACCELERATE_BILLING_MODES',
      timeout : 3000
     })
    .success(function(response) {
      dfd.resolve(response.value);
    })
    .error(function(response) {
      dfd.resolve([]);
    });

    return dfd.promise;
  };  


  this.getBillingParameters = function(){
    var dfd = $q.defer();

    $http({
      method  : 'GET',
      url     : COMMON_IP_ADDRESS + 'accelerate_settings/ACCELERATE_BILLING_PARAMETERS',
      timeout : 3000
     })
    .success(function(response) {
      dfd.resolve(response.value);
    })
    .error(function(response) {
      dfd.resolve([]);
    });

    return dfd.promise;
  };  


  this.getComments = function(){
    var dfd = $q.defer();

    $http({
      method  : 'GET',
      url     : COMMON_IP_ADDRESS + 'accelerate_settings/ACCELERATE_SAVED_COMMENTS',
      timeout : 3000
     })
    .success(function(response) {
      
      var my_data = response.value;
      //my_data.sort();
      
      dfd.resolve(my_data);
    })
    .error(function(response) {
      dfd.resolve([]);
    });

    return dfd.promise;
  };  



  this.getProducts = function(){
    return JSON.parse(window.localStorage.accelerate_cart || '[]');
  };

  this.clearCartToEmpty = function(){
    window.localStorage.removeItem('accelerate_cart');
    window.localStorage.edit_KOT_originalCopy = '';
    window.localStorage.hasUnsavedChangesFlag = 0;
    
    var cart_products = [];
  
    $rootScope.$broadcast('cart_updated', cart_products);
    $rootScope.$emit('cart_updated', cart_products);
  };

  this.clearCartItems = function(){
    window.localStorage.removeItem('accelerate_cart');
    
    var cart_products = [];
  
    $rootScope.$broadcast('cart_updated', cart_products);
    $rootScope.$emit('cart_updated', cart_products);
  }


  this.updatedProducts = function(products){
    //window.localStorage.accelerate_cart = JSON.stringify(products);

    $rootScope.$broadcast('cart_updated', products);
  };

  this.addProduct = function(productToAdd, priority_flag){

    //If priority_flag is enabled, item will be pinned to top of the KOT

    var cart_products = !_.isUndefined(window.localStorage.accelerate_cart) ? JSON.parse(window.localStorage.accelerate_cart) : [];

    var maxCartIndex = 0;

    if(cart_products.length > 0){
      var t = 0;
      while(cart_products[t]){
        if(cart_products[t].cartIndex >= maxCartIndex){
          maxCartIndex = cart_products[t].cartIndex;
        }
        t++;
      }
    }

      productToAdd.cartIndex = maxCartIndex + 1;

      productToAdd.priorityIndex = priority_flag ? 1 : 0;

      //Serve First comment if priority_flag enabled
      if(priority_flag){
        productToAdd.comments = productToAdd.comments ? productToAdd.comments + "- FIRST" : "FIRST";
      }
      
      cart_products.push(productToAdd);

      cart_products.sort(function(item1, item2) {
        return item2.priorityIndex - item1.priorityIndex; //Sorting based on Priority Index
      });

      $rootScope.$broadcast('cart_updated', cart_products);
      $rootScope.$emit('cart_updated', cart_products);


    window.localStorage.accelerate_cart = JSON.stringify(cart_products);
    $rootScope.$broadcast('cart_updated', cart_products);

    //animateCartIcon();
  };


  this.updateComments = function(itemIndex, newComments){

    var cart_products = !_.isUndefined(window.localStorage.accelerate_cart) ? JSON.parse(window.localStorage.accelerate_cart) : [];

    if(cart_products.length > 0){
      var t = 0;
      while(cart_products[t]){
        if(cart_products[t].cartIndex == itemIndex){
          cart_products[t].comments = newComments && newComments != undefined ? newComments : '';
          break;
        }
        t++;
      }
    }


    $rootScope.$broadcast('cart_updated', cart_products);
    $rootScope.$emit('cart_updated', cart_products);


    window.localStorage.accelerate_cart = JSON.stringify(cart_products);
    $rootScope.$broadcast('cart_updated', cart_products);
    
  };


  this.lessProduct = function(cart_index){

    var cart_products = JSON.parse(window.localStorage.accelerate_cart);
    
    for(var i = 0; i < cart_products.length; i++){
      if(cart_products[i].cartIndex == cart_index){
            if(cart_products[i].qty > 1)
              cart_products[i].qty--;
            break;
      }
    }

    window.localStorage.accelerate_cart = JSON.stringify(cart_products);
    $rootScope.$broadcast('cart_updated', cart_products);
  };


  this.moreProduct = function(cart_index){
    
    var cart_products = JSON.parse(window.localStorage.accelerate_cart);
      
    for(var i = 0; i < cart_products.length; i++){
      if(cart_products[i].cartIndex == cart_index){
        cart_products[i].qty++;
        break;
      }
    }

    window.localStorage.accelerate_cart = JSON.stringify(cart_products);
    $rootScope.$broadcast('cart_updated', cart_products);
  };

  this.removeProduct = function(cart_index){

    var cart_products = JSON.parse(window.localStorage.accelerate_cart);
    
    var new_cart_products = _.reject(cart_products, function(product){
        return (product.cartIndex == cart_index);
    });
    
    window.localStorage.accelerate_cart = JSON.stringify(new_cart_products);
    $rootScope.$broadcast('cart_updated', new_cart_products);

  };

  function animateCartIcon(){
    var x = document.getElementById("cart-image-icon");
    x.classList.remove("pulseCart");
    setTimeout(function(){ x.classList.add("pulseCart"); }, 100);
    setTimeout(function(){ x.classList.remove("pulseCart"); }, 1000);
  }


})


;
