import React, { useMemo, useCallback, useEffect, useRef } from 'react';
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
import { Ark, Sesso, SESSO } from '@tecnosys/components';

// ══════════════════════════════════════════════════════════════════════════════
// Type Definitions (local - avoid conflicts with other droplets)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * OptionItem per autocomplete/select (local use only)
 */
interface OptionItem {
    label: string;
    value: string;
}

/**
 * TipoPersona discriminated union (local)
 */
type TipoPersonaFisica = { id: 0; tipo: 'Persona fisica' };
type TipoPersonaGiuridica = { id: 1; tipo: 'Persona giuridica' };
type TipoPersona = TipoPersonaFisica | TipoPersonaGiuridica;

const TIPO_PERSONA = {
    FISICA: { id: 0, tipo: 'Persona fisica' } as const satisfies TipoPersonaFisica,
    GIURIDICA: { id: 1, tipo: 'Persona giuridica' } as const satisfies TipoPersonaGiuridica,
} as const;

/**
 * Dati generali Persona Fisica (local)
 */
interface DatiGeneraliPF {
    nome: string;
    secondoNome?: string;
    cognome: string;
    sesso: Sesso | null;
    statoCivile?: string;
    nazionalita?: OptionItem | null;
    codiceFiscale: string;
    partitaIva?: string;
    codiceIpa?: string;
    dataNascita?: Date;
    statoNascita?: OptionItem | null;
    regioneNascita?: OptionItem | null;
    provinciaNascita?: OptionItem | null;
    comuneNascita?: OptionItem | null;
}

/**
 * Dati generali Persona Giuridica (local)
 */
interface DatiGeneraliPG {
    ragioneSociale: string;
    codiceFiscale: string;
    partitaIva: string;
    naturaSociale?: OptionItem | null;
    rappresentanteLegale?: OptionItem | null;
    codiceIpa?: string;
    incorporationDate?: Date | null;
    chamberOfCommerce?: string;
    reaNumber?: string;
    shareCapital?: string;
    businessObject?: string;
}

/**
 * Snapshot dati generali (discriminated union)
 */
export type DatiGeneraliSnapshot =
    | { tipoPersona: { id: 0; tipo: 'Persona fisica' }; data: DatiGeneraliPF }
    | { tipoPersona: { id: 1; tipo: 'Persona giuridica' }; data: DatiGeneraliPG };

/**
 * Data type for DatiGeneraliStep droplet
 */
export type DatiGeneraliStepData = DatiGeneraliSnapshot;

/**
 * Configuration options for the step
 */
export interface DatiGeneraliStepConfig {
    /** Opzioni stato civile (PF) */
    statoCivileOptions?: OptionItem[];
    /** Risultati ricerca nazionalità (PF) */
    nazionalitaOptions?: OptionItem[];
    /** Risultati ricerca stato nascita (PF) */
    statoNascitaOptions?: OptionItem[];
    /** Risultati ricerca regione nascita (PF) */
    regioneNascitaOptions?: OptionItem[];
    /** Risultati ricerca provincia nascita (PF) */
    provinciaNascitaOptions?: OptionItem[];
    /** Risultati ricerca comune nascita (PF) */
    comuneNascitaOptions?: OptionItem[];
    /** Opzioni natura giuridica (PG) */
    naturaSocialeOptions?: OptionItem[];
    /** Opzioni rappresentante legale (PG) */
    rappresentanteLegaleOptions?: OptionItem[];
}

/**
 * Component-specific props
 */
export type DatiGeneraliStepProps = {
    /** CSS class name */
    className?: string;
    /** Configuration for options */
    config?: DatiGeneraliStepConfig;
    /** Initial tipo persona (default: 0 = fisica) */
    initialTipoPersona?: 0 | 1;
};

/**
 * Complete droplet definition
 */
