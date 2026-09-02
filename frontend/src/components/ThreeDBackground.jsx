import React, { useEffect, useRef } from "react";

export default function ThreeDBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Floating 3D particles in cream/terracotta/indigo tones
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 800 + 200, // 3D depth distance
      size: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      vRotX: (Math.random() - 0.5) * 0.01,
      vRotY: (Math.random() - 0.5) * 0.01,
      color: Math.random() > 0.6 ? "rgba(212, 98, 59, 0.16)" : "rgba(27, 20, 100, 0.08)",
    }));

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX - width / 2) * 0.04;
      mouseY = (e.clientY - height / 2) * 0.04;
    };
    window.addEventListener("mousemove", onMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotX += p.vRotX;
        p.rotY += p.vRotY;

        // Wrap around bounds
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Project 3D to 2D
        const fov = 400;
        const scale = fov / (fov + p.z);
        const projX = (p.x - width / 2 + mouseX) * scale + width / 2;
        const projY = (p.y - height / 2 + mouseY) * scale + height / 2;
        const radius = Math.max(1, p.size * scale * 2.2);

        // Draw soft 3D floating particle
        ctx.beginPath();
        ctx.arc(projX, projY, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Subtle 3D halo ring for depth
        ctx.beginPath();
        ctx.arc(projX, projY, radius * 1.8, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(235, 227, 213, 0.35)";
        ctx.lineWidth = 0.75;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-80"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}
