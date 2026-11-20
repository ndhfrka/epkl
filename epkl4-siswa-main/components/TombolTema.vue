<template>
  <!-- [FITUR TEMA] Tombol mode gelap/terang (desktop & mobile).
       Di mobile diletakkan berdampingan dengan tombol notifikasi (NavbarTop),
       di desktop berada di sisi navigasi (Nav.vue). -->
  <button
    type="button"
    class="tombol-tema"
    :aria-label="mode === 'gelap' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'"
    :title="mode === 'gelap' ? 'Mode terang ☀' : 'Mode gelap ☾'"
    @click="toggle"
  >
    <i class="bi" :class="mode === 'gelap' ? 'bi-sun' : 'bi-moon-stars'" aria-hidden="true"></i>
  </button>
</template>

<script setup>
const { mode, toggle, inisialisasi } = useTema()
onMounted(inisialisasi)
</script>

<style scoped>
.tombol-tema {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  /* gaya kaca (glass) serasi tombol menu & notifikasi di topbar */
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.tombol-tema:hover {
  background: rgba(59, 130, 246, 0.16);
  border-color: rgba(59, 130, 246, 0.35);
  color: #60a5fa;
  transform: scale(1.05);
}
.tombol-tema:active { transform: scale(0.96); }
.tombol-tema > i { font-size: 1.25rem; line-height: 1; }

/* Adaptif di mode terang */
:root[data-tema='terang'] .tombol-tema {
  background: rgba(15, 23, 42, 0.05);
  border-color: rgba(15, 23, 42, 0.12);
  color: #475569;
}
:root[data-tema='terang'] .tombol-tema:hover {
  background: rgba(37, 99, 235, 0.1);
  border-color: rgba(37, 99, 235, 0.35);
  color: #2563eb;
}
</style>
