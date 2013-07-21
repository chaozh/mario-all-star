/**
	A generic template for an enemy in the game.
	Code by chao, 2013
*/
Game.EnemyType = {
	RedKoopa: 0,
	GreenKoopa: 1,
	Goomba: 2,
	Spiky: 3,
	Flower: 4
};

Game.Enemy = function(world, x, y, facing, type, winged){
	this.World = world;
	this.X = x;
	this.Y = y;
	this.Facing = facing;
	this.Type = type;
	this.Winged = winged;

	this.Image = Enjine.Resources.Images["enemies"];
	this.FrameXOld = 8;
	this.FrameYOld = 32;

	this.FrameWidth = 16;
	this.FrameHeight = 32;
	this.FrameY = this.Type * this.FrameHeight;

	this.Width = 4;
    this.Height = 24;
	if (this.FrameY > 1 * this.FrameHeight){
		this.Height = 12;
	}

	this.MayJump = false;
	this.RunTime = 0;
	this.XJumpSpeed = 0;
    this.YJumpSpeed = 0;

	this.Dead = false;
    this.FlyDeath = false;
    this.WingTime = 0;
    this.NoFireballDeath = this.Type === Mario.Enemy.Spiky;
};

Game.Enemy.prototype = new Enjine.MovingCharacterSprite();

Game.Enemy.prototype.CollideCheck = function(){

};

Game.Enemy.prototype.Move = function(){

};

Game.Enemy.prototype.HitCheck = function(bullet){ //for fireball and shell
	if (this.Dead) {
        return false;
    }

    var xd = bullet.X - this.X, yd = bullet.Y - this.Y;
    if (xd > -16 && xd < 16) {
        if (yd > -this.Height && yd < bullet.Height) {
			if (this.NoFireballDeath && bullet) {
                return true;
            }
            Enjine.Resources.PlaySound("kick");

            this.Xv = bullet.Facing * 2;
            this.Yv = -5;
            this.FlyDeath = true;
            if (this.SpriteTemplate !== null) {
                this.SpriteTemplate.IsDead = true;
            }
            this.Dead = true;
            this.Winged = false;
            this.YFlip = true;
            return true;
        }
    }
    return false;
};

Game.Enemy.prototype.BumpCheck = function(xTile, yTile){
	if (this.Dead) {
        return;
    }

    if (xTile === (((this.X + this.Width) /16) | 0) && yTile === (((this.Y - 1) / 16) | 0)) {
        Enjine.Resources.PlaySound("kick");

        this.Xv = -Game.Character.Facing * 2;
        this.Yv = -5;
        this.FlyDeath = true;
        if (this.SpriteTemplate !== null) {
            this.SpriteTemplate.IsDead = true;
        }
        this.Dead = true;
        this.Winged = false;
        this.YFlip = true;
    }
};



