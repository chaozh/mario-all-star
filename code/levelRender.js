/**
	Renders a playable level.
	Code by Chao, 2013
*/

Game.LevelRender = function(level, width, height){
	this.Width = width;
	this.Height = height;
	this.Level = level;
	this.TilesY = ((height / 16)|0) + 1;
	this.Delta = 0;
	this.Tick = 0;
	this.Bounce = 0;
	this.AnimTime = 0;

	this.Background = Game.SpriteCuts.GetLevelSheet();
};

Game.LevelRender.prototype = new Enjine.Drawable();

Game.LevelRender.prototype.Update = function(delta){
	this.AnimTime += delta;
	this.Tick = this.AnimTime | 0;
	this.Bounce += delta * 30;
	this.Delta = delta;
};

Game.LevelRender.prototype.Draw = function(context, camera){
	this.DrawStatic(context, camera);
	this.DrawDynamic(context, camera);
};

Game.LevelRender.prototype.DrawStatic = function(context, camera){
	var x = 0, y = 0, b = 0, frame = null, xTileStart = (camera.X / 16) | 0,
		xTileEnd = ((camera.X + this.Width)/ 16) | 0;

	for(x = xTileStart; x < xTileEnd + 1; x++){
		for(y = 0; y < this.TilesY; y++){
			b = this.Level.GetBlock(x, y);
			if ((Game.Tile.Behaviors[b & 0xff] & Game.Tile.Animated) === 0){
				frame = this.Background[b % 16][(b / 16) | 0];
				//change y to camera.Y
				context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, ((x << 4) - camera.X) | 0, ((y << 4) - camera.Y) | 0, frame.Width, frame.Height);
			}
		}
	}
};

Game.LevelRender.prototype.DrawDynamic = function(context, camera){
	var x = 0, y = 0, b = 0, animTime = 0, yo = 0, frame = null;
	for (x = (camera.X / 16) | 0; x <= ((camera.X + this.Width) / 16) | 0; x++){
		for (y = (camera.Y / 16) | 0; y <= ((camera.Y + this.Height) / 16) | 0; y++){
			b = this.Level.GetBlock(x, y);
			//console.log(b & 0xff);
			if ((Game.Tile.Behaviors[b & 0xff] & Game.Tile.Animated) > 0){
				animTime = ((this.Bounce / 3) | 0) % 4;
				//deal with gold block
				if ((((b % 16) / 4) | 0) === 0 && ((b / 16) | 0) === 1) {
                    animTime = ((this.Bounce / 2 + (x + y) / 8) | 0) % 20;
                    if (animTime > 3) {
                        animTime = 0;
                    }
                }
                if ((((b % 16) / 4) | 0) === 3 && ((b / 16) | 0) === 0) {
                    animTime = 2;
                }
                //???
                yo = 0;
                if (x >= 0 && y >= 0 && x < this.Level.Width && y < this.Level.Height) {
                    yo = this.Level.GettBlockData(x, y);
                }
                if (yo > 0) {
                    yo = (Math.sin((yo - this.Delta) / 4 * Math.PI) * 8) | 0;
                }

                frame = this.Background[(((b % 16) / 4) | 0) * 4 + animTime][(b / 16) | 0];
				context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, (x << 4) - camera.X, (y << 4) - camera.Y - yo, frame.Width, frame.Height);
			}
		}
	}
};