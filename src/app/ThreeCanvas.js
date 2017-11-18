
import Tone from "tone";
import * as THREE from "three";
import Stats from "stats.js";
import WSVMath from "src/util/WSVMath";
import CollectionGeometries from "../geometries.js";
import CollectionMaterials from "../materials.js";

const debug = true;
const scene = new THREE.Scene();
const OrbitControls = require("three-orbit-controls")(THREE);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const stats = new Stats();
const materials = new CollectionMaterials();
const geometries = new CollectionGeometries();
const MIC = "mic";
const MUSIC = "music";
const SONG_NAME = "03 Losing Sleep.mp3";
const FFT_SIZE = 4096;

export default class ThreeCanvas {
    constructor() {
        window.TC = this;
        window.WSVMath = WSVMath;
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        camera.position.z = 200;
        camera.position.y = 50;
        this.controls = new OrbitControls(camera, renderer.domElement);
        this.controls.autoRotate = true;

        // stats
        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

        // lights
        const ambientLight = new THREE.AmbientLight(0xffffff);
        scene.add(ambientLight);
        const light = new THREE.PointLight(0xffffff, 1, 0);
        light.position.set(0, 200, 0);
        scene.add(light);

        const axisHelper = new THREE.AxisHelper(50);
        // scene.add( axisHelper );

        window.addEventListener("resize", () => {
            const WIDTH = window.innerWidth;
            const HEIGHT = window.innerHeight;
            renderer.setSize(WIDTH, HEIGHT);
            camera.aspect = WIDTH / HEIGHT;
            camera.updateProjectionMatrix();
        });

        this.constructSources();
        this.setMicOrMusic(MIC);

        this.setBars(128, true);

        this.addStats(debug);
        this.render();
    }


    render = () => {
        stats.begin();
        this.updateBars();
        this.controls.update();
        renderer.render(scene, camera);
        stats.end();
        requestAnimationFrame(this.render);
    }

    updateBars = () => {
        const fft = this.currentSource.waveform.getValue();
        this.barsGeometry.forEach((bar, i) => {
            bar.scale.set(1, Math.min(1, -(fft[this.fftIndexes[i]] + 140) * 2), 1);
        });
    }

    addStats(debugging) {
        if (debugging) {
            document.body.appendChild(stats.domElement);
        }
    }

    setBars(nr, logarithmic = false) {
        this.barsGeometry.forEach(bar => {
            scene.remove(bar);
        });
        this.bars = nr;
        this.barsGeometry = [];
        this.fftIndexes = [];
        const hw = nr / 2;
        for (let i = 0; i < nr; i += 1) {
            const bar = new THREE.Mesh(geometries.box, materials.phong);
            bar.position.set((i - hw) * 3, 0, 0);
            this.barsGeometry.push(bar);
            scene.add(bar);
            const logi = Math.round(WSVMath.lin2log(i + 1, 1, nr, 1, FFT_SIZE));
            if (i + 1 <= logi && logarithmic) {
                this.fftIndexes.push(logi);
            } else {
                this.fftIndexes.push(i + 1);
            }
        }
        console.log("logarithmic scale", logarithmic);
        const micWaveform = new Tone.FFT(FFT_SIZE);
        const musicWaveform = new Tone.FFT(FFT_SIZE);
        this.sources[MIC].waveform = micWaveform;
        this.sources[MUSIC].waveform = musicWaveform;
        this.sources[MIC].node.connect(micWaveform);
        this.sources[MUSIC].node.connect(musicWaveform);
    }

    rebuildFftIndex = (logarithmic) => {
        console.log("logarithmic scale", logarithmic);
        const indexes = [];
        for (let i = 0; i < this.bars; i += 1) {
            const logi = Math.round(WSVMath.lin2log(i + 1, 1, this.bars, 1, FFT_SIZE));
            if (i + 1 <= logi && logarithmic) {
                indexes.push(logi);
            } else {
                indexes.push(i + 1);
            }
        }
        this.fftIndexes = indexes;
    }

    play = () => {
        if (!this.currentSource.ready()) {
            return false;
        }
        this.currentSource.play();
        return true;
    }

    stop = () => {
        this.currentSource.stop();
    }

    setMicOrMusic = (micOrMusic) => {
        this.currentSource = this.sources[micOrMusic];
    }

    constructSources = () => {
        const playerSource = {};
        const micSource = {};
        window.Tone = Tone;
        const player = new Tone.Player({}).toMaster();
        player.load(`../songs/${SONG_NAME}`)
            .catch(() => {});
        playerSource.node = player;
        playerSource.name = MUSIC;
        playerSource.play = () => playerSource.node.start();
        playerSource.stop = () => playerSource.node.stop();
        playerSource.ready = () => {
            if (!playerSource.node.loaded) {
                console.log("Set correct file name that is in ../songs/ folder");
            }
            return playerSource.node.loaded;
        };
        playerSource.waveform = null;

        micSource.node = new Tone.UserMedia();
        micSource.name = MIC;
        micSource.play = () => micSource.node.open();
        micSource.stop = () => micSource.node.close();
        micSource.ready = () => true;
        micSource.waveform = null;

        this.sources[MUSIC] = playerSource;
        this.sources[MIC] = micSource;
    }

    bars = 0;
    barsGeometry = [];
    fftIndexes = [];
    controls = null;
    currentSource = null;
    sources = {};
}

