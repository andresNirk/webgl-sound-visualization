import * as THREE from "three";

var dataFragmentShader = `
uniform sampler2D texture;
uniform sampler2D fftTexture;
uniform float time;

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(256.0, 256.0);

    vec4 previousPosition = texture2D(texture, uv);
    float fftValue = texture2D(fftTexture, vec2(previousPosition.a, 0.5) ).r;

    previousPosition.y = fftValue*100.0;

    gl_FragColor = previousPosition;
}
`;

var particleVertexShader = `
attribute vec2 dataTextureUV;

uniform sampler2D dataTexture;
uniform sampler2D fftTexture;

varying vec3 pos;
varying vec2 fragmentDataTextureUV;

void main() {
    vec4 v = texture2D(dataTexture, dataTextureUV );
    vec3 modifiedPosition = v.xyz; // position +

    float fftValue = 1.0-abs(texture2D(fftTexture, vec2(v.a, 0.5) ).r);
    //modifiedPosition.x = modifiedPosition.x*fftValue;
    //modifiedPosition.z = modifiedPosition.z*fftValue;

    fragmentDataTextureUV = dataTextureUV;
    pos = position;

    gl_Position = projectionMatrix*modelViewMatrix*vec4(modifiedPosition, 1.0);
    gl_PointSize = 1.0;
}
`;

var particleFragmentShader = `
varying vec3 pos;
varying vec2 fragmentDataTextureUV;

uniform sampler2D dataTexture;
uniform sampler2D fftTexture;

void main() {
    vec4 dataPosition = texture2D(dataTexture, fragmentDataTextureUV );

    float fftValue = abs(texture2D(fftTexture, vec2(dataPosition.a, 0.5) ).r);

    gl_FragColor = vec4( abs(fftValue), pow(fftValue, 2.0), 1.0-abs(fftValue), 0.0);
}
`;

function createStartTexture(particleAmount) {
    var data = new Float32Array(particleAmount*particleAmount*4);

    var i = 0;
    for (; i < particleAmount*particleAmount; i++) {
        var w = i / (particleAmount*particleAmount);
        var angle = 6.28*w;

        data[i*4+0] = Math.sin(angle)*100;
        data[i*4+1] = 0;
        data[i*4+2] = Math.cos(angle)*100;

        data[i*4+3] = Math.pow(w, 3.0);
    }

    var texture = new THREE.DataTexture( data, particleAmount, particleAmount, THREE.RGBAFormat, THREE.FloatType );
    texture.needsUpdate = true;

    return texture;
}

exports.dataFragmentShader = dataFragmentShader;
exports.particleVertexShader = particleVertexShader;
exports.particleFragmentShader = particleFragmentShader;
exports.createStartTexture = createStartTexture;