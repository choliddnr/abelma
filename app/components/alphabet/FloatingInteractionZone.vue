<script setup lang="ts">
const props = defineProps<{
  target: string;
  options: string[]; // Options Array
}>();

const emit = defineEmits<{
  success: [];
  fail: [];
}>();

const shuffled = ref<
  { letter: string; top: string; left: string; color: string; id: number }[]
>([]);

const randomColors = [
  "#ef4444", // red-500
  "#3b82f6", // blue-500
  "#22c55e", // green-500
  "#eab308", // yellow-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
];

let nextId = 0;

const shuffleOptions = () => {
  const arr = [...props.options];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }

  const zones = [
    { leftMin: 15, leftMax: 35, topMin: 15, topMax: 35 }, // Top-Left
    { leftMin: 60, leftMax: 80, topMin: 15, topMax: 35 }, // Top-Right
    { leftMin: 15, leftMax: 35, topMin: 55, topMax: 90 }, // Bottom-Left
    { leftMin: 60, leftMax: 80, topMin: 55, topMax: 90 }, // Bottom-Right
  ];

  const shuffledZones = [...zones];
  for (let i = shuffledZones.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledZones[i], shuffledZones[j]] = [
      shuffledZones[j]!,
      shuffledZones[i]!,
    ];
  }

  shuffled.value = arr.map((letter, index) => {
    const zone = shuffledZones[index % shuffledZones.length]!;

    const leftVal =
      zone.leftMin + Math.random() * (zone.leftMax - zone.leftMin);
    const topVal = zone.topMin + Math.random() * (zone.topMax - zone.topMin);

    const top = `${topVal}%`;
    const left = `${leftVal}%`;

    const color =
      randomColors[Math.floor(Math.random() * randomColors.length)]!;
    return { letter, top, left, color, id: ++nextId };
  });
};

watch(() => [props.target, props.options], shuffleOptions, { immediate: true });

const wrongLetterId = ref<number | null>(null);
const isLocked = ref(false);

const handleClick = (item: { letter: string; id: number }) => {
  if (isLocked.value) return;

  if (item.letter === props.target) {
    isLocked.value = true;
    emit("success");
  } else {
    wrongLetterId.value = item.id;
    emit("fail");
    setTimeout(() => {
      wrongLetterId.value = null;
      shuffleOptions();
    }, 700);
  }
};

const reset = () => {
  isLocked.value = false;
  wrongLetterId.value = null;
  shuffleOptions();
};

defineExpose({ reset });
</script>

<template>
  <div class="absolute inset-0 pointer-events-none z-20 overflow-hidden">
    <button
      v-for="item in shuffled"
      :key="item.id"
      class="font-quicksand absolute flex items-center justify-center font-black transition-transform cursor-pointer select-none floating-letter drop-shadow-2xl pointer-events-auto"
      :class="{
        'shake-it': wrongLetterId === item.id,
        'hover:scale-110 active:scale-95':
          wrongLetterId !== item.id && !isLocked,
      }"
      :style="{
        top: item.top,
        left: item.left,
        color: item.color,
        fontSize: 'clamp(5rem, 15vw + 1rem, 12rem)',
        transform: 'translate(-50%, -50%)',
      }"
      @click.stop="handleClick(item)"
    >
      {{ item.letter }}
    </button>
  </div>
</template>

<style scoped>
.floating-letter {
  -webkit-text-stroke: clamp(6px, 1.5vw + 1px, 10px) white;
  paint-order: stroke fill;
  line-height: 1;
}

.shake-it {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate(-50%, -50%) translate3d(-2px, 0, 0);
  }
  20%,
  80% {
    transform: translate(-50%, -50%) translate3d(4px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate(-50%, -50%) translate3d(-6px, 0, 0);
  }
  40%,
  60% {
    transform: translate(-50%, -50%) translate3d(6px, 0, 0);
  }
}
</style>
