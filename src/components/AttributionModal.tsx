declare global {
  interface Window {
    openAttributionModal: () => void;
  }
}

import { useEffect, useState } from "react";
import { Link } from "./link";
import { IconButton } from "./iconButton";

interface Contributor {
  name: string;
  url: string;
  description: string;
}

const CONTRIBUTORS: Contributor[] = [
  {
    name: "ALIAS",
    url: "https://alias.cm/",
    description: "The team behind BlockRot & AliasApp"
  },
  {
    name: "Vectris",
    url: "https://vectr.is/",
    description: "Artist | Developer | Fren of ALIAS"
  },
  {
    name: "Exitsimulation",
    url: "https://x.com/exitsimulation",
    description: "Artist | Developer | ALIAS member"
  },
  {
    name: "Pixiv",
    url: "https://github.com/pixiv/ChatVRM",
    description: "Original ChatVRM project and VRM implementation"
  },
  {
    name: "Spark Games",
    url: "https://spark-games.co.uk/",
    description: "3D room model under Creative Commons Attribution (CC-BY) license"
  }
];

export function AttributionModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenAttribution = localStorage.getItem("hasSeenAttribution");
    if (!hasSeenAttribution) {
      setIsOpen(true);
      localStorage.setItem("hasSeenAttribution", "true");
    }
  }, []);

  const openModal = () => setIsOpen(true);

  useEffect(() => {
    window.openAttributionModal = openModal;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="absolute z-40 w-full h-full bg-white/80 backdrop-blur">
      <div className="absolute m-24">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={() => setIsOpen(false)}
        />
      </div>
      <div className="max-h-full overflow-auto">
        <div className="text-text1 max-w-3xl mx-auto px-24 py-64">
          <div className="space-y-40">
            {/* Getting Started Section */}
            <div>
              <div className="my-24 typography-32 font-bold">Getting Started</div>
              <div className="grid grid-cols-2 gap-16">
                <div className="p-16 bg-surface1 rounded-8">
                  <h3 className="typography-20 font-bold text-secondary">Custom Character</h3>
                  <p className="mt-4 text-text1">Drop any VRM file into the browser window to use your own character model.</p>
                </div>
                <div className="p-16 bg-surface1 rounded-8">
                  <h3 className="typography-20 font-bold text-secondary">Customize Experience</h3>
                  <p className="mt-4 text-text1">Visit the settings menu to adjust:</p>
                  <ul className="mt-4 space-y-2 text-text1">
                    <li>• Character personality</li>
                    <li>• Voice settings</li>
                    <li>• System prompts</li>
                    <li>• Chat history</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Original Attribution Section */}
            <div>
              <div className="my-24 typography-32 font-bold">Brought to you by</div>
              <div className="space-y-8">
                {CONTRIBUTORS.map((contributor) => (
                  <div key={contributor.name} className="p-16 bg-surface1 rounded-8">
                    <h3 className="typography-20 font-bold text-secondary">
                      <Link url={contributor.url} label={contributor.name} />
                    </h3>
                    <p className="mt-4 text-text1">{contributor.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 