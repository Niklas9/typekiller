var KEYS_START_GAME = [13, 32];  // enter, space 
var KEYS_IGNORE = [8, 46];  // backspace, delete
var DEFAULT_PLAYER_NAME = 'Nameless';

var app = angular.module('Typekiller', ['ngResource', 'timer', 'ngSanitize']);


app.service('GameWords', function($resource) {
	return $resource('/words', []);
});

app.service('Toplist', function($resource) {
    return $resource('/toplist', []);
});

// QUES(nandersson):
// * how to get rid of <timer/> completely?
// * how can I split this up into several controllers or a better
//   structure in general?

app.controller('GameCtrl', ['$scope', '$timeout', 'GameWords', 'Toplist', function($scope, $timeout, GameWords, Toplist) {
	$scope.items = [];
    $scope.playerName = '';
    $scope.showPlayerName = true;
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
        if ($scope.playerName !== '') {
            $scope.showPlayerName = false;
        }
		$scope.gameActive = true;
		$scope.$broadcast('timer-start');
		$scope.gameState.currentWord = $scope.items[0];
        setWordHighlight();
		console.log('game started');
	};
	$scope.stopGame = function() {
		console.log('stopping game');
		$scope.gameActive = false;
		$scope.$broadcast('timer-stop');
		console.log('game stopped');
	};
	$scope.keyDown = function(e) {
        if (!$scope.gameActive && KEYS_START_GAME.indexOf(e.keyCode) > -1) {
			$scope.startGame();
			return;
		}
		else if (!$scope.gameActive) {
			return;
		}
        else if ($scope.gameOver || KEYS_IGNORE.indexOf(e.keyCode) > -1) {
            e.preventDefault();  // make sure browser doesn't go back in history
            return;
		}
		var c = String.fromCharCode(e.keyCode);
		//console.log('key pushed: <%s>', c);
		if ($scope.gameState.currentWord[$scope.gameState.charAt] === c) {
			$scope.gameState.charAt++;
            setWordHighlight($scope.gameState.charAt);
			if ($scope.gameState.currentWord.length === $scope.gameState.charAt) {
				$scope.gameState.correctWords++;
				nextWord();
			}
		}
		else {
            setWordHighlight(1, true);
			$timeout(nextWord, 100);  // sleep for 100ms if bad key
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
        $scope.gameState.charAt = 0;
		$scope.gameState.itemAt++;
		// check if we're done
		if ($scope.gameState.itemAt === $scope.items.length) {
			$scope.stopGame();
			return;
		}
		$scope.gameState.currentWord = $scope.items[$scope.gameState.itemAt];
        setWordHighlight();
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
        var name = DEFAULT_PLAYER_NAME;
        if ($scope.playerName !== '')  name = $scope.playerName;
		var report = new Toplist({'name': name, 'wpm': wpm});
        report.$save();
        $scope.toplist = new Toplist.query();
        $scope.gameState.statsWordsPerMin = wpm.toFixed(3);
	};
    // QUES(nandersson):
    // * how to do this in a more angular way? HTML here really?
    var setWordHighlight = function(charAt, wrong) {
        var w = $scope.gameState.currentWord;
        var letterOk = '<span class="green">%s</span>';
        var letterBad = '<span class="red">%s</span>';
        if (charAt === undefined || charAt === 0) {
            $scope.currentWordHighlight = w;
            return;
        }
        if (wrong) {
            $scope.currentWordHighlight = letterBad.replace('%s', w);
            return;
        }
        $scope.currentWordHighlight = letterOk.replace('%s', w.substring(0, charAt)) + w.substring(charAt, w.length);
    };
    $scope.closeStats = function() {
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
