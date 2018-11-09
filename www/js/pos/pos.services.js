angular.module('pos.services', [])


.service('OutletFetchService', function ($http, $q){
  this.getOutlet = function(code){
    var dfd = $q.defer();
    $http.get('https://www.zaitoon.online/services/fetchoutlets.php?outletcode='+code).success(function(data) {
      dfd.resolve(data.response);
    });
    return dfd.promise;
  };
})

.service('outletWarningStatusService', function ($http, $q){
  var isWarningPrefered = true;
  var isDelayWarningPrefered = true;

  /* For Closure */ 
  this.getStatus = function(){
    return isWarningPrefered;
  }

  this.clearWarning = function(){
    isWarningPrefered = false;
  }


  /* For Delay */
  this.getDelayStatus = function(){
    return isDelayWarningPrefered;
  }

  this.clearDelayWarning = function(){
    isDelayWarningPrefered = false;
  }

  this.reset = function(){
    isWarningPrefered = true;
    isDelayWarningPrefered = true;
  }

})


.service('outletService', function ($http, $q){

  //Default Parameters
  var outlet = "";
  var paymentKey = "";
  var onlyTakeAway = false;
  var isSpecial = false;
  var city = "";
  var location = "";
  var locationCode = "";

  var isAcceptingOnlinePayment = true;
  var isOpen = true;

  var isDelayed = false;
  var delayMessage = '';
  var closureMessage = '';

  var isTaxCollected = true;
  var taxPercentage = 0.02;

  var isParcelCollected = true;
  var parcelPercentageDelivery = 0.05;
  var parcelPercentagePickup = 0.03;

  var minAmount = 300;
  var minTime = 45;

  this.setOutletInfo = function(info){
    outlet = info.outlet;
    onlyTakeAway = info.onlyTakeAway;
    isSpecial = info.isSpecial;
    city = info.city;
    location = info.location;
    locationCode = info.locationCode;
    isAcceptingOnlinePayment = info.isAcceptingOnlinePayment;
    isOpen = info.isOpen;
    paymentKey = info.paymentKey;
    isTaxCollected = info.isTaxCollected;
    taxPercentage = info.taxPercentage;
    isParcelCollected = info.isParcelCollected;
    parcelPercentageDelivery = info.parcelPercentageDelivery;
    parcelPercentagePickup = info.parcelPercentagePickup;
    minAmount = info.minAmount;
    minTime = info.minTime;

    isDelayed = info.isDelayed;
    delayMessage = info.delayMessage;
    closureMessage = info.closureMessage;
  }

  this.getInfo = function(){
    var data = {
      "outlet":outlet,
      "onlyTakeAway":onlyTakeAway,
      "isSpecial": isSpecial,
      "city":city,
      "location":location,
      "locationCode":locationCode,
      "isTaxCollected": isTaxCollected,
      "taxPercentage": taxPercentage,
      "isParcelCollected":isParcelCollected,
      "parcelPercentageDelivery": parcelPercentageDelivery,
      "parcelPercentagePickup": parcelPercentagePickup,
      "minTime": minTime,
      "minAmount": minAmount,
      "isAcceptingOnlinePayment": isAcceptingOnlinePayment,
      "isOpen": isOpen,
      "paymentKey": paymentKey,
      "isDelayed": isDelayed,
      "delayMessage": delayMessage,
      "closureMessage": closureMessage
    }
    return data;
  }

})



.service('userLocationService', function ($http, $q){
  
  //Default Parameters
  var latitude = "";
  var longitude = "";

  var locationText = "";

  this.setCoords = function(lat, lng){
    latitude = lat;
    longitude = lng;
  }

  this.getCoords = function(){
    var data = {
      "lat":latitude,
      "lng":longitude
    }
    return data;
  }  

  this.setText = function(loc){
    locationText = loc;
  }

  this.getText = function(){
    return locationText;
  }

})

