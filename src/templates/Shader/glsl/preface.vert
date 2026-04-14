varying vec3 vWorldDirection;

void main() {
    vWorldDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
