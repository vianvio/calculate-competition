// Common utility functions
const BASE_PATH = '/calculate-competition';

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
