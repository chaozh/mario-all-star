/**
	Represents a life-giving gift.
	Code by chao, 2013
*/
Game.GiftType = {
    RedMushroom: 0,
    Flower: 1,
    GreenMushroom: 2
};

Game.Gift = function(world, x, y, type) {
	this.World = world;
	this.X = x;
	this.Y = y;
	this.Image = Enjine.Resources.Images["items"];
	this.Type = type;

	this.Width = 4;
	this.Height = 24;
	this.FrameXOld = 8;
	this.FrameYOld = 16;
	this.FrameWidth = this.FrameHeight = 16;
	this.FrameX = this.Type * this.FrameWidth;

	this.RunTime = 0;
	this.Facing = 1;
	this.Life = 0;
};

Game.Gift.prototype = new Enjine.MovingCharacterSprite();

Game.Gift.prototype.Move = function(){
	if (this.Life < 9){
		this.ZOrder = 0;
		this.Y--;
		this.Life++;
		return;
	}

	if (this.Type !== Game.GiftType.Flower){
		var sideWaySpeed = 1.5;
		this.ZOrder = 1;

		if(this.Xv > 2) this.Facing = 1;
		if(this.Xv < -2) this.Facing = -1;
		this.Xv = this.Facing * sideWaySpeed;

		this.XFlip = this.Facing === -1;
		this.RunTime += Math.abs(this.Xv) + 5;// for cacu frame

		if (!this.SubMove(this.Xv,0)) {
			this.Facing = -this.Facing;
		}
		this.OnGround = false;
		this.SubMove(0, this.Yv);

		this.Yv *= 0.85;
		if (this.OnGround) {
			this.Xv *= this.GroundInertia;
		} else {
			this.Xv *= this.AirInertia;
		}

		if (!this.OnGround) {
			this.Yv += 2; //speed to fall
		}
	}
};
//only check main charater
Game.Gift.prototype.CollideCheck = function(){
	var character = this.World.Character;
	var xMarioD = character.X - this.X, yMarioD = character.Y - this.Y;
    if (xMarioD > -16 && xMarioD < 16) {
        if (yMarioD > -this.Height && yMarioD < character.Height) {
            character.GetGift(this.Type);
            this.World.RemoveSprite(this);
        }
    }
};

Game.Gift.prototype.BumpCheck = function(xTile, yTile){
	if (xTile === (((this.X + this.Width) /16) | 0) && yTile === (((this.Y - 1) / 16) | 0)) {
        this.Yv = -10;
    }
};

