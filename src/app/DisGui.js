// @flow

import React from "react";
import { Checkbox, GUI, Select } from "dis-gui";
import BarsViz from "src/app/BarsViz";

type props = {
    currentVisualization : Object,
    visualizations : Array<string>,
    autoRotateChanged : (rotate : boolean) => void,
    onLogarithmicChanged : (logarithmic : boolean) => void,
    onVisualizationChanged : (name : string) => void,
};

const DisGui = ({
    currentVisualization,
    visualizations,
    autoRotateChanged,
    onLogarithmicChanged,
    onVisualizationChanged,
} : props) => {
    const isBars = BarsViz.TYPE === currentVisualization.type;

    const logScale = isBars ? <Checkbox label="Logarithmic scale" checked onChange={onLogarithmicChanged}/> : null;

    return (
        <GUI>
            <Checkbox label="Auto rotate" checked onChange={autoRotateChanged}/>
            <Select value={currentVisualization.name} label="Visualization" options={visualizations} onChange={onVisualizationChanged}/>
            { logScale }
        </GUI>
    );
};

export default DisGui;
