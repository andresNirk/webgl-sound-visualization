// @flow

import React, { Component } from "react";
import MuiThemeProvider     from "material-ui/styles/MuiThemeProvider";
import IconButton           from "material-ui/IconButton";
import CircularProgress     from "material-ui/CircularProgress";
import FontIcon             from "material-ui/FontIcon";

import AudioSource from "src/app/AudioSource";
import SeekBar     from "src/components/SeekBar";

const styles = {
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    container2: {
        backgroundColor: "white",
        padding: "0px 50px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "600px",
    },
    controls: {
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
    },
    uploadButton: {
        verticalAlign: "middle",
    },
    uploadInput: {
        cursor: "pointer",
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        width: "100%",
        opacity: 0,
    },
};

const MaterialIcon = ({ name, ...props }) => (
    <IconButton iconClassName="material-icons" {...props}>{name}</IconButton>
);

type Song = { name : string, fileName : string };

type PlayerControlsProps = {
    playing : boolean,
    loading : boolean,
    muted : boolean,
    currentSource : { name : string },
    songs : Array<Song>,
    currentSong : Song,
    onPlay : () => void,
    onStop : () => void,
    onMute : () => void,
    onSourceChanged : (sourceName : string) => void,
    onLoadSong : (song : Song) => void,
};

/*
 * The `defaultValue` property sets the initial position of the slider.
 * The slider appearance changes when not at the starting position.
 */
export default class PlayerControls extends Component<PlayerControlsProps> {
    render() {
        const {
            playing,
            loading,
            muted,
            currentSource,
            songs,
            currentSong,
            onPlay,
            onStop,
            onMute,
            onSourceChanged,
            onLoadSong,
        } = this.props;
        const currentSongIndex = songs.indexOf(currentSong);
        const nextSong = currentSongIndex === songs.length - 1 ? songs[0] : songs[currentSongIndex + 1];
        const previousSong = 0 === currentSongIndex ? songs[songs.length - 1] : songs[currentSongIndex - 1];
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
        if (loading && !isMic) {
            playButton = <CircularProgress size={28} style={{ margin: 10 }} />;
        }

        return (
            <MuiThemeProvider>
                <div style={styles.container}>
                    <div style={styles.container2}>
                        <SeekBar hidden={isMic} />
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
                            <div style={{ display: "flex" }}>
                                <MaterialIcon
                                    name={sourceIcon}
                                    disabled={playing}
                                    onClick={sourceAction}
                                />
                                <div style={{ width: 48, height: 48, position: "relative" }}>
                                    <IconButton>
                                        <FontIcon className="material-icons">library_music</FontIcon>
                                    </IconButton>
                                    <input
                                        type="file"
                                        style={styles.uploadInput}
                                        accept="audio/*"
                                        onChange={this.onFilesChosen}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }

    onFilesChosen = (ev : Object) => {
        const file = ev.target.files[0];
        const fileName = window.URL.createObjectURL(file);
        this.props.onLoadSong({ name: file.name, fileName });
    }
}

