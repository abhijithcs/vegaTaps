angular.module('common.services', [])

.service('deviceLicenseService', function ($http, $q){

  //Default Parameters
  var device_name = "";
  var device_license_code = "";
  var branch_code = "";
  var branch_name = "";
  var activation_date = "";
  var expiry_date = "";

  this.setLicense = function(info){
    device_name = info.device_name;
    device_license_code = info.device_license_code;
    branch_code = info.branch_code;
    branch_name = info.branch_name;
    activation_date = info.activation_date;
    expiry_date = info.expiry_date;
  }

  this.getLicense = function(){
    var infoObj = {
      "device_name" : device_name,
      "device_license_code" : device_license_code,
      "branch_code" : branch_code,
      "branch_name" : branch_name,
      "activation_date" : activation_date,
      "expiry_date" : expiry_date
    }

    return infoObj;
  }
  
  this.getBranchCode = function(){
    return branch_code;
  }

  this.getBranchName = function(){
    return branch_name;
  }

  this.getDeviceName = function(){
    return device_name;
  }

  this.isActive = function(){
    if(device_license_code != ""){
      return true;
    }
    else{
      return false;
    }
  }

})

;