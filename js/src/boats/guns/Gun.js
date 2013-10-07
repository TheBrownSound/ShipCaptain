var Gun = function(size, owner) {
	var gun = new createjs.Shape();
	var reloadTime = 10000;
	var loaded = true;

	var width = size;
	var length = size*3;

	function drawGun() {
		gun.graphics.beginFill('#000');
		// Barrel
		gun.graphics.moveTo(0,0);
		gun.graphics.curveTo(width/2,0,width/2,-(width/2));
		gun.graphics.lineTo(width/2-(width/4),-length);
		gun.graphics.lineTo(-(width/2)+(width/4),-length);
		gun.graphics.lineTo(-(width/2),-(width/2));
		gun.graphics.curveTo(-(width/2),0,0,0);
		gun.graphics.endFill();
		// Barrel mouth
		gun.graphics.beginFill('#000');
		gun.graphics.drawRoundRect(-(width/2),-length,width,width/2, width/4);
		gun.graphics.endFill();
		// Barrel butt
		gun.graphics.beginFill('#000');
		gun.graphics.drawCircle(0,0, width/4);
		gun.graphics.endFill();
	}

	function fire() {
		var ball = new Projectile(size*.75,Utils.convertToHeading(owner.rotation+gun.rotation), owner);
		var pos = gun.localToLocal(0,0,gun.parent.parent);
		ball.x = pos.x;
		ball.y = pos.y;
		owner.parent.addChildAt(ball, 2);

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

var Projectile = function(size, angle, owner) {
	var velocity = size*2;
	var range = velocity*4;

	var boatXSpeed = Math.sin(owner.heading*Math.PI/180)*-owner.speed;
	var boatYSpeed = Math.cos(owner.heading*Math.PI/180)*owner.speed;

	var cannonBall = new createjs.Shape();
	cannonBall.graphics.beginFill('#000');
	cannonBall.graphics.drawCircle(0,0,size/2);
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
			cannonBall.x += Math.sin(angle*Math.PI/180)*velocity+boatXSpeed;
			cannonBall.y -= Math.cos(angle*Math.PI/180)*velocity-boatYSpeed;
			checkForHit();
		} else {
			explode();
		}
	}

	createjs.Ticker.addEventListener("tick", update);
	return cannonBall;
}