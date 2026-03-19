import { useMemo } from 'react';
import {
    dropletRegistry,
    DropletDefinition,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
    useDropletActions,
    useTriggerState,
    useTriggerActions,
    DropletWrapper,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

// Define Option type
export type RadioOption = {
    label: string;
    value: string;
    disabled?: boolean;
};

export type RadioData = {
    options?: RadioOption[];
    value?: string;
    spacing?: string | number;
    direction?: "row" | "column";
};

export type RadioProps = {
    size?: 'sm' | 'md' | 'lg';
};

export type RadioDropletDefinition = DropletDefinition<RadioData> & {
    props?: RadioProps;
    choices?: any[]; // Keep to support static choices if needed
};

export const RadioGroupDroplet: DropletBuilderComponent<RadioDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);

    const triggerDefinition = {
        type: "system",
        name: `${definition.name}Changed`,
        enabled: true,
    };
    const trigger = useTriggerState(form, triggerDefinition);
    const { handleTrigger } = useTriggerActions(form, triggerDefinition);

    // Use options from data or fallback
    const options = useMemo(() => {
        if (droplet?.value?.options) return droplet.value.options;

        if (!definition.choices) return [];
        if (typeof definition.choices === 'string') return [];

        return definition.choices.map((choice, index) => {
            if (typeof choice === 'string' || typeof choice === 'number' || typeof choice === 'boolean') {
                return { label: String(choice), value: String(choice) };
            }
            if (typeof choice === 'object' && choice !== null) {
                const co = choice as any;
                return { label: co.label, value: String(co.value) };
            }
            return { label: `Option ${index + 1}`, value: `option-${index}` };
        });
    }, [droplet?.value?.options, definition.choices]);

    // Early return AFTER all hooks have been called
    if (!droplet || droplet.visible === false) return null;

    const handleValueChange = (details: { value: string | null }) => {
        const val = details.value ?? '';

        if (droplet.value && typeof droplet.value === 'object') {
            updateValue({ ...droplet.value, value: val });
        } else {
            updateValue(val as any);
        }

        trigger.signalData = val;
        handleTrigger();
    };

    return (
        <Ark.RadioGroup
            id={droplet.id}
            label={definition.label}
            value={droplet.value?.value ?? (typeof droplet.value === 'string' ? droplet.value : '')}
            onValueChange={handleValueChange}
            helperText={definition.helperText}
            size={definition.props?.size as any ?? 'md'}
            disabled={definition.enabled === false}
            options={options}
            readOnly={definition.readonly}
        />
    );
};

dropletRegistry.register("tecnosys-radio", RadioGroupDroplet);

export default RadioGroupDroplet;
