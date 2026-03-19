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
import { Ark } from '@tecnosys/components';

// ══════════════════════════════════════════════════════════════════════════════
// Type Definitions (local)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * OptionItem per autocomplete/select
 */
interface OptionItem {
    label: string;
    value: string;
}

/**
 * Dati contatti
 */
interface ContattiData {
    telefono?: string;
    cellulare?: string;
    email?: string;
    pec?: string;
}

/**
 * Dati indirizzo
 */
interface IndirizzoData {
    dug?: OptionItem | null;
    indirizzo?: string;
    civico?: string;
    esponente?: string;
    citta?: OptionItem | null;
    cap?: string;
}

/**
 * Data type for RecapitiStep droplet
 */
export interface RecapitiStepData {
    contatti?: ContattiData;
    indirizzo?: IndirizzoData;
}

/**
 * Configuration options for the step
 */
export interface RecapitiStepConfig {
    /** Lista statica DUG (Via, Piazza, Viale, ecc.) */
    dugOptions?: OptionItem[];
    /** Lista statica CAP disponibili */
    capOptions?: string[];
    /** Risultati ricerca città */
    cittaOptions?: OptionItem[];
}

/**
 * Component-specific props
 */
export type RecapitiStepProps = {
    /** CSS class name */
    className?: string;
    /** Configuration for options */
    config?: RecapitiStepConfig;
};

/**
 * Complete droplet definition
 */
export type RecapitiStepDropletDefinition = DropletDefinition<RecapitiStepData> & {
    props?: RecapitiStepProps;
};

// ══════════════════════════════════════════════════════════════════════════════
// Constants
// ══════════════════════════════════════════════════════════════════════════════

const GRID_SPACING = 'var(--spacing-5, 1.25rem)';

/** Convert OptionItem[] → SelectOption[] */
const toSelectOptions = (opts: OptionItem[]): Ark.SelectOption[] =>
    opts.map(({ label, value }) => ({ label, value }));

/** Empty form state */
const EMPTY_RECAPITI: RecapitiStepData = {
    contatti: undefined,
    indirizzo: undefined,
};

// ══════════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════════

