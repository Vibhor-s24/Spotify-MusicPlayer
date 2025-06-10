

console.log("lets write js");
let songs;
let currfolder;
let currentIndex = 0;
let currentsong = new Audio();

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = ""; // Clear previous list

    for (const song of songs) {
        songul.innerHTML += `
            <li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div class="songname">${song.replaceAll("%20", " ")}</div>
                    <div>Vibhor</div>
                </div>
                <div class="playnow">
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
    }

    Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
        e.addEventListener("click", () => {
            const songName = e.querySelector(".info .songname").innerText.trim();
            playmusic(songName);
        });
    });

    return songs;
}

const playmusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track;
    currentIndex = songs.indexOf(track);

    if (!pause) {
        currentsong.play().catch(e => console.error("Audio play failed:", e));
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayalbums() {
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");
    cardcontainer.innerHTML = ""; // Clear existing cards

    for (let e of anchors) {
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/songs/")[1].replace("/", "");

            try {
                let meta = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
                let info = await meta.json();

                cardcontainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="img/play-solid-standard.svg" alt="">
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${info.title}</h2>
                        <p>${info.description}</p>
                    </div>`;
            } catch (err) {
                console.warn(`Failed to load album info for ${folder}`);
            }
        }
    }

    // Rebind card click events after rendering
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.dataset.folder;
            await getsongs(`songs/${folder}`);
            playmusic(songs[0]);
        });
    });
}

async function main() {
    await displayalbums();
    await getsongs("songs/ncs");
    playmusic(songs[0], true);

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
        const progressPercent = (currentsong.currentTime / currentsong.duration) * 100;
        document.querySelector(".circle").style.left = progressPercent + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        const seekbar = e.target.getBoundingClientRect();
        const clickPosition = e.clientX - seekbar.left;
        const seekPercent = clickPosition / seekbar.width;
        currentsong.currentTime = seekPercent * currentsong.duration;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    previous.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            playmusic(songs[currentIndex]);
        }
    });

    next.addEventListener("click", () => {
        if (currentIndex < songs.length - 1) {
            currentIndex++;
            playmusic(songs[currentIndex]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    });
    //add event listener to mute the track
    document.querySelector(".vol>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            // currentsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            // currentsong.volume=.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=20;
        }
    })
}

main();
