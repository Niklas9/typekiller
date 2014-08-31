var KEYS_START_GAME = [13, 32];  // enter, space 

var app = angular.module('Typekiller', ['ngResource', 'timer']);


app.service('GameWords', function($resource) {
	return $resource('/words', []);
});


// QUES(nandersson):
// * how to get rid of <timer/> completely?
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
            $scope.items.push(item.word.toUpperCase());
        });
    });
	$scope.startGame = function() {
		console.log('starting game');
        resetState();
		$scope.gameActive = true;
		$scope.$broadcast('timer-start');
		$scope.gameState.currentWord = $scope.items[0];
		console.log('game started');
	};
	$scope.stopGame = function() {
		console.log('stopping game');
		$scope.gameActive = false;
		$scope.$broadcast('timer-stop');
		console.log('game stopped');
	};
	$scope.keyDown = function(e) {
        if ($scope.gameOver)  return;
		if (!$scope.gameActive && KEYS_START_GAME.indexOf(e.keyCode) > -1) {
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
    $scope.gameOver = false;
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
		$scope.gameState.currentWord = $scope.items[$scope.gameState.itemAt];
		console.log($scope.gameState);
	};
	var resetState = function() {
		$scope.gameState = {
				currentWord: '',
				correctWords: 0,
				charAt: 0,
				itemAt: 0,
				totalTime: 0,
                statsWordsPerMin: 0,
		};
	};
	var showStats = function() {
        $scope.gameOver = true;
        var wpm = ($scope.gameState.correctWords / $scope.gameState.totalTime) * 60;
		$scope.gameState.statsWordsPerMin = wpm.toFixed(3);
	};
    $scope.closeStats = function() {
        console.log('asdf');
        $scope.gameOver = false;
        // get new
        new GameWords.query(function(res) {
            $scope.items = [];
            angular.forEach(res, function(item) {
                $scope.items.push(item.word.toUpperCase());
            });
        });
       $scope.gameActive = false;
    };
}]);
