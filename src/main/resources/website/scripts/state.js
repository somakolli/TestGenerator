/**
 * loads question or evaluation on question document load
 */
$(document).ready(function () {
    loadQuestionOrEvaluation();
});

/**
 * decides whether the evaluation or the next question should be loaded
 */
function loadQuestionOrEvaluation(){
    let currentQuestionNumber = stateToAnswerList().length;
    if(currentQuestionNumber === getQcount()){
        loadEvaluation(stateToBinaryString());
    } else {
        loadQuestion(currentQuestionNumber);
    }
}

/**
 * Pushes the current answers into the answerList, updates the state and loads the next question or evaluation
 */
function updateState() {
    let stateObj = { state: "" };
    let questionList = stateToAnswerList();
    questionList.push(answerListToBitString(getAnswerList()));
    let questionListString = answerListToBinary(questionList);
    $("#timer").remove();
    history.pushState(stateObj, "new State", "?s=" +
        binaryStringToState(questionListString));
    loadQuestionOrEvaluation();
}

/**
 * Reads the state and converts it into a binaryString
 * @return {String} binaryString
 */
let stateToBinaryString = function () {
    let url = new URL(window.location.href);
    let stateString = url.searchParams.get("s");
    if (stateString === null) {
        return "";
    } else {
        return binaryStringFromBytes(bytesFromBase64String(stateString));
    }
};

/**
 * Returns a base64 representation of a given binaryString
 * @param {String} binaryString
 * @return {String} base64String
 */
let binaryStringToState = function (binaryString) {
    return base64StringFromBytes(bytesFromBinaryString(binaryString));
};

/**
 * Returns the list of html inputs which are an answer
 * @return {array} answerList [{ id: string, checked: boolean }]
 */
let getAnswerList = function () {
    let answersList = [];
    let answers = $("input[type=checkbox]");
    if(answers.length === 0)
        answers = $("input[type=radio]");
    answers.each(function () {
        answersList.push({ id: this.id, checked: this.checked });
    });
    return answersList;
};

/**
 * Returns a bitstring representing the chosen answers
 * @param {array} answerList [{ id: string, checked: boolean }]
 * @return {String} bitstring
 */
let answerListToBitString = function (answerList) {
    let bitString = "";
    for (const answer in answerList) {
        bitString += answerList[answer].checked ? "1" : "0";
    }

    return bitString;
};
/**
 * Reads the state and returns a answerArray
 * @return {Array} AnswersArray example ["1000", "101", "0011"]
 */
let stateToAnswerList = function () {
    let stateBinaryString = stateToBinaryString();
    //remove all zeroes in the beginning
    while(stateBinaryString.charAt(0) === "0"){
        stateBinaryString = stateBinaryString.slice(1);
    }
    stateBinaryString = stateBinaryString.slice(1);
    let i = 0;
    let answerList = [];
    let questionCount = 0;
    while (i < stateBinaryString.length) {
        let bitStringLength = parseInt(stateBinaryString.substring(i, i + 5), 2);
        //console.log("bitString: " + bitStringLength)
        i += 5;
        let answersSubstring = stateBinaryString.substring(i, i + bitStringLength);
        i += bitStringLength;
        answerList.push(answersSubstring);
        questionCount++;
    }
    return answerList;
};

/**
 * Returns a bitstring represantion of a answerList
 * @param {Array} answerList array containing all the answers in binary form
 *                for example ['1000', '101'] means that the first question hat for possible answers and the first one
 *                has been set as true the second question had three possible answers and the first and the third one
 *                have been set as true
 * @return {String} binaryString representing the array with an appending 1
 *                  before every answer string come 5 bits which represent the length of the answer string
 *                  for the above example it would be 100100100000011101
 */
function answerListToBinary(answerList) {
    let stateString = "";
    for (let i = 0; i < answerList.length; i++) {
        let bitString = answerList[i];
        //let bitStringLength = bitString.length.toString(2).split("").reverse().join("");
        let bitStringLength = bitString.length.toString(2);
        //making length string larger if it is smaller than 5 bit
        let bitStringPrefix = "";
        for (let i = bitStringLength.length; i < 5; i++) {
            bitStringPrefix += "0";
        }
        //stateString += bitStringLength + bitStringPrefix + bitString;
        stateString += bitStringPrefix + bitStringLength + bitString;
    }
    return "1" + stateString;
}
