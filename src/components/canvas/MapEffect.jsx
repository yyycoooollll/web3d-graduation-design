'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

// 注册 GSAP 插件
gsap.registerPlugin(ScrollTrigger)

// 地图顶点着色器
const mapVertexShader = `
  varying vec2 vUv;
  uniform vec2 mousePos;
  
  void main() {
    vUv = uv;
    // 地图跟随鼠标
    vec3 newPos = position + vec3(mousePos * 0.5, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`

// 地图片段着色器 - 只处理消散，不处理vignette
const mapFragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uProgress;
  uniform float uOpacity;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    float lerp1 = mix(a, b, u.x);
    float lerp2 = mix(c, d, u.x);
    return mix(lerp1, lerp2, u.y);
  }

  void main() {
    vec4 color = texture2D(uTexture, vUv);
    
    // 多层噪声 - 不规则消散
    float n1 = noise(vUv * 4.0);
    float n2 = noise(vUv * 8.0 + 0.5);
    float n3 = noise(vUv * 16.0 + 1.0);
    
    float consumption = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    
    if (consumption < uProgress) {
      discard;
    }
    
    // 应用开场动画的uOpacity
    gl_FragColor = vec4(color.rgb, color.a * uOpacity);
  }
`

// Vignette 淡化图层着色器 - 圆形，雾的效果
const vignetteVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const vignetteFragmentShader = `
  varying vec2 vUv;
  uniform float uIntensity;
  
  void main() {
    // 从左到右的线性淡化
    float fadeFromLeft = smoothstep(0.0, 0.6, vUv.x);
    
    // 四周边界渐化 - 保持中间清晰
    float distFromLeft = vUv.x;
    float distFromRight = 1.0 - vUv.x;
    float distFromTop = 1.0 - vUv.y;
    float distFromBottom = vUv.y;
    
    float minDist = min(min(distFromLeft, distFromRight), min(distFromTop, distFromBottom));
    float edgeFade = smoothstep(0.0, 0.1, minDist);
    
    // 白色雾效应 - uIntensity控制整体强度
    vec3 fogColor = vec3(1.0);
    float alpha = ((1.0 - fadeFromLeft) * 0.9 + (1.0 - edgeFade) * 0.2) * uIntensity;
    
    gl_FragColor = vec4(fogColor, alpha);
  }
