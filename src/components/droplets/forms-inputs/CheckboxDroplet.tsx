import {
    dropletRegistry,
    BooleanDropletDefinition,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
    useDropletActions,
    useTriggerState,
    useTriggerActions,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type CheckboxProps = {
    colorScheme?: string;
    spacing?: string | number;
    iconColor?: string;
    size?: 'sm' | 'md' | 'lg';
};

export type CheckboxDropletDefinition = BooleanDropletDefinition & {
    props?: CheckboxProps;
};

export const CheckboxDroplet: DropletBuilderComponent<CheckboxDropletDefinition> = ({
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

    if (!droplet || droplet.visible === false) return null;

    const handleCheckedChange = (details: { checked: boolean | 'indeterminate' }) => {
        const value = details.checked === true;
        updateValue(value);
        trigger.signalData = value;
        handleTrigger();
    };

    return (
        <Ark.Checkbox
            id={droplet.id}
            checked={droplet.value}
            label={definition.label}
            helperText={definition.helperText}
            required={definition.required}
            onCheckedChange={handleCheckedChange}
            size={definition.props?.size ?? 'md'}
            disabled={definition.enabled === false}
            readOnly={definition.readonly}
        />
    );
};

dropletRegistry.register("tecnosys-checkbox", CheckboxDroplet);

export default CheckboxDroplet;
