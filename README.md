# customer-form

Aplikasi web internal untuk mencatat akun pelanggan — **username, email SolarWinds,
email Duo, nama pelanggan, PIC, dan tanggal input**. Pengganti Google Form, dengan
tampilan dashboard.

> 📖 **Panduan pemasangan langkah demi langkah (Bahasa Indonesia):
> [docs/PANDUAN.md](docs/PANDUAN.md)**

## Cara kerjanya

```
Tim isi form  ->  Vercel (aplikasi)  ->  Apps Script (juru tulis)  ->  Google Spreadsheet
```

Tim hanya memakai aplikasi. Spreadsheet hanya dibuka oleh admin.

| Bagian | Perannya |
|---|---|
| Google Spreadsheet | Tempat data disimpan — 2 tab: `akun` dan `users` |
| Google Apps Script | Juru tulis di dalam spreadsheet (`apps-script/Code.gs`) |
| GitHub | Tempat kode |
| Vercel | Menjalankan aplikasi & menyimpan 3 nilai rahasia |

## Teknologi

| Bagian | Pilihan |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Tampilan | CSS sendiri, tanpa framework — tidak ada versi yang bisa berubah |
| Sesi login | JWT HS256 di cookie httpOnly (masa berlaku 8 jam) |
| Password | scrypt (bawaan Node), disimpan sebagai hash |
| Spreadsheet | Google Sheets lewat Web App Apps Script |
| Export | ExcelJS (.xlsx) |

## Isi folder

```
app/                    halaman & endpoint
  (app)/                halaman yang butuh login (ada sidebar)
    page.tsx            dashboard
    akun/               daftar, tambah, edit akun pelanggan
    pengguna/           kelola akun login (khusus admin)
  login/  setup/  ganti-password/
  api/export/           unduh Excel
actions/                server action (login, CRUD, kelola pengguna)
components/             komponen tampilan
lib/                    bridge spreadsheet, data, sesi, password, format
apps-script/Code.gs     skrip untuk ditempel di Google Apps Script
docs/PANDUAN.md         panduan pemasangan
```

## Menjalankan di komputer sendiri

```bash
npm install
cp .env.example .env.local     # lalu isi ketiga nilainya
npm run dev                    # buka http://localhost:3000
```

## Fitur

- Login username + password, admin yang membuatkan akun, wajib ganti password di
  login pertama
- Dua peran: `admin` (kelola pengguna) dan `operator` (isi data)
- Dashboard: total akun, jumlah pelanggan, input hari ini, jumlah PIC
- Daftar akun dengan pencarian, filter PIC & tanggal, paging 25 baris
- Tambah / edit / hapus dengan dialog konfirmasi
- Export Excel (mengikuti filter yang sedang aktif)
- Penguncian sementara setelah 8 kali gagal login

## Biaya

Rp0. GitHub, Vercel, Google Sheets, dan Apps Script semuanya gratis.
