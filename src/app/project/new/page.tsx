"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Requirements, MatchResponse, SelectionState, ChatMessage, EnvironmentSelectionState, EnvironmentType } from "@/lib/types";
import { sendChatMessage } from "@/lib/api";
import { matchProducts } from "@/lib/api";
import { isMultiEnvironmentRequest, filterCategoriesByEnvironment } from "@/lib/environmentDetector";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import ChatWindow from "@/components/chat/ChatWindow";
import CombinedProductPreview from "@/components/products/CombinedProductPreview";
import ContactSalesButton from "@/components/ContactSalesButton";
import SessionRestoreDialog from "@/components/SessionRestoreDialog";
import Navbar from "@/components/layout/Navbar";
import {
  saveSession,
  loadSession,
  clearSession,
  getSessionAge,
  hasValidSession,
  SessionData,
} from "@/lib/sessionStorage";

type Step = "chat" | "products";

// Dynamic loading messages
const LOADING_MESSAGES = [
  { text: "Analyzing your requirements", icon: "🔍", duration: 2000 },
  { text: "Scanning 100+ map products", icon: "📦", duration: 2500 },
  { text: "Matching features to products", icon: "🎯", duration: 2500 },
  { text: "Calculating coverage scores", icon: "📊", duration: 2000 },
  { text: "Comparing vendor options", icon: "⚖️", duration: 2500 },
  { text: "Optimizing recommendations", icon: "✨", duration: 2000 },
  { text: "Finalizing results", icon: "🚀", duration: 3000 },
];

