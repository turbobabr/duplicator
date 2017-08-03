
import {
  Commands,
  Direction
} from './constants';

import Utils from './utils';

import { duplicateOnce, duplicateWithRepeater } from './duplicate';
import { showSettingsEditor } from './settings';

export default function (context) {

  switch(Utils.normalize(context.command.identifier())) {
    case Commands.Left:
      duplicateOnce(context.selection, Direction.Left);
      break;

    case Commands.Right:
      duplicateOnce(context.selection, Direction.Right);
      break;

    case Commands.Above:
      duplicateOnce(context.selection,Direction.Above);
      break;

    case Commands.Below:
      duplicateOnce(context.selection,Direction.Below);
      break;

    case Commands.LeftRepeater:
      duplicateWithRepeater(context.selection, Direction.Left);
      break;

    case Commands.RightRepeater:
      duplicateWithRepeater(context.selection, Direction.Right);
      break;

    case Commands.AboveRepeater:
      duplicateWithRepeater(context.selection,Direction.Above);
      break;

    case Commands.BelowRepeater:
      duplicateWithRepeater(context.selection,Direction.Below);
      break;

    case Commands.Settings:
      showSettingsEditor();
      break;
  }
}
