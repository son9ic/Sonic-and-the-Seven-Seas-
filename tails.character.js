export class Tails {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    // movement
    this.vx = 0;
    this.vy = 0;

    this.accel = 0.6;
    this.friction = 0.88;
    this.gravity = 0.55;
    this.jumpPower = -11;

    this.maxSpeed = 10;

    // state system
    this.state = "idle"; 
    // idle, run, jump, fall, fly, spin, throw

    this.facing = 1;
    this.grounded = false;

    // flight system (key Tails feature)
    this.flying = false;
    this.flyTimer = 0;
    this.flyMax = 140; // stamina
    this.flyForce = -0.8;

    // ring/throw system
    this.throwCooldown = 0;

    // animation
    this.frame = 0;
    this.frameTimer = 0;
  }

  update(input) {
    this.handleInput(input);
    this.applyPhysics();
    this.updateState();
    this.animate();
  }

  handleInput(input) {
    // LEFT / RIGHT movement
    if (input.left) {
      this.vx -= this.accel;
      this.facing = -1;
    }

    if (input.right) {
      this.vx += this.accel;
      this.facing = 1;
    }

    this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vx));

    // Jump
    if (input.jump && this.grounded) {
      this.vy = this.jumpPower;
      this.grounded = false;
      this.state = "jump";
    }

    // 🪽 FLIGHT (double jump style)
    if (input.jump && !this.grounded && this.flyTimer < this.flyMax) {
      this.flying = true;
    }

    if (this.flying && input.jump) {
      this.vy = this.flyForce;
      this.flyTimer++;
      this.state = "fly";
    }

    // stop flying when released or stamina runs out
    if (!input.jump || this.flyTimer >= this.flyMax) {
      this.flying = false;
    }

    // reset flight when grounded
    if (this.grounded) {
      this.flyTimer = 0;
      this.flying = false;
    }

    // 🪶 THROW ACTION (rings / objects)
    if (input.action && this.throwCooldown <= 0) {
      this.state = "throw";
      this.throwCooldown = 20;

      this.throwObject();
    }

    if (this.throwCooldown > 0) {
      this.throwCooldown--;
    }
  }

  throwObject() {
    // simple projectile logic placeholder
    console.log("Tails throws ring forward");
  }

  applyPhysics() {
    // flight reduces gravity effect
    if (!this.flying) {
      this.vy += this.gravity;
    } else {
      this.vy *= 0.9;
    }

    this.x += this.vx;
    this.y += this.vy;

    this.vx *= this.friction;

    // ground collision
    if (this.y >= 300) {
      this.y = 300;
      this.vy = 0;
      this.grounded = true;
    }
  }

  updateState() {
    if (this.flying) {
      this.state = "fly";
      return;
    }

    if (!this.grounded) {
      this.state = this.vy < 0 ? "jump" : "fall";
      return;
    }

    if (this.state === "throw") return;

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
      fly: 3,
      throw: 5
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
} 
const tailsSprites = {
  idle: [idle1, idle2, idle3],
  run: [run1, run2, run3, run4],
  jump: [jump],
  fall: [fall],
  fly: [fly1, fly2, fly3, fly4],
  throw: [throw1, throw2, throw3]
};
