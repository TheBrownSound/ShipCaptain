var Gun = function(caliber, length, owner) {
	var maximumInaccuracy = 5; //degrees
	var gun = new createjs.Container();
	var cannon = new createjs.Shape();

	gun.addChild(cannon);

	var reloadTime = (caliber*1000)+(length*100);
	var loaded = true;

	var width = caliber;
	var length = length || caliber*3;

	function drawGun() {
		var gfx = cannon.graphics
		gfx.beginFill('#000');
		// Barrel
		gfx.moveTo(0,0);
		gfx.curveTo(width/2,0,width/2,-(width/2));
		gfx.lineTo(width/2-(width/4),-length);
		gfx.lineTo(-(width/2)+(width/4),-length);
		gfx.lineTo(-(width/2),-(width/2));
		gfx.curveTo(-(width/2),0,0,0);
		gfx.endFill();
		// Barrel mouth
		gfx.beginFill('#000');
		gfx.drawRoundRect(-(width/2),-length,width,width/2, width/4);
		gfx.endFill();
		// Barrel butt
		gfx.beginFill('#000');
		gfx.drawCircle(0,0, width/4);
		gfx.endFill();
	}

	function recoil() {
		cannon.y += caliber;

		// Roll back when reloaded
		createjs.Tween.get(cannon, {override:true})
			.wait(reloadTime-1000)
			.to({y:0}, 1000, createjs.Ease.sineOut)
	}

	function fire() {
		var angle = Utils.convertToHeading(owner.rotation+gun.rotation)
		//var accuracy = (caliber/length)*maximumInaccuracy;

		var ball = new Projectile(caliber*.75,angle, owner);
		var pos = gun.localToLocal(0,-length,owner.parent);
		ball.x = pos.x;
		ball.y = pos.y;
		owner.parent.addChildAt(ball, 2);

		for (var i = 0; i < caliber; i++) {
			var smoke = new Particles.Smoke(60);
			smoke.x = pos.x;
			smoke.y = pos.y;
			smoke.rotation = owner.rotation+gun.rotation-30;
			var momentum = Utils.getAxisSpeed(owner.heading,owner.speed);
			smoke.animate(momentum);
			owner.parent.addChild(smoke);
		};

		recoil();

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

	gun.isInRange = function(target) {
		var gunHeading = Utils.convertToHeading(owner.heading+this.rotation);
		var targetHeading = Utils.getRelativeHeading(gun.localToLocal(0,0,owner.parent), target);
		var rangeThreshold = 10;
		var headingDifference = Utils.headingDifference(gunHeading, targetHeading);
		return (Math.abs(headingDifference) <= rangeThreshold);
	}

	drawGun();

	return gun;
}

var Projectile = function(size, angle, owner) {
	var velocity = size*2;
	var range = velocity*4;

	var boatXSpeed = Math.sin(owner.heading*Math.PI/180)*owner.speed;
	var boatYSpeed = Math.cos(owner.heading*Math.PI/180)*-owner.speed;

	var cannonBall = new createjs.Shape();
	cannonBall.graphics.beginFill('#000');
	cannonBall.graphics.drawCircle(0,0,size/2);
	cannonBall.graphics.endFill();

	function removeProjectile() {
		createjs.Ticker.removeEventListener("tick", update);
		cannonBall.parent.removeChild(cannonBall);
	}

	function checkForHit() {
		for (var ship in Game.world.ships) {
			var boat = Game.world.ships[ship]
			if (boat != owner) {
				var globalPos = cannonBall.localToGlobal(0,0);
				var local = boat.globalToLocal(globalPos.x, globalPos.y);
				var hit = boat.hitTest(local.x, local.y);
				if (hit) {
					boat.cannonHit(size+velocity, local);
					removeProjectile();
					return;
				}
			}
		};
	}

	function miss() {
		for (var i = 0; i < 30; i++) {
			var bubble = new Particles.Bubble();
			bubble.x = cannonBall.x;
			bubble.y = cannonBall.y;
			cannonBall.parent.addChild(bubble);
			bubble.animate();
		};
		removeProjectile();
	}

	function update() {
		range--;
		if (range > 0) {
			cannonBall.x += Math.sin(angle*Math.PI/180)*velocity+boatXSpeed;
			cannonBall.y -= Math.cos(angle*Math.PI/180)*velocity-boatYSpeed;
			checkForHit();
		} else {
			miss();
		}
	}

	createjs.Ticker.addEventListener("tick", update);
	return cannonBall;
}