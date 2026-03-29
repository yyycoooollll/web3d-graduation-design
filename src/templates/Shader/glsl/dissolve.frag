uniform sampler2D uMap;
uniform sampler2D uNoise;
uniform float uDissolve;
uniform vec3 uBgColor;
uniform float uVignetteIntensity;

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
  
  // ========== 边缘羽化淡化（Vignette Effect）- 不规则形状 ==========
  // 计算到四边的距离
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
  // 将溶解Alpha和羽化Alpha相乘
  float finalAlpha = dissolveAlpha * vignetteAlpha;
  
  // 混合地图颜色和背景色
  vec3 finalColor = mix(uBgColor, mapColor.rgb, finalAlpha);
  gl_FragColor = vec4(finalColor, 1.0);
}
