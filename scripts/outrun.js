class OutRun extends RacingGame {
  handleInput(dt){
    var dx = dt * 2 * (this.speed/this.maxSpeed); // at top speed, should be able to cross from left to right (-1 to 1) in 1 second

    if (this.keyspressed['ArrowLeft'] || this.keyspressed['KeyA']){
      this.playerX = this.playerX - dx;
    } else if (this.keyspressed['ArrowRight'] || this.keyspressed['KeyD']){
      this.playerX = this.playerX + dx;
    }

    if (this.keyspressed['ArrowUp'] || this.keyspressed['KeyW']){
      this.speed = Util.accelerate(this.speed, this.accel, dt);
    } else if (this.keyspressed['ArrowDown'] || this.keyspressed['KeyS']){
      this.speed = Util.accelerate(this.speed, this.breaking, dt);
    } else {
      this.speed = Util.accelerate(this.speed, this.decel, dt);
    }
  }

  update(dt){
    this.handleInput(dt);
    this.position= (this.position > this.trackLength-1) ? .000000001 : this.position;


    if (((this.playerX < -1) || (this.playerX > 1)) && (this.speed > this.offRoadLimit))
      this.speed = Util.accelerate(this.speed, this.offRoadDecel, dt);

    this.playerX = Util.limit(this.playerX, -2, 2);     // dont ever let player go too far out of bounds
    this.speed   = Util.limit(this.speed, 0, this.maxSpeed); // or exceed maxSpeed
    this.position = Math.ceil(Util.increase(this.position, dt * this.speed, this.trackLength));

  }

  draw(ctx){
    // Render is from common.js
    if (this.background.loaded) {
      Render.background(ctx, this.background, this.width, this.height, BACKGROUND.SKY);
      Render.background(ctx, this.background, this.width, this.height, BACKGROUND.HILLS);
      Render.background(ctx, this.background, this.width, this.height, BACKGROUND.TREES);
    }
    // iterates over the segments, and projects each segment’s p1 and p2 from
    // world coordinates to screen coordinates, clipping the segment if
    // necessary, otherwise rendering it
    var baseSegment = this.findSegment(this.position);
    var maxY = this.height;
    var n, segment;
    for (n = 0; n < this.segmentLength*this.rumbleLength*200; n++){
      segment = this.segments[(baseSegment.index + n) % this.segments.length];
      segment.fog    = Util.exponentialFog(n/this.drawDistance, this.fogDensity);

      Util.project(segment.p1, (this.playerX * this.roadWidth), this.cameraHeight, Math.abs(this.position-((segment.index < baseSegment.index)?this.trackLength:0)), this.cameraDepth, this.width, this.height, this.roadWidth);
      Util.project(segment.p2, (this.playerX * this.roadWidth), this.cameraHeight, Math.abs(this.position-((segment.index < baseSegment.index)?this.trackLength:0)), this.cameraDepth, this.width, this.height, this.roadWidth);

      // behind, or clipped by already rendered segment
      if ((segment.p1.camera.z <= this.cameraDepth) || (segment.p2.screen.y >= maxY)) {
        continue;
      }

      Render.segment(
        ctx, this.width, this.lanes,
        segment.p1.screen.x,
        segment.p1.screen.y,
        segment.p1.screen.w,
        segment.p2.screen.x,
        segment.p2.screen.y,
        segment.p2.screen.w,
        segment.fog,
        segment.color
      );

      maxY = segment.p2.screen.y;

      Render.player(ctx, this.width, this.height, this.resolution, this.roadWidth, this.sprites, this.speed/this.maxSpeed,
              this.cameraDepth/this.playerZ,
              this.width/2,
              this.height);
    }
  }
}
