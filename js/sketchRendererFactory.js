sketchApp.factory("sketchRenderer", function () {
	"use strict";
	var context;
    var	buffer = [];
    var savedSketches = [];
    var clickMargin = 10;
    var undoneShapes = [];

    var	renderPencil = function (data) {
		context.beginPath();
		context.lineCap = 'round';
		context.strokeStyle = data.LineColor;
		context.lineWidth = data.LineWidth;
		context.moveTo(data.Points[0].x, data.Points[0].y);
		for (var i = 0; i < data.Points.length; i++) {
			context.lineTo(data.Points[i].x, data.Points[i].y);
		}
		context.stroke();
	};

    var	renderLine = function (data) {
		context.beginPath();
		context.strokeStyle = data.LineColor;
		context.lineWidth = data.LineWidth;
		context.lineCap = 'round';
		context.moveTo(data.StartX, data.StartY);
		context.lineTo(data.EndX, data.EndY);
		context.stroke();
	};

    var	renderPolygon = function (data) {
        context.beginPath();
        context.strokeStyle = data.LineColor;
        context.lineWidth = data.LineWidth;
        context.lineCap = 'round';

        /*======= Drawing poly-based on polygonPointValues ============*/
        for(var i=0; i<data.Points.length-1; i++ ) {
            context.moveTo(data.Points[i].x, data.Points[i].y);
            context.lineTo(data.Points[i+1].x, data.Points[i+1].y);
            context.stroke();
        }
        /* =================Old Code Below==================== */

        //context.moveTo(data.StartX, data.StartY);
        //context.lineTo(data.EndX, data.EndY);
        //context.stroke();
    };


    var	renderRectangle = function (data) {
		context.beginPath();
		context.strokeStyle = data.LineColor;
		context.fillStyle = data.FillColor;
		context.lineWidth = data.LineWidth;
		context.rect(data.StartX, data.StartY, data.Width, data.Height);
		if (data.FillShape)	context.fill();
		context.stroke();
	};

    var	renderSquare = function (data) {
        context.beginPath();
        context.strokeStyle = data.LineColor;
        context.fillStyle = data.FillColor;
        context.lineWidth = data.LineWidth;
        context.rect(data.StartX, data.StartY, data.Side, data.Side);
        if (data.FillShape)	context.fill();
        context.stroke();
    };

    var	renderCircle = function (data) {
		context.beginPath();
		context.strokeStyle = data.LineColor;
		context.fillStyle = data.FillColor;
		context.lineWidth = data.LineWidth;
		context.arc(data.StartX, data.StartY, data.Radius, 0, Math.PI * 2, false);
		if (data.FillShape)	context.fill();
		context.stroke();
	};

    var	renderEllipse = function (data) { //ctx,cx,cy,rx,ry,style
        if(context.ellipse)
        {
            context.save();
            context.beginPath();
            context.strokeStyle = data.LineColor;
            context.fillStyle = data.FillColor;
            context.lineWidth = data.LineWidth;
            // x, y, x radius, y radius, rotation, start angle, end angle
            context.ellipse(data.StartX, data.StartY, data.RadiusX, data.RadiusY, 0, 0, Math.PI*2);
            if (data.FillShape)	context.fill();
            context.stroke();
            context.restore();
        }
    };

    var	renderAll = function () {
		context.clearRect(0, 0, canvas.width, canvas.height);
		for (var i = 0; i < buffer.length; i++) {
            if (buffer[i].removed) continue;
			switch (buffer[i].ToolName) {
				case "pencil":
					renderPencil(buffer[i]);
					break;
				case "rectangle":
					renderRectangle(buffer[i]);
					break;
				case "circle":
					renderCircle(buffer[i]);
					break;
				case "line":
					renderLine(buffer[i]);
					break;
                case "ellipse":
                    renderEllipse(buffer[i]);
                    break;
                case "square":
                    renderSquare(buffer[i]);
                    break;
                case "polygon":
                    renderPolygon(buffer[i]);
                    break;
			}
		}
	};

    var	save = function (sketchName) {
        console.log('saving sketch: '+sketchName);
        //add each element of buffer to currBuffer to save
        var currBuffer = [];
        for(var i=0;i<buffer.length;i++) {
            currBuffer.push(buffer[i]);
        }


        var sketchExists = false;
        for(var i=0;i<savedSketches.length;i++) {
            if(savedSketches[i].name==sketchName) {
                if (confirm('Overwrite: ' + sketchName + '?')) {
                    console.log('overwriting old saved sketch');
                    savedSketches[i].data = currBuffer;
                }
                sketchExists = true;
            }
        }

        if(!sketchExists) {
            var tuple = {name: sketchName, data: currBuffer};
            savedSketches.push(tuple);
            alert('Saved: '+sketchName);
            console.log('added '+tuple.name+' to saved sketches');
        }
    };

    var comparePoints = function (objX,objY,thisX,thisY) {
        if( objX - clickMargin < thisX && objX + clickMargin > thisX   &&   objY - clickMargin < thisY && objY + clickMargin > thisY ) {
            return true;
        } else {
            return false;
        }
    };

    var CheckClickingLine = function (thisX,thisY,StartX,EndX,StartY,EndY) {
        var betweenUp = StartX - clickMargin/2 < thisX && thisX < EndX + clickMargin/2;
        var betweenDown = EndX - clickMargin/2 < thisX && thisX < StartX + clickMargin/2;

        if (betweenUp || betweenDown) {
            var m = (EndY-StartY)/(EndX-StartX);
            var b = EndY - m * EndX;

            var y = m * thisX + b;
            if (Math.abs(y - thisY) < clickMargin) {
                return true;
            }
        }
        return false;
    }

    var distance = function(x1, x2, y1, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    var checkCircle = function(thisX, thisY, StartX, StartY, Radius) {
        // StartX and StartY are the center of the circle
        return distance(thisX, StartX, thisY, StartY) < Radius + clickMargin;
    }

    var checkEllipse = function(thisX, thisY, centerX, centerY, radiusX, radiusY) {
        var x = Math.pow(thisX - centerX, 2) / Math.pow(radiusX, 2);
        var y = Math.pow(thisY - centerY, 2) / Math.pow(radiusY, 2);
        return (x + y) <= 1.1;
    }

	return {
		addToBuffer: function (data) {
			buffer.push(data);
		},

        popBuffer: function() {
            buffer.pop();
        },

        removeObjects: function(selection) {
            for (var i in selection) {
                var indexDelete = buffer.indexOf(selection[i]);
                buffer.splice(indexDelete, 1);
            }
        },

		renderAll: function () {
			renderAll();
		},

		render: function (data) {
			switch (data.ToolName) {
				case "pencil":
					renderPencil(data);
					break;
				case "rectangle":
					renderRectangle(data);
					break;
				case "circle":
					renderCircle(data);
					break;
				case "line":
					renderLine(data);
					break;
                case "ellipse":
                    renderEllipse(data);
                    break;
                case "square":
                    renderSquare(data);
                    break;
                case "polygon":
                    renderPolygon(data);
                    break;
			}
		},

		setContext: function (ctx) {
			context = ctx;
		},

		undo: function () {
            var top = buffer.pop();

            if(top.isAction == true){
                for(var i=0; i< top.actionItems.length; i++){
                    if(top.type == 'delete'){

                    }
                    else if(top.type == 'paste'){

                    }
                    else if(top.type == 'group'){

                    }
                    else if(top.type == 'ungroup'){

                    }
                    else if(top.type == 'move'){

                    }

                }
            }
            else{
                undoneShapes.push(top);
            }
            document.getElementById("redobutton").style.display='block';
		},

        redo: function () {
            var top = undoneShapes.pop();
            if(top.isAction == true){
                for(var i=0; i< top.actionItems.length; i++){
                    if(top.type == 'delete'){

                    }
                    else if(top.type == 'paste'){

                    }
                    else if(top.type == 'group'){

                    }
                    else if(top.type == 'ungroup'){

                    }
                    else if(top.type == 'move'){

                    }
                }
            }
            else{
                buffer.push(top);
            }

            if(undoneShapes.length==0) document.getElementById("redobutton").style.display='none';
        },

        save: function (sketchName) {
            save(sketchName);
            //if (confirm('Would you like to start a new sketch?')) {
            //    console.log('starting new sketch');
            //    buffer = [];
            //    renderAll();
            //} else {
            //    console.log('continuing same sketch');
            //}
        },

        load: function () {
            console.log('loading sketch');
            //if (confirm('Would you like to save the current sketch?')) {
            //    save();
            //}

            var sketchName ="";
            sketchName = prompt('please enter the name of the sketch you would like to load');

            var loaded = false;
            if(sketchName!=null) {
                for (var i = 0; i < savedSketches.length; i++) {
                    if (savedSketches[i].name == sketchName) {
                        console.log('found saved sketch, loading');
                        loaded = true;
                        buffer = savedSketches[i].data;
                        renderAll();
                    }
                }
            }
            if(!loaded) alert('Could not find: '+sketchName);
        },

        newSketch: function () {
            console.log('starting new sketch');
            buffer = [];
            renderAll();
        },

        findSelection: function(thisX,thisY) {
            var found = false;
            var objData = [];
            //go through buffer to see if we selected something
            for (var i = 0; i < buffer.length; i++) {
                switch (buffer[i].ToolName) {
                    case "pencil":
                        for(var j=0; j<buffer[i].Points.length; j++){
                            var objX = buffer[i].Points[j].x;
                            var objY = buffer[i].Points[j].y;

                            found = comparePoints(objX,objY,thisX,thisY);
                            if(found) {
                                console.log('found');
                                return buffer[i];
                            }
                        }
                        break;
                    case "line":
                        found = CheckClickingLine(thisX,thisY,buffer[i].StartX,buffer[i].EndX,buffer[i].StartY,buffer[i].EndY);
                        break;
                    case "rectangle":
                        var recStartX = buffer[i].StartX;
                        var recStartY = buffer[i].StartY;
                        var recWidth = buffer[i].Width;
                        var recHeight = buffer[i].Height;

                        if(recHeight >= 0 && recWidth < 0) {
                            if (thisX >= recStartX + recWidth && thisX <= recStartX && thisY <= recStartY + recHeight && thisY >= recStartY) {
                                return buffer[i];
                            }
                        }
                        else if(recHeight < 0 && recWidth >= 0) {
                            if (thisX <= recStartX + recWidth && thisX >= recStartX && thisY >= recStartY + recHeight && thisY <= recStartY) {
                                return buffer[i];
                            }
                        }
                        else if(recHeight < 0 && recWidth < 0) {
                            if (thisX >= recStartX + recWidth && thisX <= recStartX && thisY >= recStartY + recHeight && thisY <= recStartY) {
                                return buffer[i];
                            }
                        }
                        else { //both positive
                            if (thisX <= recStartX + recWidth && thisX >= recStartX && thisY <= recStartY + recHeight && thisY >= recStartY) {
                                return buffer[i];
                            }
                        }

                        break;
                    case "circle":
                        found = checkEllipse(thisX, thisY, buffer[i].StartX, buffer[i].StartY, buffer[i].Radius, buffer[i].Radius);
                        break;
                    case "ellipse":
                        found = checkEllipse(thisX, thisY, buffer[i].StartX, buffer[i].StartY, buffer[i].RadiusX, buffer[i].RadiusY);
                        break;
                    case "square":

                        var sqStartX = buffer[i].StartX;
                        var sqStartY = buffer[i].StartY;
                        var sqSide = buffer[i].Side;

                        if(sqSide < 0) {
                            if (thisX >= sqStartX + sqSide && thisX <= sqStartX && thisY >= sqStartY + sqSide && thisY <= sqStartY) {
                                return buffer[i];
                            }
                        }
                        else { //both positive
                            if (thisX <= sqStartX + sqSide && thisX >= sqStartX && thisY <= sqStartY + sqSide && thisY >= sqStartY) {
                                return buffer[i];
                            }
                        }
                        break;
                    case "polygon":
                        var points = buffer[i].Points;
                        for(var j = 0; j < points.length - 1; j++){
                            found = CheckClickingLine(thisX,thisY,points[j].x, points[j+1].x, points[j].y, points[j+1].y);
                            if(found){
                                console.log('found ' + buffer[i].ToolName);
                                found = false;
                                return buffer[i];
                            }
                        }

                        break;
                    default:
                        console.log("findSelection: unknown tool: "+buffer[i].tool);
                        break;
                }
                if (found) {
                    return buffer[i];
                }
            }
            if (!found)return 'none';
        }
	};
});















