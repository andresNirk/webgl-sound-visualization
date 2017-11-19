var shader = `
varying vec3 pos;
varying vec2 fragmentDataTextureUV;

uniform sampler2D positionTexture;
uniform sampler2D fftTexture;

void main() {
    vec4 dataPosition = texture2D(positionTexture, fragmentDataTextureUV );

    float fftValue = abs(texture2D(fftTexture, vec2(dataPosition.a, 0.5) ).r)/256.0;

    gl_FragColor = vec4( abs(fftValue), pow(fftValue, 2.0), 1.0-abs(fftValue), 1.0);
}
`;

exports.shader = shader