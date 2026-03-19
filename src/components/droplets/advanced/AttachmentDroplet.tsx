import { useCallback, useMemo } from 'react';
import {
    dropletRegistry,
    DropletDefinition,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
    useDropletActions,
    useTriggerActions,
} from '@tecnosys/stillum-forms-react';
import { Ark, GlobalContextProvider } from '@tecnosys/components';

// Re-export specific types if needed, or import from Ark
// Assuming Ark exports AttachmentType, etc.
// If NOT exported from main index, we might need local definitions as we did for FullTextSearch.
// Checking imports... Ark.AttachmentManager is expected. 
// We might need to define props locally if Ark doesn't export them conveniently.

export type AttachmentType = {
    id: string;
    name: string;
    size: number;
    type?: string;
    url?: string;
    status?: 'queued' | 'uploading' | 'done' | 'error';
    errorMessage?: string;
    file?: File;
};

export type AttachmentData = AttachmentType[];

export type AttachmentProps = {
    maxSizeMB?: number;
    multiple?: boolean;
    readOnly?: boolean;
    layout?: 'grid' | 'list';
    required?: boolean;
    label?: string;
    title?: string;
    icon?: string;
};

export type AttachmentDropletDefinition = DropletDefinition<AttachmentData> & {
    props?: AttachmentProps;
};

export const AttachmentDroplet: DropletBuilderComponent<AttachmentDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);

    // -- Triggers --
    // Triggers for Upload, Delete, Download might be needed if they are handled by "system" (e.g. backend calls)
    // For now, we assume simple event notification pattern or prop-based handlers.
    // If onUpload needs to return a Promise<{id}>, standard triggers don't support return values easily.
    // It is expected that the FORM engine or a passed prop handles the logic. 
    // BUT valid droplets usually just emit events.
    // We will simulate "change" as primary data update.

    const changeTriggerDefinition = useMemo(() => ({
        type: 'system',
        name: `${definition.name}Changed`,
        enabled: true
    }), [definition.name]);
    const { handleTrigger: triggerChange } = useTriggerActions(form, changeTriggerDefinition);

    const dataSource = useMemo(() => (droplet?.value as AttachmentData) || [], [droplet?.value]);

    const handleChange = useCallback((attachments: AttachmentType[]) => {
        updateValue(attachments);
        triggerChange();
    }, [updateValue, triggerChange]);

    // Early return AFTER all hooks have been called
    if (!droplet || droplet.visible === false) return null;

    return (
        <GlobalContextProvider>
            <Ark.AttachmentManager
                dataSource={dataSource}
                onChange={handleChange}
                maxSizeMB={definition.props?.maxSizeMB}
                multiple={definition.props?.multiple}
                readOnly={definition.readonly || definition.props?.readOnly}
                layout={definition.props?.layout}
                required={definition.required ?? definition.props?.required}
                label={definition.label || definition.props?.label}
                title={definition.props?.title}
                icon={definition.props?.icon}
            />
        </GlobalContextProvider>
    );
};

dropletRegistry.register("tecnosys-attachment", AttachmentDroplet);

export default AttachmentDroplet;
