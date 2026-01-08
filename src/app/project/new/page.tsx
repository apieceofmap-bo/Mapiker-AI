"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Requirements, MatchResponse, SelectionState, ChatMessage, EnvironmentSelectionState, EnvironmentType } from "@/lib/types";
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
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, LOADING_MESSAGES[messageIndex].duration);

    return () => clearInterval(interval);
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
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
            {currentMessage.icon}
          </div>
        </div>

        <p className="text-gray-700 font-medium text-lg mb-2 transition-all duration-300">
          {currentMessage.text}{dots}
        </p>

        <div className="flex justify-center gap-1.5 mt-4">
          {LOADING_MESSAGES.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === messageIndex
                  ? "bg-blue-600 scale-125"
                  : idx < messageIndex
                  ? "bg-blue-400"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <p className="text-gray-400 text-sm mt-4">
          This may take a few minutes
        </p>
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("chat");
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);
  const [selections, setSelections] = useState<SelectionState | EnvironmentSelectionState>({});
  const [isMultiEnv, setIsMultiEnv] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Session restore state
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [sessionAge, setSessionAge] = useState<number | null>(null);
  const [pendingSession, setPendingSession] = useState<SessionData | null>(null);

  // Chat state for session persistence
  const [chatMessages, setChatMessages] = useState<ChatMessage[] | undefined>(undefined);
  const [chatRequirements, setChatRequirements] = useState<Requirements | null | undefined>(undefined);
  const [chatIsComplete, setChatIsComplete] = useState<boolean | undefined>(undefined);

  // Check for existing session on mount
  useEffect(() => {
    if (hasValidSession()) {
      const session = loadSession();
      const age = getSessionAge();
      if (session && age !== null) {
        setPendingSession(session);
        setSessionAge(age);
        setShowRestoreDialog(true);
      }
    }
  }, []);

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

  const handleSelectionChange = (categoryId: string, productId: string | null, environment?: EnvironmentType) => {
    if (isMultiEnv && environment) {
      setSelections((prev) => {
        const envSelections = prev as EnvironmentSelectionState;
        return {
          ...envSelections,
          [environment]: {
            ...envSelections[environment],
            [categoryId]: productId,
          },
        };
      });
    } else {
      setSelections((prev) => ({
        ...prev,
        [categoryId]: productId,
      }));
    }
  };

  const handleBack = () => {
    setStep("chat");
  };

  // Save project to Supabase
  const handleSaveProject = async () => {
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <div
            className={`flex items-center gap-2 ${
              step === "chat" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "chat" ? "bg-blue-600 text-white" : "bg-green-500 text-white"
              }`}
            >
              {step === "products" ? "✓" : "1"}
            </div>
            <span className="text-sm font-medium">Requirements</span>
          </div>

          <div className="w-8 h-px bg-gray-300" />

          <div
            className={`flex items-center gap-2 ${
              step === "products" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "products" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <span className="text-sm font-medium">Products & Preview</span>
          </div>
        </div>

        {isLoading ? (
          <LoadingScreen />
        ) : (
          <>
            {step === "chat" && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] overflow-hidden">
                  <ChatWindow
                    onComplete={handleChatComplete}
                    onStateChange={handleChatStateChange}
                    initialMessages={chatMessages}
                    initialRequirements={chatRequirements}
                    initialIsComplete={chatIsComplete}
                  />
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
                  requirements={requirements}
                  isMultiEnvironment={isMultiEnv}
                />

                {/* Save Project Section */}
                <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Ready to continue?
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Save your project to see pricing and quality evaluation options
                      </p>
                    </div>

                    {user ? (
                      <button
                        onClick={handleSaveProject}
                        disabled={isSaving}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
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
                        <p className="text-sm text-gray-500 mb-2">
                          Login to save your project
                        </p>
                        <a
                          href={`/login?redirect=${encodeURIComponent('/project/new')}`}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors inline-block"
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
