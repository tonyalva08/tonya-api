import { useState } from 'react';
import LandingPage, { type LandingFormData } from './LandingPage';
import SnapshotPage from './SnapshotPage';
import ROIPage from './ROIPage';
import type { Action } from './actions';
import type { MarketSnapshot } from './types';

type Step =
  | { name: 'landing' }
  | { name: 'snapshot'; formData: LandingFormData }
  | {
      name: 'roi';
      formData: LandingFormData;
      action: Action;
      snapshot: MarketSnapshot;
    };

export default function App() {
  const [step, setStep] = useState<Step>({ name: 'landing' });

  if (step.name === 'landing') {
    return (
      <LandingPage
        onSubmit={(formData) => setStep({ name: 'snapshot', formData })}
      />
    );
  }

  if (step.name === 'snapshot') {
    return (
      <SnapshotPage
        formData={step.formData}
        onActionSelected={(action, snapshot) =>
          setStep({
            name: 'roi',
            formData: step.formData,
            action,
            snapshot,
          })
        }
        onBack={() => setStep({ name: 'landing' })}
      />
    );
  }

  return (
    <ROIPage
      formData={step.formData}
      action={step.action}
      snapshot={step.snapshot}
      onBack={() =>
        setStep({ name: 'snapshot', formData: step.formData })
      }
    />
  );
}
