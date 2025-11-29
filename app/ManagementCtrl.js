app.controller("ManagementCtrl", function ($scope) {
    $scope.exam = {
        "examId": "DE-1",
        "isSelected": "LT5240001811232",
        "nameSelected": "Đoàn Sỹ",
        "statusExam": false,
        "selectedDocument": false,
        "questions": [
            {
                "question_id": 3,
                "text_question": "Tập tin có dấu “.” phía trước có đặc tính gì đặc biệt?",
                "source_image": [],
                "Answers_Text": [
                    {
                        "answer_option_id": 2,
                        "text_answer": "Tập tin thực thi",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 1,
                        "text_answer": "Tập tin ẩn",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 3,
                        "text_answer": "Tập tin liên kết",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 4,
                        "text_answer": "Tập tin chỉ đọc",
                        "image_answer": "No Image Available"
                    }
                ],
                "correct_answer": [
                    {
                        "correct_answer": 2
                    }
                ],
                "level_id": 1,
                "type_question_id": 1,
                "type_question_name": "Câu hỏi trắc nghiệm",
                "selected": true
            },
            {
                "question_id": 1,
                "text_question": "Lệnh nào sẽ huỷ lệnh khởi động lại hệ điều hành trước đó trong Linux?",
                "source_image": [
                    {
                        "image_id": 1,
                        "source_image": "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=300",
                        "content": "SDASD",
                        "$$hashKey": "object:16"
                    },
                ],
                "Answers_Text": [
                    {
                        "answer_option_id": 4,
                        "text_answer": "Shutdown –r",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 3,
                        "text_answer": "Halt",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 2,
                        "text_answer": "Shutdown –c",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 1,
                        "text_answer": "Restart",
                        "image_answer": "No Image Available"
                    }
                ],
                "correct_answer": [
                    {
                        "correct_answer": 4
                    }
                ],
                "level_id": 1,
                "type_question_id": 1,
                "type_question_name": "Câu hỏi trắc nghiệm",
                "selected": true
            },
            {
                "question_id": 2,
                "text_question": "Tạo file và nhập nội dung với lệnh cat>name_of_file. Kết thúc lệnh này bằng tổ hợp phím?",
                "source_image": [],
                "Answers_Text": [
                    {
                        "answer_option_id": 4,
                        "text_answer": "Crtl + X",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 3,
                        "text_answer": "Crtl + C",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 1,
                        "text_answer": "Crtl + R",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 2,
                        "text_answer": "Crtl + D",
                        "image_answer": "No Image Available"
                    }
                ],
                "correct_answer": [
                    {
                        "correct_answer": 3
                    }
                ],
                "level_id": 1,
                "type_question_id": 1,
                "type_question_name": "Câu hỏi trắc nghiệm",
                "selected": true
            },
            {
                "question_id": 4,
                "text_question": "Trong hệ thống Linux, user nào có quyền cao nhất?",
                "source_image": [],
                "Answers_Text": [
                    {
                        "answer_option_id": 3,
                        "text_answer": "User có UID=0",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 1,
                        "text_answer": "User administrator",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 4,
                        "text_answer": "User root",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 2,
                        "text_answer": "User admin",
                        "image_answer": "No Image Available"
                    }
                ],
                "correct_answer": [
                    {
                        "correct_answer": 1
                    }
                ],
                "level_id": 1,
                "type_question_id": 1,
                "type_question_name": "Câu hỏi trắc nghiệm",
                "selected": true
            },
            {
                "question_id": 5,
                "text_question": "Lệnh ls -lr /etc thực hiện hành động gì?",
                "source_image": [],
                "Answers_Text": [
                    {
                        "answer_option_id": 2,
                        "text_answer": "Liệt kê đệ quy thư mục con /etc và sắp xếp theo chiều ngược lại",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 3,
                        "text_answer": "Liệt kê thư mục /etc theo liên kết tượng trưng và sắp xếp theo chiều ngược lại",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 4,
                        "text_answer": "Tất cả các câu trên đều đúng",
                        "image_answer": "No Image Available"
                    },
                    {
                        "answer_option_id": 1,
                        "text_answer": "Liệt kê và sắp xếp nội dung thư mục /etc theo chiều ngược lại",
                        "image_answer": "No Image Available"
                    }
                ],
                "correct_answer": [
                    {
                        "correct_answer": 3
                    }
                ],
                "level_id": 1,
                "type_question_id": 1,
                "type_question_name": "Câu hỏi trắc nghiệm",
                "selected": true
            }
        ],
        "$$hashKey": "object:826",
        "classNameSelected": "L24_TH01",
        "time": 5,
        "countQuestions": 5,
        "discipline_name": "HỆ ĐIỀU HÀNH",
        "discipline_id": 1,
        "roomId": "hrY-oGR-kDo",
        "timeUsed": 23,
        "submissionTime": "2025-10-17T02:00:53.501Z",
        "mark": "0.00"

    };
    $scope.getOptionLetter = function (index) {
        return String.fromCharCode(65 + index); // A, B, C, D
    };
    $scope.exportPDF = function () {
        var element = document.getElementById('examPdf');
        var opt = {
            margin: 10,
            filename: 'de-thi-' + $scope.exam.nameSelected + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };
});
