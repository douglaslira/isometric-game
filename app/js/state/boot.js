Boot = function (game) {};

Boot.prototype = {

    init: function () {
    },
    preload: function () {
        this.load.bitmapFont('eightbitwonder','assets/fonts/eightbitwonder.png', 'assets/fonts/eightbitwonder.fnt');
    },
    create: function () {
        this.state.start('Preloader'); 
    }
};
