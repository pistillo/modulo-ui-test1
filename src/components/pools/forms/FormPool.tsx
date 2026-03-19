import { poolRegistry, PoolDefinition } from '@tecnosys/stillum-forms-core';
import { PoolBuilderComponent } from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type FormPoolDefinition = PoolDefinition & {
  content?: string;
  props?: Ark.FormProps;
};

const FormPool: PoolBuilderComponent<FormPoolDefinition> = ({
  definition,
  PoolsTag,
  DropletsTag,
  TriggersTag,
  WebSocketTag,
  style,
}) => {
  return (
    <Ark.Form {...definition.props} style={style}>
      {definition.content && definition.content}
      {DropletsTag && <DropletsTag />}
      {TriggersTag && <TriggersTag />}
      {PoolsTag && <PoolsTag />}
      {WebSocketTag && <WebSocketTag />}
    </Ark.Form>
  );
};

poolRegistry.register('tecnosys-form', FormPool);

export default FormPool;
