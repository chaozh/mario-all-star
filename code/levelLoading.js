/**
	Generates a procedural for a level using data from tiles.
	Code by Chao, 2013
*/

Game.LevelLoading = function() {
	this.Width = 320;
	this.Height = 240;
	this.Data = null;
	this.Difficulty = 0;
	this.Type = 0;
};

Game.LevelLoading.prototype = {
	LoadingData: function(){
		var xhr = new XMLHttpRequest();
		var dataUri = "level" + this.Difficulty + ".json";

		xhr.open("GET", dataUri, true);
		xhr.onload = function(data){
			this.Data = JSON.parse(data.responseText);
		};
		xhr.send();
	},

	CreateLevel: function(type, difficulty) {
		var i, j, xx, yy;
		this.Type = type;
		this.Difficulty = difficulty;

		this.Data = level1;
		//this.LoadingData();
		this.Width = this.Data.width;
		this.Height = this.Data.height;

		//generate a new level data
        level = new Game.Level(this.Width, this.Height);
         //fill level with appointed data
        floor = this.Height - 1 - (Math.random() * 4) | 0;
        level.ExitX = this.Width + 8;
        level.ExitY = floor;

		for(i = 0; i < this.Data.layers.length; ++i){
			if (this.Data.layers[i].type === "tilelayer") {
				var datas = this.Data.layers[i].data;
				for(j = 0; j < datas.length; ++j){
					if (datas[j] === 0) continue;

					xx = j % this.Data.width | 0;
					yy = j / this.Data.width | 0;
					level.SetBlock(xx, yy, datas[j] - 1);
				}
			} else if (this.Data.layers[i].type === "objectgroup") {
				var objects = this.Data.layers[i].objects;
				for(j = 0; j < objects.length; ++j){
					if (objects[j].properties === null || objects[j].name === ""){
						continue;
					}

					var blockData= {
						"special": Number(objects[j].properties.special),
						"coin": Number(objects[j].properties.coin),
						"isWin": objects[j].properties.isWin !== null,
						"name": objects[j].name
					};

					xx = (objects[j].x / this.Data.tilewidth) | 0;
					yy = (objects[j].y / this.Data.tileheight) | 0;
					level.SetBdata(xx, yy, blockData);
				}
			}
		}

		return level;
	}
};
