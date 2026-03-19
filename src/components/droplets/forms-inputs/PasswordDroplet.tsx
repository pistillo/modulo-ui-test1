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

export type PasswordProps = {
    size?: 'sm' | 'md' | 'lg';
    autoComplete?: "current-password" | "new-password";
};

export type PasswordDropletDefinition = StringDropletDefinition & {
    props?: PasswordProps;
};

export const PasswordDroplet: DropletBuilderComponent<PasswordDropletDefinition> = ({
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
        <Ark.PasswordInput
            id={droplet.id}
            value={droplet.value}
            onChange={handleChange}
            label={definition.label}
            helperText={definition.helperText}
            placeholder={definition.placeholder}
            size={definition.props?.size}
            required={definition.required ?? false}
            disabled={definition.enabled === false}
            autoComplete={definition.props?.autoComplete}
            readOnly={definition.readonly}
        />
    );
};

dropletRegistry.register("tecnosys-password", PasswordDroplet);

export default PasswordDroplet;
