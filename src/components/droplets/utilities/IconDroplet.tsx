import {
    DropletDefinition,
    dropletRegistry,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type IconProps = {
    icon?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | undefined;
    color?: "primary" | "success" | "error" | "warning" | "info" | "muted" | "muted-light" | "black" | "white" | undefined;
};

export type IconDropletDefinition = DropletDefinition<string> & {
    props?: IconProps;
};

export const IconDroplet: DropletBuilderComponent<IconDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    if (!droplet || droplet.visible === false) return null;

    return (
        <Ark.Icon
            icon={definition.props?.icon || ""}
            size={definition.props?.size}
            color={definition.props?.color}
        />
    );
};

dropletRegistry.register("tecnosys-icon", IconDroplet);

export default IconDroplet;
