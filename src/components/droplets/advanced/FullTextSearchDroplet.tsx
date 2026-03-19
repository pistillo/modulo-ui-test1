import { useCallback, useMemo, useRef } from 'react';
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

export type FullTextSearchData = {
    value?: string | null;
    results?: Ark.FullTextSearchList | null;
};

export type FullTextSearchProps = {
    expandable?: boolean;
    expandFrom?: 'left' | 'right';
    loading?: boolean;
};

export type FullTextSearchDropletDefinition = DropletDefinition<FullTextSearchData> & {
    props?: FullTextSearchProps;
};

export const FullTextSearchDroplet: DropletBuilderComponent<FullTextSearchDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);

    const changedTriggerDefinition = useMemo(() => ({
        type: 'system',
        name: `${definition.name}Changed`,
        enabled: true
    }), [definition.name]);
    const changedTrigger = useTriggerState(form, changedTriggerDefinition);
    const { handleTrigger: triggerChanged } = useTriggerActions(form, changedTriggerDefinition);
    const changedTriggerRef = useRef(changedTrigger);
    changedTriggerRef.current = changedTrigger;

    const itemClickTriggerDefinition = useMemo(() => ({
        type: 'system',
        name: `${definition.name}ItemClick`,
        enabled: true
    }), [definition.name]);
    const itemClickTrigger = useTriggerState(form, itemClickTriggerDefinition);
    const { handleTrigger: triggerItemClick } = useTriggerActions(form, itemClickTriggerDefinition);
    const itemClickTriggerRef = useRef(itemClickTrigger);
    itemClickTriggerRef.current = itemClickTrigger;

    const advancedSearchClickTriggerDefinition = useMemo(() => ({
        type: 'system',
        name: `${definition.name}ViewAllGroupClick`,
        enabled: true
    }), [definition.name]);
    const advancedSearchClickTrigger = useTriggerState(form, advancedSearchClickTriggerDefinition);
    const { handleTrigger: triggerAdvancedSearchClick } = useTriggerActions(form, advancedSearchClickTriggerDefinition);
    const advancedSearchClickTriggerRef = useRef(advancedSearchClickTrigger);
    advancedSearchClickTriggerRef.current = advancedSearchClickTrigger;

    const quickActionClickTriggerDefinition = useMemo(() => ({
        type: 'system',
        name: `${definition.name}QuickActionClick`,
        enabled: true
    }), [definition.name]);
    const quickActionClickTrigger = useTriggerState(form, quickActionClickTriggerDefinition);
    const { handleTrigger: triggerQuickActionClick } = useTriggerActions(form, quickActionClickTriggerDefinition);
    const quickActionClickTriggerRef = useRef(quickActionClickTrigger);
    quickActionClickTriggerRef.current = quickActionClickTrigger;

    const currentData = useMemo(() => {
        if (droplet?.value && typeof droplet.value === 'object' && 'value' in droplet.value) {
            return droplet.value as FullTextSearchData;
        }
        return { value: typeof droplet?.value === 'string' ? droplet.value : '', results: null };
    }, [droplet?.value]);

    const inputValue = currentData.value || '';
    const results = currentData.results || null;

    const handleChange = useCallback((val: string) => {
        const current = (typeof droplet?.value === 'object' && droplet?.value) ? droplet.value : {};
        updateValue({ ...current, value: val });

        if (changedTriggerRef.current) {
            changedTriggerRef.current.signalData = val;
            triggerChanged();
        }
    }, [droplet?.value, updateValue, triggerChanged]);

    const handleItemClick = useCallback((item: Ark.FullTextSearchItem, group: string) => {
        if (itemClickTriggerRef.current) {
            itemClickTriggerRef.current.signalData = { item, group };
            triggerItemClick();
        }
    }, [triggerItemClick]);

    const handleAdvancedSearchClick = useCallback((group: Ark.FullTextSearchGroup) => {
        if (advancedSearchClickTriggerRef.current) {
            advancedSearchClickTriggerRef.current.signalData = group;
            triggerAdvancedSearchClick();
        }
    }, [triggerAdvancedSearchClick]);

    const handleQuickActionClick = useCallback((actionId: string) => {
        if (quickActionClickTriggerRef.current) {
            quickActionClickTriggerRef.current.signalData = actionId;
            triggerQuickActionClick();
        }
    }, [triggerQuickActionClick]);

    // Early return AFTER all hooks have been called
    if (!droplet || droplet.visible === false) return null;

    return (
        <Ark.FullTextSearch
            inputValue={inputValue}
            onChange={handleChange}
            placeholder={definition.placeholder}
            results={results}
            onItemClick={handleItemClick}
            onAdvancedSearchClick={handleAdvancedSearchClick}
            onQuickActionClick={handleQuickActionClick}
            expandable={definition.props?.expandable}
            expandFrom={definition.props?.expandFrom}
            loading={definition.props?.loading}
        />
    );
};

dropletRegistry.register("tecnosys-full-text-search", FullTextSearchDroplet);

export default FullTextSearchDroplet;
