import React from "react";
import * as dg from "dis-gui";

const DisGui = ({
    playing,
    loading,
    micOrMusic,
    songNames,
    currentSong,
    autoRotateChanged,
    onPlay,
    onStop,
    onMicOrMusicChanged,
    onLogarithmicChanged,
    onLoadSong,
}) => {
    // <dg.Text label="Text" value="Hello world!"/>
    // <dg.Number label="Number" value={65536}/>
    // <dg.Number label="Range" value={512} min={-1024} max={1024} step={64}/>
    // <dg.Checkbox label="Checkbox" checked/>
    // <dg.Select label="Select" options={["Option one", "Option two", "Option three"]}/>
    // <dg.Button label="Button"/>
    // <dg.Folder label="Folder" expanded>
    //     <dg.Text label="Text" value="Hello folder!"/>
    //     <dg.Number label="Number" value={2}/>
    //     <dg.Folder label="Subfolder" expanded>
    //         <dg.Text label="Text" value="Hello subfolder!"/>
    //         <dg.Number label="Number" value={2}/>
    //     </dg.Folder>
    // </dg.Folder>
    // <dg.Color label="Color" expanded red={0} green={128} blue={255}/>
    // <dg.Gradient label="Gradient" expanded/>
    const isMic = () => "mic" === micOrMusic;
    let playButton = <dg.Button label="Play" onClick={onPlay}/>;
    if (playing) {
        playButton = <dg.Button label="Stop" onClick={onStop}/>;
    } if (!isMic() && loading) {
        playButton = <dg.Button label="Loading"/>;
    }
    return (
        <dg.GUI>
            <dg.Checkbox label="Auto rotate" checked onChange={autoRotateChanged}/>
            <dg.Checkbox label="Logarithmic scale" checked onChange={onLogarithmicChanged}/>
            { playButton }
            { playing ? null : <dg.Select value={micOrMusic} label="Mic or music" options={["mic", "music"]} onChange={onMicOrMusicChanged}/> }
            { "mic" === micOrMusic || playing ? null : <dg.Select value={currentSong.name} label="Select song" options={songNames} onChange={onLoadSong}/> }
        </dg.GUI>
    );
};

export default DisGui;
