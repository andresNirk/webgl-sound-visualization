import React, { Component } from "react";
import DisGui from "src/app/DisGui";
import ThreeCanvas from "src/app/ThreeCanvas";

export default class App extends Component {
    constructor(props) {
        super(props);
        this.tcanvas = new ThreeCanvas();
    }

    state = {
        playing: false,
        micOrMusic: "mic",
    }

    render() {
        return (
            <DisGui
                playing={this.state.playing}
                micOrMusic={this.state.micOrMusic}
                onPlay={this.onPlay}
                onStop={this.onStop}
                autoRotateChanged={this.onAutoRotateChanged}
                onMicOrMusicChanged={this.onMicOrMusicChanged}
                onLogarithmicChanged={this.onLogarithmicChanged}
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
}
