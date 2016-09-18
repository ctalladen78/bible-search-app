angular.module('app.services', [])

.factory('DbService', [function(){
  // TODO: using pouchdb operations
  return{
    initDB : initDB,
    getChapter : getChapter,
    getVerse : getVerse,
    editVerse : editVerse,
    getFavoriteList : getFavoriteList,
    getCategoryList : getCategoryList,
    getCategory : getCategory
  }
  // populate db from api endpoint
  function initDB(){
      // instantiate DB
      // populate db
  }
  // return a list of verses given book id, chapter id
  function getChapter(bookID, chapID){

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
}])

