import { GAME_STATUS, PAIRS_COUNT } from './constants.js'
import { getColorElementList, getColorListElement, getInActiveColorList, getPlayAgainButton } from './selectors.js'
import { getRandomColorPairs, showPlayAgainButton,hidePlayAgainButton, setTimerText } from './utils.js'

// Global variables
let selections = []
let gameStatus = GAME_STATUS.PLAYING

// TODOs
// 1. Generating colors using https://github.com/davidmerfield/randomColor
// 2. Attach item click for all li elements
// 3. Check win logic
// 4. Add timer
// 5. Handle replay click

function handleColorClick(liElement) {
    const shouldBlockClick = [GAME_STATUS.BLOCKING, GAME_STATUS.FINISHED].includes(gameStatus);
    const isClicked = liElement.classList.contains('active');
  if (!liElement || shouldBlockClick || isClicked) return

  liElement.classList.add('active');

  // save clicked cell to selection
  selections.push(liElement);
  if (selections.length < 2) return;

  // check match
  const firstColor = selections[0].dataset.color;
  const secondColor = selections[1].dataset.color;
  const isMatch = firstColor === secondColor;

  if (isMatch) {
    // check win
    const isWin = getInActiveColorList().length === 0;
    if (isWin) {
        // show replay button
        showPlayAgainButton();
        // show u win
        setTimerText('YOU WIN!');

        gameStatus = GAME_STATUS.FINISHED;
    }

    selections = [];
    return;
  }

  // in case not match
  // remove active class
  gameStatus = GAME_STATUS.BLOCKING;

  setTimeout(() => {
    selections[0].classList.remove('active')
    selections[1].classList.remove('active')

    // reset new turn
    selections = []

    // race-condition check with handleTimerFinish
    if (gameStatus !== GAME_STATUS.FINISHED) {
      gameStatus = GAME_STATUS.PLAYING
    }
  }, 500);


  
}

function initColors() {
    // random 8 pairs of colors
    const colorList = getRandomColorPairs(PAIRS_COUNT);

    // bind to li > div.overlay
    const liList = getColorElementList();
    liList.forEach((liElement, index) => {
        liElement.dataset.color = colorList[index];

        const overlayElement = liElement.querySelector('.overlay');
        if (overlayElement) 
            overlayElement.style.backgroundColor = colorList[index];
    })
}

function attachEventForColorList() {
    const ulElement = getColorListElement();
    if(!ulElement) return;

    // event delegation
    ulElement.addEventListener('click', (event) => {
        // console.log("hihi");
        if (event.target.tagName !== 'LI') return;
        handleColorClick(event.target);
    })
}


function resetGame() {
    // reset global variables
    selections = [];
    gameStatus = GAME_STATUS.PLAYING;
    
    // reset dom elements
    // - remove active class from li
    const colorList = getColorElementList();
    for (const colorElement of colorList) {
        colorElement.classList.remove('active');
    }
    // - hide replay button
    hidePlayAgainButton();
    // - clear u win / timeout text
    setTimerText('');
    // re-generate color pairs
    initColors();
}

function attachEventForPlayAgainButton() {
    const playAgainButton = getPlayAgainButton();
    if (!playAgainButton)   return;

    playAgainButton.addEventListener('click', resetGame);
}

// main
(() => {
    initColors();

    attachEventForColorList();

    attachEventForPlayAgainButton();
})()
