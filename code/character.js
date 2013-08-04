/**
	Global representation of the mario character.
	Code by Chao, 2013
*/

Game.Character = function(world) {
    //state
	this.Large = false;
	this.Fire = false;
    //for blink animation
	this.LastLarge = false;
    this.LastFire = false;
    this.NewLarge = false;
    this.NewFire = false;
	//game statics
	this.Coins = 0;
	this.Lives = 3;
    //character state
    this.X = 30;
    this.Y = 10;
    this.Width = 4;
    this.Height = 14;
	this.RunTime = 0;
    this.WasOnGround = false;
    //this.OnGround = false;
    this.MayJump = false;
    this.Ducking = false;
    //this.Sliding = false;
    this.XJumpSpeed = 0;
    this.YJumpSpeed = -1.1;
    this.JumpTime = 0;
    this.CanShoot = false;
    this.Facing = 0; //1 for pos -1 for nag
    this.PowerUpTime = 0;
    this.sideWaysSpeed = 0.8;

    //Level scene
    this.World = world;

    this.XDeathPos = 0; this.YDeathPos = 0;
    this.DeathTime = 0;
    this.WinTime = 0;
    this.InvulnerableTime = 0;

    //Sprite
    this.Carried = null;
};
Game.Character.prototype = new Enjine.MovingCharacterSprite();

Game.Character.prototype.SetLarge = function(large, fire){
	if(fire) large = true;
	if(!large) fire = false;

	this.LastLarge = this.Large;
	this.LastFire = this.Fire;
	this.Fire = fire;
	this.Large = large;
    this.NewLarge = this.Large;
    this.NewFire = this.Fire;

	this.Blink(true);
};

Game.Character.prototype.Blink = function(on){
	//state change
	this.Large = on ? this.NewLarge : this.LastLarge;
	this.Fire = on ? this.NewFire : this.LastFire;

	if(this.Large){
		if(this.Fire){
			this.Image = Enjine.Resources.Images["fireMario"];
		}else{
			this.Image = Enjine.Resources.Images["mario"];
		}
		this.FrameXOld = 16;
		this.FrameYOld = 32;
		this.FrameWidth = this.FrameHeight = 32;
	}else{
		this.Image = Enjine.Resources.Images["smallMario"];
		this.FrameXOld = 8;
		this.FrameYOld = 16;
		this.FrameWidth = this.FrameHeight = 16;
	}
};

//actions
Game.Character.prototype.Get1Up = function(){
	Enjine.Resources.PlaySound("1up");
	this.Lives++;
	if(this.Lives >= 99) this.Lives = 99;
};

Game.Character.prototype.GetCoin = function(){
	this.Coins++;
	if(this.Coins >= 100) {
		this.Coins = 0;
		this.Get1Up();
	}
	Enjine.Resources.PlaySound("coin");
};

Game.Character.prototype.GetGift = function(type){
    switch(type){
        case Game.GiftType.RedMushroom:
            this.GetMushroom();
            break;
        case Game.GiftType.GreenMushroom:
            this.Get1Up();
            break;
        case Game.GiftType.Flower:
            this.GetFlower();
            break;
        default:
            this.GetCoin();
    }
};

Game.Character.prototype.GetMushroom = function(){
	if (this.DeathTime > 0 && this.World.Paused){
		return;
	}

	if(!this.Large){
		this.World.Paused = true;
		this.PowerUpTime = 18;
		Enjine.Resources.PlaySound("powerup");
		this.SetLarge(true, false);
        //console.log("large");
	}else{
		this.GetCoin();
	}
};

Game.Character.prototype.GetFlower = function(){
	if (this.DeathTime > 0 && this.World.Paused){
		return;
	}

	if(!this.Fire){
		this.World.Paused = true;
		this.PowerUpTime = 18;
		Enjine.Resources.PlaySound("powerup");
		this.SetLarge(true, true);
	}else{
		this.GetCoin();
	}
};

Game.Character.prototype.Win = function() {
    this.XDeathPos = this.X | 0;
    this.YDeathPos = this.Y | 0;
    this.World.Paused = true;
    this.WinTime = 1;
    Enjine.Resources.PlaySound("exit");
    //console.log("win");
};

Game.Character.prototype.Die = function() {
    this.XDeathPos = this.X | 0;
    this.YDeathPos = this.Y | 0;
    this.World.Paused = true;
    this.DeathTime = 1;
    Enjine.Resources.PlaySound("death");
    this.SetLarge(false, false);
    //console.log("die");
};

