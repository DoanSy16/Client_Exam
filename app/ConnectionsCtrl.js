app.controller("ConnectionsCtrl", function ($scope, $rootScope,$timeout, SocketService, DataService) {
    let connections = [];
    const status_user = ['online,offline'];
    const data_localStorage = localStorage.getItem('data_localStorage') ? JSON.parse(localStorage.getItem('data_localStorage')) : DataService.getHomeData("data_localStorage") || [];
    $scope.selectedStatusConnect = '';
    $scope.fill_status_user = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'online', label: 'Đang thi' },
        { value: 'offline', label: 'Đã nộp bài' }
    ]

    try {
        const localData = localStorage.getItem("data_user_connections");
        if (localData) {
            connections = JSON.parse(localData);
        }
    } catch (e) {
        console.error("Lỗi parse localStorage:", e);
    }


    $scope.student_connections_tmp =
        ($rootScope.data_user_connections && $rootScope.data_user_connections.length > 0 && $rootScope.data_user_connections)
        || (connections && connections.length > 0 && connections)
        || (DataService?.getHomeData('data_user_connections')?.length && DataService.getHomeData('data_user_connections'));

    f_filterStatusConnect('');

    $scope.$watch(function () {
        return $rootScope.data_user_connections;
    }, function (newVal) {
        if (Array.isArray(newVal)) {
            $scope.student_connections_tmp = angular.copy(newVal);
            f_filterStatusConnect($scope.selectedStatusConnect || '');
        }
    });


    $scope.filterStatusConnect = function (val) {
        f_filterStatusConnect(val)
    }
    $scope.disconnect = function (user_id) {
        SocketService.emit('disconnect_user', { user_id, roomId: data_localStorage.code_room }, function (res) {
            if (!res.success) {
                ToastService.show(res.error, "error");
                return;
            }
            $timeout(() => {
                $rootScope.data_user_connections = res.data;
                DataService.setHomeData('data_user_connections', $rootScope.data_user_connections);
                localStorage.setItem('data_user_connections', JSON.stringify($rootScope.data_user_connections));
            });

        })
    }

    $scope.searchConnect = function () {
        $scope.student_connections = [];
        if (!$scope.change_search_connect || $scope.change_search_connect.trim() === "") {
            $scope.student_connections = angular.copy($scope.student_connections_tmp);
        } else {
            let keyword = $scope.change_search_connect.toLowerCase();
            $scope.student_connections = $scope.student_connections_tmp.filter(f =>
                f.fullname.toLowerCase().includes(keyword)
            )
        }
    };
    function f_filterStatusConnect(val) {
        if (val === '') {
            $scope.student_connections = angular.copy($scope.student_connections_tmp);
            return
        } else {
            $scope.student_connections = $scope.student_connections_tmp.filter(f => {
                return f.user_status_connect == val;
            }
            )
        }
    }


});
