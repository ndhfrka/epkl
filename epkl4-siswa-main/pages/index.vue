<template>
  <div class="dashboard-wrapper">
    <!-- ===== Top Monitoring Bar (Guru / Instansi) ===== -->
    <div v-if="(isGuru || isInstansi) && listSiswaOption.length > 0" class="monitor-bar mb-4">
      <div class="monitor-bar__header">
        <div class="monitor-bar__title">
          <span class="monitor-pill">
            <i class="bi bi-eye-fill"></i> Mode Pemantauan {{ isGuru ? 'Guru' : 'IDUKA' }}
          </span>
          <span v-if="isGuru && guruJurusanNama" class="jurusan-pill">
            <i class="bi bi-mortarboard-fill"></i> Jurusan {{ guruJurusanNama }}
          </span>
        </div>
      </div>
      <div class="monitor-bar__controls">
        <div v-if="isGuru && listJurusanOption.length > 1 && !guruJurusanNama" class="control-group">
          <label class="control-label"><i class="bi bi-funnel-fill"></i> Jurusan</label>
          <select v-model="selectedJurusanFilter" class="form-select form-select-sm modern-select" @change="onJurusanFilterChange">
            <option value="all">Semua Jurusan</option>
            <option v-for="j in listJurusanOption" :key="j.id" :value="j.id">{{ j.nama }}</option>
          </select>
        </div>

        <div class="control-group flex-grow-1">
          <label class="control-label"><i class="bi bi-person-bounding-box"></i> Pilih Siswa</label>
          <button
            type="button"
            class="form-select form-select-sm modern-select modern-select-btn d-flex align-items-center justify-content-between text-start w-100"
            @click="showSiswaModal = true"
          >
            <span class="text-truncate me-2">
              {{ currentSelectedSiswa ? (currentSelectedSiswa.nama + (currentSelectedSiswa.kelas ? ' (' + currentSelectedSiswa.kelas + ')' : '')) : 'Pilih Siswa...' }}
            </span>
            <i class="bi bi-chevron-expand opacity-75 flex-shrink-0"></i>
          </button>
        </div>
      </div>
    </div>
    <div v-else-if="isGuru && listSiswaOption.length === 0" class="alert-empty-jurusan mb-4">
      <i class="bi bi-info-circle-fill"></i> Belum ada siswa terdaftar di jurusan {{ guruJurusanNama || 'ini' }}.
    </div>

    <!-- MODAL / BOTTOM SHEET PILIH SISWA (Mobile & Desktop Friendly) -->
    <Teleport to="body">
      <div v-if="showSiswaModal" class="modal-siswa-overlay" @click="showSiswaModal = false">
        <div class="modal-siswa-card" @click.stop>
          <div class="modal-siswa-header d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom border-secondary border-opacity-25">
            <div>
              <h5 class="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-person-check-fill text-primary"></i> Pilih Siswa
              </h5>
              <div class="small text-secondary">
                {{ guruJurusanNama ? 'Jurusan ' + guruJurusanNama : 'Mode Pemantauan' }} • {{ listSiswaOption.length }} Siswa Tersedia
              </div>
            </div>
            <button class="btn btn-sm btn-outline-secondary rounded-circle" @click="showSiswaModal = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Input Cari Siswa -->
          <div class="mb-3">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="searchSiswaText"
                type="text"
                class="form-control bg-dark border-secondary border-opacity-25 text-white"
                placeholder="Ketik nama atau kelas siswa..."
              />
              <button v-if="searchSiswaText" class="btn btn-outline-secondary" @click="searchSiswaText = ''">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <!-- List Siswa -->
          <div class="modal-siswa-list">
            <div
              v-for="opt in filteredModalSiswaList"
              :key="opt.userId"
              class="modal-siswa-item p-2 mb-2 rounded-3 d-flex align-items-center justify-content-between hand-cursor"
              :class="{ 'modal-siswa-item--active': opt.userId === selectedSiswaUserId }"
              @click="pilihSiswa(opt)"
            >
              <div class="d-flex align-items-center gap-2 min-w-0">
                <div class="modal-siswa-avatar text-white fw-bold flex-shrink-0">
                  {{ (opt.nama || 'S').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <div class="fw-semibold text-white text-truncate">{{ opt.nama }}</div>
                  <div class="small text-secondary text-truncate">
                    <span v-if="opt.kelas" class="badge bg-secondary-subtle text-secondary me-1">{{ opt.kelas }}</span>
                    <span>{{ opt.jurusan }}</span>
                  </div>
                </div>
              </div>
              <div class="ms-2 flex-shrink-0">
                <i v-if="opt.userId === selectedSiswaUserId" class="bi bi-check-circle-fill text-primary fs-5"></i>
                <i v-else class="bi bi-circle text-secondary opacity-50 fs-5"></i>
              </div>
            </div>

            <div v-if="filteredModalSiswaList.length === 0" class="text-center py-4 text-secondary small">
              Tidak ada siswa dengan nama "{{ searchSiswaText }}"
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== Modern Hero Profile Banner ===== -->
    <div class="hero-banner mb-4">
      <div class="hero-banner__glow"></div>
      <Loading v-if="isLoading" />
      <div v-else-if="!isLoading && peserta" class="hero-banner__inner">
        <div class="hero-avatar-col">
          <div class="hero-avatar">
            <img v-if="fotoUrl" :src="fotoUrl" alt="foto profil" class="hero-avatar__img" title="Klik untuk memperbesar" @click="showFoto = true" />
            <div v-else class="hero-avatar__fallback">
              <i class="bi bi-person-fill"></i>
            </div>
            <label v-if="!isInstansi && !isGuru" class="hero-avatar__edit-btn" title="Unggah Foto Profil">
              <i class="bi bi-camera-fill"></i>
              <input type="file" accept="image/*" class="d-none" @change="uploadFoto" />
            </label>
            <span class="hero-avatar__badge" title="Status Aktif PKL"></span>
          </div>
        </div>

        <div class="hero-info-col">
          <div class="hero-top-row">
            <span class="hero-school-label">
              <i class="bi bi-building"></i> SMK AL-FATAH BANJARNEGARA &bull; E-PKL
            </span>
          </div>
          <h1 class="hero-student-name">{{ peserta.nama }}</h1>
          
          <div class="hero-badges-row">
            <span v-if="pesertaJurusan" class="badge-pill badge-pill--blue">
              <i class="bi bi-mortarboard-fill"></i> {{ pesertaJurusan }}
            </span>
            <span v-if="pesertaKonsentrasi" class="badge-pill badge-pill--slate" :title="pesertaKonsentrasi">
              <i class="bi bi-cpu-fill"></i> {{ pesertaKonsentrasi }}
            </span>
            <span class="badge-pill badge-pill--cyan" :class="{ 'clickable': !isInstansi && !isGuru }" @click="!isInstansi && !isGuru ? mulaiEditKelas() : null">
              <i class="bi bi-tag-fill"></i> Kelas: {{ peserta.kelas || '-' }}
              <i v-if="!isInstansi && !isGuru" class="bi bi-pencil-square ms-1"></i>
            </span>
            <span class="badge-pill badge-pill--emerald">
              <span class="pulse-dot"></span> Sedang PKL
            </span>
          </div>

          <!-- Inline Edit Kelas jika aktif -->
          <div v-if="editingKelas" class="edit-inline-box mt-3">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <input v-model="kelasText" class="form-control form-control-sm modern-input" type="text" placeholder="Contoh: XII PPLG 3" @keyup.enter="simpanKelas" />
              <button class="btn btn-sm btn-primary px-3 rounded-pill" @click="simpanKelas">Simpan</button>
              <button class="btn btn-sm btn-outline-secondary px-3 rounded-pill" @click="editingKelas = false">Batal</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Foto Preview Modal ===== -->
    <div v-if="showFoto && fotoUrl" class="foto-preview-overlay" @click="showFoto = false">
      <div class="foto-preview-card" @click.stop>
        <img :src="fotoUrl" alt="foto profil" class="foto-preview-img" />
        <button class="btn-close-modal" title="Tutup" @click="showFoto = false">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>

    <!-- ===== Smart Notification / Action Cards ===== -->
    <Loading v-if="isLoadingJournaToday" />
    <div v-else class="action-banners mb-4">
      <!-- Call to Action: Buat Jurnal Hari ini -->
      <div v-if="!isInstansi && !isGuru && pemetaan.length > 0 && peserta?.guru_pembimbing != '' && !havePostJournalToday" class="action-card action-card--cta">
        <div class="action-card__icon">
          <i class="bi bi-pencil-fill"></i>
        </div>
        <div class="action-card__content">
          <div class="action-card__title">Jurnal Hari Ini Belum Dibuat</div>
          <div class="action-card__desc">Catat aktivitas dan keterampilan yang kamu pelajari hari ini di tempat PKL!</div>
        </div>
        <nuxt-link to="/jurnal/tambah" class="btn btn-primary rounded-pill px-4 action-card__btn">
          Tulis Jurnal <i class="bi bi-arrow-right ms-1"></i>
        </nuxt-link>
      </div>

      <!-- Draft Jurnal Alert -->
      <nuxt-link v-if="countDraftJournal > 0" to="/jurnal" class="action-card action-card--warning text-decoration-none">
        <div class="action-card__icon">
          <i class="bi bi-file-earmark-diff-fill"></i>
        </div>
        <div class="action-card__content">
          <div class="action-card__title">Draft Jurnal Belum Terkirim</div>
          <div class="action-card__desc">Kamu memiliki <strong>{{ countDraftJournal }}</strong> draft jurnal yang perlu dikirim.</div>
        </div>
        <span class="action-card__link-text">Kirim Sekarang <i class="bi bi-arrow-right ms-1"></i></span>
      </nuxt-link>

      <!-- Komentar Jurnal Alert -->
      <nuxt-link v-if="countUnreadJournalComment > 0" to="/jurnal" class="action-card action-card--info text-decoration-none">
        <div class="action-card__icon">
          <i class="bi bi-chat-dots-fill"></i>
        </div>
        <div class="action-card__content">
          <div class="action-card__title">Komentar Pembimbing Baru</div>
          <div class="action-card__desc">Terdapat <strong>{{ countUnreadJournalComment }}</strong> komentar dari pembimbing yang belum kamu baca.</div>
        </div>
        <span class="action-card__link-text">Lihat Komentar <i class="bi bi-arrow-right ms-1"></i></span>
      </nuxt-link>
    </div>

    <!-- ===== Core Placement Info (Modern Bento Grid: 5 Cards) ===== -->
    <div class="section-heading mb-3">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-info-circle-fill text-primary"></i>
        <h2 class="section-title">Informasi Penempatan & Jadwal PKL</h2>
      </div>
      <span class="section-subtitle">Data penempatan, hari kerja, jam kerja, dan pembimbing PKL</span>
    </div>

    <div class="bento-grid mb-4">
      <!-- 1. Tempat PKL / IDUKA -->
      <div class="bento-card">
        <div class="bento-card__header">
          <div class="bento-card__icon bento-card__icon--blue">
            <i class="bi bi-buildings-fill"></i>
          </div>
          <span class="bento-card__label">Tempat PKL / IDUKA</span>
          <button v-if="!isInstansi && !isGuru" class="btn-action-mini ms-auto" title="Ubah Tempat PKL" @click="mulaiEditIduka">
            <i class="bi bi-pencil-fill"></i>
          </button>
        </div>
        
        <div class="bento-card__body">
          <template v-if="editingIduka">
            <div class="edit-box">
              <input v-model="idukaNama" class="form-control form-control-sm modern-input mb-2" type="text" placeholder="Nama tempat PKL / instansi" @keyup.enter="simpanIduka" />
              <input v-model="idukaAlamat" class="form-control form-control-sm modern-input mb-2" type="text" placeholder="Alamat instansi" @keyup.enter="simpanIduka" />
              <div class="d-flex gap-2">
                <button class="btn btn-primary btn-sm rounded-pill px-3" @click="simpanIduka">Simpan</button>
                <button class="btn btn-outline-secondary btn-sm rounded-pill px-3" @click="editingIduka = false">Batal</button>
              </div>
            </div>
          </template>
          <template v-else>
            <template v-if="iduka">
              <nuxt-link to="/iduka" class="bento-card__main-link">
                <span class="bento-card__val text-truncate">{{ iduka?.items[0].expand.iduka.nama }}</span>
                <i class="bi bi-arrow-up-right"></i>
              </nuxt-link>
              <div class="bento-card__sub text-truncate" :title="iduka?.items[0].expand.iduka?.alamat">
                <i class="bi bi-geo-alt-fill text-danger me-1"></i> {{ iduka?.items[0].expand.iduka?.alamat || 'Alamat belum diatur' }}
              </div>
            </template>
            <div v-else class="bento-card__empty">
              <i class="bi bi-exclamation-triangle-fill text-warning me-1"></i> Belum ada pemetaan tempat PKL
            </div>
          </template>
        </div>
      </div>

      <!-- 2. FITUR BARU: Hari PKL / Jadwal Hari Kerja -->
      <div class="bento-card bento-card--featured">
        <div class="bento-card__header">
          <div class="bento-card__icon bento-card__icon--indigo">
            <i class="bi bi-calendar-week-fill"></i>
          </div>
          <span class="bento-card__label">Hari Kerja PKL</span>
          <button v-if="!isInstansi && !isGuru" class="btn-action-mini ms-auto" title="Atur Jadwal Hari PKL" @click="bukaModalHariPkl">
            <i class="bi bi-pencil-fill"></i>
          </button>
        </div>

        <div class="bento-card__body">
          <div class="bento-card__val text-truncate" :title="ringkasanHariPkl">
            {{ ringkasanHariPkl }}
          </div>

          <!-- 7-Day Mini Chips Visualizer -->
          <div class="days-chips-row my-2">
            <span
              v-for="h in SEMUA_HARI"
              :key="'chip-' + h"
              class="day-chip"
              :class="{
                'day-chip--active': hariPklList.includes(h),
                'day-chip--today': h === hariIni,
              }"
              :title="h + ': ' + (hariPklList.includes(h) ? 'Berangkat PKL' : 'Libur')"
            >
              {{ KODE_HARI[h] }}
            </span>
          </div>

          <!-- Status Hari Ini -->
          <div class="mt-1">
            <span class="badge-hari-status" :class="isHariPklHariIni ? 'badge-hari-status--work' : 'badge-hari-status--off'">
              <i :class="isHariPklHariIni ? 'bi bi-briefcase-fill' : 'bi bi-cup-hot-fill'" class="me-1"></i>
              Hari ini ({{ hariIni }}): <strong>{{ isHariPklHariIni ? 'Berangkat PKL' : 'Libur PKL' }}</strong>
            </span>
          </div>
        </div>
      </div>

      <!-- 3. Jam Kerja PKL -->
      <div class="bento-card">
        <div class="bento-card__header">
          <div class="bento-card__icon bento-card__icon--purple">
            <i class="bi bi-clock-fill"></i>
          </div>
          <span class="bento-card__label">Jam Kerja PKL</span>
          <button v-if="!isInstansi && !isGuru" class="btn-action-mini ms-auto" title="Edit Jam Mulai & Selesai" @click="mulaiEditJam">
            <i class="bi bi-pencil-fill"></i>
          </button>
        </div>

        <div class="bento-card__body">
          <template v-if="editingJam">
            <div class="edit-box">
              <div class="d-flex align-items-center gap-2 mb-2">
                <input v-model="jamMulaiText" type="time" class="form-control form-control-sm modern-input" />
                <span class="text-muted"><i class="bi bi-arrow-right"></i></span>
                <input v-model="jamSelesaiText" type="time" class="form-control form-control-sm modern-input" />
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-primary btn-sm rounded-pill px-3" @click="simpanJam">Simpan</button>
                <button class="btn btn-outline-secondary btn-sm rounded-pill px-3" @click="editingJam = false">Batal</button>
              </div>
            </div>
          </template>
          <template v-else>
            <div v-if="emptyPemetaan || !iduka?.items?.length" class="bento-card__empty">
              Belum pemetaan
            </div>
            <div v-else-if="jamMulai || jamSelesai" class="time-range-chip">
              <span class="time-pill"><i class="bi bi-door-open-fill me-1"></i> {{ jamMulai || '--:--' }}</span>
              <span class="time-arrow"><i class="bi bi-arrow-right"></i></span>
              <span class="time-pill"><i class="bi bi-door-closed-fill me-1"></i> {{ jamSelesai || '--:--' }}</span>
            </div>
            <div v-else class="bento-card__sub">
              Belum diatur — klik pensil untuk mengisi jam kerja.
            </div>
          </template>
        </div>
      </div>

      <!-- 4. Guru Pembimbing -->
      <div class="bento-card">
        <div class="bento-card__header">
          <div class="bento-card__icon bento-card__icon--emerald">
            <i class="bi bi-person-badge-fill"></i>
          </div>
          <span class="bento-card__label">Guru Pembimbing</span>
          <button class="btn-action-mini ms-auto" title="Pilih Guru Pembimbing" @click="mulaiEditGuru">
            <i class="bi bi-pencil-fill"></i>
          </button>
        </div>

        <div class="bento-card__body">
          <template v-if="editingGuru">
            <div class="edit-box">
              <select v-model="guruPilih" class="form-select form-select-sm modern-select mb-2" @change="simpanGuru">
                <option value="">- Pilih Guru Pembimbing -</option>
                <option v-for="g in guruList" :key="g.id" :value="g.id">{{ g.nama }}</option>
              </select>
              <button class="btn btn-outline-secondary btn-sm rounded-pill px-3" @click="editingGuru = false">Tutup</button>
            </div>
          </template>
          <template v-else>
            <div v-if="guruNamaTampil" class="bento-card__val text-truncate" :title="guruNamaTampil">
              {{ guruNamaTampil }}
            </div>
            <div v-else class="bento-card__empty">
              <i class="bi bi-exclamation-triangle-fill text-warning me-1"></i> Belum ada guru pembimbing
            </div>
            <div class="bento-card__sub">
              <i class="bi bi-patch-check-fill text-success me-1"></i> Pembimbing Sekolah
            </div>
          </template>
        </div>
      </div>

      <!-- 5. Kelas & Rombel -->
      <div class="bento-card">
        <div class="bento-card__header">
          <div class="bento-card__icon bento-card__icon--amber">
            <i class="bi bi-journal-code"></i>
          </div>
          <span class="bento-card__label">Rombel & Jurusan</span>
        </div>

        <div class="bento-card__body">
          <div class="bento-card__val">
            {{ peserta?.kelas || 'XII PPLG 3' }}
          </div>
          <div class="bento-card__sub text-truncate" :title="pesertaJurusan || 'Pengembangan Perangkat Lunak & Gim'">
            <i class="bi bi-mortarboard me-1"></i> {{ pesertaJurusan || 'Pengembangan Perangkat Lunak & Gim' }}
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Modal Atur Hari PKL ===== -->
    <div v-if="modalHariPklOpen" class="modal-overlay-custom" @click="modalHariPklOpen = false">
      <div class="modal-card-custom" @click.stop>
        <div class="modal-card-custom__header">
          <div class="d-flex align-items-center gap-2">
            <div class="modal-icon-badge">
              <i class="bi bi-calendar-range-fill"></i>
            </div>
            <div>
              <h3 class="modal-card-custom__title">Atur Hari Kerja PKL</h3>
              <p class="modal-card-custom__subtitle">Pilih jadwal hari kamu masuk PKL di tempat IDUKA-mu</p>
            </div>
          </div>
          <button class="btn-close-modal-sm" @click="modalHariPklOpen = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-card-custom__body">
          <!-- Info Banner -->
          <div class="info-alert mb-3">
            <i class="bi bi-lightbulb-fill text-warning me-2"></i>
            <span>Setiap tempat PKL memiliki jadwal berbeda: ada yang <strong>5 hari (Senin-Jumat)</strong>, <strong>6 hari (Senin-Sabtu)</strong>, atau masuk hari <strong>Minggu</strong> dengan libur di hari lain.</span>
          </div>

          <!-- Pilihan Cepat (Presets) -->
          <div class="mb-3">
            <label class="form-label-custom">Pilihan Cepat:</label>
            <div class="presets-row">
              <button
                type="button"
                class="btn-preset"
                :class="{ 'btn-preset--active': isPresetActive('5hari') }"
                @click="pilihPresetHari('5hari')"
              >
                <i class="bi bi-calendar2-check me-1"></i> 5 Hari (Sen - Jum)
              </button>
              <button
                type="button"
                class="btn-preset"
                :class="{ 'btn-preset--active': isPresetActive('6hari_minggu_libur') }"
                @click="pilihPresetHari('6hari_minggu_libur')"
              >
                <i class="bi bi-calendar2-check me-1"></i> 6 Hari (Sen - Sab)
              </button>
              <button
                type="button"
                class="btn-preset"
                :class="{ 'btn-preset--active': isPresetActive('6hari_senin_libur') }"
                @click="pilihPresetHari('6hari_senin_libur')"
              >
                <i class="bi bi-calendar2-check me-1"></i> 6 Hari (Sel - Min)
              </button>
              <button
                type="button"
                class="btn-preset"
                :class="{ 'btn-preset--active': isPresetActive('7hari') }"
                @click="pilihPresetHari('7hari')"
              >
                <i class="bi bi-calendar2-check me-1"></i> Semua Hari (7 Hari)
              </button>
            </div>
          </div>

          <!-- Pemilihan Hari Manual (7 Hari) -->
          <div class="mb-3">
            <label class="form-label-custom">Pilih / Sesuaikan Hari Masuk PKL:</label>
            <div class="days-selector-grid">
              <div
                v-for="h in SEMUA_HARI"
                :key="'toggle-' + h"
                class="day-toggle-card"
                :class="{ 'day-toggle-card--selected': tempHariPkl.includes(h) }"
                @click="toggleHari(h)"
              >
                <div class="day-toggle-card__left">
                  <div class="day-checkbox">
                    <i v-if="tempHariPkl.includes(h)" class="bi bi-check-lg"></i>
                  </div>
                  <div>
                    <div class="day-name">{{ h }}</div>
                    <div class="day-hint">{{ h === 'Minggu' ? 'Akhir Pekan' : (h === 'Sabtu' ? 'Akhir Pekan' : 'Hari Kerja') }}</div>
                  </div>
                </div>
                <span class="day-status-pill" :class="tempHariPkl.includes(h) ? 'day-status-pill--work' : 'day-status-pill--off'">
                  {{ tempHariPkl.includes(h) ? 'Berangkat' : 'Libur' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Ringkasan Jadwal -->
          <div class="summary-box">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <span class="small text-secondary">Ringkasan Jadwal Terpilih:</span>
                <div class="fw-bold text-white fs-6">
                  {{ ringkasanTempHari }}
                </div>
              </div>
              <div class="text-end">
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1">
                  {{ tempHariPkl.length }} Hari Berangkat &bull; {{ 7 - tempHariPkl.length }} Hari Libur
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-card-custom__footer">
          <button class="btn btn-outline-secondary rounded-pill px-4" @click="modalHariPklOpen = false">
            Batal
          </button>
          <button class="btn btn-primary rounded-pill px-4" :disabled="isSavingHariPkl" @click="simpanHariPkl">
            <i v-if="isSavingHariPkl" class="spinner-border spinner-border-sm me-1"></i>
            <i v-else class="bi bi-cloud-arrow-up-fill me-1"></i>
            {{ isSavingHariPkl ? 'Menyimpan...' : 'Simpan & Upload Jadwal' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Key Metrics Overview ===== -->
    <div class="section-heading mb-3">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-bar-chart-fill text-primary"></i>
        <h2 class="section-title">Statistik & Kinerja Jurnal</h2>
      </div>
      <span class="section-subtitle">Ringkasan pengisian dan kepatuhan jurnal PKL</span>
    </div>

    <div class="row g-3 mb-4">
      <!-- Metrik 1: Total Jurnal -->
      <div class="col-lg-4 col-md-6 col-6">
        <nuxt-link to="/jurnal" class="text-decoration-none">
          <div class="metric-card metric-card--blue">
            <div class="metric-card__watermark">
              <i class="bi bi-journal-text"></i>
            </div>
            <div class="metric-card__header">
              <span class="metric-card__label">Total Jurnal Harian</span>
              <span class="metric-card__chip">Lihat Semua <i class="bi bi-arrow-right"></i></span>
            </div>
            <div class="metric-card__body">
              <div class="metric-card__number">{{ countJournal }}</div>
              <div class="metric-card__desc">Aktivitas harian tercatat di sistem</div>
            </div>
          </div>
        </nuxt-link>
      </div>

      <!-- Metrik 2: Validasi Pembimbing -->
      <div class="col-lg-4 col-md-6 col-6">
        <nuxt-link to="/jurnal" class="text-decoration-none">
          <div class="metric-card" :class="countJournalNotValid > 0 ? 'metric-card--amber' : 'metric-card--emerald'">
            <div class="metric-card__watermark">
              <i :class="countJournalNotValid > 0 ? 'bi bi-hourglass-split' : 'bi bi-check2-circle'"></i>
            </div>
            <div class="metric-card__header">
              <span class="metric-card__label">Status Validasi</span>
              <span class="metric-card__chip" :class="countJournalNotValid > 0 ? 'metric-card__chip--amber' : 'metric-card__chip--emerald'">
                {{ countJournalNotValid > 0 ? 'Menunggu' : 'Tervalidasi' }}
              </span>
            </div>
            <div class="metric-card__body">
              <div class="metric-card__number">{{ countJournalNotValid }}</div>
              <div class="metric-card__desc">
                {{ countJournalNotValid > 0 ? 'Jurnal belum divalidasi pembimbing' : 'Semua jurnal telah selesai divalidasi ✓' }}
              </div>
            </div>
          </div>
        </nuxt-link>
      </div>

      <!-- Metrik 3: Kesesuaian Elemen CP -->
      <div class="col-lg-4 col-md-12 col-12">
        <div class="metric-card metric-card--purple">
          <div class="metric-card__watermark">
            <i class="bi bi-award"></i>
          </div>
          <div class="metric-card__header">
            <span class="metric-card__label">Kesesuaian Elemen CP</span>
            <button class="btn-info-circle" data-bs-toggle="modal" data-bs-target="#info-aktivitas" title="Informasi Perhitungan">
              <i class="bi bi-info-circle-fill"></i>
            </button>
          </div>
          <div class="metric-card__body">
            <div class="d-flex align-items-baseline gap-2">
              <div class="metric-card__number">{{ prosentaseAktivitasJurnal }}%</div>
              <span class="rating-badge" :class="prosentaseAktivitasJurnal >= 80 ? 'rating-badge--good' : 'rating-badge--warn'">
                {{ descAktivitasJurnal || 'Belum Terhitung' }}
              </span>
            </div>
            <div class="progress-bar-modern mt-2">
              <div class="progress-bar-modern__fill" :style="{ width: `${prosentaseAktivitasJurnal}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Info Aktivitas -->
    <div class="modal fade" id="info-aktivitas" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modern-modal">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title d-flex align-items-center gap-2">
              <i class="bi bi-info-circle-fill text-primary"></i> Perhitungan Kesesuaian Aktivitas
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-3">
            <p class="text-secondary small mb-2">
              Persentase aktivitas dihitung secara proporsional dari jurnal yang memuat <strong>Elemen CP (Capaian Pembelajaran)</strong> yang relevan dengan jurusan dan telah disetujui serta divalidasi oleh Guru Pembimbing.
            </p>
            <div class="formula-box p-3 rounded-3">
              <div class="small fw-bold text-white mb-1"><i class="bi bi-calculator me-1"></i> Rumus:</div>
              <code class="text-primary">(Jurnal Sesuai Elemen ÷ Total Jurnal) × 100%</code>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-primary btn-sm rounded-pill px-4" data-bs-dismiss="modal">Mengerti</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Team Members ("Temen Satu Tim") ===== -->
    <div class="team-section mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="section-heading mb-0">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-people-fill text-primary"></i>
            <h2 class="section-title">Rekan Satu Tim PKL</h2>
          </div>
          <span class="section-subtitle">Teman satu kelompok di lokasi PKL yang sama</span>
        </div>
        <button v-if="!editingTeman && !isInstansi && !isGuru" class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="mulaiEditTeman">
          <i class="bi bi-pencil-fill me-1"></i> Kelola Tim
        </button>
      </div>

      <div class="team-card">
        <Loading v-if="isLoading" />
        <div v-else>
          <!-- Mode Edit Teman -->
          <div v-if="editingTeman" class="p-3">
            <label class="small text-secondary mb-2 fw-semibold">
              <i class="bi bi-info-circle me-1"></i> Tulis satu rekan per baris dengan format: <code>Nama - Kelas</code>
            </label>
            <textarea v-model="temanTimText" class="form-control form-control-sm modern-textarea" rows="4" placeholder="Contoh:&#10;Aisyah - XII PPLG 3&#10;Budi Santoso - XII PPLG 3"></textarea>
            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-sm btn-primary rounded-pill px-3" :disabled="isSavingTeman" @click="simpanTemanTim">
                {{ isSavingTeman ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>
              <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="editingTeman = false">Batal</button>
            </div>
          </div>

          <!-- List Teman Tim -->
          <div v-else>
            <div v-if="temanTimRows.length > 0" class="team-grid p-3">
              <div v-for="(t, i) in temanTimRows" :key="'tim-' + i" class="member-chip">
                <div class="member-avatar">
                  <i class="bi bi-person-fill"></i>
                </div>
                <div class="member-info">
                  <div class="member-name text-truncate">{{ t.nama }}</div>
                  <div v-if="t.kelas" class="member-role">{{ t.kelas }}</div>
                </div>
              </div>
            </div>
            <div v-else-if="pemetaan.length > 0" class="team-grid p-3">
              <div v-for="p in pemetaan" :key="p.id" class="member-chip">
                <div class="member-avatar">
                  <i class="bi bi-person-fill"></i>
                </div>
                <div class="member-info">
                  <div class="member-name text-truncate">{{ p.expand.siswa.nama }}</div>
                  <div class="member-role">{{ p.expand.siswa.kelas }}</div>
                </div>
              </div>
            </div>
            <div v-else class="empty-team-state p-4 text-center">
              <div class="empty-team-icon mb-2">
                <i class="bi bi-person-badge"></i>
              </div>
              <div class="text-white fw-semibold mb-1">Belum Ada Rekan Tim Tercatat</div>
              <div class="text-muted small">Kamu saat ini tercatat melaksanakan PKL secara mandiri di lokasi ini.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Rekapan Bulanan ===== -->
    <div class="recap-section mb-4">
      <div class="section-heading mb-3">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-calendar2-check-fill text-primary"></i>
          <h2 class="section-title">Rekapan Kehadiran Bulanan</h2>
        </div>
        <span class="section-subtitle">Ringkasan riwayat presensi yang telah diverifikasi sistem</span>
      </div>

      <Loading v-if="isLoading" />
      <div v-else class="row g-3">
        <div v-for="r in rekapanList" :key="r.id" class="col-lg-4 col-md-6">
          <div class="recap-card">
            <div class="recap-card__header">
              <div class="recap-card__title">
                <i class="bi bi-calendar-event me-2 text-primary"></i>
                {{ NAMA_BULAN[r.bulan - 1] }} {{ r.tahun }}
              </div>
              <span class="recap-card__badge">
                {{ Math.round((r.hadir / ((r.hadir + r.sakit + r.izin + r.alpa) || 1)) * 100) }}% Hadir
              </span>
            </div>

            <div class="recap-card__grid">
              <div class="recap-stat recap-stat--success">
                <span class="recap-stat__icon"><i class="bi bi-check-lg"></i></span>
                <span class="recap-stat__label">Hadir</span>
                <span class="recap-stat__value">{{ r.hadir }}</span>
              </div>
              <div class="recap-stat recap-stat--warning">
                <span class="recap-stat__icon">S</span>
                <span class="recap-stat__label">Sakit</span>
                <span class="recap-stat__value">{{ r.sakit }}</span>
              </div>
              <div class="recap-stat recap-stat--info">
                <span class="recap-stat__icon">I</span>
                <span class="recap-stat__label">Izin</span>
                <span class="recap-stat__value">{{ r.izin }}</span>
              </div>
              <div class="recap-stat recap-stat--danger">
                <span class="recap-stat__icon"><i class="bi bi-x-lg"></i></span>
                <span class="recap-stat__label">Alpa</span>
                <span class="recap-stat__value">{{ r.alpa }}</span>
              </div>
              <div class="recap-stat recap-stat--secondary">
                <span class="recap-stat__icon">L</span>
                <span class="recap-stat__label">Libur</span>
                <span class="recap-stat__value">{{ r.libur || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="rekapanList.length < 1" class="col-12">
          <div class="empty-recap-card p-4 text-center">
            <i class="bi bi-calendar-x fs-2 text-muted mb-2 d-block"></i>
            <div class="text-white fw-semibold mb-1">Belum Ada Rekapan Bulanan</div>
            <div class="text-secondary small">Rekapitulasi bulanan otomatis dibuat setelah ada data absensi di menu Presensi PKL.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Button Mobile -->
    <M3Fab
      v-if="!isInstansi && !isGuru && pemetaan.length > 0 && peserta?.guru_pembimbing != '' && !havePostJournalToday"
      to="/jurnal/tambah"
      icon="bi-pencil-square"
      label="Buat Jurnal Hari Ini"
      size="regular"
      variant="primary"
      position="br"
      :nav-bar-safe="true"
      :mobile-only="true"
    />
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
useHead({ title: "Dashboard — e-PKL / SMK AL-FATAH BANJARNEGARA" })

let user = usePocketBaseUser()
let client = usePocketBaseClient()
let prokel = user.user.value?.program_keahlian
let isInstansi = user.user.value?.role === 'instansi'
let isGuru = user.user.value?.role === 'guru'

let listSiswaOption = ref([])
let selectedSiswaUserId = ref(null)

let guruJurusanNama = ref('')
let listJurusanOption = ref([])
let selectedJurusanFilter = ref('all')

const showSiswaModal = ref(false)
const searchSiswaText = ref('')

const currentSelectedSiswa = computed(() => {
  return listSiswaOption.value.find(s => s.userId === selectedSiswaUserId.value) || listSiswaOption.value[0] || null
})

const filteredModalSiswaList = computed(() => {
  if (!searchSiswaText.value.trim()) return listSiswaOption.value
  const q = searchSiswaText.value.toLowerCase().trim()
  return listSiswaOption.value.filter(s =>
    (s.nama || '').toLowerCase().includes(q) ||
    (s.kelas || '').toLowerCase().includes(q) ||
    (s.jurusan || '').toLowerCase().includes(q)
  )
})

function pilihSiswa(opt) {
  selectedSiswaUserId.value = opt.userId
  showSiswaModal.value = false
  onChangeSiswa()
}

let pesertaJurusan = computed(() => peserta.value?.expand?.program_keahlian?.nama || peserta.value?.expand?.program_keahlian?.alias || '')
let pesertaKonsentrasi = computed(() => peserta.value?.expand?.program_keahlian?.konsentrasi_keahlian || '')

let isLoading = ref(true)
let isLoadingJournaToday = ref(true)
let countJournal = ref(0)
let countJournalNotValid = ref(0)
let countJournalSesuaiElemen = ref(0)
let countJournalTidakSesuaiElemen = ref(0)
let prosentaseAktivitasJurnal = ref(0)
let descAktivitasJurnal = ref('')
let pemetaan = ref([])
let iduka = ref()
let peserta = ref()
let emptyPemetaan = ref(false)
let fotoUrl = computed(() => {
  const p = peserta.value
  if (!p?.foto?.length) return ''
  return client.baseUrl + '/api/files/siswa/' + p.id + '/' + p.foto + '?t=' + (p.updated ? encodeURIComponent(p.updated) : Date.now())
})
let guruNamaTampil = computed(() => {
  const g = peserta.value?.expand?.guru_pembimbing
  if (!g) return ''
  if (Array.isArray(g)) return g.map(x => x?.nama).filter(Boolean).join(', ')
  return g.nama || ''
})
let editingKelas = ref(false)
let kelasText = ref('')
let editingIduka = ref(false)
let idukaNama = ref('')
let idukaAlamat = ref('')
let editingGuru = ref(false)
let guruList = ref([])
let guruPilih = ref('')
let showFoto = ref(false)
let today = useServerDay()
let havePostJournalToday = ref(false)
let countDraftJournal = ref(0)
let countUnreadJournalComment = ref(0)
let isLoadingJournalSesuaiTidakSesuai = ref(true)

// ========================================================================
//  FITUR HARI PKL (Jadwal Hari Kerja PKL Siswa & Tempat PKL)
// ========================================================================
const SEMUA_HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const KODE_HARI = {
  Senin: 'Sen',
  Selasa: 'Sel',
  Rabu: 'Rab',
  Kamis: 'Kam',
  Jumat: 'Jum',
  Sabtu: 'Sab',
  Minggu: 'Min'
}
const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

let hariPklList = ref(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'])
let modalHariPklOpen = ref(false)
let tempHariPkl = ref([])
let isSavingHariPkl = ref(false)

const hariIni = computed(() => {
  const d = new Date()
  return NAMA_HARI[d.getDay()]
})

const isHariPklHariIni = computed(() => {
  return hariPklList.value.includes(hariIni.value)
})

function formatRingkasanHari(list) {
  if (!list || !list.length) return 'Belum Diatur'
  if (list.length === 7) return 'Setiap Hari (Senin - Minggu)'

  const seninJumat = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
  if (list.length === 5 && seninJumat.every(h => list.includes(h))) {
    return 'Senin - Jumat (5 Hari Kerja)'
  }

  const seninSabtu = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  if (list.length === 6 && seninSabtu.every(h => list.includes(h))) {
    return 'Senin - Sabtu (6 Hari Kerja)'
  }

  const selasaMinggu = ['Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
  if (list.length === 6 && selasaMinggu.every(h => list.includes(h))) {
    return 'Selasa - Minggu (Senin Libur)'
  }

  return `${list.length} Hari (${list.map(h => KODE_HARI[h] || h).join(', ')})`
}

const ringkasanHariPkl = computed(() => formatRingkasanHari(hariPklList.value))
const ringkasanTempHari = computed(() => formatRingkasanHari(tempHariPkl.value))

function loadHariPkl() {
  const raw = idukaRow.value?.hari_pkl || peserta.value?.hari_pkl
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        hariPklList.value = parsed
        return
      }
    } catch (e) {
      const parts = String(raw).split(',').map(s => s.trim()).filter(Boolean)
      if (parts.length > 0) {
        hariPklList.value = parts
        return
      }
    }
  }
  // Default jika belum pernah diset: Senin - Jumat (5 hari)
  hariPklList.value = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
}

function bukaModalHariPkl() {
  tempHariPkl.value = [...hariPklList.value]
  modalHariPklOpen.value = true
}

function toggleHari(h) {
  const idx = tempHariPkl.value.indexOf(h)
  if (idx > -1) {
    if (tempHariPkl.value.length === 1) {
      alert('Pilih minimal 1 hari keberangkatan PKL!')
      return
    }
    tempHariPkl.value.splice(idx, 1)
  } else {
    const urut = SEMUA_HARI.filter(d => tempHariPkl.value.includes(d) || d === h)
    tempHariPkl.value = urut
  }
}

function pilihPresetHari(preset) {
  if (preset === '5hari') {
    tempHariPkl.value = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
  } else if (preset === '6hari_minggu_libur') {
    tempHariPkl.value = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  } else if (preset === '6hari_senin_libur') {
    tempHariPkl.value = ['Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
  } else if (preset === '7hari') {
    tempHariPkl.value = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
  }
}

function isPresetActive(preset) {
  const list = tempHariPkl.value
  if (preset === '5hari') {
    const sj = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
    return list.length === 5 && sj.every(h => list.includes(h))
  }
  if (preset === '6hari_minggu_libur') {
    const ss = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    return list.length === 6 && ss.every(h => list.includes(h))
  }
  if (preset === '6hari_senin_libur') {
    const sm = ['Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
    return list.length === 6 && sm.every(h => list.includes(h))
  }
  if (preset === '7hari') {
    return list.length === 7
  }
  return false
}

async function simpanHariPkl() {
  if (tempHariPkl.value.length === 0) {
    alert('Pilih minimal 1 hari keberangkatan PKL!')
    return
  }
  isSavingHariPkl.value = true
  const jsonVal = JSON.stringify(tempHariPkl.value)
  try {
    if (idukaRow.value?.id) {
      await client.collection('iduka').update(idukaRow.value.id, {
        hari_pkl: jsonVal
      })
      idukaRow.value.hari_pkl = jsonVal
    }
    if (user.user.value?.siswa) {
      await client.collection('siswa').update(user.user.value.siswa, {
        hari_pkl: jsonVal
      })
      if (peserta.value) peserta.value.hari_pkl = jsonVal
    }
    hariPklList.value = [...tempHariPkl.value]
    modalHariPklOpen.value = false
  } catch (err) {
    alert('Gagal menyimpan hari PKL: ' + (err?.response?.message || err?.message))
  } finally {
    isSavingHariPkl.value = false
  }
}

// ========================================================================
//  DATA FETCHING & REKAPAN
// ========================================================================
async function getCountJournal(loading=true) {
  isLoading.value = loading
  client.autoCancellation(false)
  let base = (isGuru || isInstansi)
    ? `siswa='${selectedSiswaUserId.value || "tidak-ada"}'`
    : `siswa='${user.user.value.id}'`
  let res_journal = await client.collection('jurnal').getFullList({
    filter: base,
    fields: "id",
  })
  let filterNotValid = base ? base + ` && isValid=false` : `isValid=false`
  let res_journal2 = await client.collection('jurnal').getFullList({
    filter: filterNotValid,
    fields: `id`
  })
  if(res_journal && res_journal2) {
    isLoading.value = false
    countJournal.value = res_journal.length
    countJournalNotValid.value = res_journal2.length
  }
}

async function getCountJournalSesuaiTidakSesuai(loading=true) {
  isLoadingJournalSesuaiTidakSesuai.value = loading
  let f = (isGuru || isInstansi)
    ? `siswa='${selectedSiswaUserId.value || "tidak-ada"}' && `
    : `siswa="${user.user.value.id}" && `
  let res_jurnal = await client.collection('jurnal').getList(1,1, {
    filter: f.replace(/ && $/, '')
  })
  let res_tidak_sesuai = await client.collection('jurnal').getList(1,1, {
    filter: f ? f + `elemen.elemen="Lain-lain"` : `elemen.elemen="Lain-lain"`
  })
  let res_sesuai = { totalItems: res_jurnal.totalItems - res_tidak_sesuai.totalItems }

  if(res_jurnal && res_tidak_sesuai) {
    isLoadingJournalSesuaiTidakSesuai.value = false
    countJournalSesuaiElemen.value = res_sesuai.totalItems
    countJournalTidakSesuaiElemen.value = res_tidak_sesuai.totalItems
    
    prosentaseAktivitasJurnal.value = Math.round((res_sesuai.totalItems / res_jurnal.totalItems) * 100 || 0)

    if(prosentaseAktivitasJurnal.value >= 95) descAktivitasJurnal.value = "Aktivitasmu Sangat Sesuai"
    else if(prosentaseAktivitasJurnal.value > 89) descAktivitasJurnal.value = "Aktivitasmu Sesuai"
    else if(prosentaseAktivitasJurnal.value > 79) descAktivitasJurnal.value = "Aktivitasmu Cukup Sesuai"
    else descAktivitasJurnal.value = "Aktivitasmu Kurang Sesuai"
  }
}

async function getInfo(loading=true) {
  isLoading.value = loading
  client.autoCancellation(false)
  try {
    let siswaId = user.user.value?.siswa || ''
    if (isInstansi || isGuru) {
      let opt = listSiswaOption.value.find(x => x.userId === selectedSiswaUserId.value)
      siswaId = opt ? opt.siswaId : ''
    }
    if (!siswaId) {
      emptyPemetaan.value = true
      return
    }
    let res_siswa = await client.collection('siswa').getOne(siswaId, {
      expand: "program_keahlian, guru_pembimbing"
    })

    let res_iduka = await client.collection('pemetaan').getList(1,1, {
      filter: "siswa='"+siswaId+"'",
      expand: "iduka, iduka.pembimbing_sekolah, program_keahlian, siswa"
    })

    if(res_iduka && res_siswa) {
      peserta.value = res_siswa
      if(res_iduka.items.length > 0) {
        let res_pemetaan = await client.collection('pemetaan').getFullList({
          filter: "iduka='"+res_iduka?.items[0].iduka+"' && siswa!='"+siswaId+"'",
          expand: "iduka, siswa"
        })
        if(res_pemetaan) {
          iduka.value = res_iduka
          pemetaan.value = res_pemetaan
          emptyPemetaan.value = false
        }
      } else {
        emptyPemetaan.value = true
      }
      loadHariPkl()
    }
  } catch (e) {
    console.error('[home] getInfo gagal:', e)
    emptyPemetaan.value = true
  } finally {
    isLoading.value = false
  }
}

async function isTodayPostJournal() {
  if (isGuru || isInstansi) { isLoadingJournaToday.value = false; return }
  try {
    isLoadingJournaToday.value = true
    let siswaFilter = user.user.value.id
    let response = await client.collection('jurnal').getFirstListItem(`siswa="${siswaFilter || 'tidak-ada'}"`, {
      sort: "-created"
    })
    if(response) {
      let res = response
      const date = new Date(res.created)
      const options = { dateStyle: "long" }
      res.created = new Intl.DateTimeFormat('id-ID', options).format(date)
      if(res.created == today) havePostJournalToday.value = true
      isLoadingJournaToday.value = false
    }
  } catch(error) {
    isLoadingJournaToday.value = false
  }
}

async function uploadFoto(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!file) return
  try {
    await client.collection('siswa').update(user.user.value.siswa, { foto: file })
    await getInfo(false)
  } catch (err) {
    alert('Gagal mengunggah foto: ' + (err?.response?.message || err?.message))
  }
}

function mulaiEditKelas() {
  if (editingKelas.value) return
  kelasText.value = peserta.value?.kelas || ''
  editingKelas.value = true
}

async function simpanKelas() {
  if (!editingKelas.value) return
  editingKelas.value = false
  try {
    const res = await client.collection('siswa').update(user.user.value.siswa, { kelas: kelasText.value })
    peserta.value.kelas = res.kelas
  } catch (err) {
    alert('Gagal menyimpan kelas: ' + (err?.response?.message || err?.message))
  }
}

let editingTeman = ref(false)
let isSavingTeman = ref(false)
let temanTimText = ref('')
let temanTimRows = computed(() => {
  const raw = peserta.value?.teman_satu_tim || ''
  return String(raw).split('\n').map(s => s.trim()).filter(Boolean).map(line => {
    const m = line.split(/\s+-\s+/)
    if (m.length >= 2) return { nama: m[0].trim(), kelas: m.slice(1).join(' - ').trim() }
    return { nama: line, kelas: '' }
  })
})

function mulaiEditTeman() {
  if (editingTeman.value) return
  temanTimText.value = peserta.value?.teman_satu_tim || ''
  editingTeman.value = true
}

async function simpanTemanTim() {
  isSavingTeman.value = true
  try {
    const res = await client.collection('siswa').update(user.user.value.siswa, { teman_satu_tim: temanTimText.value })
    peserta.value.teman_satu_tim = res.teman_satu_tim
    editingTeman.value = false
  } catch (err) {
    alert('Gagal menyimpan temen satu tim: ' + (err?.response?.message || err?.message))
  }
  isSavingTeman.value = false
}

function mulaiEditIduka() {
  if (editingIduka.value) return
  const id = iduka.value?.items?.[0]?.expand?.iduka
  idukaNama.value = id?.nama || ''
  idukaAlamat.value = id?.alamat || ''
  editingIduka.value = true
}

async function simpanIduka() {
  if (!editingIduka.value) return
  if (!idukaNama.value.trim()) { alert('Nama tempat PKL tidak boleh kosong'); return }
  try {
    const first = iduka.value?.items?.[0]
    if (first) {
      const res = await client.collection('iduka').update(first.iduka, {
        nama: idukaNama.value.trim(),
        alamat: idukaAlamat.value.trim()
      })
      first.expand.iduka.nama = res.nama
      first.expand.iduka.alamat = res.alamat
      editingIduka.value = false
    } else {
      const newIduka = await client.collection('iduka').create({
        nama: idukaNama.value.trim(),
        alamat: idukaAlamat.value.trim()
      })
      try {
        await client.collection('pemetaan').create({
          iduka: newIduka.id,
          siswa: user.user.value.siswa,
          program_keahlian: prokel || ''
        })
      } catch (errPem) {
        alert('Tempat PKL tersimpan, tetapi gagal membuat pemetaan: ' + (errPem?.response?.message || errPem?.message))
        await getInfo(false)
        return
      }
      await getInfo(false)
      editingIduka.value = false
    }
  } catch (err) {
    alert('Gagal menyimpan tempat PKL: ' + (err?.response?.message || err?.message))
  }
}

const idukaRow = computed(() => iduka.value?.items?.[0]?.expand?.iduka)
const rapihJam = (j) => (j || '').trim().replace(':', '.')
const jamMulai = computed(() => rapihJam(idukaRow.value?.jam_mulai))
const jamSelesai = computed(() => rapihJam(idukaRow.value?.jam_selesai))
let editingJam = ref(false)
let jamMulaiText = ref('')
let jamSelesaiText = ref('')

function mulaiEditJam() {
  if (editingJam.value) return
  jamMulaiText.value = idukaRow.value?.jam_mulai || ''
  jamSelesaiText.value = idukaRow.value?.jam_selesai || ''
  editingJam.value = true
}

async function simpanJam() {
  if (!editingJam.value) return
  if (!idukaRow.value?.id) { editingJam.value = false; return }
  try {
    const res = await client.collection('iduka').update(idukaRow.value.id, {
      jam_mulai: jamMulaiText.value,
      jam_selesai: jamSelesaiText.value
    })
    idukaRow.value.jam_mulai = res.jam_mulai
    idukaRow.value.jam_selesai = res.jam_selesai
    editingJam.value = false
  } catch (err) {
    alert('Gagal menyimpan jam PKL: ' + (err?.response?.message || err?.message))
  }
}

async function mulaiEditGuru() {
  if (editingGuru.value) return
  editingGuru.value = true
  const cur = peserta.value?.expand?.guru_pembimbing
  guruPilih.value = Array.isArray(cur) ? (cur[0]?.id || '') : (cur?.id || '')
  try {
    guruList.value = await client.collection('teacher_users').getFullList({ sort: 'nama', fields: 'id,nama' })
  } catch (err) {
    guruList.value = []
    alert('Gagal memuat daftar guru: ' + (err?.response?.message || err?.message))
  }
}

async function simpanGuru() {
  try {
    await client.collection('siswa').update(user.user.value.siswa, { guru_pembimbing: guruPilih.value ? [guruPilih.value] : [] })
    await getInfo(false)
  } catch (err) {
    alert('Gagal menyimpan guru pembimbing: ' + (err?.response?.message || err?.message))
  }
}

async function getCountDraftJournal() {
  let filter = (isGuru || isInstansi)
    ? `siswa="${selectedSiswaUserId.value || 'tidak-ada'}" && isDraft=true`
    : `siswa="${user.user.value.id}" && isDraft=true`
  let res = await client.collection('jurnal').getFullList({ filter })
  if(res) {
    countDraftJournal.value = res.length
  }
}

async function getCountUnreadJournalComment() {
  let filter = (isGuru || isInstansi)
    ? `idJurnal.siswa.id="${selectedSiswaUserId.value || 'tidak-ada'}" && isOpen=false`
    : `idJurnal.siswa.id="${user.user.value.id}" && isOpen=false`
  let res = await client.collection('jurnal_komentar').getList(1,1, { filter })
  if(res) {
    countUnreadJournalComment.value = res.totalItems
  }
}

let rekapanList = ref([])
const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

async function getRekapan() {
  client.autoCancellation(false)
  try {
    const filter = (isGuru || isInstansi)
      ? `user="${selectedSiswaUserId.value || 'tidak-ada'}"`
      : `user="${user.user.value.id}"`
    rekapanList.value = await client.collection('rekapan_bulanan').getFullList({
      filter,
      sort: '-tahun,-bulan'
    })
  } catch {
    rekapanList.value = []
  }
}

async function generateRekapanOtomatis() {
  if (isInstansi) return
  client.autoCancellation(false)
  try {
    const now = new Date()
    const nowBulan = now.getMonth() + 1
    const nowTahun = now.getFullYear()
    const periode = []
    for (let b = 1; b <= 12; b++) periode.push({ bulan: b, tahun: nowTahun - 1 })
    for (let b = 1; b < nowBulan; b++) periode.push({ bulan: b, tahun: nowTahun })
    const absenAll = await client.collection('absen').getFullList({
      filter: `user="${user.user.value.id}"`,
      fields: 'id,marks,bulan,tahun'
    })
    for (const p of periode) {
      const rows = absenAll.filter(a => Number(a.bulan) === p.bulan && Number(a.tahun) === p.tahun)
      if (rows.length < 1) continue
      let hadir = 0, sakit = 0, izin = 0, alpa = 0
      const terisi = new Set()
      for (const r of rows) {
        const marks = r.marks || {}
        for (const k of Object.keys(marks)) {
          if (!marks[k]) continue
          const hn = Number(k)
          if (hn >= 1 && hn <= 31) terisi.add(hn)
          if (marks[k] === 'v') hadir++
          else if (marks[k] === 's') sakit++
          else if (marks[k] === 'i') izin++
          else if (marks[k] === 'x') alpa++
        }
      }
      const hariDalamBulan = new Date(p.tahun, p.bulan, 0).getDate()
      let libur = 0
      for (let d = 1; d <= hariDalamBulan; d++) if (!terisi.has(d)) libur++
      const data = { user: user.user.value.id, bulan: p.bulan, tahun: p.tahun, hadir, sakit, izin, alpa, libur }
      const existing = rekapanList.value.find(r => Number(r.bulan) === p.bulan && Number(r.tahun) === p.tahun)
      if (existing) await client.collection('rekapan_bulanan').update(existing.id, data)
      else await client.collection('rekapan_bulanan').create(data)
    }
    await getRekapan()
  } catch { /* diamkan */ }
}

async function fetchSiswaOptions() {
  if (!isInstansi && !isGuru) return
  client.autoCancellation(false)
  try {
    let options = []
    if (isInstansi) {
      const opsiPemetaan = { expand: 'siswa,program_keahlian', sort: '-created' }
      const idukaId = user.user.value?.iduka
      if (!idukaId) {
        listSiswaOption.value = []
        selectedSiswaUserId.value = null
        return
      }
      opsiPemetaan.filter = `iduka='${idukaId}'`
      let pem = await client.collection('pemetaan').getFullList(opsiPemetaan)
      const siswaIds = pem.map(p => p.expand?.siswa?.id).filter(Boolean)
      let userAccs = siswaIds.length
        ? await client.collection('student_users').getList(1, 50, { filter: siswaIds.map(id => `siswa='${id}'`).join(' || ') }).then(r => r.items)
        : []
      
      for (let p of pem) {
        if (p.expand?.siswa) {
          let s = p.expand.siswa
          let u = userAccs.find(x => x.siswa === s.id)
          if (u) {
            options.push({ userId: u.id, siswaId: s.id, nama: s.nama, kelas: s.kelas, jurusan: p.expand?.program_keahlian?.nama || '' })
          }
        }
      }
    } else if (isGuru) {
      let allPk = []
      try {
        allPk = await client.collection('program_keahlian').getFullList({ sort: 'nama' })
        listJurusanOption.value = allPk
      } catch (errPk) {
        console.warn('[home] Gagal memuat daftar program_keahlian:', errPk)
      }

      let guruPk = user.user.value?.program_keahlian || []
      if (!Array.isArray(guruPk)) guruPk = guruPk ? [guruPk] : []

      if (!guruPk.length) {
        const uname = (user.user.value?.username || user.user.value?.nama || '').toLowerCase()
        for (const pk of allPk) {
          const nm = (pk.nama || '').toLowerCase()
          if (nm && uname.includes(nm)) {
            guruPk.push(pk.id)
            break
          }
        }
      }

      const matchingPk = allPk.filter(p => guruPk.includes(p.id))
      if (matchingPk.length === 1) {
        guruJurusanNama.value = matchingPk[0].nama
        if (selectedJurusanFilter.value === 'all') {
          selectedJurusanFilter.value = matchingPk[0].id
        }
      } else if (matchingPk.length > 1) {
        guruJurusanNama.value = matchingPk.map(p => p.nama).join(', ')
      }

      let targetPk = (selectedJurusanFilter.value && selectedJurusanFilter.value !== 'all')
        ? selectedJurusanFilter.value
        : (guruPk.length === 1 ? guruPk[0] : null)

      let filterAcc = ''
      if (targetPk) {
        filterAcc = `program_keahlian='${targetPk}' || siswa.program_keahlian='${targetPk}'`
      } else if (guruPk.length > 1) {
        filterAcc = guruPk.map(id => `program_keahlian='${id}' || siswa.program_keahlian='${id}'`).join(' || ')
      }

      const accs = await client.collection('student_users').getFullList({
        filter: filterAcc || undefined,
        expand: 'siswa,program_keahlian',
        sort: 'username'
      })

      for (let u of accs) {
        if (u.expand?.siswa) {
          let s = u.expand.siswa
          let pkName = u.expand?.program_keahlian?.nama || s.expand?.program_keahlian?.nama || ''
          options.push({
            userId: u.id,
            siswaId: s.id,
            nama: s.nama,
            kelas: s.kelas,
            jurusan: pkName
          })
        }
      }
    }

    const unique = []
    const map = new Map()
    for (const item of options) {
      if (!map.has(item.siswaId)) {
        map.set(item.siswaId, true)
        unique.push(item)
      }
    }
    listSiswaOption.value = unique

    if (unique.length > 0) {
      const masihValid = selectedSiswaUserId.value && unique.find(x => x.userId === selectedSiswaUserId.value)
      if (!masihValid) {
        const saved = localStorage.getItem('selectedSiswaUserId')
        if (saved && unique.find(x => x.userId === saved)) {
          selectedSiswaUserId.value = saved
        } else {
          selectedSiswaUserId.value = unique[0].userId
        }
        localStorage.setItem('selectedSiswaUserId', selectedSiswaUserId.value)
      }
    } else {
      selectedSiswaUserId.value = null
    }
  } catch (e) {
    console.error('[home] Gagal memuat daftar siswa pemantauan:', e)
  }
}

async function onJurusanFilterChange() {
  await fetchSiswaOptions()
  await onChangeSiswa()
}

async function onChangeSiswa() {
  localStorage.setItem('selectedSiswaUserId', selectedSiswaUserId.value)
  isLoading.value = true
  await getInfo()
  getCountJournal()
  getCountJournalSesuaiTidakSesuai()
  getCountDraftJournal()
  getCountUnreadJournalComment()
  getRekapan()
  isTodayPostJournal()
}

onMounted(async () => {
  if (isGuru || isInstansi) await fetchSiswaOptions()

  getCountJournal()
  getInfo()
  isTodayPostJournal()
  getCountDraftJournal()
  getCountUnreadJournalComment()
  getCountJournalSesuaiTidakSesuai()
  getRekapan().then(() => generateRekapanOtomatis())
  client.autoCancellation(false)
  client.collection('pemetaan').subscribe('*', async function(e){
    if(e.action == 'create' || e.action == 'update') {
      await fetchSiswaOptions()
      if (e.action == 'create' && e.record?.siswa) {
        const opsiBaru = listSiswaOption.value.find(o => o.siswaId === e.record.siswa)
        if (opsiBaru) {
          selectedSiswaUserId.value = opsiBaru.userId
          localStorage.setItem('selectedSiswaUserId', opsiBaru.userId)
        }
      }
      if (!listSiswaOption.value.find(o => o.userId === selectedSiswaUserId.value)) {
        selectedSiswaUserId.value = listSiswaOption.value[0]?.userId || null
      }
      getInfo()
      getCountJournal()
      getCountDraftJournal()
      getCountJournalSesuaiTidakSesuai(false)
      isTodayPostJournal()
    }
  }, {})
  client.collection('jurnal').subscribe('*', function(e){
    if(e.action == 'create' || e.action == 'update') {
      getCountJournal()
      isTodayPostJournal()
      getCountDraftJournal()
      getCountJournalSesuaiTidakSesuai(false)
    } 
  }, {})
  client.collection('jurnal_komentar').subscribe('*', function(e){
    if(e.action == 'create' || e.action == 'update') getCountUnreadJournalComment()
  },{})
})
</script>

<style scoped>
/* ========== DASHBOARD WRAPPER & TYPOGRAPHY ========== */
.dashboard-wrapper {
  padding-bottom: 2rem;
}

.section-heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
  letter-spacing: -0.01em;
}

.section-subtitle {
  font-size: 0.82rem;
  color: #94a3b8;
}

/* ========== MONITOR BAR (GURU / INSTANSI) ========== */
.monitor-bar {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 16px;
  padding: 14px 18px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.monitor-bar__header {
  margin-bottom: 10px;
}

.monitor-bar__title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.monitor-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  font-size: 0.82rem;
  font-weight: 700;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.jurusan-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
}

.monitor-bar__controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
}

.modern-select {
  background-color: rgba(15, 23, 42, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: #f1f5f9 !important;
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 0.85rem;
}

.modern-select-btn {
  cursor: pointer;
  background-image: none !important;
  user-select: none;
  min-height: 38px;
}

/* Modal / Bottom Sheet Pilih Siswa */
.modal-siswa-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(8px);
  z-index: 2100;
  display: flex;
  align-items: flex-end; /* Bottom sheet di mobile */
  justify-content: center;
  padding: 0;
}
@media (min-width: 576px) {
  .modal-siswa-overlay {
    align-items: center;
    padding: 16px;
  }
}

.modal-siswa-card {
  width: 100%;
  max-width: 480px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 20px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.6);
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (min-width: 576px) {
  .modal-siswa-card {
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    animation: fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-siswa-list {
  overflow-y: auto;
  max-height: 55vh;
  padding-right: 4px;
}

.modal-siswa-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.15s ease;
}
.modal-siswa-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}
.modal-siswa-item--active {
  background: rgba(59, 130, 246, 0.15) !important;
  border-color: rgba(59, 130, 246, 0.4) !important;
}

.modal-siswa-avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.modern-select:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25) !important;
}

.alert-empty-jurusan {
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.3);
  color: #38bdf8;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 0.85rem;
  text-align: center;
}

/* ========== HERO PROFILE BANNER ========== */
.hero-banner {
  position: relative;
  background: linear-gradient(135deg, rgba(20, 32, 58, 0.85) 0%, rgba(11, 18, 33, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 24px;
  padding: 24px 28px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.hero-banner__glow {
  position: absolute;
  top: -80px;
  right: -80px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%);
  pointer-events: none;
}

.hero-banner__inner {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.hero-avatar {
  position: relative;
  width: 108px;
  height: 108px;
  flex-shrink: 0;
}

.hero-avatar__img {
  width: 108px;
  height: 108px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(96, 165, 250, 0.8);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2), 0 8px 20px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.hero-avatar__img:hover {
  transform: scale(1.03);
}

.hero-avatar__fallback {
  width: 108px;
  height: 108px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 3.2rem;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2), 0 8px 20px rgba(0, 0, 0, 0.5);
}

.hero-avatar__edit-btn {
  position: absolute;
  right: -2px;
  bottom: 2px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  border: 2px solid #0b1221;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: all 0.2s ease;
}

.hero-avatar__edit-btn:hover {
  background: #3b82f6;
  transform: scale(1.1);
}

.hero-avatar__badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #10b981;
  border: 2px solid #0b1221;
  box-shadow: 0 0 8px #10b981;
}

.hero-info-col {
  flex-grow: 1;
  min-width: 0;
}

.hero-school-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #60a5fa;
  margin-bottom: 4px;
}

.hero-student-name {
  font-size: 1.65rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 10px;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.hero-badges-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.badge-pill.clickable {
  cursor: pointer;
}

.badge-pill.clickable:hover {
  filter: brightness(1.15);
  transform: translateY(-1px);
}

.badge-pill--blue {
  background: rgba(37, 99, 235, 0.18);
  color: #93c5fd;
  border-color: rgba(59, 130, 246, 0.3);
}

.badge-pill--slate {
  background: rgba(148, 163, 184, 0.12);
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.25);
}

.badge-pill--cyan {
  background: rgba(6, 182, 212, 0.15);
  color: #67e8f9;
  border-color: rgba(6, 182, 212, 0.3);
}

.badge-pill--purple {
  background: rgba(139, 92, 246, 0.18);
  color: #c4b5fd;
  border-color: rgba(139, 92, 246, 0.35);
}

.badge-pill--emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
  border-color: rgba(16, 185, 129, 0.3);
}

.badge-pill--amber {
  background: rgba(245, 158, 11, 0.15);
  color: #fcd34d;
  border-color: rgba(245, 158, 11, 0.3);
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  display: inline-block;
  box-shadow: 0 0 6px #10b981;
}

.pulse-dot--amber {
  background: #f59e0b;
  box-shadow: 0 0 6px #f59e0b;
}

/* ========== FOTO PREVIEW MODAL ========== */
.foto-preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.foto-preview-card {
  position: relative;
  max-width: 90vw;
  max-height: 85vh;
}

.foto-preview-img {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
}

.btn-close-modal {
  position: absolute;
  top: -14px;
  right: -14px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

/* ========== ACTION BANNERS ========== */
.action-banners {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-radius: 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-card:hover {
  transform: translateY(-2px);
}

.action-card--cta {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(14, 165, 233, 0.18) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 8px 20px -6px rgba(37, 99, 235, 0.3);
}

.action-card--cta .action-card__icon {
  background: linear-gradient(135deg, #2563eb, #0284c7);
  color: #ffffff;
}

.action-card--warning {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.action-card--warning .action-card__icon {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.action-card--info {
  background: rgba(6, 182, 212, 0.12);
  border: 1px solid rgba(6, 182, 212, 0.35);
}

.action-card--info .action-card__icon {
  background: rgba(6, 182, 212, 0.2);
  color: #38bdf8;
}

.action-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.action-card__content {
  flex-grow: 1;
}

.action-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 2px;
}

.action-card__desc {
  font-size: 0.82rem;
  color: #cbd5e1;
}

.action-card__btn {
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  white-space: nowrap;
}

.action-card__link-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: #60a5fa;
  white-space: nowrap;
}

/* ========== BENTO GRID (PLACEMENT & SCHEDULE) ========== */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

@media (min-width: 1200px) {
  .bento-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.bento-card {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 10px 25px -8px rgba(0, 0, 0, 0.4);
  transition: all 0.22s ease;
  display: flex;
  flex-direction: column;
}

.bento-card:hover {
  border-color: rgba(59, 130, 246, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -6px rgba(0, 0, 0, 0.5);
}

.bento-card--featured {
  border-color: rgba(99, 102, 241, 0.3);
  background: linear-gradient(180deg, rgba(30, 27, 75, 0.35) 0%, rgba(15, 23, 42, 0.85) 100%);
}

.bento-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.bento-card__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.bento-card__icon--blue {
  background: rgba(59, 130, 246, 0.16);
  color: #60a5fa;
}

.bento-card__icon--indigo {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
}

.bento-card__icon--emerald {
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
}

.bento-card__icon--purple {
  background: rgba(139, 92, 246, 0.16);
  color: #a78bfa;
}

.bento-card__icon--amber {
  background: rgba(245, 158, 11, 0.16);
  color: #fbbf24;
}

.bento-card__label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.btn-action-mini {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.btn-action-mini:hover {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.15);
}

.bento-card__body {
  flex-grow: 1;
}

.bento-card__val {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1.35;
  margin-bottom: 4px;
}

.bento-card__main-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  color: #60a5fa;
  transition: color 0.15s ease;
}

.bento-card__main-link:hover {
  color: #93c5fd;
}

.bento-card__sub {
  font-size: 0.78rem;
  color: #94a3b8;
}

.bento-card__empty {
  font-size: 0.85rem;
  color: #cbd5e1;
  font-style: italic;
}

/* 7-Day Mini Chips in Bento Card */
.days-chips-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.day-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.04);
  color: #64748b;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.18s ease;
}

.day-chip--active {
  background: rgba(99, 102, 241, 0.25);
  color: #c7d2fe;
  border-color: rgba(99, 102, 241, 0.5);
  font-weight: 800;
}

.day-chip--today {
  box-shadow: 0 0 0 2px #3b82f6;
  font-weight: 800;
}

.badge-hari-status {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.badge-hari-status--work {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-hari-status--off {
  background: rgba(148, 163, 184, 0.12);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.time-range-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.time-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  font-size: 0.85rem;
  font-weight: 700;
}

.time-arrow {
  color: #64748b;
  font-size: 0.85rem;
}

.edit-box {
  padding: 4px 0;
}

.modern-input, .modern-textarea {
  background: rgba(11, 18, 33, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: #f1f5f9 !important;
  border-radius: 10px;
}

.modern-input:focus, .modern-textarea:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25) !important;
}

/* ========== MODAL ATUR HARI PKL (CUSTOM OVERLAY) ========== */
.modal-overlay-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 2500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card-custom {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.85);
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalScaleIn 0.22s ease-out;
}

@keyframes modalScaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-card-custom__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-icon-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.3rem;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
}

.modal-card-custom__title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.modal-card-custom__subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 2px 0 0;
}

.btn-close-modal-sm {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-close-modal-sm:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.modal-card-custom__body {
  padding: 20px 24px;
  overflow-y: auto;
  flex-grow: 1;
}

.info-alert {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.82rem;
  color: #cbd5e1;
  line-height: 1.45;
}

.form-label-custom {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
  margin-bottom: 8px;
  display: block;
}

.presets-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-preset {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.btn-preset:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.35);
  color: #93c5fd;
}

.btn-preset--active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.days-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 8px;
}

.day-toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  user-select: none;
  transition: all 0.18s ease;
}

.day-toggle-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.18);
}

