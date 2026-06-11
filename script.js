let songs = [
    {
        title: "Acoustic Breeze",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        cover: "https://picsum.photos/seed/music1/300/300"
    },
    {
        title: "Electric Pulse",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        cover: "https://picsum.photos/seed/music2/300/300"
    },
    {
        title: "Neon Nights",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        cover: "https://picsum.photos/seed/music3/300/300"
    },
    {
        title: "Synthwave Journey",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        cover: "https://picsum.photos/seed/music4/300/300"
    },
    {
        title: "Lo-Fi Chill",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        cover: "https://picsum.photos/seed/music5/300/300"
    }
];

const fallbackSongs = [...songs];

const audio = new Audio();
let currentSongIndex = 0;
let isPlaying = false;

const cover = document.getElementById('cover');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progressContainer = document.getElementById('progress-container');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const volumeSlider = document.getElementById('volume');
const volumeIcon = document.getElementById('volume-icon');
const playlistEl = document.getElementById('playlist');
const searchInput = document.getElementById('search-input');

function initPlayer() {
    loadSong(currentSongIndex);
    renderPlaylist();
    updateVolume();
    // Load some fresh top hits from API silently (don't autoplay)
    fetchSongs('popular hits', false);
}

async function fetchSongs(query, shouldPlay = true) {
    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=15`);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            songs = data.results.map(item => ({
                title: item.trackName,
                artist: item.artistName,
                src: item.previewUrl,
                cover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb.jpg', '300x300bb.jpg') : 'https://picsum.photos/seed/music1/300/300'
            }));
        } else {
            alert('No songs found for: ' + query);
            return;
        }
        
        currentSongIndex = 0;
        loadSong(currentSongIndex);
        renderPlaylist();
        
        if (shouldPlay) {
            playSong();
        } else {
            pauseSong();
        }
        
    } catch (error) {
        console.error("Error fetching music API:", error);
        songs = [...fallbackSongs];
        currentSongIndex = 0;
        loadSong(currentSongIndex);
        renderPlaylist();
        pauseSong();
    }
}function loadSong(index) {
    const song = songs[index];
    title.innerText = song.title;
    artist.innerText = song.artist;
    cover.src = song.cover;
    audio.src = song.src;
    
    currentTimeEl.innerText = "0:00";
    totalDurationEl.innerText = "0:00";
    progress.style.width = "0%";
    
    updatePlaylistHighlight();
}

// Play or Pause
function togglePlay() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function playSong() {
    isPlaying = true;
    audio.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    cover.classList.add('spin');
    cover.classList.remove('pause-spin');
}

function pauseSong() {
    isPlaying = false;
    audio.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    cover.classList.add('pause-spin');
}

function prevSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = songs.length - 1;
    }
    loadSong(currentSongIndex);
    if (isPlaying) playSong();
}

function nextSong() {
    currentSongIndex++;
    if (currentSongIndex > songs.length - 1) {
        currentSongIndex = 0;
    }
    loadSong(currentSongIndex);
    if (isPlaying) playSong();
}

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    
    if (isNaN(duration)) return;
    
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;

    // Format current time
    let currentMinutes = Math.floor(currentTime / 60);
    let currentSeconds = Math.floor(currentTime % 60);
    if (currentSeconds < 10) currentSeconds = `0${currentSeconds}`;
    currentTimeEl.innerText = `${currentMinutes}:${currentSeconds}`;
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    
    if (isNaN(duration)) return;
    
    audio.currentTime = (clickX / width) * duration;
}

audio.addEventListener('loadedmetadata', () => {
    let durationMinutes = Math.floor(audio.duration / 60);
    let durationSeconds = Math.floor(audio.duration % 60);
    if (durationSeconds < 10) durationSeconds = `0${durationSeconds}`;
    totalDurationEl.innerText = `${durationMinutes}:${durationSeconds}`;
});

function updateVolume() {
    audio.volume = volumeSlider.value / 100;
    
    if (audio.volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (audio.volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

function renderPlaylist() {
    playlistEl.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.classList.add('playlist-item');
        if (index === currentSongIndex) li.classList.add('active');
        
        li.innerHTML = `
            <img src="${song.cover}" alt="${song.title}" class="playlist-item-img">
            <div class="playlist-item-info">
                <div class="playlist-item-title">${song.title}</div>
                <div class="playlist-item-artist">${song.artist}</div>
            </div>
        `;
        
        li.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(currentSongIndex);
            playSong();
        });
        
        playlistEl.appendChild(li);
    });
}

function updatePlaylistHighlight() {
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
        if (index === currentSongIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
audio.addEventListener('timeupdate', updateProgress);
progressContainer.addEventListener('click', setProgress);
volumeSlider.addEventListener('input', updateVolume);
audio.addEventListener('ended', nextSong);

volumeIcon.addEventListener('click', () => {
    if (audio.volume > 0) {
        volumeSlider.value = 0;
    } else {
        volumeSlider.value = 100;
    }
    updateVolume();
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            fetchSongs(query, true);
        }
    }
});

// Initialization
initPlayer();
