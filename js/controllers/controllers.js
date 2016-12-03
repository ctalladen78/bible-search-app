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
    // ctrl.verseId = verse
    // $scope.verseId = verse
    console.log('%% open modal with', ctrl.bookId, ctrl.chapId, ctrl.verseId)
    $ionicModal.fromTemplateUrl('verse-detail.html', {
      scope: $scope,
      backdropClickToClose: false,
      animation: 'slide-in-up',
      hardwareBackButtonClose: true,
      focusFirstInput: true
    })
    // https://medium.com/@saniyusu/create-an-isolate-modal-with-ionic-v1
    // .then(function(modal){
      // $scope.modal = modal
      // console.log($scope.modal)
      // $scope.modal.show()
      // })
    // console.log($ionicHistory.viewHistory())
    $state.go('menu.verseDetail',{book:$scope.bookId, chap:$scope.chapId, verse:verse})
  }
  // http://stackoverflow.com/questions/25854422/using-this-as-scope-when-creating-ionicmodal
  // http://www.gajotres.net/how-to-show-different-native-modal-windows-in-ionic-framework
      // https://medium.com/@saniyusu/create-an-isolate-modal-with-ionic-v1
      /*
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
  ctrl.bookId = $stateParams.book || $scope.bookId
  ctrl.chapId = $stateParams.chap || $scope.chapId
  ctrl.verse = $stateParams.verse;
  // ctrl.verse = $scope.verseId
  ctrl.selectedCategory = '';
  ctrl.catList = []
  ctrl.verseDetail = {}
  var vid = ''+ctrl.bookId+'-'+ctrl.chapId+'-'+ctrl.verse

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = false;
    console.log('%%% before enter view data',viewData)
});

  DbService.getVerseDetail(ctrl.bookId, ctrl.chapId, ctrl.verse)
  .then(function(verse){
    ctrl.verseDetail =  verse.detail
    console.log('%%% verse detail', ctrl.verseDetail)
  })

  DbService.getCategoryByVid(vid)
  .then(function(cats){
    console.log('%%% get category by vid',cats)
    ctrl.catList = cats
  })

  DbService.isVidLiked(vid)
  .then(function(isliked){
    ctrl.verseDetail.like = isliked
    // $state.go($state.currentState, {}, {reload:true})
    console.log('%%%% get verse detail', ctrl)
  })

  ctrl.toggleLike = function(){
    ctrl.verseDetail.like = !ctrl.verseDetail.like
    console.log('%%% is liked? ', ctrl.verseDetail.like)
    if(ctrl.verseDetail.like){
      DbService.addToFavorites(ctrl.verseDetail.vid)
      // .then(function(){$scope.$apply()})
    }
    if(!ctrl.verseDetail.like){
      DbService.removeFromFavorites(ctrl.verseDetail.vid)
      // .then(function(){$scope.$apply()})
    }
  }

  // redirect to prior page
  // https://codepen.io/mircobabini/post/ionic-how-to-clear-back-navigation-the-right-way
  ctrl.saveVerse = function(){

    DbService.saveVerse(ctrl.verseDetail)
    .then(function(){
      if($scope.modal)
    $scope.modal.hide()
    else
    $ionicHistory.goBack()

    })
  }

  // select from all categories dropdown
  ctrl.getCategories = function(){
     DbService.getAllCategoryList()
    .then(function(res){
      ctrl.categories = res
    console.log('%%% get all categories', ctrl.categories)
    })
  }
  // add vid to category.catList
  ctrl.addVerseToCategory = function(){
    console.log('%%% add to category', ctrl.verseDetail.vid, ctrl.selectedCategory)
    DbService.addVerseToCategory(ctrl.verseDetail.vid, ctrl.selectedCategory)
  }
  ctrl.cancel = function(){
    if($scope.modal)
    $scope.modal.hide()
    else
    $ionicHistory.goBack()
    // console.log($ionicHistory.viewHistory())
  }

  $scope.$on('$destroy', function(){
    console.log('modal closed');
    if($scope.modal)
    $scope.modal.remove()
  })
  // $scope.$on('modal.removed', function(){console.log('modal closed');$scope.modal.remove()})

  ctrl.removeVerseFromCategory = function(acat){
    DbService.removeVerseFromCategory(vid, acat)
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
//https://www.bennadel.com/blog/2852-understanding-how-to-use-scope-watch-with-controller-as-in-angularjs.htm
// http://www.benlesh.com/2013/10/title.html
.controller('favoritesCtrl', ['$ionicLoading','$timeout','$state','$ionicConfig','$q','$scope','$stateParams', 'DbService','$ionicModal', function($ionicLoading,$timeout,$state, $ionicConfig, $q, $scope, $stateParams, DbService, $ionicModal) {
  var ctrl = this;
  ctrl.showDelete;
  ctrl.vid;
  // ctrl.verses = []
  // ctrl.itemCanSwipe = false;
  //https://www.sitepoint.com/mastering-watch-angularjs/

  console.log('%%% get max cache', $ionicConfig.views.maxCache())
  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = false;
    console.log('%%% before enter view data',viewData)
    DbService.getFavoriteList()
    .then(function(docs){
      ctrl.verses = docs // returns a list of vids TODO watch apply
      console.log('%%% favorite docs', docs, docs.length)
      // console.log('%%% favorite test', ctrl.verses, ctrl.verses.length)
    })
});
  /*
  $ionicLoading.show({
    template: '<div><ion-spinner icon="android"></ion-spinner><p>Loading...</p></div>',
    showBackdrop: true,
    maxWidth: 200
    // showDelay: 2  // seconds
  })

  $timeout(function(){
    $ionicLoading.hide()
  },1000)
  .then(function(){
    // $scope.$apply()
    ctrl.getFavorites()
  })
  */

  // return list of verse objects
  ctrl.getFavorites = function(){
    DbService.getFavoriteList()
    .then(function(docs){
      ctrl.verses = docs // returns a list of vids TODO watch apply
      console.log('%%% favorite docs', docs)
    })

  }

  ctrl.showDelete = function(){

  }
  ctrl.itemCanSwipe = function(){

  }
  ctrl.reset = function(){
    // console.log('resetting')
    // $state.go($state.current, {}, { reload: true });
  }
  ctrl.doRefresh = function(){
    console.log('%%%% pulled to refresh')
    $scope.$apply()
    //Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete');
    console.log('%%%% fav list: ',ctrl.verses)
  }

  // TODO this should autofocus into the verse index page
  ctrl.openModal = function(vid){
    ctrl.vid = vid
    var vidstring = vid.split('-')
    $scope.bookId = vidstring[0]
    $scope.chapId = vidstring[1]
    $scope.verseId = vidstring[2]
    console.log('%% open modal with', vidstring)
    /*
    $ionicModal.fromTemplateUrl('./verse-detail.html', {
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
    */
    // console.log($ionicHistory.viewHistory())
    $state.go('menu.verseDetail',{book:$scope.bookId, chap:$scope.chapId, verse:$scope.verseId})
  }

  return ctrl;
}])

