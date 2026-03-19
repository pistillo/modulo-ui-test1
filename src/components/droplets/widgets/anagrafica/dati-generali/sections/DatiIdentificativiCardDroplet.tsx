import { useMemo } from 'react';
import {
    dropletRegistry,
    DropletDefinition,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
} from '@tecnosys/stillum-forms-react';
import { Ark, Sesso } from '@tecnosys/components';

// Re-export Sesso for convenience
export type { Sesso };

// ══════════════════════════════════════════════════════════════════════════
// Type Definitions
// ══════════════════════════════════════════════════════════════════════════

/**
 * Tipo persona discriminated union.
 */
export type TipoPersona =
    | { id: 0; tipo: 'Persona fisica' }
    | { id: 1; tipo: 'Persona giuridica' };

/**
 * Dati identificativi Persona Fisica.
 */
export interface DatiIdentificativiPF {
    nome: string;
    secondoNome?: string;
    cognome: string;
    sesso?: Sesso;
    dataNascita?: string;
    luogoNascita?: string;
    cittadinanza?: string;
    statoCivile?: string;
    codiceFiscale: string;
}

/**
 * Dati identificativi Persona Giuridica.
 */
export interface DatiIdentificativiPG {
    ragioneSociale: string;
    codiceFiscale: string;
    partitaIva?: string;
    naturaSociale?: string;
    rappresentanteLegale?: string;
    sdiCode?: string;
    chamberOfCommerce?: string;
    reaNumber?: string;
    shareCapital?: string;
    businessObject?: string;
    incorporationDate?: string;
}

/**
 * Informazioni header della card.
 */
export interface DatiIdentificativiHeader {
    denominazione: string;
    codice: string;
    tipo: 'fisica' | 'giuridica';
}

/**
 * Struttura dati per DatiIdentificativiCardDroplet.
 */
export interface DatiIdentificativiCardData {
    /** Tipo persona: 'fisica' o 'giuridica' */
    tipo: 'fisica' | 'giuridica';
    /** Dati header (avatar + denominazione + badges) */
    header: DatiIdentificativiHeader;
    /** Dati identificativi Persona Fisica (se tipo === 'fisica') */
    datiPF?: DatiIdentificativiPF;
    /** Dati identificativi Persona Giuridica (se tipo === 'giuridica') */
    datiPG?: DatiIdentificativiPG;
}

/**
 * Props specifiche del componente.
 */
export type DatiIdentificativiCardProps = {
    /** Classe CSS aggiuntiva */
    className?: string;
};

/**
 * Definizione completa del droplet.
 */
