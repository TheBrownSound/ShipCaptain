var Ocean = function(width, height){
	//Constants
	var MAX_TIDE_SPEED = 10;

	var _tideTopX = .1;
	var _tideTopY = .2;
	var _tideMidX = 0;
	var _tideMidY = -.1;
	var _tideBotX = -.2;
	var _tideBotY = .2;

	var ocean = new createjs.Container();
	ocean.width = width;
	ocean.height = height;
	ocean.position = {x:0, y:0};

	var crossWidth = width*3 + height*3;

	var tideTop = new createjs.Shape();
	var tideMid = new createjs.Shape();
	var tideBot = new createjs.Shape();
	
	tideTop.graphics.beginBitmapFill(Game.assets['tide_top']);
	tideTop.graphics.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);

	tideMid.graphics.beginBitmapFill(Game.assets['tide_mid']);
	tideMid.graphics.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);

	tideBot.graphics.beginBitmapFill(Game.assets['tide_bot']);
	tideBot.graphics.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);

	var underwater = new createjs.Container();

	ocean.addChild(underwater, tideBot, tideMid, tideTop);

	function moveTide() {
		_tideTopX += _tideTopX;
		_tideTopY += _tideTopY;
		_tideMidX += _tideMidX;
		_tideMidY += _tideMidY;
		_tideBotX += _tideBotX;
		_tideBotY += _tideBotY;

		tideTop.x = (ocean.position.x) % 400;
		tideTop.y = (ocean.position.y) % 400;
		tideMid.x = (ocean.position.x*.8) % 400;
		tideMid.y = (ocean.position.y*.8) % 400;
		tideBot.x = (ocean.position.x*.6) % 400;
		tideBot.y = (ocean.position.y*.6) % 400;
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
