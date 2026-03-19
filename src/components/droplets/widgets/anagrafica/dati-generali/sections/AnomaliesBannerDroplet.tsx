import { useMemo, useCallback, useRef } from 'react';
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

// ══════════════════════════════════════════════════════════════════════════
// Type Definitions
// ══════════════════════════════════════════════════════════════════════════

/**
 * Informazioni su una singola anomalia anagrafica.
 */
export interface AnomaliaInfo {
    /** Identificatore univoco dell'anomalia */
    id: string;
    /** Codice anomalia (es. "CF_MISMATCH", "PIVA_INVALID") */
    codice?: string;
    /** Descrizione testuale dell'anomalia */
    descrizione: string;
    /** Severità dell'anomalia */
    severity?: 'warning' | 'error';
}

/**
 * Struttura dati per AnomaliesBannerDroplet.
 * Un array di anomalie da visualizzare nel banner.
 */
export type AnomaliesBannerData = AnomaliaInfo[];

/**
 * Props specifiche del componente AnomaliesBanner.
 */
export type AnomaliesBannerProps = {
    /** Mostra il pulsante "Risolvi" */
    showResolveButton?: boolean;
    /** Classe CSS aggiuntiva */
    className?: string;
};

/**
 * Definizione completa del droplet AnomaliesBanner.
 */
export type AnomaliesBannerDropletDefinition = DropletDefinition<AnomaliesBannerData> & {
    props?: AnomaliesBannerProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

export const AnomaliesBannerDroplet: DropletBuilderComponent<AnomaliesBannerDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    // ── Trigger Definition ──────────────────────────────────────────────────
    
    const risolviTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}Risolvi`,
        enabled: true,
    }), [definition.name]);

    // ── Register Trigger ────────────────────────────────────────────────────
    
    const risolviTrigger = useTriggerState(form, risolviTriggerDef);
    const { handleTrigger: triggerRisolvi } = useTriggerActions(form, risolviTriggerDef);

    // ── Ref for trigger state ───────────────────────────────────────────────
    
    const risolviTriggerRef = useRef(risolviTrigger);
    risolviTriggerRef.current = risolviTrigger;

    // ── Data Extraction ─────────────────────────────────────────────────────
    
    const anomalie = useMemo(() => {
        if (Array.isArray(droplet?.value)) {
            return droplet.value as AnomaliaInfo[];
        }
        return [];
    }, [droplet?.value]);

    // ── Event Handler ───────────────────────────────────────────────────────
    
    const handleRisolvi = useCallback(() => {
        if (risolviTriggerRef.current) {
            risolviTriggerRef.current.signalData = { anomalie };
        }
        triggerRisolvi();
    }, [anomalie, triggerRisolvi]);

    // ── Early Return Check ──────────────────────────────────────────────────
    
    if (!droplet || droplet.visible === false) return null;
    
    // Se non ci sono anomalie, mostra un placeholder nell'editor (design-time)
    // In runtime il banner non viene mostrato se non ci sono anomalie
    const hasAnomalies = anomalie.length > 0;

    // ── Derived Values ──────────────────────────────────────────────────────
    
    const count = anomalie.length;
    const subtitle = hasAnomalies
        ? (count === 1 ? '1 anomalia rilevata' : `${count} anomalie rilevate`)
        : 'Nessuna anomalia (placeholder editor)';

    // ── Render ──────────────────────────────────────────────────────────────
    
    return (
        <Ark.Alert
            color={hasAnomalies ? "error" : "info"}
            variant="glass"
            title="Anomalie Anagrafiche"
            description={subtitle}
            className={[
                'anomalies-banner-droplet',
                !hasAnomalies && 'anomalies-banner-droplet--empty',
                definition.props?.className
            ].filter(Boolean).join(' ')}
        >
            {definition.props?.showResolveButton !== false && (
                <Ark.Box className="anomalies-banner-actions">
                    <Ark.Button
                        variant="ghost"
                        size="sm"
                        leftIcon="triangle-alert"
                        onClick={handleRisolvi}
                        disabled={droplet.enabled === false || !hasAnomalies}
                    >
                        Risolvi anomalie
                    </Ark.Button>
                </Ark.Box>
            )}
        </Ark.Alert>
    );
};

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register("tecnosys-anomalies-banner", AnomaliesBannerDroplet);

export default AnomaliesBannerDroplet;
