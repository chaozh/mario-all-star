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

Game.EnemyTemplate = function(type, winged){
    this.Type = type;
    this.Winged = winged;
    this.LastVisibleTick = -1;
    this.IsDead = false;
    this.Sprite = null;
    this.Facing = -1;
};

Game.EnemyTemplate.prototype.Spawn = function(world, x, y, dir){
    if (this.IsDead){ //stop creating again
        return;
    }

    if (this.Type === Game.EnemyType.Flower) {
        this.Sprite = new Game.FlowerEnemy(world, x * 16 + 15, y * 16 + 24);
    } else {
        this.Sprite = new Game.Enemy(world, x * 16 + 8, y * 16 + 15, dir, this.Type, this.Winged);
    }
    this.Sprite.SpriteTemplate = this;
    world.AddSprite(this.Sprite);
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
    this.sideWaySpeed = 1.75;

    this.DeadTime = 0;
    this.FlyDeath = false;
    this.WingTime = 0;
    this.AvoidCliffs = this.Type === Game.EnemyType.RedKoopa;
    this.NoFireballDeath = this.Type === Game.EnemyType.Spiky;
};

Game.Enemy.prototype = new Enjine.MovingCharacterSprite();

Game.Enemy.prototype.CollideCheck = function(){
    if (this.DeadTime !== 0) return;

    var xCharacterD = this.World.Character.X - this.X, yCharacterD = this.World.Character.Y - this.Y;
    if (xCharacterD > -this.Width * 2 - 4 && xCharacterD < this.Width * 2 + 4){
        if (yCharacterD > -this.Height && yCharacterD < this.World.Character.Height){
            if (this.Type !== Game.EnemyType.Spiky && this.World.Character.Yv > 0 && yCharacterD <= 0 &&
                (!this.World.Character.OnGround || !this.World.Character.WasOnGround)){
                this.World.Character.Stomp(this);
                if (this.Winged){
                    this.Winged = false;
                    this.Yv = 0;
                } else {
                    this.FrameYOld -= 31 - (32 - 10);
                    this.FrameHeight -= 10; //become small
                    if (this.SpriteTemplate !== null) {
                        this.SpriteTemplate.IsDead = true;
                    }

                    this.DeadTime = 10;
                    this.Winged = false;

                    if (this.Type < Game.EnemyType.Goomba) {
                        this.World.AddSprite(new Game.Shell(this.World, this.X, this.Y, this.Type));
                    }
                }
            } else {
                this.World.Character.GetHurt(); //spiky
            }
        }
    }
};

Game.Enemy.prototype.CalcPic = function(){
   var runFrame = 0;
    this.RunTime += Math.abs(this.Xv) + 5;
    runFrame = ((this.RunTime / 20) | 0) % 2;
    if (!this.OnGround){
        runFrame = 1;
    }

    if (this.Winged) {
        runFrame = ((this.WingTime / 4) | 0) % 2;
    }

    this.FrameX = runFrame * this.FrameWidth;
};

Game.Enemy.prototype.Move = function(){
    var i=0;

    this.WingTime++;
    if (this.DeadTime > 0){ //die animation
        this.DeadTime--;

        if (this.DeadTime === 0){
            for (i = 0; i < 8; i++) {
                this.World.AddSprite(new Game.Sparkle(this.World, ((this.X + Math.random() * 16 - 8) | 0) + 4, ((this.Y - Math.random() * 8) | 0) + 4, Math.random() * 2 - 1, Math.random() * -1, 0, 1, 5));
            }
            this.World.RemoveSprite(this);
        }

        if (this.FlyDeath) {
            this.X += this.Xv;
            this.Y += this.Yv;
            this.Yv *= 0.95; //???
            this.Yv += 1;
        }
        return;
    }
    //judge facing reuse
    if (this.Xv > 2){
        this.Facing = 1;
    }
    if (this.Xv < -2){
        this.Facing = -1;
    }

    this.Xv = this.Facing * this.sideWaySpeed;
    this.MayJump = this.OnGround;
    this.XFlip = this.Facing === -1;
    //cacu frame
    this.CalcPic();

    if (!this.SubMove(this.Xv, 0)) {
        this.Facing = -this.Facing;
    }
    this.OnGround = false;
    this.SubMove(0, this.Yv);

    if (this.Y > this.World.Level.Height * 16 + 16 || this.X < 0) {
        this.World.RemoveSprite(this);
    }

    this.Yv *= this.Winged ? 0.95 : 0.85; //y 
    if (this.OnGround) {
        this.Xv *= this.GroundInertia;
    } else {
        this.Xv *= this.AirInertia;
    }

    if (!this.OnGround) {
        if (this.Winged) {
            this.Yv += 0.6;
        } else {
            this.Yv += 2;
        }
    } else if (this.Winged) {
        this.Yv = -10;
    }
};

Game.Enemy.prototype.HitCheck = function(bullet){ //for fireball and shell
	if (this.DeadTime !== 0) {
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
            this.DeadTime = 100;
            this.Winged = false;
            this.YFlip = true;
            return true;
        }
    }
    return false;
};

