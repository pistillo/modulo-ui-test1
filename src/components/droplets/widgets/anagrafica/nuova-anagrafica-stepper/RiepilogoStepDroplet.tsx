import {
    DropletDefinition,
    dropletRegistry,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
} from '@tecnosys/stillum-forms-react';
import { Ark, Sesso } from '@tecnosys/components';

// ══════════════════════════════════════════════════════════════════════════
// Local Type Definitions (non exported to avoid barrel conflicts)
// ══════════════════════════════════════════════════════════════════════════

interface OptionItem {
    value: string;
    label: string;
}

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

type DatiGeneraliSnapshot =
    | { tipoPersona: { id: 0; tipo: 'Persona fisica' }; data: DatiGeneraliPF }
    | { tipoPersona: { id: 1; tipo: 'Persona giuridica' }; data: DatiGeneraliPG };

interface ContattiData {
    telefono?: string;
    cellulare?: string;
    email?: string;
    pec?: string;
}

interface IndirizzoData {
    dug?: OptionItem | null;
    indirizzo?: string;
    civico?: string;
    esponente?: string;
    citta?: OptionItem | null;
    cap?: string;
}

interface RecapitiData {
    contatti?: ContattiData;
    indirizzo?: IndirizzoData;
}

// ══════════════════════════════════════════════════════════════════════════
// Droplet Type Definitions
// ══════════════════════════════════════════════════════════════════════════

/**
 * Data structure for RiepilogoStep
 * Contains snapshot from DatiGenerali and Recapiti steps
 */
interface RiepilogoStepData {
    datiGenerali?: DatiGeneraliSnapshot;
    recapiti?: RecapitiData;
}

/**
 * Component-specific props
 */
interface RiepilogoStepProps {
    /** Custom CSS class name */
    className?: string;
}

/**
 * Complete droplet definition
 */
