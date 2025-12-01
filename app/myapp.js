
var app = angular.module("myApp", ["ngRoute", "ngAnimate", 'ui.select']).directive("fileModel", ["$parse", function ($parse) {
  return {
    restrict: "A",
    link: function (scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind("change", function () {
        scope.$apply(function () {
          modelSetter(scope, element[0].files);
        });
      });
    }
  };
}]);
app.run(function ($rootScope, ApiService, DataService, ExamService, SocketService, ToastService, $window, IndexedDBService, $document, $location, PDFService) {
  $rootScope.data_user_connections = [];
  $rootScope.modelUser = false;
  $rootScope.notification_dropdown = false;
  $rootScope.notification_data = JSON.parse(localStorage.getItem('notification_data')) || [];
  $rootScope.notification_data_tmp = $rootScope.notification_data || [];
  $rootScope.notification_count_data = parseInt(localStorage.getItem('notification_count_data')) || 0;
  $rootScope.user = [];
  //  localStorage.setItem('notification_data',$rootScope.notification_data);
  //       localStorage.setItem('notification_count_data',$rootScope.notification_count_data);
  DataService.setHomeData('data_user_connections', $rootScope.data_user_connections);
  let data = [];

  $rootScope.$on("$routeChangeStart", async function (event, next, current) {

    const token = localStorage.getItem("token");

    // Danh sách route yêu cầu đăng nhập
    const protectedRoutes = ["/index", "/connections", "/management", "/quiz"];

    if (protectedRoutes.includes(next.originalPath) && !token) {
      event.preventDefault();
      $window.location.href = "index.html#!/login";

    }
    if (token && !$rootScope.initialized) {
      $rootScope.initialized = true;
      $rootScope.user = JSON.parse(localStorage.getItem('user'));
      data = await JSON.parse(localStorage.getItem('data_localStorage'));
      DataService.setHomeData('user_login', $rootScope.user);
      // console.log('data.code_room: ',$rootScope.user)
      if (data && data.code_room)
        SocketService.emit("reconnect_user", { userId: $rootScope.user.user_id, roomId: data.code_room });

      //Load data level 
      ApiService.getLevels()
        .then(function (response) {
          $rootScope.level_questions = (response.data).data;
        })
        .catch(function (err) {
          console.error("Lỗi khi load data level:", err);
        });

      //Load data Disciplines

      ApiService.getDisciplines()
        .then(function (response) {
          $rootScope.Disciplines = (response.data).data;
        })
        .catch(function (err) {
          console.error("Lỗi khi load data Disciplines:", err);
        });
      //Load data Type Question
      ApiService.getTypeQuestion()
        .then(function (response) {
          $rootScope.type_questions = (response.data).data;
        })
        .catch(function (err) {
          console.error("Lỗi khi load data type:", err);
        });
    }

  });

  $rootScope.openProfile = function () {
    $rootScope.modelUser = !$rootScope.modelUser;
  }
  $rootScope.openNotifications = function () {
    $rootScope.notification_dropdown = !$rootScope.notification_dropdown;
  }
  $rootScope.getNotificationIcon = function (type) {
    switch (type) {
      case 'CONNECTED': return '✅';
      case 'RECONECTED': return '⚠️';
      case 'DISCONNECTED': return '❌';
      default: return 'ℹ️';
    }
  }
  $rootScope.formatTimeAgo = function (date) {
    const now = Date.now();
    const ms = now - date;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 10) return "Vừa xong";
    if (seconds < 60) return `${seconds} giây trước`;
    if (minutes < 60) return `${minutes} phút trước`;
    return `${hours} giờ trước`;
  }
  $rootScope.statusOptions = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'CONNECTED', label: 'Đã kết nối' },
    { value: 'RECONECTED', label: 'Yêu cầu kết nối' },
    { value: 'DISCONNECTED', label: 'Ngắt kết nối' }
  ];

  // Set mặc định = Tất cả
  $rootScope.selectedStatus = 'ALL';
  $rootScope.filterStatus = function (value) {
    let dem = 0;
    if (value === 'ALL') {
      $rootScope.notification_data_tmp = $rootScope.notification_data;
      return;
    }
    $rootScope.notification_data_tmp = $rootScope.notification_data.filter(n => {
      const ok = !n.status && n.type === value;
      if (ok) dem++;
      return n.type === value;
    });

    $rootScope.notification_count_data = dem;
  };
  async function loadExamQuestion(storeName, id) {
    try {
      const res = await IndexedDBService.get(storeName, id);
      return res ? res.data : null;
    } catch (err) {
      console.error(err);
      return null;
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


  SocketService.on("select_exam", async function (data) {
    const examData = await loadExamQuestion("exam_questions", 1);
    $rootScope.$apply(() => {
      $rootScope.data_exam_questions = examData || ExamService.getAll();
    });

    // $rootScope.data_exam_questions = JSON.parse(localStorage.getItem('data_exam_questions')) || ExamService.getAll();
    console.log('$rootScope.data_exam_questions: ', $rootScope.data_exam_questions.length)
    const { userId, name, className, socketId } = data;
    console.log(`User ${userId} yêu cầu đề thi`);

    // Tìm đề chưa bị khóa
    const index = $rootScope.data_exam_questions.findIndex(q => !q.isSelected);

    if (index === -1) {
      ToastService.show("Hết đề thi!", "error");
      return;
    }
    // Lấy đề
    const examTemp = $rootScope.data_exam_questions[index];
    const exam = {
      ...examTemp,
      isSelected: userId,
      nameSelected: name,
      classNameSelected: className,
      time: parseInt(DataService.getHomeData("time")),
      countQuestions: (examTemp.questions).length,
      discipline_name: ($rootScope.Disciplines[parseInt(DataService.getHomeData("Disciplines")) - 1]).name_discipline,
      discipline_id: ($rootScope.Disciplines[parseInt(DataService.getHomeData("Disciplines")) - 1]).discipline_id
    };

    // Cập nhật trong mảng
    $rootScope.data_exam_questions[index] = {
      ...examTemp,
      isSelected: userId,
      nameSelected: name

    };
    $rootScope.data_user_connections.push({
      userId: userId,
      fullName: name,
      time_login: new Date().toLocaleString("vi-VN", { hour12: false }),
      examId: examTemp.examId,
      status: true
    });

    DataService.setHomeData('data_user_connections', $rootScope.data_user_connections);
    localStorage.setItem('data_user_connections', JSON.stringify($rootScope.data_user_connections));
    ExamService.setAll($rootScope.data_exam_questions);
    // localStorage.setItem("data_exam_questions", JSON.stringify($rootScope.data_exam_questions))
    saveExamQuestion("exam_questions", 1, $rootScope.data_exam_questions);
    ToastService.show(`${name} đã kết nối!`, "success");
    console.log($rootScope.data_exam_questions);
    update_data_notification('Thông tin mới', userId, name, exam.examId, 'CONNECTED', 'đã tham gia phòng thi!', true)
    // Trả đề về cho user
    SocketService.emit("exam_assigned", { roomId: DataService.getHomeData("codeRoom"), userId, exam });

    // Đồng thời báo admin biết user nào đã được phân đề gì
    // io.to(rooms[roomId].admin).emit("exam_assigned_admin", {
    //     userId,
    //     exam
    // });

    console.log(`User ${userId} đã nhận đề: ${exam.examId}`);
  });
  let data_exam_mark = [];
  SocketService.on("send_data_to_admin_mark", function (data) {

    const exam = data.html;
    const user = data.data_user;
    // console.log('exam.isSelected: ', exam);
    // localStorage.setItem('daso',JSON.stringify(dat_so));
    // $rootScope.exam.push({
    //   mssv: exam.isSelected,
    //   fullName: exam.nameSelected,
    //   class: exam.classNameSelected,
    //   mark: exam.mark
    // });
    data_exam_mark.push(exam);
    saveExamQuestion("data_exam_mark", 2, data_exam_mark);

    DataService.setHomeData('data_exam_excel', $rootScope.exam);
    PDFService.exportPDF(exam, user);
    // $rootScope.exam = data.d;
    // var element = document.getElementById('examPdf');
    // var opt = {
    //   margin: 10,
    //   filename: `${$rootScope.exam.nameSelected}_${$rootScope.exam.isSelected}.pdf`,
    //   image: { type: 'jpeg', quality: 0.98 },
    //   html2canvas: { scale: 2, useCORS: true },
    //   jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    // };

    // html2pdf().set(opt).from(element).save();
  });
  SocketService.on("room_deleted", (roomId) => {
    ToastService.show(`Đã xóa tất cả đề thi!`, "success");
  });
  SocketService.on("roomCreated", (roomId) => {
    ToastService.show(`Tạo phòng ${roomId} thành công`, "success");
  });

  SocketService.on("send_request_reconect_user", ({ user }) => {
    // console.log('user: ', user);
    update_data_notification('Yêu cầu tham gia', user.studentId, user.fullname, user.examId, 'RECONECTED', 'yêu cầu vào phòng!', false);
    $rootScope.acceptReconnect = function (user_id) {
      console.log('user_id: ', user_id)
      SocketService.emit("admin_accept_reconnect", { user });
    };
  });

  function update_data_notification(title, userId, name, examId, type, message, status) {
    const new_message = `${name} ${message}`;
    $rootScope.notification_data.push({
      title: title,
      user_id: userId,
      user_name: name,
      examId: examId,
      message: new_message,
      type: type,
      time: Date.now(),
      status: status
    });
    $rootScope.notification_data_tmp = $rootScope.notification_data;
    DataService.setHomeData('notification_data', $rootScope.notification_data);
    localStorage.setItem('notification_data', JSON.stringify($rootScope.notification_data));

    $rootScope.notification_count_data = $rootScope.notification_count_data + 1;
    DataService.setHomeData('notification_count_data', $rootScope.notification_count_data);
    localStorage.setItem('notification_count_data', $rootScope.notification_count_data);
  }

  $rootScope.logout = function () {
    Swal.fire({
      title:
        `<h2 style='color:red; font-size=10px'>Bạn có muốn đăng xuất?</h2>`,
      html: '<img src="images/Confused.jpg" style="width:200px">',
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Có",
      cancelButtonText: "Không",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.value) {
        localStorage.clear();
        if (data && data.code_room)
          SocketService.emit("cancel_room", data.code_room);
        removeExamQuestion("exam_questions", 1);
        indexedDB.deleteDatabase("ExamDB");

        $window.location.href = 'index.html';
      }
    });
  }

  // $rootScope.exam = {
  //       "examId": "DE-1",
  //       "isSelected": "LT5240001811232",
  //       "nameSelected": "Đoàn Sỹ",
  //       "statusExam": false,
  //       "selectedDocument": false,
  //       "questions": [
  //           {
  //               "question_id": 3,
  //               "text_question": "Tập tin có dấu “.” phía trước có đặc tính gì đặc biệt?",
  //               "source_image": [],
  //               "Answers_Text": [
  //                   {
  //                       "answer_option_id": 2,
  //                       "text_answer": "Tập tin thực thi",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 1,
  //                       "text_answer": "Tập tin ẩn",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 3,
  //                       "text_answer": "Tập tin liên kết",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 4,
  //                       "text_answer": "Tập tin chỉ đọc",
  //                       "image_answer": "No Image Available"
  //                   }
  //               ],
  //               "correct_answer": [
  //                   {
  //                       "correct_answer": 2
  //                   }
  //               ],
  //               "level_id": 1,
  //               "type_question_id": 1,
  //               "type_question_name": "Câu hỏi trắc nghiệm",
  //               "selected": true
  //           },
  //           {
  //               "question_id": 1,
  //               "text_question": "Lệnh nào sẽ huỷ lệnh khởi động lại hệ điều hành trước đó trong Linux?",
  //               "source_image": [
  //                   {
  //                       "image_id": 1,
  //                       "source_image": "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=300",
  //                       "content": "SDASD",
  //                       "$$hashKey": "object:16"
  //                   },

  //               ],
  //               "Answers_Text": [
  //                   {
  //                       "answer_option_id": 4,
  //                       "text_answer": "Shutdown –r",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 3,
  //                       "text_answer": "Halt",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 2,
  //                       "text_answer": "Shutdown –c",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 1,
  //                       "text_answer": "Restart",
  //                       "image_answer": "No Image Available"
  //                   }
  //               ],
  //               "correct_answer": [
  //                   {
  //                       "correct_answer": 4
  //                   }
  //               ],
  //               "level_id": 1,
  //               "type_question_id": 1,
  //               "type_question_name": "Câu hỏi trắc nghiệm",
  //               "selected": true
  //           },
  //           {
  //               "question_id": 2,
  //               "text_question": "Tạo file và nhập nội dung với lệnh cat>name_of_file. Kết thúc lệnh này bằng tổ hợp phím?",
  //               "source_image": [],
  //               "Answers_Text": [
  //                   {
  //                       "answer_option_id": 4,
  //                       "text_answer": "Crtl + X",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 3,
  //                       "text_answer": "Crtl + C",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 1,
  //                       "text_answer": "Crtl + R",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 2,
  //                       "text_answer": "Crtl + D",
  //                       "image_answer": "No Image Available"
  //                   }
  //               ],
  //               "correct_answer": [
  //                   {
  //                       "correct_answer": 3
  //                   }
  //               ],
  //               "level_id": 1,
  //               "type_question_id": 1,
  //               "type_question_name": "Câu hỏi trắc nghiệm",
  //               "selected": true
  //           },
  //           {
  //               "question_id": 4,
  //               "text_question": "Trong hệ thống Linux, user nào có quyền cao nhất?",
  //               "source_image": [],
  //               "Answers_Text": [
  //                   {
  //                       "answer_option_id": 3,
  //                       "text_answer": "User có UID=0",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 1,
  //                       "text_answer": "User administrator",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 4,
  //                       "text_answer": "User root",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 2,
  //                       "text_answer": "User admin",
  //                       "image_answer": "No Image Available"
  //                   }
  //               ],
  //               "correct_answer": [
  //                   {
  //                       "correct_answer": 1
  //                   }
  //               ],
  //               "level_id": 1,
  //               "type_question_id": 1,
  //               "type_question_name": "Câu hỏi trắc nghiệm",
  //               "selected": true
  //           },
  //           {
  //               "question_id": 5,
  //               "text_question": "Lệnh ls -lr /etc thực hiện hành động gì?",
  //               "source_image": [],
  //               "Answers_Text": [
  //                   {
  //                       "answer_option_id": 2,
  //                       "text_answer": "Liệt kê đệ quy thư mục con /etc và sắp xếp theo chiều ngược lại",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 3,
  //                       "text_answer": "Liệt kê thư mục /etc theo liên kết tượng trưng và sắp xếp theo chiều ngược lại",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 4,
  //                       "text_answer": "Tất cả các câu trên đều đúng",
  //                       "image_answer": "No Image Available"
  //                   },
  //                   {
  //                       "answer_option_id": 1,
  //                       "text_answer": "Liệt kê và sắp xếp nội dung thư mục /etc theo chiều ngược lại",
  //                       "image_answer": "No Image Available"
  //                   }
  //               ],
  //               "correct_answer": [
  //                   {
  //                       "correct_answer": 3
  //                   }
  //               ],
  //               "level_id": 1,
  //               "type_question_id": 1,
  //               "type_question_name": "Câu hỏi trắc nghiệm",
  //               "selected": true
  //           }
  //       ],
  //       "$$hashKey": "object:826",
  //       "classNameSelected": "L24_TH01",
  //       "time": 5,
  //       "countQuestions": 5,
  //       "discipline_name": "HỆ ĐIỀU HÀNH",
  //       "discipline_id": 1,
  //       "roomId": "hrY-oGR-kDo",
  //       "timeUsed": 23,
  //       "submissionTime": "2025-10-17T02:00:53.501Z",
  //       "mark": "0.00"

  //   };
  $rootScope.getOptionLetter = function (index) {
    return String.fromCharCode(65 + index); // A, B, C, D
  };
  $rootScope.exportPDF = function () {
    var element = document.getElementById('examPdf');
    var opt = {
      margin: 10,
      filename: 'de-thi-' + $rootScope.exam.nameSelected + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };



});


app.config(function ($routeProvider, $httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
  $httpProvider.defaults.headers.common["ngrok-skip-browser-warning"] = "true";
  $routeProvider
    .when("/login", {
      templateUrl: "index.html",
      controller: "LoginCtrl"
    })
    .when("/index", {
      templateUrl: "html/HomeView.html",
      controller: "HomeViewCtrl"
    })
    .when("/connections", {
      templateUrl: "html/ConnectionsView.html",
      controller: "ConnectionsCtrl"
    })
    .when("/management", {
      templateUrl: "html/ManagementView.html",
      controller: "ManagementCtrl"
    })
    .when("/quiz", {
      templateUrl: "html/QuizView.html",
      controller: "QuizCtrl"
    })
    .otherwise({ redirectTo: "/index" });
});
