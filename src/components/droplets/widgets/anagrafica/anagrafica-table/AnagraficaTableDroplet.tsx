import { useMemo, useCallback, useRef } from 'react';
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

// ══════════════════════════════════════════════════════════════════════════
// Type Definitions - Re-export from @tecnosys/components
// ══════════════════════════════════════════════════════════════════════════

// Import types directly from Ark components
export type AnagraficaTableItem = Ark.AnagraficaTableItem;
export type AnagraficaTableReferente = Ark.AnagraficaTableReferente;

/**
 * Struttura dati per AnagraficaTableDroplet.
 */
export type AnagraficaTableData = {
    /** Righe della tabella */
    items: AnagraficaTableItem[];
    /** Id delle righe selezionate */
    selectedIds?: string[];
    /** Query di ricerca corrente */
    searchQuery?: string;
};

/**
 * Props specifiche del componente AnagraficaTable.
 */
export type AnagraficaTableProps = {
    /** Mostra SearchInput */
    showSearch?: boolean;
    /** Abilita selezione multipla */
    enableSelection?: boolean;
    /** Mostra pulsante Esporta nella bulk bar */
    showExportButton?: boolean;
    /** Mostra pulsante Elimina nella bulk bar */
    showDeleteButton?: boolean;
    /** Stato loading della tabella */
    loading?: boolean;
    /** Stato loading infinite scroll */
    loadingMore?: boolean;
    /** Classe CSS aggiuntiva */
    className?: string;
};

/**
 * Definizione completa del droplet AnagraficaTable.
 */