export type DatiGeneraliStepDropletDefinition = DropletDefinition<DatiGeneraliStepData> & {
    props?: DatiGeneraliStepProps;
};

// ══════════════════════════════════════════════════════════════════════════════
// Constants
// ══════════════════════════════════════════════════════════════════════════════

const SESSO_OPTIONS = [SESSO.MASCHIO, SESSO.FEMMINA].map(({ codice, label }) => ({
    value: codice,
    label,
}));

/** Empty PF form state */
const EMPTY_PF: DatiGeneraliPF = {
    nome: '',
    secondoNome: undefined,
    cognome: '',
    sesso: null,
    statoCivile: undefined,
    nazionalita: null,
    codiceFiscale: '',
    partitaIva: undefined,
    codiceIpa: undefined,
    dataNascita: undefined,
    statoNascita: null,
    regioneNascita: null,
    provinciaNascita: null,
    comuneNascita: null,
};

/** Empty PG form state */
const EMPTY_PG: DatiGeneraliPG = {
    ragioneSociale: '',
    codiceFiscale: '',
    partitaIva: '',
    naturaSociale: null,
    rappresentanteLegale: null,
    codiceIpa: undefined,
    incorporationDate: null,
    chamberOfCommerce: undefined,
    reaNumber: undefined,
    shareCapital: undefined,
    businessObject: undefined,
};

/** Convert OptionItem[] → SelectOption[] */
const toSelectOptions = (opts: OptionItem[]): Ark.SelectOption[] =>
    opts.map(({ label, value }) => ({ label, value }));

// ══════════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════════

