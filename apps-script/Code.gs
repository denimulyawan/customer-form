/**
 * ============================================================================
 *  customer-form — Jembatan Google Spreadsheet
 * ============================================================================
 *  Skrip ini adalah "juru tulis" yang duduk di dalam spreadsheet.
 *  Aplikasi di Vercel tidak menulis langsung ke spreadsheet: ia menitipkan
 *  perintah ke skrip ini, dan skrip ini yang mencatat ke tab yang sesuai.
 *
 *  CARA PASANG (sekali saja, lihat docs/PANDUAN.md untuk versi bergambar):
 *    1. Buka spreadsheet -> menu Extensions -> Apps Script
 *    2. Hapus isi Code.gs, tempel SELURUH isi file ini
 *    3. Ganti nilai TOKEN di bawah dengan kata sandi karanganmu sendiri
 *    4. Klik Save, lalu pilih fungsi `setup` dan klik Run (izinkan akses)
 *    5. Klik Deploy -> New deployment -> Web app
 *         Execute as  : Me
 *         Who has access : Anyone
 *    6. Salin URL yang muncul -> tempel jadi BRIDGE_URL di Vercel
 *    7. Nilai TOKEN di atas -> tempel jadi BRIDGE_TOKEN di Vercel
 * ============================================================================
 */

/** Token rahasia. WAJIB diganti. Harus sama dengan BRIDGE_TOKEN di Vercel. */
var TOKEN = 'GANTI_DENGAN_TOKEN_RAHASIA_KARANGANMU';

/** Susunan kolom tiap tab. Urutan menentukan posisi kolom. */
var TABS = {
  akun: [
    'id',
    'nama_pelanggan',
    'username',
    'email_solarwinds',
    'email_duo',
    'pic',
    'tanggal_input',
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
  ],
};

/**
 * Jalankan fungsi ini SEKALI dari editor Apps Script.
 * Membuat tab `akun` dan `users` beserta baris judulnya, dan mengatur semua
 * kolom sebagai teks biasa supaya Sheets tidak mengubah tanggal/angka sendiri.
 */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dibuat = [];

  Object.keys(TABS).forEach(function (nama) {
    var sh = ss.getSheetByName(nama);
    if (!sh) {
      sh = ss.insertSheet(nama);
      dibuat.push(nama);
    }
    var head = TABS[nama];
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
    sh.setFrozenRows(1);
    // Seluruh kolom diformat sebagai teks: mencegah tanggal berubah format
    // dan username panjang berubah jadi notasi ilmiah.
    sh.getRange(1, 1, sh.getMaxRows(), head.length).setNumberFormat('@');
    sh.setColumnWidth(1, 260);
  });

  // Rapikan lebar kolom untuk tab akun.
  var akun = ss.getSheetByName('akun');
  if (akun) {
    [220, 150, 240, 240, 180, 110].forEach(function (w, i) {
      akun.setColumnWidth(i + 2, w);
    });
  }

  // Hapus tab bawaan kalau masih kosong dan bukan satu-satunya tab.
  ['Sheet1', 'Sheet 1'].forEach(function (n) {
    var d = ss.getSheetByName(n);
    if (d && ss.getSheets().length > 1) ss.deleteSheet(d);
  });

  Logger.log(
    'Setup selesai. Tab yang baru dibuat: ' +
      (dibuat.length ? dibuat.join(', ') : '(tidak ada, sudah lengkap)') +
      '. Tab siap dipakai: ' +
      Object.keys(TABS).join(', ')
  );
}

/** Terima perintah dari aplikasi (POST). */
function doPost(e) {
  var req;
  try {
    req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return balas({ ok: false, error: 'Isi permintaan bukan JSON yang valid.' });
  }

  if (!req.token || req.token !== TOKEN) {
    return balas({ ok: false, error: 'Token tidak cocok. Periksa BRIDGE_TOKEN.' });
  }

  // Kunci antrean: kalau dua orang menyimpan di saat yang sama, yang kedua
  // menunggu yang pertama selesai. Ini yang mencegah data saling menimpa.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return balas({ ok: false, error: 'Spreadsheet sedang sibuk. Coba lagi sebentar.' });
  }

  try {
    switch (req.action) {
      case 'ping':
        return balas({
          ok: true,
          data: {
            pesan: 'Jembatan aktif.',
            waktu: new Date().toISOString(),
            tab: Object.keys(TABS),
          },
        });
      case 'list':
        return balas(daftar(req.sheets));
      case 'append':
        return balas(tambahBaris(req.sheet, req.row));
      case 'update':
        return balas(ubahBaris(req.sheet, req.id, req.patch));
      case 'remove':
        return balas(hapusBaris(req.sheet, req.id));
      default:
        return balas({ ok: false, error: 'Aksi tidak dikenal: ' + req.action });
    }
  } catch (err) {
    return balas({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

/** Kalau alamat dibuka lewat browser, beri petunjuk singkat (tidak membocorkan apa pun). */
function doGet() {
  return balas({
    ok: true,
    data: { pesan: 'Jembatan aktif. Kirim perintah lewat POST, bukan GET.' },
  });
}

/* ============================ Bagian dalam ============================ */

function balas(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function ambilTab(nama) {
  if (!TABS[nama]) throw new Error('Tab tidak dikenal: ' + nama);
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nama);
  if (!sh) {
    throw new Error('Tab "' + nama + '" belum ada. Jalankan fungsi setup() dulu di editor Apps Script.');
  }
  return sh;
}

function bacaBaris(nama) {
  var sh = ambilTab(nama);
  var head = TABS[nama];
  var akhir = sh.getLastRow();
  if (akhir < 2) return [];

  // getDisplayValues() dipakai supaya format teks dihormati apa adanya.
  var nilai = sh.getRange(2, 1, akhir - 1, head.length).getDisplayValues();
  var hasil = [];
  nilai.forEach(function (r) {
    if (String(r[0]).trim() === '') return; // lewati baris kosong
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
  if (baris < 0) throw new Error('Data dengan id ' + id + ' tidak ditemukan.');

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
  if (baris < 0) throw new Error('Data dengan id ' + id + ' tidak ditemukan.');
  sh.deleteRow(baris);
  return { ok: true, data: { id: String(id) } };
}
