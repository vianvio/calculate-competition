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
    
    // 根据头像类型显示图片或默认 emoji
    const avatarDisplay = userData.user.avatar 
        ? `<img src="/calculate-competition/avatar/${userData.user.avatar}" class="avatar-img" style="width: 120px; height: 120px; margin: 0 auto;" alt="avatar">`
        : '<div style="font-size: 80px;">👤</div>';
    
    userInfo.innerHTML = `
        ${avatarDisplay}
        <div style="font-size: 32px; font-weight: bold; margin-top: 15px;">${userData.user.name}</div>
    `;
    
    document.getElementById('totalProblems').textContent = userData.stats.totalProblems;
    document.getElementById('practiceAccuracy').textContent = userData.stats.practiceAccuracy.toFixed(1) + '%';
    document.getElementById('competitionWins').textContent = userData.stats.competitionWins;
    document.getElementById('winRate').textContent = userData.stats.winRate.toFixed(1) + '%';
}

document.addEventListener('DOMContentLoaded', () => {
    loadStats();
});
