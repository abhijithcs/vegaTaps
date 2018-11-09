angular.module('reservations.services', [])

.service('changeSlotService', function ($http, $q){

  var requestFlag = false;

  //Default Parameters
  var mobile = "";
  var name = "";
  var count = "";
  var date = "";
  var time = "";
  var id = "";

  this.setValues = function (reservation){
    requestFlag = true;

     mobile = reservation.mobile;
     name = reservation.user;
     count = reservation.count;
     date = reservation.date;
     time = reservation.time;
     id = reservation.id;
  }

  this.getValues = function(){
    var data = {
      "mobile" : mobile,
      "name" : name,
      "count" : count,
      "date" : date,
      "time" : time,
      "id" : id
    }

    return data;
  }



})


.service('currentBooking', function ($http, $q){

    //Default Parameters
    var currentBook = "";

    this.setBooking = function (bookObj){
		currentBook = bookObj;
    }

    this.getBooking = function(){
      return currentBook;
    }

})



.service('currentFilterService', function ($http, $q){

    //Default Parameters
    var currentSession = "All";
    var currentDate = '';
    var currentFancyDate = '';
    var isFilterApplied = false;

    this.setSession = function (session){
      currentSession = session;
    }

    this.getSession = function(){
      return currentSession;
    }

    this.setDate = function (date){
      currentDate = date;
    }

    this.getDate = function(){
      return currentDate;
    }

    this.setFancyDate = function (date){
      currentFancyDate = date;
    }

    this.getFancyDate = function(){
      return currentFancyDate;
    }

    this.setFilterFlag = function (flag){
      isFilterApplied = flag;
    }

    this.getFilterFlag = function(){
      return isFilterApplied;
    }
})




.service('mappingService', function ($http, $q){

  //Default Parameters
  var date = "";
  var dateName = "";

  this.setDate = function(dateFormatted, dateFancyName){
    date = dateFormatted;
    dateName = dateFancyName;
  }

  this.getDate = function(){
    return date;
  }

  this.getFancyDate = function(){
    return dateName;
  }

  this.clearAll = function(){
    rating = "";
  }

})

;
