angular.module('feedback.controllers', [])    

    .controller('feedbackLandingCtrl', function(feedbackService, inoviceFeedbackMappingService, $ionicPopup, $scope, $rootScope, $http, $state, $ionicLoading, $timeout, $ionicModal) {

        $scope.user = {};
        $scope.user.name = "";
        $scope.user.mobile = "";
        $scope.user.email = "";
        $scope.billNumber = "";

        $scope.fetchInvoiceDetails = function(){
            var setUserData = inoviceFeedbackMappingService.getInvoiceDetails();
            $scope.user.name = setUserData.name;
            $scope.user.mobile = setUserData.contact;
            $scope.billNumber = setUserData.invoice;
            $scope.user.email = "";

            if($scope.billNumber != ""){
                feedbackService.setMappedInvoice($scope.billNumber)
            }
        }

        $scope.fetchInvoiceDetails();

        $rootScope.$on('feedback_opted', function() {
            $scope.fetchInvoiceDetails();
            $scope.searchUser();
        });

        $rootScope.$on('feedback_cleared', function() {
            $scope.fetchInvoiceDetails();
        });

        
        $scope.searchCounter = 0;
        
        $scope.seachNumber = function(number){
                
                if($scope.searchCounter <= 2){                   
                    var data = {};
                    data.secret = "NJAN_APPILAAA";
                    data.mobile = number;

                        $http({
                            method: 'POST',
                            url: 'http://www.zaitoonrestaurant.com/services/deskreviewsearchuser.php',
                            data: data,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            timeout: 10000
                        })
                        .success(function(response) {
                            if(response.status){
                                $scope.user = response.response;
                            }
                            
                            $scope.searchCounter++;                     
                        })
                        .error(function(data) {
                        }); 
                }
        }
        
        $scope.searchUser = function(){
            if(($scope.user.mobile).length == 10 && ($scope.searchCounter <= 2)){
                $scope.seachNumber($scope.user.mobile);
            }
        }
        

        $scope.goReview = function() {
                    var info = {};
                    info.userName = $scope.user.name;
                    info.userMobile = $scope.user.mobile;
                    info.userEmail = $scope.user.email;
                    feedbackService.setUserInfo(info);
                    $state.go('main.app.feedback');
        };


        $scope.goBackToMain = function(){
            $state.go('main.app.landing');
        }


        //To set the background

        $scope.feedbackCount = 1;

        if (_.isUndefined(window.localStorage.feedbacksCounter) || window.localStorage.feedbacksCounter == '') {
            window.localStorage.feedbacksCounter = 1;
        }
        else{
            $scope.feedbackCount = window.localStorage.feedbacksCounter;
        }

        $scope.getMainBackground = function(){
            if($scope.feedbackCount % 3 == 0){
                return "feedbackBGRed";
            }
            else if($scope.feedbackCount % 3 == 1){
                return "feedbackBGGreen";
            }
            else if($scope.feedbackCount % 3 == 2){
                return "feedbackBGBlue";
            }
        }

    })


    .controller('thanksCtrl', function(feedbackService, inoviceFeedbackMappingService, $scope, $rootScope, $state, $interval) {
        var user = feedbackService.getReviewInfo();
        $scope.message = "Thank You " + user.userName;

        var rating = feedbackService.getRating();

        if (rating == 5) {
            $scope.customMessage = "Great to know that you had an awesome experience with us. Hope to serve you again soon.";
        } else if (rating == 4 || rating == 3) {
            $scope.customMessage = "We will definitely keep note of your feedback. Assure you a better experience on your next visit. Hope to serve you again soon.";
        } else if (rating == 1 || rating == 2) {
            $scope.customMessage = "Sorry to hear that we could not meet your expectations. We promise you an awesome experience on your next visit.";
        } else {
            $scope.customMessage = "";
        }
        
        
        $scope.new = function() {

            if (_.isUndefined(window.localStorage.feedbacksCounter) || window.localStorage.feedbacksCounter == '') {
                window.localStorage.feedbacksCounter = 1;
            }
            else{
                window.localStorage.feedbacksCounter = window.localStorage.feedbacksCounter + 1;
            }

            feedbackService.clearAll();
            inoviceFeedbackMappingService.clearInvoiceDetails();

            $rootScope.$broadcast('feedback_cleared', '');
            $state.go('main.app.feedbacklanding');
        }   

        $scope.counter = 15;
        $scope.Timer = $interval(function() {
            $scope.counter--;
            if($scope.counter == 0){
                $scope.new();
            }
        }, 1000);
        
        $scope.$on('$destroy', function () {$interval.cancel($scope.Timer);});


        //To set the background

        $scope.feedbackCount = 1;

        if (_.isUndefined(window.localStorage.feedbacksCounter) || window.localStorage.feedbacksCounter == '') {
            window.localStorage.feedbacksCounter = 1;
        }
        else{
            $scope.feedbackCount = window.localStorage.feedbacksCounter;
        }

        $scope.getMainBackground = function(){
            if($scope.feedbackCount % 3 == 0){
                return "feedbackBGRed";
            }
            else if($scope.feedbackCount % 3 == 1){
                return "feedbackBGGreen";
            }
            else if($scope.feedbackCount % 3 == 2){
                return "feedbackBGBlue";
            }
        }        
    
    })

    .controller('feedbackCtrl', function(feedbackService, inoviceFeedbackMappingService, deviceLicenseService, $scope, $http, $state, $rootScope, $ionicLoading, $ionicPopup) {

        $scope.tag = "";
        $scope.selection = "";
        $scope.isStarFilled = false;

        $scope.metadata = feedbackService.getReviewInfo();

        var mapped_invoice = feedbackService.getMappedInvoice();

        $scope.fillTill = function(id) {

            $scope.isStarFilled = true;


            $scope.starRating = id;
            //Set a tag which matches the selection

            //Less than 5 means, a negative review.
            if (id < 5)
                $scope.selection = 'N';
            else
                $scope.selection = 'P';

            $scope.tag = "";
            switch (id) {
                case 1:
                    {
                        $scope.tag = "Terrible";
                        break;
                    }
                case 2:
                    {
                        $scope.tag = "Bad";
                        break;
                    }
                case 3:
                    {
                        $scope.tag = "OK";
                        break;
                    }
                case 4:
                    {
                        $scope.tag = "Good";
                        break;
                    }
                case 5:
                    {
                        $scope.tag = "Awesome";
                        break;
                    }
            }

            var i = 1;
            while (i <= id) {
                document.getElementById("star" + i).className = "icon ion-ios7-star";
                i++;
            }
            //Empty the remaining stars
            while (i <= 5) {
                document.getElementById("star" + i).className = "icon ion-ios7-star-outline";
                i++;
            }
        }

        $scope.commentsFeed = {};
        $scope.commentsFeed.text = "";

        //Characters Left in the comments
        document.getElementById('commentsBox').onkeyup = function() {
            document.getElementById('characterCount').innerHTML = (150 - (this.value.length)) + ' characters left.';
        }

        $scope.getSmiley = function(){
            switch($scope.tag){
                case "Terrible":
                    {
                        return "./img/ratings/1_stars.png";
                        break;
                    }
                case "Bad":
                    {
                        return "./img/ratings/2_stars.png";
                        break;
                    }
                case "OK":
                    {
                        return "./img/ratings/3_stars.png";
                        break;
                    }
                case "Good":
                    {
                        return "./img/ratings/4_stars.png";
                        break;
                    }
                case "Awesome":
                    {
                        return "./img/ratings/5_stars.png";
                        break;
                    }
            }
        }


        //Negative Feedback
        $rootScope.negative_feedback = {};
        $rootScope.negative_feedback.quality = false;
        $rootScope.negative_feedback.service = false;
        $rootScope.negative_feedback.delivery = false;
        $rootScope.negative_feedback.food = false;
        $rootScope.negative_feedback.app = false;
        $rootScope.negative_feedback.other = false;

        //Positive Feedback
        $rootScope.positive_feedback = {};
        $rootScope.positive_feedback.quality = false;
        $rootScope.positive_feedback.service = false;
        $rootScope.positive_feedback.delivery = false;
        $rootScope.positive_feedback.food = false;
        $rootScope.positive_feedback.app = false;
        $rootScope.positive_feedback.other = false;

        $scope.submitFeedback = function(comments) {
            if (!$scope.starRating) {
                $ionicLoading.show({
                    template: 'Please rate us to continue!',
                    duration: 2000
                });
            } else {
                if ($scope.starRating == 5) {
                    var reviewObject = {
                        "rating": $scope.starRating,
                        "quality": $rootScope.positive_feedback.quality,
                        "service": $rootScope.positive_feedback.service,
                        "delivery": $rootScope.positive_feedback.delivery,
                        "food": $rootScope.positive_feedback.food,
                        "app": $rootScope.positive_feedback.app,
                        "other": $rootScope.positive_feedback.other,
                        "comment": $scope.commentsFeed.text
                    }
                } else {
                    var reviewObject = {
                        "rating": $scope.starRating,
                        "quality": $rootScope.negative_feedback.quality,
                        "service": $rootScope.negative_feedback.service,
                        "delivery": $rootScope.negative_feedback.delivery,
                        "food": $rootScope.negative_feedback.food,
                        "app": $rootScope.negative_feedback.app,
                        "other": $rootScope.negative_feedback.other,
                        "comment": $scope.commentsFeed.text
                    }
                }



                feedbackService.setRating($scope.starRating);


                $scope.postReview = function() {
                    
                    //POST review
                    var data = {};
                    data.review = reviewObject;
                    data.details = $scope.metadata;
                    data.token = window.localStorage.admin;

                    data.billNumber = mapped_invoice;

                    $ionicLoading.show({
                        template: '<ion-spinner></ion-spinner>'
                    });
                    

                    $http({
                            method: 'POST',
                            url: 'http://www.zaitoonrestaurant.com/services/deskpostreview.php',
                            data: data,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            timeout: 10000
                        })
                        .success(function(response) {
                            $ionicLoading.hide();
                            if (response.status) {
                                    
                                if(mapped_invoice != ''){
                                    //Add rating to invoice on localserver
                                    addRatingToInvoice(mapped_invoice, reviewObject, $scope.metadata);
                                }
                                else{
                                    $state.go('main.app.feedbackthanks');
                                }

                            } else {
                                $ionicLoading.show({
                                    template: "Error: " + response.error + ". Please Re-try.",
                                    duration: 3000
                                });
                            }
                        })
                        .error(function(data) {
                            $ionicLoading.hide();
                            $ionicLoading.show({
                                template: "Failed to save. Please try again.",
                                duration: 2000
                            });
                        });



                        function addRatingToInvoice(mapped_invoice, reviewObject, otherData){

                            var my_rating = reviewObject.rating;
                            var my_comments = reviewObject.comment;

                            var COMMON_IP_ADDRESS = window.localStorage.defaultServerIPAddress && window.localStorage.defaultServerIPAddress != '' ? window.localStorage.defaultServerIPAddress : 'http://admin:admin@localhost:5984/';

                            //Set _id from Branch mentioned in Licence
                            var accelerate_licencee_branch = deviceLicenseService.getBranchCode();
                            if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                              $state.go('main.app.feedbackthanks');
                              return '';
                            }

                            
                            var invoice_request_data = accelerate_licencee_branch +"_BILL_"+ mapped_invoice;

                            $http({
                                method: 'GET',
                                url: COMMON_IP_ADDRESS+'/accelerate_bills/'+invoice_request_data,
                                timeout: 10000
                            })
                            .success(function(data) {
                                if(data._id != ""){

                                    var invoiceData = data;

                                    if(invoiceData.customerRating){
                                        $state.go('main.app.feedbackthanks');
                                        return '';
                                    }
                                    else{
                                            //Add rating
                                            invoiceData.customerRating = my_rating;

                                            if(my_comments != ''){
                                                invoiceData.customerReview = my_comments;
                                            }

                                            //Check if customer data is not added
                                            if(invoiceData.customerName == ""){
                                                invoiceData.customerName = otherData.userName != "" ? otherData.userName : "";
                                            }

                                            if(invoiceData.customerMobile == ""){
                                                invoiceData.customerMobile = otherData.userMobile != "" ? otherData.userMobile : "";
                                            }
                                    
                                            //Update on Server
                                            $http({
                                                method: 'PUT',
                                                url: COMMON_IP_ADDRESS+'/accelerate_bills/'+invoiceData._id+'/',
                                                data: JSON.stringify(invoiceData),
                                                contentType: "application/json",
                                                dataType: 'json',
                                                timeout: 10000
                                            })
                                            .success(function(data) {
                                                $state.go('main.app.feedbackthanks');
                                            });
                                    }

                                }
                                else{
                                    $state.go('main.app.feedbackthanks');
                                }
                            })
                            .error(function(data) {
                                $state.go('main.app.feedbackthanks');
                            });

                        }
                }

                $scope.postReview();


            }
        };



        //To set the background

        $scope.feedbackCount = 1;

        if (_.isUndefined(window.localStorage.feedbacksCounter) || window.localStorage.feedbacksCounter == '') {
            window.localStorage.feedbacksCounter = 1;
        }
        else{
            $scope.feedbackCount = window.localStorage.feedbacksCounter;
        }

        $scope.getMainBackground = function(){
            if($scope.feedbackCount % 3 == 0){
                return "feedbackBGRed";
            }
            else if($scope.feedbackCount % 3 == 1){
                return "feedbackBGGreen";
            }
            else if($scope.feedbackCount % 3 == 2){
                return "feedbackBGBlue";
            }
        }

    });