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
        
        const avatarDisplay = user.avatar 
            ? `<img src="/calculate-competition/avatar/${user.avatar}" class="avatar-img" alt="avatar">`
            : '<div class="avatar">👤</div>';
        
        userCard.innerHTML = `
            ${avatarDisplay}
            <div class="name">${user.name}</div>
            <button class="edit-avatar-btn" onclick="event.stopPropagation(); showAvatarSelector(${user.id}, '${user.avatar || ''}')">✏️</button>
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
    // 随机选择一个默认头像
    const randomIndex = Math.floor(Math.random() * availableAvatars.length);
    selectedNewUserAvatar = availableAvatars[randomIndex];
    renderNewUserAvatarGrid();
    
    const userNameInput = document.getElementById('userName');
    // 移除所有可能阻止输入的属性和事件监听器
    userNameInput.removeAttribute('readonly');
    userNameInput.removeAttribute('disabled');
    
    // 移除之前可能添加的事件监听器（通过克隆节点）
    const newInput = userNameInput.cloneNode(true);
    userNameInput.parentNode.replaceChild(newInput, userNameInput);
    
    // 重新添加 Enter 键监听
    newInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addUser();
        }
    });
    
    // 延迟聚焦以确保键盘能弹出
    setTimeout(() => {
        newInput.focus();
    }, 100);
}

function hideAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
    document.getElementById('userName').value = '';
    selectedNewUserAvatar = null;
}

async function addUser() {
    const userName = document.getElementById('userName').value.trim();
    
    if (!userName) {
        alert('请输入用户名');
        return;
    }
    
    if (!selectedNewUserAvatar) {
        alert('请选择头像');
        return;
    }
    
    try {
        await apiCall('/api/users', 'POST', { name: userName, avatar: selectedNewUserAvatar });
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
});

// Avatar selection functionality
const availableAvatars = ['1.png', '2.png', '3.png', '4.png', '5.png'];
let selectedNewUserAvatar = null;

function showAvatarSelector(userId, currentAvatar) {
    const modal = document.createElement('div');
    modal.className = 'modal avatar-selector-modal';
    
    const avatarGrid = availableAvatars.map(avatar => 
        `<div class="avatar-option ${avatar === currentAvatar ? 'selected' : ''}" 
              onclick="selectAvatar(${userId}, '${avatar}', this.parentElement.parentElement.parentElement)">
            <img src="/calculate-competition/avatar/${avatar}" alt="avatar">
         </div>`
    ).join('');
    
    modal.innerHTML = `
        <div class="modal-content avatar-selector-content">
            <h3>选择头像</h3>
            <div class="avatar-grid">
                ${avatarGrid}
            </div>
            <button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()">取消</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function renderNewUserAvatarGrid() {
    const grid = document.getElementById('newUserAvatarGrid');
    if (!grid) return;
    
    grid.innerHTML = availableAvatars.map(avatar => 
        `<div class="avatar-option ${avatar === selectedNewUserAvatar ? 'selected' : ''}" 
              onclick="selectNewUserAvatar('${avatar}')">
            <img src="/calculate-competition/avatar/${avatar}" alt="avatar">
         </div>`
    ).join('');
}

function selectNewUserAvatar(avatar) {
    selectedNewUserAvatar = avatar;
    renderNewUserAvatarGrid();
}

async function selectAvatar(userId, avatar, modalElement) {
    try {
        await apiCall(`/api/users/${userId}/avatar`, 'PATCH', { avatar });
        modalElement.remove();
        await loadUsers();
    } catch (error) {
        console.error('Failed to update avatar:', error);
        alert('更新头像失败');
    }
}
