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
// Type Definitions
// ══════════════════════════════════════════════════════════════════════════════

/**
 * OptionItem per autocomplete/select (local use only)
 */
interface OptionItem {
    label: string;
    value: string;
}

/**
 * Dati generali Persona Giuridica
 */
export interface DatiGeneraliPG {
    ragioneSociale: string;
    codiceFiscale: string;
    partitaIva: string;
    naturaSociale?: OptionItem | null;
    rappresentanteLegale?: OptionItem | null;
    /** Codice IPA per fatturazione elettronica (PA) */
    codiceIpa?: string;
    /** Data di costituzione della società */
    incorporationDate?: Date | null;
    /** Iscrizione Camera di Commercio */
    chamberOfCommerce?: string;
    /** Numero REA (Repertorio Economico Amministrativo) */
    reaNumber?: string;
    /** Capitale sociale dichiarato */
    shareCapital?: string;
    /** Oggetto sociale (attività principale) */
    businessObject?: string;
}

/**
 * Data type for DatiGeneraliPGForm droplet
 */
export type DatiGeneraliPGFormData = DatiGeneraliPG;

/**
 * Configuration options for the form selects
 */
export interface DatiGeneraliPGFormConfig {
    /** Opzioni per natura giuridica */
    naturaSocialeOptions?: OptionItem[];
    /** Opzioni per rappresentante legale */
    rappresentanteLegaleOptions?: OptionItem[];
}

/**
 * Component-specific props
 */
export type DatiGeneraliPGFormProps = {
    /** CSS class name */
    className?: string;
    /** Configuration for options */
    config?: DatiGeneraliPGFormConfig;
};

/**
 * Complete droplet definition
 */
export type DatiGeneraliPGFormDropletDefinition = DropletDefinition<DatiGeneraliPGFormData> & {
    props?: DatiGeneraliPGFormProps;
};

// ══════════════════════════════════════════════════════════════════════════════
// Constants
// ══════════════════════════════════════════════════════════════════════════════

/** Convert OptionItem[] → SelectOption[] */
const toSelectOptions = (opts: OptionItem[]): Ark.SelectOption[] =>
    opts.map(({ label, value }) => ({ label, value }));

