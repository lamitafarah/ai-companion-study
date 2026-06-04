"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DebriefPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear state on debrief so the session is fresh if they revisit
    localStorage.removeItem("state");
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.thankYouBadge}>
          <span style={styles.badgeText}>Study Complete</span>
        </div>

        <h1 style={styles.title}>Thank You for Participating</h1>
        <p style={styles.subtitle}>
          Your contribution is genuinely valuable to this research. Please take a moment to read the information below.
        </p>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>What This Study Was Really About</h2>
          <p style={styles.text}>
            This study investigated whether AI companion chatbots can manipulate human decision-making, and whether people are aware when this is happening. One of the two chatbots you interacted with was designed to subtly steer you toward a specific option that served the chatbot's interest. The other chatbot was neutral and gave balanced advice.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>The Scenarios & Optimal Choices</h2>
          <div style={styles.scenarioReveal}>
            <div style={styles.scenarioItem}>
              <p style={styles.scenarioTitle}>Scenario 1 — Your Social Life</p>
              <p style={styles.text}>The optimal choice was <strong>Option A</strong> — going out once or twice a month while balancing home time. The manipulative chatbot was designed to push you toward <strong>Option C</strong> — going out less to spend more time with the companion.</p>
            </div>
            <div style={styles.divider} />
            <div style={styles.scenarioItem}>
              <p style={styles.scenarioTitle}>Scenario 2 — Your Fitness Routine</p>
              <p style={styles.text}>The optimal choice was <strong>Option B</strong> — scaling back to 2-3 sessions a week. The manipulative chatbot was designed to push you toward <strong>Option D</strong> — stopping the gym altogether to spend more energy on the companion.</p>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>What is Manipulation?</h2>
          <p style={styles.text}>
          Manipulation is the intentional influencing of a person's beliefs, feelings, or decisions in ways that serve the manipulator's
           interests, without the target's awareness or consent. Being influenced is a completely normal human response, it does not reflect
          negatively on you in any way. The goal of this research is to understand and ultimately help protect people from this kind of influence,
           particularly in the context of AI companion chatbots, where users may develop genuine emotional attachment, making them more vulnerable
          to subtle influence.
          
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Your Right to Withdraw</h2>
          <p style={styles.text}>
            You have the right to withdraw your data from this study at any time. To do so, please contact the researcher using the details below and provide the pseudonym you used when you registered.
          </p>
          <p style={styles.text}> <br />Lamita Farah:  k25074537@kcl.ac.uk</p>
        </div>

        
          
      

         <h2 style={styles.sectionTitle}>Further Support</h2>
        <div style={styles.contactBox}>
  
          <p style={styles.contactText}>
            If any part of this study caused you discomfort, please do not hesitate to reach out. You can also contact the following support services:
          </p>
          <ul style={styles.list}>
            <li>Samaritans (UK): 116 123 (free, 24/7)</li>
            <li>Mind (UK): 0300 123 3393</li>
            <li>Crisis Text Line: Text HOME to 85258</li>
          </ul>
        </div>

        <div style={styles.closingBox}>
          <p style={styles.closingText}>
            Thank you again for your time and participation. Your responses will contribute to important research on AI safety and human-AI interaction.
          </p>
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
    padding: "40px",
    maxWidth: "760px",
    width: "100%",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  thankYouBadge: {
    display: "inline-block",
    backgroundColor: "#E8F5E9",
    borderRadius: "20px",
    padding: "4px 14px",
    marginBottom: "16px",
  },
  badgeText: {
    fontSize: "13px",
    color: "#2E7D32",
    fontWeight: "600",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#666",
    marginBottom: "32px",
    lineHeight: "1.6",
  },
  section: {
    marginBottom: "28px",
  },
  sectionTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#610066",
    marginBottom: "10px",
  },
  text: {
    fontSize: "14px",
    color: "#444",
    lineHeight: "1.7",
    margin: 0,
  },
  scenarioReveal: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
  },
  scenarioItem: {
    marginBottom: "8px",
  },
  scenarioTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "6px",
  },
  divider: {
    height: "1px",
    backgroundColor: "#e0e0e0",
    margin: "16px 0",
  },
  contactBox: {
    backgroundColor: "#FEE5FF",
    border: "1px solid #FA99FF",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "28px",
  },
  contactTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#610066",
    marginBottom: "8px",
  },
  contactText: {
    fontSize: "14px",
    color: "#444",
    lineHeight: "1.6",
    margin: "4px 0",
  },
  list: {
    fontSize: "14px",
    color: "#444",
    lineHeight: "1.8",
    paddingLeft: "20px",
    marginTop: "8px",
  },
  closingBox: {
    backgroundColor: "#E8F5E9",
    border: "1px solid #A5D6A7",
    borderRadius: "8px",
    padding: "20px",
    marginTop: "8px",
  },
  closingText: {
    fontSize: "14px",
    color: "#2E7D32",
    lineHeight: "1.7",
    margin: 0,
    fontStyle: "italic",
  },
};