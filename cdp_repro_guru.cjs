/* Reproduksi NYATA di headless Chrome:
   login sbg guru temp -> home -> cek iduka tampil / "Belum pemetaan" + console logs
   Termasuk uji REFRESH (F5). */
const { spawn } = require('child_process');
const WebSocket = require('C:/Users/ASUS/Downloads/jurnal pkl/epkl4-siswa-main/node_modules/ws');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const APP = 'http://localhost:3001';
const PB = 'http://127.0.0.1:8090';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9223;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  // --- 1. siapkan guru temp ---
  const su = await fetch(PB + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  });
  const suTok = (await su.json()).token;
  const un = 'tmpg' + Math.floor(Math.random() * 1e6);
  const mk = await fetch(PB + '/api/collections/teacher_users/records', {
    method: 'POST',
    headers: { Authorization: suTok, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: un, password: 'Temp1234!', passwordConfirm: 'Temp1234!', role: 'guru', nama: 'TEMP GURU UJI', verified: true })
  });
  const mkData = await mk.json();
  if (!mk.ok) { console.log('gagal buat guru temp', mkData); return; }
  console.log('guru temp:', un);

  // --- 2. launch chrome headless ---
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-prof-'));
  const chrome = spawn(CHROME, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${prof}`,
    '--headless=new', '--no-first-run', '--no-default-browser-check',
    '--window-size=1366,900', 'about:blank'
  ], { stdio: 'ignore' });

  let ws;
  const logs = [];
  try {
    // tunggu endpoint devtools siap
    let target;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      try {
        const list = await new Promise((res, rej) => {
          http.get(`http://127.0.0.1:${PORT}/json`, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }).on('error', rej);
        });
        target = list.find(t => t.type === 'page');
        if (target) break;
      } catch (e) { /* belum siap */ }
    }
    if (!target) { console.log('chrome gagal siap'); return; }

    ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
    await new Promise(r => ws.on('open', r));

    let idc = 0;
    const pending = new Map();
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++idc;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
    ws.on('message', (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.id && pending.has(m.id)) {
        const { resolve, reject } = pending.get(m.id);
        pending.delete(m.id);
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
        return;
      }
      if (m.method === 'Runtime.consoleAPICalled') {
        const txt = (m.params.args || []).map(a => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ');
        logs.push(`[console.${m.params.type}] ${txt}`);
      } else if (m.method === 'Runtime.exceptionThrown') {
        logs.push(`[EXCEPTION] ${m.params.exceptionDetails?.exception?.description || JSON.stringify(m.params.exceptionDetails)}`);
      } else if (m.method === 'Log.entryAdded') {
        logs.push(`[${m.params.entry.level}] ${m.params.entry.text}`);
      }
    });
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');

    const evaluate = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      return r.result?.value;
    };
    const nav = async (url, waitMs) => {
      await send('Page.navigate', { url });
      await sleep(waitMs || 4000);
    };

    // --- 3. buka login page ---
    await nav(APP + '/login', 8000);
    console.log('\n--- LOGIN sebagai', un, '---');
    await evaluate(`(async () => {
      const setNative = (el, v) => {
        const st = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        st.set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const u = document.querySelector('#username');
      const p = document.querySelector('#password');
      if (!u || !p) return 'INPUT TIDAK DITEMUKAN';
      setNative(u, '${un}');
      setNative(p, 'Temp1234!');
      return 'ok';
    })()`);
    await sleep(300);
    await evaluate(`document.querySelector('button[type=submit]').click()`);
    // tunggu redirect ke '/'
    let ok = false;
    for (let i = 0; i < 30; i++) {
      await sleep(1000);
      const pathNow = await evaluate(`location.pathname`);
      if (pathNow === '/') { ok = true; break; }
    }
    console.log('redirect ke home:', ok, '| path =', await evaluate(`location.pathname`));
    await sleep(6000); // beri waktu fetchSiswaOptions + getInfo

    const dump = async (label) => {
      const body = await evaluate(`document.body.innerText.replace(/\\n+/g, ' | ')`);
      console.log(`\n=== ${label} ===`);
      console.log('URL:', await evaluate(`location.href`));
      console.log('mengandung "Clasnet":', body.includes('Clasnet'));
      console.log('mengandung "Belum pemetaan":', body.includes('Belum pemetaan'));
      console.log('potongan teks:', body.slice(0, 700));
    };
    await dump('SETELAH LOGIN (first load)');

    // --- 4. REFRESH ---
    await nav(APP + '/', 8000);
    await sleep(6000);
    await dump('SETELAH REFRESH');

  } finally {
    if (ws) { try { ws.close(); } catch (e) {} }
    try { chrome.kill(); } catch (e) {}
    try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {}
    // hapus guru temp
    await fetch(PB + `/api/collections/teacher_users/records/${mkData.id}`, { method: 'DELETE', headers: { Authorization: suTok } });
    console.log('\ncleanup guru temp OK');
  }

  console.log('\n=== CONSOLE LOGS (browser) ===');
  for (const l of logs) console.log(' ', l.slice(0, 400));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
