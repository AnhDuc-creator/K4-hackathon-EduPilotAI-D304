/**
 * Chay bo cau thu qua API that va ghi bang ket qua.
 *
 * Cach chay:
 *   1. Mo mot terminal:  npm start          (server phai dang chay)
 *   2. Mo terminal thu hai:  npm run eval
 *
 * Ghi ra: eval/ket-qua.md va eval/ket-qua.json
 * Nguyen tac: ghi DU moi dong, ke ca dong truot. Khong sua golden set sau khi thay ket qua.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const API = process.env.EVAL_URL || "http://localhost:3000/api/tra-loi";

/* ---- Nap noi dung tai lieu dung chung voi giao dien ---- */
const codeTaiLieu = await readFile(
  path.join(root, "codebase", "course-data.js"),
  "utf8",
);
new Function(codeTaiLieu)();
const MOI_TAI_LIEU = globalThis.TAI_LIEU.flatMap((nhom) => nhom.items);

function layTrang(idTaiLieu) {
  const t = MOI_TAI_LIEU.find((x) => x.id === idTaiLieu);
  if (!t) throw new Error(`Khong tim thay tai lieu ${idTaiLieu}`);
  return t.trang;
}

/* ---- Chay tung case ---- */
async function chayMotCase(c) {
  const batDau = Date.now();
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cauHoi: c.cauHoi,
        doanNguCanh: c.doanNguCanh || "",
        danhSachTrang: layTrang(c.taiLieu),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        loi: data.error || `HTTP ${res.status}`,
        ms: Date.now() - batDau,
      };
    }
    return {
      nuocDiThucTe: data.nuocDi ?? null,
      trangThucTe: data.soTrang ?? null,
      cauTraLoi: String(data.cauTraLoi || ""),
      canhBao: data.canhBao || [],
      soLanGoiTool: (data.toolTrace || []).length,
      ms: Date.now() - batDau,
    };
  } catch (e) {
    return { loi: e.message, ms: Date.now() - batDau };
  }
}

function chamDiem(c, kq) {
  if (kq.loi) return { nuocDiDung: false, trangDung: false, dat: false };
  const nuocDiDung = kq.nuocDiThucTe === c.nuocDiMongDoi;
  const trangDung =
    c.trangMongDoi === null
      ? kq.trangThucTe === null
      : Array.isArray(c.trangMongDoi) &&
        c.trangMongDoi.includes(kq.trangThucTe);
  return { nuocDiDung, trangDung, dat: nuocDiDung && trangDung };
}

/* ---- Xuat bang ---- */
function bangMarkdown(rows, tomTat) {
  const dong = (r) =>
    `| ${r.id} | ${r.tinhHuong} | ${r.nguon} | ${r.cauHoi.replace(/\|/g, "/")} | ${r.nuocDiMongDoi} | ${
      r.nuocDiThucTe ?? "LOI"
    } | ${r.trangMongDoi ?? "null"} | ${r.trangThucTe ?? "null"} | ${r.dat ? "DAT" : "TRUOT"} | ${
      r.ghiChu
    } |`;

  return `# Ket qua eval CP3

Chay luc: ${tomTat.chayLuc}
Tong so case: ${tomTat.tong}
Dat ca nuoc di va trang: ${tomTat.dat}/${tomTat.tong} (${tomTat.tyLe}%)
Dung nuoc di: ${tomTat.dungNuocDi}/${tomTat.tong}
Dung trang: ${tomTat.dungTrang}/${tomTat.tong}
Loi khi goi API: ${tomTat.loi}
Case lay tu quan sat thuc te (chatlog): ${tomTat.tuChatlog}/${tomTat.tong}
Chuan dat da chot truoc khi chay: ${tomTat.chuanDat}

## Theo tung kieu tinh huong

| Kieu tinh huong | So case | Dat |
|---|---|---|
${Object.entries(tomTat.theoTinhHuong)
  .map(([k, v]) => `| ${k} | ${v.tong} | ${v.dat} |`)
  .join("\n")}

## Theo tung nuoc di

| Nuoc di mong doi | So case | Dat |
|---|---|---|
${Object.entries(tomTat.theoNuocDi)
  .map(([k, v]) => `| ${k} | ${v.tong} | ${v.dat} |`)
  .join("\n")}

## Bang day du

Ghi du moi dong, ke ca dong truot.

| ID | Tinh huong | Nguon | Cau hoi | Nuoc di mong doi | Nuoc di thuc te | Trang mong doi | Trang thuc te | Ket qua | Ghi chu |
|---|---|---|---|---|---|---|---|---|---|
${rows.map(dong).join("\n")}
`;
}

