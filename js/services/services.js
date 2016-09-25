angular.module('app.services', [])

.factory('DbService', ['bibleScraper', '$q', function(bibleScraper,$q){
  // DONE: using pouchdb operations
  var db;
  return{
    initDB : initDB,
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
    db =  new PouchDB('mypouchdb', {adapter: 'websql'});
    window.PouchDB = PouchDB; // required by fauxton debugger
    console.log('%%%%%% pouchdb exists: ',db);

    db.info().then(
      console.log.bind(console));
    // DONE populate db with test data
    var version = 'akjv'; // kjv, korean, web, etc
    var psalmsUrl = 'https://getbible.net/json?text=psalms&v='+version+'&callback=JSON_CALLBACK';
        var ezraUrl = 'https://getbible.net/json?text=ezra&v='+version+'&callback=JSON_CALLBACK';

    bibleScraper.getBookUngrouped(ezraUrl).then(function(data){
      // data is an array of objects
      // push data into pouchdb
        data.forEach(function(i){
          var tempDoc = {};
          var tempid = ''+i.book+i.chapter+i.verse+i.version;
          tempDoc._id = tempid;
          tempDoc.book = i.book;
          tempDoc.chapter = i.chapter;
          tempDoc.verse = i.verse;
          tempDoc.text = i.text;
          tempDoc.version = i.version;
          // TODO: categories
          // TODO: categories.favorites (list of verses in favorites category)
          // TODO: add/edit/delete categories
          $q.when(db.put(tempDoc).then(function(doc){
            console.log('successfully put doc', doc._id)
          }, function(){
            console.log('failed put doc', doc._id)
          }));
      })

      //console.log('%%% bible psalms object: ',data)
    });

    initFavorites();
  }

  function reactToChanges() {
  db.changes({live: true, since: 'now', include_docs: true}).on('change', function (change) {
    if (change.deleted) {
      // change.id holds the deleted id
      onDeleted(change.id);
    } else { // updated/inserted
      // change.doc holds the new doc
      onUpdatedOrInserted(change.doc);
    }
    renderDocs();
  }).on('error', console.log.bind(console));
}
function onDeleted(id) {
  var index = binarySearch(docs, id);
  var doc = docs[index];
  if (doc && doc._id === id) {
    docs.splice(index, 1);
  }
}

function onUpdatedOrInserted(newDoc) {
  var index = binarySearch(docs, newDoc._id);
  var doc = docs[index];
  if (doc && doc._id === newDoc._id) { // update
    docs[index] = newDoc;
  } else { // insert
    docs.splice(index, 0, newDoc);
  }
}
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
  // return a list of verses given book id, chapter id
  function getChapter(bookID, chapID){
    // TODO alldocs log all values
    $q.when(db.allDocs({include_docs:true}))
    .then(function(docs){
      return console.log(docs.rows);
    })
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

  }
  // return a list of verses given categories id
  function getCategory(catID){

  }
  // clear db
  function destroyDB(){
    db.destroy().then(function() { console.log('ALL YOUR BASE ARE BELONG TO US') });
  }
}])

