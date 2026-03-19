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

export type BreadcrumbItem = {
    id: string;
    label: string;
    disabled?: boolean;
    href?: string;
};

export type BreadcrumbProps = {
    /** The visual separator between each breadcrumb item */
    separator?: string;
    /** Size variant */
    size?: Ark.BreadcrumbProps['size'];
};

export type BreadcrumbData = {
    items: BreadcrumbItem[];
};

export type BreadcrumbDropletDefinition = DropletDefinition<BreadcrumbData> & {
    props?: BreadcrumbProps;
};

export const BreadcrumbDroplet: DropletBuilderComponent<BreadcrumbDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const clickTrigger = { type: 'system', name: `${definition.name}ItemClick`, enabled: true };
    useTriggerState(form, clickTrigger);
    const { handleTrigger: handleItemClick } = useTriggerActions(form, clickTrigger);

    if (!droplet || droplet.visible === false) return null;

    const items: Ark.BreadcrumbItemDef[] = (droplet.value?.items ?? []).map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        disabled: item.disabled,
    }));

    return (
        <Ark.Breadcrumb
            items={items}
            separator={definition.props?.separator}
            size={definition.props?.size}
            onItemClick={() => handleItemClick()}
        />
    );
};

dropletRegistry.register("tecnosys-breadcrumb", BreadcrumbDroplet);

export default BreadcrumbDroplet;
