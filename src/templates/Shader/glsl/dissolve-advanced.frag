uniform sampler2D uMap;
uniform sampler2D uNoise;
uniform float uDissolve;
uniform vec3 uBgColor;
uniform float uVignetteIntensity;
uniform float uVignetteNoiseScale;  // 控制噪声纹理缩放（默认0.8）
uniform float uVignetteFeatherRange; // 控制羽化范围（默认0.42）

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

  // ========== 噪声驱动的松弛边缘羽化（云雾散开效果） ==========
  // 1. 计算基础径向距离
  vec2 centerUv = vUv - vec2(0.5);
  float distFromCenter = length(centerUv);
  
  // 2. 叠加三层噪声采样
  // 第一层：大尺度（主要云雾形状）
  vec2 noiseUv1 = vUv * uVignetteNoiseScale;
  float noise1 = texture2D(uNoise, noiseUv1).r;
  
  // 第二层：中等尺度（中级细节）
  vec2 noiseUv2 = vUv * uVignetteNoiseScale * 1.8 + vec2(0.3, 0.3);
  float noise2 = texture2D(uNoise, noiseUv2).r;
  
  // 第三层：小尺度（边缘撕裂感）
  vec2 noiseUv3 = vUv * uVignetteNoiseScale * 3.5 + vec2(-0.5, 0.2);
  float noise3 = texture2D(uNoise, noiseUv3).r;
  
  // 3. 合并噪声（FBM风格的加权）
  float fbmVigNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
  
  // 4. 用噪声扰动径向距离，创建松弛不规则的边缘
  float perturbedDist = distFromCenter + (fbmVigNoise - 0.5) * 0.15;
  
  // 5. 创建宽范围的羽化淡出效果
  float vignetteAlpha = smoothstep(uVignetteFeatherRange + 0.08, -0.05, perturbedDist);
  
  // 6. 额外用噪声增强云雾感，让边缘更飘渺
  vignetteAlpha = vignetteAlpha * mix(fbmVigNoise, 1.0, 0.35);
  
  // ========== 合并所有Alpha效果 ==========
  float finalAlpha = dissolveAlpha * vignetteAlpha;
  vec3 finalColor = mix(uBgColor, mapColor.rgb + edge * 0.3, finalAlpha);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
