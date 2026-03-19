import { useMemo, useRef } from 'react';
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

// ══════════════════════════════════════════════════════════════════════════
// Type Definitions
// ══════════════════════════════════════════════════════════════════════════

/**
 * ID fissi dei 4 filtri hardcoded nel componente
 */
export type AdvancedFilterId = 'inactiveUsers' | 'tenantUsers' | 'anomalousUsers' | 'systemUsers';

/**
 * Singola opzione per il dropdown Ruolo
 */
export interface RuoloOption {
    id: string;
    label: string;
    disabled?: boolean;
}

/**
 * Singola opzione per il dropdown Gruppi
 */
export interface GroupOption {
    id: string;
    label: string;
    disabled?: boolean;
}

/**
 * Data structure for AdvancedFilters
 * Oggetto di valore che rappresenta lo stato completo dei filtri
 * 
 * Nota: ruoloId e groupId usano string[] per compatibilità con Ark.Select
 * ma in pratica contengono sempre un singolo elemento o sono vuoti
 */
export type AdvancedFiltersData = {
    /** Filtro "Utenti inattivi" attivo */
    inactiveUsersSelected: boolean;
    /** Filtro "Inquilini" attivo */
    tenantUsersSelected: boolean;
    /** Filtro "Anomalie" attivo */
    anomalousUsersSelected: boolean;
    /** Filtro "Utenti di sistema" attivo */
    systemUsersSelected: boolean;
    /** ID del ruolo selezionato - visibile solo quando "systemUsers" è selezionato */
    ruoloId?: string[] | null;
    /** Data inizio decorrenza */
    dateFrom?: Date | null;
    /** Data fine decorrenza */
    dateTo?: Date | null;
    /** ID del gruppo selezionato */
    groupId?: string[] | null;
};

/**
 * Component-specific props that extend base droplet definition
 * NON include name, label, enabled, visible, readonly che sono in DropletDefinition
 */
export type AdvancedFiltersProps = {
    /** Conteggio badge utenti inattivi */
    inactiveUsersCount?: number;
    /** Conteggio badge inquilini */
    tenantUsersCount?: number;
    /** Conteggio badge anomalie */
    anomalousUsersCount?: number;
    /** Conteggio badge utenti di sistema */
    systemUsersCount?: number;

    /**
     * Opzioni per il dropdown RUOLO.
     * La sezione appare automaticamente quando il filtro "sistema" è selezionato.
     */
    ruoloOptions?: RuoloOption[];

    /** Opzioni per il dropdown GRUPPI */
    gruppiOptions?: GroupOption[];

    /** Mostra il pulsante Reset */
    showReset?: boolean;
};

/**
 * Complete droplet definition combining data type and props
 */
export type AdvancedFiltersDropletDefinition = DropletDefinition<AdvancedFiltersData> & {
    props?: AdvancedFiltersProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

export const AdvancedFiltersDroplet: DropletBuilderComponent<AdvancedFiltersDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);

    // ── Triggers Configuration ──────────────────────────────────────────────
    
    const changedTriggerDefinition = useMemo(() => ({
        type: 'system',
        name: `${definition.name}Changed`,
        enabled: true
    }), [definition.name]);
    const changedTrigger = useTriggerState(form, changedTriggerDefinition);
    const { handleTrigger: triggerChanged } = useTriggerActions(form, changedTriggerDefinition);
    const changedTriggerRef = useRef(changedTrigger);
    changedTriggerRef.current = changedTrigger;

    const resetTriggerDefinition = useMemo(() => ({
        type: 'system',
        name: `${definition.name}Reset`,
        enabled: true
    }), [definition.name]);
    const resetTrigger = useTriggerState(form, resetTriggerDefinition);
    const { handleTrigger: triggerReset } = useTriggerActions(form, resetTriggerDefinition);
    const resetTriggerRef = useRef(resetTrigger);
    resetTriggerRef.current = resetTrigger;

    const manageGroupsTriggerDefinition = useMemo(() => ({
        type: 'system',
        name: `${definition.name}ManageGroupsClick`,
        enabled: true
    }), [definition.name]);
    const manageGroupsTrigger = useTriggerState(form, manageGroupsTriggerDefinition);
    const { handleTrigger: triggerManageGroups } = useTriggerActions(form, manageGroupsTriggerDefinition);
    const manageGroupsTriggerRef = useRef(manageGroupsTrigger);
    manageGroupsTriggerRef.current = manageGroupsTrigger;

    // Early return check (MUST be after all hooks)
    if (!droplet || droplet.visible === false) return null;

    // ── Data Extraction ─────────────────────────────────────────────────────
    
    const currentData = (droplet.value && typeof droplet.value === 'object')
        ? droplet.value as AdvancedFiltersData
        : {
            inactiveUsersSelected: false,
            tenantUsersSelected: false,
            anomalousUsersSelected: false,
            systemUsersSelected: false,
            ruoloId: null,
            dateFrom: null,
            dateTo: null,
            groupId: null,
        };

    // ── Event Handlers ──────────────────────────────────────────────────────
    
    const handleChange = (value: AdvancedFiltersData) => {
        updateValue(value);
        
        if (changedTriggerRef.current) {
            changedTriggerRef.current.signalData = value;
        }
        triggerChanged();
    };

    const handleReset = () => {
        if (resetTriggerRef.current) {
            resetTriggerRef.current.signalData = null;
        }
        triggerReset();
    };

    const handleManageGroupsClick = () => {
        if (manageGroupsTriggerRef.current) {
            manageGroupsTriggerRef.current.signalData = null;
        }
        triggerManageGroups();
    };

    // ── Render ──────────────────────────────────────────────────────────────
    
    return (
        <Ark.AdvancedFilters
            inactiveUsersCount={definition.props?.inactiveUsersCount}
            tenantUsersCount={definition.props?.tenantUsersCount}
            anomalousUsersCount={definition.props?.anomalousUsersCount}
            systemUsersCount={definition.props?.systemUsersCount}
            ruoloOptions={definition.props?.ruoloOptions}
            gruppiOptions={definition.props?.gruppiOptions}
            filters={currentData}
            showReset={definition.props?.showReset}
            onChange={handleChange}
            onReset={handleReset}
            onManageGroupsClick={handleManageGroupsClick}
        />
    );
};

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register("tecnosys-advanced-filters", AdvancedFiltersDroplet);

export default AdvancedFiltersDroplet;
