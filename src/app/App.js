import React, { Component } from "react";
import DisGui from "src/app/DisGui";
import ThreeCanvas from "src/app/ThreeCanvas";

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

export default class App extends Component {
    constructor(props) {
        super(props);
        this.tcanvas = new ThreeCanvas();
        this.tcanvas.loadSong(this.state.currentSong.name, this.state.currentSong.fileName);
    }

    state = {
        loading: false,
        playing: false,
        micOrMusic: "mic",
        currentSong: songs[0],
    }

    render() {
        return (
            <DisGui
                playing={this.state.playing}
                loading={this.state.loading}
                micOrMusic={this.state.micOrMusic}
                currentSong={this.state.currentSong}
                songNames={songs.map(s => s.name)}
                onPlay={this.onPlay}
                onStop={this.onStop}
                autoRotateChanged={this.onAutoRotateChanged}
                onMicOrMusicChanged={this.onMicOrMusicChanged}
                onLogarithmicChanged={this.onLogarithmicChanged}
                onLoadSong={(name) => this.onLoadSong(name)}
            />
        );
    }

    onAutoRotateChanged = (value) => {
        this.tcanvas.controls.autoRotate = value;
    }

    onPlay = () => {
        const canPlay = this.tcanvas.play();
        this.setState({ playing: canPlay });
    }

    onStop = () => {
        this.setState({ playing: false });
        this.tcanvas.stop();
    }

    onMicOrMusicChanged = (micOrMusic) => {
        this.setState({ micOrMusic });
        this.tcanvas.setMicOrMusic(micOrMusic);
    }

    onLogarithmicChanged = (logarithmic) => {
        this.tcanvas.rebuildFftIndex(logarithmic);
    }

    onLoadSong(songName) {
        const s = songs.find(song => song.name === songName);
        const lastSong = this.state.currentSong;
        this.setState({ currentSong: s });
        this.setState({ loading: true });
        this.tcanvas.loadSong(s.name, s.fileName)
            .then(() => this.setState({ loading: false }))
            .catch(() => this.setState({ loading: false, currentSong: lastSong }));
    }
}
