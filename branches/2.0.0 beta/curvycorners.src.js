 /****************************************************************
  *                                                              *
  *  curvyCorners                                                *
  *  ------------                                                *
  *                                                              *
  *  This script generates rounded corners for your divs.        *
  *                                                              *
  *  Version 2.0.0                                               *
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
  *                                                              *
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
Opera is not supported currently. Fortunately IE will read CSS properties
that it doesn't understand (both Firefox and Safari discard them)
So we will add yet another CSS declaration that IE can find and apply
the borders to (CCborderRadius)

So to make curvycorners work with any major browser simply add the following
CSS declarations and it should be good to go...

.round { -webkit-border-radius: 25px;
         -moz-border-radius: 25px;
         CCborderRadius: 25px;}
*/



  // Browser detection
  var isIE      = navigator.userAgent.toLowerCase().indexOf("msie") > -1;
  var isMoz     = document.implementation && document.implementation.createDocument;
  //var isMoz     = ((navigator.userAgent.toLowerCase().indexOf('firefox')!=-1))?true:false;
  var isSafari  = ((navigator.userAgent.toLowerCase().indexOf('safari')!=-1))?true:false;
  var BackCompat= document.compatMode.indexOf("BackCompat") > -1;
  var isOp      =window.opera?1:0;

  // Dean Edwards/Matthias Miller/John Resig

  function init() {
    // quit if this function has already been called
    if (arguments.callee.done) return;

    // flag this function so we don't do the same thing twice
    arguments.callee.done = true;

    // kill the timer
    if (_timer) clearInterval(_timer);

    // do stuff
    styleit();
  };

  /* for Mozilla/Opera9 */
  if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", init, false);
  }

  /* for Internet Explorer */
  /*@cc_on @*/
  /*@if (@_win32)
    document.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
    var script = document.getElementById("__ie_onload");
    script.onreadystatechange = function() {
      if (this.readyState == "complete") {
        init(); // call the onload handler
      }
    };
  /*@end @*/

  /* for Safari */
  if (/WebKit/i.test(navigator.userAgent)) { // sniff
    var _timer = setInterval(function() {
      if (/loaded|complete/.test(document.readyState)) {
        init(); // call the onload handler
      }
    }, 10);
  }

  /* for other browsers */
  window.onload = init;

  /*
  Usage:

  newCornersObj = new curvyCorners(settingsObj, "classNameStr");
  newCornersObj = new curvyCorners(settingsObj, divObj1[, divObj2[, divObj3[, . . . [, divObjN]]]]);
  */


   function styleit()
   {
    if (isIE)
    {
     for(var t = 0; t < document.styleSheets.length; t++)
     {
      for(var i = 0; i < document.styleSheets[t].rules.length; i++)
      {
       var allR = document.styleSheets[t].rules[i].style.CCborderRadius    || 0;
       var tR   = document.styleSheets[t].rules[i].style.CCborderRadiusTR  || allR;
       var tL   = document.styleSheets[t].rules[i].style.CCborderRadiusTL  || allR;
       var bR   = document.styleSheets[t].rules[i].style.CCborderRadiusBR  || allR;
       var bL   = document.styleSheets[t].rules[i].style.CCborderRadiusBL  || allR;

       if (allR || tR || tR || bR || bL)
       {
        var s = document.styleSheets[t].rules[i].selectorText;

        var settings = {

          tl: { radius: makeInt(tL) },
          tr: { radius: makeInt(tR) },
          bl: { radius: makeInt(bL) },
          br: { radius: makeInt(bR) },
          antiAlias: true,
          autoPad: true,
          validTags: ["div"]
        };

        var myBoxObject = new curvyCorners(settings, replace(s,'.',''));
        myBoxObject.applyCornersToAll();
       }
      }
     }
    }
   }

   function makeInt(num) {
     var re = new RegExp('([0-9]*)');
     var i = 0;
     if(isNaN(num)) {
       var a = re.exec(num);
       if(!isNaN(parseInt(a[1]))) {
         i = a[1];
       }
     }
     else {
       i = num;
     }

     return i;
   }



function right(t,x) { return t.substr(t.length-x) ; }

function left(t,x) { return t.substr(0,x) ; }

function reverse(o)
{
  var s = "";
  var i = o.length;
  while (i>0) {
   s += o.substring(i-1,i);
   i--; }
  return s;
}

function replace(a,b,c) {return a.replace(b,c) ; }

function replaceall(text, strA, strB)
{ while ( text.indexOf(strA) != -1)
  { text = text.replace(strA,strB); }
  return text; }

function middle(t,a,b) {return t.substring(a-1,b);}

function chopleft(t,a)
{ var b='';
  if (t.search(a)<0)
  {b=t;}
  else
  {b=t.substring(t.search(a));}
  return b;
}

function chopright(t,a)
{ var b='';
  if (t.search(a)<0)
  {b=t;}
  else
  {b=t.substring(0,t.search(a));}
  return b;
}





function ifTop(obj,val) {
 if (obj.settings.tl || obj.settings.tr) {
   return val;
 } else {
   return 0;
 }
}

