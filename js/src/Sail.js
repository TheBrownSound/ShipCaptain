var Sail = (function(width, height, sloop) {
	var sail = new createjs.Container();

	var support = new createjs.Shape();
	support.graphics.beginFill('#52352a');
	support.graphics.drawRoundRect(-(width/2),-height, width, height, 4);
	support.graphics.endFill();

	sail.getPower = function() {
		return 5;
	}

	sail.addChild(support);

	return sail;
});