// 1. CÁC HÀM TIỆN ÍCH (HELPER FUNCTIONS)
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
    .filter((word) => word.length > 1); // Đã tối ưu > 1 để không mất từ tiếng Việt có 2 chữ cái

// 2. KHAI BÁO TOOL CHO AI (ĐÂY LÀ PHẦN BỊ THIẾU GÂY RA LỖI)
export const tutorTools = [
  {
    type: "function",
    // Lưu ý: Nếu bạn dùng OpenAI API bản mới, name, description, parameters thường phải nằm trong key "function: { ... }"
    // Mình giữ nguyên cấu trúc cũ của bạn để đảm bảo tương thích với wrapper hiện tại của bạn.
    name: "search_course_material",
    description:
    "Tìm các đoạn liên quan trong tài liệu khóa học để hỗ trợ trả lời câu hỏi của học viên.Chỉ sử dụng tool khi câu trả lời phụ thuộc vào nội dung tài liệu. Không dùng tool cho lời chào, cảm ơn hoặc hội thoại thông thường. Sau khi nhận kết quả từ tool, dựa trên kết quả đó để tạo câu trả lời."
    ,
    strict: true,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Câu hỏi của người học."
        },
        selected_text: {
          type: "string",
          description: "Đoạn người học đang bôi đen. Nếu không có thì truyền chuỗi rỗng."
        },
        current_page: {
          type: "integer",
          description: "Trang hiện tại. Nếu không có thì truyền -1."
        }
      },
      required: ["query", "selected_text", "current_page"],
      additionalProperties: false
    }
  }
];

// 3. HÀM XỬ LÝ TÌM KIẾM TÀI LIỆU (ĐÃ ĐƯỢC TỐI ƯU)
export function searchCourseMaterial(args, pages) {
  const { query, selected_text = "", current_page = null } = args;

  const queryTokens = new Set([...tokens(query), ...tokens(selected_text)]);

  if (!queryTokens.size) {
    return {
      found: false,
      results: []
    };
  }

  const results = pages
    .map((page) => {
      const titleTokens = new Set(tokens(page.tieuDe));
      const contentTokens = new Set(tokens(page.noiDung));

      let score = 0;

      for (const word of queryTokens) {
        if (titleTokens.has(word)) {
          score += word.length * 4;
        } else if (contentTokens.has(word)) {
          score += word.length;
        }
      }

      const normContent = normalize(page.noiDung);
      if (selected_text && normContent.includes(normalize(selected_text))) {
        score += 40;
      }

      if (current_page !== null && Number(page.so) === Number(current_page)) {
        score += 20;
      }

      return {
        page,
        score
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ page, score }) => ({
      page: page.so,
      title: page.tieuDe,
      // Truyền toàn bộ nội dung (hoặc bạn có thể cắt dài hơn 600 để tránh cắt mất context)
      excerpt: page.noiDung, 
      score
    }));

  return {
    found: results.length > 0,
    results
  };
}