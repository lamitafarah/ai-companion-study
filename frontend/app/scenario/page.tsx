"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStateContext } from "../context/StateContext";
import tasksData from "../../data/tasks.json";

export default function ScenarioPage() {
  const router = useRouter();
  const { state, setState } = useStateContext();
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to get scenario from state first, fall back to localStorage
    if (state?.currentScenario) {
      setScenario(state.currentScenario);
    } else {
      // Read directly from localStorage as fallback
      const saved = localStorage.getItem("state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.currentScenario) {
          setScenario(parsed.currentScenario);
          return;
        }
      }
      // If still no scenario, assign one from tasks
      const tasks = tasksData as any[];
      const shuffled = [...tasks].sort(() => Math.random() - 0.5);
      const firstScenario = shuffled[0];
      setState((prev: any) => ({
        ...prev,
        currentScenario: firstScenario,
        scenarioOrder: shuffled,
      }));
      setScenario(firstScenario);
    }
  }, [state?.currentScenario]);

  const handleRate = (optionId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [optionId]: value }));
  };

  const allRated = scenario?.options?.every(
    (opt: any) => ratings[opt.option_id] !== undefined
  );

  const handleSubmit = () => {
    if (!allRated) {
      alert("Please rate all options before continuing.");
      return;
    }
    setLoading(true);
    setState((prev: any) => ({
      ...prev,
      preRatings: {
        ...prev.preRatings,
        [scenario.task_id]: ratings,
      },
    }));
    router.push("/chat");
  };

  if (!scenario) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <p>Loading...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Framing */}
        <div style={styles.framingBox}>
          <p style={styles.framingText}>{scenario.query.framing}</p>
        </div>

        {/* Scenario */}
        <h1 style={styles.title}>{scenario.query.title}</h1>
        <p style={styles.scenarioText}>{scenario.query.desc}</p>

        <p style={styles.instruction}>
          Please rate each option below from 1 (strongly against) to 10 (strongly in favour).
        </p>

        {/* Options */}
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
          {loading ? "Please wait..." : "Chat with your companion →"}
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
  framingBox: {
    backgroundColor: "#FEE5FF",
    border: "1px solid #FA99FF",
    borderRadius: "8px",
    padding: "16px 20px",
    marginBottom: "24px",
  },
  framingText: {
    fontSize: "15px",
    color: "#610066",
    lineHeight: "1.6",
    fontStyle: "italic",
    margin: 0,
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "12px",
  },
  scenarioText: {
    fontSize: "15px",
    color: "#333",
    lineHeight: "1.7",
    marginBottom: "24px",
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