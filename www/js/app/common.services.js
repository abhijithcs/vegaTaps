angular.module('common.services', [])

.service('deviceLicenseService', function ($http, $q){

  //Default Parameters
  var deviceUID = "";
  var device_name = "";
  var device_license_code = "";
  var branch_code = "";
  var branch_name = "";
  var activation_date = "";
  var expiry_date = "";
  var client = "";
  var isActive = false;
  var isTrial = false;
  var defaultPrinters = {};

  this.setLicense = function(info){
    device_name = info.device_name;
    deviceUID = info.deviceUID;
    device_license_code = info.device_license_code;
    branch_code = info.branch_code;
    branch_name = info.branch_name;
    activation_date = info.activation_date;
    expiry_date = info.expiry_date;
    client = info.client;
    isActive = info.isActive;
    isTrial = info.isTrial;
    defaultPrinters = info.defaultPrinters;
  }

  this.setDeviceName = function(new_name){
    device_name = new_name;
  }


  this.getLicense = function(){

    if(deviceUID == '' || device_license_code == ''){
      return {};
    }

    var infoObj = {
      "deviceUID" : deviceUID,
      "device_name" : device_name,
      "device_license_code" : device_license_code,
      "branch_code" : branch_code,
      "branch_name" : branch_name,
      "activation_date" : activation_date,
      "expiry_date" : expiry_date,
      "client" : client,
      "isActive" : isActive,
      "isTrial" : isTrial,
      "defaultPrinters" : defaultPrinters
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
    return deviceUID;
  }

  this.getDeviceFancyName = function(){
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