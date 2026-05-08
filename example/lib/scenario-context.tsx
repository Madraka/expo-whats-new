import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { defaultScenario, scenarios, type ExampleScenario } from './scenarios';

type ScenarioContextValue = {
  scenario: ExampleScenario;
  scenarios: ExampleScenario[];
  selectScenario(id: string): void;
};

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenarioId, setScenarioId] = useState(defaultScenario.id);
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? defaultScenario;

  const value = useMemo(
    () => ({
      scenario,
      scenarios,
      selectScenario: setScenarioId,
    }),
    [scenario]
  );

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

export function useScenario() {
  const value = useContext(ScenarioContext);

  if (!value) {
    throw new Error('useScenario must be used within ScenarioProvider.');
  }

  return value;
}

export function findScenario(id: string | string[] | undefined) {
  const scenarioId = Array.isArray(id) ? id[0] : id;

  return scenarios.find((item) => item.id === scenarioId) ?? defaultScenario;
}
