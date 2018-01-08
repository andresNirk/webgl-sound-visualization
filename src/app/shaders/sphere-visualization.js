import * as THREE from "three";

var dataFragmentShader = `
uniform float particleTextureSize;
uniform sampler2D texture;
uniform sampler2D fftTexture;
uniform float time;
uniform float deltaTime;

//Source: https://www.shadertoy.com/view/Xsl3Dl
vec3 hash(vec3 p) {
    p = vec3( dot(p, vec3(127.1,311.7, 74.7)),
              dot(p, vec3(269.5,163.3,226.1)),
              dot(p, vec3(113.5,271.9,124.6)));

    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

//Source: https://www.shadertoy.com/view/Xsl3Dl
float noise(in vec3 p) {
    vec3 i = floor( p );
    vec3 f = fract( p );

    //vec3 u = f*f*(3.0-2.0*f);
    vec3 u = f*f*(3.0-2.0*f);

    return mix( mix( mix( dot( hash( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ), 
                          dot( hash( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ), 
                          dot( hash( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
                mix( mix( dot( hash( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ), 
                          dot( hash( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ), 
                          dot( hash( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
}

vec3 noise3(in vec3 p) {
    return vec3(noise(p),noise(p+1000.0),noise(p+2000.0));
}

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(particleTextureSize, particleTextureSize);

    if (uv.y < 0.25) {

        vec4 previousPosition = texture2D(texture, uv);
        vec4 previousSpeed = texture2D(texture, uv+vec2(0.0, 0.25));

        vec3 direction = normalize(noise3(vec3(time*0.5,0.0,0.0)));
        float fftPosition = abs(dot(normalize(previousPosition.xyz), direction));
        float fftValue = abs(texture2D(fftTexture, vec2(fftPosition, 0.5) ).r);
        
        vec4 newPosition = previousPosition;

        if (length(previousPosition.xyz) < 100.0) {
            newPosition.xyz = normalize(newPosition.xyz)*100.0;
        }

        if (length(previousPosition.xyz) < fftValue*200.0+100.0) {
            newPosition.xyz = normalize(previousPosition.xyz)*(fftValue*200.0+100.0);
        }
    
        newPosition.xyz += previousSpeed.xyz*deltaTime;
        gl_FragColor = newPosition;

    } else if (uv.y < 0.5) {
        
        vec4 previousPosition = texture2D(texture, uv+vec2(0.0, -0.25));
        vec4 previousSpeed = texture2D(texture, uv);

        vec3 direction = normalize(noise3(vec3(time*0.5,0.0,0.0)));
        float fftPosition = abs(dot(normalize(previousPosition.xyz), direction));
        float fftValue = abs(texture2D(fftTexture, vec2(fftPosition, 0.5) ).r);
        
        if (length(previousPosition.xyz) < 100.0) {
            previousSpeed.xyz = vec3(0.0, 0.0, 0.0);
        }
        if (length(previousPosition.xyz) < fftValue*200.0+100.0) {
            previousSpeed.xyz = (normalize(previousPosition.xyz)*(fftValue*200.0+100.0)-previousPosition.xyz);
        }

        previousSpeed.xyz *= 1.0-(deltaTime*0.15);
        previousSpeed.xyz += noise3(previousPosition.xyz*0.1)*deltaTime*500.0;
        previousSpeed.xyz -= previousPosition.xyz*deltaTime*0.5*(1.0+previousPosition.a*0.1);

        gl_FragColor = previousSpeed;

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

    float fftPosition = abs(dot(normalize(dataPosition.xyz), vec3(0.0, 1.0, 0.0)));
    float fftValue = abs(texture2D(fftTexture, vec2(fftPosition, 0.5) ).r);

    vec3 modifiedPosition = dataPosition.xyz; //+ normalize(dataPosition.xyz)*fftValue*100.0;

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

//Source: https://www.shadertoy.com/view/Xsl3Dl
vec3 hash(vec3 p) {
    p = vec3( dot(p, vec3(127.1,311.7, 74.7)),
              dot(p, vec3(269.5,163.3,226.1)),
              dot(p, vec3(113.5,271.9,124.6)));

    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

//Source: https://www.shadertoy.com/view/Xsl3Dl
float noise(in vec3 p) {
    vec3 i = floor( p );
    vec3 f = fract( p );

    //vec3 u = f*f*(3.0-2.0*f);
    vec3 u = f*f*(3.0-2.0*f);

    return mix( mix( mix( dot( hash( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ), 
                          dot( hash( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ), 
                          dot( hash( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
                mix( mix( dot( hash( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ), 
                          dot( hash( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ), 
                          dot( hash( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
}

vec3 noise3(in vec3 p) {
    return vec3(noise(p),noise(p+1000.0),noise(p+2000.0));
}

void main() {
    vec4 dataPosition = texture2D(dataTexture, fragmentDataTextureUV );
    vec4 dataSpeed = texture2D(dataTexture, fragmentDataTextureUV+vec2(0.0, 0.25));
    vec4 dataMisc = texture2D(dataTexture, fragmentDataTextureUV+vec2(0.0, 0.5));
    vec4 dataMisc2 = texture2D(dataTexture, fragmentDataTextureUV+vec2(0.0, 0.75));

    float fftPosition = abs(dot(normalize(dataPosition.xyz), vec3(0.0, 1.0, 0.0)));
    float fftValue = abs(texture2D(fftTexture, vec2(fftPosition, 0.5) ).r);

    //gl_FragColor = vec4( abs(fftValue), abs(dataSpeed.y)/10.0, 1.0-abs(fftValue), 0.0);
    //gl_FragColor = vec4( dataSpeed.xyz+vec3(0.5, 0.5, 0.5), 0.0);

    gl_FragColor = vec4( abs(noise3(dataPosition.xyz*0.1))*1.0, 0.0);

}
`;

function createStartTexture(particleTextureSize) {
    var data = new Float32Array(particleTextureSize*particleTextureSize*4);

    var particleAmount = particleTextureSize*particleTextureSize/4;
    for (var i = 0; i < particleAmount; i++) {
        var w = i / particleAmount;
        var angle = 6.28*w;

        var j = i*4;
        // position
        data[j+0] = (Math.random()-0.5)*2*50*3;
        data[j+1] = (Math.random()-0.5)*2*50*3;
        data[j+2] = (Math.random()-0.5)*2*50*3;
        // gravity strength
        data[j+3] = w;
        
        // speed
        j += particleAmount*4;
        data[j+0] = (Math.random()-0.5)*2*2;
        data[j+1] = (Math.random()-0.5)*2*2;
        data[j+2] = (Math.random()-0.5)*2*2;
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
exports.NAME = 'Sphere Visualization';