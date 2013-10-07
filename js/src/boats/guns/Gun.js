var Gun = function() {
	var gun = new createjs.Container();
	var reloadTime = 10;
	var loaded = true;

	function fire() {
		var ball = new Projectile(Utils.convertToHeading(gun.parent.rotation), 10);
		var pos = gun.localToLocal(0,0,Game.world);
		ball.x = pos.x;
		ball.y = pos.y;
		Game.world.addChild(ball);

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
	var lifespan = velocity*10;
	var xSpeed = Math.sin(angle*Math.PI/180)*velocity;
	var ySpeed = Math.cos(angle*Math.PI/180)*velocity;

	var cannonBall = new createjs.Shape();
	cannonBall.graphics.beginFill('#000');
	cannonBall.graphics.drawCircle(0,0,5);
	cannonBall.graphics.endFill();

	function checkForHit() {

	}

	function explode() {
		cannonBall.parent.removeChild(cannonBall);
		createjs.Ticker.removeEventListener("tick", update);
	}

	function update() {
		lifespan--;
		if (lifespan > 0) {
			cannonBall.x += xSpeed;
			cannonBall.y -= ySpeed;
			checkForHit();
		} else {
			explode();
		}
	}

	createjs.Ticker.addEventListener("tick", update);
	return cannonBall;
}