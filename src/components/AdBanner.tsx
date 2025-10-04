// src/components/AdBanner.tsx
import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdBanner = ({ isVisible = true }: { isVisible: boolean }) => {
  useEffect(() => {
    try {
      if (!window.adsbygoogle) {
        window.adsbygoogle = [];
      }

      window.adsbygoogle.push({});
    } catch (e) {
      console.error("Adsense error", e);
    }
  }, []);
  if (!isVisible) return null;
  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50">
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          maxWidth: "728px",
          maxHeight: "90px",
        }}
        data-ad-client="ca-pub-4125611853366209"
        data-ad-slot="1234567890" // replace with your AdSense slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner;
