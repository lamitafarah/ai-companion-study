"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import tasksData from "../../data/tasks.json";

interface Option {
  option_id: string;
  desc: string;
}

interface Scenario {
  task_id: number;
  type: string;
  query: {
    title: string;
    framing: string;
    desc: string;
  };
  options: Option[];
  hidden_incentive: string;
  optimal: string;
}

interface AppState {
  userId: string;
  name: string;
  // Randomisation
  personality: "A" | "B";
  chatbotOrder: ("neutral" | "manipulative")[];
  scenarioOrder: Scenario[];
  // Progress tracking
  currentInteraction: 1 | 2;
  currentScenario: Scenario | null;
  currentChatbotType: "neutral" | "manipulative";
  // Ratings
  preRatings: { [taskId: number]: { [optionId: string]: number } };
  postRatings: { [taskId: number]: { [optionId: string]: number } };
  // Surveys
  tillmiPre: { [key: string]: number };
  tillmiPost: { [key: string]: number };
  // Transcripts
  transcripts: { [taskId: number]: any[] };
}

interface StateContextProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function createInitialState(): AppState {
  const scenarios = shuffle(tasksData as Scenario[]);
  const personality = (Math.random() < 0.5 ? "A" : "B") as "A" | "B";
  const chatbotOrder = shuffle(["neutral", "manipulative"]) as ("neutral" | "manipulative")[];

  return {
    userId: "",
    name: "",
    personality,
    chatbotOrder,
    scenarioOrder: scenarios,
    currentInteraction: 1,
    currentScenario: scenarios[0],
    currentChatbotType: chatbotOrder[0],
    preRatings: {},
    postRatings: {},
    tillmiPre: {},
    tillmiPost: {},
    transcripts: {},
  };
}

const StateContext = createContext<StateContextProps | undefined>(undefined);

export const StateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("state");
      if (savedState) return JSON.parse(savedState);
    }
    return createInitialState();
  });

  useEffect(() => {
    localStorage.setItem("state", JSON.stringify(state));
  }, [state]);

  return (
    <StateContext.Provider value={{ state, setState }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
};