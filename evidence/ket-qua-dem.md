# Ket qua dem tren chatlog

Nguon: `data\vlearn-pack\chatlog\chat_history_anonymized_for_hackathon.csv`

Quy mo: 1261 luot hoi dap, 369 hoc vien, 585 hoi thoai, tu 22 den 29/07/2026.


## Con so 1. AI Tutor gan nhu chi co mot nuoc di

| Nuoc di | So luot | Ty le |
|---|---|---|
| review_concept | 1074 | 85.2% |
| give_direct_answer | 146 | 11.6% |
| give_example | 21 | 1.7% |
| nan | 8 | 0.6% |
| motivate | 7 | 0.6% |
| give_hint | 4 | 0.3% |
| validate_understanding | 1 | 0.1% |

**1074/1261 = 85.2%** luot dung `review_concept`, tuc giang lai ly thuyet.


## Con so 2. Hoc vien noi ro can gi ma van khong duoc dap ung

Chi xet phan hoc vien tu go, da bo tien to doan slide duoc boi den.

So luot hoc vien noi ro muon vi du hoac cach de hieu hon: **18**

Trong so do, so luot van nhan lai mot ban giang lai: **9/18 = 50.0%**


## Vi du nguyen van (hoc vien xin vi du, tutor van giang lai)

1. `T1157` — Giai thich khai niem quan trong nhat trong slide nay va cho vi du minh hoa chi tiet
2. `T1187` — Lấy ví dụ ở trang 45 để tôi hiểu rõ hơn được không
3. `T0142` — Cho tôi ví dụ của cả ba phần này trong thực tế đi
4. `T0633` — benchmark là gì? Mỗi đề bài thì phải tự tạo benchmark đúng không, cho ví dụ
5. `T0727` — giải thích trang 16,cho ví dụ

## Cach dem, de nguoi khac chay lai

1. Loc `role = tutor`, duoc tong so luot tutor tra loi.
2. Dem so dong theo tung gia tri cua cot `move_used`.
3. Loc `role = student`, bo tien to `(Trang N, doan duoc chon: ...)` de chi giu cau hoc vien tu go, bo dau tieng Viet, roi lay cac dong chua mot trong cac tu: `cho vi du`, `cho toi vi du`, `cho minh vi du`, `lay vi du`, `them vi du`, `vi du minh hoa`, `vi du thuc te`, `vi du di`, `co vi du`, `don gian hon`, `de hieu hon`, `ngan gon hon`, `cach khac`.
4. Lay dung tap `turn_id` o buoc 3, doi chieu sang dong tutor cung turn, dem so dong co `move_used = review_concept`.

Chay lai bang: `python evidence/dem-chatlog.py`
