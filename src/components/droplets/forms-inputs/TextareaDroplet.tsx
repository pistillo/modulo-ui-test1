import React from 'react';
import {
    dropletRegistry,
    StringDropletDefinition,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
    useDropletActions,
    useTriggerState,
    useTriggerActions,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components'; // Updated import

export type TextareaProps = {
    rows?: number;
    size?: 'sm' | 'md' | 'lg';
    showCharacterCount?: boolean;
    maxLength?: number;
};

export type TextareaDropletDefinition = StringDropletDefinition & {
    props?: TextareaProps;
};

export const TextareaDroplet: DropletBuilderComponent<TextareaDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);

    const triggerDefinition = { type: 'system', name: `${definition.name}Changed`, enabled: true };

    const trigger = useTriggerState(form, triggerDefinition);

    const { handleTrigger } = useTriggerActions(form, triggerDefinition);

    if (!droplet || droplet.visible === false) return null;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        updateValue(value);
        trigger.signalData = value;
        handleTrigger();
    };

    return (
        <Ark.TextareaInput
            id={droplet.id}
            label={definition.label}
            value={droplet.value || ''}
            onChange={handleChange}
            placeholder={definition.placeholder}
            size={definition.props?.size ?? 'md'}
            required={definition.required ?? false}
            disabled={definition.enabled === false}
            rows={definition.props?.rows}
            readOnly={definition.readonly}
            showCharacterCount={definition.props?.showCharacterCount}
            helperText={definition.helperText}
            maxLength={definition.props?.maxLength}
        />
    );
};

dropletRegistry.register("tecnosys-textarea", TextareaDroplet);

export default TextareaDroplet;
