uniform sampler2D baseSky;
uniform float sunIntensity;
uniform float time;

varying vec3 vWorldDirection;

void main() {
    vec3 direction = normalize(vWorldDirection);
    
    // 基础天空纹理采样
    vec3 skyColor = texture2D(baseSky, vec2(
        atan(direction.x, direction.z) / 3.14159 * 0.5 + 0.5,
        direction.y * 0.5 + 0.5
    )).rgb;
    
    // 从 uniform 应用太阳强度
    skyColor += sunIntensity * 0.5 * vec3(1.0, 0.8, 0.4);
    
    // 云层流动动画（使用 time）
    float cloudFlow = sin(time * 0.5 + direction.x * 10.0) * 0.1;
    skyColor += cloudFlow * vec3(0.5, 0.5, 0.5);
    
    // Exposure
    skyColor = vec3(1.0) - exp(-skyColor);
    
    gl_FragColor = vec4(skyColor, 1.0);
}