.day-toggle-card--selected {
  background: rgba(37, 99, 235, 0.12);
  border-color: rgba(59, 130, 246, 0.45);
}

.day-toggle-card__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.day-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: #ffffff;
  transition: all 0.15s ease;
}

.day-toggle-card--selected .day-checkbox {
  background: #2563eb;
  border-color: #2563eb;
}

.day-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #f1f5f9;
}

.day-hint {
  font-size: 0.72rem;
  color: #64748b;
}

.day-status-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.day-status-pill--work {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.day-status-pill--off {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
}

.summary-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px 16px;
}

.modal-card-custom__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(11, 18, 33, 0.5);
}

/* ========== KEY METRICS CARDS ========== */
.metric-card {
  position: relative;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 12px 28px -10px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
}

.metric-card:hover {
  transform: translateY(-3px);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.6);
}

.metric-card__watermark {
  position: absolute;
  right: -10px;
  bottom: -15px;
  font-size: 5rem;
  opacity: 0.06;
  pointer-events: none;
  line-height: 1;
}

.metric-card--blue:hover .metric-card__watermark {
  color: #3b82f6;
  opacity: 0.12;
}

.metric-card--amber {
  border-color: rgba(245, 158, 11, 0.3);
}

.metric-card--emerald {
  border-color: rgba(16, 185, 129, 0.3);
}