/* ---- Main ---- */
const bo = JSON.parse(
  await readFile(path.join(here, "golden-set.json"), "utf8"),
);
const rows = [];

console.log(`Chay ${bo.cases.length} case qua ${API}\n`);

for (const c of bo.cases) {
  const kq = await chayMotCase(c);
  const diem = chamDiem(c, kq);
  const ghiChu = [
    kq.loi ? `LOI: ${kq.loi}` : "",
    ...(kq.canhBao || []),
    c.viSaoKho ? `kho: ${c.viSaoKho}` : "",
  ]
    .filter(Boolean)
    .join("; ");

  rows.push({
    id: c.id,
    nguon: c.nguon,
    tinhHuong: c.tinhHuong,
    cauHoi: c.cauHoi,
    taiLieu: c.taiLieu,
    nuocDiMongDoi: c.nuocDiMongDoi,
    nuocDiThucTe: kq.nuocDiThucTe ?? null,
    trangMongDoi: Array.isArray(c.trangMongDoi)
      ? c.trangMongDoi.join(" hoac ")
      : c.trangMongDoi,
    trangThucTe: kq.trangThucTe ?? null,
    ...diem,
    loi: kq.loi || null,
    ms: kq.ms,
    cauTraLoi: kq.cauTraLoi || "",
    ghiChu,
  });

  console.log(
    `${c.id} ${diem.dat ? "DAT  " : "TRUOT"} | mong doi ${c.nuocDiMongDoi}/${
      c.trangMongDoi ?? "null"
    } | thuc te ${kq.nuocDiThucTe ?? "LOI"}/${kq.trangThucTe ?? "null"}${
      kq.loi ? " | " + kq.loi : ""
    }`,
  );
}

const tong = rows.length;
const dat = rows.filter((r) => r.dat).length;
const theoNuocDi = {};
const theoTinhHuong = {};
for (const r of rows) {
  theoNuocDi[r.nuocDiMongDoi] ||= { tong: 0, dat: 0 };
  theoNuocDi[r.nuocDiMongDoi].tong += 1;
  if (r.dat) theoNuocDi[r.nuocDiMongDoi].dat += 1;

  theoTinhHuong[r.tinhHuong] ||= { tong: 0, dat: 0 };
  theoTinhHuong[r.tinhHuong].tong += 1;
  if (r.dat) theoTinhHuong[r.tinhHuong].dat += 1;
}

const tomTat = {
  chayLuc: new Date().toISOString(),
  tong,
  dat,
  tyLe: tong ? Math.round((dat / tong) * 1000) / 10 : 0,
  dungNuocDi: rows.filter((r) => r.nuocDiDung).length,
  dungTrang: rows.filter((r) => r.trangDung).length,
  loi: rows.filter((r) => r.loi).length,
  tuChatlog: rows.filter((r) => r.nguon === "chatlog").length,
  chuanDat: bo.chuanDat || "(chua chot)",
  theoNuocDi,
  theoTinhHuong,
};

await writeFile(
  path.join(here, "ket-qua.md"),
  bangMarkdown(rows, tomTat),
  "utf8",
);
await writeFile(
  path.join(here, "ket-qua.json"),
  JSON.stringify({ tomTat, rows }, null, 2),
  "utf8",
);

console.log(
  `\nDat ${dat}/${tong} (${tomTat.tyLe}%). Da ghi eval/ket-qua.md va eval/ket-qua.json`,
);
