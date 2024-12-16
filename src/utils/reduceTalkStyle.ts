/* Voice tone adapted to the limitations of koeiromap Free v1 */
type ReducedTalkStyle = "talk" | "happy" | "sad";

/**
 * Restrict voice tone parameters for koeiromap Free v1
 */
export const reduceTalkStyle = (talkStyle: string): ReducedTalkStyle => {
  if (talkStyle == "talk" || talkStyle == "happy" || talkStyle == "sad") {
    return talkStyle;
  }

  return "talk";
};
