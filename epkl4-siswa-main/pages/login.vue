<template>
  <div class="m3-login">
    <form class="m3-login__form" @submit.prevent="handleLogin" novalidate>
      <div class="m3-login__fields">
        <div class="m3-text-field">
          <label for="username" class="m3-text-field__label">Email / Username</label>
          <div class="m3-text-field__wrap">
            <i class="bi bi-person-circle m3-text-field__icon"></i>
            <input
              id="username"
              v-model="username"
              type="text"
              class="m3-text-field__input"
              placeholder="Masukkan email atau username"
              :disabled="sending"
              autocomplete="username"
              required
              autofocus
            />
          </div>
        </div>

        <div class="m3-text-field">
          <label for="password" class="m3-text-field__label">Password</label>
          <div class="m3-text-field__wrap">
            <i class="bi bi-shield-lock m3-text-field__icon"></i>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="m3-text-field__input"
              placeholder="Masukkan password"
              :disabled="sending"
              autocomplete="current-password"
              required
              @keyup.enter="$el.submit()"
            />
            <button
              type="button"
              class="m3-text-field__suffix"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
              :disabled="sending"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>
      </div>

      <transition name="m3-shake" mode="out-in">
        <div v-if="isError" key="error" class="m3-login__error">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>{{ pesan }}</span>
        </div>
      </transition>

      <div class="m3-login__actions">
        <button type="submit" class="m3-btn m3-btn--filled m3-btn--lg" :disabled="sending">
          <span v-if="!sending" class="m3-btn__content">
            <i class="bi bi-box-arrow-in-right"></i>
            <span>Masuk</span>
          </span>
          <span v-else class="m3-btn__spinner" aria-label="Memproses...">
            <span class="spinner-dot"></span>
            <span class="spinner-dot"></span>
            <span class="spinner-dot"></span>
          </span>
        </button>
      </div>

      <div class="m3-login__hint">
        <i class="bi bi-info-circle"></i>
        <span>Gunakan akun yang diberikan oleh sekolah.</span>
      </div>
    </form>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'login', middleware: 'check-auth' })
useHead({ title: 'Login — e-PKL' })

let client = usePocketBaseClient()
let username = ref('')
let password = ref('')
let sending = ref(false)
let isError = ref(false)
let pesan = ref('Username atau password salah. Silakan coba lagi.')
let showPassword = ref(false)

// error jaringan (internet putus / server mati) = tidak ada status HTTP (0);
// sedangkan kredensial salah = penolakan server dengan status 400
function gangguanJaringan(e) {
  return !e || !e.status || e.status === 0
}

async function handleLogin() {
  isError.value = false
  sending.value = true
  const id = username.value.trim()
  const pass = password.value
  if (!navigator.onLine || !id || !pass) {
    sending.value = false
    isError.value = true
    pesan.value = !navigator.onLine
      ? 'Tidak ada koneksi internet. Periksa jaringan Anda lalu coba lagi.'
      : 'Username dan password wajib diisi.'
    return
  }
  try {
    await client.collection('student_users').authWithPassword(id, pass)
    sending.value = false
    navigateTo('/')
  } catch (e1) {
    if (gangguanJaringan(e1)) {
      sending.value = false
      isError.value = true
      pesan.value = 'Tidak dapat terhubung ke server. Pastikan internet aktif lalu coba lagi.'
      return
    }
    try {
      await client.collection('teacher_users').authWithPassword(id, pass)
      sending.value = false
      navigateTo('/')
    } catch (e2) {
      isError.value = true
      pesan.value = gangguanJaringan(e2)
        ? 'Tidak dapat terhubung ke server. Pastikan internet aktif lalu coba lagi.'
        : 'Username atau password salah. Silakan coba lagi.'
      sending.value = false
      password.value = ''
      showPassword.value = false
    }
  }
}
</script>

