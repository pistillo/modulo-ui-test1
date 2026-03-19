import { TriggerDefinition, triggerRegistry } from '@tecnosys/stillum-forms-core';
import { Ark } from '@tecnosys/components';
import { TriggerBuilderComponent, useTriggerActions, useTriggerState } from '@tecnosys/stillum-forms-react';

type ButtonTriggerDefinition = TriggerDefinition & {
    submitForm: boolean;
};

/**
 * Componente che implementa un trigger di tipo button usando @tecnosys/components
 */
const ButtonTrigger: TriggerBuilderComponent<ButtonTriggerDefinition> = ({ definition, form }) => {
    // Ottieni lo stato del trigger e le azioni associate
    const trigger = useTriggerState(form, definition);
    const { handleTrigger, isProcessing } = useTriggerActions(form, definition);

    const handleClick = () => {
        if (definition.submitForm) {
            trigger.signalData = form.getDataContext();
        }
        handleTrigger();
    };

    // Se il trigger non è disponibile o non è visibile, non renderizzare nulla
    if (!trigger || trigger.visible === false) return null;

    // Gestione icone
    const iconName = typeof trigger.icon === 'string' ? (trigger.icon as Ark.IconName) : undefined;

    const leftIcon = (!trigger.iconPosition || trigger.iconPosition === 'left') ? iconName : undefined;
    const rightIcon = (trigger.iconPosition === 'right') ? iconName : undefined;

    // Determina se mostrare solo l'icona o anche il testo
    const showOnlyIcon = trigger.displayMode === 'icon-only';
    const displayText = trigger.caption ? trigger.caption : trigger.name;

    return (
        <Ark.Button
            id={trigger.id}
            variant={trigger.variant as Ark.ButtonProps['variant']}
            size={trigger.buttonSize as Ark.ButtonProps['size']}
            onClick={handleClick}
            loading={isProcessing}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            aria-label={showOnlyIcon ? displayText : undefined}
            disabled={trigger.readonly || !trigger.enabled}
        >
            {!showOnlyIcon ? displayText : null}
        </Ark.Button>
    );
};

triggerRegistry.register("tecnosys-button", ButtonTrigger);

export default ButtonTrigger;
