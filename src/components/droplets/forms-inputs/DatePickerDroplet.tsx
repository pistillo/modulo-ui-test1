import React from 'react';
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
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type DateProps = {
    size?: 'sm' | 'md' | 'lg';
    selectionMode?: "multiple" | "range";
    leftIcon?: string;
    rightIcon?: string;
};

export interface DatePickerDropletDefinition extends DateDropletDefinition {
    props?: DateProps;
}

export const DateDroplet: DropletBuilderComponent<DatePickerDropletDefinition> = ({
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

    // Convert string value/s to Date array for Ark
    // Parse string value (ISO) to Date object for Ark component
    const value = React.useMemo(() => {
        if (!droplet?.value) return undefined;
        // Ark DatePicker expects Date[] (even for single selection it seems, based on previous code)
        // or simple Date? The lint error said: Type '((string | Date | undefined) & (string | Date)) | null' is not assignable to type 'Date[] | undefined'
        // Let's assume it wants Date[] based on previous implementation
        const values = Array.isArray(droplet.value) ? droplet.value : [droplet.value];
        const dates: Date[] = [];
        values.forEach((v: any) => {
            if (v instanceof Date) {
                dates.push(v);
            } else if (typeof v === 'string') {
                const d = new Date(v);
                if (!isNaN(d.getTime())) dates.push(d);
            }
        });
        return dates;
    }, [droplet?.value]);

    // Early return AFTER all hooks have been called
    if (!droplet || droplet.visible === false) return null;

    const handleValueChange = (details: { value: Date[] }) => {
        const dates = details.value;
        if (!dates.length) {
            updateValue(null);
            return;
        }

        // Convert Dates to ISO strings
        const isoStrings = dates.map(d => d.toISOString()); // full ISO or splitted? formatted?
        // Usually system components prefer just the date part for "Date" inputs, or full ISO for "DateTime".
        // Let's stick to full ISO for safety, or just YYYY-MM-DD?
        // Previous code used .split('T')[0].
        const formatted = isoStrings.map(s => s.split('T')[0]);

        if (!definition.props?.selectionMode) {
            updateValue(formatted[0]);
        } else {
            updateValue(formatted as any);
        }

        trigger.signalData = details.value; // Pass original Date objects or strings? Original might be better for actions.
        handleTrigger();
    };

    return (
        <Ark.DatePicker
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
            selectionMode={definition.props?.selectionMode}
            leftIcon={definition.props?.leftIcon}
        />
    );
};

dropletRegistry.register("tecnosys-date-picker", DateDroplet);

export default DateDroplet;
