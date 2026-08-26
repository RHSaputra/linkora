"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
import {
  ONBOARDING_STEPS,
  OnboardingStatus,
  shouldShowOnboarding,
  getNextStep,
  getPrevStep,
  getFirstValidStep,
  countAvailableSteps,
  getStepPosition,
} from "@/lib/onboarding-state";

type TourPhase = "idle" | "welcome" | "touring" | "skip-confirm" | "complete";

interface OnboardingContextType {
  // State
  phase: TourPhase;
  currentStepIndex: number;
  totalAvailableSteps: number;
  currentStepPosition: number; // 1-indexed position among available steps
  isLoading: boolean;

  // Current step data
  currentStep: (typeof ONBOARDING_STEPS)[number] | null;

  // Actions
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  requestSkip: () => void;
  cancelSkip: () => void;
  confirmSkip: () => void;
  completeTour: () => void;
  restartTour: () => void;
  dismissWelcome: () => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  phase: "idle",
  currentStepIndex: 0,
  totalAvailableSteps: 0,
  currentStepPosition: 0,
  isLoading: true,
  currentStep: null,
  startTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  requestSkip: () => {},
  cancelSkip: () => {},
  confirmSkip: () => {},
  completeTour: () => {},
  restartTour: () => {},
  dismissWelcome: () => {},
});

export function useOnboarding() {
  return useContext(OnboardingContext);
}

function getAvailableTargets(): Set<string> {
  const targets = new Set<string>();
  if (typeof document === "undefined") return targets;
  document.querySelectorAll("[data-tour]").forEach((el) => {
    const val = el.getAttribute("data-tour");
    if (val) targets.add(val);
  });
  return targets;
}

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const [phase, setPhase] = useState<TourPhase>("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTargets, setAvailableTargets] = useState<Set<string>>(
    new Set()
  );
  const isManualRestart = useRef(false);
  const fetchedRef = useRef(false);

  // Scan available targets after render
  const scanTargets = useCallback(() => {
    const targets = getAvailableTargets();
    setAvailableTargets(targets);
    return targets;
  }, []);

  // Re-scan targets when DOM changes (MutationObserver)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial scan after a short delay to let sidebar render
    const timer = setTimeout(() => scanTargets(), 500);

    const observer = new MutationObserver(() => {
      scanTargets();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-tour"],
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [scanTargets]);

  // Fetch onboarding status from server
  useEffect(() => {
    if (sessionStatus !== "authenticated" || !session?.user || fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/onboarding");
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        const data: OnboardingStatus = await res.json();

        if (shouldShowOnboarding(data)) {
          // Check if user was mid-tour (has a saved step > 0)
          if (data.step > 0 && !data.completed) {
            setCurrentStepIndex(data.step);
            setPhase("touring");
          } else {
            setPhase("welcome");
          }
        }
        // else: completed, stay idle
      } catch (error) {
        console.error("Failed to fetch onboarding status:", error);
        // Fail gracefully — no onboarding, app works fine
      } finally {
        setIsLoading(false);
      }
    };

    // Wait for page to be ready before checking
    const timer = setTimeout(fetchStatus, 800);
    return () => clearTimeout(timer);
  }, [sessionStatus, session]);

  // Persist step changes to server (debounced)
  const persistStep = useCallback(async (step: number) => {
    try {
      await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step }),
      });
    } catch {
      // Silent fail — local state is source of truth during tour
    }
  }, []);

  const persistComplete = useCallback(async () => {
    try {
      await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
    } catch {
      // Retry once
      setTimeout(async () => {
        try {
          await fetch("/api/onboarding", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: true }),
          });
        } catch {}
      }, 2000);
    }
  }, []);

  const persistDismiss = useCallback(async () => {
    try {
      await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dismissed: true }),
      });
    } catch {
      setTimeout(async () => {
        try {
          await fetch("/api/onboarding", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dismissed: true }),
          });
        } catch {}
      }, 2000);
    }
  }, []);

  // Actions
  const startTour = useCallback(() => {
    const targets = scanTargets();
    const first = getFirstValidStep(targets);
    if (first === -1) {
      setPhase("idle");
      return;
    }
    setCurrentStepIndex(first);
    setPhase("touring");
    persistStep(first);
  }, [scanTargets, persistStep]);

  const nextStep = useCallback(() => {
    const targets = scanTargets();
    const next = getNextStep(currentStepIndex, targets);
    if (next === -1) {
      // Last step — complete
      setPhase("complete");
      persistComplete();
    } else {
      setCurrentStepIndex(next);
      persistStep(next);
    }
  }, [currentStepIndex, scanTargets, persistStep, persistComplete]);

  const prevStep = useCallback(() => {
    const targets = scanTargets();
    const prev = getPrevStep(currentStepIndex, targets);
    if (prev !== -1) {
      setCurrentStepIndex(prev);
      persistStep(prev);
    }
  }, [currentStepIndex, scanTargets, persistStep]);

  const requestSkip = useCallback(() => {
    setPhase("skip-confirm");
  }, []);

  const cancelSkip = useCallback(() => {
    setPhase("touring");
  }, []);

  const confirmSkip = useCallback(() => {
    setPhase("idle");
    if (!isManualRestart.current) {
      persistDismiss();
    }
    isManualRestart.current = false;
  }, [persistDismiss]);

  const completeTour = useCallback(() => {
    setPhase("idle");
    if (!isManualRestart.current) {
      persistComplete();
    }
    isManualRestart.current = false;
  }, [persistComplete]);

  const restartTour = useCallback(() => {
    isManualRestart.current = true;
    setCurrentStepIndex(0);
    setPhase("welcome");
  }, []);

  const dismissWelcome = useCallback(() => {
    setPhase("idle");
    if (!isManualRestart.current) {
      persistDismiss();
    }
    isManualRestart.current = false;
  }, [persistDismiss]);

  // Listen for restart event from Command Center
  useEffect(() => {
    const handleRestart = () => restartTour();
    window.addEventListener("restart-onboarding-tour", handleRestart);
    return () =>
      window.removeEventListener("restart-onboarding-tour", handleRestart);
  }, [restartTour]);

  const targets = availableTargets;
  const totalAvailableSteps = countAvailableSteps(targets);
  const currentStepPosition = getStepPosition(currentStepIndex, targets);
  const currentStep =
    phase === "touring" && currentStepIndex < ONBOARDING_STEPS.length
      ? ONBOARDING_STEPS[currentStepIndex]
      : null;

  return (
    <OnboardingContext.Provider
      value={{
        phase,
        currentStepIndex,
        totalAvailableSteps,
        currentStepPosition,
        isLoading,
        currentStep,
        startTour,
        nextStep,
        prevStep,
        requestSkip,
        cancelSkip,
        confirmSkip,
        completeTour,
        restartTour,
        dismissWelcome,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
