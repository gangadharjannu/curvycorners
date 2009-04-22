/****************************************************************
  *                                                              *
  *  curvyCorners                                                *
  *  ------------                                                *
  *                                                              *
  *  This script generates rounded corners for your boxes.       *
  *                                                              *
  *  Version 2.0.1                                               *
  *  Copyright (c) 2008 Cameron Cooke                            *
  *  Version 2 By: Terry Riegel, Cameron Cooke and Tim Hutchison *
  *  Version 1 By: Cameron Cooke and Tim Hutchison               *
  *                                                              *
  *                                                              *
  *  Website: http://www.curvycorners.net                        *
  *  Email:   web@cameroncooke.com                               *
  *  Discuss: http://groups.google.com/group/curvycorners        *
  *                                                              *
  *  Changes:                                                    *
  *  15/04/09: Background position bug fix; Opera working (CPKS) *
  *            See SVN log for details.                          *
  *  29/10:08: Background position bug fix.                      *
  *            (Fix by Dustin Jorge)                             *
  *  11/08/08: Modified to work as a div replacement             *
  *            This should work to replace any existing DIV      *
  *            in existing HTML and not cause reflow issues      *
  *            rounded borders will auto round based on the      *
  *            CSS declarations (see notes below)*               *
  *            (by Terry Riegel riegel@clearimageonline.com)     *
  *  11/18/08: Added support for background-repeat and           *
  *            background-position along with the existing       *
  *            background-color and background-image             *
  *            (by Terry Riegel riegel@clearimageonline.com)     *
  *  11/29/08: Various reflow issues addressed by adding a DIV   *
  *            to hold the height and width so other page        *
  *            elements would not reflow.                        *
  *            (by Terry Riegel riegel@clearimageonline.com)     *
  *                                                              *
  *                                                              *
  *  This library is free software; you can redistribute         *
  *  it and/or modify it under the terms of the GNU              *
  *  Lesser General Public License as published by the           *
  *  Free Software Foundation; either version 2.1 of the         *
  *  License, or (at your option) any later version.             *
  *                                                              *
  *  This library is distributed in the hope that it will        *
  *  be useful, but WITHOUT ANY WARRANTY; without even the       *
  *  implied warranty of MERCHANTABILITY or FITNESS FOR A        *
  *  PARTICULAR PURPOSE. See the GNU Lesser General Public       *
  *  License for more details.                                   *
  *                                                              *
  *  You should have received a copy of the GNU Lesser           *
  *  General Public License along with this library;             *
  *  Inc., 59 Temple Place, Suite 330, Boston,                   *
  *  MA 02111-1307 USA                                           *
  *                                                              *
  ****************************************************************/

/*
Will now autoMagically apply borders via the CSS declarations
Safari, Mozilla, and Chrome all support rounded borders via

-webkit-border-radius, and -moz-border-radius

So instead of reinventing the wheel we will let these browsers render
their borders natively. Firefox for Windows renders non-antialiased
borders so they look a bit ugly. Google's Chrome will render its "ugly"
borders as well. So if we let FireFox, Safari, and Chrome render their
borders natively, then we only have to support IE for rounded borders.
Fortunately IE will read CSS properties
that it doesn't understand (Opera, Firefox and Safari discard them);
so IE finds and applies -moz-border-radius and friends.

So to make curvycorners work with any major browser simply add the following
CSS declarations and it should be good to go...

.round {
  -webkit-border-radius: 25px;
  -moz-border-radius: 25px;
}
*/

function browserdetect() {
  var agent = navigator.userAgent.toLowerCase();
  this.isIE      = agent.indexOf("msie") > -1;
  this.isMoz     = document.implementation && document.implementation.createDocument;
  //this.isMoz     = agent.indexOf('firefox') != -1;
  this.isSafari  = agent.indexOf('safari') != -1;
  this.quirksMode= this.isIE && document.compatMode.indexOf("BackCompat") > -1;
  this.isOp      = window.opera ? true : false;
  this.isWebKit  = agent.indexOf('webkit') != -1;
  if (this.isIE) {
    this.get_style = function(obj, prop) {
      if (!(prop in obj.currentStyle)) return "";
      var matches = /^([\d.]+)(\w*)/.exec(obj.currentStyle[prop]);
      if (!matches) return obj.currentStyle[prop];
      if (matches[1] == 0) return '0';
      // now convert to pixels if necessary
      if (matches[2] && matches[2] !== 'px') {
        var style = obj.style.left;
        var rtStyle = obj.runtimeStyle.left;
        obj.runtimeStyle.left = obj.currentStyle.left;
        obj.style.left = matches[1] + matches[2];
        matches[0] = obj.style.pixelLeft;
        obj.style.left = style;
        obj.runtimeStyle.left = rtStyle;
      }
      return matches[0];
    };
  }
  else {
    if (this.isSafari) {
      this.get_style = function(obj, prop) {
        var returnVal, wasHidden = false;
        prop = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        /*
        Safari does not expose any information for the object if display is
        set to none is set so we temporarily enable it.
        */
        if (obj.style.display == "none") {
          obj.style.display = "";
          wasHidden = true;
        }

        returnVal = document.defaultView.getComputedStyle(obj, '').getPropertyValue(prop);

        // Rehide the object
        if (wasHidden) obj.style.display = "none";

        return returnVal;
      };
    }
    else {
      this.get_style = function(obj, prop) {
        prop = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        return document.defaultView.getComputedStyle(obj, '').getPropertyValue(prop);
      };
    }
  }
}
var Browser = new browserdetect;

// object that parses border-radius properties for a box

