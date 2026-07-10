/*!
 * Yo-bot — embeddable AI support chat about Chaiyo.
 *
 * Embed on ANY website with one line:
 *   <script src="https://YOUR-PORTFOLIO-DOMAIN/yo-bot.js" defer></script>
 *
 * Optional attributes:
 *   data-bot="<public-id>"                    which bot to load (its id in
 *                                             the platform dashboard / DB)
 *   data-site="<public-id>"                   back-compat alias for data-bot
 *   data-endpoint="https://…/api/chat"        override the chat API URL
 *   data-mamba-endpoint="https://…/chat"      enable the "My Mamba" toggle
 *   data-bot-name="MyBot"                     display name in header + greeting
 *   data-lang="th"                            force UI language (th/en);
 *                                             default follows the browser
 *
 * By default the chat API is assumed to live on the same origin the script
 * was loaded from (…/api/chat). Plain IIFE — no modules, no dependencies.
 * Styles are self-contained; it adopts the portfolio theme variables
 * (--accent, --fg, …) when present, with fallbacks for any other site.
 */
(function () {
  'use strict';

  // --- config from our own <script> tag -----------------------------------
  var script = document.currentScript;
  var scriptOrigin = '';
  try {
    if (script && script.src) scriptOrigin = new URL(script.src).origin;
  } catch (e) {}

  var API_ENDPOINT =
    (script && script.dataset.endpoint) ||
    (scriptOrigin ? scriptOrigin + '/api/chat' : '/api/chat');
  var MAMBA_ENDPOINT = (script && script.dataset.mambaEndpoint) || '';
  var BOT_NAME = (script && script.dataset.botName) || 'Yo-bot';
  // Which bot to talk to — its public id in the platform DB.
  // data-bot is the platform attribute; data-site is a back-compat alias.
  var BOT_ID =
    (script && (script.dataset.bot || script.dataset.site)) || 'portfolio';

  // Accent color. data-accent="#rrggbb" wins (inline override); otherwise the
  // bot's dashboard-chosen color is fetched from /api/bot-config on load.
  var ACCENT = (script && script.dataset.accent) || '';
  var CONFIG_ENDPOINT =
    (script && script.dataset.configEndpoint) ||
    (scriptOrigin ? scriptOrigin + '/api/bot-config' : '/api/bot-config');

  // UI language: data-lang="th"/"en" wins; otherwise follow the browser.
  var LANG =
    (script && script.dataset.lang) ||
    ((navigator.language || '').toLowerCase().indexOf('th') === 0 ? 'th' : 'en');
  var TH = LANG === 'th';

  var GREETING = TH
    ? 'สวัสดีครับ! ผม ' +
      BOT_NAME +
      ' 🤖 ถามอะไรเกี่ยวกับไชโยได้เลย — งาน สกิล โปรเจกต์ หรือช่องทางติดต่อครับ'
    : "Hi! I'm " +
      BOT_NAME +
      ' 🤖 — ask me anything about Chaiyo: his work, skills, projects, or how to reach him.';
  var SUBTITLE = TH ? 'AI support · ถามเรื่องไชโยได้เลย' : 'AI support · ask about Chaiyo';
  var PLACEHOLDER = TH ? 'ถามเรื่องไชโย…' : 'Ask about Chaiyo…';

  // --- styles (all values fall back so host pages without the portfolio ---
  // --- theme still look right) ---------------------------------------------
  var css = [
    '.yobot-root{',
    '  --yb-accent: var(--accent, #5e85a4);',
    '  --yb-accent-2: var(--accent-2, #7ba0bb);',
    '  --yb-accent-fg: var(--accent-fg, #ffffff);',
    '  --yb-fg: var(--fg, #eef1f8);',
    '  --yb-muted: var(--muted, #9aa3b8);',
    '  --yb-card: var(--card, rgba(255,255,255,0.06));',
    '  --yb-border: var(--border, rgba(255,255,255,0.12));',
    '  --yb-font: var(--font-body, "Inter", system-ui, sans-serif);',
    '  --yb-font-display: var(--font-display, "Space Grotesk", system-ui, sans-serif);',
    '}',
    '.yobot-fab{position:fixed;right:22px;bottom:22px;z-index:2147483000;width:56px;height:56px;border-radius:50%;border:1px solid var(--yb-border);background:linear-gradient(135deg,var(--yb-accent),var(--yb-accent-2));color:var(--yb-accent-fg);cursor:pointer;display:grid;place-items:center;box-shadow:0 10px 30px rgba(0,0,0,.28);transition:transform .2s ease}',
    '.yobot-fab:hover{transform:translateY(-2px) scale(1.05)}',
    '.yobot-fab svg{width:26px;height:26px}',
    '.yobot-panel{position:fixed;right:22px;bottom:92px;z-index:2147483000;width:min(380px,calc(100vw - 32px));height:min(540px,calc(100vh - 130px));display:none;flex-direction:column;overflow:hidden;background:rgba(10,12,20,.94);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--yb-border);border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.55);font-family:var(--yb-font);opacity:0;transform:translateY(12px);transition:opacity .22s ease,transform .22s ease}',
    '.yobot-panel.open{display:flex}',
    '.yobot-panel.shown{opacity:1;transform:translateY(0)}',
    '.yobot-head{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--yb-border)}',
    '.yobot-head__dot{width:9px;height:9px;border-radius:50%;background:var(--yb-accent-2);box-shadow:0 0 10px var(--yb-accent-2)}',
    '.yobot-head__title{font-family:var(--yb-font-display);font-weight:600;color:var(--yb-fg);font-size:.95rem}',
    '.yobot-head__sub{color:var(--yb-muted);font-size:.72rem}',
    '.yobot-mode{margin-left:auto;display:none;gap:4px;background:var(--yb-card);border:1px solid var(--yb-border);border-radius:999px;padding:3px}',
    '.yobot-mode.visible{display:flex}',
    '.yobot-mode button{border:0;background:transparent;color:var(--yb-muted);font-size:.68rem;padding:4px 10px;border-radius:999px;cursor:pointer;font-family:var(--yb-font)}',
    '.yobot-mode button.active{background:linear-gradient(135deg,var(--yb-accent),var(--yb-accent-2));color:var(--yb-accent-fg)}',
    '.yobot-close{border:0;background:transparent;color:var(--yb-muted);cursor:pointer;font-size:1.1rem;line-height:1;margin-left:8px}',
    '.yobot-mode:not(.visible)+.yobot-close{margin-left:auto}',
    '.yobot-log{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin}',
    '.yobot-msg{max-width:85%;padding:10px 13px;border-radius:14px;font-size:.85rem;line-height:1.45;white-space:pre-wrap;word-break:break-word}',
    '.yobot-msg--bot{align-self:flex-start;color:var(--yb-fg);background:var(--yb-card);border:1px solid var(--yb-border);border-bottom-left-radius:4px}',
    '.yobot-msg--user{align-self:flex-end;color:var(--yb-accent-fg);background:linear-gradient(135deg,var(--yb-accent),var(--yb-accent-2));border-bottom-right-radius:4px}',
    '.yobot-msg--err{border-color:rgba(255,99,99,.5);color:#ffb4b4}',
    '.yobot-msg--note{align-self:center;color:var(--yb-muted);background:transparent;border:0;font-size:.7rem;padding:0}',
    '.yobot-typing{display:inline-flex;gap:4px;align-items:center}',
    '.yobot-typing i{width:6px;height:6px;border-radius:50%;background:var(--yb-muted);animation:yobot-blink 1.2s infinite}',
    '.yobot-typing i:nth-child(2){animation-delay:.2s}',
    '.yobot-typing i:nth-child(3){animation-delay:.4s}',
    '@keyframes yobot-blink{0%,80%,100%{opacity:.25}40%{opacity:1}}',
    '.yobot-form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--yb-border)}',
    '.yobot-form input{flex:1;background:var(--yb-card);border:1px solid var(--yb-border);border-radius:12px;padding:10px 13px;color:var(--yb-fg);font-size:.85rem;font-family:var(--yb-font);outline:none;min-width:0}',
    '.yobot-form input:focus{border-color:var(--yb-accent)}',
    '.yobot-form button{border:0;border-radius:12px;padding:0 16px;cursor:pointer;background:linear-gradient(135deg,var(--yb-accent),var(--yb-accent-2));color:var(--yb-accent-fg);font-family:var(--yb-font-display);font-weight:600;font-size:.85rem}',
    '.yobot-form button:disabled{opacity:.5;cursor:default}',
    '@media (max-width:480px){.yobot-panel{right:16px;bottom:86px}.yobot-fab{right:16px;bottom:16px}}',
  ].join('\n');

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // --- accent theming ------------------------------------------------------
  var HEX_RE = /^#[0-9a-f]{6}$/i;

  function hexToRgb(h) {
    var m = /^#?([0-9a-f]{6})$/i.exec(h);
    if (!m) return null;
    var i = parseInt(m[1], 16);
    return { r: (i >> 16) & 255, g: (i >> 8) & 255, b: i & 255 };
  }
  function comp(x) {
    var s = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return s.length === 1 ? '0' + s : s;
  }
  // Blend a color toward white by amt (0..1) — used for the gradient's 2nd stop.
  function lighten(hex, amt) {
    var c = hexToRgb(hex);
    if (!c) return hex;
    return '#' + comp(c.r + (255 - c.r) * amt) + comp(c.g + (255 - c.g) * amt) + comp(c.b + (255 - c.b) * amt);
  }
  // Pick black/white text for legibility on the accent (perceived luminance).
  function readableOn(hex) {
    var c = hexToRgb(hex);
    if (!c) return '#ffffff';
    var L = (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
    return L > 0.6 ? '#1a1b1e' : '#ffffff';
  }

  var accentNodes = [];
  function applyAccent(color) {
    if (!HEX_RE.test(color)) return;
    var a2 = lighten(color, 0.18);
    var fg = readableOn(color);
    accentNodes.forEach(function (node) {
      node.style.setProperty('--yb-accent', color);
      node.style.setProperty('--yb-accent-2', a2);
      node.style.setProperty('--yb-accent-fg', fg);
    });
  }

  function init() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var fab = el('button', 'yobot-root yobot-fab');
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Open AI chat about Chaiyo');
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3C7.03 3 3 6.58 3 11c0 2.05.9 3.92 2.37 5.33-.13 1.05-.53 2.3-1.37 3.67 2.02-.24 3.55-.9 4.61-1.53.75.17 1.55.28 2.39.28 4.97 0 9-3.58 9-8s-4.03-8-9-8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="8.6" cy="11" r="1.1" fill="currentColor"/><circle cx="12" cy="11" r="1.1" fill="currentColor"/><circle cx="15.4" cy="11" r="1.1" fill="currentColor"/></svg>';

    var panel = el('div', 'yobot-root yobot-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'AI support chat');

    var head = el('div', 'yobot-head');
    head.appendChild(el('span', 'yobot-head__dot'));
    var titleWrap = el('div', '');
    var title = el('div', 'yobot-head__title');
    title.textContent = BOT_NAME;
    titleWrap.appendChild(title);
    var subEl = el('div', 'yobot-head__sub');
    subEl.textContent = SUBTITLE;
    titleWrap.appendChild(subEl);
    head.appendChild(titleWrap);

    var modeWrap = el('div', 'yobot-mode');
    var btnGroq = el('button', 'active', 'Smart');
    var btnMamba = el('button', '', 'My Mamba');
    btnMamba.title =
      'A small Mamba language model Chaiyo fine-tuned himself — experimental!';
    modeWrap.appendChild(btnGroq);
    modeWrap.appendChild(btnMamba);
    if (MAMBA_ENDPOINT) modeWrap.classList.add('visible');
    head.appendChild(modeWrap);

    var closeBtn = el('button', 'yobot-close', '✕');
    closeBtn.setAttribute('aria-label', 'Close chat');
    head.appendChild(closeBtn);

    var log = el('div', 'yobot-log');
    var form = el('form', 'yobot-form');
    var input = el('input');
    input.placeholder = PLACEHOLDER;
    input.maxLength = 500;
    var send = el('button', '', 'Send');
    send.type = 'submit';
    form.appendChild(input);
    form.appendChild(send);

    panel.appendChild(head);
    panel.appendChild(log);
    panel.appendChild(form);
    document.body.appendChild(fab);
    document.body.appendChild(panel);

    // Theme the bubble + panel. Inline data-accent wins immediately; otherwise
    // fetch the owner's dashboard-chosen color and apply it when it arrives.
    accentNodes = [fab, panel];
    if (ACCENT) applyAccent(ACCENT);
    fetch(CONFIG_ENDPOINT + '?bot=' + encodeURIComponent(BOT_ID))
      .then(function (r) { return r.json(); })
      .then(function (cfg) {
        if (!ACCENT && cfg && cfg.accent_color) applyAccent(cfg.accent_color);
      })
      .catch(function () {});

    var history = [];
    var mode = 'groq';
    var busy = false;

    function addMsg(cls, text) {
      var m = el('div', 'yobot-msg ' + cls);
      m.textContent = text;
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;
      return m;
    }

    function open() {
      panel.classList.add('open');
      requestAnimationFrame(function () {
        panel.classList.add('shown');
      });
      if (!log.childElementCount) addMsg('yobot-msg--bot', GREETING);
      input.focus();
    }
    function close() {
      panel.classList.remove('shown');
      setTimeout(function () {
        panel.classList.remove('open');
      }, 220);
    }
    fab.addEventListener('click', function () {
      panel.classList.contains('open') ? close() : open();
    });
    closeBtn.addEventListener('click', close);

    function setMode(next) {
      mode = next;
      btnGroq.classList.toggle('active', mode === 'groq');
      btnMamba.classList.toggle('active', mode === 'mamba');
      addMsg(
        'yobot-msg--note',
        mode === 'mamba'
          ? 'Switched to Chaiyo’s own fine-tuned Mamba (130M) — expect charmingly rough answers.'
          : 'Switched to the smart model.'
      );
    }
    btnGroq.addEventListener('click', function () {
      if (mode !== 'groq') setMode('groq');
    });
    btnMamba.addEventListener('click', function () {
      if (mode !== 'mamba') setMode('mamba');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text || busy) return;
      input.value = '';
      busy = true;
      send.disabled = true;

      addMsg('yobot-msg--user', text);
      history.push({ role: 'user', content: text });

      var typing = addMsg('yobot-msg--bot', '');
      typing.innerHTML =
        '<span class="yobot-typing"><i></i><i></i><i></i></span>';

      var endpoint =
        mode === 'mamba' && MAMBA_ENDPOINT ? MAMBA_ENDPOINT : API_ENDPOINT;

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot: BOT_ID, messages: history.slice(-8) }),
      })
        .then(function (res) {
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              typing.remove();
              if (!res.ok || !data.reply) {
                addMsg(
                  'yobot-msg--bot yobot-msg--err',
                  data.error || 'Hmm, something went wrong. Try again?'
                );
              } else {
                addMsg('yobot-msg--bot', data.reply);
                history.push({ role: 'assistant', content: data.reply });
              }
            });
        })
        .catch(function () {
          typing.remove();
          addMsg(
            'yobot-msg--bot yobot-msg--err',
            'Network error — is the chat backend reachable?'
          );
        })
        .then(function () {
          busy = false;
          send.disabled = false;
          input.focus();
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