Game.Character.prototype.GetHurt = function() {
    if (this.DeathTime > 0 || this.World.Paused) {
        return;
    }
    if (this.InvulnerableTime > 0) {
        return;
    }

    if (this.Large) {
        this.World.Paused = true;
        this.PowerUpTime = -18;
        Enjine.Resources.PlaySound("powerdown");
        if (this.Fire) {
            this.SetLarge(true, false);
        } else {
            this.SetLarge(false, false);
        }
        this.InvulnerableTime = 32;
    } else {
        this.Die();
    }
};

Game.Character.prototype.Kick = function(shell) {
    if (this.DeathTime > 0 && this.World.Paused) {
        return;
    }

   if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.A)) {
        this.Carried = shell;
        shell.Carried = true;
    } else {
        Enjine.Resources.PlaySound("kick");
        this.InvulnerableTime = 1;
    }
};

Game.Character.prototype.Bump = function(x, y, isLarge){
    var block = this.World.Level.GetBlock(x, y), xx = 0, yy = 0;
    //check if a bumpable brick like question brick or some common brick
    if ((Game.Tile.Behaviors[block & 0xff] & Game.Tile.Bumpable) > 0) {
        var data = this.World.Level.GetSpriteTemplate(x, y);
        this.World.Level.SetBlockData(x, y, 4);//animation
        if (data && data.name === "block"){
            switch (data.special){
                case Game.Specail.Upgrade :
                    this.World.Level.SetBlock(x, y, 4);
                    Enjine.Resources.PlaySound("sprout");
                    if (!this.Large) {
                        this.World.AddSprite(new Game.Gift(this.World, x * 16 + 8, y * 16 + 8, Game.GiftType.RedMushroom));
                    } else {
                        this.World.AddSprite(new Game.Gift(this.World, x * 16 + 8, y * 16 + 8, Game.GiftType.Flower));
                    }
                    break;
                case Game.Specail.Lives :
                    this.World.Level.SetBlock(x, y, 4);
                    Enjine.Resources.PlaySound("sprout");
                    this.World.AddSprite(new Game.Gift(this.World, x * 16 + 8, y * 16 + 8, Game.GiftType.GreenMushroom));
                    break;
                case Game.Specail.Coins :
                    this.GetCoin();
                    Enjine.Resources.PlaySound("coin");
                    this.World.AddSprite(new Game.CoinAnim(this.World, x, y));
                    if (--data.coin <= 0)
                        this.World.Level.SetBlock(x, y, 4);
                    break;
            }

        } else {
            this.World.Level.SetBlock(x, y, 4);
            this.GetCoin();
            Enjine.Resources.PlaySound("coin");
            this.World.AddSprite(new Game.CoinAnim(this.World, x, y));
        }
         this.World.BumpInto(x, y - 1);
    }
    //check if a breakable brick
    if ((Game.Tile.Behaviors[block & 0xff] & Game.Tile.Breakable) > 0) {
        if (isLarge) {
            Enjine.Resources.PlaySound("breakblock");
            this.World.Level.SetBlock(x, y, 0);
            for (xx = 0; xx < 2; xx++) {
                for (yy = 0; yy < 2; yy++) {
                    this.World.AddSprite(new Game.Particle(this.World, x * 16 + xx * 8 + ((Math.random() * 8) | 0), y * 16 + yy * 8 + ((Math.random() * 8) | 0), (xx * 2 - 1) * 4, (yy * 2 - 1) * 4 - 8));
                }
            }
        }else{
             this.World.Level.SetBlockData(x, y, 4);//bump animation
        }
        this.World.BumpInto(x, y - 1);
    }
};

Game.Character.prototype.IsBlocking = function(x, y, xv, yv) {
    var blocking = false, block = 0, xx = 0, yy = 0;

    x = (x / 16) | 0;
    y = (y / 16) | 0;
    /*if (x === ((this.X / 16) | 0) && y === ((this.Y / 16) | 0)) {
        return false;
    }*/

    block = this.World.Level.GetBlock(x, y);
    //Coin on the road
    if (((Game.Tile.Behaviors[block & 0xff]) & Game.Tile.PickUpable) > 0) {
        this.GetCoin();
        this.World.Level.SetBlock(x, y, 0);
        for (xx = 0; xx < 2; xx++) {
            for (yy = 0; yy < 2; yy++) {
                this.World.AddSprite(new Game.Sparkle(this.World, x * 16 + xx * 8 + ((Math.random() * 8) | 0), y * 16 + yy * 8 + ((Math.random() * 8) | 0), 0, 0));
            }
        }
    }

    blocking = this.World.Level.IsBlocking(x, y, xv, yv);
    if (blocking && yv < 0) {
        this.Bump(x, y, this.Large);
    }

    return blocking;
};

