import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { poolRegistry, PoolDefinition } from '@tecnosys/stillum-forms-core';
import { PoolBuilderComponent, useTriggerActions, useTriggerState } from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

interface TabsDataContext {
  items?: Ark.TabItem[];
  selectedId?: string;
}

export type TabsPoolDefinition = PoolDefinition & {
  props?: Partial<Ark.TabsProps> & {};
  triggers?: {
    name: string;
    type?: string;
    [key: string]: any;
  }[];
};

const TabsPool: PoolBuilderComponent<TabsPoolDefinition> = ({
  definition,
  form,
  PoolsTag,
  TriggersTag,
}) => {
  const props = definition.props || {};
  const tabsDataContext = form?.getDataContext() as TabsDataContext;

  const tabClickTriggerDefinition = useMemo(
    () => ({
      type: 'system',
      name: `${definition.name}TabClick`,
      enabled: true,
    }),
    [definition.name],
  );
  const tabClickTrigger = useTriggerState(form, tabClickTriggerDefinition);
  const { handleTrigger: triggerTabClick } = useTriggerActions(form, tabClickTriggerDefinition);

  const tabClickTriggerRef = useRef(tabClickTrigger);
  tabClickTriggerRef.current = tabClickTrigger;

  const tabCloseTriggerDefinition = useMemo(
    () => ({
      type: 'system',
      name: `${definition.name}TabClose`,
      enabled: true,
    }),
    [definition.name],
  );
  const tabCloseTrigger = useTriggerState(form, tabCloseTriggerDefinition);
  const { handleTrigger: triggerTabClose } = useTriggerActions(form, tabCloseTriggerDefinition);

  const tabCloseTriggerRef = useRef(tabCloseTrigger);
  tabCloseTriggerRef.current = tabCloseTrigger;

  // Local state for tabs management
  const [currentItems, setCurrentItems] = useState<Ark.TabItem[]>(
    tabsDataContext?.items || [],
  );
  const [currentSelectedId, setCurrentSelectedId] = useState<string | undefined>(
    tabsDataContext?.selectedId ||
      props.selectedId ||
      (tabsDataContext?.items && tabsDataContext.items[0]?.id),
  );

  // Sync with data context changes
  useEffect(() => {
    if (tabsDataContext?.items) {
      setCurrentItems(tabsDataContext.items);
    }
  }, [tabsDataContext?.items]);

  useEffect(() => {
    if (tabsDataContext?.selectedId) {
      setCurrentSelectedId(tabsDataContext.selectedId);
    }
  }, [tabsDataContext?.selectedId]);

  // Helper to render content for a specific tab
  const renderTabContent = useCallback(
    (tab: Ark.TabItem, isActive: boolean) => {
      if (!PoolsTag) return null;
      return <PoolsTag />;
    },
    [PoolsTag],
  );

  const handleTabClick = useCallback(
    (tab: Ark.TabItem) => {
      if (tabClickTriggerRef.current) {
        tabClickTriggerRef.current.signalData = tab;
        triggerTabClick();
      }
    },
    [triggerTabClick],
  );

  const handleTabClose = useCallback(
    (id: string) => {
      if (tabCloseTriggerRef.current) {
        tabCloseTriggerRef.current.signalData = id;
        triggerTabClose();
      }
    },
    [triggerTabClose],
  );

  return (
    <Ark.Tabs
      items={currentItems}
      selectedId={currentSelectedId}
      onTabClick={handleTabClick}
      onTabClose={handleTabClose}
      renderTabContent={renderTabContent}
      orientation={props.orientation || 'horizontal'}
      variant={props.variant || 'pills'}
      size={props.size || 'md'}
      fullWidth={props.fullWidth}
      className={props.className}
    />
  );
};

poolRegistry.register('tecnosys-tabs', TabsPool);

export default TabsPool;
