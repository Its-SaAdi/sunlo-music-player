let albumArea = document.querySelector(".album-items");
let albumContainer = document.querySelector(".card-container");
let currentSong = new Audio(); // To update current song each time new song is played.
let currentSongIndex = 0; // Set track number to first song.
let backBtn = document.querySelector("#back-btn");
let playBtn = document.querySelector("#play-btn");
let nextBtn = document.querySelector("#next-btn");
let songInfo = document.querySelector(".songInfo");
let songTime = document.querySelector(".songTime");
let trackPosition = document.querySelector(".circle");
let trackBar = document.querySelector(".bar");
let hamBtn = document.querySelector(".ham-burger");
let leftCloseBtn = document.querySelector(".close-btn");
let leftSection = document.querySelector(".left");
let volumeBar = document.querySelector("#volume");
let volumeIcon = document.querySelector("#volume-icon");
let currFolder;
let songsList = [];
let vol = 0;

function convertSeconds(seconds) {
   if (isNaN(seconds) || seconds < 0) {
      return `00:00`;
   }
   
   let trackMinutes = Math.floor(seconds / 60);
   let remainingSeconds = Math.floor(seconds % 60);
   
   let formattedMinutes = trackMinutes < 10 ? "0" + trackMinutes : trackMinutes;
   let formattedSeconds =
   remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;
   
   return `${formattedMinutes}:${formattedSeconds}`;
}

function playMusic(trackName, isPlaying) {
   currentSong.src = `/Songs/${currFolder}/${trackName}`;
   
   if (isPlaying) {
      currentSong.play();
      playBtn.classList.add("fa-pause");
   }
   
   songInfo.textContent = trackName;
   songTime.textContent = "00:00 / 00:00";
}

currentSong.addEventListener("timeupdate", () => {
   songTime.textContent = `${convertSeconds(
      currentSong.currentTime
   )} / ${convertSeconds(currentSong.duration)}`;
   trackPosition.style.left = `${
      (currentSong.currentTime / currentSong.duration) * 100
   }%`;
});

currentSong.addEventListener("ended", () => {
   currentSongIndex = songsList.indexOf(currentSong.src.split("/").slice(-1)[0]);
   console.log(currentSong.src.split("/").slice(-1)[0], currentSongIndex);
   if (currentSongIndex + 1 < songsList.length) {
      playMusic(decodeURI(songsList[++currentSongIndex]), true);
   } else {
      alert("Album ended! " + (currentSongIndex + 1));
      currentSongIndex = 0;
      playMusic(decodeURI(songsList[currentSongIndex]), true);
   }
});

async function displayAlbums() {
   let response = await fetch(`/Songs/`);
   let data = await response.text();
   
   let div = document.createElement("div");
   div.innerHTML = data;
   
   let anchors = Array.from(div.getElementsByTagName("a"));
   for (let i = 0; i < anchors.length; i++) {
      let a = anchors[i];
      if (a.href.includes("/Songs/")) {
         let trackName = a.href.split("/").slice(-1)[0];
         let response = await fetch(`/Songs/${trackName}/details.json`);
         let trackInfo = await response.json();

         albumContainer.innerHTML += `<div data-folder="${trackName}" class="card">
                <button class="play-button">
                    <i class="fa-solid fa-play play-icon"></i>
                </button>
                <img src="/Songs/${trackName}/Cover.jpg" alt="Album-1" width="180" height="180">
                <h4>${trackInfo.title}</h4>
                <p>${trackInfo.description}</p>
                </div>`;
               }
   }

   Array.from(albumContainer.getElementsByClassName("card")).forEach((card) => {
      card.addEventListener("click", () => {
         albumArea.innerHTML = "";
         currentSongIndex = 0;
         displaySongs(card.dataset.folder);
      });
   });
}

