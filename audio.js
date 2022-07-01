import {isActive} from "./script.js";

const audioPlayer = document.querySelector('audio')
const volumeIcon = document.querySelector('.fa-solid');
let isMuted;


//volume icon toggle function
function toggleVolumeIcon () {
    volumeIcon.classList.toggle('fa-volume-xmark'); //change the icon
    volumeIcon.classList.toggle('fa-volume-high');
};

//get localStorage (if present)
if (localStorage.hasOwnProperty("muted")) { //check if localStorage exists
        isMuted = JSON.parse(localStorage.getItem('muted')); //convert localStorage boolean
    } else isMuted = true;

if (!isMuted) toggleVolumeIcon();
audioPlayer.muted = isMuted;

export function playAudio(audioTipe1, audioTipe2) {
    audioPlayer.loop = false; //by default

    audioPlayer.src = `assets/audio/${audioTipe1}.m4a`
    audioPlayer.play();


    if (audioTipe2 !== undefined) { //if there is a second audio passed to the function
     //declare before calling in
        function secondAudio () {
            audioPlayer.loop = true; //since the audio is short, loop it once it's finished.
            audioPlayer.src = `assets/audio/${audioTipe2}.m4a`
            audioPlayer.play();
            audioPlayer.removeEventListener('ended', secondAudio); //necessary to remove the event listener
    };
    //CREATE event listener to play second audio ONLY AFTER the first is ended
        audioPlayer.addEventListener('ended', secondAudio);
}};


export function pauseAudio() {
    audioPlayer.pause();
};


//event handler on the volume icon
volumeIcon.addEventListener('click', function(){
    isMuted = !isMuted; //update the ready boolean, TRUE/MUTED by default
    if (isMuted) { pauseAudio();
        } else if(isActive) audioPlayer.play(); //play audio only if timer is counting
    audioPlayer.muted = isMuted;
    toggleVolumeIcon();
    localStorage.setItem('muted', JSON.stringify(isMuted)); //set to local storage
});