import React from 'react';
import {
    dropletRegistry,
    TimeDropletDefinition,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
    useDropletActions,
    useTriggerState,
    useTriggerActions,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type TimeInputProps = {
    size?: 'sm' | 'md' | 'lg';
};

export type TimeInputDropletDefinition = TimeDropletDefinition & {
    props?: TimeInputProps;
};

export const TimeInputDroplet: DropletBuilderComponent<TimeInputDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);
    const triggerDefinition = { type: 'system', name: `${definition.name}Changed`, enabled: true };

    const trigger = useTriggerState(form, triggerDefinition);
    const { handleTrigger } = useTriggerActions(form, triggerDefinition);

    // Parse string value (HH:MM) to Time object for Ark component
    const currentValue: Ark.Time | undefined = React.useMemo(() => {
        if (!droplet?.value) return undefined;
        if (typeof droplet.value === 'string') {
            const parts = droplet.value.split(':');
            if (parts.length === 2) {
                const hour = parseInt(parts[0], 10);
                const minute = parseInt(parts[1], 10);
                if (!isNaN(hour) && !isNaN(minute)) {
                    return { hour, minute };
                }
            }
        }
        // Fallback or if already object
        return undefined;
    }, [droplet?.value]);

    // Early return AFTER all hooks have been called
    if (!droplet || droplet.visible === false) return null;

    const handleValueChange = (details: { value: Ark.Time | undefined }) => {
        if (!details.value) {
            // updateValue expects null for empty/cleared value based on type definition
            if (droplet.value) updateValue(null);
            return;
        }
        // Force cast to the specific template literal type expected by the core definition
        const value = `${details.value.hour}:${details.value.minute.toString().padStart(2, '0')}` as `${number}:${number}`;

        if (value !== droplet.value) {
            updateValue(value);
            trigger.signalData = value;
            handleTrigger();
        }
    };

    return (
        <Ark.TimeInput
            id={droplet.id}
            value={currentValue}
            onValueChange={handleValueChange as any}
            label={definition.label}
            helperText={definition.helperText}
            placeholder={definition.placeholder}
            size={definition.props?.size}
            disabled={definition.enabled === false}
            readOnly={definition.readonly}
        />
    );
};

dropletRegistry.register("tecnosys-time-input", TimeInputDroplet);

export default TimeInputDroplet;
