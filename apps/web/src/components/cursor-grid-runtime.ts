import type { MutableRefObject } from "react";

export type CursorGridFalloff = "linear" | "smooth" | "sharp";

export interface CursorGridConfig {
  cellSize: number;
  color: string;
  radius: number;
  falloff: CursorGridFalloff;
  holdTime: number;
  fadeDuration: number;
  lineWidth: number;
  maxOpacity: number;
  fillOpacity: number;
  gridOpacity: number;
  cellRadius: number;
  clickPulse: boolean;
  pulseSpeed: number;
}

interface Pulse {
  x: number;
  y: number;
  t0: number;
}

const FALLOFF_CURVES: Record<CursorGridFalloff, (t: number) => number> = {
  linear: (t) => t,
  smooth: (t) => t * t * (3 - 2 * t),
  sharp: (t) => t * t * t,
};

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;
  const color = Number.parseInt(value.slice(0, 6), 16);
  return [(color >> 16) & 255, (color >> 8) & 255, color & 255];
}

export function startCursorGridRuntime({
  canvas,
  cellSize,
  container,
  propsRef,
  wakeRef,
}: {
  canvas: HTMLCanvasElement;
  cellSize: number;
  container: HTMLDivElement;
  propsRef: MutableRefObject<CursorGridConfig>;
  wakeRef: MutableRefObject<(() => void) | null>;
}) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  let columns = 0;
  let rows = 0;
  let offsetX = 0;
  let offsetY = 0;
  let alphas = new Float32Array(0);
  let touched = new Float64Array(0);
  let width = 0;
  let height = 0;
  const pulses: Pulse[] = [];
  let animationFrame = 0;
  let running = false;
  let lastFrame = 0;

  const rebuild = () => {
    width = container.offsetWidth;
    height = container.offsetHeight;
    canvas.width = Math.max(1, Math.round(width * devicePixelRatio));
    canvas.height = Math.max(1, Math.round(height * devicePixelRatio));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    columns = Math.ceil(width / cellSize) + 1;
    rows = Math.ceil(height / cellSize) + 1;
    offsetX = (width - columns * cellSize) / 2;
    offsetY = (height - rows * cellSize) / 2;
    alphas = new Float32Array(columns * rows);
    touched = new Float64Array(columns * rows);
  };

  const cellCenter = (index: number): [number, number] => {
    const config = propsRef.current;
    return [
      offsetX + (index % columns) * config.cellSize + config.cellSize / 2,
      offsetY +
        Math.floor(index / columns) * config.cellSize +
        config.cellSize / 2,
    ];
  };

  const energize = (x: number, y: number, boost = 1) => {
    const config = propsRef.current;
    const radius = Math.max(config.radius, 1);
    const ease = FALLOFF_CURVES[config.falloff];
    const now = performance.now();
    const minColumn = Math.max(
      0,
      Math.floor((x - radius - offsetX) / config.cellSize),
    );
    const maxColumn = Math.min(
      columns - 1,
      Math.floor((x + radius - offsetX) / config.cellSize),
    );
    const minRow = Math.max(
      0,
      Math.floor((y - radius - offsetY) / config.cellSize),
    );
    const maxRow = Math.min(
      rows - 1,
      Math.floor((y + radius - offsetY) / config.cellSize),
    );
    for (let row = minRow; row <= maxRow; row++) {
      for (let column = minColumn; column <= maxColumn; column++) {
        const index = row * columns + column;
        const [centerX, centerY] = cellCenter(index);
        const distance = Math.hypot(centerX - x, centerY - y);
        if (distance > radius) continue;
        const level = ease(1 - distance / radius) * config.maxOpacity * boost;
        const currentAlpha = alphas[index] ?? 0;
        if (level > currentAlpha) alphas[index] = level;
        if (level > 0) touched[index] = now;
      }
    }
  };

  const drawGrid = (config: CursorGridConfig, rgb: number[]) => {
    if (config.gridOpacity <= 0) return;
    const [red, green, blue] = rgb;
    context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${config.gridOpacity})`;
    context.lineWidth = 1;
    context.beginPath();
    for (let column = 0; column <= columns; column++) {
      const x = Math.round(offsetX + column * config.cellSize) + 0.5;
      context.moveTo(x, 0);
      context.lineTo(x, height);
    }
    for (let row = 0; row <= rows; row++) {
      const y = Math.round(offsetY + row * config.cellSize) + 0.5;
      context.moveTo(0, y);
      context.lineTo(width, y);
    }
    context.stroke();
  };

  const animatePulses = (now: number, config: CursorGridConfig) => {
    for (let pulseIndex = pulses.length - 1; pulseIndex >= 0; pulseIndex--) {
      const pulse = pulses[pulseIndex];
      if (!pulse) continue;
      const radius = ((now - pulse.t0) / 1000) * config.pulseSpeed;
      if (radius > Math.hypot(width, height)) {
        pulses.splice(pulseIndex, 1);
        continue;
      }
      const band = config.cellSize;
      const minColumn = Math.max(
        0,
        Math.floor((pulse.x - radius - band - offsetX) / config.cellSize),
      );
      const maxColumn = Math.min(
        columns - 1,
        Math.floor((pulse.x + radius + band - offsetX) / config.cellSize),
      );
      const minRow = Math.max(
        0,
        Math.floor((pulse.y - radius - band - offsetY) / config.cellSize),
      );
      const maxRow = Math.min(
        rows - 1,
        Math.floor((pulse.y + radius + band - offsetY) / config.cellSize),
      );
      for (let row = minRow; row <= maxRow; row++) {
        for (let column = minColumn; column <= maxColumn; column++) {
          const index = row * columns + column;
          const [centerX, centerY] = cellCenter(index);
          const distance = Math.hypot(centerX - pulse.x, centerY - pulse.y);
          if (
            Math.abs(distance - radius) < band / 2 &&
            config.maxOpacity > (alphas[index] ?? 0)
          ) {
            alphas[index] = config.maxOpacity;
            touched[index] = now;
          }
        }
      }
    }
  };

  const drawCells = (
    now: number,
    delta: number,
    config: CursorGridConfig,
    rgb: number[],
  ) => {
    const [red, green, blue] = rgb;
    let visible = pulses.length > 0;
    const fadeStep = delta / Math.max(config.fadeDuration, 16);
    const half = config.cellSize / 2;
    for (let index = 0; index < alphas.length; index++) {
      let alpha = alphas[index] ?? 0;
      if (alpha <= 0) continue;
      if (now - (touched[index] ?? 0) > config.holdTime) {
        alpha = Math.max(0, alpha - fadeStep);
        alphas[index] = alpha;
        if (alpha <= 0) continue;
      }
      visible = true;
      const [centerX, centerY] = cellCenter(index);
      const gradient = context.createRadialGradient(
        centerX,
        centerY,
        half * 0.1,
        centerX,
        centerY,
        config.cellSize,
      );
      gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${alpha})`);
      gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
      const x = centerX - half + 0.5;
      const y = centerY - half + 0.5;
      const size = config.cellSize - 1;
      context.beginPath();
      if (config.cellRadius > 0) {
        context.roundRect(x, y, size, size, config.cellRadius);
      } else {
        context.rect(x, y, size, size);
      }
      if (config.fillOpacity > 0) {
        context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * config.fillOpacity})`;
        context.fill();
      }
      context.strokeStyle = gradient;
      context.lineWidth = config.lineWidth;
      context.stroke();
    }
    return visible;
  };

  const draw = (now: number) => {
    const config = propsRef.current;
    const delta = Math.min(now - lastFrame, 50);
    lastFrame = now;
    context.clearRect(0, 0, width, height);
    const rgb = hexToRgb(config.color);
    drawGrid(config, rgb);
    animatePulses(now, config);
    if (drawCells(now, delta, config, rgb)) {
      animationFrame = requestAnimationFrame(draw);
    } else {
      running = false;
      if (config.gridOpacity <= 0) context.clearRect(0, 0, width, height);
    }
  };

  const wake = () => {
    if (running) return;
    running = true;
    lastFrame = performance.now();
    animationFrame = requestAnimationFrame(draw);
  };
  wakeRef.current = wake;
  const toLocal = (event: PointerEvent): [number, number] => {
    const rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  };
  const onPointerMove = (event: PointerEvent) => {
    const [x, y] = toLocal(event);
    energize(x, y);
    wake();
  };
  const onPointerDown = (event: PointerEvent) => {
    if (!propsRef.current.clickPulse) return;
    const [x, y] = toLocal(event);
    pulses.push({ t0: performance.now(), x, y });
    wake();
  };
  const resizeObserver = new ResizeObserver(() => {
    rebuild();
    wake();
  });
  resizeObserver.observe(container);
  rebuild();
  wake();
  container.addEventListener("pointermove", onPointerMove);
  container.addEventListener("pointerdown", onPointerDown);

  return () => {
    cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    container.removeEventListener("pointermove", onPointerMove);
    container.removeEventListener("pointerdown", onPointerDown);
    wakeRef.current = null;
  };
}
