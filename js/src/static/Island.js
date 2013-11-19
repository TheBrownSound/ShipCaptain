var Island = function() {
	var island = new Place();
	var top = new createjs.Bitmap("images/island.png");
	var bottom = new createjs.Bitmap("images/island_bottom.png")
	island.addChild(bottom, top);

	island.__defineGetter__('hitBox', function(){
		return top;
	});

	return island;
}