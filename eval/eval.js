// eval.js

// Hàm kiểm tra phản hồi từ Tutor
async function testTutorResponse(cauHoi, expectedResponse) {
    const response = await fetch('/api/tra-loi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cauHoi })
    });

    if (!response.ok) {
        throw new Error('Gọi AI thất bại: ' + response.status);
    }

    const result = await response.json();
    console.log('Kết quả:', result);
    console.assert(result.cauTraLoi === expectedResponse, 'Phản hồi không khớp!');
}

// Ví dụ sử dụng
(async () => {
    try {
        await testTutorResponse('LLM là gì?', 'Mô hình ngôn ngữ lớn là gì');
        console.log('Kiểm tra thành công!');
    } catch (error) {
        console.error('Kiểm tra thất bại:', error);
    }
})();
