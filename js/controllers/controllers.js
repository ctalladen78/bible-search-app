angular.module('app.controllers', [])

.controller('searchCtrl', ['$scope','$stateParams', 'DataService', function(DataService, $stateParams, $scope) {
  var ctrl = this;
  ctrl.word = '';
  ctrl.bookId = '';
  ctrl.chapId;
  ctrl.bookList = [];
  ctrl.chapList = [];

  ctrl.getBooks = function(){
    // populate Bible bookList
    ctrl.bookList = ['','Genesis','Psalms','John','Acts']; // DataService.getBooks()
  }
  ctrl.getChaps = function(book){
    // data -> return chaps from book
    // DataService.getChaps(book)
    if(!ctrl.bookId){
      //flash error message to view
      console.log('bookId is empty');
      ctrl.chapList = [];
    }else{
      ctrl.chapList = [1,2,3,4]; // DataService.getChaps(book)
      console.log('getting chap for book: ',book, ctrl.chapList.length);
    }
  }
  return ctrl;
}])

.controller('bookSearchResultsCtrl', ['$scope','$stateParams', 'DataService', function($scope, $stateParams, DataService) {
  // using routeParams
  var ctrl = this;
  ctrl.bookId = $stateParams.book;
  ctrl.chapId = $stateParams.chap;


  return ctrl;
}])

.controller('wordSearchResultsCtrl', ['$scope','$stateParams', 'DataService', function($scope, $stateParams, DataService) {
  // using routeParams return list of verses containing query term
  // may have to paginate
  // highlight term
  var ctrl = this;
  ctrl.word = $stateParams.term;


  return ctrl;
}])

.controller('verseDetailCtrl', ['$scope','$stateParams', 'DataService', function($scope, $stateParams, DataService) {
  // using routeParams

}])

.controller('editVerseCtrl', ['$scope','DataService', function($scope) {
  // data-> a verse may only have one category
  $scope.saveVerse = function(){}
}])

.controller('favoritesCtrl', ['$scope','$stateParams', 'DataService', function($scope, $stateParams, DataService) {
  $scope.favorites = [];
  // data-> return list of verses that are liked from db

}])

.controller('categoriesCtrl', ['$scope','$stateParams','DataService', function($scope, $stateParams, DataService) {
  $scope.categories =[];
  // data-> get all categories from db

}])

.controller('addCategoryCtrl', ['$stateParams','$scope',function($scope) {
  // using routeParams write to db

}])

.controller('categoryDetailCtrl', ['$scope','$stateParams','DataService', function($scope, $stateParams, DataService){
  // using routeParams

}])

.controller('editCategoryCtrl', ['$stateParams','$scope',function($scope) {
  // using routeParams write to db

}])
