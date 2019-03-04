angular.module('common.directives', [])


.factory('ConnectivityMonitor', function($rootScope, $cordovaNetwork){

  return {
    isOnline: function(){
      if(ionic.Platform.isWebView()){
        return $cordovaNetwork.isOnline();
      } else {
        return navigator.onLine;
      }
    },
    isOffline: function(){
      if(ionic.Platform.isWebView()){
        return !$cordovaNetwork.isOnline();
      } else {
        return !navigator.onLine;
      }
    },
    startWatching: function(){
        if(ionic.Platform.isWebView()){

          $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
            console.log("went online");
          });

          $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
            console.log("went offline");
          });

        }
        else {

          window.addEventListener("online", function(e) {
            console.log("went online");
          }, false);

          window.addEventListener("offline", function(e) {
            console.log("went offline");
          }, false);
        }
    }
  }
})

.directive("calendar1", function() {
	var temp = {
                    restrict: "E",
                    templateUrl: "views/common/templates/calendar.html",
                    scope: {
                        selected: "="
                    },
                    link: function(scope) {
                        scope.selected = _removeTime(scope.selected || moment());
                        scope.month = scope.selected.clone();

                        console.log('selected month '+scope.month )

                        var start = scope.selected.clone();
                        start.date(1);
                        _removeTime(start.day(0));

                        _buildMonth(scope, start, scope.month);

                        scope.select = function(day) {
                            scope.selected = day.date;  
                        };

                        scope.next = function() {
                            var next = scope.month.clone();
                            _removeTime(next.month(next.month()+1).date(1));
                            scope.month.month(scope.month.month()+1);
                            _buildMonth(scope, next, scope.month);
                        };

                        scope.previous = function() {
                            var previous = scope.month.clone();
                            _removeTime(previous.month(previous.month()-1).date(1));
                            scope.month.month(scope.month.month()-1);
                            _buildMonth(scope, previous, scope.month);
                        };
                    }
                }
                console.log('Hey, am here.')
                console.log(temp)

                return temp;

                function _removeTime(date) {
                    return date.day(0).hour(0).minute(0).second(0).millisecond(0);
                }

                function _buildMonth(scope, start, month) {
                    scope.weeks = [];
                    console.log('start: '+start)
                    console.log('month: '+month)
                    var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
                    while (!done) {
                        scope.weeks.push({ days: _buildWeek(date.clone(), month) });
                        console.log(scope.weeks)
                        date.add(1, "w");
                        done = count++ > 2 && monthIndex !== date.month();
                        monthIndex = date.month();
                    }
                }

                function _buildWeek(date, month) {
                    var days = [];
                    for (var i = 0; i < 7; i++) {
                        days.push({
                            name: date.format("dd").substring(0, 1),
                            number: date.date(),
                            isCurrentMonth: date.month() === month.month(),
                            isToday: date.isSame(new Date(), "day"),
                            date: date
                        });
                        date = date.clone();
                        date.add(1, "d");
                    }
                    return days;
                }
})


.directive('filterTabs', function($ionicSlideBoxDelegate) {
	return {
		restrict: 'A',
		scope: {
			slider: '@'
		},
		controller: function($scope) {
			var tabs = $scope.tabs = [],
					utils = this;

			this.select = function(tab) {
        angular.forEach(tabs, function(tab) {
          tab.selected = false;
        });
        tab.selected = true;
				$ionicSlideBoxDelegate.$getByHandle($scope.slider).slide(tab.index - 1);
      };

			this.addTab = function(tab) {
        if (tabs.length === 0) {
          utils.select(tab);
        }
        tabs.push(tab);
      };
		}
	};
})

.directive('filterTab', function() {
	return {
		restrict: 'E',
		require: '^filterTabs',
		templateUrl: 'views/filters/tab.template.html',
		transclude: true,
		replace: true,
		scope: {
			index: '@tab'
		},
		link: function(scope, element, attr, tabsCtrl) {
			tabsCtrl.addTab(scope);

			element.on("click", function(event){
				tabsCtrl.select(scope);
			});
		}
	};
})

