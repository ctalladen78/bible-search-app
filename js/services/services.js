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
    removeFromFavorites : removeFromFavorites,
    isVidLiked : isVidLiked,
    getVerseByCat : getVerseByCat,
    getCategoryByName : getCategoryByName
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
        populateDb();
        // .then(function(){})
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
      populateDb();
      // .then(function(){})
      initFavorites();
    })
  }

  function populateDb(){
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
      console.log('%%% get verses', verses)
      var verseObj ={}
      // filter and getCategoryList both returns arrays
      verseObj.detail = _.filter(verses,function(k){return k.verse === verseID })
      console.log('%%%% verse obj', verseObj)
      getCategoryByVid(verseObj.detail[0].vid)
      .then(function(cats){
        verseObj.catList = cats
      })
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
  // updates the favorites and categories only
  // verse object state does not change
  function saveVerse(verseDetail){
    // syncToChanges
    console.log('%%% save verse', verseDetail)
    return $q.when(function(){
      if(verseDetail.like){
        addToFavorites(verseDetail.vid)
      }
      if(!verseDetail.like){
        removeFromFavorites(verseDetail.vid)
      }

    })
    .then(function(){
      syncToChanges()
    })
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
  function removeFromFavorites(vid){
    getDocs()
    .then(function(docs){
      return _.filter(docs, function(d){ return d.type === 'favorite'})
    })
    .then(function(favorites){
      _.remove(favorites.vidList, function(i){return i === vid}) // remove vid from favorites
    })
  }

  // return truthy if vid exists in favorites.vidList
  function isVidLiked(vid){
    return getDocs()
    .then(function(docs){
      try{
      var fav =  _.filter(docs, function(d){ return d.type === 'favorite'})
      console.log('%% all favorites', fav[0].vidList)
      var isLiked =  _.some(fav[0].vidList, function(f){
        return f === vid
      })
      console.log('%%%% is liked', isLiked, vid )
    }catch(e){
      isLiked = false
    }
      return isLiked
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
    console.log('%%% init favorites')
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
      console.log('%%% favlist', favList[0].vidList)
      favList = favList[0].vidList // list of vids
      var list = [] // list of verses
      _.each(favList, function(i){
        // get verses from vids
          getVerseBy(i)
          .then(function(v){list.push(v); return list})
          .then(function(l){console.log('%%% liked verses',l)})
      })
      // return list
      return favList
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
  // return a list of category given verse id
  // this is for displaying what categories per associated verse
  function getCategoryByVid(vid){
    return getDocs()
    .then(function(res){
      var allCats = _.filter(res, function(i){return i.type === 'category'})
      var tempList = []
      _.forEach(allCats, function(c){
        _.forEach(c.vidList, function(l){
          if(l === vid){
            tempList.push(c.catName);
          }
        })
      })
      console.log('%%% category list of ',vid, tempList)
      return tempList
    })
  }

// return a list of verses given category id
  function getVerseByCat(cid){
    return getDocs()
    .then(function(res){
      var allCats = _.filter(res, function(i){return i.type === 'category'})
      // console.log('get all categories', allCats)
      var tempList = []
      _.forEach(allCats, function(c){
        _.forEach(c.vidList, function(vid){
          if(c.cid === cid){
            getVerseBy(vid)
            .then(function(v){tempList.push(v);})
            .then(function(v){console.log('%%% verse list of ',c.catName, tempList)})
          }
        })
      })
       return tempList
    })
  }
  // return list of verses by category id
  // this is for displaying verses per associated category
  function getCategoryByName(catName){
    return getDocs()
    .then(function(res){
      var allCats = _.filter(res, function(i){return i.type === 'category'})
      var ret;
      _.forEach(allCats, function(c){
        if(c.catName === catName){
           ret = c
         }
      })
      return ret
    })

  }
  // return all categories for selection
  function getAllCategoryList(){
    var catList = getDocs()
    .then(function(docs){
      // console.log('%%% get docs ', res)
      var catlist = _.filter(docs, function(i){return i.type === 'category'})
      var l2 = _.map(catlist, function(l){return l.catName})
      console.log('%%% get all categories ', l2)
      return l2
    })
    return catList
  }

  // add verse to category
  function addVerseToCategory(vid, catname){
    getDocs()
    .then(function(docs){
      var catlist = _.filter(docs, function(i){return i.type === 'category'})
      var selectedCat = _.filter(catlist, function(c){return c.catName === catname})
      selectedCat[0].vidList.push(vid)
      return selectedCat
    })
    .then(function(catobj){
      // save cat in db with updated vidlist
      console.log('%%% updating cat', catobj[0])
      db.get(catobj[0]._id)
      .then(function(doc){
        catobj[0]._rev = doc._rev
        db.put(catobj[0])
        .then(function(res){console.log('%%% added category',res)})
        .catch(function(er){ console.log('%%% add category error',er)})
      })
    })

  }

  // see: http://stackoverflow.com/questions/1674089/what-is-the-idiomatic-way-to-implement-foreign-keys-in-couchdb
  function addCategory(catName){
        // !! means truthy(not falsy), ! means falsy(not true ie null,undefined, empty)
    var newcat = {}
        newcat.catName = catName
        newcat.type = 'category'
        newcat.cid = new Date().toISOString()
        newcat._id = newcat.cid
        newcat.vidList = []
    return $q.when(newcat)
      .then(function(obj){
        console.log('%%% trying to add', obj.data)
        db.put(obj)
        .then(function(res){console.log('%%% added category',res)})
        .catch(function(er){ console.log('%%% add category error',er)})
      })
      .then(function(){syncToChanges(); })
      .then(function(){printDocs() })
  }
}])
