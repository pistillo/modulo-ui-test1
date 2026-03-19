import { poolRegistry, PoolDefinition } from '@tecnosys/stillum-forms-core';
import { PoolBuilderComponent } from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type AspectRatioPoolDefinition = PoolDefinition & {
  props?: Ark.AspectRatioProps;
};

const AspectRatioPool: PoolBuilderComponent<AspectRatioPoolDefinition> = ({
  definition,
  DropletsTag,
  PoolsTag,
  WebSocketTag,
}) => {
  return (
    <Ark.AspectRatio {...definition.props}>
      {DropletsTag && <DropletsTag />}
      {PoolsTag && <PoolsTag />}
      {WebSocketTag && <WebSocketTag />}
    </Ark.AspectRatio>
  );
};

poolRegistry.register('tecnosys-aspect-ratio', AspectRatioPool);

export default AspectRatioPool;
