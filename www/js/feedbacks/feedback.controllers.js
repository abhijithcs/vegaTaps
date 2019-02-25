angular.module('feedback.controllers', [])    

    .controller('feedbackLandingCtrl', function(feedbackService, $ionicPopup, $scope, $http, $state, $ionicLoading, $timeout, $ionicModal) {

        $scope.user = {};
        $scope.user.name = "";
        $scope.user.mobile = "";
        $scope.user.email = "";
        
        $scope.searchCounter = 0;
        
        $scope.seachNumber = function(number){
                
                if($scope.searchCounter <= 2){                   
                    var data = {};
                    data.secret = "NJAN_APPILAAA";
                    data.mobile = number;

                        $http({
                            method: 'POST',
                            url: 'https://www.zaitoon.online/services/deskreviewsearchuser.php',
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

    })


    .controller('thanksCtrl', function(feedbackService, $scope, $state, $interval) {
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
            feedbackService.clearAll();
            $state.go('main.app.feedbacklanding');
        }   

        $scope.counter = 10;
        $scope.Timer = $interval(function() {
            $scope.counter--;
            if($scope.counter == 0){
                $scope.new();
            }
        }, 1000);
        
        $scope.$on('$destroy', function () {$interval.cancel($scope.Timer);});

        
    
    })

    .controller('feedbackCtrl', function(feedbackService, $scope, $http, $state, $rootScope, $ionicLoading) {

        $scope.tag = "";
        $scope.selection = "";
        $scope.isStarFilled = false;

        $scope.metadata = feedbackService.getReviewInfo();

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
                document.getElementById("star" + i).className = "icon ion-android-star";
                i++;
            }
            //Empty the remaining stars
            while (i <= 5) {
                document.getElementById("star" + i).className = "icon ion-android-star-outline";
                i++;
            }
        }

        $scope.commentsFeed = "";
        //Characters Left in the comments
        document.getElementById('commentsBox').onkeyup = function() {
            document.getElementById('characterCount').innerHTML = (150 - (this.value.length)) + ' characters left.';
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
                        "comment": comments
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
                        "comment": comments
                    }
                }



                feedbackService.setRating($scope.starRating);


                $scope.postReview = function() {
                    //POST review
                    var data = {};
                    data.review = reviewObject;
                    data.details = $scope.metadata;

                    $ionicLoading.show({
                        template: '<ion-spinner></ion-spinner>'
                    });
                    
                    console.log(data)


                    $http({
                            method: 'POST',
                            url: 'https://www.zaitoon.online/services/deskpostreviewiitm.php',
                            data: data,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            timeout: 10000
                        })
                        .success(function(response) {
                            $ionicLoading.hide();
                            if (response.status) {
                                $state.go('main.app.feedbackthanks');
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
                }

                $scope.postReview();


            }
        };

    });