export const RecapitiStepDroplet: DropletBuilderComponent<RecapitiStepDropletDefinition> = ({
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
    const validityTrigger = useTriggerState(form, validityTriggerDef);
    const searchTrigger = useTriggerState(form, searchTriggerDef);
    const { handleTrigger: triggerChange } = useTriggerActions(form, changeTriggerDef);
    const { handleTrigger: triggerValidity } = useTriggerActions(form, validityTriggerDef);
    const { handleTrigger: triggerSearch } = useTriggerActions(form, searchTriggerDef);

    // ── Data Extraction ─────────────────────────────────────────────────────
    const data: RecapitiStepData = useMemo(() => {
        if (droplet?.value && typeof droplet.value === 'object') {
            return droplet.value as RecapitiStepData;
        }
        return EMPTY_RECAPITI;
    }, [droplet?.value]);

    const config = definition.props?.config;
    const dugOptions = useMemo(
        () => toSelectOptions(config?.dugOptions || []),
        [config?.dugOptions]
    );

    // ── Validity Check (sempre valido, nessun campo obbligatorio) ───────────
    useEffect(() => {
        const isValid = true; // RecapitiStep non ha campi obbligatori
        if (lastValidityRef.current !== isValid) {
            lastValidityRef.current = isValid;
            if (validityTrigger) {
                validityTrigger.signalData = { isValid };
                triggerValidity();
            }
        }
    }, [validityTrigger, triggerValidity]);

    // ── Update Helpers ──────────────────────────────────────────────────────
    const updateData = useCallback((newData: RecapitiStepData) => {
        updateValue(newData);
        if (changeTrigger) {
            changeTrigger.signalData = newData;
            triggerChange();
        }
    }, [updateValue, changeTrigger, triggerChange]);

    const setContatti = useCallback(<K extends keyof ContattiData>(key: K, val: ContattiData[K]) => {
        const newContatti = { ...data.contatti, [key]: val };
        updateData({ ...data, contatti: newContatti });
    }, [data, updateData]);

    const setIndirizzo = useCallback(<K extends keyof IndirizzoData>(key: K, val: IndirizzoData[K]) => {
        const newIndirizzo = { ...data.indirizzo, [key]: val };
        updateData({ ...data, indirizzo: newIndirizzo });
    }, [data, updateData]);

    // ── Search Handler ──────────────────────────────────────────────────────
    const handleSearch = useCallback((field: string, query: string) => {
        if (searchTrigger) {
            searchTrigger.signalData = { field, query };
            triggerSearch();
        }
    }, [searchTrigger, triggerSearch]);

    // ── Città Change Handler (reset CAP) ────────────────────────────────────
    const handleCittaChange = useCallback((items: OptionItem[]) => {
        const selected = items[0] ?? null;
        const newIndirizzo = { ...data.indirizzo, citta: selected, cap: undefined };
        updateData({ ...data, indirizzo: newIndirizzo });
    }, [data, updateData]);

    // ── CAP Options (filtrate dalla lista) ──────────────────────────────────
    const capSearchOptions = useMemo(() => {
        // Il filtraggio CAP è gestito lato consumer tramite trigger Search
        // Qui mostriamo le opzioni fornite come config
        return (config?.capOptions || []).map(cap => ({ label: cap, value: cap }));
    }, [config?.capOptions]);

    // Early return check
    if (!droplet || droplet.visible === false) return null;

    const isDisabled = definition.enabled === false;
    const isReadonly = definition.readonly === true;

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <Ark.Box className={`nuova-anagrafica-stepper-step ${definition.props?.className || ''}`}>
            <Ark.VStack spacing="var(--spacing-5)">
                {/* ════════════════════════════════════════════════════════════
                    Card 1 — Contatti
                ════════════════════════════════════════════════════════════ */}
                <Ark.Card variant="outline" padding="lg">
                    <Ark.Box className="nuova-anagrafica-stepper-card-header">
                        <Ark.PageTitle icon="Phone" title="Contatti" subtitle="Recapiti telefonici ed email" size="md" />
                    </Ark.Box>

                    <Ark.SimpleGrid columns={2} gap="5">
                        <Ark.TextInput
                            id={`${droplet.id}-telefono`}
                            label="Telefono"
                            value={data.contatti?.telefono ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContatti('telefono', e.target.value || undefined)}
                            leftIcon="Phone"
                            placeholder="Inserisci numero telefono"
                            disabled={isDisabled}
                            readOnly={isReadonly}
                        />
                        <Ark.TextInput
                            id={`${droplet.id}-cellulare`}
                            label="Cellulare"
                            value={data.contatti?.cellulare ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContatti('cellulare', e.target.value || undefined)}
                            leftIcon="Smartphone"
                            placeholder="Inserisci numero cellulare"
                            disabled={isDisabled}
                            readOnly={isReadonly}
                        />
                        <Ark.TextInput
                            id={`${droplet.id}-email`}
                            label="Email"
                            value={data.contatti?.email ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContatti('email', e.target.value || undefined)}
                            leftIcon="Mail"
                            placeholder="Inserisci email"
                            type="email"
                            disabled={isDisabled}
                            readOnly={isReadonly}
                        />
                        <Ark.TextInput
                            id={`${droplet.id}-pec`}
                            label="PEC"
                            value={data.contatti?.pec ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContatti('pec', e.target.value || undefined)}
                            leftIcon="MailCheck"
                            placeholder="Inserisci PEC"
                            type="email"
                            disabled={isDisabled}
                            readOnly={isReadonly}
                        />
                    </Ark.SimpleGrid>
                </Ark.Card>

                {/* ════════════════════════════════════════════════════════════
                    Card 2 — Indirizzo
                ════════════════════════════════════════════════════════════ */}
                <Ark.Card variant="outline" padding="lg">
                    <Ark.Box className="nuova-anagrafica-stepper-card-header">
                        <Ark.PageTitle icon="MapPin" title="Indirizzo" subtitle="Indirizzo di residenza" size="md" />
                    </Ark.Box>

                    <Ark.SimpleGrid columns={2} gap="5">
                        {/* Riga indirizzo: DUG + Via + Civico + Esponente */}
                        <Ark.Box
                            style={{
                                gridColumn: 'span 2',
                                display: 'grid',
                                gridTemplateColumns: '1fr 10fr 1fr 1fr',
                                gap: GRID_SPACING,
                            }}
                        >
                            <Ark.Select
                                id={`${droplet.id}-dug`}
                                label="Indirizzo"
                                options={dugOptions}
                                value={data.indirizzo?.dug ? [data.indirizzo.dug.value] : []}
                                onValueChange={(details) => {
                                    const v = details.value[0];
                                    const selected = v ? (config?.dugOptions?.find(o => o.value === v) ?? null) : null;
                                    setIndirizzo('dug', selected);
                                }}
                                placeholder="DUG"
                                disabled={isDisabled}
                            />
                            <Ark.TextInput
                                id={`${droplet.id}-indirizzo`}
                                value={data.indirizzo?.indirizzo ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIndirizzo('indirizzo', e.target.value || undefined)}
                                leftIcon="MapPin"
                                placeholder="Nome via/piazza"
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                            <Ark.TextInput
                                id={`${droplet.id}-civico`}
                                label="Civico"
                                value={data.indirizzo?.civico ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIndirizzo('civico', e.target.value || undefined)}
                                placeholder="N°"
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                            <Ark.TextInput
                                id={`${droplet.id}-esponente`}
                                label="Esponente"
                                value={data.indirizzo?.esponente ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIndirizzo('esponente', e.target.value || undefined)}
                                placeholder="Es. bis"
                                disabled={isDisabled}
                                readOnly={isReadonly}
                            />
                        </Ark.Box>

                        {/* Città */}
                        <Ark.Autocomplete
                            id={`${droplet.id}-citta`}
                            label="Città"
                            value={data.indirizzo?.citta ?? null}
                            options={config?.cittaOptions || []}
                            onInputValueChange={(d) => handleSearch('citta', d.inputValue)}
                            onValueChange={handleCittaChange}
                            minChars={3}
                            debounceTime={750}
                            placeholder="Cerca città"
                            disabled={isDisabled}
                        />

                        {/* CAP */}
                        <Ark.Autocomplete
                            id={`${droplet.id}-cap`}
                            label="CAP"
                            value={data.indirizzo?.cap ? { label: data.indirizzo.cap, value: data.indirizzo.cap } : null}
                            options={capSearchOptions}
                            onInputValueChange={(d) => handleSearch('cap', d.inputValue)}
                            onValueChange={(items) => setIndirizzo('cap', items[0]?.value ?? undefined)}
                            minChars={2}
                            debounceTime={300}
                            placeholder={data.indirizzo?.citta ? 'Inserisci CAP' : 'Seleziona prima la città'}
                            disabled={isDisabled || !data.indirizzo?.citta}
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

dropletRegistry.register('tecnosys-recapiti-step', RecapitiStepDroplet);

export default RecapitiStepDroplet;
