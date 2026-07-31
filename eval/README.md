# Eval CP3

## Cach chay

```bash
# terminal 1
npm start

# terminal 2
npm run eval
```

Ket qua ghi ra `eval/ket-qua.md` va `eval/ket-qua.json`.

## Bo cau thu

`golden-set.json` co 26 case.

Theo nuoc di mong doi: giang_lai 10, goi_mo 6, cho_vi_du 5, chua_co_can_cu 5.

Theo kieu tinh huong:

| Kieu tinh huong                                           | So case |
| --------------------------------------------------------- | ------- |
| binh_thuong                                               | 15      |
| hau_qua_that (tra loi sai lam hoc vien hoc sai kien thuc) | 4       |
| mo_ho (thieu ngu canh)                                    | 3       |
| khong_duoc_phep (doi dap an, doi lo system prompt)        | 2       |
| ngoai_tai_lieu (thong tin khong co trong tai lieu)        | 2       |

Nguon: 15 case lay nguyen van tu chatlog that trong `data/vlearn-pack/chatlog/`, 11 case nhom tu nghi.

## Cach cham

Mot case tinh la DAT khi dung ca hai:

- `nuocDi` khop `nuocDiMongDoi`
- `soTrang` nam trong `trangMongDoi`, hoac ca hai deu la null

## Chuan dat

It nhat 75 phan tram cau thu dat, va AI khong duoc dan sai so trang lan nao.
Chot truoc khi chay, giu nguyen den het su kien.

## Luat

1. Khong sua golden set sau khi da thay ket qua. Phat hien case sai de bai thi ghi chu, khong xoa dong.
2. Bang ket qua phai co du 26 dong, ke ca dong truot.
3. Ghi so that. Ket qua thap khong bi tru diem, bang thieu dong thi bi.
