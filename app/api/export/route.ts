import ExcelJS from 'exceljs';
import type { NextRequest } from 'next/server';
import { currentSession } from '@/lib/auth';
import { loadBoth } from '@/lib/data';
import { nowStamp } from '@/lib/format';
import { userLabel, type Customer, type User } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Apps Script can be slow on a cold start. Raise the function budget above
// Vercel's 10-second default so a slow first request is not cut off.
export const maxDuration = 60;

function matches(c: Customer, q: string, am: string): boolean {
  if (am && (c.am_username ?? '').trim() !== am) return false;
  if (q) {
    const haystack = [
      c.company_name,
      c.cid,
      c.account_username,
      c.pic_name,
      c.pic_phone,
      c.pic_email,
      c.am_username,
    ]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  const session = await currentSession();
  if (!session) {
    return new Response('Not signed in.', { status: 401 });
  }

  const p = req.nextUrl.searchParams;
  const q = (p.get('q') ?? '').trim().toLowerCase();
  const am = (p.get('am') ?? '').trim();

  let customers: Customer[];
  let users: User[];
  try {
    const data = await loadBoth();
    customers = data.customers;
    users = data.users;
  } catch (e) {
    return new Response(e instanceof Error ? e.message : String(e), { status: 500 });
  }

  const byUsername = new Map(users.map((u) => [u.username, u]));

  const rows = customers
    .filter((c) => matches(c, q, am))
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

  const wb = new ExcelJS.Workbook();
  wb.creator = 'customer-form';
  wb.created = new Date();

  const ws = wb.addWorksheet('Customer Accounts');

  ws.columns = [
    { header: 'Customer Company Name', key: 'company_name', width: 30 },
    { header: 'CID', key: 'cid', width: 16 },
    { header: 'Account Username', key: 'account_username', width: 24 },
    { header: 'PIC Name', key: 'pic_name', width: 22 },
    { header: 'PIC Phone', key: 'pic_phone', width: 20 },
    { header: 'PIC Email', key: 'pic_email', width: 30 },
    { header: 'Account Manager', key: 'am_name', width: 24 },
    { header: 'Account Manager Phone', key: 'am_phone', width: 20 },
    { header: 'Account Manager Email', key: 'am_email', width: 30 },
    { header: 'Date Recorded', key: 'created_at', width: 18 },
  ];

  const head = ws.getRow(1);
  head.font = { bold: true };
  head.alignment = { vertical: 'middle' };
  head.height = 20;
  head.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4F7' } };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFD0D5DD' } } };
  });

  rows.forEach((c) => {
    const u = byUsername.get(c.am_username);
    ws.addRow({
      company_name: c.company_name,
      cid: c.cid,
      account_username: c.account_username,
      pic_name: c.pic_name,
      pic_phone: c.pic_phone,
      pic_email: c.pic_email,
      am_name: u ? userLabel(u) : c.am_username,
      am_phone: u?.phone ?? '',
      am_email: u?.email ?? '',
      created_at: c.created_at,
    });
  });

  ws.autoFilter = { from: 'A1', to: 'J1' };
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = (await wb.xlsx.writeBuffer()) as unknown as ArrayBuffer;

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="customer-accounts-${nowStamp()
        .slice(0, 10)}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
