# 不规则溶解效果实现指南

## 📌 概述

本实现使用 Three.js 和 React Three Fiber 创建了一个基于噪声纹理的不规则溶解效果。通过鼠标滚轮控制溶解程度，实现动态的透明度变化动画。

## 📁 文件结构

```
src/
├── templates/Shader/glsl/
│   ├── dissolve.vert              # 基础顶点着色器
│   ├── dissolve.frag              # 基础片段着色器（简单溶解）
│   └── dissolve-advanced.frag     # 高级片段着色器（分形噪声）
│
└── components/canvas/
    ├── DissolveMap.jsx            # 基础溶解组件
    └── DissolveMapAdvanced.jsx    # 高级溶解组件

app/
├── dissolve/page.jsx              # 基础溶解演示页面
└── dissolve-advanced/page.jsx     # 高级溶解演示页面
```

## 🚀 快速开始

### 方式1：使用基础版本

```jsx
import DissolveMap from '@/components/canvas/DissolveMap'
import { Canvas } from '@react-three/fiber'

export default function MyPage() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
      <color attach="background" args={['#000000']} />
      <DissolveMap />
    </Canvas>
  )
}
```

### 方式2：使用高级版本(推荐)

```jsx
import DissolveMapAdvanced from '@/components/canvas/DissolveMapAdvanced'
import { Canvas } from '@react-three/fiber'

export default function MyPage() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
      <color attach="background" args={['#0a0a0a']} />
      <DissolveMapAdvanced />
    </Canvas>
  )
}
```

## 🎛️ 组件属性

### DissolveMap / DissolveMapAdvanced

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `scale` | number | 1 | 平面缩放倍数 |
| `position` | array | [0, 0, 0] | 平面位置 [x, y, z] |
| `ref` | ref | - | React ref，用于访问material |

## 💡 工作原理

### 着色器原理

1. **纹理加载**
   - `uMap`: 原始地图纹理 (map.png)
   - `uNoise`: 噪声纹理 (noise.png)

2. **基础版本 (dissolve.frag)**
   - 使用噪声纹理的亮度值作为溶解阈值
   - 通过 `smoothstep` 创建柔和的边界
   - 随着 `uDissolve` 值增加，越来越多区域变透明

3. **高级版本 (dissolve-advanced.frag)**
   - 使用分形布朗运动 (FBM) 创建多层噪声
   - 4层分形噪声叠加，创建更复杂的图案
   - 添加边界发光效果
   - 结果更自然、更不规则

### 交互控制

- **鼠标向下滚轮**: `uDissolve` 增加 (0-1)
- **鼠标向上滚轮**: `uDissolve` 减少 (1-0)
- **平滑插值**: 使用 `0.08` 的缓动系数实现流畅动画

## 🎨 自定义

### 调整溶解速度

在 `DissolveMap.jsx` 或 `DissolveMapAdvanced.jsx` 中修改：

```jsx
// 当前值为 0.05，增大值使溶解更快
targetDissolveRef.current = Math.min(targetDissolveRef.current + 0.05, 1.0)

// 修改平滑插值的速度（0.08）
dissolveRef.current += (targetDissolveRef.current - dissolveRef.current) * 0.08
```

### 调整平面尺寸

```jsx
// 默认 8x4.5 (16:9 宽高比)
const mapW = 8 * scale  // 修改这里
const mapH = 4.5 * scale
```

### 调整噪声纹理

1. 使用你自己的 `noise.png` 替换 public/noise.png
2. 调整 FBM 中的频率:

```glsl
// 在 dissolve-advanced.frag 中
frequency *= 2.0;  // 改这个值控制细节密度
```

## 📋 依赖项

- three.js
- @react-three/fiber
- @react-three/drei
- react (≥ 18)

## 🎯 性能优化建议

1. **使用低分辨率噪声纹理** - 减小 noise.png 文件大小
2. **减少 FBM 层数** - 在 dissolve-advanced.frag 中改为3层
3. **启用压缩纹理** - 使用 WebP 格式替代 PNG

## 📱 浏览器兼容性

- Chrome/Edge (推荐)
- Firefox
- Safari (需要 WebGL 支持)

## 🔗 示例页面

- 基础版本: `/dissolve`
- 高级版本: `/dissolve-advanced`

## 📚 相关文档

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [GLSL Reference](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)

---

**提示**: 如果溶解效果不明显，确保：
1. ✅ `map.png` 和 `noise.png` 已放在 `public/` 目录
2. ✅ Canvas 背景颜色已设置
3. ✅ 平面大小适当
