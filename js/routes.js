angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('menu', {
    url: '/menu',
    templateUrl: 'template/menu.html',
    abstract:true
  })

  .state('menu.bookIndex',{
    url: '/book-index',
    views: {
      'side-menu21': {
        templateUrl: 'template/bookIndex/bookIndex.html',
        controller: 'bookIndexCtrl'
      }
    }
  })
  .state('menu.chapterIndex', {
    url: '/chapter-index/:book',
    views: {
      'side-menu21':{
        templateUrl: 'template/bookIndex/chapterIndex.html',
        controller: 'chapterIndexCtrl'
      }
    }
  })
  .state('menu.search', {
    url: '/search',
    views: {
      'side-menu21': {
        templateUrl: 'template/search/search.html',
        controller: 'searchCtrl'
      }
    }
  })

  .state('menu.favorites', {
    url: '/favorites',
    views: {
      'side-menu21': {
        templateUrl: 'template/favorites/favorites.html',
        controller: 'favoritesCtrl'
      }
    }
  })

  .state('menu.categories', {
    url: '/categories',
    views: {
      'side-menu21': {
        templateUrl: 'template/categories/categories.html',
        controller: 'categoriesCtrl'
      }
    }
  })

  .state('menu.wordSearchResults', {
    url: '/:term',
    views: {
      'side-menu21': {
        templateUrl: 'template/search/word-search-results.html',
        controller: 'wordSearchResultsCtrl'
      }
    }
  })

  .state('menu.bookSearchResults', {
    url: '/:book/:chap',
    views: {
      'side-menu21': {
        templateUrl: 'template/search/book-search-results.html',
        controller: 'bookSearchResultsCtrl'
      }
    }
  })

  .state('menu.verseDetail', {
    url: '/detail/:book/:chap/:verse',
    views: {
      'side-menu21': {
        templateUrl: 'template/search/verse-detail.html',
        controller: 'verseDetailCtrl'
      }
    }
  })

  .state('editVerse', {
    url: '/edit/:book/:chap/:verse',
    templateUrl: 'template/search/edit-verse.html',
    controller: 'editVerseCtrl'

  })

  .state('menu.categoryDetail', {
    url: '/:categoryId',
    views: {
      'side-menu21': {
        templateUrl: 'template/categories/category-detail.html',
        controller: 'categoryDetailCtrl'
      }
    }
  })

  .state('menu.addCategory', {
    url: '/add-category/:categoryId',
    views: {
      'side-menu21': {
        templateUrl: 'template/categories/add-category.html',
        controller: 'addCategoryCtrl'
      }
    }
  })

  .state('menu.editCategory', {
    url: '/edit-category/:categoryId',
    views: {
      'side-menu21': {
        templateUrl: 'template/categories/edit-category.html',
        controller: 'editCategoryCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/menu/book-index')



});