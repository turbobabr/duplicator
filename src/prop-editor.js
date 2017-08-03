
import _ from 'lodash';
import Utils from './utils';

export const PropEditorType = {
  TextField: 'textField',
  PopupButton: 'popupButton'
};

export const PropType = {
  String: 'string',
  Number: 'number',
  List: 'list'
};

// FIXME: This is a dirty.. dirty hack!
const loadImageFromResources = (filePath) => {
  const command = coscript.printController();
  const pluginBundle = command.pluginBundle();
  const bundleUrl = pluginBundle.url();

  const bundle = NSBundle.bundleWithURL(bundleUrl);

  const parts = filePath.split(".");
  const actualPath = bundle.pathForResource_ofType(parts[0],parts[1]);

  return NSImage.alloc().initWithContentsOfFile(actualPath);
};

export default class PropEditorDialog {
  constructor(options = {}) {
    this._alert = NSAlert.alloc().init();
    this._showDebugContentView = false;
    this.setup(options);
  }

  set title(value) {
    this._alert.messageText = value;
  }

  set icon(value) {
    if(_.isString(value)) {
      this._alert.icon = loadImageFromResources(value);
      return;
    }

    this._alert.icon = value;
  }

  set description(value) {
    this._alert.informativeText = value;
  }

  get window() {
    return this._alert.window();

  }

  setup(options = {}) {
    options = _.assign({
      title: 'Default Title',
      description: '',
      contentViewWidth: 320
    },options);

    this.options = options;
    this._views = [];
    this._responsesMap = {};

    this.title = this.options.title;
    this.description = this.options.description;
    this.icon = this.options.icon;

    _.each(this.options.buttons,(button,index) => {
      this._alert.addButtonWithTitle(button.title);
      this._responsesMap[`${1000 + index}`] = button.id;
    });

    _.eachRight(this.options.props,(prop) => {
      let control = null;
      switch(prop.editorType) {
        case PropEditorType.TextField:
          control = this.addTextField(prop);
          break;

        case PropEditorType.PopupButton:
          control = this.addPopupButton(prop);
          break;
      }

      prop.control = control;

      if(!_.isEmpty(prop.label)) {
        this.addLabel(prop.label);
      }
    });
  }

  addLabel(text) {
    const textField = NSTextField.alloc().initWithFrame(NSMakeRect(0,0,this.options.contentViewWidth,16));
    textField.setDrawsBackground(false);
    textField.setEditable(false);
    textField.setBezeled(false);
    textField.setSelectable(false);

    textField.setStringValue(text);
    this._views.push(textField);

    return textField;
  }

  addTextField(options) {
    const textField = NSTextField.alloc().initWithFrame(NSMakeRect(0,0,this.options.contentViewWidth,24));
    textField.setStringValue(options.value);
    this._views.push(textField);

    return textField;
  }

  addPopupButton(options) {
    const button = NSPopUpButton.alloc().initWithFrame(NSMakeRect(0,0,this.options.contentViewWidth,24));
    const menu = button.menu();
    _.each(options.list,(item) => {
      const menuItem = NSMenuItem.alloc().init();
      menuItem.title = item.label;
      menuItem.representedObject = item.name;

      menu.addItem(menuItem);
    });

    const itemToSelect = _.find(menu.itemArray(),(item) => {
      if(Utils.normalize(item.representedObject()) == options.value) {
        return item;
      }
    });

    if(itemToSelect) {
      button.selectItem(itemToSelect);
    }

    this._views.push(button);
    return button;
  }

  layout() {
    const view = NSView.alloc().initWithFrame(NSMakeRect(0, 0, this.options.contentViewWidth, 1));

    if(this._showDebugContentView) {
      view.wantsLayer = true;
      view.layer().backgroundColor = NSColor.redColor().CGColor();
    }

    let height = 0;
    _.each(this._views,(subView) => {
      let currentFrame = subView.bounds();
      currentFrame.origin.y = height;
      height += currentFrame.size.height + 8;
      subView.setFrame(currentFrame);

      view.addSubview(subView);
    });

    let viewFrame = view.frame();
    viewFrame.size.height = height;

    view.setFrame(viewFrame);
    this._alert.setAccessoryView(view);

    const firstEditableView = _.find(_.reverse(this._views),(view) => {
      return view.isKindOfClass(NSTextField) && view.isEditable() == true;
    });

    if(firstEditableView) {
      this.window.setInitialFirstResponder(firstEditableView);
    }

    const respondersChain = this.findResponders();
    _.each(respondersChain,(responder,index) => {
      if(index + 1 < respondersChain.length) {
        responder.setNextKeyView(respondersChain[index+1]);
      } else if(respondersChain.length > 1) {
        responder.setNextKeyView(respondersChain[0]);
      }
    });
  }

  findResponders() {
    return _.filter(this._views,(view) => {
      return (view.isKindOfClass(NSTextField) && view.isEditable()) || view.isKindOfClass(NSPopUpButton);
    });
  }

  collectProps() {
    let props = {};
    _.each(this.options.props,(prop) => {
      if(!prop.control) {
        return;
      }

      if(prop.type == PropType.Number && prop.control.isKindOfClass(NSTextField)) {
        props[prop.name] = parseFloat(Utils.normalize(prop.control.stringValue()));
      } else if(prop.type == PropType.List && prop.control.isKindOfClass(NSPopUpButton)) {
        props[prop.name] = Utils.normalize(prop.control.selectedItem().representedObject());
      }
    });

    return props;
  }

  show(callback = function() {}) {
    this.layout();

    callback(`${this._responsesMap[`${this._alert.runModal()}`]}`,this.collectProps());
  }
}
