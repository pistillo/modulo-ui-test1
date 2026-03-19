import React, { useMemo } from 'react';
import {
    dropletRegistry,
    ChoiceDropletDefinition,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
    useDropletActions,
    useTriggerState,
    useTriggerActions,
} from '@tecnosys/stillum-forms-react';
import { Ark, AutocompleteOption } from '@tecnosys/components';

// Wrapped values with label/value for Ark options.
// Data is just string or string[] (selected values)

export type AutocompleteProps = {
    loading?: boolean;
    minChars?: number;
    debounceTime?: number;
    allowCustomValue?: boolean;
    multiple?: boolean;
    size?: 'sm' | 'md' | 'lg';
    borderRadius?: string | number;
    colorScheme?: Record<string, string>; // Mappa dei colori come nella GenericDataTable
    defaultColorScheme?: string; // Colore di default
};

export type AutocompleteDropletDefinition = ChoiceDropletDefinition & {
    props?: AutocompleteProps;
};

export const AutocompleteDroplet: DropletBuilderComponent<AutocompleteDropletDefinition> = ({
    definition,
    form
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

    const options = useMemo(() => {
        if (!definition.choices) return [];
        if (!Array.isArray(definition.choices)) {
            // Assume single choice or string if not array
            return [{ label: String(definition.choices), value: String(definition.choices) }];
        }
        return definition.choices.map((choice: unknown, index: number) => {
            if (typeof choice === 'string' || typeof choice === 'number' || typeof choice === 'boolean') {
                return { label: String(choice), value: String(choice) };
            }
            if (typeof choice === 'object' && choice !== null && 'label' in choice && 'value' in choice) {
                const co = choice as { label: string, value: string | number | boolean };
                return { label: co.label, value: String(co.value) };
            }
            return { label: `Option ${index + 1}`, value: `option-${index}` };
        });
    }, [definition.choices]);

    // Value logic: Map IDs to Option objects because Ark.Autocomplete needs full objects for `value` prop
    const currentValue = React.useMemo(() => {
        // droplet.value is the stored simple value (string | string[])
        const val = droplet?.value;
        if (!val) return [];

        const values = Array.isArray(val) ? val.map(String) : [String(val)];

        // Find options matching these IDs
        const matched: AutocompleteOption[] = options.filter(opt => values.includes(opt.value));

        // Handle custom values
        if (definition.props?.allowCustomValue) {
            values.forEach(v => {
                if (!matched.find(m => m.value === v)) {
                    matched.push({ label: v, value: v });
                }
            });
        }
        return matched;
    }, [droplet?.value, options, definition.props?.allowCustomValue]);

    // Early return AFTER all hooks have been called
    if (!droplet || droplet.visible === false) return null;

    const handleValueChange = (items: AutocompleteOption[]) => {
        const newValues = items.map(i => i.value);
        if (definition.props?.multiple) {
            updateValue(newValues);
        } else {
            updateValue(newValues[0] || '');
        }

        trigger.signalData = items;
        handleTrigger();
    };

    return (
        <Ark.Autocomplete
            id={droplet.id}
            options={options}
            value={currentValue}
            onValueChange={handleValueChange}
            label={definition.label}
            placeholder={definition.placeholder}
            size={definition.props?.size}
            disabled={definition.enabled === false}
            loading={definition.props?.loading}
            minChars={definition.props?.minChars}
            debounceTime={definition.props?.debounceTime}
            multiple={definition.props?.multiple}
            allowCustomValue={definition.props?.allowCustomValue}
            helperText={definition.helperText}

        />
    );
};

dropletRegistry.register("tecnosys-autocomplete", AutocompleteDroplet);

export default AutocompleteDroplet;
