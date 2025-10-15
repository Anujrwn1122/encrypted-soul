"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

type Props = {
  width: number;
  height: number;
  text: string;
  userHandle: string;
  signature: string;
  watermark: string;
  footnote: string;
  onStart?: () => void;
  onDone?: () => void;
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * lineHeight));
}

function hexGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const size = 22;
  const hexHeight = Math.sqrt(3) * size;
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.lineWidth = 1;
  for (let y = -hexHeight; y < h + hexHeight; y += hexHeight) {
    for (let x = -size; x < w + size; x += size * 1.5) {
      const offsetX = ((y / hexHeight) % 2) * (size * 0.75);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = x + offsetX + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(255,213,79,0.35)";
      ctx.stroke();
    }
  }
  ctx.restore();
}

function scanlines(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      data[idx] *= 0.9;
      data[idx + 1] *= 0.9;
      data[idx + 2] *= 0.9;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function noise(ctx: CanvasRenderingContext2D, w: number, h: number, alpha = 22) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() * alpha) | 0;
    data[i] += n; data[i + 1] += n; data[i + 2] += n;
  }
  ctx.putImageData(imgData, 0, 0);
}

function glitchSlices(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const slices = 12;
  for (let i = 0; i < slices; i++) {
    const sliceH = Math.max(8, (Math.random() * h) / 16);
    const y = Math.random() * (h - sliceH);
    const shift = (Math.random() - 0.5) * (w * 0.06);
    const img = ctx.getImageData(0, y, w, sliceH);
    ctx.putImageData(img, shift, y);
  }
}

const EncryptedCanvas = forwardRef<HTMLCanvasElement, Props>(
  ({ width, height, text, userHandle, signature, watermark, footnote, onStart, onDone }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

    useEffect(() => {
      if (!canvasRef.current) return;
      const c = canvasRef.current;
      const ctx = c.getContext("2d");
      if (!ctx) return;

      onStart?.();

      const ratio = window.devicePixelRatio || 1;
      c.width = width * ratio;
      c.height = height * ratio;
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;
      ctx.scale(ratio, ratio);

      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, "#07070a");
      g.addColorStop(1, "#141419");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      const rg = ctx.createRadialGradient(width * 0.5, height * 0.2, 50, width * 0.5, height * 0.2, width * 0.8);
      rg.addColorStop(0, "rgba(255,213,79,0.18)");
      rg.addColorStop(1, "rgba(255,213,79,0)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.2, width * 0.9, 0, Math.PI * 2);
      ctx.fill();

      hexGrid(ctx, width, height);

      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#FFD54F";
      const bandY = height * 0.3;
      ctx.fillRect(0, bandY - 8, width, 16);
      ctx.restore();

      const padding = 80;
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 54px Inter, system-ui, sans-serif";
      ctx.textBaseline = "top";
      wrapText(ctx, text, padding, bandY + 24, width - padding * 2, 62);

      ctx.fillStyle = "rgba(255,213,79,0.9)";
      ctx.font = "600 24px Inter, system-ui, sans-serif";
      ctx.fillText(`Encrypted Thought of ${userHandle}`, padding, padding);

      ctx.textAlign = "center";
      ctx.font = "600 18px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(watermark, width / 2, height - 46);

      ctx.textAlign = "left";
      ctx.font = "500 16px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(footnote, padding, height - 44);

      ctx.textAlign = "right";
      ctx.font = "600 20px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#FFD54F";
      ctx.fillText(`Created by ${signature}`, width - padding, height - 48);

      ctx.save();
      ctx.globalAlpha = 0.12;
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const w2 = 2 + Math.random() * 8;
        const h2 = 12 + Math.random() * 40;
        ctx.fillStyle = i % 2 ? "#FFD54F" : "#ffffff";
        ctx.fillRect(x, y, w2, h2);
      }
      ctx.restore();

      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const n = (Math.random() * 16) | 0;
        data[i] += n; data[i + 1] += n; data[i + 2] += n;
      }
      ctx.putImageData(imgData, 0, 0);

      const imgData2 = ctx.getImageData(0, 0, width, height);
      const d2 = imgData2.data;
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          d2[idx] *= 0.9; d2[idx+1] *= 0.9; d2[idx+2] *= 0.9;
        }
      }
      ctx.putImageData(imgData2, 0, 0);

      const slices = 12;
      for (let i = 0; i < slices; i++) {
        const sliceH = Math.max(8, (Math.random() * height) / 16);
        const y = Math.random() * (height - sliceH);
        const shift = (Math.random() - 0.5) * (width * 0.06);
        const img = ctx.getImageData(0, y, width, sliceH);
        ctx.putImageData(img, shift, y);
      }

      onDone?.();
    }, [width, height, text, userHandle, signature, watermark, footnote, onStart, onDone]);

    return (
      <div className="w-full">
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-white/10"
          aria-label="Encrypted artwork canvas"
        />
      </div>
    );
  }
);

EncryptedCanvas.displayName = "EncryptedCanvas";
export default EncryptedCanvas;
