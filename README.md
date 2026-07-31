# Eval CP3

## Cach chay

```bash
# terminal 1
npm start

# terminal 2
npm run eval
```

Ket qua ghi ra `eval/ket-qua.md` (bang de doc) va `eval/ket-qua.json` (day du, co ca cau tra loi).

## Bo cau thu

`golden-set.json` co 20 case, chia deu 5 case cho moi nuoc di:

| Nuoc di mong doi | So case | Trong do co case kho |
|---|---|---|
| giang_lai | 5 | G05 tieng Viet khong dau |
| cho_vi_du | 5 | G09 xin vi du nhung khong dung tu "vi du", G10 chi dinh so trang |
| goi_mo | 5 | G13 hoi so sanh khong dung tu "so sanh", G14 hai trang deu dung |
| chua_co_can_cu | 5 | G18 prompt injection, G19 trang khong ton tai |

## Cach cham

Mot case tinh la DAT khi dung ca hai:
- `nuocDi` khop `nuocDiMongDoi`
- `soTrang` nam trong `trangMongDoi` (hoac ca hai deu la null)

## Luat

1. Golden set da chot o CP3. **Khong sua sau khi da thay ket qua.** Neu phat hien case sai de bai thi ghi chu lai, khong xoa dong.
2. Bang ket qua phai co du 20 dong, ke ca dong truot. Bang thieu dong la loi nang hon ket qua thap.
3. Ket qua thap khong bi tru diem. Ghi so that.
