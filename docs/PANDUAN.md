# Panduan Pemasangan

Panduan ini ditulis untuk diikuti dari atas ke bawah. Sekali saja, sekitar
25–35 menit.

**Aplikasinya berbahasa Inggris**, karena itu semua tulisan di layar akan
berbahasa Inggris. Panduan ini tetap berbahasa Indonesia.

---

## Gambaran besar

```
Tim isi formulir  ->  Vercel (aplikasi)  ->  Apps Script (juru tulis)  ->  Google Spreadsheet
```

| Bagian | Perannya |
|---|---|
| Google Spreadsheet | Tempat data disimpan — dua tab: `customers` dan `users` |
| Google Apps Script | Juru tulis di dalam spreadsheet |
| GitHub | Tempat kodenya |
| Vercel | Yang menjalankan aplikasinya |

Yang perlu disiapkan: akun Google, akun GitHub, akun Vercel. Semuanya gratis.

---

## Bagian 1 — Spreadsheet dan Apps Script (10 menit)

### 1.1 Siapkan spreadsheet

Buat satu spreadsheet baru, beri nama apa saja. Jangan dibagikan ke siapa pun —
cukup kamu yang bisa membukanya.

### 1.2 Buka editor Apps Script

Di spreadsheet: menu **Extensions** → **Apps Script**. Tab baru akan terbuka
menampilkan file `Code.gs` yang isinya contoh kosong. Hapus semua isinya.

### 1.3 Tempel kodenya

Ambil isi file `apps-script/Code.gs` dari repo ini, lalu tempel seluruhnya ke
kotak kode tadi.

> **Penting:** kalau kamu memakai berkas siap tempel yang disiapkan admin
> (`SIAP-TEMPEL-AppsScript.gs`), pakai yang itu — di dalamnya token sudah terisi.
> Jangan pakai yang dari GitHub, karena tokennya masih tulisan contoh.

### 1.4 Ganti token

Cari baris ini di bagian atas:

```javascript
var TOKEN = 'GANTI_DENGAN_TOKEN_RAHASIA_KARANGANMU';
```

Ganti jadi kata sandi karanganmu sendiri, contoh:

```javascript
var TOKEN = 'kunci-akun-2026-x7k9';
```

**Catat token ini.** Nanti dipakai di Vercel sebagai `BRIDGE_TOKEN`, dan harus
sama persis.

> Tulisan contoh itu terpampang di repo publik. Kalau tidak diganti, siapa pun
> yang menemukan URL spreadsheet-mu bisa membaca dan mengubah datanya.

### 1.5 Simpan, lalu jalankan setup

1. **Ctrl+S**
2. Di dropdown fungsi di atas kotak kode, pilih **`setup`**
3. Klik **Run** ▶
4. Google minta izin: **Review permissions** → pilih akunmu → **Advanced** →
   **Go to (nama project) (unsafe)** → **Allow**

   Peringatan "unsafe" itu normal untuk skrip buatan sendiri yang belum
   diverifikasi Google. Skrip ini hanya menyentuh spreadsheet ini sendiri.

5. Buka lagi tab spreadsheet-nya. Sekarang ada dua tab baru: **`customers`** dan
   **`users`**, masing-masing sudah ada baris judulnya.

Kalau kamu memperbarui dari versi lama, tab `akun` akan otomatis diganti nama
menjadi **`old_akun_archive`** (datanya tidak dihapus, tapi tidak dipakai lagi).
Boleh kamu hapus sendiri kalau sudah tidak diperlukan.

### 1.5b Opsional tapi saya sarankan: cegah skrip tidur

Google menidurkan Apps Script yang tidak dipakai. Akibatnya, **permintaan pertama
setelah beberapa jam menganggur bisa memakan 10–30 detik.** Sisanya cepat.

Supaya itu tidak terjadi, jalankan fungsi **`keepWarmOn`** sekali saja (dari
dropdown fungsi yang sama, klik **Run**). Ini memasang pemicu yang menyentuh
spreadsheet setiap 5 menit sehingga skrip tetap bangun.

