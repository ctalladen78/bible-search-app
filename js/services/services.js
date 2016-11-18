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
    getCategoryByVid : getCategoryByVid,
    getAllCategoryList : getAllCategoryList,
    saveVerse : saveVerse,
    addVerseToCategory : addVerseToCategory,
    addCategory: addCategory,
    wordSearch : wordSearch,
    addToFavorites : addToFavorites,
    isVidLiked : isVidLiked

  }
// https://www.npmjs.com/package/angular-file-upload
  // populate db from api endpoint
  function initDB(){
      // instantiate DB
    db =  new PouchDB('mypouchdb', {
      adapter: 'websql',
      skip_setup: true
    });
    console.log('%%% checking db for consistency')
    db.info(function(err, info){
      // count objects in bible.json
      if(info.doc_count === 0){
        populateTest();
        initFavorites();
      }
      else{
        syncToChanges()
      }
    })
    .then(console.log.bind(console))
    // db exists do nothing
    .then(function(){
      console.log('%%% db exists');
    })
    // db not initialized
    .catch(function(){
      console.log('%%% db does not exist')
      populateTest();
      initFavorites();
    })
  }

  function populateTest(){
    return $q.when(
        bibleScraper.getLocalTestBooks()
        .then(function(result){
            // var bibleLength = Object.keys(result).length
            db.bulkDocs(result)
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
          // console.log('%%% all docs', docs)
          var obj = {}; // nested object of arrays grouped by chapter

          /*
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
          */
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
        } else { // updated or inserted doc
          // change.doc holds the new doc
          onUpdatedOrInserted(change.doc);
        }
      })
      .on('complete', function(arg){
        console.log('%%%% changes complete', arg)
      })
      .on('error', console.log.bind(console))
    )
  }

  function printDocs(){
    getDocs()
    .then(function(docs){
      console.log('%%% get all docs', docs)
    })
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

  // return a list of books
  function getBooks(){
    var bookList = $http.get('./static-new-testament.json').then(function(res){
      return _.uniq(_.map(res.data, function(r){ return r.book}))
    })
      //console.log(bookList.data)
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
    // best practice use allDocs instead() of query()
    var verseList = getDocs()
    .then(function(res){
      var chaps =_.filter(res, function(i){return i.bookName === bookID})
      var verses = _.filter(chaps[0].bookList, function(j){return j.chapter === parseInt(chapID)})
      return _.map(verses,function(k){
        var obj = {}
        obj.verse = k.verse;
        obj.text = k.text
        return obj;
      })

    })
    return verseList
  }
  // return verse detail objects
  function getVerseDetail(bookID, chapID, verseID){
    var verseObj = getDocs()
    .then(function(res){
      // console.log('%%% get docs', res)
      console.log('%%% get verse detail', bookID, chapID, verseID)
      var chaps =_.filter(res, function(i){return i.bookName === bookID})
      var verses = _.filter(chaps[0].bookList, function(j){return j.chapter === parseInt(chapID)})
      // console.log('%%% get verses', verses)
      var verseObj ={}
      // filter and getCategoryList both returns arrays
      verseObj.detail = _.filter(verses,function(k){return k.verse === verseID })
      console.log('%%%% verse obj', verseObj)
      verseObj.catList = getCategoryByVid(verseObj.detail[0].vid)
      return verseObj
    })
    return verseObj
  }

  function getVerseBy(vid){
      return getDocs()
      .then(function(docs){
        var doc;
        _.forEach(docs, function(d){
          if(d.bookList){
            _.forEach(d.bookList,function(v){
              if(v.vid === vid){
                doc = v
              }
            })
          }
        })
        console.log('%%% getting verse by', vid, doc.vid)
        return doc
      })
  }

  // TODO save verse detail
  function saveVerse(verseObj){
    /*
    db.get(verseObj).then(function(res){
      db.put(verseObj)
    })
    */
    addVerseToCategory(verseObj)
    console.log(verseObj)
    return $q.when(true)
  }

  // add vid to favorites.vidList
  function addToFavorites(vid){
    getDocs()
    .then(function(docs){
      return _.filter(docs, function(d){ return d.type === 'favorite'})
    })
    .then(function(favorites){
      favorites.data.vidList.push(verse.vid)
      syncToChanges()
      printDocs()
    })
  }
  // return truthy if vid exists in favorites.vidList
  function isVidLiked(vid){
    getDocs()
    .then(function(docs){
      var fav =  _.filter(docs.data, function(d){ return d.type === 'favorite'})
      var isLiked =  _.filter(fav.vidList, function(f){ return f === vid})
      console.log('%%%% is liked', isLiked, vid, fav.vidList)
      return isLiked
    })
  }

  function removeFromFavorites(vid){
    getDocs()
    .then(function(docs){
      return _.filter(docs, function(d){ return d.type === 'favorite'})
    })
    .then(function(favorites){
      _.remove(favorites.vidList, function(i){return i === vid}) // remove vid from favorites
      syncToChanges()
      printDocs()
    })
  }
  // how to count reading history accurately
  // depending on which verse user is reading
  function updateReadingHistory(){

  }

  function wordSearch(term){
    return $q.when(function(){
      return list = [
      {"book": "Isiah", "chapter":12, "like":"true","category":[],"verse":14, "text": "For God so loved the world..."},
      {"book": "Hebrews", "chapter":33, "like":"true","category":[],"verse":15, "text": "That we ought not condemn..."},
      {"book": "Revelations", "chapter":45, "like":"true","category":[],"verse":16, "text": "When He shall return ..."}
      ];
    }
    )
  }
  // initialize favorites category as empty list so that it is ready to
  // have verses
  function initFavorites(){
    // add favorites category to db
    var favorite = {}
    var vidlist = ["John-3-14", "2corinthians-5-17", "Matthew-1-1"]
    favorite.type = "favorite"
    favorite.cid = new Date().toISOString()
    favorite.vidlist = vidlist
    // init like the verses
    $q.when(
      db.put(favorite)
      .then(function(){
        syncToChanges()
        printDocs()
       })
     )
  }
  // return a list of verses given favorites id
  // this is for the favorites page
  function getFavoriteList(){
    return getDocs()
    .then(function(docs){

console.log('%%% docs', docs)
      var favList = _.filter(docs, function(i){return i.type === "favorite"})
      console.log('%%% favlist', favList)
      favList = favList[0]
      var list = []
      _.each(favList, function(i){
          getVerseBy(i)
          .then(function(v){list.push(v); return list})
          .then(function(l){console.log('%%% liked verses',l)})
      })
      return list
    })
  }

  function renameCategory(vid, oldCatName,newCatName){
    /*
    db.get(cat.cid where cat.vid === vid)
    .then(function(res){
      res.catlist.map(function(i){
        if(i.catName === oldCatName){
          i.catName = newCatName
        }
      })
      return res
    })
    .then(function(i){db.put(res)})
    .then(function(){
      syncToChanges()
    })
    */
  }
  function deleteCategory(vid, catName){
    //db.get(vid).then(function(res){db.delete(vid)})
    /*
    .then(function(){
      syncToChanges()
    })
    */
  }
  // return a list of verses given verse id
  // this is for displaying what categories per associated verse
  function getCategoryByVid(vid){
    var catList = getDocs()
    .then(function(res){
      var allCats = _.filter(res, function(i){return i.type === 'category'})
      // TODO lookup lodash map path find
      var tempList = _.map(allCats, function(c){
        _.map(c.vidList, function(l){return l===vid})
      })
      // var catList = _.filter(allCats, function(i){return i.vidList === vid})
      console.log('%%% category list of ',vid, tempList)
    })
    return catList

  }
  // return list of verses by category id
  // this is for displaying verses per associated category
  function getCategoryByCid(cid){

  }
  // return all categories for selection
  function getAllCategoryList(){
    var catList = getDocs()
    .then(function(res){
      // console.log('%%% get docs ', res)
      var list = _.filter(res, function(i){return i.type === 'category'})
      var l2 = _.map(list, function(l){return l.catName})
      console.log('%%% get all categories ', l2)
      return l2
    })
    return catList
  }

  function addVerseToCategory(vobj){
    getDocs()
    .then(function(res){
      _.map(vobj.catList, function(catname){
        //TODO filter docs with catname
        var cat = _.filter(res, function(c){  c.catName === catname})
        console.log('%%% add verse to cat',cat)
        //TODO add vid to vidlist
        cat.vidList.push(catname)
        // TODO update category in db
        // updateCategory(cat, cat.name, cat.name)
      })
    })
  }

  // see: http://stackoverflow.com/questions/1674089/what-is-the-idiomatic-way-to-implement-foreign-keys-in-couchdb
  function addCategory(catName){
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
        printDocs()
      })
    )
    }
}])
