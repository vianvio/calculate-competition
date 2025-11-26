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
        if (dayData && dayData.hasPractice) {
            icon = dayData.isPerfect ? '⭐️' : '✓';
        }
        
        dayElement.innerHTML = `
            <div class="date">${day}</div>
            ${icon ? `<div class="icon">${icon}</div>` : ''}
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
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${date}</h3>
            <div style="font-size: 20px; margin: 20px 0;">
                <p>练习次数: ${data.sessions.length}</p>
                <p>总题数: ${data.totalQuestions}</p>
                <p>正确: ${data.correctAnswers}</p>
                <p>正确率: ${((data.correctAnswers / data.totalQuestions) * 100).toFixed(1)}%</p>
            </div>
            <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">关闭</button>
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