/** Empty form state */
const EMPTY_FORM: DatiGeneraliPG = {
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

// ══════════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════════

export const DatiGeneraliPGFormDroplet: DropletBuilderComponent<DatiGeneraliPGFormDropletDefinition> = ({
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
    const value: DatiGeneraliPG = useMemo(() => {
        if (droplet?.value && typeof droplet.value === 'object') {
            return droplet.value as DatiGeneraliPG;
        }
        return EMPTY_FORM;
    }, [droplet?.value]);

    const config = definition.props?.config;
    const naturaSocialeOptions = useMemo(
        () => toSelectOptions(config?.naturaSocialeOptions || []),
        [config?.naturaSocialeOptions]
    );
    const rappresentanteLegaleOptions = useMemo(
        () => toSelectOptions(config?.rappresentanteLegaleOptions || []),
        [config?.rappresentanteLegaleOptions]
    );

    // ── Validity Check ──────────────────────────────────────────────────────
    useEffect(() => {
        const isValid =
            !!value.ragioneSociale.trim() &&
            !!value.codiceFiscale.trim() &&
            !!value.partitaIva.trim() &&
            !!value.naturaSociale &&
            !!value.rappresentanteLegale;

        if (lastValidityRef.current !== isValid) {
            lastValidityRef.current = isValid;
            (triggerValidity as (data?: unknown) => void)({ isValid, field: null });
        }
    }, [value, triggerValidity]);

    // ── Update Helpers ──────────────────────────────────────────────────────
    const set = useCallback(<K extends keyof DatiGeneraliPG>(key: K, val: DatiGeneraliPG[K]) => {
        const newValue = { ...value, [key]: val };
        updateValue(newValue);
        changeTrigger.signalData = { field: key, value: val };
        triggerChange();
    }, [value, updateValue, changeTrigger, triggerChange]);

    // ── Search Handler ──────────────────────────────────────────────────────
    const handleSearch = useCallback((field: string, query: string) => {
        searchTrigger.signalData = { field, query };
        triggerSearch();
    }, [searchTrigger, triggerSearch]);

    // Early return check
    if (!droplet || droplet.visible === false) return null;

    const isDisabled = definition.enabled === false;
    const isReadonly = definition.readonly === true;

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <Ark.Box className={definition.props?.className}>
            <Ark.VStack spacing="var(--spacing-5)">
                {/* ═══════════════════════════════════════════════════════════════
                    Card 1 — Dati Società
                ═══════════════════════════════════════════════════════════════ */}
                <Ark.Card variant="outline" padding="lg">
                    <Ark.Box className="nuova-anagrafica-stepper-card-header">
                        <Ark.PageTitle icon="Building" title="Dati società" size="md" />
                    </Ark.Box>

                    <Ark.SimpleGrid columns={2} gap="5">
                        {/* Ragione Sociale */}
                        <Ark.TextInput
                            id={`${droplet.id}-ragione-sociale`}
                            label="Ragione sociale"
                            placeholder="Inserisci la ragione sociale"
                            value={value.ragioneSociale}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('ragioneSociale', e.target.value)}
                            required
                            disabled={isDisabled}
                            readOnly={isReadonly}
                        />

                        {/* Codice Fiscale */}
                        <Ark.TextInput
                            id={`${droplet.id}-codice-fiscale`}
                            label="Codice fiscale"
                            placeholder="Inserisci il codice fiscale"
                            value={value.codiceFiscale}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('codiceFiscale', e.target.value.toUpperCase())}
                            required
                            maxLength={16}
                            disabled={isDisabled}
                            readOnly={isReadonly}
                        />

                        {/* Partita IVA */}
                        <Ark.TextInput
                            id={`${droplet.id}-partita-iva`}
                            label="Partita IVA"
                            placeholder="Inserisci la partita IVA"
                            value={value.partitaIva}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('partitaIva', e.target.value)}
                            required
                            maxLength={11}
                            disabled={isDisabled}
                            readOnly={isReadonly}
                        />

                        {/* Natura Giuridica */}
                        <Ark.Autocomplete
                            id={`${droplet.id}-natura-sociale`}
                            label="Natura giuridica"
                            value={value.naturaSociale ?? null}
                            options={config?.naturaSocialeOptions || []}
                            onInputValueChange={(d) => handleSearch('naturaSociale', d.inputValue)}
                            onValueChange={(items) => set('naturaSociale', items[0] ?? null)}
                            minChars={0}
                            required
                            placeholder="Seleziona la natura giuridica"
                            disabled={isDisabled}
                        />

                        {/* Rappresentante Legale */}
                        <Ark.Autocomplete
                            id={`${droplet.id}-rappresentante-legale`}
                            label="Rappresentante legale"
                            value={value.rappresentanteLegale ?? null}
                            options={config?.rappresentanteLegaleOptions || []}
                            onInputValueChange={(d) => handleSearch('rappresentanteLegale', d.inputValue)}
                            onValueChange={(items) => set('rappresentanteLegale', items[0] ?? null)}
                            minChars={0}
                            required
                            placeholder="Seleziona il rappresentante"
                            disabled={isDisabled}
                        />
                    </Ark.SimpleGrid>
                </Ark.Card>

                {/* ═══════════════════════════════════════════════════════════════
                    Card 2 — Ulteriori Informazioni
                ═══════════════════════════════════════════════════════════════ */}
                <Ark.Card variant="outline" padding="lg">
                    <Ark.Box className="nuova-anagrafica-stepper-card-header">
                        <Ark.PageTitle icon="FileText" title="Ulteriori informazioni" size="md" />
                    </Ark.Box>

                    <Ark.SimpleGrid columns={2} gap="5">
                        {/* Codice IPA */}
                        <Ark.TextInput
                            id={`${droplet.id}-codice-ipa`}
                            label="Codice IPA"
                            placeholder="Codice IPA (fatturazione PA)"
                            value={value.codiceIpa ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('codiceIpa', e.target.value || undefined)}
                            disabled={isDisabled}
                            readOnly={isReadonly}
                        />

                        {/* Data di Costituzione */}
                        <Ark.DateInput
                            id={`${droplet.id}-incorporation-date`}
                            label="Data di costituzione"
                            placeholder="gg/mm/aaaa"
                            value={value.incorporationDate ?? undefined}
                            onValueChange={(d) => set('incorporationDate', d.value ?? null)}
                            disabled={isDisabled}
                        />

                        {/* Camera di Commercio */}
                        <Ark.TextInput
                            id={`${droplet.id}-chamber-of-commerce`}
                            label="Camera di Commercio"
                            placeholder="Iscrizione Camera Commercio"
                            value={value.chamberOfCommerce ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('chamberOfCommerce', e.target.value || undefined)}
                            disabled={isDisabled}
                            readOnly={isReadonly}
                        />

                        {/* Numero REA */}
                        <Ark.TextInput
                            id={`${droplet.id}-rea-number`}
                            label="Numero REA"
                            placeholder="Numero REA"
                            value={value.reaNumber ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('reaNumber', e.target.value || undefined)}
                            disabled={isDisabled}
                            readOnly={isReadonly}
                        />

                        {/* Capitale Sociale */}
                        <Ark.TextInput
                            id={`${droplet.id}-share-capital`}
                            label="Capitale sociale"
                            placeholder="Capitale sociale dichiarato"
                            value={value.shareCapital ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('shareCapital', e.target.value || undefined)}
                            disabled={isDisabled}
                            readOnly={isReadonly}
                        />
                    </Ark.SimpleGrid>

                    {/* Oggetto Sociale (textarea full width) */}
                    <Ark.SimpleGrid columns={1} gap="5">
                        <Ark.TextareaInput
                            id={`${droplet.id}-business-object`}
                            label="Oggetto sociale"
                            placeholder="Descrivi l'oggetto sociale / attività principale"
                            value={value.businessObject ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('businessObject', e.target.value || undefined)}
                            rows={4}
                            disabled={isDisabled}
                            readOnly={isReadonly}
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

dropletRegistry.register('tecnosys-dati-generali-pg-form', DatiGeneraliPGFormDroplet);

export default DatiGeneraliPGFormDroplet;
