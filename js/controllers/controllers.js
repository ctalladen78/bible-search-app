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

.controller('wordSearchResultsCtrl', ['$scope','$stateParams', 'DataService', function($scope, $stateParams, DataService) {
  // using routeParams return list of verses containing query term
  // may have to paginate
  // highlight term
  var ctrl = this;
  ctrl.word = $stateParams.term;
  ctrl.getVerses = function(word){
  // ctrl.verses = DataService.wordSearch(ctrl.word) // return list of verse objects
    ctrl.verses = [
      {"book": "Isiah", "chapter":12, "like":"true","category":[],"verse":14, "text": "For God so loved the world..."},
      {"book": "Hebrews", "chapter":33, "like":"true","category":[],"verse":15, "text": "That we ought not condemn..."},
      {"book": "Revelations", "chapter":45, "like":"true","category":[],"verse":16, "text": "When He shall return ..."}
    ];
    console.log('verse init');
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
    // ctrl.verses = DataService.bookSearch(book,chap) // return list of verse detail objects
    ctrl.verses = [
      {"book": "Isiah", "chapter":12, "like":"true","category":[],"verse":14, "text": "For God so loved the world..."},
      {"book": "Hebrews", "chapter":33, "like":"true","category":[],"verse":15, "text": "That we ought not condemn..."},
      {"book": "Revelations", "chapter":45, "like":"true","category":[],"verse":16, "text": "When He shall return ..."}
    ];
    console.log('verse init');
  }

  return ctrl;
}])

.controller('verseDetailCtrl', ['$scope','$stateParams', 'DataService','$state', function( $scope, $stateParams, DataService, $state) {
  // using routeParams
  var ctrl = this;
  ctrl.bookId = $stateParams.book;
  ctrl.chapId = $stateParams.chap;
  ctrl.verse = $stateParams.verse;
  ctrl.selectedCategory = '';
  // ctrl.categories = DataService.getCategories(); // return list of categories
  ctrl.getCategories = function(){
    ctrl.categories = [
      'Jesus',
      'Paul',
      'John'
    ];
  }
  // ctrl.verseDetail = DataService.getVerseDetail(ctrl.bookId, ctrl.chapId, ctrl.verse);
  ctrl.verseDetail = {
    'like' : true, // data.favorite
    'category' : 'test', // data.category
    'book' : 'test',
    'chapter' : 10,
    'verse' : ctrl.verse,
    'text' : 'Lorem ipsum dolor sit amet, nulla feugiat fabellas et eam, detraxit ocurreret expetendis mei cu. Id errem commodo cum, etiam dolorum prodesset est id. His facilisi appellantur te, ignota petentium accusamus has te. Usu an sonet ignota labore. Populo eligendi voluptatum at mel. Duo id intellegat repudiandae, inermis erroribus gubergren ex vis.'
  }
  // data-> a verse may only have one category for now
  ctrl.saveVerse = function(){
    // save verse
    // DataService.saveVerse(ctrl.verseDetail)
    // menu.bookSearchResults({book:vm.bookId,chap:vm.chapId})
    // TODO just go back to last page
    $state.go("menu.bookSearchResults",{book:ctrl.bookId,chap:ctrl.chapId});
  }
  ctrl.addToCategory = function(){}
  return ctrl;
}])

.controller('editVerseCtrl', ['$scope', '$stateParams','DataService','$state', function($scope, $stateParams, DataService,$state) {
  var ctrl = this;
  ctrl.bookId = $stateParams.book;
  ctrl.chapId = $stateParams.chap;
  ctrl.verse = $stateParams.verse;
  // ctrl.categories = DataService.getCategories(); // return list of categories
  // ctrl.verseDetail = DataService.getVerseDetail();
  ctrl.verseDetail = {
    'favorite' : true, // data.favorite
    'category' : 'test', // data.category
    'book' : 'test',
    'chapter' : 10,
    'verse' : 12,
    'text' : 'test'
  }
  // data-> a verse may only have one category for now
  ctrl.saveVerse = function(){
    // save verse
    // DataService.saveVerse(ctrl.verseDetail)
    $state.go("menu.verseDetail",{book:ctrl.bookId, chap:ctrl.chapId, verse:ctrl.verse});
  }
  ctrl.addToCategory = function(){}
  return ctrl;
}])

.controller('favoritesCtrl', ['$scope','$stateParams', 'DataService', function($scope, $stateParams, DataService) {
  var ctrl = this;
  // data-> return list of verses that are liked from db
  ctrl.word = $stateParams.term;
  ctrl.getVerses = function(word){
  // ctrl.verses = DataService.wordSearch(ctrl.word) // return list of verse objects
    ctrl.verses = [
      {"book": "Isiah", "chapter":12, "like":"true","category":[],"verse":14, "text": "For God so loved the world..."},
      {"book": "Hebrews", "chapter":33, "like":"true","category":[],"verse":15, "text": "That we ought not condemn..."},
      {"book": "Revelations", "chapter":45, "like":"true","category":[],"verse":16, "text": "When He shall return ..."}
    ];
    console.log('favorites init');
  }
  return ctrl;
}])

.controller('categoriesCtrl', ['$scope','$stateParams','DataService', function($scope, $stateParams, DataService) {
  // data-> get all categories from db
  var ctrl = this;
  // data-> return list of verses that are liked from db
  ctrl.category = '';
  ctrl.getCategories = function(word){
  // ctrl.verses = DataService.wordSearch(ctrl.word) // return list of verse objects
    ctrl.categories = [
      'Jesus',
      'John',
      'Paul'
    ];
    console.log('categories init');
  }
  return ctrl;
}])

.controller('addCategoryCtrl', ['$scope','$stateParams',function($scope, $stateParams) {
  // using routeParams write to db

}])

.controller('categoryDetailCtrl', ['$scope','$stateParams','DataService', function($scope, $stateParams, DataService){
  // using routeParams

}])

.controller('editCategoryCtrl', ['$stateParams','$scope',function($stateParams, $scope) {
  // using routeParams write to db

}])
