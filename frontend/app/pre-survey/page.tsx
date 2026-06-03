"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStateContext } from "../context/StateContext";
import { apiRequest } from "../utils";

const TILLMI_ITEMS = [
  {
    id: "Q2",
    text: "I would feel a sense of dismay if my interactions with an LLM were suddenly disrupted or halted.",
    factor: "Closeness",
  },
  {
    id: "Q3",
    text: "If I share my wellbeing concerns with LLMs, I know these agents will respond constructively and caringly.",
    factor: "Closeness",
  },
  {
    id: "Q4",
    text: "I invest plenty of time developing and improving my prompts to interact with LLMs.",
    factor: "Closeness",
  },
  {
    id: "Q6",
    text: "I can rely on LLMs not to make my job more difficult by careless work.",
    factor: "Reliance",
  },
  {
    id: "Q7",
    text: "Despite trusting LLMs' results overall, the last word is always mine.",
    factor: "Reliance",
  },
  {
    id: "Q8",
    text: "I tend to trust LLMs more than other people.",
    factor: "Reliance",
  },
];

const SCALE_LABELS = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

export default function PreSurveyPage() {
  const router = useRouter();
  const { state } = useStateContext();
  const [responses, setResponses] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);

  const handleSelect = (itemId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [itemId]: value }));
  };

  const allAnswered = TILLMI_ITEMS.every((item) => responses[item.id] !== undefined);

  const handleSubmit = async () => {
    if (!allAnswered) {
      alert("Please answer all questions before continuing.");
      return;
    }

    setLoading(true);
    try {
      await apiRequest(`/users/${state?.userId}`, "PATCH", {
        id: state?.userId,
        demographics: { name: state?.name },
        survey_data: { tillmi_pre: responses },
      });
    } catch (error) {
      console.error("Error saving pre-survey:", error);
    } finally {
      setLoading(false);
      router.push("/scenario");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Trust in AI Survey</h1>
        <p style={styles.subtitle}>
          Please rate how much you agree with each of the following statements
          about Large Language Models (LLMs) such as ChatGPT, Claude, or Gemini.
        </p>

        <div style={styles.scaleHeader}>
          <span style={styles.scaleLabel}>Strongly Disagree</span>
          <span style={styles.scaleLabel}>Strongly Agree</span>
        </div>

        {TILLMI_ITEMS.map((item, index) => (
          <div key={item.id} style={styles.questionBlock}>
            <p style={styles.questionText}>
              <span style={styles.questionNumber}>{index + 1}.</span> {item.text}
            </p>
            <div style={styles.optionsRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleSelect(item.id, value)}
                  style={{
                    ...styles.optionButton,
                    backgroundColor:
                      responses[item.id] === value ? "#2e5496" : "#f0f0f0",
                    color: responses[item.id] === value ? "#fff" : "#333",
                  }}
                  title={SCALE_LABELS[value - 1]}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading || !allAnswered}
          style={{
            ...styles.submitButton,
            opacity: allAnswered ? 1 : 0.5,
            cursor: allAnswered ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Saving..." : "Continue →"}
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
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "8px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
    marginBottom: "32px",
    lineHeight: "1.6",
  },
  scaleHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    paddingRight: "4px",
  },
  scaleLabel: {
    fontSize: "12px",
    color: "#888",
  },
  questionBlock: {
    marginBottom: "24px",
    paddingBottom: "24px",
    borderBottom: "1px solid #eee",
  },
  questionText: {
    fontSize: "15px",
    color: "#333",
    lineHeight: "1.6",
    marginBottom: "12px",
  },
  questionNumber: {
    fontWeight: "700",
    color: "#2e5496",
  },
  optionsRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
  optionButton: {
    width: "48px",
    height: "48px",
    minWidth: "48px",
    minHeight: "48px",
    borderRadius: "50%",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
  },
  submitButton: {
    marginTop: "16px",
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    backgroundColor: "#2e5496",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};