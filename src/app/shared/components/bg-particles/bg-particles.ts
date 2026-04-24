import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

@Component({
  selector: 'app-bg-particles',
  standalone: true,
  imports: [],
  template: `<canvas #canvas></canvas>`,
  styles: [`
    canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1;
      pointer-events: none;
    }
  `]
})
export class BgParticles implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animId = 0;
  private resizeTimer = 0;

  private readonly COLOR = '0, 123, 255';
  private readonly LINK_DIST = 130;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.setup();
    this.ngZone.runOutsideAngular(() => this.loop());
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
    clearTimeout(this.resizeTimer);
  }

  private onResize = (): void => {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => this.setup(), 200) as unknown as number;
  };

  private setup(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.ctx = canvas.getContext('2d')!;
    this.particles = this.createParticles(canvas.width, canvas.height);
  }

  private createParticles(w: number, h: number): Particle[] {
    const count = w < 768 ? 25 : 55;
    return Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.45 + 0.2
    }));
  }

  private loop = (): void => {
    const canvas = this.canvasRef.nativeElement;
    const { ctx } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Draw dark background so the canvas is self-contained at z-index: -1
    ctx.fillStyle = '#000114';
    ctx.fillRect(0, 0, w, h);

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      else if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      else if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.COLOR}, ${p.opacity})`;
      ctx.fill();
    }

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < this.LINK_DIST) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${this.COLOR}, ${(1 - d / this.LINK_DIST) * 0.18})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    this.animId = requestAnimationFrame(this.loop);
  };
}
