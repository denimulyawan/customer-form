# Panduan Pemasangan

Panduan ini ditulis untuk diikuti dari atas ke bawah. Perkiraan waktu: **25–35 menit**,
sekali saja.

Yang perlu disiapkan:

- Akun Google (Gmail biasa, tidak perlu Google Workspace)
- Akun GitHub — gratis
- Akun Vercel — gratis, daftar pakai akun GitHub
- Node.js di komputer *(hanya kalau mau mencoba dulu di komputer sendiri)*

---

## Bagian 1 — Menyiapkan Google Spreadsheet (10 menit)

### 1.1 Buat spreadsheet baru

1. Buka <https://sheets.new>
2. Ganti namanya menjadi **Database Akun Pelanggan** (klik "Untitled spreadsheet" di kiri atas)

Jangan bagikan spreadsheet ini ke siapa pun. Cukup kamu yang bisa membukanya.

### 1.2 Buka editor Apps Script

Di spreadsheet, klik menu **Extensions** → **Apps Script**.

Tab baru akan terbuka menampilkan file `Code.gs` yang isinya kira-kira begini:

```javascript
function myFunction() {
}
```

Hapus semua isinya.

### 1.3 Tempel skrip jembatan

1. Buka file `apps-script/Code.gs` dari repo ini
2. Salin **seluruh** isinya
3. Tempel ke editor Apps Script yang sudah dikosongkan tadi

### 1.4 Ganti token rahasia

Di baris paling atas kode, cari baris ini:

```javascript
var TOKEN = 'GANTI_DENGAN_TOKEN_RAHASIA_KARANGANMU';
```

Ganti bagian di dalam tanda kutip dengan kata sandi karanganmu sendiri. Contoh:

```javascript
var TOKEN = 'kunci-rahasia-akun-2026-x7k9';
```

> Buat yang sulit ditebak dan **catat**, karena nanti harus ditulis sama persis di Vercel.
> Jangan pakai spasi.

### 1.5 Simpan, lalu jalankan setup

1. Klik ikon **Save** (disket) atau tekan `Ctrl+S`
2. Di daftar fungsi di atas editor, ganti `myFunction` menjadi `setup`
3. Klik **Run**
4. Google akan meminta izin. Klik **Review permissions** → pilih akunmu →
   klik **Advanced** → **Go to (nama project) (unsafe)** → **Allow**

   > Peringatan "unsafe" itu normal untuk skrip buatan sendiri yang belum
   > diverifikasi Google. Skrip ini hanya menyentuh spreadsheet ini sendiri.

5. Buka tab spreadsheet-nya lagi. Sekarang harusnya ada dua tab baru: **akun** dan
   **users**, masing-masing sudah ada baris judulnya.

Kalau tab `Sheet1` masih ada dan kosong, hapus manual saja.

### 1.6 Deploy jadi Web App

Kembali ke tab Apps Script:

1. Klik **Deploy** → **New deployment**
2. Klik ikon gerigi di sebelah "Select type" → pilih **Web app**
3. Isi:
   - **Description**: `jembatan customer-form`
   - **Execute as**: `Me (email kamu)`
   - **Who has access**: **`Anyone`**
4. Klik **Deploy**
5. Salin **Web app URL** yang muncul

URL-nya panjang dan berakhiran `/exec`, contohnya:

```
https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
```

> **Penting:** pilihannya harus **Anyone**, bukan "Anyone with Google account".
> Aplikasi di Vercel mengaksesnya dari server, bukan dari browser, jadi tidak punya
> identitas Google. Yang menjaga keamanan adalah token rahasia di langkah 1.4.

**Cek koneksi:** tempel URL itu di browser. Kalau muncul tulisan
`{"ok":true,"data":{"pesan":"Jembatan aktif. Kirim perintah lewat POST, bukan GET."}}`,
berarti sudah benar.

### 1.7 Kalau nanti mengubah Code.gs

Setiap kali kamu mengubah isi `Code.gs` (misalnya menambah kolom), perubahan itu
**tidak langsung berlaku**. Kamu harus:

1. Klik **Deploy** → **Manage deployments**
2. Klik ikon pensil pada deployment yang aktif
3. Di bagian **Version**, pilih **New version**
4. Klik **Deploy**

URL-nya tetap sama, tidak perlu diubah di Vercel.

---

## Bagian 2 — Menaruh kode di GitHub (5 menit)

Repo `customer-form` sudah ada. Kalau perlu memperbarui isinya, dua cara:

**Cara A — unggah lewat halaman GitHub**

1. Buka repo di GitHub, klik **Add file** → **Upload files**
2. Seret semua file dan folder dari folder `customer-form` di komputermu
   (kecuali `node_modules` dan `.next` — keduanya tidak perlu)