function curvyCnrSpec(selText) {
  this.selectorText = selText;
  this.tlR = this.trR = this.blR = this.brR = 0;
  this.tlu = this.tru = this.blu = this.bru = "";
  this.antiAlias = true; // default true
}
curvyCnrSpec.prototype.setcorner = function(tb, lr, radius, unit) {
  if (!tb) { // no corner specified
    this.tlR = this.trR = this.blR = this.brR = parseInt(radius);
    this.tlu = this.tru = this.blu = this.bru = unit;
  }
  else { // corner specified
    propname = tb.charAt(0) + lr.charAt(0);
    this[propname + 'R'] = parseInt(radius);
    this[propname + 'u'] = unit;
  }
}
/*
  get(propstring)
  where propstring is:
  - 'tR' or 'bR' : returns top or bottom radius.
  - 'tlR', 'trR', 'blR' or 'brR' : returns top/bottom left/right radius.
  - 'tlu', 'tru', 'blr' or 'bru' : returns t/b l/r unit (px, em...)
  - 'tRu' or 'bRu' : returns top/bottom radius+unit
  - 'tlRu', 'trRu', 'blRu', 'brRu' : returns t/b l/r radius+unit
*/
curvyCnrSpec.prototype.get = function(prop) {
  if (/^(t|b)(l|r)(R|u)$/.test(prop)) return this[prop];
  if (/^(t|b)(l|r)Ru$/.test(prop)) {
    var pname = prop.charAt(0) + prop.charAt(1);
    return this[pname + 'R'] + this[pname + 'u'];
  }
  if (/^(t|b)Ru?$/.test(prop)) {
    var tb = prop.charAt(0);
    tb += this[tb + 'lR'] > this[tb + 'rR'] ? 'l' : 'r';
    var retval = this[tb + 'R'];
    if (prop.length === 3 && prop.charAt(2) === 'u')
      retval += this[tb = 'u'];
    return retval;
  }
  throw new Error('Don\'t recognize property ' + prop);
}
curvyCnrSpec.prototype.radiusdiff = function(tb) {
  if (tb !== 't' && tb !== 'b') throw new Error("Param must be 't' or 'b'");
  return Math.abs(this[tb + 'lR'] - this[tb + 'rR']);
}
curvyCnrSpec.prototype.setfrom = function(obj) {
  this.tlu = this.tru = this.blu = this.bru = 'px'; // default to px
  if ('tl' in obj) this.tlR = obj.tl.radius;
  if ('tr' in obj) this.trR = obj.tr.radius;
  if ('bl' in obj) this.blR = obj.bl.radius;
  if ('br' in obj) this.brR = obj.br.radius;
  if ('antiAlias' in obj) this.antiAlias = obj.antiAlias;
  if ('validTags' in obj && /^\.?\w+$/.test(this.selectorText)) {
    if (this.selectorText.charAt(0) != '.')
      this.selectorText = '.' + this.selectorText;
    var nst = [];
    for (var i in obj.validTags) nst.push(obj.validTags[i] + this.selectorText);
    this.selectorText = nst.join();
  }
};
curvyCnrSpec.prototype.cloneOn = function(box) { // not needed by IE
  var props = ['tl', 'tr', 'bl', 'br'];
  var converted = 0;
  var i, propu;

  for (i in props) {
    propu = this[props[i] + 'u'];
    if (propu !== '' && propu !== 'px') {
      converted = new curvyCnrSpec;
      break;
    }
  }
  if (!converted)
    converted = this; // no need to clone
  else {
    var propi, propR, save = Browser.get_style(box, 'left');
    for (i in props) {
      propi = props[i];
      propu = this[propi + 'u'];
      propR = this[propi + 'R'];
      if (propu !== 'px') {
        box.style.left = propR + propu;
        propR = document.defaultView.getComputedStyle(box, '').getPropertyValue('left');
      }
      converted[propi + 'R'] = propR;
      converted[propi + 'u'] = 'px';
    }
    box.style.left = save;
  }
  return converted;
}
curvyCnrSpec.prototype.radiusSum = function(tb) {
  if (tb !== 't' && tb !== 'b') throw new Error("Param must be 't' or 'b'");
  return this[tb + 'lR'] + this[tb + 'rR'];
}
curvyCnrSpec.prototype.radiusCount = function(tb) {
  var count = 0;
  if (this[tb + 'lR']) ++count;
  if (this[tb + 'rR']) ++count;
  return count;
}
curvyCnrSpec.prototype.cornerNames = function() {
  var ret = [];
  if (this.tlR) ret.push('tl');
  if (this.trR) ret.push('tr');
  if (this.blR) ret.push('bl');
  if (this.brR) ret.push('br');
  return ret;
}

