import { useScreenshotStore } from "@/stores/screenshotStore";

export function DebugScreenshot() {
  const lastScreenshot = useScreenshotStore((state) => state.lastScreenshot);

  if (!lastScreenshot) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-2 rounded-lg shadow-lg">
      <p className="text-sm mb-2">Debug: Last Screenshot</p>
      <img 
        src={lastScreenshot} 
        alt="Debug Screenshot" 
        className="max-w-[200px] max-h-[200px] object-contain"
      />
    </div>
  );
} 