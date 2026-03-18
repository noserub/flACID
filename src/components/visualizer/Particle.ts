/**
 * Particle for organic flow visualization
 */

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;

  constructor(x: number, y: number, vx: number, vy: number, size: number, hue: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = 1;
    this.maxLife = Math.random() * 100 + 50;
    this.size = size;
    this.hue = hue;
  }

  update(width: number, height: number, flow: number, turbulence: number, time: number): void {
    this.x += this.vx + Math.sin(this.y * 0.01 + time * 0.01) * flow;
    this.y += this.vy + Math.cos(this.x * 0.01 + time * 0.01) * flow;
    this.x += (Math.random() - 0.5) * turbulence;
    this.y += (Math.random() - 0.5) * turbulence;
    this.life -= 0.5;

    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D, intensity: number): void {
    const alpha = (this.life / this.maxLife) * intensity;
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
    gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${alpha * 0.6})`);
    gradient.addColorStop(0.5, `hsla(${this.hue + 20}, 60%, 50%, ${alpha * 0.3})`);
    gradient.addColorStop(1, `hsla(${this.hue}, 50%, 40%, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  isDead(): boolean {
    return this.life <= 0;
  }
}
