// ============================================================
//  MNK Marine Consultants — Quote request → email via Resend
//  Cloudflare Pages Function.  Route: POST /send-quote
//  (file lives at /functions/send-quote.js → maps to /send-quote)
//
//  Reads the API key from context.env.RESEND_API_KEY — never hardcoded.
//  • Key set   → sends the quote to mnkmarineconsultants1@gmail.com.
//  • Key unset → DORMANT: responds 503 and sends nothing
//                (no Resend account needed yet; the website form
//                 detects this and falls back to a mailto link).
//
//  Inputs are HTML-escaped before being placed in the email body,
//  and any line breaks are stripped from the subject line.
// ============================================================

var RECIPIENT = 'mnkmarineconsultants1@gmail.com';

// IMPORTANT: Resend requires a verified sender domain. Until the
// owner verifies one, 'onboarding@resend.dev' works but only
// delivers to the Resend account owner's own address. After
// verifying e.g. mnkmarine.com, change this to
// 'MNK Marine <quotes@mnkmarine.com>'.
var FROM = 'MNK Marine Website <onboarding@resend.dev>';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}
// collapse all CR/LF (and trim) — used for the subject and single-line fields
function oneLine(s) { return String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim(); }

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

// CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function onRequestPost(context) {
  var request = context.request;

  var data;
  try { data = await request.json(); }
  catch (e) { return json(400, { error: 'bad_json' }); }

  // Spam honeypot: real users never fill this hidden field.
  if (data && data.company_website) return json(200, { ok: true });

  var f = {
    services: String(data.services == null ? '' : data.services).slice(0, 6000),
    dateFrom: oneLine(data.dateFrom).slice(0, 40),
    dateTo:   oneLine(data.dateTo).slice(0, 40),
    location: oneLine(data.location).slice(0, 200),
    name:     oneLine(data.name).slice(0, 120),
    company:  oneLine(data.company).slice(0, 160),
    email:    oneLine(data.email).slice(0, 160),
    phone:    oneLine(data.phone).slice(0, 60)
  };

  var KEY = context.env.RESEND_API_KEY;
  if (!KEY) {
    // Built but not yet activated.
    return json(503, { error: 'dormant', message: 'Quote endpoint is not yet activated (RESEND_API_KEY unset).' });
  }

  var subject = oneLine('Quote Request — MNK Marine Consultants — ' + (f.name || 'New enquiry'));

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#16243c">' +
    '<h2 style="color:#0a1e3a;margin:0 0 12px">Quote Request — MNK Marine Consultants</h2>' +
    '<table cellpadding="6" style="border-collapse:collapse">' +
    '<tr><td style="color:#5b6b85"><b>Services Required</b></td><td>' + esc(f.services).replace(/\n/g, '<br>') + '</td></tr>' +
    '<tr><td style="color:#5b6b85"><b>Date Range</b></td><td>' + esc(f.dateFrom) + ' &nbsp;to&nbsp; ' + esc(f.dateTo) + '</td></tr>' +
    '<tr><td style="color:#5b6b85"><b>Location</b></td><td>' + esc(f.location) + '</td></tr>' +
    '<tr><td style="color:#5b6b85"><b>Name</b></td><td>' + esc(f.name) + '</td></tr>' +
    '<tr><td style="color:#5b6b85"><b>Company</b></td><td>' + esc(f.company) + '</td></tr>' +
    '<tr><td style="color:#5b6b85"><b>Email</b></td><td>' + esc(f.email) + '</td></tr>' +
    '<tr><td style="color:#5b6b85"><b>Phone</b></td><td>' + esc(f.phone) + '</td></tr>' +
    '</table></div>';

  try {
    var r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [RECIPIENT],
        reply_to: f.email || undefined,
        subject: subject,
        html: html
      })
    });
    if (!r.ok) {
      var detail = await r.text();
      return json(502, { error: 'send_failed', detail: String(detail).slice(0, 300) });
    }
    return json(200, { ok: true });
  } catch (err) {
    return json(502, { error: 'send_failed', detail: String(err).slice(0, 300) });
  }
}
