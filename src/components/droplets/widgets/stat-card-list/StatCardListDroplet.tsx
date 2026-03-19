import { useMemo, useCallback } from 'react';
import {
    DropletDefinition,
    dropletRegistry,
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
// Local Type Definitions (non exported to avoid barrel conflicts)
// ══════════════════════════════════════════════════════════════════════════

/**
 * Variante visiva della stat card.
 * - `default`  → tono secondario / neutro
 * - `primary`  → colore brand primario
 * - `success`  → verde
 * - `warning`  → giallo/arancio
 * - `danger`   → rosso
 */
type StatCardVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

/**
 * Singolo item della lista di stat-card.
 */
interface StatCardItem {
    /** Identificatore univoco */
    id: string;
    /** Titolo sotto il valore (es. "Totale Anagrafiche") */
    title: string;
    /** Valore numerico da mostrare in grande */
    value: number;
    /** Variante colore */
    variant?: StatCardVariant;
    /** Nome icona Lucide da mostrare nel badge circolare */
    icon: string;
    /** Mostra un dot di alert colorato accanto al valore */
    hasAlert?: boolean;
}

// ══════════════════════════════════════════════════════════════════════════
// Droplet Type Definitions
// ══════════════════════════════════════════════════════════════════════════

/**
 * Data structure for StatCardList
 */
interface StatCardListData {
    /** Array di card da renderizzare */
    items?: StatCardItem[];
    /** Id degli item attualmente selezionati */
    selectedIds?: string[];
}

/**
 * Component-specific props
 */
interface StatCardListProps {
    /** Numero di colonne della griglia responsive */
    columns?: 2 | 3 | 4 | 5 | 6;
    /** Custom CSS class name */
    className?: string;
}

/**
 * Complete droplet definition
 */
type StatCardListDropletDefinition = DropletDefinition<StatCardListData> & {
    props?: StatCardListProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

/**
 * StatCardListDroplet — Griglia di stat-card data-driven.
 *
 * Features:
 * - Griglia responsive con colonne configurabili
 * - Ogni card mostra icona, valore e titolo
 * - Supporto selezione multipla (selectedIds)
 * - Alert dot per notifiche
 * - Varianti colore per ogni card
 *
 * Triggers:
 * - ItemClick: fired when a card is clicked, payload contains item id
 * - SelectionChange: fired when selection changes
 */
export const StatCardListDroplet: DropletBuilderComponent<StatCardListDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);

    // ── Triggers ────────────────────────────────────────────────────────────
    const itemClickTrigger = { type: 'system', name: `${definition.name}ItemClick`, enabled: true };
    const selectionChangeTrigger = { type: 'system', name: `${definition.name}SelectionChange`, enabled: true };

    useTriggerState(form, itemClickTrigger);
    useTriggerState(form, selectionChangeTrigger);

    const { handleTrigger: triggerItemClick } = useTriggerActions(form, itemClickTrigger);
    const { handleTrigger: triggerSelectionChange } = useTriggerActions(form, selectionChangeTrigger);

    // ── Data extraction ─────────────────────────────────────────────────────
    const data = droplet?.value as StatCardListData | undefined;
    const items = data?.items || [];
    const selectedIds = data?.selectedIds || [];

    // ── Props extraction ────────────────────────────────────────────────────
    const {
        columns = 4,
        className,
    } = definition.props || {};

    // ── Memoized handlers ───────────────────────────────────────────────────
    const handleItemClick = useCallback((id: string) => {
        // Toggle selection
        const isSelected = selectedIds.includes(id);
        const newSelectedIds = isSelected
            ? selectedIds.filter(sid => sid !== id)
            : [...selectedIds, id];

        // Update value with new selection
        updateValue({ ...data, selectedIds: newSelectedIds });

        // Fire triggers
        (triggerItemClick as (payload: unknown) => void)({ id });
        (triggerSelectionChange as (payload: unknown) => void)({ selectedIds: newSelectedIds });
    }, [selectedIds, data, updateValue, triggerItemClick, triggerSelectionChange]);

    // ── Memoized class names ────────────────────────────────────────────────
    const wrapperClass = useMemo(
        () => ['stat-card-list-wrapper', className].filter(Boolean).join(' '),
        [className]
    );

    const gridClass = useMemo(
        () => ['stat-card-list-container', `stat-card-list-container--cols-${columns}`].join(' '),
        [columns]
    );

    // ── Early return check ──────────────────────────────────────────────────
    if (!droplet || droplet.visible === false) return null;

    // ── Empty state (visible in editor) ─────────────────────────────────────
    if (items.length === 0) {
        return (
            <div className={wrapperClass}>
                <div className={gridClass} style={{ minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ark.StatCard
                        title={definition.label || 'Stat Card List'}
                        value={0}
                        icon="LayoutGrid"
                        color="default"
                        size="list"
                    />
                </div>
            </div>
        );
    }

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className={wrapperClass}>
            <div className={gridClass}>
                {items.map((item) => (
                    <Ark.StatCard
                        key={item.id}
                        title={item.title}
                        value={item.value}
                        icon={item.icon}
                        color={item.variant ?? 'default'}
                        selected={selectedIds.includes(item.id)}
                        onClick={() => handleItemClick(item.id)}
                        interactive={true}
                        hasAlert={item.hasAlert}
                        size="list"
                        aria-label={item.title}
                    />
                ))}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register('tecnosys-stat-card-list', StatCardListDroplet);

export default StatCardListDroplet;
