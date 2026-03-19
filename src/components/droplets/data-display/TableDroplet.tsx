import { useMemo } from 'react';
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

// Define types locally since TableRow is from Ark types? No, define local Data shape.
export type TableRowData = Record<string, unknown>;
export type TableData = {
    rows: TableRowData[];
    headers?: TableColumn[];
    selectedRowIds?: string[];
    currentRowId?: string | number;
};

export type TableColumn = {
    header: string;
    accessorKey: string;
    id?: string;
};

export type TableProps = {
    size?: 'sm' | 'md' | 'lg';
    striped?: boolean;
    columns?: TableColumn[];
    isMultiselect?: boolean;
    sortable?: 'client' | 'server';
    showHeader?: boolean;
    reorderable?: boolean;
    loading?: boolean;
};

export type TableDropletDefinition = DropletDefinition<TableData> & {
    props?: TableProps;
    columns?: TableColumn[];
};

export const TableDroplet: DropletBuilderComponent<TableDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { handleTrigger: triggerRowClick } = useTriggerActions(form, { type: 'system', name: `${definition.name}RowClicked`, enabled: true });
    const { handleTrigger: triggerSelectionChange } = useTriggerActions(form, { type: 'system', name: `${definition.name}SelectionChange`, enabled: true });

    useTriggerState(form, { type: 'system', name: `${definition.name}RowClicked`, enabled: true });
    useTriggerState(form, { type: 'system', name: `${definition.name}SelectionChange`, enabled: true });

    const rows = (droplet?.value?.rows || []) as TableRowData[];
    const selectedRowIds = droplet?.value?.selectedRowIds;
    const currentRowId = droplet?.value?.currentRowId;

    const tableHeaders = useMemo(() => {
        const rawHeaders = droplet?.value?.headers || definition.columns || definition.props?.columns || [];
        return rawHeaders.map(col => ({
            key: col.accessorKey || (col as any).key,
            value: col.header || (col as any).value,
            id: col.id
        }));
    }, [droplet?.value?.headers, definition.columns, definition.props?.columns]);

    const tableRows = useMemo(() => {
        return rows.map((item, index) => ({
            ...item,
            id: (item as any).id || `row-${index}`
        }));
    }, [rows]);

    // Early return AFTER all hooks have been called
    if (!droplet || droplet.visible === false) return null;

    const handleRowClick = (row: any) => {
        (triggerRowClick as any)(row);
    }

    const handleSelectionChange = (selectedIds: string[]) => {
        (triggerSelectionChange as any)(selectedIds);
    }

    return (
        <Ark.Table
            headers={tableHeaders}
            rows={tableRows}
            selectedRowIds={selectedRowIds}
            currentRowId={currentRowId}
            striped={definition.props?.striped}
            onRowClick={handleRowClick}
            onSelectionChange={handleSelectionChange}
            isMultiselect={definition.props?.isMultiselect}
            sortable={definition.props?.sortable}
            showHeader={definition.props?.showHeader}
            reorderable={definition.props?.reorderable}
            loading={definition.props?.loading}
            disabled={droplet.enabled === false}
        />
    );
};

dropletRegistry.register("tecnosys-table", TableDroplet);

export default TableDroplet;
