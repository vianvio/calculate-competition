let records = [];

async function loadRecords() {
    try {
        records = await apiCall(`/api/competition/user/${userId}`);
        renderRecords();
    } catch (error) {
        console.error('Failed to load records:', error);
    }
}

function renderRecords() {
    const recordsList = document.getElementById('recordsList');
    
    if (records.length === 0) {
        recordsList.innerHTML = '<p style="text-align: center; color: #999; font-size: 20px;">还没有对抗记录</p>';
        return;
    }
    
    recordsList.innerHTML = '';
    
    records.forEach(record => {
        const isPlayer1 = record.player1Id === userId;
        const isWinner = record.winnerId === userId;
        const opponent = isPlayer1 ? record.player2 : record.player1;
        const myScore = isPlayer1 ? record.player1Score : record.player2Score;
        const opponentScore = isPlayer1 ? record.player2Score : record.player1Score;
        
        const recordItem = document.createElement('div');
        recordItem.className = 'record-item';
        recordItem.style.borderLeft = isWinner ? '5px solid #4CAF50' : '5px solid #f44336';
        
        recordItem.innerHTML = `
            <div class="record-info">
                <div class="record-players">
                    ${isWinner ? '🏆' : '❌'} 
                    VS ${opponent.avatar || '👤'} ${opponent.name}
                </div>
                <div class="record-details">
                    模式: ${record.mode === 'accuracy' ? '准确率' : '竞速抢答'} | 
                    时间: ${new Date(record.createdAt).toLocaleDateString()}
                </div>
                <div class="record-details">
                    ${isPlayer1 ? '左' : '右'}侧 - 
                    得分: ${myScore} | 
                    正确: ${isPlayer1 ? record.player1Correct : record.player2Correct}
                </div>
            </div>
            <div class="record-score">
                ${myScore} : ${opponentScore}
            </div>
        `;
        
        recordsList.appendChild(recordItem);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadRecords();
});
