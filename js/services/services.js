angular.module('app.services', [])

.factory('DbService', ['bibleScraper', '$q', '$http', function(bibleScraper,$q, $http){

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
    getVerseDetail : getVerseDetail,
    getFavoriteList : getFavoriteList,
    getCategoryList : getCategoryList
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
              //console.log(JSON.parse(result.bible[i]).bookList)
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
  // TODO test that the list of books are unique
  // TODO test that list of books are in cardinal order
  // TODO test that scope does not get a copy of the database
  function getBooks(){
    var bookList = $http.get('./static-new-testament.json').then(function(res){
      console.log(res.data)
      return _.uniq(_.map(res.data, function(r){ return r.book}))
    })
    return bookList // read from test.json

  }
  // return a list of verses given book id, chapter id
  function getChapterList(bookID){
    // filter docs using bookID, chapID
    var chapList = $http.get('./static-new-testament.json').then(function(res){
      return _.map(_.filter(res.data, function(i){return i.book === bookID}),function(j){
        var obj = {}
        obj.chapter = j.chapter;
        obj.chapterheading = j["chapterheading"];
        //console.log(obj)
        return obj;
      })
    })
    return chapList

  }
  // return list of verse objects
  function getVerseList(bookID, chapID){
    //var verseList = getDocs()
    var verseList = $http.get('./static-new-testament.json').then(function(res){
      var chaps =_.filter(res.data, function(i){return i.book === bookID})
      var verses = _.filter(chaps, function(j){return j.chapter === parseInt(chapID)})
      // db.query
      var arr = [{verse : 11, text: "LoremLoremLoremLorem"},
      {verse : 11, text: "LoremLoremLoremLorem"}]
      return arr
      /*
      return _.map(verses,function(k){
        var obj = {}
        obj.verse = k.verse;
        obj.text = k.text
        return obj;
      })
      */
    })
    console.log('%%% verselist', verseList)
    return verseList
  }
  // return verse detail objects
  function getVerseDetail(bookID, chapID, verseID){
    // TODO db.query(docs, bookID, chapID, verseID)
    var verseObj = $http.get('./test.json')
    .then(function(res){
      var chaps =_.filter(res.data, function(i){return i.book === bookID})
      var verses = _.filter(chaps, function(j){return j.chapter === parseInt(chapID)})
      var vid = bookID+'-'+chapID+'-'+verseID
      // var verseObj = db.query(vid)
      var verseObj = _.map(verses,function(k){
        var obj = {}
        obj.vid = k.vid
        obj.book = k.book
        obj.version = k.version
        obj.chapter = k.chapter
        obj.verse = k.verse;
        obj.text = k.text
        obj.like = k.like
        obj[last-read-date] = k[last-read-date]
        obj[read-count] = k[read-count]
        obj.categories = getCategoryList(k.vid)
        return obj;
      })
      return verseObj
    })
    console.log('%%% get verse obj', verseObj.data)
  }
  // save verse detail
  function saveVerse(verseObj){

  }
  // user likes/unlikes this verse
  function toggleFavorites(vid){
    db.query(vid).then(function(obj){
      obj.like = !obj.like
      return obj
    })
    .then(function(obj){
      db.put(obj)
      syncToChanges()
    })
  }
  // how to count reading history accurately
  // depending on which verse user is reading
  function updateReadingHistory(){

  }
  // return a list of verses given favorites id
  // this is for the favorites page
  function getFavoriteList(favid){
    var favList = _.filter(docs, function(i){return i.like === true})
    console.log('%%% favList', favList)
    return favList
  }
  function updateCategory(vid, catName){

    syncToChanges()
  }
  function deleteCategory(vid, catName){
    syncToChanges()
  }
  // return a list of verses given verse id
  function getCategoryList(vid){
    //categoryList = db.query(category)
    var allCats = _.filter(docs, function(i){return i.alias === 'category'})
    var catList = _.filter(docs, function(i){return i.vid === vid})
    console.log('%%% category of ',vid, catList)
    return catList

  }
  // TODO model category object
  // {alias, cid, vid, catlist = []}
  // see: http://stackoverflow.com/questions/1674089/what-is-the-idiomatic-way-to-implement-foreign-keys-in-couchdb
  function addCategory(vid, catName){
    return $q.when(
      db.get(cid)
      .then(function(obj){
        // !! means truthy(not falsy), ! means falsy(not true ie null,undefined, empty)
        if(!catName){
         catName = Date.toDateString(); // default category is today's date
        }
        else{
          catName = catName;
        }
        obj.catlist.push(catName)
        return obj;
        })
      .then(function(obj){
        db.put(obj);
        syncToChanges();
      })
    )
    }
}])
