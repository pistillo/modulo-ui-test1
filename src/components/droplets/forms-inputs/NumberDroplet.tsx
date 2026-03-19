import {
    dropletRegistry,
    NumberDropletDefinition,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
    useDropletActions,
    useTriggerState,
    useTriggerActions,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type NumberProps = {
    step?: number;
    min?: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    leftIcon?: string;
    rightIcon?: string;
};

export interface TecnosysNumberDropletDefinition extends NumberDropletDefinition {
    props?: NumberProps;
}

export const NumberDroplet: DropletBuilderComponent<TecnosysNumberDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);

    const triggerDefinition = { type: 'system', name: `${definition.name}Changed`, enabled: true };

    const trigger = useTriggerState(form, triggerDefinition);

    const { handleTrigger } = useTriggerActions(form, triggerDefinition);

    if (!droplet || droplet.visible === false) return null;

    const handleValueChange = (val: number | null) => {
        updateValue(val || 0);
        trigger.signalData = val;
        handleTrigger();
    };

    return (
        <Ark.NumberInput
            id={droplet.id}
            value={Number(droplet.value ?? 0)}
            onValueChange={handleValueChange}
            label={definition.label}
            helperText={definition.helperText}
            placeholder={definition.placeholder}
            size={definition.props?.size}
            min={definition.props?.min}
            max={definition.props?.max}
            step={definition.props?.step}
            disabled={droplet.enabled === false}
            readOnly={definition.readonly}
            leftIcon={definition.props?.leftIcon}
            rightIcon={definition.props?.rightIcon}
        />
    );
};

dropletRegistry.register("tecnosys-number", NumberDroplet);

export default NumberDroplet;
