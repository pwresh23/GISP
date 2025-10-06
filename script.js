const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answers');
const resultsBtn = document.getElementById('results-btn');
const resultsContainer = document.getElementById('results-container');
const wrongAnswersList = document.getElementById('wrong-answers-list');

// List all of your JSON files here
const questionFiles = [
    'questions_1.json',
    'questions_2.json',
    'questions_3.json',
    'questions_4.json',
    'questions_5.json',
    'questions_6.json',
    'questions_7.json',
    'questions_8.json',
    'questions_9.json',
    'questions_10.json'
];

let allQuestions = []; // This will hold questions from all files
let currentQuizQuestions = []; // The 10 questions for the current quiz
let currentQuestionIndex = 0;
let wrongAnswers = [];

// This function fetches ALL question files, combines them, and starts the quiz
async function initializeQuiz() {
    try {
        // Create a list of fetch promises for each file
        const fetchPromises = questionFiles.map(file => fetch(file).then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${file}`);
            }
            return response.json();
        }));

        // Wait for all files to be fetched and parsed
        const questionArrays = await Promise.all(fetchPromises);

        // Combine the arrays of questions into one large pool
        allQuestions = questionArrays.flat();
        
        startQuiz();

    } catch (error) {
        console.error('Error loading question files:', error);
        questionElement.innerText = "Failed to load questions. Make sure all JSON files exist and are named correctly.";
    }
}

function startQuiz() {
    // 1. Shuffle the entire pool of questions
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());

    // 2. Select the first 10 questions for this session
    currentQuizQuestions = shuffled.slice(0, 10);

    // 3. Reset the quiz state
    currentQuestionIndex = 0;
    wrongAnswers = [];
    resultsContainer.classList.add('hide');
    resultsBtn.classList.add('hide');
    answerButtonsElement.classList.remove('hide');
    
    // Check if we have any questions to show
    if(currentQuizQuestions.length > 0) {
        showQuestion(currentQuizQuestions[currentQuestionIndex]);
    } else {
        questionElement.innerText = "No questions were found. Check your JSON files.";
    }
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
            question: currentQuizQuestions[currentQuestionIndex].question, 
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
        if (currentQuestionIndex < currentQuizQuestions.length) {
            showQuestion(currentQuizQuestions[currentQuestionIndex]);
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

// Start the entire process
initializeQuiz();
