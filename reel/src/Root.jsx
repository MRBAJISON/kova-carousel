import { Composition } from "remotion";
import { SalonReel } from "./SalonReel";
import { WhatsAppGhana } from "./WhatsAppGhana";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="SalonReel"
        component={SalonReel}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="WhatsAppGhana"
        component={WhatsAppGhana}
        durationInFrames={100}
        fps={25}
        width={720}
        height={1280}
      />
    </>
  );
};
