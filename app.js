/*
Step 1: Fetch a random word of length 5 using https://random-word-api.herokuapp.com/home
*/
const url = 'https://random-word-api.herokuapp.com/word?length=5';  //URL for API request to get random word of length 5.

//Initialize a global variable word
var word = ""

const getWordApiAsync = async (url) => {    //Api request function to get random word of length 5
    const response = await axios(url);      //async GET request using the axios library (the following script is imported in the html page header: <script src="https://unpkg.com/axios/dist/axios.min.js"></script>)
    //The lines below execute only after the request is finished.
    word = response.data[0];    //Returns ["word"], assign the string in response.data to word 
    console.log(word);      //Verify if it works
}

getWordApiAsync(url); //Fetch random word of length 5.

/*
Step 2 (Can be done in html): Assign values to the keyboard keys. 
*/
//Get all divs where class='keyboardButtons' from the DOM.
var keyboardButtons = document.querySelectorAll('.keyboard-button')
//List of keyboardButtons values
const keys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "ENTER", "z", "x", "c", "v", "b", "n", "m", "DELETE"];

//Assign values to keyboardButtons
for (let i = 0; i < keyboardButtons.length; i++) {
    keyboardButtons[i].innerText = keys[i].toUpperCase()
}

/*
Step 3: Create event listener for letter buttons (excluding the Enter button and Delete button).
*/
var currentTry = 1;     //Keeps track of the number of attempts (row)
var currentEntry = 1;   //Keeps track of the number of letters in current row (column)

//Get all blocks displaying the user's attempts. Operations are performed on these blocks.
var tryBlocksArray = document.querySelectorAll('.letter-block');


//Iterate over the array of keyboard buttons to create event listeners
for (let i = 0; i < keyboardButtons.length; i++) {
    //Assign click event listener to all buttons except Enter button (index 19) and Delete button (index 27).
    if (keyboardButtons[i].innerText == "ENTER") {

    } else if (keyboardButtons[i].innerText == "DELETE") {

    } else {
        console.log('clicked button')
        keyboardButtons[i].addEventListener('click', function () {
            if (currentEntry == 6) {
                console.log("can't do that!")
            } else {     //Checks if at the end of the word (max 5 letters) or at last attempt.
                tryBlocksArray[(currentTry - 1) * 5 + currentEntry - 1].innerText = keyboardButtons[i].textContent;
                currentEntry++;
            }
        })
    }
}


/*
Step 4: The Delete button event listener.
*/
//Fetch delete button from DOM.
const deleteBtn = document.getElementById('delete-button');

//Create event listener for delete button.
deleteBtn.addEventListener('click', function () {
    if (((currentTry - 1) * 5 + currentEntry - 1) != 0 && currentEntry != 1) {
        currentEntry--;
    } else {
        displayOverlay("No more letters!")
    }
    tryBlocksArray[(currentTry - 1) * 5 + currentEntry - 1].innerText = "";
})

/*
Step 5: The Enter button event listener.
*/
//Get enter button from DOM.
const enterBtn = document.getElementById('enter-button');

//Optional: add overlay div to notify user the word is missing letters. Get the two divs from DOM.
const overlayContainer = document.getElementById('overlay-container');
const overlayPopover = document.getElementById('overlay-popover');
//Create function to make overlay appear
function displayOverlay(msg) {
    overlayContainer.style.display = "flex";
    overlayPopover.style.display = "flex";
    overlayPopover.innerText = msg;
    setTimeout(() => {
        overlayPopover.style.display = "none";
        overlayContainer.style.display = "none";
    }, 1000);
}


//Create event listener for the enter button.
enterBtn.addEventListener('click', function () {
    //Enter button should do nothing if not all 5 letters are entered.
    if (currentEntry == 6) {
        verifyWordApiAsync();
    } else {
        displayOverlay("Missing letters!!");
    }
})

/*
Step 6: Define the enter button function called in the event listener. This function verifies whether the user attempt is a word by sending an api request to a dictionary api.
*/

//URL for API request to verify if word exists.
const verifyUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const verifyWordApiAsync = async () => {
    index = ((currentTry - 1) * 5 + currentEntry - 1) - 5;
    let verifyWord;

    //Get the text content of the 5 blocks in the current row. Go from separated letters to an array ["e","a","t"] and then join it "eat"
    let letters = [];
    for (let i = 0; i < 5; i++) {
        letters.push(tryBlocksArray[index + i].textContent);
        verifyWord = letters.join('').toLowerCase();
    }

    //Append the word to the url.
    let url = verifyUrl + verifyWord;

    //Create an api request to the dictionary api, if the word exists, it will return an object and the status code 200 or 304 and 404 as an error if the word does not exist.
    const response = await axios(url).catch((error) => {
        //What happens when it is not a word.
        const tryContainers = document.querySelectorAll('.try-container');
        tryContainers[currentTry - 1].classList.add("shake");
        tryContainers[currentTry - 1].addEventListener("animationend", function () {
            tryContainers[currentTry - 1].classList.remove("shake");
        })
    });
    //If the request was successful, call the showTryResult() function.
    if (response.status == 200 || response.status == 304) {
        showTryResults();
        //Go to next row, reset currentEntry index to enter first letter.
        currentEntry = 1;
        currentTry++;
    }
}

/*
Step 7: Define the showTryResults() when it is confirmed that the attempt is a word. This function checks for index matches, if not, for checks for includes().
*/

//Optional: overlay when user wins!
const overlayPopoverResult = document.getElementById('overlay-popover-result');
const resultText = document.getElementsByClassName('result-text');

function winOverlay() {
    overlayContainer.style.display = "flex";
    overlayPopoverResult.style.display = "flex";
    for (let i = 0; i < resultText.length; i++) {
        resultText[i].style.display = "flex";
    }
    resultText[0].innerText = "WIN!"
    resultText[1].innerText = `Attempts: ${currentTry}`
}

function showTryResults() {
    correctLetters = 0;
    index = ((currentTry - 1) * 5 + currentEntry - 1) - 5;
    for (let i = 0; i < 5; i++) {
        let isMatch = false;
        let hasLetter = false;
        if (tryBlocksArray[index + i].textContent == word[i].toUpperCase()) {
            tryBlocksArray[index + i].style.background = "green";
            isMatch = true;
            correctLetters++;
        } else {
            for (let j = 0; j < word.length; j++) {
                if (word[j].toUpperCase() == tryBlocksArray[index + i].textContent) {
                    hasLetter = true;
                    console.log("is there!");
                    tryBlocksArray[index + i].style.background = "#b59f3b";
                    tryBlocksArray[index + i].style.color = "#d3d3d3";
                }
            }
        }
        for (let k = 0; k < keyboardButtons.length; k++) {
            if (keyboardButtons[k].innerText == tryBlocksArray[index + i].textContent) {
                if (isMatch) {
                    keyboardButtons[k].style.background = "green";
                    keyboardButtons[k].style.color = "white";
                } else if (hasLetter) {
                    keyboardButtons[k].style.background = "#b59f3b";
                    keyboardButtons[k].style.color = "#d3d3d3"
                } else {
                    keyboardButtons[k].style.background = "#3a3a3c";
                    keyboardButtons[k].style.color = "white";
                }
            }
        }
        if (correctLetters == 5) {
            winOverlay();
        }
    }
}