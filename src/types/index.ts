export type EmergencyScenario = {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: FirstAidStep[];
};

export type FirstAidStep = {
  id: string;
  title: string;
  instruction: string;
  visualType: string;
  audioText?: string;
};

export type EmergencySession = {
  id: string;
  startedAt: string;
  scenario: string;
  mode: "demo" | "prototype";
  status: "active" | "completed" | "cancelled";
};