<script setup lang="ts">
const props = defineProps<{
  letter: string;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const svgRef = ref<SVGSVGElement | null>(null);

const isDrawing = ref(false);
const ctx = ref<CanvasRenderingContext2D | null>(null);

// Scale the brush proportionally to the canvas width so it feels natural
// on both mobile (small) and desktop (large) screens.
const getBrushSize = (canvasWidth: number): number => {
  if (canvasWidth < 400) return 18;       // small phones
  if (canvasWidth < 600) return 24;       // large phones / small tablets
  if (canvasWidth < 900) return 32;       // tablets
  return 40;                              // desktop
};

const initCanvas = () => {
  if (!canvasRef.value || !containerRef.value) return;

  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  canvasRef.value.width = width;
  canvasRef.value.height = height;

  ctx.value = canvasRef.value.getContext("2d", { willReadFrequently: true });
  if (ctx.value) {
    ctx.value.lineCap = "round";
    ctx.value.lineJoin = "round";
    ctx.value.lineWidth = getBrushSize(width);
    ctx.value.strokeStyle = "#28abb9"; // Teal color
  }
};

onMounted(() => {
  initCanvas();
  window.addEventListener("resize", initCanvas);

  // Touch events MUST be registered with { passive: false } so that
  // e.preventDefault() can suppress the browser's native scroll/zoom,
  // which would otherwise steal the gesture before drawing begins.
  const canvas = canvasRef.value;
  if (canvas) {
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);
    canvas.addEventListener("touchcancel", stopDrawing);
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", initCanvas);

  const canvas = canvasRef.value;
  if (canvas) {
    canvas.removeEventListener("touchstart", startDrawing);
    canvas.removeEventListener("touchmove", draw);
    canvas.removeEventListener("touchend", stopDrawing);
    canvas.removeEventListener("touchcancel", stopDrawing);
  }
});

const getCoords = (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
  if (!canvasRef.value) return null;
  const rect = canvasRef.value.getBoundingClientRect();

  if (e instanceof TouchEvent) {
    const touch = e.touches[0] ?? e.changedTouches[0];
    if (!touch) return null;
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  return {
    x: (e as MouseEvent).clientX - rect.left,
    y: (e as MouseEvent).clientY - rect.top,
  };
};

const startDrawing = (e: MouseEvent | TouchEvent) => {
  // Prevent scroll/zoom on touch so the canvas receives the gesture
  if (e instanceof TouchEvent) e.preventDefault();

  isDrawing.value = true;
  if (!ctx.value) return;

  const coords = getCoords(e);
  if (!coords) return;

  ctx.value.beginPath();
  ctx.value.moveTo(coords.x, coords.y);
};

const stopDrawing = () => {
  isDrawing.value = false;
  if (ctx.value) {
    ctx.value.beginPath();
  }
};

const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !ctx.value || !canvasRef.value) return;

  // Prevent scroll/zoom on touch
  if (e instanceof TouchEvent) e.preventDefault();

  const coords = getCoords(e);
  if (!coords) return;

  ctx.value.lineTo(coords.x, coords.y);
  ctx.value.stroke();
  ctx.value.beginPath();
  ctx.value.moveTo(coords.x, coords.y);
};

const clearCanvas = () => {
  if (ctx.value && canvasRef.value) {
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }
};

/**
 * Builds the target reference canvas by serializing the live SVG element.
 * This ensures the target is pixel-identical to what the user sees — no
 * font loading mismatches or baseline math guesswork.
 *
 * The SVG text stroke-width is only 5px (dashed). We clone it, remove the
 * dash, set a filled solid black style with a generous stroke-width to create
 * a hitbox that matches the user's 40px brush size.
 */
