uniform sampler2D uMap;
uniform sampler2D uNoise;
uniform float uDissolve;
uniform vec3 uBgColor;
uniform float uVignetteIntensity;
uniform float uVignetteNoiseScale;  // 控制噪声纹理缩放（默认0.8）
uniform float uVignetteFeatherRange; // 控制羽化范围（默认0.42）

varying vec2 vUv;

void main() {
  vec4 mapColor = texture2D(uMap, vUv);
  vec4 noiseColor = texture2D(uNoise, vUv);
  
  // ========== 溶解效果 ==========
  float noise = noiseColor.r;
  float dissolve = uDissolve;
  float dissolveAlpha = 1.0;
  
  if (dissolve > 0.0) {
    float threshold = dissolve + (noise - 0.5) * 0.3;
    dissolveAlpha = smoothstep(0.0, 0.1, noise - threshold);
  }
  
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
  float fbmNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
  
  // 4. 用噪声扰动径向距离，创建松弛不规则的边缘
  float perturbedDist = distFromCenter + (fbmNoise - 0.5) * 0.15;
  
  // 5. 创建宽范围的羽化淡出效果
  float vignetteAlpha = smoothstep(uVignetteFeatherRange + 0.08, -0.05, perturbedDist);
  
  // 6. 额外用噪声增强云雾感，让边缘更飘渺
  vignetteAlpha = vignetteAlpha * mix(fbmNoise, 1.0, 0.35);
  
  // ========== 合并所有Alpha效果 ==========
  float finalAlpha = dissolveAlpha * vignetteAlpha;
  
  // 混合地图颜色和背景色
  vec3 finalColor = mix(uBgColor, mapColor.rgb, finalAlpha);
  gl_FragColor = vec4(finalColor, 1.0);
}