.directive('tagCheckbox', function($ionicConfig) {
  return {
    restrict: 'E',
		scope: {
			title: '@',
			model: '=ngModel'
		},
    replace: true,
    transclude: true,
    templateUrl: 'views/filters/tag-checkbox.template.html',
    compile: function(element, attr) {
      var checkboxWrapper = element[0].querySelector('.checkbox');
      checkboxWrapper.classList.add('checkbox-' + $ionicConfig.form.checkbox());
    }
  };
})

.directive('tagRadio', function() {
  return {
    restrict: 'E',
    replace: true,
		scope: {
			model: '=ngModel',
			value: '=ngValue',
			name: '@name'
		},
    transclude: true,
		templateUrl: 'views/filters/tag-radio.template.html',
    compile: function(element, attr) {
      return function(scope, element, attr) {
        scope.getValue = function() {
          return scope.ngValue || attr.value;
        };
      };
    }
  };
})

.directive('colorRadio', function() {
  return {
    restrict: 'E',
    replace: true,
		scope: {
			model: '=ngModel',
			value: '=ngValue',
			name: '@name'
		},
    transclude: true,
		templateUrl: 'views/filters/color-radio.template.html',
    compile: function(element, attr) {
      return function(scope, element, attr) {
        scope.getValue = function() {
          return scope.ngValue || attr.value;
        };
      };
    }
  };
})

.directive('numberInput', function() {
  return {
    restrict: 'E',
    replace: true,
		scope: {
			model: '=ngModel'
		},
    transclude: true,
		templateUrl: 'views/filters/number-input.template.html',
    controller: function($scope) {
			$scope.minusOne = function(){
				if($scope.model>1)
				{
					$scope.model = $scope.model -1;
				}
			}

			$scope.plusOne = function(){
				$scope.model = $scope.model +1;
			}
    }
  };
})


.directive('groupedRadio', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      model: '=ngModel',
      value: '=groupedRadio'
    },
    link: function(scope, element, attrs, ngModelCtrl) {

      element.addClass('button');
      element.on('click', function(e) {
        scope.$apply(function() {
          ngModelCtrl.$setViewValue(scope.value);
        });
      });

      scope.$watch('model', function(newVal) {
        element.removeClass('button-positive-zaitoon');
        element.css({'color': '#B8B8B8'});
        if (newVal === scope.value) {
          element.addClass('button-positive-zaitoon');
          element.css({'color': '#FFF'});
        }
      });


    }
  };
})


.directive('multiBg', function(_){
	return {
		scope: {
			multiBg: '=',
			interval: '=',
			helperClass: '@'
		},
		controller: function($scope, $element, $attrs) {
			$scope.loaded = false;
			var utils = this;

			this.animateBg = function(){
				// Think i have to use apply because this function is not called from this controller ($scope)
				$scope.$apply(function () {
					$scope.loaded = true;
					$element.css({'background-image': 'url(' + $scope.bg_img + ')'});
				});
			};

			this.setBackground = function(bg) {
				$scope.bg_img = bg;
			};

			if(!_.isUndefined($scope.multiBg))
			{
				if(_.isArray($scope.multiBg) && ($scope.multiBg.length > 1) && !_.isUndefined($scope.interval) && _.isNumber($scope.interval))
				{
					// Then we need to loop through the bg images
					utils.setBackground($scope.multiBg[0]);
				}
				else
				{
					// Then just set the multiBg image as background image
					utils.setBackground($scope.multiBg[0]);
				}
			}
		},
		templateUrl: 'views/common/templates/multi-bg.html',
		restrict: 'A',
		replace: true,
		transclude: true
	};
})


.directive('bg', function() {
	return {
		restrict: 'A',
		require: '^multiBg',
		scope: {
			ngSrc: '@'
		},
		link: function(scope, element, attr, multiBgController) {
			element.on('load', function() {
				multiBgController.animateBg();
		  });
		}
	};
})


