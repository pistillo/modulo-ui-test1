import { poolRegistry, PoolDefinition } from '@tecnosys/stillum-forms-core';
import { PoolBuilderComponent } from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

export type CardPoolDefinition = PoolDefinition & {
  props?: Ark.CardProps;
};

const CardPool: PoolBuilderComponent<CardPoolDefinition> = ({
  definition,
  DropletsTag,
  TriggersTag,
  PoolsTag,
  style,
}) => {
  const props = definition.props || {};

  return (
    <Ark.Card {...props} style={style}>
      <Ark.CardHeader>
        {DropletsTag && <DropletsTag assign="header" />}
        {TriggersTag && <TriggersTag assign="header" />}
      </Ark.CardHeader>

      <Ark.CardBody>
        {DropletsTag && <DropletsTag assign="content" />}
        {PoolsTag && <PoolsTag assign="content" />}
        {TriggersTag && <TriggersTag assign="content" />}
      </Ark.CardBody>

      <Ark.CardFooter>
        {PoolsTag && <PoolsTag assign="footer" />}
        {TriggersTag && <TriggersTag assign="footer" />}
      </Ark.CardFooter>
    </Ark.Card>
  );
};

poolRegistry.register('tecnosys-card', CardPool);

export default CardPool;
