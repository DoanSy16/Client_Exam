
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
app.run(function ($rootScope, ApiService, DataService, ExamService, SocketService, ToastService, $window, IndexedDBService, $timeout, PDFService) {
  $rootScope.data_user_connections = [];
  $rootScope.data_exam_questions = [];
  $rootScope.modelUser = false;
  $rootScope.notification_dropdown = false;
  $rootScope.notification_data = JSON.parse(localStorage.getItem('notification_data')) || {};
  $rootScope.notification_data_tmp = Object.values($rootScope.notification_data)
    .sort((a, b) => b.time - a.time) || {};
  $rootScope.notification_count_data = parseInt(localStorage.getItem('notification_count_data')) || 0;
  $rootScope.user = [];
  $rootScope.autoexportPDF = true;
  $rootScope.userCompleted = [];
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
      $rootScope.userCompleted = await IndexedDBService.getAll("data_exam_mark");
      data = await JSON.parse(localStorage.getItem('data_localStorage'));
      DataService.setHomeData('user_login', $rootScope.user);
      let data_load = await loadExamQuestion("exam_questions", 1);
      $rootScope.data_exam_questions = angular.copy(data_load);
      if (data && data.code_room)
        SocketService.emit("reconnect_user", { userId: $rootScope.user.user_id, roomId: data.code_room });
      count_notification('ALL');
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

  // $window.addEventListener("online", () => {
  //   console.log("🌐 Network online");
  //   if (data && data.code_room)
  //     SocketService.emit("reconnect_user", { userId: $rootScope.user.user_id, roomId: data.code_room });

  // });

  // $window.addEventListener("offline", () => {
  //   console.warn("🌐 Network offline");
  // });


  let offlineTimer = null;

  $window.addEventListener("offline", () => {
   ToastService.show("🌐 Mất kết nối Internet", "error");
    if (!offlineTimer) {
      offlineTimer = setInterval(() => {
         ToastService.show("🌐 Mất kết nối Internet...", "error");
      }, 5000);
    }
  });

  $window.addEventListener("online", () => {
   ToastService.show("🌐 Đã kết nối lại", "success");
    if (offlineTimer) {
      if (data && data.code_room)
        SocketService.emit("reconnect_user", { userId: $rootScope.user.user_id, roomId: data.code_room });
      clearInterval(offlineTimer);
      offlineTimer = null;
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
    if (value === 'ALL') {
      // $rootScope.notification_data_tmp = $rootScope.notification_data;
      $rootScope.notification_data_tmp = Object.values($rootScope.notification_data)
        .sort((a, b) => b.time - a.time);
      return;
    }
    $rootScope.notification_data_tmp =
      Object.values($rootScope.notification_data).sort((a, b) => b.time - a.time).filter(n => {
        return n.type === value;
      });
    count_notification(value);
  };
  function count_notification(value) {
    $rootScope.notification_count_data = Object.values($rootScope.notification_data)
      .filter(n => !n.status && n.type === value)
      .length;
  }
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
  async function insertExamQuestion(storeName, row) {
    try {
      await IndexedDBService.insert(storeName, row);
    } catch (err) {
      console.error("Insert lỗi:", err);
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
    if (data.users) {
      $rootScope.data_user_connections = data.users;
    }
    $rootScope.data_exam_questions = $rootScope.data_exam_questions ? $rootScope.data_exam_questions : ExamService.getAll();

    const {
      userId,
      fullname: name,
      className,
      socketId,
      status_exam,
      time_login,
      user_status_connect
    } = data.user;



    // Tìm đề chưa bị khóa
    const index = $rootScope.data_exam_questions.findIndex(q => (!q.isSelected || userId == q.isSelected));

    if (index === -1) {
      ToastService.show("Hết đề thi!", "error");
      return;
    }
    // Lấy đề
    const data_localStorage = localStorage.getItem('data_localStorage') ? JSON.parse(localStorage.getItem('data_localStorage')) : DataService.getHomeData("data_localStorage") || [];
    const examTemp = $rootScope.data_exam_questions[index];
    const exam = {
      ...examTemp,
      isSelected: userId,
      nameSelected: name,
      classNameSelected: className,
      time: parseInt(data_localStorage.time ? data_localStorage.time : DataService.getHomeData("time")),
      countQuestions: (examTemp.questions).length,
      discipline_name: ($rootScope.Disciplines[data_localStorage.disciplines - 1]).name_discipline,
      discipline_id: ($rootScope.Disciplines[data_localStorage.disciplines - 1]).discipline_id
    };

    // Cập nhật trong mảng
    $rootScope.data_exam_questions[index] = {
      ...examTemp,
      isSelected: userId,
      nameSelected: name

    };

    ExamService.setAll($rootScope.data_exam_questions);
    saveExamQuestion("exam_questions", 1, $rootScope.data_exam_questions);
    ToastService.show(`${name} đã kết nối!`, "success");
    update_data_notification(Date.now(), 'Thông tin mới', userId, name, exam.examId, 'CONNECTED', 'đã tham gia phòng thi!', true)
    update_data_count_data();
    // Trả đề về cho user

    SocketService.emit("exam_assigned", { roomId: data_localStorage.code_room || DataService.getHomeData("codeRoom"), userId, exam }, function (response) {
      if (response.success) {
        $timeout(() => {
          $rootScope.data_user_connections = response.data;
          DataService.setHomeData('data_user_connections', $rootScope.data_user_connections);
          localStorage.setItem('data_user_connections', JSON.stringify($rootScope.data_user_connections));
        })

      } else {
        console.error("Lỗi exam_assigned:", response.error);
      }
    });

    // Đồng thời báo admin biết user nào đã được phân đề gì
    // io.to(rooms[roomId].admin).emit("exam_assigned_admin", {
    //     userId,
    //     exam
    // });

    // console.log(`User ${userId} đã nhận đề: ${exam.examId}`);
  });

  SocketService.on("send_data_to_admin_mark", async function (data) {
    const exam = data.html;
    const user = data.data_user;
    await insertExamQuestion("data_exam_mark", data);
    await insertExamQuestion("data_exam_mark_excel", user);
    const allData = await IndexedDBService.getAll("data_exam_mark");
    $timeout(() => {
      $rootScope.userCompleted = allData;
    });

    if ($rootScope.autoexportPDF) {
      await PDFService.exportPDF(exam, user);
    }

  });
  SocketService.on("room_deleted", (roomId) => {
    ToastService.show(`Đã xóa tất cả đề thi!`, "success");
  });
  SocketService.on("admin_reconnected", (response) => {
    $rootScope.data_user_connections = response.data;
    DataService.setHomeData('data_user_connections', $rootScope.data_user_connections);
    localStorage.setItem('data_user_connections', JSON.stringify($rootScope.data_user_connections));

  });


  SocketService.on("send_request_reconect_user", ({ user }) => {
    update_data_notification(Date.now(), 'Yêu cầu tham gia', user.studentId, user.fullname, user.examId, 'RECONECTED', 'yêu cầu vào phòng!', false);
    update_data_count_data();
    $rootScope.acceptReconnect = function (id_noti) {
      SocketService.emit("admin_accept_reconnect", { user });
      update_data_notification(id_noti, 'Yêu cầu tham gia', user.studentId, user.fullname, user.examId, 'RECONECTED', 'yêu cầu vào phòng!', true);
    };
  });


  function update_data_notification(id_noti, title, userId, name, examId, type, message, status) {
    const new_message = `${name} ${message}`;
    $rootScope.notification_data[id_noti] = {
      id: id_noti,
      title: title,
      user_id: userId,
      user_name: name,
      examId: examId,
      message: new_message,
      type: type,
      time: Date.now(),
      status: status
    }
    // console.log($rootScope.notification_data[id_noti])
    $rootScope.notification_data_tmp = Object.values($rootScope.notification_data)
      .sort((a, b) => b.time - a.time);
    // $rootScope.notification_count_data = $rootScope.notification_data_tmp.filter(n => n.status === false).length;
    count_notification();

    DataService.setHomeData('notification_data', $rootScope.notification_data);
    localStorage.setItem('notification_data', JSON.stringify($rootScope.notification_data));


  }
  function update_data_count_data() {
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
  // $rootScope.exportPDF = function () {
  //   var element = document.getElementById('examPdf');
  //   var opt = {
  //     margin: 10,
  //     filename: 'de-thi-' + $rootScope.exam.nameSelected + '.pdf',
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { scale: 2, useCORS: true },
  //     jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  //   };

  //   html2pdf().set(opt).from(element).save();
  // };



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
