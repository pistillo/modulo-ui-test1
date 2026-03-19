import React, { useMemo } from 'react';
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
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components'; // Updated import

// Define Option type
export type SelectOption = {
    label: string;
    value: string;
    disabled?: boolean;
};

// Data includes content (options) and state (value)
export type SelectData = {
    options?: SelectOption[];
    value?: string[];
};

export type SelectProps = {
    size?: 'sm' | 'md' | 'lg';
    borderRadius?: string | number;
    colorScheme?: Record<string, string>; // Mappa dei colori come nella GenericDataTable
    defaultColorScheme?: string; // Colore di default
};

export type SelectDropletDefinition = DropletDefinition<SelectData> & {
    props?: SelectProps;
    choices?: any[]; // Keep to support static choices if needed
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    helperText?: string;
    multiple?: boolean;
    loading?: boolean;
    leftIcon?: string;
    rightIcon?: string;
    readOnly?: boolean;
};

export const SelectDroplet: DropletBuilderComponent<SelectDropletDefinition> = ({
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
    const focusTrigger = { type: 'system', name: `${definition.name}Focus`, enabled: true };
    const blurTrigger = { type: 'system', name: `${definition.name}Blur`, enabled: true };

    const trigger = useTriggerState(form, triggerDefinition);
    useTriggerState(form, focusTrigger);
    useTriggerState(form, blurTrigger);

    const { handleTrigger } = useTriggerActions(form, triggerDefinition);

    // Use options from data (dynamic) or fallback to definition choices (static)
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

    // Use value from data, or fallback to direct droplet value if simple string binding usage (legacy support)
    const currentValue = useMemo(() => {
        const val = droplet?.value?.value ?? (Array.isArray(droplet?.value) ? droplet.value : (droplet?.value ? [String(droplet.value)] : []));
        // Need to ensure it's string[]
        if (Array.isArray(val)) return val.map(String);
        return val ? [String(val)] : [];
    }, [droplet?.value]);

    // Early return AFTER all hooks have been called
    if (!droplet || droplet.visible === false) return null;

    const handleValueChange = (details: { value: string[] }) => {
        const isMulti = definition.multiple;
        // If data structure is complex, we update just the value part?
        // Or if simple binding, we update simple value.
        // Assuming we want to support both modes or migrate to Data object.
        // If we update Data object:
        // updateValue({ ...droplet.value, value: details.value });
        // BUT standard form binding usually expects simple value.
        // FOR NOW: We will assume typical usage binds to simple value, UNLESS using new Data structure explicitely.
        // Let's support simple update for backward compat unless 'value' key exists in object.

        // Actually, if we use DropletDefinition<SelectData>, the "value" of the droplet IS SelectData.
        if (droplet.value && typeof droplet.value === 'object' && 'value' in droplet.value) {
            updateValue({ ...droplet.value, value: details.value });
        } else {
            // Fallback for simple binding (if definition was ChoiceDropletDefinition legacy)
            // But we changed definition type.
            // If user uses this droplet with simple string, it might break type.
            // We'll update to Data object structure if possible, or simple if that was the prior state?
            // Safest is to update the 'value' property of the object if it exists, or just the value if previously null?
            // Let's create the object structure.
            const newValue = isMulti ? details.value : (details.value[0] || '');
            // Wait, if not multi, value should be string? SelectData.value is string[].
            // Ark Select value is string[].
            // Our SelectData.value is string[].
            // So we store string[].
            updateValue({ ...droplet.value, value: details.value });
        }

        trigger.signalData = details.value; // Send simple value in trigger
        handleTrigger();
    };

    return (
        <Ark.Select
            id={droplet.id}
            options={options}
            value={currentValue}
            onValueChange={handleValueChange}
            label={definition.label}
            helperText={definition.helperText}
            placeholder={definition.placeholder}
            size={definition.props?.size ?? 'md'}
            required={definition.required ?? false}
            disabled={definition.enabled === false}
            multiple={definition.multiple}
            loading={definition.loading}
            leftIcon={definition.leftIcon}
            rightIcon={definition.rightIcon}
            readOnly={definition.readOnly}
        />
    );
};

dropletRegistry.register("tecnosys-select", SelectDroplet);

export default SelectDroplet;
