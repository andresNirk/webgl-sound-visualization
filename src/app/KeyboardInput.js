// @flow

const keyMapper = {
    a: "C",
    s: "D",
    d: "E",
    f: "F",
    g: "G",
    h: "A",
    j: "B",
    k: "C+1",
};

let octave = 3;
const downListeners = [];
const upListeners = [];
const down = {};

const getNote = (key) => {
    const note = keyMapper[key];
    if (note) {
        const [base, next] = note.split("+");
        if (next) {
            return `${base}${octave + 1}`;
        }
        return `${base}${octave}`;
    }
    return note;
};

const keydown = (ev) => {
    const { key } = ev;
    if (!down[key]) {
        down[key] = true;
        const note = getNote(key);
        downListeners.forEach(cb => cb(note));
    }
};

const keyup = (ev) => {
    const { key } = ev;
    down[key] = false;
    const note = getNote(key);
    upListeners.forEach(cb => cb(note));
    if ("x" === key) octave += 1;
    if ("z" === key) octave -= 1;
};

document.addEventListener("keydown", keydown);
document.addEventListener("keyup", keyup);

export default class KeyboardInput {
    static setOctave = (o : number) => { octave = o; };
    static addNoteListener = (onDown : (note : string) => void, onUp : (note : string) => void) => {
        downListeners.push(onDown);
        upListeners.push(onUp);
    };
}

