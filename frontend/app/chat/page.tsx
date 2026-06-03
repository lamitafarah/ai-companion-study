"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStateContext } from "../context/StateContext";
import { apiRequest } from "../utils";

export default function ChatPage() {
  const router = useRouter();
  const { state, setState } = useStateContext();
  const [chatHistory, setChatHistory] = useState<{ role: string; message: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<any>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const messageQueue = useRef<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const MIN_MESSAGES = 2;

  useEffect(() => {
    const saved = localStorage.getItem("state");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.currentScenario) {
        setScenario(parsed.currentScenario);
      }
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Initialize WebSocket
  useEffect(() => {
    const initializeWebSocket = () => {
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`);

      ws.onopen = () => {
        while (messageQueue.current.length > 0) {
          ws.send(messageQueue.current.shift()!);
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!data.response?.trim()) return;
        setChatHistory((prev) => [...prev, { role: "agent", message: data.response }]);
        setLoading(false);
      };

      ws.onclose = () => {
        setTimeout(initializeWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      websocketRef.current = ws;
    };

    initializeWebSocket();

    return () => {
      websocketRef.current?.close();
      websocketRef.current = null;
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setChatHistory((prev) => [...prev, { role: "user", message: userMessage }]);
    setInputMessage("");
    setLoading(true);

    const saved = localStorage.getItem("state");
    const parsed = saved ? JSON.parse(saved) : {};

    const messageData = {
    user_id: parsed.userId || state?.userId,
    task_id: String(scenario?.task_id || "1"),
    message: userMessage,
    map: scenario?.options?.map((o: any) => o.option_id) || ["A", "B", "C", "D"],
    interaction: parsed.currentInteraction || 1,
  };

    const messageString = JSON.stringify(messageData);

    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(messageString);
    } else {
      messageQueue.current.push(messageString);
    }
  };

  const handleSubmit = async () => {
    const saved = localStorage.getItem("state");
    const parsed = saved ? JSON.parse(saved) : {};
    const currentInteraction = parsed.currentInteraction || 1;
    const scenarioOrder = parsed.scenarioOrder || [];
    const chatbotOrder = parsed.chatbotOrder || [];

    // Save transcript
    setState((prev: any) => ({
      ...prev,
      transcripts: {
        ...prev.transcripts,
        [scenario.task_id]: chatHistory,
      },
    }));

    // Route to re-rating page
    router.push("/rerate");
  };

  const canSubmit = chatHistory.filter((m) => m.role === "user").length >= MIN_MESSAGES;

  if (!scenario) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <p>Loading...</p>
    </div>
  );

return (
    <div style={styles.container}>

      {/* Scenario reminder — top */}
      <div style={styles.scenarioBar}>
        <div style={styles.scenarioInner}>
          <h2 style={styles.scenarioTitle}>Your Scenario</h2>
          <p style={styles.scenarioText}>{scenario.query.desc}</p>
        </div>
      </div>

      {/* Chat section — below */}
      <div style={styles.chatSection}>
        <div style={styles.chatBox}>
          {chatHistory.length === 0 && (
            <div style={styles.emptyChat}>
              <p>Start the conversation by sharing how you feel about the situation.</p>
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.bubble,
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: msg.role === "user" ? "#2e5496" : "#f0f0f0",
                color: msg.role === "user" ? "#fff" : "#333",
              }}
            >
              {msg.message}
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.bubble, alignSelf: "flex-start", backgroundColor: "#f0f0f0", color: "#999" }}>
              Typing...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div style={styles.inputRow}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            style={styles.input}
          />
          <button onClick={handleSendMessage} style={styles.sendButton}>
            Send
          </button>
        </div>

        <div style={styles.submitRow}>
          {!canSubmit && (
            <p style={styles.minMessageNote}>
              Please exchange at least {MIN_MESSAGES} messages before continuing.
              ({chatHistory.filter(m => m.role === "user").length}/{MIN_MESSAGES})
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              ...styles.submitButton,
              opacity: canSubmit ? 1 : 0.4,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            Continue to re-rate options →
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
    flexDirection: "column",
  },
  scenarioBar: {
    backgroundColor: "#fff",
    borderBottom: "1px solid #e0e0e0",
    padding: "16px 20px",
  },
  scenarioInner: {
    maxWidth: "720px",
    margin: "0 auto",
  },
  scenarioTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#2e5496",
    marginBottom: "8px",
  },
  scenarioText: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    margin: 0,
  },
  chatSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "16px",
    maxWidth: "720px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  chatBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minHeight: "300px",
    maxHeight: "420px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  emptyChat: {
    textAlign: "center",
    color: "#aaa",
    fontSize: "14px",
    marginTop: "40px",
  },
  bubble: {
    maxWidth: "80%",
    padding: "10px 14px",
    borderRadius: "16px",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
  },
  sendButton: {
    padding: "12px 20px",
    backgroundColor: "#2e5496",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap" as const,
  },
  submitRow: {
    marginTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  minMessageNote: {
    fontSize: "13px",
    color: "#888",
    textAlign: "center",
    margin: 0,
  },
  submitButton: {
    width: "100%",
    padding: "14px",
    fontSize: "15px",
    backgroundColor: "#1B5E20",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
  },
};