const buildTargetCanvas = async (
  width: number,
  height: number,
): Promise<HTMLCanvasElement | null> => {
  if (!svgRef.value) return null;

  // Clone the SVG and mutate its text element into a solid filled target
  const svgClone = svgRef.value.cloneNode(true) as SVGSVGElement;
  svgClone.setAttribute("width", String(width));
  svgClone.setAttribute("height", String(height));

  const textEl = svgClone.querySelector("text");
  if (!textEl) return null;

  // Make it solid black fill + thick stroke for a generous hit zone
  textEl.setAttribute("fill", "black");
  textEl.setAttribute("stroke", "black");
  textEl.setAttribute("stroke-width", "50"); // ≈ brush lineWidth
  textEl.removeAttribute("stroke-dasharray");
  textEl.removeAttribute("stroke-dashoffset");

  const svgString = new XMLSerializer().serializeToString(svgClone);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const targetCanvas = document.createElement("canvas");
      targetCanvas.width = width;
      targetCanvas.height = height;
      const tCtx = targetCanvas.getContext("2d", { willReadFrequently: true });
      if (!tCtx) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }
      tCtx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(targetCanvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
};

const calculateScore = async () => {
  if (!canvasRef.value || !ctx.value)
    return { score: 0, stars: 0, coverage: 0, accuracy: 0 };

  const width = canvasRef.value.width;
  const height = canvasRef.value.height;

  const targetCanvas = await buildTargetCanvas(width, height);
  if (!targetCanvas) return { score: 0, stars: 0, coverage: 0, accuracy: 0 };

  const targetCtx = targetCanvas.getContext("2d", { willReadFrequently: true });
  if (!targetCtx) return { score: 0, stars: 0, coverage: 0, accuracy: 0 };

  const targetData = targetCtx.getImageData(0, 0, width, height).data;
  const userData = ctx.value.getImageData(0, 0, width, height).data;

  let targetPixels = 0;
  let userPixels = 0;
  let overlapPixels = 0;

  // Check alpha channel (every 4th byte: r, g, b, A)
  for (let i = 3; i < targetData.length; i += 4) {
    const isTarget = (targetData[i] ?? 0) > 0;
    const isUser = (userData[i] ?? 0) > 0;

    if (isTarget) targetPixels++;
    if (isUser) userPixels++;
    if (isUser && isTarget) overlapPixels++;
  }

  if (targetPixels === 0 || userPixels === 0)
    return { score: 0, stars: 0, coverage: 0, accuracy: 0 };

  // coverage = how much of the target the user filled (recall)
  // accuracy = how much of the user's drawing lands on the target (precision)
  const coverage = overlapPixels / targetPixels;
  const accuracy = overlapPixels / userPixels;

  // Weighted score: coverage matters more (missing strokes is worse than small overrun)
  // user note: i don't thing so, i think accuracy matters more
  let score = (coverage * 0.4 + accuracy * 0.6) * 100;

  // Penalize if barely anything was drawn
  if (coverage < 0.1) score = 0;

  score = Math.min(Math.round(score), 100);

  let stars = 0;
  if (score >= 85) stars = 5;
  else if (score >= 70) stars = 4;
  else if (score >= 55) stars = 3;
  else if (score >= 35) stars = 2;
  else stars = 1;

  return {
    score,
    stars,
    coverage: Math.round(coverage * 100),
    accuracy: Math.round(accuracy * 100),
  };
};

defineExpose({ clearCanvas, calculateScore });
</script>

<template>
  <div
    class="relative w-full h-full min-h-[500px] bg-white rounded-3xl flex items-center justify-center shadow-lg border-2 border-gray-100 overflow-hidden"
    ref="containerRef"
  >
    <!-- Dashed Letter Background — captured by calculateScore via svgRef -->
    <svg
      ref="svgRef"
      class="absolute inset-0 w-full h-full pointer-events-none select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="50%"
        y="50%"
        dominant-baseline="central"
        text-anchor="middle"
        font-family="Quicksand, Nunito, 'Comic Sans MS', sans-serif"
        font-weight="900"
        font-size="min(45vw, 400px)"
        fill="transparent"
        stroke="#333333"
        stroke-width="5"
        stroke-dasharray="15,15"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        {{ letter.toUpperCase() }} {{ letter.toLowerCase() }}
      </text>
    </svg>

    <!-- Drawing Canvas -->
    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full cursor-crosshair touch-none"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
    ></canvas>
  </div>
</template>
