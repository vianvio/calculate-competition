let users = [];

async function loadUsers() {
    try {
        users = await apiCall('/api/users');
        renderUsers();
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

function renderUsers() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    
    if (users.length === 0) {
        userList.innerHTML = '<p style="text-align: center; color: #999; font-size: 20px;">还没有用户，请添加新用户</p>';
        return;
    }
    
    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.onclick = () => selectUser(user.id);
        
        userCard.innerHTML = `
            <div class="avatar">${user.avatar || '👤'}</div>
            <div class="name">${user.name}</div>
        `;
        
        userList.appendChild(userCard);
    });
}

function selectUser(userId) {
    // Show menu for user selection
    const menu = document.createElement('div');
    menu.className = 'modal';
    menu.innerHTML = `
        <div class="modal-content">
            <h3>选择模式</h3>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <a href="/calculate-competition/practice/${userId}" class="btn btn-primary btn-large">📝 日常练习</a>
                <a href="/calculate-competition/competition/${userId}" class="btn btn-primary btn-large">🏆 对抗竞速</a>
                <a href="/calculate-competition/calendar/${userId}" class="btn btn-secondary btn-large">📅 练习日历</a>
                <a href="/calculate-competition/stats/${userId}" class="btn btn-secondary btn-large">📊 用户统计</a>
                <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">取消</button>
            </div>
        </div>
    `;
    document.body.appendChild(menu);
}

function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'flex';
    document.getElementById('userName').focus();
}

function hideAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
    document.getElementById('userName').value = '';
}

async function addUser() {
    const userName = document.getElementById('userName').value.trim();
    
    if (!userName) {
        alert('请输入用户名');
        return;
    }
    
    try {
        // Generate random avatar emoji
        const avatars = ['👦', '👧', '🧒', '👨', '👩', '🧑', '👶'];
        const avatar = avatars[Math.floor(Math.random() * avatars.length)];
        
        await apiCall('/api/users', 'POST', { name: userName, avatar });
        hideAddUserModal();
        await loadUsers();
    } catch (error) {
        console.error('Failed to add user:', error);
        alert('添加用户失败');
    }
}

// Handle Enter key in input
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    
    const userNameInput = document.getElementById('userName');
    if (userNameInput) {
        userNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addUser();
            }
        });
    }
});
