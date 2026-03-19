import { poolRegistry, PoolDefinition } from '@tecnosys/stillum-forms-core';
import { PoolBuilderComponent } from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type WrapPoolDefinition = PoolDefinition & {
  props?: Ark.WrapProps;
};

const WrapPool: PoolBuilderComponent<WrapPoolDefinition> = ({
  definition,
  DropletsTag,
  PoolsTag,
  WebSocketTag,
}) => {
  return (
    <Ark.Wrap {...definition.props}>
      {DropletsTag && <DropletsTag />}
      {PoolsTag && <PoolsTag />}
      {WebSocketTag && <WebSocketTag />}
    </Ark.Wrap>
  );
};

poolRegistry.register('tecnosys-wrap', WrapPool);

export default WrapPool;
