let settings = null;
let player1Data = null;
let player2Data = null;
let questions = [];
let currentQuestionIndex = 0;

// Focus tracking for division with remainder
let lastFocusedInput = {
    player1: null, // 'quotient' or 'remainder'
    player2: null,
    speed1: null,
    speed2: null
};

// Input direction tracking for each player/mode
let inputDirection = {
    player1: 'ltr',
    player2: 'ltr',
    speed1: 'ltr',
    speed2: 'ltr'
};

// Player states for accuracy mode
let player1State = {
    currentIndex: 0,
    correct: 0,
    wrong: 0,
    startTime: 0,
    results: []
};

let player2State = {
    currentIndex: 0,
    correct: 0,
    wrong: 0,
    startTime: 0,
    results: []
};

// Player states for speed mode
let speedState = {
    player1Score: 0,
    player2Score: 0,
    currentQuestion: null,
    questionIndex: 0,
    player1Results: [],
    player2Results: []
};

document.addEventListener('DOMContentLoaded', async () => {
    // Load settings from localStorage
    const settingsJson = localStorage.getItem('competitionSettings');
    if (!settingsJson) {
        alert('未找到竞速设置');
        window.location.href = '/calculate-competition';
        return;
    }
    
    settings = JSON.parse(settingsJson);
    
    // Load player data
    try {
        const [p1, p2] = await Promise.all([
            apiCall(`/api/users/${settings.player1Id}`),
            apiCall(`/api/users/${settings.player2Id}`)
        ]);
        player1Data = p1;
        player2Data = p2;
        
        // Generate questions
        questions = await apiCall('/api/competition/generate', 'POST', settings);
        
        // Show ready animation
        showReadyAnimation();
    } catch (error) {
        console.error('Failed to load competition data:', error);
        alert('加载竞速数据失败');
        window.location.href = '/calculate-competition';
    }
});

function showReadyAnimation() {
    const readyText = document.getElementById('readyText');
    
    setTimeout(() => {
        readyText.textContent = 'Ready!';
    }, 0);
    
    setTimeout(() => {
        readyText.textContent = 'Go!';
    }, 1500);
    
    setTimeout(() => {
        document.getElementById('readyScreen').classList.remove('active');
        
        if (settings.mode === 'accuracy') {
            startAccuracyMode();
        } else {
            startSpeedMode();
        }
    }, 2500);
}

// ===== Accuracy Mode =====
function startAccuracyMode() {
    document.getElementById('accuracyScreen').classList.add('active');
    
    // Set player info with avatar images
    const player1Avatar = player1Data.avatar 
        ? `<img src="/calculate-competition/avatar/${player1Data.avatar}" style="width: 30px; height: 30px; border-radius: 50%; vertical-align: middle; margin-right: 5px;" alt="avatar">`
        : '👤';
    const player2Avatar = player2Data.avatar 
        ? `<img src="/calculate-competition/avatar/${player2Data.avatar}" style="width: 30px; height: 30px; border-radius: 50%; vertical-align: middle; margin-right: 5px;" alt="avatar">`
        : '👤';
    
    document.getElementById('player1Info').innerHTML = `${player1Avatar} ${player1Data.name}`;
    document.getElementById('player2Info').innerHTML = `${player2Avatar} ${player2Data.name}`;
    
    player1State.startTime = Date.now();
    player2State.startTime = Date.now();
    
    // Start timers
    setInterval(() => {
        const elapsed1 = Math.floor((Date.now() - player1State.startTime) / 1000);
        const elapsed2 = Math.floor((Date.now() - player2State.startTime) / 1000);
        document.getElementById('timer1').textContent = formatTime(elapsed1);
        document.getElementById('timer2').textContent = formatTime(elapsed2);
    }, 1000);
    
    showQuestionAccuracy(1);
    showQuestionAccuracy(2);
}

