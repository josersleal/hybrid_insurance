angular
		.module(
				'poc',
				[ "ionic", "config", 'poc.controllers', "forceng", "ngCordova" ])
		// forcengOptions not needed, check what is not needed and remove
		.run(
				function($window, force, $ionicPlatform, $state, forcengOptions) {

					// ForceNG is built to work out of the box with sensible
					// defaults.
					// Uncomment the force.init() function call below to provide
					// specific runtime
					// parameters
					/*
					 * force.init({ appId:
					 * '3MVG9fMtCkV6eLheIEZplMqWfnGlf3Y.BcWdOf1qytXo9zxgbsrUbS.ExHTgUPJeb3jZeT8NYhc.hMyznKU92',
					 * apiVersion: 'v32.0', loginUrl:
					 * 'https://login.salesforce.com', oauthRedirectURL:
					 * 'http://localhost:8200/oauthcallback.html', proxyURL:
					 * 'http://localhost:8200' });
					 */

					$ionicPlatform
							.ready(function(param) {

								// Hide the accessory bar by default (remove
								// this to show the
								// accessory bar above the keyboard
								// for form inputs)
								if (window.cordova && window.cordova.plugins
										&& window.cordova.plugins.keyboard) {
									window.cordova.plugins.keyboard
											.hideKeyboardAccessory(true);
									window.cordova.plugins.keyboard
											.disableScroll(true);
								}
								/*
								// prep some variables
								var startDate = new Date(
										"September 24, 2013 13:00:00");
								var endDate = new Date(
										"September 24, 2013 14:30:00");
								var title = "My nice event";
								var location = "Home";
								var notes = "Some notes about this event.";
								var success = function(message) {
									alert("Success: " + JSON.stringify(message));
								};
								var error = function(message) {
									alert("Error: " + message);
								};

								// create
								window.plugins.calendar.createEvent(title,
										location, notes, startDate, endDate,
										success, error);
								*/
							});
					if (window.StatusBar) {
						StatusBar.styleDefault();
					}

					// Initialize forceng
					// force.init(forcengOptions);
					// force.login().then(function() {
					// // TODO make it go to main view?
					// $state.go('app.main');
					// }, function() {
					// alert("Login failed");
					// });

				})

		.config(function($stateProvider, $urlRouterProvider, baseURL) {

			// TODO: maybe initiate here some constants like querries, or should
			// those
			// be on some crud service?

			// baseURL (defined in the config.js module) is only there to
			// support
			// running the same app as a Mobile SDK
			// hybrid local and hybrid remote app (where the app is run from
			// withing
			// a Visualforce page). When running the
			// app inside a Visualforce page, you have to account for the path
			// of
			// the app's static resource. To accomplish
			// that, you create the config module from within the VF page (as
			// opposed to importing config.js), and set
			// baseURL to the app's static resource path.

			$urlRouterProvider.otherwise('app/main');

			$stateProvider.state('app', {
				url : "/app",
				abstract : true,
				templateUrl : baseURL + "templates/menu.html",
				controller : "menuCtrl"
			});

			$stateProvider.state('app.main', {
				url : '/main',
				views : {
					'menuContent' : {
						templateUrl : 'templates/main.html',
						controller : 'menuCtrl'
					}
				}
			});

			$stateProvider.state('app.claimlist', {
				cache: false,
				url : "/claimlist",
				views : {
					'menuContent' : {
						templateUrl : baseURL + "templates/claimList.html",
						controller : "ClaimListCtrl"
					}
				}
			});

			$stateProvider.state('app.claim', {
				cache: false,
				url : "/claims/:claimId",
				views : {
					'menuContent' : {
						templateUrl : baseURL + "templates/claim.html",
						controller : "ClaimCtrl"
					}
				}
			});
			
			$stateProvider.state('app.claimForm', {
				cache: false,
				url : '/claimForm/:claimTypeId',
				views : {					
					'menuContent' : {
						templateUrl : 'templates/claimForm.html',
						controller : 'ClaimFormCtrl'
					}
				}
			});
			
			$stateProvider.state('app.editClaim', {
				cache: false,
				url : '/edit-claim/:claimId?claimType',
				views : {
					'menuContent' : {
						templateUrl : baseURL + "templates/claimForm.html",
						controller : "ClaimFormCtrl"
					}
				}
			});


			$stateProvider.state('app.claimType', {
				url : '/claimType',
				views : {
					'menuContent' : {
						templateUrl : 'templates/claimType.html',
						controller : 'ClaimTypeCtrl'
					}
				}
			});

			$stateProvider.state('app.healthProfile', {
				url : '/healthProfile',
				views : {
					'menuContent' : {
						templateUrl : 'templates/healthProfile.html',
						controller : 'HealthProfileCtrl'
					}
				}
			});

			// if none of the above states are matched, use this as the fallback
			$urlRouterProvider.otherwise('/app/main');

		});