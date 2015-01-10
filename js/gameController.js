var mazeGame = angular.module('mazeGame');

mazeGame.controller('gameController', ['$scope', '$timeout', function($scope, $timeout) {
 
	$scope.dragon = {};
	$scope.player = {};
	$scope.lastUpdated = new Date();
	$scope.maze = null;
	
	$scope.draw = function() {
		var Color = Isomer.Color;	
		var Point = Isomer.Point;
		var Shape = Isomer.Shape;

		var red = new Color(160, 60, 50);
		var green = new Color(186, 218, 85);
		var blue = new Color(50, 60, 160);

		var iso = new Isomer(document.getElementById("gameCanvas"));
		document.getElementById("gameCanvas").getContext('2d').clearRect(0, 0, 1600, 1200);
		
		var objectsToDraw = [];
		
		objectsToDraw.push({
			point: Point($scope.player.x, $scope.player.y, 0), 
			color: red});
						
		objectsToDraw.push({
			point: Point($scope.dragon.x, $scope.dragon.y, 0), 
			color: green});
					
		for (var row = 0; row < $scope.maze.length; row++) {
			for (var col = 0; col < $scope.maze[row].length; col++) {
				var cell = $scope.maze[row][col];
				
				if (cell == 1) {
					var point = Isomer.Point(col, row, 0);
					
					objectsToDraw.push({
					point: point, 
					color: blue});
				}
			}
		}
	
		var sortedObjects = objectsToDraw.sort(function (a, b) {
			if (a.point.x + a.point.y > b.point.x + b.point.y) {
				return -1;
			}
			if (a.point.x + a.point.y < b.point.x + b.point.y) {
				return 1;
			}
			return 0;
			});
	
		for (var i = 0; i < sortedObjects.length; i++) {
			var object = sortedObjects[i];
			iso.add(Shape.Prism(object.point), object.color);
		}		
	}
	
	$scope.shiftMazeWouldCollideWithLivingThing = function(livingThing) {
	
		if (livingThing.y % 2 == 0) {
			var cell = $scope.maze[livingThing.y][livingThing.x - 1 < 0 ? 9 : livingThing.x - 1];
			if (cell === 1) {
				return true;
			}
		}
		return false;
	}
	
	$scope.shiftMazeAltWouldCollideWithLivingThing = function(livingThing) {
			
		if (livingThing.x % 2 == 0) {
			var cell = $scope.maze[livingThing.y - 1 < 0 ? 9 : livingThing.y - 1][livingThing.x];			
			if (cell === 1) {
				return true;
			}
		}
		return false;
	}
	
	$scope.shiftMaze = function() {
	
		if ($scope.shiftMazeWouldCollideWithLivingThing($scope.player)) {
			return false;
		}
		if ($scope.shiftMazeWouldCollideWithLivingThing($scope.dragon)) {
			return false;
		}
	
		var maze = [[]];
		
		for (var row = 0; row < 10; row++) {
			if (row % 2 == 0) {
				maze[row] = [];		
				maze[row][0] = $scope.maze[row][9];	
				for (var col = 1; col < 10; col++) {
					maze[row][col] = $scope.maze[row][col - 1];
				}
			}
			else {
				maze[row] = $scope.maze[row];
			}
		}
		
		$scope.maze = maze;
		$scope.draw();
	}
	
	$scope.shiftMazeAlt = function() {
	
		if ($scope.shiftMazeAltWouldCollideWithLivingThing($scope.player)) {
			return false;
		}
		if ($scope.shiftMazeAltWouldCollideWithLivingThing($scope.dragon)) {
			return false;
		}
	
		var maze = [[]];
		
		for (var row = 0; row < 10; row++) {
			maze[row] = [];		
			for (var col = 0; col < 10; col++) {
				if (col % 2 == 0) {
					maze[row][col] = $scope.maze[row - 1 < 0 ? 9 : row - 1][col];
				}
				else {
					maze[row][col] = $scope.maze[row][col];
				}
			}			
		}
		
		$scope.maze = maze;
		$scope.draw();
	}
	
	$scope.keydown = function(event) {
		
		var x = $scope.player.x;
		var y = $scope.player.y;
		
		var KEY_LEFT = 37;
		var KEY_UP = 38;
		var KEY_RIGHT = 39;
		var KEY_DOWN = 40;
		var KEY_LEFT_SHIFT = 16;
		var KEY_RIGHT_SHIFT = 18;
			
		switch (event.keyCode) {
			case KEY_LEFT:
				y++;
				event.preventDefault();
				break;
			case KEY_UP:
				x++;
				event.preventDefault();
				break;
			case KEY_RIGHT:
				y--;
				event.preventDefault();
				break;
			case KEY_DOWN:
				x--;
				event.preventDefault();
				break;
			case KEY_LEFT_SHIFT:
				$scope.shiftMaze();				
				event.preventDefault();
				break;
			case KEY_RIGHT_SHIFT:
				$scope.shiftMazeAlt();				
				event.preventDefault();
				break;
			default:
				break;
		}
		
		$scope.moveLivingThing($scope.player, x, y);
	}
	
	$scope.moveLivingThing = function(livingThing, x, y) {
	
		if (x < 0 || x >= 10 || y < 0 || y >= 10 || $scope.maze[y][x] == 1) {
			return;
		}
		
		livingThing.x = x;
		livingThing.y = y;
		
		if ($scope.player.x == $scope.dragon.x && $scope.player.y == $scope.dragon.y) {
			$scope.die();
		}
		
		$scope.draw();
		
	}
	
	$scope.die = function() {
		alert("You are dead.  :(");
		$scope.init();
	}
	
	$scope.random = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	$scope.findAnEmptySpotInTheMaze = function() {
		var x, y;
		do {
			x = $scope.random(0, 9);
			y = $scope.random(0, 9);
		} while ($scope.maze[y][x] == 1);
		
		return {
			x : x,
			y : y
		};
	}
	
	$scope.generateMaze = function() {
		var maze = [[]];
		for (var row = 0; row < 10; row++) {
			maze[row] = [];
			for (var col = 0; col < 10; col++) {
				var cell = 0;
				if ($scope.random(0, 2) == 1) {
					cell = 1;
				}
				maze[row][col] = cell;
			}
		}
		$scope.maze = maze;		
		
		var position = $scope.findAnEmptySpotInTheMaze();
		$scope.player.x = position.x;
		$scope.player.y = position.y;
		
		position = $scope.findAnEmptySpotInTheMaze();
		$scope.dragon.x = position.x;
		$scope.dragon.y = position.y;
				
	}
	
	$scope.moveTheDragon = function() {
		var x = $scope.dragon.x;
		var y = $scope.dragon.y;
		
		var rollX = $scope.random(1, 3);
		switch (rollX) {
			case 1:
				x--;
				break;
			case 2:
				x++;
				break;			
		}		
		
		var rollY = $scope.random(1, 3);
		switch (rollY) {
			case 1:
				y--;
				break;
			case 2:
				y++;
				break;			
		}
		
		$scope.moveLivingThing($scope.dragon, x, y);
	}
	
	$scope.update = function() {		
		var framesPerSecond = 1;
		
		now = new Date();
		var timeSinceLastUpdate = now.getTime() - $scope.lastUpdated.getTime();
				
		$scope.moveTheDragon();
				
		$scope.lastUpdated = now;		
		$timeout($scope.update, 1000 / framesPerSecond);
	}
	
	$scope.init = function() {
		$scope.generateMaze();
		$scope.update();
		$scope.draw();
	}
	
	$scope.init();
	
	
}]);