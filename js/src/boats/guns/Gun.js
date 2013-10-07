var Gun = function() {
	var gun = new createjs.Container();
	var reloadTime = 10;
	var loaded = true;

	function fire() {
		var ball = new Projectile(Utils.convertToHeading(gun.parent.rotation), 20);
		var pos = gun.localToLocal(0,0,gun.parent.parent);
		ball.x = pos.x;
		ball.y = pos.y;
		gun.parent.parent.addChild(ball);

		loaded = false;
		setTimeout(function(){
			loaded = true;
		}, reloadTime);
	}

	gun.shoot = function() {
		if (loaded) {
			fire();
		}
	}

	return gun;
}

var Projectile = function(angle, velocity) {
	var range = velocity*4;

	var cannonBall = new createjs.Shape();
	cannonBall.graphics.beginFill('#000');
	cannonBall.graphics.drawCircle(0,0,5);
	cannonBall.graphics.endFill();

	function checkForHit() {

	}

	function explode() {
		for (var i = 0; i < 30; i++) {
			var bubble = new Bubble();
			bubble.x = cannonBall.x;
			bubble.y = cannonBall.y;
			cannonBall.parent.addChild(bubble);
			bubble.animate();
		};
		cannonBall.parent.removeChild(cannonBall);
		createjs.Ticker.removeEventListener("tick", update);
	}

	function update() {
		range--;
		if (range > 0) {
			cannonBall.x += Math.sin(angle*Math.PI/180)*velocity;
			cannonBall.y -= Math.cos(angle*Math.PI/180)*velocity;
			checkForHit();
		} else {
			explode();
		}
	}

	createjs.Ticker.addEventListener("tick", update);
	return cannonBall;
}