import { poolRegistry, PoolDefinition } from '@tecnosys/stillum-forms-core';
import { PoolBuilderComponent } from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type GridItemPoolDefinition = PoolDefinition & {
  props?: Ark.GridItemProps;
};

const GridItemPool: PoolBuilderComponent<GridItemPoolDefinition> = ({
  definition,
  DropletsTag,
  TriggersTag,
  PoolsTag,
  WebSocketTag,
}) => {
  return (
    <Ark.GridItem {...definition.props}>
      {DropletsTag && <DropletsTag />}
      {TriggersTag && <TriggersTag />}
      {PoolsTag && <PoolsTag />}
      {WebSocketTag && <WebSocketTag />}
    </Ark.GridItem>
  );
};

poolRegistry.register('tecnosys-grid-item', GridItemPool);

export default GridItemPool;
