// DOM elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const loginBtn = document.getElementById('loginBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const btnText = loginBtn.querySelector('.btn-text');

// Error message elements
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

// Demo credentials
const DEMO_EMAIL = 'admin@example.com';
const DEMO_PASSWORD = '123456';

// Toggle password visibility
togglePasswordBtn.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    const eyeOpen = this.querySelector('.eye-open');
    const eyeClosed = this.querySelector('.eye-closed');
    
    if (type === 'password') {
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    } else {
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    }
});

// Clear error messages when user starts typing
emailInput.addEventListener('input', function() {
    clearError('email');
});

passwordInput.addEventListener('input', function() {
    clearError('password');
});

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Form validation
function validateForm() {
    let isValid = true;
    
    // Clear previous errors
    clearAllErrors();
    
    // Validate email
    if (!emailInput.value.trim()) {
        showError('email', 'Vui lòng nhập email');
        isValid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
        showError('email', 'Email không đúng định dạng');
        isValid = false;
    }
    
    // Validate password
    if (!passwordInput.value) {
        showError('password', 'Vui lòng nhập mật khẩu');
        isValid = false;
    } else if (passwordInput.value.length < 6) {
        showError('password', 'Mật khẩu phải có ít nhất 6 ký tự');
        isValid = false;
    }
    
    return isValid;
}

// Show error message
function showError(field, message) {
    const errorElement = document.getElementById(field + 'Error');
    const inputElement = document.getElementById(field);
    
    errorElement.textContent = message;
    inputElement.classList.add('error');
}

// Clear specific error
function clearError(field) {
    const errorElement = document.getElementById(field + 'Error');
    const inputElement = document.getElementById(field);
    
    errorElement.textContent = '';
    inputElement.classList.remove('error');
}

// Clear all errors
function clearAllErrors() {
    clearError('email');
    clearError('password');
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Set loading state
function setLoading(loading) {
    if (loading) {
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
    } else {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
    }
}

// Handle form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        showToast('Vui lòng kiểm tra lại thông tin', 'error');
        return;
    }
    
    // Get form data
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Set loading state
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        
        // Check credentials
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
            showToast('Đăng nhập thành công!', 'success');

            
            // Save login state if remember me is checked
            if (rememberMe) {
                localStorage.setItem('rememberedUser', email);
            }
            
            // Simulate redirect after successful login
            setTimeout(() => {
                showToast('Chuyển hướng đến trang chủ...', 'success');
                window.location.href = "home.html";
            }, 1500);
            
        } else {
            showToast('Email hoặc mật khẩu không đúng', 'error');
        }
    }, 2000);
});

// Handle forgot password
document.querySelector('.forgot-password').addEventListener('click', function(e) {
    e.preventDefault();
    showToast('Tính năng này đang được phát triển', 'error');
});

// Load remembered user on page load
window.addEventListener('load', function() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        emailInput.value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }
});

// Add smooth focus animations
const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Enter key to submit form
    if (e.key === 'Enter' && !loginBtn.disabled) {
        loginForm.dispatchEvent(new Event('submit'));
    }
    
    // Escape key to clear form
    if (e.key === 'Escape') {
        emailInput.value = '';
        passwordInput.value = '';
        document.getElementById('rememberMe').checked = false;
        clearAllErrors();
    }
});

// Add input animations
inputs.forEach(input => {
    input.addEventListener('input', function() {
        if (this.value) {
            // Add typing effect
            this.style.transform = 'scale(1.01)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        }
    });
    
    // Add click ripple effect
    input.addEventListener('click', function(e) {
        const container = this.closest('.input-container');
        if (!container) return;
        
        const ripple = document.createElement('span');
        const rect = container.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.classList.add('input-ripple');
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        container.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});