export type AnagraficaTableDropletDefinition = DropletDefinition<AnagraficaTableData> & {
    props?: AnagraficaTableProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

export const AnagraficaTableDroplet: DropletBuilderComponent<AnagraficaTableDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);

    // ── Triggers Definition ─────────────────────────────────────────────────
    
    // Dettaglio click trigger
    const dettaglioTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}Dettaglio`,
        enabled: true,
    }), [definition.name]);
    
    // Stampa scheda trigger
    const stampaSchedaTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}StampaScheda`,
        enabled: true,
    }), [definition.name]);
    
    // Documenti allegati trigger
    const documentiAllegatiTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}DocumentiAllegati`,
        enabled: true,
    }), [definition.name]);
    
    // Modifica trigger
    const modificaTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}Modifica`,
        enabled: true,
    }), [definition.name]);
    
    // Selection change trigger
    const selectionChangeTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}SelectionChange`,
        enabled: true,
    }), [definition.name]);
    
    // Search trigger
    const searchTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}Search`,
        enabled: true,
    }), [definition.name]);
    
    // Esporta trigger
    const esportaTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}Esporta`,
        enabled: true,
    }), [definition.name]);
    
    // Elimina selezionate trigger
    const eliminaSelezionateTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}EliminaSelezionate`,
        enabled: true,
    }), [definition.name]);
    
    // Sort change trigger
    const sortChangeTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}SortChange`,
        enabled: true,
    }), [definition.name]);
    
    // Load more trigger (infinite scroll)
    const loadMoreTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}LoadMore`,
        enabled: true,
    }), [definition.name]);

    // ── Register Triggers ───────────────────────────────────────────────────
    
    const dettaglioTrigger = useTriggerState(form, dettaglioTriggerDef);
    const stampaSchedaTrigger = useTriggerState(form, stampaSchedaTriggerDef);
    const documentiAllegatiTrigger = useTriggerState(form, documentiAllegatiTriggerDef);
    const modificaTrigger = useTriggerState(form, modificaTriggerDef);
    const selectionChangeTrigger = useTriggerState(form, selectionChangeTriggerDef);
    const searchTrigger = useTriggerState(form, searchTriggerDef);
    const esportaTrigger = useTriggerState(form, esportaTriggerDef);
    const eliminaSelezionateTrigger = useTriggerState(form, eliminaSelezionateTriggerDef);
    const sortChangeTrigger = useTriggerState(form, sortChangeTriggerDef);
    const loadMoreTrigger = useTriggerState(form, loadMoreTriggerDef);

    // ── Trigger Actions ─────────────────────────────────────────────────────
    
    const { handleTrigger: triggerDettaglio } = useTriggerActions(form, dettaglioTriggerDef);
    const { handleTrigger: triggerStampaScheda } = useTriggerActions(form, stampaSchedaTriggerDef);
    const { handleTrigger: triggerDocumentiAllegati } = useTriggerActions(form, documentiAllegatiTriggerDef);
    const { handleTrigger: triggerModifica } = useTriggerActions(form, modificaTriggerDef);
    const { handleTrigger: triggerSelectionChange } = useTriggerActions(form, selectionChangeTriggerDef);
    const { handleTrigger: triggerSearch } = useTriggerActions(form, searchTriggerDef);
    const { handleTrigger: triggerEsporta } = useTriggerActions(form, esportaTriggerDef);
    const { handleTrigger: triggerEliminaSelezionate } = useTriggerActions(form, eliminaSelezionateTriggerDef);
    const { handleTrigger: triggerSortChange } = useTriggerActions(form, sortChangeTriggerDef);
    const { handleTrigger: triggerLoadMore } = useTriggerActions(form, loadMoreTriggerDef);

    // ── Refs for trigger state ──────────────────────────────────────────────
    
    const dettaglioTriggerRef = useRef(dettaglioTrigger);
    dettaglioTriggerRef.current = dettaglioTrigger;
    
    const stampaSchedaTriggerRef = useRef(stampaSchedaTrigger);
    stampaSchedaTriggerRef.current = stampaSchedaTrigger;
    
    const documentiAllegatiTriggerRef = useRef(documentiAllegatiTrigger);
    documentiAllegatiTriggerRef.current = documentiAllegatiTrigger;
    
    const modificaTriggerRef = useRef(modificaTrigger);
    modificaTriggerRef.current = modificaTrigger;
    
    const selectionChangeTriggerRef = useRef(selectionChangeTrigger);
    selectionChangeTriggerRef.current = selectionChangeTrigger;
    
    const searchTriggerRef = useRef(searchTrigger);
    searchTriggerRef.current = searchTrigger;
    
    const esportaTriggerRef = useRef(esportaTrigger);
    esportaTriggerRef.current = esportaTrigger;
    
    const eliminaSelezionateTriggerRef = useRef(eliminaSelezionateTrigger);
    eliminaSelezionateTriggerRef.current = eliminaSelezionateTrigger;
    
    const sortChangeTriggerRef = useRef(sortChangeTrigger);
    sortChangeTriggerRef.current = sortChangeTrigger;

    // ── Data Extraction ─────────────────────────────────────────────────────
    
    const data = useMemo(() => {
        if (droplet?.value && typeof droplet.value === 'object') {
            return droplet.value as AnagraficaTableData;
        }
        return { items: [], selectedIds: [], searchQuery: '' };
    }, [droplet?.value]);

    const items = data.items || [];
    const selectedIds = data.selectedIds || [];
    const searchQuery = data.searchQuery || '';

    // ── Event Handlers ──────────────────────────────────────────────────────
    
    const handleDettaglio = useCallback((id: string) => {
        if (dettaglioTriggerRef.current) {
            dettaglioTriggerRef.current.signalData = { id };
        }
        triggerDettaglio();
    }, [triggerDettaglio]);

    const handleStampaScheda = useCallback((id: string) => {
        if (stampaSchedaTriggerRef.current) {
            stampaSchedaTriggerRef.current.signalData = { id };
        }
        triggerStampaScheda();
    }, [triggerStampaScheda]);

    const handleDocumentiAllegati = useCallback((id: string) => {
        if (documentiAllegatiTriggerRef.current) {
            documentiAllegatiTriggerRef.current.signalData = { id };
        }
        triggerDocumentiAllegati();
    }, [triggerDocumentiAllegati]);

    const handleModifica = useCallback((id: string) => {
        if (modificaTriggerRef.current) {
            modificaTriggerRef.current.signalData = { id };
        }
        triggerModifica();
    }, [triggerModifica]);

    const handleSelectionChange = useCallback((newSelectedIds: string[]) => {
        // Update droplet value with new selection
        updateValue({
            ...data,
            selectedIds: newSelectedIds,
        });
        
        if (selectionChangeTriggerRef.current) {
            selectionChangeTriggerRef.current.signalData = { selectedIds: newSelectedIds };
        }
        triggerSelectionChange();
    }, [data, updateValue, triggerSelectionChange]);

    const handleSearch = useCallback((query: string) => {
        // Update droplet value with search query
        updateValue({
            ...data,
            searchQuery: query,
        });
        
        if (searchTriggerRef.current) {
            searchTriggerRef.current.signalData = { query };
        }
        triggerSearch();
    }, [data, updateValue, triggerSearch]);

    const handleEsporta = useCallback((ids: string[]) => {
        if (esportaTriggerRef.current) {
            esportaTriggerRef.current.signalData = { selectedIds: ids };
        }
        triggerEsporta();
    }, [triggerEsporta]);

    const handleEliminaSelezionate = useCallback((ids: string[]) => {
        if (eliminaSelezionateTriggerRef.current) {
            eliminaSelezionateTriggerRef.current.signalData = { selectedIds: ids };
        }
        triggerEliminaSelezionate();
    }, [triggerEliminaSelezionate]);

    const handleSortChange = useCallback((columnKey: string | null, direction: 'asc' | 'desc' | null) => {
        if (sortChangeTriggerRef.current) {
            sortChangeTriggerRef.current.signalData = { columnKey, direction };
        }
        triggerSortChange();
    }, [triggerSortChange]);

    const handleLoadMore = useCallback(() => {
        triggerLoadMore();
    }, [triggerLoadMore]);

    // ── Early Return Check ──────────────────────────────────────────────────
    
    if (!droplet || droplet.visible === false) return null;

    // ── Render ──────────────────────────────────────────────────────────────
    
    return (
        <Ark.AnagraficaTable
            // Data
            items={items}
            selectedIds={selectedIds}
            searchQuery={searchQuery}
            
            // Event handlers
            onDettaglio={handleDettaglio}
            onStampaScheda={handleStampaScheda}
            onDocumentiAllegati={handleDocumentiAllegati}
            onModifica={handleModifica}
            onSelectionChange={definition.props?.enableSelection !== false ? handleSelectionChange : undefined}
            onSearch={definition.props?.showSearch !== false ? handleSearch : undefined}
            onEsporta={definition.props?.showExportButton !== false ? handleEsporta : undefined}
            onEliminaSelezionate={definition.props?.showDeleteButton !== false ? handleEliminaSelezionate : undefined}
            onSortChange={handleSortChange}
            onLoadMore={handleLoadMore}
            
            // Props
            loading={definition.props?.loading}
            loadingMore={definition.props?.loadingMore}
            className={definition.props?.className}
        />
    );
};

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register("tecnosys-anagrafica-table", AnagraficaTableDroplet);

export default AnagraficaTableDroplet;
