// makes get request to getbible.net/api
// create json file to seed the database
// see: tutlane.com/tutorial/angularjs/angularjs-http-jsonp-service-method-example
// there is an error with github cdn http://stackoverflow.com/questions/17341122/link-and-execute-external-javascript-file-hosted-on-github
/*
References:
1. getbible.net/api
2. bible-api.com
3. http://www.biblestudystart.com/outlines/genesis.html
*/
var books = [
  'genesis',
  'exodus',
  'leviticus',
  'numbers',
  'deuteronomy',
  'joshua',
  'judges',
  'ruth',
  '1samuel',
  '2samuel',
  '1kings',
  '2kings',
  '1chronicles',
  '2chronicles',
  'ezra',
  'nehemiah',
  'esther',
  'job',
  'psalms',
  'proverbs',
  'ecclesiastes',
  'songofsolomon',
  'isaiah',
  'jeremiah',
  'lamentations',
  'ezekiel',
  'daniel',
  'hosea',
  'joel',
  'amos',
  'obadiah',
  'jonah',
  'micah',
  'nahum',
  'habakkuk',
  'zephaniah',
  'haggai',
  'zechariah',
  'malachi',
  'matthew',
  'mark',
  'luke',
  'john',
  'revelations',
  'acts',
  'romans',
  '1corinthians',
  '2corinthians',
  'galatians',
  'ephesians',
  'philippians',
  'colossians',
  '1thessalonians',
  '2thessalonians',
  '1timothy',
  '2timothy',
  'titus',
  'philemon',
  'hebrews',
  'james',
  '1peter',
  '2peter',
  '1john',
  '2john',
  '3john',
  'jude'
];

var version = 'akjv';

var psalmsUrl = 'https://getbible.net/json?text='+books[18]+'&v='+version+'&callback=JSON_CALLBACK';
//var jeremiahUrl = 'https://getbible.net/json?text='+books[23]+'&v='+version+'&callback=JSON_CALLBACK';


angular.module('app.services')

/*
TODO using asynchronous pattern do:
1. make a final results array
2. make an array containing promises
2.a each promises contain results of get request
2.b push the results of each promise to the final results array
3. use Promise.all on promises array
4. finally push the final results array into a db
google: promise all tutorial, html5rocks, toptal
*/
// map data into the object components
.factory('bibleScraper',[ '$q', '$http', function($q, $http){
  return {
    'getBookGrouped': function(url){
      var promise = $http.jsonp(url).then(function(response){
        // TODO: loop through the books list and set books into pouch db or bibleCache
        // google: ode to code group and display data with underscore and angularjs
        // google: angular filter groupby example
        var obj = {}; // nested object of arrays grouped by chapter
        obj = _.groupBy(packageBook(response.data), function(i){
          return i.chapter;
        });
        //console.log('%%%% grouped object', obj);
        return obj;
      });
      return promise;
    },
    'getBookUngrouped' : function(url){
      var promise = $http.jsonp(url).then(function(response){
        return packageBook(response.data);
      });
      return promise;
    }
  }
    function packageBook(data){
      var book = [];// flattened list of verses
      angular.forEach(data.book,function(ch, key){
        angular.forEach(ch.chapter,function(v,k){
          var tempObj = {};
          tempObj.book = data.book_name;
          tempObj.version = data.version;
          tempObj.chapter = ch.chapter_nr;
          tempObj.text = v.verse;
          tempObj.verse = v.verse_nr;
          book.push(tempObj);
        })
      })
      //console.log('%%%%% flattened book array',book); // total number of verses
      //$q.all(book)
      return book;
    }

}])
// TODO: for reference only archive this block of code
.factory('ctrl',['$scope', 'getData', '$http', 'db', function($scope, getData, $http,db){

  //$scope.bible = [];// array of verse objects
  //db.getInfo;

  // TODO use ionic infinite scroll api to manage what shows in vm 'feed pattern'
  // google: ionic infinite scroll, mcgivery
  bibleScraper.getBook(psalmsUrl).then(function(data){
    $scope.bible = data;//append or push
    console.log('%%% bible scope object: ',$scope.bible)

  })
  // infinite scroll functionality
  // see: http://ionicframework.com/docs/api/directive/ionInfiniteScroll/
  $scope.loadMore = function() {
    /*
    $http.get('/more-items').success(function(items) {
      useItems(items);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
    */
    //$scope.$broadcast('scroll.infiniteScrollComplete');

  }
  // stop infinite scroll when no more data is available
  $scope.moreDataCanBeLoaded = function(){
    return true;
  }
}]);