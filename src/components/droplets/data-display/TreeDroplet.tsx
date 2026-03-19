import { useMemo } from 'react';
import {
    dropletRegistry,
    DropletDefinition,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
    useDropletActions,
    useTriggerState,
    useTriggerActions,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type TreeNode = {
    id: string;
    label: string;
    name: string;
    children?: TreeNode[];
    [key: string]: unknown;
};

export type TreeData = {
    rootNode: TreeNode;
    selectedValue?: string[];
    expandedValue?: string[];
    checkedValue?: string[];
    focusedValue?: string;
};

export type TreeProps = {
    selectionMode?: 'single' | 'multiple';
    checkable?: boolean;
    draggable?: boolean;
    preventCycles?: boolean;
    allowExpandAll?: boolean;
    toolbarPosition?: 'top' | 'bottom' | 'left' | 'right';
    filter?: string;
};

export type TreeDropletDefinition = DropletDefinition<TreeData> & {
    props?: TreeProps;
};

export const TreeDroplet: DropletBuilderComponent<TreeDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);
    const { handleTrigger: onNodeSelect } = useTriggerActions(form, { type: 'system', name: `${definition.name}NodeSelected`, enabled: true });
    const { handleTrigger: onNodeCheck } = useTriggerActions(form, { type: 'system', name: `${definition.name}NodeChecked`, enabled: true });
    const { handleTrigger: onNodeExpand } = useTriggerActions(form, { type: 'system', name: `${definition.name}NodeExpanded`, enabled: true });

    useTriggerState(form, { type: 'system', name: `${definition.name}NodeChecked`, enabled: true });
    useTriggerState(form, { type: 'system', name: `${definition.name}NodeExpanded`, enabled: true });

    // Use optional chaining to safely access droplet.value even if droplet is null
    const rootNode = useMemo(() => {
        const rawRoot = droplet?.value?.rootNode || { id: 'root', label: 'Root', name: 'Root', children: [] };
        return {
            ...rawRoot,
            name: rawRoot.name || rawRoot.label
        };
    }, [droplet?.value?.rootNode]);

    const collection = useMemo(() => Ark.createTreeCollection<TreeNode>({
        nodeToValue: (node) => node.id,
        nodeToChildren: (node) => node.children ?? [],
        rootNode: rootNode,
    }), [rootNode]);

    // Early return AFTER all hooks have been called
    if (!droplet || droplet.visible === false) return null;

    const handleSelectionChange = (details: { selectedValue: string[] }) => {
        // Update droplet value with new selection
        updateValue({
            ...droplet.value,
            selectedValue: details.selectedValue
        });
        (onNodeSelect as any)(details.selectedValue);
    };

    const handleCheckedChange = (details: { checkedValue: string[] }) => {
        // Update droplet value with new checked items
        updateValue({
            ...droplet.value,
            checkedValue: details.checkedValue
        });
        (onNodeCheck as any)(details.checkedValue);
    };

    const handleExpandedChange = (details: { expandedValue: string[] }) => {
        // Update droplet value with new expanded nodes
        updateValue({
            ...droplet.value,
            expandedValue: details.expandedValue
        });
        (onNodeExpand as any)(details.expandedValue);
    };

    return (
        <Ark.TreeView
            collection={collection}
            selectedValue={droplet.value?.selectedValue}
            expandedValue={droplet.value?.expandedValue}
            checkedValue={droplet.value?.checkedValue}
            focusedValue={droplet.value?.focusedValue}
            selectionMode={definition.props?.selectionMode}
            checkable={definition.props?.checkable}
            draggable={definition.props?.draggable}
            preventCycles={definition.props?.preventCycles}
            allowExpandAll={definition.props?.allowExpandAll}
            toolbarPosition={definition.props?.toolbarPosition}
            disabled={definition.enabled === false}
            filter={definition.props?.filter}
            onSelectionChange={handleSelectionChange}
            onCheckedChange={handleCheckedChange}
            onExpandedChange={handleExpandedChange}
        />
    );
};

dropletRegistry.register("tecnosys-tree", TreeDroplet);

export default TreeDroplet;
