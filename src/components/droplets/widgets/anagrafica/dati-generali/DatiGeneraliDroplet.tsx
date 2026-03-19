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
import { Ark, Sesso } from '@tecnosys/components';
import { useMemo, useCallback } from 'react';

// Re-export types from section droplets for convenience
export type { TipoPersona } from './sections/DatiIdentificativiCardDroplet';
export type { Sesso };
export type { AnomaliaInfo } from './sections/AnomaliesBannerDroplet';
export type { RecapitoTipo, RecapitoIndirizzo, RecapitoItem } from './sections/RecapitiCardDroplet';
export type { StatoContratto, ContrattoAttivoInfo, ImmobileCollegato, ImmobiliContrattiCardData } from './sections/ImmobiliContrattiCardDroplet';
export type { MembroNucleo, NucleoFamiliareCardData } from './sections/NucleoFamiliareCardDroplet';
export type { StatoInquilinoType, UltimoPagamento, SituazioneEconomicaCardData } from './sections/SituazioneEconomicaCardDroplet';

// ══════════════════════════════════════════════════════════════════════════
// Type Definitions
// ══════════════════════════════════════════════════════════════════════════

/**
 * Tipo persona discriminated union (local copy to avoid circular deps)
 */
type TipoPersonaLocal =
    | { id: 0; tipo: 'Persona fisica' }
    | { id: 1; tipo: 'Persona giuridica' };

/**
 * Informazioni di base sempre presenti
 */
export interface DatiGeneraliInfoBase {
    codice: string;
    tipoPersona: TipoPersonaLocal;
    denominazione: string;
}

/**
 * Dati identificativi Persona Fisica
 */
