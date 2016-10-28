angular.module('app.services', [])

.factory('DbService', ['bibleScraper', '$q', function(bibleScraper,$q){
  // DONE: using pouchdb operations
  var db;
  var docs = []; // TODO will this be exposed to controller?
  var categoryList = [];
  return{
    docs : docs,
    initDB : initDB,
    getDocs : getDocs,
    getBooks : getBooks,
    getChapter : getChapter,
    getVerse : getVerse,
    editVerse : editVerse,
    getFavoriteList : getFavoriteList,
    getCategoryList : getCategoryList,
    getCategory : getCategory,
    destroyDB : destroyDB
  }

  // populate db from api endpoint
  function initDB(){
      // instantiate DB
    db =  new PouchDB('mypouchdb', {
      adapter: 'websql',
      skip_setup: true
    });
    //window.PouchDB = PouchDB; // required by fauxton debugger
    //console.log('%%%%%% pouchdb exists: ',db);

    db.info().then(console.log.bind(console));
    // DONE populate db with test data
    var version = 'akjv'; // kjv, korean, web, etc
    var book = 'ezra';
    /*
    bibleScraper.scrapeBookUngrouped(book, version)
    .then(function(result){
      // push data into pouchdb
      db.bulkDocs(result);
    })
    */
    return $q.when(bibleScraper.getLocalTestBooks(book, version)
        .then(function(result){
      //    console.log('%%% local docs:', result.data.bible)
        return db.bulkDocs(result.data.bible)
         .then(function(res){
           console.log('%%% db bulkdocs: ',res)
           return res
         })
      })
      .then(function(result){
        console.log('%%% init db:', result)
      })
  )
    // create empty favorites list
    // maybe seed it with John 3:16
    //initFavorites();
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
        }
      )
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
      .on('error', console.log.bind(console))
    )
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
  function getBooks(){
    //return _.map(docs,'books');
    return docs;
  }
  // return a list of verses given book id, chapter id
  function getChapter(bookID, chapID){
    // filter docs using bookID, chapID
  }
  // return a verse detail
  function getVerse(bookID, chapID, verseID){

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
