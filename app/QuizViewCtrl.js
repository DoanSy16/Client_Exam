app.controller("QuizCtrl", function ($rootScope, $scope, ApiService, DataService, ToastService) {
    const userLogin = JSON.parse(localStorage.getItem('user'));
    $scope.data_exam_quiz = [];
    $scope.data_exam_quiz_temp = [];
    $scope.myFiles = [];
    $scope.myFilesTmp = [];
    $scope.previews = [];
    $scope.selectedQuestionTable = [];
    $scope.selectedQuestions = DataService.getHomeData("selectedQuestionsQuizs") || [];
    clear();


    $scope.triggerUpload = function () {
        document.getElementById("image-upload").click();
    };

    $scope.$watch("myFiles", function (newFiles) {
        if (!newFiles) return;

        if ($scope.fill_data_exam.source_image.length >= 6) {
            ToastService.show("Chỉ được chọn tối đa 6 ảnh!", "error");
            return;
        }

        const remaining = 6 - $scope.fill_data_exam.source_image.length;

        Array.from(newFiles).slice(0, remaining).forEach(file => {
            let reader = new FileReader();

            reader.onload = e => {
                $scope.$apply(() => {
                    $scope.fill_data_exam.source_image.push({
                        "image_id": "",
                        "source_image": e.target.result,
                        "content": "",
                        "answer_id": ""
                    });
                    $scope.myFilesTmp.push(file);
                    updateImageContent('');
                });
            };
            reader.readAsDataURL(file);
        });
    });

    function updateImageContent(ans) {
        const totalImages = $scope.fill_data_exam.source_image.length;
        const totalAnswer = $scope.fill_data_exam.Answers_Text.length || 0;
        let data = $scope.fill_data_exam.Answers_Text;

        $scope.fill_data_exam.source_image.forEach((img, index) => {
            let answerVal = data[index]?.text_answer || "";
            if (img.image_id == ans.image_answer_id ||(answerVal &&  $scope.fill_data_exam.source_image.length>1)) {
                img.content = answerVal || ans.text_answer;

            }
            if (totalImages > 1 && index < totalAnswer) {
                img.answer_id = index + 1;
            } else {
                img.answer_id = "";
            }
        });
    }

    $scope.onAnswerChange = function (val) {
        updateImageContent(val)
    }



    watchRoot("Disciplines", "h_Disciplines", "selectedDiscipline");
    watchRoot("level_questions", "h_level_questions", "fill_data_exam.level_id");
    watchRoot("type_questions", "h_type_question", "fill_data_exam.type_question_id");

    $scope.addQuestion = function (status) {
        let errs = validateQuestion($scope.fill_data_exam);
        if (errs.length > 0) {
            ToastService.show("Có lỗi:\n" + errs.join("\n"), "error");
            return;
        }
        let id = $scope.fill_data_exam.question_id;
        let noti = "";
        if (status) {
            $scope.fill_data_exam.question_id = null;
            noti = "Đã thêm câu hỏi!";
        }
        else {
            $scope.fill_data_exam.question_id = id;
            noti = "Đã cập nhật câu hỏi!";
        }
        $scope.fill_data_exam.discipline_id = $scope.selectedDiscipline.discipline_id;
        ApiService.postInsertData($scope.fill_data_exam, $scope.myFilesTmp)
            .then(function (response) {
                if (response.status == 200) {
                    ToastService.show(noti, "success");
                    $scope.data_exam_quiz = (response.data).data;
                    $scope.data_exam_quiz_temp = angular.copy($scope.data_exam_quiz);
                    clear();
                }

            })
            .catch(function (err) {
                console.error("Lỗi khi load data Disciplines quiz view :", err);
            });
    }

    $scope.deleteQuestions = function (id, text) {
        Swal.fire({
            title:
                `<h2 style='color:red; font-size=10px'>Bạn có muốn xóa câu hỏi: "${text}"?</h2>`,
            html: '<img src="images/Confused.jpg" style="width:200px">',
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Có",
            cancelButtonText: "Không",
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                ApiService.deleteQuestions(id, $scope.selectedDiscipline.discipline_id)
                    .then(function (response) {
                        $scope.data_exam_quiz = (response.data).data;
                        $scope.data_exam_quiz_temp = angular.copy($scope.data_exam_quiz);
                        ToastService.show('Xóa thành công', "success");
                        clear();
                    })
                    .catch(function (err) {
                        console.error("Lỗi khi delete data :", err);
                    });
            }
        });
    }

    $scope.saveQuestion = function () {

    }



    $scope.toggleQuestionSelection = function (id) {
        const idx = $scope.selectedQuestions.indexOf(id);

        if (idx === -1) {
            $scope.selectedQuestions.push(id);
        } else {
            $scope.selectedQuestions.splice(idx, 1);
        }
        $scope.fill_data_exam.correct_answer = $scope.selectedQuestions.map((ansId, index) => {
            return {
                correct_answer_id: index + 1,
                question_id: $scope.fill_data_exam.question_id,
                correct_answer: ansId
            };
        });

    };



    $scope.answerArr = function (id) {
        const map = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        return map[id - 1] || id;
    };

    $scope.addAnswer = function () {
        if ($scope.fill_data_exam.Answers_Text.length >= 6) return;
        $scope.fill_data_exam.Answers_Text.push({
            "answer_option_id": $scope.fill_data_exam.Answers_Text.length + 1,
            "text_answer": "",
            "image_answer": "No Image Available"
        });
        updateImageContent('');
    };


    $scope.removeAnswer = function (index) {
        if ($scope.fill_data_exam.Answers_Text.length <= 2) return;
        $scope.fill_data_exam.Answers_Text.splice(index, 1);
        $scope.fill_data_exam.Answers_Text.forEach((ans, i) => ans.answer_option_id = i + 1);
        updateImageContent('');
    };
    $scope.confirmAnswer = function (id) {
        $scope.fill_data_exam.correct_answer[0].correct_answer = id
    }
    $scope.removeImage = function (source_image) {
        let index = $scope.fill_data_exam.source_image.findIndex(
            img => img.source_image === source_image
        );

        if (index !== -1) {
            $scope.fill_data_exam.source_image.splice(index, 1);
            $scope.myFilesTmp.splice(index, 1);
        }
        updateImageContent('');
        ToastService.show("Đã xóa hình ảnh!", "success");
    }


    $scope.logDiscipline = function (value) {
        load_data_discipline(value);
    };

    $scope.getDifficultyClass = function (difficulty) {
        const classMap = {
            'Dễ': 'status-online',
            'Trung bình': 'status-testing',
            'Khó': 'status-offline'
        };
        return classMap[difficulty] || 'status-online';
    }

    $scope.logLevel = function (value) {
        $scope.data_exam_quiz[0].level_id = value
    };

    $scope.logTypeQuestion = function (value) {
        $scope.fill_data_exam.correct_answer = [];
        $scope.selectedQuestionTable = [];
        $scope.fill_data_exam.correct_answer.push({
            "correct_answer_id": 1,
            "question_id": "",
            "correct_answer": ""
        });


        $scope.data_exam_quiz[0].type_question_id = value
    };


    $scope.load_data_ctrl = function (id) {
        // $scope.fill_data_exam = $scope.data_exam_quiz_temp[id];
        $scope.fill_data_exam = angular.copy($scope.data_exam_quiz_temp[id]);
        $scope.fill_data_exam.user_id = userLogin.user_id;
        updateImageContent('');
    }

    function load_data_discipline(value) {
        $scope.selectedDiscipline = value;
        $scope.selectedQuestionTable = [];
        ApiService.getQuestions(value.discipline_id)
            .then(function (response) {
                $scope.data_exam_quiz = (response.data).data;
                $scope.data_exam_quiz_temp = angular.copy($scope.data_exam_quiz);
            })
            .catch(function (err) {
                console.error("Lỗi khi load data Disciplines quiz view :", err);
            });
    }
    function watchRoot(varName, targetScopeVar, defaultSelect) {

        $scope.$watch(
            function () {
                return $rootScope[varName];
            },
            function (newVal) {
                if (newVal && newVal.length > 0) {
                    $scope[targetScopeVar] = newVal;
                    if (defaultSelect) {

                        if (newVal[0].level_id !== undefined) {
                            $scope[defaultSelect] = angular.copy($scope.fill_data_exam.level_id || DataService.getHomeData("level") || newVal[0].level_id);
                        } else if (newVal[0].discipline_id !== undefined) {
                            $scope[defaultSelect] = angular.copy(DataService.getHomeData("Disciplines") || newVal[0].discipline_id);
                            $scope.selectedDiscipline = $scope.h_Disciplines[0];
                            load_data_discipline($scope[defaultSelect]);

                        }
                        else if (newVal[0].type_question_id !== undefined) {
                            $scope[defaultSelect] = angular.copy($scope.fill_data_exam.type_question_id || DataService.getHomeData("type_questions") || newVal[0].type_question_id);
                            // load_data_discipline($scope[defaultSelect]);

                        }
                        else {
                            $scope[defaultSelect] = angular.copy(newVal[0]);
                        }
                    }

                }
            }
        );
    }


    $scope.clearForm = function () {
        clear();
    }

    function validateQuestion(q) {
        let errors = [];

        if (!q.text_question || q.text_question.trim() === "") {
            errors.push("Nội dung câu hỏi không được để trống");
        }

        if (!q.Answers_Text || q.Answers_Text.length < 2) {
            errors.push("Phải có ít nhất 2 đáp án");
        } else {
            q.Answers_Text.forEach((a, i) => {
                if (!a.text_answer || a.text_answer.trim() === "") {
                    errors.push(`Đáp án ${i + 1} chưa có nội dung`);
                }
            });
        }

        if (q.type_question_id != 3 && (!q.correct_answer || !q.correct_answer[0].correct_answer)) {
            errors.push("Chưa chọn đáp án đúng");
        }

        return errors;
    }


    function clear() {
        $scope.myFiles = [];
        $scope.myFilesTmp = [];
        $scope.fill_data_exam = JSON.parse(`{
                "question_id": "",
                "text_question": "",
                "source_image": [],
                "count_image": "",
                "Answers_Text": [
                    {
                        "answer_option_id": 1,
                        "text_answer": "",
                        "image_answer": ""
                    },
                    {
                        "answer_option_id": 2,
                        "text_answer": "",
                        "image_answer": ""
                    }
                ],
                "correct_answer": [
                    {
                        "correct_answer_id": 1,
                        "question_id": "",
                        "correct_answer": ""
                    }
                ],
                "level_id": 1,
                "type_question_id": 1,
                "type_question_name": "Câu hỏi trắc nghiệm",
                "name_level": "Dễ",
                "fullname": "",
                "user_id":${userLogin.user_id}
            }`);
    }
    // data_exam_quiz_temp=
    $scope.search = function () {
        if ($scope.selectedQuestionTable.length > 0) {
            $scope.selectedQuestionTable = [];
        }
        if (!$scope.change_search || $scope.change_search.trim() === "") {
            $scope.data_exam_quiz_temp = angular.copy($scope.data_exam_quiz);
        } else {
            let keyword = $scope.change_search.toLowerCase();
            $scope.data_exam_quiz_temp = $scope.data_exam_quiz.filter(q =>
                q.text_question.toLowerCase().includes(keyword)
            );
        }
    };
    $scope.toggleQuestionSelectionTable = function (id) {
        const idx = $scope.selectedQuestionTable.indexOf(id);
        if (idx === -1) {
            $scope.selectedQuestionTable.push(id);
        } else {
            $scope.selectedQuestionTable.splice(idx, 1);
        }
        DataService.setHomeData("selectedQuestionsQuizs", $scope.selectedQuestionTable);
    }
    $scope.toggleSelectAll = function () {
        if (!$scope.data_exam_quiz_temp || !$scope.data_exam_quiz_temp.length) return;
        const allSelected = $scope.selectedQuestionTable.length === $scope.data_exam_quiz_temp.length;
        if (allSelected) {
            $scope.selectedQuestionTable = [];
        } else {
            $scope.selectedQuestionTable = $scope.data_exam_quiz_temp.map(d => d.question_id);
        }
        DataService.setHomeData("selectedQuestionsQuizs", $scope.selectedQuestionTable);
    }

    $scope.deleteChooseQuestions = function () {
        let content = '';
        let type = '';
        if ($scope.selectedQuestionTable && $scope.selectedQuestionTable.length === $scope.data_exam_quiz_temp.length) {
            content = `Bạn có muốn xóa tất cả câu hỏi của môn ${$scope.selectedDiscipline.name_discipline}?`;
            type = 'DELETE_ALL';
        } else {
            content = `Bạn có muốn xóa ${$scope.selectedQuestionTable.length} câu hỏi của môn ${$scope.selectedDiscipline.name_discipline}?`;
            type = 'DELETE_CHOOSE_QUESTION';
        }
        Swal.fire({
            title:
                `<h3 style='color:red; font-size=10px'>${content}</h3>`,
            html: '<img src="images/Confused.jpg" style="width:200px">',
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Có",
            cancelButtonText: "Không",
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                ApiService.deleteChooseQuestions($scope.selectedQuestionTable, $scope.selectedDiscipline.discipline_id, type)
                    .then(function (response) {
                        $scope.data_exam_quiz = (response.data).data;
                        $scope.data_exam_quiz_temp = angular.copy($scope.data_exam_quiz);
                        $scope.selectedQuestionTable = [];
                        ToastService.show('Xóa thành công', "success");
                        clear();
                    })
                    .catch(function (err) {
                        console.error("Lỗi khi delete all data :", err);
                    });
            }
        });
    }




    //import excel

    $scope.triggerExcelInput = function () {
        document.getElementById('excelFile').click();
    };
    $scope.onExcelSelected = function (files) {
        if (!files || files.length === 0) return;

        const file = files[0];
        const fileName = file.name.toLowerCase();

        //Kiểm tra phần mở rộng
        const allowedExtensions = [".xlsx", ".xls"];
        const isExcel = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!isExcel) {
            Swal.fire({
                icon: "error",
                title: "Sai định dạng!",
                text: "Vui lòng chọn file Excel (.xlsx hoặc .xls)",
                confirmButtonColor: "#3085d6",
            });
            // Xóa file sai
            document.getElementById("excelFile").value = "";
            return;
        }

        $scope.selectedFile = file;

        Swal.fire({
            title: "<h2 style='color:red;'>Bạn có muốn thêm câu hỏi?</h2>",
            html: '<img src="images/Confused.jpg" style="width:200px">',
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Có",
            cancelButtonText: "Không",
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope.readExcel(file);
            } else {
                document.getElementById("excelFile").value = "";
            }
        });
    };


    $scope.readExcel = function (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

            const header = sheet[0];
            if (!header || header.length < 6) {
                Swal.fire({
                    icon: "error",
                    title: "Không tìm thấy dòng tiêu đề!",
                    text: "File Excel cần có dòng tiêu đề như mẫu quy định.",
                });
                return;
            }

            const requiredColumns = [
                "STT",
                "CÂU HỎI (text_question)",
                "HÌNH (source_image)",
                "LOẠI CÂU HỎI(type_question_id)",
                "CẤP ĐỘ(level_id)",
                "CÂU TRẢ LỜI(text_answer)"
            ];

            const missing = requiredColumns.filter(c => !header.includes(c));
            if (missing.length > 0) {
                Swal.fire({
                    icon: "error",
                    title: "Sai định dạng Excel!",
                    html: "Thiếu cột: <b>" + missing.join(", ") + "</b>",
                });
                return;
            }

            Swal.fire({
                icon: "success",
                title: "File hợp lệ!",
                text: "Đã đọc đúng cấu trúc mẫu đề thi.",
            });

            $scope.fill_data_exam.discipline_id = $scope.selectedDiscipline.discipline_id;
            ApiService.postInsertDataExcel($scope.fill_data_exam, file)
                .then(function (response) {
                    if (response.status == 200) {
                        ToastService.show('Upload thành công', "success");
                        $scope.data_exam_quiz = (response.data).data;
                        $scope.data_exam_quiz_temp = angular.copy($scope.data_exam_quiz);
                        clear();
                    }

                })
                .catch(function (err) {
                    console.error("Lỗi khi load data Disciplines quiz view :", err);
                });
            document.getElementById("excelFile").value = "";
        };
        reader.readAsArrayBuffer(file);
    };


});
