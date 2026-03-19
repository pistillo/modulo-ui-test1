import React from 'react';
import {
    DropletDefinition,
    dropletRegistry,
    TimeDropletDefinition,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
    useDropletActions,
    useTriggerState,
    useTriggerActions,
    useTriggerActionsWithResult,
} from '@tecnosys/stillum-forms-react';


export type TestDropletDefinition = DropletDefinition<string | undefined> & {
};

export const TestDroplet: DropletBuilderComponent<TestDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);
    const triggerDefinition = { type: 'system', name: `${definition.name}ClickMe`};

    useTriggerState(form, triggerDefinition);
    const { handleTrigger } = useTriggerActionsWithResult<string>(form, triggerDefinition);


    // Early return AFTER all hooks have been called
    if (!droplet || droplet.visible === false) return null;

    const handleValueChange = async () => {
        const result = await handleTrigger();
        if (result) {
            updateValue(result.output);
        }

    };

    return (
       <button onClick={() => handleValueChange()}>{droplet.value ?? 'Click me'}</button>
    );
};

dropletRegistry.register("test-droplet", TestDroplet);

export default TestDroplet;
