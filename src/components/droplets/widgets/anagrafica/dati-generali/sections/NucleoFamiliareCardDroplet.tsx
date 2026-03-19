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
 * Membro del nucleo familiare
 */
export interface MembroNucleo {
    id: string;
    nome: string;
    relazione?: string;
    badges?: string[];
}

/**
 * Struttura dati per il droplet NucleoFamiliareCard
 */
export type NucleoFamiliareCardData = {
    componenti: number;
    minori: number;
    disabili: number;
    membri: MembroNucleo[];
};

/**
 * Component-specific props
 */
export type NucleoFamiliareCardProps = {
    /** CSS class aggiuntiva */
    className?: string;
};

/**
 * Complete droplet definition
 */
export type NucleoFamiliareCardDropletDefinition = DropletDefinition<NucleoFamiliareCardData> & {
    props?: NucleoFamiliareCardProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Sub-components
// ══════════════════════════════════════════════════════════════════════════

interface MembroRowProps {
    membro: MembroNucleo;
    onClick?: () => void;
}

const MembroRow = memo(({ membro, onClick }: MembroRowProps) => {
    return (
        <Ark.HStack 
            align="center" 
            spacing="var(--spacing-3)" 
            className="dati-generali-membro-row"
            onClick={onClick}
            style={onClick ? { cursor: 'pointer' } : undefined}
        >
            <Ark.Avatar
                alt={membro.nome}
                size="sm"
            />
            <Ark.VStack align="flex-start" spacing="var(--spacing-0-5)" style={{ flex: 1 }}>
                <Ark.Text as="span" className="dati-generali-membro-nome">
                    {membro.nome}
                </Ark.Text>
                {membro.relazione && (
                    <Ark.Text as="span" className="dati-generali-membro-relazione">
                        {membro.relazione}
                    </Ark.Text>
                )}
            </Ark.VStack>
            {membro.badges?.map((b) => (
                <Ark.Badge key={b} color="warning" variant="light" size="xs">
                    {b}
                </Ark.Badge>
            ))}
        </Ark.HStack>
    );
});
MembroRow.displayName = 'MembroRow';

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

/**
 * NucleoFamiliareCardDroplet — card con statistiche e lista componenti del nucleo familiare.
 */
export const NucleoFamiliareCardDroplet: DropletBuilderComponent<NucleoFamiliareCardDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    // ── Triggers ──────────────────────────────────────────────────────────
    const membroClickTriggerDef = useMemo(() => ({
        type: 'system' as const,
        name: `${definition.name}MembroClick`,
        enabled: true,
    }), [definition.name]);

    const membroClickTrigger = useTriggerState(form, membroClickTriggerDef);
    const { handleTrigger: handleMembroClick } = useTriggerActions(form, membroClickTriggerDef);

    // Early return check (MUST be after all hooks)
    if (!droplet || droplet.visible === false) return null;

    // ── Data Extraction ─────────────────────────────────────────────────────
    const data = droplet.value as NucleoFamiliareCardData | undefined;

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
                            <Ark.Icon icon="Users" size="sm" className="dati-generali-card-icon" />
                            <Ark.Text as="span" className="dati-generali-card-title text-fg-muted">
                                Nucleo Familiare
                            </Ark.Text>
                        </Ark.HStack>
                        <Ark.Badge color="info" variant="default" size="sm">
                            0
                        </Ark.Badge>
                    </Ark.HStack>
                </Ark.CardHeader>
                <Ark.CardBody>
                    <Ark.Box className="dati-generali-nucleo-stats">
                        <Ark.IconStat
                            icon="User"
                            value={0}
                            label="Componenti"
                            variant="primary"
                            className="dati-generali-nucleo-stat"
                        />
                        <Ark.IconStat
                            icon="Baby"
                            value={0}
                            label="Minori"
                            variant="muted"
                            className="dati-generali-nucleo-stat"
                        />
                        <Ark.IconStat
                            icon="Heart"
                            value={0}
                            label="Disabili"
                            variant="warning"
                            className="dati-generali-nucleo-stat"
                        />
                    </Ark.Box>
                </Ark.CardBody>
            </Ark.Card>
        );
    }

    // ── Event Handlers ──────────────────────────────────────────────────────
    const onMembroClick = (membro: MembroNucleo) => {
        membroClickTrigger.signalData = membro;
        handleMembroClick();
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <Ark.Card
            variant="default"
            className={['dati-generali-card', definition.props?.className].filter(Boolean).join(' ')}
        >
            <Ark.CardHeader>
                <Ark.HStack align="center" justify="space-between">
                    <Ark.HStack align="center" spacing="var(--spacing-2)">
                        <Ark.Icon icon="Users" size="sm" className="dati-generali-card-icon" />
                        <Ark.Text as="span" className="dati-generali-card-title">
                            Nucleo Familiare
                        </Ark.Text>
                    </Ark.HStack>
                    {data.componenti > 0 && (
                        <Ark.Badge color="info" variant="default" size="sm">
                            {data.componenti}
                        </Ark.Badge>
                    )}
                </Ark.HStack>
            </Ark.CardHeader>
            <Ark.CardBody>
                <Ark.VStack spacing="var(--spacing-4)">
                    {/* Statistiche */}
                    <Ark.Box className="dati-generali-nucleo-stats">
                        <Ark.IconStat
                            icon="User"
                            value={data.componenti}
                            label="Componenti"
                            variant="primary"
                            className="dati-generali-nucleo-stat"
                        />
                        <Ark.IconStat
                            icon="Baby"
                            value={data.minori}
                            label="Minori"
                            variant="muted"
                            className="dati-generali-nucleo-stat"
                        />
                        <Ark.IconStat
                            icon="Heart"
                            value={data.disabili}
                            label="Disabili"
                            variant="warning"
                            className="dati-generali-nucleo-stat"
                        />
                    </Ark.Box>

                    {/* Lista membri */}
                    {data.membri.map((m) => (
                        <MembroRow 
                            key={m.id} 
                            membro={m} 
                            onClick={() => onMembroClick(m)}
                        />
                    ))}
                </Ark.VStack>
            </Ark.CardBody>
        </Ark.Card>
    );
};

NucleoFamiliareCardDroplet.displayName = 'NucleoFamiliareCardDroplet';

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register('tecnosys-nucleo-familiare-card', NucleoFamiliareCardDroplet);

export default NucleoFamiliareCardDroplet;