3. Tulis pesan commit, klik **Commit changes**

**Cara B — lewat Git di komputer**

```bash
cd customer-form
git init
git add .
git commit -m "customer-form: aplikasi pencatatan akun pelanggan"
git branch -M main
git remote add origin https://github.com/denimulyawan/customer-form.git
git push -u origin main
```

---

## Bagian 3 — Memasang di Vercel (10 menit)

### 3.1 Daftar / masuk

1. Buka <https://vercel.com>
2. Klik **Sign Up** → **Continue with GitHub** → izinkan
3. Kalau diminta memilih paket, pilih **Hobby** (gratis)

### 3.2 Import repo

1. Di dashboard Vercel, klik **Add New…** → **Project**
2. Cari repo **customer-form** → klik **Import**
3. Di bagian **Framework Preset**, biarkan **Next.js** (Vercel sudah mendeteksi
   sendiri)
4. **Jangan klik Deploy dulu** — isi dulu nilai rahasianya di langkah berikut

### 3.3 Isi tiga nilai rahasia

Di halaman yang sama, buka bagian **Environment Variables**, lalu tambahkan tiga
variabel berikut satu per satu.

**a. `AUTH_SECRET`** — kunci acak untuk menandatangani sesi login.

Buat nilainya dengan perintah ini di komputer (butuh Node.js):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Hasilnya berupa deretan huruf dan angka, contoh:
`kR7mQ2xP9vL4nB8sT1wY6zA3cD5eF0gH2jK4mN7pQ1r`

Salin hasilnya sebagai nilai `AUTH_SECRET`.

> Tidak punya Node.js? Ketik saja kalimat acak yang panjang, minimal 32 karakter,
> campur huruf besar, huruf kecil, dan angka.

**b. `BRIDGE_URL`** — alamat Web App dari langkah 1.6 (yang berakhiran `/exec`).

**c. `BRIDGE_TOKEN`** — token rahasia dari langkah 1.4. **Harus sama persis.**

Untuk setiap variabel: isi **Key** dan **Value**, sisakan **Environment** ke pilihan
default (Production, Preview, Development), lalu klik **Save**.

### 3.4 Deploy

1. Klik **Deploy**
2. Tunggu 1–3 menit sampai muncul layar perayaan "Congratulations"
3. Klik **Continue to Dashboard**, lalu klik **Visit** untuk membuka aplikasinya

---

## Bagian 4 — Pemakaian pertama (5 menit)

### 4.1 Buat admin pertama

Saat aplikasi dibuka pertama kali dan spreadsheet-nya belum punya akun login, kamu
otomatis diarahkan ke halaman **Buat admin pertama**.

1. Isi username (contoh: `deni`), password, dan ulangi passwordnya
2. Klik **Buat admin & mulai**
3. Halaman itu akan langsung mati sendiri setelah admin pertama dibuat

### 4.2 Masuk

Masukkan username dan password tadi. Kamu akan mendarat di **Dashboard**.

### 4.3 Tambahkan anggota tim

1. Klik menu **Pengguna** di sidebar kiri
2. Isi **Username login**, pilih **Peran**:
   - **Operator** — hanya bisa melihat, menambah, mengubah, menghapus data akun
   - **Admin** — semuanya, termasuk membuat & menonaktifkan akun login
3. Isi **Password awal** (minimal 8 karakter), klik **Buat akun**
4. Sampaikan username dan password awal itu ke yang bersangkutan

Saat orang itu login pertama kali, aplikasi akan memaksanya mengganti password
sebelum bisa memakai apa pun.

### 4.4 Mulai mengisi data

Klik **+ Tambah Akun**, isi kolomnya, klik **Simpan**. Tanggal terisi otomatis dengan
tanggal hari ini dan bisa diubah kalau kamu sedang memasukkan data lama.

### 4.5 Mengubah & menghapus

- **Mengubah**: buka **Daftar Akun**, klik **Edit** pada baris yang dituju
- **Menghapus**: klik **Hapus**, lalu konfirmasi. Data **hilang permanen** dari
  spreadsheet dan tidak bisa dikembalikan.

### 4.6 Export ke Excel

Di halaman **Daftar Akun**, klik **⤓ Export Excel**. Yang terunduh adalah data sesuai
filter yang sedang aktif — kalau kamu menyaring PIC tertentu, hanya data PIC itu yang
ikut terunduh.

---

## Bagian 5 — Mencoba di komputer sendiri (opsional)

Berguna kalau mau mengubah tampilan dan ingin melihat hasilnya lebih cepat.

