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
 * Stato di un contratto di locazione — discriminated union id + label.
 */
export type StatoContratto =
    | { id: 0; label: 'Attivo' }
    | { id: 1; label: 'Sospeso' }
    | { id: 2; label: 'Cessato' };

/**
 * Informazioni sul contratto attivo
 */
export interface ContrattoAttivoInfo {
    codice: string;
    tipo: string;
    canone: number;
    unitaMisura?: string;
    decorrenza: string;
    stato: StatoContratto;
}

/**
 * Informazioni su un singolo immobile collegato
 */
export interface ImmobileCollegato {
    codice: string;
    label?: string;
    indirizzo: string;
    codiceContratto?: string;
    tipoContratto?: string;
    canone?: number;
    stato?: StatoContratto;
}

/**
 * Struttura dati completa per il droplet
 */
export type ImmobiliContrattiCardData = {
    count: number;
    contrattoAttivo?: ContrattoAttivoInfo;
    immobili: ImmobileCollegato[];
};

/**
 * Component-specific props
 */
export type ImmobiliContrattiCardProps = {
    /** CSS class aggiuntiva */
    className?: string;
    /** Abilita navigazione (mostra freccia) */
    navigable?: boolean;
};

/**
 * Complete droplet definition
 */
export type ImmobiliContrattiCardDropletDefinition = DropletDefinition<ImmobiliContrattiCardData> & {
    props?: ImmobiliContrattiCardProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Costanti (OCP)
// ══════════════════════════════════════════════════════════════════════════

const STATO_CONTRATTO_COLOR: Record<number, Ark.BadgeColor> = {
    0: 'success',
    1: 'warning',
    2: 'muted',
} as const;

const STATO_CONTRATTO_BORDER: Record<number, string> = {
    0: 'var(--colors-success)',
    1: 'var(--colors-warning)',
    2: 'var(--colors-fg-subtle)',
} as const;

// ══════════════════════════════════════════════════════════════════════════
// Sub-components
// ══════════════════════════════════════════════════════════════════════════

interface ContrattoAttivoSectionProps {
    contratto: ContrattoAttivoInfo;
}

const ContrattoAttivoSection = memo(({ contratto }: ContrattoAttivoSectionProps) => {
    const unitaMisura = contratto.unitaMisura ?? 'mese';
    const canoneDisplay = `${contratto.canone.toLocaleString('it-IT')} €/${unitaMisura}`;
    const statoColor = STATO_CONTRATTO_COLOR[contratto.stato.id];

    return (
        <Ark.Box className="dati-generali-contratto-attivo">
            {/* Intestazione contratto */}
            <Ark.HStack align="center" spacing="var(--spacing-2)" className="dati-generali-contratto-header">
                <Ark.Icon icon="FileText" size="xs" className="dati-generali-contratto-icon" />
                <Ark.Text as="span" className="dati-generali-contratto-label-text">
                    Contratto attivo
                </Ark.Text>
                <Ark.Badge color={statoColor} variant="light" size="xs">
                    {contratto.stato.label.toUpperCase()}
                </Ark.Badge>
            </Ark.HStack>

            {/* Griglia dati contratto */}
            <Ark.Box className="dati-generali-contratto-grid">
                <Ark.VStack align="flex-start" spacing="var(--spacing-0-5)">
                    <Ark.Text as="span" className="dati-generali-field-label">
                        Canone
                    </Ark.Text>
                    <Ark.Text as="span" className="dati-generali-contratto-canone">
                        {canoneDisplay}
                    </Ark.Text>
                </Ark.VStack>
                <Ark.LabeledValue label="Tipo" value={contratto.tipo} />
                <Ark.LabeledValue label="Codice" value={contratto.codice} />
                <Ark.LabeledValue label="Decorrenza" value={contratto.decorrenza} format="date" />
            </Ark.Box>
        </Ark.Box>
    );
});
ContrattoAttivoSection.displayName = 'ContrattoAttivoSection';

interface ImmobileRowProps {
    immobile: ImmobileCollegato;
    onClick?: () => void;
}

const ImmobileRow = memo(({ immobile, onClick }: ImmobileRowProps) => {
    const statoColor = immobile.stato ? STATO_CONTRATTO_COLOR[immobile.stato.id] : 'muted';

    return (
        <Ark.Box 
            className="dati-generali-immobile-row" 
            onClick={onClick}
            style={onClick ? { cursor: 'pointer' } : undefined}
        >
            <Ark.HStack align="center" spacing="var(--spacing-3)">
                {/* Icona immobile */}
                <Ark.Box className="dati-generali-immobile-icon">
                    <Ark.Icon icon="Home" size="sm" />
                </Ark.Box>

                {/* Info immobile */}
                <Ark.VStack align="flex-start" spacing="var(--spacing-1)" style={{ flex: 1 }}>
                    <Ark.HStack align="center" spacing="var(--spacing-2)">
                        <Ark.Text as="span" className="dati-generali-immobile-codice">
                            {immobile.codice}
                        </Ark.Text>
                        {immobile.label && (
                            <Ark.Badge color="primary" variant="outline" size="xs">
                                {immobile.label}
                            </Ark.Badge>
                        )}
                        {immobile.stato && (
                            <Ark.Badge color={statoColor} variant="light" size="xs">
                                {immobile.stato.label}
                            </Ark.Badge>
                        )}
                    </Ark.HStack>
                    <Ark.Text as="span" className="dati-generali-immobile-indirizzo">
                        {immobile.indirizzo}
                    </Ark.Text>
                    {(immobile.codiceContratto || immobile.tipoContratto || immobile.canone != null) && (
                        <Ark.HStack align="center" spacing="var(--spacing-2)" className="dati-generali-immobile-sub">
                            {immobile.codiceContratto && (
                                <Ark.Text as="span" className="dati-generali-immobile-sub-text">
                                    {immobile.codiceContratto}
                                </Ark.Text>
                            )}
                            {immobile.tipoContratto && (
                                <>
                                    <Ark.Text as="span" className="dati-generali-immobile-sep">|</Ark.Text>
                                    <Ark.Text as="span" className="dati-generali-immobile-sub-text">
                                        {immobile.tipoContratto}
                                    </Ark.Text>
                                </>
                            )}
                            {immobile.canone != null && (
                                <>
                                    <Ark.Text as="span" className="dati-generali-immobile-sep">|</Ark.Text>
                                    <Ark.Text as="span" className="dati-generali-immobile-sub-text">
                                        € {immobile.canone.toLocaleString('it-IT')}/mese
                                    </Ark.Text>
                                </>
                            )}
                        </Ark.HStack>
                    )}
                </Ark.VStack>

                <Ark.Icon icon="ChevronRight" size="sm" className="dati-generali-immobile-chevron" />
            </Ark.HStack>
        </Ark.Box>
    );
});
ImmobileRow.displayName = 'ImmobileRow';

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

/**
 * ImmobiliContrattiCardDroplet — card con il riepilogo del contratto attivo e la lista immobili.
 */
export const ImmobiliContrattiCardDroplet: DropletBuilderComponent<ImmobiliContrattiCardDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    // ── Triggers ──────────────────────────────────────────────────────────
    const navigateTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}Navigate`,
        enabled: true,
    }), [definition.name]);

    const immobileClickTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}ImmobileClick`,
        enabled: true,
    }), [definition.name]);

    const navigateTrigger = useTriggerState(form, navigateTriggerDef);
    const immobileClickTrigger = useTriggerState(form, immobileClickTriggerDef);
    const { handleTrigger: handleNavigate } = useTriggerActions(form, navigateTriggerDef);
    const { handleTrigger: handleImmobileClick } = useTriggerActions(form, immobileClickTriggerDef);

    // Early return check (MUST be after all hooks)
    if (!droplet || droplet.visible === false) return null;

    // ── Data Extraction ─────────────────────────────────────────────────────
    const data = droplet.value as ImmobiliContrattiCardData | undefined;
    const navigable = definition.props?.navigable ?? false;

    // Placeholder per editor quando non ci sono dati
    if (!data) {
        return (
            <Ark.Card
                variant="default"
                className={`dati-generali-card ${definition.props?.className || ''}`}
            >
                <Ark.CardHeader>
                    <Ark.HStack align="center" justify="space-between">
                        <Ark.HStack align="center" spacing="var(--spacing-2)">
                            <Ark.Icon icon="Building2" size="sm" className="dati-generali-card-icon" />
                            <Ark.Text as="span" className="dati-generali-card-title text-fg-muted">
                                Immobili e Contratti
                            </Ark.Text>
                        </Ark.HStack>
                        <Ark.Badge color="primary" variant="default" size="sm">
                            0
                        </Ark.Badge>
                    </Ark.HStack>
                </Ark.CardHeader>
                <Ark.CardBody>
                    <Ark.Text as="span" className="text-fg-muted">
                        Nessun immobile collegato
                    </Ark.Text>
                </Ark.CardBody>
            </Ark.Card>
        );
    }

    // ── Event Handlers ──────────────────────────────────────────────────────
    const onNavigate = navigable ? () => {
        handleNavigate();
    } : undefined;

    const onImmobileClick = (immobile: ImmobileCollegato) => {
        immobileClickTrigger.signalData = immobile;
        handleImmobileClick();
    };

    // ── Render ──────────────────────────────────────────────────────────────
    const topBorderColor = data.contrattoAttivo
        ? STATO_CONTRATTO_BORDER[data.contrattoAttivo.stato.id]
        : undefined;

    return (
        <Ark.Card
            variant="default"
            className={[
                'dati-generali-card',
                navigable ? 'dati-generali-card--navigable' : '',
                definition.props?.className,
            ].filter(Boolean).join(' ')}
            style={topBorderColor ? { borderTop: `3px solid ${topBorderColor}` } : undefined}
            interactive={navigable}
            onClick={onNavigate}
        >
            <Ark.CardHeader>
                <Ark.HStack align="center" justify="space-between">
                    <Ark.HStack align="center" spacing="var(--spacing-2)">
                        <Ark.Icon icon="Building2" size="sm" className="dati-generali-card-icon" />
                        <Ark.Text as="span" className="dati-generali-card-title">
                            Immobili e Contratti
                        </Ark.Text>
                    </Ark.HStack>
                    <Ark.VStack align="center" spacing="var(--spacing-1)">
                        {navigable && (
                            <Ark.Icon icon="ChevronRight" size="sm" className="dati-generali-card-nav-arrow" />
                        )}
                        {data.count > 0 && (
                            <Ark.Badge color="primary" variant="default" size="sm">
                                {data.count}
                            </Ark.Badge>
                        )}
                    </Ark.VStack>
                </Ark.HStack>
            </Ark.CardHeader>
            <Ark.CardBody>
                <Ark.VStack spacing="var(--spacing-4)">
                    {data.contrattoAttivo && (
                        <ContrattoAttivoSection contratto={data.contrattoAttivo} />
                    )}
                    {data.immobili.map((im) => (
                        <ImmobileRow 
                            key={im.codice} 
                            immobile={im} 
                            onClick={() => onImmobileClick(im)}
                        />
                    ))}
                </Ark.VStack>
            </Ark.CardBody>
        </Ark.Card>
    );
};

ImmobiliContrattiCardDroplet.displayName = 'ImmobiliContrattiCardDroplet';

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register('tecnosys-immobili-contratti-card', ImmobiliContrattiCardDroplet);

export default ImmobiliContrattiCardDroplet;
