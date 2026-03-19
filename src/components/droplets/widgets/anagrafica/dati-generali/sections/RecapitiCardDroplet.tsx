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
import { memo, useMemo } from 'react';

// ══════════════════════════════════════════════════════════════════════════
// Type Definitions
// ══════════════════════════════════════════════════════════════════════════

/**
 * Tipo recapito — discriminated union id + label
 */
export type RecapitoTipo =
    | { id: 0; label: 'Telefono' }
    | { id: 1; label: 'Cellulare' }
    | { id: 2; label: 'Email' }
    | { id: 3; label: 'PEC' }
    | { id: 4; label: 'Residenza' }
    | { id: 5; label: 'Altro' };

/**
 * Indirizzo per recapito residenza
 */
export interface RecapitoIndirizzo {
    via: string;
    cap?: string;
    comune?: string;
    provincia?: string;
}

/**
 * Singolo recapito
 */
export interface RecapitoItem {
    id: string;
    tipo: RecapitoTipo;
    valore: string;
    label?: string;
    indirizzo?: RecapitoIndirizzo;
    isPrimario?: boolean;
}

/**
 * Struttura dati per il droplet RecapitiCard
 */
export type RecapitiCardData = RecapitoItem[];

/**
 * Component-specific props
 */
export type RecapitiCardProps = {
    /** CSS class aggiuntiva */
    className?: string;
};

/**
 * Complete droplet definition
 */
