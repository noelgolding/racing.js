class RacingGame extends SimpleGame{
  init() {
    this.segments      = [];                           // array of road segments
    this.background    = new Image();                  // our background image (loaded below)
    this.background.addEventListener('load', () => {
      this.background.loaded = true;
    });
    this.background.src='assets/images/background.png';
    this.sprites       = new Image();                         // our spritesheet (loaded below)
    this.sprites.addEventListener('load', () => {
      this.sprites.loaded = true;
    });
    this.sprites.src       = 'assets/images/sprites.png';
    this.resolution    = this.height/480;                         // scaling factor to provide resolution independence (computed)
    this.roadWidth     = 2000;                         // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
    this.segmentLength = 200;                          // length of a single segment
    this.rumbleLength  = 3;                            // number of segments per red/white rumble strip
    this.trackLength   = null;                         // z length of entire track (computed)
    this.lanes         = 3;                            // number of lanes
    this.fieldOfView   = 100;                          // angle (degrees) for field of view
    this.cameraHeight  = 1000;                         // z height of camera
    this.cameraDepth   = .8;                         // z distance camera is from screen (computed)
    this.drawDistance  = 300;                          // number of segments to draw
    this.playerX       = 0;                            // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
    this.playerZ       = 800;                         // player relative z distance from camera (computed)
    this.fogDensity    = 5;                            // exponential fog density
    this.position      = 0;                            // current camera Z position (add playerZ to get player's absolute Z position)
    this.speed         = 0;                            // current speed
    this.maxSpeed      = this.segmentLength/this.step; // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
    this.accel         =  this.maxSpeed/5;             // acceleration rate - tuned until it 'felt' right
    this.breaking      = -this.maxSpeed;               // deceleration rate when braking
    this.decel         = -this.maxSpeed/5;             // 'natural' deceleration rate when neither accelerating, nor braking
    this.offRoadDecel  = -this.maxSpeed/2;             // off road deceleration is somewhere in between
    this.offRoadLimit  =  this.maxSpeed/4;             // limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road)

    this.resetRoad();
  }

  resetRoad() {
    this.segments = [];
    for(var n = 0 ; n < this.drawDistance*2 ; n++) { // arbitrary road length
      this.segments.push({
         index: n,
         p1: { world: { z:  n   *this.segmentLength }, camera: {}, screen: {} },
         p2: { world: { z: (n+1)*this.segmentLength }, camera: {}, screen: {} },
         color: Math.floor(n/this.rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT
      });
    }
    this.trackLength = this.segments.length * this.segmentLength;
  }

  findSegment(z){
    return this.segments[Math.floor(z/this.segmentLength) % this.segments.length];
  }
}
