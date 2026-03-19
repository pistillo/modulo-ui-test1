import { useCallback, useMemo } from 'react';
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

// ══════════════════════════════════════════════════════════════════════════
// Local Type Definitions (non exported to avoid barrel conflicts)
// ══════════════════════════════════════════════════════════════════════════

/** Direzione del trend della statistica */
type StatTrendDirection = 'up' | 'down' | 'neutral';

/** Tema colore per l'icona e lo stile della card */
type StatColorTheme = 'default' | 'primary' | 'success' | 'warning' | 'danger';

/** Configurazione del trend mostrato sotto il valore */
interface StatTrend {
    /** Valore percentuale del trend */
    value: number | string;
    /** Testo descrittivo opzionale (es. "rispetto al mese scorso") */
    label?: string;
    /** Direzione del trend */
    direction: StatTrendDirection;
    /** Icona personalizzata per trend positivo */
    upIcon?: string;
    /** Icona personalizzata per trend negativo */
    downIcon?: string;
    /** Icona personalizzata per trend neutro */
    neutralIcon?: string;
}

// ══════════════════════════════════════════════════════════════════════════
// Droplet Type Definitions
// ══════════════════════════════════════════════════════════════════════════

/**
 * Data structure for StatCard
 */
interface StatCardData {
    /** Valore principale da mostrare (numero o stringa formattata) */
    value: string | number;
    /** Dati del trend opzionali */
    trend?: StatTrend;
}

/**
 * Component-specific props
 */
interface StatCardProps {
    /** Icona Lucide mostrata nell'header */
    icon?: string;
    /** Tema colore per icona e accenti visivi */
    color?: StatColorTheme;
    /**
     * Dimensione / layout della card.
     * - `default`: layout verticale standard
     * - `compact`: layout orizzontale compatto
     * - `list`: layout orizzontale per uso in liste
     */
    size?: 'default' | 'compact' | 'list';
    /** Stato di caricamento: sostituisce valore e trend con skeleton */
    loading?: boolean;
    /** Forza la card in modalità interattiva */
    interactive?: boolean;
    /** Indica che la card è attualmente selezionata */
    selected?: boolean;
    /** Mostra un dot di alert/notifica (solo in `size="list"`) */
    hasAlert?: boolean;
    /** Custom CSS class name */
    className?: string;
}

/**
 * Complete droplet definition
 */
type StatCardDropletDefinition = DropletDefinition<StatCardData> & {
    props?: StatCardProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

/**
 * StatCardDroplet — Widget per la visualizzazione di statistiche.
 *
 * Features:
 * - Titolo, valore principale, icona opzionale
 * - Trend con badge colorato (up/down/neutral)
 * - Tre layout: default, compact, list
 * - Stato di caricamento con skeleton
 * - Stato selezionato per filtri attivi
 * - Alert dot per notifiche
 *
 * Triggers:
 * - Click: fired when the card is clicked (interactive mode)
 */
export const StatCardDroplet: DropletBuilderComponent<StatCardDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    // ── Triggers ────────────────────────────────────────────────────────────
    const clickTrigger = { type: 'system', name: `${definition.name}Click`, enabled: true };
    useTriggerState(form, clickTrigger);
    const { handleTrigger: handleClick } = useTriggerActions(form, clickTrigger);

    // ── Data extraction ─────────────────────────────────────────────────────
    const data = droplet?.value as StatCardData | undefined;
    const value = data?.value ?? '';
    const trend = data?.trend;

    // ── Props extraction ────────────────────────────────────────────────────
    const {
        icon,
        color = 'default',
        size = 'default',
        loading = false,
        interactive,
        selected = false,
        hasAlert = false,
        className,
    } = definition.props || {};

    // ── Memoized handlers ───────────────────────────────────────────────────
    const handleCardClick = useCallback(() => {
        handleClick();
    }, [handleClick]);

    // ── Memoized trend object for Ark.StatCard ──────────────────────────────
    const arkTrend = useMemo(() => {
        if (!trend) return undefined;
        return {
            value: trend.value,
            label: trend.label,
            direction: trend.direction,
            upIcon: trend.upIcon,
            downIcon: trend.downIcon,
            neutralIcon: trend.neutralIcon,
        } as Ark.StatTrend;
    }, [trend]);

    // ── Early return check ──────────────────────────────────────────────────
    if (!droplet || droplet.visible === false) return null;

    // ── Determine interactivity ─────────────────────────────────────────────
    const isInteractive = interactive !== undefined ? interactive : true;

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <Ark.StatCard
            title={definition.label ?? ''}
            value={value}
            icon={icon}
            color={color}
            size={size}
            trend={arkTrend}
            loading={loading}
            interactive={isInteractive}
            selected={selected}
            hasAlert={hasAlert}
            onClick={isInteractive ? handleCardClick : undefined}
            className={className}
            aria-label={definition.label}
        />
    );
};

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register('tecnosys-stat-card', StatCardDroplet);

export default StatCardDroplet;
