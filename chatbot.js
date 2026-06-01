/* =====================================================
   GEMANI SUPPLIES — chatbot.js
   Claude Sonnet AI + smart local fallback
   ===================================================== */
(function () {
  'use strict';

  var toggle    = document.querySelector('.chatbot__toggle');
  var panel     = document.querySelector('.chatbot__panel');
  var closeBtn  = document.querySelector('.chatbot__close-btn');
  var messages  = document.getElementById('chatMessages');
  var textInput = document.getElementById('chatTextInput');
  var sendBtn   = document.getElementById('chatSendBtn');
  var badge     = document.querySelector('.chatbot__badge');
  var iconChat  = document.querySelector('.chatbot__icon-chat');
  var iconClose = document.querySelector('.chatbot__icon-close');

  if (!toggle || !panel || !messages || !textInput || !sendBtn) return;

  var isOpen   = false;
  var isLoading = false;
  var history  = [];

  var SYSTEM = [
    'You are the helpful AI assistant for Gemani Supplies, Kenya\'s leading security and technology supplier.',
    'Be friendly, concise (2-3 sentences), and always in the context of Gemani Supplies.',
    '',
    'About Gemani Supplies:',
    '- Kenya\'s leading CCTV, access control, solar, and technology supplier and installer',
    '- Phone: +254 0710 388 577 / 0721 620 637',
    '- Email: info@gemani.co.ke',
    '- WhatsApp: 0721 620 637',
    '- Location: Nairobi, Kenya',
    '- Working Hours: Monday–Saturday, 8AM–6PM',
    '',
    'Products & approximate starting prices:',
    '- CCTV Cameras (Hikvision, Dahua, Xiaomi): from KSh 1,800',
    '- Access Control (ZKTeco, Hikvision, Suprema): from KSh 5,000',
    '- Solar Systems (MUST, panels, batteries): from KSh 15,000',
    '- Power Backup / UPS & Inverters: from KSh 8,000',
    '- Alarm Systems (Risco): from KSh 10,000',
    '- Network Equipment (TP-Link, Ubiquiti): from KSh 2,000',
    '- Automatic Gates (sliding, swing, barrier): from KSh 35,000',
    '- Electric Fence: from KSh 20,000',
    '- Time & Attendance (ZKTeco): from KSh 8,000',
    '- Telephony / PBX (Yeastar): from KSh 15,000',
    '- Computing (Logitech, laptops, accessories): varies',
    '',
    'Always use KSh for prices. For specific quotes direct customers to call or WhatsApp 0721 620 637.',
    'Stay on-topic. Never invent specific stock levels or exact prices beyond the ranges above.'
  ].join('\n');

  /* Local fallback responses */
  var LOCAL = [
    { keys: ['cctv','camera','cameras','surveillance','hikvision','dahua','xiaomi','dome','bullet','ip cam','nvr','dvr'],
      reply: '📷 We stock a full range of CCTV cameras — Hikvision, Dahua, and Xiaomi — from just <strong>KSh 1,800</strong>. This includes HD bullet cameras, IP dome cameras, PTZ cameras and full NVR/DVR kits. We also handle professional installation across Kenya. Want a quote?' },
    { keys: ['solar','panel','panels','inverter','battery','batteries','must','hybrid','off grid','offgrid','energy'],
      reply: '☀️ We supply and install complete solar systems including panels, batteries, and MUST hybrid inverters, starting from <strong>KSh 15,000</strong>. We size systems for homes, offices, and large commercial setups. Call <strong>0710 388 577</strong> or WhatsApp <strong>0721 620 637</strong> for a solar quote.' },
    { keys: ['access','biometric','fingerprint','rfid','door lock','smart lock','zkteco','suprema','access control'],
      reply: '🔒 Our access control range includes biometric fingerprint readers, RFID card systems, video door phones, and smart locks from ZKTeco, Hikvision and Suprema — from <strong>KSh 5,000</strong>. We install and program all systems.' },
    { keys: ['alarm','burglar','motion','smoke','risco','intrusion','siren','sensor','detector'],
      reply: '🚨 We supply Risco and compatible alarm systems including burglar alarms, smoke detectors and motion sensors from <strong>KSh 10,000</strong>. Systems can be integrated with CCTV and access control for total security.' },
    { keys: ['network','wifi','wi-fi','router','switch','ubiquiti','tp-link','tp link','cable','cat6','structured cabling','poe'],
      reply: '🌐 We supply and install TP-Link, Ubiquiti and other network equipment including routers, switches, PoE devices and CAT6 structured cabling, from <strong>KSh 2,000</strong>. We handle full office and enterprise network setups.' },
    { keys: ['ups','power backup','inverter','mppt','power cut','blackout','uninterrupted'],
      reply: '🔋 We stock UPS systems, inverters and MPPT charge controllers for homes and offices starting from <strong>KSh 8,000</strong>. These keep your equipment running during power outages.' },
    { keys: ['gate','automatic gate','sliding gate','swing gate','barrier','boom gate'],
      reply: '⛩️ We supply and install automatic gate motors — sliding, swing and barrier systems — from <strong>KSh 35,000</strong> including installation. We can also integrate gates with access control and CCTV.' },
    { keys: ['electric fence','fence','perimeter','energizer'],
      reply: '⚡ Our electric perimeter fencing solutions protect homes, farms and commercial estates from <strong>KSh 20,000</strong>. All systems include alarm integration options.' },
    { keys: ['time','attendance','hr','payroll','zk teco','time attendance','clocking'],
      reply: '⏱️ We stock ZKTeco time and attendance terminals that integrate with HR and payroll systems, from <strong>KSh 8,000</strong>. Contact us for multi-device setups.' },
    { keys: ['pbx','telephony','yeastar','gsm','voip','phone system','ip phone'],
      reply: '📞 We supply and configure Yeastar PBX systems, GSM gateways and VoIP phone systems for businesses from <strong>KSh 15,000</strong>. Great for offices modernising their communications.' },
    { keys: ['computing','laptop','keyboard','mouse','logitech','printer','tablet','computer'],
      reply: '💻 We stock Logitech keyboards, mice, webcams, laptops and other computing accessories. Contact us on <strong>0710 388 577</strong> for current stock and pricing.' },
    { keys: ['quote','quotation','price','cost','how much','ksh','rates','pricing'],
      reply: '💰 For accurate pricing and quotations please contact our sales team directly. 📞 <strong>0710 388 577 / 0721 620 637</strong> | ✉️ <strong>info@gemani.co.ke</strong> | 💬 WhatsApp: <strong>0721 620 637</strong>. We respond within 2 hours during business hours.' },
    { keys: ['delivery','shipping','ship','deliver','courier','upcountry','county','nairobi','mombasa','kisumu','nakuru'],
      reply: '🚚 We deliver to all 47 counties across Kenya! Nairobi orders are usually same-day or next-day. Upcountry delivery is via courier — contact us on <strong>0710 388 577</strong> for delivery charges to your area.' },
    { keys: ['install','installation','technician','fitting','set up','setup','commissioning'],
      reply: '⚙️ Yes — our certified technicians handle full installation, configuration, testing and handover for all systems we supply. We cover Nairobi and major towns countrywide. Contact us for an installation quote.' },
    { keys: ['warranty','guarantee','genuine','original','authentic','fake'],
      reply: '✅ All our products are 100% genuine with manufacturer warranties. We are authorised dealers for Hikvision, ZKTeco, Yeastar, MUST Solar, TP-Link and more. No counterfeits, ever.' },
    { keys: ['hours','working hours','open','when','time','saturday','sunday','holiday'],
      reply: '🕐 We are open <strong>Monday to Saturday, 8:00 AM – 6:00 PM</strong>. You can also WhatsApp us outside hours and we\'ll respond first thing the next morning.' },
    { keys: ['contact','call','phone','reach','talk','speak','whatsapp','email'],
      reply: '📞 <strong>0710 388 577 / 0721 620 637</strong><br/>✉️ <strong>info@gemani.co.ke</strong><br/>💬 WhatsApp: <a href="https://wa.me/254721620637" target="_blank">0721 620 637</a><br/>🕐 Mon–Sat: 8AM–6PM' },
    { keys: ['location','address','where','office','shop','showroom','find you'],
      reply: '📍 We are based in <strong>Nairobi, Kenya</strong>. Contact us on <strong>0710 388 577</strong> for our exact address and directions.' },
    { keys: ['hi','hello','hey','good morning','good afternoon','good evening','hola','jambo','habari','sasa'],
      reply: '👋 Hello! Welcome to <strong>Gemani Supplies</strong> — Kenya\'s trusted security and technology supplier. How can I help you today? You can ask me about CCTV, solar, access control, networking or any of our other products.' },
    { keys: ['thank','thanks','asante','appreciate','perfect','great','awesome','helpful'],
      reply: '😊 You\'re welcome! If you need anything else or are ready to place an order, don\'t hesitate to ask. You can also reach us directly on WhatsApp: <strong>0721 620 637</strong>.' },
    { keys: ['order','buy','purchase','place order','how to order'],
      reply: '🛒 To place an order: (1) Browse our products on this site, (2) Contact us via WhatsApp <strong>0721 620 637</strong> or call <strong>0710 388 577</strong> with the item name, (3) We\'ll confirm availability and pricing, then arrange delivery or pickup.' },
    { keys: ['about','gemani','who are you','company','history','since','founded'],
      reply: '🏢 <strong>Gemani Supplies</strong> is one of Kenya\'s leading distributors and installers of security systems and technology infrastructure. We\'ve been serving homes, businesses and institutions across all 47 counties for over a decade. Authorised dealers for Hikvision, ZKTeco, Yeastar, MUST Solar and more.' }
  ];

  function localReply(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < LOCAL.length; i++) {
      for (var j = 0; j < LOCAL[i].keys.length; j++) {
        if (lower.indexOf(LOCAL[i].keys[j]) !== -1) return LOCAL[i].reply;
      }
    }
    return 'Thank you for your message! For the best assistance please contact our team directly:<br/>📞 <strong>0710 388 577 / 0721 620 637</strong><br/>💬 WhatsApp: <strong>0721 620 637</strong><br/>✉️ <strong>info@gemani.co.ke</strong><br/>🕐 Mon–Sat: 8AM–6PM';
  }

  /* ── API CALL ─────────────────────────────────────── */
  function callClaude(userText) {
    history.push({ role: 'user', content: userText });
    var msgs = history.slice(-12);
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: SYSTEM, messages: msgs })
    }).then(function (r) {
      if (!r.ok) throw new Error('API ' + r.status);
      return r.json();
    }).then(function (d) {
      var block = (d.content || []).find(function (b) { return b.type === 'text'; });
      if (!block) throw new Error('No text');
      history.push({ role: 'assistant', content: block.text });
      return block.text;
    });
  }

  /* ── DOM ──────────────────────────────────────────── */
  function appendMsg(role, html) {
    var wrap = document.createElement('div');
    wrap.className = 'chat-msg chat-msg--' + role;
    var bubble = document.createElement('div');
    bubble.className = 'chat-msg__bubble';
    bubble.innerHTML = html;
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
    return wrap;
  }

  var typingEl = null;
  function showTyping() {
    typingEl = appendMsg('bot', '');
    typingEl.querySelector('.chat-msg__bubble').innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
  }
  function hideTyping() {
    if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
    typingEl = null;
  }

  function send(text) {
    if (!text || isLoading) return;
    textInput.value = '';
    appendMsg('user', text);
    showTyping();
    isLoading = true;

    /* Remove quick-reply buttons after first real message */
    var qr = messages.querySelector('.chat-quick');
    if (qr) qr.parentNode.removeChild(qr);

    callClaude(text).then(function (reply) {
      hideTyping(); isLoading = false; appendMsg('bot', reply);
    }).catch(function () {
      hideTyping(); isLoading = false;
      var fb = localReply(text);
      history.push({ role: 'assistant', content: fb });
      appendMsg('bot', fb);
    });
  }

  /* ── TOGGLE ───────────────────────────────────────── */
  function openChat() {
    isOpen = true;
    panel.classList.add('is-open');
    if (iconChat)  iconChat.style.display  = 'none';
    if (iconClose) iconClose.style.display = '';
    if (badge)     badge.classList.add('is-hidden');
    textInput.focus();
  }
  function closeChat() {
    isOpen = false;
    panel.classList.remove('is-open');
    if (iconChat)  iconChat.style.display  = '';
    if (iconClose) iconClose.style.display = 'none';
  }

  toggle.addEventListener('click', function () { isOpen ? closeChat() : openChat(); });
  if (closeBtn) closeBtn.addEventListener('click', closeChat);

  /* ── SEND ─────────────────────────────────────────── */
  sendBtn.addEventListener('click', function () { send(textInput.value.trim()); });
  textInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(textInput.value.trim()); });

  /* Quick reply buttons */
  messages.addEventListener('click', function (e) {
    var btn = e.target.closest('.chat-quick__btn');
    if (btn) send(btn.getAttribute('data-q'));
  });

  /* Show badge after delay if chat not opened */
  setTimeout(function () {
    if (!isOpen && badge) badge.classList.remove('is-hidden');
  }, 4000);

})();
