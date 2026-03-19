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
// Type Definitions
// ══════════════════════════════════════════════════════════════════════════════

/**
 * OptionItem per autocomplete/select
 */
export interface OptionItem {
    label: string;
    value: string;
}

// Re-export Sesso from @tecnosys/components for convenience
export type { Sesso };

/**
 * Dati generali Persona Fisica
 */
export interface DatiGeneraliPF {
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
 * Data type for DatiGeneraliPFForm droplet
 */
export type DatiGeneraliPFFormData = DatiGeneraliPF;

/**
 * Options/search callbacks configuration
 */
export interface DatiGeneraliPFFormConfig {
    /** Lista opzioni stato civile */
    statoCivileOptions?: OptionItem[];
    /** Risultati ricerca nazionalità */
    nazionalitaOptions?: OptionItem[];
    /** Risultati ricerca stato nascita */
    statoNascitaOptions?: OptionItem[];
    /** Risultati ricerca regione nascita */
    regioneNascitaOptions?: OptionItem[];
    /** Risultati ricerca provincia nascita */
    provinciaNascitaOptions?: OptionItem[];
    /** Risultati ricerca comune nascita */
    comuneNascitaOptions?: OptionItem[];
}

/**
 * Component-specific props
 */
export type DatiGeneraliPFFormProps = {
    /** CSS class name */
    className?: string;
    /** Configuration for options */
    config?: DatiGeneraliPFFormConfig;
};

/**
 * Complete droplet definition
 */
export type DatiGeneraliPFFormDropletDefinition = DropletDefinition<DatiGeneraliPFFormData> & {
    props?: DatiGeneraliPFFormProps;
};

// ══════════════════════════════════════════════════════════════════════════════
// Constants
// ══════════════════════════════════════════════════════════════════════════════

const SESSO_OPTIONS = [SESSO.MASCHIO, SESSO.FEMMINA].map(({ codice, label }) => ({
    value: codice,
    label,
}));

const GRID_SPACING = 'var(--spacing-5, 1.25rem)';

/** Convert OptionItem[] → SelectOption[] */
const toSelectOptions = (opts: OptionItem[]): Ark.SelectOption[] =>
    opts.map(({ label, value }) => ({ label, value }));

/** Empty form state */
const EMPTY_FORM: DatiGeneraliPF = {
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

// ══════════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════════

export const DatiGeneraliPFFormDroplet: DropletBuilderComponent<DatiGeneraliPFFormDropletDefinition> = ({
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

    const changeTrigger = useTriggerState(form, changeTriggerDef);
    useTriggerState(form, validityTriggerDef);
    const searchTrigger = useTriggerState(form, searchTriggerDef);
    const { handleTrigger: triggerChange } = useTriggerActions(form, changeTriggerDef);
    const { handleTrigger: triggerValidity } = useTriggerActions(form, validityTriggerDef);
    const { handleTrigger: triggerSearch } = useTriggerActions(form, searchTriggerDef);

    // ── Data Extraction ─────────────────────────────────────────────────────
    const value: DatiGeneraliPF = useMemo(() => {
        if (droplet?.value && typeof droplet.value === 'object') {
            return droplet.value as DatiGeneraliPF;
        }
        return EMPTY_FORM;
    }, [droplet?.value]);

    const config = definition.props?.config;
    const statoCivileOptions = useMemo(
        () => toSelectOptions(config?.statoCivileOptions || []),
        [config?.statoCivileOptions]
    );

    // ── Validity Check ─────────────────────────────────────────────────────
    useEffect(() => {
        const isValid =
            !!value.nome.trim() &&
            !!value.cognome.trim() &&
            value.sesso != null &&
            !!value.nazionalita &&
            !!value.codiceFiscale.trim() &&
            !!value.dataNascita;
        
        if (lastValidityRef.current !== isValid) {
            lastValidityRef.current = isValid;
            (triggerValidity as (data?: unknown) => void)({ isValid, field: null });
        }
    }, [value, triggerValidity]);

    // ── Update Helpers ─────────────────────────────────────────────────────
    const set = useCallback(<K extends keyof DatiGeneraliPF>(key: K, val: DatiGeneraliPF[K]) => {
        const newValue = { ...value, [key]: val };
        updateValue(newValue);
        changeTrigger.signalData = { field: key, value: val };
        triggerChange();
    }, [value, updateValue, changeTrigger, triggerChange]);

    // ── Cascade handlers for birth location ────────────────────────────────
    const handleStatoNascitaChange = useCallback((items: OptionItem[]) => {
        const selected = items[0] ?? null;
        const changed = selected?.value !== value.statoNascita?.value;
        const newValue: DatiGeneraliPF = {
            ...value,
            statoNascita: selected,
            regioneNascita: changed ? null : value.regioneNascita,
            provinciaNascita: changed ? null : value.provinciaNascita,
            comuneNascita: changed ? null : value.comuneNascita,
        };
        updateValue(newValue);
        changeTrigger.signalData = { field: 'statoNascita', value: selected, cascade: changed };
        triggerChange();
    }, [value, updateValue, changeTrigger, triggerChange]);

    const handleRegioneNascitaChange = useCallback((items: OptionItem[]) => {
        const selected = items[0] ?? null;
        const changed = selected?.value !== value.regioneNascita?.value;
        const newValue: DatiGeneraliPF = {
            ...value,
            regioneNascita: selected,
            provinciaNascita: changed ? null : value.provinciaNascita,
            comuneNascita: changed ? null : value.comuneNascita,
        };
        updateValue(newValue);
        changeTrigger.signalData = { field: 'regioneNascita', value: selected, cascade: changed };
        triggerChange();
    }, [value, updateValue, changeTrigger, triggerChange]);

    const handleProvinciaNascitaChange = useCallback((items: OptionItem[]) => {
        const selected = items[0] ?? null;
        const changed = selected?.value !== value.provinciaNascita?.value;
        const newValue: DatiGeneraliPF = {
            ...value,
            provinciaNascita: selected,
            comuneNascita: changed ? null : value.comuneNascita,
        };
        updateValue(newValue);
        changeTrigger.signalData = { field: 'provinciaNascita', value: selected, cascade: changed };
        triggerChange();
    }, [value, updateValue, changeTrigger, triggerChange]);

    // ── Search Handlers ────────────────────────────────────────────────────
    const handleSearch = useCallback((field: string, query: string) => {
        searchTrigger.signalData = { field, query };
        triggerSearch();
    }, [searchTrigger, triggerSearch]);

    // ── Early Return ────────────────────────────────────────────────────────
    if (!droplet || droplet.visible === false) return null;

    // ── Placeholder for Editor ──────────────────────────────────────────────
    if (!droplet.value) {
        return (
            <Ark.Box className={definition.props?.className}>
                <Ark.VStack spacing="var(--spacing-5)">
                    {/* Card 1: Dati anagrafici */}
                    <Ark.Card variant="outline" padding="lg">
                        <Ark.Box className="nuova-anagrafica-stepper-card-header">
                            <Ark.PageTitle icon="User" title="Dati anagrafici" size="md" />
                        </Ark.Box>
                        <Ark.SimpleGrid columns={2} gap="5">
                            <Ark.TextInput id="placeholder-nome" label="Nome" placeholder="Nome" disabled />
                            <Ark.TextInput id="placeholder-secondo-nome" label="Secondo nome" placeholder="Secondo nome" disabled />
                            <Ark.TextInput id="placeholder-cognome" label="Cognome" placeholder="Cognome" disabled />
                            <Ark.RadioGroup id="placeholder-sesso" label="Sesso" options={SESSO_OPTIONS} disabled />
                        </Ark.SimpleGrid>
                    </Ark.Card>
                    {/* Card 2: Dati di nascita */}
                    <Ark.Card variant="outline" padding="lg">
                        <Ark.Box className="nuova-anagrafica-stepper-card-header">
                            <Ark.PageTitle icon="FileText" title="Dati di nascita" size="md" />
                        </Ark.Box>
                        <Ark.SimpleGrid columns={2} gap="5">
                            <Ark.TextInput id="placeholder-cf" label="Codice Fiscale" placeholder="Codice Fiscale" disabled />
                            <Ark.TextInput id="placeholder-data" label="Data di nascita" placeholder="gg/mm/aaaa" disabled />
                        </Ark.SimpleGrid>
                    </Ark.Card>
                    {/* Card 3: Dati fiscali */}
                    <Ark.Card variant="outline" padding="lg">
                        <Ark.Box className="nuova-anagrafica-stepper-card-header">
                            <Ark.PageTitle icon="ReceiptEuro" title="Dati fiscali" size="md" />
                        </Ark.Box>
                        <Ark.SimpleGrid columns={2} gap="5">
                            <Ark.TextInput id="placeholder-piva" label="Partita IVA" placeholder="Partita IVA" disabled />
                            <Ark.TextInput id="placeholder-ipa" label="Codice IPA" placeholder="Codice IPA" disabled />
                        </Ark.SimpleGrid>
                    </Ark.Card>
                </Ark.VStack>
            </Ark.Box>
        );
    }

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <Ark.Box className={definition.props?.className}>
            <Ark.VStack spacing="var(--spacing-5)">
                {/* ── Card 1: Dati anagrafici ─────────────────────────────────── */}
                <Ark.Card variant="outline" padding="lg">
                    <Ark.Box className="nuova-anagrafica-stepper-card-header">
                        <Ark.PageTitle icon="User" title="Dati anagrafici" size="md" />
                    </Ark.Box>

                    <Ark.SimpleGrid columns={2} gap="5">
                        <Ark.TextInput
                            id={`${droplet.id}-nome`}
                            label="Nome"
                            value={value.nome}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('nome', e.target.value)}
                            required
                            placeholder="Inserisci il nome"
                            disabled={definition.enabled === false}
                            readOnly={definition.readonly}
                        />
                        <Ark.TextInput
                            id={`${droplet.id}-secondo-nome`}
                            label="Secondo nome"
                            value={value.secondoNome ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('secondoNome', e.target.value || undefined)}
                            placeholder="Inserisci il secondo nome"
                            disabled={definition.enabled === false}
                            readOnly={definition.readonly}
                        />
                        <Ark.TextInput
                            id={`${droplet.id}-cognome`}
                            label="Cognome"
                            value={value.cognome}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('cognome', e.target.value)}
                            required
                            placeholder="Inserisci il cognome"
                            disabled={definition.enabled === false}
                            readOnly={definition.readonly}
                        />
                        <Ark.Box>
                            <Ark.RadioGroup
                                id={`${droplet.id}-sesso`}
                                label="Sesso"
                                options={SESSO_OPTIONS}
                                value={value.sesso?.codice || undefined}
                                onValueChange={(d) =>
                                    set('sesso', d.value === 'M' ? SESSO.MASCHIO : d.value === 'F' ? SESSO.FEMMINA : null)
                                }
                                orientation="horizontal"
                                required
                                disabled={definition.enabled === false}
                            />
                        </Ark.Box>
                        {statoCivileOptions.length > 0 && (
                            <Ark.Select
                                id={`${droplet.id}-stato-civile`}
                                label="Stato civile"
                                options={statoCivileOptions}
                                value={value.statoCivile ? [value.statoCivile] : []}
                                onValueChange={(d) => set('statoCivile', d.value[0] ?? undefined)}
                                placeholder="Seleziona stato civile"
                                disabled={definition.enabled === false}
                            />
                        )}
                        <Ark.Autocomplete
                            id={`${droplet.id}-nazionalita`}
                            label="Nazionalità"
                            value={value.nazionalita ?? null}
                            options={config?.nazionalitaOptions || []}
                            onInputValueChange={(d) => handleSearch('nazionalita', d.inputValue)}
                            onValueChange={(items) => set('nazionalita', items[0] ?? null)}
                            minChars={3}
                            debounceTime={750}
                            required
                            placeholder="Cerca nazionalità"
                            disabled={definition.enabled === false}
                        />
                    </Ark.SimpleGrid>
                </Ark.Card>

                {/* ── Card 2: Dati di nascita ─────────────────────────────────── */}
                <Ark.Card variant="outline" padding="lg">
                    <Ark.Box className="nuova-anagrafica-stepper-card-header">
                        <Ark.PageTitle icon="FileText" title="Dati di nascita" size="md" />
                    </Ark.Box>

                    <Ark.SimpleGrid columns={2} gap="5">
                        <Ark.TextInput
                            id={`${droplet.id}-codice-fiscale`}
                            label="Codice Fiscale"
                            value={value.codiceFiscale}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('codiceFiscale', e.target.value.toUpperCase())}
                            required
                            placeholder="Inserisci codice fiscale"
                            maxLength={16}
                            disabled={definition.enabled === false}
                            readOnly={definition.readonly}
                        />
                        <Ark.DateInput
                            id={`${droplet.id}-data-nascita`}
                            label="Data di nascita"
                            value={value.dataNascita}
                            onValueChange={(d) => set('dataNascita', d.value)}
                            required
                            placeholder="gg/mm/aaaa"
                            disabled={definition.enabled === false}
                        />
                        <Ark.Autocomplete
                            id={`${droplet.id}-stato-nascita`}
                            label="Stato di nascita"
                            value={value.statoNascita ?? null}
                            options={config?.statoNascitaOptions || []}
                            onInputValueChange={(d) => handleSearch('statoNascita', d.inputValue)}
                            onValueChange={handleStatoNascitaChange}
                            minChars={3}
                            debounceTime={750}
                            placeholder="Cerca stato"
                            disabled={definition.enabled === false}
                        />
                        <Ark.Autocomplete
                            id={`${droplet.id}-regione-nascita`}
                            label="Regione di nascita"
                            value={value.regioneNascita ?? null}
                            options={config?.regioneNascitaOptions || []}
                            onInputValueChange={(d) => handleSearch('regioneNascita', d.inputValue)}
                            onValueChange={handleRegioneNascitaChange}
                            minChars={3}
                            debounceTime={750}
                            placeholder={value.statoNascita ? 'Cerca regione' : 'Seleziona prima lo stato'}
                            disabled={definition.enabled === false || !value.statoNascita}
                        />
                        <Ark.Autocomplete
                            id={`${droplet.id}-provincia-nascita`}
                            label="Provincia di nascita"
                            value={value.provinciaNascita ?? null}
                            options={config?.provinciaNascitaOptions || []}
                            onInputValueChange={(d) => handleSearch('provinciaNascita', d.inputValue)}
                            onValueChange={handleProvinciaNascitaChange}
                            minChars={3}
                            debounceTime={750}
                            placeholder={value.regioneNascita ? 'Cerca provincia' : 'Seleziona prima la regione'}
                            disabled={definition.enabled === false || !value.regioneNascita}
                        />
                        <Ark.Autocomplete
                            id={`${droplet.id}-comune-nascita`}
                            label="Comune di nascita"
                            value={value.comuneNascita ?? null}
                            options={config?.comuneNascitaOptions || []}
                            onInputValueChange={(d) => handleSearch('comuneNascita', d.inputValue)}
                            onValueChange={(items) => set('comuneNascita', items[0] ?? null)}
                            minChars={3}
                            debounceTime={750}
                            placeholder={value.provinciaNascita ? 'Cerca comune' : 'Seleziona prima la provincia'}
                            disabled={definition.enabled === false || !value.provinciaNascita}
                        />
                    </Ark.SimpleGrid>
                </Ark.Card>

