// @flow

import React, { Component } from "react";
import Tone                 from "tone";

import DisGui         from "src/app/DisGui";
import PlayerControls from "src/app/PlayerControls";
import ThreeCanvas    from "src/app/ThreeCanvas";
import AudioSource    from "src/app/AudioSource";
import KeyboardInput  from "src/app/KeyboardInput";
import Sampler        from "src/app/Sampler";

const audioSource = new AudioSource();

type Song = { name : string, fileName : string };

type AppStateType = {
    loading : boolean,
    playing : boolean,
    muted : boolean,
    muted : boolean,
    currentSource : { name : string },
    currentSong : Song,
    currentVisualization : Object,
};

export default class App extends Component<any, AppStateType> {
    constructor(props : any) {
        super(props);

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

        KeyboardInput.addNoteListener(
            (note) => Sampler.piano.triggerAttack(note),
            (note) => Sampler.piano.triggerRelease(note)
        );

        // const seq = new Tone.Sequence((time, note) => {
        //     // console.log(note);
        //     // subdivisions are given as subarrays
        //     if (Sampler.piano.loaded) {
        //         Sampler.piano.triggerAttack(note);
        //     }
        // }, ["C4", ["E4", "D4", "E4", "E4", "D4", "E4"], "G4", ["A4", "G4"]]
        // ).start();
        // Tone.Transport.start();
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
                    currentVisualization={this.state.currentVisualization}
                    visualizations={this.tcanvas.getVizNames()}
                    onVisualizationChanged={this.onVisualizationChanged}
                    autoRotateChanged={this.onAutoRotateChanged}
                    onLogarithmicChanged={this.onLogarithmicChanged}
                />
                <PlayerControls
                    playing={this.state.playing}
                    loading={this.state.loading}
                    muted={this.state.muted}
                    currentSource={this.state.currentSource}
                    currentSong={this.state.currentSong}
                    songs={audioSource.getSongs()}
                    onPlay={this.onPlay}
                    onStop={this.onStop}
                    onMute={this.onMute}
                    onSourceChanged={this.onSourceChanged}
                    onLoadSong={(name) => this.onLoadSong(name)}
                />
            </div>
        );
    }

    onAutoRotateChanged = (value : boolean) => {
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

    onSourceChanged = (micOrMusic : string) => {
        audioSource.setSource(micOrMusic);
        this.setState({ currentSource: audioSource.currentSource });
    }

    onLogarithmicChanged = (logarithmic : boolean) => {
        const viz = this.state.currentVisualization;
        viz.rebuildFftIndex && viz.rebuildFftIndex(logarithmic);
    }

    onLoadSong = (song : Song) => {
        this.setState({ currentSong: song, loading: true });
        audioSource.loadSong(song, loaded => this.setState({ loading: !loaded }));
    }

    onVisualizationChanged = (vizName : string) => {
        this.tcanvas.setVizByName(vizName);
        this.setState({ currentVisualization: this.tcanvas.currentViz });
    }

    tcanvas = new ThreeCanvas(audioSource);
}
