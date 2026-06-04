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
            The purpose of this study is to investigate how the personality design of romantic companion chatbots
             shapes user experience and decision-making. You will interact with two chatbots and share your
              thoughts and preferences. The study also explores whether certain interface features, such as real-time
               notifications, are useful to users during chatbot interactions.

          </p>

          <h2 style={styles.sectionTitle}>What Will You Do?</h2>
          <p style={styles.text}>
            If you choose to take part in the project you will be asked to complete an online questionnaire and interact briefly
            with two research chatbots. The questionnaire will ask about your opinions and experiences. The chatbot interaction will
            simulate a short conversation with a companion chatbot. <br/>
            The total time required is approximately 15–30 minutes and involves a single session.  <br/>
            As part of your participation, you will be asked to provide basic demographic information (such as age, gender, and ethnicity) 
            as well as your opinions and experiences regarding chatbot interactions.

          </p>

          <h2 style={styles.sectionTitle}>Your Rights</h2>
          <p style={styles.text}>
            Your participation is entirely voluntary and you are free to withdraw at any time by closing the survey, or after submission by contacting the researcher with your pseudonym before 10/07/2026. <br/>
            All responses are stored anonymously under your chosen pseudonym on King's College London secure systems, accessible only to the researcher and their supervisor.
            Your data will be retained for a minimum of 1 year in line with KCL policy and will not allow you to be identified in any outputs. 
            
          </p>

          <h2 style={styles.sectionTitle}>Risks & Benefits</h2>
          <p style={styles.text}>
            The risks associated with taking part in this study are minimal. 
            Some participants may find interacting with a romantic companion chatbot mildly uncomfortable. 
            Please be aware that chatbots can occasionally produce unexpected or harmful responses. If at any point you feel distressed, you are free to stop participating without consequence.

          </p>
        </div>

        <div style={styles.nameSection}>
          <label style={styles.label}>
            Please enter a pseudonym to identify yourself, for withdrawal purposes only. Choose something that cannot be linked or recognised as you by anyone else.
          </label>
          <input
            type="text"
            placeholder="e.g. Pasta or BlueTiger42"
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
    color: "#610066",
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
    backgroundColor: "#610066",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },

};