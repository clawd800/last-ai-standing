import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01";

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let columns: number[] = [];
    const FONT_SIZE = 14;
    const DROP_SPEED = 0.6;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const cols = Math.ceil(canvas.width / FONT_SIZE);
      // preserve existing drops, add new ones for extra columns
      while (columns.length < cols) {
        columns.push(Math.random() * -100);
      }
      columns.length = cols;
    };

    resize();

    const draw = () => {
      // Fade trail
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;

      for (let i = 0; i < columns.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FONT_SIZE;
        const y = columns[i] * FONT_SIZE;

        // Head character (bright)
        ctx.fillStyle = "#00ff41";
        ctx.globalAlpha = 0.9;
        ctx.fillText(char, x, y);

        // Trail characters (dimmer)
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = "#008f11";
        const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(trailChar, x, y - FONT_SIZE);

        ctx.globalAlpha = 1;

        columns[i] += DROP_SPEED;

        // Reset drop randomly when past bottom
        if (y > canvas.height && Math.random() > 0.98) {
          columns[i] = Math.random() * -20;
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.4 }}
    />
  );
}
