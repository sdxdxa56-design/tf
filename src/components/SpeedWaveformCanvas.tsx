import React, { useEffect, useRef } from 'react';

interface SpeedWaveformCanvasProps {
  speedHistory: number[];
  isDownloading: boolean;
}

export const SpeedWaveformCanvas: React.FC<SpeedWaveformCanvasProps> = ({
  speedHistory,
  isDownloading,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      const maxSpeed = Math.max(...speedHistory, 50 * 1024 * 1024); // min scale 50MB/s
      const pointsCount = speedHistory.length;
      if (pointsCount < 2) return;

      const stepX = width / (pointsCount - 1);

      // Create gradient fill
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, 'rgba(255, 79, 0, 0.35)');
      grad.addColorStop(0.5, 'rgba(255, 157, 0, 0.15)');
      grad.addColorStop(1, 'rgba(255, 79, 0, 0.0)');

      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let i = 0; i < pointsCount; i++) {
        const x = i * stepX;
        const normalizedSpeed = Math.min(1.0, speedHistory[i] / maxSpeed);
        const y = height - normalizedSpeed * (height * 0.75);

        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          const prevX = (i - 1) * stepX;
          const prevSpeed = Math.min(1.0, speedHistory[i - 1] / maxSpeed);
          const prevY = height - prevSpeed * (height * 0.75);
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Stroke line
      ctx.beginPath();
      for (let i = 0; i < pointsCount; i++) {
        const x = i * stepX;
        const normalizedSpeed = Math.min(1.0, speedHistory[i] / maxSpeed);
        const y = height - normalizedSpeed * (height * 0.75);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = (i - 1) * stepX;
          const prevSpeed = Math.min(1.0, speedHistory[i - 1] / maxSpeed);
          const prevY = height - prevSpeed * (height * 0.75);
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      }
      ctx.strokeStyle = isDownloading ? '#FF4F00' : '#4ADE80';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#FF4F00';
      ctx.shadowBlur = isDownloading ? 8 : 2;
      ctx.stroke();
    };

    render();
  }, [speedHistory, isDownloading]);

  return <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />;
};
