let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let calendarData = {};

async function loadCalendar() {
    try {
        calendarData = await apiCall(`/api/practice/calendar/${userId}?year=${currentYear}&month=${currentMonth}`);
        renderCalendar();
    } catch (error) {
        console.error('Failed to load calendar:', error);
    }
}

function renderCalendar() {
    document.getElementById('currentMonth').textContent = `${currentYear}年${currentMonth}月`;
    
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    // Get first day and total days
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const today = new Date();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        emptyDay.style.opacity = '0.3';
        grid.appendChild(emptyDay);
    }
    
    // Add days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayData = calendarData[dateStr];
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (dayData && dayData.hasPractice) {
            dayElement.classList.add('has-practice');
            if (dayData.isPerfect) {
                dayElement.classList.add('perfect');
            }
        }
        
        if (today.getFullYear() === currentYear && 
            today.getMonth() + 1 === currentMonth && 
            today.getDate() === day) {
            dayElement.classList.add('today');
        }
        
        let icon = '';
        let typeStatsHtml = '';
        if (dayData && dayData.hasPractice) {
            icon = dayData.isPerfect ? '⭐️' : '✓';
            
            // 生成简洁的运算类型统计
            const typeIcons = {
                addition: '➕',
                subtraction: '➖',
                multiplication: '✖️',
                division: '➗'
            };
            
            const typeStatsArray = [];
            Object.keys(dayData.byType).forEach(type => {
                const stats = dayData.byType[type];
                if (stats.total > 0) {
                    const accuracy = Math.round((stats.correct / stats.total) * 100);
                    typeStatsArray.push({
                        icon: typeIcons[type],
                        total: stats.total,
                        accuracy: accuracy
                    });
                }
            });
            
            if (typeStatsArray.length > 0) {
                typeStatsHtml = `<div class="day-stats">${typeStatsArray.map(s => 
                    `<span class="type-mini" title="${s.icon} ${s.total}题 ${s.accuracy}%">${s.icon}${s.total}</span>`
                ).join('')}</div>`;
            }
        }
        
        dayElement.innerHTML = `
            <div class="date">${day}</div>
            ${icon ? `<div class="icon">${icon}</div>` : ''}
            ${typeStatsHtml}
        `;
        
        if (dayData && dayData.hasPractice) {
            dayElement.onclick = () => showDayDetails(dateStr, dayData);
        }
        
        grid.appendChild(dayElement);
    }
}

function showDayDetails(date, data) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // 生成运算类型统计
    const typeStats = [];
    const typeNames = {
        addition: '➕ 加法',
        subtraction: '➖ 减法',
        multiplication: '✖️ 乘法',
        division: '➗ 除法'
    };
    
    Object.keys(data.byType).forEach(type => {
        const stats = data.byType[type];
        if (stats.total > 0) {
            const accuracy = ((stats.correct / stats.total) * 100).toFixed(1);
            typeStats.push(`
                <div class="type-stat-row">
                    <span class="type-name">${typeNames[type]}</span>
                    <span class="type-count">${stats.correct}/${stats.total}</span>
                    <span class="type-accuracy" style="color: ${parseFloat(accuracy) === 100 ? '#4CAF50' : '#FF9800'}">
                        ${accuracy}%
                    </span>
                </div>
            `);
        }
    });
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3>📅 ${date}</h3>
            <div class="day-summary">
                <div class="summary-item">
                    <div class="summary-label">练习次数</div>
                    <div class="summary-value">${data.sessions.length}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">总题数</div>
                    <div class="summary-value">${data.totalQuestions}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">正确率</div>
                    <div class="summary-value" style="color: ${data.isPerfect ? '#4CAF50' : '#FF9800'}">
                        ${((data.correctAnswers / data.totalQuestions) * 100).toFixed(1)}%
                    </div>
                </div>
            </div>
            
            ${typeStats.length > 0 ? `
                <div class="type-stats">
                    <h4>各运算类型统计</h4>
                    ${typeStats.join('')}
                </div>
            ` : ''}
            
            <button class="btn btn-primary btn-large" onclick="this.parentElement.parentElement.remove()">关闭</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    loadCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    }
    loadCalendar();
}

document.addEventListener('DOMContentLoaded', () => {
    loadCalendar();
});
