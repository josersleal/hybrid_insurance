angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $state, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('MainCtrl', function($scope) {
})

.controller('claimListCtrl', function($scope) {
  $scope.myClaims = [
	{ title: 'Broken knee', id: 112321 , insurance:'Healt',status:'Waiting for Processing'},
	{ title: 'Ear infection', id: 265433, insurance:'Healt',status:'Approved' },
	{ title: 'Fever', id: 398801 , insurance:'Healt',status:'Paid'},
	{ title: 'Ear infection', id: 447392, insurance:'Healt',status:'Paid' },
	{ title: 'Ear infection', id: 591748, insurance:'Healt',status:'Paid' },
	{ title: 'Ear infection', id: 631294, insurance:'Healt',status:'Paid' }
  ];
})

.controller('claimTypeCtrl', function($scope) {
  $scope.claimTypes = [
	{ name: 'Health Insurance', id: 1 ,icon: 'ion-heart'},
	{ name: 'Vehicle Insurance', id: 2 ,icon: 'ion-model-s' },
	{ name: 'House Insurance', id: 3 ,icon: 'ion-home'}
  ];
  $scope.goMain = function(){
    $state.go('app.main');
  }
})

.controller('claimFormCtrl', function($scope, $state, $stateParams) {
	$scope.myReason;
	if ($stateParams.claimId=='1'){
	  $scope.reasons = [
		{ name: 'Heart', id: 1, checked: false },
		{ name: 'Bones', id: 2, checked: false },
		{ name: 'Blood vessels', id: 3, checked: false },
		{ name: 'Muscles', id: 4, checked: false }
	  ];
	} else {
	  $scope.reasons = [
		{ name: 'Accident (own fault)', id: 1, checked: false },
		{ name: 'Accident (unknown fault)', id: 2, checked: false },
		{ name: 'Natural catastrophy', id: 3, checked: false },
		{ name: 'Theft', id: 4, checked: false }
	  ];
	}

	$scope.selectReason = function(reasonId) {
		for(var i=1; i<5;i++) {
			if(angular.equals(i, parseInt(reasonId))) {
				continue;
			}
			$scope.reasons[i-1].checked = false;	
		}	
	}


  	$scope.goClaims = function() {
    	$state.go('app.claimType');
  	}
	
	$scope.myFreeText;
	$scope.submitClaim = function (text,reason) {
		
		$scope.claimMessage = {
			insurance: $stateParams.claimId,
			reason: reason.name,
			freetext: text
		};
		console.log("Sending Claim:"+$scope.claimMessage.insurance+" "+$scope.claimMessage.reason+" "+$scope.claimMessage.freetext);			
		/*force.update('contact', $scope.claimMessage).then(
			function (response) {
				$ionicNavBarDelegate.back();
			},
			function() {
				alert("An error has occurred.");
			});
		*/				
	};
	$scope.myFreeText;		
})

.controller('healthProfileCtrl', function($scope, myPopup) {

	$scope.myPopup = myPopup;
 	
  	/* Profile data definition */
	$scope.data = {
		gender:"",
		weight:"65",
		tallness:"160",
		age:"30",
		target:{ 
			weight:false,
			cholesterol:false,
			bloodPressure:false,
		}
	};

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
  		$scope.data.gender = gender;
  	}

	/* Age range handlers */
	$scope.decreaseAge = function() {
		$scope.data.age = 1 * $scope.data.age - 1.0;
	}
	$scope.increaseAge = function() {
		$scope.data.age = 1 * $scope.data.age + 1.0;
	}

	/* Weight range handlers */
	$scope.decreaseWeight = function() {
		$scope.data.weight = 1 * $scope.data.weight - 0.5;
		$scope.calculateBmi();
	}
	$scope.increaseWeight = function() {
		$scope.data.weight = 1 * $scope.data.weight + 0.5;
		$scope.calculateBmi();
	}

	/* Tallness range handlers */
	$scope.decreaseTallness = function() {
		$scope.data.tallness = 1 * $scope.data.tallness - 1.0;
		$scope.calculateBmi();
	}
	$scope.increaseTallness = function() {
		$scope.data.tallness = 1 * $scope.data.tallness + 1.0;
		$scope.calculateBmi();
	}

	/* BMI initialization and calculation on changes */
	$scope.bmi = $scope.data.weight/(($scope.data.tallness/100)*($scope.data.tallness/100));
	$scope.calculateBmi = function() {
		$scope.bmi = $scope.data.weight/(($scope.data.tallness/100)*($scope.data.tallness/100));
		if($scope.bmi < 20 && $scope.bmi > 19) {
			$scope.myPopup.showPopup("NEW OFFERS!", "Check the latest offers from our web site...");
		}
		else if($scope.bmi > 30 && $scope.bmi < 30.10){
			$scope.myPopup.showPopup("TIP OF THE DAY", "Live longer!!");	
		}
	}
			
	$scope.submitHealtForm = function (data) {
		console.log("gender:"+$scope.data.gender+" weight: "+$scope.data.weight+" targets: (weight,cholesteroo,blood pressure): ("+$scope.data.target.weight+","+data.target.cholesterol+","+data.target.bloodPressure+")");
	};
});
