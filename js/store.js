/* ==========================================================================
   Vélourcare Ortho — Invoice Builder
   Data layer: persistence (localStorage), defaults, money/date helpers, math.
   ========================================================================== */
(function () {
  'use strict';

  const KEY = 'velourcare_invoice_builder_v1';

  const CURRENCIES = {
    USD: 'US Dollar',
    PKR: 'Pakistani Rupee',
    SGD: 'Singapore Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    AED: 'UAE Dirham',
    SAR: 'Saudi Riyal',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
  };

  // Approximate rates per 1 USD — editable in Settings. Used only when
  // converting catalog prices / line items between currencies.
  const DEFAULT_RATES = {
    USD: 1, PKR: 280, SGD: 1.3, EUR: 0.92, GBP: 0.78,
    AED: 3.6725, SAR: 3.75, CAD: 1.37, AUD: 1.52,
  };

  const TERMS = [
    { value: '0', label: 'Due on receipt' },
    { value: '7', label: 'Net 7' },
    { value: '15', label: 'Net 15' },
    { value: '30', label: 'Net 30' },
    { value: '45', label: 'Net 45' },
    { value: '60', label: 'Net 60' },
    { value: 'custom', label: 'Custom date' },
  ];

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function defaultDB() {
    return {
      version: 1,
      settings: {
        company: {
          name: 'Vélourcare Ortho',
          tagline: 'Digital Orthodontic Treatment Planning',
          address: 'Lahore, Pakistan',
          email: 'sales@velourcareortho.com',
          phone: '+92 326 4755645',
          website: 'www.velourcareortho.com',
          taxId: '',
        },
        branding: {
          logo: '',            // data URL; empty = bundled logo
          showWordmark: true,
          paper: 'A4',         // 'A4' | 'Letter'
        },
        invoice: {
          prefix: 'VCO',
          includeYear: true,
          nextNumber: 3,
          padding: 4,
          defaultCurrency: 'USD',
          defaultTerms: '15',
          taxLabel: 'Tax',
          defaultTaxRate: 0,
          notes: 'Thank you for partnering with Vélourcare Ortho. Every treatment plan is reviewed and approved by a licensed orthodontist.',
          terms: 'Payment is due by the date shown above. Please include the invoice number as your payment reference. Revisions beyond those included in the selected plan are billed separately.',
        },
        bank: {
          accountName: 'Vélourcare Ortho',
          bankName: '',
          accountNumber: '',
          iban: '',
          swift: '',
          branch: '',
          paymentLink: '',
          other: '',
          qrImage: '',
        },
        rates: Object.assign({}, DEFAULT_RATES),
      },
      clients: [
        {
          id: 'c-demo-1',
          type: 'doctor',
          name: 'Dr. Sarah Jenkins',
          practice: 'Apex Orthodontics & Dental Care',
          email: 'dr.jenkins@apexortho.com',
          phone: '+1 (512) 489-3200',
          address: '742 Evergreen Terrace, Suite 300\nAustin, TX 78701, USA',
          currency: 'USD',
          notes: 'Prefers digital setups via OnyxCeph. Regular dual-arch cases.'
        },
        {
          id: 'c-demo-2',
          type: 'doctor',
          name: 'Dr. Tariq Mahmood',
          practice: 'Gulberg Dental & Orthodontic Specialists',
          email: 'contact@gulbergortho.pk',
          phone: '+92 300 842 1199',
          address: 'Main Boulevard, Gulberg III\nLahore, Punjab, Pakistan',
          currency: 'PKR',
          notes: 'Direct clinical partner.'
        }
      ],
      catalog: [
        { id: uid(), name: 'Simple Case Setup', description: 'Single-arch setup · basic staging · attachment placement · 1 revision included · 24–48 hr delivery', price: 50, currency: 'USD' },
        { id: uid(), name: 'Moderate Case Setup', description: 'Dual-arch setup · biomechanical staging · optimized attachments · IPR planning · superimposition report · 1 revision included', price: 75, currency: 'USD' },
        { id: uid(), name: 'Complex Case Setup', description: 'Full-complexity setup · advanced biomechanics · root control staging · complex attachment strategy · detailed IPR mapping', price: 100, currency: 'USD' },
        { id: uid(), name: 'Additional Revision', description: 'Additional treatment-plan revision beyond those included', price: 15, currency: 'USD' },
        { id: uid(), name: 'Rush Delivery (Same-Day)', description: 'Same-day turnaround surcharge — 50% of the case fee', price: 37.50, currency: 'USD' },
      ],
      invoices: [
        {
          id: 'inv-demo-1',
          number: 'VCO-2026-0001',
          status: 'paid',
          clientId: 'c-demo-1',
          client: {
            type: 'doctor',
            name: 'Dr. Sarah Jenkins',
            practice: 'Apex Orthodontics & Dental Care',
            email: 'dr.jenkins@apexortho.com',
            phone: '+1 (512) 489-3200',
            address: '742 Evergreen Terrace, Suite 300\nAustin, TX 78701, USA'
          },
          issueDate: todayISO(),
          terms: '15',
          dueDate: addDays(todayISO(), 15),
          currency: 'USD',
          reference: 'PO-98214',
          patientRef: 'Case #4082 · Emily Watson (Dual-arch)',
          items: [
            {
              id: 'it-1',
              name: 'Moderate Case Setup',
              description: 'Dual-arch setup · biomechanical staging · optimized attachments · IPR planning · superimposition report · 1 revision included',
              qty: 1,
              price: 75
            },
            {
              id: 'it-2',
              name: 'Rush Delivery (Same-Day)',
              description: 'Priority same-day digital design & review',
              qty: 1,
              price: 37.50
            }
          ],
          discountType: 'percent',
          discountValue: 0,
          taxLabel: 'Tax',
          taxRate: 0,
          amountPaid: 112.50,
          paidDate: todayISO(),
          notes: 'Thank you for partnering with Vélourcare Ortho. Every treatment plan is reviewed and approved by a licensed orthodontist.',
          termsText: 'Payment is due by the date shown above. Please include the invoice number as your payment reference. Revisions beyond those included in the selected plan are billed separately.',
          showBank: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'inv-demo-2',
          number: 'VCO-2026-0002',
          status: 'sent',
          clientId: 'c-demo-2',
          client: {
            type: 'doctor',
            name: 'Dr. Tariq Mahmood',
            practice: 'Gulberg Dental & Orthodontic Specialists',
            email: 'contact@gulbergortho.pk',
            phone: '+92 300 842 1199',
            address: 'Main Boulevard, Gulberg III\nLahore, Punjab, Pakistan'
          },
          issueDate: todayISO(),
          terms: '15',
          dueDate: addDays(todayISO(), 15),
          currency: 'USD',
          reference: 'CLINIC-774',
          patientRef: 'Case #4095 · Hamza Malik (Severe crowding)',
          items: [
            {
              id: 'it-3',
              name: 'Complex Case Setup',
              description: 'Full-complexity setup · advanced biomechanics · root control staging · complex attachment strategy · detailed IPR mapping',
              qty: 1,
              price: 100
            }
          ],
          discountType: 'percent',
          discountValue: 0,
          taxLabel: 'Tax',
          taxRate: 0,
          amountPaid: 0,
          paidDate: '',
          notes: 'Thank you for partnering with Vélourcare Ortho. Every treatment plan is reviewed and approved by a licensed orthodontist.',
          termsText: 'Payment is due by the date shown above. Please include the invoice number as your payment reference. Revisions beyond those included in the selected plan are billed separately.',
          showBank: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
    };
  }

  // Deep-merge saved data onto defaults so new settings keys appear after updates.
  function mergeDefaults(target, defaults) {
    for (const k of Object.keys(defaults)) {
      const dv = defaults[k];
      if (!(k in target)) target[k] = dv;
      else if (dv && typeof dv === 'object' && !Array.isArray(dv) && target[k] && typeof target[k] === 'object') {
        mergeDefaults(target[k], dv);
      }
    }
    return target;
  }

  let db;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const d = defaultDB();
        db = mergeDefaults(parsed, { version: d.version, settings: d.settings, clients: [], catalog: d.catalog, invoices: [] });
        // Automatically migrate legacy default company contact info if still set to previous values
        if (db.settings && db.settings.company) {
          let updated = false;
          if (db.settings.company.email === 'nomair@velourcareortho.com') {
            db.settings.company.email = 'sales@velourcareortho.com';
            updated = true;
          }
          if (db.settings.company.phone === '+92 329 405 3244') {
            db.settings.company.phone = '+92 326 4755645';
            updated = true;
          }
          if (db.settings.company.website === 'www.vélourcare.com' || db.settings.company.website === 'www.velourcare.com') {
            db.settings.company.website = 'www.velourcareortho.com';
            updated = true;
          }
          if (updated) save();
        }
        return db;
      }
    } catch (e) {
      console.error('Failed to load data', e);
    }
    db = defaultDB();
    save();
    return db;
  }

  let syncListeners = [];

  function onSync(fn) { syncListeners.push(fn); }

  function notifySync(status, info) {
    syncListeners.forEach((fn) => { try { fn(status, info); } catch (e) {} });
  }

  // Push local state to server SQLite database & rolling backup
  async function pushToServer() {
    notifySync('saving');
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db),
      });
      if (res.ok) {
        notifySync('synced', new Date());
        return true;
      }
    } catch (e) {
      notifySync('offline');
    }
    return false;
  }

  // Pull latest state from server SQLite database
  async function pullFromServer() {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.settings) {
          db = mergeDefaults(json.data, defaultDB());
          try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {}
          notifySync('synced', new Date());
          return true;
        } else {
          // Server DB was empty; seed it with our local data
          await pushToServer();
          return true;
        }
      }
    } catch (e) {
      notifySync('offline');
    }
    return false;
  }

  async function getTunnelUrl() {
    try {
      const res = await fetch('/api/tunnel-url');
      if (res.ok) return await res.json();
    } catch (e) {}
    return { url: null, status: 'offline' };
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
      // Asynchronously sync to SQLite backend & backup
      pushToServer();
      return true;
    } catch (e) {
      console.error(e);
      alert('Could not save — browser storage may be full. Try a smaller logo image or export a backup.');
      return false;
    }
  }

  /* ------------------------------ Helpers ------------------------------ */

  const round2 = (v) => Math.round((Number(v) + Number.EPSILON) * 100) / 100;
  const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };

  function formatMoney(value, currency) {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: currency || 'USD', currencyDisplay: 'symbol',
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      }).format(num(value));
    } catch (e) {
      return (currency || '') + ' ' + num(value).toFixed(2);
    }
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function todayISO() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  function parseISO(s) { if (!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
  function addDays(iso, days) {
    const d = parseISO(iso) || new Date();
    d.setDate(d.getDate() + Number(days || 0));
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function formatDate(iso, style) {
    const d = parseISO(iso);
    if (!d) return '—';
    return d.toLocaleDateString('en-US', style === 'long'
      ? { month: 'long', day: 'numeric', year: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function daysBetween(aIso, bIso) {
    const a = parseISO(aIso), b = parseISO(bIso);
    return Math.round((b - a) / 86400000);
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function convert(amount, from, to) {
    if (from === to) return num(amount);
    const r = db.settings.rates;
    const usd = num(amount) / (num(r[from]) || 1);
    return round2(usd * (num(r[to]) || 1));
  }

  /* ---------------------------- Invoice math ---------------------------- */

  function calcTotals(inv) {
    const subtotal = round2((inv.items || []).reduce((s, it) => s + num(it.qty) * num(it.price), 0));
    let discount = inv.discountType === 'fixed' ? num(inv.discountValue) : subtotal * num(inv.discountValue) / 100;
    discount = round2(Math.min(Math.max(discount, 0), subtotal));
    const taxable = round2(subtotal - discount);
    const tax = round2(taxable * num(inv.taxRate) / 100);
    const total = round2(taxable + tax);
    const paid = round2(num(inv.amountPaid));
    const balance = round2(total - paid);
    return { subtotal, discount, taxable, tax, total, paid, balance };
  }

  const STATUS = {
    draft:   { key: 'draft',   label: 'Draft' },
    sent:    { key: 'sent',    label: 'Awaiting payment' },
    partial: { key: 'partial', label: 'Partially paid' },
    overdue: { key: 'overdue', label: 'Overdue' },
    paid:    { key: 'paid',    label: 'Paid' },
    void:    { key: 'void',    label: 'Void' },
  };

  function invoiceStatus(inv) {
    if (inv.status === 'void') return STATUS.void;
    if (inv.status === 'draft') return STATUS.draft;
    const t = calcTotals(inv);
    if (inv.status === 'paid' || (t.total > 0 && t.balance <= 0)) return STATUS.paid;
    const overdue = inv.dueDate && inv.dueDate < todayISO();
    if (overdue) return STATUS.overdue;
    if (t.paid > 0) return STATUS.partial;
    return STATUS.sent;
  }

  /* ----------------------------- Numbering ----------------------------- */

  function formatNumber(n) {
    const s = db.settings.invoice;
    const parts = [];
    if (s.prefix) parts.push(s.prefix);
    if (s.includeYear) parts.push(new Date().getFullYear());
    parts.push(String(n).padStart(Number(s.padding) || 1, '0'));
    return parts.join('-');
  }

  function nextInvoiceNumber() {
    let n = Number(db.settings.invoice.nextNumber) || 1;
    // Skip numbers already used
    while (db.invoices.some((i) => i.number === formatNumber(n))) n++;
    return formatNumber(n);
  }

  function consumeNumber(number) {
    let n = Number(db.settings.invoice.nextNumber) || 1;
    while (formatNumber(n) !== number && db.invoices.some((i) => i.number === formatNumber(n))) n++;
    if (formatNumber(n) === number) db.settings.invoice.nextNumber = n + 1;
  }

  /* ------------------------------ Factories ----------------------------- */

  function emptyClientSnapshot() {
    return { type: 'doctor', name: '', practice: '', email: '', phone: '', address: '' };
  }

  function newInvoice(opts) {
    const s = db.settings.invoice;
    const issue = todayISO();
    const inv = {
      id: null,
      number: nextInvoiceNumber(),
      status: 'draft',
      clientId: '',
      client: emptyClientSnapshot(),
      issueDate: issue,
      terms: s.defaultTerms,
      dueDate: s.defaultTerms === 'custom' ? addDays(issue, 15) : addDays(issue, s.defaultTerms),
      currency: s.defaultCurrency,
      reference: '',
      patientRef: '',
      items: [{ id: uid(), name: '', description: '', qty: 1, price: 0 }],
      discountType: 'percent',
      discountValue: 0,
      taxLabel: s.taxLabel,
      taxRate: num(s.defaultTaxRate),
      amountPaid: 0,
      paidDate: '',
      notes: s.notes,
      termsText: s.terms,
      showBank: true,
      createdAt: null,
      updatedAt: null,
    };
    if (opts && opts.clientId) {
      const c = db.clients.find((x) => x.id === opts.clientId);
      if (c) applyClient(inv, c);
    }
    return inv;
  }

  function applyClient(inv, c) {
    inv.clientId = c.id;
    inv.client = { type: c.type, name: c.name, practice: c.practice, email: c.email, phone: c.phone, address: c.address };
    if (c.currency && c.currency !== inv.currency) {
      inv.items.forEach((it) => { it.price = convert(it.price, inv.currency, c.currency); });
      inv.currency = c.currency;
    }
  }

  /* -------------------------------- CRUD -------------------------------- */

  function saveInvoice(inv) {
    const now = new Date().toISOString();
    const copy = JSON.parse(JSON.stringify(inv));
    copy.updatedAt = now;
    if (!copy.id) {
      copy.id = uid();
      copy.createdAt = now;
      consumeNumber(copy.number);
      db.invoices.push(copy);
    } else {
      const i = db.invoices.findIndex((x) => x.id === copy.id);
      if (i >= 0) db.invoices[i] = copy; else db.invoices.push(copy);
    }
    save();
    return copy;
  }

  function duplicateInvoice(id) {
    const src = db.invoices.find((x) => x.id === id);
    if (!src) return null;
    const inv = JSON.parse(JSON.stringify(src));
    const issue = todayISO();
    Object.assign(inv, {
      id: null, number: nextInvoiceNumber(), status: 'draft', issueDate: issue,
      dueDate: inv.terms === 'custom' ? addDays(issue, Math.max(daysBetween(src.issueDate, src.dueDate), 0)) : addDays(issue, inv.terms),
      amountPaid: 0, paidDate: '', createdAt: null, updatedAt: null,
    });
    inv.items.forEach((it) => { it.id = uid(); });
    return saveInvoice(inv);
  }

  function deleteInvoice(id) { db.invoices = db.invoices.filter((x) => x.id !== id); save(); }

  function saveClient(c) {
    if (!c.id) { c.id = uid(); c.createdAt = new Date().toISOString(); db.clients.push(c); }
    else { const i = db.clients.findIndex((x) => x.id === c.id); if (i >= 0) db.clients[i] = Object.assign(db.clients[i], c); }
    save();
    return c;
  }
  function deleteClient(id) { db.clients = db.clients.filter((x) => x.id !== id); save(); }

  function saveCatalogItem(item) {
    if (!item.id) { item.id = uid(); db.catalog.push(item); }
    else { const i = db.catalog.findIndex((x) => x.id === item.id); if (i >= 0) db.catalog[i] = item; }
    save();
    return item;
  }
  function deleteCatalogItem(id) { db.catalog = db.catalog.filter((x) => x.id !== id); save(); }

  function exportJSON() { return JSON.stringify(db, null, 2); }
  function importJSON(text) {
    const parsed = JSON.parse(text);
    if (!parsed || !parsed.settings || !Array.isArray(parsed.invoices)) throw new Error('This file is not a valid invoice-builder backup.');
    const d = defaultDB();
    db = mergeDefaults(parsed, { version: d.version, settings: d.settings, clients: [], catalog: [], invoices: [] });
    save();
  }
  function resetAll() { db = defaultDB(); save(); }

  window.Store = {
    CURRENCIES, TERMS, DEFAULT_RATES, STATUS,
    load, save, get db() { return db; },
    uid, num, round2, formatMoney, formatDate, todayISO, addDays, daysBetween, escapeHTML, convert,
    calcTotals, invoiceStatus, formatNumber, nextInvoiceNumber,
    newInvoice, applyClient, emptyClientSnapshot,
    saveInvoice, duplicateInvoice, deleteInvoice,
    saveClient, deleteClient, saveCatalogItem, deleteCatalogItem,
    exportJSON, importJSON, resetAll,
    pullFromServer, pushToServer, onSync, getTunnelUrl,
  };
})();
