var mazeGame = angular.module('mazeGame');

mazeGame.controller('gameController', ['$scope', '$timeout', function($scope, $timeout) {

	$scope.playerX = 0;
	$scope.playerY = 0;
	$scope.lastUpdated = new Date();
	$scope.obstacles = [
		Isomer.Point(2, -4, 0),
		Isomer.Point(0, 8, 0),
		Isomer.Point(4, 4, 0),
	];
	
	$scope.draw = function() {
		var Color = Isomer.Color;	
		var Point = Isomer.Point;
		var Shape = Isomer.Shape;

		var red = new Color(160, 60, 50);
		var blue = new Color(50, 60, 160);

		var iso = new Isomer(document.getElementById("gameCanvas"));
		document.getElementById("gameCanvas").getContext('2d').clearRect(0, 0, 1600, 1200);
		
		var objectsToDraw = [];
		
		objectsToDraw.push({
			point: Point($scope.playerX, $scope.playerY, 0), 
			color: red});
				
		for (var i = 0; i < $scope.obstacles.length; i++) {
			var obstaclePoint = $scope.obstacles[i];
			
			objectsToDraw.push({
			point: obstaclePoint, 
			color: blue});
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
	
	$scope.keydown = function(event) {
		
		var x = $scope.playerX;
		var y = $scope.playerY;
		
		var KEY_LEFT = 37;
		var KEY_UP = 38;
		var KEY_RIGHT = 39;
		var KEY_DOWN = 40;
			
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
		}
		
		for (var i = 0; i < $scope.obstacles.length; i++) {
			var obstaclePoint = $scope.obstacles[i];
			if (x === obstaclePoint.x && y === obstaclePoint.y) {
				return;
			}
		}
		
		$scope.playerX = x;
		$scope.playerY = y;
		
		$scope.draw();
	};
	
	$scope.update = function() {		
		var framesPerSecond = 10;
		
		now = new Date();
		var timeSinceLastUpdate = now.getTime() - $scope.lastUpdated.getTime();
				
		$scope.lastUpdated = now;		
		$timeout($scope.update, 1000 / framesPerSecond);
	}
	
	$scope.update();
	$scope.draw();
	
}]);