```bash
cd customer-form
npm install
cp .env.example .env.local
```

Buka `.env.local` dan isi ketiga nilainya (sama seperti di Vercel), lalu:

```bash
npm run dev
```

Buka <http://localhost:3000>. Data yang kamu lihat adalah data asli dari spreadsheet,
jadi hati-hati saat menambah atau menghapus.

---

## Bagian 6 — Perawatan

### Menambah kolom baru

Misalnya mau menambah kolom "Keterangan":

1. Di `apps-script/Code.gs`, tambahkan `'keterangan'` di akhir daftar kolom `akun`
2. Deploy ulang versi baru (lihat 1.7)
3. Di spreadsheet, tambahkan judul kolomnya di tab `akun`
4. Di `lib/types.ts`, tambahkan `keterangan: string` pada tipe `Akun` dan
   `LABEL_AKUN`
5. Di `components/FormAkun.tsx`, tambahkan kolom isiannya
6. Push ke GitHub — Vercel akan deploy sendiri

### Tentang keamanan

| Hal | Keadaan |
|---|---|
| Password user | Hanya tersimpan sebagai hash. **Tidak ada yang bisa melihatnya, termasuk kamu.** Lupa password = admin harus menyetel ulang |
| Sesi login | Berlaku 8 jam, lalu minta login lagi |
| Akun dinonaktifkan | Langsung tidak bisa menyimpan apa pun. Halaman masih bisa dibuka sampai sesinya habis (maksimal 8 jam) |
| Salah password berulang | Dikunci sementara setelah 8 kali gagal |
| Token GitHub | **Hapus token yang pernah kamu kirim lewat chat** di <https://github.com/settings/tokens> |

### Batas yang perlu diketahui

Aplikasi ini memakai Google Sheets sebagai database. Batasnya:

- **Kuota Google:** sekitar 60 permintaan per menit per akun. Untuk tim kecil, tidak
  akan pernah tersentuh.
- **Kecepatan:** setiap halaman butuh 0,5–1,5 detik karena harus menanyakan ke
  spreadsheet. Halaman menampilkan indikator "Memuat data" selama menunggu.
- **Jumlah data:** nyaman sampai beberapa ribu baris. Kalau sudah puluhan ribu,
  saatnya pindah ke database sungguhan (Supabase/Postgres) — struktur kodenya sudah
  dipisah di folder `lib/` supaya mudah diganti.

---

## Bagian 7 — Kalau ada masalah

| Gejala | Penyebab & solusi |
|---|---|
| Muncul tulisan **"Konfigurasi belum lengkap"** | Salah satu dari tiga nilai rahasia belum terisi di Vercel. Isi, lalu **Redeploy** |
| **"Jawaban dari jembatan tidak bisa dibaca"** | Web App Apps Script tidak di-set **Anyone**, atau URL-nya bukan yang berakhiran `/exec` |
| **"Token tidak cocok"** | Nilai `BRIDGE_TOKEN` di Vercel berbeda dengan `TOKEN` di `Code.gs`. Samakan, lalu deploy ulang Apps Script **dan** redeploy Vercel |
| **"Tab akun belum ada"** | Fungsi `setup` belum dijalankan. Lihat 1.5 |
| **"Tidak bisa menghubungi jembatan spreadsheet"** | `BRIDGE_URL` salah ketik. Tempel ulang dari Apps Script |
| Tanggal di spreadsheet berubah jadi aneh | Jalankan fungsi `setup` sekali lagi — dia mengatur ulang semua kolom jadi format teks |
| Sudah ubah `Code.gs` tapi tidak ada efek | Deploy versi baru, lihat 1.7 |
| Halaman putih / error 500 | Buka Vercel → **Deployments** → klik deployment terakhir → **Functions** untuk melihat pesan errornya |
| Lupa password, dan tidak ada admin lain yang bisa mereset | Lihat bagian di bawah tabel ini |

### Kalau admin terakhir lupa passwordnya

Kalau masih ada admin lain yang aktif, minta dia menyetel ulang passwordmu lewat menu
**Pengguna** — selesai.

Kalau tidak ada admin lain sama sekali, terpaksa dibuat ulang:

1. Buka spreadsheet → tab **`users`**
2. Hapus **seluruh baris** di tab itu (baris judul di baris 1 jangan dihapus)
3. Buka aplikasi → buka alamat `/setup` di belakangnya
   (contoh: `https://customer-form-xxxx.vercel.app/setup`)
4. Buat admin baru dari nol

> Konsekuensinya semua anggota tim harus dibuatkan akun login baru, karena daftar
> akun login ikut terhapus. Data pelanggan di tab `akun` **tidak** terpengaruh.
