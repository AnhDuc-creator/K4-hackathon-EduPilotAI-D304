# K4-hackathon-EduPilotAI-D304

## Chạy AI Tutor

1. Sao chép `.env.example` thành `.env`, rồi điền `OPENAI_API_KEY` của bạn.
2. Chạy `npm start`.
3. Mở `http://localhost:3000` (không mở trực tiếp file HTML).

Khóa API chỉ nằm trong `.env` và được `.gitignore` loại trừ. Backend gọi OpenAI Responses API, bắt model tra cứu tài liệu qua tool `search_course_material`, sau đó trả về câu trả lời có số trang cho giao diện.
