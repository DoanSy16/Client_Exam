app.controller("MainCtrl", function($scope, $location) {
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };


//     JSON.parse(`{
//     "question_id": 1,
//     "text_question": "Lệnh nào sẽ huỷ lệnh khởi động lại hệ điều hành trước đó trong Linux?",
//     "source_image": [
//         {
//             "image_id": 1,
//             "source_image": "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=300",
//             "content": "SDASD"
//         }
//     ],
//     "count_image": 1,
//     "Answers_Text": [
//         {
//             "answer_option_id": 1,
//             "text_answer": "Restart",
//             "image_answer": "No Image Available"
//         },
//         {
//             "answer_option_id": 2,
//             "text_answer": "Shutdown –c",
//             "image_answer": "No Image Available"
//         },
//         {
//             "answer_option_id": 3,
//             "text_answer": "Halt",
//             "image_answer": "No Image Available"
//         },
//         {
//             "answer_option_id": 4,
//             "text_answer": "Shutdown –r",
//             "image_answer": "No Image Available"
//         }
//     ],
//     "correct_answer": [
//         {
//             "correct_answer_id": 1,
//             "question_id": 1,
//             "correct_answer": "2"
//         }
//     ],
//     "level_id": 1,
//     "type_question_id": 1,
//     "type_question_name": "Câu hỏi trắc nghiệm",
//     "name_level": "Dễ",
//     "fullname": "admin"
// }`)
});