export type RecapitiCardDropletDefinition = DropletDefinition<RecapitiCardData> & {
    props?: RecapitiCardProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Costanti (OCP)
// ══════════════════════════════════════════════════════════════════════════

const RECAPITO_ICON: Record<number, Ark.IconName> = {
    0: 'Phone',
    1: 'Smartphone',
    2: 'Mail',
    3: 'ShieldCheck',
    4: 'MapPin',
    5: 'Circle',
} as const;

// ══════════════════════════════════════════════════════════════════════════
// Sub-components
// ══════════════════════════════════════════════════════════════════════════

interface RecapitoRowProps {
    recapito: RecapitoItem;
    onClick?: () => void;
}

const RecapitoRow = memo(({ recapito, onClick }: RecapitoRowProps) => {
    const icon = RECAPITO_ICON[recapito.tipo.id] ?? RECAPITO_ICON[5];
    const label = recapito.label ?? recapito.tipo.label.toUpperCase();

    // Indirizzo: componiamo la stringa visiva
    const indirizzoDisplay = recapito.indirizzo
        ? [
            recapito.indirizzo.via,
            recapito.indirizzo.comune,
            recapito.indirizzo.cap && recapito.indirizzo.provincia
                ? `${recapito.indirizzo.cap} (${recapito.indirizzo.provincia})`
                : recapito.indirizzo.cap,
        ]
            .filter(Boolean)
            .join(', ')
        : null;

    return (
        <Ark.Box 
            className="dati-generali-recapito-row"
            onClick={onClick}
            style={onClick ? { cursor: 'pointer' } : undefined}
        >
            <Ark.HStack align="flex-start" spacing="var(--spacing-3)">
                {/* Icona colorata per tipo */}
                <Ark.Box className={`dati-generali-recapito-icon dati-generali-recapito-icon--${recapito.tipo.id}`}>
                    <Ark.Icon icon={icon} size="sm" />
                </Ark.Box>

                {/* Valore + label */}
                <Ark.VStack align="flex-start" spacing="var(--spacing-0-5)">
                    <Ark.Text as="span" className="dati-generali-recapito-valore">
                        {indirizzoDisplay ?? recapito.valore}
                    </Ark.Text>
                    <Ark.HStack align="center" spacing="var(--spacing-1-5)">
                        <Ark.Text as="span" className="dati-generali-recapito-label">
                            {label}
                        </Ark.Text>
                        {recapito.indirizzo?.cap && recapito.tipo.id === 4 && (
                            <Ark.Text as="span" className="dati-generali-recapito-sub">
                                {[recapito.indirizzo.cap, recapito.indirizzo.provincia].filter(Boolean).join(' ')}
                            </Ark.Text>
                        )}
                    </Ark.HStack>
                </Ark.VStack>
            </Ark.HStack>
        </Ark.Box>
    );
});
RecapitoRow.displayName = 'RecapitoRow';

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

/**
 * RecapitiCardDroplet — card laterale con telefono, email e indirizzo di residenza.
 */
export const RecapitiCardDroplet: DropletBuilderComponent<RecapitiCardDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    // ── Triggers ──────────────────────────────────────────────────────────
    const recapitoClickTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}RecapitoClick`,
        enabled: true,
    }), [definition.name]);

    const recapitoClickTrigger = useTriggerState(form, recapitoClickTriggerDef);
    const { handleTrigger: handleRecapitoClick } = useTriggerActions(form, recapitoClickTriggerDef);

    // Early return check (MUST be after all hooks)
    if (!droplet || droplet.visible === false) return null;

    // ── Data Extraction ─────────────────────────────────────────────────────
    const recapiti = (droplet.value as RecapitiCardData) ?? [];

    // Placeholder per editor quando non ci sono dati
    if (recapiti.length === 0) {
        return (
            <Ark.Card
                variant="default"
                className={`dati-generali-card ${definition.props?.className || ''}`}
            >
                <Ark.CardHeader>
                    <Ark.HStack align="center" spacing="var(--spacing-2)">
                        <Ark.Icon icon="Phone" size="sm" className="dati-generali-card-icon" />
                        <Ark.Text as="span" className="dati-generali-card-title text-fg-muted">
                            Recapiti
                        </Ark.Text>
                    </Ark.HStack>
                </Ark.CardHeader>
                <Ark.CardBody>
                    <Ark.VStack spacing="var(--spacing-4)">
                        <Ark.Box className="dati-generali-recapito-row">
                            <Ark.HStack align="flex-start" spacing="var(--spacing-3)">
                                <Ark.Box className="dati-generali-recapito-icon dati-generali-recapito-icon--0">
                                    <Ark.Icon icon="Phone" size="sm" />
                                </Ark.Box>
                                <Ark.VStack align="flex-start" spacing="var(--spacing-0-5)">
                                    <Ark.Text as="span" className="dati-generali-recapito-valore text-fg-muted">
                                        +39 000 0000000
                                    </Ark.Text>
                                    <Ark.Text as="span" className="dati-generali-recapito-label">
                                        TELEFONO
                                    </Ark.Text>
                                </Ark.VStack>
                            </Ark.HStack>
                        </Ark.Box>
                    </Ark.VStack>
                </Ark.CardBody>
            </Ark.Card>
        );
    }

    // ── Event Handlers ──────────────────────────────────────────────────────
    const onRecapitoClick = (recapito: RecapitoItem) => {
        recapitoClickTrigger.signalData = recapito;
        handleRecapitoClick();
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <Ark.Card
            variant="default"
            className={['dati-generali-card', definition.props?.className].filter(Boolean).join(' ')}
        >
            <Ark.CardHeader>
                <Ark.HStack align="center" spacing="var(--spacing-2)">
                    <Ark.Icon icon="Phone" size="sm" className="dati-generali-card-icon" />
                    <Ark.Text as="span" className="dati-generali-card-title">
                        Recapiti
                    </Ark.Text>
                </Ark.HStack>
            </Ark.CardHeader>
            <Ark.CardBody>
                <Ark.VStack spacing="var(--spacing-4)">
                    {recapiti.map((r) => (
                        <RecapitoRow 
                            key={r.id} 
                            recapito={r} 
                            onClick={() => onRecapitoClick(r)}
                        />
                    ))}
                </Ark.VStack>
            </Ark.CardBody>
        </Ark.Card>
    );
};

RecapitiCardDroplet.displayName = 'RecapitiCardDroplet';

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register('tecnosys-recapiti-card', RecapitiCardDroplet);

export default RecapitiCardDroplet;
