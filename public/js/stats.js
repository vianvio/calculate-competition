let userData = null;

async function loadStats() {
    try {
        const data = await apiCall(`/api/users/${userId}/stats`);
        userData = data;
        renderStats();
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

function renderStats() {
    if (!userData) return;
    
    const userInfo = document.getElementById('userInfo');
    userInfo.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">${userData.user.avatar || '👤'}</div>
        <div style="font-size: 32px; font-weight: bold;">${userData.user.name}</div>
    `;
    
    document.getElementById('totalProblems').textContent = userData.stats.totalProblems;
    document.getElementById('practiceAccuracy').textContent = userData.stats.practiceAccuracy.toFixed(1) + '%';
    document.getElementById('competitionWins').textContent = userData.stats.competitionWins;
    document.getElementById('winRate').textContent = userData.stats.winRate.toFixed(1) + '%';
}

document.addEventListener('DOMContentLoaded', () => {
    loadStats();
});
