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
  'jude',
  'revelation',
];

var version = 'akjv';

var psalmsUrl = 'https://getbible.net/json?text='+books[18]+'&v='+version+'&callback=JSON_CALLBACK';
var jeremiahUrl = 'https://getbible.net/json?text='+books[23]+'&v='+version+'&callback=JSON_CALLBACK';

angular.module('app.services')
// map data into the object components
.factory('bibleScraper',[ '$q', '$http', function($q, $http){
  return {
    'scrapeBookUngrouped' : function(book,version){
      var url = 'https://getbible.net/json?text='+book+'&v='+version+'&callback=JSON_CALLBACK';
      var promise = $http.jsonp(url).then(function(response){
        return packageBook(response.data);
      });
      return promise;
    },
    'getLocalTestBooks' : function(book, ver){
      return $http.get('./output-newtestament.json')
      .then(function(res){
        console.log('%%% initializing', res.data.bible)
        // var bible = JSON.parse(res.data)
        var bible = res.data.bible
        bible = _.forEach(bible, function(b){b._id = b.bookName})
        return bible
      })
    },
    'getOldTestamentBooks' : function(){
      return [
        'Genesis',
  'Exodus',
  'Leviticus',
  'Numbers',
  'Deuteronomy',
  'Joshua',
  'Judges',
  'Ruth',
  '1 Samuel',
  '2 Samuel',
  '1 Kings',
  '2 Kings',
  '1 Chronicles',
  '2 Chronicles',
  'Ezra',
  'Nehemiah',
  'Esther',
  'Job',
  'Psalms',
  'Proverbs',
  'Ecclesiastes',
  'Song of Solomon',
  'Isaiah',
  'Jeremiah',
  'Lamentations',
  'Ezekiel',
  'Daniel',
  'Hosea',
  'Joel',
  'Amos',
  'Obadiah',
  'Jonah',
  'Micah',
  'Nahum',
  'Habakkuk',
  'Zephaniah',
  'Haggai',
  'Zechariah',
  'Malachi',
      ]
    },
    'getNewTestamentBooks' : function(){
      return [
        'Matthew',
  'Mark',
  'Luke',
  'John',
  'Acts',
  'Romans',
  '1 Corinthians',
  '2 Corinthians',
  'Galatians',
  'Ephesians',
  'Philippians',
  'Colossians',
  '1 Thessalonians',
  '2 Thessalonians',
  '1 Timothy',
  '2 Timothy',
  'Titus',
  'Philemon',
  'Hebrews',
  'James',
  '1 Peter',
  '2 Peter',
  '1 John',
  '2 John',
  '3 John',
  'Jude',
  'Revelation',
      ]
    }
  }
  // returns a list of verses
    function packageBook(data){
      var book = [];// flattened list of verses
      angular.forEach(data.book,function(ch, key){
        angular.forEach(ch.chapter,function(v,k){
          var tempObj = {};
          //tempObj._id = new Date();
          tempObj.book = data.book_name;
          tempObj.chapter = ch.chapter_nr;
          tempObj.version = data.version;
          tempObj.verse = v.verse_nr;
          tempObj.text = v.verse;
          book.push(tempObj);
        })
      })
      //console.log('%%%%% flattened book array',book); // total number of verses
      return book;
    }
}])
