var TellTail = function(length, color) {
	length = length || 10;
	color = color || '#FF0000'
	
	var waveVariation = 3;
	var waveAmount = 0;
	var direction = 'forward'
	
	var tail = new createjs.Shape();
	var gfx = tail.graphics;

	function updateTail() {
		if (waveAmount >= waveVariation) {
			direction = 'reverse';
		} else if (waveAmount <= -waveVariation) {
			direction = 'forward';
		}

		if (direction === 'reverse') {
			waveAmount--;
		} else {
			waveAmount++;
		}

		var waveFactor = waveAmount;
		gfx.clear();
		gfx.beginStroke(color);
		gfx.setStrokeStyle(2, 1);
		gfx.moveTo(0,0);
		//gfx.lineTo(0, length);
		gfx.bezierCurveTo(waveFactor, length/2, -waveFactor, length/2, -waveFactor/2, length);
		gfx.endStroke();
	}

	createjs.Ticker.addEventListener('tick', updateTail);
	return tail;
}