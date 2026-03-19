import {
    DropletDefinition,
    dropletRegistry,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

// ══════════════════════════════════════════════════════════════════════════
// Type Definitions
// ══════════════════════════════════════════════════════════════════════════

/**
 * Stato inquilino — discriminated union id + label
 */
export type StatoInquilinoType =
    | { id: 0; label: 'Regolare' }
    | { id: 1; label: 'Morosità' }
    | { id: 2; label: 'Verifica' }
    | { id: 3; label: 'Sospeso' };

/**
 * Ultimo pagamento effettuato
 */
export interface UltimoPagamento {
    dataFormattata: string;
    importo: number;
}

/**
 * Struttura dati per SituazioneEconomicaCard
 */
export type SituazioneEconomicaCardData = {
    redditoIsee?: number;
    scadenzaIsee?: string;
    fasciaInquilino?: string;
    ultimoPagamento?: UltimoPagamento;
    statoInquilino?: StatoInquilinoType;
};

/**
 * Component-specific props
 */
export type SituazioneEconomicaCardProps = {
    /** CSS class aggiuntiva */
    className?: string;
};

/**
 * Complete droplet definition
 */
export type SituazioneEconomicaCardDropletDefinition = DropletDefinition<SituazioneEconomicaCardData> & {
    props?: SituazioneEconomicaCardProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Costanti (OCP)
// ══════════════════════════════════════════════════════════════════════════

/** Colore Badge per ciascun id stato inquilino */
const STATO_INQUILINO_COLOR: Record<number, Ark.BadgeColor> = {
    0: 'success',  // Regolare
    1: 'error',    // Morosità
    2: 'warning',  // Verifica
    3: 'muted',    // Sospeso
} as const;

/** Colore del bordo superiore */
const toTopBorderColor = (id: number): string => {
    const colorMap: Record<number, string> = {
        0: 'var(--colors-success)',
        1: 'var(--colors-error)',
        2: 'var(--colors-warning)',
        3: 'var(--colors-fg-subtle)',
    };
    return colorMap[id] ?? 'var(--colors-fg-subtle)';
};

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

/**
 * SituazioneEconomicaCardDroplet — card riepilogo ISEE, fasce inquilino e ultimo pagamento.
 * Display-only component senza trigger.
 */
export const SituazioneEconomicaCardDroplet: DropletBuilderComponent<SituazioneEconomicaCardDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    // Early return check (MUST be after all hooks)
    if (!droplet || droplet.visible === false) return null;

    // ── Data Extraction ─────────────────────────────────────────────────────
    const info = droplet.value as SituazioneEconomicaCardData | undefined;

    // Placeholder per editor quando non ci sono dati
    if (!info) {
        return (
            <Ark.Card
                variant="default"
                className={`dati-generali-card ${definition.props?.className || ''}`}
            >
                <Ark.CardHeader>
                    <Ark.HStack align="center" spacing="var(--spacing-2)">
                        <Ark.Icon icon="CircleDollarSign" size="sm" className="dati-generali-card-icon" />
                        <Ark.Text as="span" className="dati-generali-card-title text-fg-muted">
                            Situazione Economica
                        </Ark.Text>
                    </Ark.HStack>
                </Ark.CardHeader>
                <Ark.CardBody>
                    <Ark.SimpleGrid columns={3} gap="var(--spacing-6)">
                        <Ark.VStack align="flex-start" spacing="var(--spacing-0-5)">
                            <Ark.Text as="span" className="dati-generali-field-label">
                                Reddito ISEE
                            </Ark.Text>
                            <Ark.Text as="span" className="dati-generali-field-value text-fg-muted">
                                –
                            </Ark.Text>
                        </Ark.VStack>
                        <Ark.LabeledValue label="Scadenza ISEE" value="–" />
                        <Ark.LabeledValue label="Fascia Inquilino" value="–" />
                    </Ark.SimpleGrid>
                </Ark.CardBody>
            </Ark.Card>
        );
    }

    // ── Render ──────────────────────────────────────────────────────────────
    const canoneDisplay = info.redditoIsee != null
        ? `€ ${info.redditoIsee.toLocaleString('it-IT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`
        : undefined;

    const statoColor = info.statoInquilino ? STATO_INQUILINO_COLOR[info.statoInquilino.id] : 'muted';
    const statoLabel = info.statoInquilino?.label;
    const topBorderColor = info.statoInquilino ? toTopBorderColor(info.statoInquilino.id) : undefined;

    return (
        <Ark.Card
            variant="default"
            className={['dati-generali-card', definition.props?.className].filter(Boolean).join(' ')}
            style={topBorderColor ? { borderTop: `3px solid ${topBorderColor}` } : undefined}
        >
            <Ark.CardHeader>
                <Ark.HStack align="center" spacing="var(--spacing-2)">
                    <Ark.Icon icon="CircleDollarSign" size="sm" className="dati-generali-card-icon" />
                    <Ark.Text as="span" className="dati-generali-card-title">
                        Situazione Economica
                    </Ark.Text>
                </Ark.HStack>
            </Ark.CardHeader>
            <Ark.CardBody>
                <Ark.SimpleGrid columns={3} gap="var(--spacing-6)">
                    {/* Reddito ISEE con simbolo € colorato */}
                    <Ark.VStack align="flex-start" spacing="var(--spacing-0-5)">
                        <Ark.Text as="span" className="dati-generali-field-label">
                            Reddito ISEE
                        </Ark.Text>
                        {canoneDisplay ? (
                            <Ark.HStack align="center" spacing="var(--spacing-1)">
                                <Ark.Icon icon="CircleDollarSign" size="xs" className="dati-generali-isee-icon" />
                                <Ark.Text as="span" className="dati-generali-isee-valore">
                                    {canoneDisplay}
                                </Ark.Text>
                            </Ark.HStack>
                        ) : (
                            <Ark.Text as="span" className="dati-generali-field-value">
                                –
                            </Ark.Text>
                        )}
                    </Ark.VStack>

                    <Ark.LabeledValue
                        label="Scadenza ISEE"
                        value={info.scadenzaIsee ?? '–'}
                        format={info.scadenzaIsee ? 'date' : undefined}
                    />
                    <Ark.LabeledValue
                        label="Fascia Inquilino"
                        value={info.fasciaInquilino ?? '–'}
                    />

                    {/* Ultimo pagamento */}
                    <Ark.VStack align="flex-start" spacing="var(--spacing-0-5)">
                        <Ark.Text as="span" className="dati-generali-field-label">
                            Ultimo Pagamento
                        </Ark.Text>
                        {info.ultimoPagamento ? (
                            <Ark.HStack align="center" spacing="var(--spacing-1)">
                                <Ark.Text as="span" className="dati-generali-field-value">
                                    {info.ultimoPagamento.dataFormattata}
                                </Ark.Text>
                                <Ark.Text as="span" className="dati-generali-field-value">
                                    — € {info.ultimoPagamento.importo.toLocaleString('it-IT')}
                                </Ark.Text>
                            </Ark.HStack>
                        ) : (
                            <Ark.Text as="span" className="dati-generali-field-value">
                                –
                            </Ark.Text>
                        )}
                    </Ark.VStack>

                    {/* Stato Inquilino con badge */}
                    <Ark.VStack align="flex-start" spacing="var(--spacing-0-5)">
                        <Ark.Text as="span" className="dati-generali-field-label">
                            Stato Inquilino
                        </Ark.Text>
                        {statoLabel ? (
                            <Ark.Badge color={statoColor} variant="light" size="sm">
                                <Ark.Icon icon="CircleCheck" size="xs" style={{ marginRight: '4px' }} />
                                {statoLabel}
                            </Ark.Badge>
                        ) : (
                            <Ark.Text as="span" className="dati-generali-field-value">
                                –
                            </Ark.Text>
                        )}
                    </Ark.VStack>
                </Ark.SimpleGrid>
            </Ark.CardBody>
        </Ark.Card>
    );
};

SituazioneEconomicaCardDroplet.displayName = 'SituazioneEconomicaCardDroplet';

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register('tecnosys-situazione-economica-card', SituazioneEconomicaCardDroplet);

export default SituazioneEconomicaCardDroplet;
