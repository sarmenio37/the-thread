// The Thread — simple password gate
// Password is hashed so it's not sitting in plaintext in the HTML
(function () {
  const HASH = '156c6cbb62a69bfc8fbb1e827997dd179bb3580ae01c8a4e7bd6fd0c3e36d548'; // sha256 of "thebox"
  const KEY = 'the-thread-auth';

  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function check() {
    // Already authenticated this session?
    if (sessionStorage.getItem(KEY) === 'ok') return;

    // Show lock screen
    document.body.style.display = 'none';

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:#2c2c2c;display:flex;
      flex-direction:column;align-items:center;justify-content:center;
      font-family:'Georgia',serif;color:#f5f0eb;z-index:9999;
    `;
    overlay.innerHTML = `
      <div style="text-align:center;max-width:340px;padding:24px;">
        <div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;opacity:0.4;margin-bottom:20px;">A letter between friends</div>
        <div style="font-size:48px;font-weight:400;margin-bottom:8px;letter-spacing:-1px;">The Thread</div>
        <div style="font-style:italic;opacity:0.5;font-size:16px;margin-bottom:40px;">Private access only</div>
        <input id="pw-input" type="password" placeholder="Password"
          style="width:100%;padding:14px 18px;font-size:15px;border:1px solid #555;
          background:#1a1a1a;color:#f5f0eb;border-radius:3px;outline:none;
          text-align:center;letter-spacing:2px;font-family:Georgia,serif;margin-bottom:12px;"/>
        <button id="pw-btn"
          style="width:100%;padding:14px;background:#f5f0eb;color:#2c2c2c;
          border:none;border-radius:3px;font-size:13px;letter-spacing:2px;
          text-transform:uppercase;cursor:pointer;font-family:Georgia,serif;">
          Enter
        </button>
        <div id="pw-error" style="margin-top:16px;font-size:13px;color:#e07070;opacity:0;transition:opacity 0.2s;">
          Wrong password
        </div>
      </div>
    `;
    document.body.parentElement.appendChild(overlay);

    const input = overlay.querySelector('#pw-input');
    const btn = overlay.querySelector('#pw-btn');
    const err = overlay.querySelector('#pw-error');

    input.focus();

    async function attempt() {
      const hash = await sha256(input.value.trim());
      if (hash === HASH) {
        sessionStorage.setItem(KEY, 'ok');
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s';
        setTimeout(() => {
          overlay.remove();
          document.body.style.display = '';
        }, 300);
      } else {
        err.style.opacity = '1';
        input.value = '';
        input.focus();
        setTimeout(() => err.style.opacity = '0', 2000);
      }
    }

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', check);
  } else {
    check();
  }
})();
