// Common utility functions
const BASE_PATH = '/calculate-competition';

// Disable default keyboard on all input fields
document.addEventListener('DOMContentLoaded', function() {
    // Prevent default keyboard from showing
    const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"]');
    
    inputs.forEach(input => {
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
