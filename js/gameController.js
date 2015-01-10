var mazeGame = angular.module('mazeGame');

mazeGame.controller('gameController', ['$scope', '$timeout', function($scope, $timeout) {
 
	$scope.dragon = {};
	$scope.snitch = {};
	$scope.player = {};
	$scope.lastUpdated = new Date();
	$scope.lastSlowerUpdated = new Date();
	$scope.maze = null;
	$scope.rotationAngle = 0;
	$scope.thingsToDraw = [];
	
	$scope.render = function() {
		var Color = Isomer.Color;	
	
		var iso = new Isomer(document.getElementById("gameCanvas"));
		document.getElementById("gameCanvas").getContext('2d').clearRect(0, 0, 1600, 1200);
		
		var Point = Isomer.Point;
	
		for (var i = 0; i < $scope.thingsToDraw.length; i++) {
			var object = $scope.thingsToDraw[i];
			iso.add(object.shape, object.color);
		}				
	}
	
	$scope.getSnitchShape = function() {
		var point = $scope.snitch.point;
		var shape = $scope.Octahedron(point).rotateZ(new Isomer.Point(point.x+0.5,point.y+0.5,point.z+0.5), $scope.rotationAngle);
		return shape;
	}
	
	$scope.updateThingsToDraw = function() {
		var Color = Isomer.Color;	
		var Point = Isomer.Point;
		var Shape = Isomer.Shape;
		var red = new Color(160, 60, 50);
		var green = new Color(186, 218, 85);
		var blue = new Color(50, 60, 160);
		var yellow = new Color(160, 160, 50);
		
		var objectsToDraw = [];
		
		objectsToDraw.push({
			point: $scope.player.point,
			shape: Shape.Prism($scope.player.point),
			color: red});
		
		objectsToDraw.push({
			point: $scope.dragon.point,
			shape: Shape.Prism($scope.dragon.point), 
			color: green});
			
		var shape = $scope.Octahedron($scope.snitch.point).rotateZ(new Point($scope.snitch.point.x+0.5,$scope.snitch.point.y+0.5,$scope.snitch.point.z+0.5), $scope.rotationAngle);
		objectsToDraw.push({
			shape: $scope.getSnitchShape(), 
			point: $scope.snitch.point,
			color: yellow,
			spin: true});
					
		for (var row = 0; row < $scope.maze.length; row++) {
			for (var col = 0; col < $scope.maze[row].length; col++) {
				var cell = $scope.maze[row][col];
				
				if (cell == 1) {
					var point = Isomer.Point(col, row, 0);
					
					objectsToDraw.push({
					point: point, 
					shape: Shape.Prism(point),
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
		$scope.thingsToDraw = sortedObjects;
		
	}
	
	$scope.Octahedron = function(origin) {
		var Color = Isomer.Color;	
		var Point = Isomer.Point;
		var Shape = Isomer.Shape;
		var Path = Isomer.Path;
		
		var center = origin.translate(0.5, 0.5, 0.5);
		var faces = [];

		var upperTriangle = new Path([
			origin.translate(0, 0, 0.5),
			origin.translate(0.5, 0.5, 1),
			origin.translate(0, 1, 0.5)
		]);

		var lowerTriangle = new Path([
			origin.translate(0, 0, 0.5),
			origin.translate(0, 1, 0.5),
			origin.translate(0.5, 0.5, 0)
		]);

		for (var i = 0; i < 4; i++) {
			faces.push(upperTriangle.rotateZ(center, i * Math.PI / 2));
			faces.push(lowerTriangle.rotateZ(center, i * Math.PI / 2));
		}

		return new Shape(faces).scale(center, Math.sqrt(2)/2, Math.sqrt(2)/2, 1);
	}
	
	$scope.shiftMazeWouldCollideWithLivingThing = function(livingThing) {
	
		if (livingThing.point.y % 2 == 0) {
			var cell = $scope.maze[livingThing.point.y][livingThing.point.x - 1 < 0 ? 9 : livingThing.point.x - 1];
			if (cell === 1) {
				return true;
			}
		}
		return false;
	}
	
	$scope.shiftMazeAltWouldCollideWithLivingThing = function(livingThing) {
			
		if (livingThing.point.x % 2 == 0) {
			var cell = $scope.maze[livingThing.point.y - 1 < 0 ? 9 : livingThing.point.y - 1][livingThing.point.x];			
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
		if ($scope.shiftMazeWouldCollideWithLivingThing($scope.snitch)) {
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
	}
	
	$scope.shiftMazeAlt = function() {
	
		if ($scope.shiftMazeAltWouldCollideWithLivingThing($scope.player)) {
			return false;
		}
		if ($scope.shiftMazeAltWouldCollideWithLivingThing($scope.dragon)) {
			return false;
		}
		if ($scope.shiftMazeAltWouldCollideWithLivingThing($scope.snitch)) {
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
	}
	
	$scope.keydown = function(event) {
		
		var x = $scope.player.point.x;
		var y = $scope.player.point.y;
		
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
		
		livingThing.point.x = x;
		livingThing.point.y = y;
		
		if ($scope.player.point.x == $scope.snitch.point.x && $scope.player.point.y == $scope.snitch.point.y) {
			$scope.win();
		}
		else if ($scope.player.point.x == $scope.dragon.point.x && $scope.player.point.y == $scope.dragon.point.y) {
			$scope.die();
		}
	}
	
	$scope.die = function() {
		alert("You are dead.  :(");
		$scope.init();
	}
	
	$scope.win = function() {
		alert("You win!");
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
		$scope.player.point = Isomer.Point(position.x, position.y, 0);
		
		position = $scope.findAnEmptySpotInTheMaze();
		$scope.dragon.point = Isomer.Point(position.x, position.y, 0);
		
		position = $scope.findAnEmptySpotInTheMaze();
		$scope.snitch.point = Isomer.Point(position.x, position.y, 0.5);
				
	}
	
	$scope.moveTheDragon = function() {
		var x = $scope.dragon.point.x;
		var y = $scope.dragon.point.y;
				
		var roll = $scope.random(1, 5);
		switch (roll) {
			case 1:
				x--;
				break;
			case 2:
				x++;
				break;			
			case 3:
				y--;
				break;			
			case 4:
				y++;
				break;
			default:
				return;
		}		
		
		$scope.moveLivingThing($scope.dragon, x, y);
	}
	
	$scope.update = function() {		
		var framesPerSecond = 20;
		
		var now = new Date();
		var timeSinceLastUpdate = now.getTime() - $scope.lastUpdated.getTime();
				
		$scope.rotationAngle += 2 * Math.PI / 60;
				
		$scope.updateThingsToDraw();
		$scope.render();
				
		$scope.lastUpdated = now;		
		$timeout($scope.update, 1000 / framesPerSecond);
	}
	
	$scope.slowerUpdate = function() {	
		var framesPerSecond = 2;
		var now = new Date();
		var timeSinceLastUpdate = now.getTime() - $scope.lastSlowerUpdated.getTime();
		
		$scope.moveTheDragon();
		
		$scope.lastSlowerUpdated = now;
		$timeout($scope.slowerUpdate, 1000 / framesPerSecond);
	}
	
	$scope.init = function() {
		$scope.generateMaze();
		$scope.slowerUpdate();
		$scope.updateThingsToDraw();
	}
	
	$scope.init();
	$scope.update();
	
	
}]);