angular.module('app.services', [])

.factory('DbService', ['bibleScraper', '$q', '$http', function(bibleScraper,$q, $http){

  var db;
  var docs = [];

  return{
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
    removeVerseFromCategory :removeVerseFromCategory,
    addCategory: addCategory,
    wordSearchAllBible : wordSearchAllBible,
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

    console.log('%%% checking db for consistency')

    db =  new PouchDB('mypouchdb', {
      adapter: 'websql',
      skip_setup: true
    });

    db.info(function(err, info){
      // count objects in bible.json
      if(info.doc_count === 0){
        populateDb()
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
      populateDb()
    })
  }

  function populateDb(){
    return $q.when(
      bibleScraper.getLocalTestBooks()
      .then(function(result){
          // var bibleLength = Object.keys(result).length
          return db.bulkDocs(result)
      })
      .then(function(result){
        initFavorites();
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

  // detect db change then update the docs cache
  // not bidirectional so updating the docs cache doesnt affect the db
  function syncToChanges() {
    return $q.when(
      db.changes({
        live: true,
        since: 'now',
        include_docs: true
      })
      .on('change', function(change) {
        if (change.deleted) {
          // change.id has the deleted id
          onDeleted(change.id);
        } else { // updated or inserted doc
          // change.doc has the new doc
          onUpdatedOrInserted(change.doc);
        }
      })
      .on('complete', function(arg){
        console.log('%%%% db sync to cache complete', arg)
      })
      .on('error', console.log.bind(console))
    )
  }

  // remove from cache
  function onDeleted(id) {
    console.log('%%% on change delete');
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
      console.log('%%% on change update: ', doc._id, '  ',newDoc._id);
      docs[index] = newDoc;
    } else { // insert newDoc
      console.log('%%% on change adding: ', newDoc);
      docs.splice(index, 0, newDoc);
    }
  }

  function printDocs(){
    getDocs()
    .then(function(docs){
      console.log('%%% get all docs', docs)
    })
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
    return db.allDocs({include_docs:true, startkey:bookID,endkey:bookID})
    .then(function(res){
      var book =res.rows[0].doc
      console.log('%%% get verse list',book)
      var verses = _.filter(book.bookList, function(j){return j.chapter === parseInt(chapID)})
      return _.map(verses,function(k){
        var obj = {}
        obj.verse = k.verse;
        obj.text = k.text
        return obj;
      })
    })
  }

  // return verse detail object from verse index page
  function getVerseDetail(bookID, chapID, verseID){
      var vid = ''+bookID+'-'+chapID+'-'+verseID
      var verseObj ={}
      return getVerseBy(vid)
      .then(function(res){
        verseObj.detail = res
        // console.log('%%%% get verse detail', verseObj)
        return verseObj
      })
  }

  // returns a promise
  // lookup the book per vid bookname then search all the verses of that book
  function getVerseBy(vid){
      var str = vid.split('-')
      var start = str[0]
      var end = str[0]+'\uffff'
      return db.allDocs({include_docs:true, startkey:start,endkey:end})
      .then(function(docs){
        var book = docs.rows[0].doc
        var verse = _.filter(book.bookList, function(b){
          return b.vid === vid
        })
        // console.log('%%% getting verse by', vid, verse[0])
        return verse[0]
      })
  }
  // updates the favorites and categories only
  // verse object state does not change
  function saveVerse(verseDetail){
    // syncToChanges
    console.log('%%% save verse', verseDetail)
      if(verseDetail.like){
        return addToFavorites(verseDetail.vid)
      }
      if(!verseDetail.like){
        return removeFromFavorites(verseDetail.vid)
      }

  }

  // add vid to favorites.vidList
  // replace favorites in db
  function addToFavorites(vid){
    return $q.when(db.allDocs({include_docs:true,startkey: 'favorite-', endkey: 'favorite-\uffff'}))
    .then(function(docs){
      var favorites = docs.rows[0].doc
      favorites.vidList.push(vid)
      favorites.vidList = _.uniq(favorites.vidList)
      console.log('%%% added to favorites',vid,favorites)
      db.get(favorites._id)
      .then(function(doc){
        favorites._rev = doc._rev
        db.put(favorites)
        // .then(function(res){console.log('%%% added vid to favorites',res)})
        .catch(function(er){ console.log('%%% add to fav error',er)})
      })
    })
  }

  function removeFromFavorites(vid){
    return $q.when(db.allDocs({include_docs:true,startkey: 'favorite-', endkey: 'favorite-\uffff'}))
    .then(function(docs){
      // console.log('%%% get favorites',docs.rows)
      var favorites = docs.rows[0].doc
      _.remove(favorites.vidList, function(i){return i === vid}) // remove vid from favorites
      console.log('%%% remove from favorites',vid, favorites)
      db.get(favorites._id)
      .then(function(doc){
        favorites._rev = doc._rev
        db.put(favorites)
        .then(function(res){console.log('%%% removed vid to favorites',res)})
        .catch(function(er){ console.log('%%% add to fav error',er)})
      })
    })
  }

  // return truthy if vid exists in favorites.vidList
  function isVidLiked(vid){
    return $q.when(db.allDocs({include_docs:true,startkey: 'favorite-', endkey: 'favorite-\uffff'}))
    .then(function(docs){
      // console.log('%%% get favorites',docs.rows)
      var favorites = docs.rows[0].doc
      try{
      var isLiked =  _.some(favorites.vidList, function(f){
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

  // https://github.com/nolanlawson/pouchdb-quick-search
  function wordSearchAllBible(term){

    return $q.when(db.allDocs({include_docs:true}))
    // return $q.when(db.search({
    //   query: 'Chronicles',
    //   fields:'bookName',
    //   include_docs:true,
    //   highlighting: true,
    //   highlighting_pre: '<em>',
    //   highlighting_post: '</em>'
    // }))
    .then(function(res){
      console.log('%%% all docs', res)
        var retlist = []
        var count =0
        $q.when(_.each(res.rows, function(o){
          var bklist = o.doc.bookList
          var bkname = o.doc.bookName
          _.each(bklist, function(i){
            count++
            console.log('%%% searching ',count, i)
            if(i.text.includes(term)) {
              retlist.push(i)
            }
          })
        })
      )
      console.log('%%% search results', retlist)
      return retlist
    })
  }
  function wordSearchOldTestament(){
    return $q.when(db.allDocs({include_docs:true}))
    .then(function(res){
      console.log('%%% all docs', res)
        var retlist = []
        var count =0
        $q.when(_.each(res.rows, function(o){
          var bklist = o.doc.bookList
          var bkname = o.doc.bookName
          if(isNewTestament(bkname)){
            _.each(bklist, function(i){
              count++
              console.log('%%% searching ',count, i)
              if(i.text.includes(term)) {
                retlist.push(i)
              }
            })
        }
        })
      )
      console.log('%%% search results', retlist)
      return retlist
    })
  }

  function wordSearchNewTestament(){
    return $q.when(db.allDocs({include_docs:true}))
    .then(function(res){
      console.log('%%% all docs', res)
        var retlist = []
        var count =0
        $q.when(_.each(res.rows, function(o){
          var bklist = o.doc.bookList
          var bkname = o.doc.bookName
          if(isNewTestament(bkname)){
            _.each(bklist, function(i){
              count++
              console.log('%%% searching ',count, i)
              if(i.text.includes(term)) {
                retlist.push(i)
              }
            })
        }
        })
      )
      console.log('%%% search results', retlist)
      return retlist
    })
  }

  function isOldTestament(bookname){
    var old = bibleScraper.getOldTestamentBooks()
    old.some(function(b){
      return b === bookname
    })
  }

  function isNewTestament(bookname){
    var newt = bibleScraper.getOldTestamentBooks()
    newt.some(function(b){
      return b === bookname
    })
  }
  // initialize favorites category as empty list so that it is ready to
  // have verses
  function initFavorites(){
    // add favorites category to db
    console.log('%%% init favorites')
    var favorite = {}
    var vidlist = ["John-3-16", "2 Corinthians-5-17", "Matthew-1-1"]
    favorite.type = "favorite"
    var temp = new Date().toISOString()
    var fid = 'favorite-'+temp
    favorite._id = fid
    favorite.vidList = vidlist
    // init like the verses
    $q.when(
      db.put(favorite)
      .then(function(){
        syncToChanges()
        // printDocs()
       })
     )
  }
  // return a list of verses given favorites id
  // this is for the favorites page
  function getFavoriteList(){
    return $q.when(db.allDocs({include_docs:true, startkey: 'favorite-', endkey: 'favorite-\uffff'}))
    .then(function(docs){
      // console.log('%%% docs', docs)
      // console.log('%%% favlist', docs.rows[0].doc.vidList)
      favList = docs.rows[0].doc.vidList // list of vids
      var templist = [] // list of verses
      _.each(favList, function(fav){
        // get verses from vids
          // console.log('%%% vid', fav)
           $q.when(getVerseBy(fav))
          .then(function(vid){
            templist.push(vid);
            // console.log('%%% favorite list ',templist)
          })
          // .catch(function(e){console.log('%%% error get verse by vid ', i, e)})
      })
      return templist
    })
    // .then(function(list){
        // console.log('%%% returning list of favorites: ', list)
      // return list
    // })
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

  // return a list of categories given verse id
  // this is for displaying what categories per associated verse
  function getCategoryByVid(vid){
    return $q.when(db.allDocs({include_docs:true, startkey: 'category-', endkey: 'category-\uffff'}))
    .then(function(docs){
      // console.log('%%% get category by vid', vid, docs.rows)
      var allCats = docs.rows
      var catList = []
      _.forEach(allCats, function(c){
        _.forEach(c.doc.vidList, function(v){
          if(v === vid){
            catList.push(c.doc.catName);
          }
        })
      })
      // console.log('%%% category list of ',vid, catList)
      return catList
    })
  }

  // return a list of verses given category id
  function getVerseByCat(cid){
    return $q.when(db.allDocs({include_docs:true,startkey: 'category-', endkey: 'category-\uffff'}))
    .then(function(docs){
      console.log('%%% get verse by category',cid)
      var allCats = docs.rows
      // console.log('get all categories', allCats)
      var tempList = []
      _.forEach(allCats, function(c){
        if(c.doc._id === cid){
          _.forEach(c.doc.vidList, function(vid){
            // console.log(c.doc._id, cid)
            getVerseBy(vid)
            .then(function(v){tempList.push(v);})
          })
        }
      })
        console.log('%%% verse list of by category', tempList)
       return tempList
    })
  }
  // return list of verses by category id
  // this is for displaying verses per associated category
  function getCategoryByName(catName){
    return $q.when(db.allDocs({include_docs:true,startkey: 'category-', endkey: 'category-\uffff'}))
    .then(function(docs){
      console.log('%%% get category by name',docs.rows)
      var allCats = docs.rows
      var ret = []
      _.forEach(allCats, function(c){
        if(c.doc.catName === catName){
           ret = c
         }
      })
      return ret
    })

  }
  // return all categories for selection
  function getAllCategoryList(){
    return $q.when(db.allDocs({include_docs:true,startkey: 'category-', endkey: 'category-\uffff'}))
    .then(function(docs){
      console.log('%%% get all categories',docs.rows)
      var l2 = _.map(docs.rows, function(l){return l.doc.catName})
      console.log('%%% get all categories ', l2)
      return l2
    })
  }

  // add verse to category
  function addVerseToCategory(vid, catname){
    return $q.when(db.allDocs({include_docs:true, startkey:'category-', endkey: 'category-\uffff'}))
    .then(function(docs){
      console.log('%%% add verse to categories',vid,docs.rows)
      var catlist = docs.rows
      var selectedCat = _.filter(catlist, function(c){return c.doc.catName === catname})
      selectedCat[0].doc.vidList.push(vid)
      selectedCat[0].doc.vidList = _.uniq(selectedCat[0].doc.vidList)
      return selectedCat
    })
    .then(function(catobj){
      // save cat in db with updated vidlist
      console.log('%%% updating cat', catobj[0])
      db.get(catobj[0].doc._id)
      .then(function(doc){
        catobj[0].doc._rev = doc._rev
        db.put(catobj[0].doc)
        .then(function(res){console.log('%%% update append category',res)})
        .catch(function(er){ console.log('%%% add category error',er)})
      })
    })
  }

  function removeVerseFromCategory(vid, catname){
    return $q.when(db.allDocs({include_docs:true, startkey:'category-', endkey: 'category-\uffff'}))
    .then(function(docs){
      console.log('%%% remove verse from categories',vid, docs.rows)
      var catlist = docs.rows
      var selectedCat = _.filter(catlist, function(c){return c.doc.catName === catname})
      _.remove(selectedCat[0].doc.vidList, function(c){return c === vid})
      // save cat in db with updated vidlist
      console.log('%%% updating cat', selectedCat[0].doc.vidList)
      db.get(selectedCat[0].doc._id)
      .then(function(doc){
        selectedCat[0].doc._rev = doc._rev
        db.put(selectedCat[0].doc)
        .then(function(res){console.log('%%% update curtailed category',res)})
        .catch(function(er){ console.log('%%% add category error',er)})
      })
    })
  }

  // see: http://stackoverflow.com/questions/1674089/what-is-the-idiomatic-way-to-implement-foreign-keys-in-couchdb
  function addCategory(catName, vidlist){
        // !! means truthy(not falsy), ! means falsy(not true ie null,undefined, empty)
        // TODO check db for duplicate catnames
    var newcat = {}
        newcat.catName = catName
        newcat.type = 'category'
        var tid = new Date().toISOString()
        var ccid = 'category-'+tid
        newcat._id = ccid
        if(!vidlist)
        newcat.vidList = []
        else
        newcat.vidList = vidlist
    return $q.when(newcat)
      .then(function(obj){
        console.log('%%% trying to add', obj.data)
        db.put(obj)
        .then(function(res){console.log('%%% added category',res)})
        .catch(function(er){ console.log('%%% add category error',er)})
      })
      .then(function(){syncToChanges(); })
      // .then(function(){printDocs() })
  }
}])
