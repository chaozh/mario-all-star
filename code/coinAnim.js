/**
	Represents a simple little coin animation when popping out of the brick.
	Code by Chao, 2013
*/

Game.CoinAnim = function(world, x, y) {
    this.World = world;
    this.Image = Enjine.Resources.Images["map"];
    this.FrameWidth = this.FrameHeight = 16;

    this.FrameX = 0;
    this.FrameY = 2 * this.FrameHeight;
    this.X = x * this.FrameWidth;
    this.Y = (y - 1) * this.FrameHeight;

    this.Xv = 0;
    this.Yv = -6;
    this.Life = 10;
};

Game.CoinAnim.prototype = new Enjine.CharacterSprite();

Game.CoinAnim.prototype.Move = function() {
    var x = 0, y = 0;
    if (this.Life-- < 0) {
        this.World.RemoveSprite(this);
        for (x = 0; x < 2; x++) {
            for (y = 0; y < 2; y++) {
                this.World.AddSprite(new Game.Sparkle(this.World, (this.X + x * 8 + Math.random() * 8) | 0, (this.Y + y * 8 + Math.random() * 8) | 0, 0, 0, 0, 2, 5));
            }
        }
    }

    this.FrameX = (this.Life & 3) * this.FrameWidth; //4 frames, 10 eqs 3 loops
    this.X += this.Xv;
    this.Y += this.Yv;
    this.Yv += 1;
};