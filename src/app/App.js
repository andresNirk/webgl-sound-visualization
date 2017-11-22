import React, { Component } from "react";
import DisGui           from "src/app/DisGui";
import ThreeCanvas      from "src/app/ThreeCanvas";
import AudioSource      from "src/app/AudioSource";

const audioSource = new AudioSource();

export default class App extends Component {
    constructor(props) {
        super(props);
        this.tcanvas = new ThreeCanvas(audioSource);

        const defaultSong = audioSource.firstSong();
        audioSource.loadSong(defaultSong);

        this.state = {
            loading: false,
            playing: false,
            currentSource: audioSource.currentSource,
            currentSong: defaultSong,
            currentVisualization: this.tcanvas.currentViz,
        };
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
            </div>
        );
    }

    onAutoRotateChanged = (value) => {
        this.tcanvas.controls.autoRotate = value;
    }

    onPlay = () => {
        const canPlay = audioSource.play();
        this.setState({ playing: canPlay });
    }

    onStop = () => {
        audioSource.stop();
        this.setState({ playing: false });
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
        const lastSong = this.state.currentSong;
        this.setState({ currentSong: s });
        this.setState({ loading: true });
        audioSource.loadSong(s)
            .then(() => this.setState({ loading: false }))
            .catch(() => this.setState({ loading: false, currentSong: lastSong }));
    }

    onVisualizationChanged = (vizName) => {
        this.tcanvas.setVizByName(vizName);
        this.setState({ currentVisualization: this.tcanvas.currentViz });
    }
}
