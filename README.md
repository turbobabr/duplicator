![Hero](docs/hero-logo.png?raw=true "Logo")
===========

Duplicator is a handy [SketchApp](http://bohemiancoding.com/sketch/) plugin that takes currently selected layers or artboards and copies them once or multiple times in a specified direction.

## Install with Sketch Runner
With Sketch Runner, just go to the `install` command and search for `duplicator`. Runner allows you to manage plugins and do much more to speed up your workflow in Sketch. [Download Runner here](http://www.sketchrunner.com).

![Sketch Runner screenshot](https://raw.githubusercontent.com/turbobabr/duplicator/master/docs/runner-installation.png)

## Manual Installation

1. Download [Duplicator.sketchplugin.zip](https://github.com/turbobabr/duplicator/releases/download/v2.0.2/Duplicator.sketchplugin.zip) archive with the plugin.
2. Reveal plugins folder in finder ('Sketch App Menu' -> 'Plugins' -> 'Manage Plugins...' -> 'Gear Icon' -> 'Show Plugins Folder').
3. Delete previously installed version of the plugin (`duplicator` folder or `Duplicator.sketchplugin` bundle)
4. Un-zip downloaded archive and double-click `Duplicator.sketchplugin` file to install.

## Usage

### Duplicating layers

Select any layer and use `command-control + any arrow key` to duplicate it in a corresponding to the arrow key direction. Duplicated layer gets automatically selected, thus it's easy to create several duplicates of the same layer by repeating the command. By default plugin uses `10px` offset for regular layers. Offset could be adjusted in the `Settings` dialog:

![Duplicating layers](docs/duplicating-layers.gif?raw=true)

### Duplicating multiple layers at once

It's possible to select several layers that belong to different groups or artboards and duplicate them at once. It's especially useful for grids generation:

![Duplicating multiple layers at once](docs/duplicating-multiple-layers-at-once.gif?raw=true)

### Duplicating artboards and symbols

All layer types are supported.. this means that we can duplicate artboards and symbols! By default `100px` offset is used for spacing between duplicated artboards, but it could be adjusted in the `Settings` dialog:

![Duplicating artboards and symbols](docs/duplicating-artboards-and-symbols.gif?raw=true)

### Manually adjusting offsets between duplicates

Create a first duplicate of a selected layer(s) using `command-control + arrow` shortcut and adjust vertical or horizontal spacing between original layer(s) and duplicate, then repeat in the same direction until you have the desired duplicates. This feature works for any types of layers, including artboards and symbols:

![Manually adjusting offsets between duplicates](docs/remembering-offsets.gif?raw=true)

### Duplicating layers a given number of times with custom offset

In case you want to create a certain number of copies in a specified direction with specific offset between copies, you could use `command-control-shift + any arrow key` shortcuts to provide the required values and pick specific injection mode:

![Repeating](docs/repeaters-custom-offsets.gif?raw=true)

It's also possible to adjust offsets between duplicates in context by creating duplicate once using `command control + arrow` shortcut and adjusting vertical or horizontal spacing, then you could use `command-control-shift + the same arrow key` to create multiple copies at once. In such case offset will be picked up automatically:

![Manually adjusting offsets between duplicates](docs/repeaters-adjusted-offsets.gif?raw=true)


### Changing default settings

Default settings could be changed in special dialog by selecting `Sketch Menu > Plugins > Duplication > Settings` menu item:

![Settings Dialog](docs/settings-dialog.png?raw=true)

## Version history

**Duplicator 2.0.3: 2/8/2019**
* Sketch 53 support
* BUGFIX: Wrong layers ordering for `Before Selection` injection mode 
* BUGFIX: Added missing icon

**Duplicator 2.0.2: 3/16/2018**
* Sketch 49 support

**Duplicator 2.0.1: 9/15/2017**
* BUGFIX: Nested duplicated layers can't be selected on canvas

**Duplicator 2.0.0: 8/3/2017**
* Artboards and symbols support
* Ability to manually adjust offsets between duplicates
* Customizable injection mode
* Sketch 46 support

**Duplicator 1.1.0: 5/24/2016**
* New bundle format support
* Sketch 3.8+ support

**Duplicator 1.0.0: 7/9/2014**
* Initial Release

## Feedback

If you discover  any issue or have any suggestions for improvement of the plugin, please [open an issue](https://github.com/turbobabr/duplicator/issues) or find me on twitter [@turbobabr](http://twitter.com/turbobabr).

## License

The MIT License (MIT)

Copyright (c) 2014-2018 Andrey Shakhmin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.