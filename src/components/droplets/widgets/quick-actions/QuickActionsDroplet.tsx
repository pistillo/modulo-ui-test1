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

export type QuickActionsData = {
  /** Identificatore univoco dell'azione */
  id: string;
  /** Testo visualizzato nel pulsante */
  label: string;
  /** Icona Lucide mostrata a sinistra del testo */
  icon?: string;
  /**
   * Variante visiva del pulsante.
   * @default 'outline'
   */
  variant?: Ark.ButtonVariant;
  /**
   * Dimensione del pulsante.
   * @default 'sm'
   */
  size?: Ark.ButtonSize;
  /** Se `true` il pulsante è visibile ma non cliccabile */
  disabled?: boolean;
  /**
   * Quando `true`, la voce è separata dalle precedenti con un divisore.
   * Utile per raggruppare azioni primarie dalle secondarie.
   */
  separator?: boolean;
};

export type QuickActionsProps = {
  /**
   * Titolo testuale della sezione.
   * Mostrato in uppercase con stile "label di sezione".
   * @default 'Azioni rapide'
   */
  title?: string;

/**
   * Classe CSS aggiuntiva applicata al container esterno.
   */
  className?: string;

  // ── Output ───────────────────────────────────────────────────────────────

  /**
   * Emesso quando l'utente clicca un pulsante non disabilitato.
   * Riceve l'`id` dell'azione corrispondente.
   */
  onAction: (id: string) => void;
};

export type QuickActionsDropletDefinition = DropletDefinition<QuickActionsData[]> & {
    props?: QuickActionsProps;
};

export const QuickActionsDroplet: DropletBuilderComponent<QuickActionsDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    const { handleTrigger: onActionClick } = useTriggerActions(form, { 
        type: 'system', 
        name: `${definition.name}Click`, 
        enabled: true 
    });
    
    useTriggerState(form, { 
        type: 'system', 
        name: `${definition.name}Click`, 
        enabled: true 
    });
    
    if (!droplet || droplet.visible === false) return null;
    
    const handleActionClick = (_actionId: string) => {
        // Note: The actionId could be stored in the form's dataContext if needed
        // For now, we just trigger the action without passing the ID
        onActionClick();
    };
    
    return (
        <Ark.QuickActions
            title={definition.props?.title}
            className={definition.props?.className}
            actions={droplet.value || []}
            onAction={handleActionClick}
        />
    );
};

dropletRegistry.register('tecnosys-quick-actions', QuickActionsDroplet);

export default QuickActionsDroplet;