Game.Character.prototype.Stomp = function(object) {
    var targetY = 0;

    if (this.DeathTime > 0 || this.World.Paused) {
        return;
    }

    targetY = object.Y - object.Height / 2;
    this.SubMove(0, targetY - this.Y);

    if (object instanceof Game.Enemy /*|| object instanceof Game.BulletBill*/) {
        Enjine.Resources.PlaySound("kick");
        this.XJumpSpeed = 0;
        //this.YJumpSpeed = -1.9;
        this.JumpTime = 14; //8
        this.Yv = this.JumpTime * this.YJumpSpeed;
        this.OnGround = false;
        this.Sliding = false;
        this.InvulnerableTime = 1;
    } else if (object instanceof Game.Shell) {
        if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.A) && object.Facing === 0) {
            this.Carried = object;
            object.Carried = true;
        } else {
            Enjine.Resources.PlaySound("kick");
            this.XJumpSpeed = 0;
            //this.YJumpSpeed = -1.9;
            this.JumpTime = 11;
            this.Yv = this.JumpTime * this.YJumpSpeed;
            this.OnGround = false;
            this.Sliding = false;
            this.InvulnerableTime = 1;
        }
    }
};

Game.Character.prototype.CalcPic = function() {
    var runFrame = 0, i = 0;

    if (this.Large) {
        runFrame = ((this.RunTime / 20) | 0) % 4;
        if (runFrame === 3) {
            runFrame = 1;
        }
        if (this.Carried === null && Math.abs(this.Xv) > 10) {
            runFrame += 3;
        }
        if (this.Carried !== null) {
            runFrame += 10;
        }
        if (!this.OnGround) {
            if (this.Carried !== null) {
                runFrame = 12;
            } else if (Math.abs(this.Xv) > 10) {
                runFrame = 7;
            } else {
                runFrame = 6;
            }
        }
    } else {
        runFrame = ((this.RunTime / 20) | 0) % 2;
        if (this.Carried === null && Math.abs(this.Xv) > 10) {
            runFrame += 2;
        }
        if (this.Carried !== null) {
            runFrame += 8;
        }
        if (!this.OnGround) {
            if (this.Carried !== null) {
                runFrame = 9;
            } else if (Math.abs(this.Xv) > 10) {
                runFrame = 5;
            } else {
                runFrame = 4;
            }
        }
    }

    if (this.OnGround && ((this.Facing === -1 && this.Xv > 0) || (this.Facing === 1 && this.Xv < 0))) {
        if (this.Xv > 1 || this.Xv < -1) {
            runFrame = this.Large ? 9 : 7;
        }

        if (this.Xv > 3 || this.Xv < -3) {
            for (i = 0; i < 3; i++) {
                this.World.AddSprite(new Game.Sparkle(this.World, (this.X + Math.random() * 8 - 4) | 0, (this.Y + Math.random() * 4) | 0, Math.random() * 2 - 1, Math.random() * -1));
            }
        }
    }

    if (this.Large) {
        if (this.Ducking) {
            runFrame = 14;
        }
         this.Height = this.Ducking ? 14 : 24;
    }else {
        this.Height = 14;
    }

    this.FrameX = runFrame * this.FrameWidth;
};

Game.Character.prototype.Jump = function() {
     if (this.JumpTime < 0) {
        this.Xv = this.XJumpSpeed;
        this.Yv = -this.JumpTime * this.YJumpSpeed;
        this.JumpTime++;
    } else if (this.OnGround && this.MayJump) {
        Enjine.Resources.PlaySound("jump");
        this.XJumpSpeed = 0;
        //this.YJumpSpeed = -1.9;
        this.JumpTime = 10;
        this.Yv = this.JumpTime * this.YJumpSpeed;
        this.OnGround = false;
        this.Sliding = false;
    } else if (this.Sliding && this.MayJump) {
        Enjine.Resources.PlaySound("jump");
        this.XJumpSpeed = -this.Facing * 6;
        //this.YJumpSpeed = -2;
        this.JumpTime = 9;
        this.Xv = this.XJumpSpeed;
        this.Yv = this.JumpTime * this.YJumpSpeed;
        this.OnGround = false;
        this.Sliding = false;
        this.Facing = -this.Facing;
    } else if (this.JumpTime > 0) {
        this.Xv += this.XJumpSpeed;
        this.Yv = this.JumpTime * this.YJumpSpeed;
        this.JumpTime--;
    }
};

