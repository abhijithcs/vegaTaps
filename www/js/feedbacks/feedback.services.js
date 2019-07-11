angular.module('feedback.services', [])


.service('inoviceFeedbackMappingService', function ($http, $q){

  var invoiceNumber = "";
  var invoiceGuest = "";
  var invoiceContact = "";

  this.setInvoiceDetails = function(invoice, contact, name){
    invoiceNumber = invoice;
    invoiceGuest = name;
    invoiceContact = contact;
  }
  
  this.getInvoiceDetails = function(){
    return {
      "invoice": invoiceNumber,
      "name": invoiceGuest,
      "contact": invoiceContact
    };
  }

  this.clearInvoiceDetails = function(){
    invoiceNumber = "";
    invoiceContact = "";
    invoiceGuest = "";
  }

})

.service('feedbackService', function ($http, $q){

  //Default Parameters
  var userName = "";
  var userMobile = "";
  var userEmail = "";

  var rating = "";

  var invoiceMapped = '';

  this.setRating = function(val){
    rating = val;
  }
  
  this.getRating = function(){
    return rating;
  }

  this.setMappedInvoice = function(val){
    invoiceMapped = val;
  }
  
  this.getMappedInvoice = function(){
    return invoiceMapped;
  }

  this.clearAll = function(){
    userName = "";
    userMobile = "";
    userEmail = "";
    rating = "";
    invoiceMapped = '';
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