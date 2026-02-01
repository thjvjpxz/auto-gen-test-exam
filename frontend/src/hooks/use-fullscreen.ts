import { useState, useEffect, useCallback } from "react";

interface FullscreenResult {
  isFullscreen: boolean;
  isSupported: boolean;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => void;
}

/**
 * Fullscreen management hook with exit detection.
 * @param onExit - Optional callback when user exits fullscreen.
 */
export function useFullscreen(onExit?: () => void): FullscreenResult {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(!!document.documentElement.requestFullscreen);
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch {
      console.warn("Fullscreen not supported or denied");
      setIsSupported(false);
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

      if (!isNowFullscreen && onExit) {
        onExit();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [onExit]);

  return { isFullscreen, isSupported, enterFullscreen, exitFullscreen };
}
