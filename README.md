Duplicator
===========

A small [Sketch 3](http://bohemiancoding.com/sketch/) plugin that takes the currently selected layers and copies them once or multiple times in a specified direction. A must have tool for any UI/UX designer who uses Sketch on a daily basis! :)

Here is a short screencast that demonstrates all the features of the plugin:

<a href="http://youtu.be/-CoHd9a-wnc" target="_blank"><img src="http://turbobabr.github.io/duplicator/images/play-screencast-image.png" alt="Sketch 3 Duplicator Plugin Screencast"/></a>

## Installation

1. [Download duplicator.zip archive with the plugin](http://turbobabr.github.io/duplicator/distr/duplicator.zip).
2. Reveal plugins folder in finder ('Sketch App Menu' -> 'Plugins' -> 'Reveal Plugins Folder...').
3. Copy downloaded zip file to the revealed folder and un-zip it.
4. That's it! :)

## Usage

### Instant Cheatsheet
I prefer to use keyboard shortcuts whenever possible, but I'm really bad at remembering them. A few years ago I found out that in order to remember them quickly it's very helpful to have a small cheat sheet that contains all the keyboard shortcuts right in front of my eyes while learning a new tool.

Since this plugin is totally useless without shortcuts I decided to built cheat sheet in right into the plugin itself! This cheat sheet is just another plugin that embeds raster image containing shortcut reference into your current page.

##### In order to see the cheat sheet, just run "Cheatsheet" plugin from the plugins menu:

   ![Paste Cheatsheet](http://turbobabr.github.io/duplicator/images/paste-cheatsheet.png)

##### It will automatically embed the cheat sheet into your current page as a new artboard:

   ![Sketch Duplicator Plugin Cheatsheet](http://turbobabr.github.io/duplicator/images/plugin-cheatsheet.png)

### Quick Duplicate

This feature allows to create a copy of currently selected layers and automatically places it on an edge of selection bounds + 10 px offset.

**How to use:**

1. Select one or more layers to duplicate
2. Duplicate selection:
  * ⌘ + ⌃ + `RIGHT arrow key`: duplicate right
  * ⌘ + ⌃ + `LEFT arrow key`: duplicate left
  * ⌘ + ⌃ + `UP arrow key`: duplicate above
  * ⌘ + ⌃ + `DOWN arrow key`: duplicate below

**Note:** You can change a default spacing value in `duplicator.js` file. There is a special constant for that `var DEFAULT_SPACING = 10;` at the first line of the file.

### Step and Repeat

This feature gives an ability to quickly duplicate and repeat selected layers by the same distance in a specified direction. This one is ideal for making grids and lists! There is a [built-in feature in Sketch](http://www.sketchtips.info/?tip=29) that does the same thing, but it requires a few extra steps to achieve the same result.

**How to use:**

1. Select one or more layers you want to duplicate multiple times
2. Step and repeat selection with custom spacing:
  * ⌘ + ⌃ + ⇧ + `RIGHT arrow key`: repeat right
  * ⌘ + ⌃ + ⇧ + `LEFT arrow key`: repeat left
  * ⌘ + ⌃ + ⇧ + `UP arrow key`: repeat above
  * ⌘ + ⌃ + ⇧ + `DOWN arrow key`: repeat below
3. Specify number of copies and distance between them in the popup dialog:
   ![Step and Repeat Dialog](http://turbobabr.github.io/duplicator/images/step-and-repeat-dialog.png)


## Version history

**Duplicator 1.0.0: 7/9/2014**
* Initial Release

## Feedback

If you discover any issue or have any suggestions for improvement of the plugin, please [open an issue](https://github.com/turbobabr/duplicator/issues) or find me on twitter [@turbobabr](http://twitter.com/turbobabr).

## License

The MIT License (MIT)

Copyright (c) 2014 Andrey Shakhmin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.