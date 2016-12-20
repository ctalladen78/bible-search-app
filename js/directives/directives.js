angular.module('app.directives', [])

.directive('backImg', [function(){
  return function(scope, element, attrs){
    var imgurl = attrs.backImg
    console.log('%%% attrs ',attrs)
    console.log('%%% inherited scope', scope)
    element.css({
      'background-image': 'url('+imgurl+')',
      'background-size': 'cover'
    })
  }
}]);
