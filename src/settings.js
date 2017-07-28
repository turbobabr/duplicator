import PropEditorDialog, { PropType, PropEditorType } from './prop-editor';
import { InjectionMode } from './constants';

import { DEFAULTS_STORAGE_KEY } from './constants';

const loadDefaultSettings = () => {
  let str = NSUserDefaults.standardUserDefaults().stringForKey(DEFAULTS_STORAGE_KEY);
  if(!str) {
    return {};
  }

  let options = {};

  try {
    options = JSON.parse(str);
  } catch(err) {
    print("[duplicator]: Error - Can't load default settings!");
  }

  return options;
};

const saveDefaultSettings = (options) => {
  options = options || {};

  let str = JSON.stringify(options);

  let userDefaults = NSUserDefaults.standardUserDefaults();
  userDefaults.setObject_forKey(str,DEFAULTS_STORAGE_KEY);
  userDefaults.synchronize();
};


export const defaultSettings = (options = {}) => {
  return _.assign({
    defaultOffset: 10,
    defaultArtboardOffset: 100,
    injectionMode: InjectionMode.AfterSelection
  },loadDefaultSettings(),options);
};


export const showSettingsEditor = () => {

  let props = defaultSettings();

  let editor = new PropEditorDialog({
    title: 'Duplicator Settings',
    description: 'This is a long informative text that describes all the available options:',
    icon: 'ic-logo.png',
    props: [
      {
        name: 'defaultOffset',
        type: PropType.Number,
        editorType: PropEditorType.TextField,
        label: 'Offset:',
        value: props.defaultOffset
      },
      {
        name: 'defaultArtboardOffset',
        type: PropType.Number,
        editorType: PropEditorType.TextField,
        label: 'Artboards Offset:',
        value: props.defaultArtboardOffset
      },
      {
        name: 'injectionMode',
        type: PropType.List,
        list: [
          {
            name: InjectionMode.Default,
            label: 'Default'
          },
          {
            name: InjectionMode.BeforeSelection,
            label: 'Before Selection'
          },
          {
            name: InjectionMode.AfterSelection,
            label: 'After Selection'
          }
        ],
        editorType: PropEditorType.PopupButton,
        label: 'Injection Mode:',
        value: props.injectionMode
      }
    ],
    buttons: [
      {
        title: "Save",
        id: "okButton"
      },
      {
        title: "Cancel",
        id: "cancelButton"
      }
    ]
  });

  editor.show((response,props) => {
    if(response != 'okButton') {
      return;
    }

    // TODO: Entered properties should be validated before saving them!
    saveDefaultSettings(props);
  });
};
