import React, { Component } from "react";
import MuiThemeProvider     from "material-ui/styles/MuiThemeProvider";
import Slider               from "material-ui/Slider";
import IconButton           from "material-ui/IconButton";
import CircularProgress     from "material-ui/CircularProgress";
import Tone                 from "tone";

import AudioSource      from "src/app/AudioSource";

const styles = {
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        padding: "0 50px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    controls: {
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
    },
    slider: {
        flex: 1,
        width: "100%",
        margin: 10,
    },
};

const MaterialIcon = ({ name, ...props }) => (
    <IconButton iconClassName="material-icons" {...props}>{name}</IconButton>
);

/*
 * The `defaultValue` property sets the initial position of the slider.
 * The slider appearance changes when not at the starting position.
 */
export default class PlayerControls extends Component {
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
            playing,
            loading,
            muted,
            currentSource,
            songNames,
            currentSong,
            onPlay,
            onStop,
            onMute,
            onSourceChanged,
            onLoadSong,
        } = this.props;
        const currentSongIndex = songNames.indexOf(currentSong.name);
        const nextSong = currentSongIndex === songNames.length - 1 ? songNames[0] : songNames[currentSongIndex + 1];
        const previousSong = 0 === currentSongIndex ? songNames[songNames.length - 1] : songNames[currentSongIndex - 1];
        const isMic = AudioSource.MIC === currentSource.name;
        let playIcon = playing ? "pause" : "play_arrow";
        if (isMic) playIcon = "fiber_manual_record";
        const recColor = isMic && playing ? "red" : null;
        const playButtonAction = playing ? onStop : onPlay;
        const sourceIcon = isMic ? "music_note" : "mic";
        const sourceAction = () => onSourceChanged(isMic ? AudioSource.MUSIC : AudioSource.MIC);
        const previousSongAction = () => onLoadSong(previousSong);
        const nextSongAction = () => onLoadSong(nextSong);
        let playButton = <MaterialIcon onClick={playButtonAction} name={playIcon} iconStyle={{ color: recColor }} />;
        if (loading) {
            playButton = <CircularProgress size={28} style={{ margin: 10 }} />;
        }

        return (
            <MuiThemeProvider>
                <div style={styles.container}>
                    <Slider
                        ref={c => { this.slider = c; }}
                        value={this.state.progress}
                        style={styles.slider}
                        sliderStyle={{ margin: 0 }}
                        onDragStop={this.onDragStop}
                        onChange={this.onSliderChange}
                    />
                    <div>
                        <p>{isMic ? "Current source is microphone" : `Song name: ${currentSong.name}`}</p>
                    </div>
                    <div style={styles.controls}>
                        <div>
                            <MaterialIcon
                                name={muted ? "volume_off" : "volume_up"}
                                disabled={isMic}
                                onClick={onMute}
                            />
                        </div>
                        <div style={{ display: "flex" }}>
                            <MaterialIcon
                                name="skip_previous"
                                disabled={isMic}
                                onClick={previousSongAction}
                            />
                            {playButton}
                            <MaterialIcon
                                name="skip_next"
                                disabled={isMic}
                                onClick={nextSongAction}
                            />
                        </div>
                        <div>
                            <MaterialIcon
                                name={sourceIcon}
                                disabled={playing}
                                onClick={sourceAction}
                            />
                        </div>
                    </div>
                </div>
            </MuiThemeProvider>
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

