Level = function (game) {};

Level.prototype = {

    init: function(level){
        this.upKey;
        this.downKey;
        this.leftKey;
        this.rightKey;
        this.map=game.global.maps[level];
        this.dX=0;
        this.dY=0;
        this.tileWidth=50;
        this.borderOffset = new Phaser.Point(250,50);
        this.wallGraphicHeight=98;
        this.floorGraphicWidth=103;
        this.floorGraphicHeight=53;
        this.heroGraphicWidth=41;
        this.heroGraphicHeight=62;
        this.wallHeight=this.wallGraphicHeight-this.floorGraphicHeight; 
        this.heroHeight=(this.floorGraphicHeight/2)+(this.heroGraphicHeight-this.floorGraphicHeight)+6;
        this.heroWidth= (this.floorGraphicWidth/2)-(this.heroGraphicWidth/2);
        this.facing='south';//direction the character faces
        this.sorcerer;//hero
        this.sorcererShadow;//duh
        this.shadowOffset=new Phaser.Point(this.heroWidth+7,11);
        this.bmpText;//title text
        this.normText;//text to display hero coordinates
        this.gameScene;//this is the render texture onto which we draw depth sorted scene
        this.floorSprite;
        this.wallSprite;
        this.heroMapTile=new Phaser.Point(3,3);//hero tile making him stand at centre of scene
        this.heroMapPos;//2D coordinates of hero map marker sprite in minimap, assume this is mid point of graphic
        this.heroSpeed=1.2;//well, speed of our hero 
        this.hero2DVolume = new Phaser.Point(30,30);//now that we dont have a minimap & hero map sprite, we need this
        this.cornerMapPos=new Phaser.Point(0,0);
        this.cornerMapTile=new Phaser.Point(0,0);
        this.halfSpeed=0.7;
        this.visibleTiles=new Phaser.Point(7,7);
    },

    update: function(){
        //check key press
        this.detectKeyInput();
        //if no key is pressed then stop else play walking animation
        if (this.dY == 0 && this.dX == 0)
        {
            this.sorcerer.animations.stop();
            this.sorcerer.animations.currentAnim.frame=0;
        }else{
            if(this.sorcerer.animations.currentAnim!=this.facing){
                this.sorcerer.animations.play(this.facing);
            }
        }
        //check if we are walking into a wall else move hero in 2D
        if (this.isWalkable())
        {
            this.heroMapPos.x +=  this.heroSpeed * this.dX;
            this.heroMapPos.y +=  this.heroSpeed * this.dY;
            
            //move the corner in opposite direction
            this.cornerMapPos.x -=  this.heroSpeed * this.dX;
            this.cornerMapPos.y -=  this.heroSpeed * this.dY;
            this.cornerMapTile=this.getTileCoordinates(this.cornerMapPos,this.tileWidth);
            //get the new hero map tile
            this.heroMapTile=this.getTileCoordinates(this.heroMapPos,this.tileWidth);
            //depthsort & draw new scene
            this.renderScene();
        }
    },

    isWalkable: function(){//It is not advisable to create points in update loop, but for code readability.
        var able=true;
        var heroCornerPt=new Phaser.Point(this.heroMapPos.x-this.hero2DVolume.x/2,this.heroMapPos.y-this.hero2DVolume.y/2);
        var cornerTL =new Phaser.Point();
        cornerTL.x=heroCornerPt.x +  (this.heroSpeed * this.dX);
        cornerTL.y=heroCornerPt.y +  (this.heroSpeed * this.dY);
        // now we have the top left corner point. we need to find all 4 corners based on the map marker graphics width & height
        //ideally we should just provide the hero a volume instead of using the graphics' width & height
        var cornerTR =new Phaser.Point();
        cornerTR.x=cornerTL.x+this.hero2DVolume.x;
        cornerTR.y=cornerTL.y;
        var cornerBR =new Phaser.Point();
        cornerBR.x=cornerTR.x;
        cornerBR.y=cornerTL.y+this.hero2DVolume.y;
        var cornerBL =new Phaser.Point();
        cornerBL.x=cornerTL.x;
        cornerBL.y=cornerBR.y;
        var newTileCorner1;
        var newTileCorner2;
        var newTileCorner3=this.heroMapPos;
        //let us get which 2 corners to check based on current facing, may be 3
        switch (this.facing){
            case "north":
                newTileCorner1=cornerTL;
                newTileCorner2=cornerTR;
            break;
            case "south":
                newTileCorner1=cornerBL;
                newTileCorner2=cornerBR;
            break;
            case "east":
                newTileCorner1=cornerBR;
                newTileCorner2=cornerTR;
            break;
            case "west":
                newTileCorner1=cornerTL;
                newTileCorner2=cornerBL;
            break;
            case "northeast":
                newTileCorner1=cornerTR;
                newTileCorner2=cornerBR;
                newTileCorner3=cornerTL;
            break;
            case "southeast":
                newTileCorner1=cornerTR;
                newTileCorner2=cornerBR;
                newTileCorner3=cornerBL;
            break;
            case "northwest":
                newTileCorner1=cornerTR;
                newTileCorner2=cornerBL;
                newTileCorner3=cornerTL;
            break;
            case "southwest":
                newTileCorner1=cornerTL;
                newTileCorner2=cornerBR;
                newTileCorner3=cornerBL;
            break;
        }
        //check if those corners fall inside a wall after moving
        newTileCorner1=this.getTileCoordinates(newTileCorner1,this.tileWidth);
        if(this.map[newTileCorner1.y][newTileCorner1.x]==1){
            able=false;
        }
        newTileCorner2=this.getTileCoordinates(newTileCorner2,this.tileWidth);
        if(this.map[newTileCorner2.y][newTileCorner2.x]==1){
            able=false;
        }
        newTileCorner3=this.getTileCoordinates(newTileCorner3,this.tileWidth);
        if(this.map[newTileCorner3.y][newTileCorner3.x]==1){
            able=false;
        }
        return able;
    },

    create: function(){
        this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        //we draw the depth sorted scene into this render texture
        this.gameScene=game.add.renderTexture(game.width,game.height);
        game.add.sprite(0, 0, this.gameScene);
        this.floorSprite= game.make.sprite(0, 0, 'floor');
        this.wallSprite= game.make.sprite(0, 0, 'wall');
        this.sorcererShadow=game.make.sprite(0,0,'heroShadow');
        this.sorcererShadow.scale= new Phaser.Point(0.5,0.6);
        this.sorcererShadow.alpha=0.4;
        this.createLevel();
    },

    detectKeyInput: function(){//assign direction for character & set x,y speed components
        if (this.upKey.isDown)
        {
            this.dY = -1;
        }
        else if (this.downKey.isDown)
        {
            this.dY = 1;
        }
        else
        {
            this.dY = 0;
        }
        if (this.rightKey.isDown)
        {
            this.dX = 1;
            if (this.dY == 0)
            {
                this.facing = "east";
            }
            else if (this.dY==1)
            {
                this.facing = "southeast";
                this.dX = this.dY=this.halfSpeed;
            }
            else
            {
                this.facing = "northeast";
                this.dX=this.halfSpeed;
                this.dY=-1*this.halfSpeed;
            }
        }
        else if (this.leftKey.isDown)
        {
            this.dX = -1;
            if (this.dY == 0)
            {
                this.facing = "west";
            }
            else if (this.dY==1)
            {
                this.facing = "southwest";
                this.dY=this.halfSpeed;
                this.dX=-1*this.halfSpeed;
            }
            else
            {
                this.facing = "northwest";
                this.dX = this.dY=-1*this.halfSpeed;
            }
        }
        else
        {
            this.dX = 0;
            if (this.dY == 0)
            {
                //this.facing="west";
            }
            else if (this.dY==1)
            {
                this.facing = "south";
            }
            else
            {
                this.facing = "north";
            }
        }
    },

    createLevel: function(){//create minimap
        this.addHero();
        this.heroMapPos=new Phaser.Point(this.heroMapTile.y * this.tileWidth, this.heroMapTile.x * this.tileWidth);
        this.heroMapPos.x+=(this.tileWidth/2);
        this.heroMapPos.y+=(this.tileWidth/2);
        this.heroMapTile=this.getTileCoordinates(this.heroMapPos,this.tileWidth);
        this.renderScene();//draw once the initial state
    },
    renderScene: function(){
        this.gameScene.clear();//clear the previous frame then draw again
        var tileType=0;
        //let us limit the loops within visible area
        var startTileX=Math.max(0,0-this.cornerMapTile.x);
        var startTileY=Math.max(0,0-this.cornerMapTile.y);
        var endTileX=Math.min(this.map[0].length,startTileX+this.visibleTiles.x);
        var endTileY=Math.min(this.map.length,startTileY+this.visibleTiles.y);
        startTileX=Math.max(0,endTileX-this.visibleTiles.x);
        startTileY=Math.max(0,endTileY-this.visibleTiles.y);
        //check for border condition
        for (var i = startTileY; i < endTileY; i++)
        {
            for (var j = startTileX; j < endTileX; j++)
            {
                tileType=this.map[i][j];
                this.drawTileIso(tileType,i,j);
                if(i==this.heroMapTile.y&&j==this.heroMapTile.x){
                    this.drawHeroIso();
                }
            }
        }
    },
    drawHeroIso: function(){
        var isoPt= new Phaser.Point();//It is not advisable to create points in update loop
        var heroCornerPt=new Phaser.Point(this.heroMapPos.x-this.hero2DVolume.x/2+this.cornerMapPos.x,this.heroMapPos.y-this.hero2DVolume.y/2+this.cornerMapPos.y);
        isoPt=this.cartesianToIsometric(heroCornerPt);//find new isometric position for hero from 2D map position
        this.gameScene.renderXY(this.sorcererShadow,isoPt.x+this.borderOffset.x+this.shadowOffset.x, isoPt.y+this.borderOffset.y+this.shadowOffset.y, false);//draw shadow to render texture
        this.gameScene.renderXY(this.sorcerer,isoPt.x+this.borderOffset.x+this.heroWidth, isoPt.y+this.borderOffset.y-this.heroHeight, false);//draw hero to render texture
    },
    drawTileIso: function(tileType,i,j){//place isometric level tiles
        var isoPt= new Phaser.Point();//It is not advisable to create point in update loop
        var cartPt=new Phaser.Point();//This is here for better code readability.
        cartPt.x=j*this.tileWidth+this.cornerMapPos.x;
        cartPt.y=i*this.tileWidth+this.cornerMapPos.y;
        isoPt=this.cartesianToIsometric(cartPt);
        //we could further optimise by not drawing if tile is outside screen.
        if(tileType==1){
            this.gameScene.renderXY(this.wallSprite, isoPt.x+this.borderOffset.x, isoPt.y+this.borderOffset.y-this.wallHeight, false);
        }else{
            this.gameScene.renderXY(this.floorSprite, isoPt.x+this.borderOffset.x, isoPt.y+this.borderOffset.y, false);
        }
    },
    addHero: function(){
        // sprite
        this.sorcerer = game.add.sprite(-50, 0, 'hero', '1.png');// keep him out side screen area
        // animation
        this.sorcerer.animations.add('southeast', ['1.png','2.png','3.png','4.png'], 6, true);
        this.sorcerer.animations.add('south', ['5.png','6.png','7.png','8.png'], 6, true);
        this.sorcerer.animations.add('southwest', ['9.png','10.png','11.png','12.png'], 6, true);
        this.sorcerer.animations.add('west', ['13.png','14.png','15.png','16.png'], 6, true);
        this.sorcerer.animations.add('northwest', ['17.png','18.png','19.png','20.png'], 6, true);
        this.sorcerer.animations.add('north', ['21.png','22.png','23.png','24.png'], 6, true);
        this.sorcerer.animations.add('northeast', ['25.png','26.png','27.png','28.png'], 6, true);
        this.sorcerer.animations.add('east', ['29.png','30.png','31.png','32.png'], 6, true);
    },

    cartesianToIsometric: function(cartPt){
        var tempPt=new Phaser.Point();
        tempPt.x=cartPt.x-cartPt.y;
        tempPt.y=(cartPt.x+cartPt.y)/2;
        return (tempPt);
    },
    isometricToCartesian: function(isoPt){
        var tempPt=new Phaser.Point();
        tempPt.x=(2*isoPt.y+isoPt.x)/2;
        tempPt.y=(2*isoPt.y-isoPt.x)/2;
        return (tempPt);
    },
    getTileCoordinates: function(cartPt, tileHeight){
        var tempPt=new Phaser.Point();
        tempPt.x=Math.floor(cartPt.x/tileHeight);
        tempPt.y=Math.floor(cartPt.y/tileHeight);
        return(tempPt);
    },
    getCartesianFromTileCoordinates: function(tilePt, tileHeight){
        var tempPt=new Phaser.Point();
        tempPt.x=tilePt.x*tileHeight;
        tempPt.y=tilePt.y*tileHeight;
        return(tempPt);
    }

};
