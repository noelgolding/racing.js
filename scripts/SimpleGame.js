class AssetManager{
  constructor(){
    this.images = {};
  }

  loadImage(src){
    let img = new Image();
    img.addEventListener('load', () => { img.loaded = true; });
    img.src = src;
    this.images[src] = img;
    return img;
  }

  getImage(src) {
    let img = this.images[src];
    if (!img) {
      img = this.loadImage(src);
    }
    return img;
  }
}

class Camera{
  constructor(gameObject, width, height){
    this.gameObject = gameObject;
    this.width = width;
    this.height = height;
    this.margin = width/2;//50;
  }

  getTranslateX(){
    return -this.gameObject.x + this.margin;
  }

  draw(ctx){
    ctx.translate(this.getTranslateX(), 0);
  }
}

class GameObject{
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
}

class SimpleSprite extends GameObject {
  constructor(img, x=0, y=0){
    super(x, y);
    this.img = img;
  }

  draw(ctx) {
    if (this.img.loaded) {
      ctx.drawImage(this.img, this.x, this.y);
    }
  }
}

/**
 * img width has to be at least as wide as the canvs in order to provide
 * accurate inifinite scrolling
 */
class ParallaxLayer extends SimpleSprite{
  constructor(img, tx=0, x=0, y=0, velocityX=0){
    super(img, x, y);
    this.tx = tx;
    this.velocityX = velocityX;
  }

  getTranslateX(camera){
    let tx = (camera.gameObject.x * (1-this.tx)) % this.img.width;
    return tx;
  }

  update(dt){
    this.x += this.velocityX * dt;
    if (this.x < -this.img.width) {
      this.x += this.img.width;
    } else if (this.x > this.img.width) {
      this.x -= this.img.width;
    }
  }

  draw(ctx, camera){
    ctx.save();
    let tx = this.getTranslateX(camera)
    ctx.translate(-camera.getTranslateX() -tx, 0);
    super.draw(ctx);

    let origX = this.x;
    if (camera.width - this.img.width + (tx%this.img.width) >= this.x){
      this.x = origX + this.img.width;
    } else {
      this.x = origX - this.img.width;
    }

    super.draw(ctx);
    this.x = origX;

    ctx.restore();
  }
}

class ParallaxContainer {
  constructor(camera){
    this.camera = camera;
    this.layers = [];
  }

  addLayer(layer){
    this.layers.push(layer);
  }

  update(dt){
    this.layers.forEach( l => {
      l.update(dt);
    });
  }

  draw(ctx){
    this.layers.forEach( l => {
      l.draw(ctx, this.camera);
    });
  }
}

class SimpleGame{
  constructor(gameCanvas){
    this.assetMgr = new AssetManager();

    this.canvas = gameCanvas;
    this.ctx = this.canvas.getContext('2d');

    this.fps           = 60;                           // how many 'update' frames per second
    this.step          = 1/this.fps;                   // how long is each frame (in seconds)
    this.width         = this.canvas.width;            // logical canvas width
    this.height        = this.canvas.height;           // logical canvas height
    this.aspectRatio   = this.width/this.height;

    this.keyspressed = {};
    window.addEventListener('keydown', (e) => this.keyspressed[e.code] = true);
    window.addEventListener('keyup', (e) => this.keyspressed[e.code] = false);

    window.addEventListener('resize', (e) => this.scaleCanvas());
    this.scaleCanvas();

    this.canvas.focus();
  }

  scaleCanvas(){
    var win_width = window.innerWidth;
    var win_height = window.innerHeight;
    var win_ratio = win_width/win_height;

    var c_width;
    var c_height;
    if (win_ratio > this.aspectRatio) {
      c_width = (this.width * win_height/this.height);
      c_height = win_height;
    } else {
      c_width = win_width;
      c_height = (this.height * win_width/this.width);
    }

    this.canvas.style.width = c_width+'px';
    this.canvas.style.height = c_height+'px';
  }

  start(){
    this.init();
    this.now    = null;
    this.last   = Date.now();
    this.dt     = 0;
    this.gdt    = 0;
    this.fpsCounter = 0;
    this.fpsTimer = 0;
    this.framesPerSecond = this.fps;
    this.gameloop();
  }

  drawInternal(){
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw(this.ctx);
    this.ctx.restore();
    if (this.showFPS) {
      this.ctx.fillStyle = 'rgba(255,255,255,.3)';
      this.ctx.fillRect(14, 6,50,20);
      this.ctx.fillStyle = 'black';
      this.ctx.fillText("FPS: " + this.framesPerSecond, 20, 20);
    }
  }

  gameloop(){
    this.now = Date.now();
    // using requestAnimationFrame have to be able to handle large delta's
    // caused when it 'hibernates' in a background or non-visible tab
    this.gdt = this.gdt + this.dt;
    this.dt  = Math.min(1, (this.now - this.last) / 1000);
    while (this.gdt > this.step) {
      this.gdt = this.gdt - this.step;
      this.update(this.step);
    }
    this.drawInternal();
    this.fpsTimer += Math.min(1000, this.now - this.last);
    this.fpsCounter++;
    if (this.fpsTimer >= 1000) {
      this.framesPerSecond = this.fpsCounter;
      this.fpsCounter = 0;
      this.fpsTimer = 0;
    }
    this.last = this.now;
    requestAnimationFrame(() => this.gameloop());
  }

  /////// ABSTRACT / VIRTUAL METHODS ////////////
  init(){}
  update(dt){}
  draw(ctx){}
}
