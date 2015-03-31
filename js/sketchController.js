var sketchApp = angular.module("sketchApp", []);
sketchApp.controller("sketchController", function ($scope, sketchRenderer) {
	'use strict';
	var colors,colorValue,canvas,context,points,lineColorNumber,fillColorNumber,mouseDown,startPos,endPos,createRenderObject,renderPath,backgroundImage, ResetCanvasRatio, prevX = 0, prevY = 0, thisX = 0, thisY = 0, selectMode, selection=[];
    var polygonPoints = 0;
    var groups = [];
    var lastX, lastY;
    var mouseDrag = false;
    var polygonPointValues = [];
    var polygonPointIndex = 0;
    var clipBoard = [];
    var PASTE_OFFSET = 20;

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
                    LineColor: colorValue[lineColorNumber]
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
                var width = endPos.x - startPos.x;
                var height = endPos.y - startPos.y;
                data = {
                    ToolName: "ellipse",
                    LineColor: colorValue[lineColorNumber],
                    FillColor: colorValue[fillColorNumber],
                    LineWidth: $scope.lineWidth,
                    StartX: startPos.x + width / 2,
                    StartY: startPos.y + height / 2,
                    RadiusX: Math.abs(width / 2),
                    RadiusY: Math.abs(height/ 2),
                    // EndX: endPos.x,
                    // EndY: endPos.y,
                    // Radius: (Math.abs(endPos.x - startPos.x) + (Math.abs(endPos.y - startPos.y)) / 2),
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
                    //StartX: startPos.x,
                    //StartY: startPos.y,
                    EndX: endPos.x,
                    EndY: endPos.y,
                    Points: polygonPoints,
                    Values: polygonPointValues[polygonPointIndex]
                };
                break;
            default:
                console.log("createRenderObject: unknown tool");
                data = {};
                break;
        }
        data.originalColor = data.LineColor;
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
    $scope.midPolyDraw = false;

// Keyboard presses
    $('body').on('keydown', function(event) {
        var key = event.keyCode || event.charCode;
        console.log('keyboard ' + key);
        switch (key) {
            // S
            case 83:
                console.log('S');
                selectMode = !selectMode;
                mouseDown = false;
                break;

            // Backspace, delete, 'd'
            case 8:
            case 46:
            case 68:
                console.log('Remove');
                sketchRenderer.removeObjects(selection);
                sketchRenderer.renderAll();
                selection.length = 0;
                break;

            // G
            case 71:
                console.log('Group');
                groups.push(selection);
                console.log(groups);
                break;

            // C
            case 67:
                if(selectMode) {
                    console.log('copy');

                    //quick deep copy so new objects are created for the clipboard
                    clipBoard = JSON.parse(JSON.stringify(selection));
                }
                break;
            //
            case 86:
                console.log('paste');

                for (var i in selection) {
                    selection[i].LineColor = selection[i].originalColor;
                    selection[i].isSelected = false;
                }
                selection = [];

                for(var i=0; i<clipBoard.length; i++){
                    if(clipBoard[i].ToolName != 'polygon'){
                        clipBoard[i].StartX += PASTE_OFFSET;
                        clipBoard[i].StartY += PASTE_OFFSET;
                    }
                    else{
                        for(var j=0; j<clipBoard[i].Values.length; j++){
                            clipBoard[i].Values[j].pointX += PASTE_OFFSET;
                            clipBoard[i].Values[j].pointY += PASTE_OFFSET;
                        }
                    }
                    selection.push(clipBoard[i]);
                    sketchRenderer.addToBuffer(clipBoard[i]);
                }
                clipBoard = JSON.parse(JSON.stringify(selection));
                sketchRenderer.renderAll();
                break;
        }
    })

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
            if (selectMode) {
                thisX = (e.pageX - canvas.offsetLeft) - offset;
                thisY = (e.pageY - canvas.offsetTop) - offset;
                mouseDown = true;
                lastX = thisX;
                lastY = thisY;
            } else if($scope.tool != 'polygon') {
                mouseDownEvent(e);
                mouseDown = true;
            }
		};

		canvas.onmousemove = function (e) {
            x = (e.pageX - canvas.offsetLeft) - offset;
            y = (e.pageY - canvas.offsetTop) - offset;
            // console.log('x: ' + x + ' y: ' + y );

            if(mouseDown && selectMode) {
                for (var i in selection) {
                    var shape = selection[i];
                    // console.log('shape: ' + shape)
                    shape.StartX = shape.StartX + x - lastX;
                    shape.StartY = shape.StartY + y - lastY;
                    renderPath(shape);
                }
                lastX = x;
                lastY = y;
                mouseDrag = true;
            }

			var x, y, lastPoint, data;
			if (!selectMode && ((mouseDown && $scope.tool != 'polygon' ) || ( $scope.tool == 'polygon' && polygonPoints>0))) { //if mouse is up in polygon mode, then drag
				points.push({
					x: x,
					y: y,
					color: colorValue[lineColorNumber]
				});
				
				lastPoint = points[points.length - 1];
				endPos.x = lastPoint.x;
				endPos.y = lastPoint.y;


                //if tool is polygon, need to switch to line for createRenderObject for proper "ghosting" effect
                //polygons render differently than lines so without this it wouldn't happen
                if($scope.tool == 'polygon'){
                    $scope.tool = 'line';
                    data = createRenderObject();
                    $scope.tool = 'polygon';
                }
                else{
                    data = createRenderObject();
                }
				renderPath(data);				
			}			
		};
                    //values
                        //points
                            //x
                            //y
		canvas.onmouseup = function (e) {
            var thisX = (e.pageX - canvas.offsetLeft) - offset;
            var thisY = (e.pageY - canvas.offsetTop) - offset;

            if (selectMode) {
                if (mouseDrag & selection.length > 0) {
                    
                } else {
                    var shape = sketchRenderer.findSelection(thisX,thisY);
                    if (shape != 'none') {
                        console.log('selected something!');
                        if (shape.isSelected) {
                            // Unselect
                            unselect([shape]);
                            selection.splice(selection.indexOf(shape), 1);
                        } else {
                            // Select
                            shape.LineColor = colorValue[4];
                            shape.isSelected = true;
                            selection.push(shape);
                        }
                        renderPath(shape);
                    } else {
                        unselect(selection);
                        selection.length = 0;
                    }
                }
                mouseDrag = false;
                mouseDown = false;
            } else {            
                if($scope.tool == 'polygon') {
                    thisX = (e.pageX - canvas.offsetLeft) - offset;
                    thisY = (e.pageY - canvas.offsetTop) - offset;


                    var clickMargin = 7;
                    if( prevX - clickMargin < thisX && prevX + clickMargin > thisX   &&   prevY - clickMargin < thisY && prevY + clickMargin > thisY ) {
                        console.log('clicked on last point');

                        polygonPointValues[polygonPointIndex].push({"pointX" : prevX,"pointY" : prevY});

                        var data = createRenderObject();
                        sketchRenderer.popBuffer();
                        sketchRenderer.addToBuffer(data);
                        $scope.midPolyDraw = false;
                        $scope.$apply();
                        polygonPoints = 0;
                        polygonPointIndex++;
                        renderPath(data);

                        document.getElementById("endShape").style.display='none';
                    } else if(polygonPoints==0) {

                        //this is start of polygon
                        document.getElementById("endShape").style.display='block';
                        $scope.midPolyDraw = true;
                        $scope.$apply();

                        //add a new entry in the array of entry arrays with starting point
                        polygonPointValues.push([{"pointX" : thisX,"pointY" : thisY}]);

                        mouseDownEvent(e);
                        polygonPoints++;

                        //store this point so can detect if they click on it later
                        prevX = thisX;
                        prevY = thisY;

                    } else {
                        polygonPoints++;
                        polygonPointValues[polygonPointIndex].push({"pointX" : thisX,"pointY" : thisY});

                        //console.log("Values: "+ JSON.stringify(polygonPointValues));
                        //console.log("currentPolyArr: " + JSON.stringify(polygonPointValues[polygonPointIndex]));


                        console.log('doing polygon stuff');
                        var data = createRenderObject();
                        //remove last version of polygon before rea-dding it with new data
                        if(polygonPoints != 2) {
                            sketchRenderer.popBuffer();
                        }
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
            }
		};

        var unselect = function(shapes) {
            for (var i in shapes) {
                shapes[i].LineColor = shapes[i].originalColor;
                shapes[i].isSelected = false;
                renderPath(shapes[i]);
            }
        };

        var mouseDownEvent = function(e) {
            points.push({
                x: (e.pageX - canvas.offsetLeft) - offset,
                y: (e.pageY - canvas.offsetTop) - offset,
                color: colorValue[lineColorNumber]
            });

            console.log("push in DOWN: " + (e.pageX - canvas.offsetLeft) - offset + " " + (e.pageY - canvas.offsetTop) - offset);

            //mouseDown = true;
            startPos.x = points[points.length-1].x;
            startPos.y = points[points.length-1].y;
            endPos.x = points[points.length-1].x;
            endPos.y = points[points.length-1].y;


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
        polygonPointIndex++;
        $scope.midPolyDraw = false;
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