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
                onMicOrMusicChange={this.onMicOrMusicChange}
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

    onMicOrMusicChange = (micOrMusic) => {
        this.setState({ micOrMusic });
        this.tcanvas.setMicOrMusic(micOrMusic);
    }
}
