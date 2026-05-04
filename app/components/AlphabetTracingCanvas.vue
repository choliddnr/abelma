<script setup lang="ts">
const props = withDefaults(defineProps<{
  letter: string;
  showPicker?: boolean;
  mode?: 'both' | 'single';
  color?: string;
}>(), {
  showPicker: true,
  mode: 'both',
  color: '#28abb9'
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const svgRef = ref<SVGSVGElement | null>(null);

const isDrawing = ref(false);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const isVertical = ref(false);
const brushColor = ref(props.color);

watch(() => props.color, (newVal) => {
  if (newVal) brushColor.value = newVal;
});
const colors = [
  "#28abb9", // Teal
  "#e74c3c", // Red
  "#3498db", // Blue
  "#f1c40f", // Yellow
  "#2ecc71", // Green
  "#9b59b6", // Purple
  "#e67e22", // Orange
  "#333333", // Dark Gray
];

const encodedBrushColor = computed(() => encodeURIComponent(brushColor.value));
const cursorStyle = computed(() => {
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32' fill='none' stroke='${encodedBrushColor.value}' stroke-width='2'%3E%3Cpath d='M16 4v24M4 16h24'/%3E%3Ccircle cx='16' cy='16' r='3' fill='${encodedBrushColor.value}'/%3E%3C/svg%3E") 16 16, crosshair`;
});

// Scale the brush proportionally to the canvas width so it feels natural
// on both mobile (small) and desktop (large) screens.
const getBrushSize = (canvasWidth: number): number => {
  if (canvasWidth < 400) return 20; // small phones
  if (canvasWidth < 600) return 25; // large phones / small tablets
  if (canvasWidth < 900) return 30; // tablets
  return 35; // desktop
};

watch(
  () => containerRef,
  () => {
    console.log(containerRef.value!.clientWidth);
  },
);

const initCanvas = () => {
  if (!canvasRef.value || !containerRef.value) return;

  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  console.log(width, height);
  // Set vertical mode if height is significantly greater than width (portrait)
  // or if width is very small (small mobile)
  isVertical.value = width < 500 && height > width * 1.2;

  canvasRef.value.width = width;
  canvasRef.value.height = height;

  ctx.value = canvasRef.value.getContext("2d", { willReadFrequently: true });
  if (ctx.value) {
    ctx.value.lineCap = "round";
    ctx.value.lineJoin = "round";
    ctx.value.lineWidth = getBrushSize(width);
    ctx.value.strokeStyle = brushColor.value;
  }

  // DEBUG: generate the target canvas immediately so it's visible while drawing
  setTimeout(() => {
    buildTargetCanvas(width, height);
  }, 100);
};

watch(brushColor, (newColor) => {
  if (ctx.value) {
    ctx.value.strokeStyle = newColor;
  }
});

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

const getCoords = (
  e: MouseEvent | TouchEvent,
): { x: number; y: number } | null => {
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

const emit = defineEmits(["interaction"]);

const startDrawing = (e: MouseEvent | TouchEvent) => {
  // Prevent scroll/zoom on touch so the canvas receives the gesture
  if (e instanceof TouchEvent) e.preventDefault();

  isDrawing.value = true;
  emit("interaction");
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

  emit("interaction");
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

  const targetCanvas = document.createElement("canvas");
  targetCanvas.width = width;
  targetCanvas.height = height;
  const tCtx = targetCanvas.getContext("2d", { willReadFrequently: true });
  if (!tCtx) return null;

  const textEls = svgRef.value.querySelectorAll("text");
  if (textEls.length === 0) return null;

  textEls.forEach((textEl) => {
    const style = window.getComputedStyle(textEl);
    const fontSize = style.fontSize;
    const fontFamily = style.fontFamily;
    const fontWeight = style.fontWeight;

    // Set font styles exactly as they appear in the DOM
    tCtx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
    tCtx.textAlign = "center";
    tCtx.textBaseline = "middle";

    // Convert percentage attributes to pixel coordinates
    const xAttr = textEl.getAttribute("x") || "50%";
    const yAttr = textEl.getAttribute("y") || "50%";
    const x = xAttr.endsWith("%")
      ? (parseFloat(xAttr) / 100) * width
      : parseFloat(xAttr);
    const y = yAttr.endsWith("%")
      ? (parseFloat(yAttr) / 100) * height
      : parseFloat(yAttr);

    const text = textEl.textContent || "";

    // For debugging/hit-testing, we draw the shape solid
    // Note: using 5px stroke to match the visible outline requested by user
    tCtx.strokeStyle = "rgba(200, 200, 200, .1)";
    tCtx.fillStyle = "rgba(200, 200, 200, .1)";
    tCtx.lineWidth = 5;
    tCtx.lineCap = "round";
    tCtx.lineJoin = "round";

    // if() isVertical ? 18 : 22;
    tCtx.strokeText(text, x, y + (width < 500 ? 18 : width < 900 ? 24 : 30));
    tCtx.fillText(text, x, y + (width < 500 ? 18 : width < 900 ? 24 : 30));
  });

  // DEBUG: Append targetCanvas to the container so you can see it
  targetCanvas.id = "debug-target-canvas";
  targetCanvas.className = "absolute inset-0 pointer-events-none z-50";
  const existing = containerRef.value?.querySelector("#debug-target-canvas");
  if (existing) existing.remove();
  containerRef.value?.appendChild(targetCanvas);

  return targetCanvas;
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
  // coverage = how much of the target the user filled (recall)
  // accuracy = how much of the user's drawing lands on the target (precision)
  const coverage = overlapPixels / targetPixels;
  const accuracy = overlapPixels / userPixels;

  console.log(
    "overlapPixels",
    overlapPixels,
    "userPixels",
    userPixels,
    coverage,
    accuracy,
  );

  if (targetPixels === 0 || userPixels === 0)
    return { score: 0, stars: 0, coverage: 0, accuracy: 0, isScrambled: false };

  // if user drew too much outside the target
  if (userPixels - overlapPixels > targetPixels * 0.5) {
    return { score: 0, stars: 0, coverage: 0, accuracy: 0, isScrambled: true };
  }

  if (coverage < 0.5) {
    return { score: 0, stars: 0, coverage: 0, accuracy: 0, isScrambled: false };
  }

  // Weighted score: coverage matters more (missing strokes is worse than small overrun)
  // user note: i don't thing so, i think accuracy matters more
  let score = (coverage * 0.4 + accuracy * 0.6) * 100;

  // Penalize if barely anything was drawn
  if (coverage < 0.1) score = 0;

  score = Math.min(Math.round(score), 100);

  let stars = 0;
  if (score >= 90) stars = 5;
  else if (score >= 85) stars = 4;
  else if (score >= 80) stars = 3;
  else if (score >= 75) stars = 2;
  else stars = 1;

  return {
    score,
    stars,
    coverage: Math.round(coverage * 100),
    accuracy: Math.round(accuracy * 100),
    isScrambled: false,
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
      <template v-if="!isVertical">
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
          {{ mode === 'single' ? letter : `${letter.toUpperCase()} ${letter.toLowerCase()}` }}
        </text>
      </template>
      <template v-else>
        <!-- Uppercase on Top -->
        <text
          x="50%"
          y="30%"
          dominant-baseline="central"
          text-anchor="middle"
          font-family="Quicksand, Nunito, 'Comic Sans MS', sans-serif"
          font-weight="900"
          font-size="min(60vw, 220px)"
          fill="transparent"
          stroke="#333333"
          stroke-width="5"
          stroke-dasharray="15,15"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          {{ letter.toUpperCase() }}
        </text>
        <!-- Lowercase on Bottom -->
        <text
          x="50%"
          y="70%"
          dominant-baseline="central"
          text-anchor="middle"
          font-family="Quicksand, Nunito, 'Comic Sans MS', sans-serif"
          font-weight="900"
          font-size="min(60vw, 220px)"
          fill="transparent"
          stroke="#333333"
          stroke-width="5"
          stroke-dasharray="15,15"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          {{ letter.toLowerCase() }}
        </text>
      </template>
    </svg>

    <!-- Drawing Canvas -->
    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full touch-none"
      :style="{ cursor: cursorStyle }"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
    ></canvas>

    <!-- Color Picker Overlay -->
    <div
      v-if="showPicker"
      class="absolute top-4 right-4 flex flex-col gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 z-50 transform transition-all duration-300 hover:scale-105"
    >
      <div class="flex flex-col gap-2">
        <div
          v-for="color in colors"
          :key="color"
          @click="brushColor = color"
          class="w-8 h-8 rounded-full cursor-pointer border-2 transition-all duration-200 hover:scale-110 active:scale-95"
          :class="
            brushColor === color ? 'border-gray-800 scale-110' : 'border-white'
          "
          :style="{ backgroundColor: color }"
        ></div>
        <div
          class="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white hover:scale-110 transition-transform"
        >
          <input
            type="color"
            v-model="brushColor"
            class="absolute inset-0 w-full h-full cursor-pointer scale-150 border-none p-0"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* Custom animations or extra styles if needed */
</style>
