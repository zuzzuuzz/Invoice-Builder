/* ==========================================================================
   Vélourcare Ortho — Invoice document template (screen preview + print/PDF)
   ========================================================================== */
(function () {
  'use strict';
  const S = () => Store;

  function lines(text) {
    return S().escapeHTML(text || '').split(/\r?\n/).filter((l) => l.trim() !== '').join('<br>');
  }

  function getQrImageUri(bank) {
    if (bank && bank.qrImage) return bank.qrImage;
    const text = (bank && bank.paymentLink) || (bank && bank.iban) || (bank && bank.accountNumber);
    if (!text || typeof document === 'undefined') return null;
    try {
      if (window.QRCode) {
        const div = document.createElement('div');
        new QRCode(div, {
          text: text,
          width: 140,
          height: 140,
          colorDark: '#1E252B',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M,
        });
        const canvas = div.querySelector('canvas');
        if (canvas) return canvas.toDataURL('image/png');
        const img = div.querySelector('img');
        if (img && img.src) return img.src;
      }
    } catch (e) {}
    return null;
  }

  function renderInvoice(inv, settings) {
    const st = S().invoiceStatus(inv);
    const t = S().calcTotals(inv);
    const esc = S().escapeHTML;
    const money = (v) => S().formatMoney(v, inv.currency);
    const co = settings.company;
    const br = settings.branding;
    const bank = settings.bank || {};
    const logo = br.logo || 'assets/logo-emblem.png';
    const termsLabel = (S().TERMS.find((x) => x.value === String(inv.terms)) || {}).label || '';
    const c = inv.client || {};

    // Hide completely blank rows from the document
    const items = (inv.items || []).filter((it) => it.name || it.description || S().num(it.price));

    const itemRows = items.length
      ? items.map((it, i) => `
        <tr>
          <td class="c-idx">${String(i + 1).padStart(2, '0')}</td>
          <td class="c-desc">
            <div class="it-name">${esc(it.name) || '<span class="ph">Item</span>'}</div>
            ${it.description ? `<div class="it-desc">${lines(it.description)}</div>` : ''}
          </td>
          <td class="c-num">${S().num(it.qty).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
          <td class="c-num">${money(it.price)}</td>
          <td class="c-num c-amt">${money(S().num(it.qty) * S().num(it.price))}</td>
        </tr>`).join('')
      : `<tr><td colspan="5" class="empty-row">No line items yet</td></tr>`;

    const bankRows = [
      ['Account title', bank.accountName],
      ['Bank name', bank.bankName],
      ['Account number', bank.accountNumber],
      ['IBAN', bank.iban],
      ['SWIFT / BIC', bank.swift],
      ['Branch', bank.branch],
    ].filter(([, v]) => v && String(v).trim());

    const qrSrc = getQrImageUri(bank);
    const hasPayment = inv.showBank && (bankRows.length > 0 || bank.paymentLink || bank.other || qrSrc);

    const stamp = st.key === 'paid' ? '<div class="inv-stamp">Paid</div>'
      : st.key === 'void' ? '<div class="inv-stamp is-void">Void</div>' : '';

    const dueLine = st.key === 'paid'
      ? `<div class="due-amt">${money(t.total)}</div><div class="due-txt">Paid${inv.paidDate ? ' on ' + S().formatDate(inv.paidDate, 'long') : ''} · thank you</div>`
      : st.key === 'void'
        ? `<div class="due-amt">${money(0)}</div><div class="due-txt">This invoice has been voided</div>`
        : `<div class="due-amt">${money(t.balance)} <span class="due-cur">${esc(inv.currency)}</span></div><div class="due-txt">due ${S().formatDate(inv.dueDate, 'long')}</div>`;

    return `
<article class="inv paper-${esc(br.paper)}">
  ${stamp}
  <div class="inv-rule"></div>
  <header class="inv-head">
    <div class="inv-brand">
      <img class="inv-logo" src="${esc(logo)}" alt="${esc(co.name)}">
      ${br.showWordmark ? `<div class="inv-wordmark"><span class="wm1">VÉLOURCARE</span><span class="wm2">ORTHO</span></div>` : ''}
    </div>
    <div class="inv-title">
      <h1>Invoice</h1>
      <div class="inv-no">${esc(inv.number)}</div>
    </div>
  </header>

  <section class="inv-meta">
    <div class="inv-party">
      <div class="lbl">Billed to</div>
      ${c.name || c.practice ? `
        <div class="party-name">${esc(c.name || c.practice)}</div>
        ${c.name && c.practice ? `<div>${esc(c.practice)}</div>` : ''}
        ${c.address ? `<div>${lines(c.address)}</div>` : ''}
        ${c.email ? `<div>${esc(c.email)}</div>` : ''}
        ${c.phone ? `<div>${esc(c.phone)}</div>` : ''}
      ` : '<div class="ph">Client name</div>'}
    </div>
    <dl class="inv-facts">
      <div><dt>Invoice no.</dt><dd>${esc(inv.number)}</dd></div>
      <div><dt>Issue date</dt><dd>${S().formatDate(inv.issueDate)}</dd></div>
      <div><dt>Due date</dt><dd>${S().formatDate(inv.dueDate)}</dd></div>
      ${termsLabel && inv.terms !== 'custom' ? `<div><dt>Terms</dt><dd>${esc(termsLabel)}</dd></div>` : ''}
      ${inv.reference ? `<div><dt>Reference / PO</dt><dd>${esc(inv.reference)}</dd></div>` : ''}
      ${inv.patientRef ? `<div><dt>Patient / Case</dt><dd>${esc(inv.patientRef)}</dd></div>` : ''}
    </dl>
  </section>

  <section class="inv-due">${dueLine}</section>

  <table class="inv-items">
    <thead>
      <tr><th class="c-idx">#</th><th class="c-desc">Description</th><th class="c-num">Qty</th><th class="c-num">Unit price</th><th class="c-num">Amount</th></tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <section class="inv-summary">
    <div class="inv-notes">
      ${inv.notes ? `<div class="lbl">Notes</div><p>${lines(inv.notes)}</p>` : ''}
    </div>
    <table class="inv-totals">
      <tr><td>Subtotal</td><td>${money(t.subtotal)}</td></tr>
      ${t.discount > 0 ? `<tr><td>Discount${inv.discountType === 'percent' ? ` (${S().num(inv.discountValue)}%)` : ''}</td><td>−${money(t.discount)}</td></tr>` : ''}
      ${S().num(inv.taxRate) > 0 ? `<tr><td>${esc(inv.taxLabel || 'Tax')} (${S().num(inv.taxRate)}%)</td><td>${money(t.tax)}</td></tr>` : ''}
      <tr class="tot"><td>Total</td><td>${money(t.total)}</td></tr>
      ${t.paid > 0 ? `<tr><td>Amount paid</td><td>−${money(t.paid)}</td></tr>` : ''}
      <tr class="bal"><td>Amount due <span>(${esc(inv.currency)})</span></td><td>${money(st.key === 'void' ? 0 : t.balance)}</td></tr>
    </table>
  </section>

  ${hasPayment ? `
  <section class="inv-pay">
    <div class="lbl">Bank &amp; Payment Details</div>
    <div class="inv-pay-wrapper">
      <div class="inv-pay-details">
        ${bankRows.length ? `
        <div class="pay-grid">
          ${bankRows.map(([k, v]) => `<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}
        </div>` : ''}
        ${bank.paymentLink ? `<div class="pay-link">Online payment link: <strong>${esc(bank.paymentLink)}</strong></div>` : ''}
        ${bank.other ? `<div class="pay-other">${lines(bank.other)}</div>` : ''}
        <div class="pay-ref">Please use invoice no. <strong>${esc(inv.number)}</strong> as payment reference.</div>
      </div>
      ${qrSrc ? `
      <div class="inv-pay-qr">
        <img class="pay-qr-img" src="${esc(qrSrc)}" alt="Payment QR Code">
        <span class="qr-label">Scan to Pay</span>
      </div>` : ''}
    </div>
  </section>` : ''}

  ${inv.termsText ? `<section class="inv-terms"><div class="lbl">Terms &amp; conditions</div><p>${lines(inv.termsText)}</p></section>` : ''}

  <footer class="inv-foot">
    <span>${esc(co.name)}</span>
    ${co.website ? `<span>${esc(co.website)}</span>` : ''}
    ${co.email ? `<span>${esc(co.email)}</span>` : ''}
    ${co.phone ? `<span>${esc(co.phone)}</span>` : ''}
  </footer>
</article>`;
  }

  window.InvoiceTemplate = { render: renderInvoice };
})();
