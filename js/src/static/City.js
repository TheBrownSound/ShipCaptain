var City = function() {
  var city = new Place();
  var top = new createjs.Bitmap("images/city_top.png");
  var bottom = new createjs.Bitmap("images/city_bottom.png")
  city.addChild(bottom, top);

  city.__defineGetter__('hitBox', function(){
    return top;
  });

  city.regX = 500;
  city.regY = 500;

  return city;
}