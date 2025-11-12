// --- All UI Elements ---
const selectionContainer = document.getElementById('selection-container');
const quizContainer = document.getElementById('quiz-container');
const topicSelect = document.getElementById('topic-select');
const startBtn = document.getElementById('start-btn');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answers');
const resultsBtn = document.getElementById('results-btn');
const resultsContainer = document.getElementById('results-container');
const wrongAnswersList = document.getElementById('wrong-answers-list');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const questionCounterElement = document.getElementById('question-counter');
// === NEW: Get the new quiz mode container ===
const quizModeContainer = document.getElementById('quiz-mode-container'); 

// --- List of all your JSON files for the 'random' option ---
const allQuestionFiles = [
    'questions_1.json', 'questions_2.json', 'questions_3.json', 'questions_4.json',
    'questions_5.json', 'questions_6.json', 'questions_7.json', 'questions_8.json',
    'questions_9.json', 'questions_10.json', 'questions_11.json', 'questions_12.json'
];

let currentQuizQuestions = [];
let currentQuestionIndex = 0;
let wrongAnswers = [];

// === NEW: Show/Hide Quiz Mode based on topic selection ===
topicSelect.addEventListener('change', () => {
    if (topicSelect.value === 'random') {
        quizModeContainer.classList.add('hide');
    } else {
        quizModeContainer.classList.remove('hide');
    }
});

// --- Event Listener to start the quiz (MODIFIED) ---
startBtn.addEventListener('click', async () => {
    const selectedTopic = topicSelect.value;

    selectionContainer.classList.add('hide');
    quizContainer.classList.remove('hide');
    // Hide mode container when quiz starts
    quizModeContainer.classList.add('hide'); 

    if (selectedTopic === 'random') {
        // --- This logic is unchanged ---
        try {
            const fetchPromises = allQuestionFiles.map(file => fetch(file).then(res => res.json()));
            const questionArrays = await Promise.all(fetchPromises);
            const allQuestions = questionArrays.flat();
            currentQuizQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
        } catch (error) {
            console.error("Error loading random questions:", error);
            questionElement.innerText = "Failed to load questions. Please check files and console.";
            return;
        }
    } else {
        // === MODIFIED: Logic for specific sections ===
        // 1. Get the selected quiz mode
        const selectedMode = document.querySelector('input[name="quiz-mode"]:checked').value;

        try {
            const response = await fetch(selectedTopic);
            const questions = await response.json();
            
            // 2. Shuffle all questions from that section first
            const allSectionQuestions = questions.sort(() => 0.5 - Math.random());

            // 3. Assign questions based on the selected mode
            if (selectedMode === 'random-20') {
                // Slice to get a max of 20. If less than 20, it will just take all of them.
                currentQuizQuestions = allSectionQuestions.slice(0, 20);
            } else {
                // Use all questions
                currentQuizQuestions = allSectionQuestions;
            }

        } catch (error) {
            console.error(`Error loading ${selectedTopic}:`, error);
            questionElement.innerText = "Failed to load questions. Please check the selected file.";
            return;
        }
    }
    startQuiz();
});

function startQuiz() {
    currentQuestionIndex = 0;
    wrongAnswers = [];
    resultsContainer.classList.add('hide');
    resultsBtn.classList.add('hide');
    answerButtonsElement.classList.remove('hide');
    questionCounterElement.classList.remove('hide'); // Show counter

    if (currentQuizQuestions.length > 0) {
        showQuestion(currentQuizQuestions[currentQuestionIndex]);
    } else {
        questionElement.innerText = "No questions found for this topic.";
        questionCounterElement.classList.add('hide'); // Hide counter if no questions
    }
}

function showQuestion(question) {
    // Update counter text
    questionCounterElement.innerText = `Question ${currentQuestionIndex + 1} of ${currentQuizQuestions.length}`;

    questionElement.innerText = question.question;
    answerButtonsElement.innerHTML = '';

    const answersArray = question.answers || question.answerOptions;
    // Removed answer shuffling here based on user request

    answersArray.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');

        const isCorrect = answer.correct || answer.isCorrect;

        if (isCorrect) {
            button.dataset.correct = true;
        }
        button.addEventListener('click', () => selectAnswer(answer, button));
        answerButtonsElement.appendChild(button);
    });
}

function selectAnswer(answer, button) {
    const isCorrect = answer.correct || answer.isCorrect;

    Array.from(answerButtonsElement.children).forEach(btn => {
        btn.disabled = true;
    });

    if (isCorrect) {
        button.classList.add('correct');
    } else {
        button.classList.add('wrong');
        wrongAnswers.push({
            question: currentQuizQuestions[currentQuestionIndex].question,
            yourAnswer: answer.text
        });
        Array.from(answerButtonsElement.children).forEach(btn => {
            if (btn.dataset.correct) {
                btn.classList.add('correct');
            }
        });
    }

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuizQuestions.length) {
            showQuestion(currentQuizQuestions[currentQuestionIndex]);
        } else {
            questionElement.innerText = "Quiz Finished!";
            answerButtonsElement.classList.add('hide');
            questionCounterElement.classList.add('hide'); // Hide counter when quiz finishes
            resultsBtn.classList.remove('hide');
        }
    }, 2000);
}

resultsBtn.addEventListener('click', () => {
    resultsContainer.classList.remove('hide');
    wrongAnswersList.innerHTML = '';
    if (wrongAnswers.length === 0) {
        wrongAnswersList.innerHTML = '<li>Congratulations! You got everything right!</li>';
    } else {
        wrongAnswers.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>Q:</strong> ${item.question} <br> <strong>Your Answer:</strong> ${item.yourAnswer}`;
            wrongAnswersList.appendChild(li);
        });
    }
});

// === MODIFIED: Hide the quiz mode container when going back ===
backToMenuBtn.addEventListener('click', () => {
    quizContainer.classList.add('hide');
    questionCounterElement.classList.add('hide'); // Hide counter when going back to menu
    selectionContainer.classList.remove('hide');
    
    // Reset the quiz mode to be hidden
    quizModeContainer.classList.add('hide');
    // Also reset the dropdown to the 'random' default so the mode container is correctly hidden
    topicSelect.value = 'random'; 
});