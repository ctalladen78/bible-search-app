// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ionic-material'])

.run(['DbService','$ionicPlatform', function( DbService, $ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    DbService.initDB();
    //DbService.destroyDB();
  });
}])

.config(function($ionicConfigProvider) {
  // $ionicConfigProvider.views.maxCache(50);

  // note that you can also chain configs
  // $ionicConfigProvider.backButton.text('Go Back').icon('ion-chevron-left');
    // Turn off back button text
    $ionicConfigProvider.backButton.previousTitleText(false);
$ionicConfigProvider.backButton.icon('ion-chevron-left');
  $ionicConfigProvider.backButton.text('')
});