export interface DatiIdentificativiPFLocal {
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
 * Dati identificativi Persona Giuridica
 */
export interface DatiIdentificativiPGLocal {
    ragioneSociale: string;
    partitaIva: string;
    codiceFiscale: string;
    formaGiuridica?: string;
    sedeOperativa?: string;
    sedeLegale?: string;
    chamberOfCommerce?: string;
    reaNumber?: string;
    shareCapital?: string;
    businessObject?: string;
    incorporationDate?: string;
}

/**
 * Anomalia info
 */
interface AnomaliaInfoLocal {
    id: string;
    descrizione: string;
}

/**
 * Recapito tipo
 */
type RecapitoTipoLocal =
    | { id: 0; label: 'Telefono' }
    | { id: 1; label: 'Cellulare' }
    | { id: 2; label: 'Email' }
    | { id: 3; label: 'PEC' }
    | { id: 4; label: 'Residenza' }
    | { id: 5; label: 'Altro' };

/**
 * Recapito item
 */
interface RecapitoItemLocal {
    id: string;
    tipo: RecapitoTipoLocal;
    valore: string;
    label?: string;
    indirizzo?: {
        via: string;
        cap?: string;
        comune?: string;
        provincia?: string;
    };
    isPrimario?: boolean;
}

/**
 * Stato contratto
 */
type StatoContrattoLocal =
    | { id: 0; label: 'Attivo' }
    | { id: 1; label: 'Sospeso' }
    | { id: 2; label: 'Cessato' };

/**
 * Immobile collegato
 */
interface ImmobileCollegatoLocal {
    codice: string;
    label?: string;
    indirizzo: string;
    codiceContratto?: string;
    tipoContratto?: string;
    canone?: number;
    stato?: StatoContrattoLocal;
}

/**
 * Immobili e contratti info
 */
interface ImmobiliContrattiInfoLocal {
    count: number;
    contrattoAttivo?: {
        codice: string;
        tipo: string;
        canone: number;
        unitaMisura?: string;
        decorrenza: string;
        stato: StatoContrattoLocal;
    };
    immobili: ImmobileCollegatoLocal[];
}

/**
 * Membro nucleo familiare
 */
interface MembroNucleoLocal {
    id: string;
    nome: string;
    relazione?: string;
    badges?: string[];
}

/**
 * Nucleo familiare info
 */
interface NucleoFamiliareInfoLocal {
    componenti: number;
    minori: number;
    disabili: number;
    membri: MembroNucleoLocal[];
}

/**
 * Stato inquilino
 */
type StatoInquilinoLocal =
    | { id: 0; label: 'Regolare' }
    | { id: 1; label: 'Morosità' }
    | { id: 2; label: 'Verifica' }
    | { id: 3; label: 'Sospeso' };

/**
 * Situazione economica info
 */
interface SituazioneEconomicaInfoLocal {
    redditoIsee?: number;
    scadenzaIsee?: string;
    fasciaInquilino?: string;
    ultimoPagamento?: {
        dataFormattata: string;
        importo: number;
    };
    statoInquilino?: StatoInquilinoLocal;
}

/**
 * Complete data structure for DatiGenerali
 */
export type DatiGeneraliData = {
    /** Dati obbligatori: codice, tipo soggetto, denominazione */
    infoBase: DatiGeneraliInfoBase;
    /** Anomalie segnalate */
    anomalie?: AnomaliaInfoLocal[];
    /** Dati identificativi Persona Fisica */
    datiPF?: DatiIdentificativiPFLocal;
    /** Dati identificativi Persona Giuridica */
    datiPG?: DatiIdentificativiPGLocal;
    /** Lista recapiti */
    recapiti?: RecapitoItemLocal[];
    /** Immobili e contratti */
    immobiliContratti?: ImmobiliContrattiInfoLocal;
    /** Nucleo familiare */
    nucleoFamiliare?: NucleoFamiliareInfoLocal;
    /** Situazione economica */
    situazioneEconomica?: SituazioneEconomicaInfoLocal;
};

/**
 * Component-specific props
 */
export type DatiGeneraliProps = {
    /** CSS class aggiuntiva */
    className?: string;
    /** Mostra pulsante risolvi anomalie */
    showResolveButton?: boolean;
    /** Abilita navigazione su immobili/contratti */
    navigableImmobili?: boolean;
};

/**
 * Complete droplet definition
 */
export type DatiGeneraliDropletDefinition = DropletDefinition<DatiGeneraliData> & {
    props?: DatiGeneraliProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Costanti
// ══════════════════════════════════════════════════════════════════════════

const STATO_CONTRATTO_BORDER: Record<number, string> = {
    0: 'var(--colors-success)',
    1: 'var(--colors-warning)',
    2: 'var(--colors-fg-subtle)',
} as const;

const STATO_CONTRATTO_COLOR: Record<number, Ark.BadgeColor> = {
    0: 'success',
    1: 'warning',
    2: 'muted',
} as const;

const STATO_INQUILINO_COLOR: Record<number, Ark.BadgeColor> = {
    0: 'success',
    1: 'error',
    2: 'warning',
    3: 'muted',
} as const;

const RECAPITO_ICON: Record<number, Ark.IconName> = {
    0: 'Phone',
    1: 'Smartphone',
    2: 'Mail',
    3: 'ShieldCheck',
    4: 'MapPin',
    5: 'Circle',
} as const;

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

/**
 * DatiGeneraliDroplet — scheda anagrafica completa con tutte le sezioni.
 * 
 * Sezioni renderizzate (solo se i dati corrispondenti sono presenti):
 *  - **AnomaliesBanner** — alert segnalazione incongruenze
 *  - **DatiIdentificativiCard** — header + griglia dati PF o PG
 *  - **RecapitiCard** — telefono, email, residenza
 *  - **ImmobiliContrattiCard** — contratto attivo + lista immobili
 *  - **NucleoFamiliareCard** — statistiche + lista componenti
 *  - **SituazioneEconomicaCard** — ISEE, fasce, ultimo pagamento, stato
 */
export const DatiGeneraliDroplet: DropletBuilderComponent<DatiGeneraliDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    // ── Triggers ──────────────────────────────────────────────────────────
    const risolviAnomalieTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}RisolviAnomalie`,
        enabled: true,
    }), [definition.name]);

    const navigateTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}Navigate`,
        enabled: true,
    }), [definition.name]);

    const risolviAnomalieTrigger = useTriggerState(form, risolviAnomalieTriggerDef);
    const navigateTrigger = useTriggerState(form, navigateTriggerDef);
    const { handleTrigger: handleRisolviAnomalie } = useTriggerActions(form, risolviAnomalieTriggerDef);
    const { handleTrigger: handleNavigate } = useTriggerActions(form, navigateTriggerDef);

    // ── Callbacks ─────────────────────────────────────────────────────────
    const onRisolviAnomalie = useCallback(() => {
        risolviAnomalieTrigger.signalData = { codice: droplet?.value?.infoBase?.codice };
        handleRisolviAnomalie();
    }, [risolviAnomalieTrigger, handleRisolviAnomalie, droplet?.value?.infoBase?.codice]);

    const onNavigateImmobili = useCallback(() => {
        navigateTrigger.signalData = { section: 'contratti', codice: droplet?.value?.infoBase?.codice };
        handleNavigate();
    }, [navigateTrigger, handleNavigate, droplet?.value?.infoBase?.codice]);

    // Early return check (MUST be after all hooks)
    if (!droplet || droplet.visible === false) return null;

    // ── Data Extraction ─────────────────────────────────────────────────────
    const data = droplet.value as DatiGeneraliData | undefined;

    // Placeholder per editor quando non ci sono dati
    if (!data || !data.infoBase) {
        return (
            <Ark.Box className={`dati-generali ${definition.props?.className || ''}`}>
                {/* Placeholder anomalie */}
                <Ark.Alert color="info" className="dati-generali-anomalie-banner">
                    <Ark.Text as="span">Dati Generali Anagrafica</Ark.Text>
                </Ark.Alert>
                
                {/* Row 1: Dati identificativi + Recapiti */}
                <Ark.Flex className="dati-generali-row dati-generali-row--1">
                    <Ark.Card variant="default" className="dati-generali-card dati-generali-card--dati-id">
                        <Ark.CardHeader>
                            <Ark.Text as="span" className="text-fg-muted">Dati Identificativi</Ark.Text>
                        </Ark.CardHeader>
                    </Ark.Card>
                    <Ark.Card variant="default" className="dati-generali-card dati-generali-card--recapiti">
                        <Ark.CardHeader>
                            <Ark.Text as="span" className="text-fg-muted">Recapiti</Ark.Text>
                        </Ark.CardHeader>
                    </Ark.Card>
                </Ark.Flex>
            </Ark.Box>
        );
    }

    // ── Guard flags ─────────────────────────────────────────────────────────
    const hasAnomalie = !!data.anomalie?.length;
    const hasRecapiti = !!data.recapiti?.length;
    const hasImmobili = !!data.immobiliContratti?.count;
    const hasNucleo = !!data.nucleoFamiliare?.componenti;
    const hasSituazioneEco = !!data.situazioneEconomica;
    const showResolveButton = definition.props?.showResolveButton ?? true;
    const navigableImmobili = definition.props?.navigableImmobili ?? false;

    // ── Derived values ──────────────────────────────────────────────────────
    const isPF = data.infoBase.tipoPersona.id === 0;
    const tipoSlug = isPF ? 'fisica' : 'giuridica';

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <Ark.Box 
            className={['dati-generali', definition.props?.className].filter(Boolean).join(' ')} 
            data-codice={data.infoBase.codice}
        >
            {/* Banner anomalie — full width */}
            {hasAnomalie && (
                <Ark.Alert 
                    color="warning" 
                    className="dati-generali-anomalie-banner"
                >
                    <Ark.HStack align="center" justify="space-between">
                        <Ark.VStack align="flex-start" spacing="var(--spacing-1)">
                            <Ark.Text as="span" className="dati-generali-anomalie-title">
                                Anomalie rilevate ({data.anomalie!.length})
                            </Ark.Text>
                            <Ark.Text as="span" className="dati-generali-anomalie-list">
                                {data.anomalie!.map(a => a.descrizione).join(' • ')}
                            </Ark.Text>
                        </Ark.VStack>
                        {showResolveButton && (
                            <Ark.Button 
                                variant="outline" 
                                size="sm"
                                onClick={onRisolviAnomalie}
                            >
                                Risolvi
                            </Ark.Button>
                        )}
                    </Ark.HStack>
                </Ark.Alert>
            )}

            {/* Row 1: Dati Identificativi + Recapiti */}
            <Ark.Flex className="dati-generali-row dati-generali-row--1">
                {/* Dati Identificativi Card */}
                <Ark.Card variant="default" className="dati-generali-card dati-generali-card--dati-id">
                    <Ark.CardHeader>
                        {/* Header con avatar e info */}
                        <Ark.HStack align="center" spacing="var(--spacing-4)">
                            <Ark.Avatar
                                alt={data.infoBase.denominazione}
                                size="lg"
                                className={`dati-generali-avatar dati-generali-avatar--${tipoSlug}`}
                            />
                            <Ark.VStack align="flex-start" spacing="var(--spacing-1)">
                                <Ark.Text as="span" className="dati-generali-header-nome">
                                    {data.infoBase.denominazione}
                                </Ark.Text>
                                <Ark.HStack align="center" spacing="var(--spacing-2)">
                                    <Ark.Badge color="muted" variant="outline" size="sm">
                                        {data.infoBase.codice}
                                    </Ark.Badge>
                                    <Ark.Badge 
                                        color={isPF ? 'primary' : 'info'} 
                                        variant="light" 
                                        size="sm"
                                    >
                                        {data.infoBase.tipoPersona.tipo}
                                    </Ark.Badge>
                                </Ark.HStack>
                            </Ark.VStack>
                        </Ark.HStack>
                    </Ark.CardHeader>
                    <Ark.CardBody>
                        {/* Griglia dati PF o PG */}
                        {isPF && data.datiPF && (
                            <Ark.SimpleGrid columns={3} gap="var(--spacing-4)">
                                <Ark.LabeledValue label="Nome" value={data.datiPF.nome} />
                                <Ark.LabeledValue label="Cognome" value={data.datiPF.cognome} />
                                <Ark.LabeledValue label="Codice Fiscale" value={data.datiPF.codiceFiscale} />
                                {data.datiPF.dataNascita && (
                                    <Ark.LabeledValue label="Data Nascita" value={data.datiPF.dataNascita} format="date" />
                                )}
                                {data.datiPF.luogoNascita && (
                                    <Ark.LabeledValue label="Luogo Nascita" value={data.datiPF.luogoNascita} />
                                )}
                                {data.datiPF.sesso && (
                                    <Ark.LabeledValue label="Sesso" value={data.datiPF.sesso.label} />
                                )}
                                {data.datiPF.cittadinanza && (
                                    <Ark.LabeledValue label="Cittadinanza" value={data.datiPF.cittadinanza} />
                                )}
                                {data.datiPF.statoCivile && (
                                    <Ark.LabeledValue label="Stato Civile" value={data.datiPF.statoCivile} />
                                )}
                            </Ark.SimpleGrid>
                        )}
                        {!isPF && data.datiPG && (
                            <Ark.SimpleGrid columns={3} gap="var(--spacing-4)">
                                <Ark.LabeledValue label="Ragione Sociale" value={data.datiPG.ragioneSociale} />
                                <Ark.LabeledValue label="Partita IVA" value={data.datiPG.partitaIva} />
                                <Ark.LabeledValue label="Codice Fiscale" value={data.datiPG.codiceFiscale} />
                                {data.datiPG.formaGiuridica && (
                                    <Ark.LabeledValue label="Forma Giuridica" value={data.datiPG.formaGiuridica} />
                                )}
                                {data.datiPG.sedeLegale && (
                                    <Ark.LabeledValue label="Sede Legale" value={data.datiPG.sedeLegale} />
                                )}
                                {data.datiPG.sedeOperativa && (
                                    <Ark.LabeledValue label="Sede Operativa" value={data.datiPG.sedeOperativa} />
                                )}
                            </Ark.SimpleGrid>
                        )}
                    </Ark.CardBody>
                </Ark.Card>

                {/* Recapiti Card */}
                {hasRecapiti && (
                    <Ark.Card variant="default" className="dati-generali-card dati-generali-card--recapiti">
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
                                {data.recapiti!.map((r) => {
                                    const icon = RECAPITO_ICON[r.tipo.id] ?? RECAPITO_ICON[5];
                                    const label = r.label ?? r.tipo.label.toUpperCase();
                                    const indirizzoDisplay = r.indirizzo
                                        ? [r.indirizzo.via, r.indirizzo.comune, r.indirizzo.cap].filter(Boolean).join(', ')
                                        : null;

                                    return (
                                        <Ark.Box key={r.id} className="dati-generali-recapito-row">
                                            <Ark.HStack align="flex-start" spacing="var(--spacing-3)">
                                                <Ark.Box className={`dati-generali-recapito-icon dati-generali-recapito-icon--${r.tipo.id}`}>
                                                    <Ark.Icon icon={icon} size="sm" />
                                                </Ark.Box>
                                                <Ark.VStack align="flex-start" spacing="var(--spacing-0-5)">
                                                    <Ark.Text as="span" className="dati-generali-recapito-valore">
                                                        {indirizzoDisplay ?? r.valore}
                                                    </Ark.Text>
                                                    <Ark.Text as="span" className="dati-generali-recapito-label">
                                                        {label}
                                                    </Ark.Text>
                                                </Ark.VStack>
                                            </Ark.HStack>
                                        </Ark.Box>
                                    );
                                })}
                            </Ark.VStack>
                        </Ark.CardBody>
                    </Ark.Card>
                )}
            </Ark.Flex>

            {/* Row 2: Immobili & Contratti + Nucleo Familiare */}
            {(hasImmobili || hasNucleo) && (
                <Ark.Flex className="dati-generali-row dati-generali-row--2">
                    {/* Immobili Card */}
                    {hasImmobili && (
                        <Ark.Card
                            variant="default"
                            className="dati-generali-card dati-generali-card--immobili"
                            style={data.immobiliContratti!.contrattoAttivo 
                                ? { borderTop: `3px solid ${STATO_CONTRATTO_BORDER[data.immobiliContratti!.contrattoAttivo.stato.id]}` }
                                : undefined
                            }
                            interactive={navigableImmobili}
                            onClick={navigableImmobili ? onNavigateImmobili : undefined}
                        >
                            <Ark.CardHeader>
                                <Ark.HStack align="center" justify="space-between">
                                    <Ark.HStack align="center" spacing="var(--spacing-2)">
                                        <Ark.Icon icon="Building2" size="sm" className="dati-generali-card-icon" />
                                        <Ark.Text as="span" className="dati-generali-card-title">
                                            Immobili e Contratti
                                        </Ark.Text>
                                    </Ark.HStack>
                                    <Ark.Badge color="primary" variant="default" size="sm">
                                        {data.immobiliContratti!.count}
                                    </Ark.Badge>
                                </Ark.HStack>
                            </Ark.CardHeader>
                            <Ark.CardBody>
                                <Ark.VStack spacing="var(--spacing-4)">
                                    {/* Contratto attivo */}
                                    {data.immobiliContratti!.contrattoAttivo && (
                                        <Ark.Box className="dati-generali-contratto-attivo">
                                            <Ark.HStack align="center" spacing="var(--spacing-2)">
                                                <Ark.Icon icon="FileText" size="xs" />
                                                <Ark.Text as="span">Contratto attivo</Ark.Text>
                                                <Ark.Badge 
                                                    color={STATO_CONTRATTO_COLOR[data.immobiliContratti!.contrattoAttivo.stato.id]} 
                                                    variant="light" 
                                                    size="xs"
                                                >
                                                    {data.immobiliContratti!.contrattoAttivo.stato.label.toUpperCase()}
                                                </Ark.Badge>
                                            </Ark.HStack>
                                            <Ark.SimpleGrid columns={4} gap="var(--spacing-4)" className="mt-2">
                                                <Ark.LabeledValue 
                                                    label="Canone" 
                                                    value={`€ ${data.immobiliContratti!.contrattoAttivo.canone.toLocaleString('it-IT')}/${data.immobiliContratti!.contrattoAttivo.unitaMisura ?? 'mese'}`}
                                                />
                                                <Ark.LabeledValue label="Tipo" value={data.immobiliContratti!.contrattoAttivo.tipo} />
                                                <Ark.LabeledValue label="Codice" value={data.immobiliContratti!.contrattoAttivo.codice} />
                                                <Ark.LabeledValue label="Decorrenza" value={data.immobiliContratti!.contrattoAttivo.decorrenza} format="date" />
                                            </Ark.SimpleGrid>
                                        </Ark.Box>
                                    )}
                                    {/* Lista immobili */}
                                    {data.immobiliContratti!.immobili.map((im) => (
                                        <Ark.Box key={im.codice} className="dati-generali-immobile-row">
                                            <Ark.HStack align="center" spacing="var(--spacing-3)">
                                                <Ark.Icon icon="Home" size="sm" />
                                                <Ark.VStack align="flex-start" spacing="var(--spacing-1)" style={{ flex: 1 }}>
                                                    <Ark.Text as="span" className="dati-generali-immobile-codice">
                                                        {im.codice}
                                                    </Ark.Text>
                                                    <Ark.Text as="span" className="dati-generali-immobile-indirizzo">
                                                        {im.indirizzo}
                                                    </Ark.Text>
                                                </Ark.VStack>
                                                <Ark.Icon icon="ChevronRight" size="sm" />
                                            </Ark.HStack>
                                        </Ark.Box>
                                    ))}
                                </Ark.VStack>
                            </Ark.CardBody>
                        </Ark.Card>
                    )}

                    {/* Nucleo Familiare Card */}
                    {hasNucleo && (
                        <Ark.Card variant="default" className="dati-generali-card dati-generali-card--nucleo">
                            <Ark.CardHeader>
                                <Ark.HStack align="center" justify="space-between">
                                    <Ark.HStack align="center" spacing="var(--spacing-2)">
                                        <Ark.Icon icon="Users" size="sm" className="dati-generali-card-icon" />
                                        <Ark.Text as="span" className="dati-generali-card-title">
                                            Nucleo Familiare
                                        </Ark.Text>
                                    </Ark.HStack>
                                    <Ark.Badge color="info" variant="default" size="sm">
                                        {data.nucleoFamiliare!.componenti}
                                    </Ark.Badge>
                                </Ark.HStack>
                            </Ark.CardHeader>
                            <Ark.CardBody>
                                <Ark.VStack spacing="var(--spacing-4)">
                                    {/* Stats */}
                                    <Ark.Box className="dati-generali-nucleo-stats">
                                        <Ark.IconStat icon="User" value={data.nucleoFamiliare!.componenti} label="Componenti" variant="primary" />
                                        <Ark.IconStat icon="Baby" value={data.nucleoFamiliare!.minori} label="Minori" variant="muted" />
                                        <Ark.IconStat icon="Heart" value={data.nucleoFamiliare!.disabili} label="Disabili" variant="warning" />
                                    </Ark.Box>
                                    {/* Lista membri */}
                                    {data.nucleoFamiliare!.membri.map((m) => (
                                        <Ark.HStack key={m.id} align="center" spacing="var(--spacing-3)" className="dati-generali-membro-row">
                                            <Ark.Avatar alt={m.nome} size="sm" />
                                            <Ark.VStack align="flex-start" spacing="var(--spacing-0-5)" style={{ flex: 1 }}>
                                                <Ark.Text as="span" className="dati-generali-membro-nome">{m.nome}</Ark.Text>
                                                {m.relazione && (
                                                    <Ark.Text as="span" className="dati-generali-membro-relazione">{m.relazione}</Ark.Text>
                                                )}
                                            </Ark.VStack>
                                            {m.badges?.map((b) => (
                                                <Ark.Badge key={b} color="warning" variant="light" size="xs">{b}</Ark.Badge>
                                            ))}
                                        </Ark.HStack>
                                    ))}
                                </Ark.VStack>
                            </Ark.CardBody>
                        </Ark.Card>
                    )}
                </Ark.Flex>
            )}

            {/* Row 3: Situazione Economica */}
            {hasSituazioneEco && (
                <Ark.Card
                    variant="default"
                    className="dati-generali-card dati-generali-card--eco"
                    style={data.situazioneEconomica!.statoInquilino 
                        ? { borderTop: `3px solid var(--colors-${STATO_INQUILINO_COLOR[data.situazioneEconomica!.statoInquilino.id]})` }
                        : undefined
                    }
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
                            {/* Reddito ISEE */}
                            <Ark.VStack align="flex-start" spacing="var(--spacing-0-5)">
                                <Ark.Text as="span" className="dati-generali-field-label">Reddito ISEE</Ark.Text>
                                {data.situazioneEconomica!.redditoIsee != null ? (
                                    <Ark.HStack align="center" spacing="var(--spacing-1)">
                                        <Ark.Icon icon="CircleDollarSign" size="xs" className="dati-generali-isee-icon" />
                                        <Ark.Text as="span" className="dati-generali-isee-valore">
                                            € {data.situazioneEconomica!.redditoIsee.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                                        </Ark.Text>
                                    </Ark.HStack>
                                ) : (
                                    <Ark.Text as="span" className="dati-generali-field-value">–</Ark.Text>
                                )}
                            </Ark.VStack>

                            <Ark.LabeledValue label="Scadenza ISEE" value={data.situazioneEconomica!.scadenzaIsee ?? '–'} format={data.situazioneEconomica!.scadenzaIsee ? 'date' : undefined} />
                            <Ark.LabeledValue label="Fascia Inquilino" value={data.situazioneEconomica!.fasciaInquilino ?? '–'} />

                            {/* Ultimo pagamento */}
                            <Ark.VStack align="flex-start" spacing="var(--spacing-0-5)">
                                <Ark.Text as="span" className="dati-generali-field-label">Ultimo Pagamento</Ark.Text>
                                {data.situazioneEconomica!.ultimoPagamento ? (
                                    <Ark.HStack align="center" spacing="var(--spacing-1)">
                                        <Ark.Text as="span">{data.situazioneEconomica!.ultimoPagamento.dataFormattata}</Ark.Text>
                                        <Ark.Text as="span">— € {data.situazioneEconomica!.ultimoPagamento.importo.toLocaleString('it-IT')}</Ark.Text>
                                    </Ark.HStack>
                                ) : (
                                    <Ark.Text as="span">–</Ark.Text>
                                )}
                            </Ark.VStack>

                            {/* Stato Inquilino */}
                            <Ark.VStack align="flex-start" spacing="var(--spacing-0-5)">
                                <Ark.Text as="span" className="dati-generali-field-label">Stato Inquilino</Ark.Text>
                                {data.situazioneEconomica!.statoInquilino ? (
                                    <Ark.Badge color={STATO_INQUILINO_COLOR[data.situazioneEconomica!.statoInquilino.id]} variant="light" size="sm">
                                        <Ark.Icon icon="CircleCheck" size="xs" style={{ marginRight: '4px' }} />
                                        {data.situazioneEconomica!.statoInquilino.label}
                                    </Ark.Badge>
                                ) : (
                                    <Ark.Text as="span">–</Ark.Text>
                                )}
                            </Ark.VStack>
                        </Ark.SimpleGrid>
                    </Ark.CardBody>
                </Ark.Card>
            )}
        </Ark.Box>
    );
};

DatiGeneraliDroplet.displayName = 'DatiGeneraliDroplet';

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register('tecnosys-dati-generali', DatiGeneraliDroplet);

export default DatiGeneraliDroplet;
