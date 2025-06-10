console.log("lets write js");

let songs = [];
let currfolder = "";
let currentIndex = 0;
let currentsong = new Audio();

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function loadSongs(folderData) {
    currfolder = folderData.folder;
    songs = folderData.songs;

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
}

const playmusic = (track, pause = false) => {
    currentsong.src = `songs/${currfolder}/${track}`;
    currentIndex = songs.indexOf(track);

    if (!pause) {
        currentsong.play().catch(e => console.error("Audio play failed:", e));
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayalbums() {
    try {
        const res = await fetch("songs/songs.json");
        const data = await res.json();

        let cardcontainer = document.querySelector(".cardcontainer");
        cardcontainer.innerHTML = ""; // Clear existing cards

        for (let folderData of data) {
            cardcontainer.innerHTML += `
                <div data-folder='${JSON.stringify(folderData)}' class="card">
                    <div class="play">
                        <img src="img/play-solid-standard.svg" alt="">
                    </div>
                    <img src="songs/${folderData.folder}/${folderData.cover}" alt="">
                    <h2>${folderData.title}</h2>
                    <p>${folderData.description}</p>
                </div>`;
        }

        // Add event listeners
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", () => {
                const folderData = JSON.parse(card.getAttribute("data-folder"));
                loadSongs(folderData);
                playmusic(songs[0]);
            });
        });

    } catch (err) {
        console.error("Failed to load albums:", err);
    }
}

async function main() {
    await displayalbums();

    // Default album (optional)
    const defaultAlbumRes = await fetch("songs/songs.json");
    const albums = await defaultAlbumRes.json();
    if (albums.length > 0) {
        loadSongs(albums[0]);
        playmusic(songs[0], true);
    }

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

    document.querySelector(".vol>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }
    });
}

main();
