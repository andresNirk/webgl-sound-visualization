import * as THREE from "three";

var dataFragmentShader = `
uniform float particleTextureSize;
uniform sampler2D texture;
uniform sampler2D fftTexture;
uniform float time;

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(particleTextureSize, particleTextureSize);

    if (uv.y < 0.25) {

        vec4 previousPosition = texture2D(texture, uv);
        float fftValue = texture2D(fftTexture, vec2(previousPosition.a, 0.5) ).r;
        previousPosition.y = fftValue*200.0;
        gl_FragColor = previousPosition;

    } else if (uv.y < 0.5) {
        
        vec4 previousPosition = texture2D(texture, uv+vec2(0.0, -0.25));
        vec4 previousSpeed = texture2D(texture, uv);
        
        float fftValue = texture2D(fftTexture, vec2(previousPosition.a, 0.5) ).r;
        
        vec4 currentPosition = previousPosition;
        currentPosition.y = fftValue*200.0;

        gl_FragColor = currentPosition-previousPosition;

    } else if (uv.y < 0.75) {

        vec4 previousValue = texture2D(texture, uv);
        gl_FragColor = previousValue;

    } else {

        vec4 previousValue = texture2D(texture, uv);
        gl_FragColor = previousValue;

    }
}
`;

var particleVertexShader = `
attribute vec2 dataTextureUV;

uniform sampler2D dataTexture;
uniform sampler2D fftTexture;

varying vec3 pos;
varying vec2 fragmentDataTextureUV;

void main() {
    vec4 dataPosition = texture2D(dataTexture, dataTextureUV );

    vec3 modifiedPosition = dataPosition.xyz; // position +

    float fftValue = 1.0-abs(texture2D(fftTexture, vec2(dataPosition.a, 0.5) ).r);

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
    vec4 dataSpeed = texture2D(dataTexture, fragmentDataTextureUV+vec2(0.0, 0.25));
    vec4 dataMisc = texture2D(dataTexture, fragmentDataTextureUV+vec2(0.0, 0.5));
    vec4 dataMisc2 = texture2D(dataTexture, fragmentDataTextureUV+vec2(0.0, 0.75));

    float fftValue = abs(texture2D(fftTexture, vec2(dataPosition.a, 0.5) ).r);

    gl_FragColor = vec4( abs(fftValue), abs(dataSpeed.y)/10.0, 1.0-abs(fftValue), 0.0);

}
`;

function createStartTexture(particleTextureSize) {
    var data = new Float32Array(particleTextureSize*particleTextureSize*4);

    var particleAmount = particleTextureSize*particleTextureSize/4;
    for (var i = 0; i < particleAmount; i++) {
        var w = i / particleAmount;
        var angle = Math.cos(36)*w*i;

        var j = i*4;
        // position
        data[j+0] = Math.sin(angle)*100*w;
        data[j+1] = 0;
        data[j+2] = Math.cos(angle)*100*w;
        // fft
        data[j+3] = Math.pow(w, 3.0);
        
        // speed
        j += particleAmount*4;
        data[j+0] = 5;
        data[j+1] = 0;
        data[j+2] = 0;
        data[j+3] = 0;
        
        // misc
        j += particleAmount*4;
        data[j+0] = 0;
        data[j+1] = 0;
        data[j+2] = 0;
        data[j+3] = 0;
        
        // misc2
        j += particleAmount*4;
        data[j+0] = 0;
        data[j+1] = 0;
        data[j+2] = 0;
        data[j+3] = 0;
    }

    var texture = new THREE.DataTexture( data, particleTextureSize, particleTextureSize, THREE.RGBAFormat, THREE.FloatType );
    texture.needsUpdate = true;

    return texture;
}

exports.dataFragmentShader = dataFragmentShader;
exports.particleVertexShader = particleVertexShader;
exports.particleFragmentShader = particleFragmentShader;
exports.createStartTexture = createStartTexture;
exports.NAME = 'Cake Visualization';