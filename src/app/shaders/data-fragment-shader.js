var shader = `
uniform sampler2D texture;
uniform sampler2D fftTexture;
uniform float time;

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(256.0, 256.0);

    vec4 previousPosition = texture2D(texture, uv);
    float fftValue = texture2D(fftTexture, vec2(previousPosition.a, 0.5) ).r;
    previousPosition.y = (fftValue+100.0);//*(1.0-abs(uv.y-0.5));
    //previousPosition.y = sin(uv.x*10.0+time)*20.0;
    gl_FragColor = previousPosition;
}
`;

exports.shader = shader