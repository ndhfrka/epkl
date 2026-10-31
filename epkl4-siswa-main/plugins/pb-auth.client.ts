// Segarkan sesi login setiap aplikasi dibuka supaya halaman tidak
// kosong/error karena token mati (harus refresh manual dulu).
import { usePocketBaseClient } from "~/composables/pocketBaseClient"

export default defineNuxtPlugin(async () => {
  const client = usePocketBaseClient()
  // Tidak ada sesi login -> tidak perlu refresh (mencegah 401 di console
  // setiap kali halaman dibuka sebelum user login / setelah logout).
  if (!client.authStore.isValid) return
  // siswa pakai student_users, guru/tu/wakasek/instansi pakai teacher_users
  const role = client.authStore.model?.role
  const isTeacherUser = role && role !== 'siswa'
  const collection = isTeacherUser ? 'teacher_users' : 'student_users'
  try {
    await client.collection(collection).authRefresh()
  } catch (err) {
    // If refresh fails with 401 (unauthorized), clear authStore to force re-login
    if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
      client.authStore.clear()
    }
    // Otherwise ignore refresh errors to keep session alive silently
  }
})
