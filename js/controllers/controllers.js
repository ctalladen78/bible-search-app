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
.controller('chapterIndexCtrl',['$scope','$stateParams', 'DbService', function( $scope, $stateParams, DbService){
  var ctrl = this;
  ctrl.bookId = $stateParams.book;

  DbService.getChapterList($stateParams.book).then(function(res){
//    ctrl.chapList = _.map(res, function(i){return i.chapterheading})
    ctrl.chapList = res
    console.log('%%% ctrl chapter list: ', ctrl.chapList);
  })

  return ctrl;
}])
// verse list search results master list
.controller('bookSearchResultsCtrl', ['$ionicLoading','$http','$scope','$stateParams', 'DbService','$ionicModal','$state','$window','$ionicHistory',
function($ionicLoading, $http, $scope, $stateParams, DbService, $ionicModal, $state, $window, $ionicHistory) {
  // using routeParams
  var ctrl = this;
  $scope.bookId = $stateParams.book;
  $scope.chapId = $stateParams.chap;
  ctrl.bookId = $scope.bookId
  ctrl.chapId = $scope.chapId
  ctrl.verses = [];

  showLoading = function(){
    $ionicLoading.show({
      template: '<div><ion-spinner icon="dots"></ion-spinner><p>Loading</p><p>Verses...</p></div>',
      showBackdrop: true,
      maxWidth: 200
      // showDelay: 2  // seconds
    })
  }
  showLoading()

  ctrl.getVerses = function(book, chap){
    DbService.getVerseList(book, chap).then(function(res){
    // console.log('%%% verselist', res)
      $ionicLoading.hide()
      ctrl.verses = res
    })
  }

  ctrl.gotoNextChapter = function(){
    // if next chapter is null then get next book
    var hasnext;
    return $http.get('./static-new-testament.json')
    .then(function(res){
      var booklist = res.data
      hasnext = _.find(booklist, function(bk){
        var nextch = $scope.chapId
        nextch++
        // console.log('%%%% bk', bk, nextch)
        return bk.book === $scope.bookId && bk.chapter ===nextch
      })
      // this should happen once at the end of revelation
      if(!hasnext){
        var index = _.findLastIndex(booklist, function(bk){
          console.log('%%%% end of book', bk.book,bk.chapter, $scope.bookId, $scope.chapId)
          var ch = parseInt($scope.chapId)
          return bk.book === $scope.bookId && bk.chapter ===ch
        })
        index++
        var nextbook = booklist[index]
        console.log('%%% next book ', nextbook, index)
        if(!nextbook){
          nextbook = {}
          nextbook.book = "Matthew"
          nextbook.chapter = 1
        }
        $state.go('menu.verseIndex',{book:nextbook.book, chap:nextbook.chapter})
      }else{
        console.log('%%% has next chapter ', hasnext)
        var nextchapter = hasnext.chapter
        $scope.bookId = hasnext.book
        $scope.chapId = hasnext.chapter
        // $state.reload()
        $state.go('menu.verseIndex',{book:$scope.bookId, chap:$scope.chapId})
      }
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
.controller('verseDetailCtrl', ['$timeout','$ionicPopover','$q','$scope','$stateParams', 'DbService','$state','$ionicModal','$ionicHistory','$ionicLoading',
function($timeout,$ionicPopover, $q, $scope, $stateParams, DbService, $state, $ionicModal, $ionicHistory, $ionicLoading) {
  // using routeParams
  var ctrl = this;
  ctrl.bookId = $stateParams.book || $scope.bookId
  ctrl.chapId = $stateParams.chap || $scope.chapId
  ctrl.verse = $stateParams.verse;
  // ctrl.verse = $scope.verseId
  ctrl.selectedCategory = '';
  ctrl.catList = []
  ctrl.verseDetail = {}
  // img/1Peter.jpg replaced spaces
  var imgurl = ctrl.bookId.replace(/\s/g,'')
  ctrl.backgroundImg = 'img/'+imgurl+'.jpg'

  var vid = ''+ctrl.bookId+'-'+ctrl.chapId+'-'+ctrl.verse

  showLoading = function(){
    $ionicLoading.show({
      template: '<div><ion-spinner icon="dots"></ion-spinner><p>Loading</p></div>',
      showBackdrop: true,
      maxWidth: 200
      // showDelay: 2  // seconds
    })
  }

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    // viewData.enableBack = false;
    console.log('%%% before enter view data',viewData)
    showLoading()
    initView()
  });



  initView = function(){
    console.log('%%% init view ')
    DbService.getVerseDetail(ctrl.bookId, ctrl.chapId, ctrl.verse)
    .then(function(verse){
      ctrl.verseDetail =  verse.detail
      // console.log('%%% verse detail', ctrl.verseDetail)
    })

    DbService.getCategoryByVid(vid)
    .then(function(cats){
      // console.log('%%% get category by vid',cats)
      ctrl.catList = cats
      $ionicLoading.hide()
    })

    DbService.isVidLiked(vid)
    .then(function(isliked){
      ctrl.verseDetail.like = isliked
      // $state.reload()
      // console.log('%%%% get verse detail', ctrl)
    })
  }
  showLoading()
  initView()

  reloadView = function(){
    $timeout(function(){
      showLoading()
      initView()
      },100);
  }

  ctrl.toggleLike = function(){
    ctrl.verseDetail.like = !ctrl.verseDetail.like
    console.log('%%% is liked pressed to ', ctrl.verseDetail.like)
    if(ctrl.verseDetail.like === true){
      DbService.addToFavorites(ctrl.verseDetail.vid)
      .then(function(){
        showLoading()
        initView()
        reloadView()
      })
    }
    if(ctrl.verseDetail.like === false){
      DbService.removeFromFavorites(ctrl.verseDetail.vid)
      .then(function(){
        showLoading()
        initView()
        reloadView()
      })
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
  ctrl.addVerseToCategory = function(cat){
    console.log('%%% add to category', ctrl.verseDetail.vid, ctrl.selectedCategory)
    DbService.addVerseToCategory(ctrl.verseDetail.vid, cat)
    .then(function(){
    $scope.popover.hide();
      $state.reload()
      // $state.go('menu.verseDetail',{book:ctrl.bookId, chap:ctrl.chapId, verse:ctrl.verse})
    })
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

  ctrl.getAvatar = function(acat){
    return acat.split('')[0].toUpperCase()
  }
  ctrl.gotoCategory = function(cat){
    //  clear history
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('menu.categoryDetail', {categoryId: cat})
  }
  //versedetail-popover.html
  $ionicPopover.fromTemplateUrl('versedetail-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hidden popover
  $scope.$on('popover.hidden', function() {
    // Execute action
    showLoading()
    initView()
    reloadView()
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });
  return ctrl;
}])


// dropdown search component
.controller('searchCtrl', ['$ionicHistory','$state','$ionicLoading','$scope','$stateParams', 'DbService',
 function( $ionicHistory, $state, $ionicLoading, $scope, $stateParams, DbService) {
  var ctrl = this;
  ctrl.word = ''; // search term
  ctrl.bookId = '';
  ctrl.chapId = '';

  // admob.createBannerView(options, successCallback, failCallback);
  // admobSvc.AD_SIZE.BANNER
  // admobSvc.AD_TYPE.BANNER
  var adOptions = {}
  var adSuccess = function(){}
  var adFailed = function(){}
  // admobSvc.createBannerView();

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    // viewData.enableBack = false;
    console.log('%%% before enter favorites view ',viewData)
    ctrl.bookId =''
    ctrl.chapId =''
    ctrl.chapList = []
    console.log('%%%% vm ', ctrl.bookId, ctrl.chapId, ctrl.bookList, ctrl.chapList)
  });

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
  ctrl.gotoVerse = function(){
    if(ctrl.bookId.length === 0 || ctrl.chapId.length === 0) return
    $state.go('menu.verseIndex',{book:ctrl.bookId,chap:ctrl.chapId})
  }

  return ctrl;
}])

// word search page component
.controller('wordSearchResultsCtrl', ['$ionicHistory','$state','$ionicLoading','$scope','$stateParams', 'DbService',
 function($ionicHistory, $state, $ionicLoading, $scope, $stateParams, DbService) {
  // using routeParams return list of verses containing query term
  // highlight the search term in text
  var ctrl = this;
  ctrl.word = $stateParams.term;

  ctrl.getVerses = function(word){
    $ionicLoading.show({
    template: '<div><ion-spinner icon="dots"></ion-spinner><p>Loading...</p></div>',
    showBackdrop: true,
    maxWidth: 200
    // showDelay: 2  // seconds
  })
    DbService.wordSearchAllBible(ctrl.word) // return list of verse objects
    .then(function(res){
      $ionicLoading.hide()
      ctrl.verses = res
      console.log('%%% word search results ', res)
    })
    // .catch(function(){ ctrl.verses = []})
  }

  ctrl.saveAsCategory = function(){
    // save vids as new category
    var vidlist = []
    var count =0
    while(ctrl.verses.length >75){
      count++
      _.times(75, function(i){
        // console.log('%%%% breaking up category',ctrl.verses[i].vid)
        vidlist.push(ctrl.verses[i].vid)
      })
      console.log('%%% breaking up category',count,vidlist.length)
      var str = ctrl.word+' (saved search '+count+')'
      DbService.addCategory(str,vidlist)
      ctrl.verses.splice(0,75)//reduce by 75 items
      console.log('%%% search results length ',ctrl.verses.length)
      vidlist = []
    }
    console.log('%%% big search reduced', ctrl.verses.length)
    // ctrl.verses now reduced to less than 150
    _.each(ctrl.verses, function(v){
      vidlist.push(v.vid)
    })
    //make new category
    DbService.addCategory(ctrl.word,vidlist)
    // go to category page
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('menu.categories')
  }

  return ctrl;
}])

// favorites page master list
//https://www.bennadel.com/blog/2852-understanding-how-to-use-scope-watch-with-controller-as-in-angularjs.htm
// http://www.benlesh.com/2013/10/title.html
  //https://www.sitepoint.com/mastering-watch-angularjs/
.controller('favoritesCtrl', ['$ionicLoading','$timeout','$state','$ionicConfig','$q','$scope','$stateParams', 'DbService','$ionicModal', function($ionicLoading,$timeout,$state, $ionicConfig, $q, $scope, $stateParams, DbService, $ionicModal) {
  var ctrl = this;
  ctrl.showDelete = false;
  ctrl.vid;
  ctrl.itemCanSwipe = true

  ctrl.gotoVerseIndexPage = function(vid){
    var vidstring = vid.split('-')
    $scope.bookId = vidstring[0]
    $scope.chapId = vidstring[1]
    $scope.verseId = vidstring[2]
    $state.go('menu.verseIndex',{book:$scope.bookId,chap:$scope.chapId})
  }

  // return list of verse objects
  ctrl.getFavorites = function(){
    DbService.getFavoriteList()
    .then(function(docs){
      ctrl.verses = docs
      // console.log('%%% favorite docs', docs, docs.length)
    })
  }

  console.log('%%% get max cache', $ionicConfig.views.maxCache())
  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    // viewData.enableBack = false;
    // console.log('%%% before enter favorites view ',viewData)
    ctrl.getFavorites()
  });

  ctrl.doRefresh = function(){
    console.log('%%%% pulled to refresh')
    // $state.reload()
    //Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete');
    console.log('%%%% fav list: ',ctrl.verses)
  }

  // TODO this should autofocus into the verse index page
  ctrl.openModal = function(vid){
    var vidstring = vid.split('-')
    $scope.bookId = vidstring[0]
    $scope.chapId = vidstring[1]
    $scope.verseId = vidstring[2]
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
.controller('categoriesCtrl', ['$timeout','$q','$ionicPopover','$state','$ionicLoading','$scope','$stateParams','DbService', function($timeout, $q, $ionicPopover, $state,$ionicLoading, $scope, $stateParams, DbService) {
  var ctrl = this;
  ctrl.showDelete = false;
  ctrl.newCategoryName;
  ctrl.categories;
  var oldCatName;

  showLoading = function(){
    $ionicLoading.show({
      template: '<div><ion-spinner icon="dots"></ion-spinner><p>Loading...</p></div>',
      showBackdrop: true,
      maxWidth: 200
      // showDelay: 2  // seconds
    })
  }

  reloadView = function(){
    $timeout(function(){
      ctrl.getCategories()
      },100);
  }

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    $scope.isCategory = true
    // viewData.enableBack = false;
    showLoading()
    reloadView()
    console.log('%%%  enter categories view ',viewData)
  });

  $scope.$on('$ionicView.leave', function (event, viewData) {
    $scope.isCategory = false
    console.log('%%%  leaving categories view ',$scope.isCategory)
  })

  ctrl.renameCategoryItem = function(){
    if(ctrl.newCategoryName.length === 0)return
    DbService.renameCategory(oldCatName,ctrl.newCategoryName)
    .then(function(){
      $scope.closePopover();
      showLoading()
      reloadView()
    })
  }



  ctrl.deleteCategory = function(cat){
    // if(cat.length === 0) return
      _.remove(ctrl.categories, function(c){return c === cat})
      console.log('%%% categories after delete', ctrl.categories)
    DbService.deleteCategory(cat)
    .then(function(){
      // $state.reload()
    })
  }

  ctrl.getCategories = function(){
    DbService.getAllCategoryList() // return list of categories
    .then(function(docs){
    $ionicLoading.hide()
    console.log('%%% get all categories', docs)
      ctrl.categories = _.reverse(docs)
      $q.when(ctrl.categories)
    })
    .catch(function(){console.log('%%% could not get category')})
  }

  ctrl.doRefresh = function(){
    console.log('%%%% pulled to refresh')
    $scope.$apply()
    //Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete');
    console.log('%%%% cat list: ',ctrl.categories)
  }

  //rename-popover.html
  $ionicPopover.fromTemplateUrl('rename-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event)
    oldCatName = $event.srcElement.innerText
    console.log('%%% old cat', oldCatName, typeof(oldCatName))
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hidden popover
  $scope.$on('popover.hidden', function() {
    // Execute action
    showLoading()
    reloadView()
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });
  return ctrl;
}])

// category detail page has a list of verses
.controller('categoryDetailCtrl', ['$ionicLoading','$ionicPopover','$state','$scope','$stateParams','DbService','$ionicModal',
 function($ionicLoading,$ionicPopover,$state, $scope, $stateParams, DbService, $ionicModal){
  var ctrl = this;
  ctrl.vid;
  ctrl.category = $stateParams.categoryId;
  ctrl.showDelete = false
  ctrl.newCategoryName;

  $ionicLoading.show({
    template: '<div><ion-spinner icon="dots"></ion-spinner><p>Loading...</p></div>',
    showBackdrop: true,
    maxWidth: 200
    // showDelay: 2  // seconds
  })

  ctrl.getVerses = function(){
    DbService.getCategoryByName(ctrl.category)
    .then(function(cat){
      console.log('get category by cid', cat)
      DbService.getVerseByCat(cat.doc._id)
      .then(function(verses){
        $ionicLoading.hide()
        ctrl.verseList = verses
        console.log('%%% verse list', ctrl.verseList)
      })
    })
  }

  ctrl.deleteCategoryItem = function(vid){
      _.remove(ctrl.verseList, function(c){return c.vid === vid})
      DbService.removeVerseFromCategory(vid, ctrl.category)
      .then(function(){
        $state.reload();
      })
  }

  ctrl.gotoVerseIndexPage = function(vid){
    var vidstring = vid.split('-')
    $scope.bookId = vidstring[0]
    $scope.chapId = vidstring[1]
    $scope.verseId = vidstring[2]
    $state.go('menu.verseIndex',{book:$scope.bookId,chap:$scope.chapId})
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
    if(ctrl.catName.length===0)return
    DbService.addCategory(ctrl.catName)
    .then(function(){$ionicHistory.goBack()})
  }
  ctrl.cancel = function(){
    $ionicHistory.goBack()
  }
  return ctrl
}])
/*
// from the ionic-material theme
.controller('AppCtrl', function($scope, $ionicModal, $ionicPopover, $timeout) {
    // Form data for the login modal
    $scope.loginData = {};
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
        navIcons.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }
    };

    $scope.setExpanded = function(bool) {
        $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function(location) {
        var hasHeaderFabLeft = false;
        var hasHeaderFabRight = false;

        switch (location) {
            case 'left':
                hasHeaderFabLeft = true;
                break;
            case 'right':
                hasHeaderFabRight = true;
                break;
        }

        $scope.hasHeaderFabLeft = hasHeaderFabLeft;
        $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (!content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }

    };

    $scope.hideHeader = function() {
        $scope.hideNavBar();
        $scope.noHeader();
    };

    $scope.showHeader = function() {
        $scope.showNavBar();
        $scope.hasHeader();
    };

    $scope.clearFabs = function() {
        var fabs = document.getElementsByClassName('button-fab');
        if (fabs.length && fabs.length > 1) {
            fabs[0].remove();
        }
    };
})
*/
