var Island = function() {
	var island = new Place();
	var img = new createjs.Bitmap("images/island.png");
	island.addChild(img);

	island.__defineGetter__('hitBox', function(){
		return img;
	});

	return island;
}