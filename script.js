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

// --- List of all your JSON files for the 'random' option ---
const allQuestionFiles = [
    'questions_1.json', 'questions_2.json', 'questions_3.json', 'questions_4.json',
    'questions_5.json', 'questions_6.json', 'questions_7.json', 'questions_8.json',
    'questions_9.json', 'questions_10.json', 'questions_11.json', 'questions_12.json'
];

let currentQuizQuestions = [];
let currentQuestionIndex = 0;
let wrongAnswers = [];

// --- Event Listener to start the quiz ---
startBtn.addEventListener('click', async () => {
    const selectedTopic = topicSelect.value;
    
    // Show the quiz and hide the selection menu
    selectionContainer.classList.add('hide');
    quizContainer.classList.remove('hide');

    if (selectedTopic === 'random') {
        // --- Logic for RANDOM quiz ---
        try {
            const fetchPromises = allQuestionFiles.map(file => fetch(file).then(res => res.json()));
            const questionArrays = await Promise.all(fetchPromises);
            const allQuestions = questionArrays.flat();
            
            // Shuffle and pick 10 random questions
            currentQuizQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
        } catch (error) {
            console.error("Error loading random questions:", error);
            questionElement.innerText = "Failed to load questions. Please check files and console.";
            return;
        }
    } else {
        // --- Logic for a SPECIFIC section quiz ---
        try {
            const response = await fetch(selectedTopic);
            const questions = await response.json();
            // Shuffle all questions from that section
            currentQuizQuestions = questions.sort(() => 0.5 - Math.random());
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
    
    if (currentQuizQuestions.length > 0) {
        showQuestion(currentQuizQuestions[currentQuestionIndex]);
    } else {
        questionElement.innerText = "No questions found for this topic.";
    }
}

function showQuestion(question) {
    questionElement.innerText = question.question;
    answerButtonsElement.innerHTML = '';

    // --- UPDATED LOGIC TO HANDLE BOTH JSON FORMATS ---
    const answersArray = question.answers || question.answerOptions; // Use 'answers' OR 'answerOptions'

    answersArray.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');

        // Check for 'correct' OR 'isCorrect'
        const isCorrect = answer.correct || answer.isCorrect; 

        if (isCorrect) {
            button.dataset.correct = true;
        }
        button.addEventListener('click', () => selectAnswer(answer, button));
        answerButtonsElement.appendChild(button);
    });
}

function selectAnswer(answer, button) {
    // --- UPDATED LOGIC TO HANDLE BOTH JSON FORMATS ---
    const isCorrect = answer.correct || answer.isCorrect; // Check for 'correct' OR 'isCorrect'

    // Disable all buttons after an answer is chosen
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
        // Highlight the correct answer
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
