import {
    DropletDefinition,
    dropletRegistry,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';


export type AvatarProps = {
    size?: "sm" | "md" | "lg" | "xs" | "xl";
    src?: string;
    alt?: string;
};

export type AvatarDropletDefinition = DropletDefinition<string> & {
    props?: AvatarProps;
};

export const AvatarDroplet: DropletBuilderComponent<AvatarDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    if (!droplet || droplet.visible === false) return null;

    return (
        <Ark.Avatar
            src={definition.props?.src}
            size={definition.props?.size}
            alt={definition.props?.alt || "Avatar-" + droplet.name}
        />
    );
};

dropletRegistry.register("tecnosys-avatar", AvatarDroplet);

export default AvatarDroplet;