.service('locationChangeRouteTrackerService', function ($http, $q){
  
  //Default Parameters
  var source = "";

  this.setSource = function(src){
    source = src;
  }

  this.getSource = function(){
    return source;
  }  

  this.reset = function(){
    source = "";
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
        console.log(result)
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
    console.log('Setting Value..'+value)
    checkoutMode = value;
  }

  this.getUserShippingAddresses = function(){
    var dfd = $q.defer();

    var data = {};
    data.token = JSON.parse(window.localStorage.user).token;

    $http({
      method  : 'POST',
      url     : 'https://www.zaitoon.online/services/fetchusers.php',
      data    : data,
      headers : {'Content-Type': 'application/x-www-form-urlencoded'}
     })
    .then(function(response) {
      dfd.resolve(response.data.savedAddresses);
    });

    return dfd.promise;
  };

  this.saveUserSelectedCard = function(card){
    window.localStorage.zaitoonFirst_selected_card = JSON.stringify(card);
  }
  this.saveUserSelectedAddress = function(address){
    window.localStorage.zaitoonFirst_selected_address = JSON.stringify(address);
  }
  this.getUserSelectedCard = function(){
    return JSON.parse(window.localStorage.zaitoonFirst_selected_card || '[]');
  };
  this.getUserSelectedAddress = function(){
    return JSON.parse(window.localStorage.zaitoonFirst_selected_address || '[]');
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

  //Billing Modes
  this.getBillingModes = function(){
    var dfd = $q.defer();

    var data = {};
    data.token = "MALA";

    $http({
      method  : 'POST',
      url     : 'https://www.zaitoon.online/services/fetchusers.php',
      data    : data,
      headers : {'Content-Type': 'application/x-www-form-urlencoded'}
     })
    .then(function(response) {
      var sample_data = JSON.parse('{"_id":"ZAITOON_BILLING_MODES","_rev":"57-1d5355fa14406fe6439f0c85f61ed249","identifierTag":"ZAITOON_BILLING_MODES","value":[{"name":"Dine In","isDiscountable":true,"type":"DINE","maxDiscount":2000,"extras":[{"name":"SGST","value":"3.50"},{"name":"CGST","value":"2.50"}]},{"name":"Delivery - Zatioon App","isDiscountable":true,"type":"DELIVERY","maxDiscount":2000,"extras":[{"name":"CGST","value":"2.50"},{"name":"SGST","value":"2.50"},{"name":"Parcel Charges","value":"7.00"}]},{"name":"Delivery - Phone","isDiscountable":true,"type":"DELIVERY","maxDiscount":2000,"extras":[{"name":"CGST","value":"2.50"},{"name":"SGST","value":"2.50"},{"name":"Parcel Charges","value":"7.00"}]},{"name":"Takeaway - Zatioon App","isDiscountable":true,"type":"PARCEL","maxDiscount":2000,"extras":[{"name":"SGST","value":"2.50"},{"name":"CGST","value":"2.50"},{"name":"Parcel Charges","value":"5.00"}]},{"name":"Swiggy","isDiscountable":true,"type":"PARCEL","maxDiscount":2000,"extras":[{"name":"SGST","value":"2.50"},{"name":"CGST","value":"2.50"},{"name":"Container Charges","value":"5.00"}]},{"name":"Dine AC","isDiscountable":true,"type":"DINE","maxDiscount":2000,"extras":[{"name":"SGST","value":"2.50"},{"name":"CGST","value":"2.50"}]},{"name":"iitm","isDiscountable":true,"type":"TOKEN","maxDiscount":2000,"extras":[{"name":"Container Charges","value":"5.00"}]},{"name":"toekn","isDiscountable":true,"type":"TOKEN","maxDiscount":2000,"extras":[{"name":"SGST","value":"2.50"},{"name":"CGST","value":"2.50"},{"name":"Container Charges","value":"5.00"},{"name":"Parcel Charges","value":"10.00"}]}]}');
      console.log(sample_data)
      dfd.resolve(sample_data.value);
    });

    return dfd.promise;
  };  


  this.getBillingParameters = function(){
    var dfd = $q.defer();

    var data = {};
    data.token = "MALA";

    $http({
      method  : 'POST',
      url     : 'https://www.zaitoon.online/services/fetchusers.php',
      data    : data,
      headers : {'Content-Type': 'application/x-www-form-urlencoded'}
     })
    .then(function(response) {
      var sample_data = JSON.parse('{ "_id": "ZAITOON_BILLING_PARAMETERS", "_rev": "37-dee65966c6125646a2198729b99c8cf2", "identifierTag": "ZAITOON_BILLING_PARAMETERS", "value": [ { "name": "SGST", "excludePackagedFoods": true, "value": 2.5, "unit": "PERCENTAGE", "unitName": "Percentage (%)" }, { "name": "CGST", "excludePackagedFoods": true, "value": 2.5, "unit": "PERCENTAGE", "unitName": "Percentage (%)" }, { "name": "Container Charges", "excludePackagedFoods": true, "value": 5, "unit": "PERCENTAGE", "unitName": "Percentage (%)" }, { "name": "Parcel Charges", "excludePackagedFoods": false, "value": 10, "unit": "FIXED", "unitName": "Fixed Amount (Rs)" } ] }');
      console.log(sample_data)

      dfd.resolve(sample_data.value);
    });

    return dfd.promise;
  };  



  this.getProducts = function(){
    return JSON.parse(window.localStorage.zaitoonFirst_cart || '[]');
  };

  this.updatedProducts = function(products){
    //window.localStorage.zaitoonFirst_cart = JSON.stringify(products);

    $rootScope.$broadcast('cart_updated', products);
  };

  this.addProduct = function(productToAdd){

    var cart_products = !_.isUndefined(window.localStorage.zaitoonFirst_cart) ? JSON.parse(window.localStorage.zaitoonFirst_cart) : [];

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
    console.log(productToAdd)

      cart_products.push(productToAdd);
      $rootScope.$broadcast('cart_updated', cart_products);
      $rootScope.$emit('cart_updated', cart_products);

    /*
    else{ //Increment the cart count
      if(productToAdd.isCustom){
        var i = 0;
        while(i < cart_products.length){
          if((cart_products[i].code == productToAdd.code) && (cart_products[i].variant == productToAdd.variant)){
            cart_products[i].qty++;
            break;
          }
          i++;
        }
      }
      else{
        var i = 0;
        while(i < cart_products.length){
          if(cart_products[i].code == productToAdd.code){
            cart_products[i].qty++;
            break;
          }
          i++;
        }
      }
    }
    */

    window.localStorage.zaitoonFirst_cart = JSON.stringify(cart_products);
    $rootScope.$broadcast('cart_updated', cart_products);

    //animateCartIcon();
  };

  this.lessProduct = function(cart_index){

    var cart_products = JSON.parse(window.localStorage.zaitoonFirst_cart);
    
    for(var i = 0; i < cart_products.length; i++){
      if(cart_products[i].cartIndex == cart_index){
            if(cart_products[i].qty > 1)
              cart_products[i].qty--;
            break;
      }
    }

    window.localStorage.zaitoonFirst_cart = JSON.stringify(cart_products);
    $rootScope.$broadcast('cart_updated', cart_products);
  };


  this.moreProduct = function(cart_index){

    console.log(cart_index)

    var cart_products = JSON.parse(window.localStorage.zaitoonFirst_cart);
      
    for(var i = 0; i < cart_products.length; i++){
      if(cart_products[i].cartIndex == cart_index){
        cart_products[i].qty++;
        break;
      }
    }

    window.localStorage.zaitoonFirst_cart = JSON.stringify(cart_products);
    $rootScope.$broadcast('cart_updated', cart_products);
  };

  this.removeProduct = function(cart_index){

    var cart_products = JSON.parse(window.localStorage.zaitoonFirst_cart);
    
    var new_cart_products = _.reject(cart_products, function(product){
        return (product.cartIndex == cart_index);
    });
    
    window.localStorage.zaitoonFirst_cart = JSON.stringify(new_cart_products);
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
