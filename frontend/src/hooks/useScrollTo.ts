import {
  type Dispatch,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

export const useScrollTo = <T extends Element>(): [
  RefObject<T>,
  Dispatch<boolean>,
] => {
  const ref = useRef<T>(null);
  const [shouldScrollTo, setShouldScrollTo] = useState(false);

  useEffect(() => {
    if (ref.current && shouldScrollTo) {
      ref.current.scrollIntoView({ behavior: "smooth" });
      setShouldScrollTo(false);
    }
  }, [shouldScrollTo]);

  return [ref, setShouldScrollTo];
};
