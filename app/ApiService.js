//const URL = "http://localhost:8080";
const URL ="https://captivatingly-draftier-beulah.ngrok-free.dev";
app.factory("ApiService", function ($http) {
  const API_URL = URL + "/api/v1/admin";
  function getToken() {
    return localStorage.getItem("token");
  }

  return {
    getLevels: function () {
      const token = getToken();
      return $http.get(API_URL + "/level_questions/load_data_level_questions", {
        headers: {
          Authorization: token
        },
        withCredentials: true,
      });
    },
    getDisciplines: function () {
      const token = getToken();
      return $http.get(API_URL + "/disciplines/load_data_discipline", {
        headers: {
          Authorization: token
        },
        withCredentials: true
      });
    },
    getTypeQuestion: function () {
      const token = getToken();
      return $http.get(API_URL + "/type_questions/load_data_type_questions", {
        headers: {
          Authorization: token
        },
      });
    },
    getQuestions: function (id) {
      const token = getToken();
      return $http.post(API_URL + "/questions/load_data_questions", { id: id }, {
        headers: {
          Authorization: token
        },
      });
    },
    createCodeRoom: function () {
      const token = getToken();
      return $http.get(API_URL + "/key/create_code_room", {
        headers: {
          Authorization: token
        },
      });
    },
    postInsertData: function (data, files) {
      const token = getToken();
      let formData = new FormData();

      formData.append("data", JSON.stringify(data));
      // formData.append("discipline_id", discipline_id);

      if (files && files.length) {
        Array.from(files).forEach(file => {
          formData.append("images", file);
        });
      }

      return $http.post(API_URL + "/questions/insert_data_questions", formData, {
        transformRequest: angular.identity,
        headers: {
          "Content-Type": undefined,
          Authorization: token
        }
      });
    },
    deleteQuestions: function (question_id, discipline_id) {
      const token = getToken();
      return $http.post(API_URL + "/questions/delete_data_questions", { question_id: question_id, discipline_id: discipline_id }, {
        headers: {
          Authorization: token
        },
      });
    },
    deleteChooseQuestions: function (question_id, discipline_id, type) {
      const token = getToken();
      return $http.post(API_URL + "/questions/delete_data_choose_questions", { question_id: question_id, discipline_id: discipline_id, type: type }, {
        headers: {
          Authorization: token
        },
      });
    },
    postInsertDataExcel: function (data, files) {
      const token = getToken();
      let formData = new FormData();
      formData.append("data", JSON.stringify(data));
      formData.append("file", files);
      return $http.post(API_URL + "/questions/insert_data_questions_from_excel", formData, {
        transformRequest: angular.identity,
        headers: {
          "Content-Type": undefined,
          Authorization: token
        }
      });
    },
    postDataLogin: function (username, password) {
      return $http.post(API_URL + "/auth/login", { username, password }, {
        withCredentials: true
      });
    },
    exportExcel: function (id) {
      const token = getToken();
      return $http.post(API_URL + "/questions/export_data_questions_from_excel_ctrl",
        { id },
        {
          responseType: "blob",
          headers: {
            Authorization: token
          }
        }
      );
    }

  };
});


app.factory('AuthInterceptor', function ($q, $window, $injector) {
  return {
    responseError: function (rejection) {
      if (rejection.status === 401) {
        localStorage.clear();
        $window.location.href = 'index.html';
      }
      return $q.reject(rejection);
    }
  };
});

//Lưu dữ liệu chuyển giữa các trang
app.factory("DataService", function () {
  let homeData = {};
  // let 

  return {
    setHomeData: function (key, value) {
      homeData[key] = value;
    },
    getHomeData: function (key) {
      return homeData[key];
    },
    getAllHomeData: function () {
      return homeData;
    }
  };
});
// kết nối socket 
app.factory("SocketService", function ($rootScope) {
  const socket = io(URL, {
    transports: ["websocket"],
    secure: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  // log debug
  socket.on("connect", () => {
    // console.log("✅ Connected to", URL, "id:", socket.id);
  });
  socket.on("disconnect", (reason) => {
    // console.warn("❌ Disconnected:", reason);
  });

  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        const args = arguments;
        $rootScope.$applyAsync(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        const args = arguments;
        $rootScope.$applyAsync(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    },
  };
});


//hiển thị thông báo
app.factory("ToastService", function ($rootScope, $timeout) {
  $rootScope.toasts = [];

  function getIcon(type) {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'times-circle';
      case 'warning': return 'exclamation-circle';
      default: return 'info-circle';
    }
  }

  const showDelay = 50;         // delay nhỏ để trigger transition
  const visibleDuration = 3000; // hiển thị trước khi bắt đầu hide
  const hideAnimDuration = 400; // phải giống CSS transition

  return {
    show: function (message, type = 'info') {
      const toast = {
        message: message,
        type: type,
        icon: getIcon(type),
        state: 'hidden' // ban đầu ẩn
      };

      // console.log('Toast PUSH', toast);
      $rootScope.toasts.push(toast);

      // next tick: bật show để CSS transition chạy
      $timeout(function () {
        toast.state = 'show';
      }, showDelay);

      // sau visibleDuration: bắt đầu hide
      $timeout(function () {
        toast.state = 'hidden';

        // sau khi animation hide kết thúc -> xóa khỏi mảng
        $timeout(function () {
          const idx = $rootScope.toasts.indexOf(toast);
          if (idx !== -1) $rootScope.toasts.splice(idx, 1);
        }, hideAnimDuration);

      }, visibleDuration + showDelay);
    }

  };
});



