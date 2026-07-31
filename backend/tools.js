// Tool tim kiem tai lieu khoa hoc.
// Nguyen tac: tool la nguon duy nhat sinh ra so trang. AI khong duoc tu bia so trang.

const TU_DUNG = new Set([
  "la",
  "gi",
  "the",
  "nao",
  "cho",
  "toi",
  "minh",
  "cua",
  "va",
  "co",
  "khong",
  "mot",
  "trong",
  "ve",
  "nay",
  "do",
  "ban",
  "hay",
  "duoc",
  "thi",
  "ma",
  "nhu",
  "voi",
  "de",
  "giai",
  "thich",
  "hoi",
  "noi",
  "cai",
  "cac",
  "nhung",
  "ra",
  "len",
  "tren",
  "khi",
  "neu",
  "sao",
  "vay",
  "a",
  "em",
  "anh",
  "chi",
  "oi",
  "nhe",
  "day",
  "kia",
  "lam",
  "dung",
  "viec",
  "cach",
  "nghia",
  "tuc",
  "boi",
]);

// Diem toi thieu de coi la co can cu. Duoi nguong nay tra ve found=false
// de AI buoc phai tra loi chua_co_can_cu thay vi bam vao mot trang bat ky.
const NGUONG_DIEM = 9;

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();

const tokens = (value) =>
  normalize(value)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !TU_DUNG.has(word));

export const tutorTools = [
  {
    type: "function",
    function: {
      name: "search_course_material",
      description:
        "Tim cac doan lien quan trong tai lieu khoa hoc de ho tro tra loi cau hoi cua hoc vien. " +
        "Chi dung tool khi cau tra loi phu thuoc vao noi dung tai lieu. " +
        "Khong dung tool cho loi chao, cam on hoac hoi thoai thong thuong. " +
        "Sau khi nhan ket qua tu tool, chi duoc dan so trang co trong ket qua do.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Cau hoi cua nguoi hoc.",
          },
          selected_text: {
            type: "string",
            description:
              "Doan nguoi hoc dang boi den. Neu khong co thi truyen chuoi rong.",
          },
          current_page: {
            type: "integer",
            description: "Trang hien tai. Neu khong co thi truyen -1.",
          },
        },
        required: ["query", "selected_text", "current_page"],
        additionalProperties: false,
      },
    },
  },
];

export function searchCourseMaterial(args, pages) {
  const {
    query = "",
    selected_text: selectedText = "",
    current_page: currentPage = -1,
  } = args || {};

  // Hoc vien noi ro so trang thi uu tien dung trang do.
  const noiSoTrang = normalize(query).match(/trang\s*(\d+)/);
  if (noiSoTrang) {
    const trang = pages.find(
      (page) => Number(page.so) === Number(noiSoTrang[1]),
    );
    if (trang) {
      return {
        found: true,
        results: [
          {
            page: trang.so,
            title: trang.tieuDe,
            excerpt: trang.noiDung,
            score: 999,
          },
        ],
      };
    }
  }

  const queryTokens = new Set([...tokens(query), ...tokens(selectedText)]);
  if (!queryTokens.size) return { found: false, results: [] };

  const results = pages
    .map((page) => {
      const titleTokens = new Set(tokens(page.tieuDe));
      const contentTokens = new Set(tokens(page.noiDung));

      let score = 0;
      for (const word of queryTokens) {
        // tu dai mang nhieu tin hieu hon tu ngan thong dung
        if (titleTokens.has(word)) score += word.length * 3;
        else if (contentTokens.has(word)) score += word.length;
      }

      const normContent = normalize(page.noiDung);
      if (selectedText && normContent.includes(normalize(selectedText)))
        score += 40;
      if (Number(currentPage) > 0 && Number(page.so) === Number(currentPage))
        score += 10;

      return { page, score };
    })
    .filter((item) => item.score >= NGUONG_DIEM)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ page, score }) => ({
      page: page.so,
      title: page.tieuDe,
      excerpt: page.noiDung,
      score,
    }));

  return { found: results.length > 0, results };
}
