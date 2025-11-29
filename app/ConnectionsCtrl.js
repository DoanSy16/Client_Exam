app.controller("ConnectionsCtrl", function ($scope, SocketService) {
    $scope.student_connections =localStorage.getItem("data_user_connections") ? JSON.parse(localStorage.getItem("data_user_connections")) : (DataService.getHomeData('data_user_connections') || []);
});
