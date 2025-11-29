
// app.controller("LoginCtrl", function ($scope, $timeout, $window, $interval,ApiService) {
//   $scope.currentTab = 'login';
//   $scope.forgotStep = 1;
//   $scope.isLoading = false;
//   $scope.isResendDisabled = true;
//   $scope.timerDisplay = '05:00';
//   $scope.otpTimeLeft = 300;
//   $scope.otpTimer = null;
//   $scope.currentOTP = '';
//   $scope.currentEmail = '';

//   $scope.message = {
//     text: '',
//     type: ''
//   };

//   $scope.login = {
//     username: '',
//     password: ''
//   };

//   $scope.register = {
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   };

//   $scope.forgot = {
//     email: '',
//     otpCode: '',
//     newPassword: '',
//     confirmNewPassword: ''
//   };

//   $scope.switchTab = function (tabName) {
//     $scope.currentTab = tabName;
//     $scope.clearForm();
//     $scope.resetForgotPassword();
//     $scope.stopOTPTimer();
//     $scope.message = { text: '', type: '' };
//   };

//   $scope.clearForm = function () {
//     $scope.login = { username: '', password: '' };
//     $scope.register = { username: '', email: '', password: '', confirmPassword: '' };
//   };

//   $scope.submitLogin = function () {
//     // $window.location.href = 'home.html';
//     const username = ($scope.login.username || '').trim();
//     const password = ($scope.login.password || '').trim();

//     if (!username || !password) {
//       $scope.showMessage('Vui lòng nhập đầy đủ username và mật khẩu.', 'error');
//       return;
//     }

//     $scope.isLoading = true;
//     ApiService.postDataLogin(username, password)
//       .then(function (response) {
//        const data = response.data;
//         // if(data == )

//          console.log($scope.userReturn)
//       })
//       .catch(function (err) {
//         console.error("Lỗi khi load data Disciplines:", err);
//       });
//     $timeout(function () {
//       const storedUser = localStorage.getItem(`user_${username}`);

//       if (storedUser) {
//         const user = JSON.parse(storedUser);
//         if (user.password === password) {
//           $scope.showMessage('Đăng nhập thành công! Chào mừng bạn trở lại.', 'success');
//           $timeout(function () {
//             alert(`Đăng nhập thành công!\nUsername: ${username}`);
//             $window.location.href = 'home.html';
//           }, 500);
//         } else {
//           $scope.showMessage('Mật khẩu không chính xác.', 'error');
//         }
//       } else {
//         $scope.showMessage('Username không tồn tại trong hệ thống.', 'error');
//       }

//       $scope.isLoading = false;
//     }, 1500);
//   };

//   $scope.submitRegister = function () {
//     const username = ($scope.register.username || '').trim();
//     const email = ($scope.register.email || '').trim();
//     const password = ($scope.register.password || '').trim();
//     const confirmPassword = ($scope.register.confirmPassword || '').trim();

//     if (!username || !email || !password || !confirmPassword) {
//       $scope.showMessage('Vui lòng điền đầy đủ tất cả các trường.', 'error');
//       return;
//     }

//     if (!$scope.isValidEmail(email)) {
//       $scope.showMessage('Email không hợp lệ.', 'error');
//       return;
//     }

//     if (password.length < 6) {
//       $scope.showMessage('Mật khẩu phải có ít nhất 6 ký tự.', 'error');
//       return;
//     }

//     if (password !== confirmPassword) {
//       $scope.showMessage('Mật khẩu xác nhận không khớp.', 'error');
//       return;
//     }

//     $scope.isLoading = true;
//     $timeout(function () {
//       const existingUser = localStorage.getItem(`user_${username}`);

//       if (existingUser) {
//         $scope.showMessage('Username đã tồn tại. Vui lòng chọn username khác.', 'error');
//       } else {
//         const userData = {
//           username,
//           email,
//           password,
//           createdAt: new Date().toISOString()
//         };

//         localStorage.setItem(`user_${username}`, JSON.stringify(userData));
//         localStorage.setItem(`email_${email}`, username);

//         $scope.showMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.', 'success');

//         $timeout(function () {
//           $scope.switchTab('login');
//         }, 2000);
//       }

//       $scope.isLoading = false;
//     }, 1500);
//   };

//   $scope.sendOTP = function () {
//     const email = ($scope.forgot.email || '').trim();

//     if (!email) {
//       $scope.showMessage('Vui lòng nhập email.', 'error');
//       return;
//     }