function showQuestionAccuracy(player) {
    const state = player === 1 ? player1State : player2State;
    
    if (state.currentIndex >= questions.length) {
        return;
    }
    
    const question = questions[state.currentIndex];
    const questionTextSpan = document.querySelector(`#question${player} .question-text`);
    if (questionTextSpan) {
        questionTextSpan.textContent = question.question + ' = ';
    }
    
    // Check if this is a division question with remainder
    const isDivisionWithRemainder = question.hasRemainder;
    const answerInput = document.getElementById(`answer${player}`);
    const divisionContainer = document.getElementById(`divisionAnswerContainer${player}`);
    
    if (isDivisionWithRemainder) {
        // Show division inputs (quotient and remainder)
        answerInput.style.display = 'none';
        divisionContainer.style.display = 'inline-flex';
        const quotientInput = document.getElementById(`quotient${player}`);
        const remainderInput = document.getElementById(`remainder${player}`);
        quotientInput.value = '';
        remainderInput.value = '';
        
        // Add focus event listeners
        const focusKey = `player${player}`;
        quotientInput.addEventListener('focus', () => {
            lastFocusedInput[focusKey] = 'quotient';
        });
        remainderInput.addEventListener('focus', () => {
            lastFocusedInput[focusKey] = 'remainder';
        });
        
        // Add Enter key navigation
        quotientInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                remainderInput.focus();
            }
        });
        remainderInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitAnswer(player);
            }
        });
        
        quotientInput.focus();
        lastFocusedInput[focusKey] = 'quotient';
    } else {
        // Show normal input
        answerInput.style.display = 'inline-block';
        divisionContainer.style.display = 'none';
        answerInput.value = '';
        lastFocusedInput[`player${player}`] = null;
    }
    
    document.getElementById(`progress${player}`).textContent = `${state.currentIndex + 1} / ${questions.length}`;
    document.getElementById(`correct${player}`).textContent = `✓ ${state.correct}`;
    document.getElementById(`wrong${player}`).textContent = `✗ ${state.wrong}`;
}

function inputNumber(player, num) {
    const state = player === 1 ? player1State : player2State;
    const question = questions[state.currentIndex];
    const directionKey = `player${player}`;
    const direction = inputDirection[directionKey];
    
    if (question && question.hasRemainder) {
        // For division with remainder, input to the focused field
        const quotientInput = document.getElementById(`quotient${player}`);
        const remainderInput = document.getElementById(`remainder${player}`);
        const focusKey = `player${player}`;
        
        if (lastFocusedInput[focusKey] === 'remainder') {
            if (direction === 'rtl') {
                remainderInput.value = num + remainderInput.value;
            } else {
                remainderInput.value += num;
            }
        } else {
            if (direction === 'rtl') {
                quotientInput.value = num + quotientInput.value;
            } else {
                quotientInput.value += num;
            }
        }
    } else {
        const input = document.getElementById(`answer${player}`);
        if (direction === 'rtl') {
            input.value = num + input.value;
        } else {
            input.value += num;
        }
    }
}

function clearInput(player) {
    const state = player === 1 ? player1State : player2State;
    const question = questions[state.currentIndex];
    const directionKey = `player${player}`;
    const direction = inputDirection[directionKey];
    
    if (question && question.hasRemainder) {
        const quotientInput = document.getElementById(`quotient${player}`);
        const remainderInput = document.getElementById(`remainder${player}`);
        const focusKey = `player${player}`;
        
        if (lastFocusedInput[focusKey] === 'remainder') {
            if (direction === 'rtl') {
                // RTL: Remove first character
                remainderInput.value = remainderInput.value.slice(1);
            } else {
                // LTR: Remove last character
                remainderInput.value = remainderInput.value.slice(0, -1);
            }
        } else {
            if (direction === 'rtl') {
                // RTL: Remove first character
                quotientInput.value = quotientInput.value.slice(1);
            } else {
                // LTR: Remove last character
                quotientInput.value = quotientInput.value.slice(0, -1);
            }
        }
    } else {
        const input = document.getElementById(`answer${player}`);
        if (direction === 'rtl') {
            // RTL: Remove first character
            input.value = input.value.slice(1);
        } else {
            // LTR: Remove last character
            input.value = input.value.slice(0, -1);
        }
    }
}

