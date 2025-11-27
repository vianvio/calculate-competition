let userData = null;
let currentFilter = 'all';

async function loadStats(filter = 'all') {
    try {
        currentFilter = filter;
        const url = filter === 'all' 
            ? `/api/users/${userId}/stats` 
            : `/api/users/${userId}/stats?filter=${filter}`;
        const data = await apiCall(url);
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
    
    // 渲染详细统计
    renderDetailedStats();
}

function renderDetailedStats() {
    if (!userData.detailedStats) return;
    
    const container = document.getElementById('detailedStats');
    const typeNames = {
        addition: { name: '加法', icon: '➕', color: '#4CAF50' },
        subtraction: { name: '减法', icon: '➖', color: '#2196F3' },
        multiplication: { name: '乘法', icon: '✖️', color: '#FF9800' },
        division: { name: '除法', icon: '➗', color: '#9C27B0' },
    };
    
    const digitsNames = {
        1: '1位数',
        2: '2位数',
        3: '3位数',
    };
    
    let html = '<h2 style="margin: 30px 0 20px; font-size: 24px;">📈 详细练习统计</h2>';
    
    Object.keys(typeNames).forEach(type => {
        const stats = userData.detailedStats.byType[type];
        if (stats.total === 0) return;
        
        const typeInfo = typeNames[type];
        const accuracy = ((stats.correct / stats.total) * 100).toFixed(1);
        
        html += `
            <div class="detailed-stat-section">
                <div class="stat-section-header" style="background: ${typeInfo.color}15; border-left: 4px solid ${typeInfo.color};">
                    <span class="stat-section-icon">${typeInfo.icon}</span>
                    <span class="stat-section-name">${typeInfo.name}</span>
                    <span class="stat-section-summary">${stats.correct}/${stats.total} (${accuracy}%)</span>
                </div>
                <div class="stat-section-body">
        `;
        
        // 按位数显示
        const sortedDigits = Object.keys(stats.byDigits).sort();
        sortedDigits.forEach(digits => {
            const digitStats = stats.byDigits[digits];
            const digitAccuracy = ((digitStats.correct / digitStats.total) * 100).toFixed(1);
            const isAllCorrect = digitStats.correct === digitStats.total;
            
            html += `
                <div class="digit-stat-row">
                    <span class="digit-label">${digitsNames[digits] || digits + '位数'}</span>
                    <div class="digit-progress-bar">
                        <div class="digit-progress-fill" style="width: ${digitAccuracy}%; background: ${isAllCorrect ? '#4CAF50' : typeInfo.color}"></div>
                    </div>
                    <span class="digit-count">${digitStats.correct}/${digitStats.total}</span>
                    <span class="digit-accuracy" style="color: ${isAllCorrect ? '#4CAF50' : typeInfo.color}">${digitAccuracy}%</span>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    if (html === '<h2 style="margin: 30px 0 20px; font-size: 24px;">📈 详细练习统计</h2>') {
        html += '<p style="text-align: center; color: #999; padding: 40px;">还没有练习记录</p>';
    }
    
    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    
    // 添加过滤按钮事件监听
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有按钮的active类
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // 添加当前按钮的active类
            btn.classList.add('active');
            // 加载对应过滤条件的数据
            const filter = btn.getAttribute('data-filter');
            loadStats(filter);
        });
    });
});
