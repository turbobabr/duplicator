
import {
  Commands,
  Direction
} from './constants';

import Utils from './utils';

import duplicate from './duplicate';

export default function (context) {

  switch(Utils.normalize(context.command.identifier())) {
    case Commands.Left:
      duplicate(context.selection,{ direction: Direction.Left });
      break;

    case Commands.Right:
      duplicate(context.selection,{ direction: Direction.Right });
      break;

    case Commands.Above:
      duplicate(context.selection,{ direction: Direction.Above });
      break;

    case Commands.Below:
      duplicate(context.selection,{ direction: Direction.Below });
      break;
  }
}
