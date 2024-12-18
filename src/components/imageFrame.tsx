import { useCallback, useState } from "react";
import * as THREE from "three";
import { ThreeElements } from "@react-three/fiber";

export default function ImageFrame({
  position,
  rotation = [0, 0, 0],
  scale = [1.6, 1, 0.1],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  const handleClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        const loader = new THREE.TextureLoader();
        loader.load(url, (newTexture) => {
          setTexture(newTexture);
          URL.revokeObjectURL(url);
        });
      }
    };
    input.click();
  }, []);

  return (
    <group position={position} rotation={rotation}>
      <mesh position={scale} onClick={handleClick}>
        <planeGeometry args={[scale[0], scale[1]]} />
        <meshBasicMaterial map={texture} color={texture ? undefined : "#ffffff"} />
      </mesh>
    </group>
  );
}
