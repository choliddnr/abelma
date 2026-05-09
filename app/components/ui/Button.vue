<script setup lang="ts">
interface Props {
  label?: string;
  icon?: string;
  iconPosition?: "left" | "right";
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "danger"
    | "success"
    | "white"
    | "ghost"
    | "soft"
    | "glass"
    | "none";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  to?: string | object;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  class?: any;
  iconClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  iconPosition: "left",
  variant: "primary",
  size: "md",
  type: "button",
  class: "",
});

const variantClasses = {
  // Primary: Sky Blue with a darker blue bottom border for a 3D effect
  primary:
    "bg-primary border-b-4 border-primary-active hover:bg-primary-hover active:border-b-0 active:translate-y-[2px] text-white font-bold rounded-2xl transition-all",

  // Secondary: Kelly Green with a tactile bottom border
  secondary:
    "bg-secondary border-b-4 border-secondary-active hover:bg-secondary-hover active:border-b-0 active:translate-y-[2px] text-white font-bold rounded-2xl transition-all",

  // Accent: Sunny Yellow with high-contrast dark text for readability
  accent:
    "bg-accent border-b-4 border-accent-active hover:bg-accent-hover active:border-b-0 active:translate-y-[2px] text-[#1A2B3C] font-bold rounded-2xl transition-all",

  // Danger: Standard Red for "Stop" or "Delete" actions
  danger:
    "bg-danger border-b-4 border-danger-active hover:bg-danger-hover active:border-b-0 active:translate-y-[2px] text-white font-bold rounded-2xl transition-all",

  // Success: Reusing the successful Green tones for positive reinforcement
  success:
    "bg-success border-b-4 border-success-active hover:bg-success-hover active:border-b-0 active:translate-y-[2px] text-white font-bold rounded-2xl transition-all",

  // Soft: A gentle, light-colored button for less important actions
  soft: "bg-soft border-2 border-soft-active hover:bg-soft-hover text-[#1A2B3C] font-medium rounded-2xl transition-colors",

  // White: Clean card-style button
  white:
    "bg-white border-2 border-soft-active hover:border-primary text-[#1A2B3C] font-medium rounded-2xl shadow-sm transition-all",

  // Ghost: Transparent background for subtle navigation
  ghost:
    "bg-transparent hover:bg-ghost-hover/20 border-none active:bg-ghost-active/20 text-[#1A2B3C] font-medium rounded-2xl transition-colors shadow-none",

  // Glass: Frosted look for overlays or high-end UI elements
  glass:
    "bg-glass backdrop-blur-md border border-white/40 hover:bg-glass-hover text-[#1A2B3C] font-semibold rounded-2xl shadow-lg transition-all",

  none: "",
};

const sizeClasses = {
  xs: "px-2.5 py-1 text-xs gap-1.5 border-b-2 rounded-lg",
  sm: "px-4 py-2 text-sm gap-2 border-b-4 rounded-xl",
  md: "px-6 py-3 text-base gap-3 border-b-6 rounded-xl",
  lg: "px-8 py-4 text-xl gap-4 border-b-8 rounded-2xl",
  xl: "px-10 py-5 text-2xl gap-5 border-b-10 rounded-2xl",
};

const iconSizeClasses = {
  xs: "text-base",
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-5xl",
};

const baseClass = props.variant === "none" ? "" : "ui-capsule-interactive";
const componentClass = computed(() =>
  [
    baseClass,
    sizeClasses[props.size],
    variantClasses[props.variant] || variantClasses.primary,
    props.disabled || props.loading ? "opacity-50 pointer-events-none" : "",
    props.class,
  ]
    .filter(Boolean)
    .join(" "),
);

const componentType = computed(() =>
  props.to ? defineNuxtLink({}) : "button",
);
</script>

<template>
  <component
    :is="componentType"
    :to="to"
    :type="!to ? type : undefined"
    :disabled="disabled || loading"
    :class="componentClass"
  >
    <div v-if="loading" class="animate-spin mr-2">
      <span class="text-xl">⌛</span>
    </div>

    <template v-else>
      <slot name="prefix"> </slot>
      <Icon
        v-if="icon && iconPosition === 'left'"
        :name="icon"
        :class="[iconSizeClasses[size], iconClass]"
      />

      <slot>
        <span v-if="label" class="font-black tracking-wide">{{ label }}</span>
      </slot>

      <Icon
        v-if="icon && iconPosition === 'right'"
        :name="icon"
        :class="[iconSizeClasses[size], iconClass]"
      />
    </template>
  </component>
</template>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
