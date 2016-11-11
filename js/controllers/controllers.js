angular.module('app.controllers', ['app.services'])

// home splash page component
.controller('homeCtrl', ['$scope','$stateParams', 'DbService','$q', function($scope, $stateParams, DbService, $q){

}])
// book index component
.controller('bookIndexCtrl', ['$scope','$stateParams', 'DbService','$q', function($scope, $stateParams, DbService, $q){
  var ctrl = this;
   DbService.getBooks().then(function(res){
    ctrl.bookList = res
    //console.log('%%% ctrl bookList: ', ctrl.bookList);
   })
  return ctrl;
}])
// chapter list
.controller('chapterIndexCtrl',['$scope','$stateParams', 'DbService', function($scope, $stateParams, DbService){
  var ctrl = this;
  ctrl.bookId = $stateParams.book;
  DbService.getChapterList($stateParams.book).then(function(res){
//    ctrl.chapList = _.map(res, function(i){return i.chapterheading})
    ctrl.chapList = res
    console.log('%%% ctrl chapter list: ', ctrl.chapList);
    // TODO there is a memory leak because of large data set
  })

  return ctrl;
}])
// verse list search results master list
.controller('bookSearchResultsCtrl', ['$scope','$stateParams', 'DbService','$ionicModal','$state', function($scope, $stateParams, DbService, $ionicModal, $state) {
  // using routeParams
  var ctrl = this;
  $scope.bookId = $stateParams.book;
  $scope.chapId = $stateParams.chap;
  ctrl.bookId = $scope.bookId
  ctrl.chapId = $scope.chapId

  ctrl.verses = [];
  ctrl.getVerses = function(book, chap){
    DbService.getVerseList(book, chap).then(function(res){
    console.log('%%% verselist', res)
      ctrl.verses = res
    })
  }

  ctrl.openModal = function(verse){
    //console.log('%% open modal with', $scope.bookId, $scope.chapId, verse)
    $scope.verse = verse
    // TODO how to open modal
    $ionicModal.fromTemplateUrl('../template/bookIndex/verse-detail.html',{
      scope: $scope,
      animation: 'slide-in-up'
    })
    .then(function(modal){
      $scope.modal = modal
      $scope.modal.show()
     })
    // .then(function(){  $scope.modal.show() })
  }

  return ctrl;
}])

// verse detail
.controller('verseDetailCtrl', ['$scope','$stateParams', 'DbService','$state','$ionicModal', function( $scope, $stateParams, DbService, $state, $ionicModal) {
  // using routeParams
  var ctrl = this;
  ctrl.bookId = $scope.bookId;
  ctrl.chapId = $scope.chapId;
  ctrl.verse = $scope.verse;
  ctrl.selectedCategory = '';
  //console.log('%%% verse detail scope info', $scope)

  DbService.getVerseDetail(ctrl.bookId, ctrl.chapId, ctrl.verse)
  .then(function(res){
    ctrl.verseDetail = res.detail[0]
    console.log('%%%% get verse detail', res.detail)
    ctrl.catList = res.catList
  })

  // redirect to prior page
  ctrl.saveVerse = function(){
    // save verse
    DbService.saveVerse(ctrl.verseDetail)
    .then(function(){
      $scope.modal.hide()
    })
  }
  // select categories dropdown
  ctrl.getCategories = function(){
     DbService.getAllCategoryList()
    .then(function(res){
      ctrl.categories = res
    console.log('%%% get categories', ctrl.categories)
    })
  }
  // data-> a verse may only have one category for now
  ctrl.addVerseToCategory = function(){
    console.log('%%% add to category', ctrl.verseDetail.vid, ctrl.selectedCategory)
    DbService.addVerseToCategory(ctrl.verseDetail.vid, ctrl.selectedCategory)
  }
  ctrl.cancel = function(){
    $scope.modal.hide()
  }
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

  // TODO use the static names json file
  ctrl.getBooks = function(){
    // populate Bible bookList
    ctrl.bookList = ['','Genesis','Psalms','John','Acts']; // DbService.getBookList()
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
// word search page component
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
// categories page master list
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
