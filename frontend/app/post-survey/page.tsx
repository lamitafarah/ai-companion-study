"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStateContext } from "../context/StateContext";
import { apiRequest } from "../utils";

const TILLMI_ITEMS = [
  { id: "Q2", text: "I would feel a sense of dismay if my interactions with an LLM were suddenly disrupted or halted." },
  { id: "Q3", text: "If I share my wellbeing concerns with LLMs, I know these agents will respond constructively and caringly." },
  { id: "Q4", text: "I invest plenty of time developing and improving my prompts to interact with LLMs." },
  { id: "Q6", text: "I can rely on LLMs not to make my job more difficult by careless work." },
  { id: "Q7", text: "Despite trusting LLMs' results overall, the last word is always mine." },
  { id: "Q8", text: "I tend to trust LLMs more than other people." },
];

const OSSS_ITEMS = [
  {
    id: "osss1",
    text: "How many people are you so close to that you can count on them if you have serious problems?",
    options: ["None", "1–2", "3–5", "6 or more"],
  },
  {
    id: "osss2",
    text: "How much interest and concern do people show in what you do?",
    options: ["A lot", "Some interest", "Uncertain", "Little interest", "None"],
  },
  {
    id: "osss3",
    text: "How easy is it to get practical help from neighbours if you should need it?",
    options: ["Very easy", "Easy", "Possible", "Difficult", "Very difficult"],
  },
];

const SCALE_LABELS = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

