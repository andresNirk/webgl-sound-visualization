import React, { Component } from "react";
import DisGui               from "src/app/DisGui";
import PlayerControls       from "src/app/PlayerControls";
import ThreeCanvas          from "src/app/ThreeCanvas";
import AudioSource          from "src/app/AudioSource";
import Tone                 from "tone";

const audioSource = new AudioSource();

export default class App extends Component {
    constructor(props) {
        super(props);
        this.tcanvas = new ThreeCanvas(audioSource);

        const defaultSong = audioSource.firstSong();
        audioSource.loadSong(defaultSong, loaded => this.setState({ loading: !loaded }));

        this.state = {
            loading: true,
            playing: false,
            muted: false,
            currentSource: audioSource.currentSource,
            currentSong: defaultSong,
            currentVisualization: this.tcanvas.currentViz,
        };
    }

    componentDidMount() {
        Tone.Transport.on("sourceStop", this.onSourceStopped);
        Tone.Transport.on("sourceStart", this.onSourceStarted);
    }

    componentWillUnmount() {
        Tone.Transport.off("sourceStop", this.onSourceStopped);
        Tone.Transport.off("sourceStart", this.onSourceStarted);
    }

    render() {
        return (
            <div>
                <DisGui
                    playing={this.state.playing}
                    loading={this.state.loading}
                    currentVisualization={this.state.currentVisualization}
                    visualizations={this.tcanvas.getVizNames()}
                    onVisualizationChanged={this.onVisualizationChanged}
                    currentSource={this.state.currentSource}
                    currentSong={this.state.currentSong}
                    songNames={audioSource.getSongNames()}
                    onPlay={this.onPlay}
                    onStop={this.onStop}
                    autoRotateChanged={this.onAutoRotateChanged}
                    onSourceChanged={this.onSourceChanged}
                    onLogarithmicChanged={this.onLogarithmicChanged}
                    onLoadSong={(name) => this.onLoadSong(name)}
                />
                <PlayerControls
                    playing={this.state.playing}
                    loading={this.state.loading}
                    muted={this.state.muted}
                    currentSource={this.state.currentSource}
                    currentSong={this.state.currentSong}
                    songNames={audioSource.getSongNames()}
                    onPlay={this.onPlay}
                    onStop={this.onStop}
                    onMute={this.onMute}
                    onSourceChanged={this.onSourceChanged}
                    onLoadSong={(name) => this.onLoadSong(name)}
                />
            </div>
        );
    }

    onAutoRotateChanged = (value) => {
        this.tcanvas.controls.autoRotate = value;
    }

    onPlay = () => {
        audioSource.play();
    }

    onStop = () => {
        audioSource.pause();
        this.setState({ playing: false });
    }

    onMute = () => {
        const muted = !this.state.muted;
        audioSource.currentSource.mute(muted);
        this.setState({ muted });
    }

    onSourceStopped = () => {
        this.setState({ playing: false });
    }

    onSourceStarted = () => {
        this.setState({ playing: true });
    }

    onSourceChanged = (micOrMusic) => {
        audioSource.setSource(micOrMusic);
        this.setState({ currentSource: audioSource.currentSource });
    }

    onLogarithmicChanged = (logarithmic) => {
        const viz = this.state.currentVisualization;
        viz.rebuildFftIndex && viz.rebuildFftIndex(logarithmic);
    }

    onLoadSong = (songName) => {
        const s = audioSource.getSong(songName);
        this.setState({ currentSong: s, loading: true });
        audioSource.loadSong(s, loaded => this.setState({ loading: !loaded }));
    }

    onVisualizationChanged = (vizName) => {
        this.tcanvas.setVizByName(vizName);
        this.setState({ currentVisualization: this.tcanvas.currentViz });
    }
}