/*
  Object that parses Opera CSS
*/
function operasheet(sheetnumber) {
  var txt = document.styleSheets.item(sheetnumber).ownerNode.text;
  txt = txt.replace(/\/\*(\n|\r|.)*?\*\//g, ''); // strip comments
  // this pattern extracts all border-radius-containing rulesets
  // matches will be:
  // [0] = the whole lot
  // [1] = the selector text
  // [2] = all the rule text between braces
  // [3] = top/bottom and left/right parts if present (only if webkit/CSS3)
  // [4] = top|bottom
  // [5] = left|right
  // .. but 3..5 are useless as they're only the first match.
  var pat = new RegExp("^([\\w.#][\\w.#, ]+)[\\n\\s]*\\{([^}]+border-((top|bottom)-(left|right)-)?radius[^}]*)\\}", "mg");
  var matches;
  this.rules = [];
  while ((matches = pat.exec(txt)) !== null) {
    var pat2 = new RegExp("border-((top|bottom)-(left|right)-)?radius:\\s*([\\d.]+)(in|em|px|ex|pt)", "g");
    var submatches, cornerspec = new curvyCnrSpec(matches[1]);
    while ((submatches = pat2.exec(matches[2])) !== null)
      cornerspec.setcorner(submatches[2], submatches[3], submatches[4], submatches[5]);
    this.rules.push(cornerspec);
  }
}
// static class function to determine if the sheet is worth parsing
operasheet.contains_border_radius = function(sheetnumber) {
  return /border-((top|bottom)-(left|right)-)?radius/.test(document.styleSheets.item(sheetnumber).ownerNode.text);
}

/*
Usage:

  curvyCorners(settingsObj, "selectorStr");
  curvyCorners(settingsObj, domObj1[, domObj2[, domObj3[, . . . [, domObjN]]]]);
  selectorStr::= "<selector>[, <selector>]..."
  selector::= "[<elementname>].classname" | "#id"
*/

function curvyCorners() {
  var i, j, boxCol, settings, startIndex;
  // Check parameters
  if (typeof arguments[0] !== "object") throw newCurvyError("First parameter of curvyCorners() must be an object.");
  if (arguments[0] instanceof curvyCnrSpec) {
    settings = arguments[0];
    if (!settings.selectorText && typeof arguments[1] === 'string')
      settings.selectorText = arguments[1];
  }
  else {
    if (typeof arguments[1] !== "object" && typeof arguments[1] !== "string") throw newCurvyError("Second parameter of curvyCorners() must be an object or a class name.");
    settings = new curvyCnrSpec((typeof arguments[1] === 'string') ? arguments[1] : '');
    settings.setfrom(arguments[0]);
  }

  // Get object(s)
  if (settings.selectorText) {
    startIndex = 0;
    var args = settings.selectorText.replace(/\s+$/,'').split(/,\s*/); // handle comma-separated selector list
    boxCol = new Array;
    for (i = 0; i < args.length; ++i) {
      switch (args[i].charAt(0)) {
        case '#' : // id
          if (args[i].indexOf(' ') === -1)
            boxCol.push(document.getElementById(args[i].substr(1)));
          else {
            args[i] = args[i].split(' ');
            var encloser = document.getElementById(args[i][0].substr(1));
            var objs = encloser.getElementsByTagName(args[i][1]);
            for (j = 0; j < objs.length; ++j) boxCol.push(objs[j]);
          }
        break;
        default :
          boxCol = boxCol.concat(curvyCorners.getElementsByClass(args[i]));
        //break;
      }
    }
  }
  else {
    // Get objects
    startIndex = 1;
    boxCol = arguments;
  }

  // Loop through each argument
  for (i = startIndex, j = boxCol.length; i < j; ++i) {
    if (!('IEborderRadius' in boxCol[i].style) || boxCol[i].style.IEborderRadius != 'set') {
      if (boxCol[i].className && boxCol[i].className.indexOf('curvyRedraw') !== -1) {
        if (typeof curvyCorners.redrawList === 'undefined') curvyCorners.redrawList = new Array;
        curvyCorners.redrawList.push({
          node : boxCol[i],
          spec : settings,
          copy : boxCol[i].cloneNode(false)
        });
      }
      boxCol[i].style.IEborderRadius = 'set';
      var obj = new curvyObject(settings, boxCol[i]);
      obj.applyCorners();
    }
  }
}
curvyCorners.prototype.applyCornersToAll = function () {}; // now redundant

curvyCorners.redraw = function() {
  if (!Browser.isOP && !Browser.isIE) return;
  if (!curvyCorners.redrawList) throw newCurvyError('curvyCorners.redraw() has nothing to redraw.');
  for (var i in curvyCorners.redrawList) {
    var o = curvyCorners.redrawList[i];
    if (!o.node.clientWidth) continue; // don't resize hidden boxes
    var newchild = o.copy.cloneNode(false);
    for (var contents = o.node.firstChild; contents != null; contents = contents.nextSibling)
      if (contents.className === 'autoPadDiv') break;
    if (!contents) throw newCurvyError("Couldn't find autoPad div"); //DEBUG
    o.node.parentNode.replaceChild(newchild, o.node);
    while (contents.firstChild) newchild.appendChild(contents.removeChild(contents.firstChild));
    o = new curvyObject(o.spec, o.node = newchild);
    o.applyCorners();
  }
}
curvyCorners.adjust = function(obj, prop, newval) {
  if (!Browser.isOP && !Browser.isIE) return;
  if (!curvyCorners.redrawList) throw newCurvyError('curvyCorners.adjust() has nothing to adjust.');
  var i, j = curvyCorners.redrawList.length;
  for (i = 0; i < j; ++i) if (curvyCorners.redrawList[i].node === obj) break;
  if (i === j) throw newCurvyError('Object not redrawable');
  if (prop.indexOf('.') === -1)
    curvyCorners.redrawList[i].copy[prop] = newval;
  else eval('curvyCorners.redrawList[i].copy.' + prop + "='" + newval + "'");
}

// curvyCorners object (can be called directly)

function curvyObject() {
  this.box              = arguments[1];
  this.settings         = arguments[0];
  this.topContainer = this.bottomContainer = this.shell = boxDisp = null;
  var boxWidth = this.box.clientWidth; // browser-independent IE-emulation (NB includes padding)
  if (!boxWidth) {
    boxDisp = this.box;
    do {
      boxDisp = boxDisp.parentNode;
      if (!boxDisp) throw newCurvyError("curvyyObject box with no parent!");
      if (!boxDisp || boxDisp.tagName === 'BODY') {
        this.applyCorners = function() {}
        alert("zero-width box with no accountable parent");
        return;
      }
    } while ((typeof boxDisp.style === 'undefined') || boxDisp.style.display !== 'none');
    boxDisp.style.display = 'block';
    boxWidth = this.box.clientWidth;
  }
  if (arguments[0] instanceof curvyCnrSpec)
    this.spec = arguments[0].cloneOn(this.box); // convert non-pixel units
  else {
    this.spec = new curvyCnrSpec('');
    this.spec.setfrom(this.settings); // no need for unit conversion
  }

  // Get box formatting details
  var boxHeight  = Browser.get_style(this.box, "height") || 'auto';
  var borderWidth     = Browser.get_style(this.box, "borderTopWidth");
  var borderWidthB    = Browser.get_style(this.box, "borderBottomWidth");
  var borderWidthL    = Browser.get_style(this.box, "borderLeftWidth");
  var borderWidthR    = Browser.get_style(this.box, "borderRightWidth");
  var borderColour    = Browser.get_style(this.box, "borderTopColor");
  var borderColourB   = Browser.get_style(this.box, "borderBottomColor");
  var borderColourL   = Browser.get_style(this.box, "borderLeftColor");
  var boxColour       = Browser.get_style(this.box, "backgroundColor");
  var backgroundImage = Browser.get_style(this.box, "backgroundImage");
  var backgroundRepeat= Browser.get_style(this.box, "backgroundRepeat");
  var backgroundPosX  = Browser.get_style(this.box, "backgroundPositionX");
  var backgroundPosY  = Browser.get_style(this.box, "backgroundPositionY");
  var boxPosition     = Browser.get_style(this.box, "position");
  var topPadding      = Browser.get_style(this.box, "paddingTop");
  var bottomPadding   = Browser.get_style(this.box, "paddingBottom");
  var leftPadding     = Browser.get_style(this.box, "paddingLeft");
  var rightPadding    = Browser.get_style(this.box, "paddingRight");
  var border          = Browser.get_style(this.box, "border");
  var topMargin       = Browser.get_style(this.box, "marginTop");
  var bottomMargin    = Browser.get_style(this.box, "marginBottom");

  var topMaxRadius    = this.spec.get('tR');
  var botMaxRadius    = this.spec.get('bR');
  var styleToNPx = function(val) {
    if (typeof val === 'number') return val;
    if (typeof val !== 'string') throw newCurvyError('unexpected styleToNPx type ' + typeof val);
    var matches = /^[-\d.]([a-z]+)$/.exec(val);
    if (matches && matches[1] != 'px') throw newCurvyError('Unexpected unit ' + matches[1]);
    if (isNaN(val = parseInt(val))) val = 0;
    return val;
  }

  // Set formatting properties
  //this.boxHeight       = parseInt(((boxHeight != "" && boxHeight != "auto" && boxHeight.indexOf("%") == -1) ? boxHeight : this.box.offsetHeight));
  this.borderWidth     = styleToNPx(borderWidth);
  this.borderWidthB    = styleToNPx(borderWidthB);
  this.borderWidthL    = styleToNPx(borderWidthL);
  this.borderWidthR    = styleToNPx(borderWidthR);
  this.boxColour       = format_colour(boxColour);
  this.topPadding      = styleToNPx(topPadding);
  this.bottomPadding   = styleToNPx(bottomPadding);
  this.leftPadding     = styleToNPx(leftPadding);
  this.rightPadding    = styleToNPx(rightPadding);
  this.boxWidth        = boxWidth - this.leftPadding - this.rightPadding;
  this.boxHeight       = (((boxHeight != "" && boxHeight != "auto" && boxHeight.indexOf("%") == -1) ? parseInt(boxHeight) : this.box.clientHeight - this.topPadding - this.bottomPadding));
  this.borderColour    = format_colour(borderColour);
  this.borderColourB   = format_colour(borderColourB);
  this.borderColourL   = format_colour(borderColourL);
  this.borderString    = this.borderWidth + "px" + " solid " + this.borderColour;
  this.borderStringB   = this.borderWidthB + "px" + " solid " + this.borderColourB;
  this.backgroundImage = ((backgroundImage != "none")? backgroundImage : "");
  this.backgroundRepeat= backgroundRepeat;
  this.backgroundPosX  = styleToNPx(backgroundPosX);
  this.backgroundPosY  = styleToNPx(backgroundPosY);

  this.boxContent      = this.box.innerHTML;
  this.topMargin       = styleToNPx(topMargin);
  this.bottomMargin    = styleToNPx(bottomMargin);

  this.box.innerHTML = "";

  if (boxPosition != "absolute") this.box.style.position = "relative";
  this.box.style.top = this.box.style.left = this.box.style.padding = '0';
  this.box.style.border = this.box.style.backgroundImage = 'none';
  this.box.style.backgroundColor = 'transparent';

  if (Browser.quirksMode) {
    this.box.style.width   = this.boxWidth + 'px';
    this.box.style.height  = this.boxHeight + 'px';
  } else {
    this.box.style.width   = (this.boxWidth + this.leftPadding + this.rightPadding  + this.borderWidthL + this.borderWidthR) + 'px';
    this.box.style.height  = (this.boxHeight + this.topPadding + this.bottomPadding + this.borderWidth + this.borderWidthB) + 'px';
  }

  // Ok we add an inner div to actually put things into this will allow us to keep the height

  var newMainContainer = document.createElement("div");
  if (Browser.quirksMode) {
    newMainContainer.style.width  = this.boxWidth + 'px';
    newMainContainer.style.height = (this.boxHeight - topMaxRadius - botMaxRadius) + 'px';
  } else {
    newMainContainer.style.width  = (this.boxWidth + this.leftPadding + this.rightPadding) + 'px';
    newMainContainer.style.height = (this.boxHeight + this.topPadding + this.bottomPadding + this.borderWidth + this.borderWidthB - topMaxRadius - botMaxRadius) + 'px';
  }
  newMainContainer.style.position = "relative";
  newMainContainer.style.padding  = "0";
  newMainContainer.style.top    = (topMaxRadius - this.borderWidth) + "px";
  newMainContainer.style.left   = "0";
  if (this.borderWidthL)
    newMainContainer.style.borderLeft = this.borderWidthL + "px solid " + this.borderColourL;
  if (this.borderWidth)
    newMainContainer.style.borderTop = this.borderWidth + "px solid " + this.borderColour;
  if (this.borderWidthR)
    newMainContainer.style.borderRight = this.borderWidthR + "px solid " + this.borderColourL;
  if (this.borderWidthB)
    newMainContainer.style.borderBottom = this.borderWidthB + "px solid " + this.borderColourB;
  if (topMaxRadius) newMainContainer.style.borderTopColor  = 'transparent';
  if (botMaxRadius) newMainContainer.style.borderBottomColor  = 'transparent';
  newMainContainer.style.backgroundColor    = boxColour;
  newMainContainer.style.backgroundImage    = this.backgroundImage;
  newMainContainer.style.backgroundRepeat   = this.backgroundRepeat;
  this.shell = this.box.appendChild(newMainContainer);

  boxWidth = Browser.get_style(this.shell, "width");
  this.boxWidth = (boxWidth != "" && boxWidth != "auto" && boxWidth.indexOf("%") == -1) ? parseInt(boxWidth) : this.shell.offsetWidth;

  /*
    This method creates the corners and
    applies them to the div element.
  */
  this.applyCorners = function() {
    /*
      Create top and bottom containers.
      These will be used as a parent for the corners and bars.
    */
    for (var t = 0; t < 2; ++t) {
      switch(t) {
        case 0: // Top
          // Build top bar only if a top corner is to be drawn
          if (topMaxRadius) {
            newMainContainer = document.createElement("div");
            newMainContainer.style.width = this.boxWidth + "px";
            newMainContainer.style.fontSize = "1px";
            newMainContainer.style.overflow = "hidden";
            newMainContainer.style.position = "absolute";
            newMainContainer.style.paddingLeft  = this.borderWidth + "px";
            newMainContainer.style.paddingRight = this.borderWidth + "px";
            newMainContainer.style.height = topMaxRadius + "px";
            newMainContainer.style.top    = (0 - topMaxRadius) + "px";
            newMainContainer.style.left   = (0 - this.borderWidthL) + "px";
            this.topContainer = this.shell.appendChild(newMainContainer);
          }
        break;

        case 1: // Bottom
          // Build bottom bar only if a bottom corner is to be drawn
          if (botMaxRadius) {
            var newMainContainer = document.createElement("div");
            if (Browser.isIE) {
              newMainContainer.style.width = parseInt(this.boxWidth) + "px";
            } else {
              newMainContainer.style.width = parseInt(this.boxWidth) + "px"; // what if it's not PX? ~~~
            }
            newMainContainer.style.fontSize = "1px";
            newMainContainer.style.overflow = "hidden";
            newMainContainer.style.position = "absolute";
            newMainContainer.style.paddingLeft  = this.borderWidthB + "px";
            newMainContainer.style.paddingRight = this.borderWidthB + "px";
            newMainContainer.style.height   =  botMaxRadius + "px";
            newMainContainer.style.bottom   = (0 - botMaxRadius) + "px";
            newMainContainer.style.left     = (0 - this.borderWidthL) + "px";
            this.bottomContainer = this.shell.appendChild(newMainContainer);
          }
        break;
      }
    }

    var corners = this.spec.cornerNames();  // array of available corners

    /*
    Loop for each corner
    */
    for (var i in corners) {
      // Get current corner type from array
      var cc = corners[i];
      // Has the user requested the currentCorner be round?
      // Code to apply correct color to top or bottom
      if (cc == "tr" || cc == "tl") {
        var bwidth = this.borderWidth;
        var bcolor = this.borderColour;
      } else {
        var bwidth = this.borderWidthB;
        var bcolor = this.borderColourB;
      }
      var newCorner = document.createElement("div");
      newCorner.style.height = this.spec.get(cc + 'Ru');
      newCorner.style.width  = this.spec.get(cc + 'Ru');
      newCorner.style.position = "absolute";
      newCorner.style.fontSize = "1px";
      newCorner.style.overflow = "hidden";
      // THE FOLLOWING BLOCK OF CODE CREATES A ROUNDED CORNER
      // ---------------------------------------------------- TOP
      // Get border radius
      var specRadius = this.spec[cc + 'R'];
      var borderRadius = specRadius - this.borderWidth;
      // Cycle the x-axis
      for (var intx = 0; intx < specRadius; ++intx) {
        // Calculate the value of y1 which identifies the pixels inside the border
        var y1 = (intx + 1 >= borderRadius) ? -1 : Math.floor(Math.sqrt(Math.pow(borderRadius, 2) - Math.pow(intx + 1, 2))) - 1;
        // Calculate y2 and y3 only if there is a border defined
        if (borderRadius != specRadius) {
          var y2 = (intx >= borderRadius) ? -1 : Math.ceil(Math.sqrt(Math.pow(borderRadius, 2) - Math.pow(intx, 2)));
          var y3 = (intx + 1 >= specRadius) ? -1 : Math.floor(Math.sqrt(Math.pow(specRadius, 2) - Math.pow((intx+1), 2))) - 1;
        }
        // Calculate y4
        var y4 = (intx >= specRadius) ? -1 : Math.ceil(Math.sqrt(Math.pow(specRadius, 2) - Math.pow(intx, 2)));
        // Draw bar on inside of the border with foreground colour
        if (y1 > -1) this.drawPixel(intx, 0, this.boxColour, 100, (y1 + 1), newCorner, -1, specRadius);
        // Draw border/foreground antialiased pixels and border only if there is a border defined
        if (borderRadius != specRadius) {
          // Cycle the y-axis
          for (var inty = y1 + 1; inty < y2; ++inty) {
            // Draw anti-alias pixels
            if (this.spec.antiAlias) {
              // For each of the pixels that need anti aliasing between the foreground and border colour draw single pixel divs
              if (this.backgroundImage != "") {
                var borderFract = curvyObject.pixelFraction(intx, inty, borderRadius) * 100;
                this.drawPixel(intx, inty, bcolor, 100, 1, newCorner,
                  borderFract < 30 ? 0 : -1, specRadius
                );
              }
              else {
                var pixelcolour = BlendColour(this.boxColour, bcolor, curvyObject.pixelFraction(intx, inty, borderRadius));
                this.drawPixel(intx, inty, pixelcolour, 100, 1, newCorner, 0, specRadius, cc);
              }
            }
          }
          // Draw bar for the border
          if (this.spec.antiAlias) {
            if (y3 >= y2) {
              if (y2 == -1) y2 = 0;
              this.drawPixel(intx, y2, bcolor, 100, (y3 - y2 + 1), newCorner, 0, 0);
            }
          }
          else {
            if (y3 >= y1) {
              this.drawPixel(intx, (y1 + 1), bcolor, 100, (y3 - y1), newCorner, 0, 0);
            }
          }
          // Set the colour for the outside curve
          var outsideColour = bcolor;
        }
        else {
          // Set the colour for the outside curve
          var outsideColour = this.boxColour;
          var y3 = y1;
        }
        // Draw aa pixels?
        if (this.spec.antiAlias) {
          // Cycle the y-axis and draw the anti aliased pixels on the outside of the curve
          for (var inty = y3 + 1; inty < y4; ++inty) {
            // For each of the pixels that need anti aliasing between the foreground/border colour & background draw single pixel divs
            this.drawPixel(intx, inty, outsideColour, (curvyObject.pixelFraction(intx, inty , specRadius) * 100), 1, newCorner, (this.borderWidth > 0) ? 0 : -1, specRadius);
          }
        }
      }
      // END OF CORNER CREATION
      // ---------------------------------------------------- END

      /*
      Now we have a new corner we need to reposition all the pixels unless
      the current corner is the bottom right.
      */
      // Loop through all children (pixel bars)
      for (var t = 0, k = newCorner.childNodes.length; t < k; ++t) {
        // Get current pixel bar
        var pixelBar = newCorner.childNodes[t];
        // Get current top and left properties
        var pixelBarTop    = parseInt(pixelBar.style.top);
        var pixelBarLeft   = parseInt(pixelBar.style.left);
        var pixelBarHeight = parseInt(pixelBar.style.height);
        // Reposition pixels
        if (cc == "tl" || cc == "bl") {
          pixelBar.style.left = (specRadius - pixelBarLeft - 1) + "px"; // Left
        }
        if (cc == "tr" || cc == "tl"){
          pixelBar.style.top =  (specRadius - pixelBarHeight - pixelBarTop) + "px"; // Top
        }
        pixelBar.style.backgroundRepeat = this.backgroundRepeat;

        if (this.backgroundImage != "") switch(cc) {
          case "tr":
            if (Browser.quirksMode) {
              pixelBar.style.backgroundPosition = parseInt(this.backgroundPosX - Math.abs(0 - this.borderWidthL + this.boxWidth - specRadius + pixelBarLeft)) + "px " + parseInt(this.backgroundPosY - Math.abs(specRadius - pixelBarHeight - pixelBarTop - this.borderWidth)) + "px";
            } else {
              pixelBar.style.backgroundPosition = parseInt(this.backgroundPosX - Math.abs(this.borderWidthR - this.borderWidthL + (this.boxWidth - specRadius + this.borderWidthR) + pixelBarLeft)) + "px " + parseInt(this.backgroundPosY - Math.abs(specRadius - pixelBarHeight - pixelBarTop - this.borderWidth)) + "px";
            }
          break;
          case "tl":
            pixelBar.style.backgroundPosition = parseInt(this.backgroundPosX - Math.abs((specRadius - pixelBarLeft -1)  - this.borderWidthL)) + "px " + parseInt(this.backgroundPosY - Math.abs(specRadius - pixelBarHeight - pixelBarTop - this.borderWidth)) + "px";
          break;
          case "bl":
            if (Browser.quirksMode) {
              pixelBar.style.backgroundPosition = parseInt(this.backgroundPosX - Math.abs((specRadius - pixelBarLeft - 1) - this.borderWidthL)) + "px " + parseInt(this.backgroundPosY - Math.abs((this.boxHeight + (this.borderWidth - this.topPadding - 1) - specRadius + pixelBarTop))) + "px";
            } else {
              pixelBar.style.backgroundPosition = parseInt(this.backgroundPosX - Math.abs((specRadius - pixelBarLeft - 1) - this.borderWidthL)) + "px " + parseInt(this.backgroundPosY - Math.abs((this.boxHeight + (this.borderWidth + this.topPadding + this.bottomPadding) - specRadius + pixelBarTop))) + "px";
            }
          break;
          case "br":
            if (Browser.quirksMode) {
              pixelBar.style.backgroundPosition = parseInt(this.backgroundPosX - Math.abs(1 + this.leftPadding - this.borderWidthL + this.boxWidth - specRadius + pixelBarLeft)) + "px " + parseInt(this.backgroundPosY - Math.abs((this.boxHeight + (this.borderWidth - this.topPadding - 1) - specRadius + pixelBarTop))) + "px";
            } else {
              pixelBar.style.backgroundPosition = parseInt(this.backgroundPosX - Math.abs(this.borderWidthR - this.borderWidthL + (this.boxWidth - specRadius + this.borderWidthR) + pixelBarLeft)) + "px " + parseInt(this.backgroundPosY - Math.abs((this.boxHeight + (this.borderWidth + this.topPadding + this.bottomPadding) - specRadius + pixelBarTop))) + "px";
            }
          break;
        }
      }

      // Position the container
      switch (cc) {
        case "tl":
          newCorner.style.top = newCorner.style.left = "0";
          this.topContainer.appendChild(newCorner);
        break;
        case "tr":
          newCorner.style.top = newCorner.style.right = "0";
          this.topContainer.appendChild(newCorner);
        break;
        case "bl":
          newCorner.style.bottom = newCorner.style.left = "0";
          this.bottomContainer.appendChild(newCorner);
        break;
        case "br":
          newCorner.style.bottom = newCorner.style.right = "0";
          this.bottomContainer.appendChild(newCorner);
        //break;
      }
    }

    /*
      The last thing to do is draw the rest of the filler DIVs.
    */

    // Find out which corner has the bigger radius and get the difference amount
    var radiusDiff = {
      t : this.spec.radiusdiff('t'),
      b : this.spec.radiusdiff('b')
    };

    for (z in radiusDiff) {
      if (!this.spec.get(z + 'R')) continue; // no need if no corners
      if (radiusDiff[z]) {
        // Get the type of corner that is the smaller one
        var smallerCornerType = (this.spec[z + "lR"] < this.spec[z + "rR"]) ? z + "l" : z + "r";

        // First we need to create a DIV for the space under the smaller corner
        var newFiller = document.createElement("div");
        newFiller.style.height = radiusDiff[z] + "px";
        newFiller.style.width  =  this.spec.get(smallerCornerType + 'Ru');
        newFiller.style.position = "absolute";
        newFiller.style.fontSize = "1px";
        newFiller.style.overflow = "hidden";
        newFiller.style.backgroundColor = this.boxColour;

        // Position filler
        switch (smallerCornerType) {
          case "tl":
            newFiller.style.bottom =
            newFiller.style.left   = "0";
            newFiller.style.borderLeft = this.borderString;
            this.topContainer.appendChild(newFiller);
          break;
          case "tr":
            newFiller.style.bottom =
            newFiller.style.right  = "0";
            newFiller.style.borderRight = this.borderString;
            this.topContainer.appendChild(newFiller);
          break;
          case "bl":
            newFiller.style.top    =
            newFiller.style.left   = "0";
            newFiller.style.borderLeft = this.borderStringB;
            this.bottomContainer.appendChild(newFiller);
          break;
          case "br":
            newFiller.style.top    =
            newFiller.style.right  = "0";
            newFiller.style.borderRight = this.borderStringB;
            this.bottomContainer.appendChild(newFiller);
          break;
        }
      }

      // Create the bar to fill the gap between each corner horizontally
      var newFillerBar = document.createElement("div");
      newFillerBar.style.position = "relative";
      newFillerBar.style.fontSize = "1px";
      newFillerBar.style.overflow = "hidden";
      newFillerBar.style.width = this.fillerWidth(z);
      newFillerBar.style.backgroundColor = this.boxColour;
      newFillerBar.style.backgroundImage = this.backgroundImage;
      newFillerBar.style.backgroundRepeat= this.backgroundRepeat;

      switch (z) {
        case "t":
          // Top Bar
          if (this.topContainer) {
            if (Browser.quirksMode) {
              newFillerBar.style.height = 100 + topMaxRadius + "px";
            } else {
              newFillerBar.style.height = 100 + topMaxRadius - this.borderWidth + "px";
            }
            newFillerBar.style.marginLeft  = this.spec.tlR ? (this.spec.tlR - this.borderWidthL) + "px" : "0";
            newFillerBar.style.borderTop   = this.borderString;
            if (this.backgroundImage != "") {
              var x_offset = this.spec.tlR ?
                (this.backgroundPosX - (topMaxRadius - this.borderWidthL)) + "px " : "0 ";
              newFillerBar.style.backgroundPosition  = x_offset + this.backgroundPosY + "px";
            }
            this.topContainer.appendChild(newFillerBar);
            // Repos the boxes background image
            this.shell.style.backgroundPosition = parseInt(this.backgroundPosX) + "px " + parseInt(this.backgroundPosY - (topMaxRadius - this.borderWidthL)) + "px";
          }
        break;
        case "b":
          if (this.bottomContainer) {
            // Bottom Bar
            if (Browser.quirksMode) {
              newFillerBar.style.height     = botMaxRadius + "px";
            } else {
              newFillerBar.style.height     = botMaxRadius - this.borderWidth + "px";
            }
            newFillerBar.style.marginLeft   = this.spec.blR ? (this.spec.blR - this.borderWidthL) + "px" : "0";
            newFillerBar.style.borderBottom = this.borderStringB;
            if (this.backgroundImage != "") {
              var x_offset = this.spec.blR ?
                (this.backgroundPosX - (botMaxRadius - this.borderWidthL)) + "px " : "0 ";
              if (Browser.quirksMode) {
                newFillerBar.style.backgroundPosition = x_offset + (this.backgroundPosY - (this.boxHeight + this.borderWidth - botMaxRadius)) + "px";
              } else {
                newFillerBar.style.backgroundPosition  = x_offset + (this.backgroundPosY - (this.boxHeight + this.topPadding + this.borderWidth + this.bottomPadding - botMaxRadius)) + "px";
                //if (Browser.isIE) newFillerBar.style.backgroundPosition  = x_offset + (this.backgroundPosY + this.topPadding + this.bottomPadding - (this.boxHeight + this.borderWidth + botMaxRadius)) + "px";
                //alert('bg pos = ' + newFillerBar.style.backgroundPosition);
              }
            }
            this.bottomContainer.appendChild(newFillerBar);
          }
        break;
      }
    }

    // Create content container
    var contentContainer = document.createElement("div");
    // Set contentContainer's properties
    contentContainer.style.position = "absolute";
    // contentContainer.style.border = "1px dotted #000"; // DEBUG, comment for production
    //      contentContainer.style.width = (this.boxWidth - 180) + "px";
    contentContainer.innerHTML      = this.boxContent;
    contentContainer.className      = "autoPadDiv";
    // Get padding amounts
    topPadding = this.borderWidth  + this.topPadding;
    bottomPadding = this.borderWidthB + this.bottomPadding;
    // Apply top padding
    if (topMaxRadius < this.topPadding) {
      //contentContainer.style.paddingTop = (topPadding - topMaxRadius) + "px";
      contentContainer.style.top = topPadding + "px";
    } else {
      contentContainer.style.paddingTop = "0";
      contentContainer.style.top = topPadding + "px";
    }
    // Apply Bottom padding
    if (botMaxRadius < this.bottomPadding) {
      contentContainer.style.paddingBottom = (bottomPadding - botMaxRadius) + "px";
    } else {
      contentContainer.style.paddingBottom = "0";
    }
    // Apply left and right padding
    contentContainer.style.paddingLeft = (this.borderWidthL + this.leftPadding) + "px";
    contentContainer.style.paddingRight = (this.borderWidthR + this.rightPadding) + "px";
    // Append contentContainer
    this.box.appendChild(contentContainer);
    if (boxDisp) boxDisp.style.display = 'none';
  }
}

/*
  This function draws the pixels
*/
curvyObject.prototype.drawPixel = function(intx, inty, colour, transAmount, height, newCorner, image, cornerRadius) {
  // Create pixel
  var pixel = document.createElement("div");
  pixel.style.height   = height + "px";
  pixel.style.width    = "1px";
  pixel.style.position = "absolute";
  pixel.style.fontSize = "1px";
  pixel.style.overflow = "hidden";
  // Max Top Radius
  var topMaxRadius = this.spec.get('tR');
  pixel.style.backgroundColor = colour;
  // Don't apply background image to border pixels
  if (image == -1 && this.backgroundImage != "") {
    pixel.style.backgroundImage = this.backgroundImage;
    pixel.style.backgroundPosition  = "-" + (this.boxWidth - (cornerRadius - intx) + this.borderWidth) + "px -" + ((this.boxHeight + topMaxRadius + inty) - this.borderWidth) + "px";
  }
  // Set opacity if the transparency is anything other than 100
  if (transAmount != 100) setOpacity(pixel, transAmount);
  // Set the pixels position
  pixel.style.top = inty + "px";
  pixel.style.left = intx + "px";
  newCorner.appendChild(pixel);
}
curvyObject.prototype.fillerWidth = function(tb) {
  var bWidth = this.spec.radiusCount(tb) * this.borderWidth;
  return (this.boxWidth - this.spec.radiusSum(tb) + bWidth) + 'px';
}

// ------------- UTILITY FUNCTIONS

/*
// Inserts an element after another

function insertAfter(parent, node, referenceNode) {
  parent.insertBefore(node, referenceNode.nextSibling);
}
*/

/*
  Converts a number to hexadecimal format
*/

curvyObject.IntToHex = function(strNum) {
  var hexdig = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F' ];

  return hexdig[strNum >>> 4] + '' + hexdig[strNum & 15];
}


/*
  Blends the two colours by the fraction
  returns the resulting colour as a string in the format "#FFFFFF"
*/

function BlendColour(Col1, Col2, Col1Fraction) {
  var red1 = parseInt(Col1.substr(1, 2), 16);
  var green1 = parseInt(Col1.substr(3, 2), 16);
  var blue1 = parseInt(Col1.substr(5, 2), 16);
  var red2 = parseInt(Col2.substr(1, 2), 16);
  var green2 = parseInt(Col2.substr(3, 2), 16);
  var blue2 = parseInt(Col2.substr(5, 2), 16);

  if (Col1Fraction > 1 || Col1Fraction < 0) Col1Fraction = 1;

  var endRed = Math.round((red1 * Col1Fraction) + (red2 * (1 - Col1Fraction)));
  if (endRed > 255) endRed = 255;
  if (endRed < 0) endRed = 0;

  var endGreen = Math.round((green1 * Col1Fraction) + (green2 * (1 - Col1Fraction)));
  if (endGreen > 255) endGreen = 255;
  if (endGreen < 0) endGreen = 0;

  var endBlue = Math.round((blue1 * Col1Fraction) + (blue2 * (1 - Col1Fraction)));
  if (endBlue > 255) endBlue = 255;
  if (endBlue < 0) endBlue = 0;

  return "#" + curvyObject.IntToHex(endRed) + curvyObject.IntToHex(endGreen)+ curvyObject.IntToHex(endBlue);
}

/*
  For a pixel cut by the line determines the fraction of the pixel on the 'inside' of the
  line.  Returns a number between 0 and 1
*/

curvyObject.pixelFraction = function(x, y, r) {
  var fraction = 0;

  /*
    determine the co-ordinates of the two points on the perimeter of the pixel that the
    circle crosses
  */
  var xvalues = new Array(1);
  var yvalues = new Array(1);
  var point = 0;
  var whatsides = "";

  // x + 0 = Left
  var intersect = Math.sqrt(Math.pow(r, 2) - Math.pow(x, 2));

  if (intersect >= y && intersect < (y + 1)) {
    whatsides = "Left";
    xvalues[point] = 0;
    yvalues[point] = intersect - y;
    ++point;
  }
  // y + 1 = Top
  intersect = Math.sqrt(Math.pow(r, 2) - Math.pow(y + 1, 2));

  if (intersect >= x && intersect < (x + 1)) {
    whatsides = whatsides + "Top";
    xvalues[point] = intersect - x;
    yvalues[point] = 1;
    ++point;
  }
  // x + 1 = Right
  intersect = Math.sqrt(Math.pow(r, 2) - Math.pow(x + 1, 2));

  if (intersect >= y && intersect < (y + 1)) {
    whatsides = whatsides + "Right";
    xvalues[point] = 1;
    yvalues[point] = intersect - y;
    ++point;
  }
  // y + 0 = Bottom
  intersect = Math.sqrt(Math.pow(r, 2) - Math.pow(y, 2));

  if (intersect >= x && intersect < (x + 1)) {
    whatsides = whatsides + "Bottom";
    xvalues[point] = intersect - x;
    yvalues[point] = 0;
  }

  /*
    depending on which sides of the perimeter of the pixel the circle crosses calculate the
    fraction of the pixel inside the circle
  */
  switch (whatsides) {
    case "LeftRight":
      fraction = Math.min(yvalues[0], yvalues[1]) + ((Math.max(yvalues[0], yvalues[1]) - Math.min(yvalues[0], yvalues[1])) / 2);
    break;

    case "TopRight":
      fraction = 1 - (((1 - xvalues[0]) * (1 - yvalues[1])) / 2);
    break;

    case "TopBottom":
      fraction = Math.min(xvalues[0], xvalues[1]) + ((Math.max(xvalues[0], xvalues[1]) - Math.min(xvalues[0], xvalues[1])) / 2);
    break;

    case "LeftBottom":
      fraction = yvalues[0] * xvalues[1] / 2;
    break;

    default:
      fraction = 1;
  }

  return fraction;
}

// This function converts CSS rgb(x, x, x) to hexadecimal

function rgb2Hex(rgbColour) {
  try {
    // Get array of RGB values
    var rgbArray = rgb2Array(rgbColour);

    // Get RGB values
    var red   = parseInt(rgbArray[0]);
    var green = parseInt(rgbArray[1]);
    var blue  = parseInt(rgbArray[2]);

    // Build hex colour code
    var hexColour = "#" + curvyObject.IntToHex(red) + curvyObject.IntToHex(green) + curvyObject.IntToHex(blue);
  }
  catch(e) {
    alert("There was an error converting the RGB value to Hexadecimal in function rgb2Hex");
  }

  return hexColour;
}

// Returns an array of rbg values

function rgb2Array(rgbColour) {
  // Remove rgb()
  var rgbValues = rgbColour.substring(4, rgbColour.indexOf(")"));

  // Split RGB into array
  return rgbValues.split(", ");
}

/*
  Function by Simon Willison from sitepoint.com
  Modified by Cameron Cooke adding Safari's rgba support
*/

function setOpacity(obj, opacity) {
  opacity = (opacity == 100) ? 99.999 : opacity;

  if (Browser.isSafari && obj.tagName != "IFRAME") {
    // Get array of RGB values
    var rgbArray = rgb2Array(obj.style.backgroundColor);

    // Get RGB values
    var red   = parseInt(rgbArray[0]);
    var green = parseInt(rgbArray[1]);
    var blue  = parseInt(rgbArray[2]);

    // Safari using RGBA support
    obj.style.backgroundColor = "rgba(" + red + ", " + green + ", " + blue + ", " + opacity/100 + ")";
  }
  else if (typeof obj.style.opacity !== "undefined") { // W3C
    obj.style.opacity = opacity / 100;
  }
  else if (typeof obj.style.MozOpacity !== "undefined") { // Older Mozilla
    obj.style.MozOpacity = opacity / 100;
  }
  else if (typeof obj.style.filter != "undefined") { // IE
    obj.style.filter = "alpha(opacity:" + opacity + ")";
  }
  else if (typeof obj.style.KHTMLOpacity != "undefined") { // Older KHTML Based Browsers
    obj.style.KHTMLOpacity = opacity / 100;
  }
}


// Cross browser add event wrapper

function addEvent(elm, evType, fn, useCapture) {
  if (elm.addEventListener) {
    elm.addEventListener(evType, fn, useCapture);
    return true;
  }
  if (elm.attachEvent) return elm.attachEvent('on' + evType, fn);
  elm['on' + evType] = fn;
  return false;
}

/*
// Cross browser remove event wrapper

function removeEvent(obj, evType, fn, useCapture) {
  if (obj.removeEventListener) {
    obj.removeEventListener(evType, fn, useCapture);
    return true;
  }
  if (obj.detachEvent) {
    var r = obj.detachEvent("on"+evType, fn);
    return r;
  }
  throw new Error("Handler could not be removed");
  return false; // we never get here, actually
}
*/

function format_colour(colour) {
  var returnColour = "#ffffff";

  // Make sure colour is set and not transparent
  if (colour != "" && colour != "transparent") {
    // RGB Value?
    if (colour.substr(0, 3) === "rgb") {
      // Get HEX aquiv.
      returnColour = rgb2Hex(colour);
    }
    else if (colour.length === 4) {
      // 3 chr colour code add remainder
      returnColour = "#" + colour.substring(1, 2) + colour.substring(1, 2) + colour.substring(2, 3) + colour.substring(2, 3) + colour.substring(3, 4) + colour.substring(3, 4);
    }
    else {
      // Normal valid hex colour
      returnColour = colour;
    }
  }
  return returnColour;
}

// Get elements by class by Dustin Diaz / CPKS

curvyCorners.getElementsByClass = function(searchClass, node) {
  var classElements = new Array;
  if (node == null) node = document;
  searchClass = searchClass.split('.'); // see if there's a tag in there
  var tag = '*'; // prepare for no tag
  if (searchClass.length == 1)
    searchClass = searchClass[0];
  else {
    if (searchClass[0]) tag = searchClass[0];
    searchClass = searchClass[1];
  }
  if (tag == null) tag = '*';
  var els = node.getElementsByTagName(tag);
  var elsLen = els.length;
  var pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
  for (var i = 0; i < elsLen; ++i) {
    if (pattern.test(els[i].className)) classElements.push(els[i]);
  }
  return classElements;
}

// Displays error message

function newCurvyError(errorMessage) {
  return new Error("curvyCorners Error:\n" + errorMessage)
}

// autoscan code

curvyCorners.scanStyles = function() {
  function makeInt(num) {
    return isNaN(num = parseInt(num)) ? 0 : num;
  }

  if (Browser.isIE) {
    for (var t = 0; t < document.styleSheets.length; ++t) {
      for (var i = 0; i < document.styleSheets[t].rules.length; ++i) {
        var allR = document.styleSheets[t].rules[i].style['-webkit-border-radius'] || 0;
        var tR   = document.styleSheets[t].rules[i].style['-webkit-border-top-right-radius']  || allR;
        var tL   = document.styleSheets[t].rules[i].style['-webkit-border-top-left-radius']  || allR;
        var bR   = document.styleSheets[t].rules[i].style['-webkit-border-bottom-right-radius']  || allR;
        var bL   = document.styleSheets[t].rules[i].style['-webkit-border-bottom-left-radius']  || allR;
        if (allR || tR || tR || bR || bL) {
          var selector = document.styleSheets[t].rules[i].selectorText;

          var settings = {
            tl: { radius: makeInt(tL) },
            tr: { radius: makeInt(tR) },
            bl: { radius: makeInt(bL) },
            br: { radius: makeInt(bR) },
            antiAlias: true
          };

          curvyCorners(settings, selector);
        }
      }
    }
  }
  else if (Browser.isOp) {
    for (var t = 0; t < document.styleSheets.length; ++t) {
      if (operasheet.contains_border_radius(t)) {
        var settings = new operasheet(t);
        for (var i in settings.rules) curvyCorners(settings.rules[i]);
      }
    }
  }
  else alert('Wasting my time!');
}

// Dean Edwards/Matthias Miller/John Resig

curvyCorners.init = function() {
  // quit if this function has already been called
  if (arguments.callee.done) return;

  // flag this function so we don't do the same thing twice
  arguments.callee.done = true;

  // kill the timer
  if (Browser.isWebKit && curvyCorners.init.timer) {
    clearInterval(curvyCorners.init.timer);
    curvyCorners.init.timer = null;
  }

  // do stuff
  curvyCorners.scanStyles();
}

if (typeof curvyCornersNoAutoScan === 'undefined' || curvyCornersNoAutoScan === false) {
  /* for Internet Explorer */
  /*@cc_on @*/
  /*@if (@_win32 || @_win64)
    document.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
    var script = document.getElementById("__ie_onload");
    script.onreadystatechange = function() {
      if (this.readyState == "complete") {
        curvyCorners.init(); // call the onload handler
      }
    };
  @else @*/

  if (document.addEventListener) { // Mozilla/Opera9/FireFox/Safari 4/Chrome
    if (Browser.isOp) document.addEventListener("DOMContentLoaded", curvyCorners.init, false);
  }
  else if (Browser.isWebKit) { // ? for old Safari?
    curvyCorners.init.timer = setInterval(function() {
      if (/loaded|complete/.test(document.readyState)) {
        curvyCorners.init('WebKit'); // call the onload handler
      }
    }, 10);
  }
  else window.onload = curvyCorners.init; // other browsers
  /*@end @*/
}
