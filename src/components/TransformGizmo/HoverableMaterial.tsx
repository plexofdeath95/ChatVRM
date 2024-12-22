import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

type HoverableMaterialProps = {
  color?: THREE.ColorRepresentation;
  map?: THREE.Texture | null;
  hovered?: boolean;
  borderColor?: string;
  borderWidth?: number;
  children?: React.ReactNode;
};

export function HoverableMaterial({ 
  color = "#ffffff", 
  map = null, 
  hovered = false,
  borderColor = "#00ff00",
  borderWidth = 0.02,
  children 
}: HoverableMaterialProps) {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (materialRef.current?.userData?.shader) {
      materialRef.current.userData.shader.uniforms.hovered.value = hovered ? 1 : 0;
    }
  });

  return (
    <meshBasicMaterial 
      ref={materialRef}
      map={map} 
      color={map ? undefined : color}
    >
      <primitive 
        attach="onBeforeCompile" 
        object={(shader: { uniforms: any; fragmentShader: string; vertexShader: string }) => {
          shader.uniforms.hovered = { value: 0 };
          shader.uniforms.borderColor = { 
            value: new THREE.Color(borderColor) 
          };
          shader.uniforms.borderWidth = { value: borderWidth };

          if (materialRef.current) {
            materialRef.current.userData.shader = shader;
          }

          // Add varying to vertex shader
          shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `#include <common>
            varying vec2 vUv;`
          );

          // Update vertex shader main function to pass UV
          shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
            vUv = uv;`
          );

          // Add varying and uniforms to fragment shader
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `#include <common>
            uniform float hovered;
            uniform vec3 borderColor;
            uniform float borderWidth;
            varying vec2 vUv;`
          );

          shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            `void main() {
              if (hovered > 0.5 && (
                vUv.x < borderWidth || vUv.x > 1.0 - borderWidth ||
                vUv.y < borderWidth || vUv.y > 1.0 - borderWidth
              )) {
                gl_FragColor = vec4(borderColor, 1.0);
                return;
              }
            `
          );
        }} 
      />
      {children}
    </meshBasicMaterial>
  );
} 