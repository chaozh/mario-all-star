/**
	State for actually playing a level.
	Code by Chao, 2013
*/

Game.GameState = function(difficulty, type){
	this.LevelDifficulty = difficulty;
    this.LevelType = type;
    this.Level = null;
    this.Layer = null;
    this.BgLayer = [];
    this.Character = null;

    this.Sprites = null;
    this.SpritesToAdd = [];
    this.SpritesToRemove = [];
    this.Camera = null;

    this.MovingSpritesToCheck = [];
    this.ShellsToCheck = [];
    this.FireballsToCheck = [];

    this.FontShadow = null;
    this.Font = null;

    this.Paused = false;
    this.TimeLeft = 0;
    this.StartTime = 0;
    this.FireballsOnScreen = 0;
    this.Tick = 0;

    this.Delta = 0;

	this.GotoMapState = false;
	this.GotoLoseState = false;
};

Game.GameState.prototype = new Enjine.GameState();

Game.GameState.prototype.Enter = function(){

    var levelGenerator = new Game.LevelLoading();
    this.Level = levelGenerator.CreateLevel(0, 1);//type, difficulty
    this.Layer = new Game.LevelRender(this.Level, 320, 240);

    this.Sprites = new Enjine.DrawableManager();
    this.Camera = new Enjine.Camera();

    for(i = 0; i < 2; i++){
        scrollSpeed = 4 >> i;
        w = ((((320 * 16) - 320) / scrollSpeed) | 0) + 320;
        h = ((((240 * 16) - 240) / scrollSpeed) | 0) + 240;

        bgLevelGenerator = new Game.BackgoundGenerator(w / 32 + 1, h / 32 + 1, i === 0, levelGenerator.Type);
        this.BgLayer[i] = new Game.BackgroundRender(bgLevelGenerator.CreateLevel(), 320, 240, scrollSpeed);
    }

    this.Character = new Game.Character(this);
    this.Character.SetLarge(false, false);

    this.Sprites.Add(this.Character);
};

Game.GameState.prototype.AddSprite = function(sp){
    this.Sprites.Add(sp);
    if(sp instanceof Enjine.MovingCharacterSprite)
        this.MovingSpritesToCheck.push(sp);
};

Game.GameState.prototype.RemoveSprite = function(sp){
    this.Sprites.Remove(sp);
    if(sp instanceof Enjine.MovingCharacterSprite)
        this.MovingSpritesToCheck.pop(sp);
};

Game.GameState.prototype.Exit = function(){
    this.Sprites.Clear();
    delete this.Sprites;
    delete this.Camera;
    delete this.Character;

    delete this.Level;
    delete this.Layer;

    delete this.MovingSpritesToCheck;
    delete this.ShellsToCheck;
    delete this.FireballsToCheck;
};

Game.GameState.prototype.Update = function(delta){
    this.Camera.X = this.Character.X - 160;
    if (this.Camera.X < 0) {
        this.Camera.X = 0;
    }
    if (this.Camera.X > this.Level.Width * 16 - 320) {
        this.Camera.X = this.Level.Width * 16 - 320;
    }

    this.Layer.Update(delta);
    this.Level.Update();

    this.Camera.X = (this.Character.XOld + (this.Character.X - this.Character.XOld) * delta) - 160;
    this.Camera.Y = (this.Character.YOld + (this.Character.Y - this.Character.YOld) * delta) - 120;

    for (i = 0; i < this.Sprites.Objects.length; ++i) {
            this.Sprites.Objects[i].Update(delta);
    }

    for (i = 0; i < this.MovingSpritesToCheck.length; ++i){
        this.MovingSpritesToCheck[i].CollideCheck();//optmize
    }

};

Game.GameState.prototype.BumpInto = function(x, y) {
    for (i = 0; i < this.MovingSpritesToCheck.length; ++i){
        this.MovingSpritesToCheck[i].BumpCheck(x, y);
    }
};

Game.GameState.prototype.Draw = function(context){
    if (this.Camera.X < 0) {
        this.Camera.X = 0;
    }
    if (this.Camera.Y < 0) {
        this.Camera.Y = 0;
    }
    if (this.Camera.X > this.Level.Width * 16 - 320) {
        this.Camera.X = this.Level.Width * 16 - 320;
    }
    if (this.Camera.Y > this.Level.Height * 16 - 240) {
        this.Camera.Y = this.Level.Height * 16 - 240;
    }

    for (i = 0; i < 2; i++) {
        this.BgLayer[i].Draw(context, this.Camera);
    }

    context.save();
    context.translate(-this.Camera.X, -this.Camera.Y);
    this.Sprites.Draw(context, this.Camera,0);
    context.restore();

    this.Layer.Draw(context, this.Camera);

    context.save();
    context.translate(-this.Camera.X, -this.Camera.Y);
    this.Sprites.Draw(context, this.Camera,1);
    context.restore();
};

Game.GameState.prototype.CheckForChange = function(context){
    if(this.wasKeyDown && !Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.F))
        return;//context.ChangeState(new Game.LoadingState());
};