// --- All UI Elements ---
const selectionContainer = document.getElementById('selection-container');
const topicSelect = document.getElementById('topic-select');
const startBtn = document.getElementById('start-btn');

const modeSelectionContainer = document.getElementById('mode-selection-container');
const modeSelectionTopic = document.getElementById('mode-selection-topic');
const modeBtnAll = document.getElementById('mode-btn-all');
const modeBtnRandom20 = document.getElementById('mode-btn-random-20');
const modeBackBtn = document.getElementById('mode-back-btn');

const quizContainer = document.getElementById('quiz-container');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answers');
const resultsBtn = document.getElementById('results-btn');
const resultsContainer = document.getElementById('results-container');
const wrongAnswersList = document.getElementById('wrong-answers-list');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const questionCounterElement = document.getElementById('question-counter');

// --- List of all your JSON files for the 'random' option ---
const allQuestionFiles = [
    'questions_1.json', 'questions_2.json', 'questions_3.json', 'questions_4.json',
    'questions_5.json', 'questions_6.json', 'questions_7.json', 'questions_8.json',
    'questions_9.json', 'questions_10.json', 'questions_11.json', 'questions_12.json'
];

let currentQuizQuestions = [];
let currentQuestionIndex = 0;
let wrongAnswers = [];
let selectedTopicFile = ''; // Store the selected topic file name
let selectedTopicName = ''; // Store the selected topic display name

// --- Event Listener to go from Topic Selection to Mode Selection ---
startBtn.addEventListener('click', async () => {
    selectedTopicFile = topicSelect.value;
    selectedTopicName = topicSelect.options[topicSelect.selectedIndex].text;

    // --- Special case: 'Random Mix' ---
    // If 'Random Mix' is selected, bypass mode selection and start quiz immediately.
    if (selectedTopicFile === 'random') {
        selectionContainer.classList.add('hide');
        quizContainer.classList.remove('hide');
        
        try {
            const fetchPromises = allQuestionFiles.map(file => fetch(file).then(res => res.json()));
            const questionArrays = await Promise.all(fetchPromises);
            const allQuestions = questionArrays.flat();
            currentQuizQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
            startQuiz(); // Start the quiz
        } catch (error) {
            console.error("Error loading random questions:", error);
            questionElement.innerText = "Failed to load questions. Please check files and console.";
            return;
        }
    } else {
        // --- Regular case: Show Mode Selection Screen ---
        modeSelectionTopic.innerText = selectedTopicName; // Show which topic was selected
        selectionContainer.classList.add('hide');
        modeSelectionContainer.classList.remove('hide');
    }
});

// --- Event Listener for Mode Back Button ---
modeBackBtn.addEventListener('click', () => {
    modeSelectionContainer.classList.add('hide');
    selectionContainer.classList.remove('hide');
});

// --- Event Listeners for Mode Selection Buttons (to start quiz) ---
modeBtnAll.addEventListener('click', () => {
    loadQuestionsAndStartQuiz('all');
});

modeBtnRandom20.addEventListener('click', () => {
    loadQuestionsAndStartQuiz('random-20');
});

// --- New function to load questions based on mode ---
async function loadQuestionsAndStartQuiz(mode) {
    modeSelectionContainer.classList.add('hide');
    quizContainer.classList.remove('hide');

    try {
        const response = await fetch(selectedTopicFile);
        const questions = await response.json();
        
        // Shuffle all questions from that section first
        const allSectionQuestions = questions.sort(() => 0.5 - Math.random());

        // Assign questions based on the selected mode
        if (mode === 'random-20') {
            // Slice to get a max of 20. If less than 20, it will just take all of them.
            currentQuizQuestions = allSectionQuestions.slice(0, 20);
        } else {
            // Use all questions
            currentQuizQuestions = allSectionQuestions;
        }
        
        startQuiz(); // Start the actual quiz

    } catch (error) {
        console.error(`Error loading ${selectedTopicFile}:`, error);
        questionElement.innerText = "Failed to load questions. Please check the selected file.";
    }
}

// --- CORE QUIZ FUNCTIONS (Mostly Unchanged) ---

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

// --- Back to Main Menu from Results ---
backToMenuBtn.addEventListener('click', () => {
    quizContainer.classList.add('hide');
    questionCounterElement.classList.add('hide'); 
    selectionContainer.classList.remove('hide');
    // We don't need to hide modeSelectionContainer, it's already hidden by default
});