<style scoped>
/* ================================================================
   KUNCI FORM LOGIN SECARA EKSPLISIT (TIDAK BERGANTUNG TOKEN M3).
   Alasan: bug user → form login tampak SANGAT KECIL (kaya stempel)
   di tengah desktop luas. Biasanya karena kombinasi:
     • Windows Display Scale 125% + Browser Zoom 55% → viewport CSS
       kecil banget.
     • CSS token `--md-sys-typescale-body-large-font` tidak ke-load.
   SEKARANG semua ukuran di-hardcode PX sebagai fallback minimal.
   ================================================================ */
.m3-login {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  min-width: 0;
}

.m3-login__form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

.m3-login__fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

/* ---------- M3 Outlined Text Field (UKURAN DIPASTIKAN) ---------- */
.m3-text-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}
.m3-text-field__label {
  /* Fallback jika token M3 tidak aktif: label minimal 14px */
  font: var(--md-sys-typescale-body-medium-font, 500 14px/1.4 "Plus Jakarta Sans", sans-serif);
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant, #c3c7d2);
  letter-spacing: 0.1px;
  padding-left: 4px;
  font-size: 14px;
}
.m3-text-field__wrap {
  position: relative;
  display: flex;
  align-items: stretch;
  /* TINGGI MINIMAL INPUT = 58px (bukan 56px) → lebih mudah di-klik */
  min-height: 58px;
  height: 58px;
  border-radius: 12px;
  border: 1.5px solid var(--md-sys-color-outline, #8d9199);
  background-color: transparent;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
  overflow: hidden;
}
.m3-text-field__wrap:hover {
  border-color: var(--md-sys-color-on-surface, #e2e8f0);
}
.m3-text-field__wrap:focus-within {
  border-color: var(--md-sys-color-primary, #60a5fa);
  border-width: 2px;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.14);
  background-color: rgba(96, 165, 250, 0.04);
}
.m3-text-field__wrap:focus-within .m3-text-field__icon {
  color: var(--md-sys-color-primary, #60a5fa);
}
.m3-text-field__icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  min-width: 56px;
  font-size: 20px;
  color: var(--md-sys-color-on-surface-variant, #c3c7d2);
  transition: color 0.18s ease;
  pointer-events: none;
}
.m3-text-field__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 10px 0 0;
  color: var(--md-sys-color-on-surface, #e2e8f0);
  font: var(--md-sys-typescale-body-large-font, 400 16px/1.5 "Plus Jakarta Sans", sans-serif);
  font-size: 16px !important;  /* 16px = standard, hindari zoom auto di iOS */
  letter-spacing: 0.2px;
  height: 100%;
}
.m3-text-field__input::placeholder {
  color: var(--md-sys-color-on-surface-variant, #c3c7d2);
  opacity: 0.65;
  font-size: 15px;
}
.m3-text-field__input:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.m3-text-field__suffix {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  min-width: 52px;
  min-height: 100%;
  border: none;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant, #c3c7d2);
  font-size: 19px;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
  border-radius: 0;
}
.m3-text-field__suffix:hover {
  color: var(--md-sys-color-primary, #60a5fa);
  background-color: rgba(96, 165, 250, 0.08);
}
.m3-text-field__suffix:active {
  background-color: rgba(96, 165, 250, 0.14);
}
.m3-text-field__suffix:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: transparent;
}

/* ---------- Login Error Banner ---------- */
.m3-login__error {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background-color: var(--md-sys-color-error-container, #93000a);
  color: var(--md-sys-color-on-error-container, #ffdad6);
  border-radius: 12px;
  font: var(--md-sys-typescale-body-medium-font, 500 14px/1.5 "Plus Jakarta Sans", sans-serif);
  line-height: 1.55;
  border: 1px solid rgba(255, 218, 214, 0.12);
  animation: none;
  font-size: 14px;
}
.m3-login__error i {
  flex-shrink: 0;
  font-size: 18px;
  margin-top: 1px;
  color: var(--md-sys-color-error, #f87171);
}

/* ---------- Actions: Tombol Masuk ---------- */
.m3-login__actions {
  display: flex;
  width: 100%;
  margin-top: 4px;
}
.m3-login__actions .m3-btn {
  width: 100%;
  min-height: 52px;
  font-size: 16px !important;
  font-weight: 700 !important;
  letter-spacing: 0.3px;
}

/* ---------- Hint (bawah tombol) ---------- */
.m3-login__hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
  padding-top: 4px;
  color: var(--md-sys-color-on-surface-variant, #a4adc7);
  font: var(--md-sys-typescale-body-small-font, 400 13px/1.5 "Plus Jakarta Sans", sans-serif);
  font-size: 13px;
  opacity: 0.95;
  text-align: center;
}
.m3-login__hint i { font-size: 15px; opacity: 0.9; }

/* ---------- DESKTOP (≥ 992px): FORM DIPERBESAR PROPORSIONAL ---------- */
/* Layar desktop 1366px+ : field lebih tinggi, label lebih besar,
   jarak lebih lega. Jadi tidak tampak seperti "stempel mini" ditengah. */
@media (min-width: 992px) {
  .m3-login__form { gap: 28px; }
  .m3-login__fields { gap: 22px; }
  .m3-text-field__label { font-size: 14.5px; padding-left: 6px; }
  .m3-text-field__wrap {
    min-height: 62px;
    height: 62px;
    border-radius: 14px;
  }
  .m3-text-field__icon { width: 60px; font-size: 22px; }
  .m3-text-field__input {
    font-size: 17px !important;
    padding-left: 2px;
  }
  .m3-text-field__suffix { width: 56px; }
  .m3-login__actions { margin-top: 6px; }
  .m3-login__actions .m3-btn { min-height: 56px; font-size: 17px !important; }
  .m3-login__error { padding: 16px 18px; font-size: 14.5px; }
}

.m3-shake-enter-active {
  animation: shakeX 0.45s cubic-bezier(.36,.07,.19,.97) both;
}
.m3-shake-leave-active {
  animation: fadeOut 0.2s ease both;
}
@keyframes shakeX {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-5px); }
  40%, 60% { transform: translateX(5px); }
}
@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-6px); }
}

/* ---------- M3 Filled Button ---------- */
.m3-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  cursor: pointer;
  font: var(--md-sys-typescale-label-large-font, 500 14px/1.4 "Plus Jakarta Sans", sans-serif);
  letter-spacing: 0.15px;
  transition: transform 0.1s ease, box-shadow 0.18s ease, filter 0.18s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.m3-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  filter: grayscale(0.2);
}
.m3-btn--filled {
  min-height: 48px;
  padding: 12px 28px;
  border-radius: var(--md-sys-shape-corner-full, 9999px);
  background-color: var(--md-sys-color-primary, #60a5fa);
  color: var(--md-sys-color-on-primary, #001f36);
  box-shadow: var(--m3-elevation-level-1, 0 2px 6px rgba(0,0,0,0.25));
  width: 100%;
}
.m3-btn--filled:hover:not(:disabled) {
  filter: brightness(1.06);
  box-shadow: var(--m3-elevation-level-2, 0 4px 12px rgba(0,0,0,0.3));
}
.m3-btn--filled:active:not(:disabled) {
  transform: translateY(1px) scale(0.995);
  filter: brightness(0.96);
}
.m3-btn--lg {
  min-height: 52px;
  font-size: 15px;
  padding: 14px 32px;
}
.m3-btn__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  z-index: 1;
}
.m3-btn__content i {
  font-size: 18px;
}
.m3-btn__spinner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 1;
}
.spinner-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--md-sys-color-on-primary, #001f36);
  opacity: 0.85;
  animation: bounce 1.1s infinite ease-in-out both;
}
.spinner-dot:nth-child(1) { animation-delay: -0.32s; }
.spinner-dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40%           { transform: scale(1);   opacity: 1; }
}

/* ---------- Responsive tweaks (sangat kecil) ---------- */
@media (max-width: 420px) {
  .m3-login__form { gap: 20px; }
  .m3-login__fields { gap: 16px; }
  .m3-text-field__wrap { min-height: 52px; height: 52px; }
  .m3-text-field__icon { width: 46px; min-width: 46px; font-size: 18px; }
  .m3-btn--lg { min-height: 50px; }
}
</style>