function ifBot(obj,val) {
 if (obj.settings.bl || obj.settings.br) {
   return val;
 } else {
   return 0;
 }
}




  function curvyCorners()
  {
      // Check parameters
      if(typeof(arguments[0]) != "object") throw newCurvyError("First parameter of curvyCorners() must be an object.");
      if(typeof(arguments[1]) != "object" && typeof(arguments[1]) != "string") throw newCurvyError("Second parameter of curvyCorners() must be an object or a class name.");

      // Get object(s)
      if(typeof(arguments[1]) == "string")
      {
          // Get elements by class name
          var startIndex = 0;
          var boxCol = getElementsByClass(arguments[1]);
      }
      else
      {
          // Get objects
          var startIndex = 1;
          var boxCol = arguments;
      }

      // Create return collection/object
      var curvyCornersCol = new Array();

      // Create array of html elements that can have rounded corners
      if(arguments[0].validTags)
        var validElements = arguments[0].validTags;
      else
        var validElements = ["div"]; // Default

      // Loop through each argument
      for(var i = startIndex, j = boxCol.length; i < j; i++)
      {
          // Current element tag name
          var currentTag = boxCol[i].tagName.toLowerCase();


          if(inArray(validElements, currentTag) !== false)
          {
             if (!(boxCol[i].style.IEborderRadius=='set'))
              { boxCol[i].style.IEborderRadius='set'; curvyCornersCol[curvyCornersCol.length] = new curvyObject(arguments[0], boxCol[i]);}
          }
      }

      this.objects = curvyCornersCol;

      // Applys the curvyCorners to all objects
      this.applyCornersToAll = function()
      {
          for(var x = 0, k = this.objects.length; x < k; x++)
          {
              this.objects[x].applyCorners();
          }
      }
  }



  // curvyCorners object (can be called directly)
  function curvyObject()
  {
      // Setup Globals
      this.box              = arguments[1];
      this.settings         = arguments[0];
      this.topContainer     = null;
      this.bottomContainer  = null;
      this.shell            = null;
      this.masterCorners    = new Array();
      this.contentDIV       = null;

      // Get box formatting details
      var boxHeightP      = get_style(this.box.parentNode, "height", "height");
      if(typeof boxHeightP == 'undefined') boxHeightP = 'auto';
      var boxHeight       = get_style(this.box, "height", "height");
      if(typeof boxHeight == 'undefined') boxHeight = 'auto';

      if (isIE)
      {
      var boxWidth        = this.box.offsetWidth;
      } else {
      var boxWidth        = get_style(this.box, "width", "width");
      }
      var borderWidth     = get_style(this.box, "borderTopWidth", "border-top-width");
      var borderWidthB    = get_style(this.box, "borderBottomWidth", "border-bottom-width");
      var borderWidthP    = get_style(this.box.parentNode, "borderTopWidth", "border-top-width");
      var borderWidthBP   = get_style(this.box.parentNode, "borderBottomWidth", "border-bottom-width");
      var borderWidthL    = get_style(this.box, "borderLeftWidth", "border-left-width");
      var borderWidthR    = get_style(this.box, "borderRightWidth", "border-right-width");
      var borderColour    = get_style(this.box, "borderTopColor", "border-top-color");
      var borderColourB   = get_style(this.box, "borderBottomColor", "border-bottom-color");
      var borderColourL   = get_style(this.box, "borderLeftColor", "border-left-color");
      var borderColourR   = get_style(this.box, "borderRightColor", "border-right-color");
      var boxColour       = get_style(this.box, "backgroundColor", "background-color");
      var backgroundImage = get_style(this.box, "backgroundImage", "background-image");
      var backgroundRepeat= get_style(this.box, "backgroundRepeat", "background-repeat");
      var backgroundPosX  = get_style(this.box, "backgroundPositionX", "background-position-x");
      var backgroundPosY  = get_style(this.box, "backgroundPositionY", "background-position-y");
      var boxPosition     = get_style(this.box, "position", "position");
      var boxPadding      = get_style(this.box, "paddingTop", "padding-top");
      var topPadding      = get_style(this.box, "paddingTop", "padding-top");
      var bottomPadding   = get_style(this.box, "paddingBottom", "padding-Bottom");
      var topPaddingP     = get_style(this.box.parentNode, "paddingTop", "padding-top");
      var bottomPaddingP  = get_style(this.box.parentNode, "paddingBottom", "padding-Bottom");
      var leftPadding     = get_style(this.box, "paddingLeft", "padding-Left");
      var rightPadding    = get_style(this.box, "paddingRight", "padding-Right");
      var border          = get_style(this.box, "border", "border");
      var topMargin       = get_style(this.box, "marginTop","margin-top");
      var bottomMargin    = get_style(this.box, "marginBottom","margin-bottom");

      var topMaxRadius    = Math.max(this.settings.tl ? this.settings.tl.radius : 0, this.settings.tr ? this.settings.tr.radius : 0);
      var botMaxRadius    = Math.max(this.settings.bl ? this.settings.bl.radius : 0, this.settings.br ? this.settings.br.radius : 0);

      // Set formatting properties
      this.boxHeightP      = parseInt(((boxHeightP != "" && boxHeightP != "auto" && boxHeightP.indexOf("%") == -1)? boxHeightP.substring(0, boxHeightP.indexOf("px")) : this.box.parentNode.offsetHeight));
      this.boxHeight       = parseInt(((boxHeight != "" && boxHeight != "auto" && boxHeight.indexOf("%") == -1)? boxHeight.substring(0, boxHeight.indexOf("px")) : this.box.offsetHeight));

      if (!isIE) {
      this.boxWidth        = parseInt(((boxWidth != "" && boxWidth != "auto" && boxWidth.indexOf("%") == -1)? boxWidth.substring(0, boxWidth.indexOf("px")) : this.box.offsetWidth));} else {
      this.boxWidth        = boxWidth;}
      this.borderWidth     = parseInt(((borderWidth != "" && borderWidth.indexOf("px") !== -1)? borderWidth.slice(0, borderWidth.indexOf("px")) : 0));
      this.borderWidthB    = parseInt(((borderWidthB != "" && borderWidthB.indexOf("px") !== -1)? borderWidthB.slice(0, borderWidthB.indexOf("px")) : 0));
      this.borderWidthP    = parseInt(((borderWidthP != "" && borderWidthP.indexOf("px") !== -1)? borderWidthP.slice(0, borderWidthP.indexOf("px")) : 0));
      this.borderWidthBP   = parseInt(((borderWidthBP != "" && borderWidthBP.indexOf("px") !== -1)? borderWidthBP.slice(0, borderWidthBP.indexOf("px")) : 0));
      this.borderWidthL    = parseInt(((borderWidthL != "" && borderWidthL.indexOf("px") !== -1)? borderWidthL.slice(0, borderWidthL.indexOf("px")) : 0));
      this.borderWidthR    = parseInt(((borderWidthR != "" && borderWidthR.indexOf("px") !== -1)? borderWidthR.slice(0, borderWidthR.indexOf("px")) : 0));
      this.boxColour       = format_colour(boxColour);
      this.boxColourO      = boxColour;
      this.boxPadding      = parseInt(((boxPadding != "" && boxPadding.indexOf("px") !== -1)? boxPadding.slice(0, boxPadding.indexOf("px")) : 0));
      this.topPadding      = parseInt(((topPadding != "" && topPadding.indexOf("px") !== -1)? topPadding.slice(0, topPadding.indexOf("px")) : 0));
      this.bottomPadding   = parseInt(((bottomPadding != "" && bottomPadding.indexOf("px") !== -1)? bottomPadding.slice(0, bottomPadding.indexOf("px")) : 0));
      this.topPaddingP     = parseInt(((topPaddingP != "" && topPaddingP.indexOf("px") !== -1)? topPaddingP.slice(0, topPaddingP.indexOf("px")) : 0));
      this.bottomPaddingP  = parseInt(((bottomPaddingP != "" && bottomPaddingP.indexOf("px") !== -1)? bottomPaddingP.slice(0, bottomPaddingP.indexOf("px")) : 0));
      this.leftPadding     = parseInt(((leftPadding != "" && leftPadding.indexOf("px") !== -1)? leftPadding.slice(0, leftPadding.indexOf("px")) : 0));
      this.rightPadding    = parseInt(((rightPadding != "" && rightPadding.indexOf("px") !== -1)? rightPadding.slice(0, rightPadding.indexOf("px")) : 0));
      this.borderColour    = format_colour(borderColour);
      this.borderColourB   = format_colour(borderColourB);
      this.borderColourL   = format_colour(borderColourL);
      this.borderColourR   = format_colour(borderColourR);
      this.borderString    = this.borderWidth + "px" + " solid " + this.borderColour;
      this.borderStringB   = this.borderWidthB + "px" + " solid " + this.borderColourB;
      this.backgroundImage = ((backgroundImage != "none")? backgroundImage : "");
      this.backgroundRepeat= backgroundRepeat;
      this.backgroundPosX  = parseInt(((backgroundPosX != "" && backgroundPosX.indexOf("px") !== -1)? backgroundPosX.slice(0, backgroundPosX.indexOf("px")) : 0));
      this.backgroundPosY  = parseInt(((backgroundPosY != "" && backgroundPosY.indexOf("px") !== -1)? backgroundPosY.slice(0, backgroundPosY.indexOf("px")) : 0));


      this.boxContent      = this.box.innerHTML;

      this.topMargin       = parseInt(((topMargin != "" && topMargin.indexOf("px") !== -1)? topMargin.slice(0,topMargin.indexOf("px")) : 0));
      this.bottomMargin    = parseInt(((bottomMargin != "" && bottomMargin.indexOf("px") !== -1)? bottomMargin.slice(0,bottomMargin.indexOf("px")) : 0));


      this.box.innerHTML = "";


      if(boxPosition != "absolute") this.box.style.position = "relative";
       this.box.style.top     = '0';
       this.box.style.left    = '0';
       this.box.style.padding = '0';
       this.box.style.border  = 'none';
       this.box.style.backgroundColor    = 'transparent';
       this.box.style.backgroundImage    = 'none';



      if(isIE)
       {if(BackCompat)
        {
          this.box.style.width   = parseInt(this.boxWidth )+'px';
          this.box.style.height  = parseInt(this.boxHeight)+'px';
        } else {
          this.box.style.width   = parseInt(this.boxWidth)+'px'; // - this.borderWidthL - this.borderWidthR
          this.box.style.height  = parseInt(this.boxHeight)+'px';
        }
       } else {
        this.box.style.width   = parseInt(this.boxWidth + this.leftPadding + this.rightPadding  + this.borderWidthL + this.borderWidthR )+'px';
        this.box.style.height  = parseInt(this.boxHeight + this.topPadding + this.bottomPadding + this.borderWidth + this.borderWidthB  )+'px';
       }




      // Ok we add an inner div to actually put things into this will allow us to keep the height

      if(isIE)
       {if(BackCompat)
        {
          var newMainContainer = document.createElement("DIV");
          newMainContainer.style.width    = parseInt(this.boxWidth)+'px';
          newMainContainer.style.height   = parseInt(this.boxHeight - topMaxRadius - botMaxRadius)+'px';
        } else {
          var newMainContainer = document.createElement("DIV");
          newMainContainer.style.width    = parseInt(this.boxWidth - this.borderWidthL - this.borderWidthR )+'px';
          var temp=this.boxHeight - topMaxRadius - botMaxRadius;
          if (temp<0) temp=0;
          newMainContainer.style.height   = parseInt(temp)+'px';
        }
       } else {
        var newMainContainer = document.createElement("DIV");
        newMainContainer.style.width    = parseInt(this.boxWidth+this.leftPadding+this.rightPadding)+'px';
        newMainContainer.style.height   = parseInt(this.boxHeight + this.topPadding + this.bottomPadding + this.borderWidth + this.borderWidthB - topMaxRadius - botMaxRadius )+'px';
       }
       newMainContainer.style.position = "relative";
       newMainContainer.style.padding  = "0";
       newMainContainer.style.top    = parseInt(topMaxRadius - this.borderWidth ) + "px";
       newMainContainer.style.left   = "0";
       newMainContainer.style.border = parseInt(this.borderWidthL) + "px solid " + this.borderColourL;
       newMainContainer.style.borderTopColor  = 'transparent';
       newMainContainer.style.borderBottomColor  = 'transparent';
       newMainContainer.style.backgroundColor    = this.boxColourO;
       newMainContainer.style.backgroundImage    = this.backgroundImage;
       newMainContainer.setAttribute("id","ccshell");
       this.shell = this.box.appendChild(newMainContainer);
       this.box.setAttribute("id","ccoriginaldiv");





      var boxWidth         = get_style(this.shell, "width", "width");
      this.boxWidth        = parseInt(((boxWidth != "" && boxWidth != "auto" && boxWidth.indexOf("%") == -1)? boxWidth.substring(0, boxWidth.indexOf("px")) : this.shell.offsetWidth));



      /*
      This method creates the corners and
      applies them to the div element.
      */
      this.applyCorners = function()
      {
          /*
          Create top and bottom containers.
          These will be used as a parent for the corners and bars.
          */
          for(var t = 0; t < 2; t++)
          {
              switch(t)
              {
                  // Top
                  case 0:

                      // Only build top bar if a top corner is to be draw
                      if(this.settings.tl || this.settings.tr)
                      {
                          var newMainContainer = document.createElement("DIV");
                          if(isIE) {
                           newMainContainer.style.width    = parseInt( this.boxWidth ) + "px";} else {
                           newMainContainer.style.width    = parseInt( this.boxWidth ) + "px";}
                          newMainContainer.style.fontSize = "1px";
                          newMainContainer.style.overflow = "hidden";
                          newMainContainer.style.position = "absolute";
                          newMainContainer.style.paddingLeft  = this.borderWidth + "px";
                          newMainContainer.style.paddingRight = this.borderWidth + "px";
                          newMainContainer.style.height = topMaxRadius + "px";
                          newMainContainer.style.top    = parseInt(0 - topMaxRadius ) + "px";
                          newMainContainer.style.left   = 0 - this.borderWidthL + "px";

                          newMainContainer.setAttribute("id","cctopcontainer");

                          this.topContainer = this.shell.appendChild(newMainContainer);
                      }
                      break;

                  // Bottom
                  case 1:

                      // Only build bottom bar if a bottom corner is to be draw
                      if(this.settings.bl || this.settings.br)
                      {
                          var newMainContainer = document.createElement("DIV");
                          if(isIE) {
                           newMainContainer.style.width    = parseInt( this.boxWidth ) + "px"; } else {
                           newMainContainer.style.width    = parseInt( this.boxWidth ) + "px"; }
                          newMainContainer.style.fontSize = "1px";
                          newMainContainer.style.overflow = "hidden";
                          newMainContainer.style.position = "absolute";
                          newMainContainer.style.paddingLeft  = this.borderWidthB + "px";
                          newMainContainer.style.paddingRight = this.borderWidthB + "px";
                          newMainContainer.style.height  =  parseInt(botMaxRadius) + "px";
                          newMainContainer.style.bottom  =  parseInt( 0 - botMaxRadius ) + "px";
                          newMainContainer.style.left   = parseInt( 0 - this.borderWidthL ) + "px";

                          newMainContainer.setAttribute("id","ccbottomcontainer");

                          this.bottomContainer = this.shell.appendChild(newMainContainer);



                      }
                      break;
              }
          }






          // Create array of available corners
          var corners = ["tr", "tl", "br", "bl"];

          /*
          Loop for each corner
          */
          for(var i in corners)
          {
              if(i > -1 < 4)
              {
                  // Get current corner type from array
                  var cc = corners[i];
                  // Has the user requested the currentCorner be round?
                  // Code to apply correct color to top or bottom
                  if(cc == "tr" || cc == "tl")
                  {
                   var bwidth=this.borderWidth;
                   var bcolor=this.borderColour;
                  } else {
                   var bwidth=this.borderWidthB;
                   var bcolor=this.borderColourB;
                  }
                  // Yes, we need to create a new corner
                  var newCorner = document.createElement("DIV");
                  newCorner.style.height = this.settings[cc].radius + "px";
                  newCorner.style.width  = this.settings[cc].radius + "px";
                  newCorner.style.position = "absolute";
                  newCorner.style.fontSize = "1px";
                  newCorner.style.overflow = "hidden";
                  // THE FOLLOWING BLOCK OF CODE CREATES A ROUNDED CORNER
                  // ---------------------------------------------------- TOP
                  // Get border radius
                  var borderRadius = parseInt(this.settings[cc].radius - this.borderWidth);
                  // Cycle the x-axis
                  for(var intx = 0, j = this.settings[cc].radius; intx < j; intx++)
                  {
                      // Calculate the value of y1 which identifies the pixels inside the border
                      if((intx +1) >= borderRadius)
                        var y1 = -1;
                      else
                        var y1 = (Math.floor(Math.sqrt(Math.pow(borderRadius, 2) - Math.pow((intx+1), 2))) - 1);
                      // Only calculate y2 and y3 if there is a border defined
                      if(borderRadius != j)
                      {
                          if((intx) >= borderRadius)
                            var y2 = -1;
                          else
                            var y2 = Math.ceil(Math.sqrt(Math.pow(borderRadius,2) - Math.pow(intx, 2)));
                           if((intx+1) >= j)
                            var y3 = -1;
                           else
                            var y3 = (Math.floor(Math.sqrt(Math.pow(j ,2) - Math.pow((intx+1), 2))) - 1);
                      }
                      // Calculate y4
                      if((intx) >= j)
                        var y4 = -1;
                      else
                        var y4 = Math.ceil(Math.sqrt(Math.pow(j ,2) - Math.pow(intx, 2)));
                      // Draw bar on inside of the border with foreground colour
                      if(y1 > -1) this.drawPixel(intx, 0, this.boxColour, 100, (y1+1), newCorner, -1, this.settings[cc].radius);
                      // Only draw border/foreground antialiased pixels and border if there is a border defined
                      if(borderRadius != j)
                      {
                          // Cycle the y-axis
                          for(var inty = (y1 + 1); inty < y2; inty++)
                          {
                              // Draw anti-alias pixels
                              if(this.settings.antiAlias)
                              {
                                  // For each of the pixels that need anti aliasing between the foreground and border colour draw single pixel divs
                                  if(this.backgroundImage != "")
                                  {
                                      var borderFract = (pixelFraction(intx, inty, borderRadius) * 100);
                                      if(borderFract < 30)
                                      {
                              this.drawPixel(intx, inty, bcolor, 100, 1, newCorner, 0, this.settings[cc].radius);
                                      }
                           else
                                      {
                                          this.drawPixel(intx, inty, bcolor, 100, 1, newCorner, -1, this.settings[cc].radius);

                                      }
                                  }
                                  else
                                  {
                                      var pixelcolour = BlendColour(this.boxColour, bcolor, pixelFraction(intx, inty, borderRadius));
                                      this.drawPixel(intx, inty, pixelcolour, 100, 1, newCorner, 0, this.settings[cc].radius, cc);
                                  }
                              }
                          }
                          // Draw bar for the border
                          if(this.settings.antiAlias)
                          {
                              if(y3 >= y2)
                              {
                                 if (y2 == -1) y2 = 0;
                                 this.drawPixel(intx, y2, bcolor, 100, (y3 - y2 + 1), newCorner, 0, 0);
                              }
                          }
                          else
                          {
                              if(y3 >= y1)
                              {
                                  this.drawPixel(intx, (y1 + 1), bcolor, 100, (y3 - y1), newCorner, 0, 0);
                              }
                          }
                          // Set the colour for the outside curve
                          var outsideColour = bcolor;
                      }
                      else
                      {
                          // Set the colour for the outside curve
                          var outsideColour = this.boxColour;
                          var y3 = y1;
                      }
                      // Draw aa pixels?
                      if(this.settings.antiAlias)
                      {
                          // Cycle the y-axis and draw the anti aliased pixels on the outside of the curve
                          for(var inty = (y3 + 1); inty < y4; inty++)
                          {
                              // For each of the pixels that need anti aliasing between the foreground/border colour & background draw single pixel divs
                              this.drawPixel(intx, inty, outsideColour, (pixelFraction(intx, inty , j) * 100), 1, newCorner, ((this.borderWidth > 0)? 0 : -1), this.settings[cc].radius);
                          }
                      }
                  }
                  // END OF CORNER CREATION
                  // ---------------------------------------------------- END
                  // We now need to store the current corner in the masterConers array
                  this.masterCorners[this.settings[cc].radius] = newCorner.cloneNode(true);





                  /*
                  Now we have a new corner we need to reposition all the pixels unless
                  the current corner is the bottom right.
                  */
                  // Loop through all children (pixel bars)
                  for(var t = 0, k = newCorner.childNodes.length; t < k; t++)
                  {
                      // Get current pixel bar
                      var pixelBar = newCorner.childNodes[t];
                      // Get current top and left properties
                      var pixelBarTop    = parseInt(pixelBar.style.top.substring(0, pixelBar.style.top.indexOf("px")));
                      var pixelBarLeft   = parseInt(pixelBar.style.left.substring(0, pixelBar.style.left.indexOf("px")));
                      var pixelBarHeight = parseInt(pixelBar.style.height.substring(0, pixelBar.style.height.indexOf("px")));
                      // Reposition pixels
                      if(cc == "tl" || cc == "bl"){
                          pixelBar.style.left = this.settings[cc].radius -pixelBarLeft -1 + "px"; // Left
                      }
                      if(cc == "tr" || cc == "tl"){
                          pixelBar.style.top =  this.settings[cc].radius -pixelBarHeight -pixelBarTop + "px"; // Top
                      }
                      pixelBar.style.backgroundRepeat = this.backgroundRepeat;

                      switch(cc)
                      {
                          case "tr":
                              if (isIE && BackCompat)
                               {
                                pixelBar.style.backgroundPosition  = parseInt( this.backgroundPosX - Math.abs( 0 - this.borderWidthL + this.boxWidth - this.settings[cc].radius + pixelBarLeft)) + "px " + parseInt( this.backgroundPosY - Math.abs(this.settings[cc].radius -pixelBarHeight -pixelBarTop - this.borderWidth)) + "px";
                               } else {
                                pixelBar.style.backgroundPosition  = parseInt( this.backgroundPosX - Math.abs( this.borderWidthR - this.borderWidthL + (this.boxWidth - this.settings[cc].radius + this.borderWidthR) + pixelBarLeft)) + "px " + parseInt( this.backgroundPosY - Math.abs(this.settings[cc].radius -pixelBarHeight -pixelBarTop - this.borderWidth)) + "px";
                               }
                              break;
                          case "tl":
                              pixelBar.style.backgroundPosition = parseInt( this.backgroundPosX - Math.abs((this.settings[cc].radius -pixelBarLeft -1)  - this.borderWidthL)) + "px " + parseInt( this.backgroundPosY - Math.abs(this.settings[cc].radius -pixelBarHeight -pixelBarTop - this.borderWidth)) + "px";
                              break;
                          case "bl":
                               if (isIE)
                                {
                                  pixelBar.style.backgroundPosition = parseInt( this.backgroundPosX - Math.abs((this.settings[cc].radius -pixelBarLeft -1) - this.borderWidthL )) + "px " + parseInt( this.backgroundPosY - Math.abs(( this.boxHeight + (this.borderWidth-this.topPadding-1) - this.settings[cc].radius + pixelBarTop))) + "px";
                                } else {
                                  pixelBar.style.backgroundPosition = parseInt( this.backgroundPosX - Math.abs((this.settings[cc].radius -pixelBarLeft -1) - this.borderWidthL )) + "px " + parseInt( this.backgroundPosY - Math.abs(( this.boxHeight + (this.borderWidth+this.topPadding+this.bottomPadding) - this.settings[cc].radius + pixelBarTop))) + "px";
                                }
                              break;
                          case "br":
                               if (isIE)
                                {
                                  pixelBar.style.backgroundPosition = parseInt( this.backgroundPosX - Math.abs( 1 + this.leftPadding - this.borderWidthL + this.boxWidth - this.settings[cc].radius + pixelBarLeft)) + "px " + parseInt( this.backgroundPosY - Math.abs(( this.boxHeight + (this.borderWidth-this.topPadding-1) - this.settings[cc].radius + pixelBarTop))) + "px";
                                } else {
                                  pixelBar.style.backgroundPosition = parseInt( this.backgroundPosX - Math.abs( this.borderWidthR - this.borderWidthL + (this.boxWidth - this.settings[cc].radius + this.borderWidthR) + pixelBarLeft)) + "px " + parseInt( this.backgroundPosY - Math.abs(( this.boxHeight + (this.borderWidth+this.topPadding+this.bottomPadding) - this.settings[cc].radius + pixelBarTop))) + "px";
                                }
                              break;
                      }
                  }












                  // Position the container
                  switch(cc)
                  {


                      case "tl":
                        if(newCorner.style.position == "absolute") newCorner.style.top  = "0px";
                        if(newCorner.style.position == "absolute") newCorner.style.left = "0px";
                        if(this.topContainer) temp=this.topContainer.appendChild(newCorner);
temp.setAttribute("id","cctl");


                        break;
                      case "tr":
                        if(newCorner.style.position == "absolute") newCorner.style.top  = "0px";
                        if(newCorner.style.position == "absolute") newCorner.style.right = "0px";
                        if(this.topContainer) temp=this.topContainer.appendChild(newCorner);
temp.setAttribute("id","cctr");

                        break;
                      case "bl":
                        if(newCorner.style.position == "absolute") newCorner.style.bottom  = "0px";
                        if(newCorner.style.position == "absolute") newCorner.style.left = "0px";
                        if(this.bottomContainer) temp=this.bottomContainer.appendChild(newCorner);
temp.setAttribute("id","ccbl");

                        break;
                      case "br":
                        if(newCorner.style.position == "absolute") newCorner.style.bottom   = "0px";
                        if(newCorner.style.position == "absolute") newCorner.style.right = "0px";
                        if(this.bottomContainer) temp=this.bottomContainer.appendChild(newCorner);
temp.setAttribute("id","ccbr");

                        break;
                  }














              }
          }









          /*
          The last thing to do is draw the rest of the filler DIVs.
          We only need to create a filler DIVs when two corners have
          diffrent radiuses in either the top or bottom container.
          */

          // Find out which corner has the bigger radius and get the difference amount
          var radiusDiff = new Array();
          radiusDiff["t"] = Math.abs(this.settings.tl.radius - this.settings.tr.radius)
          radiusDiff["b"] = Math.abs(this.settings.bl.radius - this.settings.br.radius);

          for(z in radiusDiff)
          {
              // FIX for prototype lib
              if(z == "t" || z == "b")
              {
                  if(radiusDiff[z])
                  {
                      // Get the type of corner that is the smaller one
                      var smallerCornerType = ((this.settings[z + "l"].radius < this.settings[z + "r"].radius)? z +"l" : z +"r");

                      // First we need to create a DIV for the space under the smaller corner
                      var newFiller = document.createElement("DIV");
                      newFiller.style.height = radiusDiff[z] + "px";
                      newFiller.style.width  =  this.settings[smallerCornerType].radius+ "px"
                      newFiller.style.position = "absolute";
                      newFiller.style.fontSize = "1px";
                      newFiller.style.overflow = "hidden";
                      newFiller.style.backgroundColor = this.boxColour;
                      //newFiller.style.backgroundColor = get_random_color();

                      // Position filler
                      switch(smallerCornerType)
                      {
                          case "tl":
                              newFiller.style.bottom = "0px";
                              newFiller.style.left   = "0px";
                              newFiller.style.borderLeft = this.borderString;
                              temp=this.topContainer.appendChild(newFiller);
temp.id="cctlfiller";

                              break;

                          case "tr":
                              newFiller.style.bottom = "0px";
                              newFiller.style.right  = "0px";
                              newFiller.style.borderRight = this.borderString;
                              temp=this.topContainer.appendChild(newFiller);
temp.id="cctrfiller";

                              break;

                          case "bl":
                              newFiller.style.top    = "0px";
                              newFiller.style.left   = "0px";
                              newFiller.style.borderLeft = this.borderStringB;
                              temp=this.bottomContainer.appendChild(newFiller);
temp.id="ccblfiller";

                              break;

                          case "br":
                              newFiller.style.top    = "0px";
                              newFiller.style.right  = "0px";
                              newFiller.style.borderRight = this.borderStringB;
                              temp=this.bottomContainer.appendChild(newFiller);
temp.id="ccbrfiller";

                              break;
                      }
                  }














                  // Create the bar to fill the gap between each corner horizontally
                  var newFillerBar = document.createElement("DIV");
                  newFillerBar.style.position = "relative";
                  newFillerBar.style.fontSize = "1px";
                  newFillerBar.style.overflow = "hidden";
                  newFillerBar.style.backgroundColor = this.boxColour;
                  newFillerBar.style.backgroundImage = this.backgroundImage;
                  newFillerBar.style.backgroundRepeat= this.backgroundRepeat;


                  switch(z)
                  {
                      case "t":
                          // Top Bar
                          if(this.topContainer)
                          {
                              // Edit by Asger Hallas: Check if settings.xx.radius is not false
                              if(this.settings.tl.radius && this.settings.tr.radius)
                              {
                                  if (BackCompat)
                                   {newFillerBar.style.height      = 100 + topMaxRadius + "px";} else
                                   {newFillerBar.style.height      = 100 + topMaxRadius - this.borderWidth + "px";}
                                  newFillerBar.style.marginLeft  = this.settings.tl.radius - this.borderWidthL + "px";
                                  newFillerBar.style.marginRight = this.settings.tr.radius - this.borderWidthR + "px";
                                  newFillerBar.style.borderTop   = this.borderString;
                                  if(this.backgroundImage != "")
                                    newFillerBar.style.backgroundPosition  = parseInt( this.backgroundPosX - (topMaxRadius - this.borderWidthL)) + "px " + parseInt( this.backgroundPosY ) + "px";
                                  temp=this.topContainer.appendChild(newFillerBar);
temp.setAttribute("id","cctopmiddlefiller");

                                  // Repos the boxes background image
                                  this.shell.style.backgroundPosition      = parseInt( this.backgroundPosX ) + "px " + parseInt( this.backgroundPosY - (topMaxRadius - this.borderWidthL)) + "px";
                              }
                          }
                          break;
                      case "b":
                          if(this.bottomContainer)
                          {
                              // Edit by Asger Hallas: Check if settings.xx.radius is not false
                              if(this.settings.bl.radius && this.settings.br.radius)
                              {
                                  // Bottom Bar
                                  if (BackCompat && isIE)
                                   {newFillerBar.style.height     = botMaxRadius + "px";} else
                                   {newFillerBar.style.height     = botMaxRadius - this.borderWidth + "px";}
                                  newFillerBar.style.marginLeft   = this.settings.bl.radius - this.borderWidth + "px";
                                  newFillerBar.style.marginRight  = this.settings.br.radius - this.borderWidth + "px";
                                  newFillerBar.style.borderBottom = this.borderStringB;
                                  if(isIE)
                                  { if(BackCompat)
                                      { if(this.backgroundImage != "")
                                        newFillerBar.style.backgroundPosition  = parseInt( this.backgroundPosX - (botMaxRadius  - this.borderWidthL )) + "px " + parseInt( this.backgroundPosY - (this.boxHeight + this.borderWidth - botMaxRadius )) + "px";
                                      } else
                                      { if(this.backgroundImage != "")
                                      newFillerBar.style.backgroundPosition  = parseInt( this.backgroundPosX - (botMaxRadius  - this.borderWidthL )) + "px " + parseInt( ( 1 + this.topPadding ) + this.backgroundPosY - (this.boxHeight + this.borderWidth - botMaxRadius )) + "px";

                                      }
                                  } else
                                  { if(this.backgroundImage != "")
                                    newFillerBar.style.backgroundPosition  = parseInt( this.backgroundPosX - (botMaxRadius  - this.borderWidthL )) + "px " + parseInt( this.backgroundPosY - (this.boxHeight + this.topPadding + this.borderWidth + this.bottomPadding - botMaxRadius )) + "px";
                                  }
                                  temp=this.bottomContainer.appendChild(newFillerBar);
temp.setAttribute("id","ccbottommiddlefiller");

                              }
                          }
                          break;
                  }
              }
          }


          // Create content container
          var contentContainer = document.createElement("DIV");
          if(isIE) { var pd = 0 ; } else { var pd = 0;}
          // Set contentContainer's properties
          contentContainer.style.position = "absolute";
// contentContainer.style.border = "1px dotted red";
//      contentContainer.style.width = parseInt(this.boxWidth-180) + "px";
          contentContainer.innerHTML      = this.boxContent;
          contentContainer.className      = "autoPadDiv";
          // Get padding amounts
          var topPadding = Math.abs( this.borderWidth  + this.boxPadding);
          var botPadding = Math.abs( this.borderWidthB + this.boxPadding);
          // Apply top padding
          if(topMaxRadius < this.boxPadding)
            {contentContainer.style.paddingTop = parseInt( pd + topPadding) + "px";} else
            {contentContainer.style.paddingTop = "0";
             contentContainer.style.top = parseInt( pd + topPadding)+"px";}
          // Apply Bottom padding
          if(botMaxRadius < this.boxPadding)
            {contentContainer.style.paddingBottom = parseInt(botPadding - botMaxRadius) + "px";} else
            {contentContainer.style.paddingBottom = "0";}
          // Apply left and right padding
          contentContainer.style.paddingLeft = parseInt( this.borderWidthL + this.leftPadding) + "px";
          contentContainer.style.paddingRight = this.rightPadding + "px";
          // Append contentContainer
          this.contentDIV = this.box.appendChild(contentContainer);
      }
















































      /*
      This function draws the pixels
      */
      this.drawPixel = function(intx, inty, colour, transAmount, height, newCorner, image, cornerRadius)
      {
          // Create pixel
          var pixel = document.createElement("DIV");
          pixel.style.height   = height + "px";
          pixel.style.width    = "1px";
          pixel.style.position = "absolute";
          pixel.style.fontSize = "1px";
          pixel.style.overflow = "hidden";
          // Max Top Radius
          var topMaxRadius = Math.max(this.settings["tr"].radius, this.settings["tl"].radius);
          // Dont apply background image to border pixels
          if(image == -1 && this.backgroundImage != "")
          {
            pixel.style.backgroundColor = colour;
            pixel.style.backgroundImage = this.backgroundImage;
            pixel.style.backgroundPosition  = "-" + (this.boxWidth - (cornerRadius - intx) + this.borderWidth) + "px -" + ((this.boxHeight + topMaxRadius + inty) -this.borderWidth) + "px";
          }
          else
          {
            pixel.style.backgroundColor = colour;
          }
          // Set opacity if the transparency is anything other than 100
          if (transAmount != 100)
            setOpacity(pixel, transAmount);
          // Set the pixels position
          pixel.style.top = inty + "px";
          pixel.style.left = intx + "px";
          newCorner.appendChild(pixel);
      }
  }





















  // ------------- UTILITY FUNCTIONS

  // Inserts a element after another
  function insertAfter(parent, node, referenceNode)
  {
      parent.insertBefore(node, referenceNode.nextSibling);
  }

  /*
  Blends the two colours by the fraction
  returns the resulting colour as a string in the format "#FFFFFF"
  */
  function BlendColour(Col1, Col2, Col1Fraction)
  {
      var red1 = parseInt(Col1.substr(1,2),16);
      var green1 = parseInt(Col1.substr(3,2),16);
      var blue1 = parseInt(Col1.substr(5,2),16);
      var red2 = parseInt(Col2.substr(1,2),16);
      var green2 = parseInt(Col2.substr(3,2),16);
      var blue2 = parseInt(Col2.substr(5,2),16);

      if(Col1Fraction > 1 || Col1Fraction < 0) Col1Fraction = 1;

      var endRed = Math.round((red1 * Col1Fraction) + (red2 * (1 - Col1Fraction)));
      if(endRed > 255) endRed = 255;
      if(endRed < 0) endRed = 0;

      var endGreen = Math.round((green1 * Col1Fraction) + (green2 * (1 - Col1Fraction)));
      if(endGreen > 255) endGreen = 255;
      if(endGreen < 0) endGreen = 0;

      var endBlue = Math.round((blue1 * Col1Fraction) + (blue2 * (1 - Col1Fraction)));
      if(endBlue > 255) endBlue = 255;
      if(endBlue < 0) endBlue = 0;

      return "#" + IntToHex(endRed)+ IntToHex(endGreen)+ IntToHex(endBlue);
  }

  /*
  Converts a number to hexadecimal format
  */
  function IntToHex(strNum)
  {
      rem = strNum % 16;
//    next two line are commented out and replaced with the third to support Google's Chrome.
//    base = strNum / 16;
//    base = base - (rem / 16);
      base = Math.floor(strNum / 16);

      baseS = MakeHex(base);
      remS = MakeHex(rem);

      return baseS + '' + remS;
  }


  /*
  gets the hex bits of a number
  */
  function MakeHex(x)
  {
      if((x >= 0) && (x <= 9))
      {
          return x;
      }
      else
      {
          switch(x)
          {
              case 10: return "A";
              case 11: return "B";
              case 12: return "C";
              case 13: return "D";
              case 14: return "E";
              case 15: return "F";
          }
      }
  }


  /*
  For a pixel cut by the line determines the fraction of the pixel on the 'inside' of the
  line.  Returns a number between 0 and 1
  */
  function pixelFraction(x, y, r)
  {
      var pixelfraction = 0;

      /*
      determine the co-ordinates of the two points on the perimeter of the pixel that the
      circle crosses
      */
      var xvalues = new Array(1);
      var yvalues = new Array(1);
      var point = 0;
      var whatsides = "";

      // x + 0 = Left
      var intersect = Math.sqrt((Math.pow(r,2) - Math.pow(x,2)));

      if ((intersect >= y) && (intersect < (y+1)))
      {
          whatsides = "Left";
          xvalues[point] = 0;
          yvalues[point] = intersect - y;
          point =  point + 1;
      }
      // y + 1 = Top
      var intersect = Math.sqrt((Math.pow(r,2) - Math.pow(y+1,2)));

      if ((intersect >= x) && (intersect < (x+1)))
      {
          whatsides = whatsides + "Top";
          xvalues[point] = intersect - x;
          yvalues[point] = 1;
          point = point + 1;
      }
      // x + 1 = Right
      var intersect = Math.sqrt((Math.pow(r,2) - Math.pow(x+1,2)));

      if ((intersect >= y) && (intersect < (y+1)))
      {
          whatsides = whatsides + "Right";
          xvalues[point] = 1;
          yvalues[point] = intersect - y;
          point =  point + 1;
      }
      // y + 0 = Bottom
      var intersect = Math.sqrt((Math.pow(r,2) - Math.pow(y,2)));

      if ((intersect >= x) && (intersect < (x+1)))
      {
          whatsides = whatsides + "Bottom";
          xvalues[point] = intersect - x;
          yvalues[point] = 0;
      }

      /*
      depending on which sides of the perimeter of the pixel the circle crosses calculate the
      fraction of the pixel inside the circle
      */
      switch (whatsides)
      {
              case "LeftRight":
              pixelfraction = Math.min(yvalues[0],yvalues[1]) + ((Math.max(yvalues[0],yvalues[1]) - Math.min(yvalues[0],yvalues[1]))/2);
              break;

              case "TopRight":
              pixelfraction = 1-(((1-xvalues[0])*(1-yvalues[1]))/2);
              break;

              case "TopBottom":
              pixelfraction = Math.min(xvalues[0],xvalues[1]) + ((Math.max(xvalues[0],xvalues[1]) - Math.min(xvalues[0],xvalues[1]))/2);
              break;

              case "LeftBottom":
              pixelfraction = (yvalues[0]*xvalues[1])/2;
              break;

              default:
              pixelfraction = 1;
      }

      return pixelfraction;
  }


  // This function converts CSS rgb(x, x, x) to hexadecimal
  function rgb2Hex(rgbColour)
  {
      try{

          // Get array of RGB values
          var rgbArray = rgb2Array(rgbColour);

          // Get RGB values
          var red   = parseInt(rgbArray[0]);
          var green = parseInt(rgbArray[1]);
          var blue  = parseInt(rgbArray[2]);

          // Build hex colour code
          var hexColour = "#" + IntToHex(red) + IntToHex(green) + IntToHex(blue);
      }
      catch(e){

          alert("There was an error converting the RGB value to Hexadecimal in function rgb2Hex");
      }

      return hexColour;
  }

  // Returns an array of rbg values
  function rgb2Array(rgbColour)
  {
      // Remove rgb()
      var rgbValues = rgbColour.substring(4, rgbColour.indexOf(")"));

      // Split RGB into array
      var rgbArray = rgbValues.split(", ");

      return rgbArray;
  }

  /*
  Function by Simon Willison from sitepoint.com
  Modified by Cameron Cooke adding Safari's rgba support
  */
  function setOpacity(obj, opacity)
  {
      opacity = (opacity == 100)?99.999:opacity;

      if(isSafari && obj.tagName != "IFRAME")
      {
          // Get array of RGB values
          var rgbArray = rgb2Array(obj.style.backgroundColor);

          // Get RGB values
          var red   = parseInt(rgbArray[0]);
          var green = parseInt(rgbArray[1]);
          var blue  = parseInt(rgbArray[2]);

          // Safari using RGBA support
          obj.style.backgroundColor = "rgba(" + red + ", " + green + ", " + blue + ", " + opacity/100 + ")";
      }
      else if(typeof(obj.style.opacity) != "undefined")
      {
          // W3C
          obj.style.opacity = opacity/100;
      }
      else if(typeof(obj.style.MozOpacity) != "undefined")
      {
          // Older Mozilla
          obj.style.MozOpacity = opacity/100;
      }
      else if(typeof(obj.style.filter) != "undefined")
      {
          // IE
          obj.style.filter = "alpha(opacity:" + opacity + ")";
      }
      else if(typeof(obj.style.KHTMLOpacity) != "undefined")
      {
          // Older KHTML Based Browsers
          obj.style.KHTMLOpacity = opacity/100;
      }
  }

  /*
  Returns index if the passed value is found in the
  array otherwise returns false.
  */
  function inArray(array, value)
  {
      for(var i = 0; i < array.length; i++){

          // Matches identical (===), not just similar (==).
          if (array[i] === value) return i;
      }

      return false;
  }

  /*
  Returns true if the passed value is found as a key
  in the array otherwise returns false.
  */
  function inArrayKey(array, value)
  {
      for(key in array){

          // Matches identical (===), not just similar (==).
          if(key === value) return true;
      }

      return false;
  }

  // Cross browser add event wrapper
  function addEvent(elm, evType, fn, useCapture) {
   if (elm.addEventListener) {
    elm.addEventListener(evType, fn, useCapture);
    return true;
   }
   else if (elm.attachEvent) {
    var r = elm.attachEvent('on' + evType, fn);
    return r;
   }
   else {
    elm['on' + evType] = fn;
   }
  }

  // Cross browser remove event wrapper
  function removeEvent(obj, evType, fn, useCapture){
    if (obj.removeEventListener){
      obj.removeEventListener(evType, fn, useCapture);
      return true;
    } else if (obj.detachEvent){
      var r = obj.detachEvent("on"+evType, fn);
      return r;
    } else {
      alert("Handler could not be removed");
    }
  }

  // Formats colours
  function format_colour(colour)
  {
      var returnColour = "#ffffff";

      // Make sure colour is set and not transparent
      if(colour != "" && colour != "transparent")
      {
          // RGB Value?
          if(colour.substr(0, 3) == "rgb")
          {
              // Get HEX aquiv.
              returnColour = rgb2Hex(colour);
          }
          else if(colour.length == 4)
          {
              // 3 chr colour code add remainder
              returnColour = "#" + colour.substring(1, 2) + colour.substring(1, 2) + colour.substring(2, 3) + colour.substring(2, 3) + colour.substring(3, 4) + colour.substring(3, 4);
          }
          else
          {
              // Normal valid hex colour
              returnColour = colour;
          }
      }

      return returnColour;
  }

  // Returns the style value for the property specfied
  function get_style(obj, property, propertyNS)
  {
      try
      {
          if(obj.currentStyle)
          {
              var returnVal = eval("obj.currentStyle." + property);
          }
          else
          {
              /*
              Safari does not expose any information for the object if display is
              set to none is set so we temporally enable it.
              */
              if(isSafari && obj.style.display == "none")
              {
                obj.style.display = "";
                var wasHidden = true;
              }

              var returnVal = document.defaultView.getComputedStyle(obj, '').getPropertyValue(propertyNS);

              // Rehide the object
              if(isSafari && wasHidden)
              {
                  obj.style.display = "none";
              }
          }
      }
      catch(e)
      {
          // Do nothing
      }

      return returnVal;
  }

  // Get elements by class by Dustin Diaz.
function getElementsByClass(searchClass,node,tag) {
 var classElements = new Array();
 if ( node == null )
  node = document;
 if ( tag == null )
  tag = '*';
 var els = node.getElementsByTagName(tag);
 var elsLen = els.length;
 var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
 for (i = 0, j = 0; i < elsLen; i++) {
  if ( pattern.test(els[i].className) ) {
   classElements[j] = els[i];
   j++;
  }
 }
 return classElements;
}






  // Displays error message
  function newCurvyError(errorMessage)
  {
      return new Error("curvyCorners Error:\n" + errorMessage)
  }