Kalau nanti tidak diinginkan, jalankan **`keepWarmOff`**.

### 1.6 Deploy jadi Web App

1. **Deploy** → **New deployment**
2. Klik **ikon gerigi** ⚙ di sebelah "Select type" → pilih **Web app**
3. Isi:
   - **Description**: bebas
   - **Execute as**: `Me (email kamu)`
   - **Who has access**: **`Anyone`**
4. Klik **Deploy**
5. **Salin Web app URL** yang muncul (berakhiran `/exec`)

Cek cepat: tempel URL itu di browser. Yang benar akan menampilkan tulisan:

```json
{"ok":true,"data":{"pesan":"Bridge is alive. Send commands with POST, not GET."}}
```

Kalau yang muncul halaman error atau halaman login Google, ulangi langkah 3 —
pilihan aksesnya harus **Anyone**, bukan "Anyone with Google account".

### 1.7 Kalau nanti mengubah Code.gs

Perubahan kode **tidak langsung berlaku**. Kamu harus menerbitkan ulang:

- **Cara paling gampang:** **Deploy** → **New deployment** → ulangi langkah 1.6.
  URL-nya akan berubah, jadi jangan lupa perbarui `BRIDGE_URL` di Vercel.
- **Cara mempertahankan URL lama:** **Deploy** → **Manage deployments** → klik
  ikon pensil pada deployment yang aktif → bagian **Version** pilih
  **New version** → **Deploy**.

---

## Bagian 2 — Kode di GitHub (5 menit)

Repo `customer-form` sudah ada. Kalau perlu memperbaruinya, unggah lewat halaman
GitHub (**Add file** → **Upload files**), atau lewat Git:

```bash
cd customer-form
git add .
git commit -m "perbarui aplikasi"
git push
```

Jangan pernah mengunggah `.env.local` — file itu sudah diblokir `.gitignore`.

---

## Bagian 3 — Vercel (10 menit)

1. Buka <https://vercel.com> → **Add New…** → **Project**
2. Pilih repo **customer-form** → **Import**
3. ⚠️ **Jangan klik Deploy dulu.** Buka **Environment Variables** dan isi tiga
   nilai berikut:

| Key | Value |
|---|---|
| `AUTH_SECRET` | kunci acak, lihat cara membuatnya di bawah |
| `BRIDGE_URL` | Web app URL dari langkah 1.6 (akhiran `/exec`) |
| `BRIDGE_TOKEN` | token dari langkah 1.4, harus sama persis |

Untuk **Environment**, biarkan pilihan bawaan (Production + Preview +
Development).

**Membuat `AUTH_SECRET`** — jalankan di komputer (butuh Node.js):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Kalau Vercel menyediakan kolom untuk menempel isi berkas `.env` sekaligus,
tempel seluruh isi `.env.local` — akan terisi otomatis.

4. **Framework Preset**: `Next.js` (terdeteksi otomatis). **Root Directory**:
   biarkan kosong.
5. Klik **Deploy**, tunggu 1–3 menit.

### Kalau terlanjur Deploy sebelum mengisi nilainya

Tidak masalah, tidak perlu dihapus:

1. Buka project → **Settings** → **Environment Variables**, isi ketiganya
2. Buka **Deployments** → pada deployment teratas klik **⋯** → **Redeploy**

---

## Bagian 4 — Masuk pertama kali (5 menit)

### Kalau spreadsheet masih kosong

Buka alamat situsmu. Halaman masuk akan menampilkan catatan bahwa belum ada akun,
beserta tautan **Create the first admin**. Klik tautan itu, isi username, nama
lengkap, dan password.

Halaman itu hanya hidup selama tab `users` benar-benar kosong. Begitu satu akun
ada, halaman itu mati sendiri dan tidak akan muncul lagi.

### Kalau akunnya sudah dibuatkan admin

