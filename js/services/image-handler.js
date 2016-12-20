angular.module('app.services')
.factory('ImageService',['$q','$http', function($q,$http){
  function ImageService(){
    this.init();
    var pathList;
  }

  ImageService.prototype.init = function(){
    // max 23 books in new testament
    var max = 23, min = 1;
    pathList = _.range(min, max)
    _.map(pathList, function(p){
      // read the directory to get filename
      // build path string
      // push string into list
    })
    console.log('%%%% init pathlist: ', pathList)
  }
  ImageService.prototype.getRandomImagePath = function(){
    var rand = Math.floor(Math.random()* (max - min+1)) + min
    // return path so that css can fetch it
    var path = pathList[rand]
    console.log('%%% getting image from: ', path)
    // bible index page will have  hardcoded img path
  }

  return ImageService
  // in controller.js : new ImageService
}])
