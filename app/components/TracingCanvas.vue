<script setup lang="ts">
const props = defineProps<{
  letter: string;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

const isDrawing = ref(false);
const ctx = ref<CanvasRenderingContext2D | null>(null);

const initCanvas = () => {
  if (!canvasRef.value || !containerRef.value) return;

  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  canvasRef.value.width = width;
  canvasRef.value.height = height;

  ctx.value = canvasRef.value.getContext("2d");
  if (ctx.value) {
    ctx.value.lineCap = "round";
    ctx.value.lineJoin = "round";
    ctx.value.lineWidth = 40; // Thick brush for kids
    ctx.value.strokeStyle = "#28abb9"; // Teal color resembling the image
  }
};

onMounted(() => {
  initCanvas();
  window.addEventListener("resize", initCanvas);
});

onUnmounted(() => {
  window.removeEventListener("resize", initCanvas);
});

const startDrawing = (e: MouseEvent | TouchEvent) => {
  isDrawing.value = true;
  // Reset path on start so we don't connect to previous disjointed points
  if (ctx.value) {
    ctx.value.beginPath();
  }
  draw(e);
};

const stopDrawing = () => {
  isDrawing.value = false;
  if (ctx.value) {
    ctx.value.beginPath();
  }
};

const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !ctx.value || !canvasRef.value) return;

  // Only call preventDefault if it's a touch event to prevent scrolling
  if (e.type.startsWith("touch")) {
    e.preventDefault();
  }

  const rect = canvasRef.value.getBoundingClientRect();
  let clientX, clientY;

  if ("touches" in window && e instanceof TouchEvent) {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      if (touch) {
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        return;
      }
    } else {
      return;
    }
  } else if (e instanceof MouseEvent) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else {
    return;
  }

  const x = clientX - rect.left;
  const y = clientY - rect.top;

  ctx.value.lineTo(x, y);
  ctx.value.stroke();
  ctx.value.beginPath();
  ctx.value.moveTo(x, y);
};

const clearCanvas = () => {
  if (ctx.value && canvasRef.value) {
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }
};

const calculateScore = () => {
  if (!canvasRef.value || !ctx.value) return { score: 0, stars: 0, coverage: 0, accuracy: 0 };

  const width = canvasRef.value.width;
  const height = canvasRef.value.height;

  // 1. Create target canvas
  const targetCanvas = document.createElement("canvas");
  targetCanvas.width = width;
  targetCanvas.height = height;
  const targetCtx = targetCanvas.getContext("2d");
  if (!targetCtx) return { score: 0, stars: 0, coverage: 0, accuracy: 0 };

  // Font size logic matching SVG
  const vw = window.innerWidth;
  const fontSize = Math.min(vw * 0.45, 400);

  targetCtx.font = `900 ${fontSize}px Quicksand, Nunito, 'Comic Sans MS', sans-serif`;
  targetCtx.textAlign = "center";
  targetCtx.textBaseline = "middle"; // using middle as close approx to central
  targetCtx.lineJoin = "round";
  targetCtx.lineCap = "round";

  // Thick hitbox
  targetCtx.lineWidth = 90;
  targetCtx.strokeStyle = "black";
  const text = `${props.letter.toUpperCase()} ${props.letter.toLowerCase()}`;
  targetCtx.strokeText(text, width / 2, height / 2);

  // 2. Get image data
  const targetData = targetCtx.getImageData(0, 0, width, height).data;
  const userData = ctx.value.getImageData(0, 0, width, height).data;

  let targetPixels = 0;
  let userPixels = 0;
  let overlapPixels = 0;

  // We check alpha channel (every 4th byte: r, g, b, A)
  for (let i = 3; i < targetData.length; i += 4) {
    const targetAlpha = targetData[i];
    const userAlpha = userData[i];
    const isTarget = targetAlpha !== undefined && targetAlpha > 0;
    const isUser = userAlpha !== undefined && userAlpha > 0;

    if (isTarget) targetPixels++;
    if (isUser) userPixels++;
    if (isUser && isTarget) overlapPixels++;
  }

  // Safety checks
  if (targetPixels === 0 || userPixels === 0)
    return { score: 0, stars: 0, coverage: 0, accuracy: 0 };

  const coverage = overlapPixels / targetPixels;
  const accuracy = overlapPixels / userPixels;

  let score = (coverage * 0.7 + accuracy * 0.3) * 100;

  // Heavily penalize if they just drew a dot
  if (coverage < 0.15) score = 0;

  score = Math.min(Math.round(score), 100);

  let stars = 0;
  if (score >= 90) stars = 5;
  else if (score >= 80) stars = 4;
  else if (score >= 70) stars = 3;
  else if (score >= 50) stars = 2;
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
    <!-- Dashed Letter Background -->
    <svg
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
      @touchstart="startDrawing"
      @touchmove="draw"
      @touchend="stopDrawing"
    ></canvas>
  </div>
</template>
