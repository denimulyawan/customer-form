/**
 * ============================================================================
 *  customer-form — Google Spreadsheet bridge
 * ============================================================================
 *  This script is the "scribe" that lives inside the spreadsheet.
 *  The app on Vercel never writes to the sheet directly: it sends commands to
 *  this script, and the script records them into the right tab.
 *
 *  SETUP (once only — see docs/PANDUAN.md for the illustrated version):
 *    1. Open the spreadsheet -> Extensions menu -> Apps Script
 *    2. Clear Code.gs, paste the whole contents of this file
 *    3. Replace TOKEN below with your own secret
 *    4. Save, then pick the `setup` function and Run it (grant access)
 *    5. Deploy -> New deployment -> Web app
 *         Execute as     : Me
 *         Who has access : Anyone
 *    6. Copy the URL -> paste it as BRIDGE_URL in Vercel
 *    7. The TOKEN value -> paste it as BRIDGE_TOKEN in Vercel
 * ============================================================================
 */

/** Secret token. MUST be changed. Must match BRIDGE_TOKEN in Vercel. */
var TOKEN = 'GANTI_DENGAN_TOKEN_RAHASIA_KARANGANMU';

/**
 * Column layout for each tab. The order defines the column positions.
 *
 * NOTE: columns for `users` are only ever APPENDED to, never reordered, so an
 * existing spreadsheet keeps working after an update.
 *
 * Stored values are intentionally language-neutral for the app: role is
 * `admin`/`operator`, status is `aktif`/`nonaktif`, and must_change_password
 * is `ya`/`tidak`. The app shows English labels for them.
 */
var TABS = {
  customers: [
    'id',
    'company_name',
    'cid',
    'account_username',
    'pic_name',
    'pic_phone',
    'pic_email',
    'am_username',
    'created_at',
  ],
  users: [
    'id',
    'username',
    'username_lower',
    'password_hash',
    'role',
    'status',
    'must_change_password',
    'created_at',
    'last_login',
    'full_name',
    'phone',
    'email',
  ],
};

/**
 * Run this ONCE from the Apps Script editor.
 * Creates the `customers` and `users` tabs with their header rows, and forces
 * every column to plain text so Sheets stops reformatting dates and numbers.
 */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dibuat = [];

  // The old `akun` tab from the previous version is archived, not deleted.
  var lama = ss.getSheetByName('akun');
  if (lama && !ss.getSheetByName('old_akun_archive')) {
    lama.setName('old_akun_archive');
    Logger.log('Tab "akun" renamed to "old_akun_archive" (old data left intact).');
  }

  Object.keys(TABS).forEach(function (nama) {
    var sh = ss.getSheetByName(nama);
    if (!sh) {
      sh = ss.insertSheet(nama);
      dibuat.push(nama);
    }
    var head = TABS[nama];
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), head.length).setNumberFormat('@');
    sh.setColumnWidth(1, 260);
  });

  var customers = ss.getSheetByName('customers');
  if (customers) {
    [200, 150, 170, 160, 140, 220, 160, 150].forEach(function (w, i) {
      customers.setColumnWidth(i + 2, w);
    });
  }

  var users = ss.getSheetByName('users');
  if (users) {
    [200, 140, 180, 150, 120, 150, 200, 150, 150].forEach(function (w, i) {
      users.setColumnWidth(i + 2, w);
    });
  }

  ['Sheet1', 'Sheet 1'].forEach(function (n) {
    var d = ss.getSheetByName(n);
    if (d && ss.getSheets().length > 1) ss.deleteSheet(d);
  });

  Logger.log(
    'Setup finished. New tabs: ' +
      (dibuat.length ? dibuat.join(', ') : '(none, already complete)') +
      '. Tabs ready: ' +
      Object.keys(TABS).join(', ')
  );
}

