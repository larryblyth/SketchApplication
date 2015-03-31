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
		context.strokeStyle = data.Color;
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
        context.moveTo(data.StartX, data.StartY);
        context.lineTo(data.EndX, data.EndY);
        context.stroke();
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
            context.ellipse(data.StartX, data.StartY, data.Radius, data.Radius/2, 0, 0, Math.PI*2);
            if (data.FillShape)	context.fill();
            context.stroke();
            context.restore();
        }
    };

    var	renderAll = function () {
		context.clearRect(0, 0, canvas.width, canvas.height);
		for (var i = 0; i < buffer.length; i++) {
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
        var m = (EndY-StartY)/(EndX-StartX);
        var b = EndY-m*EndX;

        //start from lower y and iterate to upper y
        var lowery = StartY;
        var uppery = EndY;
        if(EndY<lowery) {
            lowery =EndY;
            uppery =StartY;
        }
        var foundIt = false;
        for(var y=lowery;y<uppery;y++) {
            var x = (y-b)/m;
            foundIt = comparePoints(x,y,thisX,thisY);
            if(foundIt) return true;
        }
        return false;
    }

	return {
		addToBuffer: function (data) {
			buffer.push(data);
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
            undoneShapes.push(buffer.pop());
            document.getElementById("redobutton").style.display='block';
		},

        redo: function () {
            buffer.push(undoneShapes.pop());
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
                        for(var j=0;j<buffer[i].Points.length;j++){
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
                        if(found) {
                            found = false; //reset for next time
                            return buffer[i];
                        }
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
                        //To-Do
                        break;
                    case "ellipse":
                        //To-Do
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
                        //To-Do
                        break;
                    default:
                        console.log("findSelection: unknown tool: "+buffer[i].tool);
                        break;
                }
            }
            if (!found)return "none";
        }
	};
});















