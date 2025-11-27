let settings = {
    calculationTypes: ['addition'],
    questionCount: 10,
    digits: 2,
    hasRemainder: false,
    hasTimeLimit: false,
    timeLimitSeconds: 300
};

let questions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let startTime;
let timerInterval;
let questionStartTime;
let questionResults = [];
let lastFocusedInput = null; // Track which input field is currently focused
let inputDirection = 'ltr'; // 'ltr' (left-to-right) or 'rtl' (right-to-left)

// Settings screen
document.addEventListener('DOMContentLoaded', () => {
    // Time limit checkbox handler
    const hasTimeLimitCheckbox = document.getElementById('hasTimeLimit');
    const timeLimitGroup = document.getElementById('timeLimitGroup');
    
    if (hasTimeLimitCheckbox) {
        hasTimeLimitCheckbox.addEventListener('change', (e) => {
            timeLimitGroup.style.display = e.target.checked ? 'block' : 'none';
        });
    }
});

function adjustQuestionCount(change) {
    const input = document.getElementById('questionCount');
    const currentValue = parseInt(input.value) || 10;
    const newValue = currentValue + change;
    const min = parseInt(input.min) || 5;
    const max = parseInt(input.max) || 100;
    
    if (newValue >= min && newValue <= max) {
        input.value = newValue;
    }
}

function adjustTimeLimit(change) {
    const input = document.getElementById('timeLimit');
    const currentValue = parseInt(input.value) || 5;
    const newValue = currentValue + change;
    const min = parseInt(input.min) || 1;
    const max = parseInt(input.max) || 60;
    
    if (newValue >= min && newValue <= max) {
        input.value = newValue;
    }
}

async function startPractice() {
    // Collect settings
    const calculationTypes = Array.from(document.querySelectorAll('input[name="calculationType"]:checked'))
        .map(cb => cb.value);
    
    if (calculationTypes.length === 0) {
        alert('请至少选择一种计算类型');
        return;
    }
    
    settings = {
        calculationTypes,
        questionCount: parseInt(document.getElementById('questionCount').value),
        digits: parseInt(document.getElementById('digits').value),
        hasRemainder: document.getElementById('hasRemainder').checked,
        hasTimeLimit: document.getElementById('hasTimeLimit').checked,
        timeLimitSeconds: parseInt(document.getElementById('timeLimit').value) * 60
    };
    
    // Generate questions
    try {
        questions = await apiCall('/api/practice/generate', 'POST', settings);
        
        // Initialize practice
        currentQuestionIndex = 0;
        correctCount = 0;
        wrongCount = 0;
        questionResults = [];
        startTime = Date.now();
        questionStartTime = Date.now();
        
        // Switch to practice screen
        document.getElementById('settingsScreen').classList.remove('active');
        document.getElementById('practiceScreen').classList.add('active');
        
        // Start timer
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
        
        // Show first question
        showQuestion();
    } catch (error) {
        console.error('Failed to generate questions:', error);
        alert('生成题目失败');
    }
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timer').textContent = formatTime(elapsed);
    
    if (settings.hasTimeLimit && elapsed >= settings.timeLimitSeconds) {
        finishPractice();
    }
}

function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        finishPractice();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    const questionTextSpan = document.querySelector('#questionDisplay .question-text');
    if (questionTextSpan) {
        questionTextSpan.textContent = question.question + ' = ';
    }
    
    // Check if this is a division question with remainder
    const isDivisionWithRemainder = question.hasRemainder;
    const answerInput = document.getElementById('answerInput');
    const divisionContainer = document.getElementById('divisionAnswerContainer');
    
    if (isDivisionWithRemainder) {
        // Show division inputs (quotient and remainder)
        answerInput.style.display = 'none';
        divisionContainer.style.display = 'inline-flex';
        const quotientInput = document.getElementById('quotientInput');
        const remainderInput = document.getElementById('remainderInput');
        quotientInput.value = '';
        remainderInput.value = '';
        
        // Add focus event listeners to track which input is active
        quotientInput.addEventListener('focus', () => {
            lastFocusedInput = 'quotient';
        });
        remainderInput.addEventListener('focus', () => {
            lastFocusedInput = 'remainder';
        });
        
        quotientInput.focus();
        lastFocusedInput = 'quotient';
    } else {
        // Show normal input
        answerInput.style.display = 'inline-block';
        divisionContainer.style.display = 'none';
        answerInput.value = '';
        answerInput.focus();
        lastFocusedInput = null;
    }
    
    // Update progress
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = questions.length;
    document.getElementById('correctCount').textContent = `✓ ${correctCount}`;
    document.getElementById('wrongCount').textContent = `✗ ${wrongCount}`;
    
    questionStartTime = Date.now();
}