.metric-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.metric-card__label {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.metric-card__chip {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.metric-card__chip--amber {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}

.metric-card__chip--emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.3);
}

.metric-card__number {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.metric-card__desc {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 4px;
}

.btn-info-circle {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s ease;
}

.btn-info-circle:hover {
  color: #60a5fa;
}

.rating-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.rating-badge--good {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.rating-badge--warn {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.progress-bar-modern {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-modern__fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 999px;
  transition: width 0.4s ease;
}

/* ========== MODAL STYLING ========== */
.modern-modal {
  background: #0f172a !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 20px !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8) !important;
}

.formula-box {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* ========== TEAM MEMBERS ========== */
.team-card {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: 0 10px 25px -8px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.member-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.member-chip:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.25);
}

.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1rem;
  flex-shrink: 0;
}

.member-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #f1f5f9;
}

.member-role {
  font-size: 0.75rem;
  color: #94a3b8;
}

.empty-team-icon {
  font-size: 2.2rem;
  color: #64748b;
}

/* ========== MONTHLY RECAP ========== */
.recap-card {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 25px -8px rgba(0, 0, 0, 0.4);
  transition: all 0.22s ease;
}

.recap-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.recap-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.recap-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
}

.recap-card__badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.recap-card__grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}

/* [PERBAIKAN REKAP] chip statistik dirapikan: latar tint lebih jelas,
   garis netral tipis dihapus (penyebab sambungan "retak" antar kotak),
   jarak vertikal konsisten lewat flex gap, teks lebih terbaca */
