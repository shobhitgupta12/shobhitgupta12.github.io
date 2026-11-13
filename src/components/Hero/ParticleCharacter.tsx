import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { particleForms } from '../../data/particleForms';

const ParticleCharacter = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const formIndexRef = useRef(1);
  const [currentFormIndex, setCurrentFormIndex] = useState(1);

  // The renderer is created once. Changing form only retargets the particles,
  // instead of tearing down and rebuilding the whole WebGL scene.
  useEffect(() => {
    formIndexRef.current = currentFormIndex;
  }, [currentFormIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    if (width === 0 || height === 0) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 6.5;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
    } catch {
      // WebGL unavailable (old devices, disabled GPU) — fail gracefully.
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const particleCount = particleForms[0].points.length / 3;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleForms[0].points);
    const velocities = new Float32Array(particleCount * 3);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    points.position.x = 0.3;
    scene.add(points);

    // Pointer interaction — desktop only, and throttled through the render loop.
    const mouse = new THREE.Vector2(-1000, -1000);
    const targetMouse = new THREE.Vector2(-1000, -1000);
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    const onPointerMove = (e: PointerEvent) => {
      if (!finePointer.matches) return;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      targetMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerLeave = () => {
      targetMouse.x = -1000;
      targetMouse.y = -1000;
    };

    if (finePointer.matches) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      container.addEventListener('pointerleave', onPointerLeave);
    }

    const mouse3D = new THREE.Vector3();
    const clock = new THREE.Clock();
    let animationFrameId = 0;
    let running = true;
    let visible = true;

    const animate = () => {
      if (!running) return;
      animationFrameId = requestAnimationFrame(animate);
      if (!visible) return;

      mouse.x += (targetMouse.x - mouse.x) * 0.1;
      mouse.y += (targetMouse.y - mouse.y) * 0.1;

      const vFOV = THREE.MathUtils.degToRad(camera.fov);
      const viewHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
      const viewWidth = viewHeight * camera.aspect;

      mouse3D.set(
        mouse.x * viewWidth / 2,
        mouse.y * viewHeight / 2,
        0
      );

      const currentPositions = points.geometry.attributes.position.array as Float32Array;
      const currentTargetPoints = particleForms[formIndexRef.current].points;

      const interactRadius = 1.5;
      const interactRadiusSq = interactRadius * interactRadius;
      const hasPointer = targetMouse.x !== -1000;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;

        const px = currentPositions[idx];
        const py = currentPositions[idx + 1];
        const pz = currentPositions[idx + 2];

        let tx = currentTargetPoints[idx];
        let ty = currentTargetPoints[idx + 1];
        let tz = currentTargetPoints[idx + 2];

        if (hasPointer) {
          const dx = px - mouse3D.x;
          const dy = py - mouse3D.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < interactRadiusSq && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const force = (interactRadius - dist) / interactRadius;
            tx += (dx / dist) * force * 2;
            ty += (dy / dist) * force * 2;
            tz += (Math.random() - 0.5) * force * 2;
          }
        }

        const spring = 0.05;
        const damp = 0.85;

        velocities[idx] = (velocities[idx] + (tx - px) * spring) * damp;
        velocities[idx + 1] = (velocities[idx + 1] + (ty - py) * spring) * damp;
        velocities[idx + 2] = (velocities[idx + 2] + (tz - pz) * spring) * damp;

        velocities[idx] += (Math.random() - 0.5) * 0.01;
        velocities[idx + 1] += (Math.random() - 0.5) * 0.01;

        currentPositions[idx] += velocities[idx];
        currentPositions[idx + 1] += velocities[idx + 1];
        currentPositions[idx + 2] += velocities[idx + 2];
      }

      points.geometry.attributes.position.needsUpdate = true;

      points.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.1;
      points.rotation.x = Math.cos(clock.elapsedTime * 0.3) * 0.05;

      renderer.render(scene, camera);
    };

    // Pause rendering when the hero scrolls away or the tab is hidden.
    const updateRunning = () => {
      const shouldRun = visible && !document.hidden;
      if (shouldRun && !animationFrameId) {
        running = true;
        animate();
      } else if (!shouldRun) {
        running = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateRunning();
    }, { threshold: 0 });

    intersectionObserver.observe(container);
    document.addEventListener('visibilitychange', updateRunning);

    animate();

    // Keep the canvas in sync with its container (orientation change, resize).
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const nextWidth = containerRef.current.clientWidth;
      const nextHeight = containerRef.current.clientHeight;
      if (nextWidth === 0 || nextHeight === 0) return;
      width = nextWidth;
      height = nextHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    return () => {
      running = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', updateRunning);
      window.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0 cursor-crosshair"></div>

      <div className="absolute bottom-4 right-4 md:bottom-12 md:right-12 z-10 font-mono text-tiny text-dim flex flex-wrap items-center justify-end gap-3 md:gap-4 max-w-[calc(100%-2rem)]">
        <span className="hidden sm:inline">CURRENT FORM</span>
        <span className="text-white border-b border-[#27272a] pb-1">{particleForms[currentFormIndex].label}</span>

        <div className="relative group/btn flex items-center">
          <button 
            onClick={() => setCurrentFormIndex((prev) => (prev + 1) % particleForms.length)}
            className="hover:text-accent transition-colors relative z-10 border border-[#27272a] px-3 py-1.5 bg-[#0c0c0c] hover:border-accent"
            onMouseEnter={() => {
              if (!window.sessionStorage.getItem('egg_polyjuice')) {
                window.dispatchEvent(new CustomEvent('easter-egg-found', { detail: { name: 'Polyjuice Potion Egg' } }));
                window.sessionStorage.setItem('egg_polyjuice', 'true');
              }
            }}
          >
            CHANGE
          </button>

          {/* Finger pointer pointing at the button from the right */}
          <span className="hidden md:block absolute -right-8 text-accent animate-pulse group-hover/btn:opacity-0 transition-opacity text-2xl select-none pointer-events-none">
            ☜
          </span>
        </div>
      </div>
    </div>
  );
};

export default ParticleCharacter;