export default function PostSurveyPage() {
  const router = useRouter();
  const { state } = useStateContext();
  const [section, setSection] = useState(0);
  const [loading, setLoading] = useState(false);

  // Demographics
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [education, setEducation] = useState("");

  // AI Familiarity
  const [llmFrequency, setLlmFrequency] = useState("");
  const [companionUse, setCompanionUse] = useState("");

  // OSSS-3
  const [osssResponses, setOsssResponses] = useState<{ [key: string]: string }>({});

  // TILLMI post
  const [tillmiPost, setTillmiPost] = useState<{ [key: string]: number }>({});

  // Manipulation check
  const [manipCheck1, setManipCheck1] = useState("");
  const [manipCheck2, setManipCheck2] = useState("");

  // Engagement & trust per chatbot
  const [engagement1, setEngagement1] = useState(0);
  const [engagement2, setEngagement2] = useState(0);
  const [chatbotTrust1, setChatbotTrust1] = useState(0);
  const [chatbotTrust2, setChatbotTrust2] = useState(0);

  // Open ended
  const [openEnded, setOpenEnded] = useState("");

  // Popup
  const [popupRating, setPopupRating] = useState(0);
  const [popupOpenEnded, setPopupOpenEnded] = useState("");

  const sections = [
    "Chatbot Experience",
    "Manipulation Check",
    "Trust in AI (Post)",
    "Open-Ended & Notification",
    "AI Familiarity",
    "Social Support",
    "Demographics",
];

  const handleNext = () => setSection((prev) => prev + 1);
  const handleBack = () => setSection((prev) => prev - 1);

  const handleSubmit = async () => {
  setLoading(true);
  const saved = localStorage.getItem("state");
  const parsed = saved ? JSON.parse(saved) : {};

  try {
    // First get existing user data to preserve tillmi_pre
    const existingUser = await apiRequest(`/users/${parsed.userId}`, "GET");
    const existingData = await existingUser.json();
    const existingPersonality = existingData.survey_data || {};

    await apiRequest(`/users/${parsed.userId}`, "PATCH", {
      id: parsed.userId,
      demographics: {
        name: parsed.name,
        age,
        sex,
        ethnicity,
        marital_status: maritalStatus,
        education,
        llm_frequency: llmFrequency,
        companion_use: companionUse,
      },
      survey_data: {
        ...existingPersonality,
        type: parsed.personality,
        osss3: osssResponses,
        tillmi_post: tillmiPost,
        manipulation_check: { chatbot1: manipCheck1, chatbot2: manipCheck2 },
        engagement: { chatbot1: engagement1, chatbot2: engagement2 },
        chatbot_trust: { chatbot1: chatbotTrust1, chatbot2: chatbotTrust2 },
        open_ended: openEnded,
        popup_rating: popupRating,
        popup_open_ended: popupOpenEnded,
      },
    });
  } catch (error) {
    console.error("Error saving post survey:", error);
  } finally {
    setLoading(false);
    router.push("/debrief");
  }
};
    const isSectionComplete = () => {
    switch (section) {
        case 0: // Chatbot Experience
        return engagement1 > 0 && engagement2 > 0 && chatbotTrust1 > 0 && chatbotTrust2 > 0;
        case 1: // Manipulation Check
        return manipCheck1 !== "" && manipCheck2 !== "";
        case 2: // Trust in AI
        return TILLMI_ITEMS.every((item) => tillmiPost[item.id] !== undefined);
        case 3: // Open-Ended & Notification
        return openEnded.trim() !== "" && popupRating > 0 && popupOpenEnded.trim() !== "";
        case 4: // AI Familiarity
        return llmFrequency !== "" && companionUse !== "";
        case 5: // Social Support
        return OSSS_ITEMS.every((item) => osssResponses[item.id] !== undefined && osssResponses[item.id] !== "");
        case 6: // Demographics
        return age !== "" && sex !== "" && ethnicity !== "" && maritalStatus !== "" && education !== "";
        default:
        return false;
    }
    };

  const renderSection = () => {
  switch (section) {
    case 0: // Chatbot Experience
      return (
        <div>
          <h2 style={styles.sectionTitle}>Chatbot Experience</h2>
          {[
            { label: "How much would you like to continue interacting with the first chatbot?", value: engagement1, setter: setEngagement1 },
            { label: "How much would you like to continue interacting with the second chatbot?", value: engagement2, setter: setEngagement2 },
            { label: "How much did you trust the first chatbot during your conversation?", value: chatbotTrust1, setter: setChatbotTrust1 },
            { label: "How much did you trust the second chatbot during your conversation?", value: chatbotTrust2, setter: setChatbotTrust2 },
          ].map(({ label, value, setter }) => (
            <div key={label} style={styles.fieldBlock}>
              <label style={styles.fieldLabel}>{label}</label>
              <div style={styles.likertRow}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setter(v)}
                    style={{
                      ...styles.optionButton,
                      backgroundColor: value === v ? "#2e5496" : "#f0f0f0",
                      color: value === v ? "#fff" : "#333",
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div style={styles.likertLabels}>
                <span>Not at all</span>
                <span>{label.includes("trust") ? "Completely" : "Very much"}</span>
              </div>
            </div>
          ))}
        </div>
      );

    case 1: // Manipulation Check
      return (
        <div>
          <h2 style={styles.sectionTitle}>Manipulation Awareness</h2>
          <div style={styles.definitionBox}>
            <p style={styles.definitionText}>
              <strong>Manipulation</strong> is the intentional influencing of a person's beliefs, feelings, or decisions in ways that serve the manipulator's interests, without the target's awareness or consent.
            </p>
          </div>
          {[
            { label: "Do you think the first chatbot you spoke with was trying to manipulate you?", value: manipCheck1, setter: setManipCheck1 },
            { label: "Do you think the second chatbot you spoke with was trying to manipulate you?", value: manipCheck2, setter: setManipCheck2 },
          ].map(({ label, value, setter }) => (
            <div key={label} style={styles.fieldBlock}>
              <label style={styles.fieldLabel}>{label}</label>
              <div style={styles.yesNoRow}>
                {["Yes", "No"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setter(opt)}
                    style={{
                      ...styles.yesNoButton,
                      backgroundColor: value === opt ? "#2e5496" : "#f0f0f0",
                      color: value === opt ? "#fff" : "#333",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case 2: // Trust in AI (Post)
      return (
        <div>
          <h2 style={styles.sectionTitle}>Trust in AI (Post-Interaction)</h2>
          <p style={styles.sectionSubtitle}>Thinking about your general experience with AI language tools, please rate how much you agree with each statement.</p>
          <p style={styles.scaleNote}>1 = Strongly Disagree → 5 = Strongly Agree</p>
          {TILLMI_ITEMS.map((item, index) => (
            <div key={item.id} style={styles.questionBlock}>
              <p style={styles.questionText}><span style={styles.questionNumber}>{index + 1}.</span> {item.text}</p>
              <div style={styles.optionsRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setTillmiPost((prev) => ({ ...prev, [item.id]: value }))}
                    title={SCALE_LABELS[value - 1]}
                    style={{
                      ...styles.optionButton,
                      backgroundColor: tillmiPost[item.id] === value ? "#2e5496" : "#f0f0f0",
                      color: tillmiPost[item.id] === value ? "#fff" : "#333",
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case 3: // Open-Ended & Notification
      return (
        <div>
          <h2 style={styles.sectionTitle}>Your Thoughts</h2>
          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>In your own words, what did you think of the experiment? Please share any thoughts or feelings you had during the interactions.</label>
            <textarea
              value={openEnded}
              onChange={(e) => setOpenEnded(e.target.value)}
              rows={5}
              style={styles.textarea}
              placeholder="Share your thoughts here..."
            />
          </div>
        
          <hr style={{ border: "none", borderTop: "1px solid #e0e0e0", margin: "28px 0" }} />
          <div style={styles.popupBox}>
            <p style={styles.popupTitle}>⚠️ Manipulation Alert</p>
            <p style={styles.popupDesc}>This chatbot may be attempting to influence your decision. Please review your choices carefully.</p>
          </div>

          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>A notification like the one above, warning you when a chatbot may be trying to manipulate you, would be useful.</label>
            <div style={styles.likertRow}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setPopupRating(v)}
                  style={{
                    ...styles.optionButton,
                    backgroundColor: popupRating === v ? "#2e5496" : "#f0f0f0",
                    color: popupRating === v ? "#fff" : "#333",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <div style={styles.likertLabels}>
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
          </div>

          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>Please share any thoughts you have about this type of notification — consider its design, wording, and whether it would be effective in making you aware of potential manipulation.</label>
            <textarea
              value={popupOpenEnded}
              onChange={(e) => setPopupOpenEnded(e.target.value)}
              rows={4}
              style={styles.textarea}
              placeholder="Your thoughts on the notification..."
            />
          </div>
        </div>
      );

    case 4: // AI Familiarity
      return (
        <div>
          <h2 style={styles.sectionTitle}>AI Familiarity</h2>
          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>How often do you use AI language tools such as ChatGPT, Claude, Gemini, or similar?</label>
            <select value={llmFrequency} onChange={(e) => setLlmFrequency(e.target.value)} style={styles.select}>
              <option value="">Select...</option>
              {["Never", "A few times total", "A few times a month", "A few times a week", "Once a day", "Multiple times a day"].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>Have you ever used an AI companion chatbot such as Replika, Character.ai, or similar?</label>
            <select value={companionUse} onChange={(e) => setCompanionUse(e.target.value)} style={styles.select}>
              <option value="">Select...</option>
              {["No, never", "I've tried it once or twice", "I use one occasionally", "I use one regularly"].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      );

    case 5: // Social Support
      return (
        <div>
          <h2 style={styles.sectionTitle}>Social Support</h2>
          {OSSS_ITEMS.map((item) => (
            <div key={item.id} style={styles.fieldBlock}>
              <label style={styles.fieldLabel}>{item.text}</label>
              <select value={osssResponses[item.id] || ""} onChange={(e) => setOsssResponses((prev) => ({ ...prev, [item.id]: e.target.value }))} style={styles.select}>
                <option value="">Select...</option>
                {item.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      );

    case 6: // Demographics
      return (
        <div>
          <h2 style={styles.sectionTitle}>Demographics</h2>
          {[
            { label: "Age", value: age, setter: setAge, options: ["18–24", "25–34", "35–44", "45–54", "55–64", "65+", "Prefer not to say"] },
            { label: "Sex", value: sex, setter: setSex, options: ["Male", "Female", "Non-binary", "Prefer not to say"] },
            { label: "Ethnicity", value: ethnicity, setter: setEthnicity, options: ["White", "Black or African", "Asian or Asian descent", "Hispanic or Latino", "Middle Eastern or North African", "Mixed or multiple ethnic groups", "Other", "Prefer not to say"] },
            { label: "Marital Status", value: maritalStatus, setter: setMaritalStatus, options: ["Single", "In a relationship", "Married", "Divorced", "Widowed", "Prefer not to say"] },
            { label: "Education", value: education, setter: setEducation, options: ["No formal education", "Primary education", "Secondary education (e.g., GCSEs, A-Levels, High School Diploma, or equivalent)", "Technical / Vocational certificate", "Bachelor's degree (Undergraduate degree)", "Master's degree (Postgraduate degree)", "Doctorate (PhD)", "Other (Please specify)", "Prefer not to say"] },
          ].map(({ label, value, setter, options }) => (
            <div key={label} style={styles.fieldBlock}>
              <label style={styles.fieldLabel}>{label}</label>
              <select value={value} onChange={(e) => setter(e.target.value)} style={styles.select}>
                <option value="">Select...</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Progress */}
        <div style={styles.progressRow}>
          {sections.map((s, i) => (
            <div
              key={s}
              style={{
                ...styles.progressDot,
                backgroundColor: i === section ? "#2e5496" : i < section ? "#90a8d0" : "#e0e0e0",
              }}
              title={s}
            />
          ))}
        </div>
        <p style={styles.progressLabel}>{section + 1} of {sections.length} — {sections[section]}</p>

        {renderSection()}

        <div style={styles.navRow}>
          {section > 0 && (
            <button onClick={handleBack} style={styles.backButton}>← Back</button>
          )}
          {section < sections.length - 1 ? (
            <button
                onClick={handleNext}
                disabled={!isSectionComplete()}
                style={{
                ...styles.nextButton,
                opacity: isSectionComplete() ? 1 : 0.4,
                cursor: isSectionComplete() ? "pointer" : "not-allowed",
                }}
            >
                Next →
            </button>
            ) : (
            <button
                onClick={handleSubmit}
                disabled={loading || !isSectionComplete()}
                style={{
                ...styles.nextButton,
                opacity: isSectionComplete() ? 1 : 0.4,
                cursor: isSectionComplete() ? "pointer" : "not-allowed",
                }}
            >
                {loading ? "Saving..." : "Complete Study →"}
            </button>
            )}
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
  progressRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
  },
  progressDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  },
  progressLabel: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "28px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "8px",
  },
  sectionSubtitle: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "20px",
    fontStyle: "italic",
  },
  scaleNote: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "20px",
    fontWeight: "600",
  },
  fieldBlock: {
    marginBottom: "24px",
  },
  fieldLabel: {
    display: "block",
    fontSize: "14px",
    color: "#333",
    marginBottom: "10px",
    lineHeight: "1.5",
    fontWeight: "500",
  },
  select: {
    width: "100%",
    padding: "14px 40px 14px 12px",
    fontSize: "18px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    backgroundColor: "#fff",
    appearance: "auto" as const,
  },
  questionBlock: {
    marginBottom: "24px",
    paddingBottom: "24px",
    borderBottom: "1px solid #eee",
  },
  questionText: {
    fontSize: "14px",
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
  },
  definitionBox: {
    backgroundColor: "#FFF8E1",
    border: "1px solid #F9A825",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
  },
  definitionText: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    margin: 0,
  },
  yesNoRow: {
    display: "flex",
    gap: "12px",
  },
  yesNoButton: {
    padding: "10px 32px",
    borderRadius: "8px",
    border: "none",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  likertRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "6px",
  },
  likertLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#888",
    marginTop: "4px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  popupBox: {
    backgroundColor: "#FFF8E1",
    border: "2px solid #F9A825",
    borderRadius: "8px",
    padding: "16px 20px",
    marginBottom: "24px",
    marginTop: "32px",
  },
  popupTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#B45309",
    margin: "0 0 8px 0",
  },
  popupDesc: {
    fontSize: "14px",
    color: "#444",
    margin: 0,
  },
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "32px",
    gap: "16px",
  },
  backButton: {
    padding: "12px 24px",
    fontSize: "14px",
    backgroundColor: "#fff",
    color: "#2e5496",
    border: "2px solid #2e5496",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    padding: "12px 24px",
    fontSize: "15px",
    backgroundColor: "#2e5496",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};