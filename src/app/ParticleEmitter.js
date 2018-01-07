import * as THREE from "three";

import BasicVertexShader from "src/app/shaders/basic-vertex-shader.js";
import BasicFragmentShader from "src/app/shaders/basic-fragment-shader.js";

import CircleVisualization from "src/app/shaders/circle-visualization.js";
import ParticleVisualization from "src/app/shaders/particle-visualization.js";
import CakeVisualization from "src/app/shaders/cake-visualization.js";

const clock = new THREE.Clock();

export default class ParticleEmitter {
    static TYPE = "particleEmitter";
    
    static CircleVisualization = CircleVisualization;
    static ParticleVisualization = ParticleVisualization;
    static CakeVisualization = CakeVisualization;

    constructor(renderer, visualization) {
        
        // render setup
        this.scene = new THREE.Scene();
        this.renderer = renderer;
        this.camera = new THREE.Camera();
        
        this.name = visualization.NAME;
        this.type = ParticleEmitter.TYPE;
        
        this.particleTextureSize = 256;
        this.particleAmount = this.particleTextureSize*this.particleTextureSize/4;

        this.visualization = visualization;
        
        // double buffering
        this.currentIndex = 0;
        this.dataTextures = [];

        this.dataTextures.push(this.createRenderTarget());
        this.dataTextures.push(this.createRenderTarget());

        // fft
        this.fftTexture = this.createStartFftTexture();
        
        // simple passthrough, used for initializaion
        this.basicMaterial = new THREE.ShaderMaterial({
            vertexShader: BasicVertexShader.shader,
            fragmentShader: BasicFragmentShader.shader,
            uniforms: {
                particleTextureSize: new THREE.Uniform(this.particleTextureSize),
                texture: new THREE.Uniform(this.visualization.createStartTexture(this.particleTextureSize))
            }
        });

        // data update mesh
        this.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.basicMaterial );
        this.scene.add(this.mesh);

        // actual particles
        this.particles = this.createParticles();
        this.init();
    }

    onRender = (fftData, normFFTData) => {
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();
        this.calculateNextFrame(time % 10000, delta);
        this.updateFFTs(normFFTData);
    }

    onAdd = (scene) => {
        this.render(this.basicMaterial, this.dataTextures[0]);
        this.render(this.basicMaterial, this.dataTextures[1]);
        clock.getDelta();
        scene.add(this.particles);
    }

    onRemove = (scene) => {
        scene.remove(this.particles);
    }

    // initializes initial data texture state, consult createStartTexture()
    init() {
        this.render(this.basicMaterial, this.dataTextures[0]);
        this.render(this.basicMaterial, this.dataTextures[1]);

        //calculation shader
        this.dataMaterial = new THREE.ShaderMaterial({
            vertexShader: BasicVertexShader.shader,
            fragmentShader: this.visualization.dataFragmentShader,
            uniforms: {
                particleTextureSize: new THREE.Uniform(this.particleTextureSize),
                texture: new THREE.Uniform(this.visualization.createStartTexture(this.particleTextureSize)),
                fftTexture: new THREE.Uniform(this.fftTexture),
                time: new THREE.Uniform(0.0),
                deltaTime: new THREE.Uniform(0.0)
            }
        });
        this.mesh.material = this.dataMaterial;
    }

    getCurrentTarget() {
        return this.dataTextures[this.currentIndex];
    }
    getNextTarget() {
        return this.dataTextures[1-this.currentIndex];
    }
    swapTextures() {
        this.currentIndex = 1-this.currentIndex;
        
        this.dataMaterial.uniforms.texture.value = this.getCurrentTarget().texture;
        this.particles.material.uniforms.dataTexture.value = this.getCurrentTarget().texture;
    }
    
    createParticles() {
        var particleGeometry = new THREE.BufferGeometry();
        var vertices = new Float32Array(this.particleAmount*3);
        var dataTextureUV = new Float32Array(this.particleAmount*2);
        for (var x = 0; x < this.particleTextureSize; x++) {
            for (var y = 0; y < this.particleTextureSize/4; y++) {
                vertices[(y*this.particleTextureSize+x)*3+0] = 0;
                vertices[(y*this.particleTextureSize+x)*3+1] = 0;
                vertices[(y*this.particleTextureSize+x)*3+2] = 0;
                
                dataTextureUV[(y*this.particleTextureSize+x)*2+0] = (x+0.5)/this.particleTextureSize;
                dataTextureUV[(y*this.particleTextureSize+x)*2+1] = (y+0.5)/this.particleTextureSize;
            }
        }
        particleGeometry.addAttribute('position', new THREE.BufferAttribute( vertices, 3 ));
        particleGeometry.addAttribute('dataTextureUV', new THREE.BufferAttribute( dataTextureUV, 2 ));
        
        var material = new THREE.ShaderMaterial({
            vertexShader: this.visualization.particleVertexShader,
            fragmentShader: this.visualization.particleFragmentShader,
            uniforms: {
                dataTexture: new THREE.Uniform(this.dataTextures[0].texture),
                fftTexture: new THREE.Uniform(this.fftTexture)
            },
            blending: THREE.CustomBlending,
            blendSrc: THREE.OneFactor,
            transparent: true,
            depthWrite: false
        }); 
        
        return new THREE.Points(particleGeometry, material);
    }
    
    calculateNextFrame(time, deltaTime) {
        this.dataMaterial.uniforms.time.value = time;
        this.dataMaterial.uniforms.deltaTime.value = deltaTime;
        
        this.render(this.dataMaterial, this.getNextTarget());
        this.swapTextures();
    }
    
    updateFFTs(fftData) {
        for (var i in fftData) {
            this.fftTexture.image.data[i*4] = fftData[i];
        }
        
        this.fftTexture.needsUpdate = true;
    }
    
    render(material, dst) {
        this.mesh.material = material;
        this.renderer.render(this.scene, this.camera, dst);
    }
    
    createRenderTarget() {
        return new THREE.WebGLRenderTarget(this.particleTextureSize, this.particleTextureSize, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            stencilBuffer: false
        });
    }
    
    createStartFftTexture() {
        var data = new Float32Array(4096*4);
        var texture = new THREE.DataTexture( data, 4096, 1, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        return texture;
    }
}