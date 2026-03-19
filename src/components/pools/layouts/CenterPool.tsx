import { poolRegistry, PoolDefinition } from '@tecnosys/stillum-forms-core';
import { PoolBuilderComponent } from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type CenterPoolDefinition = PoolDefinition & {
  props?: Ark.CenterProps;
};

const CenterPool: PoolBuilderComponent<CenterPoolDefinition> = ({
  definition,
  DropletsTag,
  PoolsTag,
  WebSocketTag,
}) => {
  return (
    <Ark.Center {...definition.props}>
      {DropletsTag && <DropletsTag />}
      {PoolsTag && <PoolsTag />}
      {WebSocketTag && <WebSocketTag />}
    </Ark.Center>
  );
};

poolRegistry.register('tecnosys-center', CenterPool);

export default CenterPool;