function toggleInputDirection(player) {
    const directionKey = `player${player}`;
    inputDirection[directionKey] = inputDirection[directionKey] === 'ltr' ? 'rtl' : 'ltr';
    const toggleBtn = document.getElementById(`directionToggle${player}`);
    if (toggleBtn) {
        toggleBtn.textContent = inputDirection[directionKey] === 'ltr' ? '→' : '←';
    }
}

function submitAnswer(player) {
    const state = player === 1 ? player1State : player2State;
    const question = questions[state.currentIndex];
    let isCorrect = false;
    let userAnswer = 0;
    
    if (question.hasRemainder) {
        // Division with remainder
        const quotientInput = document.getElementById(`quotient${player}`);
        const remainderInput = document.getElementById(`remainder${player}`);
        const userQuotient = parseInt(quotientInput.value);
        const userRemainder = parseInt(remainderInput.value);
        
        if (isNaN(userQuotient) || isNaN(userRemainder)) {
            alert('请输入商和余数');
            return;
        }
        
        isCorrect = userQuotient === question.quotient && userRemainder === question.remainder;
        userAnswer = `${userQuotient}...${userRemainder}`;
    } else {
        // Normal question
        userAnswer = parseInt(document.getElementById(`answer${player}`).value);
        
        if (isNaN(userAnswer)) {
            alert('请输入答案');
            return;
        }
        
        isCorrect = userAnswer === question.answer;
    }
    
    const timeSpent = Math.floor((Date.now() - state.startTime) / 1000);
    
    state.results.push({
        question: question.question,
        answer: question.hasRemainder ? `${question.quotient}...${question.remainder}` : question.answer,
        userAnswer,
        correct: isCorrect,
        timeSpent
    });
    
    if (isCorrect) {
        state.correct++;
    } else {
        state.wrong++;
    }
    
    state.currentIndex++;
    
    if (state.currentIndex >= questions.length) {
        // Check if both players finished
        if ((player === 1 && player2State.currentIndex >= questions.length) ||
            (player === 2 && player1State.currentIndex >= questions.length)) {
            finishAccuracyMode();
        }
    } else {
        showQuestionAccuracy(player);
    }
}

async function finishAccuracyMode() {
    const player1Time = Math.floor((Date.now() - player1State.startTime) / 1000);
    const player2Time = Math.floor((Date.now() - player2State.startTime) / 1000);
    
    const player1Accuracy = (player1State.correct / questions.length) * 100;
    const player2Accuracy = (player2State.correct / questions.length) * 100;
    
    let winnerId;
    if (player1Accuracy > player2Accuracy) {
        winnerId = settings.player1Id;
    } else if (player2Accuracy > player1Accuracy) {
        winnerId = settings.player2Id;
    } else {
        // Same accuracy, check time
        winnerId = player1Time < player2Time ? settings.player1Id : settings.player2Id;
    }
    
    // Save record
    try {
        await apiCall('/api/competition/record', 'POST', {
            player1Id: settings.player1Id,
            player2Id: settings.player2Id,
            mode: 'accuracy',
            winnerId,
            player1Score: player1State.correct,
            player2Score: player2State.correct,
            player1Correct: player1State.correct,
            player2Correct: player2State.correct,
            player1Time,
            player2Time,
            settings,
            player1Questions: player1State.results,
            player2Questions: player2State.results
        });
    } catch (error) {
        console.error('Failed to save competition record:', error);
    }
    
    showResult('accuracy', winnerId);
}

