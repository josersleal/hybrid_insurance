/**
 * TODO: private move to service
 */
function showMessage(errorObject) {
	// Object
	// errorCode: "NOT_FOUND"
	// message: "Provided external ID field does not exist
	// or is not accessible: [object Object]"
	var errorMessage = "";
	if (Array.isArray(errorObject)) {
		for ( var index = 0; index < errorObject.length; index++) {
			errorMessage += errorObject[index].message
					+ "\n";
		}
	} else {
		errorMessage = errorObject.errorCode + " - "
				+ errorObject.message;
	}

	alert("error: " + errorMessage);
}

angular
		.module('poc.controllers', [ 'forceng', 'starter.services'])
		.controller('menuCtrl',
				function($scope, $ionicModal, $timeout, $state, force) {
// $scope.logout = function() {
// force.logout();
// $state.go('app.main');
// };

					// Form data for the login modal
					$scope.loginData = {};

					// Create the login modal that we will use later AND DOES
					// NOT EXIST
					$ionicModal.fromTemplateUrl('templates/login.html', {
						scope : $scope
					}).then(function(modal) {
						$scope.modal = modal;
					});

					// Triggered in the login modal to close it
					$scope.closeLogin = function() {
						$scope.modal.hide();
					};

					// Open the login modal
					$scope.login = function() {
						// Initialize forceng
						// force.init(forcengOptions);

						// $scope.modal.show();

						if (!force.isAuthenticated()) {
							// Initialize forceng
							// force.init(forcengOptions);
							force.login().then(function() {
								// TODO make it go to main view?
								$state.go('app.main');
							}, function() {
								alert("Login failed");
							});
						}
					};

					$scope.toClaimList = function() {
						
						if (!force.isAuthenticated()) {
							// Initialize forceng
							// force.init(forcengOptions);
							force.login().then(function() {
								$state.go('app.claimlist');
							}, function() {
								alert("Login failed");
							});
						} else {
							$state.go('app.claimlist');
						}
					}

					$scope.toHealthProfile = function() {
						
						if (!force.isAuthenticated()) {
							// Initialize forceng
							// force.init(forcengOptions);
							force.login().then(function() {
								$state.go('app.healthProfile');
							}, function() {
								alert("Login failed");
							});
						} else {
							$state.go('app.healthProfile');
						}
					}
					
					// Perform the login action when the user submits the login
					// form
					$scope.doLogin = function() {
						console.log('Doing login', $scope.loginData);

						// Simulate a login delay. Remove this and replace with
						// your
						// login
						// code if using a login system
						$timeout(function() {
							$scope.closeLogin();
						}, 1000);
					};
				})

		.controller(
				'ClaimListCtrl',
				function($scope, force) {
// alert("claim list ctrl");
					// select Id, CaseNumber, Subject, Description, OwnerId,
					// Customer__c,Customer__r.Name, Reason,
					// Insurance_Type__c, Claim_Reason__c, Status, Priority,
					// Origin FROM Case Where Customer__c = '00558000000YtTkAAK'
					var customerSFId = force.getUserId();
// alert("customerSFId: "+customerSFId);
					var query = "select Id, CaseNumber, Subject, Description, OwnerId, Customer__c,"
							+ "Reason, Insurance_Type__c, Claim_Reason__c, Status, Priority, Origin"
							+ " FROM Case Where Customer__c = '"
							+ customerSFId
							+ "'";
					force.query(query).then(function(claims) {
						$scope.claims = claims.records;
// alert("claims.records: "+claims.records[0].Id);
					}, function(error) {
						showMessage(error);
						$ionicNavBarDelegate.back();
					});

					/**
					 * private move to service
					 */
					function showMessage(errorObject) {
						// Object
						// errorCode: "NOT_FOUND"
						// message: "Provided external ID field does not exist
						// or is not accessible: [object Object]"
						var errorMessage = "";
						if (Array.isArray(errorObject)) {
							for ( var index = 0; index < errorObject.length; index++) {
								errorMessage += errorObject[index].message
										+ "\n";
							}
						} else {
							errorMessage = errorObject.errorCode + " - "
									+ errorObject.message;
						}
						alert("error: " + errorMessage);
					}
				})

		.controller(
				'ClaimCtrl',
				function($scope, $stateParams, force) {
// alert('ClaimCtrl');
					// Move crud to service and inject for reusability
					force
							.retrieve('case', $stateParams.claimId,
									'Id, Subject,Status, Description, Insurance_Type__c,Claim_Reason__c')
							.then(function(claim) {
								var cj = JSON.stringify(claim);
// alert('ClaimCtrl:' + cj);
								$scope.claim = claim;
							}, function(error) {
								showMessage(error);
								$ionicNavBarDelegate.back();
							});
					/**
					 * private move to service
					 */
					function showMessage(errorObject) {
						// Object
						// errorCode: "NOT_FOUND"
						// message: "Provided external ID field does not exist
						// or is not accessible: [object Object]"
						var errorMessage = "";
						if (Array.isArray(errorObject)) {
							for ( var index = 0; index < errorObject.length; index++) {
								errorMessage += errorObject[index].message
										+ "\n";
							}
						} else {
							errorMessage = errorObject.message;
						}

						alert("error: " + errorMessage);
					}

				}) 
				
		.controller(
				'ClaimFormCtrl',
				function($scope, $stateParams, $state, $ionicNavBarDelegate,
						force) {
					$scope.claim = {
						Subject : '',
						Claim_Reason__c : '',
						Description : '',
						Status : 'New',
						Insurance_Type__c : ''

					// TODO other items needed?
					};
					
					var claimtype = $stateParams.claimType; 
					// TODO: get bellow from picklists in salesforce
					// this is aswering mostly to create new health plan
					if ($stateParams.claimTypeId == '1' || claimtype == 'Health Insurance') {
						$scope.claim.Insurance_Type__c = 'Health Insurance';
						$scope.reasonChoices = [ {
							reasonType : 'Heart',
							id : 1,
							checked : false
						}, {
							reasonType : 'Bones',
							id : 2,
							checked : false
						}, {
							reasonType : 'Blood vessels',
							id : 3,
							checked : false
						}, {
							reasonType : 'Muscles',
							id : 4,
							checked : false
						} ];
					} else {
						$scope.claim.Insurance_Type__c = 'Vehicle Insurance';
						$scope.reasonChoices = [ {
							reasonType : 'Accident (own fault)',
							id : 1,
							checked : false
						}, {
							reasonType : 'Accident (unknown fault)',
							id : 2,
							checked : false
						}, {
							reasonType : 'Natural catastrophy',
							id : 3,
							checked : false
						}, {
							reasonType : 'Theft',
							id : 4,
							checked : false
						} ];
					}
					
					if (!force.isAuthenticated()) {
						// Initialize forceng
						// force.init(forcengOptions);
						force.login().then(function() {
							// do stuff
							doWork();
						}, function() {
							alert("Login failed");
							$state.go('app.main');
						});
					} else {
						doWork();
					}

					/**
					 * private
					 */
					function doWork() {
						if ($stateParams.claimId) {
							// retrieve claim or case
							// todo: Move crud with querys to service and inject
							// for reusability
							force
									.retrieve('case', $stateParams.claimId,
											'Id, Subject,Status, Description, Insurance_Type__c,Claim_Reason__c')
									.then(function(claim) {
										$scope.claim = claim;
									}, function(error) {
										showMessage(error);
										$ionicNavBarDelegate.back();
									});
						};
					}


					/**
					 * Remove after field defined
					 */
					function fillClaimValues(claimId) {
						// TODO fill in default values
						// if (claimId) {
						// $scope.claim.Id = $scope.claim;
						// }

						$scope.claim.Customer__c = force.getUserId();
						// $scope.claim.Origin = "Web";
						// $scope.claim.OwnerId = force.getUserId();
						$scope.claim.Priority = "Low";
						// $scope.claim.Reason = "Installation";
						// $scope.claim.Status = "New";
						// $scope.claim.Insurance_Type__c = "Health Insurance";
						// $scope.claim.Claim_Reason__c = "Bones";
						// $scope.claim.Description = "N/A";
					}

					$scope.save = function() {

						if ($stateParams.claimId) {
							// update case
							// fillClaimValues($stateParams.claimId);
							// Move crud to service and inject for reusability

							force.update('case', $scope.claim).then(
									function(response) {
										$state.go('app.claimlist');
										// $ionicNavBarDelegate.back();
									}, function(error) {
										showMessage(error);
										// $ionicNavBarDelegate.back();
										$state.go('app.claimlist');
									});
						} else {
							// insert case
							// insert default values to claim
							fillClaimValues($stateParams.claimId);
							force.create('case', $scope.claim).then(
									function(response) {
										// TODO: as it returns the claim id,
										// fetch and add to the exissitng list
										// so that it goes to claim list?
//										alert("just created a case: " + response);
										$state.go('app.claimlist');
										// $ionicNavBarDelegate.back();
									}, function(error) {
										showMessage(error);
// $ionicNavBarDelegate.back();
										$state.go('app.claimlist');
									});

						}
					}					
				})

		.controller('ClaimTypeCtrl', function($scope, force) {
			$scope.claimTypes = [ {
				name : 'Health Insurance',
				id : 1,
				icon : 'ion-heart'
			}, {
				name : 'Vehicle Insurance',
				id : 2,
				icon : 'ion-model-s'
			}, {
				name : 'House Insurance',
				id : 3,
				icon : 'ion-home'
			} ];

			/**
			 * go to main view unused?
			 */
			$scope.goMain = function() {
				$state.go('app.main');
			}
		})
		.controller('HealthProfileCtrl', function($scope, $state, force, myPopup) {	
			$scope.myPopup = myPopup;
			/* Profile data definition */
			$scope.healthProfile = {				
				Gender__c:"",
				Weight__c:"65",
				Height__c:"160",
				UserAge__c:"30",
			};
			$scope.targets = [ {
				targetType : 'Lose Weight',
				id : 1,
				checked : false
			}, {
				targetType : 'Lower Cholesterol Levels',
				id : 2,
				checked : false
			}, {
				targetType : 'Increase Energy Levels',
				id : 3,
				checked : false
			}];
			/* Gender definition and selection handling */
			$scope.genders = [
				{ title: 'Male', checked: false},
				{ title: 'Female', checked: false},
			];
			
			$scope.selectGender = function(gender) {
				if(gender === "Male") {
					$scope.genders[1].checked = false;
					
				} else {
					$scope.genders[0].checked = false;
				}
				$scope.healthProfile.Gender__c = gender;
			}

			/* Weight range handlers */
			$scope.decreaseWeight = function() {
				$scope.healthProfile.Weight__c = 1 * $scope.healthProfile.Weight__c - 0.5;
				$scope.calculateBmi();
			}
			$scope.increaseWeight = function() {
				$scope.healthProfile.Weight__c = 1 * $scope.healthProfile.Weight__c + 0.5;
				$scope.calculateBmi();
			}

			/* Tallness range handlers */
			$scope.decreaseTallness = function() {
				$scope.healthProfile.Height__c = 1 * $scope.healthProfile.Height__c - 1.0;
				$scope.calculateBmi();
			}
			$scope.increaseTallness = function() {
				$scope.healthProfile.Height__c = 1 * $scope.healthProfile.Height__c + 1.0;
				$scope.calculateBmi();
			}
			
			$scope.calculateBmi = function() {
				$scope.bmi = $scope.healthProfile.Weight__c/(($scope.healthProfile.Height__c/100)*($scope.healthProfile.Height__c/100));
				if($scope.bmi < 20 && $scope.bmi > 19) {
					$scope.myPopup.showPopup("NEW OFFERS!", "Check the latest offers from our web site...");
				}
				else if($scope.bmi > 30 && $scope.bmi < 30.10){
					$scope.myPopup.showPopup("TIP OF THE DAY", "Live longer!!");	
				}
			}
			$scope.calculateBmi();
			
			if (!force.isAuthenticated()) {
				// Initialize forceng
				// force.init(forcengOptions);
				force.login().then(function() {
					// do stuff
					getHealthProfile();
				}, function() {
					alert("Login failed");
					$state.go('app.main');
				});
			} else {
				getHealthProfile();
			}

			/**
			 * private
			 */
			function getHealthProfile() {
					var  customerSFId = force.getUserId();
					var query = "select Id, UserAge__c, Gender__c, Height__c, Target__c, Weight__c, User__c, Active__c"
							+ " FROM Health_Plan__c Where User__c = '"
							+ customerSFId
							+ "'" 
							+ " AND Active__c = true";
					force.query(query).then(
						function(healthProfilesResponse) {
							// TODO: check for 0 returned
							if (healthProfilesResponse.records.length > 0) {
								$scope.healthProfile = {
								    Id: healthProfilesResponse.records[0].Id,
									Gender__c: healthProfilesResponse.records[0].Gender__c,
									Weight__c: healthProfilesResponse.records[0].Weight__c,
									Height__c: healthProfilesResponse.records[0].Height__c,
									UserAge__c: healthProfilesResponse.records[0].UserAge__c,
									Target__c: healthProfilesResponse.records[0].Target__c,
									Active__c: healthProfilesResponse.records[0].Active__c
								};
							}
						}, function(error) {
							showMessage(error);
							$ionicNavBarDelegate.back();
						});
			};
					
			$scope.submitHealtForm = function () {
				var healthProfileNoAge ={
					Gender__c: $scope.healthProfile.Gender__c,
					Height__c: $scope.healthProfile.Height__c,
					Target__c: $scope.healthProfile.Target__c,
					Weight__c: $scope.healthProfile.Weight__c,
					UserAge__c: $scope.healthProfile.UserAge__c,
					User__c: force.getUserId(),
					Active__c: true				            				                         
				};
				if ($scope.healthProfile.Id) {
					// update case
					// Move crud to service and inject for reusability
					healthProfileNoAge.Id = $scope.healthProfile.Id,
					force.update('Health_Plan__c', healthProfileNoAge).then(
							function(response) {
								// TODO: report to user
//								alert("Health Plan Created!");
								$state.go('app.main');
							}, function(error) {
								showMessage(error);
								$state.go('app.main');
							});
				} else {
					// insert case
					// insert default values to claim
					force.create('Health_Plan__c', healthProfileNoAge).then(
							function(response) {
								// TODO: as it returns the claim id,
								// fetch and add to the exisitng list
								// so that it goes to claim list?
								$state.go('app.main');
							}, function(error) {
								showMessage(error);
								$state.go('app.main');
							});

				}
		};
		/**
		 * Remove after field defined
		 */
//		function fillHealthValues(customerSFId, data) {
//		var target = "";
//		if (data.target.weight) target += "Lose Weight";
//		if (data.target.cholesterol) target += "Lower Cholesterol Levels";
//		if (data.target.energyLevels) target += "Increase Energy Levels";
//
//		var sfData = {
//			// Customer__c : customerSFId,
//			// Id : '00358000001XtEwAAK',
//			UserAge__c : data.age,
//			Gender__c : data.gender,
//			Height__c : data.tallness,
//			Target__c : target,
//			Weight__c : data.weight
//		};
//		return sfData;
//	}
//	;
			
	});

