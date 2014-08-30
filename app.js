var app = angular.module('Typekiller', ['ngResource', 'timer']);


app.service('GameWords', function($resource) {
	return $resource('./words.json', []);
});



// QUES(nandersson):
// * how can I split this up into several controllers or a better
//   structure in general?

app.controller('GameCtrl', ['$scope', 'GameWords', function($scope, GameWords) {
	$scope.items = [];
	// QUES(nandersson):
	// * is this stuff really needed, I just want a simple
	//   list items directly from words.json.. this wrapper should
	//   exist elsewhere?
	GameWords.query(function(res) {
		angular.forEach(res, function(item) {
			$scope.items.push(item);
		});
	});
	$scope.startGame = function() {
		console.log('starting game');
		resetState();
		$scope.gameActive = true;
		$scope.$broadcast('timer-start');
		$scope.gameState.currentWord = $scope.items[0].word;
		console.log('game started');
	};
	$scope.stopGame = function() {
		console.log('stopping game');
		$scope.gameActive = false;
		$scope.$broadcast('timer-stop');
		console.log('game stopped');
	};
	$scope.keyDown = function(e) {
		if (!$scope.gameActive && e.keyCode === 13) {  // enter
			$scope.startGame();
			return;
		}
		else if (!$scope.gameActive) {
			return;
		}
		var c = String.fromCharCode(e.keyCode);
		//console.log('key pushed: <%s>', c);
		if ($scope.gameState.currentWord[$scope.gameState.charAt] === c) {
			$scope.gameState.charAt++;
			if ($scope.gameState.currentWord.length === $scope.gameState.charAt) {
				$scope.gameState.correctWords++;
				nextWord();
			}
		}
		else {
			nextWord();
		}
	};
	$scope.$on('timer-stopped', function (event, data) {
		console.log('timer stopped, %s', data.millis);
        $scope.gameState.totalTime = data.millis/1000;
        console.log($scope.gameState);
        showStats();
    });
	$scope.gameState = {};
	// QUES(nandersson):
	// * use $scope namespace even for functions that is never
	//   intended to be called or used from HTML ?
	var nextWord = function() {
		console.log($scope.gameState);
		$scope.gameState.charAt = 0;
		$scope.gameState.itemAt++;
		// check if we're done
		if ($scope.gameState.itemAt === $scope.items.length) {
			$scope.stopGame();
			return;
		}
		$scope.gameState.currentWord = $scope.items[$scope.gameState.itemAt].word;
		console.log($scope.gameState);
	};
	var resetState = function() {
		$scope.gameState = {
				currentWord: '',
				correctWords: 0,
				charAt: 0,
				itemAt: 0,
				totalTime: 0,
		};
	};
	var showStats = function() {
		var wordsPerMin = ($scope.gameState.correctWords / $scope.gameState.totalTime) * 60;
		alert('Completed '+ $scope.gameState.correctWords +' out of '+ $scope.items.length +' words in '+
			  $scope.gameState.totalTime + 's\n\n'+
			  'That\'s on average '+ wordsPerMin.toFixed(3) +' words per min');
	};
}]);