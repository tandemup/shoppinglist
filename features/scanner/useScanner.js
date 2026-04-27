function useScanner() {
  const handledRef = useRef(false);

  function normalize(code) { ... }

  function process(data) {
    if (handledRef.current) return;
    ...
  }

  return { process }
}