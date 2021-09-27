uniform float time;
uniform vec2  resolution;
uniform float intensity;
uniform vec3  color;

varying vec2 vUv;

#define PI 3.14159265358979323846

int number = 40;
float size = 0.04;
float minSize = 0.3;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float rand(vec2 co, float l) {
    return rand(vec2(rand(co), l));
}

float rand(vec2 co, float l, float t) {
    return rand(vec2(rand(co, l), t));
}

float wrap(float x, float min) {
    return abs(mod(x, 2.0) - 1.0) + min;
}

float particle(vec2 p, float fx, float fy, float ax, float ay) {
    vec2 r;
    r = vec2(p.x + cos(time * fx) * 3. * ax * 1.0, p.y + sin(time * fy) * 1.5 * ay * 1.0);
    return ( size * wrap( time * ax, minSize ) ) / length(r);
}

void main() {

    vec2 q = gl_FragCoord.xy / resolution.xy;
    vec2 p = (4.0 * q) - 3.;
    p.x *= resolution.x / resolution.y;


    float col = 0.0;
    float counter = 0.0;

    for(int i = 0; i < number; i++) {
        col += particle(p, rand(vec2(counter)), rand(vec2(counter), 1.0, 50.0), counter, counter);
        counter += 0.1;
    }

    gl_FragColor.rgb = vec3(col) * color * intensity;
}