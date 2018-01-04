
import Tone from "tone";

const MIC = "mic";
const MUSIC = "music";

// MUSIC FROM https://www.bensound.com
const songs = [
    {
        name: "Summer",
        fileName: "bensound-summer.mp3",
    },
    {
        name: "Dubstep",
        fileName: "bensound-dubstep.mp3",
    },
    {
        name: "House",
        fileName: "bensound-house.mp3",
    },
    {
        name: "Moose",
        fileName: "bensound-moose.mp3",
    },
    {
        name: "PopDance",
        fileName: "bensound-popdance.mp3",
    },
];

const FFT_SIZE = 4096;

export default class AudioSource {
    static MIC = MIC;
    static MUSIC = MUSIC;

    constructor() {
        this.setupTransport();
        this.constructSources();
        this.setSource(MIC);
        this.fftSize = FFT_SIZE;
        this.connectFft(this.fftSize);
        this._uintBuffer = new Uint8Array(this.fftSize);
    }

    connectFft(fftSize) {
        const micFFT = new Tone.FFT(fftSize);
        const musicFFT = new Tone.FFT(fftSize);
        this.sources[MIC].FFT = micFFT;
        this.sources[MUSIC].FFT = musicFFT;
        this.sources[MIC].node.connect(micFFT);
        this.sources[MUSIC].node.connect(musicFFT);
    }

    getValues = () => {
        this.currentSource.FFT.input.input.getByteFrequencyData(this._uintBuffer);
        return Float32Array.from(this._uintBuffer, v => v / 255.0);
    }

    play = () => {
        if (!this.currentSource.ready()) {
            return false;
        }
        this.currentSource.play();
        Tone.Transport.emit("sourceStart");
        return true;
    }

    stop = () => {
        this.currentSource.stop();
        Tone.Transport.emit("sourceStop");
    };

    pause = () => this.currentSource.pause();

    firstSong = () => songs[0];

    getSources = () => Object.keys(this.sources);

    getSong = (songName) => songs.find(song => song.name === songName);

    getSongNames = () => songs.map(s => s.name);

    setSource = (micOrMusic) => {
        this.currentSource = this.sources[micOrMusic];
        return this.currentSource;
    }

    loadSong = (song, cb) => {
        const restart = Tone.State.Started === Tone.Transport.state;
        this.stop();
        const { name, fileName } = song;
        if (!this.songBuffers.has(name)) {
            this.waitingForAdd = true;
            this.songBuffers.add(
                name,
                `https://firebasestorage.googleapis.com/v0/b/protor-3203e.appspot.com/o/visualizer%2Fsongs%2F${fileName}?alt=media`,
                () => {
                    if (this.waitingForAdd) {
                        this.sources[MUSIC].node.buffer = this.songBuffers.get(name);
                        console.log(`Current song set to ${name} : ${fileName}`);
                    }
                    cb && cb(this.songBuffers.loaded);
                }
            );
        } else {
            this.waitingForAdd = false;
            this.sources[MUSIC].node.buffer = this.songBuffers.get(name);
            console.log(`Current song set to ${name} : ${fileName}`);
            cb && cb(this.songBuffers.loaded);
            if (restart) window.setTimeout(() => this.play(), 100);
        }
    }

    onSeekProgress = (toProgress) => {
        const duration = this.sources[AudioSource.MUSIC].node.buffer.duration;
        Tone.Transport.seconds = toProgress * duration;
    }

    constructSources = () => {
        this.songBuffers = new Tone.Buffers();
        const playerSource = {};
        const micSource = {};
        playerSource.node = new Tone.Player({}).toMaster();
        playerSource.node.sync().start();
        playerSource.name = MUSIC;
        playerSource.play = () => Tone.Transport.start();
        playerSource.stop = () => Tone.Transport.stop();
        playerSource.pause = () => Tone.Transport.pause();
        playerSource.ready = () => {
            if (!playerSource.node.loaded) {
                console.log("Set correct file name");
            }
            return playerSource.node.loaded;
        };
        playerSource.FFT = null;

        micSource.node = new Tone.UserMedia();
        micSource.name = MIC;
        micSource.play = () => micSource.node.open();
        micSource.stop = () => micSource.node.close();
        micSource.pause = () => micSource.node.close();
        micSource.ready = () => true;
        micSource.FFT = null;

        this.sources[MUSIC] = playerSource;
        this.sources[MIC] = micSource;
    }

    setupTransport = () => {
        Tone.Transport.scheduleRepeat(() => {
            const seconds = Tone.Transport.seconds;
            const duration = this.sources[AudioSource.MUSIC].node.buffer.duration;
            if (seconds > duration) {
                this.stop();
            } else {
                Tone.Transport.emit("songProgressUpdate", seconds / duration, seconds, duration);
            }
        }, 0.1);
        Tone.Transport.on("progressSeek", this.onSeekProgress);
    }

    sources = {};
}

