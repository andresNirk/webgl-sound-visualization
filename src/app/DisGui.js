import React from "react";
import * as dg from "dis-gui";
import BarsViz from "src/app/BarsViz";
import AudioSource      from "src/app/AudioSource";

const DisGui = ({
    playing,
    loading,
    currentSource,
    currentVisualization,
    visualizations,
    songNames,
    currentSong,
    autoRotateChanged,
    onPlay,
    onStop,
    onSourceChanged,
    onLogarithmicChanged,
    onLoadSong,
    onVisualizationChanged,
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
    const isMic = AudioSource.MIC === currentSource.name;
    const isBars = BarsViz.TYPE === currentVisualization.type;

    let playButton = <dg.Button label="Play" onClick={onPlay}/>;
    let micMusic = <dg.Select value={currentSource.name} label="Mic or music" options={["mic", "music"]} onChange={onSourceChanged}/>;
    let song = <dg.Select value={currentSong.name} label="Select song" options={songNames} onChange={onLoadSong}/>;

    if (playing) {
        playButton = <dg.Button label="Stop" onClick={onStop}/>;
        micMusic = null;
    }
    if (!isMic && loading) {
        playButton = <dg.Button label="Loading"/>;
    }
    if (isMic || playing) {
        song = null;
    }

    const logScale = isBars ? <dg.Checkbox label="Logarithmic scale" checked onChange={onLogarithmicChanged}/> : null;

    return (
        <dg.GUI>
            <dg.Checkbox label="Auto rotate" checked onChange={autoRotateChanged}/>
            <dg.Select value={currentVisualization.name} label="Visualization" options={visualizations} onChange={onVisualizationChanged}/>
            { playButton }
            { logScale }
            { micMusic }
            { song }
        </dg.GUI>
    );
};

export default DisGui;