function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Stop advancing when at the last message (stays at "Finalizing results")
    if (messageIndex >= LOADING_MESSAGES.length - 1) return;

    const timeout = setTimeout(() => {
      setMessageIndex((prev) => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, LOADING_MESSAGES[messageIndex].duration);

    return () => clearTimeout(timeout);
  }, [messageIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = LOADING_MESSAGES[messageIndex];

  return (
    <div className="flex items-center justify-center h-[600px]">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="w-16 h-16 border-4 border-[#e9e9e7] rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#37352f] border-t-transparent rounded-full animate-spin" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
            {currentMessage.icon}
          </div>
        </div>

        <p className="text-[#37352f] font-medium text-lg mb-2 transition-all duration-300">
          {currentMessage.text}{dots}
        </p>

        <div className="flex justify-center gap-1.5 mt-4">
          {LOADING_MESSAGES.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === messageIndex
                  ? "bg-[#37352f] scale-125"
                  : idx < messageIndex
                  ? "bg-[#787774]"
                  : "bg-[#e9e9e7]"
              }`}
            />
          ))}
        </div>

        <p className="text-[#9b9a97] text-sm mt-4">
          This may take a few minutes
        </p>
      </div>
    </div>
  );
}

// Initial greeting message constant (same as ChatWindow)
const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm Mapiker-AI, here to help you find the right map products for your project.\n\nWhat kind of service are you looking to build using maps products?\n\nExamples: Food delivery, Ride-hailing, Logistics, Fleet management, Store locator, etc.",
};

function NewProjectPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("chat");
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);
  const [selections, setSelections] = useState<SelectionState | EnvironmentSelectionState>({});
  const [isMultiEnv, setIsMultiEnv] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingInitial, setIsProcessingInitial] = useState(false);

  // Session restore state
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [sessionAge, setSessionAge] = useState<number | null>(null);
  const [pendingSession, setPendingSession] = useState<SessionData | null>(null);

  // Chat state for session persistence
  const [chatMessages, setChatMessages] = useState<ChatMessage[] | undefined>(undefined);
  const [chatRequirements, setChatRequirements] = useState<Requirements | null | undefined>(undefined);
  const [chatIsComplete, setChatIsComplete] = useState<boolean | undefined>(undefined);

  // Flag to track if initial message was processed
  const [initialProcessed, setInitialProcessed] = useState(false);

  // Flag to track if autoSave was triggered
  const [autoSaveTriggered, setAutoSaveTriggered] = useState(false);

  // Check if we need to wait for initial message processing
  const initialMessage = searchParams.get("initial");
  const autoSave = searchParams.get("autoSave") === "true";
  const shouldWaitForInitial = !!initialMessage && !initialProcessed && !showRestoreDialog;

  // Check for existing session on mount
  useEffect(() => {
    if (hasValidSession()) {
      const session = loadSession();
      const age = getSessionAge();
      if (session && age !== null) {
        // If autoSave mode, auto-restore without showing dialog
        if (autoSave) {
          setChatMessages(session.messages);
          setChatRequirements(session.requirements);
          setChatIsComplete(session.isComplete);
          setRequirements(session.requirements);

          if (session.step === "products" && session.matchResult) {
            setMatchResult(session.matchResult);
            setSelections(session.selections);
            setIsMultiEnv(session.isMultiEnvironment || false);
            setStep("products");
          }
          // Don't show dialog in autoSave mode
        } else {
          setPendingSession(session);
          setSessionAge(age);
          setShowRestoreDialog(true);
        }
      }
    }
  }, [autoSave]);

  // Auto-save project after login when autoSave=true
  // This effect is defined here but relies on handleSaveProject defined below
  // The callback is only called after the component mounts, so this is safe
  const autoSaveEffect = useCallback(() => {
    if (
      autoSave &&
      user &&
      requirements &&
      matchResult &&
      !autoSaveTriggered &&
      !isSaving
    ) {
      setAutoSaveTriggered(true);
    }
  }, [autoSave, user, requirements, matchResult, autoSaveTriggered, isSaving]);

  useEffect(() => {
    autoSaveEffect();
  }, [autoSaveEffect]);

  // Handle initial message from landing page
  useEffect(() => {
    // Only process if:
    // 1. We have an initial message
    // 2. Haven't processed it yet
    // 3. No pending session to restore
    // 4. Not currently processing
    if (
      initialMessage &&
      !initialProcessed &&
      !showRestoreDialog &&
      !pendingSession &&
      !isProcessingInitial &&
      !chatMessages // Only if chat hasn't started
    ) {
      setInitialProcessed(true);
      setIsProcessingInitial(true);

      // Pre-populate messages and auto-send
      const userMsg: ChatMessage = { role: "user", content: initialMessage };
      const initialMessages: ChatMessage[] = [INITIAL_MESSAGE, userMsg];

      // Set initial messages to show immediately
      setChatMessages(initialMessages);

      // Auto-send the message to get AI response
      (async () => {
        try {
          const response = await sendChatMessage(initialMessage, [INITIAL_MESSAGE]);

          const updatedMessages: ChatMessage[] = [
            ...initialMessages,
            { role: "assistant", content: response.reply },
          ];

          setChatMessages(updatedMessages);

          if (response.is_complete && response.extracted_requirements) {
            setChatIsComplete(true);
            setChatRequirements(response.extracted_requirements);
          }
        } catch (error) {
          console.error("Error processing initial message:", error);
          const errorMessages: ChatMessage[] = [
            ...initialMessages,
            { role: "assistant", content: "I apologize, but I encountered an error. Please try again." },
          ];
          setChatMessages(errorMessages);
        } finally {
          setIsProcessingInitial(false);
        }
      })();
    }
  }, [searchParams, initialProcessed, showRestoreDialog, pendingSession, isProcessingInitial, chatMessages]);

  const handleRestoreSession = useCallback(() => {
    if (pendingSession) {
      setChatMessages(pendingSession.messages);
      setChatRequirements(pendingSession.requirements);
      setChatIsComplete(pendingSession.isComplete);
      setRequirements(pendingSession.requirements);

      if (pendingSession.step === "products" && pendingSession.matchResult) {
        setMatchResult(pendingSession.matchResult);
        setSelections(pendingSession.selections);
        setIsMultiEnv(pendingSession.isMultiEnvironment || false);
        setStep("products");
      }
    }
    setShowRestoreDialog(false);
    setPendingSession(null);
  }, [pendingSession]);

  const handleStartNew = useCallback(() => {
    clearSession();
    setShowRestoreDialog(false);
    setPendingSession(null);
  }, []);

  const handleChatStateChange = useCallback(
    (state: { messages: ChatMessage[]; requirements: Requirements | null; isComplete: boolean }) => {
      setChatMessages(state.messages);
      setChatRequirements(state.requirements);
      setChatIsComplete(state.isComplete);

      saveSession({
        messages: state.messages,
        requirements: state.requirements,
        isComplete: state.isComplete,
        step,
        matchResult,
        selections,
        isMultiEnvironment: isMultiEnv,
      });
    },
    [step, matchResult, selections, isMultiEnv]
  );

  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      saveSession({
        messages: chatMessages,
        requirements: chatRequirements || null,
        isComplete: chatIsComplete || false,
        step,
        matchResult,
        selections,
        isMultiEnvironment: isMultiEnv,
      });
    }
  }, [step, matchResult, selections, chatMessages, chatRequirements, chatIsComplete, isMultiEnv]);

  const handleChatComplete = async (reqs: Requirements) => {
    setRequirements(reqs);
    setIsLoading(true);

    try {
      const result = await matchProducts(reqs);
      setMatchResult(result);

      const multiEnvMode = isMultiEnvironmentRequest(reqs.application);
      setIsMultiEnv(multiEnvMode);

      if (multiEnvMode) {
        const mobileCategories = filterCategoriesByEnvironment(result.categories, 'mobile');
        const backendCategories = filterCategoriesByEnvironment(result.categories, 'backend');

        const mobileSelections: SelectionState = {};
        mobileCategories.forEach((cat) => {
          mobileSelections[cat.id] = null;
        });

        const backendSelections: SelectionState = {};
        backendCategories.forEach((cat) => {
          backendSelections[cat.id] = null;
        });

        setSelections({
          mobile: mobileSelections,
          backend: backendSelections,
        });
      } else {
        const initialSelections: SelectionState = {};
        result.categories.forEach((cat) => {
          initialSelections[cat.id] = null;
        });
        setSelections(initialSelections);
      }

      setStep("products");
    } catch (error) {
      console.error("Failed to match products:", error);
      alert("Failed to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gets the array of selected product IDs for a category from SelectionState.
   */
  const getSelectedProductIds = (state: SelectionState, categoryId: string): string[] => {
    const value = state[categoryId];
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  };

  const handleSelectionChange = (categoryId: string, productId: string, isSelected: boolean, environment?: EnvironmentType) => {
    if (isMultiEnv && environment) {
      setSelections((prev) => {
        const envSelections = prev as EnvironmentSelectionState;
        const currentEnvState = envSelections[environment] || {};
        const currentIds = getSelectedProductIds(currentEnvState, categoryId);

        let newIds: string[];
        if (isSelected) {
          newIds = currentIds.includes(productId) ? currentIds : [...currentIds, productId];
        } else {
          newIds = currentIds.filter(id => id !== productId);
        }

        return {
          ...envSelections,
          [environment]: {
            ...currentEnvState,
            [categoryId]: newIds.length > 0 ? newIds : null,
          },
        };
      });
    } else {
      setSelections((prev) => {
        const currentState = prev as SelectionState;
        const currentIds = getSelectedProductIds(currentState, categoryId);

        let newIds: string[];
        if (isSelected) {
          newIds = currentIds.includes(productId) ? currentIds : [...currentIds, productId];
        } else {
          newIds = currentIds.filter(id => id !== productId);
        }

        return {
          ...currentState,
          [categoryId]: newIds.length > 0 ? newIds : null,
        };
      });
    }
  };

  const handleBack = () => {
    setStep("chat");
  };

  const handleResetSelections = () => {
    if (isMultiEnv && matchResult) {
      const mobileCategories = filterCategoriesByEnvironment(matchResult.categories, 'mobile');
      const backendCategories = filterCategoriesByEnvironment(matchResult.categories, 'backend');

      const mobileSelections: SelectionState = {};
      mobileCategories.forEach((cat) => {
        mobileSelections[cat.id] = null;
      });

      const backendSelections: SelectionState = {};
      backendCategories.forEach((cat) => {
        backendSelections[cat.id] = null;
      });

      setSelections({
        mobile: mobileSelections,
        backend: backendSelections,
      });
    } else if (matchResult) {
      const initialSelections: SelectionState = {};
      matchResult.categories.forEach((cat) => {
        initialSelections[cat.id] = null;
      });
      setSelections(initialSelections);
    }
  };

  // Save project to Supabase
  const handleSaveProject = useCallback(async () => {
    if (!user || !requirements || !matchResult) return;

    setIsSaving(true);
    try {
      const projectName = `${requirements.use_case} Project`;

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectName,
          use_case: requirements.use_case,
          use_case_description: requirements.use_case_description,
          required_features: requirements.required_features,
          application: Array.isArray(requirements.application)
            ? requirements.application
            : [requirements.application],
          region: requirements.region,
          additional_notes: requirements.additional_notes,
          selected_products: selections,
          match_result: matchResult,
          is_multi_environment: isMultiEnv,
          current_stage: 2,
          status: 'in_progress',
        })
        .select()
        .single();

      if (error) throw error;

      // Clear local session after saving
      clearSession();

      // Navigate to the project's pricing page
      router.push(`/project/${data.id}/pricing`);
    } catch (error) {
      console.error("Failed to save project:", error);
      alert("Failed to save project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [user, requirements, matchResult, selections, isMultiEnv, supabase, router]);

  // Trigger save when autoSaveTriggered becomes true
  useEffect(() => {
    if (autoSaveTriggered && !isSaving) {
      handleSaveProject();
    }
  }, [autoSaveTriggered, isSaving, handleSaveProject]);

  return (
    <div className="min-h-screen bg-[#fbfbfa]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <div
            className={`flex items-center gap-2 ${
              step === "chat" ? "text-[#37352f]" : "text-[#9b9a97]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "chat" ? "bg-[#37352f] text-white" : "bg-[#0f7b6c] text-white"
              }`}
            >
              {step === "products" ? "✓" : "1"}
            </div>
            <span className="text-sm font-medium">Requirements</span>
          </div>

          <div className="w-8 h-px bg-[#e9e9e7]" />

          <div
            className={`flex items-center gap-2 ${
              step === "products" ? "text-[#37352f]" : "text-[#9b9a97]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "products" ? "bg-[#37352f] text-white" : "bg-[#e9e9e7] text-[#787774]"
              }`}
            >
              2
            </div>
            <span className="text-sm font-medium">Products & Preview</span>
          </div>
        </div>

        {isLoading || (autoSaveTriggered && isSaving) ? (
          <LoadingScreen />
        ) : (
          <>
            {step === "chat" && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg border border-[#e9e9e7] h-[600px] overflow-hidden">
                  {(shouldWaitForInitial || isProcessingInitial) ? (
                    // Show loading while processing initial message from landing page
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="relative w-12 h-12 mb-4">
                        <div className="w-12 h-12 border-4 border-[#e9e9e7] rounded-full" />
                        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#37352f] border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-[#37352f] font-medium">Processing your request...</p>
                      <p className="text-[#787774] text-sm mt-1">Setting up your conversation</p>
                    </div>
                  ) : (
                    <ChatWindow
                      onComplete={handleChatComplete}
                      onStateChange={handleChatStateChange}
                      initialMessages={chatMessages}
                      initialRequirements={chatRequirements}
                      initialIsComplete={chatIsComplete}
                    />
                  )}
                </div>
              </div>
            )}

            {step === "products" && matchResult && (
              <>
                <CombinedProductPreview
                  matchResult={matchResult}
                  selections={selections}
                  onSelectionChange={handleSelectionChange}
                  onBack={handleBack}
                  onResetSelections={handleResetSelections}
                  requirements={requirements}
                  isMultiEnvironment={isMultiEnv}
                />

                {/* Save Project Section */}
                <div className="mt-8 bg-white rounded-lg border border-[#e9e9e7] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[#37352f]">
                        Ready to continue?
                      </h3>
                      <p className="text-[#787774] text-sm mt-1">
                        Save your project to see pricing and quality evaluation options
                      </p>
                    </div>

                    {user ? (
                      <button
                        onClick={handleSaveProject}
                        disabled={isSaving}
                        className="px-6 py-3 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            Save & Continue to Pricing →
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-[#787774] mb-2">
                          Login to save your project
                        </p>
                        <a
                          href={`/login?redirect=${encodeURIComponent('/project/new?autoSave=true')}`}
                          className="px-6 py-3 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-md transition-colors inline-block"
                        >
                          Login to Continue
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>

      <ContactSalesButton
        useCase={requirements?.use_case}
        selectedProducts={
          matchResult
            ? Object.values(selections)
                .filter((id): id is string => id !== null)
                .map((id) => {
                  for (const cat of matchResult.categories) {
                    const product = cat.products.find((p) => p.id === id);
                    if (product) return product.product_name;
                  }
                  return id;
                })
            : undefined
        }
      />

      {showRestoreDialog && sessionAge !== null && (
        <SessionRestoreDialog
          sessionAge={sessionAge}
          onRestore={handleRestoreSession}
          onStartNew={handleStartNew}
        />
      )}
    </div>
  );
}

// Wrapper with Suspense for useSearchParams
export default function NewProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#37352f]"></div>
        </div>
      }
    >
      <NewProjectPageContent />
    </Suspense>
  );
}
