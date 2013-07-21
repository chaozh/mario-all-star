/**
	Represents a little sparkle object.
	Code by Chao, 2013
*/
Game.Sparkle = function(world, x, y, xv, yv){
	this.World = world;
	this.X = x;
	this.Y = y;
	this.Xv =xv;
	this.Yv = yv;
	this.FrameWidth = this.FrameHeight = 8;
	this.FrameX = ((Math.random() * 2) | 0) * this.FrameWidth; //random 0~2 for start
	this.FrameXStart = this.FrameX;
	this.FrameY = 0;
	//this.FrameXStart = this.FrameYStart = 4;

	this.Life = 10 + (Math.random() * 5) | 0;// random 0~5 for blank time
	this.Image = Enjine.Resources.Images["particles"];
};

Game.Sparkle.prototype = new Enjine.CharacterSprite();

Game.Sparkle.prototype.Move = function() {
	if (this.Life > 10){
		this.FrameX = 7 * this.FrameWidth;//to be blank
	}else{
		//run as frame
		this.FrameX = (((this.FrameXStart/this.FrameWidth) + (10 - this.Life) * 0.4) | 0) * this.FrameWidth;
	}

	if (this.Life-- < 0)
		this.World.RemoveSprite(this);

	this.X += this.Xv;
	this.Y += this.Yv;
};

Game.Particle = function(world, x, y, xv, yv){
	this.World = world;
	this.X = x;
	this.Y = y;
	this.Xv = xv;
	this.Yv = yv;

	this.FrameWidth = this.FrameHeight = 8;
	this.FrameX = ((Math.random() * 2) | 0) * this.FrameWidth; //random 0~2
	this.FrameY = 0;

	this.Life = 10;
	this.Image = Enjine.Resources.Images["particles"];
};

Game.Particle.prototype = new Enjine.CharacterSprite();

Game.Particle.prototype.Move = function() {
	if (this.Life - this.Delta < 0) {
		this.World.RemoveSprite(this);
	}
	this.Life -= this.Delta;

	this.X += this.Xv;
	this.Y += this.Yv;
	this.Yv *= 0.95;
	this.Yv += 3;
};