//     if (!$scope.isValidEmail(email)) {
//       $scope.showMessage('Email không hợp lệ.', 'error');
//       return;
//     }

//     $scope.isLoading = true;
//     $timeout(function () {
//       const username = localStorage.getItem(`email_${email}`);

//       if (!username) {
//         $scope.showMessage('Email không tồn tại trong hệ thống.', 'error');
//       } else {
//         $scope.currentOTP = $scope.generateOTP();
//         $scope.currentEmail = email;

//         console.log(`OTP được gửi đến ${email}: ${$scope.currentOTP}`);
//         alert(`MÃ OTP (demo): ${$scope.currentOTP}\n\nTrong thực tế, mã này sẽ được gửi qua email.`);

//         $scope.forgotStep = 2;
//         $scope.startOTPTimer();
//       }

//       $scope.isLoading = false;
//     }, 1500);
//   };

//   $scope.verifyOTP = function () {
//     const otpCode = ($scope.forgot.otpCode || '').trim();

//     if (!otpCode) {
//       $scope.showMessage('Vui lòng nhập mã OTP.', 'error');
//       return;
//     }

//     $scope.isLoading = true;
//     $timeout(function () {
//       if (otpCode === $scope.currentOTP) {
//         $scope.stopOTPTimer();
//         $scope.forgotStep = 3;
//       } else {
//         $scope.showMessage('Mã OTP không chính xác. Vui lòng thử lại.', 'error');
//       }

//       $scope.isLoading = false;
//     }, 1000);
//   };

//   $scope.resendOTP = function () {
//     $scope.sendOTP();
//   };

//   $scope.resetPassword = function () {
//     const newPassword = ($scope.forgot.newPassword || '').trim();
//     const confirmPassword = ($scope.forgot.confirmNewPassword || '').trim();

//     if (!newPassword || !confirmPassword) {
//       $scope.showMessage('Vui lòng nhập đầy đủ mật khẩu mới.', 'error');
//       return;
//     }

//     if (newPassword.length < 6) {
//       $scope.showMessage('Mật khẩu phải có ít nhất 6 ký tự.', 'error');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       $scope.showMessage('Mật khẩu xác nhận không khớp.', 'error');
//       return;
//     }

//     $scope.isLoading = true;
//     $timeout(function () {
//       const username = localStorage.getItem(`email_${$scope.currentEmail}`);
//       const userData = JSON.parse(localStorage.getItem(`user_${username}`));

//       userData.password = newPassword;
//       localStorage.setItem(`user_${username}`, JSON.stringify(userData));

//       $scope.showMessage('Mật khẩu đã được đặt lại thành công! Đang chuyển đến trang đăng nhập...', 'success');

//       $timeout(function () {
//         $scope.switchTab('login');
//       }, 2000);

//       $scope.isLoading = false;
//     }, 1500);
//   };

//   $scope.generateOTP = function () {
//     return Math.floor(100000 + Math.random() * 900000).toString();
//   };

//   $scope.startOTPTimer = function () {
//     $scope.otpTimeLeft = 300;
//     $scope.updateTimerDisplay();
//     $scope.isResendDisabled = true;

//     $scope.otpTimer = $interval(function () {
//       $scope.otpTimeLeft--;
//       $scope.updateTimerDisplay();

//       if ($scope.otpTimeLeft <= 0) {
//         $scope.stopOTPTimer();
//         $scope.showMessage('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.', 'error');
//       }
//     }, 1000);
//   };

//   $scope.stopOTPTimer = function () {
//     if ($scope.otpTimer) {
//       $interval.cancel($scope.otpTimer);
//       $scope.otpTimer = null;
//     }
//     $scope.isResendDisabled = false;
//   };

//   $scope.updateTimerDisplay = function () {
//     const minutes = Math.floor($scope.otpTimeLeft / 60);
//     const seconds = $scope.otpTimeLeft % 60;
//     $scope.timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   };

//   $scope.resetForgotPassword = function () {
//     $scope.forgotStep = 1;
//     $scope.forgot = {
//       email: '',
//       otpCode: '',
//       newPassword: '',
//       confirmNewPassword: ''
//     };
//     $scope.currentOTP = '';
//     $scope.currentEmail = '';
//   };

//   $scope.showMessage = function (text, type) {
//     $scope.message = {
//       text: text,
//       type: type
//     };
//   };

//   $scope.isValidEmail = function (email) {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };
// });