                {/* ── Card 3: Dati fiscali ───────────────────────────────────── */}
                <Ark.Card variant="outline" padding="lg">
                    <Ark.Box className="nuova-anagrafica-stepper-card-header">
                        <Ark.PageTitle icon="ReceiptEuro" title="Dati fiscali" size="md" />
                    </Ark.Box>

                    <Ark.SimpleGrid columns={2} gap="5">
                        <Ark.TextInput
                            id={`${droplet.id}-partita-iva`}
                            label="Partita IVA"
                            value={value.partitaIva ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('partitaIva', e.target.value || undefined)}
                            placeholder="Inserisci partita IVA"
                            maxLength={11}
                            helperText="Opzionale per persone fisiche"
                            disabled={definition.enabled === false}
                            readOnly={definition.readonly}
                        />
                        <Ark.TextInput
                            id={`${droplet.id}-codice-ipa`}
                            label="Codice IPA"
                            value={value.codiceIpa ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('codiceIpa', e.target.value.toUpperCase() || undefined)}
                            placeholder="Inserisci codice IPA"
                            maxLength={7}
                            helperText="Per fatturazione elettronica PA"
                            disabled={definition.enabled === false}
                            readOnly={definition.readonly}
                        />
                    </Ark.SimpleGrid>
                </Ark.Card>
            </Ark.VStack>
        </Ark.Box>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════════

dropletRegistry.register('tecnosys-dati-generali-pf-form', DatiGeneraliPFFormDroplet);

export default DatiGeneraliPFFormDroplet;
