uniform sampler2D uMap;
uniform sampler2D uNoise;
uniform float uDissolve;

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
  
  // 使用分形布朗运动创建复杂的噪声图案
  float noise = fbm(vUv);
  
  // 添加额外的噪声层增加细节
  float detail = texture2D(uNoise, vUv * 0.5).r;
  noise = mix(noise, detail, 0.3);
  
  float alpha = 1.0;
  
  if (uDissolve > 0.0) {
    // 使用dissolve值作为阈值
    // 当dissolve增加时，会有越来越多的区域显示不规则的边界
    float threshold = uDissolve;
    
    // 创建平滑的溶解边界
    float dissolveEdge = smoothstep(threshold - 0.15, threshold + 0.15, noise);
    alpha = dissolveEdge;
    
    // 添加溶解边界的高光效果
    float edge = smoothstep(threshold - 0.1, threshold - 0.05, noise) * 
                 (1.0 - smoothstep(threshold - 0.05, threshold + 0.05, noise));
    
    // 可选：添加边界发光效果
    vec3 finalColor = mapColor.rgb + edge * 0.3;
    gl_FragColor = vec4(finalColor, mapColor.a * alpha);
  } else {
    gl_FragColor = vec4(mapColor.rgb, mapColor.a);
  }
}
