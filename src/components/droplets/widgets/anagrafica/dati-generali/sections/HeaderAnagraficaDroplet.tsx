import {
    DropletDefinition,
    dropletRegistry,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';
import type { TipoPersona } from './DatiIdentificativiCardDroplet';

// ══════════════════════════════════════════════════════════════════════════
// Type Definitions
// ══════════════════════════════════════════════════════════════════════════

/**
 * Data structure for HeaderAnagrafica
 * Contiene i dati essenziali per visualizzare l'header dell'anagrafica
 */
export type HeaderAnagraficaData = {
    /** Denominazione completa (nome cognome per PF, ragione sociale per PG) */
    denominazione: string;
    /** Codice identificativo anagrafica */
    codice: string;
    /** Tipo persona (Fisica/Giuridica) */
    tipoPersona: TipoPersona;
};

/**
 * Component-specific props
 */
export type HeaderAnagraficaProps = {
    /** CSS class aggiuntiva */
    className?: string;
};

/**
 * Complete droplet definition
 */
export type HeaderAnagraficaDropletDefinition = DropletDefinition<HeaderAnagraficaData> & {
    props?: HeaderAnagraficaProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

/**
 * HeaderAnagraficaDroplet — blocco visivo con avatar, denominazione, codice e tipo soggetto.
 * Display-only component senza trigger.
 */
export const HeaderAnagraficaDroplet: DropletBuilderComponent<HeaderAnagraficaDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    // Early return check (MUST be after all hooks)
    if (!droplet || droplet.visible === false) return null;

    // ── Data Extraction ─────────────────────────────────────────────────────
    const data = droplet.value as HeaderAnagraficaData | undefined;

    // Placeholder per editor quando non ci sono dati
    if (!data) {
        return (
            <Ark.Box className={`dati-generali-header ${definition.props?.className || ''}`}>
                <Ark.HStack align="center" spacing="var(--spacing-4)">
                    <Ark.Avatar
                        alt="Placeholder"
                        size="lg"
                        className="dati-generali-avatar"
                    />
                    <Ark.VStack align="flex-start" spacing="var(--spacing-1)">
                        <Ark.Text as="span" className="dati-generali-header-nome text-fg-muted">
                            Header Anagrafica
                        </Ark.Text>
                        <Ark.HStack align="center" spacing="var(--spacing-2)">
                            <Ark.Badge color="muted" variant="outline" size="sm">
                                CODICE
                            </Ark.Badge>
                            <Ark.Badge color="info" variant="light" size="sm">
                                Tipo
                            </Ark.Badge>
                        </Ark.HStack>
                    </Ark.VStack>
                </Ark.HStack>
            </Ark.Box>
        );
    }

    // ── Render ──────────────────────────────────────────────────────────────
    const isPF = data.tipoPersona.id === 0;
    const tipoLabel = data.tipoPersona.tipo;
    const tipoSlug = isPF ? 'fisica' : 'giuridica';

    return (
        <Ark.Box className={`dati-generali-header ${definition.props?.className || ''}`}>
            <Ark.HStack align="center" spacing="var(--spacing-4)">
                {/* Avatar */}
                <Ark.Avatar
                    alt={data.denominazione}
                    size="lg"
                    className={`dati-generali-avatar dati-generali-avatar--${tipoSlug}`}
                />

                {/* Info principali */}
                <Ark.VStack align="flex-start" spacing="var(--spacing-1)">
                    <Ark.Text as="span" className="dati-generali-header-nome">
                        {data.denominazione}
                    </Ark.Text>
                    <Ark.HStack align="center" spacing="var(--spacing-2)">
                        <Ark.Badge color="muted" variant="outline" size="sm">
                            {data.codice}
                        </Ark.Badge>
                        <Ark.Badge 
                            color={isPF ? 'primary' : 'info'} 
                            variant="light" 
                            size="sm"
                        >
                            {tipoLabel}
                        </Ark.Badge>
                    </Ark.HStack>
                </Ark.VStack>
            </Ark.HStack>
        </Ark.Box>
    );
};

HeaderAnagraficaDroplet.displayName = 'HeaderAnagraficaDroplet';

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register('tecnosys-header-anagrafica', HeaderAnagraficaDroplet);

export default HeaderAnagraficaDroplet;