// ===== Speed Mode =====
function startSpeedMode() {
    document.getElementById('speedScreen').classList.add('active');
    
    // Set player info with avatar images
    const player1Avatar = player1Data.avatar 
        ? `<img src="/calculate-competition/avatar/${player1Data.avatar}" style="width: 30px; height: 30px; border-radius: 50%; vertical-align: middle; margin-right: 5px;" alt="avatar">`
        : '👤';
    const player2Avatar = player2Data.avatar 
        ? `<img src="/calculate-competition/avatar/${player2Data.avatar}" style="width: 30px; height: 30px; border-radius: 50%; vertical-align: middle; margin-right: 5px;" alt="avatar">`
        : '👤';
    
    document.getElementById('speedPlayer1Info').innerHTML = `${player1Avatar} ${player1Data.name}`;
    document.getElementById('speedPlayer2Info').innerHTML = `${player2Avatar} ${player2Data.name}`;
    
    showQuestionSpeed();
}

function showQuestionSpeed() {
    if (speedState.questionIndex >= questions.length) {
        finishSpeedMode();
        return;
    }
    
    speedState.currentQuestion = questions[speedState.questionIndex];
    const question = speedState.currentQuestion;
    
    // Update question text for both players
    const questionTextSpan1 = document.querySelector('#speedQuestion1 .question-text');
    const questionTextSpan2 = document.querySelector('#speedQuestion2 .question-text');
    if (questionTextSpan1) questionTextSpan1.textContent = question.question + ' = ';
    if (questionTextSpan2) questionTextSpan2.textContent = question.question + ' = ';
    
    // Check if this is a division question with remainder
    const isDivisionWithRemainder = question.hasRemainder;
    
    // Setup for Player 1
    const answerInput1 = document.getElementById('speedAnswer1');
    const divisionContainer1 = document.getElementById('speedDivisionAnswerContainer1');
    
    if (isDivisionWithRemainder) {
        answerInput1.style.display = 'none';
        divisionContainer1.style.display = 'inline-flex';
        const quotientInput1 = document.getElementById('speedQuotient1');
        const remainderInput1 = document.getElementById('speedRemainder1');
        quotientInput1.value = '';
        remainderInput1.value = '';
        
        quotientInput1.addEventListener('focus', () => {
            lastFocusedInput.speed1 = 'quotient';
        });
        remainderInput1.addEventListener('focus', () => {
            lastFocusedInput.speed1 = 'remainder';
        });
        
        // Add Enter key navigation for Player 1
        quotientInput1.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                remainderInput1.focus();
            }
        });
        remainderInput1.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitAnswerSpeed(1);
            }
        });
        
        quotientInput1.focus();
        lastFocusedInput.speed1 = 'quotient';
    } else {
        answerInput1.style.display = 'inline-block';
        divisionContainer1.style.display = 'none';
        answerInput1.value = '';
        lastFocusedInput.speed1 = null;
    }
    
    // Setup for Player 2
    const answerInput2 = document.getElementById('speedAnswer2');
    const divisionContainer2 = document.getElementById('speedDivisionAnswerContainer2');
    
    if (isDivisionWithRemainder) {
        answerInput2.style.display = 'none';
        divisionContainer2.style.display = 'inline-flex';
        const quotientInput2 = document.getElementById('speedQuotient2');
        const remainderInput2 = document.getElementById('speedRemainder2');
        quotientInput2.value = '';
        remainderInput2.value = '';
        
        quotientInput2.addEventListener('focus', () => {
            lastFocusedInput.speed2 = 'quotient';
        });
        remainderInput2.addEventListener('focus', () => {
            lastFocusedInput.speed2 = 'remainder';
        });
        
        // Add Enter key navigation for Player 2
        quotientInput2.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                remainderInput2.focus();
            }
        });
        remainderInput2.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitAnswerSpeed(2);
            }
        });
        
        lastFocusedInput.speed2 = 'quotient';
    } else {
        answerInput2.style.display = 'inline-block';
        divisionContainer2.style.display = 'none';
        answerInput2.value = '';
        lastFocusedInput.speed2 = null;
    }
    
    document.getElementById('score1').textContent = `${speedState.player1Score} 分`;
    document.getElementById('score2').textContent = `${speedState.player2Score} 分`;
}

