/* ==========================================================================
   Vélourcare Ortho — Invoice Builder · Application (router, views, editor)
   ========================================================================== */
(function () {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = Store.escapeHTML;
  const money = Store.formatMoney;
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* --------------------------------- Icons -------------------------------- */
  const ICONS = {
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    edit: '<path d="M12 20h9"/><path d="M16.38 3.62a1 1 0 0 1 3 3L7.37 18.64a2 2 0 0 1-.86.5l-2.87.84a.5.5 0 0 1-.62-.62l.84-2.87a2 2 0 0 1 .5-.86z"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    dollar: '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    alert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    sheet: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>',
  };
  const icon = (n, cls) => `<svg class="i ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* -------------------------------- Helpers ------------------------------- */
  function getPath(obj, path) { return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj); }
  function setPath(obj, path, val) {
    const ks = path.split('.'); let o = obj;
    for (let i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null) o[ks[i]] = {}; o = o[ks[i]]; }
    o[ks[ks.length - 1]] = val;
  }
  function readValue(el) {
    if (el.type === 'checkbox') return el.checked;
    if (el.type === 'number') return el.value === '' ? 0 : Store.num(el.value);
    return el.value;
  }
  function currencyOptions(selected) {
    return Object.entries(Store.CURRENCIES).map(([c, n]) => `<option value="${c}" ${c === selected ? 'selected' : ''}>${c} — ${esc(n)}</option>`).join('');
  }
  function statusPill(st) { return `<span class="pill pill-${st.key}">${esc(st.label)}</span>`; }
  function clientLabel(c) { return c ? (c.practice && c.name ? `${c.name} — ${c.practice}` : (c.name || c.practice || 'Unnamed client')) : ''; }
  function dueText(inv, st) {
    if (st.key === 'paid') return inv.paidDate ? 'Paid ' + Store.formatDate(inv.paidDate) : 'Paid';
    if (st.key === 'void' || st.key === 'draft') return '';
    const d = Store.daysBetween(Store.todayISO(), inv.dueDate);
    if (d > 0) return `Due in ${d} day${d === 1 ? '' : 's'}`;
    if (d === 0) return 'Due today';
    return `${-d} day${d === -1 ? '' : 's'} overdue`;
  }
  function download(filename, text, mime) {
    const blob = new Blob([text], { type: mime || 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }

  /* -------------------------------- Toasts -------------------------------- */
  function toast(msg, type) {
    const el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.innerHTML = icon(type === 'error' ? 'alert' : 'check') + `<span>${esc(msg)}</span>`;
    $('#toast-root').appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity .3s, transform .3s'; el.style.opacity = '0'; el.style.transform = 'translateY(6px)'; setTimeout(() => el.remove(), 320); }, 2800);
  }

  /* -------------------------------- Modals -------------------------------- */
  function modal(opts) {
    const root = $('#modal-root');
    root.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal" role="dialog" aria-modal="true">
          <form novalidate>
            <div class="modal-head"><h2>${esc(opts.title)}</h2>${opts.subtitle ? `<p>${esc(opts.subtitle)}</p>` : ''}</div>
            <div class="modal-body">${opts.body}</div>
            <div class="modal-foot">
              <button type="button" class="btn" data-close>Cancel</button>
              <button type="submit" class="btn ${opts.danger ? 'btn-dark' : 'btn-gold'}">${esc(opts.saveLabel || 'Save')}</button>
            </div>
          </form>
        </div>
      </div>`;
    const form = $('form', root);
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    function close() { root.innerHTML = ''; document.removeEventListener('keydown', onKey); }
    document.addEventListener('keydown', onKey);
    $('.modal-backdrop', root).addEventListener('mousedown', (e) => { if (e.target.classList.contains('modal-backdrop')) close(); });
    $('[data-close]', root).addEventListener('click', close);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {};
      $$('[name]', form).forEach((el) => { data[el.name] = readValue(el); });
      if (opts.onSave(data, form) !== false) close();
    });
    if (opts.onOpen) opts.onOpen(form);
    const first = $('input:not([type=hidden]),select,textarea', form);
    if (first) setTimeout(() => first.focus(), 30);
  }
  function confirmDialog(title, message, label, onYes) {
    modal({ title, body: `<p class="mt0 muted" style="line-height:1.6">${message}</p>`, saveLabel: label || 'Confirm', danger: true, onSave: () => { onYes(); } });
  }

  /* ------------------------------- Dropdowns ------------------------------ */
  function closeMenus() { $$('.dropdown.open').forEach((d) => d.classList.remove('open')); }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toggle-menu]');
    if (t) {
      const dd = t.closest('.dropdown'); const was = dd.classList.contains('open');
      closeMenus(); if (!was) dd.classList.add('open');
      return;
    }
    if (!e.target.closest('.menu')) closeMenus();
  });

  /* --------------------------------- Print -------------------------------- */
  function printInvoice(inv) {
    const s = Store.db.settings;
    $('#page-size').textContent = `@page { size: ${s.branding.paper === 'Letter' ? 'letter' : 'A4'}; margin: 0; }`;
    $('#print-root').innerHTML = InvoiceTemplate.render(inv, s);
    const prevTitle = document.title;
    const who = inv.client && (inv.client.practice || inv.client.name);
    document.title = `Invoice ${inv.number}${who ? ' - ' + who : ''}`.replace(/[\\/:*?"<>|]/g, '');
    const imgs = $$('#print-root img');
    Promise.all(imgs.map((img) => (img.complete ? 1 : new Promise((r) => { img.onload = img.onerror = r; }))))
      .then(() => (document.fonts ? document.fonts.ready : null))
      .then(() => {
        window.print();
        setTimeout(() => { document.title = prevTitle; }, 300);
      });
  }

  function emailInvoice(inv) {
    const t = Store.calcTotals(inv);
    const co = Store.db.settings.company;
    const c = inv.client || {};
    if (!c.email) { toast('Add the client’s email address first', 'error'); return; }
    const greet = c.type === 'doctor' && c.name ? (/^dr\.?\s/i.test(c.name) ? c.name : 'Dr. ' + c.name.split(' ').slice(-1)[0]) : (c.name || 'there');
    const subject = `Invoice ${inv.number} from ${co.name}`;
    const body = [
      `Dear ${greet},`, '',
      `Please find attached invoice ${inv.number} for ${money(t.balance, inv.currency)}, due ${Store.formatDate(inv.dueDate, 'long')}.`,
      inv.patientRef ? `Patient / case: ${inv.patientRef}` : '',
      '', 'Thank you for your continued partnership.', '', 'Kind regards,', co.name, co.phone, co.website,
    ].filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');
    window.location.href = `mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast('Email draft opened — attach the PDF before sending');
  }

  /* -------------------------------- Router -------------------------------- */
  const view = $('#view');
  let currentHash = location.hash;
  let suppressHash = false;

  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    return { page: parts[0] || 'invoices', id: parts[1], params: Object.fromEntries(new URLSearchParams(query || '')) };
  }

  function render() {
    const r = parseHash();
    closeMenus();
    $('#modal-root').innerHTML = '';
    const navKey = r.page === 'invoice' ? 'invoices' : r.page;
    $$('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.nav === navKey));
    window.scrollTo(0, 0);
    view.onclick = null;
    Editor.active = false;
    switch (r.page) {
      case 'invoice': Editor.open(r.id, r.params); break;
      case 'clients': renderClients(); break;
      case 'services': renderServices(); break;
      case 'settings': renderSettings(); break;
      default: renderInvoices();
    }
    updateCounts();
  }

  window.addEventListener('hashchange', () => {
    if (suppressHash) { suppressHash = false; return; }
    if (Editor.active && Editor.dirty && !confirm('You have unsaved changes on this invoice. Leave without saving?')) {
      suppressHash = true; location.hash = currentHash; return;
    }
    Editor.dirty = false;
    currentHash = location.hash;
    render();
  });
  window.addEventListener('beforeunload', (e) => { if (Editor.active && Editor.dirty) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && Editor.active) { e.preventDefault(); Editor.save(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p' && Editor.active) { e.preventDefault(); Editor.print(); }
  });

  function updateCounts() {
    const db = Store.db;
    const open = db.invoices.filter((i) => ['sent', 'partial', 'overdue'].includes(Store.invoiceStatus(i).key)).length;
    const el = $('[data-count="invoices"]'); if (el) { el.textContent = open || ''; el.style.display = open ? '' : 'none'; }
    const cl = $('[data-count="clients"]'); if (cl) { cl.textContent = db.clients.length || ''; cl.style.display = db.clients.length ? '' : 'none'; }
  }

  /* ============================== INVOICES LIST ============================= */
  const listState = { tab: 'all', q: '', currency: '' };
  const TABS = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Drafts' },
    { key: 'outstanding', label: 'Outstanding' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'paid', label: 'Paid' },
    { key: 'void', label: 'Void' },
  ];
  function tabMatch(tab, st) {
    if (tab === 'all') return true;
    if (tab === 'outstanding') return ['sent', 'partial', 'overdue'].includes(st.key);
    return st.key === tab;
  }

  function renderInvoices() {
    const db = Store.db;
    const def = db.settings.invoice.defaultCurrency;
    const used = Array.from(new Set([def].concat(db.invoices.map((i) => i.currency))));
    if (!listState.currency || !used.includes(listState.currency)) listState.currency = def;
    const cur = listState.currency;

    const rows = db.invoices.map((inv) => ({ inv, st: Store.invoiceStatus(inv), t: Store.calcTotals(inv) }));
    const inCur = rows.filter((x) => x.inv.currency === cur && x.st.key !== 'void');
    const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
    const outstanding = inCur.filter((x) => ['sent', 'partial', 'overdue'].includes(x.st.key));
    const overdue = inCur.filter((x) => x.st.key === 'overdue');
    const month = Store.todayISO().slice(0, 7);
    const paidMonth = inCur.filter((x) => x.st.key === 'paid' && (x.inv.paidDate || (x.inv.updatedAt || '').slice(0, 10)).slice(0, 7) === month);
    const drafts = rows.filter((x) => x.st.key === 'draft');
    const draftsCur = drafts.filter((x) => x.inv.currency === cur);
    const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });

    view.innerHTML = `
      <div class="page-head">
        <div>
          <div class="eyebrow">Billing</div>
          <h1>Invoices</h1>
          <p>Create, track and export professional invoices for doctors, clinics and patients.</p>
        </div>
        <div class="actions">
          ${used.length > 1 ? `<select class="input" style="width:auto" data-list="currency" title="Summary currency">${used.map((c) => `<option ${c === cur ? 'selected' : ''}>${c}</option>`).join('')}</select>` : ''}
          <button class="btn" data-list="csv">${icon('sheet')} Export CSV</button>
          <a class="btn btn-gold" href="#/invoice/new">${icon('plus')} New invoice</a>
        </div>
      </div>

      <div class="kpis">
        <div class="card kpi accent">
          <div class="k-label">${icon('wallet', 'i-sm')} Outstanding</div>
          <div class="k-value">${money(sum(outstanding, (x) => x.t.balance), cur)}</div>
          <div class="k-sub">${outstanding.length} open invoice${outstanding.length === 1 ? '' : 's'}</div>
        </div>
        <div class="card kpi">
          <div class="k-label"><span class="k-dot" style="background:var(--bad)"></span> Overdue</div>
          <div class="k-value" style="color:${overdue.length ? 'var(--bad)' : 'inherit'}">${money(sum(overdue, (x) => x.t.balance), cur)}</div>
          <div class="k-sub">${overdue.length} invoice${overdue.length === 1 ? '' : 's'} past due</div>
        </div>
        <div class="card kpi">
          <div class="k-label"><span class="k-dot" style="background:var(--ok)"></span> Paid in ${monthName}</div>
          <div class="k-value">${money(sum(paidMonth, (x) => x.t.total), cur)}</div>
          <div class="k-sub">${paidMonth.length} invoice${paidMonth.length === 1 ? '' : 's'} settled</div>
        </div>
        <div class="card kpi">
          <div class="k-label"><span class="k-dot" style="background:#9aa0a6"></span> Drafts</div>
          <div class="k-value">${money(sum(draftsCur, (x) => x.t.total), cur)}</div>
          <div class="k-sub">${drafts.length} draft${drafts.length === 1 ? '' : 's'} not yet sent</div>
        </div>
      </div>

      <div class="card">
        <div class="toolbar">
          <div class="tabs" id="inv-tabs"></div>
          <div class="search">${icon('search', 'i-sm')}<input class="input" data-list="q" placeholder="Search number, client, patient…" value="${esc(listState.q)}"></div>
        </div>
        <div id="inv-table" class="table-wrap"></div>
      </div>`;

    $('[data-list="q"]', view).addEventListener('input', (e) => { listState.q = e.target.value; renderInvoiceTable(); });
    const curSel = $('[data-list="currency"]', view);
    if (curSel) curSel.addEventListener('change', (e) => { listState.currency = e.target.value; renderInvoices(); });
    $('[data-list="csv"]', view).addEventListener('click', exportCSV);
    view.onclick = onInvoiceListClick;
    renderInvoiceTable();
  }

  function filteredInvoices() {
    const q = listState.q.trim().toLowerCase();
    return Store.db.invoices
      .map((inv) => ({ inv, st: Store.invoiceStatus(inv), t: Store.calcTotals(inv) }))
      .filter((x) => !q || [x.inv.number, x.inv.client && x.inv.client.name, x.inv.client && x.inv.client.practice, x.inv.client && x.inv.client.email, x.inv.patientRef, x.inv.reference]
        .some((v) => (v || '').toLowerCase().includes(q)))
      .sort((a, b) => (b.inv.issueDate || '').localeCompare(a.inv.issueDate || '') || (b.inv.number || '').localeCompare(a.inv.number || ''));
  }

  function renderInvoiceTable() {
    const all = filteredInvoices();
    $('#inv-tabs').innerHTML = TABS.map((t) => {
      const n = all.filter((x) => tabMatch(t.key, x.st)).length;
      return `<button class="tab ${listState.tab === t.key ? 'active' : ''}" data-tab="${t.key}">${t.label}<span class="n">${n}</span></button>`;
    }).join('');
    const list = all.filter((x) => tabMatch(listState.tab, x.st));
    const box = $('#inv-table');

    if (!Store.db.invoices.length) {
      box.innerHTML = `<div class="empty"><div class="e-icon">${icon('file')}</div><h3>No invoices yet</h3><p>Create your first invoice — your company details, logo and services are already set up.</p><a class="btn btn-gold" href="#/invoice/new">${icon('plus')} Create invoice</a></div>`;
      return;
    }
    if (!list.length) { box.innerHTML = `<div class="empty"><h3>Nothing here</h3><p>No invoices match this filter.</p></div>`; return; }

    box.innerHTML = `
      <table class="table">
        <thead><tr><th>Invoice</th><th>Client</th><th>Issued</th><th>Due</th><th class="num">Total</th><th class="num">Balance</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${list.map(({ inv, st, t }) => {
            const c = inv.client || {};
            const dt = dueText(inv, st);
            return `
            <tr class="clickable" data-open="${inv.id}">
              <td><div class="strong">${esc(inv.number)}</div>${inv.patientRef ? `<div class="sub">${esc(inv.patientRef)}</div>` : ''}</td>
              <td><div class="strong">${esc(c.name || c.practice || '—')}</div><div class="sub">${c.type === 'patient' ? '<span class="tag tag-ink">Patient</span>' : (c.practice && c.name ? esc(c.practice) : '<span class="tag">Doctor / Clinic</span>')}</div></td>
              <td>${Store.formatDate(inv.issueDate)}</td>
              <td>${Store.formatDate(inv.dueDate)}${dt ? `<div class="sub" style="${st.key === 'overdue' ? 'color:var(--bad)' : ''}">${dt}</div>` : ''}</td>
              <td class="num strong">${money(t.total, inv.currency)}</td>
              <td class="num">${st.key === 'void' ? '—' : money(t.balance, inv.currency)}</td>
              <td>${statusPill(st)}</td>
              <td><div class="row-actions">
                <button class="btn btn-ghost btn-icon btn-sm" title="Download PDF" data-act="print" data-id="${inv.id}">${icon('printer', 'i-sm')}</button>
                <button class="btn btn-ghost btn-icon btn-sm" title="Duplicate" data-act="dup" data-id="${inv.id}">${icon('copy', 'i-sm')}</button>
                <button class="btn btn-ghost btn-icon btn-sm" title="Delete" data-act="del" data-id="${inv.id}">${icon('trash', 'i-sm')}</button>
              </div></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  }

  function onInvoiceListClick(e) {
    const tab = e.target.closest('[data-tab]');
    if (tab) { listState.tab = tab.dataset.tab; renderInvoiceTable(); return; }
    const act = e.target.closest('[data-act]');
    if (act) {
      e.stopPropagation();
      const inv = Store.db.invoices.find((x) => x.id === act.dataset.id);
      if (!inv) return;
      if (act.dataset.act === 'print') printInvoice(inv);
      if (act.dataset.act === 'dup') { const d = Store.duplicateInvoice(inv.id); toast(`Duplicated as ${d.number}`); location.hash = '#/invoice/' + d.id; }
      if (act.dataset.act === 'del') confirmDialog('Delete invoice?', `Invoice <strong>${esc(inv.number)}</strong> will be permanently deleted. This cannot be undone.`, 'Delete', () => { Store.deleteInvoice(inv.id); toast('Invoice deleted'); renderInvoices(); updateCounts(); });
      return;
    }
    const row = e.target.closest('[data-open]');
    if (row) location.hash = '#/invoice/' + row.dataset.open;
  }

  function exportCSV() {
    const rows = filteredInvoices().filter((x) => tabMatch(listState.tab, x.st));
    if (!rows.length) { toast('No invoices to export', 'error'); return; }
    const head = ['Invoice No', 'Status', 'Client', 'Practice', 'Client Type', 'Email', 'Issue Date', 'Due Date', 'Currency', 'Subtotal', 'Discount', 'Tax', 'Total', 'Paid', 'Balance', 'Paid Date', 'Reference', 'Patient/Case'];
    const q = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const lines = [head.join(',')].concat(rows.map(({ inv, st, t }) => {
      const c = inv.client || {};
      return [inv.number, st.label, c.name, c.practice, c.type === 'patient' ? 'Patient' : 'Doctor/Clinic', c.email, inv.issueDate, inv.dueDate, inv.currency,
        t.subtotal.toFixed(2), t.discount.toFixed(2), t.tax.toFixed(2), t.total.toFixed(2), t.paid.toFixed(2), t.balance.toFixed(2), inv.paidDate, inv.reference, inv.patientRef].map(q).join(',');
    }));
    download(`velourcare-invoices-${Store.todayISO()}.csv`, '\ufeff' + lines.join('\r\n'), 'text/csv;charset=utf-8');
    toast(`Exported ${rows.length} invoice${rows.length === 1 ? '' : 's'}`);
  }

  /* ================================= EDITOR ================================= */
  const Editor = {
    inv: null, isNew: false, dirty: false, active: false, ro: null,

    open(id, params) {
      if (!id || id === 'new') {
        this.inv = Store.newInvoice({ clientId: params && params.client });
        this.isNew = true;
      } else {
        const found = Store.db.invoices.find((x) => x.id === id);
        if (!found) {
          view.innerHTML = `<div class="card empty"><h3>Invoice not found</h3><p>It may have been deleted.</p><a class="btn" href="#/invoices">${icon('back')} Back to invoices</a></div>`;
          return;
        }
        this.inv = clone(found);
        this.isNew = false;
      }
      this.dirty = false;
      this.active = true;
      view.innerHTML = `
        <div id="editor">
          <div class="editor-bar" id="editor-bar"></div>
          <div class="editor-grid">
            <form class="editor-form" id="editor-form" autocomplete="off" onsubmit="return false"></form>
            <div class="editor-preview">
              <div class="preview-head"><span>Live preview · ${esc(Store.db.settings.branding.paper)}</span><span>Ctrl+S to save · Ctrl+P for PDF</span></div>
              <div class="preview-frame" id="preview-frame"><div id="preview-outer"><div class="preview-scale" id="preview-scale"></div></div></div>
            </div>
          </div>
        </div>`;
      const root = $('#editor');
      root.addEventListener('click', (e) => this.onClick(e));
      const form = $('#editor-form');
      form.addEventListener('input', (e) => this.onInput(e));
      form.addEventListener('change', (e) => this.onInput(e));
      this.renderBar();
      this.renderForm();
      this.renderPreview();
      if (this.ro) this.ro.disconnect();
      this.ro = new ResizeObserver(() => this.fitPreview());
      this.ro.observe($('#preview-frame'));
    },

    /* ---------- rendering ---------- */
    renderBar() {
      const inv = this.inv;
      const st = Store.invoiceStatus(inv);
      const saved = !this.isNew && inv.updatedAt ? new Date(inv.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
      $('#editor-bar').innerHTML = `
        <div class="title">
          <a class="btn btn-ghost btn-icon" href="#/invoices" title="Back to invoices">${icon('back')}</a>
          <h1>${this.isNew ? 'New invoice' : esc(inv.number)}</h1>
          ${statusPill(st)}
          ${this.dirty ? '<span class="dirty">Unsaved changes</span>' : saved ? `<span class="saved">Saved ${esc(saved)}</span>` : ''}
        </div>
        <div class="actions">
          <button type="button" class="btn" data-action="print">${icon('download')} Download PDF</button>
          ${this.isNew ? '' : `
          <div class="dropdown">
            <button type="button" class="btn" data-toggle-menu>${icon('more')} More</button>
            <div class="menu">
              ${inv.status === 'draft' ? `<button type="button" data-action="mark-sent">${icon('send', 'i-sm')} Mark as sent</button>` : ''}
              ${!['paid', 'void'].includes(st.key) ? `<button type="button" data-action="record-payment">${icon('dollar', 'i-sm')} Record payment</button>` : ''}
              <button type="button" data-action="email">${icon('mail', 'i-sm')} Email to client</button>
              <button type="button" data-action="duplicate">${icon('copy', 'i-sm')} Duplicate</button>
              <hr>
              ${inv.status !== 'void' ? `<button type="button" data-action="void">${icon('ban', 'i-sm')} Void invoice</button>` : ''}
              <button type="button" class="danger" data-action="delete">${icon('trash', 'i-sm')} Delete</button>
            </div>
          </div>`}
          <button type="button" class="btn btn-gold" data-action="save">${icon('save')} ${this.isNew ? 'Save invoice' : 'Save'}</button>
        </div>`;
    },

    renderForm() {
      const inv = this.inv;
      const db = Store.db;
      const c = inv.client;
      const isDoc = c.type !== 'patient';
      const f = (label, path, opts) => {
        opts = opts || {};
        const v = getPath(inv, path);
        const cls = opts.cls ? ` ${opts.cls}` : '';
        if (opts.textarea) return `<div class="field${cls}"><label>${label}</label><textarea class="input" data-f="${path}" rows="${opts.rows || 2}" placeholder="${esc(opts.ph || '')}">${esc(v)}</textarea></div>`;
        return `<div class="field${cls}"><label>${label}</label><input class="input" type="${opts.type || 'text'}" data-f="${path}" value="${esc(v)}" placeholder="${esc(opts.ph || '')}" ${opts.attrs || ''}></div>`;
      };
      const catalog = db.catalog;

      $('#editor-form').innerHTML = `
        <div class="card card-pad">
          <div class="section-title">
            <h3><span class="step">1</span> Bill to</h3>
            <div class="segmented">
              <button type="button" class="${isDoc ? 'active' : ''}" data-action="client-type" data-val="doctor">Doctor / Clinic</button>
              <button type="button" class="${!isDoc ? 'active' : ''}" data-action="client-type" data-val="patient">Patient</button>
            </div>
          </div>
          <div class="field">
            <label>Address book</label>
            <select class="input" data-action="pick-client">
              <option value="">— New / one-off client —</option>
              ${db.clients.slice().sort((a, b) => clientLabel(a).localeCompare(clientLabel(b))).map((x) => `<option value="${x.id}" ${x.id === inv.clientId ? 'selected' : ''}>${esc(clientLabel(x))}${x.type === 'patient' ? ' (patient)' : ''}</option>`).join('')}
            </select>
          </div>
          <div class="grid g2">
            ${f(isDoc ? 'Doctor name' : 'Patient name', 'client.name', { ph: isDoc ? 'Dr. Amanda Ross' : 'Full name' })}
            ${f(isDoc ? 'Clinic / practice' : 'Guardian / company (optional)', 'client.practice', { ph: isDoc ? 'Bright Smile Orthodontics' : '' })}
            ${f('Email', 'client.email', { type: 'email', ph: 'name@example.com' })}
            ${f('Phone', 'client.phone', { ph: '+1 555 000 0000' })}
            ${f('Billing address', 'client.address', { textarea: true, cls: 'span-all', ph: 'Street, City, State / Province, Postal code, Country' })}
          </div>
          <div>${inv.clientId
            ? `<span class="small muted">${icon('check', 'i-sm')} Linked to address book — edits here apply to this invoice only.</span>`
            : `<button type="button" class="btn btn-sm" data-action="save-client">${icon('users', 'i-sm')} Save to address book</button>`}</div>
        </div>

        <div class="card card-pad">
          <div class="section-title"><h3><span class="step">2</span> Invoice details</h3></div>
          <div class="grid g2">
            ${f('Invoice number', 'number')}
            <div class="field"><label>Currency</label><select class="input" data-action="currency">${currencyOptions(inv.currency)}</select></div>
            ${f('Issue date', 'issueDate', { type: 'date' })}
            <div class="field"><label>Payment terms</label><select class="input" data-f="terms">${Store.TERMS.map((t) => `<option value="${t.value}" ${String(inv.terms) === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}</select></div>
            ${f('Due date', 'dueDate', { type: 'date' })}
            <div class="field"><label>Status</label><select class="input" data-f="status">
              ${[['draft', 'Draft'], ['sent', 'Sent / awaiting payment'], ['paid', 'Paid'], ['void', 'Void']].map(([v, l]) => `<option value="${v}" ${inv.status === v ? 'selected' : ''}>${l}</option>`).join('')}
            </select></div>
            ${f('Reference / PO number', 'reference', { ph: 'Optional' })}
            ${f('Patient name / Case ID', 'patientRef', { ph: 'e.g. Case #2291 · J. Smith' })}
          </div>
        </div>

        <div class="card card-pad">
          <div class="section-title"><h3><span class="step">3</span> Line items</h3><span class="small muted">Prices in ${esc(inv.currency)}</span></div>
          <div class="items">
            <div class="items-head"><span>Item</span><span class="r">Qty</span><span class="r">Unit price</span><span class="r">Amount</span><span></span></div>
            ${inv.items.map((it, i) => `
              <div class="item-row" data-idx="${i}">
                <div class="item-main">
                  <input class="input" data-it="name" value="${esc(it.name)}" placeholder="Service or product">
                  <textarea class="input" data-it="description" rows="1" placeholder="Description (optional)">${esc(it.description)}</textarea>
                </div>
                <input class="input r" type="number" step="any" min="0" data-it="qty" value="${esc(it.qty)}">
                <input class="input r" type="number" step="0.01" min="0" data-it="price" value="${esc(it.price)}">
                <div class="amt" data-amt>${money(Store.num(it.qty) * Store.num(it.price), inv.currency)}</div>
                <button type="button" class="btn btn-ghost btn-icon btn-sm" title="Remove line" data-action="remove-item" style="margin-top:2px">${icon('x', 'i-sm')}</button>
              </div>`).join('')}
          </div>
          <div class="items-actions">
            <button type="button" class="btn btn-sm" data-action="add-item">${icon('plus', 'i-sm')} Add line item</button>
            <div class="dropdown">
              <button type="button" class="btn btn-sm" data-toggle-menu>${icon('box', 'i-sm')} Add from services</button>
              <div class="menu left catalog">
                ${catalog.length ? catalog.map((s) => `
                  <button type="button" data-action="add-catalog" data-id="${s.id}">
                    <span class="row"><span>${esc(s.name)}</span><span>${money(Store.convert(s.price, s.currency, inv.currency), inv.currency)}</span></span>
                    ${s.description ? `<span class="d">${esc(s.description)}</span>` : ''}
                  </button>`).join('') : `<div class="small muted" style="padding:10px">No saved services. Add them on the Services page.</div>`}
                <hr><a href="#/services">${icon('settings', 'i-sm')} Manage services</a>
              </div>
            </div>
          </div>
        </div>

        <div class="card card-pad">
          <div class="section-title"><h3><span class="step">4</span> Discount, tax &amp; payments</h3></div>
          <div class="grid g3">
            <div class="field"><label>Discount</label>
              <div class="input-group">
                <input class="input" type="number" step="0.01" min="0" data-f="discountValue" value="${esc(inv.discountValue)}">
                <select class="input" data-f="discountType"><option value="percent" ${inv.discountType === 'percent' ? 'selected' : ''}>%</option><option value="fixed" ${inv.discountType === 'fixed' ? 'selected' : ''}>${esc(inv.currency)}</option></select>
              </div>
            </div>
            ${f('Tax label', 'taxLabel', { ph: 'Tax / GST / VAT' })}
            ${f('Tax rate (%)', 'taxRate', { type: 'number', attrs: 'step="0.01" min="0"' })}
            ${f('Amount paid', 'amountPaid', { type: 'number', attrs: 'step="0.01" min="0"' })}
            ${f('Payment date', 'paidDate', { type: 'date' })}
          </div>
          <div class="totals-mini" id="totals-mini"></div>
        </div>

        <div class="card card-pad">
          <div class="section-title"><h3><span class="step">5</span> Notes &amp; terms</h3></div>
          ${f('Notes to client', 'notes', { textarea: true, rows: 3 })}
          ${f('Terms & conditions', 'termsText', { textarea: true, rows: 3 })}
          <label class="check"><input type="checkbox" data-f="showBank" ${inv.showBank ? 'checked' : ''}> Show payment / bank details on invoice</label>
          <span class="small muted">Bank details and company info are managed in <a href="#/settings" style="color:var(--gold-700);font-weight:600">Settings</a>.</span>
        </div>`;
      this.renderTotals();
    },

    renderTotals() {
      const inv = this.inv;
      const t = Store.calcTotals(inv);
      const m = (v) => money(v, inv.currency);
      $('#totals-mini').innerHTML = `
        <div><span>Subtotal</span><span>${m(t.subtotal)}</span></div>
        ${t.discount ? `<div><span>Discount</span><span>−${m(t.discount)}</span></div>` : ''}
        ${t.tax ? `<div><span>${esc(inv.taxLabel || 'Tax')}</span><span>${m(t.tax)}</span></div>` : ''}
        <div><span>Total</span><span>${m(t.total)}</span></div>
        ${t.paid ? `<div><span>Paid</span><span>−${m(t.paid)}</span></div>` : ''}
        <div class="big"><span>Amount due</span><span>${m(t.balance)}</span></div>`;
    },

    renderPreview() {
      $('#preview-scale').innerHTML = InvoiceTemplate.render(this.inv, Store.db.settings);
      this.fitPreview();
      const img = $('#preview-scale img');
      if (img && !img.complete) img.addEventListener('load', () => this.fitPreview(), { once: true });
    },

    fitPreview() {
      const frame = $('#preview-frame'), outer = $('#preview-outer'), scaler = $('#preview-scale');
      const paper = scaler && $('.inv', scaler);
      if (!frame || !paper) return;
      const avail = frame.clientWidth - 36;
      const w = paper.offsetWidth, h = paper.offsetHeight;
      const s = Math.min(1, avail / w);
      scaler.style.width = w + 'px';
      scaler.style.transform = `scale(${s})`;
      outer.style.width = (w * s) + 'px';
      outer.style.height = (h * s) + 'px';
      outer.style.margin = '0 auto';
    },

    refresh() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = requestAnimationFrame(() => { this.renderTotals(); this.renderPreview(); this.renderBar(); });
    },

    markDirty() { this.dirty = true; },

    setInput(path, value) { const el = $(`[data-f="${path}"]`); if (el) { if (el.type === 'checkbox') el.checked = !!value; else el.value = value; } },

    /* ---------- events ---------- */
    onInput(e) {
      const el = e.target;
      const isSelectish = el.tagName === 'SELECT' || el.type === 'checkbox';
      if (e.type === 'input' && isSelectish) return;
      if (e.type === 'change' && !isSelectish) return;
      const inv = this.inv;

      if (el.dataset.action === 'pick-client') {
        const c = Store.db.clients.find((x) => x.id === el.value);
        if (c) {
          const before = inv.currency;
          Store.applyClient(inv, c);
          if (inv.currency !== before) toast(`Currency switched to ${inv.currency} (client default)`);
        } else inv.clientId = '';
        this.markDirty(); this.renderForm(); this.refresh();
        return;
      }
      if (el.dataset.action === 'currency') { this.changeCurrency(el.value); return; }

      if (el.dataset.it) {
        const row = el.closest('[data-idx]');
        const it = inv.items[Number(row.dataset.idx)];
        it[el.dataset.it] = el.type === 'number' ? (el.value === '' ? 0 : Store.num(el.value)) : el.value;
        $('[data-amt]', row).textContent = money(Store.num(it.qty) * Store.num(it.price), inv.currency);
        this.markDirty(); this.refresh();
        return;
      }

      const path = el.dataset.f;
      if (!path) return;
      setPath(inv, path, readValue(el));

      if (path === 'issueDate' && inv.terms !== 'custom') { inv.dueDate = Store.addDays(inv.issueDate, inv.terms); this.setInput('dueDate', inv.dueDate); }
      if (path === 'terms' && inv.terms !== 'custom') { inv.dueDate = Store.addDays(inv.issueDate, inv.terms); this.setInput('dueDate', inv.dueDate); }
      if (path === 'dueDate') { inv.terms = 'custom'; this.setInput('terms', 'custom'); }
      if (path === 'status') {
        const t = Store.calcTotals(inv);
        if (inv.status === 'paid' && t.balance > 0) {
          inv.amountPaid = t.total; this.setInput('amountPaid', inv.amountPaid);
          if (!inv.paidDate) { inv.paidDate = Store.todayISO(); this.setInput('paidDate', inv.paidDate); }
        } else if (inv.status !== 'paid' && t.total > 0 && t.balance <= 0) {
          inv.amountPaid = 0; inv.paidDate = ''; this.setInput('amountPaid', 0); this.setInput('paidDate', '');
        }
      }
      if (path === 'amountPaid') {
        const t = Store.calcTotals(inv);
        if (t.total > 0 && t.balance <= 0 && ['sent', 'draft'].includes(inv.status)) {
          inv.status = 'paid'; this.setInput('status', 'paid');
          if (!inv.paidDate) { inv.paidDate = Store.todayISO(); this.setInput('paidDate', inv.paidDate); }
        } else if (t.balance > 0 && inv.status === 'paid') { inv.status = 'sent'; this.setInput('status', 'sent'); }
      }
      if (path === 'discountType') this.renderTotals();
      this.markDirty(); this.refresh();
    },

    changeCurrency(to) {
      const inv = this.inv;
      const from = inv.currency;
      if (from === to) return;
      const hasAmounts = inv.items.some((it) => Store.num(it.price)) || Store.num(inv.amountPaid) || (inv.discountType === 'fixed' && Store.num(inv.discountValue));
      const apply = (convert) => {
        if (convert) {
          inv.items.forEach((it) => { it.price = Store.convert(it.price, from, to); });
          inv.amountPaid = Store.convert(inv.amountPaid, from, to);
          if (inv.discountType === 'fixed') inv.discountValue = Store.convert(inv.discountValue, from, to);
        }
        inv.currency = to;
        this.markDirty(); this.renderForm(); this.refresh();
      };
      if (!hasAmounts) return apply(false);
      const rate = Store.convert(1, from, to);
      modal({
        title: `Switch to ${to}?`,
        body: `<p class="mt0 muted" style="line-height:1.6">Do you want to convert existing prices from <strong>${from}</strong> to <strong>${to}</strong> using your exchange rate (1 ${from} = ${rate} ${to})?</p>
               <label class="check"><input type="checkbox" name="convert" checked> Convert amounts</label>`,
        saveLabel: 'Switch currency',
        onSave: (d) => apply(d.convert),
      });
      // Restore select until confirmed
      const sel = $('[data-action="currency"]'); if (sel) sel.value = from;
    },

    onClick(e) {
      const btn = e.target.closest('[data-action]');
      if (!btn || btn.tagName === 'SELECT') return;
      const a = btn.dataset.action;
      const inv = this.inv;
      closeMenus();
      switch (a) {
        case 'save': this.save(); break;
        case 'print': this.print(); break;
        case 'client-type': inv.client.type = btn.dataset.val; this.markDirty(); this.renderForm(); this.refresh(); break;
        case 'save-client': this.saveClientFromInvoice(); break;
        case 'add-item':
          inv.items.push({ id: Store.uid(), name: '', description: '', qty: 1, price: 0 });
          this.markDirty(); this.renderForm(); this.refresh();
          { const rows = $$('.item-row [data-it="name"]'); rows[rows.length - 1].focus(); }
          break;
        case 'add-catalog': {
          const s = Store.db.catalog.find((x) => x.id === btn.dataset.id);
          if (!s) break;
          const item = { id: Store.uid(), name: s.name, description: s.description, qty: 1, price: Store.convert(s.price, s.currency, inv.currency) };
          const last = inv.items[inv.items.length - 1];
          if (last && !last.name && !last.description && !Store.num(last.price)) inv.items[inv.items.length - 1] = item; else inv.items.push(item);
          this.markDirty(); this.renderForm(); this.refresh();
          if (!item.price) toast(`Set a price for “${s.name}”`);
          break;
        }
        case 'remove-item': {
          const idx = Number(btn.closest('[data-idx]').dataset.idx);
          inv.items.splice(idx, 1);
          if (!inv.items.length) inv.items.push({ id: Store.uid(), name: '', description: '', qty: 1, price: 0 });
          this.markDirty(); this.renderForm(); this.refresh();
          break;
        }
        case 'mark-sent': inv.status = 'sent'; this.save('Marked as sent'); this.renderForm(); break;
        case 'record-payment': this.recordPayment(); break;
        case 'email': emailInvoice(inv); break;
        case 'duplicate': {
          if (this.dirty && !this.save()) break;
          const d = Store.duplicateInvoice(inv.id);
          toast(`Duplicated as ${d.number}`);
          location.hash = '#/invoice/' + d.id;
          break;
        }
        case 'void':
          confirmDialog('Void this invoice?', `Invoice <strong>${esc(inv.number)}</strong> will be marked as void and excluded from totals. You can change the status back later.`, 'Void invoice', () => {
            inv.status = 'void'; this.save('Invoice voided'); this.renderForm();
          });
          break;
        case 'delete':
          confirmDialog('Delete invoice?', `Invoice <strong>${esc(inv.number)}</strong> will be permanently deleted. This cannot be undone.`, 'Delete', () => {
            Store.deleteInvoice(inv.id); this.dirty = false; toast('Invoice deleted'); location.hash = '#/invoices';
          });
          break;
      }
    },

    validate() {
      const inv = this.inv;
      inv.number = (inv.number || '').trim();
      const numEl = $('[data-f="number"]');
      if (numEl) numEl.classList.remove('invalid');
      if (!inv.number) { toast('Invoice number is required', 'error'); if (numEl) { numEl.classList.add('invalid'); numEl.focus(); } return false; }
      if (Store.db.invoices.some((x) => x.number === inv.number && x.id !== inv.id)) {
        toast(`Invoice number ${inv.number} is already used`, 'error'); if (numEl) { numEl.classList.add('invalid'); numEl.focus(); } return false;
      }
      return true;
    },

    save(message) {
      if (!this.validate()) return false;
      const wasNew = this.isNew;
      const saved = Store.saveInvoice(this.inv);
      this.inv = clone(saved);
      this.isNew = false;
      this.dirty = false;
      if (wasNew) { history.replaceState(null, '', '#/invoice/' + saved.id); currentHash = location.hash; }
      this.renderBar(); this.renderPreview(); updateCounts();
      toast(message || (wasNew ? `Invoice ${saved.number} created` : 'Invoice saved'));
      return true;
    },

    print() {
      if (this.dirty || this.isNew) { if (!this.save()) return; }
      printInvoice(this.inv);
    },

    saveClientFromInvoice() {
      const c = this.inv.client;
      if (!c.name && !c.practice) { toast('Enter a client name first', 'error'); $('[data-f="client.name"]').focus(); return; }
      const saved = Store.saveClient({ id: null, type: c.type, name: c.name, practice: c.practice, email: c.email, phone: c.phone, address: c.address, currency: this.inv.currency, notes: '' });
      this.inv.clientId = saved.id;
      this.markDirty(); this.renderForm(); this.refresh(); updateCounts();
      toast('Client saved to address book');
    },

    recordPayment() {
      const inv = this.inv;
      const t = Store.calcTotals(inv);
      modal({
        title: 'Record payment',
        subtitle: `Balance due: ${money(t.balance, inv.currency)}`,
        body: `<div class="grid g2">
            <div class="field"><label>Amount received (${esc(inv.currency)})</label><input class="input" type="number" step="0.01" min="0" name="amount" value="${t.balance}"></div>
            <div class="field"><label>Payment date</label><input class="input" type="date" name="date" value="${Store.todayISO()}"></div>
          </div>`,
        saveLabel: 'Record payment',
        onSave: (d) => {
          const amt = Store.num(d.amount);
          if (amt <= 0) { toast('Enter an amount greater than zero', 'error'); return false; }
          inv.amountPaid = Store.round2(Store.num(inv.amountPaid) + amt);
          inv.paidDate = d.date || Store.todayISO();
          const nt = Store.calcTotals(inv);
          inv.status = nt.balance <= 0 ? 'paid' : (inv.status === 'draft' ? 'sent' : inv.status);
          this.save(nt.balance <= 0 ? 'Invoice marked as paid' : 'Partial payment recorded');
          this.renderForm();
        },
      });
    },
  };

  /* ================================= CLIENTS ================================ */
  const clientState = { q: '' };

  function clientForm(c) {
    c = c || { type: 'doctor', currency: Store.db.settings.invoice.defaultCurrency };
    const v = (k) => esc(c[k] || '');
    return `
      <div class="grid g2">
        <div class="field"><label>Client type</label><select class="input" name="type">
          <option value="doctor" ${c.type !== 'patient' ? 'selected' : ''}>Doctor / Clinic</option>
          <option value="patient" ${c.type === 'patient' ? 'selected' : ''}>Patient</option></select></div>
        <div class="field"><label>Default currency</label><select class="input" name="currency">${currencyOptions(c.currency)}</select></div>
        <div class="field"><label>Name</label><input class="input" name="name" value="${v('name')}" placeholder="Dr. Amanda Ross"></div>
        <div class="field"><label>Clinic / practice</label><input class="input" name="practice" value="${v('practice')}" placeholder="Bright Smile Orthodontics"></div>
        <div class="field"><label>Email</label><input class="input" type="email" name="email" value="${v('email')}"></div>
        <div class="field"><label>Phone</label><input class="input" name="phone" value="${v('phone')}"></div>
        <div class="field span-all"><label>Billing address</label><textarea class="input" name="address" rows="3">${v('address')}</textarea></div>
        <div class="field span-all"><label>Internal notes</label><textarea class="input" name="notes" rows="2" placeholder="Not shown on invoices">${v('notes')}</textarea></div>
      </div>`;
  }

  function openClientModal(existing) {
    modal({
      title: existing ? 'Edit client' : 'New client',
      subtitle: 'Saved clients can be picked instantly when creating invoices.',
      body: clientForm(existing),
      saveLabel: existing ? 'Save changes' : 'Add client',
      onSave: (d) => {
        if (!d.name.trim() && !d.practice.trim()) { toast('Enter a name or practice', 'error'); return false; }
        Store.saveClient(Object.assign({}, existing || { id: null }, d));
        toast(existing ? 'Client updated' : 'Client added');
        renderClients(); updateCounts();
      },
    });
  }

  function renderClients() {
    view.innerHTML = `
      <div class="page-head">
        <div><div class="eyebrow">Address book</div><h1>Clients</h1><p>Doctors, clinics and patients you bill regularly.</p></div>
        <div class="actions">
          <div class="search">${icon('search', 'i-sm')}<input class="input" data-cq placeholder="Search clients…" value="${esc(clientState.q)}"></div>
          <button class="btn btn-gold" data-c="new">${icon('plus')} New client</button>
        </div>
      </div>
      <div class="card" id="client-table"></div>`;
    $('[data-cq]').addEventListener('input', (e) => { clientState.q = e.target.value; renderClientTable(); });
    view.onclick = (e) => {
      const b = e.target.closest('[data-c]');
      if (!b) return;
      const id = b.dataset.id;
      const c = Store.db.clients.find((x) => x.id === id);
      if (b.dataset.c === 'new') openClientModal(null);
      if (b.dataset.c === 'edit' && c) openClientModal(c);
      if (b.dataset.c === 'invoice') location.hash = '#/invoice/new?client=' + id;
      if (b.dataset.c === 'del' && c) confirmDialog('Delete client?', `<strong>${esc(clientLabel(c))}</strong> will be removed from your address book. Existing invoices are not affected.`, 'Delete', () => { Store.deleteClient(id); toast('Client deleted'); renderClients(); updateCounts(); });
    };
    renderClientTable();
  }

  function renderClientTable() {
    const q = clientState.q.trim().toLowerCase();
    const list = Store.db.clients.filter((c) => !q || [c.name, c.practice, c.email, c.phone].some((v) => (v || '').toLowerCase().includes(q)))
      .sort((a, b) => clientLabel(a).localeCompare(clientLabel(b)));
    const box = $('#client-table');
    if (!Store.db.clients.length) {
      box.innerHTML = `<div class="empty"><div class="e-icon">${icon('users')}</div><h3>No clients yet</h3><p>Add doctors, clinics or patients — or save them straight from an invoice.</p><button class="btn btn-gold" data-c="new">${icon('plus')} Add client</button></div>`;
      return;
    }
    if (!list.length) { box.innerHTML = `<div class="empty"><h3>No matches</h3><p>Try a different search.</p></div>`; return; }
    box.innerHTML = `<div class="table-wrap"><table class="table">
      <thead><tr><th>Client</th><th>Type</th><th>Contact</th><th>Invoices</th><th class="num">Outstanding</th><th></th></tr></thead>
      <tbody>${list.map((c) => {
        const invs = Store.db.invoices.filter((i) => i.clientId === c.id);
        const owed = {};
        invs.forEach((i) => { const st = Store.invoiceStatus(i); if (['sent', 'partial', 'overdue'].includes(st.key)) owed[i.currency] = (owed[i.currency] || 0) + Store.calcTotals(i).balance; });
        const owedStr = Object.entries(owed).map(([cur, v]) => money(v, cur)).join('<br>') || '<span class="muted">—</span>';
        return `<tr>
          <td><div class="strong">${esc(c.name || c.practice)}</div>${c.name && c.practice ? `<div class="sub">${esc(c.practice)}</div>` : ''}</td>
          <td>${c.type === 'patient' ? '<span class="tag tag-ink">Patient</span>' : '<span class="tag">Doctor / Clinic</span>'}</td>
          <td><div>${esc(c.email || '—')}</div>${c.phone ? `<div class="sub">${esc(c.phone)}</div>` : ''}</td>
          <td>${invs.length}<div class="sub">${esc(c.currency || '')}</div></td>
          <td class="num strong">${owedStr}</td>
          <td><div class="row-actions">
            <button class="btn btn-sm" data-c="invoice" data-id="${c.id}">${icon('plus', 'i-sm')} Invoice</button>
            <button class="btn btn-ghost btn-icon btn-sm" title="Edit" data-c="edit" data-id="${c.id}">${icon('edit', 'i-sm')}</button>
            <button class="btn btn-ghost btn-icon btn-sm" title="Delete" data-c="del" data-id="${c.id}">${icon('trash', 'i-sm')}</button>
          </div></td></tr>`;
      }).join('')}</tbody></table></div>`;
  }

  /* ================================ SERVICES ================================ */
  function openServiceModal(existing) {
    const s = existing || { name: '', description: '', price: 0, currency: Store.db.settings.invoice.defaultCurrency };
    modal({
      title: existing ? 'Edit service' : 'New service',
      subtitle: 'Services appear in the “Add from services” menu on every invoice.',
      body: `<div class="grid g2">
          <div class="field span-all"><label>Service name</label><input class="input" name="name" value="${esc(s.name)}" placeholder="e.g. Moderate Case Setup"></div>
          <div class="field span-all"><label>Description</label><textarea class="input" name="description" rows="3">${esc(s.description)}</textarea></div>
          <div class="field"><label>Unit price</label><input class="input" type="number" step="0.01" min="0" name="price" value="${esc(s.price)}"></div>
          <div class="field"><label>Price currency</label><select class="input" name="currency">${currencyOptions(s.currency)}</select></div>
        </div>`,
      saveLabel: existing ? 'Save changes' : 'Add service',
      onSave: (d) => {
        if (!d.name.trim()) { toast('Service name is required', 'error'); return false; }
        Store.saveCatalogItem(Object.assign({}, existing || { id: null }, d, { price: Store.num(d.price) }));
        toast(existing ? 'Service updated' : 'Service added');
        renderServices();
      },
    });
  }

  function renderServices() {
    const list = Store.db.catalog;
    view.innerHTML = `
      <div class="page-head">
        <div><div class="eyebrow">Catalog</div><h1>Services &amp; pricing</h1><p>Your standard services and prices. Added to invoices in one click and converted to the invoice currency automatically.</p></div>
        <div class="actions"><button class="btn btn-gold" data-s="new">${icon('plus')} New service</button></div>
      </div>
      <div class="card">
        ${list.length ? `<div class="table-wrap"><table class="table">
          <thead><tr><th>Service</th><th class="num">Unit price</th><th></th></tr></thead>
          <tbody>${list.map((s) => `
            <tr class="clickable" data-s="edit" data-id="${s.id}">
              <td><div class="strong">${esc(s.name)}</div>${s.description ? `<div class="sub">${esc(s.description)}</div>` : ''}</td>
              <td class="num strong">${Store.num(s.price) ? money(s.price, s.currency) : '<span class="muted">Set per invoice</span>'}</td>
              <td><div class="row-actions">
                <button class="btn btn-ghost btn-icon btn-sm" title="Edit" data-s="edit" data-id="${s.id}">${icon('edit', 'i-sm')}</button>
                <button class="btn btn-ghost btn-icon btn-sm" title="Delete" data-s="del" data-id="${s.id}">${icon('trash', 'i-sm')}</button>
              </div></td>
            </tr>`).join('')}</tbody></table></div>`
        : `<div class="empty"><div class="e-icon">${icon('box')}</div><h3>No services yet</h3><p>Save the services you bill most often.</p><button class="btn btn-gold" data-s="new">${icon('plus')} Add service</button></div>`}
      </div>
      <p class="small muted" style="margin-top:14px">Pre-loaded from your published per-case pricing (USD). Exchange rates for conversion are set in <a href="#/settings" style="color:var(--gold-700);font-weight:600">Settings</a>.</p>`;
    view.onclick = (e) => {
      const b = e.target.closest('[data-s]');
      if (!b) return;
      const s = Store.db.catalog.find((x) => x.id === b.dataset.id);
      if (b.dataset.s === 'new') openServiceModal(null);
      else if (b.dataset.s === 'edit' && s) openServiceModal(s);
      else if (b.dataset.s === 'del' && s) { e.stopPropagation(); confirmDialog('Delete service?', `<strong>${esc(s.name)}</strong> will be removed from your catalog. Existing invoices are not affected.`, 'Delete', () => { Store.deleteCatalogItem(s.id); toast('Service deleted'); renderServices(); }); }
    };
  }

  /* ================================ SETTINGS ================================ */
  let pendingLogo = null;
  let pendingBankQr = null;

  function renderSettings() {
    const S = Store.db.settings;
    pendingLogo = null;
    pendingBankQr = null;
    const sf = (label, path, opts) => {
      opts = opts || {};
      const v = getPath(S, path);
      const cls = opts.cls ? ` ${opts.cls}` : '';
      const hint = opts.hint ? `<div class="hint">${opts.hint}</div>` : '';
      if (opts.textarea) return `<div class="field${cls}"><label>${label}</label><textarea class="input" data-sp="${path}" rows="${opts.rows || 3}">${esc(v)}</textarea>${hint}</div>`;
      if (opts.options) return `<div class="field${cls}"><label>${label}</label><select class="input" data-sp="${path}">${opts.options.map(([val, l]) => `<option value="${esc(val)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>${hint}</div>`;
      return `<div class="field${cls}"><label>${label}</label><input class="input" type="${opts.type || 'text'}" data-sp="${path}" value="${esc(v)}" ${opts.attrs || ''} placeholder="${esc(opts.ph || '')}">${hint}</div>`;
    };
    const logoSrc = S.branding.logo || 'assets/logo-emblem.png';

    view.innerHTML = `
      <div class="page-head">
        <div><div class="eyebrow">Configuration</div><h1>Settings</h1><p>Company profile, branding, invoice defaults and payment details.</p></div>
      </div>
      <div class="settings-layout">
        <nav class="settings-nav">
          <a href="javascript:void(0)" data-jump="s-company">Company profile</a>
          <a href="javascript:void(0)" data-jump="s-brand">Branding &amp; paper</a>
          <a href="javascript:void(0)" data-jump="s-invoice">Invoice defaults</a>
          <a href="javascript:void(0)" data-jump="s-bank">Payment details</a>
          <a href="javascript:void(0)" data-jump="s-rates">Exchange rates</a>
          <a href="javascript:void(0)" data-jump="s-data">Backup &amp; data</a>
        </nav>
        <div class="settings-sections" id="settings-form">
          <div class="card" id="s-company"><div class="card-head"><div><h3>Company profile</h3><p>Shown in the header, payment notes, and footer of every invoice.</p></div></div>
            <div class="card-pad"><div class="grid g2">
              ${sf('Company name', 'company.name')}
              ${sf('Tagline', 'company.tagline')}
              ${sf('Email', 'company.email', { type: 'email' })}
              ${sf('Phone', 'company.phone')}
              ${sf('Website', 'company.website')}
              ${sf('Tax / NTN / Registration no.', 'company.taxId', { ph: 'Optional' })}
              ${sf('Address', 'company.address', { textarea: true, rows: 3, cls: 'span-all' })}
            </div></div></div>

          <div class="card" id="s-brand"><div class="card-head"><div><h3>Branding &amp; paper</h3><p>Your Vélourcare emblem is used by default.</p></div></div>
            <div class="card-pad">
              <div class="logo-box">
                <div class="logo-preview"><img id="logo-preview" src="${esc(logoSrc)}" alt="Logo"></div>
                <div style="display:flex;flex-direction:column;gap:8px">
                  <div class="actions">
                    <label class="btn btn-sm">${icon('upload', 'i-sm')} Upload logo<input type="file" accept="image/*" id="logo-file" hidden></label>
                    <button type="button" class="btn btn-sm btn-ghost" id="logo-reset">Reset to default</button>
                  </div>
                  <span class="small muted">PNG with transparent background works best · max 1.5 MB</span>
                </div>
              </div>
              <div class="grid g2">
                ${sf('Paper size', 'branding.paper', { options: [['A4', 'A4 (210 × 297 mm) — international'], ['Letter', 'US Letter (8.5 × 11 in) — USA / Canada']] })}
                <div class="field"><label>Wordmark</label><label class="check" style="height:38px"><input type="checkbox" data-sp="branding.showWordmark" ${S.branding.showWordmark ? 'checked' : ''}> Show “VÉLOURCARE ORTHO” wordmark next to logo</label></div>
              </div>
            </div></div>

          <div class="card" id="s-invoice"><div class="card-head"><div><h3>Invoice defaults</h3><p>Applied to every new invoice — can be changed per invoice.</p></div></div>
            <div class="card-pad">
              <div class="grid g4">
                ${sf('Number prefix', 'invoice.prefix')}
                ${sf('Next number', 'invoice.nextNumber', { type: 'number', attrs: 'min="1" step="1"' })}
                ${sf('Digits', 'invoice.padding', { type: 'number', attrs: 'min="1" max="8" step="1"' })}
                <div class="field"><label>Year in number</label><label class="check" style="height:38px"><input type="checkbox" data-sp="invoice.includeYear" ${S.invoice.includeYear ? 'checked' : ''}> Include year</label></div>
              </div>
              <div class="small muted">Next invoice number: <strong id="num-preview" style="color:var(--ink)">${esc(Store.nextInvoiceNumber())}</strong></div>
              <div class="grid g4">
                ${sf('Default currency', 'invoice.defaultCurrency', { options: Object.keys(Store.CURRENCIES).map((c) => [c, c]) })}
                ${sf('Default terms', 'invoice.defaultTerms', { options: Store.TERMS.filter((t) => t.value !== 'custom').map((t) => [t.value, t.label]) })}
                ${sf('Tax label', 'invoice.taxLabel')}
                ${sf('Default tax rate (%)', 'invoice.defaultTaxRate', { type: 'number', attrs: 'min="0" step="0.01"' })}
              </div>
              ${sf('Default notes', 'invoice.notes', { textarea: true })}
              ${sf('Default terms & conditions', 'invoice.terms', { textarea: true })}
            </div></div>

          <div class="card" id="s-bank"><div class="card-head"><div><h3>Payment details</h3><p>Printed in the payment box so clients know exactly how to pay.</p></div></div>
            <div class="card-pad">
              <div class="grid g2">
                ${sf('Account title', 'bank.accountName')}
                ${sf('Bank name', 'bank.bankName', { ph: 'e.g. Meezan Bank' })}
                ${sf('Account number', 'bank.accountNumber')}
                ${sf('IBAN', 'bank.iban', { ph: 'PK00XXXX0000000000000000' })}
                ${sf('SWIFT / BIC', 'bank.swift')}
                ${sf('Branch / routing', 'bank.branch')}
                ${sf('Online payment link', 'bank.paymentLink', { cls: 'span-all', ph: 'e.g. Payoneer, Wise, PayPal or Stripe link', hint: 'Useful for international clients paying by card. Also used for QR code generation if no custom QR image is uploaded.' })}
                ${sf('Other payment instructions', 'bank.other', { textarea: true, rows: 2, cls: 'span-all', ph: 'e.g. Wise USD account details, or “Please cover all bank charges.”' })}
              </div>
              <div style="margin-top:16px; padding-top:16px; border-top:1px solid var(--line);">
                <label style="font-weight:600; font-size:13px; display:block; margin-bottom:4px;">Bank Payment QR Code</label>
                <p class="small muted" style="margin-bottom:10px;">Upload a QR code image (Raast, bank app, or mobile wallet). If left empty, a QR code is automatically generated on invoices from your payment link or IBAN.</p>
                <div class="logo-box">
                  <div class="logo-preview" style="width:90px; height:90px; display:flex; align-items:center; justify-content:center; background:#fff; border:1px solid var(--line); border-radius:8px; padding:4px;">
                    <img id="bank-qr-preview" src="${esc(S.bank.qrImage || 'assets/logo-emblem.png')}" alt="Payment QR" style="max-width:100%; max-height:100%; object-fit:contain; ${S.bank.qrImage ? '' : 'opacity:0.25; filter:grayscale(1);'}">
                  </div>
                  <div style="display:flex; flex-direction:column; gap:8px;">
                    <div class="actions">
                      <label class="btn btn-sm">${icon('upload', 'i-sm')} Upload QR Code<input type="file" accept="image/*" id="bank-qr-file" hidden></label>
                      <button type="button" class="btn btn-sm btn-ghost" id="bank-qr-reset">Remove QR</button>
                    </div>
                    <span class="small muted">Square PNG or JPG recommended · max 1.5 MB</span>
                  </div>
                </div>
              </div>
            </div></div>

          <div class="card" id="s-rates"><div class="card-head"><div><h3>Exchange rates</h3><p>Value of 1 USD in each currency. Used when converting service prices — update them periodically.</p></div></div>
            <div class="card-pad"><div class="rates">
              ${Object.keys(Store.CURRENCIES).map((c) => `<div class="field"><label>1 USD = ${c}</label><input class="input" type="number" step="0.0001" min="0" data-sp="rates.${c}" value="${esc(S.rates[c])}" ${c === 'USD' ? 'disabled' : ''}></div>`).join('')}
            </div></div></div>

          <div class="card" id="s-data"><div class="card-head"><div><h3>Backup &amp; data</h3><p>All data is stored privately in this browser on this computer. Export a backup regularly.</p></div></div>
            <div class="card-pad">
              <div class="actions">
                <button type="button" class="btn" id="backup-export">${icon('download', 'i-sm')} Export backup (.json)</button>
                <label class="btn">${icon('upload', 'i-sm')} Restore backup<input type="file" accept="application/json,.json" id="backup-import" hidden></label>
                <button type="button" class="btn btn-danger" id="reset-all">${icon('trash', 'i-sm')} Reset everything</button>
              </div>
              <span class="small muted">${Store.db.invoices.length} invoices · ${Store.db.clients.length} clients · ${Store.db.catalog.length} services</span>
            </div></div>

          <div class="save-bar"><button type="button" class="btn" id="settings-cancel">Discard changes</button><button type="button" class="btn btn-gold" id="settings-save">${icon('save')} Save settings</button></div>
        </div>
      </div>`;

    view.onclick = (e) => {
      const j = e.target.closest('[data-jump]');
      if (j) { e.preventDefault(); document.getElementById(j.dataset.jump).scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    };

    const collect = () => {
      const next = clone(S);
      $$('[data-sp]', view).forEach((el) => { if (!el.disabled) setPath(next, el.dataset.sp, readValue(el)); });
      if (pendingLogo !== null) next.branding.logo = pendingLogo;
      if (pendingBankQr !== null) next.bank.qrImage = pendingBankQr;
      next.invoice.nextNumber = Math.max(1, Math.floor(Store.num(next.invoice.nextNumber)) || 1);
      next.invoice.padding = Math.min(8, Math.max(1, Math.floor(Store.num(next.invoice.padding)) || 1));
      return next;
    };

    const numPreview = () => {
      const tmp = collect();
      const parts = [];
      if (tmp.invoice.prefix) parts.push(tmp.invoice.prefix);
      if (tmp.invoice.includeYear) parts.push(new Date().getFullYear());
      parts.push(String(tmp.invoice.nextNumber).padStart(tmp.invoice.padding, '0'));
      $('#num-preview').textContent = parts.join('-');
    };
    ['invoice.prefix', 'invoice.nextNumber', 'invoice.padding', 'invoice.includeYear'].forEach((p) => {
      const el = $(`[data-sp="${p}"]`); el.addEventListener('input', numPreview); el.addEventListener('change', numPreview);
    });

    $('#logo-file').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 1.5 * 1024 * 1024) { toast('Logo is too large — please use an image under 1.5 MB', 'error'); return; }
      const reader = new FileReader();
      reader.onload = () => { pendingLogo = reader.result; $('#logo-preview').src = pendingLogo; toast('Logo ready — click Save settings'); };
      reader.readAsDataURL(file);
    });
    $('#logo-reset').addEventListener('click', () => { pendingLogo = ''; $('#logo-preview').src = 'assets/logo-emblem.png'; });

    const qrFileInput = $('#bank-qr-file');
    if (qrFileInput) {
      qrFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1.5 * 1024 * 1024) { toast('QR image is too large — please use an image under 1.5 MB', 'error'); return; }
        const reader = new FileReader();
        reader.onload = () => {
          pendingBankQr = reader.result;
          const prev = $('#bank-qr-preview');
          if (prev) { prev.src = pendingBankQr; prev.style.opacity = '1'; prev.style.filter = 'none'; }
          toast('QR Code ready — click Save settings');
        };
        reader.readAsDataURL(file);
      });
    }
    const qrResetBtn = $('#bank-qr-reset');
    if (qrResetBtn) {
      qrResetBtn.addEventListener('click', () => {
        pendingBankQr = '';
        const prev = $('#bank-qr-preview');
        if (prev) { prev.src = 'assets/logo-emblem.png'; prev.style.opacity = '0.25'; prev.style.filter = 'grayscale(1)'; }
        toast('QR Code removed (will auto-generate from payment link or IBAN)');
      });
    }

    $('#settings-save').addEventListener('click', () => {
      Store.db.settings = collect();
      if (Store.save()) { toast('Settings saved'); renderSettings(); }
    });
    $('#settings-cancel').addEventListener('click', () => { renderSettings(); toast('Changes discarded'); });

    $('#backup-export').addEventListener('click', () => {
      download(`velourcare-invoices-backup-${Store.todayISO()}.json`, Store.exportJSON(), 'application/json');
      toast('Backup downloaded');
    });
    $('#backup-import').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        confirmDialog('Restore backup?', 'This will <strong>replace all current data</strong> (invoices, clients, services and settings) with the contents of the backup file.', 'Restore', () => {
          try { Store.importJSON(reader.result); toast('Backup restored'); render(); } catch (err) { toast(err.message || 'Invalid backup file', 'error'); }
        });
        e.target.value = '';
      };
      reader.readAsText(file);
    });
    $('#reset-all').addEventListener('click', () => {
      confirmDialog('Reset everything?', 'All invoices, clients, services and settings will be <strong>permanently erased</strong> and restored to defaults. Export a backup first if you might need this data.', 'Erase all data', () => {
        Store.resetAll(); toast('All data reset'); render();
      });
    });
  }

  /* ------------------------------- Phone Modal ------------------------------ */
  async function showPhoneModal() {
    const data = await Store.getTunnelUrl();
    const liveUrl = data.url || window.location.origin;
    const isLocal = !data.url;

    modal({
      title: '📱 Open on Your Phone',
      subtitle: 'Create invoices from anywhere with automatic cloud sync.',
      body: `
        <div class="qr-container">
          <div class="qr-frame" id="phone-qr-target"></div>
          <div class="tunnel-url-box">
            <span class="tunnel-url-text">${esc(liveUrl)}</span>
            <button type="button" class="btn btn-sm btn-gold" id="btn-copy-tunnel">${icon('copy', 'i-sm')} Copy</button>
          </div>
          <p class="small muted" style="margin:0; line-height:1.5;">
            ${isLocal
              ? '✦ Connecting to secure tunnel... In the meantime, use your local Wi-Fi or refresh in a moment.'
              : '✦ <strong>Scan this QR code with your phone camera</strong> to open your invoice portal instantly.'}
          </p>
          <div style="background:var(--paper); border:1px solid var(--line); border-radius:12px; padding:10px 14px; text-align:left; font-size:12px; width:100%; color:var(--ink-2); line-height:1.5;">
            <strong>Tip:</strong> Tap <em>Share → Add to Home Screen</em> on your iPhone or Android to install Vélourcare as a native app on your phone!
          </div>
        </div>
      `,
      saveLabel: 'Done',
      onOpen: (f) => {
        const target = $('#phone-qr-target', f);
        if (target && window.QRCode) {
          target.innerHTML = '';
          new QRCode(target, {
            text: liveUrl,
            width: 180,
            height: 180,
            colorDark: '#1E252B',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M,
          });
        }
        const copyBtn = $('#btn-copy-tunnel', f);
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(liveUrl);
            toast('Live URL copied to clipboard!');
          });
        }
      },
      onSave: () => true,
    });
  }

  /* ---------------------------------- Boot ---------------------------------- */
  Store.load();
  $$('[data-icon]').forEach((el) => { el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)); });

  // Sync listener indicator
  Store.onSync((status, date) => {
    const dot = $('#sync-indicator .dot');
    const txt = $('#sync-text');
    if (!dot || !txt) return;
    if (status === 'synced') {
      dot.style.background = '#5bb98b';
      txt.textContent = 'Cloud Sync Active';
    } else if (status === 'saving') {
      dot.style.background = '#b89b69';
      txt.textContent = 'Saving to Cloud...';
    } else if (status === 'offline') {
      dot.style.background = '#e69a30';
      txt.textContent = 'Local Offline Mode';
    }
  });

  // Phone connect button
  const phoneBtn = $('#btn-phone-connect');
  if (phoneBtn) {
    phoneBtn.addEventListener('click', showPhoneModal);
  }

  async function checkInit() {
    await Store.pullFromServer();
    render();
    updateCounts();
  }

  if (!location.hash) { history.replaceState(null, '', '#/invoices'); currentHash = location.hash; }
  checkInit();
})();

