const questionsWithAnswers = [
  {
    question: "My favorite color is ...",
    answers: ["Dark Gray", "Black"],
  },
  {
    question: "Which number do you like more?",
    answers: ["e", "π"],
  },
  {
    question: "The capital of the country of Tuvalu is ...",
    answers: ["Funafuti", "Vaiaku"],
  },
  {
    question: "Select your preferred programming language:",
    answers: ["Brainfuck", "Whitespace"],
  },
  {
    question: "What time of the year do you enjoy the most?",
    answers: ["Christmas", "Crunchtime"],
  },
  {
    question: "It's a rainy day and I feel",
    answers: ["enthusiastic", "enlightened"],
  },
  {
    question: "I had ... for breakfast.",
    answers: ["Black coffee", "Nothing"],
  },
  {
    question: "I like to eat fried ...",
    answers: ["eggs", "bananas"],
  },
  {
    question:
      'The "Sicher, oder?" exhibition will contain an exhibit about ...',
    answers: ["Map Awareness", "Awareness Maps"],
  },
  {
    question: "I enjoyed this somewhat ridiculous demo.",
    answers: ["Yes", "No"],
  },
  {
    question: "Game over. Play another round?",
    answers: ["Yes, sure!", "Of course!"],
  },
];

const questionElem = document.querySelector("#question");
const answersElem = document.querySelector("#answers");
const progressIndicatorElem = document.querySelector("#progress-indicator");

function setupQuestionWithAnswers(questionWithAnswers) {
  questionElem.innerHTML = questionWithAnswers.question;

  while (answersElem.firstChild)
    answersElem.removeChild(answersElem.firstChild);

  questionWithAnswers.answers.forEach((answer) => {
    const answerElem = document.createElement("span");
    answerElem.innerHTML = answer;
    answersElem.appendChild(answerElem);
  });
}

let currentQuestionIndex = -1;
function nextQuestion() {
  currentQuestionIndex += 1;
  setupQuestionWithAnswers(
    questionsWithAnswers[currentQuestionIndex % questionsWithAnswers.length],
  );
  resetPosition();
  restartTimeout();
}

document.body.addEventListener("click", async () => {
  if (!document.pointerLockElement) {
    console.log("Attempting to lock pointer");
    await document.body.requestPointerLock({
      unadjustedMovement: true,
    });
    document.body.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
  } else {
    console.log("Pointer already locked to: ", document.pointerLockElement);
  }
});

function lockChangeAlert() {
  if (document.pointerLockElement === document.body) {
    console.log("The pointer lock status is now locked");
    document.addEventListener("mousemove", updatePosition);
    document.addEventListener("click", nextQuestion);
    document.addEventListener("keypress", nextQuestion);
    nextQuestion();
  } else {
    console.log("The pointer lock status is now unlocked");
    document.removeEventListener("mousemove", updatePosition);
    document.removeEventListener("click", nextQuestion);
    document.removeEventListener("keypress", nextQuestion);
  }
}

let x = 0;
let maxOffset = 800;
function updatePosition(e) {
  x = Math.max(-maxOffset, Math.min(x + e.movementX, maxOffset));
  answersElem.style.transform = `translateX(${x}px)`;
  requestAnimationFrame(shadeAnswers);
  restartTimeout();
}

function shadeAnswers() {
  const bodyBounds = document.body.getBoundingClientRect();
  const bodyHCenter =
    bodyBounds.left + (bodyBounds.right - bodyBounds.left) / 2;

  // Iterate over all the answers and check if they are within the bounds of the body
  answersElem.querySelectorAll("span").forEach((answerElem) => {
    const answerBounds = answerElem.getBoundingClientRect();
    const answerHCenter =
      answerBounds.left + (answerBounds.right - answerBounds.left) / 2;
    const answerScore =
      1 - Math.abs(bodyHCenter - answerHCenter) / (bodyBounds.width / 2);
    const falloffScale = 3;
    const minOpacity = 0.2;
    const answerOpacity = Math.max(
      minOpacity,
      1 - (1 - answerScore) * falloffScale,
    );
    answerElem.style.opacity = `${answerOpacity}`;
  });
}

function resetPosition() {
  x = 0;
  answersElem.style.transform = `translateX(${x}px)`;
  requestAnimationFrame(shadeAnswers);
}

let timeoutId = undefined;
progressIndicatorElem.addEventListener("animationend", nextQuestion);
function restartTimeout() {
  clearTimeout(timeoutId);
  progressIndicatorElem.classList.remove("animate-progress");
  requestAnimationFrame(() =>
    progressIndicatorElem.classList.add("animate-progress"),
  );
}

const urlSearchParams = new URLSearchParams(window.location.search);
if (urlSearchParams.has("timeout"))
  document
    .querySelector(":root")
    .style.setProperty("--question-timeout", urlSearchParams.get("timeout"));
if (urlSearchParams.has("timeout-delay"))
  document
    .querySelector(":root")
    .style.setProperty(
      "--question-timeout-delay",
      urlSearchParams.get("timeout-delay"),
    );

document.addEventListener("pointerlockchange", lockChangeAlert);
