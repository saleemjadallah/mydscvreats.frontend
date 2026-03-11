"use client";

import { useEffect } from "react";

function getDocumentHeight() {
  const body = document.body;
  const root = document.documentElement;

  return Math.max(
    body?.scrollHeight ?? 0,
    body?.offsetHeight ?? 0,
    root.scrollHeight,
    root.offsetHeight
  );
}

export function EmbedHeightReporter() {
  useEffect(() => {
    if (window.parent === window) {
      return;
    }

    let frameId = 0;
    let lastHeight = 0;

    function postHeight() {
      frameId = 0;
      const nextHeight = getDocumentHeight();

      if (!nextHeight || nextHeight === lastHeight) {
        return;
      }

      lastHeight = nextHeight;
      window.parent.postMessage(
        {
          type: "mydscvr-eats:resize",
          height: nextHeight,
        },
        "*"
      );
    }

    function schedulePost() {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(postHeight);
    }

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            schedulePost();
          });

    resizeObserver?.observe(document.documentElement);

    if (document.body) {
      resizeObserver?.observe(document.body);
    }

    const images = Array.from(document.querySelectorAll("img"));
    const imageHandlers = images.map((image) => {
      const handler = () => schedulePost();
      image.addEventListener("load", handler);
      image.addEventListener("error", handler);
      return { image, handler };
    });

    window.addEventListener("load", schedulePost);
    window.addEventListener("resize", schedulePost);

    schedulePost();
    const delayedPost = window.setTimeout(schedulePost, 250);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      window.clearTimeout(delayedPost);
      window.removeEventListener("load", schedulePost);
      window.removeEventListener("resize", schedulePost);
      resizeObserver?.disconnect();

      imageHandlers.forEach(({ image, handler }) => {
        image.removeEventListener("load", handler);
        image.removeEventListener("error", handler);
      });
    };
  }, []);

  return null;
}
