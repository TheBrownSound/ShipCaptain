var Island = function() {
	var island = new Place();
	var top = new createjs.Bitmap("images/island.png");
	var bottom = new createjs.Bitmap("images/island_bottom.png")
	island.addChild(bottom, top);

  var _poly = [20,60, 360,60, 360,360, 20,360];

  island.drawPoly = function() {
    var shape = new createjs.Shape();
    
    shape.graphics.beginFill('#F00');
    shape.graphics.moveTo(_poly[0], _poly[1]);
    for (var i = 2; i < _poly.length; i+=2) {
      shape.graphics.lineTo(_poly[i], _poly[i+1]);
    };
    shape.graphics.endFill();
    island.addChildAt(shape, 0);
  }

	island.__defineGetter__('hitBox', function(){
		return top;
	});

  island.__defineGetter__('poly', function(){
    var poly = _poly.slice(0);
    for (var i = 0; i < poly.length; i++) {
      if (i%2 === 1) {
        poly[i] += island.y;
      } else {
        poly[i] += island.x;
      }
    };
    return poly;
  });

  island.drawPoly();

	return island;
}