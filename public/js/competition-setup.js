let users = [];

async function loadUsers() {
    try {
        users = await apiCall('/api/users');
        populateUserSelects();
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

function populateUserSelects() {
    const player1Select = document.getElementById('player1');
    const player2Select = document.getElementById('player2');
    
    player1Select.innerHTML = '<option value="">请选择</option>';
    player2Select.innerHTML = '<option value="">请选择</option>';
    
    users.forEach(user => {
        const option1 = document.createElement('option');
        option1.value = user.id;
        // 对于 select option，保持使用 emoji 或文本，因为 option 标签不支持 HTML
        option1.textContent = user.name;
        player1Select.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = user.id;
        option2.textContent = user.name;
        player2Select.appendChild(option2);
    });
}

function adjustQuestionCount(change) {
    const input = document.getElementById('questionCount');
    const currentValue = parseInt(input.value) || 10;
    const newValue = currentValue + change;
    const min = parseInt(input.min) || 5;
    const max = parseInt(input.max) || 50;
    
    if (newValue >= min && newValue <= max) {
        input.value = newValue;
    }
}

function startCompetition() {
    const player1Id = parseInt(document.getElementById('player1').value);
    const player2Id = parseInt(document.getElementById('player2').value);
    
    if (!player1Id || !player2Id) {
        alert('请选择两位玩家');
        return;
    }
    
    if (player1Id === player2Id) {
        alert('请选择不同的玩家');
        return;
    }
    
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const calculationTypes = Array.from(document.querySelectorAll('input[name="calculationType"]:checked'))
        .map(cb => cb.value);
    
    if (calculationTypes.length === 0) {
        alert('请至少选择一种计算类型');
        return;
    }
    
    const settings = {
        player1Id,
        player2Id,
        mode,
        calculationTypes,
        questionCount: parseInt(document.getElementById('questionCount').value),
        digits: parseInt(document.getElementById('digits').value),
        hasRemainder: document.getElementById('hasRemainder').checked,
    };
    
    // Store settings and redirect to competition page
    localStorage.setItem('competitionSettings', JSON.stringify(settings));
    window.location.href = `/calculate-competition/competition-play`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});
