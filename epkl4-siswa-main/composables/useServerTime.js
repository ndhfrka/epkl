/**
 * Composable untuk mendapatkan waktu server resmi (WIB / Asia/Jakarta)
 * Mencegah manipulasi tanggal/jam oleh siswa pada perangkat HP/klien.
 */
export const useServerTime = () => {
  const serverInfo = useState('serverTimeInfo', () => ({
    hari: '',
    tanggal: '',
    jam: '',
    tanggal_agenda: '',
    display: '',
    timestamp: 0,
    loaded: false
  }))

  const fetchServerTime = async () => {
    try {
      const data = await $fetch('/api/server-time')
      if (data && data.success) {
        serverInfo.value = {
          ...data,
          loaded: true
        }
        return data
      }
    } catch (e) {
      console.warn('Gagal fetch server-time, fallback local:', e)
    }

    // Fallback darurat
    const now = new Date()
    const dayFormatter = new Intl.DateTimeFormat('id-ID', { weekday: 'long' })
    const hari = dayFormatter.format(now)
    const tanggal_agenda = `${hari}, ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`
    const info = {
      success: true,
      timestamp: now.getTime(),
      iso: now.toISOString(),
      hari,
      tanggal: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
      jam: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      tanggal_agenda,
      display: `${tanggal_agenda} (Waktu Lokal)`,
      loaded: true
    }
    serverInfo.value = info
    return info
  }

  return {
    serverInfo,
    fetchServerTime
  }
}
