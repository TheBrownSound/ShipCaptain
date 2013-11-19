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

		smoke.animate = function(momentum) {
			momentum = momentum || {x:0,y:0};
			var angle = Utils.getRandomInt(0,range);
			var scale = Utils.getRandomFloat(.2,1);
			var swirl = Utils.getRandomInt(-360, 360);
			var move = Utils.getAxisSpeed(angle+this.rotation, Utils.getRandomInt(50,100));
			smoke.scaleX = smoke.scaleY = scale;
			
			var duration = 3000;

			createjs.Tween.get(this,{loop:false})
				.to({
					x: (smoke.x+move.x)+(momentum.x*30),//30 seems to be the magic number for 60fps
					y: (smoke.y+move.y)+(momentum.y*30)
				},duration,createjs.Ease.circOut);

			createjs.Tween.get(this,{loop:false})
				.to({
					scaleX: 0,
					scaleY: 0
				},duration,createjs.Ease.expoIn)
				.call(dissapate);
			
			createjs.Tween.get(img,{loop:false})
				.to({
					rotation: swirl
				},duration,createjs.Ease.circOut)
				
		}

		return smoke;
	}

	particles.Splinter = function(range) {
		range = range || 360;

		var splinter = new createjs.Container();
		var type = Utils.getRandomInt(1,3);
		var shrapnel = new createjs.Bitmap("images/splinter"+Utils.getRandomInt(1,3)+".png");
		shrapnel.regX = (15*type)/2;
		shrapnel.regY = 5;
		splinter.addChild(shrapnel);

		function sink() {
			splinter.parent.removeChild(splinter);
		}

		splinter.animate = function() {
			var angle = Utils.getRandomInt(0,range);
			var scale = Utils.getRandomFloat(.2,1);
			var spin = Utils.getRandomInt(-720, 720);
			var move = Utils.getAxisSpeed(angle+this.rotation, Utils.getRandomInt(0,100));
			splinter.scaleX = splinter.scaleY = scale;

			createjs.Tween.get(splinter,{loop:false})
				.to({
					x: splinter.x+move.x,
					y: splinter.y+move.y,
				},1500,createjs.Ease.quintOut)
				.to({
					scaleX: .1,
					scaleY: .1,
					alpha: 0
				},2000,createjs.Ease.quadIn)
				.call(sink);
				
			createjs.Tween.get(shrapnel,{loop:false})
				.to({
					rotation: spin
				},2000,createjs.Ease.quintOut);
				
		}

		return splinter;
	}

	particles.Bubble = function() {
		var _floatVariance = 100;
		var bubble = new createjs.Shape();
		
		bubble.graphics.beginFill('#639ebe');
		bubble.graphics.drawCircle(-5,-5,10);
		bubble.graphics.endFill();
	
		bubble.scaleX = bubble.scaleY = .1;
		function pop() {
			bubble.parent.removeChild(bubble);
		}
	
		bubble.animate = function() {
			var floatX = Utils.getRandomFloat(-_floatVariance,_floatVariance)+bubble.x;
			var floatY = Utils.getRandomFloat(-_floatVariance,_floatVariance)+bubble.y;
			var scale = Utils.getRandomFloat(.5,2);
		
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