/** Receives commands from the app (POST). */
function doPost(e) {
  var req;
  try {
    req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return balas({ ok: false, error: 'Request body is not valid JSON.' });
  }

  if (!req.token || req.token !== TOKEN) {
    return balas({ ok: false, error: 'Token mismatch. Check BRIDGE_TOKEN.' });
  }

  // Reads do NOT take the queue lock. Only writes do. Otherwise several people
  // browsing at once would queue behind each other for no reason.
  if (req.action === 'ping') {
    return balas({
      ok: true,
      data: {
        pesan: 'Bridge is alive.',
        waktu: new Date().toISOString(),
        tab: Object.keys(TABS),
      },
    });
  }

  if (req.action === 'list') {
    try {
      return balas(daftar(req.sheets));
    } catch (err) {
      return balas({ ok: false, error: String(err && err.message ? err.message : err) });
    }
  }

  // Queue lock: if two people save at the same moment, the second waits for
  // the first to finish. This is what stops records from overwriting each
  // other.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(12000);
  } catch (err) {
    return balas({ ok: false, error: 'The spreadsheet is busy. Please retry shortly.' });
  }

  try {
    switch (req.action) {
      case 'append':
        return balas(tambahBaris(req.sheet, req.row));
      case 'update':
        return balas(ubahBaris(req.sheet, req.id, req.patch));
      case 'remove':
        return balas(hapusBaris(req.sheet, req.id));
      default:
        return balas({ ok: false, error: 'Unknown action: ' + req.action });
    }
  } catch (err) {
    return balas({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

/** Opening the URL in a browser gives a short hint and leaks nothing. */
function doGet() {
  return balas({
    ok: true,
    data: { pesan: 'Bridge is alive. Send commands with POST, not GET.' },
  });
}

/* ============================== Internals ============================== */

function balas(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function ambilTab(nama) {
  if (!TABS[nama]) throw new Error('Unknown tab: ' + nama);
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nama);
  if (!sh) {
    throw new Error(
      'Tab "' + nama + '" does not exist yet. Run setup() in the Apps Script editor first.'
    );
  }
  return sh;
}

function bacaBaris(nama) {
  var sh = ambilTab(nama);
  var head = TABS[nama];
  var akhir = sh.getLastRow();
  if (akhir < 2) return [];

  // getDisplayValues() keeps the stored plain-text formatting as-is.
  var nilai = sh.getRange(2, 1, akhir - 1, head.length).getDisplayValues();
  var hasil = [];
  nilai.forEach(function (r) {
    if (String(r[0]).trim() === '') return; // skip blank rows
    var obj = {};
    head.forEach(function (h, i) {
      obj[h] = r[i];
    });
    hasil.push(obj);
  });
  return hasil;
}

function daftar(namaTab) {
  var arr = namaTab && namaTab.length ? namaTab : Object.keys(TABS);
  var data = {};
  arr.forEach(function (n) {
    data[n] = bacaBaris(n);
  });
  return { ok: true, data: data };
}

function cariBaris(sh, id) {
  var akhir = sh.getLastRow();
  if (akhir < 2) return -1;
  var ids = sh.getRange(2, 1, akhir - 1, 1).getDisplayValues();
  var target = String(id).trim();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === target) return i + 2;
  }
  return -1;
}

function tambahBaris(nama, row) {
  var sh = ambilTab(nama);
  var head = TABS[nama];
  var id = row && row.id ? String(row.id) : Utilities.getUuid();

  var nilai = head.map(function (h) {
    if (h === 'id') return id;
    return row && row[h] != null ? String(row[h]) : '';
  });

  sh.appendRow(nilai);
  return { ok: true, data: { id: id } };
}

function ubahBaris(nama, id, patch) {
  var sh = ambilTab(nama);
  var head = TABS[nama];
  var baris = cariBaris(sh, id);
  if (baris < 0) throw new Error('Record with id ' + id + ' was not found.');

  var sekarang = sh.getRange(baris, 1, 1, head.length).getValues()[0];
  head.forEach(function (h, i) {
    if (h === 'id') return;
    if (patch && Object.prototype.hasOwnProperty.call(patch, h)) {
      sekarang[i] = patch[h] == null ? '' : String(patch[h]);
    }
  });

  sh.getRange(baris, 1, 1, head.length).setValues([sekarang]);
  return { ok: true, data: { id: String(id) } };
}

function hapusBaris(nama, id) {
  var sh = ambilTab(nama);
  var baris = cariBaris(sh, id);
  if (baris < 0) throw new Error('Record with id ' + id + ' was not found.');
  sh.deleteRow(baris);
  return { ok: true, data: { id: String(id) } };
}