.directive('showHideContainer', function(){
	return {
		scope: {

		},
		controller: function($scope, $element, $attrs) {
			$scope.show = false;

			$scope.toggleType = function($event){
				$event.stopPropagation();
				$event.preventDefault();

				$scope.show = !$scope.show;

				// Emit event
				$scope.$broadcast("toggle-type", $scope.show);
			};
		},
		templateUrl: 'views/common/templates/show-hide-password.html',
		restrict: 'A',
		replace: false,
		transclude: true
	};
})


.directive('showHideInput', function(){
	return {
		scope: {

		},
		link: function(scope, element, attrs) {
			// listen to event
			scope.$on("toggle-type", function(event, show){
				var password_input = element[0],
						input_type = password_input.getAttribute('type');

				if(!show)
				{
					password_input.setAttribute('type', 'password');
				}

				if(show)
				{
					password_input.setAttribute('type', 'text');
				}
			});
		},
		require: '^showHideContainer',
		restrict: 'A',
		replace: false,
		transclude: false
	};
})

.directive('preImg', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			ratio:'@',
			helperClass: '@'
		},
		controller: function($scope) {
			$scope.loaded = false;

			this.hideSpinner = function(){
				// Think i have to use apply because this function is not called from this controller ($scope)
				$scope.$apply(function () {
					$scope.loaded = true;
				});
			};
		},
		templateUrl: 'views/common/templates/pre-img.html'
	};
})

.directive('spinnerOnLoad', function() {
	return {
		restrict: 'A',
		require: '^preImg',
		scope: {
			ngSrc: '@'
		},
		link: function(scope, element, attr, preImgController) {
			element.on('load', function() {
				preImgController.hideSpinner();
		  });
		}
	};
})


.directive('socialShare', function($cordovaSocialSharing, $ionicPlatform, $timeout) {
	return {
		restrict: 'A',
		scope: {
			share:'=',
		},
		controller: function($scope) {

		},
		link: function(scope, element, attr, ctrl) {
			scope.disabled = false;
			var post = scope.share;

			scope.disable = function(){
				scope.disabled = true;
				$timeout(function(){ element.attr('disabled',scope.disabled); }, 0);
			};

			scope.enable = function(){
				scope.disabled = false;
				$timeout(function(){ element.attr('disabled',scope.disabled); }, 0);
			};

			element.on('click', function(event) {
				if (scope.disabled) {
          event.preventDefault();
          event.stopImmediatePropagation();
        } else {
          scope.disable();
					$ionicPlatform.ready(function() {
						try {
							$cordovaSocialSharing
				        .share('Check the following post: ' + post.title, null, null, null) // Share via native share sheet
				        .then(function(result) {
				         // Success!
								 scope.enable();
				        }, function(err) {
				         // An error occured. Show a message to the user
								 scope.enable();
				        });
						}
						catch(err) {
					    scope.enable();
						}
			    });
        }
		  });
		}
	};
})

//Use this directive to open external links using inAppBrowser cordova plugin
.directive('dynamicAnchorFix', function($ionicGesture, $timeout, $cordovaInAppBrowser) {
	return {
		scope: {},
		link: function(scope, element, attrs) {
			$timeout(function(){
				var anchors = element.find('a');
				if(anchors.length > 0)
				{
					angular.forEach(anchors, function(a) {

						var anchor = angular.element(a);

						anchor.bind('click', function (event) {
							event.preventDefault();
							event.stopPropagation();

							var href = event.currentTarget.href;
							var	options = {};

							//inAppBrowser see documentation here: http://ngcordova.com/docs/plugins/inAppBrowser/

							$cordovaInAppBrowser.open(href, '_blank', options)
								.then(function(e) {
									// success
								})
								.catch(function(e) {
									console.log("error: " + e);
									// error
								});
						});
					});
				}
			}, 10);
		},
		restrict: 'A',
		replace: false,
		transclude: false
	};
})
;
