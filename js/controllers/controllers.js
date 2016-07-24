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
  ctrl.verses = [];
  ctrl.getVerses = function(book, chap){
    ctrl.verses = [
      {"verse":14, "text": "For God so loved the world..."},
      {"verse":15, "text": "That we ought not condemn..."},
      {"verse":16, "text": "When He shall return ..."}
    ];//DataService.getVerses(book,chap)
    console.log('verse init');
  }

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
  var ctrl = this;
  ctrl.bookId = $stateParams.book;
  ctrl.chapId = $stateParams.chap;
  ctrl.verse = $stateParams.verse;
  ctrl.getVerseDetail = function(book, chap,verse){
    ctrl.verseDetail = {"verse":14, "text": "For God so loved the world..."};  //DataService.getVerseDetail(book,chap,verse)
    console.log('verse init');
  }
  ctrl.getVerseDetail(ctrl.bookId,ctrl.chapId,ctrl.verse);

  return ctrl;
}])

.controller('editVerseCtrl', ['$scope','DataService', function($scope) {
  var ctrl = this;
  // ctrl.categories = DataService.getCategories(); // return list of categories
  // var data = DataService.getVerseDetail();
  ctrl.data = {
    favorite : true, // data.favorite
    category : 'test', // data.category
    book : 'test',
    chapter : 10,
    verse : 12,
    text : 'test'
  }
  // data-> a verse may only have one category for now
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
