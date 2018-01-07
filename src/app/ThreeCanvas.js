
import * as THREE       from "three";
import Stats            from "stats.js";

import BarsViz          from "src/app/BarsViz";
import ParticleEmitter  from "src/app/ParticleEmitter";

const debug = true;
const OrbitControls = require("three-orbit-controls")(THREE);
const stats = new Stats();

export default class ThreeCanvas {
    constructor(audioSource) {
        // for debugging;
        // window.TC = this;

        this.audioSource = audioSource;

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.scene = new THREE.Scene();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.camera.position.z = 200;
        this.camera.position.y = 50;
        this.controls.autoRotate = true;

        this.addViz();
		this.addbackground();
        this.addResizeListener();
        this.addLights();
        this.addStats(debug);
        this.render();
    }


    render = () => {
        stats.begin();
        this.controls.update();

        this.currentViz.onRender(this.audioSource.FFT.getValue(), this.audioSource.getValues());
        this.renderer.render(this.scene, this.camera);

        stats.end();
        requestAnimationFrame(this.render);
    }

    addViz = () => {
        const defaultViz = new ParticleEmitter(this.renderer, ParticleEmitter.CircleVisualization);
        const secondViz = new ParticleEmitter(this.renderer, ParticleEmitter.ParticleVisualization);
        const cakeViz = new ParticleEmitter(this.renderer, ParticleEmitter.CakeVisualization);
        this.visualizations = [
            defaultViz,
            secondViz,
            cakeViz,
            new BarsViz(this.audioSource.fftSize),
        ];
        defaultViz.onAdd(this.scene);
        this.currentViz = defaultViz;
    }
	
	addbackground= () => {
		var starsGeometry = new THREE.Geometry();
		for ( var i = 0; i < 5000; i ++ ) {
			var star = new THREE.Vector3();
			star.x = THREE.Math.randFloatSpread( 2500 );
			star.y = THREE.Math.randFloatSpread( 2500 );
			star.z = THREE.Math.randFloatSpread( 2500 );
			//nearby stars that would get in the way are not added
			if(Math.abs(star.x)+Math.abs(star.y)+Math.abs(star.z)>350){
				starsGeometry.vertices.push( star );
			}
		}
		var starsMaterial = new THREE.PointsMaterial( { color: 0x888888} );
		var starField = new THREE.Points( starsGeometry, starsMaterial );
		this.scene.add( starField );
	}
    addStats = (debugging) => {
        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        if (debugging) {
            document.body.appendChild(stats.domElement);
        }
    }

    addLights = () => {
        const ambientLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(ambientLight);
        const light = new THREE.PointLight(0xffffff, 1, 0);
        light.position.set(0, 200, 0);
        this.scene.add(light);
    }

    addResizeListener = () => {
        window.addEventListener("resize", () => {
            const WIDTH = window.innerWidth;
            const HEIGHT = window.innerHeight;
            this.renderer.setSize(WIDTH, HEIGHT);
            this.camera.aspect = WIDTH / HEIGHT;
            this.camera.updateProjectionMatrix();
        });
    }

    setVizByName = (vizName) => {
        const viz = this.visualizations.find(v => v.name === vizName);
        this.currentViz.onRemove(this.scene);
        viz.onAdd(this.scene);
        this.currentViz = viz;
    }

    getVizNames = () => this.visualizations.map(v => v.name);
}

