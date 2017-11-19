var shader = `
uniform sampler2D texture;

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(256.0, 256.0);
    vec4 previousPosition = texture2D(texture, uv);
    gl_FragColor = previousPosition;
}
`;

exports.shader = shader