/* VERIFIKASI FINAL: guru memantau ndhfrka -> pemetaan di-update dari "sisi siswa"
   (via API) -> halaman guru harus tetap menampilkan Clasnet tanpa refresh. */
const { spawn } = require('child_process');
const WebSocket = require('C:/Users/ASUS/Downloads/jurnal pkl/epkl4-siswa-main/node_modules/ws');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const APP = 'http://localhost:3001';
const PB = 'http://127.0.0.1:8090';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9225;
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

  // token siswa ndhfrka utk mensimulasikan "upload dari akun ndhfrka"
  const suDb = await (await fetch(PB + '/api/collections/student_users/records?perPage=50', { headers: { Authorization: suTok } })).json();
  const ndh = suDb.items.find(x => x.siswa === 'js899cqxe2awkme');
  console.log('akun siswa ndhfrka ditemukan:', !!ndh);

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

    // login
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

    // pilih ndhfrka
    await evaluate(`(async () => {
      const sel = [...document.querySelectorAll('select')].find(s => [...s.options].some(o => o.textContent.includes('Nadhif')));
      if (!sel) return 'SELECT TIDAK ADA';
      const opt = [...sel.options].find(o => o.textContent.includes('Nadhif'));
      const st = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value');
      st.set.call(sel, opt.value);
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      return 'ok';
    })()`);
    await sleep(5000);
    let body = await evaluate(`document.body.innerText.replace(/\\n+/g, ' | ')`);
    console.log('Tahap 1 - pilih ndhfrka manual: Clasnet tampil =', body.includes('Clasnet'));

    // simulasikan siswa ndhfrka meng-update pemetaan (touch, nilai sama)
    const pemId = 'cbjbsmzocnd137h';
    const cur = await (await fetch(PB + `/api/collections/pemetaan/records/${pemId}`, { headers: { Authorization: suTok } })).json();
    const up = await fetch(PB + `/api/collections/pemetaan/records/${pemId}`, {
      method: 'PATCH', headers: { Authorization: suTok, 'Content-Type': 'application/json' },
      body: JSON.stringify({ jam_mulai: cur.jam_mulai || '' })
    });
    console.log('pemetaan touch (update event):', up.status);

    await sleep(7000);
    body = await evaluate(`document.body.innerText.replace(/\\n+/g, ' | ')`);
    console.log('\nTahap 2 - SETELAH update pemetaan via SSE (tanpa refresh):');
    console.log('  Clasnet masih tampil     :', body.includes('Clasnet'));
    console.log('  "Belum pemetaan" tampil  :', body.includes('Belum pemetaan'));

    // cek juga tak ada error console dari SSE flow
    const errs = logs.filter(l => l.includes('[EXCEPTION]') || l.includes('[console.error]') || l.includes('[error]'));
    console.log('\nError console terkait (harusnya minim):');
    for (const e of errs.slice(0, 10)) console.log('  ', e.slice(0, 200));
  } finally {
    if (ws) { try { ws.close(); } catch (e) {} }
    try { chrome.kill(); } catch (e) {}
    try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {}
    await fetch(PB + `/api/collections/teacher_users/records/${mkData.id}`, { method: 'DELETE', headers: { Authorization: suTok } });
    console.log('\ncleanup guru temp OK');
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
