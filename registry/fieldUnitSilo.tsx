import React from 'react';
import { 
  FileJson, FileCode, Search, Fingerprint, Eye, 
  Scale, ShieldX, Skull, AlertOctagon, Clipboard, Activity, ShieldCheck,
  Shield, Zap, Layers, Smartphone, Radar, Ghost, BrainCircuit, Layout
} from 'lucide-react';

export interface ManifestFile {
  path: string;
  icon: React.ReactNode;
  type: string;
  content: string;
}

export const SILO_MANIFEST: ManifestFile[] = [
  {
    path: 'manifest.json',
    icon: <FileJson size={14} />,
    type: 'VIG-MANIFEST-v3',
    content: `{
  "manifest_version": 3,
  "name": "VIGIL | Field Unit",
  "version": "0.0.0.1",
  "description": "Layer 0.5 Security Standard. Modular HUD Architecture v2.",
  "permissions": [
    "storage",
    "scripting"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "action": {
    "default_popup": "popup/popup.html"
  },
  "background": {
    "service_worker": "background/serviceWorker.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/retinalShield.js"],
      "run_at": "document_start"
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["core/*.js", "popup/*.css", "content/ui/*.js"],
      "matches": ["<all_urls>"]
    }
  ]
}`
  },
  {
    path: 'background/serviceWorker.js',
    icon: <FileCode size={14} />,
    type: 'JS_SERVICE_WORKER',
    content: `// VIGIL BACKGROUND GUARDIAN
// VERSION: 0.0.0.1
// PERSISTENT_SECURITY_SERVICE

chrome.runtime.onInstalled.addListener(() => {
  console.log("[VIGIL] Persistent Guardian Layer 0.5 initialized.");
});

// Listening for security events from the Field Units
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'THREAT_DETECTED') {
    console.warn(\`[VIGIL] Security Event: \${message.payload.verdict} in tab \${sender.tab.id}\`);
  }
});`
  },
  {
    path: 'content/retinalShield.js',
    icon: <Shield size={14} />,
    type: 'JS_DISPATCHER',
    content: `// VIGIL FIELD UNIT: TACTICAL DISPATCHER
// VERSION: 0.0.0.1
// COMPONENT: CONTENT_DISPATCHER

(async function() {
  const validatorSrc = chrome.runtime.getURL('core/addressValidator.js');
  const indexerSrc = chrome.runtime.getURL('core/threatIndex.js');
  
  const { isValidSolanaAddress } = await import(validatorSrc);
  const { calculateCompositeThreat, getAxesFromVerdict } = await import(indexerSrc);

  const TRUSTED_NODES = [
    'Ab1C92kLp6mX9wR7yT5vB4nQ8jK3mZz90',
    'EPjFW33rdLH2QD6LksXY33vMRfGct1grTparXMQ7fgc3',
    'Vig1L1iG1iG1iG1iG1iG1iG1iG1iG1iG1iG1iG1iG1i'
  ];

  async function analyzeAddress(addr) {
    const data = await chrome.storage.local.get(['VIG_USER_TRUSTED_NODES']);
    const userWhiteslist = data.VIG_USER_TRUSTED_NODES || [];
    
    if (TRUSTED_NODES.includes(addr) || userWhiteslist.includes(addr)) return 'TRUSTED';
    const collision = TRUSTED_NODES.find(t => addr.slice(0, 4) === t.slice(0, 4) && addr.slice(-4) === t.slice(-4));
    if (collision) return 'POISON';
    if (/(.)\\1{5,}/.test(addr)) return 'SPOOF';
    if (addr.toUpperCase().startsWith('DEFI') || addr.toUpperCase().startsWith('CEX')) return 'SIMILARITY';
    return 'NEW';
  }

  async function dispatchHUD(address) {
    if (document.getElementById('vigil-hud-root')) return;

    const verdict = await analyzeAddress(address);
    const axes = getAxesFromVerdict(verdict);
    const index = calculateCompositeThreat(axes);

    // DYNAMIC IMPORT OF MODULAR HUD
    const moduleName = \`Alert\${verdict.charAt(0) + verdict.slice(1).toLowerCase()}.js\`;
    const moduleSrc = chrome.runtime.getURL(\`content/ui/\${moduleName}\`);
    
    try {
      const { render } = await import(moduleSrc);
      render(address, index);
    } catch (e) {
      console.error(\`[VIGIL] Failed to dispatch HUD module: \${moduleName}\`, e);
    }
  }

  document.addEventListener('paste', (e) => {
    const text = e.clipboardData.getData('text').trim();
    if (isValidSolanaAddress(text)) {
      dispatchHUD(text);
    }
  }, true);

  console.log("[VIGIL] Tactical Dispatcher v0.0.0.1 active.");
})();`
  },
  {
    path: 'core/addressValidator.js',
    icon: <FileCode size={14} />,
    type: 'JS_CORE_VAL',
    content: `// VIGIL CORE: ADDRESS VALIDATOR
// Mathematical Primitive

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function isValidSolanaAddress(address) {
  if (!address || typeof address !== 'string') return false;
  if (address.length < 32 || address.length > 44) return false;
  for (let i = 0; i < address.length; i++) {
    if (!BASE58_ALPHABET.includes(address[i])) return false;
  }
  return true;
}

export function extractAddresses(text) {
  if (!text || typeof text !== 'string') return [];
  const regex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
  return (text.match(regex) || []).filter(isValidSolanaAddress);
}`
  },
  {
    path: 'core/addressDiff.js',
    icon: <Scale size={14} />,
    type: 'JS_CORE_DIFF',
    content: `// VIGIL CORE: ADDRESS DIFF ENGINE
// Heuristic Comparison Primitive

export function getAddressDiff(addr1, addr2) {
  if (!addr1 || !addr2) return [];
  const segments = [];
  const maxLen = Math.max(addr1.length, addr2.length);
  let i = 0;
  let current = { text: '', type: 'match' };

  while (i < maxLen) {
    const c1 = addr1[i] || '';
    const c2 = addr2[i] || '';
    const isMatch = c1 === c2 && c1 !== '';

    if (isMatch && current.type === 'match') current.text += c1;
    else if (!isMatch && current.type === 'diff') current.text += c1 || c2;
    else {
      if (current.text) segments.push(current);
      current = { text: c1 || c2, type: isMatch ? 'match' : 'diff' };
    }
    i++;
  }
  if (current.text) segments.push(current);
  return segments;
}`
  },
  {
    path: 'core/threatIndex.js',
    icon: <Activity size={14} />,
    type: 'JS_CORE_THREAT',
    content: `// VIGIL CORE: THREAT MATRIX CALCULATION ENGINE
// VERSION: 0.0.0.1
// AXIS WEIGHTS: VSI(0.20), EDI(0.15), PDI(0.15), CRI(0.15), IPI(0.15), RII(0.10), EII(0.10)

/**
 * Calculates the composite threat index (0-100%)
 */
export function calculateCompositeThreat(axes) {
  // CRITICAL OVERRIDES: Registry or Execution failures trigger 100% immediate threat
  if (axes.rii === 100 || axes.eii === 100) return 100;

  const score = (
    (axes.vsi || 0) * 0.20 +
    (axes.edi || 0) * 0.15 +
    (axes.pdi || 0) * 0.15 +
    (axes.cri || 0) * 0.15 +
    (axes.ipi || 0) * 0.15 +
    (axes.rii || 0) * 0.10 +
    (axes.eii || 0) * 0.10
  );

  return Math.round(Math.min(100, score));
}

/**
 * Generates axis scores for simulation or legacy rendering
 */
export function getAxesFromVerdict(verdict) {
  const presets = {
    POISON: { vsi: 95, edi: 90, pdi: 50, cri: 30, ipi: 80, rii: 0, eii: 0 },
    SPOOF: { vsi: 100, edi: 95, pdi: 100, cri: 40, ipi: 10, rii: 0, eii: 0 },
    SIMILARITY: { vsi: 85, edi: 60, pdi: 30, cri: 30, ipi: 10, rii: 0, eii: 0 },
    NEW: { vsi: 10, edi: 0, pdi: 100, cri: 30, ipi: 10, rii: 0, eii: 0 },
    TRUSTED: { vsi: 5, edi: 0, pdi: 10, cri: 0, ipi: 0, rii: 0, eii: 0 }
  };
  return presets[verdict] || presets.NEW;
}`
  },
  {
    path: 'core/AlertClipboard.js',
    icon: <Clipboard size={14} />,
    type: 'JS_UI_MODULE',
    content: `// VIGIL HUD: ALERT_CLIPBOARD
// MODULE_ID: VIG-HUD-CLP

export function render(address, index) {
  const host = document.createElement('div');
  host.id = 'vigil-hud-root';
  host.style.cssText = 'position: fixed; z-index: 2147483647; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';
  const shadow = host.attachShadow({ mode: 'open' });

  // Corrected escaping to avoid tagged template expression error
  shadow.innerHTML = \`
    <style>
      :host { --accent: #10b981; --bg: #0a0a0a; --font: 'Inter', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace; }
      @keyframes glitch { 0% { opacity: 0.8; transform: translate(0); } 20% { transform: translate(-2px, 2px); } 40% { transform: translate(-2px, -2px); } 60% { transform: translate(2px, 2px); } 80% { transform: translate(2px, -2px); } 100% { opacity: 1; transform: translate(0); } }
      .backdrop { position: fixed; inset: 0; background: rgba(0, 5, 2, 0.96); backdrop-filter: blur(40px); opacity: 0; transition: opacity 0.5s ease; pointer-events: auto; display: flex; align-items: center; justify-content: center; font-family: var(--font); }
      .backdrop.active { opacity: 1; }
      .card { width: 440px; background: var(--bg); border: 2px solid rgba(16, 185, 129, 0.4); border-radius: 40px; padding: 40px; color: white; position: relative; overflow: hidden; }
      .threat-badge { position: absolute; top: 32px; right: 32px; background: #000; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 100px; padding: 4px 12px; display: flex; items: center; gap: 6px; }
      .threat-badge .val { color: #ef4444; font-weight: 900; font-style: italic; font-size: 13px; }
      .threat-badge .lbl { color: #3b82f6; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border-left: 1px solid #222; padding-left: 6px; }
      .header { display: flex; align-items: center; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 24px; margin-bottom: 24px; }
      .icon-box { width: 56px; height: 56px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; animation: glitch 0.2s infinite; }
      .header-text h3 { color: var(--accent); font-weight: 900; font-style: italic; font-size: 18px; margin: 0; text-transform: uppercase; }
      .header-text p { font-size: 8px; font-weight: 900; color: #555; letter-spacing: 0.3em; margin: 4px 0 0 0; text-transform: uppercase; }
      .logic-section { margin-bottom: 24px; }
      .logic-label { display: flex; items: center; gap: 8px; margin-bottom: 12px; }
      .logic-label .dot { w: 4px; h: 4px; border-radius: 50%; background: var(--accent); }
      .logic-label span { font-size: 10px; font-weight: 900; color: #555; letter-spacing: 0.2em; text-transform: uppercase; }
      .block { margin-bottom: 20px; }
      .lbl-pill { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 7px; font-weight: 900; letter-spacing: 0.1em; margin-bottom: 6px; text-transform: uppercase; }
      .lbl-def { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
      .lbl-ex { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
      .logic-text { font-size: 14px; color: #888; font-style: italic; line-height: 1.5; margin: 0; font-weight: 500; }
      .telemetry { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 16px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
      .tel-item span:first-child { font-size: 7px; font-weight: 900; color: #444; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
      .tel-item span:last-child { font-family: var(--mono); font-size: 11px; font-weight: 700; color: #bbb; }
      .btn { width: 100%; padding: 16px; border-radius: 14px; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; position: relative; overflow: hidden; }
      .btn-p { background: #0a0a0a; border: 1px solid rgba(16, 185, 129, 0.4); color: var(--accent); margin-bottom: 12px; }
      .btn-s { background: transparent; border: 1px solid #1a1a1a; color: #555; }
      .hp { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(16, 185, 129, 0.15); width: 0%; transition: width 0.05s linear; pointer-events: none; }
      .footer { pt: 20px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
      .footer p { font-size: 8px; font-weight: 900; color: #333; letter-spacing: 0.15em; margin: 16px 0 0 0; text-transform: uppercase; text-align: center; }
    </style>
    <div class="backdrop" id="b">
      <div class="card">
        <div class="threat-badge">
          <span class="val">\${index}%</span>
          <span class="lbl">Inspect</span>
        </div>
        <div class="header">
          <div class="icon-box">⚡</div>
          <div class="header-text">
            <h3>Clipboard Swap Intercepted</h3>
            <p>ACTIVE_INTERCEPTION_LAYER</p>
          </div>
        </div>
        <div class="logic-section">
          <div class="logic-label"><div class="dot"></div><span>Interception Logic</span></div>
          <div class="block">
            <div class="lbl-pill lbl-def">Definition</div>
            <p class="logic-text">"Real-time neutralization of malicious scripts attempting to swap address data during transfer."</p>
          </div>
          <div class="block">
            <div class="lbl-pill lbl-ex">Example</div>
            <p class="logic-text">"You copy a valid address, but hidden malware instantly swaps it for the hacker's address the moment you press 'Paste'."</p>
          </div>
        </div>
        <div class="telemetry">
          <div class="tel-item"><span>Address Age</span><span>1,102 Days</span></div>
          <div class="tel-item" style="border-left:1px solid #111; border-right:1px solid #111; padding: 0 12px;"><span>Last Time</span><span>12m ago</span></div>
          <div class="tel-item"><span>15D Tx</span><span>55</span></div>
        </div>
        <button class="btn btn-p" id="c">REVIEW ORIGINAL INTENT</button>
        <button class="btn btn-s" id="o"><div class="hp" id="hp"></div><span>TRUST RESTORED PAYLOAD [HOLD 1.5S]</span></button>
        <div class="footer"><p>VIGILANCE IS THE ONLY PERMANENT SHIELD.</p></div>
      </div>
    </div>
  \`;

  document.documentElement.appendChild(host);
  setTimeout(() => shadow.getElementById('b').classList.add('active'), 10);
  const close = () => {
    shadow.getElementById('b').classList.remove('active');
    setTimeout(() => host.remove(), 400);
  };
  shadow.getElementById('c').onclick = close;
  const sBtn = shadow.getElementById('o');
  const hp = shadow.getElementById('hp');
  let start, iv;
  const tick = () => {
    const elapsed = Date.now() - start;
    const p = Math.min(100, (elapsed / 1500) * 100);
    hp.style.width = p + '%';
    if (p >= 100) { clearInterval(iv); close(); }
  };
  sBtn.onmousedown = () => { start = Date.now(); iv = setInterval(tick, 10); };
  sBtn.onmouseup = sBtn.onmouseleave = () => { clearInterval(iv); hp.style.width = '0%'; };
  sBtn.ontouchstart = (e) => { e.preventDefault(); start = Date.now(); iv = setInterval(tick, 10); };
  sBtn.ontouchend = () => { clearInterval(iv); hp.style.width = '0%'; };
}`
  },
  {
    path: 'content/ui/AlertPoison.js',
    icon: <Skull size={14} />,
    type: 'JS_UI_MODULE',
    content: `// VIGIL HUD: ALERT_POISON
// MODULE_ID: VIG-HUD-POI

export function render(address, index) {
  const host = document.createElement('div');
  host.id = 'vigil-hud-root';
  host.style.cssText = 'position: fixed; z-index: 2147483647; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';
  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = \`
    <style>
      :host { --threat: #ef4444; --bg: #050505; --font: 'Inter', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace; }
      @keyframes inspect-flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      .backdrop { position: fixed; inset: 0; background: rgba(5, 0, 0, 0.98); backdrop-filter: blur(60px); opacity: 0; transition: opacity 0.5s ease; pointer-events: auto; display: flex; align-items: center; justify-content: center; font-family: var(--font); }
      .backdrop.active { opacity: 1; }
      .card { width: 480px; background: radial-gradient(circle at top right, rgba(239, 68, 68, 0.1), transparent 70%), var(--bg); border: 2px solid rgba(239, 68, 68, 0.2); border-radius: 44px; padding: 48px; color: white; position: relative; overflow: hidden; box-shadow: 0 50px 100px rgba(0,0,0,1); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      .diag-open .card { transform: scale(0.9) translateX(-40px); opacity: 0.4; }
      .threat-badge { position: absolute; top: 32px; right: 32px; background: #000; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 100px; padding: 6px 16px; display: flex; align-items: center; gap: 8px; cursor: pointer; }
      .threat-badge .val { color: var(--threat); font-weight: 900; font-style: italic; font-size: 14px; }
      .threat-badge .lbl { color: #3b82f6; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; border-left: 1px solid #222; padding-left: 10px; animation: inspect-flash 2s infinite; }
      .header { display: flex; align-items: center; gap: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 32px; margin-bottom: 32px; }
      .icon-box { width: 64px; height: 64px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
      .header-text h3 { color: var(--threat); font-weight: 900; font-style: italic; font-size: 22px; margin: 0; text-transform: uppercase; }
      .header-text p { font-size: 9px; font-weight: 900; color: #555; letter-spacing: 0.4em; margin: 6px 0 0 0; text-transform: uppercase; }
      .logic-section { margin-bottom: 32px; }
      .telemetry { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 32px; }
      .tel-item span:first-child { font-size: 8px; font-weight: 900; color: #444; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 4px; }
      .tel-item span:last-child { font-family: var(--mono); font-size: 12px; font-weight: 700; color: #ccc; }
      .btn { width: 100%; padding: 20px; border-radius: 18px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 12px; position: relative; overflow: hidden; }
      .btn-p { background: #0a0a0a; border: 1px solid rgba(239, 68, 68, 0.3); color: var(--threat); margin-bottom: 12px; }
      .hp { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(239, 68, 68, 0.1); width: 0%; transition: width 0.05s linear; pointer-events: none; }
      .footer { pt: 32px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
      .footer p { font-size: 8px; font-weight: 900; color: #333; letter-spacing: 0.2em; margin: 24px 0 0 0; text-transform: uppercase; }

      .diagnostic { position: absolute; inset: 0; background: #050505; z-index: 100; padding: 48px; display: none; flex-direction: column; }
      .diagnostic.active { display: flex; }
    </style>
    <div class="backdrop" id="b">
      <div class="card" id="card">
        <div class="threat-badge" id="inspect">
          <span class="val">THREAT INDEX \${index}%</span>
          <span class="lbl">Inspect</span>
        </div>
        <div class="header"><div class="icon-box">💀</div><div class="header-text"><h3>Possible Poisoning</h3><p>ACTIVE_INTERCEPTION_LAYER</p></div></div>
        <div class="telemetry"><div class="tel-item"><span>Address Age</span><span>2,401 Days</span></div><div class="tel-item"><span>Last Time</span><span>14m ago</span></div><div class="tel-item"><span>15D Tx</span><span>402</span></div></div>
        <button class="btn btn-p" id="c">HALT: ADDRESS POISONING DETECTED</button>
        <button class="btn btn-s" id="o"><div class="hp" id="hp"></div><span>OVERRIDE: PROCEED [HOLD 1.5S]</span></button>
      </div>
      <div class="diagnostic" id="diag">
        <div class="diag-header"><h3>Diagnostic.</h3><div class="close-diag" id="close-diag">CLOSE [X]</div></div>
        <div style="text-align: right"><div style="font-size: 48px; color: var(--threat); font-weight: 900; font-style: italic;">\${index}%</div></div>
      </div>
    </div>\`;

  document.documentElement.appendChild(host);
  setTimeout(() => shadow.getElementById('b').classList.add('active'), 10);
  const close = () => { shadow.getElementById('b').classList.remove('active'); setTimeout(() => host.remove(), 400); };
  shadow.getElementById('c').onclick = close;
  shadow.getElementById('inspect').onclick = () => { shadow.getElementById('diag').classList.add('active'); shadow.getElementById('b').classList.add('diag-open'); };
  shadow.getElementById('close-diag').onclick = () => { shadow.getElementById('diag').classList.remove('active'); shadow.getElementById('b').classList.remove('diag-open'); };
}`
  },
  {
    path: 'content/ui/AlertTrusted.js',
    icon: <ShieldCheck size={14} />,
    type: 'JS_UI_MODULE',
    content: `// VIGIL HUD: ALERT_TRUSTED
// MODULE_ID: VIG-HUD-TRU

export function render(address, index) {
  const host = document.createElement('div');
  host.id = 'vigil-hud-root';
  host.style.cssText = 'position: fixed; z-index: 2147483647; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';
  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = \`
    <style>
      :host { --accent: #10b981; --bg: #0a0a0a; --font: 'Inter', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace; }
      .backdrop { position: fixed; inset: 0; background: rgba(0, 5, 0, 0.94); backdrop-filter: blur(40px); opacity: 0; transition: opacity 0.5s ease; pointer-events: auto; display: flex; align-items: center; justify-content: center; font-family: var(--font); }
      .backdrop.active { opacity: 1; }
      .card { width: 440px; background: var(--bg); border: 2px solid rgba(16, 185, 129, 0.2); border-radius: 40px; padding: 40px; color: white; position: relative; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,1); }
      .threat-badge { position: absolute; top: 32px; right: 32px; background: #000; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 100px; padding: 4px 12px; display: flex; items: center; gap: 6px; }
      .threat-badge .val { color: var(--accent); font-weight: 900; font-style: italic; font-size: 13px; }
      .threat-badge .lbl { color: #3b82f6; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border-left: 1px solid #222; padding-left: 6px; }
      .header { display: flex; align-items: center; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 24px; margin-bottom: 24px; }
      .icon-box { width: 56px; height: 56px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
      .header-text h3 { color: var(--accent); font-weight: 900; font-style: italic; font-size: 18px; margin: 0; text-transform: uppercase; }
      .header-text p { font-size: 8px; font-weight: 900; color: #555; letter-spacing: 0.3em; margin: 4px 0 0 0; text-transform: uppercase; }
      .logic-section { margin-bottom: 24px; }
      .logic-label { display: flex; items: center; gap: 8px; margin-bottom: 12px; }
      .logic-label .dot { w: 4px; h: 4px; border-radius: 50%; background: var(--accent); }
      .logic-label span { font-size: 10px; font-weight: 900; color: #555; letter-spacing: 0.2em; text-transform: uppercase; }
      .block { margin-bottom: 20px; }
      .lbl-pill { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 7px; font-weight: 900; letter-spacing: 0.1em; margin-bottom: 6px; text-transform: uppercase; }
      .lbl-def { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
      .lbl-ex { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
      .logic-text { font-size: 14px; color: #888; font-style: italic; line-height: 1.5; margin: 0; font-weight: 500; }
      .telemetry { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 16px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
      .tel-item span:first-child { display: block; font-size: 7px; font-weight: 900; color: #444; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
      .tel-item span:last-child { font-family: var(--mono); font-size: 11px; font-weight: 700; color: #bbb; }
      .btn { width: 100%; padding: 16px; border-radius: 14px; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; background: #0a0a0a; border: 1px solid rgba(16, 185, 129, 0.3); color: var(--accent); margin-bottom: 12px; }
      .btn-s { background: transparent; border: 1px solid #1a1a1a; color: #555; }
      .hp { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(16, 185, 129, 0.1); width: 0%; transition: width 0.05s linear; pointer-events: none; }
      .btn-s span { position: relative; z-index: 2; }
      .footer { pt: 20px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
      .footer p { font-size: 8px; font-weight: 900; color: #333; letter-spacing: 0.15em; margin: 16px 0 0 0; text-transform: uppercase; text-align: center; }
    </style>
    <div class="backdrop" id="b">
      <div class="card">
        <div class="threat-badge">
          <span class="val">\${index}%</span>
          <span class="lbl">Inspect</span>
        </div>
        <div class="header">
          <div class="icon-box">✅</div>
          <div class="header-text">
            <h3>Trusted Destination</h3>
            <p>ACTIVE_INTERCEPTION_LAYER</p>
          </div>
        </div>
        <div class="logic-section">
          <div class="logic-label"><div class="dot"></div><span>Interception Logic</span></div>
          <div class="block">
            <div class="lbl-pill lbl-def">Definition</div>
            <p class="logic-text">"Verification of intent against an established safe node within your local historical trust graph."</p>
          </div>
          <div class="block">
            <div class="lbl-pill lbl-ex">Example</div>
            <p class="logic-text">"You are sending SOL to your hardware wallet address that you have used successfully 20 times this year."</p>
          </div>
        </div>
        <div class="telemetry">
          <div class="tel-item"><span>Address Age</span><span>502 Days</span></div>
          <div class="tel-item" style="border-left:1px solid #111; border-right:1px solid #111; padding: 0 12px;"><span>Last Time</span><span>1h ago</span></div>
          <div class="tel-item"><span>15D Tx</span><span>12</span></div>
        </div>
        <button class="btn" id="c">RETURN TO SOURCE</button>
        <button class="btn btn-s" id="o"><div class="hp" id="hp"></div><span>SETTLE INTENT: CONFIRM [HOLD 1.5S]</span></button>
        <div class="footer"><p>VIGILANCE IS THE ONLY PERMANENT SHIELD.</p></div>
      </div>
    </div>
  \`;

  document.documentElement.appendChild(host);
  setTimeout(() => shadow.getElementById('b').classList.add('active'), 10);
  
  const close = () => {
    shadow.getElementById('b').classList.remove('active');
    setTimeout(() => host.remove(), 400);
  };
  
  shadow.getElementById('c').onclick = close;
  const sBtn = shadow.getElementById('o');
  const hp = shadow.getElementById('hp');
  let start, iv;
  const tick = () => {
    const elapsed = Date.now() - start;
    const p = Math.min(100, (elapsed / 1500) * 100);
    hp.style.width = p + '%';
    if (p >= 100) { clearInterval(iv); close(); }
  };
  sBtn.onmousedown = () => { start = Date.now(); iv = setInterval(tick, 10); };
  sBtn.onmouseup = sBtn.onmouseleave = () => { clearInterval(iv); hp.style.width = '0%'; };
}`
  },
  {
    path: 'content/ui/AlertNew.js',
    icon: <Fingerprint size={14} />,
    type: 'JS_UI_MODULE',
    content: `// VIGIL HUD: ALERT_NEW
// MODULE_ID: VIG-HUD-NEW

export function render(address, index) {
  const host = document.createElement('div');
  host.id = 'vigil-hud-root';
  host.style.cssText = 'position: fixed; z-index: 2147483647; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';
  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = \`
    <style>
      :host { --accent: #06b6d4; --bg: #050505; --font: 'Inter', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace; }
      @keyframes inspect-flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      .backdrop { position: fixed; inset: 0; background: rgba(0, 5, 5, 0.98); backdrop-filter: blur(60px); opacity: 0; transition: opacity 0.5s ease; pointer-events: auto; display: flex; align-items: center; justify-content: center; font-family: var(--font); }
      .backdrop.active { opacity: 1; }
      .card { width: 480px; background: radial-gradient(circle at top right, rgba(6, 182, 212, 0.1), transparent 70%), var(--bg); border: 2px solid rgba(6, 182, 212, 0.2); border-radius: 44px; padding: 48px; color: white; position: relative; overflow: hidden; box-shadow: 0 50px 100px rgba(0,0,0,1); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      .diag-open .card { transform: scale(0.9) translateX(-40px); opacity: 0.4; }
      .threat-badge { position: absolute; top: 32px; right: 32px; background: #000; border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 100px; padding: 6px 16px; display: flex; align-items: center; gap: 8px; cursor: pointer; }
      .threat-badge .val { color: var(--accent); font-weight: 900; font-style: italic; font-size: 14px; }
      .threat-badge .lbl { color: #3b82f6; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; border-left: 1px solid #222; padding-left: 10px; animation: inspect-flash 2s infinite; }
      .header { display: flex; align-items: center; gap: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 32px; margin-bottom: 32px; }
      .icon-box { width: 64px; height: 64px; background: rgba(6, 182, 212, 0.05); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
      .header-text h3 { color: var(--accent); font-weight: 900; font-style: italic; font-size: 22px; margin: 0; text-transform: uppercase; }
      .header-text p { font-size: 9px; font-weight: 900; color: #555; letter-spacing: 0.4em; margin: 6px 0 0 0; text-transform: uppercase; }
      .logic-section { margin-bottom: 32px; }
      .block { margin-bottom: 24px; }
      .lbl-pill { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 8px; font-weight: 900; letter-spacing: 0.15em; margin-bottom: 8px; text-transform: uppercase; }
      .lbl-def { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
      .lbl-ex { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
      .logic-text { font-size: 15px; color: #999; font-style: italic; line-height: 1.6; margin: 0; font-weight: 500; }
      .telemetry { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 32px; }
      .tel-item span { display: block; }
      .tel-item span:first-child { font-size: 8px; font-weight: 900; color: #444; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 4px; }
      .tel-item span:last-child { font-family: var(--mono); font-size: 12px; font-weight: 700; color: #ccc; }
      .btn { width: 100%; padding: 20px; border-radius: 18px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 12px; position: relative; overflow: hidden; transition: all 0.2s; }
      .btn-p { background: var(--accent); color: #000; margin-bottom: 12px; }
      .btn-s { background: #0a0a0a; border: 1px solid #1a1a1a; color: #666; margin-bottom: 12px; }
      .hp { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(6, 182, 212, 0.15); width: 0%; transition: width 0.05s linear; pointer-events: none; }
      .footer { pt: 32px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
      .footer p { font-size: 8px; font-weight: 900; color: #333; letter-spacing: 0.2em; margin: 24px 0 0 0; text-transform: uppercase; }

      .diagnostic { position: absolute; inset: 0; background: #050505; z-index: 100; padding: 48px; display: none; flex-direction: column; }
      .diagnostic.active { display: flex; }
      .diag-header { border-bottom: 1px solid #111; padding-bottom: 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
      .axis-row { display: grid; grid-template-columns: 1fr 100px 60px; gap: 16px; align-items: center; margin-bottom: 16px; }
      .axis-label { font-size: 10px; font-weight: 900; color: #666; text-transform: uppercase; }
      .axis-bar { height: 2px; background: #111; position: relative; }
      .axis-fill { height: 100%; background: var(--accent); position: absolute; left: 0; top: 0; }
      .axis-val { font-family: var(--mono); font-size: 10px; color: white; text-align: right; }
      .close-diag { cursor: pointer; color: #444; }
      .close-diag:hover { color: white; }
    </style>
    <div class="backdrop" id="b">
      <div class="card" id="card">
        <div class="threat-badge" id="inspect">
          <span class="val">THREAT INDEX \${index}%</span>
          <span class="lbl">Inspect</span>
        </div>
        <div class="header">
          <div class="icon-box">👤</div>
          <div class="header-text">
            <h3>Report: New Address</h3>
            <p>ACTIVE_INTERCEPTION_LAYER</p>
          </div>
        </div>
        <div class="logic-section">
          <div class="block">
            <div class="lbl-pill lbl-def">Definition</div>
            <p class="logic-text">"Forensic alert for addresses with no prior interaction history or established on-chain reputation."</p>
          </div>
          <div class="block">
            <div class="lbl-pill lbl-ex">Example</div>
            <p class="logic-text">"You try to send funds to a wallet address that was created only 10 minutes ago and has zero previous transactions."</p>
          </div>
        </div>
        <div class="telemetry">
          <div class="tel-item"><span>Address Age</span><span>1 Day</span></div>
          <div class="tel-item" style="border-left:1px solid #111; border-right:1px solid #111; padding: 0 12px;"><span>Last Time</span><span>New</span></div>
          <div class="tel-item"><span>15D Tx</span><span>0</span></div>
        </div>
        <button class="btn btn-p" id="c">INITIATE FORENSIC SCAN</button>
        <button class="btn btn-s" id="t"><div class="hp" id="hpt"></div><span>AUTHORIZE AS TRUSTED NODE [HOLD 1.5S]</span></button>
        <button class="btn btn-s" id="o"><div class="hp" id="hp"></div><span>CONTINUE TO EXECUTION [HOLD 1.5S]</span></button>
        <div class="footer"><p>VIGIL ADVISORY: SECURITY IS PROBABILISTIC. WE DO NOT SIGN TRANSACTIONS. OPERATOR ASSUMES ALL RISK.</p></div>
      </div>

      <div class="diagnostic" id="diag">
        <div class="diag-header">
          <div>
            <div style="font-size: 9px; font-weight: 900; color: var(--accent); letter-spacing: 0.4em;">TIM v1.0 // CALC_ENGINE</div>
            <div style="font-size: 24px; font-weight: 900; font-style: italic; text-transform: uppercase;">Diagnostic.</div>
          </div>
          <div class="close-diag" id="close-diag">CLOSE [X]</div>
        </div>
        <div style="flex: 1">
          <div class="axis-row"><span class="axis-label">Visual Similarity</span><div class="axis-bar"><div class="axis-fill" style="width:10%"></div></div><span class="axis-val">10</span></div>
          <div class="axis-row"><span class="axis-label">Entropy Deviation</span><div class="axis-bar"><div class="axis-fill" style="width:0%"></div></div><span class="axis-val">0</span></div>
          <div class="axis-row"><span class="axis-label">Provenance Depth</span><div class="axis-bar"><div class="axis-fill" style="width:100%"></div></div><span class="axis-val">100</span></div>
          <div class="axis-row"><span class="axis-label">Context Risk</span><div class="axis-bar"><div class="axis-fill" style="width:30%"></div></div><span class="axis-val">30</span></div>
          <div class="axis-row"><span class="axis-label">Interaction Pattern</span><div class="axis-bar"><div class="axis-fill" style="width:10%"></div></div><span class="axis-val">10</span></div>
          <div class="axis-row"><span class="axis-label">Registry Integrity</span><div class="axis-bar"><div class="axis-fill" style="width:0%"></div></div><span class="axis-val">0</span></div>
          <div class="axis-row"><span class="axis-label">Execution Integrity</span><div class="axis-bar"><div class="axis-fill" style="width:0%"></div></div><span class="axis-val">0</span></div>
        </div>
        <div style="text-align: right">
          <div style="font-size: 10px; color: #444; font-weight: 900; text-transform: uppercase;">Composite Index</div>
          <div style="font-size: 48px; color: var(--accent); font-weight: 900; font-style: italic;">\${index}%</div>
        </div>
      </div>
    </div>
  \`;

  document.documentElement.appendChild(host);
  setTimeout(() => shadow.getElementById('b').classList.add('active'), 10);
  
  const close = () => {
    shadow.getElementById('b').classList.remove('active');
    setTimeout(() => host.remove(), 400);
  };

  shadow.getElementById('c').onclick = close;
  shadow.getElementById('inspect').onclick = () => {
    shadow.getElementById('diag').classList.add('active');
    shadow.getElementById('b').classList.add('diag-open');
  };
  shadow.getElementById('close-diag').onclick = () => {
    shadow.getElementById('diag').classList.remove('active');
    shadow.getElementById('b').classList.remove('diag-open');
  };

  const setupHold = (id, hpId, onComplete) => {
    const btn = shadow.getElementById(id);
    const hp = shadow.getElementById(hpId);
    let start, iv;
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / 1500) * 100);
      hp.style.width = p + '%';
      if (p >= 100) { clearInterval(iv); onComplete(); }
    };
    btn.onmousedown = () => { start = Date.now(); iv = setInterval(tick, 10); };
    btn.onmouseup = btn.onmouseleave = () => { clearInterval(iv); hp.style.width = '0%'; };
  };

  setupHold('o', 'hp', close);
  setupHold('t', 'hpt', async () => {
    const data = await chrome.storage.local.get(['VIG_USER_TRUSTED_NODES']);
    const list = data.VIG_USER_TRUSTED_NODES || [];
    if (!list.includes(address)) {
      list.push(address);
      await chrome.storage.local.set({ 'VIG_USER_TRUSTED_NODES': list });
    }
    close();
  });
}`
  },
  {
    path: 'content/ui/AlertPhishing.js',
    icon: <Radar size={14} />,
    type: 'JS_UI_MODULE',
    content: `// VIGIL HUD: ALERT_PHISHING
// MODULE_ID: VIG-HUD-PHI

export function render(address, index) {
  const host = document.createElement('div');
  host.id = 'vigil-hud-root';
  host.style.cssText = 'position: fixed; z-index: 2147483647; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';
  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = \`
    <style>
      :host { --accent: #a855f7; --bg: #0a0a0a; --font: 'Inter', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace; }
      .backdrop { position: fixed; inset: 0; background: rgba(5, 0, 5, 0.96); backdrop-filter: blur(40px); opacity: 0; transition: opacity 0.5s ease; pointer-events: auto; display: flex; align-items: center; justify-content: center; font-family: var(--font); }
      .backdrop.active { opacity: 1; }
      .card { width: 440px; background: var(--bg); border: 2px solid rgba(168, 85, 247, 0.2); border-radius: 40px; padding: 40px; color: white; position: relative; overflow: hidden; }
      .threat-index { position: absolute; top: 32px; right: 32px; background: #000; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 100px; padding: 4px 12px; font-weight: 900; font-style: italic; color: var(--accent); font-size: 13px; }
      .header { display: flex; align-items: center; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 24px; margin-bottom: 24px; }
      .icon-box { width: 56px; height: 56px; background: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
      .header-text h3 { color: var(--accent); font-weight: 900; font-style: italic; font-size: 18px; margin: 0; text-transform: uppercase; }
      .header-text p { font-size: 8px; font-weight: 900; color: #555; letter-spacing: 0.3em; margin: 4px 0 0 0; text-transform: uppercase; }
      .logic-block { margin-bottom: 24px; }
      .label { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 7px; font-weight: 900; letter-spacing: 0.1em; margin-bottom: 6px; text-transform: uppercase; }
      .label-def { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
      .logic-text { font-size: 12px; color: #888; font-style: italic; line-height: 1.5; margin: 0; }
      .addr { background: #000; border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 16px; font-family: var(--mono); font-size: 11px; color: var(--accent); word-break: break-all; margin-bottom: 24px; }
      .telemetry { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 16px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
      .tel-item span:first-child { font-size: 7px; font-weight: 900; color: #444; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
      .tel-item span:last-child { font-family: var(--mono); font-size: 10px; font-weight: 700; color: #bbb; }
      .btn { width: 100%; padding: 16px; border-radius: 14px; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; position: relative; overflow: hidden; }
      .btn-p { background: var(--accent); color: #000; margin-bottom: 10px; }
      .btn-s { background: transparent; border: 1px solid #222; color: #555; }
      .hp { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(168, 85, 247, 0.15); width: 0%; transition: width 0.05s linear; pointer-events: none; }
      .legal p { font-size: 7px; font-weight: 900; color: #333; letter-spacing: 0.1em; margin: 16px 0 0 0; text-transform: uppercase; text-align: center; }
    </style>
    <div class="backdrop" id="b">
      <div class="card">
        <div class="threat-index">\${index}%</div>
        <div class="header">
          <div class="icon-box">📡</div>
          <div class="header-text">
            <h3>Phishing Shield</h3>
            <p>VIGIL_FIELD_UNIT // SRC_UNTRUSTED</p>
          </div>
        </div>
        <div class="logic-block">
          <div class="label label-def">Interception</div>
          <p class="logic-text">Triggered by high-risk source contexts such as social DMs or unverified dApp portals. Source authenticity cannot be established.</p>
        </div>
        <div class="addr">\${address}</div>
        <div class="telemetry">
          <div class="tel-item"><span>Address Age</span><span>3 Days</span></div>
          <div class="tel-item" style="border-left:1px solid #111; border-right:1px solid #111; padding: 0 12px;"><span>Last Time</span><span>Never</span></div>
          <div class="tel-item"><span>15D Tx</span><span>1</span></div>
        </div>
        <button class="btn btn-p" id="c">TERMINAL ABORT: SOURCE UNTRUSTED</button>
        <button class="btn btn-s" id="o"><div class="hp" id="hp"></div><span>IGNORE SHIELD [HOLD]</span></button>
        <div class="legal"><p>VIGILANCE IS THE ONLY PERMANENT SHIELD.</p></div>
      </div>
    </div>
  \`;

  document.documentElement.appendChild(host);
  setTimeout(() => shadow.getElementById('b').classList.add('active'), 10);
  const close = () => {
    shadow.getElementById('b').classList.remove('active');
    setTimeout(() => host.remove(), 400);
  };
  shadow.getElementById('c').onclick = close;
  const sBtn = shadow.getElementById('o');
  const hp = shadow.getElementById('hp');
  let start, iv;
  const tick = () => {
    const elapsed = Date.now() - start;
    const p = Math.min(100, (elapsed / 1500) * 100);
    hp.style.width = p + '%';
    if (p >= 100) { clearInterval(iv); close(); }
  };
  sBtn.onmousedown = () => { start = Date.now(); iv = setInterval(tick, 10); };
  sBtn.onmouseup = sBtn.onmouseleave = () => { clearInterval(iv); hp.style.width = '0%'; };
  sBtn.ontouchstart = (e) => { e.preventDefault(); start = Date.now(); iv = setInterval(tick, 10); };
  sBtn.ontouchend = () => { clearInterval(iv); hp.style.width = '0%'; };
}`
  },
  {
    path: 'content/ui/AlertDust.js',
    icon: <AlertOctagon size={14} />,
    type: 'JS_UI_MODULE',
    content: `// VIGIL HUD: ALERT_DUST
// MODULE_ID: VIG-HUD-DUS

export function render(address, index) {
  const host = document.createElement('div');
  host.id = 'vigil-hud-root';
  host.style.cssText = 'position: fixed; z-index: 2147483647; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';
  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = \`
    <style>
      :host { --accent: #f59e0b; --bg: #0a0a0a; --font: 'Inter', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace; }
      .backdrop { position: fixed; inset: 0; background: rgba(2, 2, 0, 0.95); backdrop-filter: blur(40px); opacity: 0; transition: opacity 0.5s ease; pointer-events: auto; display: flex; align-items: center; justify-content: center; font-family: var(--font); }
      .backdrop.active { opacity: 1; }
      .card { width: 440px; background: var(--bg); border: 2px solid rgba(245, 158, 11, 0.2); border-radius: 40px; padding: 40px; color: white; position: relative; overflow: hidden; }
      .threat-badge { position: absolute; top: 32px; right: 32px; background: #000; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 100px; padding: 4px 12px; display: flex; items: center; gap: 6px; }
      .threat-badge .val { color: var(--accent); font-weight: 900; font-style: italic; font-size: 13px; }
      .threat-badge .lbl { color: #3b82f6; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border-left: 1px solid #222; padding-left: 6px; }
      .header { display: flex; align-items: center; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 24px; margin-bottom: 24px; }
      .icon-box { width: 56px; height: 56px; background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
      .header-text h3 { color: var(--accent); font-weight: 900; font-style: italic; font-size: 18px; margin: 0; text-transform: uppercase; }
      .header-text p { font-size: 8px; font-weight: 900; color: #555; letter-spacing: 0.3em; margin: 4px 0 0 0; text-transform: uppercase; }
      .logic-section { margin-bottom: 24px; }
      .logic-label { display: flex; items: center; gap: 8px; margin-bottom: 12px; }
      .logic-label .dot { w: 4px; h: 4px; border-radius: 50%; background: var(--accent); }
      .logic-label span { font-size: 10px; font-weight: 900; color: #555; letter-spacing: 0.2em; text-transform: uppercase; }
      .block { margin-bottom: 20px; }
      .lbl-pill { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 7px; font-weight: 900; letter-spacing: 0.1em; margin-bottom: 6px; text-transform: uppercase; }
      .lbl-def { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
      .lbl-ex { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
      .logic-text { font-size: 14px; color: #888; font-style: italic; line-height: 1.5; margin: 0; font-weight: 500; }
      .telemetry { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 16px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
      .tel-item span:first-child { font-size: 7px; font-weight: 900; color: #444; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
      .tel-item span:last-child { font-family: var(--mono); font-size: 11px; font-weight: 700; color: #bbb; }
      .btn { width: 100%; padding: 16px; border-radius: 14px; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; position: relative; overflow: hidden; }
      .btn-p { background: #0a0a0a; border: 1px solid rgba(245, 158, 11, 0.3); color: var(--accent); margin-bottom: 12px; }
      .btn-s { background: transparent; border: 1px solid #1a1a1a; color: #555; }
      .hp { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(245, 158, 11, 0.1); width: 0%; transition: width 0.05s linear; pointer-events: none; }
      .btn-s span { position: relative; z-index: 2; }
      .footer { pt: 20px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
      .footer p { font-size: 8px; font-weight: 900; color: #333; letter-spacing: 0.15em; margin: 16px 0 0 0; text-transform: uppercase; text-align: center; }
    </style>
    <div class="backdrop" id="b">
      <div class="card">
        <div class="threat-badge">
          <span class="val">\${index}%</span>
          <span class="lbl">Inspect</span>
        </div>
        <div class="header">
          <div class="icon-box">☢️</div>
          <div class="header-text">
            <h3>Dust Transfer Detected</h3>
            <p>ACTIVE_INTERCEPTION_LAYER</p>
          </div>
        </div>
        <div class="logic-section">
          <div class="logic-label"><div class="dot"></div><span>Interception Logic</span></div>
          <div class="block">
            <div class="lbl-pill lbl-def">Definition</div>
            <p class="logic-text">"Identification of unsolicited transfers used to pollute transaction logs with malicious destination history."</p>
          </div>
          <div class="block">
            <div class="lbl-pill lbl-ex">Example</div>
            <p class="logic-text">"A bot sends 0.000001 SOL to your wallet so that their malicious address appears at the top of your list."</p>
          </div>
        </div>
        <div class="telemetry">
          <div class="tel-item"><span>Address Age</span><span>42 Days</span></div>
          <div class="tel-item" style="border-left:1px solid #111; border-right:1px solid #111; padding: 0 12px;"><span>Last Time</span><span>14d ago</span></div>
          <div class="tel-item"><span>15D Tx</span><span>1</span></div>
        </div>
        <button class="btn btn-p" id="c">DISCARD INJECTED DATA</button>
        <button class="btn btn-s" id="o"><div class="hp" id="hp"></div><span>PROCEED: DUST VERIFIED [HOLD 1.5S]</span></button>
        <div class="footer"><p>VIGILANCE IS THE ONLY PERMANENT SHIELD.</p></div>
      </div>
    </div>
  \`;

  document.documentElement.appendChild(host);
  setTimeout(() => shadow.getElementById('b').classList.add('active'), 10);
  const close = () => {
    shadow.getElementById('b').classList.remove('active');
    setTimeout(() => host.remove(), 400);
  };
  shadow.getElementById('c').onclick = close;
  const sBtn = shadow.getElementById('o');
  const hp = shadow.getElementById('hp');
  let start, iv;
  const tick = () => {
    const elapsed = Date.now() - start;
    const p = Math.min(100, (elapsed / 1500) * 100);
    hp.style.width = p + '%';
    if (p >= 100) { clearInterval(iv); close(); }
  };
  sBtn.onmousedown = () => { start = Date.now(); iv = setInterval(tick, 10); };
  sBtn.onmouseup = sBtn.onmouseleave = () => { clearInterval(iv); hp.style.width = '0%'; };
  sBtn.ontouchstart = (e) => { e.preventDefault(); start = Date.now(); iv = setInterval(tick, 10); };
  sBtn.ontouchend = () => { clearInterval(iv); hp.style.width = '0%'; };
}`
  },
  {
    path: 'content/ui/AlertSimilarity.js',
    icon: <Scale size={14} />,
    type: 'JS_UI_MODULE',
    content: `// VIGIL HUD: ALERT_SIMILARITY
// MODULE_ID: VIG-HUD-SIM

export function render(address, index) {
  const host = document.createElement('div');
  host.id = 'vigil-hud-root';
  host.style.cssText = 'position: fixed; z-index: 2147483647; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';
  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = \`
    <style>
      :host { --accent: #eab308; --bg: #0a0a0a; --font: 'Inter', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace; }
      .backdrop { position: fixed; inset: 0; background: rgba(2, 2, 0, 0.95); backdrop-filter: blur(40px); opacity: 0; transition: opacity 0.5s ease; pointer-events: auto; display: flex; align-items: center; justify-content: center; font-family: var(--font); }
      .backdrop.active { opacity: 1; }
      .card { width: 440px; background: var(--bg); border: 2px solid rgba(234, 179, 8, 0.2); border-radius: 40px; padding: 40px; color: white; position: relative; overflow: hidden; }
      .threat-index { position: absolute; top: 32px; right: 32px; background: #000; border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 100px; padding: 4px 12px; font-weight: 900; font-style: italic; color: var(--accent); font-size: 13px; }
      .header { display: flex; align-items: center; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 24px; margin-bottom: 24px; }
      .icon-box { width: 56px; height: 56px; background: rgba(234, 179, 8, 0.05); border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
      .header-text h3 { color: var(--accent); font-weight: 900; font-style: italic; font-size: 18px; margin: 0; text-transform: uppercase; }
      .header-text p { font-size: 8px; font-weight: 900; color: #555; letter-spacing: 0.3em; margin: 4px 0 0 0; text-transform: uppercase; }
      .logic-block { margin-bottom: 24px; }
      .label { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 7px; font-weight: 900; letter-spacing: 0.1em; margin-bottom: 6px; text-transform: uppercase; }
      .label-def { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
      .logic-text { font-size: 12px; color: #888; font-style: italic; line-height: 1.5; margin: 0; }
      .addr { background: #000; border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 16px; font-family: var(--mono); font-size: 11px; color: var(--accent); word-break: break-all; margin-bottom: 24px; }
      .telemetry { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 16px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
      .tel-item span:first-child { font-size: 7px; font-weight: 900; color: #444; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
      .tel-item span:last-child { font-family: var(--mono); font-size: 10px; font-weight: 700; color: #bbb; }
      .btn { width: 100%; padding: 16px; border-radius: 14px; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; position: relative; overflow: hidden; }
      .btn-p { background: var(--accent); color: #000; margin-bottom: 10px; }
      .btn-s { background: transparent; border: 1px solid #222; color: #555; }
      .hp { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(234, 179, 8, 0.15); width: 0%; transition: width 0.05s linear; pointer-events: none; }
      .legal p { font-size: 7px; font-weight: 900; color: #333; letter-spacing: 0.1em; margin: 16px 0 0 0; text-transform: uppercase; text-align: center; }
    </style>
    <div class="backdrop" id="b">
      <div class="card">
        <div class="threat-index">\${index}%</div>
        <div class="header">
          <div class="icon-box">⚖️</div>
          <div class="header-text">
            <h3>Similarity Notice</h3>
            <p>VIGIL_FIELD_UNIT // HEURISTIC_MATCH</p>
          </div>
        </div>
        <div class="logic-block">
          <div class="label label-def">Analysis</div>
          <p class="logic-text">Analysis of non-random character clusters that signal a computationally generated vanity attack. Edge similarity is suspiciously high.</p>
        </div>
        <div class="addr">\${address}</div>
        <div class="telemetry">
          <div class="tel-item"><span>Address Age</span><span>891 Days</span></div>
          <div class="tel-item" style="border-left:1px solid #111; border-right:1px solid #111; padding: 0 12px;"><span>Last Time</span><span>2h ago</span></div>
          <div class="tel-item"><span>15D Tx</span><span>82</span></div>
        </div>
        <button class="btn btn-p" id="c">COMPARE CHARACTER NODES</button>
        <button class="btn btn-s" id="o"><div class="hp" id="hp"></div><span>INTENT MATCHES: CONTINUE [HOLD]</span></button>
        <div class="legal"><p>VIGILANCE IS THE ONLY PERMANENT SHIELD.</p></div>
      </div>
    </div>
  \`;

  document.documentElement.appendChild(host);
  setTimeout(() => shadow.getElementById('b').classList.add('active'), 10);
  const close = () => {
    shadow.getElementById('b').classList.remove('active');
    setTimeout(() => host.remove(), 400);
  };
  shadow.getElementById('c').onclick = close;
  const sBtn = shadow.getElementById('o');
  const hp = shadow.getElementById('hp');
  let start, iv;
  const tick = () => {
    const elapsed = Date.now() - start;
    const p = Math.min(100, (elapsed / 1500) * 100);
    hp.style.width = p + '%';
    if (p >= 100) { clearInterval(iv); close(); }
  };
  sBtn.onmousedown = () => { start = Date.now(); iv = setInterval(tick, 10); };
  sBtn.onmouseup = sBtn.onmouseleave = () => { clearInterval(iv); hp.style.width = '0%'; };
  sBtn.ontouchstart = (e) => { e.preventDefault(); start = Date.now(); iv = setInterval(tick, 10); };
  sBtn.ontouchend = () => { clearInterval(iv); hp.style.width = '0%'; };
}`
  },
  {
    path: 'content/ui/AlertMint.js',
    icon: <ShieldX size={14} />,
    type: 'JS_UI_MODULE',
    content: `// VIGIL HUD: ALERT_MINT
// MODULE_ID: VIG-HUD-MNT

export function render(address, index) {
  const host = document.createElement('div');
  host.id = 'vigil-hud-root';
  host.style.cssText = 'position: fixed; z-index: 2147483647; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';
  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = \`
    <style>
      :host { --threat: #b91c1c; --bg: #0a0a0a; --font: 'Inter', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace; }
      @keyframes strobe { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      .backdrop { position: fixed; inset: 0; background: rgba(5, 0, 0, 0.96); backdrop-filter: blur(40px); opacity: 0; transition: opacity 0.5s ease; pointer-events: auto; display: flex; align-items: center; justify-content: center; font-family: var(--font); }
      .backdrop.active { opacity: 1; }
      .card { width: 440px; background: var(--bg); border: 2px solid rgba(185, 28, 28, 0.3); border-radius: 40px; padding: 40px; color: white; position: relative; overflow: hidden; box-shadow: 0 50px 100px rgba(0,0,0,1); }
      .threat-index { position: absolute; top: 32px; right: 32px; background: #000; border: 1px solid rgba(185, 28, 28, 0.4); border-radius: 100px; padding: 4px 12px; font-weight: 900; font-style: italic; color: var(--threat); font-size: 13px; }
      .header { display: flex; align-items: center; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 24px; margin-bottom: 24px; }
      .icon-box { width: 56px; height: 56px; background: rgba(185, 28, 28, 0.05); border: 1px solid rgba(185, 28, 28, 0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; animation: strobe 0.5s infinite; }
      .header-text h3 { color: var(--threat); font-weight: 900; font-style: italic; font-size: 18px; margin: 0; text-transform: uppercase; }
      .header-text p { font-size: 8px; font-weight: 900; color: #555; letter-spacing: 0.3em; margin: 4px 0 0 0; text-transform: uppercase; }
      .logic-block { margin-bottom: 24px; }
      .label { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 7px; font-weight: 900; letter-spacing: 0.1em; margin-bottom: 6px; text-transform: uppercase; }
      .label-def { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
      .logic-text { font-size: 12px; color: #888; font-style: italic; line-height: 1.5; margin: 0; }
      .addr { background: #000; border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 16px; font-family: var(--mono); font-size: 11px; color: var(--threat); word-break: break-all; margin-bottom: 24px; }
      .telemetry { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 16px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
      .tel-item span:first-child { font-size: 7px; font-weight: 900; color: #444; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
      .tel-item span:last-child { font-family: var(--mono); font-size: 10px; font-weight: 700; color: #bbb; }
      .btn { width: 100%; padding: 16px; border-radius: 14px; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; position: relative; overflow: hidden; }
      .btn-p { background: var(--threat); color: #fff; margin-bottom: 10px; }
      .btn-s { background: transparent; border: 1px solid #222; color: #555; }
      .hp { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(185, 28, 28, 0.15); width: 0%; transition: width 0.05s linear; pointer-events: none; }
      .legal p { font-size: 7px; font-weight: 900; color: #333; letter-spacing: 0.1em; margin: 16px 0 0 0; text-transform: uppercase; text-align: center; }
    </style>
    <div class="backdrop" id="b">
      <div class="card">
        <div class="threat-index">\${index}%</div>
        <div class="header">
          <div class="icon-box">❌</div>
          <div class="header-text">
            <h3>Mint Mismatch</h3>
            <p>VIGIL_FIELD_UNIT // REGISTRY_FAILURE</p>
          </div>
        </div>
        <div class="logic-block">
          <div class="label label-def">Shielding</div>
          <p class="logic-text">Against counterfeit assets that impersonate legitimate tokens via registry verification failure. This is likely a malicious impersonator.</p>
        </div>
        <div class="addr">\${address}</div>
        <div class="telemetry">
          <div class="tel-item"><span>Address Age</span><span>12 Days</span></div>
          <div class="tel-item" style="border-left:1px solid #111; border-right:1px solid #111; padding: 0 12px;"><span>Last Time</span><span>3h ago</span></div>
          <div class="tel-item"><span>15D Tx</span><span>1,209</span></div>
        </div>
        <button class="btn btn-p" id="c">BLOCK COUNTERFEIT ASSET</button>
        <button class="btn btn-s" id="o"><div class="hp" id="hp"></div><span>IGNORE REGISTRY: EXECUTE [HOLD]</span></button>
        <div class="legal"><p>VIGILANCE IS THE ONLY PERMANENT SHIELD.</p></div>
      </div>
    </div>
  \`;

  document.documentElement.appendChild(host);
  setTimeout(() => shadow.getElementById('b').classList.add('active'), 10);
  const close = () => {
    shadow.getElementById('b').classList.remove('active');
    setTimeout(() => host.remove(), 400);
  };
  shadow.getElementById('c').onclick = close;
  const sBtn = shadow.getElementById('o');
  const hp = shadow.getElementById('hp');
  let start, iv;
  const tick = () => {
    const elapsed = Date.now() - start;
    const p = Math.min(100, (elapsed / 1500) * 100);
    hp.style.width = p + '%';
    if (p >= 100) { clearInterval(iv); close(); }
  };
  sBtn.onmousedown = () => { start = Date.now(); iv = setInterval(tick, 10); };
  sBtn.onmouseup = sBtn.onmouseleave = () => { clearInterval(iv); hp.style.width = '0%'; };
  sBtn.ontouchstart = (e) => { e.preventDefault(); start = Date.now(); iv = setInterval(tick, 10); };
  sBtn.ontouchend = () => { clearInterval(iv); hp.style.width = '0%'; };
}`
  },
  {
    path: 'content/ui/AlertSpoof.js',
    icon: <Eye size={14} />,
    type: 'JS_UI_MODULE',
    content: `// VIGIL HUD: ALERT_SPOOF
// MODULE_ID: VIG-HUD-SPF

export function render(address, index) {
  const host = document.createElement('div');
  host.id = 'vigil-hud-root';
  host.style.cssText = 'position: fixed; z-index: 2147483647; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';
  const shadow = host.attachShadow({ mode: 'open' });

  // Corrected escaping to avoid tagged template expression error
  shadow.innerHTML = \`
    <style>
      :host { --accent: #ec4899; --bg: #0a0a0a; --font: 'Inter', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace; }
      @keyframes magnify { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
      .backdrop { position: fixed; inset: 0; background: rgba(5, 0, 5, 0.96); backdrop-filter: blur(40px); opacity: 0; transition: opacity 0.5s ease; pointer-events: auto; display: flex; align-items: center; justify-content: center; font-family: var(--font); }
      .backdrop.active { opacity: 1; }
      .card { width: 440px; background: var(--bg); border: 2px solid rgba(236, 72, 153, 0.4); border-radius: 40px; padding: 40px; color: white; position: relative; overflow: hidden; }
      .threat-badge { position: absolute; top: 32px; right: 32px; background: #000; border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 100px; padding: 4px 12px; display: flex; items: center; gap: 6px; }
      .threat-badge .val { color: var(--accent); font-weight: 900; font-style: italic; font-size: 13px; }
      .threat-badge .lbl { color: #3b82f6; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border-left: 1px solid #222; padding-left: 6px; }
      .header { display: flex; align-items: center; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 24px; margin-bottom: 24px; }
      .icon-box { width: 56px; height: 56px; background: rgba(236, 72, 153, 0.05); border: 1px solid rgba(236, 72, 153, 0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; animation: magnify 4s infinite ease-in-out; }
      .header-text h3 { color: var(--accent); font-weight: 900; font-style: italic; font-size: 18px; margin: 0; text-transform: uppercase; }
      .header-text p { font-size: 8px; font-weight: 900; color: #555; letter-spacing: 0.3em; margin: 4px 0 0 0; text-transform: uppercase; }
      .logic-section { margin-bottom: 24px; }
      .logic-label { display: flex; items: center; gap: 8px; margin-bottom: 12px; }
      .logic-label .dot { w: 4px; h: 4px; border-radius: 50%; background: var(--accent); }
      .logic-label span { font-size: 10px; font-weight: 900; color: #555; letter-spacing: 0.2em; text-transform: uppercase; }
      .block { margin-bottom: 20px; }
      .lbl-pill { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 7px; font-weight: 900; letter-spacing: 0.1em; margin-bottom: 6px; text-transform: uppercase; }
      .lbl-def { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
      .lbl-ex { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
      .logic-text { font-size: 14px; color: #888; font-style: italic; line-height: 1.5; margin: 0; font-weight: 500; }
      .telemetry { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 16px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
      .tel-item span:first-child { font-size: 7px; font-weight: 900; color: #444; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
      .tel-item span:last-child { font-family: var(--mono); font-size: 11px; font-weight: 700; color: #bbb; }
      .btn { width: 100%; padding: 16px; border-radius: 14px; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; position: relative; overflow: hidden; }
      .btn-p { background: #0a0a0a; border: 1px solid rgba(236, 72, 153, 0.4); color: var(--accent); margin-bottom: 12px; }
      .btn-s { background: transparent; border: 1px solid #1a1a1a; color: #555; }
      .hp { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(236, 72, 153, 0.15); width: 0%; transition: width 0.05s linear; pointer-events: none; }
      .legal p { font-size: 7px; font-weight: 900; color: #333; letter-spacing: 0.1em; margin: 16px 0 0 0; text-transform: uppercase; text-align: center; }
    </style>
    <div class="backdrop" id="b">
      <div class="card">
        <div class="threat-badge">
          <span class="val">\${index}%</span>
          <span class="lbl">Inspect</span>
        </div>
        <div class="header">
          <div class="icon-box">👁️</div>
          <div class="header-text">
            <h3>Visual Spoof Detected</h3>
            <p>ACTIVE_INTERCEPTION_LAYER</p>
          </div>
        </div>
        <div class="logic-section">
          <div class="logic-label"><div class="dot"></div><span>Interception Logic</span></div>
          <div class="block">
            <div class="lbl-pill lbl-def">Definition</div>
            <p class="logic-text">"Detection of deceptive Unicode homographs and character substitutions designed to simulate authentic destinations."</p>
          </div>
          <div class="block">
            <div class="lbl-pill lbl-ex">Example</div>
            <p class="logic-text">"A scammer uses a Greek 'ο' instead of a Latin 'o' in an address string; to your eye they look identical."</p>
          </div>
        </div>
        <div class="telemetry">
          <div class="tel-item"><span>Address Age</span><span>5 Days</span></div>
          <div class="tel-item" style="border-left:1px solid #111; border-right:1px solid #111; padding: 0 12px;"><span>Last Time</span><span>Never</span></div>
          <div class="tel-item"><span>15D Tx</span><span>2</span></div>
        </div>
        <button class="btn btn-p" id="c">NEUTRALIZE DECEPTION</button>
        <button class="btn btn-s" id="o"><div class="hp" id="hp"></div><span>BYPASS BIOLOGICAL SHIELD [HOLD 1.5S]</span></button>
        <div class="footer"><p>VIGILANCE IS THE ONLY PERMANENT SHIELD.</p></div>
      </div>
    </div>
  \`;

  document.documentElement.appendChild(host);
  setTimeout(() => shadow.getElementById('b').classList.add('active'), 10);
  const close = () => {
    shadow.getElementById('b').classList.remove('active');
    setTimeout(() => host.remove(), 400);
  };
  shadow.getElementById('c').onclick = close;
  const sBtn = shadow.getElementById('o');
  const hp = shadow.getElementById('hp');
  let start, iv;
  const tick = () => {
    const elapsed = Date.now() - start;
    const p = Math.min(100, (elapsed / 1500) * 100);
    hp.style.width = p + '%';
    if (p >= 100) { clearInterval(iv); close(); }
  };
  sBtn.onmousedown = () => { start = Date.now(); iv = setInterval(tick, 10); };
  sBtn.onmouseup = sBtn.onmouseleave = () => { clearInterval(iv); hp.style.width = '0%'; };
  sBtn.ontouchstart = (e) => { e.preventDefault(); start = Date.now(); iv = setInterval(tick, 10); };
  sBtn.ontouchend = () => { clearInterval(iv); hp.style.width = '0%'; };
}`
  },
  {
    path: 'popup/popup.html',
    icon: <Layout size={14} />,
    type: 'HTML_UI_ROOT',
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>VIGIL | Field Unit Dashboard</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div id="vigil-popup">
    <header>
      <div class="brand">
        <div class="logo">V</div>
        <span>VIGIL_DASHBOARD</span>
      </div>
      <div class="status-dot"></div>
    </header>
    
    <main>
      <div class="bri-card">
        <div class="bri-label">Biological Resilience</div>
        <div class="bri-value" id="bri-val">100%</div>
        <div class="bri-bar"><div id="bri-fill"></div></div>
      </div>
      
      <div class="toggles">
        <div class="toggle-item">
          <span>RETINAL_SHIELD</span>
          <div class="toggle active"></div>
        </div>
        <div class="toggle-item">
          <span>CLIPBOARD_GUARD</span>
          <div class="toggle active"></div>
        </div>
      </div>
      
      <div class="log-feed" id="log-feed">
        <div class="log-item">Awaiting intercepts...</div>
      </div>
    </main>
    
    <footer>
      <span>v0.0.0.1 // NPP_SYNC_OK</span>
    </footer>
  </div>
  <script type="module" src="popup.js"></script>
</body>
</html>`
  },
  {
    path: 'popup/popup.css',
    icon: <FileCode size={14} />,
    type: 'CSS_UI_STYLING',
    content: `/* VIGIL DASHBOARD AESTHETIC */
:root {
  --bg: #050505;
  --zinc-800: #111111;
  --accent: #3b82f6;
}

body {
  width: 320px;
  height: 480px;
  margin: 0;
  background: var(--bg);
  color: #fff;
  font-family: 'Inter', sans-serif;
  padding: 20px;
  box-sizing: border-box;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #222;
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.brand {
  display: flex;
  align-items: center; gap: 8px; font-weight: 900; font-style: italic; font-size: 10px; letter-spacing: 0.2em;
}

.logo {
  width: 16px; height: 16px; background: #fff; color: #000; display: flex; align-items: center; justify-content: center; border-radius: 2px; font-style: normal;
}

.status-dot {
  width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981;
}

.bri-card {
  background: var(--zinc-800); padding: 20px; border-radius: 20px; margin-bottom: 20px;
}

.bri-label {
  font-size: 8px; font-weight: 900; text-transform: uppercase; color: #555; margin-bottom: 8px;
}

.bri-value {
  font-size: 32px; font-weight: 900; font-style: italic; margin-bottom: 12px;
}

.bri-bar {
  height: 4px; background: #000; border-radius: 2px; overflow: hidden;
}

#bri-fill {
  height: 100%; width: 100%; background: var(--accent); transition: 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.toggles {
  display: grid; gap: 8px;
}

.toggle-item {
  padding: 12px 16px; background: #080808; border: 1px solid #111; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; font-weight: 900; letter-spacing: 0.1em; color: #666;
}

.toggle {
  width: 28px; height: 14px; background: #111; border-radius: 100px; position: relative;
}

.toggle.active::after {
  content: ""; position: absolute; right: 2px; top: 2px; width: 10px; height: 10px; background: #10b981; border-radius: 50%;
}

footer {
  position: absolute; bottom: 20px; left: 20px; right: 20px; text-align: center; font-size: 8px; font-weight: 900; color: #333; letter-spacing: 0.2em;
}`
  },
  {
    path: 'popup/popup.js',
    icon: <FileCode size={14} />,
    type: 'JS_UI_LOGIC',
    content: `// VIGIL DASHBOARD CONTROLLER
// VERSION: 0.0.0.1

async function updateDashboard() {
  const data = await chrome.storage.local.get(['VIG_USER_BRI']);
  const bri = data.VIG_USER_BRI !== undefined ? data.VIG_USER_BRI : 100;
  
  const valEl = document.getElementById('bri-val');
  const fillEl = document.getElementById('bri-fill');
  
  if (valEl) valEl.innerText = \`\${bri}%\`;
  if (fillEl) {
    fillEl.style.width = \`\${bri}%\`;
    fillEl.style.backgroundColor = bri > 80 ? '#10b981' : bri > 40 ? '#f59e0b' : '#ef4444';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateDashboard();
  setInterval(updateDashboard, 1000);
  console.log("[VIGIL] Dashboard active.");
});`
  }
];