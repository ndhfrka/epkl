import { useState } from "#imports"
import { usePocketBaseClient } from "./pocketBaseClient"

export const usePocketBaseUser = () => {
  let client = usePocketBaseClient()
  let user = useState('user', () => null)
  let isUserLoggedIn = client?.authStore.isValid

  if (isUserLoggedIn && client?.authStore?.model) {
    const model = client.authStore.model
    user.value = {
      ...model,
      id: model.id,
      username: model.username || '',
      email: model.email || '',
      nama: model.nama || model.name || '',
      role: model.role || 'siswa',
      siswa: model.siswa || '',
      guru: model.guru || '',
      instansi: model.instansi || '',
      program_keahlian: model.program_keahlian || '',
      expand: model.expand || {},
      foto: model.foto || '',
    }
  } else {
    user.value = null
  }
  return { user, isUserLoggedIn }
}