function inputNumberSpeed(player, num) {
    const question = speedState.currentQuestion;
    const directionKey = `speed${player}`;
    const direction = inputDirection[directionKey];
    
    if (question && question.hasRemainder) {
        // For division with remainder, input to the focused field
        const quotientInput = document.getElementById(`speedQuotient${player}`);
        const remainderInput = document.getElementById(`speedRemainder${player}`);
        const focusKey = `speed${player}`;
        
        if (lastFocusedInput[focusKey] === 'remainder') {
            if (direction === 'rtl') {
                remainderInput.value = num + remainderInput.value;
            } else {
                remainderInput.value += num;
            }
        } else {
            if (direction === 'rtl') {
                quotientInput.value = num + quotientInput.value;
            } else {
                quotientInput.value += num;
            }
        }
    } else {
        const input = document.getElementById(`speedAnswer${player}`);
        if (direction === 'rtl') {
            input.value = num + input.value;
        } else {
            input.value += num;
        }
    }
}

function clearInputSpeed(player) {
    const question = speedState.currentQuestion;
    const directionKey = `speed${player}`;
    const direction = inputDirection[directionKey];
    
    if (question && question.hasRemainder) {
        const quotientInput = document.getElementById(`speedQuotient${player}`);
        const remainderInput = document.getElementById(`speedRemainder${player}`);
        const focusKey = `speed${player}`;
        
        if (lastFocusedInput[focusKey] === 'remainder') {
            if (direction === 'rtl') {
                // RTL: Remove first character
                remainderInput.value = remainderInput.value.slice(1);
            } else {
                // LTR: Remove last character
                remainderInput.value = remainderInput.value.slice(0, -1);
            }
        } else {
            if (direction === 'rtl') {
                // RTL: Remove first character
                quotientInput.value = quotientInput.value.slice(1);
            } else {
                // LTR: Remove last character
                quotientInput.value = quotientInput.value.slice(0, -1);
            }
        }
    } else {
        const input = document.getElementById(`speedAnswer${player}`);
        if (direction === 'rtl') {
            // RTL: Remove first character
            input.value = input.value.slice(1);
        } else {
            // LTR: Remove last character
            input.value = input.value.slice(0, -1);
        }
    }
}

function toggleInputDirectionSpeed(player) {
    const directionKey = `speed${player}`;
    inputDirection[directionKey] = inputDirection[directionKey] === 'ltr' ? 'rtl' : 'ltr';
    const toggleBtn = document.getElementById(`speedDirectionToggle${player}`);
    if (toggleBtn) {
        toggleBtn.textContent = inputDirection[directionKey] === 'ltr' ? '→' : '←';
    }
}

function submitAnswerSpeed(player) {
    const question = speedState.currentQuestion;
    let isCorrect = false;
    let userAnswer = 0;
    
    if (question.hasRemainder) {
        // Division with remainder
        const quotientInput = document.getElementById(`speedQuotient${player}`);
        const remainderInput = document.getElementById(`speedRemainder${player}`);
        const userQuotient = parseInt(quotientInput.value);
        const userRemainder = parseInt(remainderInput.value);
        
        if (isNaN(userQuotient) || isNaN(userRemainder)) {
            alert('请输入商和余数');
            return;
        }
        
        isCorrect = userQuotient === question.quotient && userRemainder === question.remainder;
        userAnswer = `${userQuotient}...${userRemainder}`;
    } else {
        // Normal question
        userAnswer = parseInt(document.getElementById(`speedAnswer${player}`).value);
        
        if (isNaN(userAnswer)) {
            alert('请输入答案');
            return;
        }
        
        isCorrect = userAnswer === question.answer;
    }
    
    if (player === 1) {
        speedState.player1Results.push({
            question: question.question,
            answer: question.hasRemainder ? `${question.quotient}...${question.remainder}` : question.answer,
            userAnswer,
            correct: isCorrect
        });
        if (isCorrect) {
            speedState.player1Score++;
        }
    } else {
        speedState.player2Results.push({
            question: question.question,
            answer: question.hasRemainder ? `${question.quotient}...${question.remainder}` : question.answer,
            userAnswer,
            correct: isCorrect
        });
        if (isCorrect) {
            speedState.player2Score++;
        }
    }
    
    if (isCorrect) {
        // Correct answer, move to next question
        speedState.questionIndex++;
        showQuestionSpeed();
    }
}