Langsung masuk pakai username dan password yang diberikan. Kalau itu password
pemberian admin, aplikasi akan **memaksa kamu menggantinya dulu** di halaman
tersendiri sebelum bisa memakai apa pun.

### Halaman yang tersedia

| Menu | Untuk siapa | Isinya |
|---|---|---|
| **Dashboard** | semua | Angka ringkasan + dua grafik |
| **Customer List** | semua | Daftar akun pelanggan, pencarian, filter, edit, hapus, export Excel |
| **User Management** | admin | Buat pengguna, setel ulang password, aktif/nonaktif |
| **My Account** | semua | Nama, telepon, email sendiri + ganti password |

---

## Bagian 5 — Kalau memperbarui dari versi lama

Versi lama memakai tab `akun` dengan kolom yang berbeda (nama pelanggan,
email SolarWinds, email Duo). Urutan memperbaruinya:

1. **Di spreadsheet**, tempel ulang `Code.gs` yang baru (atau berkas siap tempel
   yang diberikan admin), lalu **Ctrl+S**
2. Jalankan fungsi **`setup`** sekali lagi. Ini akan:
   - membuat tab `customers` yang baru
   - menambahkan kolom `full_name`, `phone`, `email` ke tab `users`
     (kolom lamanya tidak diubah, jadi akun yang sudah ada tetap aman)
   - mengganti nama tab `akun` menjadi `old_akun_archive`
3. **Deploy → New deployment** dan salin URL barunya
4. Di Vercel: perbarui `BRIDGE_URL` dengan URL baru → **Deployments** →
   **Redeploy**
5. Masuk seperti biasa. Data pelanggan lama ada di tab `old_akun_archive` dan
   perlu dimasukkan ulang lewat aplikasi kalau masih diperlukan.

---

## Bagian 6 — Pemakaian sehari-hari

### Menambah akun pelanggan

**Customer List** → **+ Add Account**. Isi nama perusahaan, CID, username akun,
pilih Account Manager, dan isi data PIC kalau ada.

Tanggal dicatat otomatis oleh aplikasi dan **tidak ditampilkan di tabel** — tapi
ikut terunduh di file Excel, dan dipakai untuk grafik "Accounts Added per Month".

Username akun pelanggan **boleh kembar** — tidak ada pemeriksaan keunikan.

### Account Manager

Account Manager dipilih dari daftar pengguna aplikasi, bukan diketik bebas.
Jadi kalau nomor telepon atau email seseorang berubah:

1. **User Management** (kalau admin) atau **My Account** untuk mengubah datanya
2. Semua catatan pelanggan miliknya otomatis menampilkan data terbaru

Supaya nama orang muncul (bukan sekadar username), isi kolom **Full name** di
**My Account**.

### Export Excel

Di **Customer List**, klik **⤓ Export Excel**. Yang terunduh adalah data sesuai
filter yang sedang aktif.

### Lupa password

Tidak ada tombol "lupa password" yang mengirim email — memang tidak ada layanan
email yang dipasang. Alurnya: minta admin membuka **User Management** → **Reset
password** pada baris akunmu. Kamu akan diminta menggantinya saat masuk.

---

## Bagian 7 — Mencoba di komputer sendiri (opsional)

```bash
cd customer-form
npm install
cp .env.example .env.local
# isi ketiga nilainya
npm run dev
```

Buka <http://localhost:3000>. Yang kamu lihat adalah data asli dari spreadsheet,
jadi hati-hati saat menambah atau menghapus.

---

## Bagian 8 — Perawatan

### Menambah kolom baru

Misalnya menambah kolom "Notes":

1. Di `apps-script/Code.gs`, tambahkan `'notes'` di akhir daftar kolom
   `customers`. **Tambahkan di akhir**, jangan di tengah, supaya data lama tidak
   bergeser.
