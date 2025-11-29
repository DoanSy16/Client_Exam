app.controller("ExamPDFCtrl", function ($scope) {
    $scope.exam = {
    "examId": "DE-1",
    "isSelected": "LT524000181",
    "nameSelected": "Đoàn Sỹ",
    "statusExam": true,
    "selectedDocument": false,
    "questions": [
        {
            "question_id": 26,
            "text_question": "Lệnh nào sau đây dùng để thay đổi quyền truy cập cho nhiều tập tin cùng lúc?",
            "source_image": [],
            "Answers_Text": [
                {
                    "answer_option_id": 1,
                    "text_answer": "chmod file1 file2",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 4,
                    "text_answer": "chmod --all",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 2,
                    "text_answer": "chmod +x *.sh",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 3,
                    "text_answer": "chmod -R file1 file2",
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
            "type_question_name": "Câu hỏi trắc nghiệm"
        },
        {
            "question_id": 12,
            "text_question": "Để chép một file /tmp/hello.txt vào thư mục /tmp/hello/, ta phải làm lệnh nào sau đây?",
            "source_image": [],
            "Answers_Text": [
                {
                    "answer_option_id": 3,
                    "text_answer": "cp /tmp/hello.txt /tmp/hello",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 2,
                    "text_answer": "cp tmp/hello.txt /tmp/hello",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 1,
                    "text_answer": "copy /tmp/hello.txt /tmp/hello/",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 4,
                    "text_answer": "cp /tmp/hello.txt /tmp/hello/",
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
            "type_question_name": "Câu hỏi trắc nghiệm"
        },
        {
            "question_id": 14,
            "text_question": "Khi đặt thuộc tính cho tập tin như sau: -rwxr-x—x hello.sh, thì tập tin đó sẽ có thuộc tính tương ứng thư thế nào?",
            "source_image": [],
            "Answers_Text": [
                {
                    "answer_option_id": 3,
                    "text_answer": "751",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 1,
                    "text_answer": "770",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 4,
                    "text_answer": "711",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 2,
                    "text_answer": "644",
                    "image_answer": "No Image Available"
                }
            ],
            "correct_answer": null,
            "level_id": 1,
            "type_question_id": 1,
            "type_question_name": "Câu hỏi trắc nghiệm"
        },
        {
            "question_id": 44,
            "text_question": "Để tìm tất cả dòng chứa từ \"error\" trong file /var/log/syslog, ta dùng:",
            "source_image": [],
            "Answers_Text": [
                {
                    "answer_option_id": 3,
                    "text_answer": "search error /var/log/syslog",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 1,
                    "text_answer": "grep error /var/log/syslog",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 2,
                    "text_answer": "find error /var/log/syslog",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 4,
                    "text_answer": "locate error /var/log/syslog",
                    "image_answer": "No Image Available"
                }
            ],
            "correct_answer": null,
            "level_id": 2,
            "type_question_id": 1,
            "type_question_name": "Câu hỏi trắc nghiệm"
        },
        {
            "question_id": 47,
            "text_question": "Thư mục /home dùng để lưu gì?",
            "source_image": [],
            "Answers_Text": [
                {
                    "answer_option_id": 2,
                    "text_answer": "Các file hệ thống quan trọng",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 4,
                    "text_answer": "Các thư viện hệ thống",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 1,
                    "text_answer": "Các file log hệ thống",
                    "image_answer": "No Image Available"
                },
                {
                    "answer_option_id": 3,
                    "text_answer": "Thư mục cá nhân của người dùng",
                    "image_answer": "No Image Available"
                }
            ],
            "correct_answer": null,
            "level_id": 2,
            "type_question_id": 1,
            "type_question_name": "Câu hỏi trắc nghiệm"
        }
    ],
    "$$hashKey": "object:890",
    "classNameSelected": "L24_TH01",
    "time": 5,
    "countQuestions": 5,
    "discipline_name": "HỆ ĐIỀU HÀNH",
    "discipline_id": 1,
    "roomId": "jjN-sfP-eNn"
};
    console.log($scope.exam)
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