`

// 灰尘粒子着色器
const dustVertexShader = `
  attribute float aSize;
  attribute float aOpacity;
  
  varying float vOpacity;
  
  void main() {
    vOpacity = aOpacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const dustFragmentShader = `
  varying float vOpacity;
  
  void main() {
    // 圆形粒子
    vec2 coords = gl_PointCoord - 0.5;
    if (length(coords) > 0.5) discard;
    
    // 白色粒子，高可见度
    gl_FragColor = vec4(1.0, 1.0, 1.0, vOpacity);
  }
`

export function MapEffect() {
  const mapRef = useRef()
  const vignetteRef = useRef()
  const particlesRef = useRef()
  const mapMaterialRef = useRef()
  const vignetteMaterialRef = useRef()
  const mapTextureRef = useRef()
  
  const mapTexture = useTexture('/map.png')
  mapTextureRef.current = mapTexture
  
  const { camera } = useThree()

  // 初始化粒子系统
  useEffect(() => {
    if (!particlesRef.current) return
    
    const count = 5000  // 增加数量但减小单个大小
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const opacities = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      // 粒子在地图附近分布（地图是16x9，在z=0）
      positions[i * 3] = (Math.random() - 0.5) * 20      // -10 到 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12  // -6 到 6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 + 0.5  // -3.5 到 4.5（稍微靠前）
      
      sizes[i] = Math.random() * 2.0 + 1.0    // 更大粒子，1.0-3.0
      opacities[i] = Math.random() * 0.6 + 0.4
    }
    
    const geometry = particlesRef.current.geometry
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1))
    
    // 保存初始位置用于下雪动画
    particlesRef.current.userData.initialPositions = new Float32Array(positions)
  }, [])

  // 开场动画 - 白色渐变出现地图
  useGSAP(() => {
    if (vignetteMaterialRef.current) {
      gsap.timeline()
        .to(vignetteMaterialRef.current.uniforms.uIntensity, {
          value: 0.0,
          duration: 2
        }, 0)
    }
  })

  // ScrollTrigger 控制vignette覆盖地图
  useGSAP(() => {
    setTimeout(() => {
      if (!vignetteMaterialRef.current) return
      
      gsap.fromTo(
        vignetteMaterialRef.current.uniforms.uIntensity,
        { value: 0.0 },
        {
          value: 1.0,
          scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            onUpdate: (self) => {
              if (vignetteMaterialRef.current) {
                vignetteMaterialRef.current.uniforms.uIntensity.value = self.progress
              }
            }
          }
        }
      )
    }, 100)
  })

  // 粒子漂浮动画 - 下雪效果
  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.getElapsedTime()
      const positions = particlesRef.current.geometry.attributes.position.array
      const initialPositions = particlesRef.current.userData.initialPositions
      
      // 如果没有保存初始位置，先保存一份
      if (!initialPositions) {
        particlesRef.current.userData.initialPositions = new Float32Array(positions)
      }
      
      for (let i = 0; i < positions.length; i += 3) {
        const idx = i / 3
        const baseY = particlesRef.current.userData.initialPositions[i + 1]
        
        // 垂直下落 - 缓慢向下飘
        const fallSpeed = 0.02
        positions[i + 1] = baseY - (time * fallSpeed) % 20 + 10
        
        // 水平摇晃 - 自然的左右摇摆
        const swayX = Math.sin(time * 0.3 + idx * 0.5) * 0.03
        const swayZ = Math.cos(time * 0.25 + idx * 0.3) * 0.02
        
        positions[i] += swayX
        positions[i + 2] += swayZ
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }

    // 地图跟随鼠标（但vignette不跟）- 限制移动范围防止越界
    if (mapRef.current) {
      const { x, y } = state.pointer
      const targetX = x * 1.5
      const targetY = y * 1.5
      
      // 限制移动范围，防止图片边界漏出
      const maxOffsetX = 3
      const maxOffsetY = 2
      mapRef.current.position.x += Math.max(-maxOffsetX, Math.min(maxOffsetX, targetX - mapRef.current.position.x)) * 0.06
      mapRef.current.position.y += Math.max(-maxOffsetY, Math.min(maxOffsetY, targetY - mapRef.current.position.y)) * 0.06
      
      // 更新着色器中的鼠标位置
      if (mapMaterialRef.current) {
        mapMaterialRef.current.uniforms.mousePos.value.set(
          mapRef.current.position.x * 0.15,
          mapRef.current.position.y * 0.15
        )
      }
    }
  })

  return (
    <group>
      {/* 地图层 - 不规则消散 */}
      <mesh ref={mapRef} position={[0, 0, 2]}>
        <planeGeometry args={[16, 9]} />
        <shaderMaterial
          ref={mapMaterialRef}
          vertexShader={mapVertexShader}
          fragmentShader={mapFragmentShader}
          transparent={true}
          uniforms={{
            uTexture: { value: mapTexture },
            uProgress: { value: 0.0 },
            uOpacity: { value: 1.0 },
            mousePos: { value: new THREE.Vector2(0, 0) }
          }}
        />
      </mesh>

      {/* Vignette 图层 - 圆形淡化 + 雾（固定在屏幕上，不跟随地图） */}
      <mesh ref={vignetteRef} position={[0, 0, 3]}>
        <planeGeometry args={[16, 9]} />
        <shaderMaterial
          ref={vignetteMaterialRef}
          vertexShader={vignetteVertexShader}
          fragmentShader={vignetteFragmentShader}
          transparent={true}
          uniforms={{
            uIntensity: { value: 1.0 }
          }}
        />
      </mesh>

      {/* 灰尘粒子系统 - 在地图上面 */}
      <points ref={particlesRef} position={[0, 0, 2.5]}>
        <bufferGeometry />
        <shaderMaterial
          vertexShader={dustVertexShader}
          fragmentShader={dustFragmentShader}
          transparent={true}
          depthWrite={false}
        />
      </points>
    </group>
  )
}
