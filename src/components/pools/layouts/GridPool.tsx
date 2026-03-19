import { poolRegistry, PoolDefinition } from '@tecnosys/stillum-forms-core';
import { PoolBuilderComponent } from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type GridPoolDefinition = PoolDefinition & {
  content?: string;
  props?: Ark.GridProps;
};

const GridPool: PoolBuilderComponent<GridPoolDefinition> = ({
  definition,
  DropletsTag,
  TriggersTag,
  PoolsTag,
  WebSocketTag,
}) => {
  return (
    <Ark.Grid {...definition.props}>
      {DropletsTag && <DropletsTag />}
      {TriggersTag && <TriggersTag />}
      {PoolsTag && <PoolsTag />}
      {WebSocketTag && <WebSocketTag />}
    </Ark.Grid>
  );
};

poolRegistry.register('tecnosys-grid', GridPool);

export default GridPool;
