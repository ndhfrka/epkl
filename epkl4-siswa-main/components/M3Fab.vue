<template>
  <component
    :is="to ? 'nuxt-link' : 'button'"
    v-bind="componentAttrs"
    :class="[
      'm3-fab',
      `m3-fab--${size}`,
      `m3-fab--${variant}`,
      { 'm3-fab--extended': !!label },
      { 'm3-fab--mobile-only': mobileOnly },
      extraClass
    ]"
    :style="fabStyle"
    :type="to ? undefined : buttonType"
  >
    <i v-if="icon" :class="`bi ${icon}`" class="m3-fab__icon"></i>
    <span v-if="label" class="m3-fab__label">{{ label }}</span>
  </component>
</template>

<script setup>
const props = defineProps({
  to: { type: [String, Object], default: '' },
  href: { type: String, default: '' },
  icon: { type: String, default: 'bi-plus-lg' },
  label: { type: String, default: '' },
  size: { type: String, default: 'regular', validator: (v) => ['small', 'regular', 'large'].includes(v) },
  variant: { type: String, default: 'primary', validator: (v) => ['primary', 'secondary', 'tertiary', 'surface'].includes(v) },
  position: { type: String, default: 'br', validator: (v) => ['none', 'br', 'bl', 'tr', 'tl'].includes(v) },
  offsetY: { type: Number, default: 16 },
  offsetX: { type: Number, default: 16 },
  navBarSafe: { type: Boolean, default: true },
  mobileOnly: { type: Boolean, default: true },
  buttonType: { type: String, default: 'button' },
  extraClass: { type: [String, Array], default: '' },
})

const emit = defineEmits(['click'])

const componentAttrs = computed(() => {
  const attrs = {}
  if (props.to) attrs.to = props.to
  else if (props.href) { attrs.href = props.href; attrs.target = '_blank'; attrs.rel = 'noopener' }
  return attrs
})

const fabStyle = computed(() => {
  if (props.position === 'none') return {}
  const navOffset = props.navBarSafe ? 'calc(var(--m3-nav-bar-height, 80px) + var(--m3-safe-bottom, 0px))' : '0px'
  const x = `${props.offsetX}px`
  const y = `calc(${props.offsetY}px + ${navOffset})`
  const pos = { position: 'fixed', zIndex: 1030 }
  if (props.position === 'br') { pos.right = `calc(${x} + var(--m3-safe-right, 0px))`; pos.bottom = y }
  if (props.position === 'bl') { pos.left = `calc(${x} + var(--m3-safe-left, 0px))`; pos.bottom = y }
  if (props.position === 'tr') { pos.right = `calc(${x} + var(--m3-safe-right, 0px))`; pos.top = `calc(${y} + var(--m3-safe-top, 0px))` }
  if (props.position === 'tl') { pos.left = `calc(${x} + var(--m3-safe-left, 0px))`; pos.top = `calc(${y} + var(--m3-safe-top, 0px))` }
  return pos
})
</script>

<style scoped>
.m3-fab {
  --fab-bg: var(--md-sys-color-primary-container);
  --fab-fg: var(--md-sys-color-on-primary-container);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-decoration: none !important;
  font: var(--md-sys-typescale-label-large-font);
  letter-spacing: 0.1px;
  background-color: var(--fab-bg);
  color: var(--fab-fg);
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
  box-shadow: var(--m3-elevation-level-3);
  user-select: none;
}
.m3-fab::before {
  content: '';
  position: absolute;
  inset: 0;
  background: currentColor;
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
  z-index: 0;
}
.m3-fab > * { position: relative; z-index: 1; }
.m3-fab:hover { box-shadow: var(--m3-elevation-level-4); filter: brightness(1.05); color: var(--fab-fg); text-decoration: none; }
.m3-fab:hover::before { opacity: 0.08; }
.m3-fab:focus-visible { outline: none; box-shadow: var(--m3-elevation-level-4), 0 0 0 3px rgba(96, 165, 250, 0.45); }
.m3-fab:focus-visible::before { opacity: 0.12; }
.m3-fab:active { transform: scale(0.97); box-shadow: var(--m3-elevation-level-2); }
.m3-fab:active::before { opacity: 0.10; }

/* Variants */
.m3-fab--primary   { --fab-bg: var(--md-sys-color-primary-container); --fab-fg: var(--md-sys-color-on-primary-container); }
.m3-fab--secondary { --fab-bg: var(--md-sys-color-secondary-container); --fab-fg: var(--md-sys-color-on-secondary-container); }
.m3-fab--tertiary  { --fab-bg: var(--md-sys-color-tertiary-container); --fab-fg: var(--md-sys-color-on-tertiary-container); }
.m3-fab--surface   { --fab-bg: var(--md-sys-color-surface-container-high); --fab-fg: var(--md-sys-color-primary); }

/* Sizes */
.m3-fab--small   { width: 40px;  height: 40px;  border-radius: 12px; }
.m3-fab--regular { width: 56px;  height: 56px;  border-radius: 16px; }
.m3-fab--large   { width: 96px;  height: 96px;  border-radius: 28px; }
.m3-fab--small   .m3-fab__icon { font-size: 20px; }
.m3-fab--regular .m3-fab__icon { font-size: 24px; }
.m3-fab--large   .m3-fab__icon { font-size: 36px; }

/* Extended mode (with label) — widen auto */
.m3-fab--extended.m3-fab--small   { width: auto; min-width: 48px; padding: 0 16px 0 12px; height: 40px; }
.m3-fab--extended.m3-fab--regular { width: auto; min-width: 80px; padding: 0 20px 0 16px; height: 56px; }
.m3-fab--extended.m3-fab--large   { width: auto; padding: 0 32px 0 28px; height: 96px; }

.m3-fab__label { font: var(--md-sys-typescale-label-large-font); }

/* Display control */
@media (min-width: 992px) {
  .m3-fab--mobile-only { display: none !important; }
}
@media (max-width: 420px) {
  .m3-fab--regular { width: 52px; height: 52px; border-radius: 14px; }
  .m3-fab--regular .m3-fab__icon { font-size: 22px; }
  .m3-fab--extended.m3-fab--regular { height: 52px; padding: 0 16px 0 12px; }
}
</style>
