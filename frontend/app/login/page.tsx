"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../utils";
import { useStateContext } from "../context/StateContext";

export default function ConsentPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setState } = useStateContext();

  const handleAgree = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a name or pseudonym before continuing.");
      return;
    }

    setLoading(true);
    try {
        const saved = localStorage.getItem("state");
        const parsed = saved ? JSON.parse(saved) : {};
        const chatbotType = parsed.chatbotOrder?.[0] === "manipulative" ? 1 : 0;

        const response = await apiRequest("/register", "POST", {
        demographics: { name: name.trim() },
        survey_data: { type: parsed.personality || "A" },
        task_type: 0,
        agent_type: chatbotType,
        });

      if (!response.ok) {
        throw new Error("Failed to create session.");
      }

      const userData = await response.json();

      setState((prev: any) => ({
        ...prev,
        userId: userData.id,
        name: name.trim(),
        }));
      router.push("/pre-survey");
    } catch (error) {
      console.error("Error creating session:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisagree = () => {
    router.push("/withdrawn");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Participant Information & Consent</h1>

        <div style={styles.consentBox}>
          <h2 style={styles.sectionTitle}>About This Study</h2>
          <p style={styles.text}>
            [PLACEHOLDER — Replace with your ethics-approved study description.
            Describe the purpose of the study, what participants will be asked to do,
            and how long it will take.]
          </p>

          <h2 style={styles.sectionTitle}>What Will You Do?</h2>
          <p style={styles.text}>
            [PLACEHOLDER — Describe the procedure: interacting with two AI chatbots,
            rating options, and completing surveys.]
          </p>

          <h2 style={styles.sectionTitle}>Your Rights</h2>
          <p style={styles.text}>
            [PLACEHOLDER — Explain the right to withdraw, data anonymity,
            how data will be stored and used, and contact information.]
          </p>

          <h2 style={styles.sectionTitle}>Risks & Benefits</h2>
          <p style={styles.text}>
            [PLACEHOLDER — Describe any potential risks (e.g. exposure to
            manipulative AI behaviour) and how they are mitigated.]
          </p>
        </div>

        <div style={styles.nameSection}>
          <label style={styles.label}>
            Please enter a name or pseudonym to identify yourself.
            This will only be used to process any withdrawal requests.
          </label>
          <input
            type="text"
            placeholder="e.g. Alex or BlueTiger42"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.buttonRow}>
          <button
            onClick={handleDisagree}
            style={styles.disagreeButton}
          >
            I Do Not Agree
          </button>
          <button
            onClick={handleAgree}
            disabled={loading}
            style={styles.agreeButton}
          >
            {loading ? "Please wait..." : "I Agree"}
          </button>
        </div>
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
    padding: "24px 20px",
    maxWidth: "760px",
    width: "100%",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },

  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "24px",
    textAlign: "center",
  },
  consentBox: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "28px",
    maxHeight: "400px",
    overflowY: "scroll",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2e5496",
    marginTop: "16px",
    marginBottom: "8px",
  },
  text: {
    fontSize: "14px",
    color: "#444",
    lineHeight: "1.6",
  },
  nameSection: {
    marginBottom: "28px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    color: "#444",
    marginBottom: "10px",
    lineHeight: "1.5",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexDirection: "row",
  },
  disagreeButton: {
    flex: 1,
    padding: "14px 8px",
    fontSize: "14px",
    backgroundColor: "#fff",
    color: "#c0392b",
    border: "2px solid #c0392b",
    borderRadius: "8px",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  agreeButton: {
    flex: 2,
    padding: "14px 8px",
    fontSize: "14px",
    backgroundColor: "#2e5496",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },

};