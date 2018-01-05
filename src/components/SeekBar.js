import React, { Component } from "react";
import Slider               from "material-ui/Slider";
import Tone                 from "tone";

const styles = {
    slider: {
        flex: 1,
        width: "100%",
        margin: 10,
    },
};

export default class SeekBar extends Component {
    state = {
        progress: 0,
    };

    componentDidMount() {
        Tone.Transport.on("songProgressUpdate", this.onProgressUpdated);
        Tone.Transport.on("sourceStop", this.onStop);
    }

    componentWillUnmount() {
        Tone.Transport.off("songProgressUpdate", this.onProgressUpdated);
        Tone.Transport.off("sourceStop", this.onStop);
    }

    render() {
        const {
            hidden,
            ...rest
        } = this.props;

        if (hidden) {
            return null;
        }

        return (
            <Slider
                value={this.state.progress}
                style={styles.slider}
                sliderStyle={{ margin: 0 }}
                onDragStop={this.onDragStop}
                onChange={this.onSliderChange}
                {...rest}
            />
        );
    }

    onSliderChange = (ev, value) => {
        this.sliderValue = value;
    }

    onDragStop = () => {
        Tone.Transport.emit("progressSeek", this.sliderValue);
    }

    onStop = () => {
        this.setState({ progress: 0 });
    }

    onProgressUpdated = (progress, time, duration) => {
        this.setState({ progress });
    }
}

