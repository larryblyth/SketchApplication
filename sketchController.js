var sketchApp = angular.module("sketchApp", []);
sketchApp.controller("sketchController", function ($scope, sketchRenderer) {
	'use strict';
	var colors,colorValue,canvas,context,points,lineColorNumber,fillColorNumber,mouseDown,startPos,endPos,createRenderObject,renderPath,backgroundImage, ResetCanvasRatio;

    var renderPath = function (data) {
        if ($scope.tool === "rectangle" || $scope.tool === "line" || $scope.tool === "circle") {
            sketchRenderer.renderAll();
        }
        sketchRenderer.render(data);
    };

    var createRenderObject = function () {
        var data, pointsLength;
        pointsLength = points.length;
        switch ($scope.tool) {
            case "pencil":
                data = {
                    ToolName: "pencil",
                    LineWidth: $scope.lineWidth,
                    Points: points,
                    Color: colorValue[lineColorNumber]
                };
                break;
            case "line":
                data = {
                    ToolName: "line",
                    LineColor: colorValue[lineColorNumber],
                    LineWidth: $scope.lineWidth,
                    StartX: startPos.x,
                    StartY: startPos.y,
                    EndX: endPos.x,
                    EndY: endPos.y
                };
                break;
            case "rectangle":
                data = {
                    ToolName: "rectangle",
                    LineColor: colorValue[lineColorNumber],
                    FillColor: colorValue[fillColorNumber],
                    LineWidth: $scope.lineWidth,
                    StartX: startPos.x,
                    StartY: startPos.y,
                    Width: endPos.x - startPos.x,
                    Height: endPos.y - startPos.y,
                    FillShape: $scope.fillShape
                };
                break;
            case "circle":
                data = {
                    ToolName: "circle",
                    LineColor: colorValue[lineColorNumber],
                    FillColor: colorValue[fillColorNumber],
                    LineWidth: $scope.lineWidth,
                    StartX: startPos.x,
                    StartY: startPos.y,
                    Radius: (Math.abs(endPos.x - startPos.x) + (Math.abs(endPos.y - startPos.y)) / 2),
                    FillShape: $scope.fillShape
                };
                break;
            default:
                console.log("createRenderObject: unknown tool");
                data = {};
                break;
        }
        return data;
    };

    var ResetCanvasRatio = function () {
        console.log('resetting canvas ratio');
        context.canvas.width = 512; //window.innerWidth * .8;
        context.canvas.height = 512; //window.innerHeight * .8;
    }

// bindings
	$scope.lineWidth = 5;
	$scope.lineText = "medium";
	$scope.tool = "pencil";
	$scope.lineColorCss = "black";
	$scope.fillColorCss = "black";
	$scope.fillShape = false;
	$scope.colorTarget = "line";

// functions
	$scope.init = function () {
		colors = ['blank','black','white','blue','skyblue','red','green','yellow','pink','gray'];
		colorValue = ['blank','#000000','#ffffff','#0000ff','#00ffff','#ff0000','#00ff00','#ffff00','#ff00ff','#888888'];
		canvas = document.getElementById("canvas");
		context = canvas.getContext("2d");
        sketchRenderer.setContext(context);
        ResetCanvasRatio();
		var offset = 5;  // mouse cursor offset
		points = [];
		lineColorNumber = 1;
		fillColorNumber = 1;
		mouseDown = false;
		startPos = { x: 0, y: 0 };
		endPos = { x: 0, y: 0 };		
		
		canvas.onmousedown = function (e) {
			points.push({
				x: (e.pageX - canvas.offsetLeft) - offset,
				y: (e.pageY - canvas.offsetTop) - offset,
				color: colorValue[lineColorNumber]
			});			

			mouseDown = true;

			startPos.x = points[0].x;
			startPos.y = points[0].y;
			endPos.x = points[0].x;
			endPos.y = points[0].y;

			var data = createRenderObject();
			renderPath(data);
		};

		canvas.onmousemove = function (e) {
			var x, y, lastPoint, data;
			if (mouseDown) {
				x = (e.pageX - canvas.offsetLeft) - offset;
				y = (e.pageY - canvas.offsetTop) - offset;

				points.push({
					x: x,
					y: y,
					color: colorValue[lineColorNumber]
				});
				
				lastPoint = points[points.length - 1];
				endPos.x = lastPoint.x;
				endPos.y = lastPoint.y;

				data = createRenderObject();
				renderPath(data);				
			}			
		};

		canvas.onmouseup = function (e) {

			mouseDown = false;
			var data = createRenderObject();
            sketchRenderer.addToBuffer(data);

			points = [];
			startPos.x = 0;
			startPos.y = 0;
			endPos.x = 0;
			endPos.y = 0;
		};
	};

	$scope.selectColor = function (color) {
		switch ($scope.colorTarget) {
			case "line":
				lineColorNumber = color;
				$scope.lineColorCss = colors[lineColorNumber];
				break;

			case "fill":
				fillColorNumber = color;
				$scope.fillColorCss = colors[fillColorNumber];
				break;

			default:
				console.error("selectColor: unknown color");
		}		
	};

	$scope.isToolNameSelected = function () {
		for (var i = 0; i < arguments.length; i++) {
			if (arguments[i] === $scope.tool) {
				return true;
			}
		}
		return false;
	};

	$scope.changeLineWidth = function (size) {
		$scope.lineWidth = Number(size);
	};

	$scope.changeColorTarget = function (target) {
		$scope.colorTarget = target;
	};

	$scope.undo = function () {
        sketchRenderer.undo();
        sketchRenderer.renderAll();
		points = [];
		startPos.x = 0;
		startPos.y = 0;
		endPos.x = 0;
		endPos.y = 0;
	};

    //$scope.ResetCanvasRatio = function () {
    //    ResetCanvasRatio();
    //};
});