type RiepilogoStepDropletDefinition = DropletDefinition<RiepilogoStepData> & {
    props?: RiepilogoStepProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Helper Component: RiepilogoField
// ══════════════════════════════════════════════════════════════════════════

/**
 * Single field row in the summary view
 */
function RiepilogoField({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <Ark.Box className="nuova-anagrafica-stepper-riepilogo-field">
            <Ark.Text as="p" className="nuova-anagrafica-stepper-riepilogo-label">
                {label}
            </Ark.Text>
            <Ark.Text as="p" className="nuova-anagrafica-stepper-riepilogo-value">
                {value}
            </Ark.Text>
        </Ark.Box>
    );
}

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

/**
 * RiepilogoStepDroplet — Step 3 (summary) of the nuova anagrafica wizard.
 *
 * Displays read-only view of data collected in previous steps, organized
 * in cards for Dati generali and Recapiti. No interaction: purely a
 * confirmation panel before final save.
 */
export const RiepilogoStepDroplet: DropletBuilderComponent<RiepilogoStepDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    // ── Early return check ──────────────────────────────────────────────────
    if (!droplet || droplet.visible === false) return null;

    // ── Data extraction ─────────────────────────────────────────────────────
    const data = droplet.value as RiepilogoStepData | undefined;
    const datiGenerali = data?.datiGenerali;
    const recapiti = data?.recapiti;

    const isPF = datiGenerali?.tipoPersona.id === 0;
    const pf = isPF ? (datiGenerali?.data as DatiGeneraliPF) : undefined;
    const pg = !isPF ? (datiGenerali?.data as DatiGeneraliPG) : undefined;

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <Ark.Box className={`nuova-anagrafica-stepper-step ${definition.props?.className || ''}`}>
            {/* ── Header ──────────────────────────────────────────────────── */}
            <Ark.Box className="nuova-anagrafica-stepper-riepilogo-header">
                <Ark.HStack spacing="var(--spacing-2, 0.5rem)" align="center">
                    <Ark.Icon
                        icon="check-circle"
                        size="lg"
                        className="nuova-anagrafica-stepper-riepilogo-check"
                    />
                    <Ark.VStack spacing="0" align="flex-start">
                        <Ark.Text as="p" className="nuova-anagrafica-stepper-riepilogo-title">
                            Riepilogo dati inseriti
                        </Ark.Text>
                        <Ark.Text as="p" className="nuova-anagrafica-stepper-riepilogo-subtitle">
                            Verifica i dati prima di procedere al salvataggio
                        </Ark.Text>
                    </Ark.VStack>
                </Ark.HStack>
                {datiGenerali && (
                    <Ark.Badge color={isPF ? 'primary' : 'info'} variant="light" size="sm">
                        {isPF ? 'Persona fisica' : 'Persona giuridica'}
                    </Ark.Badge>
                )}
            </Ark.Box>

            <div className="nuova-anagrafica-stepper-riepilogo-grid">
                {/* ── Card Dati generali ─────────────────────────────────────── */}
                <Ark.Card variant="default" padding="lg">
                    <Ark.Box className="nuova-anagrafica-stepper-card-header">
                        <Ark.PageTitle
                            icon={isPF ? 'user' : 'building-2'}
                            title="Dati generali"
                            size="sm"
                        />
                    </Ark.Box>
                    <Ark.Box className="nuova-anagrafica-stepper-riepilogo-fields">
                        {isPF && pf && (
                            <>
                                <RiepilogoField label="Nome" value={pf.nome} />
                                <RiepilogoField label="Secondo nome" value={pf.secondoNome} />
                                <RiepilogoField label="Cognome" value={pf.cognome} />
                                <RiepilogoField label="Sesso" value={pf.sesso?.label} />
                                <RiepilogoField label="Stato civile" value={pf.statoCivile} />
                                <RiepilogoField label="Nazionalità" value={pf.nazionalita?.label} />
                                <RiepilogoField label="Codice fiscale" value={pf.codiceFiscale} />
                                <RiepilogoField label="Partita IVA" value={pf.partitaIva} />
                                <RiepilogoField label="Codice IPA" value={pf.codiceIpa} />
                                <RiepilogoField
                                    label="Data di nascita"
                                    value={pf.dataNascita?.toLocaleDateString('it-IT')}
                                />
                                <RiepilogoField label="Stato di nascita" value={pf.statoNascita?.label} />
                                <RiepilogoField label="Regione di nascita" value={pf.regioneNascita?.label} />
                                <RiepilogoField label="Provincia di nascita" value={pf.provinciaNascita?.label} />
                                <RiepilogoField label="Comune di nascita" value={pf.comuneNascita?.label} />
                            </>
                        )}
                        {!isPF && pg && (
                            <>
                                <RiepilogoField label="Ragione sociale" value={pg.ragioneSociale} />
                                <RiepilogoField label="Codice fiscale" value={pg.codiceFiscale} />
                                <RiepilogoField label="Partita IVA" value={pg.partitaIva} />
                                <RiepilogoField label="Natura giuridica" value={pg.naturaSociale?.label} />
                                <RiepilogoField label="Rappresentante legale" value={pg.rappresentanteLegale?.label} />
                                <RiepilogoField label="Codice IPA" value={pg.codiceIpa} />
                                <RiepilogoField
                                    label="Data di costituzione"
                                    value={pg.incorporationDate?.toLocaleDateString('it-IT')}
                                />
                                <RiepilogoField label="Camera di Commercio" value={pg.chamberOfCommerce} />
                                <RiepilogoField label="Numero REA" value={pg.reaNumber} />
                                <RiepilogoField label="Capitale sociale" value={pg.shareCapital} />
                                <RiepilogoField label="Oggetto sociale" value={pg.businessObject} />
                            </>
                        )}
                        {!datiGenerali && (
                            <Ark.Text as="p" className="nuova-anagrafica-stepper-riepilogo-empty">
                                Nessun dato generale inserito
                            </Ark.Text>
                        )}
                    </Ark.Box>
                </Ark.Card>

                {/* ── Card Recapiti ─────────────────────────────────────────────── */}
                <Ark.Card variant="default" padding="lg">
                    <Ark.Box className="nuova-anagrafica-stepper-card-header">
                        <Ark.PageTitle icon="phone" title="Recapiti" size="sm" />
                    </Ark.Box>
                    <Ark.Box className="nuova-anagrafica-stepper-riepilogo-fields">
                        {recapiti ? (
                            <>
                                <RiepilogoField label="Telefono" value={recapiti.contatti?.telefono} />
                                <RiepilogoField label="Cellulare" value={recapiti.contatti?.cellulare} />
                                <RiepilogoField label="Email" value={recapiti.contatti?.email} />
                                <RiepilogoField label="PEC" value={recapiti.contatti?.pec} />
                                <RiepilogoField label="DUG" value={recapiti.indirizzo?.dug?.label} />
                                <RiepilogoField label="Indirizzo" value={recapiti.indirizzo?.indirizzo} />
                                <RiepilogoField label="Civico" value={recapiti.indirizzo?.civico} />
                                <RiepilogoField label="Esponente" value={recapiti.indirizzo?.esponente} />
                                <RiepilogoField label="Città" value={recapiti.indirizzo?.citta?.label} />
                                <RiepilogoField label="CAP" value={recapiti.indirizzo?.cap} />
                            </>
                        ) : (
                            <Ark.Text as="p" className="nuova-anagrafica-stepper-riepilogo-empty">
                                Nessun recapito inserito
                            </Ark.Text>
                        )}
                    </Ark.Box>
                </Ark.Card>
            </div>
        </Ark.Box>
    );
};

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register('tecnosys-riepilogo-step', RiepilogoStepDroplet);

export default RiepilogoStepDroplet;
