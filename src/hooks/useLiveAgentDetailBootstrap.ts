import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * On agent detail mount: show browse "Run Now" results from navigation state,
 * otherwise run the agent once automatically so the page always shows output.
 */
export function useLiveAgentDetailBootstrap<T>(options: {
  run: () => Promise<T>;
  apply: (payload: T) => void;
  enabled?: boolean;
}): void {
  const location = useLocation();
  const navigate = useNavigate();
  const bootstrapped = useRef(false);
  const runRef = useRef(options.run);
  const applyRef = useRef(options.apply);
  runRef.current = options.run;
  applyRef.current = options.apply;
  const enabled = options.enabled ?? true;

  useEffect(() => {
    if (!enabled || bootstrapped.current) return;
    bootstrapped.current = true;

    const incoming = (location.state as { agentRunResult?: T } | null)?.agentRunResult;
    if (incoming) {
      applyRef.current(incoming);
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    void runRef
      .current()
      .then(applyRef.current)
      .catch(() => {
        // Hooks resolve with client fallbacks — errors should not surface here.
      });
  }, [enabled, location.pathname, location.state, navigate]);
}
