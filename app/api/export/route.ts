import ExcelJS from 'exceljs';
import type { NextRequest } from 'next/server';
import { sesiSekarang } from '@/lib/auth';
import { daftarAkun } from '@/lib/data';
import { hariIni } from '@/lib/format';
import type { Akun } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cocok(a: Akun, q: string, pic: string, tanggal: string): boolean {
  if (q) {
    const gabung = [
      a.nama_pelanggan,
      a.username,
      a.email_solarwinds,
      a.email_duo,
      a.pic,
    ]
      .join(' ')
      .toLowerCase();
    if (!gabung.includes(q)) return false;
  }
  if (pic && (a.pic ?? '').trim() !== pic) return false;
  if (tanggal && a.tanggal_input !== tanggal) return false;
  return true;
}

export async function GET(req: NextRequest) {
  const sesi = await sesiSekarang();
  if (!sesi) {
    return new Response('Belum masuk. Silakan login dulu.', { status: 401 });
  }

  const p = req.nextUrl.searchParams;
  const q = (p.get('q') ?? '').trim().toLowerCase();
  const pic = (p.get('pic') ?? '').trim();
  const tanggal = (p.get('tanggal') ?? '').trim();

  let semua: Akun[];
  try {
    semua = await daftarAkun();
  } catch (e) {
    return new Response(e instanceof Error ? e.message : String(e), { status: 500 });
  }

  const hasil = semua
    .filter((a) => cocok(a, q, pic, tanggal))
    .sort((a, b) => String(b.tanggal_input).localeCompare(String(a.tanggal_input)));

  const wb = new ExcelJS.Workbook();
  wb.creator = 'customer-form';
  wb.created = new Date();

  const ws = wb.addWorksheet('Akun Pelanggan');

  ws.columns = [
    { header: 'Nama Pelanggan', key: 'nama_pelanggan', width: 28 },
    { header: 'Username', key: 'username', width: 22 },
    { header: 'Email SolarWinds', key: 'email_solarwinds', width: 32 },
    { header: 'Email Duo', key: 'email_duo', width: 32 },
    { header: 'PIC', key: 'pic', width: 20 },
    { header: 'Tanggal Input', key: 'tanggal_input', width: 16 },
  ];

  const barisJudul = ws.getRow(1);
  barisJudul.font = { bold: true };
  barisJudul.alignment = { vertical: 'middle' };
  barisJudul.height = 20;
  barisJudul.eachCell((sel) => {
    sel.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F4F7' },
    };
    sel.border = { bottom: { style: 'thin', color: { argb: 'FFD0D5DD' } } };
  });

  hasil.forEach((a) => {
    ws.addRow({
      nama_pelanggan: a.nama_pelanggan,
      username: a.username,
      email_solarwinds: a.email_solarwinds,
      email_duo: a.email_duo,
      pic: a.pic,
      tanggal_input: a.tanggal_input,
    });
  });

  ws.autoFilter = { from: 'A1', to: 'F1' };
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  const isi = (await wb.xlsx.writeBuffer()) as unknown as ArrayBuffer;

  return new Response(new Uint8Array(isi), {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="akun-pelanggan-${hariIni()}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
