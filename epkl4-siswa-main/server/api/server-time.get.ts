export default defineEventHandler(() => {
  // Waktu resmi server (Asia/Jakarta / WIB)
  const now = new Date()

  const dayFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long'
  })

  const parts = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(now)

  const partMap: Record<string, string> = {}
  parts.forEach(p => { partMap[p.type] = p.value })

  const hari = dayFormatter.format(now)
  const tanggal = `${partMap.day}/${partMap.month}/${partMap.year}`
  const jam = `${partMap.hour}:${partMap.minute}`
  const tanggal_agenda = `${hari}, ${Number(partMap.day)}/${Number(partMap.month)}/${partMap.year}`

  return {
    success: true,
    timestamp: now.getTime(),
    iso: now.toISOString(),
    hari,
    tanggal,
    jam,
    tanggal_agenda,
    display: `${hari}, ${tanggal} ${jam} WIB`
  }
})
