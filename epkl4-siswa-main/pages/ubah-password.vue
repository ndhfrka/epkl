<template>
  <div class="ubah-sandi-page">
    <div class="ubah-sandi-card">
      <div class="ubah-sandi-header">
        <div class="ubah-sandi-icon">
          <i class="bi bi-shield-lock-fill"></i>
        </div>
        <h3 class="ubah-sandi-title">Ubah Sandi</h3>
        <p class="ubah-sandi-subtitle">
          Masukkan sandi lama, lalu sandi baru beserta konfirmasinya.
        </p>
      </div>

      <form class="ubah-sandi-form" @submit.prevent="handleChangeImproved" novalidate>
        <div class="ubah-sandi-field">
          <label class="ubah-sandi-label">Sandi Lama</label>
          <div class="ubah-sandi-input-wrap">
            <i class="bi bi-key-fill ubah-sandi-input-icon"></i>
            <input
              v-model="oldPassword"
              :type="showOld ? 'text' : 'password'"
              class="ubah-sandi-input"
              placeholder="Masukkan sandi lama"
              :disabled="sending"
              autocomplete="current-password"
              required
            />
            <button type="button" class="ubah-sandi-suffix" @click="showOld = !showOld" :disabled="sending">
              <i :class="showOld ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <div class="ubah-sandi-field">
          <label class="ubah-sandi-label">Sandi Baru</label>
          <div class="ubah-sandi-input-wrap">
            <i class="bi bi-lock-fill ubah-sandi-input-icon"></i>
            <input
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              class="ubah-sandi-input"
              placeholder="Minimal 8 karakter"
              :disabled="sending"
              autocomplete="new-password"
              required
              minlength="8"
            />
            <button type="button" class="ubah-sandi-suffix" @click="showNew = !showNew" :disabled="sending">
              <i :class="showNew ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div class="ubah-sandi-hint">
            <i :class="newPassword.length >= 8 ? 'bi bi-check-circle-fill ok' : 'bi bi-info-circle'"></i>
            <span>Minimal 8 karakter</span>
          </div>
        </div>

        <div class="ubah-sandi-field">
          <label class="ubah-sandi-label">Konfirmasi Sandi Baru</label>
          <div class="ubah-sandi-input-wrap">
            <i class="bi bi-shield-check ubah-sandi-input-icon"></i>
            <input
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              class="ubah-sandi-input"
              placeholder="Ulangi sandi baru"
              :disabled="sending"
              autocomplete="new-password"
              required
            />
            <button type="button" class="ubah-sandi-suffix" @click="showConfirm = !showConfirm" :disabled="sending">
              <i :class="showConfirm ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div v-if="confirmPassword" class="ubah-sandi-hint">
            <i
              :class="confirmPassword && newPassword === confirmPassword ? 'bi bi-check-circle-fill ok' : 'bi bi-x-circle-fill err'"
            ></i>
            <span>
              {{ confirmPassword && newPassword === confirmPassword ? 'Sandi cocok' : 'Sandi belum cocok' }}
            </span>
          </div>
        </div>

        <button type="submit" class="ubah-sandi-btn" :disabled="sending || !isFormValid">
          <span v-if="!sending" class="ubah-sandi-btn-inner">
            <i class="bi bi-save-fill"></i>
            <span>Ubah Sandi</span>
          </span>
          <span v-else class="ubah-sandi-spinner" aria-label="Memproses...">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </span>
        </button>

        <transition name="ubah-sandi-fade" mode="out-in">
          <div v-if="errorMsg" key="err" class="ubah-sandi-msg err">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>{{ errorMsg }}</span>
          </div>
          <div v-else-if="successMsg" key="ok" class="ubah-sandi-msg ok">
            <i class="bi bi-check-circle-fill"></i>
            <span>{{ successMsg }}</span>
          </div>
        </transition>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'auth' })
useHead({ title: 'Ubah Sandi — e-PKL' })

let client = usePocketBaseClient()
let pbUser = usePocketBaseUser()

let oldPassword = ref('')
let newPassword = ref('')
let confirmPassword = ref('')
let errorMsg = ref('')
let successMsg = ref('')
let sending = ref(false)
let showOld = ref(false)
let showNew = ref(false)
let showConfirm = ref(false)

