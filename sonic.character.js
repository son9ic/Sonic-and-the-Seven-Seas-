export class Sonic {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    // movement
    this.vx = 0;
    this.vy = 0;

    this.accel = 0.7;
    this.friction = 0.88;
    this.gravity = 0.6;
    this.jumpPower = -12;

    this.maxSpeed = 12;

    // state system
    this.state = "idle"; 
    // idle, run, jump, fall, spindash, wait

    this.facing = 1;
    this.grounded = false;

    // spin dash system
    this.spindashCharge = 0;
    this.isCharging = false;

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

    // Clamp speed
    this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vx));

    // Jump
    if (input.jump && this.grounded && this.state !== "spindash") {
      this.vy = this.jumpPower;
      this.grounded = false;
      this.state = "jump";
    }

    // Spin Dash (hold down + press action)
    if (input.down && input.action && this.grounded) {
      this.state = "spindash";
      this.isCharging = true;
      this.spindashCharge = Math.min(this.spindashCharge + 0.5, 20);
    }

    // Release spin dash
    if (!input.action && this.isCharging) {
      this.vx = this.spindashCharge * this.facing;
      this.vy = -2;
      this.isCharging = false;
      this.spindashCharge = 0;
    }

    // Idle “waiting pose trigger”
    if (
      !input.left &&
      !input.right &&
      this.grounded &&
      this.vx < 0.5
    ) {
      this.state = "wait";
    }
  }

  applyPhysics() {
    this.vy += this.gravity;

    this.x += this.vx;
    this.y += this.vy;

    this.vx *= this.friction;

    // ground
    if (this.y >= 300) {
      this.y = 300;
      this.vy = 0;
      this.grounded = true;
    }
  }

  updateState() {
    if (!this.grounded) {
      this.state = this.vy < 0 ? "jump" : "fall";
      return;
    }

    if (this.state === "spindash") return;
    if (this.state === "wait") return;

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
      spindash: 3,
      wait: 12
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
export const input = {
  left: false,
  right: false,
  jump: false,
  down: false,
  action: false
};

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") input.left = true;
  if (e.code === "ArrowRight") input.right = true;
  if (e.code === "ArrowUp") input.jump = true;
  if (e.code === "ArrowDown") input.down = true;
  if (e.code === "KeyZ") input.action = true;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") input.left = false;
  if (e.code === "ArrowRight") input.right = false;
  if (e.code === "ArrowUp") input.jump = false;
  if (e.code === "ArrowDown") input.down = false;
  if (e.code === "KeyZ") input.action = false;
}); 
wait: [wait1, wait2, wait3, wait2]
