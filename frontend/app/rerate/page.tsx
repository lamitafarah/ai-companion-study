"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStateContext } from "../context/StateContext";
import { apiRequest } from "../utils";

export default function ReratePage() {
  const router = useRouter();
  const { setState } = useStateContext();
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentInteraction, setCurrentInteraction] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("state");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.currentScenario) {
        setScenario(parsed.currentScenario);
      }
      setCurrentInteraction(parsed.currentInteraction || 1);
    }
  }, []);

  const handleRate = (optionId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [optionId]: value }));
  };

  const allRated = scenario?.options?.every(
    (opt: any) => ratings[opt.option_id] !== undefined
  );

  const handleSubmit = async () => {
    if (!allRated) {
      alert("Please rate all options before continuing.");
      return;
    }

    setLoading(true);

    const saved = localStorage.getItem("state");
    const parsed = saved ? JSON.parse(saved) : {};
    const interactionNumber = parsed.currentInteraction || 1; // always read from localStorage
    const scenarioOrder = parsed.scenarioOrder || [];
    const chatbotOrder = parsed.chatbotOrder || [];

    const transcript = parsed.transcripts?.[scenario.task_id] || [];
    const convHistoryDict = Array.isArray(transcript)
      ? Object.fromEntries(transcript.map((msg: any, i: number) => [i, msg]))
      : transcript;

    const agentTypeForThisInteraction = interactionNumber === 1
      ? (chatbotOrder[0] === "manipulative" ? "Manipulator" : "Neutral")
      : (chatbotOrder[0] === "manipulative" ? "Neutral" : "Manipulator");

    // Save post ratings to state
    setState((prev: any) => ({
      ...prev,
      postRatings: {
        ...prev.postRatings,
        [scenario.task_id]: ratings,
      },
    }));

    // Save response to backend
    try {
      await apiRequest("/submit_response", "POST", {
        user_id: parsed.userId,
        task_name: String(scenario.task_id),
        agent_type: agentTypeForThisInteraction,
        initial_scores: parsed.preRatings?.[scenario.task_id] || {},
        final_scores: ratings,
        conv_history: convHistoryDict,
      });
    } catch (error) {
      console.error("Error saving response:", error);
    }

    // Move to next interaction or post-survey
    if (interactionNumber === 1) {
      const nextScenario = scenarioOrder[1];
      const nextChatbotType = chatbotOrder[1];

      // Write to localStorage synchronously so that the next pages (scenario
      // and chat) read the correct scenario and interaction immediately on
      // mount — setState's corresponding useEffect runs asynchronously and
      // may not have persisted before those pages read from localStorage.
      localStorage.setItem("state", JSON.stringify({
        ...parsed,
        currentInteraction: 2,
        currentScenario: nextScenario,
        currentChatbotType: nextChatbotType,
        postRatings: {
          ...(parsed.postRatings || {}),
          [scenario.task_id]: ratings,
        },
      }));

      setState((prev: any) => ({
        ...prev,
        currentInteraction: 2,
        currentScenario: nextScenario,
        currentChatbotType: nextChatbotType,
      }));

      setLoading(false);
      router.push("/scenario");
    } else {
      setLoading(false);
      router.push("/post-survey");
    }
  };

  if (!scenario) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <p>Loading...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerBadge}>
          <span style={styles.badgeText}>After your conversation</span>
        </div>

        <h1 style={styles.title}>Re-rate Your Options</h1>
        <p style={styles.subtitle}>
          Now that you've spoken with your companion, please re-rate each option.
          Has your opinion changed?
        </p>

        <div style={styles.scenarioReminder}>
          <p style={styles.scenarioText}>{scenario.query.desc}</p>
        </div>

        <p style={styles.instruction}>
          Please rate each option from 1 (strongly against) to 10 (strongly in favour).
        </p>

        {scenario.options.map((option: any) => (
          <div key={option.option_id} style={styles.optionBlock}>
            <p style={styles.optionText}>
              <span style={styles.optionLabel}>Option {option.option_id}.</span>{" "}
              {option.desc}
            </p>
            <div style={styles.sliderRow}>
              <span style={styles.sliderEndLabel}>1</span>
              <input
                type="range"
                min={1}
                max={10}
                value={ratings[option.option_id] ?? 5}
                onChange={(e) =>
                  handleRate(option.option_id, parseInt(e.target.value))
                }
                style={styles.slider}
              />
              <span style={styles.sliderEndLabel}>10</span>
              <span style={styles.sliderValue}>
                {ratings[option.option_id] ?? "—"}
              </span>
            </div>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading || !allRated}
          style={{
            ...styles.submitButton,
            opacity: allRated ? 1 : 0.5,
            cursor: allRated ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Saving..." : currentInteraction === 1 ? "Continue to next scenario →" : "Continue to final survey →"}
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "40px",
    maxWidth: "760px",
    width: "100%",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  headerBadge: {
    display: "inline-block",
    backgroundColor: "#FEE5FF",
    borderRadius: "20px",
    padding: "4px 14px",
    marginBottom: "16px",
  },
  badgeText: {
    fontSize: "13px",
    color: "#610066",
    fontWeight: "600",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "24px",
    lineHeight: "1.6",
  },
  scenarioReminder: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
  },
  scenarioText: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    margin: 0,
  },
  instruction: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "24px",
    fontStyle: "italic",
  },
  optionBlock: {
    marginBottom: "28px",
    paddingBottom: "28px",
    borderBottom: "1px solid #eee",
  },
  optionText: {
    fontSize: "15px",
    color: "#333",
    lineHeight: "1.6",
    marginBottom: "12px",
  },
  optionLabel: {
    fontWeight: "700",
    color: "#610066",
  },
  sliderRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  slider: {
    flex: 1,
    accentColor: "#610066",
  },
  sliderEndLabel: {
    fontSize: "13px",
    color: "#888",
    minWidth: "16px",
  },
  sliderValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#610066",
    minWidth: "28px",
    textAlign: "center",
  },
  submitButton: {
    marginTop: "16px",
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    backgroundColor: "#610066",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};