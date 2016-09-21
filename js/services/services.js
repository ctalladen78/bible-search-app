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
    var psalmsUrl = 'https://getbible.net/json?text=psalms&v='+version+'&callback=JSON_CALLBACK';
    bibleScraper.getBookUngrouped(psalmsUrl).then(function(data){
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
          $q.when(db.put(tempDoc).then(function(doc){
            console.log('successfully put doc', doc._id)
          }, function(){
            console.log('failed put doc', doc._id)
          }));
      })

      //console.log('%%% bible psalms object: ',data)
    });
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

