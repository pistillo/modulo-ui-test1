import React, { useCallback, useMemo, useRef } from 'react';
import {
    dropletRegistry,
    DateDropletDefinition,
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

export type DateInputProps = {
    size?: 'sm' | 'md' | 'lg';
    min?: string; // ISO Date string
    max?: string; // ISO Date string
    leftIcon?: string;
};

export interface DateInputDropletDefinition extends DateDropletDefinition {
    props?: DateInputProps;
}

export const DateInputDroplet: DropletBuilderComponent<DateInputDropletDefinition> = ({
    definition,
    form
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);

    const triggerDefinition = useMemo(() => ({
        type: "system",
        name: `${definition.name}Changed`,
        enabled: true,
    }), [definition.name]);

    const changeTrigger = useTriggerState(form, triggerDefinition);
    const { handleTrigger } = useTriggerActions(form, triggerDefinition);
    const changeTriggerRef = useRef(changeTrigger);
    changeTriggerRef.current = changeTrigger;

    // Value conversion: string (ISO) <-> Date
    const value = useMemo(() => {
        if (!droplet?.value) return undefined;
        if (droplet.value instanceof Date) return droplet.value;
        const d = new Date(droplet.value);
        return isNaN(d.getTime()) ? undefined : d;
    }, [droplet?.value]);

    const minDate = useMemo(() => definition.props?.min ? new Date(definition.props.min) : undefined, [definition.props?.min]);
    const maxDate = useMemo(() => definition.props?.max ? new Date(definition.props.max) : undefined, [definition.props?.max]);

    if (!droplet || droplet.visible === false) return null;

    const handleValueChange = useCallback((details: { value?: Date }) => {
        const date = details.value;
        // Store as ISO string
        const val = date ? date.toISOString().split('T')[0] : null;
        updateValue(val);

        if (changeTriggerRef.current) {
            changeTriggerRef.current.signalData = val;
            handleTrigger();
        }
    }, [updateValue, handleTrigger]);

    return (
        <Ark.DateInput
            id={droplet.id}
            value={value}
            onValueChange={handleValueChange}
            label={definition.label}
            helperText={definition.helperText}
            placeholder={definition.placeholder}
            size={definition.props?.size ?? 'md'}
            required={definition.required ?? false}
            disabled={definition.enabled === false}
            readOnly={definition.readonly}
            min={minDate}
            max={maxDate}
            leftIcon={definition.props?.leftIcon}
        />
    );
};

dropletRegistry.register("tecnosys-date", DateInputDroplet);

export default DateInputDroplet;
