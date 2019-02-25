angular.module('feedback.services', [])

.service('feedbackService', function ($http, $q){

  //Default Parameters
  var userName = "";
  var userMobile = "";
  var userEmail = "";

  var rating = "";

  this.setRating = function(val){
    rating = val;
  }
  
  this.getRating = function(){
    return rating;
  }

  this.clearAll = function(){
    userName = "";
    userMobile = "";
    userEmail = "";
    rating = "";
  }

  this.setUserInfo = function(info){
    userMobile = info.userMobile;
    userName = info.userName;
    userEmail = info.userEmail;
  }
  

  
 this.getUserInfo = function(){
    var data = {};
    data.mobile = userMobile;
    data.name = userName;
    data.email = userEmail;
    
    return data;
  }


  this.getReviewInfo = function(){
    var data = {
      "userMobile": userMobile,
      "userName":userName,
      "userEmail": userEmail
    }
    return data;
  }

})

;