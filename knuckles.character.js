export class Knuckles {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    // movement
    this.vx = 0;
    this.vy = 0;

    this.accel = 0.5;     // slower than Sonic
    this.friction = 0.85;
    this.gravity = 0.65;
    this.jumpPower = -12;

    this.maxSpeed = 8;

    // state system
    this.state = "idle";
    // idle, run, jump, fall, glide, climb, punch

    this.facing = 1;
    this.grounded = false;

    // glide system
    this.gliding = false;
    this.glideGravity = 0.15;
    this.glideSpeedLimit = 6;

    // climb system
    this.climbing = false;

    // punch system
    this.punchCooldown = 0;

    // animation
    this.frame = 0;
    this.frameTimer = 0;
  }

  update(input, walls = []) {
    this.handleInput(input, walls);
    this.applyPhysics();
    this.updateState();
    this.animate();
  }

  handleInput(input, walls) {
    // LEFT / RIGHT movement
    if (!this.climbing) {
      if (input.left) {
        this.vx -= this.accel;
        this.facing = -1;
      }

      if (input.right) {
        this.vx += this.accel;
        this.facing = 1;
      }
    }

    this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vx));

    // JUMP
    if (input.jump && this.grounded) {
      this.vy = this.jumpPower;
      this.grounded = false;
      this.state = "jump";
    }

    // 🪽 GLIDE (hold jump mid-air)
    if (input.jump && !this.grounded && this.vy > -2) {
      this.gliding = true;
      this.state = "glide";
    }

    if (!input.jump) {
      this.gliding = false;
    }

    // Gliding physics control
    if (this.gliding) {
      this.vy *= 0.9;
      this.vy = Math.min(this.vy, 1);
      this.vx = Math.max(-this.glideSpeedLimit, Math.min(this.glideSpeedLimit, this.vx));
    }

    // 🧗 CLIMB (touch wall + up key)
    const touchingWall = this.checkWall(walls);

    if (touchingWall && input.up) {
      this.climbing = true;
      this.state = "climb";
      this.vy = -2;
    } else {
      this.climbing = false;
    }

    // 🥊 PUNCH ATTACK
    if (input.action && this.punchCooldown <= 0) {
      this.state = "punch";
      this.punchCooldown = 25;

      this.punch();
    }

    if (this.punchCooldown > 0) {
      this.punchCooldown--;
    }
  }

  punch() {
    // placeholder combat logic
    console.log("Knuckles punches forward with force");
  }

  checkWall(walls) {
    // simple placeholder collision check
    for (let wall of walls) {
      if (
        this.x + 20 > wall.x &&
        this.x - 20 < wall.x + wall.w &&
        this.y > wall.y &&
        this.y < wall.y + wall.h
      ) {
        return true;
      }
    }
    return false;
  }

  applyPhysics() {
    // gravity
    if (!this.gliding && !this.climbing) {
      this.vy += this.gravity;
    } else if (this.gliding) {
      this.vy += this.glideGravity;
    }

    if (!this.climbing) {
      this.x += this.vx;
      this.y += this.vy;
    }

    this.vx *= this.friction;

    // ground
    if (this.y >= 300) {
      this.y = 300;
      this.vy = 0;
      this.grounded = true;
      this.gliding = false;
    }
  }

  updateState() {
    if (this.climbing) return;
    if (this.gliding) return;

    if (!this.grounded) {
      this.state = this.vy < 0 ? "jump" : "fall";
      return;
    }

    if (this.state === "punch") return;

    if (Math.abs(this.vx) > 2) {
      this.state = "run";
    } else {
      this.state = "idle";
    }
  }

  animate() {
    this.frameTimer++;

    const speedMap = {
      idle: 10,
      run: 4,
      jump: 999,
      fall: 999,
      glide: 6,
      climb: 6,
      punch: 5
    };

    if (this.frameTimer > speedMap[this.state]) {
      this.frame++;
      this.frameTimer = 0;
    }
  }

  draw(ctx, sprites) {
    const set = sprites[this.state];
    if (!set) return;

    const img = set[this.frame % set.length];

    ctx.save();

    if (this.facing === -1) {
      ctx.scale(-1, 1);
      ctx.drawImage(img, -this.x - 48, this.y - 48, 48, 48);
    } else {
      ctx.drawImage(img, this.x - 48, this.y - 48, 48, 48);
    }

    ctx.restore();
  }
} const knucklesSprites = {
  idle: [idle1, idle2],
  run: [run1, run2, run3, run4],
  jump: [jump],
  fall: [fall],
  glide: [glide1, glide2, glide3],
  climb: [climb1, climb2],
  punch: [punch1, punch2, punch3]
};
