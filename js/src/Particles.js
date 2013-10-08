var Particles = function() {
	var particles = {};

	particles.Smoke = function(range) {
		range = range || 360;

		var smoke = new createjs.Container();
		var img = new createjs.Bitmap("images/smoke.png");
		img.regX = img.regY = 25;
		smoke.addChild(img);

		function dissapate() {
			smoke.parent.removeChild(smoke);
		}

		smoke.animate = function() {
			var angle = Utils.getRandomInt(0,range);
			var scale = Utils.getRandomFloat(.2,1);
			var swirl = Utils.getRandomInt(-360, 360);
			var move = Utils.getAxisSpeed(angle+this.rotation, Utils.getRandomInt(50,100));
			smoke.scaleX = smoke.scaleY = 0;

			createjs.Tween.get(this,{loop:false})
				.to({
					x: smoke.x+move.x,
					y: smoke.y-move.y,
					scaleX: scale,
					scaleY: scale,
					alpha: 0
				},1000,createjs.Ease.easeOut)
				.call(dissapate);
			createjs.Tween.get(img,{loop:true})
				.to({
					rotation: swirl
				},1000,createjs.Ease.linear);
		}

		return smoke;
	}

	particles.Bubble = function() {
		var _floatVariance = 100;
		var bubble = new createjs.Shape();
		
		bubble.graphics.beginFill('#95cbdc');
		bubble.graphics.drawCircle(-5,-5,10);
		bubble.graphics.endFill();
	
		bubble.scaleX = bubble.scaleY = .1;
		function pop() {
			bubble.parent.removeChild(bubble);
		}
	
		bubble.animate = function() {
			var floatX = Utils.getRandomFloat(-_floatVariance,_floatVariance)+bubble.x;
			var floatY = Utils.getRandomFloat(-_floatVariance,_floatVariance)+bubble.y;
			var scale = Utils.getRandomFloat(1,3);
		
			createjs.Tween.get(bubble,{loop:false})
				.set({scaleX:0.1,scaleY:0.1}, bubble)
				.to({
					x: floatX,
					y: floatY,
					scaleX: scale,
					scaleY: scale,
					alpha: 0
				},3000,createjs.Ease.easeOut)
				.call(pop);
		}
		return bubble;
	}

	return particles;
}();