// categories page master list
.controller('categoriesCtrl', ['$scope','$stateParams','DbService', function($scope, $stateParams, DbService) {
  var ctrl = this;
  ctrl.category = '';
  ctrl.categories = []

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = false;
    console.log('%%%  enter view data',viewData)
});

  ctrl.getCategories = function(){
    DbService.getAllCategoryList() // return list of categories
    .then(function(docs){
    console.log('%%% get all categories', docs)
      ctrl.categories = docs
    })
    .catch(function(){console.log('%%% could not get category')})
  }
  return ctrl;
}])

// category detail page has a list of verses
.controller('categoryDetailCtrl', ['$state','$scope','$stateParams','DbService','$ionicModal', function($state, $scope, $stateParams, DbService, $ionicModal){
  var ctrl = this;
  ctrl.vid;
  ctrl.category = $stateParams.categoryId;
  ctrl.getVerses = function(){
    DbService.getCategoryByName(ctrl.category)
    .then(function(cat){
      console.log('get category by cid', cat)
      DbService.getVerseByCat(cat.doc._id)
      .then(function(verses){
        ctrl.verseList = verses
      })
    })
  }

  // TODO this should autofocus into the verse index page
  ctrl.openModal = function(vid){
    ctrl.vid = vid
    var vidstring = vid.split('-')
    $scope.bookId = vidstring[0]
    $scope.chapId = vidstring[1]
    $scope.verseId = vidstring[2]
    console.log('%% open modal with', vidstring)
    $ionicModal.fromTemplateUrl('verse-detail.html', {
      scope: $scope,
      backdropClickToClose: false,
      animation: 'slide-in-up',
      hardwareBackButtonClose: true,
      focusFirstInput: true
    })
    // https://medium.com/@saniyusu/create-an-isolate-modal-with-ionic-v1
    // .then(function(modal){
      // $scope.modal = modal
      // console.log($scope.modal)
      // $scope.modal.show()
    // })
    // console.log($ionicHistory.viewHistory())
    $state.go('menu.verseDetail',{book:$scope.bookId, chap:$scope.chapId, verse:$scope.verseId})
  }
  return ctrl
}])

// add new empty category
.controller('addCategoryCtrl', ['$scope','$stateParams','DbService','$ionicHistory', function($scope, $stateParams, DbService,$ionicHistory) {
  var ctrl = this;
  // using routeParams write to db
  ctrl.catName =''
  ctrl.addCategory = function(){
    DbService.addCategory(ctrl.catName)
    .then(function(){$ionicHistory.goBack()})
  }
  ctrl.cancel = function(){
    $ionicHistory.goBack()
  }
  return ctrl
}])

// TODO: parking lot item
// rename existing category
.controller('editCategoryCtrl', ['$stateParams','$scope','DbService',function($stateParams, $scope, DbService) {
  var ctrl = this;
  // using routeParams write to db
  return ctrl
}])

.controller('verseDetailModalCtrl', ['$stateParams','$scope','DbService',function($stateParams, $scope, DbService) {
  var ctrl = this;
  // using routeParams write to db
  return ctrl
}])
