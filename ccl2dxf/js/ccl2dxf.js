var outputs = "";
var filenames = "";

function convert(formname) {
  if (document.forms[formname].coord.value == null || document.forms[formname].coord.value.length == 0) {
    document.forms[formname].status.value = "Incomplete data";
    return;
  }else{
    document.forms[formname].status.value = "Working";

    // check vertices, build coord list
    var x;
    var y;
    var pattern = /-?[0-9.]+/g;
    var s = document.forms[formname].coord.value;
    var data = "";
    var xMin = Number.MAX_VALUE;
    var xMax = Number.MIN_VALUE;
    var yMin = Number.MAX_VALUE;
    var yMax = Number.MIN_VALUE;

    while ((x = pattern.exec(s)) != null) {
      if ((y = pattern.exec(s)) != null) {
        data = data + x[0] + "\t" + y[0] + "\n";
        x = x*1;
        y = y*1;
        if (x < xMin) {
          xMin = x;
        }
        if (x > xMax) {
          xMax = x;
        }
        if (y < yMin) {
          yMin = y;
        }
        if (y > yMax) {
          yMax = y;
        }
      } else {
        document.forms[formname].status.value = "Incomplete data";
      }
    }

    // Output as specified
    outputs = "";
    filenames = "";
    var button = getCheckedRBValue(document.forms[formname].elements['filetype']);
    switch(button) {
    case 'html':
      outputs = ccl2html(data, xMin, yMin, xMax, yMax);
      filenames = 'data.html';
      break;
    case 'dxf':
      outputs = ccl2dxf(data, xMin, yMin, xMax, yMax);
      filenames = 'data.dxf';
      break;
    case 'svg':
      outputs = ccl2svg(data, xMin, yMin, xMax, yMax);
      filenames = 'data.svg';
      break;
    default:
      alert("error: button = " + button);
    } // switch
    document.forms[formname].status.value = "Complete";
    download(filenames, outputs);
  }
} // function

function download(filename, data) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function getCheckedRBValue(radioObj) {
  // Return the value of the radio button that is checked,
  // return an empty string if none are checked, or
  // there are no radio buttons. From http://www.somacon.com/p143.php
  // Ex. getCheckedRBValue(document.forms['formname'].elements['rbgroupname']);
  if(!radioObj)
    return "";
  var radioLength = radioObj.length;
  if(radioLength == undefined)
    if(radioObj.checked)
      return radioObj.value;
    else
      return "";
  for(var i = 0; i < radioLength; i++) {
    if(radioObj[i].checked) {
      return radioObj[i].value;
    }
  }
  return "";
}

// Functions to convert a list of Cartesian coordinates into various
// output file types. Each function takes an argument string containing
// lines of the form:
//
// <xval>\t<yval>\n
//
// where <xval> and <yval> are numbers without exponents. The functions
// return a string with the coordinates appropriately encoded.


function ccl2html(l) {
  // Returns contents of a minimal html file containing the coordinate
  // list as a single two column table.

  var pattern = /-?[0-9.]+/g;
  var s = "";
  var x;
  var y;

  s = s + "<html>" + "\n";
  s = s + "<head>" + "\n";
  s = s + "\t<title>Calculator Results</title>" + "\n";
  s = s + "</head>" + "\n";
  s = s + "<body>" + "\n";
  s = s + "\t<table border='0' width='100%'>" + "\n";
  s = s + "\t\t<tbody>" + "\n";

  while ((x = pattern.exec(l)) != null) {
    y = pattern.exec(l);
    s = s + "\t\t\t<tr><td>" + x[0] + "</td><td>" + y[0] + "</td></tr>" + "\n";
  }

  s = s + "\t\t</tbody>" + "\n";
  s = s + "\t</table>" + "\n";
  s = s + "</body>" + "\n";
  s = s + "</html>" + "\n";
  return s;
} // function


