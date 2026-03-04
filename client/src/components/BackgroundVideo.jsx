import { useEffect, useRef } from "react";

export default function BackgroundVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("has-bg-video");

    const onVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.body.classList.remove("has-bg-video");
    };
  }, []);

  return (
    <div id="bg-video-container" aria-hidden="true">
      <video
        ref={videoRef}
        className="bg-video"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
      >
        <source src="/videos/3094026-uhd_3840_2160_30fps.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
