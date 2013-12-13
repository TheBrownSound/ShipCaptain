var Ocean = function(width, height){
	//Constants
	var MAX_TIDE_SPEED = 10;

	var ocean = new createjs.Container();
	ocean.width = width;
	ocean.height = height;
	ocean.position = {x:0, y:0};

	var crossWidth = width*3 + height*3;

	var tide = new createjs.Shape();
	
	tide.graphics.beginBitmapFill(Game.assets['tide']);
	tide.graphics.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);

	var underwater = new createjs.Container();

	ocean.addChild(underwater, tide);

	function moveTide() {
		tide.x = (ocean.position.x) % 400;
		tide.y = (ocean.position.y) % 400;
	}

	ocean.spawnBubble = function() {
		var bubble = new Particles.Bubble();
		bubble.x = -ocean.position.x;
		bubble.y = -ocean.position.y;
		bubble.animate();
		underwater.addChild(bubble);
	}

	ocean.update = function() {
		document.getElementById('coords').innerHTML = ('x:'+ocean.position.x+' - y:'+ocean.position.y);
		underwater.x = ocean.position.x;
		underwater.y = ocean.position.y;
		moveTide();
	}

	return ocean;
}
