import React from 'react';
import {
    dropletRegistry,
    StringDropletDefinition,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
    useDropletActions,
    useTriggerState,
    useTriggerActions,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type SearchInputProps = {
    size?: 'sm' | 'md' | 'lg';
};

export type SearchInputDropletDefinition = StringDropletDefinition & {
    props?: SearchInputProps;
};

export const SearchInputDroplet: DropletBuilderComponent<SearchInputDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);

    const triggerDefinition = {
        type: "system",
        name: `${definition.name}Changed`,
        enabled: true,
    };
    const trigger = useTriggerState(form, triggerDefinition);
    const { handleTrigger } = useTriggerActions(form, triggerDefinition);

    if (!droplet || droplet.visible === false) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        updateValue(value);
        trigger.signalData = value;
        handleTrigger();
    };

    return (
        <Ark.SearchInput
            id={droplet.id}
            label={definition.label}
            helperText={definition.helperText}
            value={droplet.value || ''}
            onChange={handleChange}
            placeholder={definition.placeholder}
            size={definition.props?.size}
            required={definition.required ?? false}
            disabled={droplet.enabled === false}
        />
    );
};

dropletRegistry.register("tecnosys-search-input", SearchInputDroplet);

export default SearchInputDroplet;