.recap-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  padding: 10px 2px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
}

.recap-stat__icon {
  font-size: 0.85rem;
  font-weight: 800;
  line-height: 1;
}

.recap-stat__label {
  font-size: 0.66rem;
  line-height: 1;
  letter-spacing: 0.02em;
  color: #9fb0c8;
}

.recap-stat__value {
  font-size: 1rem;
  font-weight: 800;
  line-height: 1;
  color: #ffffff;
}

.recap-stat--success {
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.35);
}
.recap-stat--success .recap-stat__icon,
.recap-stat--success .recap-stat__value {
  color: #34d399;
}

.recap-stat--warning {
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.35);
}
.recap-stat--warning .recap-stat__icon,
.recap-stat--warning .recap-stat__value {
  color: #fbbf24;
}

.recap-stat--info {
  background: rgba(6, 182, 212, 0.14);
  border-color: rgba(6, 182, 212, 0.35);
}
.recap-stat--info .recap-stat__icon,
.recap-stat--info .recap-stat__value {
  color: #38bdf8;
}

.recap-stat--danger {
  background: rgba(239, 68, 68, 0.14);
  border-color: rgba(239, 68, 68, 0.35);
}
.recap-stat--danger .recap-stat__icon,
.recap-stat--danger .recap-stat__value {
  color: #f87171;
}

