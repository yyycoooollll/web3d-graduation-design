uniform sampler2D uMap;
uniform sampler2D uNoise;
uniform float uDissolve;

varying vec2 vUv;

void main() {
  vec4 mapColor = texture2D(uMap, vUv);
  vec4 noiseColor = texture2D(uNoise, vUv);
  
  // 使用多层噪声创建不规则的溶解效果
  float noise = noiseColor.r;
  
  // 多层噪声增强不规则性
  float dissolve = uDissolve;
  
  // 使用step函数创建硬边界，使溶解更明显
  float alpha = 1.0;
  
  if (dissolve > 0.0) {
    // 结合原始噪声和缩放的噪声，创建更复杂的图案
    float scaledNoise = noise * dissolve;
    
    // 使用smoothstep创建柔和边界的溶解效果
    // 增加不规则性：使用噪声偏移溶解阈值
    float threshold = dissolve + (noise - 0.5) * 0.3;
    
    // 根据距离阈值的远近决定alpha
    alpha = smoothstep(0.0, 0.1, noise - threshold);
  }
  
  gl_FragColor = vec4(mapColor.rgb, mapColor.a * alpha);
}
