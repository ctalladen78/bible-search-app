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
.controller('bookSearchResultsCtrl', ['$scope','$stateParams', 'DbService','$ionicModal','$state','$window','$ionicHistory',
function($scope, $stateParams, DbService, $ionicModal, $state, $window, $ionicHistory) {
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
  // issues with modal http://stackoverflow.com/questions/30430160/why-isnt-my-ionic-modal-opening-on-an-android-4-4-device
  ctrl.openModal = function(verse){
    ctrl.verseId = verse
    $scope.verseId = verse
    console.log('%% open modal with', ctrl.bookId, ctrl.chapId, ctrl.verseId)
    $ionicModal.fromTemplateUrl('verse-detail.html', {
      scope: $scope,
      backdropClickToClose: false,
      animation: 'slide-in-up',
      hardwareBackButtonClose: true,
      focusFirstInput: true
    })
    // https://medium.com/@saniyusu/create-an-isolate-modal-with-ionic-v1
    .then(function(modal){
      $scope.modal = modal
      // console.log($scope.modal)
      $scope.modal.show()
    })
    // console.log($ionicHistory.viewHistory())
    // $state.go('menu.verseDetail',{book:ctrl.bookId, chap:ctrl.chapId, verse:ctrl.verseId})
  }
  // http://stackoverflow.com/questions/25854422/using-this-as-scope-when-creating-ionicmodal
  // http://www.gajotres.net/how-to-show-different-native-modal-windows-in-ionic-framework
  /*
  ctrl.loadModal = function(){
    $ionicModal.fromTemplateUrl('verse-detail.html', {
      scope: $scope,
      backdropClickToClose: false,
      animation: 'slide-in-up',
      hardwareBackButtonClose: true,
      focusFirstInput: true
    })
    // https://medium.com/@saniyusu/create-an-isolate-modal-with-ionic-v1
    .then(function(modal){
      $scope.modal = modal
      console.log($scope.modal)
    })
  }
  */

  return ctrl;
}])

// verse detail
.controller('verseDetailCtrl', ['$scope','$stateParams', 'DbService','$state','$ionicModal','$ionicHistory','$ionicLoading',
function( $scope, $stateParams, DbService, $state, $ionicModal, $ionicHistory, $ionicLoading) {
  // using routeParams
  var ctrl = this;
  ctrl.bookId = $stateParams.book;
  ctrl.chapId = $stateParams.chap;
  ctrl.verse = $stateParams.verse;
  ctrl.verse = $scope.verseId
  ctrl.selectedCategory = '';
  ctrl.verseDetail;

  DbService.getVerseDetail(ctrl.bookId, ctrl.chapId, ctrl.verse)
  .then(function(res){
    ctrl.verseDetail = res.detail[0]
    DbService.getCategoryByVid(ctrl.verseDetail.vid)
    .then(function(cats){ctrl.catList = cats})
     DbService.isVidLiked(ctrl.verseDetail.vid)
    .then(function(like){ctrl.verseDetail.like = like})
    console.log('%%%% get verse detail', ctrl)
  })

  ctrl.toggleLike = function(){
    ctrl.verseDetail = !ctrl.verseDetail.like
    console.log('%%% is liked? ', ctrl.verseDetail.like)
  }

  // redirect to prior page
  // https://codepen.io/mircobabini/post/ionic-how-to-clear-back-navigation-the-right-way
  ctrl.saveVerse = function(){
    if(!ctrl.verseDetail.like){DbService.removeFromFavorites(ctrl.verseDetail.vid)}
    if(ctrl.verseDetail.like){
      DbService.addToFavorites(ctrl.verseDetail.vid)
    }
    DbService.saveVerse(ctrl.verseDetail)
    .then(function(){
      // $ionicHistory.goBack()
    })
  }

  // select from all categories dropdown
  ctrl.getCategories = function(){
     DbService.getAllCategoryList()
    .then(function(res){
      ctrl.categories = res
    console.log('%%% get categories', ctrl.categories)
    })
  }
  // add vid to category.catList
  ctrl.addVerseToCategory = function(){
    console.log('%%% add to category', ctrl.verseDetail.vid, ctrl.selectedCategory)
    DbService.addVerseToCategory(ctrl.verseDetail.vid, ctrl.selectedCategory)
  }
  ctrl.cancel = function(){
    $scope.modal.hide()
    // $ionicHistory.goBack()
    // console.log($ionicHistory.viewHistory())
  }
  return ctrl;
}])