app.controller('LoginCtrl', function ($scope, $timeout, $window, $interval, ApiService) {
  $scope.currentTab = 'login';
  $scope.forgotStep = 1;
  $scope.isLoading = false;
  $scope.isResendDisabled = true;
  $scope.timerDisplay = '05:00';
  $scope.otpTimeLeft = 300;
  $scope.otpTimer = null;
  $scope.currentOTP = '';
  $scope.currentEmail = '';

  $scope.message = {
    text: '',
    type: ''
  };

  $scope.errors = {
    login: { username: '', password: '' },
    register: { username: '', email: '', password: '', confirmPassword: '' },
    forgot: { email: '', otpCode: '', newPassword: '', confirmNewPassword: '' }
  };

  $scope.login = {
    username: '',
    password: ''
  };

  $scope.register = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  $scope.forgot = {
    email: '',
    otpCode: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  $scope.switchTab = function (tabName) {
    $scope.currentTab = tabName;
    $scope.clearForm();
    $scope.resetForgotPassword();
    $scope.stopOTPTimer();
    $scope.message = { text: '', type: '' };
    $scope.clearErrors();
  };

  $scope.clearForm = function () {
    $scope.login = { username: '', password: '' };
    $scope.register = { username: '', email: '', password: '', confirmPassword: '' };
  };

  $scope.clearErrors = function () {
    $scope.errors = {
      login: { username: '', password: '' },
      register: { username: '', email: '', password: '', confirmPassword: '' },
      forgot: { email: '', otpCode: '', newPassword: '', confirmNewPassword: '' }
    };
  };

  $scope.validateLoginForm = function () {
    $scope.errors.login = { username: '', password: '' };
    let isValid = true;

    if (!($scope.login.username || '').trim()) {
      $scope.errors.login.username = 'Vui lòng nhập username';
      isValid = false;
    }

    if (!($scope.login.password || '').trim()) {
      $scope.errors.login.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    }

    return isValid;
  };

  $scope.validateRegisterForm = function () {
    $scope.errors.register = { username: '', email: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!($scope.register.username || '').trim()) {
      $scope.errors.register.username = 'Vui lòng nhập username';
      isValid = false;
    }

    if (!($scope.register.email || '').trim()) {
      $scope.errors.register.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!$scope.isValidEmail($scope.register.email)) {
      $scope.errors.register.email = 'Email không hợp lệ';
      isValid = false;
    }

    if (!($scope.register.password || '').trim()) {
      $scope.errors.register.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if ($scope.register.password.length < 6) {
      $scope.errors.register.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    if (!($scope.register.confirmPassword || '').trim()) {
      $scope.errors.register.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if ($scope.register.password !== $scope.register.confirmPassword) {
      $scope.errors.register.confirmPassword = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }

    return isValid;
  };

  $scope.submitLogin = function () {
    if (!$scope.validateLoginForm()) {
      return;
    }

    const username = ($scope.login.username || '').trim();
    const password = ($scope.login.password || '').trim();

    $scope.isLoading = true;


    $timeout(function () {
      ApiService.postDataLogin(username, password)
        .then(function (response) {
          const data = response.data;
          console.log('data: ', data)
          if (data == 'error') {
            $scope.showMessage('Mật khẩu hoặc tài khoản không chính xác.', 'error');
          } else if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            $window.location.href = 'home.html';
          }
        })
        .catch(function (err) {
          console.error("Lỗi khi đăng nhập:", err);
        });

      $scope.isLoading = false;
    }, 1500);
  };

  $scope.submitRegister = function () {
    if (!$scope.validateRegisterForm()) {
      return;
    }

    const username = ($scope.register.username || '').trim();
    const email = ($scope.register.email || '').trim();
    const password = ($scope.register.password || '').trim();

    $scope.isLoading = true;
    $timeout(function () {
      const existingUser = localStorage.getItem(`user_${username}`);

      if (existingUser) {
        $scope.showMessage('Username đã tồn tại. Vui lòng chọn username khác.', 'error');
      } else {
        const userData = {
          username,
          email,
          password,
          createdAt: new Date().toISOString()
        };

        localStorage.setItem(`user_${username}`, JSON.stringify(userData));
        localStorage.setItem(`email_${email}`, username);

        $scope.showMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.', 'success');

        $timeout(function () {
          $scope.switchTab('login');
        }, 2000);
      }

      $scope.isLoading = false;
    }, 1500);
  };

  $scope.sendOTP = function () {
    $scope.errors.forgot.email = '';
    const email = ($scope.forgot.email || '').trim();

    if (!email) {
      $scope.errors.forgot.email = 'Vui lòng nhập email';
      return;
    }

    if (!$scope.isValidEmail(email)) {
      $scope.errors.forgot.email = 'Email không hợp lệ';
      return;
    }

    $scope.isLoading = true;
    $timeout(function () {
      const username = localStorage.getItem(`email_${email}`);

      if (!username) {
        $scope.showMessage('Email không tồn tại trong hệ thống.', 'error');
      } else {
        $scope.currentOTP = $scope.generateOTP();
        $scope.currentEmail = email;

        console.log(`OTP được gửi đến ${email}: ${$scope.currentOTP}`);
        alert(`MÃ OTP (demo): ${$scope.currentOTP}\n\nTrong thực tế, mã này sẽ được gửi qua email.`);

        $scope.forgotStep = 2;
        $scope.startOTPTimer();
      }

      $scope.isLoading = false;
    }, 1500);
  };

  $scope.verifyOTP = function () {
    $scope.errors.forgot.otpCode = '';
    const otpCode = ($scope.forgot.otpCode || '').trim();

    if (!otpCode) {
      $scope.errors.forgot.otpCode = 'Vui lòng nhập mã OTP';
      return;
    }

    $scope.isLoading = true;
    $timeout(function () {
      if (otpCode === $scope.currentOTP) {
        $scope.stopOTPTimer();
        $scope.forgotStep = 3;
      } else {
        $scope.errors.forgot.otpCode = 'Mã OTP không chính xác';
      }

      $scope.isLoading = false;
    }, 1000);
  };

  $scope.resendOTP = function () {
    $scope.sendOTP();
  };

  $scope.resetPassword = function () {
    $scope.errors.forgot.newPassword = '';
    $scope.errors.forgot.confirmNewPassword = '';
    let isValid = true;

    const newPassword = ($scope.forgot.newPassword || '').trim();
    const confirmPassword = ($scope.forgot.confirmNewPassword || '').trim();

    if (!newPassword) {
      $scope.errors.forgot.newPassword = 'Vui lòng nhập mật khẩu mới';
      isValid = false;
    } else if (newPassword.length < 6) {
      $scope.errors.forgot.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    if (!confirmPassword) {
      $scope.errors.forgot.confirmNewPassword = 'Vui lòng xác nhận mật khẩu mới';
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      $scope.errors.forgot.confirmNewPassword = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    $scope.isLoading = true;
    $timeout(function () {
      const username = localStorage.getItem(`email_${$scope.currentEmail}`);
      const userData = JSON.parse(localStorage.getItem(`user_${username}`));

      userData.password = newPassword;
      localStorage.setItem(`user_${username}`, JSON.stringify(userData));

      $scope.showMessage('Mật khẩu đã được đặt lại thành công! Đang chuyển đến trang đăng nhập...', 'success');

      $timeout(function () {
        $scope.switchTab('login');
      }, 2000);

      $scope.isLoading = false;
    }, 1500);
  };

  $scope.generateOTP = function () {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  $scope.startOTPTimer = function () {
    $scope.otpTimeLeft = 300;
    $scope.updateTimerDisplay();
    $scope.isResendDisabled = true;

    $scope.otpTimer = $interval(function () {
      $scope.otpTimeLeft--;
      $scope.updateTimerDisplay();

      if ($scope.otpTimeLeft <= 0) {
        $scope.stopOTPTimer();
        $scope.showMessage('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.', 'error');
      }
    }, 1000);
  };

  $scope.stopOTPTimer = function () {
    if ($scope.otpTimer) {
      $interval.cancel($scope.otpTimer);
      $scope.otpTimer = null;
    }
    $scope.isResendDisabled = false;
  };

  $scope.updateTimerDisplay = function () {
    const minutes = Math.floor($scope.otpTimeLeft / 60);
    const seconds = $scope.otpTimeLeft % 60;
    $scope.timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  $scope.resetForgotPassword = function () {
    $scope.forgotStep = 1;
    $scope.forgot = {
      email: '',
      otpCode: '',
      newPassword: '',
      confirmNewPassword: ''
    };
    $scope.currentOTP = '';
    $scope.currentEmail = '';
  };

  $scope.showMessage = function (text, type) {
    $scope.message = {
      text: text,
      type: type
    };
  };

  $scope.isValidEmail = function (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
});
