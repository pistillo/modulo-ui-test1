import { poolRegistry, PoolDefinition } from '@tecnosys/stillum-forms-core';
import { PoolBuilderComponent } from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type StackPoolDefinition = PoolDefinition & {
  content?: string;
  props?: Ark.StackProps;
};

const StackPool: PoolBuilderComponent<StackPoolDefinition> = ({
  definition,
  DropletsTag,
  TriggersTag,
  PoolsTag,
  WebSocketTag,
}) => {
  return (
    <Ark.Stack {...definition.props}>
      {DropletsTag && <DropletsTag />}
      {TriggersTag && <TriggersTag />}
      {PoolsTag && <PoolsTag />}
      {WebSocketTag && <WebSocketTag />}
    </Ark.Stack>
  );
};

poolRegistry.register('tecnosys-stack', StackPool);

export default StackPool;
