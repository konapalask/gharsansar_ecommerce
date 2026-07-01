import { useEffect } from "react";

/**
 * useScrollReveal — lightweight IntersectionObserver hook.
 * Adds `.visible` to elements with .reveal / .reveal-left / .reveal-right / .reveal-scale
 * Runs once on mount and re-runs whenever `deps` change.
 */
export function useScrollReveal(deps: unknown[] = []) {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
            observer.unobserve(entry.target); // fire once only
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
