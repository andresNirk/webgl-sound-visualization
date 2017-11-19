var shader = `
attribute vec2 dataTextureUV;

uniform sampler2D positionTexture;
uniform sampler2D fftTexture;

varying vec3 pos;
varying vec2 fragmentDataTextureUV;

void main() {
    vec4 v = texture2D(positionTexture, dataTextureUV );
    vec3 modifiedPosition = position + v.xyz;

    float fftValue = 1.0-abs(texture2D(fftTexture, vec2(v.a, 0.5) ).r)/256.0;
    modifiedPosition.x = modifiedPosition.x*fftValue;
    modifiedPosition.z = modifiedPosition.z*fftValue;

    fragmentDataTextureUV = dataTextureUV;
    pos = position;

    gl_Position = projectionMatrix*modelViewMatrix*vec4(modifiedPosition, 1.0);
    gl_PointSize = 2.0;
}
`;

exports.shader = shader