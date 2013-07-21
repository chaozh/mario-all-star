/**
	Represents a fireball.
	Code by chao, 2013
*/
Game.Fireball = function(world, x, y, facing){
	this.World = world;
	this.X = x;
	this.Y = y;
	this.Facing = facing;

	this.Image = Enjine.Resources.Images["particles"];
	this.Width = 4;
	this.Height = 8;

	this.FrameWidth = this.FrameHeight = 8;
	this.FrameX = 3 * this.FrameWidth;
	this.FrameY = 3 * this.FrameHeight;
	this.FrameXOld = 4;
	this.FrameYOld = 4;

	this.Yv = 4;
	this.AnimFrame = 0;
	this.Dead = false;
};

Game.Fireball.prototype = new Enjine.MovingCharacterSprite();

Game.Fireball.prototype.Move = function(){
	var i = 0, sideWaySpeed = 8;

	if (this.Dead){
		for (i = 0; i < 8; ++i){
			this.World.AddSprite(new Game.Sparkle(this.World, ((this.X + Math.random() * 4 - 2) | 0) + this.Facing * 8,
            ((this.Y + Math.random() * 4) | 0) - 24, Math.random() * 2 - 1, Math.random()));
		}
		this.World.RemoveSprite(this);//right here??
		return;
	}

	if (this.Facing !== 0)
		++this.AnimFrame;

	this.Xv = this.Facing * sideWaySpeed;
	this.FlipX = this.Facing === -1;
	this.FrameX = (this.AnimFrame % 4) * this.FrameWidth;

	if (!this.SubMove(this.Xv, 0)){
		this.Die();
	}

	this.OnGround = false;
	this.SubMove(0, this.Yv);
	if(this.OnGround){
		this.Yv = -10;
	}

	this.Yv *= 0.95;
	if (this.OnGround) {
		this.Xv *= this.GroundInertia;
	} else {
		this.Xv *= this.AirInertia;
	}

	if (!this.OnGround) {
		this.Yv += 1.5; //speed to fall
	}
};

Game.Fireball.prototype.Die = function(){
	this.Dead = true;
	this.Xv = -this.Facing * 2;
	this.Yv = -5;
};