2. Deploy ulang (lihat 1.7), lalu jalankan `setup` lagi
3. Di `lib/types.ts`, tambahkan `notes: string` pada tipe `Customer`
4. Di `components/CustomerForm.tsx`, tambahkan kolom isiannya
5. Push ke GitHub — Vercel deploy sendiri

### Keamanan

| Hal | Keadaan |
|---|---|
| Password pengguna | Hanya tersimpan sebagai hash scrypt. **Tidak ada yang bisa melihatnya, termasuk admin.** Lupa = harus disetel ulang |
| Sesi masuk | Berlaku 8 jam, lalu diminta masuk lagi |
| Akun dinonaktifkan | Langsung tidak bisa menyimpan apa pun |
| Salah password berulang | Dikunci sementara setelah 8 kali gagal |
| Token GitHub | Hapus setelah dipakai, di <https://github.com/settings/tokens> |

### Batas yang perlu diketahui

- **Kuota Google:** sekitar 60 permintaan per menit per akun. Untuk tim kecil,
  tidak akan tersentuh.
- **Kecepatan:** setiap halaman butuh 1–3 detik karena harus menanyakan ke
  spreadsheet. Halaman menampilkan indikator "Loading" selama menunggu.
- **Cache 30 detik:** supaya tidak membaca ulang spreadsheet di setiap halaman,
  skrip menyimpan salinan hasil bacaan selama 30 detik. Setiap kali aplikasi
  menyimpan data, salinan itu langsung dibuang. **Artinya: kalau kamu mengedit
  spreadsheet secara manual (bukan lewat aplikasi), perubahan itu butuh sampai
  30 detik untuk muncul di aplikasi.** Kalau perlu segera, jalankan fungsi
  `clearCache` di editor Apps Script.
- **Jumlah data:** nyaman sampai beberapa ribu baris. Kalau sudah puluhan ribu,
  saatnya pindah ke database sungguhan — struktur kodenya sudah dipisah di folder
  `lib/` supaya mudah diganti.

---

## Bagian 9 — Kalau ada masalah

| Gejala | Penyebab & solusi |
|---|---|
| **"Configuration is incomplete"** | Salah satu dari tiga nilai belum terisi di Vercel. Isi, lalu **Redeploy** |
| **"The bridge returned something unreadable"** | Web App Apps Script tidak di-set **Anyone**, atau URL-nya bukan yang berakhiran `/exec` |
| **"Token mismatch"** | `BRIDGE_TOKEN` di Vercel berbeda dengan `TOKEN` di `Code.gs`. Samakan, deploy ulang Apps Script, lalu redeploy Vercel |
| **"Tab customers does not exist yet"** | Fungsi `setup` belum dijalankan. Lihat 1.5 |
| **"Could not reach the spreadsheet bridge"** | `BRIDGE_URL` salah ketik, atau URL lama yang sudah tidak aktif |
| Tanggal di spreadsheet berubah jadi aneh | Jalankan `setup` sekali lagi — dia mengatur ulang semua kolom jadi format teks |
| Sudah ubah `Code.gs` tapi tidak ada efek | Terbitkan versi baru, lihat 1.7 |
| Terjebak di halaman "Choose your own password" | Kamu memang wajib menggantinya dulu. Isi password pemberian admin di kolom pertama, lalu password barumu |
| Halaman putih / error 500 | Vercel → **Deployments** → deployment terakhir → **Functions** untuk melihat pesan errornya |

### Kalau admin terakhir lupa passwordnya

Kalau masih ada admin lain yang aktif, minta dia menyetel ulang lewat **User
Management**.

Kalau tidak ada admin lain sama sekali:

1. Buka spreadsheet → tab **`users`**
2. Hapus **seluruh baris** di tab itu (baris judul di baris 1 jangan dihapus)
3. Buka `…/setup` di situsmu (contoh: `https://customer-form-xxxx.vercel.app/setup`)
4. Buat admin baru dari nol

Semua anggota tim harus dibuatkan akun login baru. Data pelanggan di tab
`customers` **tidak** terpengaruh.
