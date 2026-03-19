import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { poolRegistry, PoolDefinition } from '@tecnosys/stillum-forms-core';
import { PoolBuilderComponent, useTriggerActions, useTriggerState } from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

interface AccordionDataContext {
  items?: any[];
  selectedItems?: any[];
  itemCurrent?: any;
}

export type AccordionPoolDefinition = PoolDefinition & {
  props?: Partial<Ark.AccordionProps<any>> & {
    itemKey?: string;
  };
  triggers?: {
    name: string;
    type?: string;
    [key: string]: any;
  }[];
};

const AccordionPool: PoolBuilderComponent<AccordionPoolDefinition> = ({
  definition,
  form,
  PoolsTag,
  TriggersTag,
}) => {
  const props = definition.props || {};
  const accordionDataContext = form?.getDataContext() as AccordionDataContext;
  const itemKey = props.itemKey || 'id';

  const itemClickTriggerDefinition = useMemo(
    () => ({
      type: 'system',
      name: `${definition.name}ItemClick`,
      enabled: true,
    }),
    [definition.name],
  );
  const itemClickTrigger = useTriggerState(form, itemClickTriggerDefinition);
  const { handleTrigger: triggerItemClick } = useTriggerActions(form, itemClickTriggerDefinition);

  const itemClickTriggerRef = useRef(itemClickTrigger);
  itemClickTriggerRef.current = itemClickTrigger;

  const selectionChangeTriggerDefinition = useMemo(
    () => ({
      type: 'system',
      name: `${definition.name}SelectionChange`,
      enabled: true,
    }),
    [definition.name],
  );
  const selectionChangeTrigger = useTriggerState(form, selectionChangeTriggerDefinition);
  const { handleTrigger: triggerSelectionChange } = useTriggerActions(
    form,
    selectionChangeTriggerDefinition,
  );

  const selectionChangeTriggerRef = useRef(selectionChangeTrigger);
  selectionChangeTriggerRef.current = selectionChangeTrigger;

  // Local state for items
  const [currentItems, setCurrentItems] = useState<any[]>(
    accordionDataContext?.items || props.datasource || [],
  );

  // Sync with data context changes
  useEffect(() => {
    if (accordionDataContext?.items) {
      setCurrentItems(accordionDataContext.items);
    }
  }, [accordionDataContext?.items]);

  const renderTrigger = useCallback(
    (item: any, index: number, isSelected: boolean, isCurrent: boolean) => {
      return (
        <div className="flex items-center gap-2">
          <span>{item.label || item.title || item[itemKey]}</span>
        </div>
      );
    },
    [itemKey],
  );

  const renderContent = useCallback(
    (item: any, index: number, isSelected: boolean, isCurrent: boolean) => {
      if (!PoolsTag) return null;
      return <PoolsTag />;
    },
    [PoolsTag],
  );

  const handleItemClick = useCallback(
    (item: any, index: number) => {
      if (itemClickTriggerRef.current) {
        itemClickTriggerRef.current.signalData = item;
        triggerItemClick();
      }
    },
    [triggerItemClick],
  );

  const handleSelectItems = useCallback(
    (items: any[]) => {
      if (selectionChangeTriggerRef.current) {
        selectionChangeTriggerRef.current.signalData = items;
        triggerSelectionChange();
      }
    },
    [triggerSelectionChange],
  );

  return (
    <Ark.Accordion
      datasource={currentItems}
      itemKey={itemKey}
      renderTrigger={renderTrigger}
      renderContent={renderContent}
      onItemClick={handleItemClick}
      onSelectItems={handleSelectItems}
      selectedItems={accordionDataContext?.selectedItems || props.selectedItems}
      itemCurrent={accordionDataContext?.itemCurrent || props.itemCurrent}
      isMultiSelect={props.isMultiSelect}
      multiple={props.multiple}
      collapsible={props.collapsible}
      variant={props.variant}
      size={props.size}
      disabled={props.disabled}
      className={props.className}
    />
  );
};

poolRegistry.register('tecnosys-accordion', AccordionPool);

export default AccordionPool;
