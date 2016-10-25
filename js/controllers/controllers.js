angular.module('app.controllers', ['app.services'])
// index component
.controller('bookIndexCtrl', ['$scope','$stateParams', 'DbService','$q', function($scope, $stateParams, DbService, $q){
  var ctrl = this;
   DbService.getDocs().then(function(res){
    console.log('%%%% get docs from ctrl: ', res) 
    ctrl.bookList = DbService.getBooks();
    console.log('%%% ctrl bookList: ', ctrl.bookList);
   })

  //ctrl.bookList = ['Genesis','Psalms','John','Acts']; // DbService.getBooks()
  return ctrl;
}])
// chapter list
.controller('chapterIndexCtrl',['$scope','$stateParams', 'DbService', function($scope, $stateParams, DbService){
  var ctrl = this;
  // ctrl.chapList = DbService.getChapters($stateParams.book)
    DbService.getChapter();

  ctrl.bookId = $stateParams.book;
  // query
  ctrl.chapList = [
    {"chapId":1, "heading": "Creation & Recreation"},
    {"chapId":2, "heading": "The Fall of Man"},
    {"chapId":3, "heading": "Cain Murders Abel"},
    {"chapId":4, "heading": "The Flood"}
    ];
  console.log('getting chap for book: ',ctrl.bookId, 'length: ',ctrl.chapList.length);
  return ctrl;
}])
// dropdown search component
.controller('searchCtrl', ['$scope','$stateParams', 'DbService', function($scope, $stateParams, DbService) {
  var ctrl = this;
  ctrl.word = '';
  ctrl.bookId = '';
  ctrl.chapId;
  ctrl.bookList = [];
  ctrl.chapList = [];

  ctrl.getBooks = function(){
    // populate Bible bookList
    ctrl.bookList = ['','Genesis','Psalms','John','Acts']; // DbService.getBooks()
  }
  ctrl.getChaps = function(){
    if(!ctrl.bookId){
      console.log('no books selected');
      ctrl.chapList = [];    // DbService.getChapters(ctrl.bookId)
    }else{
      // ctrl.chapList = DbService.getChapters(ctrl.bookId)
      ctrl.chapList = [
    {"chapId":1, "heading": "The Tower of Babel"},
    {"chapId":2, "heading": "Slavery in Egypt"},
    {"chapId":3, "heading": "The Burning Bush"},
    {"chapId":4, "heading": "The Ten Plagues"}
    ];
      console.log('getting chap for book: ',ctrl.bookId, ctrl.chapList.length);
    }
  }
  return ctrl;
}])
// word search component
.controller('wordSearchResultsCtrl', ['$scope','$stateParams', 'DbService', function($scope, $stateParams, DbService) {
  // using routeParams return list of verses containing query term
  // may have to paginate
  // highlight term
  var ctrl = this;
  ctrl.word = $stateParams.term;
  ctrl.getVerses = function(word){
  // ctrl.verses = DbService.wordSearch(ctrl.word) // return list of verse objects
    ctrl.verses = [
      {"book": "Isiah", "chapter":12, "like":"true","category":[],"verse":14, "text": "For God so loved the world..."},
      {"book": "Hebrews", "chapter":33, "like":"true","category":[],"verse":15, "text": "That we ought not condemn..."},
      {"book": "Revelations", "chapter":45, "like":"true","category":[],"verse":16, "text": "When He shall return ..."}
    ];
    console.log('verse init');
  }
  return ctrl;
}])
// search results master list
.controller('bookSearchResultsCtrl', ['$scope','$stateParams', 'DbService', function($scope, $stateParams, DbService) {
  // using routeParams
  var ctrl = this;
  ctrl.bookId = $stateParams.book;
  ctrl.chapId = $stateParams.chap;
  ctrl.verses = [];
  ctrl.getVerses = function(book, chap){
    // ctrl.verses = DbService.bookSearch(book,chap) // return list of verse detail objects
    ctrl.verses = [
      {"book": "Isiah", "chapter":12, "like":"true","category":[],"verse":14, "text": "For God so loved the world..."},
      {"book": "Hebrews", "chapter":33, "like":"true","category":[],"verse":15, "text": "That we ought not condemn..."},
      {"book": "Revelations", "chapter":45, "like":"true","category":[],"verse":16, "text": "When He shall return ..."}
    ];
    console.log('verse init');
  }

  return ctrl;
}])
// verse detail
.controller('verseDetailCtrl', ['$scope','$stateParams', 'DbService','$state', function( $scope, $stateParams, DbService, $state) {
  // using routeParams
  var ctrl = this;
  ctrl.bookId = $stateParams.book;
  ctrl.chapId = $stateParams.chap;
  ctrl.verse = $stateParams.verse;
  ctrl.selectedCategory = '';
  // ctrl.categories = DbService.getCategoryList(); // return list of categories
  ctrl.getCategories = function(){
    ctrl.categories = [
      'Jesus',
      'Paul',
      'John'
    ];
  }
  // ctrl.verseDetail = DbService.getVerseDetail(ctrl.bookId, ctrl.chapId, ctrl.verse);
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
    // DbService.saveVerse(ctrl.verseDetail)
    // menu.bookSearchResults({book:vm.bookId,chap:vm.chapId})
    // TODO just go back to last page
    $state.go("menu.bookSearchResults",{book:ctrl.bookId,chap:ctrl.chapId});
  }
  ctrl.addToCategory = function(){}
  return ctrl;
}])
// edit verse detail
.controller('editVerseCtrl', ['$scope', '$stateParams','DbService','$state', function($scope, $stateParams, DbService,$state) {
  var ctrl = this;
  ctrl.bookId = $stateParams.book;
  ctrl.chapId = $stateParams.chap;
  ctrl.verse = $stateParams.verse;
  // ctrl.categories = DbService.getCategoryList(); // return list of categories
  // ctrl.verseDetail = DbService.getVerseDetail();
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
    // DbService.editVerse(ctrl.verseDetail)
    $state.go("menu.verseDetail",{book:ctrl.bookId, chap:ctrl.chapId, verse:ctrl.verse});
  }
  ctrl.addToCategory = function(){}
  return ctrl;
}])
// favorites master list
.controller('favoritesCtrl', ['$scope','$stateParams', 'DbService', function($scope, $stateParams, DbService) {
  var ctrl = this;
  // data-> return list of verses that are liked from db
  ctrl.word = $stateParams.term;
  ctrl.getVerses = function(word){
  // ctrl.verses = DbService.getFavoriteList(ctrl.word) // return list of verse objects
    ctrl.verses = [
      {"book": "Isiah", "chapter":12, "like":"true","category":[],"verse":14, "text": "For God so loved the world..."},
      {"book": "Hebrews", "chapter":33, "like":"true","category":[],"verse":15, "text": "That we ought not condemn..."},
      {"book": "Revelations", "chapter":45, "like":"true","category":[],"verse":16, "text": "When He shall return ..."}
    ];
    console.log('favorites init');
  }
  return ctrl;
}])
// categories master list
.controller('categoriesCtrl', ['$scope','$stateParams','DbService', function($scope, $stateParams, DbService) {
  // data-> get all categories from db
  var ctrl = this;
  ctrl.category = '';
  ctrl.getCategories = function(){
  // ctrl.categories = DbService.getCategoryList() // return list of categories
    ctrl.categories = [
      'Jesus',
      'John',
      'Paul'
    ];
    console.log('categories init');
  }
  return ctrl;
}])
// category detail is a list of verses
.controller('categoryDetailCtrl', ['$scope','$stateParams','DbService', function($scope, $stateParams, DbService){
  // using routeParams

}])
// add new empty category
.controller('addCategoryCtrl', ['$scope','$stateParams',function($scope, $stateParams) {
  // using routeParams write to db

}])
// rename existing category
.controller('editCategoryCtrl', ['$stateParams','$scope',function($stateParams, $scope) {
  // using routeParams write to db

}])
