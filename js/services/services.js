angular.module('app.services', [])

.factory('DataService', [function(){
  // TODO: using pouchdb operations
  return{
    all : function(){}
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
  function getFavorites(favID){

  }
  // return a list of categories
  function getCategories(){

  }
  // return a list of verses given categories id
  function getCategory(catID){

  }
}])

