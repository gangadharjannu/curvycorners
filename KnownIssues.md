## Introduction ##

If CurvyCorners isn't doing what you expect, check the list below.


## Details ##

  * CurvyCorners can get perplexed by certain CSS selectors. The symptom is that the box(es) just don't get rounded. See the SelectorSupport page for details.

  * CurvyCorners has to use absolute sizing and positioning to draw the corners. If you want cornered boxes to resize, or to change their attributes, in response to script events, you _must_ use the CSS style of specifying the corners, _not_ the old manual style. Boxes styled by CurvyCorners cannot be resized dynamically except by using the technique described on the DynamicFeatures page.

  * When rounding a bordered box, the border style must always be `solid`: other styles are not supported. For best results, the border width must be the same on both sides adjacent to the rounded corner.

  * Elliptical radii (e.g. `border-radius:1em 2em;`) are not supported. The first dimension will be understood as the only dimension.

  * In some circumstances, a browser may not compute a display width for a box that you wish to style with rounded corners. This may either be because the box is not currently displayed, or because of a peculiarity in the browser. In this circumstance, CurvyCorners will output an error message and continue; but it will not be able to apply corners to the box in question. It may be possible to correct this by applying a width or min-width style to the affected box element. You can suppress the display of the error message by including the following in the `<head>` section of the page before the script tag that includes the CurvyCorners script:
```
<script type="text/javascript">
var curvyCornersVerbose = false;
</script>
```

  * In Opera v9.x, unrecognized styles (including rounded corner styles) are not included in the DOM tree. CurvyCorners can detect them only if it has access to the CSS text. If the stylesheet is included using a `<link href="mystyle.css" rel="stylesheet"/>` element, or using an `@import` rule, it cannot be accessed via the DOM. Script has access only if the style is included in the HTML page itself. This limitation may affect Opera v10 also.

  * If a box has an image background, and the two top or bottom radii are of different non-zero values, the box will not render correctly. Your top and bottom corner radii must be either equal, or one of them must be zero (square).

  * In legacy browsers, when using image backgrounds, the lower part of the box may be out by 1 pixel. We are investigating this issue, which seems unpredictable and may be an artifact of certain ancient rendering engines.

  * `<img>` elements cannot be rounded using CurvyCorners. Instead, use a `<div>` element and set the image as the background-image of the `<div>`.

  * Other inline elements, such as `<span>`, `<input>`, etc. cannot be rounded by CurvyCorners. This is because CurvyCorners works by inserting `<div>` elements inside the box to be rounded. In some cases, CurvyCorners may be able to work round the situation by applying the style `display:inline-block` to the element; in other cases, it will output an error. To avoid the error, the page must be restructured.

  * `<table>` elements cannot be rounded using CurvyCorners. Instead, put the table inside a `<div>` element and round the containing `<div>`.

  * Pages styled with CurvyCorners will very likely not **print** as expected. CurvyCorners uses box backgrounds to obtain its visual effects, and most browsers ignore background CSS when printing. For more on this, see PrintStyling.