// dropdown search component
.controller('searchCtrl', ['$scope','$stateParams', 'DbService', function($scope, $stateParams, DbService) {
  var ctrl = this;
  ctrl.word = ''; // search term
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
  // highlight the search term in text
  var ctrl = this;
  ctrl.word = $stateParams.term;
  ctrl.getVerses = function(word){
  DbService.wordSearch(ctrl.word) // return list of verse objects
  .then(function(res){
    ctrl.verses = res

  })
  .catch(function(){ ctrl.verses = []})

  }
  return ctrl;
}])

// favorites page master list
.controller('favoritesCtrl', ['$scope','$stateParams', 'DbService', function($scope, $stateParams, DbService) {
  var ctrl = this;
  // return list of verse objects
  ctrl.getVerses = function(){
    DbService.getFavoriteList()
    .then(function(docs){
      ctrl.verses = docs // returns a list of vids
    })
    .catch(function(){
      ctrl.verses = []
    })
  }
  // TODO this should autofocus into the verse index page
  ctrl.openModal = function(verseDetail){
    $scope.verseId = verse
    console.log('%% open modal with', ctrl.bookId, ctrl.chapId, ctrl.verseId)
    $ionicModal.fromTemplateUrl('verse-detail.html', {
      scope: $scope,
      backdropClickToClose: false,
      animation: 'slide-in-up',
      hardwareBackButtonClose: true,
      focusFirstInput: true
    })
    // https://medium.com/@saniyusu/create-an-isolate-modal-with-ionic-v1
    .then(function(modal){
      $scope.modal = modal
      // console.log($scope.modal)
      $scope.modal.show()
    })
    // console.log($ionicHistory.viewHistory())
    // $state.go('menu.verseDetail',{book:ctrl.bookId, chap:ctrl.chapId, verse:ctrl.verseId})
  }
  return ctrl;
}])

// categories page master list
.controller('categoriesCtrl', ['$scope','$stateParams','DbService', function($scope, $stateParams, DbService) {
  var ctrl = this;
  ctrl.category = '';
  ctrl.getCategories = function(){
    DbService.getAllCategoryList() // return list of categories
    .then(function(docs){
      ctrl.categories = docs
    })
    .catch(function(){console.log('%%% could not add category')})
  }
  return ctrl;
}])

// category detail is a list of verses
.controller('categoryDetailCtrl', ['$scope','$stateParams','DbService', function($scope, $stateParams, DbService){
  var ctrl = this;
  // using routeParams
  ctrl.category = $stateParams.cat;
  ctrl.getVerses = function(){
    //DbService.getVerseList("Matthew", 1)
    // TODO get category.catList, parse the catList, then make list using getVerseBy(vid)
  }
  return ctrl
}])

// add new empty category
.controller('addCategoryCtrl', ['$scope','$stateParams','DbService',function($scope, $stateParams, DbService) {
  var ctrl = this;
  // using routeParams write to db
  ctrl.category =''
  ctrl.addCategory = function(){
    DbService.addCategory(ctrl.category)
    .catch(function(){console.log('%%% could not add category')})
  }
  return ctrl
}])

// rename existing category
.controller('editCategoryCtrl', ['$stateParams','$scope','DbService',function($stateParams, $scope, DbService) {
  var ctrl = this;
  // using routeParams write to db
  return ctrl
}])
