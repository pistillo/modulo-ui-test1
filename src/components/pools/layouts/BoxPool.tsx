import { poolRegistry, PoolDefinition } from '@tecnosys/stillum-forms-core';
import { PoolBuilderComponent } from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type BoxPoolDefinition = PoolDefinition & {
  props?: Ark.BoxProps;
};

const BoxPool: PoolBuilderComponent<BoxPoolDefinition> = ({
  definition,
  DropletsTag,
  TriggersTag,
  PoolsTag,
  WebSocketTag,
}) => {
  return (
    <Ark.Box {...definition.props}>
      {DropletsTag && <DropletsTag />}
      {TriggersTag && <TriggersTag />}
      {PoolsTag && <PoolsTag />}
      {WebSocketTag && <WebSocketTag />}
    </Ark.Box>
  );
};

poolRegistry.register('tecnosys-box', BoxPool);

export default BoxPool;
