import * as THREE from "three";
import WSVMath from "src/util/WSVMath";

import BasicVertexShader from "src/app/shaders/basic-vertex-shader.js"
import BasicFragmentShader from "src/app/shaders/basic-fragment-shader.js"

import DataFragmentShader from "src/app/shaders/data-fragment-shader.js"

import ParticleVertexShader from "src/app/shaders/particle-vertex-shader.js"
import ParticleFragmentShader from "src/app/shaders/particle-fragment-shader.js"

export default class ParticleEmitter {
    constructor() {
        
        // double buffering
        this.currentIndex = 0;
        this.dataTextures = [];
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        this.camera.position.z = 1;
        
        this.dataTextures.push(this.createRenderTarget());
        this.dataTextures.push(this.createRenderTarget());
        
        // simple passthrough, used for initializaion
        this.basicMaterial = new THREE.ShaderMaterial({
            vertexShader: BasicVertexShader.shader,
            fragmentShader: BasicFragmentShader.shader,
            uniforms: {
                texture: new THREE.Uniform(this.createStartTexture())
            }
        });
        
        // data update mesh
        this.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.basicMaterial );
        this.scene.add(this.mesh);
        
        // actual particles
        this.particles = this.createParticles();
    }
    
    // initializes initial data texture state, consult createStartTexture()
    init(renderer) {
        this.render(renderer, this.basicMaterial, this.dataTextures[0]);
        this.render(renderer, this.basicMaterial, this.dataTextures[1]);
        
        //calculation shader
        this.dataMaterial = new THREE.ShaderMaterial({
            vertexShader: BasicVertexShader.shader,
            fragmentShader: DataFragmentShader.shader,
            uniforms: {
                texture: new THREE.Uniform(this.createStartTexture()),
                fftTexture: new THREE.Uniform(this.createStartFftTexture()),
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
        this.dataMaterial.uniforms.texture.needsUpdate = true;
        
        this.particles.material.uniforms.positionTexture.value = this.getCurrentTarget().texture;
        this.particles.material.uniforms.positionTexture.needsUpdate = true;
    }
    
    createParticles() {
        var particleGeometry = new THREE.BufferGeometry();
        var vertices = new Float32Array(256*256*3);
        var dataTextureUV = new Float32Array(256*256*2);
        for (var x = 0; x < 256; x++) {
            for (var y = 0; y < 256; y++) {
                vertices[(x*256+y)*3+0] = x-128;
                vertices[(x*256+y)*3+1] = 0;
                vertices[(x*256+y)*3+2] = y-128;
                
                dataTextureUV[(x*256+y)*2+0] = x/256.0;
                dataTextureUV[(x*256+y)*2+1] = y/256.0;
            }
        }
        particleGeometry.addAttribute('position', new THREE.BufferAttribute( vertices, 3 ));
        particleGeometry.addAttribute('dataTextureUV', new THREE.BufferAttribute( dataTextureUV, 2 ));
        
        var material = new THREE.ShaderMaterial({
            vertexShader: ParticleVertexShader.shader,
            fragmentShader: ParticleFragmentShader.shader,
            uniforms: {
                positionTexture: new THREE.Uniform(this.dataTextures[0].texture),
                fftTexture: new THREE.Uniform(this.createStartFftTexture())
            }
        }); 
        
        return new THREE.Points(particleGeometry, material);
    }
    
    calculateNextFrame(time, deltaTime, renderer) {
        this.dataMaterial.uniforms.time.value = time;
        this.dataMaterial.uniforms.time.needsUpdate = true;
        this.dataMaterial.uniforms.deltaTime.value = deltaTime;
        this.dataMaterial.uniforms.deltaTime.needsUpdate = true;
        
        this.render(renderer, this.dataMaterial, this.getNextTarget());
        this.swapTextures();
    }
    
    updateFFTs(fftData) {
        var convertedData = new Float32Array(4096*4);
        for (var i in fftData) {
            convertedData[i*4] = fftData[i];
        }
        // out with the old
        this.dataMaterial.uniforms.fftTexture.value.dispose();
        
        // in with the new
        var texture = new THREE.DataTexture( convertedData, 4096, 1, THREE.RGBAFormat, THREE.FloatType );
        texture.needsUpdate = true;
        this.dataMaterial.uniforms.fftTexture.value = texture;
        this.dataMaterial.uniforms.fftTexture.needsUpdate = true;
        
        this.particles.material.uniforms.fftTexture.value = texture;
        this.particles.material.uniforms.fftTexture.needsUpdate = true;
    }
    
    render(renderer, material, dst) {
        this.mesh.material = material;
        renderer.render(this.scene, this.camera, dst);
    }
    
    createRenderTarget() {
        return new THREE.WebGLRenderTarget(256, 256, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            stencilBuffer: false
        });
    }
    
    createStartTexture() {
        var data = new Float32Array(256*256*4);
        for (var x = 0; x < 256; x++) {
            for (var y = 0; y < 256; y++) {
                data[(x*256+y)*4+0] = 0;
                data[(x*256+y)*4+1] = 0;
                data[(x*256+y)*4+2] = 0;
                // fft index
                data[(x*256+y)*4+3] = 1-Math.sqrt(Math.pow( (128-x)/128.0, 2)+Math.pow((128-y)/128.0, 2))/1.41;
            }
        }
        
        var texture = new THREE.DataTexture( data, 256, 256, THREE.RGBAFormat, THREE.FloatType );
        texture.needsUpdate = true;
        
        return texture;
    }
    
    createStartFftTexture() {
        var data = new Float32Array(4096*4);
        var texture = new THREE.DataTexture( data, 4096, 1, THREE.RGBAFormat, THREE.FloatType );
        texture.needsUpdate = true;
        return texture;
    }
}