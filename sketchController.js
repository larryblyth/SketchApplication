var sketchApp = angular.module("sketchApp", []);
sketchApp.controller("sketchController", function ($scope, sketchRenderer) {
	'use strict';
	var colors,colorValue,canvas,context,points,lineColorNumber,fillColorNumber,mouseDown,startPos,endPos,createRenderObject,renderPath,backgroundImage, ResetCanvasRatio, prevX = 0, prevY = 0, thisX = 0, thisY = 0, selectMode, selection= 'none';
    var polygonPoints = 0;
    var renderPath = function (data) {
        if ($scope.tool === "rectangle" || $scope.tool === "line" || $scope.tool === "circle" || $scope.tool === "square" || $scope.tool === "ellipse" || $scope.tool === "polygon") {
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
            case "ellipse":
                data = {
                    ToolName: "ellipse",
                    LineColor: colorValue[lineColorNumber],
                    FillColor: colorValue[fillColorNumber],
                    LineWidth: $scope.lineWidth,
                    StartX: startPos.x,
                    StartY: startPos.y,
                    Radius: (Math.abs(endPos.x - startPos.x) + (Math.abs(endPos.y - startPos.y)) / 2),
                    FillShape: $scope.fillShape
                };
                break;
            case "square":
                data = {
                    ToolName: "square",
                    LineColor: colorValue[lineColorNumber],
                    FillColor: colorValue[fillColorNumber],
                    LineWidth: $scope.lineWidth,
                    StartX: startPos.x,
                    StartY: startPos.y,
                    Side: endPos.y - startPos.y,
                    FillShape: $scope.fillShape
                };
                break;
            case "polygon":
                data = {
                    ToolName: "polygon",
                    LineColor: colorValue[lineColorNumber],
                    LineWidth: $scope.lineWidth,
                    StartX: startPos.x,
                    StartY: startPos.y,
                    EndX: endPos.x,
                    EndY: endPos.y,
                    Points: polygonPoints
                };
                break;
            default:
                console.log("createRenderObject: unknown tool");
                data = {};
                break;
        }
        return data;
    };

    var setCanvasRatio = function () {
        context.canvas.width = 512; //window.innerWidth * .8;
        context.canvas.height = 512; //window.innerHeight * .8;
    }

// bindings
	$scope.lineWidth = 5;
	$scope.lineText = "medium";
	$scope.tool = "pencil";
    $scope.sketchTitle = "SE 3353 Sketch";
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
        setCanvasRatio();
		var offset = 5;  // mouse cursor offset
		points = [];
		lineColorNumber = 1;
		fillColorNumber = 1;
		mouseDown = false;
		startPos = { x: 0, y: 0 };
		endPos = { x: 0, y: 0 };
        selectMode = false;

        document.getElementById("endShape").style.display='none';
        document.getElementById("redobutton").style.display='none';
		
		canvas.onmousedown = function (e) {
            if(selectMode) {
                var thisX = (e.pageX - canvas.offsetLeft) - offset;
                var thisY = (e.pageY - canvas.offsetTop) - offset;
                selection = sketchRenderer.findSelection(thisX,thisY);
                if(selection == 'none') {
                    console.log('nothing selected');
                } else {
                    console.log('selected something!');
                    //console.log(selection);
                    //selection contains data object for what was just selected

                    //TO-DO


                }
            } else if($scope.tool != 'polygon') {
                mouseDownEvent(e);
                mouseDown = true;
            }
		};

		canvas.onmousemove = function (e) {

            if(selectMode) return;

			var x, y, lastPoint, data;
			if ( ( mouseDown && $scope.tool != 'polygon' ) || ( $scope.tool == 'polygon' && polygonPoints>0)) { //if mouse is up in polygon mode, then drag
				x = (e.pageX - canvas.offsetLeft) - offset;
				y = (e.pageY - canvas.offsetTop) - offset;
                //console.log('x: '+x+' y: '+y);

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
            if(selectMode) return;

            if($scope.tool == 'polygon') {
                thisX = (e.pageX - canvas.offsetLeft) - offset;
                thisY = (e.pageY - canvas.offsetTop) - offset;
                var clickMargin = 5;
                if( prevX - clickMargin < thisX && prevX + clickMargin > thisX   &&   prevY - clickMargin < thisY && prevY + clickMargin > thisY ) {
                    console.log('clicked on last point');
                    var data = createRenderObject();
                    sketchRenderer.addToBuffer(data);
                    polygonPoints = 0;
                    document.getElementById("endShape").style.display='none';
                } else if(polygonPoints==0) {
                    //this is start of polygon
                    document.getElementById("endShape").style.display='block';
                    mouseDownEvent(e);
                    polygonPoints++;
                    //store this point so can detect if they click on it later
                    prevX = thisX;
                    prevY = thisY;

                } else {
                    polygonPoints++;
                    console.log('doing polygon stuff');
                    var data = createRenderObject();
                    sketchRenderer.addToBuffer(data);
                    mouseDownEvent(e);
                }
            } else {
                mouseDown = false;
                var data = createRenderObject();
                sketchRenderer.addToBuffer(data);

                points = [];
                startPos.x = 0;
                startPos.y = 0;
                endPos.x = 0;
                endPos.y = 0;
            }
		};

        var mouseDownEvent = function(e) {
            points.push({
                x: (e.pageX - canvas.offsetLeft) - offset,
                y: (e.pageY - canvas.offsetTop) - offset,
                color: colorValue[lineColorNumber]
            });

            //mouseDown = true;
            if($scope.tool == 'polygon' && points.length>0) {
                startPos.x = points[points.length-1].x;
                startPos.y = points[points.length-1].y;
                endPos.x = points[points.length-1].x;
                endPos.y = points[points.length-1].y;
            } else {
                startPos.x = points[0].x;
                startPos.y = points[0].y;
                endPos.x = points[0].x;
                endPos.y = points[0].y;
            }

            var data = createRenderObject();
            renderPath(data);
        }
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
        //startPos.x = 0;
        //startPos.y = 0;
        //endPos.x = 0;
        //endPos.y = 0;
    };

    $scope.redo = function () {
        sketchRenderer.redo();
        sketchRenderer.renderAll();
        //points = [];
        //startPos.x = 0;
        //startPos.y = 0;
        //endPos.x = 0;
        //endPos.y = 0;
    }

    $scope.endPolygon = function () {
        console.log('ending open polygon');
        polygonPoints = 0;
        sketchRenderer.renderAll();
        document.getElementById("endShape").style.display='none';
    };

    $scope.saveSketch = function () {
        sketchRenderer.save($scope.sketchTitle);
    };

    $scope.loadSketch = function () {
        sketchRenderer.load();
    };

    $scope.newSketch = function () {
        if (confirm('Would you like to start a new sketch?')) {
            sketchRenderer.newSketch();
        } else {
            console.log('continuing same sketch');
        }
    };

    $scope.changeSelectMode = function () {
        if(selectMode) selectMode = false;
        else selectMode = true;
        console.log('select mode is: '+selectMode);
    }

    //$scope.setCanvasRatio = function () {
    //    setCanvasRatio();
    //};
});