function ccl2dxf(l, xmin, ymin, xmax, ymax) {
  // Returns contents of a minimal dxf r10 file containing the coordinate
  // list as an open polyline on layer 0.
  // DXF file format from Autodesk. Help from Paul Bourke.

  var s = "";

  // DXF header
  s = s + "999" + "\n";
  s = s + "Polyline generated on https://www.groveld.com/ccl2dxf/" + "\n";

  s = s + "0" + "\n";
  s = s + "SECTION" + "\n";
  s = s + "2" + "\n";
  s = s + "HEADER" + "\n";
  s = s + "9" + "\n";
  s = s + "$ACADVER" + "\n";
  s = s + "1" + "\n";
  s = s + "AC1006" + "\n";
  s = s + "9" + "\n";
  s = s + "$INSBASE" + "\n";
  s = s + "10" + "\n";
  s = s + "0.0" + "\n";
  s = s + "20" + "\n";
  s = s + "0.0" + "\n";
  s = s + "30" + "\n";
  s = s + "0.0" + "\n";
  s = s + "9" + "\n";
  s = s + "$EXTMIN" + "\n";
  s = s + "10" + "\n";
  s = s + xmin + "\n";
  s = s + "20" + "\n";
  s = s + ymin + "\n";
  s = s + "9" + "\n";
  s = s + "$EXTMAX" + "\n";
  s = s + "10" + "\n";
  s = s + xmax + "\n";
  s = s + "20" + "\n";
  s = s + ymax + "\n";
  s = s + "0" + "\n";
  s = s + "ENDSEC" + "\n";

  s = s + "0" + "\n";
  s = s + "SECTION" + "\n";
  s = s + "2" + "\n";
  s = s + "ENTITIES" + "\n";

  // Polyline header
  s = s + "0" + "\n";
  s = s + "POLYLINE" + "\n";
  s = s + "8" + "\n";
  s = s + "0" + "\n";
  s = s + "66" + "\n";
  s = s + "1" + "\n";

  // Vertices
  var x;
  var y;
  var pattern = /-?[0-9.]+/g;

  while ((x = pattern.exec(l)) != null) {
    y = pattern.exec(l);
    s = s + "0" + "\n";
    s = s + "VERTEX" + "\n";
    s = s + "8" + "\n";
    s = s + "0" + "\n";
    s = s + "10" + "\n";
    s = s + x[0] + "\n";
    s = s + "20" + "\n";
    s = s + y[0] + "\n";
  }

  //Polyline end
  s = s + "0" + "\n";
  s = s + "SEQEND" + "\n";

  //DXF end
  s = s + "0" + "\n";
  s = s + "ENDSEC" + "\n";
  s = s + "0" + "\n";
  s = s + "EOF" + "\n";

  return s;
} // function


function ccl2svg(l, xmin, ymin, xmax, ymax) {
  // Returns contents of a minimal svg file containing the coordinate list as a polyline.
  var s = "";

  s = s + '<?xml version="1.0" encoding="iso-8859-1"?>' + '\n';
  s = s + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20001102//EN"' + '\n';
  s = s + '"http://www.w3.org/TR/2000/CR-SVG-20001102/DTD/svg-20001102.dtd">' + '\n';
  s = s + '\n';
  s = s + '<!-- Polyline generated on https://www.groveld.com/ccl2dxf/ -->' + '\n';
  s = s + '\n';
  s = s + '<!-- Size to fit data: width = xMax - xMin, height = yMax - yMin -->' + '\n';
  s = s + '<svg width="' + (xmax - xmin) + '" height="' + (ymax - ymin) + '"' + '  xmlns="http://www.w3.org/2000/svg" version="1.1">' + '\n';
  s = s + '\t<!-- Offset to fit data -->' + '\n';
  s = s + '\t<g transform="translate(' + (-1 * xmin) + ',0)">' + '\n';
  s = s + '\t\t<!-- Origin at lower left corner -->' + '\n';
  s = s + '\t\t<g transform="scale(1,-1)">' + '\n';
  s = s + '\t\t\t<g transform="translate(0,' + (-1 * (ymax - ymin)) + ')">' + '\n';
  s = s + '\t\t\t\t<polyline fill="none" stroke="blue" stroke-width="2%" points="';

  // Vertices. SVG origin is in top left corner so y values have to be inverted.
  var x;
  var y;
  var pattern = /-?[0-9.]+/g;

  while ((x = pattern.exec(l)) != null) {
    y = pattern.exec(l);
    s = s + x[0] + ",";
    s = s + y[0] + " ";
  }
  s = s.slice(0,-1) + '"/>' + '\n';

  s = s + '\t\t\t</g>' + '\n';
  s = s + '\t\t</g>' + '\n';
  s = s + '\t</g>' + '\n';
  s = s + '</svg>' + '\n';

  return s;
} // function