export const DatiGeneraliStepDroplet: DropletBuilderComponent<DatiGeneraliStepDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);
    const lastValidityRef = useRef<boolean | null>(null);

    // ── Trigger Definitions ─────────────────────────────────────────────────
    const changeTriggerDef = useMemo(() => ({
        type: 'system',
        name: `${definition.name}Changed`,
        enabled: true,
    }), [definition.name]);

    const validityTriggerDef = useMemo(() => ({
        type: 'system',
        name: `${definition.name}ValidityChanged`,
        enabled: true,
    }), [definition.name]);

    const searchTriggerDef = useMemo(() => ({
        type: 'system',
        name: `${definition.name}Search`,
        enabled: true,
    }), [definition.name]);

    const tipoChangeTriggerDef = useMemo(() => ({
        type: 'system',
        name: `${definition.name}TipoPersonaChanged`,
        enabled: true,
    }), [definition.name]);

    const changeTrigger = useTriggerState(form, changeTriggerDef);
    const validityTrigger = useTriggerState(form, validityTriggerDef);
    const searchTrigger = useTriggerState(form, searchTriggerDef);
    const tipoChangeTrigger = useTriggerState(form, tipoChangeTriggerDef);
    const { handleTrigger: triggerChange } = useTriggerActions(form, changeTriggerDef);
    const { handleTrigger: triggerValidity } = useTriggerActions(form, validityTriggerDef);
    const { handleTrigger: triggerSearch } = useTriggerActions(form, searchTriggerDef);
    const { handleTrigger: triggerTipoChange } = useTriggerActions(form, tipoChangeTriggerDef);

    // ── Data Extraction ─────────────────────────────────────────────────────
    const snapshot: DatiGeneraliSnapshot = useMemo(() => {
        if (droplet?.value && typeof droplet.value === 'object' && 'tipoPersona' in droplet.value) {
            return droplet.value as DatiGeneraliSnapshot;
        }
        // Default: persona fisica
        const initialTipo = definition.props?.initialTipoPersona ?? 0;
        if (initialTipo === 1) {
            return { tipoPersona: TIPO_PERSONA.GIURIDICA, data: EMPTY_PG };
        }
        return { tipoPersona: TIPO_PERSONA.FISICA, data: EMPTY_PF };
    }, [droplet?.value, definition.props?.initialTipoPersona]);

    const tipoPersona = snapshot.tipoPersona;
    const isPF = tipoPersona.id === 0;
    const pfData = isPF ? (snapshot.data as DatiGeneraliPF) : EMPTY_PF;
    const pgData = !isPF ? (snapshot.data as DatiGeneraliPG) : EMPTY_PG;

    const config = definition.props?.config;
    const statoCivileOptions = useMemo(
        () => toSelectOptions(config?.statoCivileOptions || []),
        [config?.statoCivileOptions]
    );

    // ── Validity Check ──────────────────────────────────────────────────────
    useEffect(() => {
        let isValid = false;
        if (isPF) {
            isValid =
                !!pfData.nome.trim() &&
                !!pfData.cognome.trim() &&
                pfData.sesso != null &&
                !!pfData.nazionalita &&
                !!pfData.codiceFiscale.trim() &&
                !!pfData.dataNascita;
        } else {
            const pg = pgData;
            isValid =
                !!pg.ragioneSociale.trim() &&
                !!pg.codiceFiscale.trim() &&
                !!pg.partitaIva.trim() &&
                !!pg.naturaSociale &&
                !!pg.rappresentanteLegale;
        }

        if (lastValidityRef.current !== isValid) {
            lastValidityRef.current = isValid;
            if (validityTrigger) {
                validityTrigger.signalData = { isValid, tipoPersona: tipoPersona.id };
                triggerValidity();
            }
        }
    }, [isPF, pfData, pgData, tipoPersona.id, validityTrigger, triggerValidity]);

    // ── Update Helpers ──────────────────────────────────────────────────────
    const updateSnapshot = useCallback((newSnapshot: DatiGeneraliSnapshot) => {
        updateValue(newSnapshot);
        if (changeTrigger) {
            changeTrigger.signalData = newSnapshot;
            triggerChange();
        }
    }, [updateValue, changeTrigger, triggerChange]);

    const setPF = useCallback(<K extends keyof DatiGeneraliPF>(key: K, val: DatiGeneraliPF[K]) => {
        const newPF = { ...pfData, [key]: val };
        updateSnapshot({ tipoPersona: TIPO_PERSONA.FISICA, data: newPF });
    }, [pfData, updateSnapshot]);

    const setPG = useCallback(<K extends keyof DatiGeneraliPG>(key: K, val: DatiGeneraliPG[K]) => {
        const newPG = { ...pgData, [key]: val };
        updateSnapshot({ tipoPersona: TIPO_PERSONA.GIURIDICA, data: newPG });
    }, [pgData, updateSnapshot]);

    // ── Search Handler ──────────────────────────────────────────────────────
    const handleSearch = useCallback((field: string, query: string) => {
        if (searchTrigger) {
            searchTrigger.signalData = { field, query, tipoPersona: tipoPersona.id };
            triggerSearch();
        }
    }, [searchTrigger, triggerSearch, tipoPersona.id]);

    // ── Switch Tipo Persona ─────────────────────────────────────────────────
    const handleSwitchTipo = useCallback((newTipo: TipoPersona) => {
        if (newTipo.id === tipoPersona.id) return;
        lastValidityRef.current = null; // Reset validity
        const newSnapshot: DatiGeneraliSnapshot = newTipo.id === 0
            ? { tipoPersona: TIPO_PERSONA.FISICA, data: pfData }
            : { tipoPersona: TIPO_PERSONA.GIURIDICA, data: pgData };
        updateValue(newSnapshot);
        if (tipoChangeTrigger) {
            tipoChangeTrigger.signalData = { tipoPersona: newTipo.id };
            triggerTipoChange();
        }
    }, [tipoPersona.id, pfData, pgData, updateValue, tipoChangeTrigger, triggerTipoChange]);

    // ── Cascade handlers for birth location (PF) ───────────────────────────
    const handleStatoNascitaChange = useCallback((items: OptionItem[]) => {
        const selected = items[0] ?? null;
        const changed = selected?.value !== pfData.statoNascita?.value;
        const newPF: DatiGeneraliPF = {
            ...pfData,
            statoNascita: selected,
            regioneNascita: changed ? null : pfData.regioneNascita,
            provinciaNascita: changed ? null : pfData.provinciaNascita,
            comuneNascita: changed ? null : pfData.comuneNascita,
        };
        updateSnapshot({ tipoPersona: TIPO_PERSONA.FISICA, data: newPF });
    }, [pfData, updateSnapshot]);

    const handleRegioneNascitaChange = useCallback((items: OptionItem[]) => {
        const selected = items[0] ?? null;
        const changed = selected?.value !== pfData.regioneNascita?.value;
        const newPF: DatiGeneraliPF = {
            ...pfData,
            regioneNascita: selected,
            provinciaNascita: changed ? null : pfData.provinciaNascita,
            comuneNascita: changed ? null : pfData.comuneNascita,
        };
        updateSnapshot({ tipoPersona: TIPO_PERSONA.FISICA, data: newPF });
    }, [pfData, updateSnapshot]);

    const handleProvinciaNascitaChange = useCallback((items: OptionItem[]) => {
        const selected = items[0] ?? null;
        const changed = selected?.value !== pfData.provinciaNascita?.value;
        const newPF: DatiGeneraliPF = {
            ...pfData,
            provinciaNascita: selected,
            comuneNascita: changed ? null : pfData.comuneNascita,
        };
        updateSnapshot({ tipoPersona: TIPO_PERSONA.FISICA, data: newPF });
    }, [pfData, updateSnapshot]);

    // Early return check
    if (!droplet || droplet.visible === false) return null;

    const isDisabled = definition.enabled === false;
    const isReadonly = definition.readonly === true;

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <Ark.Box className={`nuova-anagrafica-stepper-step ${definition.props?.className || ''}`}>
            {/* ── Selettore tipo anagrafica ─────────────────────────────────── */}
            <Ark.Box className="nuova-anagrafica-stepper-type-selector">
                <Ark.Text as="p" className="nuova-anagrafica-stepper-type-selector-label">
                    Tipo anagrafica
                </Ark.Text>
                <Ark.HStack spacing="var(--spacing-2, 0.5rem)">
                    <Ark.Button
                        id={`${droplet.id}-btn-pf`}
                        variant={isPF ? 'primary' : 'ghost'}
                        size="sm"
                        leftIcon="User"
                        onClick={() => handleSwitchTipo(TIPO_PERSONA.FISICA)}
                        aria-pressed={isPF}
                        disabled={isDisabled}
                    >
                        Persona fisica
                    </Ark.Button>
                    <Ark.Button
                        id={`${droplet.id}-btn-pg`}
                        variant={!isPF ? 'primary' : 'ghost'}
                        size="sm"
                        leftIcon="Building2"
                        onClick={() => handleSwitchTipo(TIPO_PERSONA.GIURIDICA)}
                        aria-pressed={!isPF}
                        disabled={isDisabled}
                    >
                        Persona giuridica
                    </Ark.Button>
                </Ark.HStack>
            </Ark.Box>

            {/* ── Form Persona Fisica ─────────────────────────────────────────── */}
            {isPF && (
                <Ark.VStack spacing="var(--spacing-5)">
                    {/* Card 1: Dati anagrafici */}
                    <Ark.Card variant="outline" padding="lg">
                        <Ark.Box className="nuova-anagrafica-stepper-card-header">
                            <Ark.PageTitle icon="User" title="Dati anagrafici" size="md" />
                        </Ark.Box>
                        <Ark.SimpleGrid columns={2} gap="5">
                            <Ark.TextInput
                                id={`${droplet.id}-nome`}
                                label="Nome"
                                value={pfData.nome}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPF('nome', e.target.value)}
                                required
                                placeholder="Inserisci il nome"
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                            <Ark.TextInput
                                id={`${droplet.id}-secondo-nome`}
                                label="Secondo nome"
                                value={pfData.secondoNome ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPF('secondoNome', e.target.value || undefined)}
                                placeholder="Inserisci il secondo nome"
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                            <Ark.TextInput
                                id={`${droplet.id}-cognome`}
                                label="Cognome"
                                value={pfData.cognome}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPF('cognome', e.target.value)}
                                required
                                placeholder="Inserisci il cognome"
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                            <Ark.Box>
                                <Ark.RadioGroup
                                    id={`${droplet.id}-sesso`}
                                    label="Sesso"
                                    options={SESSO_OPTIONS}
                                    value={pfData.sesso?.codice || undefined}
                                    onValueChange={(d) =>
                                        setPF('sesso', d.value === 'M' ? SESSO.MASCHIO : d.value === 'F' ? SESSO.FEMMINA : null)
                                    }
                                    orientation="horizontal"
                                    required
                                    disabled={isDisabled}
                                />
                            </Ark.Box>
                            {statoCivileOptions.length > 0 && (
                                <Ark.Select
                                    id={`${droplet.id}-stato-civile`}
                                    label="Stato civile"
                                    options={statoCivileOptions}
                                    value={pfData.statoCivile ? [pfData.statoCivile] : []}
                                    onValueChange={(d) => setPF('statoCivile', d.value[0] ?? undefined)}
                                    placeholder="Seleziona stato civile"
                                    disabled={isDisabled}
                                />
                            )}
                            <Ark.Autocomplete
                                id={`${droplet.id}-nazionalita`}
                                label="Nazionalità"
                                value={pfData.nazionalita ?? null}
                                options={config?.nazionalitaOptions || []}
                                onInputValueChange={(d) => handleSearch('nazionalita', d.inputValue)}
                                onValueChange={(items) => setPF('nazionalita', items[0] ?? null)}
                                minChars={3}
                                debounceTime={750}
                                required
                                placeholder="Cerca nazionalità"
                                disabled={isDisabled}
                            />
                        </Ark.SimpleGrid>
                    </Ark.Card>

                    {/* Card 2: Dati di nascita */}
                    <Ark.Card variant="outline" padding="lg">
                        <Ark.Box className="nuova-anagrafica-stepper-card-header">
                            <Ark.PageTitle icon="FileText" title="Dati di nascita" size="md" />
                        </Ark.Box>
                        <Ark.SimpleGrid columns={2} gap="5">
                            <Ark.TextInput
                                id={`${droplet.id}-codice-fiscale`}
                                label="Codice Fiscale"
                                value={pfData.codiceFiscale}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPF('codiceFiscale', e.target.value.toUpperCase())}
                                required
                                placeholder="Inserisci codice fiscale"
                                maxLength={16}
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                            <Ark.DateInput
                                id={`${droplet.id}-data-nascita`}
                                label="Data di nascita"
                                value={pfData.dataNascita}
                                onValueChange={(d) => setPF('dataNascita', d.value)}
                                required
                                placeholder="gg/mm/aaaa"
                                disabled={isDisabled}
                            />
                            <Ark.Autocomplete
                                id={`${droplet.id}-stato-nascita`}
                                label="Stato di nascita"
                                value={pfData.statoNascita ?? null}
                                options={config?.statoNascitaOptions || []}
                                onInputValueChange={(d) => handleSearch('statoNascita', d.inputValue)}
                                onValueChange={handleStatoNascitaChange}
                                minChars={3}
                                debounceTime={750}
                                placeholder="Cerca stato"
                                disabled={isDisabled}
                            />
                            <Ark.Autocomplete
                                id={`${droplet.id}-regione-nascita`}
                                label="Regione di nascita"
                                value={pfData.regioneNascita ?? null}
                                options={config?.regioneNascitaOptions || []}
                                onInputValueChange={(d) => handleSearch('regioneNascita', d.inputValue)}
                                onValueChange={handleRegioneNascitaChange}
                                minChars={3}
                                debounceTime={750}
                                placeholder={pfData.statoNascita ? 'Cerca regione' : 'Seleziona prima lo stato'}
                                disabled={isDisabled || !pfData.statoNascita}
                            />
                            <Ark.Autocomplete
                                id={`${droplet.id}-provincia-nascita`}
                                label="Provincia di nascita"
                                value={pfData.provinciaNascita ?? null}
                                options={config?.provinciaNascitaOptions || []}
                                onInputValueChange={(d) => handleSearch('provinciaNascita', d.inputValue)}
                                onValueChange={handleProvinciaNascitaChange}
                                minChars={3}
                                debounceTime={750}
                                placeholder={pfData.regioneNascita ? 'Cerca provincia' : 'Seleziona prima la regione'}
                                disabled={isDisabled || !pfData.regioneNascita}
                            />
                            <Ark.Autocomplete
                                id={`${droplet.id}-comune-nascita`}
                                label="Comune di nascita"
                                value={pfData.comuneNascita ?? null}
                                options={config?.comuneNascitaOptions || []}
                                onInputValueChange={(d) => handleSearch('comuneNascita', d.inputValue)}
                                onValueChange={(items) => setPF('comuneNascita', items[0] ?? null)}
                                minChars={3}
                                debounceTime={750}
                                placeholder={pfData.provinciaNascita ? 'Cerca comune' : 'Seleziona prima la provincia'}
                                disabled={isDisabled || !pfData.provinciaNascita}
                            />
                        </Ark.SimpleGrid>
                    </Ark.Card>

                    {/* Card 3: Dati fiscali */}
                    <Ark.Card variant="outline" padding="lg">
                        <Ark.Box className="nuova-anagrafica-stepper-card-header">
                            <Ark.PageTitle icon="ReceiptEuro" title="Dati fiscali" size="md" />
                        </Ark.Box>
                        <Ark.SimpleGrid columns={2} gap="5">
                            <Ark.TextInput
                                id={`${droplet.id}-partita-iva`}
                                label="Partita IVA"
                                value={pfData.partitaIva ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPF('partitaIva', e.target.value || undefined)}
                                placeholder="Inserisci partita IVA"
                                maxLength={11}
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                            <Ark.TextInput
                                id={`${droplet.id}-codice-ipa`}
                                label="Codice IPA"
                                value={pfData.codiceIpa ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPF('codiceIpa', e.target.value || undefined)}
                                placeholder="Codice IPA (fatturazione PA)"
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                        </Ark.SimpleGrid>
                    </Ark.Card>
                </Ark.VStack>
            )}

            {/* ── Form Persona Giuridica ──────────────────────────────────────── */}
            {!isPF && (
                <Ark.VStack spacing="var(--spacing-5)">
                    {/* Card 1: Dati società */}
                    <Ark.Card variant="outline" padding="lg">
                        <Ark.Box className="nuova-anagrafica-stepper-card-header">
                            <Ark.PageTitle icon="Building" title="Dati società" size="md" />
                        </Ark.Box>
                        <Ark.SimpleGrid columns={2} gap="5">
                            <Ark.TextInput
                                id={`${droplet.id}-ragione-sociale`}
                                label="Ragione sociale"
                                value={pgData.ragioneSociale}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPG('ragioneSociale', e.target.value)}
                                required
                                placeholder="Inserisci la ragione sociale"
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                            <Ark.TextInput
                                id={`${droplet.id}-cf-pg`}
                                label="Codice fiscale"
                                value={pgData.codiceFiscale}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPG('codiceFiscale', e.target.value.toUpperCase())}
                                required
                                placeholder="Inserisci il codice fiscale"
                                maxLength={16}
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                            <Ark.TextInput
                                id={`${droplet.id}-piva-pg`}
                                label="Partita IVA"
                                value={pgData.partitaIva}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPG('partitaIva', e.target.value)}
                                required
                                placeholder="Inserisci la partita IVA"
                                maxLength={11}
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                            <Ark.Autocomplete
                                id={`${droplet.id}-natura-sociale`}
                                label="Natura giuridica"
                                value={pgData.naturaSociale ?? null}
                                options={config?.naturaSocialeOptions || []}
                                onInputValueChange={(d) => handleSearch('naturaSociale', d.inputValue)}
                                onValueChange={(items) => setPG('naturaSociale', items[0] ?? null)}
                                minChars={0}
                                required
                                placeholder="Seleziona la natura giuridica"
                                disabled={isDisabled}
                            />
                            <Ark.Autocomplete
                                id={`${droplet.id}-rappresentante-legale`}
                                label="Rappresentante legale"
                                value={pgData.rappresentanteLegale ?? null}
                                options={config?.rappresentanteLegaleOptions || []}
                                onInputValueChange={(d) => handleSearch('rappresentanteLegale', d.inputValue)}
                                onValueChange={(items) => setPG('rappresentanteLegale', items[0] ?? null)}
                                minChars={0}
                                required
                                placeholder="Seleziona il rappresentante"
                                disabled={isDisabled}
                            />
                        </Ark.SimpleGrid>
                    </Ark.Card>

                    {/* Card 2: Ulteriori informazioni */}
                    <Ark.Card variant="outline" padding="lg">
                        <Ark.Box className="nuova-anagrafica-stepper-card-header">
                            <Ark.PageTitle icon="FileText" title="Ulteriori informazioni" size="md" />
                        </Ark.Box>
                        <Ark.SimpleGrid columns={2} gap="5">
                            <Ark.TextInput
                                id={`${droplet.id}-codice-ipa-pg`}
                                label="Codice IPA"
                                value={pgData.codiceIpa ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPG('codiceIpa', e.target.value || undefined)}
                                placeholder="Codice IPA (fatturazione PA)"
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                            <Ark.DateInput
                                id={`${droplet.id}-incorporation-date`}
                                label="Data di costituzione"
                                value={pgData.incorporationDate ?? undefined}
                                onValueChange={(d) => setPG('incorporationDate', d.value ?? null)}
                                placeholder="gg/mm/aaaa"
                                disabled={isDisabled}
                            />
                            <Ark.TextInput
                                id={`${droplet.id}-chamber-of-commerce`}
                                label="Camera di Commercio"
                                value={pgData.chamberOfCommerce ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPG('chamberOfCommerce', e.target.value || undefined)}
                                placeholder="Iscrizione Camera Commercio"
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                            <Ark.TextInput
                                id={`${droplet.id}-rea-number`}
                                label="Numero REA"
                                value={pgData.reaNumber ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPG('reaNumber', e.target.value || undefined)}
                                placeholder="Numero REA"
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                            <Ark.TextInput
                                id={`${droplet.id}-share-capital`}
                                label="Capitale sociale"
                                value={pgData.shareCapital ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPG('shareCapital', e.target.value || undefined)}
                                placeholder="Capitale sociale dichiarato"
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                        </Ark.SimpleGrid>
                        <Ark.SimpleGrid columns={1} gap="5">
                            <Ark.TextareaInput
                                id={`${droplet.id}-business-object`}
                                label="Oggetto sociale"
                                value={pgData.businessObject ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPG('businessObject', e.target.value || undefined)}
                                placeholder="Descrivi l'oggetto sociale / attività principale"
                                rows={4}
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                        </Ark.SimpleGrid>
                    </Ark.Card>
                </Ark.VStack>
            )}
        </Ark.Box>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════════

dropletRegistry.register('tecnosys-dati-generali-step', DatiGeneraliStepDroplet);

export default DatiGeneraliStepDroplet;
