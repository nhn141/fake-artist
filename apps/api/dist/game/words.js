"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomCategoryAndWord = exports.wordCategories = void 0;
exports.wordCategories = {
    "Động vật": [
        "Chó", "Mèo", "Chuột", "Bò", "Lợn", "Gà", "Vịt", "Ngựa", "Dê", "Cừu",
        "Hổ", "Báo", "Sư tử", "Gấu", "Khỉ", "Voi", "Hươu cao cổ", "Ngựa vằn", "Tê giác", "Hà mã",
        "Lạc đà", "Thỏ", "Sóc", "Nhím", "Dơi", "Chim cánh cụt", "Đà điểu", "Rùa", "Rắn", "Cá sấu"
    ],
    "Trái cây & Rau củ": [
        "Táo", "Chuối", "Cam", "Nho", "Xoài", "Đu đủ", "Sầu riêng", "Mít", "Chôm chôm", "Nhãn",
        "Vải", "Thanh long", "Dưa hấu", "Dưa gang", "Dừa", "Dứa", "Cà chua", "Cà rốt", "Cải bắp", "Súp lơ",
        "Rau muống", "Rau mồng tơi", "Củ cải", "Khoai tây", "Khoai lang", "Hành tây", "Tỏi", "Ớt", "Gừng", "Nấm"
    ],
    "Nghề nghiệp": [
        "Bác sĩ", "Y tá", "Giáo viên", "Cảnh sát", "Lính cứu hỏa", "Kỹ sư", "Lập trình viên", "Nhà khoa học", "Nhà báo", "Nhiếp ảnh gia",
        "Đầu bếp", "Thợ làm bánh", "Ca sĩ", "Diễn viên", "Họa sĩ", "Nhạc sĩ", "Phi công", "Tiếp viên hàng không", "Tài xế", "Thợ cắt tóc",
        "Thợ sửa ống nước", "Thợ điện", "Thợ xây", "Nông dân", "Ngư dân", "Luật sư", "Thẩm phán", "Nhân viên văn phòng", "Bảo vệ", "Người giao hàng"
    ],
    "Đồ gia dụng": [
        "Tivi", "Tủ lạnh", "Máy giặt", "Máy lạnh", "Quạt máy", "Bếp gas", "Bếp từ", "Lò vi sóng", "Nồi cơm điện", "Máy xay sinh tố",
        "Ấm đun nước", "Bàn ủi", "Máy hút bụi", "Chổi", "Hót rác", "Cây lau nhà", "Bàn", "Ghế", "Giường", "Tủ quần áo",
        "Gương", "Đèn bàn", "Đèn trần", "Đồng hồ treo", "Bình hoa", "Rèm cửa", "Thảm", "Gối", "Chăn", "Màn"
    ],
    "Giao thông": [
        "Xe đạp", "Xe máy", "Xe ô tô", "Xe buýt", "Xe khách", "Xe tải", "Xe lu", "Xe máy xúc", "Xe cứu thương", "Xe cứu hỏa",
        "Xe cảnh sát", "Xe rác", "Tàu hỏa", "Tàu điện ngầm", "Máy bay", "Trực thăng", "Khinh khí cầu", "Tàu thủy", "Thuyền", "Phà",
        "Ca nô", "Tàu ngầm", "Tàu vũ trụ", "Xe ba gác", "Xe xích lô", "Xe bò", "Ván trượt", "Patin", "Xe trượt tuyết", "Xe đẩy em bé"
    ],
    "Quần áo & Trang sức": [
        "Áo sơ mi", "Áo thun", "Áo khoác", "Áo len", "Áo hoodie", "Quần jean", "Quần tây", "Quần đùi", "Quần lót", "Váy liền",
        "Chân váy", "Đầm dạ hội", "Áo dài", "Kimono", "Hanbok", "Mũ lưỡi trai", "Mũ len", "Nón lá", "Găng tay", "Khăn choàng",
        "Bít tất", "Giày thể thao", "Giày cao gót", "Dép lào", "Ủng", "Cà vạt", "Thắt lưng", "Kính râm", "Đồng hồ", "Dây chuyền"
    ],
    "Đồ ăn & Đồ uống": [
        "Cơm", "Phở", "Bún bò", "Hủ tiếu", "Bánh mì", "Bánh cuốn", "Bánh xèo", "Bánh chưng", "Nem rán", "Gà rán",
        "Khoai tây chiên", "Pizza", "Hamburger", "Sushi", "Kimchi", "Lẩu", "Đồ nướng", "Xúc xích", "Bò bít tết", "Salad",
        "Trà sữa", "Cà phê", "Nước cam", "Nước dừa", "Nước chanh", "Nước ép táo", "Sinh tố bơ", "Bia", "Rượu vang", "Kem"
    ],
    "Nhạc cụ": [
        "Đàn ghi-ta", "Đàn piano", "Đàn organ", "Đàn vĩ cầm", "Đàn trung cầm", "Đàn tranh", "Đàn bầu", "Đàn nhị", "Sáo trúc", "Kèn trumpet",
        "Kèn saxophone", "Kèn harmonica", "Trống dàn", "Trống bongo", "Trống lục lạc", "Chiêng", "Cồng", "Đàn T'rưng", "Đàn Ukulele", "Đàn Harp",
        "Đàn Accordion", "Kèn túi", "Mõ", "Phách", "Kastanet", "Xylophone", "Đàn Lute", "Đàn Mandolin", "Kèn Oboe", "Đàn Banjo"
    ],
    "Thể thao": [
        "Bóng đá", "Bóng rổ", "Bóng chuyền", "Bóng bàn", "Bóng chày", "Bóng bầu dục", "Quần vợt", "Cầu lông", "Golf", "Bơi lội",
        "Điền kinh", "Thể dục dụng cụ", "Cử tạ", "Quyền anh", "Judo", "Taekwondo", "Karate", "Đấu kiếm", "Bắn cung", "Trượt tuyết",
        "Trượt băng", "Lướt ván", "Chèo thuyền", "Đua xe đạp", "Đua xe đua", "Leo núi", "Bi-da", "Bowling", "Cờ vua", "Cờ tướng"
    ],
    "Văn phòng phẩm": [
        "Bút bi", "Bút mực", "Bút chì", "Bút dạ quang", "Bút xóa", "Tẩy", "Thước kẻ", "Compa", "Kéo", "Hồ dán",
        "Băng dính", "Giấy A4", "Vở ô ly", "Sách giáo khoa", "Balo", "Cặp xách", "Máy tính bỏ túi", "Bảng đen", "Phấn", "Giẻ lau bảng",
        "Kẹp ghim", "Dập ghim", "Đục lỗ", "Bìa hồ sơ", "Giấy nhớ", "Bàn phím", "Chuột máy tính", "Máy in", "Máy photo", "Con dấu"
    ],
    "Đồ công nghệ": [
        "Điện thoại", "Máy tính bảng", "Laptop", "Máy tính bàn", "Màn hình", "Bàn phím cơ", "Chuột không dây", "Tai nghe bluetooth", "Tai nghe chụp tai", "Loa bluetooth",
        "Sạc dự phòng", "Cáp sạc", "Củ sạc", "Webcam", "Micro", "Máy ảnh cơ", "Máy quay phim", "Flycam", "Kính VR", "Đồng hồ thông minh",
        "Vòng đeo tay", "Máy định vị GPS", "Ổ cứng di động", "USB", "Thẻ nhớ", "Modem wifi", "Máy đọc sách", "Máy chiếu", "Tivi thông minh", "Bút cảm ứng"
    ],
    "Cơ thể người": [
        "Đầu", "Tóc", "Trán", "Lông mày", "Mắt", "Lông mi", "Mũi", "Má", "Miệng", "Môi",
        "Răng", "Lưỡi", "Cằm", "Râu", "Cổ", "Vai", "Nách", "Cánh tay", "Khuỷu tay", "Bàn tay",
        "Ngón tay", "Ngực", "Bụng", "Lưng", "Mông", "Đùi", "Đầu gối", "Cẳng chân", "Bàn chân", "Ngón chân"
    ]
};
const getRandomCategoryAndWord = () => {
    const categories = Object.keys(exports.wordCategories);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const words = exports.wordCategories[randomCategory];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    return { category: randomCategory, word: randomWord };
};
exports.getRandomCategoryAndWord = getRandomCategoryAndWord;
//# sourceMappingURL=words.js.map