import { useCallback, useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { ThreeElements } from "@react-three/fiber";
import OpenAI from "openai";
import { useImageInteractionStore } from "@/stores/imageInteractionStore";
import { HoverableMaterial } from "./TransformGizmo/HoverableMaterial";
import { useSettings } from "@/stores/settingsStore";

export default function ImageFrame({
  position,
  rotation = [0, 0, 0],
  scale = [1.6, 1, 0.1],
  defaultImage = "/images/brot_poster.png",
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  defaultImage?: string;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [hovered, setHovered] = useState(false);
  const setDescription = useImageInteractionStore((state) => state.setDescription);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settings = useSettings();

  useEffect(() => {
    if (!texture) {
      const loader = new THREE.TextureLoader();
      loader.load(defaultImage, (newTexture) => {
        const imageAspect = newTexture.image.width / newTexture.image.height;
        const baseWidth = scale[0];
        const baseHeight = scale[1];
        
        if (imageAspect > baseWidth / baseHeight) {
          newTexture.userData = { width: baseWidth, height: baseWidth / imageAspect };
        } else {
          newTexture.userData = { width: baseHeight * imageAspect, height: baseHeight };
        }
        
        setTexture(newTexture);
      });
    }
  }, [defaultImage, scale, texture]);

  const analyzeImage = async (file: File) => {
    try {
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const openai = new OpenAI({
        apiKey: settings.openAiApiKey,
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

      const description = response.choices[0].message.content || "";
      console.log("GPT Vision Analysis:", description);
      setDescription(description);
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
      <mesh 
        position={scale} 
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[
          texture?.userData?.width || scale[0],
          texture?.userData?.height || scale[1]
        ]} />
        <HoverableMaterial 
          map={texture}
          hovered={hovered}
          borderColor="#00ff00"
          borderWidth={0.02}
        />
      </mesh>
    </group>
  );
}
