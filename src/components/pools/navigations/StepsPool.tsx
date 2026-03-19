import { useMemo, useRef, useCallback } from 'react';
import { poolRegistry, PoolDefinition } from '@tecnosys/stillum-forms-core';
import { PoolBuilderComponent, useTriggerState, useTriggerActions } from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

interface StepsDataContext {
  steps?: Ark.StepDefinition[];
  currentStepId?: string;
  currentStep?: number;
}

export type StepsPoolDefinition = PoolDefinition & {
  props?: Partial<Ark.NavigableStepsProps> & {};
  triggers?: {
    name: string;
    type?: string;
    [key: string]: any;
  }[];
};

const StepsPool: PoolBuilderComponent<StepsPoolDefinition> = ({
  definition,
  form,
  PoolsTag,
  TriggersTag,
}) => {
  const props = definition.props || {};
  const stepsDataContext = form?.getDataContext() as StepsDataContext;

  const stepChangeTriggerDefinition = useMemo(
    () => ({
      type: 'system',
      name: `${definition.name}StepChange`,
      enabled: true,
    }),
    [definition.name],
  );
  const stepChangeTrigger = useTriggerState(form, stepChangeTriggerDefinition);
  const { handleTrigger: triggerStepChange } = useTriggerActions(form, stepChangeTriggerDefinition);

  const stepChangeTriggerRef = useRef(stepChangeTrigger);
  stepChangeTriggerRef.current = stepChangeTrigger;

  const nextClickTriggerDefinition = useMemo(
    () => ({
      type: 'system',
      name: `${definition.name}NextClick`,
      enabled: true,
    }),
    [definition.name],
  );
  const nextClickTrigger = useTriggerState(form, nextClickTriggerDefinition);
  const { handleTrigger: triggerNextClick } = useTriggerActions(form, nextClickTriggerDefinition);

  const nextClickTriggerRef = useRef(nextClickTrigger);
  nextClickTriggerRef.current = nextClickTrigger;

  const prevClickTriggerDefinition = useMemo(
    () => ({
      type: 'system',
      name: `${definition.name}PrevClick`,
      enabled: true,
    }),
    [definition.name],
  );
  const prevClickTrigger = useTriggerState(form, prevClickTriggerDefinition);
  const { handleTrigger: triggerPrevClick } = useTriggerActions(form, prevClickTriggerDefinition);

  const prevClickTriggerRef = useRef(prevClickTrigger);
  prevClickTriggerRef.current = prevClickTrigger;

  // Local state for steps management
  const currentSteps = stepsDataContext?.steps || props.steps || [];
  const currentStepIndex = stepsDataContext?.currentStep ?? props.initialStep ?? 0;

  // Helper to render content for a specific step
  const renderStepContent = (stepId: string) => {
    if (!PoolsTag) return null;
    return <PoolsTag />;
  };

  const handleStepChange = useCallback(
    (info: Ark.StepChangeInfo) => {
      if (stepChangeTriggerRef.current) {
        stepChangeTriggerRef.current.signalData = info;
        triggerStepChange();
      }
    },
    [triggerStepChange],
  );

  const handleNextClick = useCallback(
    (info: Ark.StepChangeInfo) => {
      if (nextClickTriggerRef.current) {
        nextClickTriggerRef.current.signalData = info;
        triggerNextClick();
      }
    },
    [triggerNextClick],
  );

  const handlePrevClick = useCallback(
    (info: Ark.StepChangeInfo) => {
      if (prevClickTriggerRef.current) {
        prevClickTriggerRef.current.signalData = info;
        triggerPrevClick();
      }
    },
    [triggerPrevClick],
  );

  return (
    <Ark.NavigableSteps
      id={definition.name}
      steps={currentSteps}
      initialStep={currentStepIndex}
      className={props.className}
      linear={props.linear}
      backStepButton={props.backStepButton}
      isNextStepDisabled={props.isNextStepDisabled}
      onStepChange={handleStepChange}
      onNextClick={handleNextClick}
      onPrevClick={handlePrevClick}
      renderStepContent={renderStepContent}
    />
  );
};

poolRegistry.register('tecnosys-steps', StepsPool);

export default StepsPool;
