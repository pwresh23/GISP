const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answers');
const resultsBtn = document.getElementById('results-btn');
const resultsContainer = document.getElementById('results-container');
const wrongAnswersList = document.getElementById('wrong-answers-list');

let questions = []; // This will be filled from our JSON file
let currentQuestionIndex = 0;
let wrongAnswers = [];

// This function fetches the questions and then starts the quiz
async function initializeQuiz() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        questions = await response.json();
        startQuiz();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        questionElement.innerText = "Failed to load questions. Please check the console for errors.";
    }
}

function startQuiz() {
    // Optional: Shuffle questions each time
    questions.sort(() => Math.random() - 0.5); 
    
    currentQuestionIndex = 0;
    wrongAnswers = [];
    resultsContainer.classList.add('hide');
    resultsBtn.classList.add('hide');
    answerButtonsElement.classList.remove('hide');
    showQuestion(questions[currentQuestionIndex]);
}

function showQuestion(question) {
    questionElement.innerText = question.question;
    answerButtonsElement.innerHTML = ''; // Clear old answers
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');
        button.addEventListener('click', () => selectAnswer(answer, button));
        answerButtonsElement.appendChild(button);
    });
}

function selectAnswer(answer, button) {
    const correct = answer.correct;
    if (!correct) {
        button.classList.add('wrong');
        wrongAnswers.push({ 
            question: questions[currentQuestionIndex].question, 
            yourAnswer: answer.text 
        });
    } else {
        button.classList.add('correct');
    }

    Array.from(answerButtonsElement.children).forEach(btn => {
        btn.disabled = true;
    });

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion(questions[currentQuestionIndex]);
        } else {
            questionElement.innerText = "Quiz Finished!";
            answerButtonsElement.classList.add('hide');
            resultsBtn.classList.remove('hide');
        }
    }, 1000);
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

// Start the process
initializeQuiz();
