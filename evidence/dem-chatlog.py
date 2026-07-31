"""
Dem bang chung tren chatlog VLearn cho spec.md muc 1.

Cach chay (tu thu muc goc repo):
    python evidence/dem-chatlog.py

Yeu cau: pandas. File CSV nam trong data/vlearn-pack/chatlog/ va KHONG duoc commit
vao repo theo quy dinh bao mat cua data pack.

Ket qua in ra man hinh va ghi vao evidence/ket-qua-dem.md
"""

import re
import sys
import unicodedata
from pathlib import Path

import pandas as pd

CSV = Path("data/vlearn-pack/chatlog/chat_history_anonymized_for_hackathon.csv")
OUT = Path("evidence/ket-qua-dem.md")

# Tu khoa cho thay hoc vien noi ro minh muon vi du hoac muon cach de hieu hon
# Chi lay cach dien dat mang tinh YEU CAU, tranh cac cau chi tinh co chua chu "vi du"
TU_KHOA_XIN_VI_DU = [
    "cho vi du", "cho toi vi du", "cho minh vi du", "lay vi du", "them vi du",
    "vi du minh hoa", "vi du thuc te", "vi du di", "co vi du",
    "don gian hon", "de hieu hon", "ngan gon hon", "cach khac",
]


def bo_dau(s: str) -> str:
    s = unicodedata.normalize("NFD", str(s))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.replace("\u0111", "d").replace("\u0110", "D").lower()


def cau_hoc_vien_go(noi_dung: str) -> str:
    """Bo tien to '(Trang N, doan duoc chon: ...)' de chi giu cau hoc vien tu go."""
    t = str(noi_dung)
    # Hai dinh dang tien to gap trong chatlog
    m = re.match(r"^\(Trang \d+, đoạn được chọn:.*?\)\s*\n?(.*)$", t, flags=re.S)
    if m:
        return m.group(1).strip()
    m = re.match(r"^Giải thích đoạn bôi đen ở Trang \d+:\s*\".*?\"\s*(.*)$", t, flags=re.S)
    if m:
        return m.group(1).strip()
    return t.strip()


def main() -> int:
    if not CSV.exists():
        print(f"Khong tim thay {CSV}")
        print("Hay dat data pack vao dung duong dan tren roi chay lai.")
        return 1

    d = pd.read_csv(CSV)
    tutor = d[d.role == "tutor"]
    student = d[d.role == "student"]

    # --- Buoc 1: quy mo du lieu ---
    tong_luot = len(tutor)
    so_hoc_vien = d.user_id.nunique()
    so_hoi_thoai = d.conversation_id.nunique()

    # --- Buoc 2: dem theo tung nuoc di su pham ---
    move_theo_turn = dict(zip(tutor.turn_id, tutor.move_used))
    dem_nuoc_di = tutor.move_used.value_counts(dropna=False)
    so_giang_lai = int(dem_nuoc_di.get("review_concept", 0))
    ty_le_giang_lai = so_giang_lai / tong_luot * 100

    # --- Buoc 3: cac luot hoc vien noi ro muon vi du / cach de hieu hon ---
    # Chi xet PHAN HOC VIEN TU GO. Neu tim tren ca noi dung thi dinh duong tinh gia:
    # tu "vi du" co the nam trong doan slide duoc boi den chu khong phai loi hoc vien.
    student = student.copy()
    student["cau_go"] = student.content.map(cau_hoc_vien_go)
    q_khong_dau = student.cau_go.map(bo_dau)
    mask_xin = q_khong_dau.apply(lambda q: any(k in q for k in TU_KHOA_XIN_VI_DU))
    turn_xin = set(student.loc[mask_xin, "turn_id"])
    so_luot_xin = len(turn_xin)

    # --- Buoc 4: trong so do, bao nhieu luot van bi giang lai ---
    tutor_cua_luot_xin = tutor[tutor.turn_id.isin(turn_xin)]
    so_van_giang_lai = int((tutor_cua_luot_xin.move_used == "review_concept").sum())
    ty_le_van_giang_lai = so_van_giang_lai / so_luot_xin * 100 if so_luot_xin else 0

    # --- Vi du nguyen van: hoc vien xin vi du nhung van bi giang lai ---
    vi_du = []
    for _, r in student.loc[mask_xin].iterrows():
        if move_theo_turn.get(r.turn_id) != "review_concept":
            continue
        cau = r.cau_go
        # Bo cac luot thu be he thong (prompt injection) khoi danh sach vi du minh hoa
        if "base64" in cau.lower() or "system prompt" in bo_dau(cau):
            continue
        if 10 < len(cau) < 120:
            vi_du.append((r.turn_id, cau))
        if len(vi_du) >= 8:
            break

    # --- Ghi ket qua ---
    dong = []
    dong.append("# Ket qua dem tren chatlog\n")
    dong.append(f"Nguon: `{CSV}`\n")
    dong.append(
        f"Quy mo: {tong_luot} luot hoi dap, {so_hoc_vien} hoc vien, "
        f"{so_hoi_thoai} hoi thoai, tu 22 den 29/07/2026.\n"
    )

    dong.append("\n## Con so 1. AI Tutor gan nhu chi co mot nuoc di\n")
    dong.append("| Nuoc di | So luot | Ty le |")
    dong.append("|---|---|---|")
    for ten, so in dem_nuoc_di.items():
        dong.append(f"| {ten} | {so} | {so / tong_luot * 100:.1f}% |")
    dong.append(
        f"\n**{so_giang_lai}/{tong_luot} = {ty_le_giang_lai:.1f}%** luot dung "
        "`review_concept`, tuc giang lai ly thuyet.\n"
    )

    dong.append("\n## Con so 2. Hoc vien noi ro can gi ma van khong duoc dap ung\n")
    dong.append(
        "Chi xet phan hoc vien tu go, da bo tien to doan slide duoc boi den."
    )
    dong.append(f"\nSo luot hoc vien noi ro muon vi du hoac cach de hieu hon: **{so_luot_xin}**")
    dong.append(
        f"\nTrong so do, so luot van nhan lai mot ban giang lai: "
        f"**{so_van_giang_lai}/{so_luot_xin} = {ty_le_van_giang_lai:.1f}%**\n"
    )

    dong.append("\n## Vi du nguyen van (hoc vien xin vi du, tutor van giang lai)\n")
    for i, (tid, cau) in enumerate(vi_du, 1):
        dong.append(f"{i}. `{tid}` — {cau}")

    dong.append("\n## Cach dem, de nguoi khac chay lai\n")
    dong.append("1. Loc `role = tutor`, duoc tong so luot tutor tra loi.")
    dong.append("2. Dem so dong theo tung gia tri cua cot `move_used`.")
    dong.append(
        "3. Loc `role = student`, bo tien to `(Trang N, doan duoc chon: ...)` de chi giu cau "
        "hoc vien tu go, bo dau tieng Viet, roi lay cac dong chua mot trong cac tu: "
        + ", ".join(f"`{k}`" for k in TU_KHOA_XIN_VI_DU)
        + "."
    )
    dong.append(
        "4. Lay dung tap `turn_id` o buoc 3, doi chieu sang dong tutor cung turn, "
        "dem so dong co `move_used = review_concept`."
    )
    dong.append("\nChay lai bang: `python evidence/dem-chatlog.py`")

    noi_dung = "\n".join(dong) + "\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(noi_dung, encoding="utf-8")

    print(noi_dung)
    print(f"Da ghi {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
