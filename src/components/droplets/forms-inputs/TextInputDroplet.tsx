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
import { Ark } from '@tecnosys/components';

export type TextInputProps = {
    type?: string;
    size?: 'sm' | 'md' | 'lg';
    autoComplete?: string;
    leftIcon?: string;
    rightIcon?: string;
};

export type InputDropletDefinition = StringDropletDefinition & {
    props?: TextInputProps;
};

export const TextInputDroplet: DropletBuilderComponent<InputDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);

    const triggerDefinition = { type: 'system', name: `${definition.name}Changed`, enabled: true };

    const trigger = useTriggerState(form, triggerDefinition);

    const { handleTrigger } = useTriggerActions(form, triggerDefinition);

    if (!droplet || droplet.visible === false) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        updateValue(value);
        trigger.signalData = value;
        handleTrigger();
    };

    return (
        <Ark.TextInput
            id={droplet.id}
            value={droplet.value || ''}
            onChange={handleChange}
            helperText={definition.helperText}
            placeholder={definition.placeholder}
            label={definition.label}
            type={definition.props?.type ?? 'text'}
            size={definition.props?.size ?? 'md'}
            required={definition.required ?? false}
            disabled={definition.enabled === false}
            autoComplete={definition.props?.autoComplete}
            leftIcon={definition.props?.leftIcon}
            rightIcon={definition.props?.rightIcon}
            readOnly={definition.readonly}
        />
    );
};

dropletRegistry.register("tecnosys-input", TextInputDroplet);

export default TextInputDroplet;
