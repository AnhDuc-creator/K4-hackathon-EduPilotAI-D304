// Noi dung tai lieu khoa hoc. Tach rieng de sua noi dung khong phai dung index.html.
// Dung chung cho giao dien (browser) va bo eval (Node).

      var TAI_LIEU = [
        {
          day: "Day 01: Nền tảng",
          items: [
            {
              id: "day1-1",
              ten: "AI & LLM Foundation",
              phu: "Mô hình ngôn ngữ lớn và kiến trúc Transformer",
              trang: [
                {
                  so: 1,
                  tieuDe: "Mô hình ngôn ngữ lớn là gì",
                  noiDung:
                    "Mô hình ngôn ngữ lớn, viết tắt là LLM, được huấn luyện trên một khối lượng văn bản rất lớn để làm đúng một việc: dự đoán token tiếp theo. Toàn bộ khả năng viết văn, trả lời câu hỏi hay viết code đều mọc ra từ việc dự đoán token lặp lại nhiều lần.",
                },
                {
                  so: 2,
                  tieuDe: "Token và cách tính chi phí",
                  noiDung:
                    "Token là đơn vị nhỏ hơn từ. Một từ tiếng Việt có thể bị tách thành hai đến ba token. Chi phí gọi API tính theo số token vào và số token ra, nên prompt càng dài thì càng tốn. Muốn giảm chi phí thì phải giảm ngữ cảnh gửi lên, không phải giảm số lần gọi.",
                },
                {
                  so: 3,
                  tieuDe: "Kiến trúc Transformer",
                  noiDung:
                    "Transformer là kiến trúc nền của gần như mọi LLM hiện nay. Điểm khác biệt so với các mô hình trước là nó không xử lý câu theo thứ tự từng từ một, mà nhìn toàn bộ câu cùng lúc rồi tự quyết định phần nào quan trọng.",
                },
                {
                  so: 4,
                  tieuDe: "Cơ chế attention",
                  noiDung:
                    'Attention cho phép mô hình chú ý đến các phần khác nhau của đầu vào với mức độ khác nhau. Với câu "con mèo ngồi trên bàn", khi xử lý từ "ngồi" thì mô hình chú ý mạnh vào "con mèo" và "bàn", vì đó là hai thứ quyết định nghĩa của hành động. Cơ chế này được tính bằng ba ma trận Q, K và V.',
                },
                {
                  so: 5,
                  tieuDe: "Multi-head attention",
                  noiDung:
                    "Thay vì chỉ có một cách chú ý, mô hình chạy nhiều head song song. Mỗi head học một kiểu quan hệ khác nhau: một head bắt quan hệ ngữ pháp, một head bắt quan hệ nghĩa, một head bắt vị trí. Kết quả các head được ghép lại rồi đưa qua lớp tiếp theo.",
                },
                {
                  so: 6,
                  tieuDe: "Temperature và top-p",
                  noiDung:
                    "Temperature điều khiển độ ngẫu nhiên khi chọn token. Để 0 thì mô hình luôn chọn token có xác suất cao nhất, trả lời ổn định nhưng khô. Để cao thì đa dạng hơn nhưng dễ bịa. Top-p thì giới hạn tập token được chọn theo tổng xác suất. Với bài toán cần chính xác, hãy để temperature thấp.",
                },
              ],
            },
            {
              id: "day1-2",
              ten: "Prompt Engineering cơ bản",
              phu: "Bốn thành phần của một prompt tốt",
              trang: [
                {
                  so: 7,
                  tieuDe: "Bốn thành phần của prompt",
                  noiDung:
                    "Một prompt dùng được thường có bốn phần: Role là mô hình đang đóng vai ai, Context là ngữ cảnh và dữ liệu kèm theo, Task là việc cụ thể cần làm, Format là hình dạng đầu ra mong muốn. Thiếu Format là lỗi hay gặp nhất, vì khi đó đầu ra mỗi lần một kiểu và không ghép được vào code.",
                },
                {
                  so: 8,
                  tieuDe: "Vì sao cần chỉ định định dạng đầu ra",
                  noiDung:
                    "Nếu bạn cần đầu ra là JSON để hệ thống đọc, phải nói rõ trong prompt và mô tả từng trường. Không có schema nào để mô hình hay hệ thống kiểm tra tính hợp lệ trước khi gọi, nên chính prompt phải làm việc đó.",
                },
                {
                  so: 9,
                  tieuDe: "Tool calling",
                  noiDung:
                    "Tool calling cho phép mô hình gọi ra ngoài: tra cứu API, đọc cơ sở dữ liệu, tính toán. Mô hình không tự thực thi, nó chỉ trả về tên tool và tham số dưới dạng có cấu trúc, còn hệ thống của bạn mới là chỗ thực thi thật.",
                },
                {
                  so: 10,
                  tieuDe: "RAG và grounding",
                  noiDung:
                    "RAG là kỹ thuật tìm đoạn tài liệu liên quan rồi đưa vào prompt trước khi hỏi mô hình. Mục đích là buộc câu trả lời dựa trên tài liệu thật thay vì dựa vào ký ức của mô hình. Câu trả lời có dẫn nguồn được gọi là có grounding, và đây là cách chính để giảm bịa.",
                },
              ],
            },
          ],
        },
        {
          day: "Day 02: Xác định bài toán",
          items: [
            {
              id: "day2-1",
              ten: "Xác định bài toán cho AI",
              phu: "Từ yêu cầu mơ hồ đến vấn đề cụ thể",
              trang: [
                {
                  so: 11,
                  tieuDe: "Kỹ năng khó nhất",
                  noiDung:
                    "Kỹ năng thiếu nhất hiện nay không phải là code mô hình, mà là biến một yêu cầu mơ hồ thành một bài toán cụ thể có thể triển khai được trong thời gian ngắn. Rất nhiều công ty tuyển AI engineer nhưng không có ai đặt được đề bài, nên cuối cùng không ra kết quả.",
                },
                {
                  so: 12,
                  tieuDe: "Đừng nhảy thẳng vào giải pháp",
                  noiDung:
                    "Con người có quán tính nhảy thẳng vào giải pháp. Câu hỏi đúng phải là vấn đề là gì, rồi mới đến công nghệ nào giải nó. Yêu cầu kiểu làm một cái AI support cho công ty là chưa phải bài toán, vì chưa trả lời được support cho ai và để làm gì.",
                },
                {
                  so: 13,
                  tieuDe: "Double Diamond",
                  noiDung:
                    "Double Diamond gồm hai kim cương: kim cương thứ nhất để tìm đúng vấn đề, kim cương thứ hai để tìm đúng giải pháp. Mỗi kim cương có một pha phân kỳ để mở rộng lựa chọn và một pha hội tụ để chốt lại. Làm đúng một cái sai thì tệ hơn làm sai một cái đúng.",
                },
                {
                  so: 14,
                  tieuDe: "Ma trận tác động và nỗ lực",
                  noiDung:
                    "Vẽ hai trục: tác động và nỗ lực. Việc tác động cao mà nỗ lực thấp là quick win, làm trước. Tác động cao nỗ lực cao thì cần lên kế hoạch. Tác động thấp nỗ lực thấp thì làm khi rảnh. Tác động thấp nỗ lực cao thì bỏ. Ma trận này dùng để chốt việc, không phải để trang trí slide.",
                },
                {
                  so: 15,
                  tieuDe: "Mức tự động hóa",
                  noiDung:
                    "Không phải việc gì cũng nên để AI làm hết. Automation là AI làm thay hoàn toàn, augmentation là AI hỗ trợ con người quyết định. Chọn mức nào phụ thuộc vào hậu quả khi sai. Việc mà sai một lần là gây thiệt hại lớn thì phải để con người chốt.",
                },
              ],
            },
            {
              id: "day2-2",
              ten: "JTBD Framework",
              phu: "Jobs to Be Done",
              trang: [
                {
                  so: 16,
                  tieuDe: "JTBD là gì",
                  noiDung:
                    "JTBD giúp nhìn người dùng theo công việc họ cần hoàn thành, thay vì theo tính năng bạn muốn làm. Công thức: khi ở tình huống nào, tôi muốn làm gì, để đạt được kết quả gì.",
                },
                {
                  so: 17,
                  tieuDe: "Hỏi hành vi, không hỏi ý kiến",
                  noiDung:
                    "Câu hỏi kiểu bạn có cần tính năng này không thì gần như ai cũng trả lời có, và dữ liệu đó vô dụng. Phải hỏi về hành vi đã xảy ra: lần gần nhất bạn gặp việc này, bạn đã làm gì, mất bao lâu.",
                },
                {
                  so: 18,
                  tieuDe: "Một vai cụ thể",
                  noiDung:
                    "Người dùng chung chung thì không thiết kế được cho ai cả. Phải khoanh về một vai trong một tình huống, ví dụ học viên đang làm bài lab lúc khuya, chứ không phải học viên nói chung.",
                },
              ],
            },
            {
              id: "day2-3",
              ten: "Bằng chứng và impact",
              phu: "Chứng minh vấn đề tồn tại thật",
              trang: [
                {
                  so: 19,
                  tieuDe: "Ba tầng của một bằng chứng",
                  noiDung:
                    "Một bằng chứng dùng được phải có ba tầng: con số cụ thể, ý nghĩa của con số đó với người dùng, và cách đếm để người khác chạy lại được. Thiếu tầng nào thì chưa tính là bằng chứng, chỉ là cảm nhận.",
                },
                {
                  so: 20,
                  tieuDe: "Hai đường lấy bằng chứng",
                  noiDung:
                    "Đường thứ nhất là hỏi người thật, cần đủ số lượng để một hai ý kiến lệch không đổi được kết luận. Đường thứ hai là đếm trên dữ liệu, cần số đếm được kèm ví dụ nguyên văn và phương pháp kiểm lại được.",
                },
                {
                  so: 21,
                  tieuDe: "Tính impact",
                  noiDung:
                    "Impact tính bằng số người bị ảnh hưởng nhân tần suất nhân chi phí mỗi lần. Nếu một trong ba số đó không ước lượng được thì bài toán chưa đủ rõ để làm.",
                },
              ],
            },
          ],
        },
        {
          day: "Day 03 đến Day 06: Xây và kiểm",
          items: [
            {
              id: "day3-1",
              ten: "Viết AI Spec",
              phu: "Tài liệu chốt trước khi build",
              trang: [
                {
                  so: 22,
                  tieuDe: "Spec gồm những gì",
                  noiDung:
                    "AI Spec mô tả: người dùng và công việc, vấn đề và bằng chứng, lát cắt sẽ làm, mức tự động hóa, các tình huống lỗi, và tiêu chí kiểm thử. Spec là chỗ chốt, không phải chỗ mô tả mong muốn.",
                },
                {
                  so: 23,
                  tieuDe: "Lát cắt là một câu",
                  noiDung:
                    "Lát cắt gồm bốn phần: một người dùng, một công việc, một quyết định AI, một kết quả. Nếu đọc xong không biết demo bấm vào đâu, gõ gì, ra gì thì lát cắt còn chưa đủ sắc.",
                },
                {
                  so: 24,
                  tieuDe: "Bốn lớp chỗ khó",
                  noiDung:
                    "Với mỗi sản phẩm AI cần viết riêng bốn lớp: chỗ mô hình dễ sai, chỗ dữ liệu thiếu, chỗ người dùng dùng sai cách, và chỗ hệ thống hỏng. Chép lại định nghĩa chung mà không gắn vào sản phẩm của mình thì không tính.",
                },
              ],
            },
            {
              id: "day3-2",
              ten: "Kiểm thử và đánh giá",
              phu: "Golden set, quality bar, bảng kết quả",
              trang: [
                {
                  so: 25,
                  tieuDe: "Golden set",
                  noiDung:
                    "Golden set là bộ câu thử có đáp án biết trước, dùng để đo chất lượng hệ thống. Bộ này phải có cả câu dễ và câu khó, và phải có câu mà hệ thống đúng ra nên từ chối trả lời.",
                },
                {
                  so: 26,
                  tieuDe: "Benchmark riêng cho từng bài toán",
                  noiDung:
                    "Không có bộ benchmark chung nào khớp đúng việc của bạn, nên mỗi bài toán thường phải tự dựng benchmark riêng. Điều quan trọng là bộ đó cố định, không sửa sau khi thấy kết quả.",
                },
                {
                  so: 27,
                  tieuDe: "Quality bar bằng con số",
                  noiDung:
                    "Quality bar là ngưỡng đạt, viết bằng con số và chốt trước khi chạy. Ví dụ: đạt khi ít nhất 80 phần trăm câu trong bộ 20 câu trả lời đúng và có dẫn trang. Ghi kết quả trung thực 13 trên 21 vẫn được tính đủ, còn ghi 100 phần trăm mà bảng chỉ có 8 dòng thì không.",
                },
              ],
            },
          ],
        },
      ];

if (typeof globalThis !== 'undefined') globalThis.TAI_LIEU = TAI_LIEU;
