import { useEffect, useRef } from "react";
import "./PointillistScene.css";

const palettes = {
  atlas: ["#87c9a8", "#7b9eff", "#f3bb72", "#ee8174", "#c2a5f4", "#d6dc8a"],
  grove: ["#7fc7a2", "#a2d8bd", "#e7c279", "#7c9e88"],
  circuit: ["#84a5ff", "#5dd0bf", "#f29b73", "#c5b1ff"],
  city: ["#f0b877", "#83c8b8", "#9eafff", "#e88d79"],
  books: ["#a9b9ff", "#ed9778", "#87c9a8", "#e5c376"],
  quiet: ["#a1b3c7", "#83b8a5", "#d9b77c", "#9a96cf"]
};

function noise(x, y, seed = 1) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return value - Math.floor(value);
}

function PointillistScene({ variant = "atlas", progress = 0, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !parent || !context) return undefined;

    const palette = palettes[variant] || palettes.atlas;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const dot = (x, y, color, alpha = 0.7, radius = 1.2) => {
      context.globalAlpha = alpha;
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    };

    const dottedLine = (x1, y1, x2, y2, color, step = 6, alpha = 0.7) => {
      const length = Math.hypot(x2 - x1, y2 - y1);
      const count = Math.max(2, Math.floor(length / step));
      for (let index = 0; index <= count; index += 1) {
        const t = index / count;
        dot(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, color, alpha, 1.15);
      }
    };

    const dottedRect = (x, y, rectWidth, rectHeight, color, seed, step = 6) => {
      for (let px = 0; px < rectWidth; px += step) {
        for (let py = 0; py < rectHeight; py += step) {
          if (noise(px, py, seed) > 0.12) {
            dot(x + px, y + py, color, 0.32 + noise(px, py, seed + 4) * 0.55, 1 + noise(px, py, seed + 8) * 0.6);
          }
        }
      }
    };

    const dottedCanopy = (cx, cy, rx, ry, color, seed) => {
      for (let x = -rx; x <= rx; x += 5) {
        for (let y = -ry; y <= ry; y += 5) {
          const inside = (x * x) / (rx * rx) + (y * y) / (ry * ry) < 1;
          if (inside && noise(x, y, seed) > 0.17) {
            const colorIndex = noise(x, y, seed + 3) > 0.72 ? Math.floor(noise(x, y, seed + 5) * palette.length) : -1;
            dot(cx + x, cy + y, colorIndex < 0 ? color : palette[colorIndex], 0.3 + noise(x, y, seed + 9) * 0.6, 1 + noise(x, y, seed + 12) * 0.8);
          }
        }
      }
    };

    const drawWorld = (zone, phase) => {
      const zoneWidth = width / 6;
      const center = zoneWidth * (zone + 0.5);
      const baseline = height * (0.69 + Math.sin(zone * 0.8) * 0.025);
      const color = palette[zone % palette.length];
      const scale = Math.min(1, zoneWidth / 170);

      if (zone === 0) {
        dottedCanopy(center - 24 * scale, baseline - 44 * scale, 35 * scale, 31 * scale, color, zone + 2);
        dottedCanopy(center + 20 * scale, baseline - 55 * scale, 41 * scale, 35 * scale, color, zone + 6);
        dottedRect(center - 3 * scale, baseline - 36 * scale, 6 * scale, 57 * scale, palette[1], zone + 14, 5);
        dottedLine(center - zoneWidth * 0.45, baseline + 2, center + zoneWidth * 0.45, baseline + 2, palette[2], 6, 0.65);
      } else if (zone === 1) {
        const points = [
          [center - 36 * scale, baseline - 45 * scale], [center + 16 * scale, baseline - 45 * scale],
          [center + 16 * scale, baseline - 8 * scale], [center + 40 * scale, baseline - 8 * scale],
          [center - 22 * scale, baseline + 18 * scale], [center - 22 * scale, baseline - 3 * scale]
        ];
        [[0, 1], [1, 2], [2, 3], [4, 5], [5, 0]].forEach(([a, b]) => dottedLine(...points[a], ...points[b], color, 5, 0.75));
        points.forEach(([x, y], index) => dottedCanopy(x, y, 5 * scale, 5 * scale, palette[(index + 1) % palette.length], index + 19));
      } else if (zone === 2) {
        dottedRect(center - 43 * scale, baseline - 54 * scale, 25 * scale, 76 * scale, color, zone + 21, 5);
        dottedRect(center - 12 * scale, baseline - 76 * scale, 31 * scale, 98 * scale, palette[1], zone + 25, 5);
        dottedRect(center + 24 * scale, baseline - 44 * scale, 25 * scale, 66 * scale, palette[2], zone + 28, 5);
      } else if (zone === 3) {
        dottedRect(center - 44 * scale, baseline - 37 * scale, 38 * scale, 38 * scale, color, zone + 30, 5);
        dottedRect(center - 6 * scale, baseline - 63 * scale, 42 * scale, 64 * scale, palette[1], zone + 33, 5);
        dottedRect(center + 16 * scale, baseline - 25 * scale, 35 * scale, 26 * scale, palette[2], zone + 36, 5);
      } else if (zone === 4) {
        for (let offset = -46; offset <= 46; offset += 5) {
          const rise = Math.max(0, 35 - Math.abs(offset) * 0.55) * scale;
          dottedLine(center + offset * scale, baseline - rise, center + offset * scale, baseline + 12 * scale, palette[offset < 0 ? 0 : 1], 6, 0.56);
        }
        dottedLine(center, baseline - 20 * scale, center, baseline + 13 * scale, palette[2], 5, 0.8);
      } else {
        dottedLine(center - 48 * scale, baseline - 17 * scale, center + 48 * scale, baseline - 17 * scale, color, 5, 0.8);
        dottedLine(center - 48 * scale, baseline + 20 * scale, center + 48 * scale, baseline + 20 * scale, palette[1], 5, 0.8);
        for (let spine = -40; spine <= 36; spine += 16) {
          dottedRect(center + spine * scale, baseline - 48 * scale, 11 * scale, 30 * scale, palette[Math.floor(noise(spine, zone, 43) * palette.length)], spine + 45, 5);
        }
      }

      const hillY = baseline + Math.sin(zone * 1.4 + phase * 0.25) * 3;
      for (let x = zoneWidth * zone; x < zoneWidth * (zone + 1); x += 7) {
        const wave = hillY + Math.sin(x * 0.012 + zone) * 8 + Math.sin(x * 0.026 + phase + zone) * 3;
        for (let y = wave; y < height + 3; y += 7) {
          if (noise(x, y, zone + 71) > 0.35) {
            const paletteIndex = Math.floor(noise(x, y, zone + 83) * palette.length);
            dot(x, y, palette[paletteIndex], 0.18 + noise(x, y, phase + 99) * 0.42, 0.8 + noise(x, y, zone + 101) * 0.65);
          }
        }
      }
    };

    const render = () => {
      if (!width || !height) return;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      const phase = 0;

      for (let zone = 0; zone < 6; zone += 1) drawWorld(zone, phase);

      const routeY = height * 0.85;
      const routeOffset = width * Math.max(0, Math.min(1, progress));
      for (let x = 16; x < width - 12; x += 8) {
        const y = routeY + Math.sin(x * 0.014 + phase) * 3;
        const passed = x <= routeOffset;
        dot(x, y, passed ? palette[zoneColor(x, width, palette.length)] : "#ffffff", passed ? 0.8 : 0.32, passed ? 1.8 : 1.1);
      }
      context.globalAlpha = 1;
    };

    const zoneColor = (x, totalWidth, count) => Math.floor((x / totalWidth) * count) % count;

    const resize = () => {
      const bounds = parent.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      render();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);
    resize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [progress, variant]);

  return <canvas ref={canvasRef} className={`pointillist-scene ${className}`} aria-hidden="true" />;
}

export default PointillistScene;
