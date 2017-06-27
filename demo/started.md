### Browser support
IE 10+, latest of Chrome/FF/Safari, iOS 7+ and Android 2.3+ (except 3.x)

### Quick steps to use:

#### Load files

``` html
<!-- 1) Load jQuery -->
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>

<!-- 2) Load egjs packaged file -->
{% for dist in site.data.egjs.dist %}
<script src="//{{ site.data.egjs.github.user }}.github.io/{{ site.data.egjs.github.repo }}/{{ dist }}"></script>
{% endfor %}
```

#### Animate jquery element

``` javascript
var $el = $("#anim");
$el.animate({"left": "300px"});
```

#### pause jquery element's animation

``` javascript
$el.pause(); //pause animation
```

#### resume jquery element's animation

``` javascript
$el.resume(); // resume animation
```
