import json
import os
from typing import List, Dict

# Đường dẫn file
EVAL_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(EVAL_DIR, 'test_cases.json')

def load_test_cases(filepath: str) -> List[Dict]:
    """Đọc bộ câu hỏi từ file JSON với chuẩn encoding UTF-8."""
    if not os.path.exists(filepath):
        print(f"[-] Không tìm thấy file: {filepath}")
        return []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def call_ai_product(input_text: str, context: str) -> str:
    """
    Hàm mô phỏng (Mock) việc gọi vào sản phẩm AI của nhóm (Backend/Gemini API).
    Hiện tại trả về kết quả cứng để test luồng chạy.
    """
    # TODO: Tích hợp API gọi thực tế đến backend Node.js hoặc Gemini API tại đây.
    if "giải hộ" in input_text.lower():
        return "Từ chối giải bài, gợi ý phương pháp."
    elif "hạn chót" in input_text.lower():
        return "23:59 ngày 31/07."
    else:
        return "Câu trả lời từ AI..."

def evaluate_run():
    """Chạy toàn bộ test cases và chấm điểm."""
    test_cases = load_test_cases(DATA_FILE)
    if not test_cases:
        return

    total = len(test_cases)
    passed = 0
    failed_cases = []

    print(f"\n🚀 BẮT ĐẦU CHẠY ĐÁNH GIÁ (EVALUATION) - TỔNG: {total} CÂU\n" + "="*50)

    for case in test_cases:
        print(f"Đang chạy ID {case['id']} - Kiểu: {case['type']}...")
        
        # Gọi sản phẩm
        ai_response = call_ai_product(case['input'], case['context'])
        
        # Ở đây hiện tại mô phỏng chấm điểm bằng cách AI sinh ra text có chứa keywords không.
        # Bạn có thể dùng chính Gemini (LLM-as-a-judge) để so khớp `ai_response` và `expected_behavior`.
        
        # MOCK CHẤM ĐIỂM: Mặc định cho pass một số câu để ra tỉ lệ demo
        is_pass = False
        if "Từ chối" in ai_response or "31/07" in ai_response:
            is_pass = True
        
        if is_pass:
            passed += 1
        else:
            failed_cases.append({
                "id": case['id'],
                "input": case['input'],
                "expected": case['expected_behavior'],
                "actual": ai_response
            })

    # In kết quả
    print("\n" + "="*50)
    print("📊 KẾT QUẢ TỔNG QUAN")
    print(f"Số câu Pass: {passed}/{total}")
    print(f"Tỉ lệ đạt:  {(passed/total)*100:.1f}%")
    
    if failed_cases:
        print("\n❌ CÁC CÂU FAIL (Cần xem xét):")
        for f in failed_cases:
            print(f"  - Câu ID {f['id']}: Đưa vào '{f['input']}'")
            print(f"    Expected: {f['expected']}")
            print(f"    Actual:   {f['actual']}")
            print("-" * 30)

if __name__ == "__main__":
    evaluate_run()