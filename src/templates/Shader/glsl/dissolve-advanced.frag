uniform sampler2D uMap;
uniform sampler2D uNoise;
uniform float uDissolve;
uniform vec3 uBgColor;
uniform float uVignetteIntensity;

varying vec2 vUv;

// 分形布朗运动 - 创建多层次的噪声
float fbm(vec2 uv) {
  float value = 0.0;
  float amplitude = 1.0;
  float frequency = 1.0;
  float maxValue = 0.0;
  
  // 4层分形噪声
  for(int i = 0; i < 4; i++) {
    vec4 noise = texture2D(uNoise, uv * frequency);
    value += amplitude * noise.r;
    maxValue += amplitude;
    
    amplitude *= 0.5;
    frequency *= 2.0;
    uv += vec2(0.1, 0.1);
  }
  
  return value / maxValue;
}

void main() {
  vec4 mapColor = texture2D(uMap, vUv);
  
  // ========== 溶解效果 ==========
  float noise = fbm(vUv);
  float detail = texture2D(uNoise, vUv * 0.5).r;
  noise = mix(noise, detail, 0.3);
  
  float dissolveAlpha = 1.0;
  
  if (uDissolve > 0.0) {
    float threshold = uDissolve;
    dissolveAlpha = smoothstep(threshold - 0.15, threshold + 0.15, noise);
  }
  
  // 添加溶解边界的高光效果
  float edge = smoothstep(threshold - 0.1, threshold - 0.05, noise) * 
               (1.0 - smoothstep(threshold - 0.05, threshold + 0.05, noise));

  // ========== 边缘羽化淡化（Vignette Effect）- 不规则形状 ==========
  float distFromLeft = vUv.x;
  float distFromRight = 1.0 - vUv.x;
  float distFromTop = 1.0 - vUv.y;
  float distFromBottom = vUv.y;
  
  // 为每个方向创建不同的羽化范围，右下角扩大留白
  float vigLeft = smoothstep(0.0, 0.20, distFromLeft);
  float vigRight = smoothstep(0.0, 0.35, distFromRight);  // 右边扩大
  float vigTop = smoothstep(0.0, 0.22, distFromTop);
  float vigBottom = smoothstep(0.0, 0.38, distFromBottom);  // 下面扩大
  
  // 合并四个方向的vignette - 使用乘法创建不规则效果
  float vignetteAlpha = vigLeft * vigRight * vigTop * vigBottom;
  
  // 添加径向淡化以增强不规则性
  vec2 centerUv = vUv - vec2(0.5);
  float distFromCenter = length(centerUv);
  float radialVignette = smoothstep(0.8, 0.35, distFromCenter);
  vignetteAlpha = vignetteAlpha * mix(1.0, radialVignette, 0.3);
  
  // ========== 合并所有Alpha效果 ==========
  float finalAlpha = dissolveAlpha * vignetteAlpha;
  vec3 finalColor = mix(uBgColor, mapColor.rgb + edge * 0.3, finalAlpha);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
