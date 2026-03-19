import {
    dropletRegistry,
    DropletDefinition,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
    useTriggerState,
    useTriggerActions,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type ListData = {
    datasource: Record<string, unknown>[];
    selectedItems?: Record<string, unknown>[];
    currentItem?: Record<string, unknown> | null;
};

export type ListProps = {
    isMultiSelect?: boolean;
    orientation?: 'horizontal' | 'vertical';
    loading?: boolean;
    itemKey?: string;
};

export type ListDropletDefinition = DropletDefinition<ListData> & {
    props?: ListProps;
};

export const ListDroplet: DropletBuilderComponent<ListDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { handleTrigger: onItemClick } = useTriggerActions(form, { type: 'system', name: `${definition.name}ItemClick`, enabled: true });
    const { handleTrigger: onSelectionChange } = useTriggerActions(form, { type: 'system', name: `${definition.name}SelectionChange`, enabled: true });
    const { handleTrigger: onScrollEnd } = useTriggerActions(form, { type: 'system', name: `${definition.name}ScrollEnd`, enabled: true });

    useTriggerState(form, { type: 'system', name: `${definition.name}ItemClick`, enabled: true });
    useTriggerState(form, { type: 'system', name: `${definition.name}SelectionChange`, enabled: true });
    useTriggerState(form, { type: 'system', name: `${definition.name}ScrollEnd`, enabled: true });

    if (!droplet || droplet.visible === false) return null;

    // Destructure data from droplet value object
    const datasource = (droplet.value?.datasource || []) as Record<string, unknown>[];
    const selectedItems = droplet.value?.selectedItems;
    const currentItem = droplet.value?.currentItem;

    const handleItemClickInternal = (item: any) => {
        (onItemClick as any)(item);
    };

    const handleSelectItemsInternal = (items: any[]) => {
        (onSelectionChange as any)(items);
    };

    const handleScrollEndInternal = () => {
        (onScrollEnd as any)();
    }

    return (
        <Ark.List
            datasource={datasource}
            itemKey={(definition.props?.itemKey || 'id')}
            isMultiSelect={definition.props?.isMultiSelect}
            orientation={definition.props?.orientation}
            disabled={definition.enabled === false}
            isLoadingMore={definition.props?.loading}
            selectedItems={selectedItems}
            currentItem={currentItem}
            onItemClick={handleItemClickInternal}
            onSelectItems={handleSelectItemsInternal}
            onScrollEnd={handleScrollEndInternal}
        >
            {(item: Record<string, unknown>) => (
                <>
                    {String(item.label || item.name || item.title || JSON.stringify(item))}
                </>
            )}
        </Ark.List>
    );
};

dropletRegistry.register("tecnosys-list", ListDroplet);

export default ListDroplet;
