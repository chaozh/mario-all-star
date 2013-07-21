/**
	Renders a background portion of the level.
	Code by Chao, 2012
*/

Game.BackgroundRender = function(level, width, height, distance){
	this.Level = level;
	this.Width = width;
	this.Distance = distance;
	this.TileY = ((height / 32) | 0) + 1;

	this.Background = Game.SpriteCuts.GetBackgroundSheet();//get origin image
};

Game.BackgroundRender.prototype = new Enjine.Drawable();

Game.BackgroundRender.prototype.Draw = function(context, camera) {
	var xCam = camera.X / this.Distance;
	var x = 0, y = 0, b = null, frame = null;

	//the OR truncates the decimal, quicker than Math.floor
	var xTileStart = (xCam / 32) | 0;
	//the +1 makes sure the right edge tiles get drawn
    var xTileEnd = (((xCam + this.Width) / 32) | 0);

    for (x = xTileStart; x <= xTileEnd; x++) {
		for (y = 0; y < this.TileY; y++) {
			b = this.Level.GetBlock(x, y) & 0xff;
			frame = this.Background[b % 8][(b / 8) | 0];

			//bitshifting by five is the same as multiplying by 32
			context.drawImage(Enjine.Resources.Images["background"], frame.X, frame.Y, frame.Width, frame.Height, ((x << 5) - xCam) | 0, (y << 5) | 0, frame.Width, frame.Height);
		}
	}
};