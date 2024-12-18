import { useCallback, useState } from "react";
import * as THREE from "three";
import { ThreeElements } from "@react-three/fiber";
import OpenAI from "openai";

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

  const analyzeImage = async (file: File) => {
    try {
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "What's in this image?" },
              { type: "image_url", image_url: { url: base64Image } },
            ],
          },
        ],
        max_tokens: 300,
      });

      console.log("GPT Vision Analysis:", response.choices[0].message.content);
    } catch (error) {
      console.error("Error analyzing image:", error);
    }
  };

  const handleClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        const loader = new THREE.TextureLoader();
        loader.load(url, (newTexture) => {
          const imageAspect = newTexture.image.width / newTexture.image.height;
          const baseWidth = scale[0];
          const baseHeight = scale[1];
          
          if (imageAspect > baseWidth / baseHeight) {
            newTexture.userData = { width: baseWidth, height: baseWidth / imageAspect };
          } else {
            newTexture.userData = { width: baseHeight * imageAspect, height: baseHeight };
          }
          
          setTexture(newTexture);
          URL.revokeObjectURL(url);
        });
        await analyzeImage(file);
      }
    };
    input.click();
  }, [scale]);

  return (
    <group position={position} rotation={rotation}>
      <mesh position={scale} onClick={handleClick}>
        <planeGeometry args={[
          texture?.userData?.width || scale[0],
          texture?.userData?.height || scale[1]
        ]} />
        <meshBasicMaterial map={texture} color={texture ? undefined : "#ffffff"} />
      </mesh>
    </group>
  );
}
