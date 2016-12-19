angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ionic-material','admobModule'])

// https://github.com/appfeel/admob-google-cordova
// https://github.com/appfeel/admob-google-cordova/wiki/Setup
.config(['$ionicConfigProvider','admobSvcProvider', function($ionicConfigProvider,admobSvcProvider) {
  // $ionicConfigProvider.views.maxCache(50);

  // Turn off back button text
  $ionicConfigProvider.backButton.previousTitleText(false);
  $ionicConfigProvider.backButton.icon('ion-chevron-left').text('');

  // config admob options
  // implement in controllers
  admobSvcProvider.setOptions({
    // this is the banner id it is required
    publisherId: "ca-app-pub-2768773976387970/9812391648"
    // App ID ca-app-pub-2768773976387970~6858925240
    //  banner Ad unit ID: ca-app-pub-2768773976387970/9812391648
    // interstitial id if setup in  admob account
    // interstitialAdId : "ca-app-pub-"
  })
}])

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
