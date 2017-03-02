# eg.PauseResume

Pauses and resumes animation executed by the jQuery animate() method.

## Domcumentation

 * API Documentation
   - Latest: [http://naver.github.io/egjs/latest/doc/jQuery.html#pause](http://naver.github.io/egjs/latest/doc/jQuery.html#pause)
   - Specific version: [http://naver.github.io/egjs/[VERSION]/doc/jQuery.html#pause](http://naver.github.io/egjs/[VERSION]/doc/jQuery.html#pause)
 * An advanced demo is under construction.

## Supported Browsers

The following table shows browsers supported by eg.PauseResume

|Internet Explorer|Chrome|Firefox|Safari|iOS|Android|
|---|---|---|---|---|---|
|10+|Latest|Latest|Latest|7+|2.3+(except 3.x)|


## Dependency
eg.PauseResume has the dependencies for the following libraries:

|[jquery](https://jquery.com)|
|----|
|1.7.0+|

## How to Use
### 1. Load dependency library before pauseresume.js (or pauseresume.min.js) load.
```html
<script src="../node_modules/jquery/jquery.js"></script>
```

### 2. Load pauseresume.js
```html
<script src="../dist/pauseresume.js"></script>
```

### 3. Make a target element
```html
<!-- Target DOM -->
<div id="area"></div>
```

### 4. Use eg.PauseResume
```javascript
$("#area").animate({});//TODO: make sample

$("#area").on("mouseover", function() {
  $(this).pause();
});

$("#area").on("mouseout", function() {
  $(this).resume();
});
```

## Bug Report

If you find a bug, please report it to us using the [Issues](https://github.com/naver/egjs-pauseresume/issues) page on GitHub.


## License
eg.PauseResume is released under the [MIT license](http://naver.github.io/egjs/license.txt).

```
Copyright (c) 2015 NAVER Corp.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```