.recap-stat--secondary {
  background: rgba(148, 163, 184, 0.14);
  border-color: rgba(148, 163, 184, 0.32);
}
.recap-stat--secondary .recap-stat__icon,
.recap-stat--secondary .recap-stat__value {
  color: #94a3b8;
}

.empty-recap-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

/* ========== RESPONSIVE ADJUSTMENTS (MOBILE & TABLET MODERN LAYOUT) ========== */
@media (max-width: 1200px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 991.98px) {
  /* Hero Profile Banner: Tetap Horizontal Modern Seperti Desktop */
  .hero-banner {
    padding: 18px 16px;
    border-radius: 20px;
    margin-bottom: 1.25rem !important;
  }
  .hero-banner__inner {
    flex-direction: row;
    align-items: center;
    text-align: left;
    gap: 16px;
  }
  .hero-avatar {
    width: 78px;
    height: 78px;
  }
  .hero-avatar__img,
  .hero-avatar__fallback {
    width: 78px;
    height: 78px;
    border-width: 2.5px;
  }
  .hero-avatar__fallback {
    font-size: 2.4rem;
  }
  .hero-avatar__edit-btn {
    width: 26px;
    height: 26px;
    font-size: 0.75rem;
    bottom: -1px;
    right: -1px;
  }
  .hero-avatar__badge {
    width: 12px;
    height: 12px;
    top: 2px;
    right: 2px;
  }
  .hero-student-name {
    font-size: 1.25rem;
    margin: 0 0 6px;
    line-height: 1.25;
  }
  .hero-school-label {
    font-size: 0.68rem;
    margin-bottom: 2px;
  }
  .hero-badges-row {
    justify-content: flex-start;
    gap: 6px;
  }
  .badge-pill {
    padding: 3px 9px;
    font-size: 0.72rem;
    gap: 4px;
  }

  /* Bento Grid: 2-Kolom Modern Asimetris */
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .bento-card {
    padding: 14px;
    border-radius: 16px;
  }
  /* Kartu IDUKA: Lebar Penuh (2 Kolom) */
  .bento-card:nth-child(1) {
    grid-column: span 2;
  }
  /* Kartu Hari PKL: Lebar Penuh (2 Kolom) dengan 7-Hari Mini Chips */
  .bento-card--featured {
    grid-column: span 2;
  }
  /* Kartu Jam Kerja: 1 Kolom */
  /* Kartu Pembimbing: 1 Kolom */
  /* Kartu Rombel: Lebar Penuh (2 Kolom) */
  .bento-card:nth-child(5) {
    grid-column: span 2;
  }
  .bento-card__val {
    font-size: 0.95rem;
  }
  .bento-card__icon {
    width: 32px;
    height: 32px;
    font-size: 0.95rem;
    border-radius: 8px;
  }
  .bento-card__label {
    font-size: 0.68rem;
  }
  .bento-card__sub {
    font-size: 0.74rem;
  }

  /* Action Cards (CTA Tulis Jurnal): Sleek Horizontal */
  .action-card {
    flex-direction: row;
    align-items: center;
    text-align: left;
    padding: 12px 14px;
    gap: 12px;
  }
  .action-card__icon {
    width: 38px;
    height: 38px;
    font-size: 1.1rem;
    border-radius: 10px;
    flex-shrink: 0;
  }
  .action-card__title {
    font-size: 0.88rem;
  }
  .action-card__desc {
    font-size: 0.74rem;
  }
  .action-card__btn {
    width: auto;
    padding: 6px 14px;
    font-size: 0.78rem;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Statistik Metrik Cards */
  .metric-card {
    padding: 14px;
    border-radius: 16px;
  }
  .metric-card__number {
    font-size: 1.7rem;
  }
  .metric-card__label {
    font-size: 0.72rem;
  }
  .metric-card__desc {
    font-size: 0.72rem;
  }
  .metric-card__watermark {
    font-size: 3rem;
    right: 8px;
    bottom: -6px;
  }

  /* Rekan Satu Tim: 2-Kolom Grid Fleksibel */
  .team-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 8px;
    padding: 12px !important;
  }
  .member-chip {
    padding: 8px 10px;
    gap: 8px;
    border-radius: 10px;
  }
  .member-avatar {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
  .member-name {
    font-size: 0.78rem;
  }
  .member-role {
    font-size: 0.68rem;
  }

  /* Rekapan Kehadiran Bulanan */
  .recap-card {
    padding: 14px;
    border-radius: 16px;
  }
  .recap-card__title {
    font-size: 0.88rem;
  }
  .recap-card__badge {
    font-size: 0.68rem;
    padding: 2px 7px;
  }
  .recap-card__grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 5px;
  }
  .recap-stat {
    padding: 8px 2px;
    border-radius: 10px;
    gap: 3px;
  }
  .recap-stat__value {
    font-size: 0.95rem;
  }
  .recap-stat__label {
    font-size: 0.6rem;
  }
  .recap-stat__icon {
    font-size: 0.8rem;
  }

  /* Modal Hari PKL */
  .days-selector-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .day-toggle-card {
    padding: 10px 14px;
  }
}

/* Extra Small (Layar di bawah 440px) */
@media (max-width: 440px) {
  .hero-banner {
    padding: 14px 12px;
  }
  .hero-banner__inner {
    gap: 12px;
  }
  .hero-avatar {
    width: 66px;
    height: 66px;
  }
  .hero-avatar__img,
  .hero-avatar__fallback {
    width: 66px;
    height: 66px;
  }
  .hero-student-name {
    font-size: 1.15rem;
  }
  .badge-pill {
    padding: 2px 7px;
    font-size: 0.68rem;
  }
  .bento-card__val {
    font-size: 0.88rem;
  }
  .days-chips-row {
    gap: 3px;
  }
  .day-chip {
    width: 24px;
    height: 24px;
    font-size: 0.65rem;
  }
}
</style>