export type DatiIdentificativiCardDropletDefinition = DropletDefinition<DatiIdentificativiCardData> & {
    props?: DatiIdentificativiCardProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

export const DatiIdentificativiCardDroplet: DropletBuilderComponent<DatiIdentificativiCardDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    // ── Data Extraction ─────────────────────────────────────────────────────

    const data = useMemo(() => {
        if (droplet?.value && typeof droplet.value === 'object') {
            return droplet.value as DatiIdentificativiCardData;
        }
        return null;
    }, [droplet?.value]);

    // ── Early Return Check ──────────────────────────────────────────────────

    if (!droplet || droplet.visible === false) return null;

    // ── Placeholder for Editor ──────────────────────────────────────────────

    if (!data) {
        return (
            <Ark.Card variant="default" className="dati-identificativi-card-placeholder">
                <Ark.CardHeader>
                    <Ark.HStack align="center" spacing="var(--spacing-4)">
                        <Ark.Avatar
                            alt="Placeholder"
                            size="lg"
                            className="dati-generali-avatar"
                        />
                        <Ark.VStack align="flex-start" spacing="var(--spacing-1)">
                            <Ark.Text as="h2" className="dati-generali-header-nome">
                                Nome Anagrafica
                            </Ark.Text>
                            <Ark.HStack align="center" spacing="var(--spacing-2)">
                                <Ark.Badge color="muted" variant="outline" size="sm">
                                    CODICE
                                </Ark.Badge>
                                <Ark.Badge color="info" variant="light" size="sm">
                                    Tipo Persona
                                </Ark.Badge>
                            </Ark.HStack>
                        </Ark.VStack>
                    </Ark.HStack>
                </Ark.CardHeader>
                <Ark.CardBody>
                    <Ark.Box className="dati-generali-section-divider">
                        <Ark.Text as="span" className="dati-generali-section-label">
                            DATI IDENTIFICATIVI (placeholder)
                        </Ark.Text>
                    </Ark.Box>
                </Ark.CardBody>
            </Ark.Card>
        );
    }

    // ── Render ──────────────────────────────────────────────────────────────

    const { tipo, header, datiPF, datiPG } = data;
    const isPF = tipo === 'fisica';
    const hasDati = isPF ? !!datiPF : !!datiPG;

    return (
        <Ark.Card
            variant="default"
            className={[
                'dati-generali-card',
                `dati-generali-card--${tipo}`,
                definition.props?.className
            ].filter(Boolean).join(' ')}
        >
            {/* ── Header: avatar + denominazione + badge tipo ────────────── */}
            <Ark.CardHeader className="dati-generali-main-card-header">
                <Ark.HStack align="center" spacing="var(--spacing-4)">
                    <Ark.Avatar
                        alt={header.denominazione}
                        size="lg"
                        className={`dati-generali-avatar dati-generali-avatar--${header.tipo}`}
                    />
                    <Ark.VStack align="flex-start" spacing="var(--spacing-1)">
                        <Ark.Text as="h2" className="dati-generali-header-nome">
                            {header.denominazione}
                        </Ark.Text>
                        <Ark.HStack align="center" spacing="var(--spacing-2)">
                            <Ark.Badge color="muted" variant="outline" size="sm">
                                {header.codice}
                            </Ark.Badge>
                            <Ark.Badge color={isPF ? 'primary' : 'info'} variant="light" size="sm">
                                {isPF ? 'Persona Fisica' : 'Persona Giuridica'}
                            </Ark.Badge>
                        </Ark.HStack>
                    </Ark.VStack>
                </Ark.HStack>
            </Ark.CardHeader>

            {/* ── Body: separatore + griglia identificativi ─────────────── */}
            {hasDati && (
                <Ark.CardBody>
                    <Ark.Box className="dati-generali-section-divider">
                        <Ark.Text as="span" className="dati-generali-section-label">
                            DATI IDENTIFICATIVI
                        </Ark.Text>
                    </Ark.Box>
                    <Ark.Box className="dati-generali-card-content">
                        {isPF && datiPF && (
                            <Ark.SimpleGrid columns={3} spacingX="var(--spacing-6)" spacingY="var(--spacing-1)">
                                <Ark.LabeledValue label="Nome" value={datiPF.nome} />
                                <Ark.LabeledValue label="Secondo Nome" value={datiPF.secondoNome} />
                                <Ark.LabeledValue label="Cognome" value={datiPF.cognome} />
                                <Ark.LabeledValue label="Sesso" value={datiPF.sesso?.label} />
                                <Ark.LabeledValue label="Data di Nascita" value={datiPF.dataNascita} format="date" />
                                <Ark.LabeledValue label="Luogo di Nascita" value={datiPF.luogoNascita} />
                                <Ark.LabeledValue label="Cittadinanza" value={datiPF.cittadinanza} />
                                <Ark.LabeledValue label="Stato Civile" value={datiPF.statoCivile} />
                                <Ark.LabeledValue label="Codice Fiscale" value={datiPF.codiceFiscale} />
                            </Ark.SimpleGrid>
                        )}
                        {!isPF && datiPG && (
                            <Ark.SimpleGrid columns={3} spacingX="var(--spacing-6)" spacingY="var(--spacing-10)">
                                <Ark.LabeledValue label="Ragione Sociale" value={datiPG.ragioneSociale} />
                                <Ark.LabeledValue label="Codice Fiscale" value={datiPG.codiceFiscale} />
                                <Ark.LabeledValue label="Partita IVA" value={datiPG.partitaIva} />
                                <Ark.LabeledValue label="Natura Sociale" value={datiPG.naturaSociale} />
                                <Ark.LabeledValue label="Rappresentante Legale" value={datiPG.rappresentanteLegale} />
                                {datiPG.sdiCode && (
                                    <Ark.LabeledValue label="Cod. Destinatario SDI" value={datiPG.sdiCode} />
                                )}
                                {datiPG.chamberOfCommerce && (
                                    <Ark.LabeledValue label="Camera di Commercio" value={datiPG.chamberOfCommerce} />
                                )}
                                {datiPG.reaNumber && (
                                    <Ark.LabeledValue label="Numero REA" value={datiPG.reaNumber} />
                                )}
                                {datiPG.shareCapital && (
                                    <Ark.LabeledValue label="Capitale Sociale" value={datiPG.shareCapital} />
                                )}
                                {datiPG.businessObject && (
                                    <Ark.LabeledValue label="Oggetto Sociale" value={datiPG.businessObject} />
                                )}
                                {datiPG.incorporationDate && (
                                    <Ark.LabeledValue label="Data Costituzione" value={datiPG.incorporationDate} format="date" />
                                )}
                            </Ark.SimpleGrid>
                        )}
                    </Ark.Box>
                </Ark.CardBody>
            )}
        </Ark.Card>
    );
};

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register("tecnosys-dati-identificativi-card", DatiIdentificativiCardDroplet);

export default DatiIdentificativiCardDroplet;
