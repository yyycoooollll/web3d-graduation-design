varying vec3 vWorldDirection;

// Sky parameters (Toon Shader style)
uniform float turbidity;
uniform float rayleigh;
uniform float inclination;
uniform float azimuth;
uniform float luminance;
uniform float mieDirectionalG;
uniform float mieCoefficient;

// Constants
const float SOLAR_ANGULAR_RADIUS = 0.00872;
const float rayleighZenithLength = 8.4061e3;
const float mieZenithLength = 1.25e3;
const float up = normalize(vec3(0.0, 1.0, 0.0));
const vec3 K = vec3(0.686, 0.678, 0.666);
const float v = 4.0;
const float cutoffAngle = 1.6405;
const float steepness = 1.5;

// Rayleigh coefficient
vec3 simplifiedRayleigh() {
    return (vec3(5.47e-6, 1.25e-5, 2.30e-5) * (rayleigh - 2.0) * (rayleigh - 2.0)) * 50.0;
}

// Mie coefficient
vec3 getMieCoefficient() {
    return K * mieCoefficient * 1e-5 * (turbidity - 1.0);
}

// Sun intensity curve
vec3 getSunIntensity(float zenithAngleCos) {
    float cutoffIntensity = mix(1.0, 0.0, smoothstep(cos(cutoffAngle), cos(cutoffAngle - 0.1), zenithAngleCos));
    return vec3(1.0) * cutoffIntensity;
}

// Scattering calc
vec3 getRayleighScattering(vec3 sunDir, vec3 viewDir, vec3 upDir) {
    vec3 sunColor = getSunIntensity(dot(sunDir, upDir));
    float sunDot = max(dot(viewDir, sunDir), 0.0);
    
    // Toon shader discretization
    float step = floor(sunDot * 4.0) / 4.0;
    
    return sunColor * vec3(1.0, 0.7, 0.3) * max(0.0, 1.0 - max(0.0, dot(viewDir, upDir))) * (1.0 - step * 0.3);
}

void main() {
    vec3 direction = normalize(vWorldDirection);
    
    // Sun position based on angles
    vec3 sunDirection = normalize(vec3(
        cos(azimuth) * sin(inclination),
        sin(inclination),
        sin(azimuth) * sin(inclination)
    ));
    
    // Zenith angle
    float zenithAngle = acos(max(0.0, dot(direction, vec3(0.0, 1.0, 0.0))));
    
    // Distance to zenith
    float zenithAngleCos = cos(zenithAngle);
    
    // Intensity
    float sunIntensity = getSunIntensity(zenithAngleCos).r;
    
    // Toon shade calculation
    float skyBrightness = max(0.0, zenithAngleCos);
    skyBrightness = floor(skyBrightness * 4.0) / 4.0; // Quantize for toon effect
    
    // Mix colors based on sky position
    vec3 skyColor = mix(
        vec3(0.15, 0.3, 0.6), // Bottom/darker sky
        vec3(0.8, 0.9, 1.0),  // Top/brighter sky
        skyBrightness
    );
    
    // Add sun glow
    float sunGlow = 0.0;
    if (dot(direction, sunDirection) > 0.95) {
        sunGlow = smoothstep(0.95, 0.99, dot(direction, sunDirection)) * 0.8;
        sunGlow = floor(sunGlow * 3.0) / 3.0; // Toon quantize
        skyColor += vec3(1.0, 0.9, 0.5) * sunGlow;
    }
    
    // Add horizon line effect
    float horizonLine = smoothstep(0.1, 0.0, abs(zenithAngleCos - 0.0));
    horizonLine = floor(horizonLine * 2.0) / 2.0; // Toon effect
    skyColor += vec3(1.0, 0.8, 0.2) * horizonLine * 0.3;
    
    gl_FragColor = vec4(skyColor * luminance, 1.0);
}
