/* Verifikasi halaman /iduka untuk akun GURU: harus menampilkan iduka siswa
   yang dipantau + form read-only (tanpa "Belum pemetaan tempat"). */
const { spawn } = require('child_process');
const WebSocket = require('C:/Users/ASUS/Downloads/jurnal pkl/epkl4-siswa-main/node_modules/ws');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const APP = 'http://localhost:3001';
const PB = 'http://127.0.0.1:8090';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9226;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const su = await fetch(PB + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  });
  const suTok = (await su.json()).token;
  const un = 'tmpg' + Math.floor(Math.random() * 1e6);
  const mk = await fetch(PB + '/api/collections/teacher_users/records', {
    method: 'POST', headers: { Authorization: suTok, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: un, password: 'Temp1234!', passwordConfirm: 'Temp1234!', role: 'guru', nama: 'TEMP GURU UJI', verified: true })
  });
  const mkData = await mk.json();
  if (!mk.ok) { console.log('gagal buat guru temp', mkData); return; }

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
        logs.push(`[EXCEPTION] ${(m.params.exceptionDetails?.exception?.description || '').slice(0, 300)}`);
      }
    });
    await send('Page.enable');
    await send('Runtime.enable');
    const evaluate = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      return r.result?.value;
    };

    // login guru
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
    await sleep(5000);

    // --- tes 1: /iduka default (tanpa localStorage) ---
    await send('Page.navigate', { url: APP + '/iduka' });
    await sleep(7000);
    let body = await evaluate(`document.body.innerText.replace(/\\n+/g, ' | ')`);
    console.log('=== GURU di /iduka (default pemetaan terbaru) ===');
    console.log('  "Belum pemetaan tempat":', body.includes('Belum pemetaan tempat'), '(harus false)');
    console.log('  Nama iduka tampil      :', ['electrosoft', 'Clasnet'].filter(n => body.includes(n)));
    console.log('  header                 :', (body.match(/\|[^\|]*\|\s*[^|]*$/) || [body.slice(0, 120)])[0]);

    // status form: disabled?
    const st = await evaluate(`(() => {
      const inp = document.querySelector('#pimpinan');
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Simpan'));
      return { adaInput: !!inp, disabled: inp ? inp.disabled : null, tombolSimpan: !!btn, teks: document.body.innerText.slice(0, 300) };
    })()`);
    console.log('  input pimpinan ada/disabled:', st.adaInput, st.disabled, '| tombol Simpan:', st.tombolSimpan);
    console.log('  catatan mode pantau:', body.includes('Mode pantauan'));

    // --- tes 2: pilih ndhfrka di home dulu (localStorage), lalu buka /iduka ---
    await send('Page.navigate', { url: APP + '/' });
    await sleep(6000);
    await evaluate(`(async () => {
      const sel = [...document.querySelectorAll('select')].find(s => [...s.options].some(o => o.textContent.includes('Nadhif')));
      if (!sel) return 'no-select';
      const opt = [...sel.options].find(o => o.textContent.includes('Nadhif'));
      const st2 = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value');
      st2.set.call(sel, opt.value);
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      return 'ok';
    })()`);
    await sleep(4000);
    await send('Page.navigate', { url: APP + '/iduka' });
    await sleep(7000);
    body = await evaluate(`document.body.innerText.replace(/\\n+/g, ' | ')`);
    console.log('\n=== GURU di /iduka SETELAH memilih ndhfrka di home ===');
    console.log('  "Belum pemetaan tempat":', body.includes('Belum pemetaan tempat'), '(harus false)');
    console.log('  "Clasnet" tampil       :', body.includes('Clasnet'), '(harus true)');
  } finally {
    if (ws) { try { ws.close(); } catch (e) {} }
    try { chrome.kill(); } catch (e) {}
    try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {}
    await fetch(PB + `/api/collections/teacher_users/records/${mkData.id}`, { method: 'DELETE', headers: { Authorization: suTok } });
    console.log('\ncleanup guru temp OK');
  }
  console.log('\n=== CONSOLE (error saja) ===');
  for (const l of logs.filter(l => !l.startsWith('[console.log]') && !l.startsWith('[console.info]'))) console.log(' ', l.slice(0, 200));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
