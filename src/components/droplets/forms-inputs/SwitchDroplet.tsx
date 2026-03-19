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

export type SwitchProps = {
    colorScheme?: string;
    spacing?: string | number;
    size?: 'sm' | 'md' | 'lg';
};

export type SwitchDropletDefinition = BooleanDropletDefinition & {
    props?: SwitchProps;
};

export const SwitchDroplet: DropletBuilderComponent<SwitchDropletDefinition> = ({
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

    const handleChange = (details: { checked: boolean }) => {
        updateValue(details.checked);
        trigger.signalData = details.checked;
        handleTrigger();
    };

    return (
        <Ark.Switch
            id={droplet.id}
            checked={droplet.value}
            label={definition.label}
            onCheckedChange={handleChange}
            helperText={definition.helperText}
            size={definition.props?.size ?? 'md'}
            required={definition.required ?? false}
            disabled={definition.enabled === false}
            readOnly={definition.readonly}
        />
    );
};

dropletRegistry.register("tecnosys-switch", SwitchDroplet);

export default SwitchDroplet;
