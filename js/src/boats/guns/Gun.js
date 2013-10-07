var Gun = function(size, owner) {
	var gun = new createjs.Shape();
	var reloadTime = 100;
	var loaded = true;

	var width = size;
	var length = size*3;

	function drawGun() {
		gun.graphics.beginFill('#000');
		gun.graphics.rect(-(width/2),-length,width,length);
		gun.graphics.endFill();
	}

	function fire() {
		var ball = new Projectile(Utils.convertToHeading(owner.rotation+gun.rotation), 20, owner);
		var pos = gun.localToLocal(0,-length,gun.parent.parent);
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

	drawGun();

	return gun;
}

var Projectile = function(angle, velocity, owner) {
	var range = velocity*4;

	var cannonBall = new createjs.Shape();
	cannonBall.graphics.beginFill('#000');
	cannonBall.graphics.drawCircle(0,0,5);
	cannonBall.graphics.endFill();

	function checkForHit() {
		for (var ship in Game.world.ships) {
			var boat = Game.world.ships[ship]
			if (boat != owner) {
				var globalPos = cannonBall.localToGlobal(0,0);
				var local = boat.globalToLocal(globalPos.x, globalPos.y);
				var hit = boat.hitTest(local.x, local.y);
				if (hit) {
					explode();
					boat.damage(20);
					return;
				}
			}
		};
	}

	function explode() {
		createjs.Ticker.removeEventListener("tick", update);
		for (var i = 0; i < 30; i++) {
			var bubble = new Bubble();
			bubble.x = cannonBall.x;
			bubble.y = cannonBall.y;
			cannonBall.parent.addChild(bubble);
			bubble.animate();
		};
		cannonBall.parent.removeChild(cannonBall);
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