Game.Character.prototype.Shoot = function(){
    Enjine.Resources.PlaySound("fireball");
    this.World.AddSprite(new Game.Fireball(this.World, this.X + this.Facing * 6, this.Y - 20, this.Facing));
};

Game.Character.prototype.Move = function() {
    if (this.WinTime > 0) {
        this.WinTime++;
        this.Xv = 0;
        this.Yv = 0;
        return;
    }

    if (this.DeathTime > 0) {
        this.DeathTime++;
        if (this.DeathTime < 11) {
            this.Xv = 0;
            this.Yv = 0;
        } else if (this.DeathTime === 11) {
            this.Yv = -15;
        } else {
            this.Yv += 2;
        }
        this.X += this.Xv;
        this.Y += this.Yv;
        return;
    }

    if (this.PowerUpTime !== 0) {
        if (this.PowerUpTime > 0) {
            this.PowerUpTime--;
            this.Blink((((this.PowerUpTime / 3) | 0) & 1) === 0);
        } else {
            this.PowerUpTime++;
            this.Blink((((-this.PowerUpTime / 3) | 0) & 1) === 0);
        }

        if (this.PowerUpTime === 0) {
            this.World.Paused = false;
        }

        this.CalcPic();
        return;
    }

    if (this.InvulnerableTime > 0) {
        this.InvulnerableTime--;
    }

    this.Visible = (((this.InvulnerableTime / 2) | 0) & 1) === 0;
    this.WasOnGround = this.OnGround;

    var sideWaysSpeed = Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.Z) ? this.sideWaysSpeed : this.sideWaysSpeed / 2; //x accelerate speed
    if (this.OnGround) {
        if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.Down) && this.Large) {
            this.Ducking = true;
        } else {
            this.Ducking = false;
        }
    }

    if (this.Xv > 2) {
        this.Facing = 1;
    }
    if (this.Xv < -2) {
        this.Facing = -1;
    }

    if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.S) || (this.JumpTime < 0 && !this.OnGround && !this.Sliding)) {
        this.Jump();
    } else {
        this.JumpTime = 0;
    }

    if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.Left) && !this.Ducking) {
        if (this.Facing === 1) {
            this.Sliding = false;
        }
        this.Xv -= sideWaysSpeed;
        if (this.JumpTime >= 0) {
            this.Facing = -1;
        }
    }

    if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.Right) && !this.Ducking) {
        if (this.Facing === -1) {
            this.Sliding = false;
        }
        this.Xv += sideWaysSpeed;
        if (this.JumpTime >= 0) {
            this.Facing = 1;
        }
    }

    if ((!Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.Left) && !Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.Right)) || this.Ducking || this.Yv < 0 || this.OnGround) {
        this.Sliding = false;
    }

    if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.A) && this.CanShoot && this.Fire && this.World.FireballsOnScreen < 2) {
        this.Shoot();
    }

    this.CanShoot = !Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.A);
    this.MayJump = (this.OnGround || this.Sliding) && !Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.S);
    this.XFlip = (this.Facing === -1);
    this.RunTime += Math.abs(this.Xv) + 5;

    if (Math.abs(this.Xv) < this.sideWaysSpeed / 2) {
        this.RunTime = 0;
        this.Xv = 0;
    }

    this.CalcPic();

    if (this.Sliding) {
        this.World.AddSprite(new Game.Sparkle(this.World, ((this.X + Math.random() * 4 - 2) | 0) + this.Facing * 8,
            ((this.Y + Math.random() * 4) | 0) - 24, Math.random() * 2 - 1, Math.random()));
        this.Yv *= 0.5;
    }

    this.OnGround = false;
    this.SubMove(this.Xv, 0);
    this.SubMove(0, this.Yv);
    if (this.Y > this.World.Level.Height * 16 + 16) {
        this.Die();
    }

    if (this.X < 0) {
        this.X = 0;
        this.Xv = 0;
    }

    if (this.X > this.World.Level.ExitX * 16) {
        this.Win();
    }

    if (this.X > this.World.Level.Width * 16) {
        this.X = this.World.Level.Width * 16;
        this.Xv = 0;
    }

    this.Yv *= 0.85;
    if (this.OnGround) {
        this.Xv *= this.GroundInertia;
    } else {
        this.Xv *= this.AirInertia;
    }

    if (!this.OnGround) {
        this.Yv += 3;
    }

    if (this.Carried !== null) {
        this.Carried.X *= this.X + this.Facing * 8;
        this.Carried.Y *= this.Y - 2;
        if (!Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.A)) {
            this.Carried.Release(this);
            this.Carried = null;
        }
    }
};
