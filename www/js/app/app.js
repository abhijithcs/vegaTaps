angular.module('underscore', [])
.factory('_', function() {
  return window._; // assumes underscore has already been loaded on the page
});

angular.module('zaitoonFirst', [
  'ngCordova',

  'ionic',
  'zaitoonFirst.views',
  'common.directives',
  'common.controllers',

  'reservations.controllers',
  'reservations.services',

  'pos.controllers',
  'pos.services',
  'pos.directives',  

  'underscore',
  'angularMoment',
  'ngMap',
  'ngRangeSlider'
])

.run(function($ionicPlatform, amMoment, $rootScope) {

  $rootScope.previousView = [];

  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    var last_state = _.last($rootScope.previousView);

    if(last_state && (last_state.fromState === toState.name)){
      $rootScope.previousView.pop();
    }else{
      $rootScope.previousView.push({ "fromState": fromState.name, "fromParams": fromParams });
    }
  });

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    amMoment.changeLocale('en-gb');
  });
})

.config(function($ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.views.swipeBackEnabled(false);
  $ionicConfigProvider.form.checkbox('circle');

  if(!ionic.Platform.isWebView())
  {
    $ionicConfigProvider.scrolling.jsScrolling(false);
  }
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider



    .state('main', {
        url: '/main',
        abstract: true,
        templateUrl: 'views/common/main.html'
    })

    .state('main.app', {
        url: '/app',
        abstract: true,
        views: {
            'main-view@main': {
                templateUrl: 'views/common/app-pos.html',
                controller: 'AppCtrl'
            }
        }
    })


    .state('main.reservationsapp', {
        url: '/reservationsapp',
        abstract: true,
        views: {
            'main-view@main': {
                templateUrl: 'views/common/app-reservations.html',
                controller: 'AppCtrl'
            }
        }
    })

    /**********************
             LOGIN
    ***********************/

    .state('main.app.login', {
        url: '/login',
        views: {
            'main-view@main': {
                templateUrl: 'views/home/login.html',
                controller: 'loginCtrl'
            }
        }
    })



    /**********************
          MAIN LAYOUT
    ***********************/

    .state('main.app.landing', {
        url: '/landing',
        views: {
            'main-view@main': {
                templateUrl: 'views/home/landing.html',
                controller: 'landingCtrl'
            }
        }
    })


    /**********************
          RESERVATIONS
    ***********************/


    .state('main.reservationsapp.upcoming', {
        url: '/reservationsupcoming',
        views: {
            'reservations-upcoming@main.reservationsapp': {
                templateUrl: 'views/reservations/listing-upcoming.html',
                controller: 'upcomingReservationsCtrl'
            }
        }
    })


    .state('main.reservationsapp.seated', {
        url: '/reservationsseated',
        views: {
            'reservations-seated@main.reservationsapp': {
                templateUrl: 'views/reservations/listing-seated.html',
                controller: 'seatedReservationsCtrl'
            }
        }
    })

    
    .state('main.reservationsapp.completed', {
        url: '/reservationscompleted',
        views: {
            'reservations-completed@main.reservationsapp': {
                templateUrl: 'views/reservations/listing-completed.html',
                controller: 'completedReservationsCtrl'
            }
        }
    })


    .state('main.reservationsapp.map', {
        url: '/map',
        views: {
            'main-view@main': {
                templateUrl: 'views/reservations/tables.html',
                controller: 'TablesCtrl'
            }
        }
    })

    .state('main.app.summary', {
        url: '/summary',
        views: {
            'main-view@main': {
                templateUrl: 'views/reservations/summary.html',
                controller: 'summaryCtrl'
            }
        }
    })

    .state('main.app.walkin', {
        url: '/walkin',
        views: {
            'main-view@main': {
                templateUrl: 'views/reservations/newreservation.html',
                controller: 'NewReservationsCtrl'
            }
        }
    })

    .state('main.app.change', {
        url: '/change',
        views: {
            'main-view@main': {
                templateUrl: 'views/reservations/editreservation.html',
                controller: 'EditReservationsCtrl'
            }
        }
    })



    /**********************
               POS
    ***********************/




            .state('main.app.filters', {
                url: '/filters',
                nativeTransitions: { type : "slide", direction : "up", duration : 400},
                nativeTransitionsBack: { type : "slide", direction : "down", duration : 400},
                views: {
                    'main-view@main': {
                        templateUrl: 'views/filters/filters.html',
                        controller: 'FiltersCtrl'
                    }
                }
            })




            .state('main.app.punch', {
                url: '/punch',
                nativeTransitions: { type: "fade" },
                views: {
                    'app-punch@main.app': {
                        templateUrl: 'views/pos/punch.html',
                        controller: 'PunchCtrl'
                    }
                },
                resolve: {
                    kitchen_comments: function(ShoppingCartService) {
                        return ShoppingCartService.getComments();
                    }
                }
            })


            .state('main.app.settings', {
                url: '/settings',
                nativeTransitions: { type: "fade" },
                views: {
                    'app-punch@main.app': {
                        templateUrl: 'views/pos/pos-settings.html',
                        controller: 'SettingsCtrl'
                    }
                }
            })




            .state('main.app.shopping-cart', {
                url: '/shopping-cart',
                nativeTransitions: { type : "slide", direction : "down", duration : 400},
                nativeTransitionsBack: { type: "slide", "direction": "up", duration : 400 },
                views: {
                    'main-view@main': {
                        templateUrl: 'views/pos/cart.html',
                        controller: 'ShoppingCartCtrl'
                    }
                },
                resolve: {
                    products: function(ShoppingCartService) {
                        return ShoppingCartService.getProducts();
                    },
                    billing_modes: function(ShoppingCartService) {
                        return ShoppingCartService.getBillingModes();
                    },
                    billing_parameters: function(ShoppingCartService) {
                        return ShoppingCartService.getBillingParameters();
                    }
                }
            })



/*

            .state('main.app.feed', {
                url: '/feed',
                nativeTransitions: { type: "fade" },
                views: {
                    'app-feed@main.app': {
                        templateUrl: 'views/pos/main-feed.html',
                        controller: 'FeedCtrl'
                    }
                }
            })




            .state('main.app.feed.arabian', {
                url: '/arabian',
                nativeTransitions: { type: "fade" },
                views: {
                    'category-feed@main.app.feed': {
                        templateUrl: 'views/pos/menu.html',
                        controller: 'MainMenuCtrl'
                    }
                }
            })
*/


            .state('main.app.status', {
                url: '/status',
                nativeTransitions: null,
                views: {
                    'app-status@main.app': {
                        templateUrl: 'views/pos/status.html'
                    }
                }
            })

            .state('main.app.status.tables', {
                url: '/status-table',
                nativeTransitions: { type: "fade" },
                views: {
                    'status-tables@main.app.status': {
                        templateUrl: 'views/pos/status-tables.html',
                        controller: 'StatusTablesCtrl'
                    }
                }
            })

            .state('main.app.status.running', {
                url: '/status-running',
                nativeTransitions: { type: "fade" },
                views: {
                    'status-running@main.app.status': {
                        templateUrl: 'views/pos/status-running.html',
                        controller: 'StatusRunningCtrl'
                    }
                }
            })




  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/main/app/punch');
});