async function getSongs(folder) {
   let response = await fetch(`/Songs/${folder}/`);
   let data = await response.text();
   currFolder = folder;
   
   let div = document.createElement("div");
   div.innerHTML = data;

   let anchors = div.getElementsByTagName("a");
   let songs = [];
   
   for (const anchor of anchors) {
      if (
         anchor.href.endsWith(".mp3") ||
         anchor.href.endsWith(".m4a") ||
         anchor.href.endsWith(".mpeg") ||
         anchor.href.endsWith(".mp4")
         ) {
         songs.push(anchor.href.split(`/Songs/${folder}/`)[1]);
      }
   }

   return songs;
}

async function displaySongs(folderName) {
   songsList = await getSongs(folderName);
   console.log(songsList);
   
   for (let song of songsList) {
      let list = document.createElement("li");
      list.classList.add("album-item");
      list.innerHTML = `<i class="fa-solid fa-music"></i>
      <article class="artist-info">
                <p>${song.replaceAll("%20", " ")}</p>
                <p>Unknown</p>
                </article>
                <article class="play-now">
                <p>Play Now</p>
                <i class="fa-solid fa-circle-play"></i>
                </article>`;

      list.addEventListener("click", (event) => {
         console.log(
            list.querySelector(".artist-info").firstElementChild.textContent
         );
         let songName =
         list.querySelector(".artist-info").firstElementChild.textContent;
         playMusic(songName, true);
      });

      albumArea.appendChild(list);
   }

   // Select first song to display on play-area.
   playMusic(songsList[0].replaceAll("%20", " "), true);
}

document.addEventListener('DOMContentLoaded', () => {
   displayAlbums();
})

volumeBar.addEventListener("change", () => {
   currentSong.volume = volumeBar.value;

   if (volumeBar.value == 0) {
      volumeIcon.classList.add("fa-volume-xmark");
   } else {
      volumeIcon.classList.remove("fa-volume-xmark");
   }
});

volumeIcon.addEventListener("click", () => {
   if (volumeIcon.classList.contains("fa-volume-xmark")) {
      volumeIcon.classList.remove("fa-volume-xmark");
      volumeBar.value = vol;
      currentSong.volume = volumeBar.value;
   } else {
      volumeIcon.classList.add("fa-volume-xmark");
      vol = volumeBar.value;
      volumeBar.value = 0;
      currentSong.volume = volumeBar.value;
   }
});

backBtn.addEventListener("click", () => {
   currentSongIndex = songsList.indexOf(currentSong.src.split("/").slice(-1)[0]);
   console.log(currentSong.src.split("/").slice(-1)[0]);
   if (currentSongIndex - 1 >= 0) {
      playMusic(decodeURI(songsList[--currentSongIndex]), true);
   } else {
      alert(
         "First Track & nothing previous available! " + (currentSongIndex - 1)
      );
      currentSongIndex = songsList.length - 1;
      playMusic(decodeURI(songsList[currentSongIndex]), true);
   }
});

nextBtn.addEventListener("click", () => {
   currentSongIndex = songsList.indexOf(currentSong.src.split("/").slice(-1)[0]);
   console.log(currentSong.src.split("/").slice(-1)[0]);
   if (currentSongIndex + 1 < songsList.length) {
      playMusic(decodeURI(songsList[++currentSongIndex]), true);
   } else {
      alert("Album ended! " + (currentSongIndex + 1));
      currentSongIndex = 0;
      playMusic(decodeURI(songsList[currentSongIndex]), true);
   }
});

playBtn.addEventListener("click", () => {
   if (currentSong.paused) {
      currentSong.play();
      playBtn.classList.toggle("fa-pause");
   } else {
      currentSong.pause();
      playBtn.classList.toggle("fa-pause");
   }
});

trackBar.addEventListener("click", (event) => {
   let percent =
      (event.offsetX / event.target.getBoundingClientRect().width) * 100;
   trackPosition.style.left = `${percent}%`;
   currentSong.currentTime = (currentSong.duration * percent) / 100;
});

hamBtn.addEventListener("click", () => {
   leftSection.style.left = "0";
});

leftCloseBtn.addEventListener("click", () => {
   leftSection.style.left = "-120%";
});

document.addEventListener("keydown", (event) => {
    if (event.key === " ") {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.classList.toggle("fa-pause");
         } else {
            currentSong.pause();
            playBtn.classList.toggle("fa-pause");
         }
    }
 });