Game.Enemy.prototype.BumpCheck = function(xTile, yTile){
	if (this.DeadTime !== 0) {
        return;
    }

    if (xTile === (((this.X + this.Width) /16) | 0) && yTile === (((this.Y - 1) / 16) | 0)) {
        Enjine.Resources.PlaySound("kick");

        this.Xv = -this.World.Character.Facing * 2;
        this.Yv = -5;
        this.FlyDeath = true;
        if (this.SpriteTemplate !== null) {
            this.SpriteTemplate.IsDead = true;
        }
        this.DeadTime = 100;
        this.Winged = false;
        this.YFlip = true;
    }
};

Game.Shell = function(world, x, y, type){
    this.World = world;
    this.X = x;
    this.Y = y;
    this.Type = type;

    this.Image = Enjine.Resources.Images["enemies"];
    this.FrameXOld = 8;
    this.FrameYOld = 32;

    this.FrameWidth = 16;
    this.FrameHeight = 32;
    this.FrameX = 4 * this.FrameWidth;
    this.FrameY = this.Type * this.FrameHeight;

    this.Width = 4;
    this.Height = 12;

    this.DeadTime = 0;
    this.RunTime = 0;
    this.Facing = 0;
    this.Yv = -5;
    this.sideWaySpeed = 11;
    this.Carried = false;
};

Game.Shell.prototype = new Enjine.MovingCharacterSprite();

Game.Shell.prototype.CollideCheck = function() {
    if (this.Carried || this.DeadTime > 0) {
        return;
    }
    
    var xMarioD = this.World.Character.X - this.X, yMarioD = this.World.Character.Y - this.Y;
    if (xMarioD > -16 && xMarioD < 16) {
        if (yMarioD > -this.Height && yMarioD < this.World.Character.Height) {
            if (this.World.Character.Yv > 0 && yMarioD <= 0 && (!this.World.Character.OnGround || !this.World.Character.WasOnGround)) {
                this.World.Character.Stomp(this);
                if (this.Facing !== 0) {
                    this.Xv = 0;
                    this.Facing = 0;
                } else {
                    this.Facing =this.World.Character.Facing;
                }
            } else {
                if (this.Facing !== 0) {
                   this.World.Character.GetHurt();
                } else {
                   this.World.Character.Kick(this);
                   this.Facing = this.World.Character.Facing;
                }
            }
        }
    }
};

Game.Shell.prototype.BumpCheck = function(xTile, yTile){
    if (xTile === (((this.X + this.Width) /16) | 0) && yTile === (((this.Y - 1) / 16) | 0)) {
        this.Facing = -this.World.Character.Facing;
        this.Yv = -10;
    }
};

Game.Shell.prototype.HitCheck = function(bullet){ //for fireball and shell
    if (this.DeadTime !== 0) {
        return false;
    }

    var xd = bullet.X - this.X, yd = bullet.Y - this.Y;
    if (xd > -16 && xd < 16) {
        if (yd > -this.Height && yd < bullet.Height) {
            if (this.Facing !== 0) {
                return true;
            }
            Enjine.Resources.PlaySound("kick");

            this.Xv = bullet.Facing * 2;
            this.Yv = -5;
            if (this.SpriteTemplate !== null) {
                this.SpriteTemplate.IsDead = true;
            }
            this.DeadTime = 100;
            this.YFlip = true;
            return true;
        }
    }
    return false;
};

Game.Shell.prototype.CalcPic = function(){
    var runFrame = 0;
    this.RunTime += Math.abs(this.Xv) + 5;
    runFrame = ((this.RunTime / 20) | 0) % 4 + 3;
    this.FrameX = runFrame * this.FrameWidth;
};

Game.Shell.prototype.Move = function(){
    var i=0;

    if (this.Carried) {
        //this.World.CheckShellCollide(this);
        return;
    }

    if (this.DeadTime > 0){ //die animation
        this.DeadTime--;

        if (this.DeadTime === 0){
            for (i = 0; i < 8; i++) {
                this.World.AddSprite(new Game.Sparkle(this.World, ((this.X + Math.random() * 16 - 8) | 0) + 4, ((this.Y - Math.random() * 8) | 0) + 4, Math.random() * 2 - 1, Math.random() * -1, 0, 1, 5));
            }
            this.World.RemoveSprite(this);
        }

        this.X += this.Xv;
        this.Y += this.Yv;
        this.Yv *= 0.95; //???
        this.Yv += 1;

        return;
    }
    //judge facing reuse
    if (this.Xv > 2){
        this.Facing = 1;
    }
    if (this.Xv < -2){
        this.Facing = -1;
    }

    this.Xv = this.Facing * this.sideWaySpeed;
    this.XFlip = this.Facing === -1;
    //cacu frame
    this.CalcPic();

    if (!this.SubMove(this.Xv, 0)) {
        Enjine.Resources.PlaySound("bump"); //play sound
        this.Facing = -this.Facing;
    }

    this.OnGround = false;
    this.SubMove(0, this.Yv);

    this.Yv *= 0.85; //y 
    if (this.OnGround) {
        this.Xv *= this.GroundInertia;
    } else {
        this.Xv *= this.AirInertia;
    }

    if (!this.OnGround) {
        this.Yv += 2;
    }
};

Game.Shell.prototype.Die = function() {
    this.Carried = false;
    this.Xv = -this.Facing * 2;
    this.Yv = -5;
    this.DeadTime = 100;
};

