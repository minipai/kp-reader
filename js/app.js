angular
.module('kpApp', ['ngRoute',  'ngSanitize', 'cfp.hotkeys'])
.value('API',{
	KEY:"kp53f5cec4944045.82444535",
	SERVER:"http://api.kptaipei.tw/v1/"
})
.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'post.html',
    controller: 'PostIndexCtrl'
  })
  .when('/post/:postId', {
    templateUrl: 'post.html',
    controller: 'PostCtrl'
  })
})
.controller('MainCtrl', MainCtrl)
.controller('PostIndexCtrl', PostIndexCtrl)
.service('postResource', postResource)

function postResource($sce, $http, API){
	var self = this
	this.posts = []
	this.currentPost = {}
	this.currentIndex = 0

	this.fetch = function(id) {
		var endpoint = API.SERVER+"category/"+id+"?accessToken="+API.KEY
		return $http.get(endpoint, {cache: true}).success(function(result){
			_.forEach(result.data, parsePost)
			result.data = _.sortBy(result.data, 'serial').reverse()
			angular.copy(result.data, self.posts)
		})
	}

	this.selectPost = function(postId) {
		var post

		if(postId) {
			postId = parseInt(postId)
			post = _.find(self.posts, {id: postId})

		} else {
			post = _.first(self.posts)
		}
		angular.copy(post, self.currentPost)

		index = _.indexOf(self.posts, post)
		self.posts.currentIndex = index
	}

	this.selectPrev = function() {
		if(self.posts.currentIndex < 1 ) {
			return
		}
		var post = self.posts[self.posts.currentIndex - 1]
		self.selectPost(post.id)
	}
	this.selectNext = function() {
		if(self.posts.currentIndex + 1 > self.posts.length -1 ) {
			return
		}
		var post = self.posts[self.posts.currentIndex + 1]
		self.selectPost(post.id)
	}

	function parsePost(post) {
		post.plain_content = post.plain_content.replace(/[\S\s]*#\d+/g, '')
		post.marked = $sce.trustAsHtml(nl2br(post.plain_content))
		post.length = post.plain_content.length
		post.shortTitle = post.title.substring(6)
		post.serial = parseInt( post.shortTitle.match(/\d+/)[0] )
	}
}

function MainCtrl(postResource, $scope, $rootScope, $route) {
	$rootScope.selected = 0
}

function PostIndexCtrl(postResource, $scope, $rootScope, $route, $routeParams){
	$scope.posts = postResource.posts
	$scope.currentIndex = postResource.currentIndex

	postResource.fetch(40).success(function(){
		postResource.selectPost($routeParams.postId)
	})

	$scope.$on('$routeChangeSuccess', function(){
		postResource.selectPost($routeParams.postId)
	})

	$scope.prev = function() {
		postResource.selectPrev()
	}
	$scope.next = function() {
		postResource.selectNext()
	}
}

function PostCtrl(postResource, $scope, $sce, $route) {
	$scope.post = postResource.currentPost
}

function nl2br(text) {
	return text.replace(/(\r\n|\n|\r)/gm, '<br>')
}