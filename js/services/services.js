angular.module('app.services', [])

.factory('DbService', ['bibleScraper', '$q', function(bibleScraper,$q){

  var db;
  var docs = [];
  var categoryList = [];

  return{
    docs : docs,
    initDB : initDB,
    getDocs : getDocs,
    getBooks : getBooks,
    getChapterList : getChapterList,
    getVerseList : getVerseList,
    editVerse : editVerse,
    getFavoriteList : getFavoriteList,
    getCategoryList : getCategoryList,
    getCategory : getCategory,
    destroyDB : destroyDB
  }
// https://www.npmjs.com/package/angular-file-upload
  // populate db from api endpoint
  function initDB(){
      // instantiate DB
    db =  new PouchDB('mypouchdb', {
      adapter: 'websql',
      skip_setup: true
    });

    db.info(function(err, info){
      // count objects in bible.json
      if(info.doc_count === 0){
        populateTest();
      }
      // if partial count then run diff algorithm
    })
    .then(console.log.bind(console))
    // db exists
    .then(function(){
      console.log('%%% db exists');
    })
    // db not initialized
    .catch(function(){
      console.log('%%% db does not exist')
      populateTest();
    })
    //  populate db with test data
    var version = 'akjv'; // kjv, korean, web, etc
    var book = 'ezra';
    /*
    bibleScraper.scrapeBookUngrouped(book, version)
    .then(function(result){
      // push data into pouchdb
      db.bulkDocs(result);
    })
    */
        // create empty favorites list
    // maybe seed it with John 3:16
    //initFavorites();
  }
  function populateTest(){
    return $q.when(
        bibleScraper.getLocalTestBooks()
        .then(function(result){
            var bibleLength = Object.keys(result.bible).length
            //console.log(JSON.parse(result.bible[0]).bookList)
            for(var i=0;i<bibleLength;i++){
              console.log(JSON.parse(result.bible[i]).bookList)
              db.bulkDocs(JSON.parse(result.bible[i]).bookList)
            }

//            return db.bulkDocs(result)
        })
        .then(function(result){
          console.log('%%% init db:', result)
        })
      )
  }
  // return the synced docs cache with db
  function getDocs(){
    return $q.when(
      db.allDocs({include_docs:true})
        .then(function(res){
          docs = res.rows.map(function(row){return row.doc;});
            var obj = {}; // nested object of arrays grouped by chapter

          obj = _.groupBy(docs, function(i){
            return i.chapter;
          })

          // sort ascending by i.verse
          for(var key in obj){
            if(obj.hasOwnProperty(key)){
              obj[key].sort(function(a,b){
                return a.verse - b.verse;
              })
            }//developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
          }
          //console.log('%%%% grouped object', obj[1]);
          docs = obj[1];
        })
        .then(function(){
          syncToChanges();
          return docs;
        })
        .catch(console.log.bind(console))
    );
  }
  // apply db changes to docs cache
  // this is done whenever we need to sync the cache with db
  function syncToChanges() {
    return $q.when(
      db.changes({
        live: true,
        since: 'now',
        include_docs: true
      })
      .on('change', function(change) {
        if (change.deleted) {
          // change.id holds the deleted id
          console.log('%%% deleting:', change.deleted);
          onDeleted(change.id);
        } else { // updated/inserted
          // change.doc holds the new doc
          onUpdatedOrInserted(change.doc);
        }
      })
      .on('complete', function(arg){
        console.log('%%%% changes complete', arg)
      })
      .on('error', console.log.bind(console))
    )
    //.then(function(){ console.log('%%% test')})
  }

  // remove from cache
  function onDeleted(id) {
    var index = binarySearch(docs, id);
    var doc = docs[index];
    if (doc && doc._id === id) {
      docs.splice(index, 1);
    }
  }
  // helper: sync db & docs cache on change
  function onUpdatedOrInserted(newDoc) {
    var index = binarySearch(docs, newDoc._id);
    var doc = docs[index];
    if (!!doc && doc._id === newDoc._id) { // update
      console.log('%%% updating: ', doc._id, '  ',newDoc._id);
      docs[index] = newDoc;
    } else { // insert newDoc
      console.log('%%% adding: ', doc);
      docs.splice(index, 0, newDoc);
    }
  }
  // helper: return index of docId
  function binarySearch(arr, docId) {
    var low = 0, high = arr.length, mid;
    while (low < high) {
      mid = (low + high) >>> 1; // faster version of Math.floor((low + high) / 2)
      arr[mid]._id < docId ? low = mid + 1 : high = mid
    }
    return low;
  }
  // initialize favorites category as empty list so that it is ready to
  // have verses
  function initFavorites(){
    // add favorites category to db
  }
  // return a list of books
  // TODO make sure the list of books are unique
  function getBooks(){
    return $q.when(getDocs()).then(function(res){
      var bookList = _.map(res, function(item){
        return item.book
      })
      return bookList
    })
  }
  // return a list of verses given book id, chapter id
  function getChapterList(bookID){
    // filter docs using bookID, chapID
      return $q.when(getDocs()).then(function(res){
        console.log('%%% get chapters', bookID, res)
        var chapterList = _.map(res, function(item){
          return item.book.chapterList
      })
    })
  }
  // return a verse detail
  function getVerseList(bookID, chapID){
    return $q.when(getDocs()).then(function(res){
        console.log('%%% get book', bookID, '%%% chapter', chapID)
        var chapterList = _.map(res, function(item){
          return item.book.chapterList.verseList
      })
    })
  }
  // save verse
  function editVerse(verseObj){

  }
  // return a list of verses given favorites id
  function getFavoriteList(favID){

  }
  // return a list of categories
  function getCategoryList(){
    //categoryList = db.query(category)
  }
  // return a list of verses given categories id
  function getCategory(catID){

  }
  // TODO: do a join one category to many verse
  // see: http://stackoverflow.com/questions/1674089/what-is-the-idiomatic-way-to-implement-foreign-keys-in-couchdb
  function addCategory(catName){
    return $q.when(function(name){
      var cat = {};
      // !! means truthy(not falsy), ! means falsy(not true ie null,undefined, empty)
      if(!name){
         cat.categoryName = Date.toDateString();
      }
      else{
        cat._id = new Date();
        cat.categoryName = name;
      }
      return cat;
    }).then(function(res){db.put(res);})
  }
  // clear db
  function destroyDB(){
    db.destroy().then(function() { console.log('ALL YOUR BASE ARE BELONG TO US') });
  }
}])
