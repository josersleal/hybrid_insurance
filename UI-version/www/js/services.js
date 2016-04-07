var module = angular.module('starter.services', []);

module.factory('myPopup', function($ionicPopup) {

	var factory = {};
	
	factory.showPopup = function(myTitle, myTemplate) {
		var alertPopup = $ionicPopup.alert({
     		title: myTitle,
     		template: myTemplate
   		});
 	};

 	return factory;
});
