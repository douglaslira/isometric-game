Preloader = function (game) {};

Preloader.prototype = {

    preload: function () {
        var loadingLabel = this.add.bitmapText(this.world.centerX, this.world.centerY - 20, 'eightbitwonder', 'LOADING', 20);
        loadingLabel.anchor.set(0.5);
        this.loadingText = this.add.bitmapText(this.world.centerX, this.world.centerY + 20, 'eightbitwonder', '0', 20);
        this.loadingText.anchor.set(0.5);
        this.load.crossOrigin='Anonymous';
        this.load.image('greenTile', 'https://dl.dropboxusercontent.com/s/nxs4ptbuhrgzptx/green_tile.png?dl=0');
        this.load.image('redTile', 'https://dl.dropboxusercontent.com/s/zhk68fq5z0c70db/red_tile.png?dl=0');
        this.load.image('floor', 'assets/tiles/tile5.png');
        this.load.image('wall', 'assets/tiles/tile1.png');
        this.load.atlasJSONArray('hero', 'assets/tiles/hero.png', 'assets/tiles/hero.json');
    },

    fileComplete: function(progress, cacheKey, success, totalLoaded, totalFiles) {
        this.loadingText.text = progress;
    },

    update: function () {
        this.state.start('Menu');
    },

    shutdown: function () {
        this.loadingText = null;
    }
};
