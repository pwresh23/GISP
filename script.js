// --- ADD YOUR QUESTIONS HERE ---
const questions = [
    {
        question: "What is the capital of France?",
        answers: [
            { text: "Berlin", correct: false },
            { text: "Madrid", correct: false },
            { text: "Paris", correct: true },
            { text: "Rome", correct: false }
        ]
    },
    {
        question: "What is 2 + 2?",
        answers: [
            { text: "4", correct: true },
            { text: "3", correct: false },
            { text: "5", correct: false },
            { text: "6", correct: false }
        ]
    },
    {
        question: "Which planet is known as the Red Planet?",
        answers: [
            { text: "Earth", correct: false },
            { text: "Mars", correct: true },
            { text: "Jupiter", correct: false },
            { text: "Venus", correct: false }
        ]
    }
];
// -----------------------------

const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answers');
const resultsBtn = document.getElementById('results-btn');
const resultsContainer = document.getElementById('results-container');
const wrongAnswersList = document.getElementById('wrong-answers-list');

let currentQuestionIndex = 0;
let wrongAnswers = [];

function startQuiz() {
    currentQuestionIndex = 0;
    wrongAnswers = [];
    resultsContainer.classList.add('hide');
    resultsBtn.classList.add('hide');
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
        // Store the question and the selected wrong answer
        wrongAnswers.push({ 
            question: questions[currentQuestionIndex].question, 
            yourAnswer: answer.text 
        });
    } else {
        button.classList.add('correct');
    }

    // Disable all buttons after an answer is chosen
    Array.from(answerButtonsElement.children).forEach(btn => {
        btn.disabled = true;
    });

    // Wait a moment, then go to the next question
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion(questions[currentQuestionIndex]);
        } else {
            // End of quiz
            questionElement.innerText = "Quiz Finished!";
            answerButtonsElement.innerHTML = '';
            resultsBtn.classList.remove('hide');
        }
    }, 1000); // 1 second delay
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

startQuiz();