function inputNumber(num) {
    const question = questions[currentQuestionIndex];
    if (question && question.hasRemainder) {
        // For division with remainder, input to the focused field
        const quotientInput = document.getElementById('quotientInput');
        const remainderInput = document.getElementById('remainderInput');
        
        // Use the tracked focus state
        if (lastFocusedInput === 'remainder') {
            if (inputDirection === 'rtl') {
                remainderInput.value = num + remainderInput.value;
            } else {
                remainderInput.value += num;
            }
        } else {
            // Default to quotient input
            if (inputDirection === 'rtl') {
                quotientInput.value = num + quotientInput.value;
            } else {
                quotientInput.value += num;
            }
        }
    } else {
        const input = document.getElementById('answerInput');
        if (inputDirection === 'rtl') {
            input.value = num + input.value;
        } else {
            input.value += num;
        }
    }
}

function clearInput() {
    const question = questions[currentQuestionIndex];
    if (question && question.hasRemainder) {
        // Delete one digit from the focused field
        const quotientInput = document.getElementById('quotientInput');
        const remainderInput = document.getElementById('remainderInput');
        
        if (lastFocusedInput === 'remainder') {
            if (inputDirection === 'rtl') {
                // RTL: Remove first character
                remainderInput.value = remainderInput.value.slice(1);
            } else {
                // LTR: Remove last character
                remainderInput.value = remainderInput.value.slice(0, -1);
            }
        } else {
            if (inputDirection === 'rtl') {
                // RTL: Remove first character
                quotientInput.value = quotientInput.value.slice(1);
            } else {
                // LTR: Remove last character
                quotientInput.value = quotientInput.value.slice(0, -1);
            }
        }
    } else {
        const input = document.getElementById('answerInput');
        if (inputDirection === 'rtl') {
            // RTL: Remove first character
            input.value = input.value.slice(1);
        } else {
            // LTR: Remove last character
            input.value = input.value.slice(0, -1);
        }
    }
}

function toggleInputDirection() {
    inputDirection = inputDirection === 'ltr' ? 'rtl' : 'ltr';
    const toggleBtn = document.getElementById('directionToggle');
    if (toggleBtn) {
        toggleBtn.textContent = inputDirection === 'ltr' ? '→' : '←';
    }
}

function submitAnswer() {
    const question = questions[currentQuestionIndex];
    let isCorrect = false;
    let userAnswer = 0;
    
    if (question.hasRemainder) {
        // Division with remainder
        const userQuotient = parseInt(document.getElementById('quotientInput').value);
        const userRemainder = parseInt(document.getElementById('remainderInput').value);
        
        if (isNaN(userQuotient) || isNaN(userRemainder)) {
            alert('请输入商和余数');
            return;
        }
        
        isCorrect = userQuotient === question.quotient && userRemainder === question.remainder;
        userAnswer = userQuotient; // Store quotient as main answer
    } else {
        // Normal answer
        userAnswer = parseInt(document.getElementById('answerInput').value);
        
        if (isNaN(userAnswer)) {
            alert('请输入答案');
            return;
        }
        
        isCorrect = userAnswer === question.answer;
    }
    
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    questionResults.push({
        question: question.question,
        answer: question.answer,
        userAnswer,
        correct: isCorrect,
        timeSpent
    });
    
    if (isCorrect) {
        correctCount++;
    } else {
        wrongCount++;
    }
    
    currentQuestionIndex++;
    showQuestion();
}

// Handle Enter key
document.addEventListener('DOMContentLoaded', () => {
    const answerInput = document.getElementById('answerInput');
    if (answerInput) {
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitAnswer();
            }
        });
    }
    
    // Handle Enter key for division inputs
    const quotientInput = document.getElementById('quotientInput');
    const remainderInput = document.getElementById('remainderInput');
    
    if (quotientInput) {
        quotientInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                remainderInput.focus(); // Move to remainder input
            }
        });
    }
    
    if (remainderInput) {
        remainderInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitAnswer(); // Submit when Enter in remainder field
            }
        });
    }
});

async function finishPractice() {
    clearInterval(timerInterval);
    
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    
    // Save session
    try {
        await apiCall('/api/practice/session', 'POST', {
            userId,
            totalQuestions: questions.length,
            correctAnswers: correctCount,
            wrongAnswers: wrongCount,
            timeSpent: totalTime,
            settings,
            questions: questionResults
        });
    } catch (error) {
        console.error('Failed to save session:', error);
    }
    
    // Show results
    document.getElementById('practiceScreen').classList.remove('active');
    document.getElementById('resultScreen').classList.add('active');
    
    document.getElementById('resultTotal').textContent = questions.length;
    document.getElementById('resultCorrect').textContent = correctCount;
    document.getElementById('resultWrong').textContent = wrongCount;
    document.getElementById('resultAccuracy').textContent = 
        ((correctCount / questions.length) * 100).toFixed(1) + '%';
    document.getElementById('resultTime').textContent = formatTime(totalTime);
    
    if (correctCount === questions.length) {
        document.getElementById('perfectResult').style.display = 'block';
    }
}