async function finishSpeedMode() {
    const winnerId = speedState.player1Score > speedState.player2Score ? 
        settings.player1Id : 
        (speedState.player2Score > speedState.player1Score ? settings.player2Id : settings.player1Id);
    
    // Save record
    try {
        await apiCall('/api/competition/record', 'POST', {
            player1Id: settings.player1Id,
            player2Id: settings.player2Id,
            mode: 'speed',
            winnerId,
            player1Score: speedState.player1Score,
            player2Score: speedState.player2Score,
            player1Correct: speedState.player1Score,
            player2Correct: speedState.player2Score,
            player1Time: 0,
            player2Time: 0,
            settings,
            player1Questions: speedState.player1Results,
            player2Questions: speedState.player2Results
        });
    } catch (error) {
        console.error('Failed to save competition record:', error);
    }
    
    showResult('speed', winnerId);
}

function showResult(mode, winnerId) {
    document.getElementById('accuracyScreen').classList.remove('active');
    document.getElementById('speedScreen').classList.remove('active');
    document.getElementById('resultScreen').classList.add('active');
    
    // Set player info with avatar images
    const resultAvatar1 = document.getElementById('resultAvatar1');
    const resultAvatar2 = document.getElementById('resultAvatar2');
    
    if (player1Data.avatar) {
        resultAvatar1.innerHTML = `<img src="/calculate-competition/avatar/${player1Data.avatar}" style="width: 60px; height: 60px; border-radius: 50%;" alt="avatar">`;
    } else {
        resultAvatar1.textContent = '👤';
    }
    
    if (player2Data.avatar) {
        resultAvatar2.innerHTML = `<img src="/calculate-competition/avatar/${player2Data.avatar}" style="width: 60px; height: 60px; border-radius: 50%;" alt="avatar">`;
    } else {
        resultAvatar2.textContent = '👤';
    }
    
    document.getElementById('resultName1').textContent = player1Data.name;
    document.getElementById('resultName2').textContent = player2Data.name;
    
    // Set stats
    if (mode === 'accuracy') {
        const player1Time = Math.floor((Date.now() - player1State.startTime) / 1000);
        const player2Time = Math.floor((Date.now() - player2State.startTime) / 1000);
        const player1Accuracy = ((player1State.correct / questions.length) * 100).toFixed(1);
        const player2Accuracy = ((player2State.correct / questions.length) * 100).toFixed(1);
        
        document.getElementById('resultStats1').innerHTML = `
            <div>正确: ${player1State.correct} / ${questions.length}</div>
            <div>正确率: ${player1Accuracy}%</div>
            <div>用时: ${formatTime(player1Time)}</div>
        `;
        
        document.getElementById('resultStats2').innerHTML = `
            <div>正确: ${player2State.correct} / ${questions.length}</div>
            <div>正确率: ${player2Accuracy}%</div>
            <div>用时: ${formatTime(player2Time)}</div>
        `;
    } else {
        document.getElementById('resultStats1').innerHTML = `
            <div>得分: ${speedState.player1Score}</div>
            <div>总题数: ${questions.length}</div>
        `;
        
        document.getElementById('resultStats2').innerHTML = `
            <div>得分: ${speedState.player2Score}</div>
            <div>总题数: ${questions.length}</div>
        `;
    }
    
    // Highlight winner
    if (winnerId === settings.player1Id) {
        document.getElementById('player1Result').classList.add('winner');
        document.getElementById('winnerAnnouncement').textContent = `🎉 ${player1Data.name} 获胜！`;
    } else {
        document.getElementById('player2Result').classList.add('winner');
        document.getElementById('winnerAnnouncement').textContent = `🎉 ${player2Data.name} 获胜！`;
    }
}

function playAgain() {
    window.location.href = `/calculate-competition/competition/${settings.player1Id}`;
}