const isFormValid = computed(() => {
  return (
    oldPassword.value.trim().length > 0 &&
    newPassword.value.length >= 8 &&
    confirmPassword.value.length >= 8 &&
    newPassword.value === confirmPassword.value
  )
})

function resolveCollectionForCurrentUser() {
  const model = client.authStore?.model
  const role = pbUser.user.value?.role || model?.role || 'siswa'
  const collFromModel = model?.collectionName || model?.collectionId

  if (collFromModel) {
    if (typeof collFromModel === 'string' && collFromModel.startsWith('pbc_') === false) {
      return collFromModel
    }
  }

  switch (role) {
    case 'guru':
      return 'teacher_users'
    case 'instansi':
      return 'teacher_users'
    case 'siswa':
    default:
      return 'student_users'
  }
}

function resolveIdentityForCurrentUser() {
  const model = client.authStore?.model
  if (!model) return ''
  return model.email?.trim() || model.username?.trim() || ''
}

async function handleChangeImproved() {
  errorMsg.value = ''
  successMsg.value = ''

  if (newPassword.value.length < 8) {
    errorMsg.value = 'Sandi baru minimal 8 karakter.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Sandi baru dan konfirmasi tidak cocok.'
    return
  }

  sending.value = true
  client.autoCancellation(false)

  const collectionName = resolveCollectionForCurrentUser()
  const identity = resolveIdentityForCurrentUser()
  const currentId = pbUser.user.value?.id || client.authStore?.model?.id

  if (!identity || !currentId) {
    errorMsg.value = 'Sesi tidak valid. Silakan logout lalu login kembali.'
    sending.value = false
    return
  }

  let reAuthed = null
  try {
    reAuthed = await client
      .collection(collectionName)
      .authWithPassword(identity, oldPassword.value)
  } catch (authErr) {
    const code = authErr?.status || authErr?.response?.status || 0
    if (code === 400 || code === 401 || authErr?.message?.toLowerCase().includes('invalid')) {
      errorMsg.value = 'Sandi lama salah. Periksa kembali dan coba lagi.'
    } else {
      errorMsg.value = 'Gagal memverifikasi sandi lama. Periksa jaringan atau coba sesaat lagi.'
    }
    sending.value = false
    return
  }

  try {
    const userId = reAuthed?.record?.id || reAuthed?.id || currentId
    await client
      .collection(collectionName)
      .update(userId, {
        password: newPassword.value,
        passwordConfirm: confirmPassword.value
      })

    successMsg.value = 'Sandi berhasil diubah. Kamu akan dialihkan ke login...'
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    setTimeout(async () => {
      await client.authStore.clear()
      try {
        pbUser.user.value = null
      } catch (e) {}
      await navigateTo('/login')
    }, 1400)
  } catch (e) {
    const msg = e?.response?.data?.password?.message || e?.message || ''
    if (msg && typeof msg === 'string') {
      errorMsg.value = 'Gagal mengubah sandi: ' + msg
    } else {
      errorMsg.value = 'Gagal mengubah sandi. Silakan coba lagi.'
    }
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.ubah-sandi-page {
  display: flex;
  justify-content: center;
  padding: 8px 4px 28px;
}

.ubah-sandi-card {
  width: 100%;
  max-width: 520px;
  background: var(--md-sys-color-surface-container-high, #ece6f0);
  border-radius: 20px;
  padding: 28px 28px 24px;
  border: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.ubah-sandi-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}
.ubah-sandi-icon {
  width: 60px;
  height: 60px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: var(--md-sys-color-primary-container, #dfe1ff);
  color: var(--md-sys-color-on-primary-container, #101857);
  font-size: 26px;
  box-shadow: var(--m3-elevation-level-1, 0 1px 2px rgba(0,0,0,0.1));
}
.ubah-sandi-title {
  margin: 0;
  color: var(--md-sys-color-on-surface, #1b1b1f);
  font-weight: 700;
  letter-spacing: 0.2px;
  font-size: 1.4rem;
}
.ubah-sandi-subtitle {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  font-size: 0.92rem;
  line-height: 1.5;
}

.ubah-sandi-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.ubah-sandi-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ubah-sandi-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  padding-left: 4px;
  letter-spacing: 0.1px;
}

.ubah-sandi-input-wrap {
  position: relative;
  display: flex;
  align-items: stretch;
  min-height: 54px;
  border-radius: 14px;
  border: 1.5px solid var(--md-sys-color-outline, #79747e);
  background: var(--md-sys-color-surface, #fffbff);
  overflow: hidden;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}
.ubah-sandi-input-wrap:hover {
  border-color: var(--md-sys-color-on-surface, #1b1b1f);
}
.ubah-sandi-input-wrap:focus-within {
  border-color: var(--md-sys-color-primary, #5b6ef2);
  box-shadow: 0 0 0 4px rgba(91, 110, 242, 0.14);
  background: rgba(91, 110, 242, 0.04);
}
.ubah-sandi-input-icon {
  width: 50px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--md-sys-color-on-surface-variant, #49454f);
}
.ubah-sandi-input-wrap:focus-within .ubah-sandi-input-icon {
  color: var(--md-sys-color-primary, #5b6ef2);
}
.ubah-sandi-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 8px 0 0;
  font-size: 0.96rem;
  color: var(--md-sys-color-on-surface, #1b1b1f);
  letter-spacing: 0.15px;
}
.ubah-sandi-input::placeholder {
  color: var(--md-sys-color-on-surface-variant, #79747e);
  opacity: 0.8;
}
.ubah-sandi-suffix {
  flex-shrink: 0;
  width: 48px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease, background 0.15s ease;
}
.ubah-sandi-suffix:hover {
  color: var(--md-sys-color-primary, #5b6ef2);
}
.ubah-sandi-suffix:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ubah-sandi-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-left: 4px;
  font-size: 0.8rem;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  margin-top: 2px;
}
.ubah-sandi-hint .ok {
  color: #16a34a;
}
.ubah-sandi-hint .err {
  color: #dc2626;
}

.ubah-sandi-btn {
  margin-top: 6px;
  min-height: 54px;
  border: none;
  border-radius: 999px;
  background: var(--md-sys-color-primary, #5b6ef2);
  color: var(--md-sys-color-on-primary, #ffffff);
  font-weight: 600;
  letter-spacing: 0.3px;
  font-size: 0.98rem;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  box-shadow: 0 2px 6px rgba(91, 110, 242, 0.3);
}
.ubah-sandi-btn:hover:not(:disabled) {
  box-shadow: 0 4px 10px rgba(91, 110, 242, 0.35);
  transform: translateY(-1px);
}
.ubah-sandi-btn:active:not(:disabled) {
  transform: translateY(0);
}
.ubah-sandi-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}
.ubah-sandi-btn-inner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.ubah-sandi-btn-inner i {
  font-size: 16px;
}
.ubah-sandi-spinner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ubah-sandi-spinner .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--md-sys-color-on-primary, #ffffff);
  animation: ubah-sandi-bounce 1.2s infinite ease-in-out both;
}
.ubah-sandi-spinner .dot:nth-child(1) { animation-delay: -0.32s; }
.ubah-sandi-spinner .dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes ubah-sandi-bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.6; }
  40% { transform: scale(1); opacity: 1; }
}

.ubah-sandi-msg {
  margin-top: 2px;
  padding: 12px 14px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  line-height: 1.5;
}
.ubah-sandi-msg.err {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}
.ubah-sandi-msg.ok {
  background: #dcfce7;
  color: #14532d;
  border: 1px solid #bbf7d0;
}

.ubah-sandi-fade-enter-active,
.ubah-sandi-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.ubah-sandi-fade-enter-from,
.ubah-sandi-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@media (max-width: 576px) {
  .ubah-sandi-card {
    padding: 22px 18px 20px;
    border-radius: 18px;
  }
  .ubah-sandi-title { font-size: 1.25rem; }
  .ubah-sandi-icon { width: 54px; height: 54px; border-radius: 16px; font-size: 23px; }
}
</style>
