import * as audioScript from './audio.js'

const inputContainer = document.querySelector('.input-container');
const repNumbField = document.querySelector('.form-input--repetition');
const repTimeField = document.querySelector('.form-input--time');
const recoveryTimeField = document.querySelector('.form-input--recovery');

const infoContainer = document.querySelector('.info-container');
const displayRepeLeft = document.getElementById('repetition-left');
const displayTimer = document.getElementById('timer');

const btnContainer = document.querySelector('.btn-container');
const btnStart = document.getElementById('btn-start');



let totalRep = 1;
let time; 
let recovery;
let restoreRecovery; //to restore recovery time
export let isActive = false; //to check if timer is counting or not
let isRecovering = false; 

let timerIsActiveID; //necessary to cancel the timer
let recoveryIsActiveID; //necessary for the recovery timer


//clear all input fields at runtime, to avoid bugs (with firefox for example)
document.querySelectorAll('.form-input').forEach(el => el.value = '');

//functions to check inserted data/input check/check input
const isValidInput = function (...inputs) { //checking the two conditions in one function
    return (inputs.every(inp => Number.isFinite(inp)) && inputs.every(inp => inp > 0));
}; //Return either FALSE or TRUE

//function for shake animations
const shakeShakeShake = function (element) {
    element.classList.add('horizontal-shake'); //add shake animation
    setTimeout(() => { //remove it
        element.classList.remove('horizontal-shake')
    }, 350);
};

const startTimerHelper = function() { //function to check input data and control the timer status
    //in case recovery timer is active
       if (isRecovering) resetRecovery()
    //DATA VALIDATION
   if (!isValidInput(+repNumbField.value, +repTimeField.value)) {
       shakeShakeShake(inputContainer); //shake effect
    //add a RED BORDER to wrong input field
       if (!isValidInput(+repNumbField.value)) repNumbField.style.border = 'solid 2px #5c0000';
       if (!isValidInput(+repTimeField.value)) repTimeField.style.border = 'solid 2px #5c0000';
       return;
   };
    //recovery time is optional, so logic is a little bit different
    if (recoveryTimeField.value && !isValidInput(+recoveryTimeField.value)) {
        shakeShakeShake(inputContainer); //shake effect
        recoveryTimeField.style.border = 'solid 2px #5c0000';
        return;
    };
//TIMER STATUS VALIDATION
    if (totalRep > 0 && !isActive) startTimer();
    if (isActive) pauseTimer(); //if countdown is active, i want to pause it

    isActive = !isActive; //timer state paused or counting
};

const startTimer = function () {
    audioScript.playAudio('whistle', 'tiktok')
    btnStart.textContent = 'Pause';
    time = time + 1; //necessary to make it work
    timerFunc(); //call it once immediately to reduce delay
    timerIsActiveID = setInterval(timerFunc, 1000);
}

const pauseTimer = function() {
    audioScript.pauseAudio();
    clearInterval(timerIsActiveID); //stop the timer
    btnStart.textContent = 'Start'; //immediately change the text of the button
}

const resetTimer = function() {
    pauseTimer();
    if (isRecovering) resetRecovery(); // in case recovery countdown is running
    totalRep = +repNumbField.value; //restore the total repetitions
    if(Number.isFinite(totalRep)) displayRepeLeft.textContent = totalRep; //...and display them
    time = +repTimeField.value;
    if(Number.isFinite(time)) displayTimer.textContent = time; //display repetition duration
    isActive = false; 
    //enable start button
    btnStart.disabled = false;

};

const recoveryTimeFunc = function() { //function to handle recovery time (if present)
    recovery--; //reduce timer every second;
    recoveryTimeField.value = recovery; //display recovery countdown

    if (recovery < 1) { //WHEN RECOVERY IS OVER            
        resetRecovery();
        startTimerHelper();
    };
}
const resetRecovery = function() {
        clearInterval(recoveryIsActiveID); //stop recovery timer
        isRecovering = false;
        recoveryTimeField.value = recovery = restoreRecovery; //restore recovery time
        recoveryTimeField.classList.toggle('pulsing'); //the animation for recovery time field
};


const timerFunc = function() {
    time--; //reduce timer every second;
    displayTimer.textContent = time; //display repetition duration

    if (time === 0) { //WHEN COUNTDOWN IS OVER
        pauseTimer();
        audioScript.playAudio('ring', 'silencelong'); //play audio and silence
        time = +repTimeField.value; //restore the timer initial value
        totalRep--; //decrease the repetitions left
        displayRepeLeft.textContent = totalRep; //print the repetions left
        shakeShakeShake(infoContainer) //shake animation
        isActive = false; 
        
        if(recovery && totalRep > 0) { //if recovery time is set, launch the function
            recoveryIsActiveID = setInterval(recoveryTimeFunc, 1000);
            recoveryTimeField.classList.toggle('pulsing'); //the animation for recovery time field
            isRecovering = true;
        };
        
        //disable start button
        if (totalRep === 0) btnStart.disabled = true;
    }
};



//EVENTS HANDLERS --------------------------------------------------------------------------
btnContainer.addEventListener('click', function(e) {
    if (!e.target.id) return; //guard clause
    if (e.target.id === 'btn-start') startTimerHelper();
    if (e.target.id === 'btn-reset') resetTimer();
    e.target.blur(); //unfocus the buttons to avoid events overlapping
});

//change of value in the input fields (multiple event listener/listen event on multiple object)
document.querySelectorAll('.form-input').forEach(form => form.addEventListener('input', function(e) {
    this.style.border = 'none'; //remove the red border of the input field, in case is present
    if (e.target.classList.contains('form-input--recovery')) {
        recovery = restoreRecovery = recoveryTimeField.value;
        return
    }; //i don't want to reset timer when recovery time changes
    resetTimer();
}));

//ENTER key to start/pause
window.addEventListener('keypress', function(e) {
        if (e.key === "Enter") startTimerHelper();
});