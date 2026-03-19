import {
    DropletDefinition,
    dropletRegistry,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type PageTitleProps = {
    subtitle?: string;
};

export type PageTitleDropletDefinition = DropletDefinition<string> & {
    props?: PageTitleProps;
};

export const PageTitleDroplet: DropletBuilderComponent<PageTitleDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    if (!droplet || droplet.visible === false) return null;

    return (
        <Ark.PageTitle
            title={droplet.label || droplet.value}
            subtitle={definition.props?.subtitle}
        />
    );
};

dropletRegistry.register("tecnosys-page-title", PageTitleDroplet);

export default PageTitleDroplet;
