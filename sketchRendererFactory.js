sketchApp.factory("sketchRenderer", function () {
	"use strict";
	var context;
    var	buffer = [];
    var savedSketch;

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

    var	save = function () {
        console.log('saving sketch');
        savedSketch = buffer;
    };

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
			buffer.pop();			
		},

        save: function () {
            save();
            if (confirm('Would you like to start a new sketch?')) {
                console.log('starting new sketch');
                buffer = [];
                renderAll();
            } else {
                console.log('continuing same sketch');
            }
        },

        load: function () {
            console.log('loading sketch');
            if (confirm('Would you like to save the current sketch?')) {
                save();
            }

            if(savedSketch.length>0) {
                buffer = savedSketch;
                renderAll();
            } else {
                alert('No saved sketches exist.')
            }
        }
	};
});