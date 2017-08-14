### demo

{% include_relative assets/html/demo.html %}

```js
//pause / resume by mouse over/out events.
$("#rectBox").hover(function() {
  $(this).pause();
}, function() {
  $(this).resume();
});

// Animate element infinitely
var $rectBox = $("#rectBox");
var easing = "linear";

function drawRectangle() {
  $rectBox
    .animate({"opacity": 0.5}, 1000)
    .animate({"left": "+=200px"}, 1000, easing) // relative value
    .animate({"top": "200px"}, 1000, easing) // absolute value
    .animate({"left": "0px"}, 1000, easing)
    .animate({"top": "-=200px"}, 1000, easing)
    .animate({"opacity": "+=0.5"}, 1000, drawRectangle)
}

drawRectangle();
```
