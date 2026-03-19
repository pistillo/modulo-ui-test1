import {
    DropletDefinition,
    dropletRegistry,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
    useTriggerState,
    useTriggerActions,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';


export type BadgeProps = {
    size?: Ark.BadgeSize;
    variant?: Ark.BadgeVariant;
    color?: Ark.BadgeColor;
};

export type BadgeDropletDefinition = DropletDefinition<string> & {
    props?: BadgeProps;
};

export const BadgeDroplet: DropletBuilderComponent<BadgeDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    const clickTrigger = { type: 'system', name: `${definition.name}Click`, enabled: true };
    useTriggerState(form, clickTrigger);
    const { handleTrigger: handleClick } = useTriggerActions(form, clickTrigger);

    if (!droplet || droplet.visible === false) return null;

    const label = droplet.value || definition.label;

    return (
        <Ark.Badge
            size={definition.props?.size}
            variant={definition.props?.variant}
            color={definition.props?.color}
            onClick={() => handleClick()}
        >
            {label}
        </Ark.Badge>
    );
};

dropletRegistry.register("tecnosys-badge", BadgeDroplet);

export default BadgeDroplet;
