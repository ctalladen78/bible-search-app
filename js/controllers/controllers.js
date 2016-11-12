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

// favorites page master list
.controller('favoritesCtrl', ['$scope','$stateParams', 'DbService', function($scope, $stateParams, DbService) {
  var ctrl = this;
  // data-> return list of verses that are liked from db
  ctrl.getVerses = function(){
    DbService.getFavoriteList() // return list of verse objects
    .then(function(docs){
      ctrl.verses = docs
    })
    .catch(function(){
      ctrl.verses = []
    })
  }
  ctrl.openModal = function(vid){

  }
  return ctrl;
}])

// dropdown search component
.controller('searchCtrl', ['$scope','$stateParams', 'DbService', function($scope, $stateParams, DbService) {
  var ctrl = this;
  ctrl.word = '';
  ctrl.bookId = '';
  ctrl.chapId = '';

  ctrl.getBooks = function(){
    DbService.getBooks().then(function(res){
    ctrl.bookList = res
   })
  }
  ctrl.getChaps = function(){
    if(!ctrl.bookId){
      console.log('no books selected');
      ctrl.chapList = [];
    }else{
      DbService.getChapterList(ctrl.bookId)
      .then(function(res){
          ctrl.chapList = _.map(res,function(c){return c.chapter})
          console.log('%%% ctrl chapter list: ', ctrl.chapList);
        })
    }
  }
  ctrl.print = function(){
    //$scope.$apply()
    console.log('%%% chapter', ctrl.chapId)
    $stateParams.bookId = ctrl.bookId
    $stateParams.chapId = ctrl.chapId
    console.log('%%% params', $stateParams)
  }
  /*
  ctrl.getVerses = function(){
    if(!ctrl.bookId){
      console.log('no books selected');
      ctrl.verseList = [];
    }
    else if(!ctrl.chapId){
      console.log('no chapters selected');
      ctrl.verseList = [];
    }
    else{
      DbService.getVerseList(bookId, chapId)
      .then(function(res){
          console.log('%%% verselist', res)
            ctrl.verses = res
      })
    }
  }
  */
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



// categories page master list
.controller('categoriesCtrl', ['$scope','$stateParams','DbService', function($scope, $stateParams, DbService) {
  // data-> get all categories from db
  var ctrl = this;
  ctrl.category = '';
  ctrl.getCategories = function(){
    DbService.getAllCategoryList() // return list of categories
    .then(function(docs){
      ctrl.categories = docs
    })
  }
  return ctrl;
}])
// category detail is a list of verses
.controller('categoryDetailCtrl', ['$scope','$stateParams','DbService', function($scope, $stateParams, DbService){
  // using routeParams
  ctrl.category = $stateParams.cat;
  ctrl.getVerseList = function(){
    //DbService.getVerseList("Matthew", 1)
    // TODO get category.catList, parse the catList, then make list using getVerseBy(vid)
  }
}])
// add new empty category
.controller('addCategoryCtrl', ['$scope','$stateParams',function($scope, $stateParams) {
  // using routeParams write to db

}])
// rename existing category
.controller('editCategoryCtrl', ['$stateParams','$scope',function($stateParams, $scope) {
  // using routeParams write to db

}])
