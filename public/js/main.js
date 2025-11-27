// Common utility functions
const BASE_PATH = '/calculate-competition';

// Disable default keyboard on all input fields
function disableKeyboardOnInput(input) {
    // 检查是否允许键盘输入
    if (input.hasAttribute('data-allow-keyboard') || 
        input.id === 'userName' || 
        input.classList.contains('allow-keyboard')) {
        return; // 跳过这个输入框，允许正常键盘输入
    }
    
    // Make input readonly to prevent keyboard
    input.setAttribute('readonly', 'readonly');
    
    // Remove readonly on first touch to allow programmatic input
    input.addEventListener('touchstart', function(e) {
        this.removeAttribute('readonly');
    }, { once: true, passive: true });
    
    // Prevent keyboard from showing
    input.addEventListener('focus', function(e) {
        this.setAttribute('readonly', 'readonly');
        // Allow blur/focus cycle
        setTimeout(() => {
            this.removeAttribute('readonly');
        }, 100);
    });
    
    // Prevent default keyboard behavior
    input.addEventListener('touchend', function(e) {
        e.preventDefault();
        this.blur();
        this.focus();
    });
    
    // Block keyboard input
    input.addEventListener('keydown', function(e) {
        e.preventDefault();
        return false;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // 处理初始存在的输入框
    const inputs = document.querySelectorAll('input[type="tel"], input[type="number"]');
    inputs.forEach(input => disableKeyboardOnInput(input));
    
    // 使用 MutationObserver 监听动态添加的输入框
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // 元素节点
                    // 检查节点本身是否是输入框
                    if (node.tagName === 'INPUT' && 
                        (node.type === 'text' || node.type === 'tel' || node.type === 'number')) {
                        disableKeyboardOnInput(node);
                    }
                    // 检查节点内是否包含输入框
                    const inputs = node.querySelectorAll('input[type="tel"], input[type="number"]');
                    inputs.forEach(input => disableKeyboardOnInput(input));
                }
            });
        });
    });
    
    // 开始观察 body 的变化
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function apiCall(url, method = 'GET', data = null) {
    // Add base path if not already present
    const fullUrl = url.startsWith(BASE_PATH) ? url : `${BASE_PATH}${url}`;
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(fullUrl, options);
    return response.json();
}
