app.controller("HomeViewCtrl", function ($scope, $rootScope, ApiService, DataService, SocketService, ToastService, ExamService, IndexedDBService, PDFService) {
    $scope.machines = parseInt(DataService.getHomeData("machines")) || 29;
    $scope.time = parseInt(DataService.getHomeData("time")) || 0;
    $scope.questions = [];
    $scope.countExamQuestions = parseInt(DataService.getHomeData("countExamQuestions")) || 0;
    $scope.selectedQuestions = DataService.getHomeData("selectedQuestions") || [];
    $scope.confirmSelectedQuestions = DataService.getHomeData("confirmSelectedQuestions") || [];
    $scope.code_room = DataService.getHomeData("codeRoom") ? DataService.getHomeData("codeRoom") : "";
    $scope.data_localStorage = DataService.getHomeData("data_localStorage") || localStorage.getItem("data_localStorage") || [];
    loadExamQuestion("exam_questions", 1);
    // $scope.data_exam_questions = localStorage.getItem("data_exam_questions") ? JSON.parse(localStorage.getItem("data_exam_questions")) : (ExamService.getAll() || []);
    // $scope.data_exam_questions = localStorage.getItem("data_exam_questions") ? JSON.parse(localStorage.getItem("data_exam_questions")) : (ExamService.getAll() || []);
    $scope.showViewAllQuestions = [];
    $scope.isStart = false;
    $scope.isCreate = false;
    $scope.document = [
        { id: true, name: 'Có sử dụng tài liệu' },
        { id: false, name: 'Không sử dụng tài liệu' }
    ]
    $scope.selectedDocument = false;


    async function loadExamQuestion(key, id) {
        try {
            // load data từ indexedDB
            const res = await IndexedDBService.get(key, id);
            if (res) {
                $scope.$apply(() => {
                    $scope.data_exam_questions = res.data;
                });
            } else {
                console.log("Không tìm thấy dữ liệu với key:", key);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function saveExamQuestion(storeName, id, data) {
        try {
            await IndexedDBService.save(storeName, { id, data });
        } catch (err) {
            console.error("Lưu dữ liệu thất bại:", err);
        }
    }



    async function removeExamQuestion(key, id) {
        try {
            await IndexedDBService.delete(key, id);
        } catch (err) {
            console.error("Xoá lỗi:", err);
        }
    }

    load_init_data();
    function load_init_data() {
        const data = JSON.parse(localStorage.getItem("data_localStorage"));
        if (data != null) {
            $scope.data_localStorage = data;
            $scope.time = data.time;
            $scope.machines = data.machines;
            $scope.selectedDiscipline = data.disciplines;
            $scope.selectedLevel = data.level;
            $scope.countExamQuestions = data.countExamQuestions;
            $scope.code_room = data.code_room || "";
            $scope.confirmSelectedQuestions = data.confirmSelectedQuestions;
            $scope.selectedQuestions = data.selectedQuestions;
            DataService.setHomeData("time", $scope.time);
            DataService.setHomeData("codeRoom", data.code_room)
            $scope.selectedDocument = data.selectedDocument;
            $scope.isStart = data.isStart;
            $scope.isCreate = data.isCreate;
        }

    }

    function updateDataLocalStorage() {
        const data = {
            time: $scope.time,
            machines: $scope.machines,
            disciplines: $scope.selectedDiscipline,
            level: $scope.selectedLevel,
            countExamQuestions: $scope.countExamQuestions,
            code_room: $scope.code_room,
            confirmSelectedQuestions: $scope.confirmSelectedQuestions,
            selectedQuestions: $scope.selectedQuestions,
            selectedDocument: $scope.selectedDocument,
            isStart: $scope.isStart,
            isCreate: $scope.isCreate
        }
        $scope.data_localStorage = JSON.stringify(data);
        DataService.setHomeData("data_localStorage", $scope.data_localStorage);
        localStorage.setItem("data_localStorage", $scope.data_localStorage);
    }
    $scope.logDocument = function (value) {
        $scope.selectedDocument = value;
        updateDataLocalStorage();
    }

    $scope.onMachinesChange = function () {
        if ($scope.machines < 1) {
            $scope.machines = 1;
        }
        DataService.setHomeData("machines", $scope.machines);
        updateDataLocalStorage()
    };
    $scope.onTimeChange = function () {
        if ($scope.time < 1) {
            $scope.time = 1;
        }
        DataService.setHomeData("time", $scope.time);
        updateDataLocalStorage()
    }
    $scope.onCountQuestionsChange = function () {
        if ($scope.countExamQuestions < 1) {
            $scope.countExamQuestions = 1;
        } else if ($scope.countExamQuestions >= $scope.confirmSelectedQuestions.length) {
            $scope.countExamQuestions = $scope.confirmSelectedQuestions.length
        }
        DataService.setHomeData("countExamQuestions", $scope.countExamQuestions);
        updateDataLocalStorage()
    }


    $scope.answerArr = function (id) {
        const map = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        return map[id - 1] || id;
    };

    $scope.room = [];
    for (let i = 1; i <= 16; i++) {
        $scope.room.push(i);
    }
    $scope.selectedRoom = $scope.room[parseInt(DataService.getHomeData("room")) || 0];



    watchRoot("level_questions", "h_level_questions", "selectedLevel");
    watchRoot("Disciplines", "h_Disciplines", "selectedDiscipline");
    updateDataLocalStorage()

    // trạng thái ban đầu: dialog đóng
    $scope.showSelectQuestionsDialog = false;
    $scope.showViewQuestionsDialog = false;

    // mở dialog
    $scope.fShowSelectQuestionsDialog = function () {
        $scope.showSelectQuestionsDialog = true;
    };
    $scope.fShowViewQuestionsDialog = function (value) {
        $scope.showViewQuestionsDialog = true;
        $scope.showViewAllQuestions = value;
    };

    // đóng dialog
    $scope.closeDialog = function () {
        $scope.showSelectQuestionsDialog = false;
    };
    $scope.closeViewQuestionsDialog = function () {
        $scope.showViewQuestionsDialog = false;
    };

    $scope.logDiscipline = function (value) {
        load_data_dialog(value);
    };
    $scope.logLevel = function (value) {
        DataService.setHomeData("level", value);
        $scope.selectedLevel = value;
        updateDataLocalStorage();
    };

    $scope.logRoom = function (value) {
        DataService.setHomeData("room", value - 1);

    };

    function load_data_dialog(value) {
        DataService.setHomeData("Disciplines", value);
        $scope.selectedDiscipline = value;
        updateDataLocalStorage();
        ApiService.getQuestions(value)
            .then(function (response) {
                $rootScope.Questions = (response.data).data;
                $scope.questions = $rootScope.Questions;
            })
            .catch(function (err) {
                console.error("Lỗi khi load data Disciplines:", err);
            });
    }

    $scope.getDifficultyClass = function (difficulty) {
        const classMap = {
            'Dễ': 'status-online',
            'Trung bình': 'status-testing',
            'Khó': 'status-offline'
        };
        return classMap[difficulty] || 'status-online';
    }

    //search 
    $scope.search = function () {
        if (!$scope.change_search || $scope.change_search.trim() === "") {
            $scope.questions = angular.copy($rootScope.Questions);
        } else {
            let keyword = $scope.change_search.toLowerCase();
            $scope.questions = $rootScope.Questions.filter(q =>
                q.text_question.toLowerCase().includes(keyword)
            );
        }
    };

    //lọc câu hỏi theo cấp độ
    $scope.log_dialog_difficulty_filter = function (value) {
        if (value == null) {
            $scope.questions = angular.copy($rootScope.Questions);
        } else {
            $scope.questions = $rootScope.Questions.filter(q =>
                q.level_id == value
            );
        }
    }

    //tăng giá trị
    $scope.adjustValue = function (inputId, delta) {
        if (inputId === 'time-input') {
            $scope.time = Math.max(1, Math.min(999, $scope.time + delta));
            DataService.setHomeData("time", $scope.time);
        } else if (inputId === 'question-count-input') {
            $scope.countExamQuestions = Math.max(0, Math.min($scope.confirmSelectedQuestions.length, $scope.countExamQuestions + delta));
            DataService.setHomeData("countExamQuestions", $scope.countExamQuestions);
        }
        updateDataLocalStorage()

    }


    //theo dõi rootScope
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
                            $scope[defaultSelect] = angular.copy($scope.selectedLevel || DataService.getHomeData("level") || newVal[0].level_id);
                        } else if (newVal[0].discipline_id !== undefined) {
                            $scope[defaultSelect] = angular.copy($scope.selectedDiscipline || DataService.getHomeData("Disciplines") || newVal[0].discipline_id);
                            load_data_dialog($scope[defaultSelect]);
                        } else {
                            $scope[defaultSelect] = angular.copy(newVal[0]);
                        }
                    }

                }
            }
        );
    }
    let lastExam = []; // lưu đề trước

    function shuffle(array) {
        let a = [...array];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    // trộn đáp án trong 1 câu hỏi
    function shuffleAnswers(question) {
        return {
            ...question,
            Answers_Text: shuffle(question.Answers_Text)
        };
    }

    function getExam(total, type, questions) {
        const examConfig = {
            1: { easy: 0.5, medium: 0.3, hard: 0.2 }, // đề dễ
            2: { easy: 0.3, medium: 0.4, hard: 0.3 }, // đề trung bình
            3: { easy: 0.2, medium: 0.3, hard: 0.5 }  // đề khó
        };

        const config = examConfig[type];
        if (!config) {
            ToastService.show("Đề không hợp lệ!", "error");
            return [];
        }

        // Tính số lượng dự kiến mỗi level
        let counts = {
            easy: Math.round(total * config.easy),
            medium: Math.round(total * config.medium),
            hard: total
        };
        counts.hard = total - counts.easy - counts.medium;

        // Lấy danh sách từng loại level
        const easyQs = shuffle(questions.filter(q => q.level_id === 1));
        const mediumQs = shuffle(questions.filter(q => q.level_id === 2));
        const hardQs = shuffle(questions.filter(q => q.level_id === 3));

        function pick(qs, needed) {
            return qs.slice(0, Math.min(qs.length, needed));
        }

        let exam = [];
        let tries = 0;

        do {
            // ---- Sinh đề mới ----
            exam = [];
            exam = exam.concat(pick(easyQs, counts.easy));
            exam = exam.concat(pick(mediumQs, counts.medium));
            exam = exam.concat(pick(hardQs, counts.hard));

            let missing = total - exam.length;
            if (missing > 0) {
                const remaining = shuffle([
                    ...easyQs.slice(counts.easy),
                    ...mediumQs.slice(counts.medium),
                    ...hardQs.slice(counts.hard)
                ]);
                exam = exam.concat(remaining.slice(0, missing));
            }

            // ---- Kiểm tra trùng với đề trước ----
            let overlap = exam.some(q1 => lastExam.some(q2 => q1.question_id === q2.question_id));

            if (!overlap) break;
            tries++;
        } while (tries < 20);

        lastExam = exam; // lưu lại đề vừa tạo
        return exam.map(q => shuffleAnswers(q));
    }
    function create_new_exam_questions() {
        $scope.data_exam_questions = [];
        for (let i = 0; i < $scope.machines; i++) {
            const exam = getExam($scope.countExamQuestions, $scope.selectedLevel, $scope.confirmSelectedQuestions);
            $scope.data_exam_questions.push({
                examId: `DE-${i + 1}`,
                isSelected: "",
                nameSelected: "",
                statusExam: true,
                selectedDocument: $scope.selectedDocument,
                questions: exam
            });
        }
        ExamService.setAll($scope.data_exam_questions);
        saveExamQuestion("exam_questions", 1, $scope.data_exam_questions);
        // DataService.setHomeData("data_exam_questions", $scope.data_exam_questions);
        // localStorage.setItem("data_exam_questions", JSON.stringify($scope.data_exam_questions));
        // IndexedDBService.save("exam_questions", {
        //     id: 1,
        //     data: $scope.data_exam_questions
        // });

        ToastService.show(`Đã tạo ${$scope.data_exam_questions.length} đề thi`, "success");

    }

    $scope.exam = {
        createCodeRoom: function () {
            if ($scope.code_room === "" || $scope.code_room.length == 0) {
                ApiService.createCodeRoom()
                    .then(function (response) {
                        const data = response.data;
                        $scope.code_room = data.code;
                        DataService.setHomeData("codeRoom", $scope.code_room);
                        updateDataLocalStorage();
                    })
                    .catch(function (err) {
                        console.error("Lỗi khi tạo code room:", err);
                    });
            } else {
                ToastService.show("Không thể tạo thêm phòng", "error");
            }

        },
        toggleQuestionSelection: function (id) {
            const idx = $scope.selectedQuestions.indexOf(id);
            if (idx === -1) {
                $scope.selectedQuestions.push(id);
            } else {
                $scope.selectedQuestions.splice(idx, 1);
            }
            DataService.setHomeData("selectedQuestions", $scope.selectedQuestions);
            updateDataLocalStorage()
        },
        toggleSelectAll: function () {
            $scope.selectedQuestions = $scope.questions.map(q => q.question_id);
            DataService.setHomeData("selectedQuestions", $scope.selectedQuestions);
            updateDataLocalStorage();
        },
        confirmQuestions: function () {
            $scope.confirmSelectedQuestions = $scope.selectedQuestions.map(id => {
                const q = $scope.questions.find(item => item.question_id === id);
                if (!q) return null;

                let filtered = angular.copy(q);
                filtered.correct_answer = null;
                // delete filtered.level_id;
                delete filtered.name_level;
                delete filtered.fullname;
                delete filtered.count_image;
                return filtered;
            }).filter(q => q !== null);
            $scope.countExamQuestions = $scope.confirmSelectedQuestions.length;
            DataService.setHomeData("countExamQuestions", $scope.countExamQuestions);
            DataService.setHomeData("confirmSelectedQuestions", $scope.confirmSelectedQuestions);
            updateDataLocalStorage();
            ToastService.show(`Đã đã chọn ${$scope.confirmSelectedQuestions.length} câu hỏi!`, "success");
            $scope.showSelectQuestionsDialog = false;
        },
        clearSelectedQuestions: function () {
            $scope.selectedQuestions = [];
            $scope.confirmSelectedQuestions = [];
            DataService.setHomeData("selectedQuestions", $scope.selectedQuestions);
            DataService.setHomeData("confirmSelectedQuestions", $scope.confirmSelectedQuestions);
            updateDataLocalStorage()
        },
        createExamQuestions: function () {
            if ($scope.time == 0) {
                ToastService.show("Vui lòng chọn thời gian!", "error");
            }
            else if ($scope.confirmSelectedQuestions.length == 0) {
                ToastService.show("Vui lòng chọn câu hỏi!", "error");
            } else if ($scope.code_room.length == 0) {
                ToastService.show("Vui lòng tạo phòng kiểm tra!", "error");
            } else if ($scope.countExamQuestions == 0) {
                ToastService.show("Vui lòng chọn số câu hỏi!", "error");
            } else {
                if ($scope.data_exam_questions == null || $scope.data_exam_questions.length == 0) {
                    create_new_exam_questions();

                } else {
                    Swal.fire({
                        title:
                            "<h2 style='color:red; font-size=10px'>Bạn có muốn tạo lại đề thi mới?</h2>",
                        html: '<img src="images/Confused.jpg" style="width:200px">',
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#3085d6",
                        confirmButtonText: "Có",
                        cancelButtonText: "Không",
                        allowOutsideClick: false,
                    }).then((result) => {
                        if (result.value) {
                            removeLocalstorage();
                            create_new_exam_questions();
                        }
                    });
                }
                $scope.isCreate = true;
                updateDataLocalStorage();
            }
        }, deleteExamQuestion: function (id) {
            Swal.fire({
                title:
                    "<h2 style='color:red; font-size=10px'>Bạn có muốn xóa đề thi không?</h2>",
                html: '<img src="images/Confused.jpg" style="width:200px">',
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Có",
                cancelButtonText: "Không",
                allowOutsideClick: false,
            }).then((result) => {
                if (result.value) {
                    $scope.data_exam_questions = $scope.data_exam_questions.filter(exam => exam.examId !== id);
                    ExamService.setAll($scope.data_exam_questions);
                    saveExamQuestion("exam_questions", 1, $scope.data_exam_questions);
                    ToastService.show(`Đã xóa đề thi ${id}`, "success");
                }
            });
        }, deleteAllExamQuestions: function () {
            Swal.fire({
                title:
                    "<h2 style='color:red; font-size=10px'>Bạn có muốn xóa tất cả đề thi không?</h2>",
                html: '<img src="images/Confused.jpg" style="width:200px">',
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Có",
                cancelButtonText: "Không",
                allowOutsideClick: false,
            }).then(async (result) => {
                if (result.value) {
                    $scope.data_exam_questions = null;
                    ExamService.setAll($scope.data_exam_questions);
                    removeExamQuestion("exam_questions", 1);
                    SocketService.emit("cancel_room", $scope.code_room);
                    $scope.code_room = "";
                    $scope.isStart = false;
                    $scope.isCreate = false;
                    await IndexedDBService.clear("data_exam_mark");
                    await IndexedDBService.clear("data_exam_mark_excel");
                    $rootScope.$applyAsync(() => {
                        $rootScope.userCompleted = [];
                    });
                    updateDataLocalStorage();
                    removeLocalstorage();
                }
            });
        }, copyCodeRoom: function () {
            if (navigator.clipboard && window.isSecureContext) {
                // API mới: navigator.clipboard
                navigator.clipboard.writeText($scope.code_room).then(function () {
                    $scope.$applyAsync();
                    ToastService.show("Sao chép mã phòng thành công!", "success");
                }).catch(function (err) {
                    ToastService.show("Sao chép thất bại!", "error");
                });
            }
        }, startRoom: function () {
            if ($scope.isCreate) {

                const roomId = $scope.code_room;
                const adminUserId = DataService.getHomeData('user_login').user_id;
                SocketService.emit("createRoom", { roomId, adminUserId }, function (response) {
                    if (response.success) {
                        ToastService.show(`Tạo phòng ${roomId} thành công`, "success");
                        $scope.isStart = true;
                        updateDataLocalStorage();
                    }
                });

            } else {
                ToastService.show("Vui lòng tạo đề thi!", "error");
            }
        },
        createFile: async function (type) {
            if (type === 'pdf') {
                const allData = await IndexedDBService.getAll("data_exam_mark");
                for (const d of allData) {
                    await PDFService.exportPDF(d.html, d.data_user);
                }
            } else {
                const allData = await IndexedDBService.getAll("data_exam_mark_excel");
                await PDFService.exportExcel(allData);
            }


        }

    };

    function removeLocalstorage() {
        localStorage.removeItem('data_user_connections');
        localStorage.removeItem('notification_count_data');
        localStorage.removeItem('notification_data');
    }


});
