import { poolRegistry, PoolDefinition } from '@tecnosys/stillum-forms-core';
import { PoolBuilderComponent } from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type FlexPoolDefinition = PoolDefinition & {
  content?: string;
  props?: Ark.FlexProps;
};

const FlexPool: PoolBuilderComponent<FlexPoolDefinition> = ({
  definition,
  DropletsTag,
  TriggersTag,
  PoolsTag,
  WebSocketTag,
}) => {
  return (
    <Ark.Flex {...definition.props}>
      {DropletsTag && <DropletsTag />}
      {TriggersTag && <TriggersTag />}
      {PoolsTag && <PoolsTag />}
      {WebSocketTag && <WebSocketTag />}
    </Ark.Flex>
  );
};

poolRegistry.register('tecnosys-flex', FlexPool);

export default FlexPool;
