/* Uji E2E instansi: dropdown hanya siswa sendiri; localStorage siswa lain
   harus diabaikan; halaman jurnal/absen/nilai/iduka hanya data siswanya. */
const { spawn } = require('child_process');
const WebSocket = require('C:/Users/ASUS/Downloads/jurnal pkl/epkl4-siswa-main/node_modules/ws');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const APP = 'http://localhost:3001';
const PB = 'http://127.0.0.1:8090';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9227;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const suTok = (await (await fetch(PB + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  })).json()).token;
  const SH = { Authorization: suTok, 'Content-Type': 'application/json' };

  // id akun helmiarafa (siswa tempat lain) utk uji penyusupan localStorage
  const stu = (await (await fetch(PB + '/api/collections/student_users/records?perPage=50&expand=siswa', { headers: SH })).json()).items;
  const helmi = stu.find(x => x.siswa !== 'js899cqxe2awkme');
  console.log('akun siswa "tempat lain" untuk uji penyusupan:', helmi?.id);

  const un = 'ti' + Math.floor(Math.random() * 1e6);
  const mk = await fetch(PB + '/api/collections/teacher_users/records', {
    method: 'POST', headers: SH,
    body: JSON.stringify({ username: un, password: 'Temp1234!', passwordConfirm: 'Temp1234!', role: 'instansi', nama: 'TEMP INSTANSI CLASNET', iduka: 'hbter3ym9blunv8', verified: true })
  });
  const mkData = await mk.json();
  if (!mk.ok) { console.log('gagal buat instansi temp', mkData); return; }

  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-prof-'));
  const chrome = spawn(CHROME, [
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`,
    '--headless=new', '--no-first-run', '--window-size=1366,900', 'about:blank'
  ], { stdio: 'ignore' });
  let ws;
  const logs = [];
  try {
    let target;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      try {
        const list = await new Promise((res, rej) => {
          http.get(`http://127.0.0.1:${PORT}/json`, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }).on('error', rej);
        });
        target = list.find(t => t.type === 'page');
        if (target) break;
      } catch (e) {}
    }
    ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
    await new Promise(r => ws.on('open', r));
    let idc = 0;
    const pending = new Map();
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++idc; pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
    ws.on('message', (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.id && pending.has(m.id)) {
        const { resolve, reject } = pending.get(m.id); pending.delete(m.id);
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
        return;
      }
      if (m.method === 'Runtime.consoleAPICalled') {
        const txt = (m.params.args || []).map(a => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ');
        logs.push(`[console.${m.params.type}] ${txt}`);
      } else if (m.method === 'Runtime.exceptionThrown') {
        logs.push(`[EXCEPTION] ${(m.params.exceptionDetails?.exception?.description || '').slice(0, 250)}`);
      }
    });
    await send('Page.enable');
    await send('Runtime.enable');
    const evaluate = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      return r.result?.value;
    };
    const body = async () => evaluate(`document.body.innerText.replace(/\\n+/g, ' | ')`);

    // login instansi
    await send('Page.navigate', { url: APP + '/login' });
    await sleep(8000);
    await evaluate(`(async () => {
      const setNative = (el, v) => { const st = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value'); st.set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
      setNative(document.querySelector('#username'), '${un}');
      setNative(document.querySelector('#password'), 'Temp1234!');
      return 'ok';
    })()`);
    await sleep(300);
    await evaluate(`document.querySelector('button[type=submit]').click()`);
    for (let i = 0; i < 30; i++) { await sleep(1000); if (await evaluate(`location.pathname`) === '/') break; }
    await sleep(6000);

    console.log('\n=== INSTANSI: HOME (default) ===');
    let b = await body();
    console.log('  opsi dropdown:', await evaluate(`[...document.querySelectorAll('select option')].map(o=>o.textContent.trim()).filter(t=>t)`));
    console.log('  "Clasnet" tampil   :', b.includes('Clasnet'), '(harus true)');
    console.log('  "electrosoft" tampil:', b.includes('electrosoft'), '(harus false)');
    console.log('  "Nadhif" tampil    :', b.includes('Nadhif'), '(harus true)');
    console.log('  "helmiarafa/yovie" :', /helmiarafa|yovie/i.test(b), '(harus false)');

    console.log('\n=== INSTANSI: HOME dgn localStorage PENYUSUP (siswa tempat lain) ===');
    await evaluate(`localStorage.setItem('selectedSiswaUserId', '${helmi.id}')`);
    await send('Page.navigate', { url: APP + '/' });
    await sleep(8000);
    b = await body();
    console.log('  "Clasnet" tampil   :', b.includes('Clasnet'), '(harus true — penyusup ditolak)');
    console.log('  "electrosoft" tampil:', b.includes('electrosoft'), '(harus false)');

    console.log('\n=== INSTANSI: /iduka ===');
    await send('Page.navigate', { url: APP + '/iduka' });
    await sleep(7000);
    b = await body();
    console.log('  "Clasnet" tampil       :', b.includes('Clasnet'), '(harus true)');
    console.log('  "Belum pemetaan tempat":', b.includes('Belum pemetaan tempat'), '(harus false)');
    console.log('  "electrosoft" tampil   :', b.includes('electrosoft'), '(harus false)');

    console.log('\n=== INSTANSI: /jurnal ===');
    await send('Page.navigate', { url: APP + '/jurnal' });
    await sleep(8000);
    b = await body();
    console.log('  "Nadhif" tampil   :', b.includes('Nadhif'), '(harus true)');
    console.log('  siswa lain tampil :', /helmiarafa|yoviemaulana/i.test(b), '(harus false)');

    console.log('\n=== INSTANSI: /proyek (absen) ===');
    await send('Page.navigate', { url: APP + '/proyek' });
    await sleep(8000);
    b = await body();
    console.log('  siswa lain tampil :', /helmiarafa|yoviemaulana/i.test(b), '(harus false)');

    console.log('\n=== INSTANSI: /nilai ===');
    await send('Page.navigate', { url: APP + '/nilai' });
    await sleep(8000);
    b = await body();
    console.log('  "Nadhif" tampil   :', b.includes('Nadhif'), '(harus true)');
    console.log('  siswa lain tampil :', /helmiarafa|yoviemaulana/i.test(b), '(harus false)');
  } finally {
    if (ws) { try { ws.close(); } catch (e) {} }
    try { chrome.kill(); } catch (e) {}
    try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {}
    await fetch(PB + `/api/collections/teacher_users/records/${mkData.id}`, { method: 'DELETE', headers: SH });
    console.log('\ncleanup instansi temp OK');
  }
  console.log('\n=== CONSOLE (selain log/info) ===');
  for (const l of logs.filter(l => !l.startsWith('[console.log]') && !l.startsWith('[console.info]'))) console.log(' ', l.slice(0, 220));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
