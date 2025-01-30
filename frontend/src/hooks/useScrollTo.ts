import {
  type Dispatch,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

export const useScrollTo = <T extends Element>(): [
  RefObject<T | null>,
  Dispatch<boolean>,
] => {
  const ref = useRef<T>(null);
  const [shouldScrollTo, setShouldScrollTo] = useState(false);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (shouldScrollTo && !isVisible(rect)) {
        ref.current.scrollIntoView({ behavior: "smooth" });
        setShouldScrollTo(false);
      }
    }
  }, [shouldScrollTo]);

  return [ref, setShouldScrollTo];
};

function isVisible(rect: DOMRect) {
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight ||
        document.documentElement.clientHeight) /* or $(window).height() */ &&
    rect.right <=
      (window.innerWidth ||
        document.documentElement.clientWidth) /* or $(window).width() */
  );
}
