var shader = `
uniform float particleTextureSize;
uniform sampler2D texture;

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(particleTextureSize, particleTextureSize);
    vec4 previousPosition = texture2D(texture, uv);
    gl_FragColor = previousPosition;
}
`;

exports.shader = shader