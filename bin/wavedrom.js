#!/usr/bin/env node
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

'use strict';

var fs = require('fs-extra');
var json5 = require('json5');
var yargs = require('yargs');
var onml = require('onml');

var lib = require('../lib');
var def = require('../skins/default.js');
var narrow = require('../skins/narrow.js');
var lowkey = require('../skins/lowkey.js');

var skins = Object.assign({}, def, narrow, lowkey);

var argv = yargs
    .option('input', {describe: 'path to the source', alias: 'i'})
    .demandOption(['input'])
    .help()
    .argv;

var fileName;

fileName = argv.input;
fs.readFile(fileName, function (err, body) {
    var source = json5.parse(body);
    var res = lib.renderAny(0, source, skins);
    var svg = onml.s(res);
    console.log(svg);
});

/* eslint no-console: 0 */

},{"../lib":12,"../skins/default.js":131,"../skins/lowkey.js":132,"../skins/narrow.js":133,"fs-extra":52,"json5":77,"onml":82,"yargs":97}],2:[function(require,module,exports){
'use strict';

function appendSaveAsDialog (index, output) {
    var div;
    var menu;

    function closeMenu(e) {
        var left = parseInt(menu.style.left, 10);
        var top = parseInt(menu.style.top, 10);
        if (
            e.x < left ||
            e.x > (left + menu.offsetWidth) ||
            e.y < top ||
            e.y > (top + menu.offsetHeight)
        ) {
            menu.parentNode.removeChild(menu);
            document.body.removeEventListener('mousedown', closeMenu, false);
        }
    }

    div = document.getElementById(output + index);

    div.childNodes[0].addEventListener('contextmenu',
        function (e) {
            var list, savePng, saveSvg;

            menu = document.createElement('div');

            menu.className = 'wavedromMenu';
            menu.style.top = e.y + 'px';
            menu.style.left = e.x + 'px';

            list = document.createElement('ul');
            savePng = document.createElement('li');
            savePng.innerHTML = 'Save as PNG';
            list.appendChild(savePng);

            saveSvg = document.createElement('li');
            saveSvg.innerHTML = 'Save as SVG';
            list.appendChild(saveSvg);

            //var saveJson = document.createElement('li');
            //saveJson.innerHTML = 'Save as JSON';
            //list.appendChild(saveJson);

            menu.appendChild(list);

            document.body.appendChild(menu);

            savePng.addEventListener('click',
                function () {
                    var html, firstDiv, svgdata, img, canvas, context, pngdata, a;

                    html = '';
                    if (index !== 0) {
                        firstDiv = document.getElementById(output + 0);
                        html += firstDiv.innerHTML.substring(166, firstDiv.innerHTML.indexOf('<g id="waves_0">'));
                    }
                    html = [div.innerHTML.slice(0, 166), html, div.innerHTML.slice(166)].join('');
                    svgdata = 'data:image/svg+xml;base64,' + btoa(html);
                    img = new Image();
                    img.src = svgdata;
                    canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    context = canvas.getContext('2d');
                    context.drawImage(img, 0, 0);

                    pngdata = canvas.toDataURL('image/png');

                    a = document.createElement('a');
                    a.href = pngdata;
                    a.download = 'wavedrom.png';
                    a.click();

                    menu.parentNode.removeChild(menu);
                    document.body.removeEventListener('mousedown', closeMenu, false);
                },
                false
            );

            saveSvg.addEventListener('click',
                function () {
                    var html,
                        firstDiv,
                        svgdata,
                        a;

                    html = '';
                    if (index !== 0) {
                        firstDiv = document.getElementById(output + 0);
                        html += firstDiv.innerHTML.substring(166, firstDiv.innerHTML.indexOf('<g id="waves_0">'));
                    }
                    html = [div.innerHTML.slice(0, 166), html, div.innerHTML.slice(166)].join('');
                    svgdata = 'data:image/svg+xml;base64,' + btoa(html);

                    a = document.createElement('a');
                    a.href = svgdata;
                    a.download = 'wavedrom.svg';
                    a.click();

                    menu.parentNode.removeChild(menu);
                    document.body.removeEventListener('mousedown', closeMenu, false);
                },
                false
            );

            menu.addEventListener('contextmenu',
                function (ee) {
                    ee.preventDefault();
                },
                false
            );

            document.body.addEventListener('mousedown', closeMenu, false);

            e.preventDefault();
        },
        false
    );
}

module.exports = appendSaveAsDialog;

/* eslint-env browser */

},{}],3:[function(require,module,exports){
'use strict';

function arcShape (Edge, from, to) { /* eslint complexity: [warn, 30] */
    var dx = to.x - from.x;
    var dy = to.y - from.y;
    var lx = ((from.x + to.x) / 2);
    var ly = ((from.y + to.y) / 2);
    var d;
    var style;
    switch (Edge.shape) {
    case '-'  : {
        break;
    }
    case '~'  : {
        d = ('M ' + from.x + ',' + from.y + ' c ' + (0.7 * dx) + ', 0 ' + (0.3 * dx) + ', ' + dy + ' ' + dx + ', ' + dy);
        break;
    }
    case '-~' : {
        d = ('M ' + from.x + ',' + from.y + ' c ' + (0.7 * dx) + ', 0 ' +         dx + ', ' + dy + ' ' + dx + ', ' + dy);
        if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.75); }
        break;
    }
    case '~-' : {
        d = ('M ' + from.x + ',' + from.y + ' c ' + 0          + ', 0 ' + (0.3 * dx) + ', ' + dy + ' ' + dx + ', ' + dy);
        if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.25); }
        break;
    }
    case '-|' : {
        d = ('m ' + from.x + ',' + from.y + ' ' + dx + ',0 0,' + dy);
        if (Edge.label) { lx = to.x; }
        break;
    }
    case '|-' : {
        d = ('m ' + from.x + ',' + from.y + ' 0,' + dy + ' ' + dx + ',0');
        if (Edge.label) { lx = from.x; }
        break;
    }
    case '-|-': {
        d = ('m ' + from.x + ',' + from.y + ' ' + (dx / 2) + ',0 0,' + dy + ' ' + (dx / 2) + ',0');
        break;
    }
    case '->' : {
        style = ('marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
        break;
    }
    case '~>' : {
        style = ('marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('M ' + from.x + ',' + from.y + ' ' + 'c ' + (0.7 * dx) + ', 0 ' + 0.3 * dx + ', ' + dy + ' ' + dx + ', ' + dy);
        break;
    }
    case '-~>': {
        style = ('marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('M ' + from.x + ',' + from.y + ' ' + 'c ' + (0.7 * dx) + ', 0 ' +     dx + ', ' + dy + ' ' + dx + ', ' + dy);
        if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.75); }
        break;
    }
    case '~->': {
        style = ('marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('M ' + from.x + ',' + from.y + ' ' + 'c ' + 0      + ', 0 ' + (0.3 * dx) + ', ' + dy + ' ' + dx + ', ' + dy);
        if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.25); }
        break;
    }
    case '-|>' : {
        style = ('marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('m ' + from.x + ',' + from.y + ' ' + dx + ',0 0,' + dy);
        if (Edge.label) { lx = to.x; }
        break;
    }
    case '|->' : {
        style = ('marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('m ' + from.x + ',' + from.y + ' 0,' + dy + ' ' + dx + ',0');
        if (Edge.label) { lx = from.x; }
        break;
    }
    case '-|->': {
        style = ('marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('m ' + from.x + ',' + from.y + ' ' + (dx / 2) + ',0 0,' + dy + ' ' + (dx / 2) + ',0');
        break;
    }
    case '<->' : {
        style = ('marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
        break;
    }
    case '<~>' : {
        style = ('marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('M ' + from.x + ',' + from.y + ' ' + 'c ' + (0.7 * dx) + ', 0 ' + (0.3 * dx) + ', ' + dy + ' ' + dx + ', ' + dy);
        break;
    }
    case '<-~>': {
        style = ('marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('M ' + from.x + ',' + from.y + ' ' + 'c ' + (0.7 * dx) + ', 0 ' +     dx + ', ' + dy + ' ' + dx + ', ' + dy);
        if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.75); }
        break;
    }
    case '<-|>' : {
        style = ('marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('m ' + from.x + ',' + from.y + ' ' + dx + ',0 0,' + dy);
        if (Edge.label) { lx = to.x; }
        break;
    }
    case '<-|->': {
        style = ('marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('m ' + from.x + ',' + from.y + ' ' + (dx / 2) + ',0 0,' + dy + ' ' + (dx / 2) + ',0');
        break;
    }
    default   : { style = ('fill:none;stroke:#F00;stroke-width:1'); }
    }
    return {
        lx: lx,
        ly: ly,
        d: d,
        style: style
    };
}

module.exports = arcShape;

},{}],4:[function(require,module,exports){
module.exports={"chars":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,47,74,74,118,89,25,44,44,52,78,37,44,37,37,74,74,74,74,74,74,74,74,74,74,37,37,78,78,78,74,135,89,89,96,96,89,81,103,96,37,67,89,74,109,96,103,89,103,96,89,81,96,89,127,89,87,81,37,37,37,61,74,44,74,74,67,74,74,37,74,74,30,30,67,30,112,74,74,74,74,44,67,37,74,67,95,66,65,67,44,34,44,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,43,74,74,74,74,34,74,44,98,49,74,78,0,98,73,53,73,44,44,44,77,71,37,44,44,49,74,111,111,111,81,89,89,89,89,89,89,133,96,89,89,89,89,37,37,37,37,96,96,103,103,103,103,103,78,103,96,96,96,96,87,89,81,74,74,74,74,74,74,118,67,74,74,74,74,36,36,36,36,74,74,74,74,74,74,74,73,81,74,74,74,74,65,74,65,89,74,89,74,89,74,96,67,96,67,96,67,96,67,96,82,96,74,89,74,89,74,89,74,89,74,89,74,103,74,103,74,103,74,103,74,96,74,96,74,37,36,37,36,37,36,37,30,37,36,98,59,67,30,89,67,67,74,30,74,30,74,39,74,44,74,30,96,74,96,74,96,74,80,96,74,103,74,103,74,103,74,133,126,96,44,96,44,96,44,89,67,89,67,89,67,89,67,81,38,81,50,81,37,96,74,96,74,96,74,96,74,96,74,96,74,127,95,87,65,87,81,67,81,67,81,67,30,84,97,91,84,91,84,94,92,73,104,109,91,84,81,84,100,82,76,74,103,91,131,47,40,99,77,37,79,130,100,84,104,114,87,126,101,87,84,93,84,69,84,46,52,82,52,82,114,89,102,96,100,98,91,70,88,88,77,70,85,89,77,67,84,39,65,61,39,189,173,153,111,105,61,123,123,106,89,74,37,30,103,74,96,74,96,74,96,74,96,74,96,74,81,91,81,91,81,130,131,102,84,103,84,87,78,104,81,104,81,88,76,37,189,173,153,103,84,148,90,100,84,89,74,133,118,103,81],"other":114}

},{}],5:[function(require,module,exports){
'use strict';

var onmlStringify = require('onml/lib/stringify.js');
var w3 = require('./w3.js');

function jsonmlParse (arr) {
    arr[1].xmlns = w3.svg;
    arr[1]['xmlns:xlink'] = w3.xlink;
    var s1 = onmlStringify(arr);
    var s2 = s1.replace(/&/g, '&amp;');
    var parser = new DOMParser();
    var doc = parser.parseFromString(s2, 'image/svg+xml');
    return doc.firstChild;
}

module.exports = jsonmlParse;
// module.exports = createElement;

/* eslint-env browser */

},{"./w3.js":35,"onml/lib/stringify.js":84}],6:[function(require,module,exports){
'use strict';

var eva = require('./eva'),
    renderWaveForm = require('./render-wave-form');

function editorRefresh () {
    // var svg,
    // ser,
    // ssvg,
    // asvg,
    // sjson,
    // ajson;

    renderWaveForm(0, eva('InputJSON_0'), 'WaveDrom_Display_');

    /*
    svg = document.getElementById('svgcontent_0');
    ser = new XMLSerializer();
    ssvg = '<?xml version='1.0' standalone='no'?>\n' +
    '<!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'>\n' +
    '<!-- Created with WaveDrom -->\n' +
    ser.serializeToString(svg);

    asvg = document.getElementById('download_svg');
    asvg.href = 'data:image/svg+xml;base64,' + window.btoa(ssvg);

    sjson = localStorage.waveform;
    ajson = document.getElementById('download_json');
    ajson.href = 'data:text/json;base64,' + window.btoa(sjson);
    */
}

module.exports = editorRefresh;

},{"./eva":7,"./render-wave-form":32}],7:[function(require,module,exports){
'use strict';

function eva (id) {
    var TheTextBox, source;

    function erra (e) {
        return { signal: [{ name: ['tspan', ['tspan', {class:'error h5'}, 'Error: '], e.message] }]};
    }

    TheTextBox = document.getElementById(id);

    /* eslint-disable no-eval */
    if (TheTextBox.type && TheTextBox.type === 'textarea') {
        try { source = eval('(' + TheTextBox.value + ')'); } catch (e) { return erra(e); }
    } else {
        try { source = eval('(' + TheTextBox.innerHTML + ')'); } catch (e) { return erra(e); }
    }
    /* eslint-enable  no-eval */

    if (Object.prototype.toString.call(source) !== '[object Object]') {
        return erra({ message: '[Semantic]: The root has to be an Object: "{signal:[...]}"'});
    }
    if (source.signal) {
        if (Object.prototype.toString.call(source.signal) !== '[object Array]') {
            return erra({ message: '[Semantic]: "signal" object has to be an Array "signal:[]"'});
        }
    } else if (source.assign) {
        if (Object.prototype.toString.call(source.assign) !== '[object Array]') {
            return erra({ message: '[Semantic]: "assign" object hasto be an Array "assign:[]"'});
        }
    } else if (source.reg) {
        // test register
    } else {
        return erra({ message: '[Semantic]: "signal:[...]" or "assign:[...]" property is missing inside the root Object'});
    }
    return source;
}

module.exports = eva;

/* eslint-env browser */

},{}],8:[function(require,module,exports){
'use strict';

function findLaneMarkers (lanetext) {
    var gcount = 0,
        lcount = 0,
        ret = [];

    lanetext.forEach(function (e) {
        if (
            (e === 'vvv-2') ||
            (e === 'vvv-3') ||
            (e === 'vvv-4') ||
            (e === 'vvv-5') ||
            (e === 'vvv-6') ||
            (e === 'vvv-7') ||
            (e === 'vvv-8') ||
            (e === 'vvv-9')
        ) {
            lcount += 1;
        } else {
            if (lcount !== 0) {
                ret.push(gcount - ((lcount + 1) / 2));
                lcount = 0;
            }
        }
        gcount += 1;

    });

    if (lcount !== 0) {
        ret.push(gcount - ((lcount + 1) / 2));
    }

    return ret;
}

module.exports = findLaneMarkers;

},{}],9:[function(require,module,exports){
'use strict';

function genBrick (texts, extra, times) {
    var i, j, R = [];

    if (texts.length === 4) {
        for (j = 0; j < times; j += 1) {
            R.push(texts[0]);
            for (i = 0; i < extra; i += 1) {
                R.push(texts[1]);
            }
            R.push(texts[2]);
            for (i = 0; i < extra; i += 1) {
                R.push(texts[3]);
            }
        }
        return R;
    }
    if (texts.length === 1) {
        texts.push(texts[0]);
    }
    R.push(texts[0]);
    for (i = 0; i < (times * (2 * (extra + 1)) - 1); i += 1) {
        R.push(texts[1]);
    }
    return R;
}

module.exports = genBrick;

},{}],10:[function(require,module,exports){
'use strict';

var genBrick = require('./gen-brick');

function genFirstWaveBrick (text, extra, times) {
    var tmp;

    tmp = [];
    switch (text) {
    case 'p': tmp = genBrick(['pclk', '111', 'nclk', '000'], extra, times); break;
    case 'n': tmp = genBrick(['nclk', '000', 'pclk', '111'], extra, times); break;
    case 'P': tmp = genBrick(['Pclk', '111', 'nclk', '000'], extra, times); break;
    case 'N': tmp = genBrick(['Nclk', '000', 'pclk', '111'], extra, times); break;
    case 'l':
    case 'L':
    case '0': tmp = genBrick(['000'], extra, times); break;
    case 'h':
    case 'H':
    case '1': tmp = genBrick(['111'], extra, times); break;
    case '=': tmp = genBrick(['vvv-2'], extra, times); break;
    case '2': tmp = genBrick(['vvv-2'], extra, times); break;
    case '3': tmp = genBrick(['vvv-3'], extra, times); break;
    case '4': tmp = genBrick(['vvv-4'], extra, times); break;
    case '5': tmp = genBrick(['vvv-5'], extra, times); break;
    case '6': tmp = genBrick(['vvv-6'], extra, times); break;
    case '7': tmp = genBrick(['vvv-7'], extra, times); break;
    case '8': tmp = genBrick(['vvv-8'], extra, times); break;
    case '9': tmp = genBrick(['vvv-9'], extra, times); break;
    case 'd': tmp = genBrick(['ddd'], extra, times); break;
    case 'u': tmp = genBrick(['uuu'], extra, times); break;
    case 'z': tmp = genBrick(['zzz'], extra, times); break;
    default:  tmp = genBrick(['xxx'], extra, times); break;
    }
    return tmp;
}

module.exports = genFirstWaveBrick;

},{"./gen-brick":9}],11:[function(require,module,exports){
'use strict';

var genBrick = require('./gen-brick');

function genWaveBrick (text, extra, times) {
    var x1, x2, x3, y1, y2, x4, x5, x6, xclude, atext, tmp0, tmp1, tmp2, tmp3, tmp4;

    x1 = {p:'pclk', n:'nclk', P:'Pclk', N:'Nclk', h:'pclk', l:'nclk', H:'Pclk', L:'Nclk'};

    x2 = {
        '0':'0', '1':'1',
        'x':'x',
        'd':'d',
        'u':'u',
        'z':'z',
        '=':'v',  '2':'v',  '3':'v',  '4':'v', '5':'v', '6':'v', '7':'v', '8':'v', '9':'v'
    };

    x3 = {
        '0': '', '1': '',
        'x': '',
        'd': '',
        'u': '',
        'z': '',
        '=':'-2', '2':'-2', '3':'-3', '4':'-4', '5':'-5', '6':'-6', '7':'-7', '8':'-8', '9':'-9'
    };

    y1 = {
        'p':'0', 'n':'1',
        'P':'0', 'N':'1',
        'h':'1', 'l':'0',
        'H':'1', 'L':'0',
        '0':'0', '1':'1',
        'x':'x',
        'd':'d',
        'u':'u',
        'z':'z',
        '=':'v', '2':'v', '3':'v', '4':'v', '5':'v', '6':'v', '7':'v', '8':'v', '9':'v'
    };

    y2 = {
        'p': '', 'n': '',
        'P': '', 'N': '',
        'h': '', 'l': '',
        'H': '', 'L': '',
        '0': '', '1': '',
        'x': '',
        'd': '',
        'u': '',
        'z': '',
        '=':'-2', '2':'-2', '3':'-3', '4':'-4', '5':'-5', '6':'-6', '7':'-7', '8':'-8', '9':'-9'
    };

    x4 = {
        'p': '111', 'n': '000',
        'P': '111', 'N': '000',
        'h': '111', 'l': '000',
        'H': '111', 'L': '000',
        '0': '000', '1': '111',
        'x': 'xxx',
        'd': 'ddd',
        'u': 'uuu',
        'z': 'zzz',
        '=': 'vvv-2', '2': 'vvv-2', '3': 'vvv-3', '4': 'vvv-4', '5': 'vvv-5', '6':'vvv-6', '7':'vvv-7', '8':'vvv-8', '9':'vvv-9'
    };

    x5 = {
        p:'nclk', n:'pclk', P:'nclk', N:'pclk'
    };

    x6 = {
        p: '000', n: '111', P: '000', N: '111'
    };

    xclude = {
        'hp':'111', 'Hp':'111', 'ln': '000', 'Ln': '000', 'nh':'111', 'Nh':'111', 'pl': '000', 'Pl':'000'
    };

    atext = text.split('');
    //if (atext.length !== 2) { return genBrick(['xxx'], extra, times); }

    tmp0 = x4[atext[1]];
    tmp1 = x1[atext[1]];
    if (tmp1 === undefined) {
        tmp2 = x2[atext[1]];
        if (tmp2 === undefined) {
            // unknown
            return genBrick(['xxx'], extra, times);
        } else {
            tmp3 = y1[atext[0]];
            if (tmp3 === undefined) {
                // unknown
                return genBrick(['xxx'], extra, times);
            }
            // soft curves
            return genBrick([tmp3 + 'm' + tmp2 + y2[atext[0]] + x3[atext[1]], tmp0], extra, times);
        }
    } else {
        tmp4 = xclude[text];
        if (tmp4 !== undefined) {
            tmp1 = tmp4;
        }
        // sharp curves
        tmp2 = x5[atext[1]];
        if (tmp2 === undefined) {
            // hlHL
            return genBrick([tmp1, tmp0], extra, times);
        } else {
            // pnPN
            return genBrick([tmp1, tmp0, tmp2, x6[atext[1]]], extra, times);
        }
    }
}

module.exports = genWaveBrick;

},{"./gen-brick":9}],12:[function(require,module,exports){
'use strict';

var pkg = require('../package.json');
var processAll = require('./process-all');
var eva = require('./eva');
var renderWaveForm = require('./render-wave-form');
var renderWaveElement = require('./render-wave-element');
var renderAny = require('./render-any.js');
var editorRefresh = require('./editor-refresh');
var def = require('../skins/default.js');
var onmlStringify = require('onml/lib/stringify.js');

exports.version = pkg.version;
exports.processAll = processAll;
exports.eva = eva;
exports.renderAny = renderAny;
exports.renderWaveForm = renderWaveForm;
exports.renderWaveElement = renderWaveElement;
exports.editorRefresh = editorRefresh;
exports.waveSkin = def;
exports.onml = {
    stringify: onmlStringify
};

},{"../package.json":130,"../skins/default.js":131,"./editor-refresh":6,"./eva":7,"./process-all":19,"./render-any.js":21,"./render-wave-element":31,"./render-wave-form":32,"onml/lib/stringify.js":84}],13:[function(require,module,exports){
'use strict';

function insertSVGTemplateAssign () {
    return ['style', '.pinname {font-size:12px; font-style:normal; font-variant:normal; font-weight:500; font-stretch:normal; text-align:center; text-anchor:end; font-family:Helvetica} .wirename {font-size:12px; font-style:normal; font-variant:normal; font-weight:500; font-stretch:normal; text-align:center; text-anchor:start; font-family:Helvetica} .wirename:hover {fill:blue} .gate {color:#000; fill:#ffc; fill-opacity: 1;stroke:#000; stroke-width:1; stroke-opacity:1} .gate:hover {fill:red !important; } .wire {fill:none; stroke:#000; stroke-width:1; stroke-opacity:1} .grid {fill:#fff; fill-opacity:1; stroke:none}'];
}

module.exports = insertSVGTemplateAssign;

},{}],14:[function(require,module,exports){
'use strict';

var w3 = require('./w3');

function insertSVGTemplate (index, source, lane, waveSkin, content, lanes, groups, notFirstSignal) {
    var first, skin, e;

    for (first in waveSkin) { break; }

    skin = waveSkin.default || waveSkin[first];

    if (source && source.config && source.config.skin && waveSkin[source.config.skin]) {
        skin = waveSkin[source.config.skin];
    }

    if (notFirstSignal) {
        e = ['svg', {id: 'svg', xmlns: w3.svg, 'xmlns:xlink': w3.xlink}, ['g']];
    } else {
        e = skin;
    }

    var width = (lane.xg + (lane.xs * (lane.xmax + 1)));
    var height = (content.length * lane.yo + lane.yh0 + lane.yh1 + lane.yf0 + lane.yf1);

    var body = e[e.length - 1];

    body[1] = {id: 'waves_'  + index};

    body[2] = ['g', {
        id: 'lanes_'  + index,
        transform: 'translate(' + (lane.xg + 0.5) + ', ' + ((lane.yh0 + lane.yh1) + 0.5) + ')'
    }].concat(lanes);

    body[3] = ['g', {
        id: 'groups_' + index
    }, groups];

    var head = e[1];

    head.id = 'svgcontent_' + index;
    head.height = height;
    head.width = width;
    head.viewBox = '0 0 ' + width + ' ' + height;
    head.overflow = 'hidden';

    return e;
}

module.exports = insertSVGTemplate;

},{"./w3":35}],15:[function(require,module,exports){
'use strict';

var lane = {
    xs     : 20,    // tmpgraphlane0.width
    ys     : 20,    // tmpgraphlane0.height
    xg     : 120,   // tmpgraphlane0.x
    // yg     : 0,     // head gap
    yh0    : 0,     // head gap title
    yh1    : 0,     // head gap
    yf0    : 0,     // foot gap
    yf1    : 0,     // foot gap
    y0     : 5,     // tmpgraphlane0.y
    yo     : 30,    // tmpgraphlane1.y - y0;
    tgo    : -10,   // tmptextlane0.x - xg;
    ym     : 15,    // tmptextlane0.y - y0
    xlabel : 6,     // tmptextlabel.x - xg;
    xmax   : 1,
    scale  : 1,
    head   : {},
    foot   : {}
};

module.exports = lane;

},{}],16:[function(require,module,exports){
'use strict';

function parseConfig (source, lane) {
    var hscale;

    function tonumber (x) {
        return x > 0 ? Math.round(x) : 1;
    }

    lane.hscale = 1;

    if (lane.hscale0) {
        lane.hscale = lane.hscale0;
    }
    if (source && source.config && source.config.hscale) {
        hscale = Math.round(tonumber(source.config.hscale));
        if (hscale > 0) {
            if (hscale > 100) {
                hscale = 100;
            }
            lane.hscale = hscale;
        }
    }
    lane.yh0 = 0;
    lane.yh1 = 0;
    lane.head = source.head;

    lane.xmin_cfg = 0;
    lane.xmax_cfg = 1e12; // essentially infinity
    if (source && source.config && source.config.hbounds && source.config.hbounds.length==2) {
        source.config.hbounds[0] = Math.floor(source.config.hbounds[0]);
        source.config.hbounds[1] = Math.ceil(source.config.hbounds[1]);
        if (  source.config.hbounds[0] < source.config.hbounds[1] ) {
            // convert hbounds ticks min, max to bricks min, max
            // TODO: do we want to base this on ticks or tocks in
            //  head or foot?  All 4 can be different... or just 0 reference?
            lane.xmin_cfg = 2 * Math.floor(source.config.hbounds[0]);
            lane.xmax_cfg = 2 * Math.floor(source.config.hbounds[1]);
        }
    }

    if (source && source.head) {
        if (
            source.head.tick || source.head.tick === 0 ||
            source.head.tock || source.head.tock === 0
        ) {
            lane.yh0 = 20;
        }
        // if tick defined, modify start tick by lane.xmin_cfg
        if ( source.head.tick || source.head.tick === 0 ) {
            source.head.tick = source.head.tick + lane.xmin_cfg/2;
        }
        // if tock defined, modify start tick by lane.xmin_cfg
        if ( source.head.tock || source.head.tock === 0 ) {
            source.head.tock = source.head.tock + lane.xmin_cfg/2;
        }

        if (source.head.text) {
            lane.yh1 = 46;
            lane.head.text = source.head.text;
        }
    }

    lane.yf0 = 0;
    lane.yf1 = 0;
    lane.foot = source.foot;
    if (source && source.foot) {
        if (
            source.foot.tick || source.foot.tick === 0 ||
            source.foot.tock || source.foot.tock === 0
        ) {
            lane.yf0 = 20;
        }
        // if tick defined, modify start tick by lane.xmin_cfg
        if ( source.foot.tick || source.foot.tick === 0 ) {
            source.foot.tick = source.foot.tick + lane.xmin_cfg/2;
        }
        // if tock defined, modify start tick by lane.xmin_cfg
        if ( source.foot.tock || source.foot.tock === 0 ) {
            source.foot.tock = source.foot.tock + lane.xmin_cfg/2;
        }

        if (source.foot.text) {
            lane.yf1 = 46;
            lane.foot.text = source.foot.text;
        }
    }
}

module.exports = parseConfig;

},{}],17:[function(require,module,exports){
'use strict';

var genFirstWaveBrick = require('./gen-first-wave-brick'),
    genWaveBrick = require('./gen-wave-brick'),
    findLaneMarkers = require('./find-lane-markers');

// text is the wave member of the signal object
// extra = hscale-1 ( padding )
// lane is an object containing all properties for this waveform
function parseWaveLane (text, extra, lane) {
    var Repeats, Top, Next, Stack = [], R = [], i, subCycle;
    var unseen_bricks = [], num_unseen_markers;

    Stack = text.split('');
    Next  = Stack.shift();
    subCycle = false;

    Repeats = 1;
    while (Stack[0] === '.' || Stack[0] === '|') { // repeaters parser
        Stack.shift();
        Repeats += 1;
    }
    R = R.concat(genFirstWaveBrick(Next, extra, Repeats));

    while (Stack.length) {
        Top = Next;
        Next = Stack.shift();
        if (Next === '<') { // sub-cycles on
            subCycle = true;
            Next = Stack.shift();
        }
        if (Next === '>') { // sub-cycles off
            subCycle = false;
            Next = Stack.shift();
        }
        Repeats = 1;
        while (Stack[0] === '.' || Stack[0] === '|') { // repeaters parser
            Stack.shift();
            Repeats += 1;
        }
        if (subCycle) {
            R = R.concat(genWaveBrick((Top + Next), 0, Repeats - lane.period));
        } else {
            R = R.concat(genWaveBrick((Top + Next), extra, Repeats));
        }
    }
    // shift out unseen bricks due to phase shift, and save them in
    //  unseen_bricks array
    for (i = 0; i < lane.phase; i += 1) {
        unseen_bricks.push(R.shift());
    }
    if (unseen_bricks.length > 0) {
        num_unseen_markers = findLaneMarkers( unseen_bricks ).length;
        // if end of unseen_bricks and start of R both have a marker,
        //  then one less unseen marker
        if ( findLaneMarkers( [unseen_bricks[unseen_bricks.length-1]] ).length == 1 &&
             findLaneMarkers( [R[0]] ).length == 1 ) {
            num_unseen_markers -= 1;
        }
    } else {
        num_unseen_markers = 0;
    }

    // R is array of half brick types, each is item is string
    // num_unseen_markers is how many markers are now unseen due to phase
    return [R, num_unseen_markers];
}

module.exports = parseWaveLane;

},{"./find-lane-markers":8,"./gen-first-wave-brick":10,"./gen-wave-brick":11}],18:[function(require,module,exports){
'use strict';

var parseWaveLane = require('./parse-wave-lane');

function data_extract (e, num_unseen_markers) {
    var ret_data;

    ret_data = e.data;
    if (ret_data === undefined) { return null; }
    if (typeof (ret_data) === 'string') {
        ret_data = ret_data.trim().split(/\s+/);
    }
    // slice data array after unseen markers
    ret_data = ret_data.slice( num_unseen_markers );
    return ret_data;
}

function parseWaveLanes (sig, lane) {
    var x,
        sigx,
        content = [],
        content_wave,
        parsed_wave_lane,
        num_unseen_markers,
        tmp0 = [];

    for (x in sig) {
        // sigx is each signal in the array of signals being iterated over
        sigx = sig[x];
        lane.period = sigx.period ? sigx.period    : 1;
        // xmin_cfg is min. brick of hbounds, add to lane.phase of all signals
        lane.phase  = (sigx.phase  ? sigx.phase * 2 : 0) + lane.xmin_cfg;
        content.push([]);
        tmp0[0] = sigx.name  || ' ';
        // xmin_cfg is min. brick of hbounds, add 1/2 to sigx.phase of all sigs
        tmp0[1] = (sigx.phase || 0) + lane.xmin_cfg/2;
        if ( sigx.wave ) {
            parsed_wave_lane = parseWaveLane(sigx.wave, lane.period * lane.hscale - 1, lane);
            content_wave = parsed_wave_lane[0] ;
            num_unseen_markers = parsed_wave_lane[1];
        } else {
            content_wave = null;
        }
        content[content.length - 1][0] = tmp0.slice(0);
        content[content.length - 1][1] = content_wave;
        content[content.length - 1][2] = data_extract(sigx, num_unseen_markers);
    }
    // content is an array of arrays, representing the list of signals using
    //  the same order:
    // content[0] = [ [name,phase], parsedwavelaneobj, dataextracted ]
    return content;
}

module.exports = parseWaveLanes;

},{"./parse-wave-lane":17}],19:[function(require,module,exports){
'use strict';

var eva = require('./eva'),
    appendSaveAsDialog = require('./append-save-as-dialog'),
    renderWaveForm = require('./render-wave-form');

function processAll () {
    var points,
        i,
        index,
        notFirstSignal,
        obj,
        node0;
        // node1;

    // first pass
    index = 0; // actual number of valid anchor
    points = document.querySelectorAll('*');
    for (i = 0; i < points.length; i++) {
        if (points.item(i).type && points.item(i).type === 'WaveDrom') {
            points.item(i).setAttribute('id', 'InputJSON_' + index);

            node0 = document.createElement('div');
            // node0.className += 'WaveDrom_Display_' + index;
            node0.id = 'WaveDrom_Display_' + index;
            points.item(i).parentNode.insertBefore(node0, points.item(i));
            // WaveDrom.InsertSVGTemplate(i, node0);
            index += 1;
        }
    }
    // second pass
    for (i = 0; i < index; i += 1) {
        obj = eva('InputJSON_' + i);
        renderWaveForm(i, obj, 'WaveDrom_Display_', notFirstSignal);
        if (obj && obj.signal && !notFirstSignal) {
            notFirstSignal = true;
        }
        appendSaveAsDialog(i, 'WaveDrom_Display_');
    }
    // add styles
    document.head.innerHTML += '<style type="text/css">div.wavedromMenu{position:fixed;border:solid 1pt#CCCCCC;background-color:white;box-shadow:0px 10px 20px #808080;cursor:default;margin:0px;padding:0px;}div.wavedromMenu>ul{margin:0px;padding:0px;}div.wavedromMenu>ul>li{padding:2px 10px;list-style:none;}div.wavedromMenu>ul>li:hover{background-color:#b5d5ff;}</style>';
}

module.exports = processAll;

/* eslint-env browser */

},{"./append-save-as-dialog":2,"./eva":7,"./render-wave-form":32}],20:[function(require,module,exports){
'use strict';

function rec (tmp, state) {
    var i, name, old = {}, delta = {'x':10};
    if (typeof tmp[0] === 'string' || typeof tmp[0] === 'number') {
        name = tmp[0];
        delta.x = 25;
    }
    state.x += delta.x;
    for (i = 0; i < tmp.length; i++) {
        if (typeof tmp[i] === 'object') {
            if (Object.prototype.toString.call(tmp[i]) === '[object Array]') {
                old.y = state.y;
                state = rec(tmp[i], state);
                state.groups.push({'x':state.xx, 'y':old.y, 'height':(state.y - old.y), 'name':state.name});
            } else {
                state.lanes.push(tmp[i]);
                state.width.push(state.x);
                state.y += 1;
            }
        }
    }
    state.xx = state.x;
    state.x -= delta.x;
    state.name = name;
    return state;
}

module.exports = rec;

},{}],21:[function(require,module,exports){
'use strict';

var renderAssign = require('./render-assign.js');
var renderReg = require('./render-reg.js');
var renderSignal = require('./render-signal.js');

function renderAny (index, source, waveSkin, notFirstSignal) {
    var res = source.signal ?
        renderSignal(index, source, waveSkin, notFirstSignal) :
        source.assign ?
            renderAssign(index, source) :
            source.reg ?
                renderReg(index, source) :
                ['div', {}];

    res[1].class = 'WaveDrom';
    return res;
}

module.exports = renderAny;

},{"./render-assign.js":23,"./render-reg.js":29,"./render-signal.js":30}],22:[function(require,module,exports){
'use strict';

var arcShape = require('./arc-shape.js');
var renderLabel = require('./render-label.js');

function renderArc (Edge, from, to, shapeProps) {
    return ['path', {
        id: 'gmark_' + Edge.from + '_' + Edge.to,
        d: shapeProps.d || 'M ' + from.x + ',' + from.y + ' ' + to.x + ',' + to.y,
        style: shapeProps.style || 'fill:none;stroke:#00F;stroke-width:1'
    }];
}

function renderArcs (source, index, top, lane) {
    var res = ['g', {id: 'wavearcs_' + index}];
    var Events = {};

    function labeler (element, i) {
        var pos, eventname, stack;
        var text = element.node;
        lane.period = element.period ? element.period : 1;
        lane.phase  = (element.phase ? element.phase * 2 : 0) + lane.xmin_cfg;
        if (text) {
            stack = text.split('');
            pos = 0;
            while (stack.length) {
                eventname = stack.shift();
                if (eventname !== '.') {
                    Events[eventname] = {
                        x: lane.xs *
                          (2 * pos * lane.period * lane.hscale - lane.phase) +
                          lane.xlabel,
                        y: i * lane.yo + lane.y0 + lane.ys * 0.5
                    };
                }
                pos += 1;
            }
        }
    }

    function archer (element) {
        var words = element.trim().split(/\s+/);
        var Edge = {
            words: words,
            label: element.substring(words[0].length).substring(1),
            from:  words[0].substr(0, 1),
            to:    words[0].substr(-1, 1),
            shape: words[0].slice(1, -1)
        };
        var from = Events[Edge.from];
        var to = Events[Edge.to];

        var shapeProps, lx, ly;
        if (from && to) {
            shapeProps = arcShape(Edge, from, to);
            lx = shapeProps.lx;
            ly = shapeProps.ly;
            res = res.concat([renderArc(Edge, from, to, shapeProps)]);

            if (Edge.label) {
                res = res.concat([renderLabel({x: lx, y: ly}, Edge.label)]);
            }
        }
    }

    if (Array.isArray(source)) {
        source.map(labeler);
        if (Array.isArray(top.edge)) {
            top.edge.map(archer);
        }
        Object.keys(Events).map(function (k) {
            if (k === k.toLowerCase()) {
                if (Events[k].x > 0) {
                    res = res.concat([renderLabel({
                        x: Events[k].x,
                        y: Events[k].y
                    }, k + '')]);
                }
            }
        });
    }
    return res;
}

module.exports = renderArcs;

},{"./arc-shape.js":3,"./render-label.js":26}],23:[function(require,module,exports){
'use strict';

var insertSVGTemplateAssign = require('./insert-svg-template-assign');

function render (tree, state) {
    var y, i, ilen;

    state.xmax = Math.max(state.xmax, state.x);
    y = state.y;
    ilen = tree.length;
    for (i = 1; i < ilen; i++) {
        if (Object.prototype.toString.call(tree[i]) === '[object Array]') {
            state = render(tree[i], {x: (state.x + 1), y: state.y, xmax: state.xmax});
        } else {
            tree[i] = {name:tree[i], x: (state.x + 1), y: state.y};
            state.y += 2;
        }
    }
    tree[0] = {name: tree[0], x: state.x, y: Math.round((y + (state.y - 2)) / 2)};
    state.x--;
    return state;
}

function draw_body (type, ymin, ymax) {
    var e,
        iecs,
        circle = ' M 4,0 C 4,1.1 3.1,2 2,2 0.9,2 0,1.1 0,0 c 0,-1.1 0.9,-2 2,-2 1.1,0 2,0.9 2,2 z',
        gates = {
            '~':  'M -11,-6 -11,6 0,0 z m -5,6 5,0' + circle,
            '=':  'M -11,-6 -11,6 0,0 z m -5,6 5,0',
            '&':  'm -16,-10 5,0 c 6,0 11,4 11,10 0,6 -5,10 -11,10 l -5,0 z',
            '~&': 'm -16,-10 5,0 c 6,0 11,4 11,10 0,6 -5,10 -11,10 l -5,0 z' + circle,
            '|':  'm -18,-10 4,0 c 6,0 12,5 14,10 -2,5 -8,10 -14,10 l -4,0 c 2.5,-5 2.5,-15 0,-20 z',
            '~|': 'm -18,-10 4,0 c 6,0 12,5 14,10 -2,5 -8,10 -14,10 l -4,0 c 2.5,-5 2.5,-15 0,-20 z' + circle,
            '^':  'm -21,-10 c 1,3 2,6 2,10 m 0,0 c 0,4 -1,7 -2,10 m 3,-20 4,0 c 6,0 12,5 14,10 -2,5 -8,10 -14,10 l -4,0 c 1,-3 2,-6 2,-10 0,-4 -1,-7 -2,-10 z',
            '~^': 'm -21,-10 c 1,3 2,6 2,10 m 0,0 c 0,4 -1,7 -2,10 m 3,-20 4,0 c 6,0 12,5 14,10 -2,5 -8,10 -14,10 l -4,0 c 1,-3 2,-6 2,-10 0,-4 -1,-7 -2,-10 z' + circle,
            '+':  'm -8,5 0,-10 m -5,5 10,0 m 3,0 c 0,4.418278 -3.581722,8 -8,8 -4.418278,0 -8,-3.581722 -8,-8 0,-4.418278 3.581722,-8 8,-8 4.418278,0 8,3.581722 8,8 z',
            '*':  'm -4,4 -8,-8 m 0,8 8,-8 m 4,4 c 0,4.418278 -3.581722,8 -8,8 -4.418278,0 -8,-3.581722 -8,-8 0,-4.418278 3.581722,-8 8,-8 4.418278,0 8,3.581722 8,8 z'
        },
        iec = {
            BUF: 1, INV: 1, AND: '&',  NAND: '&',
            OR: '\u22651', NOR: '\u22651', XOR: '=1', XNOR: '=1', box: ''
        },
        circled = { INV: 1, NAND: 1, NOR: 1, XNOR: 1 };

    if (ymax === ymin) {
        ymax = 4; ymin = -4;
    }
    e = gates[type];
    iecs = iec[type];
    if (e) {
        return ['path', {class:'gate', d: e}];
    } else {
        if (iecs) {
            return [
                'g', [
                    'path', {
                        class:'gate',
                        d: 'm -16,' + (ymin - 3) + ' 16,0 0,' + (ymax - ymin + 6) + ' -16,0 z' + (circled[type] ? circle : '')
                    }], [
                    'text', [
                        'tspan', {x: '-14', y: '4', class: 'wirename'}, iecs + ''
                    ]
                ]
            ];
        } else {
            return ['text', ['tspan', {x: '-14', y: '4', class: 'wirename'}, type + '']];
        }
    }
}

function draw_gate (spec) { // ['type', [x,y], [x,y] ... ]
    var i,
        ret = ['g'],
        ys = [],
        ymin,
        ymax,
        ilen = spec.length;

    for (i = 2; i < ilen; i++) {
        ys.push(spec[i][1]);
    }

    ymin = Math.min.apply(null, ys);
    ymax = Math.max.apply(null, ys);

    ret.push(
        ['g',
            {transform:'translate(16,0)'},
            ['path', {
                d: 'M  ' + spec[2][0] + ',' + ymin + ' ' + spec[2][0] + ',' + ymax,
                class: 'wire'
            }]
        ]
    );

    for (i = 2; i < ilen; i++) {
        ret.push(
            ['g',
                ['path',
                    {
                        d: 'm  ' + spec[i][0] + ',' + spec[i][1] + ' 16,0',
                        class: 'wire'
                    }
                ]
            ]
        );
    }
    ret.push(
        ['g', { transform: 'translate(' + spec[1][0] + ',' + spec[1][1] + ')' },
            ['title', spec[0]],
            draw_body(spec[0], ymin - spec[1][1], ymax - spec[1][1])
        ]
    );
    return ret;
}

function draw_boxes (tree, xmax) {
    var ret = ['g'], i, ilen, fx, fy, fname, spec = [];
    if (Object.prototype.toString.call(tree) === '[object Array]') {
        ilen = tree.length;
        spec.push(tree[0].name);
        spec.push([32 * (xmax - tree[0].x), 8 * tree[0].y]);
        for (i = 1; i < ilen; i++) {
            if (Object.prototype.toString.call(tree[i]) === '[object Array]') {
                spec.push([32 * (xmax - tree[i][0].x), 8 * tree[i][0].y]);
            } else {
                spec.push([32 * (xmax - tree[i].x), 8 * tree[i].y]);
            }
        }
        ret.push(draw_gate(spec));
        for (i = 1; i < ilen; i++) {
            ret.push(draw_boxes(tree[i], xmax));
        }
    } else {
        fname = tree.name;
        fx = 32 * (xmax - tree.x);
        fy = 8 * tree.y;
        ret.push(
            ['g', { transform: 'translate(' + fx + ',' + fy + ')'},
                ['title', fname],
                ['path', {d:'M 2,0 a 2,2 0 1 1 -4,0 2,2 0 1 1 4,0 z'}],
                ['text',
                    ['tspan', {
                        x:'-4', y:'4',
                        class:'pinname'},
                    fname
                    ]
                ]
            ]
        );
    }
    return ret;
}

function renderAssign (index, source) {
    var tree,
        state,
        xmax,
        svg = ['g'],
        grid = ['g'],
        // svgcontent,
        width,
        height,
        i,
        ilen,
        j,
        jlen;

    ilen = source.assign.length;
    state = { x: 0, y: 2, xmax: 0 };
    tree = source.assign;
    for (i = 0; i < ilen; i++) {
        state = render(tree[i], state);
        state.x++;
    }
    xmax = state.xmax + 3;

    for (i = 0; i < ilen; i++) {
        svg.push(draw_boxes(tree[i], xmax));
    }
    width  = 32 * (xmax + 1) + 1;
    height = 8 * (state.y + 1) - 7;
    ilen = 4 * (xmax + 1);
    jlen = state.y + 1;
    for (i = 0; i <= ilen; i++) {
        for (j = 0; j <= jlen; j++) {
            grid.push(['rect', {
                height: 1,
                width: 1,
                x: (i * 8 - 0.5),
                y: (j * 8 - 0.5),
                class: 'grid'
            }]);
        }
    }
    return ['svg', {
        id: 'svgcontent_' + index,
        viewBox: '0 0 ' + width + ' ' + height,
        width: width,
        height: height
    },
    insertSVGTemplateAssign(),
    ['g', {transform:'translate(0.5, 0.5)'}, grid, svg]
    ];
}

module.exports = renderAssign;

},{"./insert-svg-template-assign":13}],24:[function(require,module,exports){
'use strict';

function renderGapUses (text, lane) {
    var res = [];
    var Stack = (text || '').split('');
    var pos = 0;
    var next;
    var subCycle = false;
    while (Stack.length) {
        next = Stack.shift();
        if (next === '<') { // sub-cycles on
            subCycle = true;
            next = Stack.shift();
        }
        if (next === '>') { // sub-cycles off
            subCycle = false;
            next = Stack.shift();
        }
        if (subCycle) {
            pos += 1;
        } else {
            pos += (2 * lane.period);
        }
        if (next === '|') {
            res.push(['use', {
                'xlink:href': '#gap',
                transform: 'translate(' + (lane.xs * ((pos - (subCycle ? 0 : lane.period)) * lane.hscale - lane.phase)) + ')'
            }]);
        }
    }
    return res;
}

function renderGaps (source, index, lane) {
    var i, gaps;

    var res = [];
    if (source) {
        for (i in source) {
            lane.period = source[i].period ? source[i].period : 1;
            lane.phase  = (source[i].phase  ? source[i].phase * 2 : 0) + lane.xmin_cfg;

            gaps = renderGapUses(source[i].wave, lane);
            res = res.concat([['g', {
                id: 'wavegap_' + i + '_' + index,
                transform: 'translate(0,' + (lane.y0 + i * lane.yo) + ')'
            }].concat(gaps)]);
        }
    }
    return ['g', {id: 'wavegaps_' + index}].concat(res);
}

module.exports = renderGaps;

},{}],25:[function(require,module,exports){
'use strict';

var tspan = require('tspan');

function renderGroups (groups, index, lane) {
    var x, y, res = ['g'], ts;

    groups.forEach(function (e, i) {
        res.push(['path',
            {
                id: 'group_' + i + '_' + index,
                d: ('m ' + (e.x + 0.5) + ',' + (e.y * lane.yo + 3.5 + lane.yh0 + lane.yh1)
                    + ' c -3,0 -5,2 -5,5 l 0,' + (e.height * lane.yo - 16)
                    + ' c 0,3 2,5 5,5'),
                style: 'stroke:#0041c4;stroke-width:1;fill:none'
            }
        ]);

        if (e.name === undefined) { return; }

        x = (e.x - 10);
        y = (lane.yo * (e.y + (e.height / 2)) + lane.yh0 + lane.yh1);
        ts = tspan.parse(e.name);
        ts.unshift(
            'text',
            {
                'text-anchor': 'middle',
                class: 'info',
                'xml:space': 'preserve'
            }
        );
        res.push(['g', {transform: 'translate(' + x + ',' + y + ')'}, ['g', {transform: 'rotate(270)'}, ts]]);
    });
    return res;
}

module.exports = renderGroups;

},{"tspan":92}],26:[function(require,module,exports){
'use strict';

var tspan = require('tspan');
var textWidth = require('./text-width.js');

function renderLabel (p, text) {
    var w = textWidth(text, 8) + 2;
    return ['g', {
        transform:'translate(' + p.x + ',' + p.y + ')'
    },
    ['rect', {
        x: -(w >> 1),
        y: -5,
        width: w,
        height: 10,
        style: 'fill:#FFF;'
    }],
    ['text', {
        'text-anchor': 'middle',
        y: 3,
        style: 'font-size:8px;'
    }].concat(tspan.parse(text))
    ];
}

module.exports = renderLabel;

},{"./text-width.js":34,"tspan":92}],27:[function(require,module,exports){
'use strict';

var renderMarks = require('./render-marks');
var renderArcs = require('./render-arcs');
var renderGaps = require('./render-gaps');

function renderLanes (index, content, waveLanes, ret, source, lane) {
    return [renderMarks(content, index, lane, source)]
        .concat(waveLanes.res)
        .concat([renderArcs(ret.lanes, index, source, lane)])
        .concat([renderGaps(ret.lanes, index, lane)]);
}

module.exports = renderLanes;

},{"./render-arcs":22,"./render-gaps":24,"./render-marks":28}],28:[function(require,module,exports){
'use strict';

var tspan = require('tspan');

function captext (cxt, anchor, y) {
    if (cxt[anchor] && cxt[anchor].text) {
        return [
            ['text', {
                x: cxt.xmax * cxt.xs / 2,
                y: y,
                fill: '#000',
                'text-anchor': 'middle',
                'xml:space': 'preserve'
            }].concat(tspan.parse(cxt[anchor].text))
        ];
    }
    return [];
}

function ticktock (cxt, ref1, ref2, x, dx, y, len) {
    var step = 1;
    var offset;
    var dp = 0;
    var val;
    var L = [];
    var tmp;
    var i;

    if (cxt[ref1] === undefined || cxt[ref1][ref2] === undefined) { return []; }
    val = cxt[ref1][ref2];
    if (typeof val === 'string') {
        val = val.trim().split(/\s+/);
    } else if (typeof val === 'number' || typeof val === 'boolean') {
        offset = Number(val);
        val = [];
        for (i = 0; i < len; i += 1) {
            val.push(i + offset);
        }
    }
    if (Object.prototype.toString.call(val) === '[object Array]') {
        if (val.length === 0) {
            return [];
        } else if (val.length === 1) {
            offset = Number(val[0]);
            if (isNaN(offset)) {
                L = val;
            } else {
                for (i = 0; i < len; i += 1) {
                    L[i] = i + offset;
                }
            }
        } else if (val.length === 2) {
            offset = Number(val[0]);
            step   = Number(val[1]);
            tmp = val[1].split('.');
            if ( tmp.length === 2 ) {
                dp = tmp[1].length;
            }
            if (isNaN(offset) || isNaN(step)) {
                L = val;
            } else {
                offset = step * offset;
                for (i = 0; i < len; i += 1) {
                    L[i] = (step * i + offset).toFixed(dp);
                }
            }
        } else {
            L = val;
        }
    } else {
        return [];
    }

    var res = ['g', {
        class: 'muted',
        'text-anchor': 'middle',
        'xml:space': 'preserve'
    }];

    for (i = 0; i < len; i += 1) {
        res.push(['text', {x: i * dx + x, y: y}].concat(tspan.parse(L[i])));
    }
    return [res];
}

function renderMarks (content, index, lane, source) {
    var mstep  = 2 * (lane.hscale);
    var mmstep = mstep * lane.xs;
    var marks  = lane.xmax / mstep;
    var gy     = content.length * lane.yo;

    var i;
    var res = ['g', {id: ('gmarks_' + index)}];
    var gmarkLines = ['g', {style: 'stroke:#888;stroke-width:0.5;stroke-dasharray:1,3'}];
    if (!(source && source.config && source.config.marks === false)) {
        for (i = 0; i < (marks + 1); i += 1) {
            gmarkLines.push(['line', {
                id: 'gmark_' + i + '_' + index,
                x1: i * mmstep, y1: 0,
                x2: i * mmstep, y2: gy
            }]);
        }
        res = res.concat([gmarkLines]);
    }
    return res
        .concat(captext(lane, 'head', (lane.yh0 ? -33 : -13)))
        .concat(captext(lane, 'foot', gy + (lane.yf0 ? 45 : 25)))
        .concat(ticktock(lane, 'head', 'tick',          0, mmstep,      -5, marks + 1))
        .concat(ticktock(lane, 'head', 'tock', mmstep / 2, mmstep,      -5, marks))
        .concat(ticktock(lane, 'foot', 'tick',          0, mmstep, gy + 15, marks + 1))
        .concat(ticktock(lane, 'foot', 'tock', mmstep / 2, mmstep, gy + 15, marks));
}

module.exports = renderMarks;

},{"tspan":92}],29:[function(require,module,exports){
'use strict';

var render = require('bit-field/lib/render');

function renderReg (index, source) {
    return render(source.reg, source.config);
}

module.exports = renderReg;

},{"bit-field/lib/render":37}],30:[function(require,module,exports){
'use strict';

var rec = require('./rec');
var lane = require('./lane');
var parseConfig = require('./parse-config');
var parseWaveLanes = require('./parse-wave-lanes');
var renderGroups = require('./render-groups');
var renderLanes = require('./render-lanes');
var renderWaveLane = require('./render-wave-lane');

var insertSVGTemplate = require('./insert-svg-template');

function laneParamsFromSkin (index, source, lane, waveSkin) {

    if (index !== 0) { return; }

    var first, skin, socket;

    for (first in waveSkin) { break; }

    skin = waveSkin.default || waveSkin[first];

    if (source && source.config && source.config.skin && waveSkin[source.config.skin]) {
        skin = waveSkin[source.config.skin];
    }

    socket = skin[3][1][2][1];

    lane.xs     = Number(socket.width);
    lane.ys     = Number(socket.height);
    lane.xlabel = Number(socket.x);
    lane.ym     = Number(socket.y);
}

function renderSignal (index, source, waveSkin, notFirstSignal) {

    laneParamsFromSkin (index, source, lane, waveSkin);

    parseConfig(source, lane);
    var ret = rec(source.signal, {'x':0, 'y':0, 'xmax':0, 'width':[], 'lanes':[], 'groups':[]});
    var content = parseWaveLanes(ret.lanes, lane);

    var waveLanes = renderWaveLane(content, index, lane);
    var waveGroups = renderGroups(ret.groups, index, lane);

    var xmax = waveLanes.glengths.reduce(function (res, len, i) {
        return Math.max(res, len + ret.width[i]);
    }, 0);

    lane.xg = Math.ceil((xmax - lane.tgo) / lane.xs) * lane.xs;

    return insertSVGTemplate(
        index, source, lane, waveSkin, content,
        renderLanes(index, content, waveLanes, ret, source, lane),
        waveGroups,
        notFirstSignal
    );

}

module.exports = renderSignal;

},{"./insert-svg-template":14,"./lane":15,"./parse-config":16,"./parse-wave-lanes":18,"./rec":20,"./render-groups":25,"./render-lanes":27,"./render-wave-lane":33}],31:[function(require,module,exports){
'use strict';

var renderAny = require('./render-any.js');
var jsonmlParse = require('./create-element');

function renderWaveElement (index, source, outputElement, waveSkin, notFirstSignal) {

    // cleanup
    while (outputElement.childNodes.length) {
        outputElement.removeChild(outputElement.childNodes[0]);
    }

    outputElement.insertBefore(jsonmlParse(
        renderAny(index, source, waveSkin, notFirstSignal)
    ), null);
}

module.exports = renderWaveElement;

},{"./create-element":5,"./render-any.js":21}],32:[function(require,module,exports){
'use strict';

var renderWaveElement = require('./render-wave-element');

function renderWaveForm (index, source, output, notFirstSignal) {
    renderWaveElement(index, source, document.getElementById(output + index), window.WaveSkin, notFirstSignal);
}

module.exports = renderWaveForm;

/* eslint-env browser */

},{"./render-wave-element":31}],33:[function(require,module,exports){
'use strict';

var tspan = require('tspan');
var textWidth = require('./text-width.js');
var findLaneMarkers = require('./find-lane-markers');

function renderLaneUses (cont, lane) {
    var i, k;
    var res = [];
    var labels = [];
    if (cont[1]) {
        for (i = 0; i < cont[1].length; i += 1) {
            res.push(['use', {
                'xlink:href': '#' + cont[1][i],
                transform: 'translate(' + (i * lane.xs) + ')'
            }]);
        }
        if (cont[2] && cont[2].length) {
            labels = findLaneMarkers(cont[1]);
            if (labels.length) {
                for (k in labels) {
                    if (cont[2] && (cont[2][k] !== undefined)) {
                        res.push(['text', {
                            x: labels[k] * lane.xs + lane.xlabel,
                            y: lane.ym,
                            'text-anchor': 'middle',
                            'xml:space': 'preserve'
                        }].concat(tspan.parse(cont[2][k])));
                    }
                }
            }
        }
    }
    return res;
}

function renderWaveLane (content, index, lane) {
    var // i,
        j,
        name,
        xoffset,
        xmax     = 0,
        xgmax    = 0,
        glengths = [];

    var res = [];

    for (j = 0; j < content.length; j += 1) {
        name = content[j][0][0];
        if (name) { // check name

            xoffset = content[j][0][1];
            xoffset = (xoffset > 0)
                ? (Math.ceil(2 * xoffset) - 2 * xoffset)
                : (-2 * xoffset);

            res.push(['g', {
                id: 'wavelane_' + j + '_' + index,
                transform: 'translate(0,' + ((lane.y0) + j * lane.yo) + ')'
            },
            ['text', {
                x: lane.tgo,
                y: lane.ym,
                class: 'info',
                'text-anchor': 'end',
                'xml:space': 'preserve'
            }].concat(tspan.parse(name)),
            ['g', {
                id: 'wavelane_draw_' + j + '_' + index,
                transform: 'translate(' + (xoffset * lane.xs) + ', 0)'
            }].concat(renderLaneUses(content[j], lane))
            ]);

            xmax = Math.max(xmax, (content[j][1] || []).length);
            glengths.push(textWidth(name, 11));
        }
    }
    // xmax if no xmax_cfg,xmin_cfg, else set to config
    lane.xmax = Math.min(xmax, lane.xmax_cfg - lane.xmin_cfg);
    lane.xg = xgmax + 20;
    return {glengths: glengths, res: res};
}

module.exports = renderWaveLane;

},{"./find-lane-markers":8,"./text-width.js":34,"tspan":92}],34:[function(require,module,exports){
'use strict';

var charWidth = require('./char-width.json');

/**
    Calculates text string width in pixels.

    @param {String} str text string to be measured
    @param {Number} size font size used
    @return {Number} text string width
*/

module.exports = function (str, size) {
    var i, len, c, w, width;
    size = size || 11; // default size 11pt
    len = str.length;
    width = 0;
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        w = charWidth.chars[c];
        if (w === undefined) {
            w = charWidth.other;
        }
        width += w;
    }
    return (width * size) / 100; // normalize
};

},{"./char-width.json":4}],35:[function(require,module,exports){
'use strict';

module.exports = {
    svg: 'http://www.w3.org/2000/svg',
    xlink: 'http://www.w3.org/1999/xlink',
    xmlns: 'http://www.w3.org/XML/1998/namespace'
};

},{}],36:[function(require,module,exports){
module.exports = r => {
  const n = process.versions.node.split('.').map(x => parseInt(x, 10))
  r = r.split('.').map(x => parseInt(x, 10))
  return n[0] > r[0] || (n[0] === r[0] && (n[1] > r[1] || (n[1] === r[1] && n[2] >= r[2])))
}

},{}],37:[function(require,module,exports){
'use strict';

var tspan = require('tspan');

var colors = {
    2: 0,
    3: 80,
    4: 170,
    5: 45,
    6: 126,
    7: 215
};

function typeStyle (t) {
    var color = colors[t];
    return (color !== undefined) ? ';fill:hsl(' + color + ',100%,50%)' : '';
}

function t (x, y) {
    return 'translate(' + x + ',' + y + ')';
}

function text (body, x, y) {
    var attr = {};
    if (x) { attr.x = x; }
    if (y) { attr.y = y; }
    return ['text', attr].concat(tspan.parse(body));
}

function isIntGTorDefault(val, min, def) {
    return (typeof val === 'number' && val > min) ? (val |0) : def;
}

function getSVG (w, h) {
    return ['svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        width: w,
        height: h,
        viewBox: [0, 0, w, h].join(' ')
    }];
}

function hline (len, x, y) {
    var opt = {};
    if (x) {
        opt.x1 = x;
        opt.x2 = x + len;
    } else {
        opt.x2 = len;
    }
    if (y) {
        opt.y1 = y;
        opt.y2 = y;
    }
    return ['line', opt];
}

function vline (len, x, y) {
    var opt = {};
    if (x) {
        opt.x1 = x;
        opt.x2 = x;
    }
    if (y) {
        opt.y1 = y;
        opt.y2 = y + len;
    } else {
        opt.y2 = len;
    }
    return ['line', opt];
}

function getLabel (val, x, y, step, len) {
    var i, res = ['g', {}];
    if (typeof val === 'number') {
        for (i = 0; i < len; i++) {
            res.push(text(
                (val >> i) & 1,
                x + step * (len / 2 - i - 0.5),
                y
            ));
        }
        return res;
    }
    return text(val, x, y);
}

function getAttr (e, opt, step, lsbm, msbm) {
    var x = step * (opt.mod - ((msbm + lsbm) / 2) - 1);
    if (Array.isArray(e.attr)) {
        return e.attr.reduce(function (prev, a, i) {
            if (a === undefined || a === null) {
                return prev;
            }
            return prev.concat([getLabel(a, x, 16 * i, step, e.bits)]);
        }, ['g', {}]);
    }
    return getLabel(e.attr, x, 0, step, e.bits);
}

function labelArr (desc, opt) {
    var step = opt.hspace / opt.mod;
    var bits  = ['g', {transform: t(step / 2, opt.vspace / 5)}];
    var names = ['g', {transform: t(step / 2, opt.vspace / 2 + 4)}];
    var attrs = ['g', {transform: t(step / 2, opt.vspace)}];
    var blanks = ['g', {transform: t(0, opt.vspace / 4)}];
    desc.forEach(function (e) {
        var lsbm, msbm, lsb, msb;
        lsbm = 0;
        msbm = opt.mod - 1;
        lsb = opt.index * opt.mod;
        msb = (opt.index + 1) * opt.mod - 1;
        if (((e.lsb / opt.mod) >> 0) === opt.index) {
            lsbm = e.lsbm;
            lsb = e.lsb;
            if (((e.msb / opt.mod) >> 0) === opt.index) {
                msb = e.msb;
                msbm = e.msbm;
            }
        } else {
            if (((e.msb / opt.mod) >> 0) === opt.index) {
                msb = e.msb;
                msbm = e.msbm;
            } else if (!(lsb > e.lsb && msb < e.msb)) {
                return;
            }
        }
        if (!opt.compact) {
            bits.push(text(lsb, step * (opt.mod - lsbm - 1)));
            if (lsbm !== msbm) {
                bits.push(text(msb, step * (opt.mod - msbm - 1)));
            }
        }
        if (e.name) {
            names.push(getLabel(
                e.name,
                step * (opt.mod - ((msbm + lsbm) / 2) - 1),
                0,
                step,
                e.bits
            ));
        }

        if ((e.name === undefined) || (e.type !== undefined)) {
            blanks.push(['rect', {
                style: 'fill-opacity:0.1' + typeStyle(e.type),
                x: step * (opt.mod - msbm - 1),
                y: 0,
                width: step * (msbm - lsbm + 1),
                height: opt.vspace / 2
            }]);
        }
        if (e.attr !== undefined) {
            attrs.push(getAttr(e, opt, step, lsbm, msbm));
        }
    });
    return ['g', blanks, bits, names, attrs];
}

function compactLabels(desc, opt) {
    var step = opt.hspace / opt.mod;
    var tx = 4.5 + opt.compact*20 + step/2;
    var labels = ['g', {
        'text-anchor': 'middle',
        'font-size': opt.fontsize,
        'font-family': opt.fontfamily || 'sans-serif',
        'font-weight': opt.fontweight || 'normal'
    }];
    for (var i = 0; i < opt.mod; i++) {
        labels.push(text(opt.mod - 1 - i, tx+ step*i, opt.fontsize));
    }
    return labels;
}

function cage (desc, opt) {
    var hspace = opt.hspace;
    var vspace = opt.vspace;
    var mod = opt.mod;
    var res = ['g', {
        transform: t(0, vspace / 4),
        stroke: 'black',
        'stroke-width': 1,
        'stroke-linecap': 'round'
    }];

    res.push(hline(hspace));
    res.push(vline(vspace / 2));
    res.push(hline(hspace, 0, vspace / 2));

    var i = opt.index * opt.mod, j = opt.mod;
    do {
        if ((j === opt.mod) || desc.some(function (e) { return (e.lsb === i); })) {
            res.push(vline((vspace / 2), j * (hspace / mod)));
        } else {
            res.push(vline((vspace / 16), j * (hspace / mod)));
            res.push(vline((vspace / 16), j * (hspace / mod), vspace * 7 / 16));
        }
        i++; j--;
    } while (j);
    return res;
}


function lane (desc, opt) {
    var ty = (opt.lanes - opt.index - 1) * opt.vspace + 0.5;
    var tx = 4.5;
    if (opt.compact) {
        ty = (opt.lanes - opt.index - 1) * opt.vspace / 2 + opt.fontsize/2;
        tx += 20;
    }
    var lane = ['g', {
        transform: t(tx, ty),
        'text-anchor': 'middle',
        'font-size': opt.fontsize,
        'font-family': opt.fontfamily || 'sans-serif',
        'font-weight': opt.fontweight || 'normal'
    },
    cage(desc, opt),
    labelArr(desc, opt)
    ];
    if (opt.compact) {
        lane.push(['g', text(opt.index, -10, opt.vspace/2 + 4)]);
    }
    return lane;
}

function render (desc, opt) {
    opt = (typeof opt === 'object') ? opt : {};

    opt.vspace = isIntGTorDefault(opt.vspace, 19, 80);
    opt.hspace = isIntGTorDefault(opt.hspace, 39, 800);
    opt.lanes = isIntGTorDefault(opt.lanes, 0, 1);
    opt.bits = isIntGTorDefault(opt.bits, 4, 32);
    opt.fontsize = isIntGTorDefault(opt.fontsize, 5, 14);

    opt.compact = opt.compact || false;
    opt.bigendian = opt.bigendian || false;

    var attributes = desc.reduce(function (prev, cur) {
        return Math.max(prev, (Array.isArray(cur.attr)) ? cur.attr.length : 0);
    }, 0) * 16;

    var width = opt.hspace + 9;
    var height = (opt.vspace + attributes) * opt.lanes + 5;
    if (opt.compact) {
        width += 20;
        height = (opt.vspace + attributes) * (opt.lanes + 1)/2 + opt.fontsize;
    }
    var res = getSVG(width, height);

    var lsb = 0;
    var mod = opt.bits / opt.lanes;
    opt.mod = mod |0;

    desc.forEach(function (e) {
        e.lsb = lsb;
        e.lsbm = lsb % mod;
        lsb += e.bits;
        e.msb = lsb - 1;
        e.msbm = e.msb % mod;
    });

    var i;
    for (i = 0; i < opt.lanes; i++) {
        opt.index = i;
        res.push(lane(desc, opt));
    }
    if (opt.compact) {
        res.push(compactLabels(desc, opt));
    }
    return res;
}

module.exports = render;

},{"tspan":92}],38:[function(require,module,exports){
'use strict';

const preserveCamelCase = string => {
	let isLastCharLower = false;
	let isLastCharUpper = false;
	let isLastLastCharUpper = false;

	for (let i = 0; i < string.length; i++) {
		const character = string[i];

		if (isLastCharLower && /[a-zA-Z]/.test(character) && character.toUpperCase() === character) {
			string = string.slice(0, i) + '-' + string.slice(i);
			isLastCharLower = false;
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = true;
			i++;
		} else if (isLastCharUpper && isLastLastCharUpper && /[a-zA-Z]/.test(character) && character.toLowerCase() === character) {
			string = string.slice(0, i - 1) + '-' + string.slice(i - 1);
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = false;
			isLastCharLower = true;
		} else {
			isLastCharLower = character.toLowerCase() === character && character.toUpperCase() !== character;
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = character.toUpperCase() === character && character.toLowerCase() !== character;
		}
	}

	return string;
};

const camelCase = (input, options) => {
	if (!(typeof input === 'string' || Array.isArray(input))) {
		throw new TypeError('Expected the input to be `string | string[]`');
	}

	options = Object.assign({
		pascalCase: false
	}, options);

	const postProcess = x => options.pascalCase ? x.charAt(0).toUpperCase() + x.slice(1) : x;

	if (Array.isArray(input)) {
		input = input.map(x => x.trim())
			.filter(x => x.length)
			.join('-');
	} else {
		input = input.trim();
	}

	if (input.length === 0) {
		return '';
	}

	if (input.length === 1) {
		return options.pascalCase ? input.toUpperCase() : input.toLowerCase();
	}

	const hasUpperCase = input !== input.toLowerCase();

	if (hasUpperCase) {
		input = preserveCamelCase(input);
	}

	input = input
		.replace(/^[_.\- ]+/, '')
		.toLowerCase()
		.replace(/[_.\- ]+(\w|$)/g, (_, p1) => p1.toUpperCase())
		.replace(/\d+(\w|$)/g, m => m.toUpperCase());

	return postProcess(input);
};

module.exports = camelCase;
// TODO: Remove this for the next major release
module.exports.default = camelCase;

},{}],39:[function(require,module,exports){
'use strict';
module.exports = function (str, sep) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	sep = typeof sep === 'undefined' ? '_' : sep;

	return str
		.replace(/([a-z\d])([A-Z])/g, '$1' + sep + '$2')
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + sep + '$2')
		.toLowerCase();
};

},{}],40:[function(require,module,exports){
'use strict'

const fs = require('graceful-fs')
const path = require('path')
const mkdirsSync = require('../mkdirs').mkdirsSync
const utimesMillisSync = require('../util/utimes').utimesMillisSync
const stat = require('../util/stat')

function copySync (src, dest, opts) {
  if (typeof opts === 'function') {
    opts = { filter: opts }
  }

  opts = opts || {}
  opts.clobber = 'clobber' in opts ? !!opts.clobber : true // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`)
  }

  const { srcStat, destStat } = stat.checkPathsSync(src, dest, 'copy')
  stat.checkParentPathsSync(src, srcStat, dest, 'copy')
  return handleFilterAndCopy(destStat, src, dest, opts)
}

function handleFilterAndCopy (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  const destParent = path.dirname(dest)
  if (!fs.existsSync(destParent)) mkdirsSync(destParent)
  return startCopy(destStat, src, dest, opts)
}

function startCopy (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  return getStats(destStat, src, dest, opts)
}

function getStats (destStat, src, dest, opts) {
  const statSync = opts.dereference ? fs.statSync : fs.lstatSync
  const srcStat = statSync(src)

  if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts)
  else if (srcStat.isFile() ||
           srcStat.isCharacterDevice() ||
           srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts)
  else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts)
}

function onFile (srcStat, destStat, src, dest, opts) {
  if (!destStat) return copyFile(srcStat, src, dest, opts)
  return mayCopyFile(srcStat, src, dest, opts)
}

function mayCopyFile (srcStat, src, dest, opts) {
  if (opts.overwrite) {
    fs.unlinkSync(dest)
    return copyFile(srcStat, src, dest, opts)
  } else if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`)
  }
}

function copyFile (srcStat, src, dest, opts) {
  fs.copyFileSync(src, dest)
  if (opts.preserveTimestamps) handleTimestamps(srcStat.mode, src, dest)
  return setDestMode(dest, srcStat.mode)
}

function handleTimestamps (srcMode, src, dest) {
  // Make sure the file is writable before setting the timestamp
  // otherwise open fails with EPERM when invoked with 'r+'
  // (through utimes call)
  if (fileIsNotWritable(srcMode)) makeFileWritable(dest, srcMode)
  return setDestTimestamps(src, dest)
}

function fileIsNotWritable (srcMode) {
  return (srcMode & 0o200) === 0
}

function makeFileWritable (dest, srcMode) {
  return setDestMode(dest, srcMode | 0o200)
}

function setDestMode (dest, srcMode) {
  return fs.chmodSync(dest, srcMode)
}

function setDestTimestamps (src, dest) {
  // The initial srcStat.atime cannot be trusted
  // because it is modified by the read(2) system call
  // (See https://nodejs.org/api/fs.html#fs_stat_time_values)
  const updatedSrcStat = fs.statSync(src)
  return utimesMillisSync(dest, updatedSrcStat.atime, updatedSrcStat.mtime)
}

function onDir (srcStat, destStat, src, dest, opts) {
  if (!destStat) return mkDirAndCopy(srcStat.mode, src, dest, opts)
  if (destStat && !destStat.isDirectory()) {
    throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`)
  }
  return copyDir(src, dest, opts)
}

function mkDirAndCopy (srcMode, src, dest, opts) {
  fs.mkdirSync(dest)
  copyDir(src, dest, opts)
  return setDestMode(dest, srcMode)
}

function copyDir (src, dest, opts) {
  fs.readdirSync(src).forEach(item => copyDirItem(item, src, dest, opts))
}

function copyDirItem (item, src, dest, opts) {
  const srcItem = path.join(src, item)
  const destItem = path.join(dest, item)
  const { destStat } = stat.checkPathsSync(srcItem, destItem, 'copy')
  return startCopy(destStat, srcItem, destItem, opts)
}

function onLink (destStat, src, dest, opts) {
  let resolvedSrc = fs.readlinkSync(src)
  if (opts.dereference) {
    resolvedSrc = path.resolve(process.cwd(), resolvedSrc)
  }

  if (!destStat) {
    return fs.symlinkSync(resolvedSrc, dest)
  } else {
    let resolvedDest
    try {
      resolvedDest = fs.readlinkSync(dest)
    } catch (err) {
      // dest exists and is a regular file or directory,
      // Windows may throw UNKNOWN error. If dest already exists,
      // fs throws error anyway, so no need to guard against it here.
      if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return fs.symlinkSync(resolvedSrc, dest)
      throw err
    }
    if (opts.dereference) {
      resolvedDest = path.resolve(process.cwd(), resolvedDest)
    }
    if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) {
      throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`)
    }

    // prevent copy if src is a subdir of dest since unlinking
    // dest in this case would result in removing src contents
    // and therefore a broken symlink would be created.
    if (fs.statSync(dest).isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) {
      throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`)
    }
    return copyLink(resolvedSrc, dest)
  }
}

function copyLink (resolvedSrc, dest) {
  fs.unlinkSync(dest)
  return fs.symlinkSync(resolvedSrc, dest)
}

module.exports = copySync

},{"../mkdirs":57,"../util/stat":67,"../util/utimes":68,"graceful-fs":74,"path":undefined}],41:[function(require,module,exports){
'use strict'

module.exports = {
  copySync: require('./copy-sync')
}

},{"./copy-sync":40}],42:[function(require,module,exports){
'use strict'

const fs = require('graceful-fs')
const path = require('path')
const mkdirs = require('../mkdirs').mkdirs
const pathExists = require('../path-exists').pathExists
const utimesMillis = require('../util/utimes').utimesMillis
const stat = require('../util/stat')

function copy (src, dest, opts, cb) {
  if (typeof opts === 'function' && !cb) {
    cb = opts
    opts = {}
  } else if (typeof opts === 'function') {
    opts = { filter: opts }
  }

  cb = cb || function () {}
  opts = opts || {}

  opts.clobber = 'clobber' in opts ? !!opts.clobber : true // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`)
  }

  stat.checkPaths(src, dest, 'copy', (err, stats) => {
    if (err) return cb(err)
    const { srcStat, destStat } = stats
    stat.checkParentPaths(src, srcStat, dest, 'copy', err => {
      if (err) return cb(err)
      if (opts.filter) return handleFilter(checkParentDir, destStat, src, dest, opts, cb)
      return checkParentDir(destStat, src, dest, opts, cb)
    })
  })
}

function checkParentDir (destStat, src, dest, opts, cb) {
  const destParent = path.dirname(dest)
  pathExists(destParent, (err, dirExists) => {
    if (err) return cb(err)
    if (dirExists) return startCopy(destStat, src, dest, opts, cb)
    mkdirs(destParent, err => {
      if (err) return cb(err)
      return startCopy(destStat, src, dest, opts, cb)
    })
  })
}

function handleFilter (onInclude, destStat, src, dest, opts, cb) {
  Promise.resolve(opts.filter(src, dest)).then(include => {
    if (include) return onInclude(destStat, src, dest, opts, cb)
    return cb()
  }, error => cb(error))
}

function startCopy (destStat, src, dest, opts, cb) {
  if (opts.filter) return handleFilter(getStats, destStat, src, dest, opts, cb)
  return getStats(destStat, src, dest, opts, cb)
}

function getStats (destStat, src, dest, opts, cb) {
  const stat = opts.dereference ? fs.stat : fs.lstat
  stat(src, (err, srcStat) => {
    if (err) return cb(err)

    if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts, cb)
    else if (srcStat.isFile() ||
             srcStat.isCharacterDevice() ||
             srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts, cb)
    else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts, cb)
  })
}

function onFile (srcStat, destStat, src, dest, opts, cb) {
  if (!destStat) return copyFile(srcStat, src, dest, opts, cb)
  return mayCopyFile(srcStat, src, dest, opts, cb)
}

function mayCopyFile (srcStat, src, dest, opts, cb) {
  if (opts.overwrite) {
    fs.unlink(dest, err => {
      if (err) return cb(err)
      return copyFile(srcStat, src, dest, opts, cb)
    })
  } else if (opts.errorOnExist) {
    return cb(new Error(`'${dest}' already exists`))
  } else return cb()
}

function copyFile (srcStat, src, dest, opts, cb) {
  fs.copyFile(src, dest, err => {
    if (err) return cb(err)
    if (opts.preserveTimestamps) return handleTimestampsAndMode(srcStat.mode, src, dest, cb)
    return setDestMode(dest, srcStat.mode, cb)
  })
}

function handleTimestampsAndMode (srcMode, src, dest, cb) {
  // Make sure the file is writable before setting the timestamp
  // otherwise open fails with EPERM when invoked with 'r+'
  // (through utimes call)
  if (fileIsNotWritable(srcMode)) {
    return makeFileWritable(dest, srcMode, err => {
      if (err) return cb(err)
      return setDestTimestampsAndMode(srcMode, src, dest, cb)
    })
  }
  return setDestTimestampsAndMode(srcMode, src, dest, cb)
}

function fileIsNotWritable (srcMode) {
  return (srcMode & 0o200) === 0
}

function makeFileWritable (dest, srcMode, cb) {
  return setDestMode(dest, srcMode | 0o200, cb)
}

function setDestTimestampsAndMode (srcMode, src, dest, cb) {
  setDestTimestamps(src, dest, err => {
    if (err) return cb(err)
    return setDestMode(dest, srcMode, cb)
  })
}

function setDestMode (dest, srcMode, cb) {
  return fs.chmod(dest, srcMode, cb)
}

function setDestTimestamps (src, dest, cb) {
  // The initial srcStat.atime cannot be trusted
  // because it is modified by the read(2) system call
  // (See https://nodejs.org/api/fs.html#fs_stat_time_values)
  fs.stat(src, (err, updatedSrcStat) => {
    if (err) return cb(err)
    return utimesMillis(dest, updatedSrcStat.atime, updatedSrcStat.mtime, cb)
  })
}

function onDir (srcStat, destStat, src, dest, opts, cb) {
  if (!destStat) return mkDirAndCopy(srcStat.mode, src, dest, opts, cb)
  if (destStat && !destStat.isDirectory()) {
    return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`))
  }
  return copyDir(src, dest, opts, cb)
}

function mkDirAndCopy (srcMode, src, dest, opts, cb) {
  fs.mkdir(dest, err => {
    if (err) return cb(err)
    copyDir(src, dest, opts, err => {
      if (err) return cb(err)
      return setDestMode(dest, srcMode, cb)
    })
  })
}

function copyDir (src, dest, opts, cb) {
  fs.readdir(src, (err, items) => {
    if (err) return cb(err)
    return copyDirItems(items, src, dest, opts, cb)
  })
}

function copyDirItems (items, src, dest, opts, cb) {
  const item = items.pop()
  if (!item) return cb()
  return copyDirItem(items, item, src, dest, opts, cb)
}

function copyDirItem (items, item, src, dest, opts, cb) {
  const srcItem = path.join(src, item)
  const destItem = path.join(dest, item)
  stat.checkPaths(srcItem, destItem, 'copy', (err, stats) => {
    if (err) return cb(err)
    const { destStat } = stats
    startCopy(destStat, srcItem, destItem, opts, err => {
      if (err) return cb(err)
      return copyDirItems(items, src, dest, opts, cb)
    })
  })
}

function onLink (destStat, src, dest, opts, cb) {
  fs.readlink(src, (err, resolvedSrc) => {
    if (err) return cb(err)
    if (opts.dereference) {
      resolvedSrc = path.resolve(process.cwd(), resolvedSrc)
    }

    if (!destStat) {
      return fs.symlink(resolvedSrc, dest, cb)
    } else {
      fs.readlink(dest, (err, resolvedDest) => {
        if (err) {
          // dest exists and is a regular file or directory,
          // Windows may throw UNKNOWN error. If dest already exists,
          // fs throws error anyway, so no need to guard against it here.
          if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return fs.symlink(resolvedSrc, dest, cb)
          return cb(err)
        }
        if (opts.dereference) {
          resolvedDest = path.resolve(process.cwd(), resolvedDest)
        }
        if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) {
          return cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`))
        }

        // do not copy if src is a subdir of dest since unlinking
        // dest in this case would result in removing src contents
        // and therefore a broken symlink would be created.
        if (destStat.isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) {
          return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`))
        }
        return copyLink(resolvedSrc, dest, cb)
      })
    }
  })
}

function copyLink (resolvedSrc, dest, cb) {
  fs.unlink(dest, err => {
    if (err) return cb(err)
    return fs.symlink(resolvedSrc, dest, cb)
  })
}

module.exports = copy

},{"../mkdirs":57,"../path-exists":64,"../util/stat":67,"../util/utimes":68,"graceful-fs":74,"path":undefined}],43:[function(require,module,exports){
'use strict'

const u = require('universalify').fromCallback
module.exports = {
  copy: u(require('./copy'))
}

},{"./copy":42,"universalify":71}],44:[function(require,module,exports){
'use strict'

const u = require('universalify').fromCallback
const fs = require('graceful-fs')
const path = require('path')
const mkdir = require('../mkdirs')
const remove = require('../remove')

const emptyDir = u(function emptyDir (dir, callback) {
  callback = callback || function () {}
  fs.readdir(dir, (err, items) => {
    if (err) return mkdir.mkdirs(dir, callback)

    items = items.map(item => path.join(dir, item))

    deleteItem()

    function deleteItem () {
      const item = items.pop()
      if (!item) return callback()
      remove.remove(item, err => {
        if (err) return callback(err)
        deleteItem()
      })
    }
  })
})

function emptyDirSync (dir) {
  let items
  try {
    items = fs.readdirSync(dir)
  } catch {
    return mkdir.mkdirsSync(dir)
  }

  items.forEach(item => {
    item = path.join(dir, item)
    remove.removeSync(item)
  })
}

module.exports = {
  emptyDirSync,
  emptydirSync: emptyDirSync,
  emptyDir,
  emptydir: emptyDir
}

},{"../mkdirs":57,"../remove":65,"graceful-fs":74,"path":undefined,"universalify":71}],45:[function(require,module,exports){
'use strict'

const u = require('universalify').fromCallback
const path = require('path')
const fs = require('graceful-fs')
const mkdir = require('../mkdirs')

function createFile (file, callback) {
  function makeFile () {
    fs.writeFile(file, '', err => {
      if (err) return callback(err)
      callback()
    })
  }

  fs.stat(file, (err, stats) => { // eslint-disable-line handle-callback-err
    if (!err && stats.isFile()) return callback()
    const dir = path.dirname(file)
    fs.stat(dir, (err, stats) => {
      if (err) {
        // if the directory doesn't exist, make it
        if (err.code === 'ENOENT') {
          return mkdir.mkdirs(dir, err => {
            if (err) return callback(err)
            makeFile()
          })
        }
        return callback(err)
      }

      if (stats.isDirectory()) makeFile()
      else {
        // parent is not a directory
        // This is just to cause an internal ENOTDIR error to be thrown
        fs.readdir(dir, err => {
          if (err) return callback(err)
        })
      }
    })
  })
}

function createFileSync (file) {
  let stats
  try {
    stats = fs.statSync(file)
  } catch {}
  if (stats && stats.isFile()) return

  const dir = path.dirname(file)
  try {
    if (!fs.statSync(dir).isDirectory()) {
      // parent is not a directory
      // This is just to cause an internal ENOTDIR error to be thrown
      fs.readdirSync(dir)
    }
  } catch (err) {
    // If the stat call above failed because the directory doesn't exist, create it
    if (err && err.code === 'ENOENT') mkdir.mkdirsSync(dir)
    else throw err
  }

  fs.writeFileSync(file, '')
}

module.exports = {
  createFile: u(createFile),
  createFileSync
}

},{"../mkdirs":57,"graceful-fs":74,"path":undefined,"universalify":71}],46:[function(require,module,exports){
'use strict'

const file = require('./file')
const link = require('./link')
const symlink = require('./symlink')

module.exports = {
  // file
  createFile: file.createFile,
  createFileSync: file.createFileSync,
  ensureFile: file.createFile,
  ensureFileSync: file.createFileSync,
  // link
  createLink: link.createLink,
  createLinkSync: link.createLinkSync,
  ensureLink: link.createLink,
  ensureLinkSync: link.createLinkSync,
  // symlink
  createSymlink: symlink.createSymlink,
  createSymlinkSync: symlink.createSymlinkSync,
  ensureSymlink: symlink.createSymlink,
  ensureSymlinkSync: symlink.createSymlinkSync
}

},{"./file":45,"./link":47,"./symlink":50}],47:[function(require,module,exports){
'use strict'

const u = require('universalify').fromCallback
const path = require('path')
const fs = require('graceful-fs')
const mkdir = require('../mkdirs')
const pathExists = require('../path-exists').pathExists

function createLink (srcpath, dstpath, callback) {
  function makeLink (srcpath, dstpath) {
    fs.link(srcpath, dstpath, err => {
      if (err) return callback(err)
      callback(null)
    })
  }

  pathExists(dstpath, (err, destinationExists) => {
    if (err) return callback(err)
    if (destinationExists) return callback(null)
    fs.lstat(srcpath, (err) => {
      if (err) {
        err.message = err.message.replace('lstat', 'ensureLink')
        return callback(err)
      }

      const dir = path.dirname(dstpath)
      pathExists(dir, (err, dirExists) => {
        if (err) return callback(err)
        if (dirExists) return makeLink(srcpath, dstpath)
        mkdir.mkdirs(dir, err => {
          if (err) return callback(err)
          makeLink(srcpath, dstpath)
        })
      })
    })
  })
}

function createLinkSync (srcpath, dstpath) {
  const destinationExists = fs.existsSync(dstpath)
  if (destinationExists) return undefined

  try {
    fs.lstatSync(srcpath)
  } catch (err) {
    err.message = err.message.replace('lstat', 'ensureLink')
    throw err
  }

  const dir = path.dirname(dstpath)
  const dirExists = fs.existsSync(dir)
  if (dirExists) return fs.linkSync(srcpath, dstpath)
  mkdir.mkdirsSync(dir)

  return fs.linkSync(srcpath, dstpath)
}

module.exports = {
  createLink: u(createLink),
  createLinkSync
}

},{"../mkdirs":57,"../path-exists":64,"graceful-fs":74,"path":undefined,"universalify":71}],48:[function(require,module,exports){
'use strict'

const path = require('path')
const fs = require('graceful-fs')
const pathExists = require('../path-exists').pathExists

/**
 * Function that returns two types of paths, one relative to symlink, and one
 * relative to the current working directory. Checks if path is absolute or
 * relative. If the path is relative, this function checks if the path is
 * relative to symlink or relative to current working directory. This is an
 * initiative to find a smarter `srcpath` to supply when building symlinks.
 * This allows you to determine which path to use out of one of three possible
 * types of source paths. The first is an absolute path. This is detected by
 * `path.isAbsolute()`. When an absolute path is provided, it is checked to
 * see if it exists. If it does it's used, if not an error is returned
 * (callback)/ thrown (sync). The other two options for `srcpath` are a
 * relative url. By default Node's `fs.symlink` works by creating a symlink
 * using `dstpath` and expects the `srcpath` to be relative to the newly
 * created symlink. If you provide a `srcpath` that does not exist on the file
 * system it results in a broken symlink. To minimize this, the function
 * checks to see if the 'relative to symlink' source file exists, and if it
 * does it will use it. If it does not, it checks if there's a file that
 * exists that is relative to the current working directory, if does its used.
 * This preserves the expectations of the original fs.symlink spec and adds
 * the ability to pass in `relative to current working direcotry` paths.
 */

function symlinkPaths (srcpath, dstpath, callback) {
  if (path.isAbsolute(srcpath)) {
    return fs.lstat(srcpath, (err) => {
      if (err) {
        err.message = err.message.replace('lstat', 'ensureSymlink')
        return callback(err)
      }
      return callback(null, {
        toCwd: srcpath,
        toDst: srcpath
      })
    })
  } else {
    const dstdir = path.dirname(dstpath)
    const relativeToDst = path.join(dstdir, srcpath)
    return pathExists(relativeToDst, (err, exists) => {
      if (err) return callback(err)
      if (exists) {
        return callback(null, {
          toCwd: relativeToDst,
          toDst: srcpath
        })
      } else {
        return fs.lstat(srcpath, (err) => {
          if (err) {
            err.message = err.message.replace('lstat', 'ensureSymlink')
            return callback(err)
          }
          return callback(null, {
            toCwd: srcpath,
            toDst: path.relative(dstdir, srcpath)
          })
        })
      }
    })
  }
}

function symlinkPathsSync (srcpath, dstpath) {
  let exists
  if (path.isAbsolute(srcpath)) {
    exists = fs.existsSync(srcpath)
    if (!exists) throw new Error('absolute srcpath does not exist')
    return {
      toCwd: srcpath,
      toDst: srcpath
    }
  } else {
    const dstdir = path.dirname(dstpath)
    const relativeToDst = path.join(dstdir, srcpath)
    exists = fs.existsSync(relativeToDst)
    if (exists) {
      return {
        toCwd: relativeToDst,
        toDst: srcpath
      }
    } else {
      exists = fs.existsSync(srcpath)
      if (!exists) throw new Error('relative srcpath does not exist')
      return {
        toCwd: srcpath,
        toDst: path.relative(dstdir, srcpath)
      }
    }
  }
}

module.exports = {
  symlinkPaths,
  symlinkPathsSync
}

},{"../path-exists":64,"graceful-fs":74,"path":undefined}],49:[function(require,module,exports){
'use strict'

const fs = require('graceful-fs')

function symlinkType (srcpath, type, callback) {
  callback = (typeof type === 'function') ? type : callback
  type = (typeof type === 'function') ? false : type
  if (type) return callback(null, type)
  fs.lstat(srcpath, (err, stats) => {
    if (err) return callback(null, 'file')
    type = (stats && stats.isDirectory()) ? 'dir' : 'file'
    callback(null, type)
  })
}

function symlinkTypeSync (srcpath, type) {
  let stats

  if (type) return type
  try {
    stats = fs.lstatSync(srcpath)
  } catch {
    return 'file'
  }
  return (stats && stats.isDirectory()) ? 'dir' : 'file'
}

module.exports = {
  symlinkType,
  symlinkTypeSync
}

},{"graceful-fs":74}],50:[function(require,module,exports){
'use strict'

const u = require('universalify').fromCallback
const path = require('path')
const fs = require('graceful-fs')
const _mkdirs = require('../mkdirs')
const mkdirs = _mkdirs.mkdirs
const mkdirsSync = _mkdirs.mkdirsSync

const _symlinkPaths = require('./symlink-paths')
const symlinkPaths = _symlinkPaths.symlinkPaths
const symlinkPathsSync = _symlinkPaths.symlinkPathsSync

const _symlinkType = require('./symlink-type')
const symlinkType = _symlinkType.symlinkType
const symlinkTypeSync = _symlinkType.symlinkTypeSync

const pathExists = require('../path-exists').pathExists

function createSymlink (srcpath, dstpath, type, callback) {
  callback = (typeof type === 'function') ? type : callback
  type = (typeof type === 'function') ? false : type

  pathExists(dstpath, (err, destinationExists) => {
    if (err) return callback(err)
    if (destinationExists) return callback(null)
    symlinkPaths(srcpath, dstpath, (err, relative) => {
      if (err) return callback(err)
      srcpath = relative.toDst
      symlinkType(relative.toCwd, type, (err, type) => {
        if (err) return callback(err)
        const dir = path.dirname(dstpath)
        pathExists(dir, (err, dirExists) => {
          if (err) return callback(err)
          if (dirExists) return fs.symlink(srcpath, dstpath, type, callback)
          mkdirs(dir, err => {
            if (err) return callback(err)
            fs.symlink(srcpath, dstpath, type, callback)
          })
        })
      })
    })
  })
}

function createSymlinkSync (srcpath, dstpath, type) {
  const destinationExists = fs.existsSync(dstpath)
  if (destinationExists) return undefined

  const relative = symlinkPathsSync(srcpath, dstpath)
  srcpath = relative.toDst
  type = symlinkTypeSync(relative.toCwd, type)
  const dir = path.dirname(dstpath)
  const exists = fs.existsSync(dir)
  if (exists) return fs.symlinkSync(srcpath, dstpath, type)
  mkdirsSync(dir)
  return fs.symlinkSync(srcpath, dstpath, type)
}

module.exports = {
  createSymlink: u(createSymlink),
  createSymlinkSync
}

},{"../mkdirs":57,"../path-exists":64,"./symlink-paths":48,"./symlink-type":49,"graceful-fs":74,"path":undefined,"universalify":71}],51:[function(require,module,exports){
'use strict'
// This is adapted from https://github.com/normalize/mz
// Copyright (c) 2014-2016 Jonathan Ong me@jongleberry.com and Contributors
const u = require('universalify').fromCallback
const fs = require('graceful-fs')

const api = [
  'access',
  'appendFile',
  'chmod',
  'chown',
  'close',
  'copyFile',
  'fchmod',
  'fchown',
  'fdatasync',
  'fstat',
  'fsync',
  'ftruncate',
  'futimes',
  'lchmod',
  'lchown',
  'link',
  'lstat',
  'mkdir',
  'mkdtemp',
  'open',
  'opendir',
  'readdir',
  'readFile',
  'readlink',
  'realpath',
  'rename',
  'rmdir',
  'stat',
  'symlink',
  'truncate',
  'unlink',
  'utimes',
  'writeFile'
].filter(key => {
  // Some commands are not available on some systems. Ex:
  // fs.opendir was added in Node.js v12.12.0
  // fs.lchown is not available on at least some Linux
  return typeof fs[key] === 'function'
})

// Export all keys:
Object.keys(fs).forEach(key => {
  if (key === 'promises') {
    // fs.promises is a getter property that triggers ExperimentalWarning
    // Don't re-export it here, the getter is defined in "lib/index.js"
    return
  }
  exports[key] = fs[key]
})

// Universalify async methods:
api.forEach(method => {
  exports[method] = u(fs[method])
})

// We differ from mz/fs in that we still ship the old, broken, fs.exists()
// since we are a drop-in replacement for the native module
exports.exists = function (filename, callback) {
  if (typeof callback === 'function') {
    return fs.exists(filename, callback)
  }
  return new Promise(resolve => {
    return fs.exists(filename, resolve)
  })
}

// fs.read(), fs.write(), & fs.writev() need special treatment due to multiple callback args

exports.read = function (fd, buffer, offset, length, position, callback) {
  if (typeof callback === 'function') {
    return fs.read(fd, buffer, offset, length, position, callback)
  }
  return new Promise((resolve, reject) => {
    fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer) => {
      if (err) return reject(err)
      resolve({ bytesRead, buffer })
    })
  })
}

// Function signature can be
// fs.write(fd, buffer[, offset[, length[, position]]], callback)
// OR
// fs.write(fd, string[, position[, encoding]], callback)
// We need to handle both cases, so we use ...args
exports.write = function (fd, buffer, ...args) {
  if (typeof args[args.length - 1] === 'function') {
    return fs.write(fd, buffer, ...args)
  }

  return new Promise((resolve, reject) => {
    fs.write(fd, buffer, ...args, (err, bytesWritten, buffer) => {
      if (err) return reject(err)
      resolve({ bytesWritten, buffer })
    })
  })
}

// fs.writev only available in Node v12.9.0+
if (typeof fs.writev === 'function') {
  // Function signature is
  // s.writev(fd, buffers[, position], callback)
  // We need to handle the optional arg, so we use ...args
  exports.writev = function (fd, buffers, ...args) {
    if (typeof args[args.length - 1] === 'function') {
      return fs.writev(fd, buffers, ...args)
    }

    return new Promise((resolve, reject) => {
      fs.writev(fd, buffers, ...args, (err, bytesWritten, buffers) => {
        if (err) return reject(err)
        resolve({ bytesWritten, buffers })
      })
    })
  }
}

// fs.realpath.native only available in Node v9.2+
if (typeof fs.realpath.native === 'function') {
  exports.realpath.native = u(fs.realpath.native)
}

},{"graceful-fs":74,"universalify":71}],52:[function(require,module,exports){
'use strict'

module.exports = {
  // Export promiseified graceful-fs:
  ...require('./fs'),
  // Export extra methods:
  ...require('./copy-sync'),
  ...require('./copy'),
  ...require('./empty'),
  ...require('./ensure'),
  ...require('./json'),
  ...require('./mkdirs'),
  ...require('./move-sync'),
  ...require('./move'),
  ...require('./output'),
  ...require('./path-exists'),
  ...require('./remove')
}

// Export fs.promises as a getter property so that we don't trigger
// ExperimentalWarning before fs.promises is actually accessed.
const fs = require('fs')
if (Object.getOwnPropertyDescriptor(fs, 'promises')) {
  Object.defineProperty(module.exports, 'promises', {
    get () { return fs.promises }
  })
}

},{"./copy":43,"./copy-sync":41,"./empty":44,"./ensure":46,"./fs":51,"./json":53,"./mkdirs":57,"./move":61,"./move-sync":59,"./output":63,"./path-exists":64,"./remove":65,"fs":undefined}],53:[function(require,module,exports){
'use strict'

const u = require('universalify').fromPromise
const jsonFile = require('./jsonfile')

jsonFile.outputJson = u(require('./output-json'))
jsonFile.outputJsonSync = require('./output-json-sync')
// aliases
jsonFile.outputJSON = jsonFile.outputJson
jsonFile.outputJSONSync = jsonFile.outputJsonSync
jsonFile.writeJSON = jsonFile.writeJson
jsonFile.writeJSONSync = jsonFile.writeJsonSync
jsonFile.readJSON = jsonFile.readJson
jsonFile.readJSONSync = jsonFile.readJsonSync

module.exports = jsonFile

},{"./jsonfile":54,"./output-json":56,"./output-json-sync":55,"universalify":71}],54:[function(require,module,exports){
'use strict'

const jsonFile = require('jsonfile')

module.exports = {
  // jsonfile exports
  readJson: jsonFile.readFile,
  readJsonSync: jsonFile.readFileSync,
  writeJson: jsonFile.writeFile,
  writeJsonSync: jsonFile.writeFileSync
}

},{"jsonfile":69}],55:[function(require,module,exports){
'use strict'

const { stringify } = require('jsonfile/utils')
const { outputFileSync } = require('../output')

function outputJsonSync (file, data, options) {
  const str = stringify(data, options)

  outputFileSync(file, str, options)
}

module.exports = outputJsonSync

},{"../output":63,"jsonfile/utils":70}],56:[function(require,module,exports){
'use strict'

const { stringify } = require('jsonfile/utils')
const { outputFile } = require('../output')

async function outputJson (file, data, options = {}) {
  const str = stringify(data, options)

  await outputFile(file, str, options)
}

module.exports = outputJson

},{"../output":63,"jsonfile/utils":70}],57:[function(require,module,exports){
'use strict'
const u = require('universalify').fromPromise
const { makeDir: _makeDir, makeDirSync } = require('./make-dir')
const makeDir = u(_makeDir)

module.exports = {
  mkdirs: makeDir,
  mkdirsSync: makeDirSync,
  // alias
  mkdirp: makeDir,
  mkdirpSync: makeDirSync,
  ensureDir: makeDir,
  ensureDirSync: makeDirSync
}

},{"./make-dir":58,"universalify":71}],58:[function(require,module,exports){
// Adapted from https://github.com/sindresorhus/make-dir
// Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
'use strict'
const fs = require('../fs')
const path = require('path')
const atLeastNode = require('at-least-node')

const useNativeRecursiveOption = atLeastNode('10.12.0')

// https://github.com/nodejs/node/issues/8987
// https://github.com/libuv/libuv/pull/1088
const checkPath = pth => {
  if (process.platform === 'win32') {
    const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path.parse(pth).root, ''))

    if (pathHasInvalidWinCharacters) {
      const error = new Error(`Path contains invalid characters: ${pth}`)
      error.code = 'EINVAL'
      throw error
    }
  }
}

const processOptions = options => {
  // Must be defined here so we get fresh process.umask()
  const defaults = { mode: 0o777 & (~process.umask()) }
  if (typeof options === 'number') options = { mode: options }
  return { ...defaults, ...options }
}

const permissionError = pth => {
  // This replicates the exception of `fs.mkdir` with native the
  // `recusive` option when run on an invalid drive under Windows.
  const error = new Error(`operation not permitted, mkdir '${pth}'`)
  error.code = 'EPERM'
  error.errno = -4048
  error.path = pth
  error.syscall = 'mkdir'
  return error
}

module.exports.makeDir = async (input, options) => {
  checkPath(input)
  options = processOptions(options)

  if (useNativeRecursiveOption) {
    const pth = path.resolve(input)

    return fs.mkdir(pth, {
      mode: options.mode,
      recursive: true
    })
  }

  const make = async pth => {
    try {
      await fs.mkdir(pth, options.mode)
    } catch (error) {
      if (error.code === 'EPERM') {
        throw error
      }

      if (error.code === 'ENOENT') {
        if (path.dirname(pth) === pth) {
          throw permissionError(pth)
        }

        if (error.message.includes('null bytes')) {
          throw error
        }

        await make(path.dirname(pth))
        return make(pth)
      }

      try {
        const stats = await fs.stat(pth)
        if (!stats.isDirectory()) {
          // This error is never exposed to the user
          // it is caught below, and the original error is thrown
          throw new Error('The path is not a directory')
        }
      } catch {
        throw error
      }
    }
  }

  return make(path.resolve(input))
}

module.exports.makeDirSync = (input, options) => {
  checkPath(input)
  options = processOptions(options)

  if (useNativeRecursiveOption) {
    const pth = path.resolve(input)

    return fs.mkdirSync(pth, {
      mode: options.mode,
      recursive: true
    })
  }

  const make = pth => {
    try {
      fs.mkdirSync(pth, options.mode)
    } catch (error) {
      if (error.code === 'EPERM') {
        throw error
      }

      if (error.code === 'ENOENT') {
        if (path.dirname(pth) === pth) {
          throw permissionError(pth)
        }

        if (error.message.includes('null bytes')) {
          throw error
        }

        make(path.dirname(pth))
        return make(pth)
      }

      try {
        if (!fs.statSync(pth).isDirectory()) {
          // This error is never exposed to the user
          // it is caught below, and the original error is thrown
          throw new Error('The path is not a directory')
        }
      } catch {
        throw error
      }
    }
  }

  return make(path.resolve(input))
}

},{"../fs":51,"at-least-node":36,"path":undefined}],59:[function(require,module,exports){
'use strict'

module.exports = {
  moveSync: require('./move-sync')
}

},{"./move-sync":60}],60:[function(require,module,exports){
'use strict'

const fs = require('graceful-fs')
const path = require('path')
const copySync = require('../copy-sync').copySync
const removeSync = require('../remove').removeSync
const mkdirpSync = require('../mkdirs').mkdirpSync
const stat = require('../util/stat')

function moveSync (src, dest, opts) {
  opts = opts || {}
  const overwrite = opts.overwrite || opts.clobber || false

  const { srcStat } = stat.checkPathsSync(src, dest, 'move')
  stat.checkParentPathsSync(src, srcStat, dest, 'move')
  mkdirpSync(path.dirname(dest))
  return doRename(src, dest, overwrite)
}

function doRename (src, dest, overwrite) {
  if (overwrite) {
    removeSync(dest)
    return rename(src, dest, overwrite)
  }
  if (fs.existsSync(dest)) throw new Error('dest already exists.')
  return rename(src, dest, overwrite)
}

function rename (src, dest, overwrite) {
  try {
    fs.renameSync(src, dest)
  } catch (err) {
    if (err.code !== 'EXDEV') throw err
    return moveAcrossDevice(src, dest, overwrite)
  }
}

function moveAcrossDevice (src, dest, overwrite) {
  const opts = {
    overwrite,
    errorOnExist: true
  }
  copySync(src, dest, opts)
  return removeSync(src)
}

module.exports = moveSync

},{"../copy-sync":41,"../mkdirs":57,"../remove":65,"../util/stat":67,"graceful-fs":74,"path":undefined}],61:[function(require,module,exports){
'use strict'

const u = require('universalify').fromCallback
module.exports = {
  move: u(require('./move'))
}

},{"./move":62,"universalify":71}],62:[function(require,module,exports){
'use strict'

const fs = require('graceful-fs')
const path = require('path')
const copy = require('../copy').copy
const remove = require('../remove').remove
const mkdirp = require('../mkdirs').mkdirp
const pathExists = require('../path-exists').pathExists
const stat = require('../util/stat')

function move (src, dest, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  const overwrite = opts.overwrite || opts.clobber || false

  stat.checkPaths(src, dest, 'move', (err, stats) => {
    if (err) return cb(err)
    const { srcStat } = stats
    stat.checkParentPaths(src, srcStat, dest, 'move', err => {
      if (err) return cb(err)
      mkdirp(path.dirname(dest), err => {
        if (err) return cb(err)
        return doRename(src, dest, overwrite, cb)
      })
    })
  })
}

function doRename (src, dest, overwrite, cb) {
  if (overwrite) {
    return remove(dest, err => {
      if (err) return cb(err)
      return rename(src, dest, overwrite, cb)
    })
  }
  pathExists(dest, (err, destExists) => {
    if (err) return cb(err)
    if (destExists) return cb(new Error('dest already exists.'))
    return rename(src, dest, overwrite, cb)
  })
}

function rename (src, dest, overwrite, cb) {
  fs.rename(src, dest, err => {
    if (!err) return cb()
    if (err.code !== 'EXDEV') return cb(err)
    return moveAcrossDevice(src, dest, overwrite, cb)
  })
}

function moveAcrossDevice (src, dest, overwrite, cb) {
  const opts = {
    overwrite,
    errorOnExist: true
  }
  copy(src, dest, opts, err => {
    if (err) return cb(err)
    return remove(src, cb)
  })
}

module.exports = move

},{"../copy":43,"../mkdirs":57,"../path-exists":64,"../remove":65,"../util/stat":67,"graceful-fs":74,"path":undefined}],63:[function(require,module,exports){
'use strict'

const u = require('universalify').fromCallback
const fs = require('graceful-fs')
const path = require('path')
const mkdir = require('../mkdirs')
const pathExists = require('../path-exists').pathExists

function outputFile (file, data, encoding, callback) {
  if (typeof encoding === 'function') {
    callback = encoding
    encoding = 'utf8'
  }

  const dir = path.dirname(file)
  pathExists(dir, (err, itDoes) => {
    if (err) return callback(err)
    if (itDoes) return fs.writeFile(file, data, encoding, callback)

    mkdir.mkdirs(dir, err => {
      if (err) return callback(err)

      fs.writeFile(file, data, encoding, callback)
    })
  })
}

function outputFileSync (file, ...args) {
  const dir = path.dirname(file)
  if (fs.existsSync(dir)) {
    return fs.writeFileSync(file, ...args)
  }
  mkdir.mkdirsSync(dir)
  fs.writeFileSync(file, ...args)
}

module.exports = {
  outputFile: u(outputFile),
  outputFileSync
}

},{"../mkdirs":57,"../path-exists":64,"graceful-fs":74,"path":undefined,"universalify":71}],64:[function(require,module,exports){
'use strict'
const u = require('universalify').fromPromise
const fs = require('../fs')

function pathExists (path) {
  return fs.access(path).then(() => true).catch(() => false)
}

module.exports = {
  pathExists: u(pathExists),
  pathExistsSync: fs.existsSync
}

},{"../fs":51,"universalify":71}],65:[function(require,module,exports){
'use strict'

const u = require('universalify').fromCallback
const rimraf = require('./rimraf')

module.exports = {
  remove: u(rimraf),
  removeSync: rimraf.sync
}

},{"./rimraf":66,"universalify":71}],66:[function(require,module,exports){
'use strict'

const fs = require('graceful-fs')
const path = require('path')
const assert = require('assert')

const isWindows = (process.platform === 'win32')

function defaults (options) {
  const methods = [
    'unlink',
    'chmod',
    'stat',
    'lstat',
    'rmdir',
    'readdir'
  ]
  methods.forEach(m => {
    options[m] = options[m] || fs[m]
    m = m + 'Sync'
    options[m] = options[m] || fs[m]
  })

  options.maxBusyTries = options.maxBusyTries || 3
}

function rimraf (p, options, cb) {
  let busyTries = 0

  if (typeof options === 'function') {
    cb = options
    options = {}
  }

  assert(p, 'rimraf: missing path')
  assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string')
  assert.strictEqual(typeof cb, 'function', 'rimraf: callback function required')
  assert(options, 'rimraf: invalid options argument provided')
  assert.strictEqual(typeof options, 'object', 'rimraf: options should be object')

  defaults(options)

  rimraf_(p, options, function CB (er) {
    if (er) {
      if ((er.code === 'EBUSY' || er.code === 'ENOTEMPTY' || er.code === 'EPERM') &&
          busyTries < options.maxBusyTries) {
        busyTries++
        const time = busyTries * 100
        // try again, with the same exact callback as this one.
        return setTimeout(() => rimraf_(p, options, CB), time)
      }

      // already gone
      if (er.code === 'ENOENT') er = null
    }

    cb(er)
  })
}

// Two possible strategies.
// 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
// 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
//
// Both result in an extra syscall when you guess wrong.  However, there
// are likely far more normal files in the world than directories.  This
// is based on the assumption that a the average number of files per
// directory is >= 1.
//
// If anyone ever complains about this, then I guess the strategy could
// be made configurable somehow.  But until then, YAGNI.
function rimraf_ (p, options, cb) {
  assert(p)
  assert(options)
  assert(typeof cb === 'function')

  // sunos lets the root user unlink directories, which is... weird.
  // so we have to lstat here and make sure it's not a dir.
  options.lstat(p, (er, st) => {
    if (er && er.code === 'ENOENT') {
      return cb(null)
    }

    // Windows can EPERM on stat.  Life is suffering.
    if (er && er.code === 'EPERM' && isWindows) {
      return fixWinEPERM(p, options, er, cb)
    }

    if (st && st.isDirectory()) {
      return rmdir(p, options, er, cb)
    }

    options.unlink(p, er => {
      if (er) {
        if (er.code === 'ENOENT') {
          return cb(null)
        }
        if (er.code === 'EPERM') {
          return (isWindows)
            ? fixWinEPERM(p, options, er, cb)
            : rmdir(p, options, er, cb)
        }
        if (er.code === 'EISDIR') {
          return rmdir(p, options, er, cb)
        }
      }
      return cb(er)
    })
  })
}

function fixWinEPERM (p, options, er, cb) {
  assert(p)
  assert(options)
  assert(typeof cb === 'function')
  if (er) {
    assert(er instanceof Error)
  }

  options.chmod(p, 0o666, er2 => {
    if (er2) {
      cb(er2.code === 'ENOENT' ? null : er)
    } else {
      options.stat(p, (er3, stats) => {
        if (er3) {
          cb(er3.code === 'ENOENT' ? null : er)
        } else if (stats.isDirectory()) {
          rmdir(p, options, er, cb)
        } else {
          options.unlink(p, cb)
        }
      })
    }
  })
}

function fixWinEPERMSync (p, options, er) {
  let stats

  assert(p)
  assert(options)
  if (er) {
    assert(er instanceof Error)
  }

  try {
    options.chmodSync(p, 0o666)
  } catch (er2) {
    if (er2.code === 'ENOENT') {
      return
    } else {
      throw er
    }
  }

  try {
    stats = options.statSync(p)
  } catch (er3) {
    if (er3.code === 'ENOENT') {
      return
    } else {
      throw er
    }
  }

  if (stats.isDirectory()) {
    rmdirSync(p, options, er)
  } else {
    options.unlinkSync(p)
  }
}

function rmdir (p, options, originalEr, cb) {
  assert(p)
  assert(options)
  if (originalEr) {
    assert(originalEr instanceof Error)
  }
  assert(typeof cb === 'function')

  // try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
  // if we guessed wrong, and it's not a directory, then
  // raise the original error.
  options.rmdir(p, er => {
    if (er && (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM')) {
      rmkids(p, options, cb)
    } else if (er && er.code === 'ENOTDIR') {
      cb(originalEr)
    } else {
      cb(er)
    }
  })
}

function rmkids (p, options, cb) {
  assert(p)
  assert(options)
  assert(typeof cb === 'function')

  options.readdir(p, (er, files) => {
    if (er) return cb(er)

    let n = files.length
    let errState

    if (n === 0) return options.rmdir(p, cb)

    files.forEach(f => {
      rimraf(path.join(p, f), options, er => {
        if (errState) {
          return
        }
        if (er) return cb(errState = er)
        if (--n === 0) {
          options.rmdir(p, cb)
        }
      })
    })
  })
}

// this looks simpler, and is strictly *faster*, but will
// tie up the JavaScript thread and fail on excessively
// deep directory trees.
function rimrafSync (p, options) {
  let st

  options = options || {}
  defaults(options)

  assert(p, 'rimraf: missing path')
  assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string')
  assert(options, 'rimraf: missing options')
  assert.strictEqual(typeof options, 'object', 'rimraf: options should be object')

  try {
    st = options.lstatSync(p)
  } catch (er) {
    if (er.code === 'ENOENT') {
      return
    }

    // Windows can EPERM on stat.  Life is suffering.
    if (er.code === 'EPERM' && isWindows) {
      fixWinEPERMSync(p, options, er)
    }
  }

  try {
    // sunos lets the root user unlink directories, which is... weird.
    if (st && st.isDirectory()) {
      rmdirSync(p, options, null)
    } else {
      options.unlinkSync(p)
    }
  } catch (er) {
    if (er.code === 'ENOENT') {
      return
    } else if (er.code === 'EPERM') {
      return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er)
    } else if (er.code !== 'EISDIR') {
      throw er
    }
    rmdirSync(p, options, er)
  }
}

function rmdirSync (p, options, originalEr) {
  assert(p)
  assert(options)
  if (originalEr) {
    assert(originalEr instanceof Error)
  }

  try {
    options.rmdirSync(p)
  } catch (er) {
    if (er.code === 'ENOTDIR') {
      throw originalEr
    } else if (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM') {
      rmkidsSync(p, options)
    } else if (er.code !== 'ENOENT') {
      throw er
    }
  }
}

function rmkidsSync (p, options) {
  assert(p)
  assert(options)
  options.readdirSync(p).forEach(f => rimrafSync(path.join(p, f), options))

  if (isWindows) {
    // We only end up here once we got ENOTEMPTY at least once, and
    // at this point, we are guaranteed to have removed all the kids.
    // So, we know that it won't be ENOENT or ENOTDIR or anything else.
    // try really hard to delete stuff on windows, because it has a
    // PROFOUNDLY annoying habit of not closing handles promptly when
    // files are deleted, resulting in spurious ENOTEMPTY errors.
    const startTime = Date.now()
    do {
      try {
        const ret = options.rmdirSync(p, options)
        return ret
      } catch {}
    } while (Date.now() - startTime < 500) // give up after 500ms
  } else {
    const ret = options.rmdirSync(p, options)
    return ret
  }
}

module.exports = rimraf
rimraf.sync = rimrafSync

},{"assert":undefined,"graceful-fs":74,"path":undefined}],67:[function(require,module,exports){
'use strict'

const fs = require('../fs')
const path = require('path')
const util = require('util')
const atLeastNode = require('at-least-node')

const nodeSupportsBigInt = atLeastNode('10.5.0')
const stat = (file) => nodeSupportsBigInt ? fs.stat(file, { bigint: true }) : fs.stat(file)
const statSync = (file) => nodeSupportsBigInt ? fs.statSync(file, { bigint: true }) : fs.statSync(file)

function getStats (src, dest) {
  return Promise.all([
    stat(src),
    stat(dest).catch(err => {
      if (err.code === 'ENOENT') return null
      throw err
    })
  ]).then(([srcStat, destStat]) => ({ srcStat, destStat }))
}

function getStatsSync (src, dest) {
  let destStat
  const srcStat = statSync(src)
  try {
    destStat = statSync(dest)
  } catch (err) {
    if (err.code === 'ENOENT') return { srcStat, destStat: null }
    throw err
  }
  return { srcStat, destStat }
}

function checkPaths (src, dest, funcName, cb) {
  util.callbackify(getStats)(src, dest, (err, stats) => {
    if (err) return cb(err)
    const { srcStat, destStat } = stats
    if (destStat && areIdentical(srcStat, destStat)) {
      return cb(new Error('Source and destination must not be the same.'))
    }
    if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
      return cb(new Error(errMsg(src, dest, funcName)))
    }
    return cb(null, { srcStat, destStat })
  })
}

function checkPathsSync (src, dest, funcName) {
  const { srcStat, destStat } = getStatsSync(src, dest)
  if (destStat && areIdentical(srcStat, destStat)) {
    throw new Error('Source and destination must not be the same.')
  }
  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return { srcStat, destStat }
}

// recursively check if dest parent is a subdirectory of src.
// It works for all file types including symlinks since it
// checks the src and dest inodes. It starts from the deepest
// parent and stops once it reaches the src parent or the root path.
function checkParentPaths (src, srcStat, dest, funcName, cb) {
  const srcParent = path.resolve(path.dirname(src))
  const destParent = path.resolve(path.dirname(dest))
  if (destParent === srcParent || destParent === path.parse(destParent).root) return cb()
  const callback = (err, destStat) => {
    if (err) {
      if (err.code === 'ENOENT') return cb()
      return cb(err)
    }
    if (areIdentical(srcStat, destStat)) {
      return cb(new Error(errMsg(src, dest, funcName)))
    }
    return checkParentPaths(src, srcStat, destParent, funcName, cb)
  }
  if (nodeSupportsBigInt) fs.stat(destParent, { bigint: true }, callback)
  else fs.stat(destParent, callback)
}

function checkParentPathsSync (src, srcStat, dest, funcName) {
  const srcParent = path.resolve(path.dirname(src))
  const destParent = path.resolve(path.dirname(dest))
  if (destParent === srcParent || destParent === path.parse(destParent).root) return
  let destStat
  try {
    destStat = statSync(destParent)
  } catch (err) {
    if (err.code === 'ENOENT') return
    throw err
  }
  if (areIdentical(srcStat, destStat)) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return checkParentPathsSync(src, srcStat, destParent, funcName)
}

function areIdentical (srcStat, destStat) {
  if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
    if (nodeSupportsBigInt || destStat.ino < Number.MAX_SAFE_INTEGER) {
      // definitive answer
      return true
    }
    // Use additional heuristics if we can't use 'bigint'.
    // Different 'ino' could be represented the same if they are >= Number.MAX_SAFE_INTEGER
    // See issue 657
    if (destStat.size === srcStat.size &&
        destStat.mode === srcStat.mode &&
        destStat.nlink === srcStat.nlink &&
        destStat.atimeMs === srcStat.atimeMs &&
        destStat.mtimeMs === srcStat.mtimeMs &&
        destStat.ctimeMs === srcStat.ctimeMs &&
        destStat.birthtimeMs === srcStat.birthtimeMs) {
      // heuristic answer
      return true
    }
  }
  return false
}

// return true if dest is a subdir of src, otherwise false.
// It only checks the path strings.
function isSrcSubdir (src, dest) {
  const srcArr = path.resolve(src).split(path.sep).filter(i => i)
  const destArr = path.resolve(dest).split(path.sep).filter(i => i)
  return srcArr.reduce((acc, cur, i) => acc && destArr[i] === cur, true)
}

function errMsg (src, dest, funcName) {
  return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`
}

module.exports = {
  checkPaths,
  checkPathsSync,
  checkParentPaths,
  checkParentPathsSync,
  isSrcSubdir
}

},{"../fs":51,"at-least-node":36,"path":undefined,"util":undefined}],68:[function(require,module,exports){
'use strict'

const fs = require('graceful-fs')

function utimesMillis (path, atime, mtime, callback) {
  // if (!HAS_MILLIS_RES) return fs.utimes(path, atime, mtime, callback)
  fs.open(path, 'r+', (err, fd) => {
    if (err) return callback(err)
    fs.futimes(fd, atime, mtime, futimesErr => {
      fs.close(fd, closeErr => {
        if (callback) callback(futimesErr || closeErr)
      })
    })
  })
}

function utimesMillisSync (path, atime, mtime) {
  const fd = fs.openSync(path, 'r+')
  fs.futimesSync(fd, atime, mtime)
  return fs.closeSync(fd)
}

module.exports = {
  utimesMillis,
  utimesMillisSync
}

},{"graceful-fs":74}],69:[function(require,module,exports){
let _fs
try {
  _fs = require('graceful-fs')
} catch (_) {
  _fs = require('fs')
}
const universalify = require('universalify')
const { stringify, stripBom } = require('./utils')

async function _readFile (file, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options }
  }

  const fs = options.fs || _fs

  const shouldThrow = 'throws' in options ? options.throws : true

  let data = await universalify.fromCallback(fs.readFile)(file, options)

  data = stripBom(data)

  let obj
  try {
    obj = JSON.parse(data, options ? options.reviver : null)
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`
      throw err
    } else {
      return null
    }
  }

  return obj
}

const readFile = universalify.fromPromise(_readFile)

function readFileSync (file, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options }
  }

  const fs = options.fs || _fs

  const shouldThrow = 'throws' in options ? options.throws : true

  try {
    let content = fs.readFileSync(file, options)
    content = stripBom(content)
    return JSON.parse(content, options.reviver)
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`
      throw err
    } else {
      return null
    }
  }
}

async function _writeFile (file, obj, options = {}) {
  const fs = options.fs || _fs

  const str = stringify(obj, options)

  await universalify.fromCallback(fs.writeFile)(file, str, options)
}

const writeFile = universalify.fromPromise(_writeFile)

function writeFileSync (file, obj, options = {}) {
  const fs = options.fs || _fs

  const str = stringify(obj, options)
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}

const jsonfile = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync
}

module.exports = jsonfile

},{"./utils":70,"fs":undefined,"graceful-fs":74,"universalify":71}],70:[function(require,module,exports){
function stringify (obj, options = {}) {
  const EOL = options.EOL || '\n'

  const str = JSON.stringify(obj, options ? options.replacer : null, options.spaces)

  return str.replace(/\n/g, EOL) + EOL
}

function stripBom (content) {
  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
  if (Buffer.isBuffer(content)) content = content.toString('utf8')
  return content.replace(/^\uFEFF/, '')
}

module.exports = { stringify, stripBom }

},{}],71:[function(require,module,exports){
'use strict'

exports.fromCallback = function (fn) {
  return Object.defineProperty(function (...args) {
    if (typeof args[args.length - 1] === 'function') fn.apply(this, args)
    else {
      return new Promise((resolve, reject) => {
        fn.apply(
          this,
          args.concat([(err, res) => err ? reject(err) : resolve(res)])
        )
      })
    }
  }, 'name', { value: fn.name })
}

exports.fromPromise = function (fn) {
  return Object.defineProperty(function (...args) {
    const cb = args[args.length - 1]
    if (typeof cb !== 'function') return fn.apply(this, args)
    else fn.apply(this, args.slice(0, -1)).then(r => cb(null, r), cb)
  }, 'name', { value: fn.name })
}

},{}],72:[function(require,module,exports){
"use strict";
// Call this function in a another function to find out the file from
// which that function was called from. (Inspects the v8 stack trace)
//
// Inspired by http://stackoverflow.com/questions/13227489
module.exports = function getCallerFile(position) {
    if (position === void 0) { position = 2; }
    if (position >= Error.stackTraceLimit) {
        throw new TypeError('getCallerFile(position) requires position be less then Error.stackTraceLimit but position was: `' + position + '` and Error.stackTraceLimit was: `' + Error.stackTraceLimit + '`');
    }
    var oldPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) { return stack; };
    var stack = new Error().stack;
    Error.prepareStackTrace = oldPrepareStackTrace;
    if (stack !== null && typeof stack === 'object') {
        // stack[0] holds this file
        // stack[1] holds where this function was called
        // stack[2] holds the file we're interested in
        return stack[position] ? stack[position].getFileName() : undefined;
    }
};

},{}],73:[function(require,module,exports){
'use strict'

module.exports = clone

function clone (obj) {
  if (obj === null || typeof obj !== 'object')
    return obj

  if (obj instanceof Object)
    var copy = { __proto__: obj.__proto__ }
  else
    var copy = Object.create(null)

  Object.getOwnPropertyNames(obj).forEach(function (key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key))
  })

  return copy
}

},{}],74:[function(require,module,exports){
var fs = require('fs')
var polyfills = require('./polyfills.js')
var legacy = require('./legacy-streams.js')
var clone = require('./clone.js')

var util = require('util')

/* istanbul ignore next - node 0.x polyfill */
var gracefulQueue
var previousSymbol

/* istanbul ignore else - node 0.x polyfill */
if (typeof Symbol === 'function' && typeof Symbol.for === 'function') {
  gracefulQueue = Symbol.for('graceful-fs.queue')
  // This is used in testing by future versions
  previousSymbol = Symbol.for('graceful-fs.previous')
} else {
  gracefulQueue = '___graceful-fs.queue'
  previousSymbol = '___graceful-fs.previous'
}

function noop () {}

var debug = noop
if (util.debuglog)
  debug = util.debuglog('gfs4')
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
  debug = function() {
    var m = util.format.apply(util, arguments)
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ')
    console.error(m)
  }

// Once time initialization
if (!global[gracefulQueue]) {
  // This queue can be shared by multiple loaded instances
  var queue = []
  Object.defineProperty(global, gracefulQueue, {
    get: function() {
      return queue
    }
  })

  // Patch fs.close/closeSync to shared queue version, because we need
  // to retry() whenever a close happens *anywhere* in the program.
  // This is essential when multiple graceful-fs instances are
  // in play at the same time.
  fs.close = (function (fs$close) {
    function close (fd, cb) {
      return fs$close.call(fs, fd, function (err) {
        // This function uses the graceful-fs shared queue
        if (!err) {
          retry()
        }

        if (typeof cb === 'function')
          cb.apply(this, arguments)
      })
    }

    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    })
    return close
  })(fs.close)

  fs.closeSync = (function (fs$closeSync) {
    function closeSync (fd) {
      // This function uses the graceful-fs shared queue
      fs$closeSync.apply(fs, arguments)
      retry()
    }

    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    })
    return closeSync
  })(fs.closeSync)

  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
    process.on('exit', function() {
      debug(global[gracefulQueue])
      require('assert').equal(global[gracefulQueue].length, 0)
    })
  }
}

module.exports = patch(clone(fs))
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
    module.exports = patch(fs)
    fs.__patched = true;
}

function patch (fs) {
  // Everything that references the open() function needs to be in here
  polyfills(fs)
  fs.gracefulify = patch

  fs.createReadStream = createReadStream
  fs.createWriteStream = createWriteStream
  var fs$readFile = fs.readFile
  fs.readFile = readFile
  function readFile (path, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null

    return go$readFile(path, options, cb)

    function go$readFile (path, options, cb) {
      return fs$readFile(path, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$readFile, [path, options, cb]])
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments)
          retry()
        }
      })
    }
  }

  var fs$writeFile = fs.writeFile
  fs.writeFile = writeFile
  function writeFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null

    return go$writeFile(path, data, options, cb)

    function go$writeFile (path, data, options, cb) {
      return fs$writeFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$writeFile, [path, data, options, cb]])
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments)
          retry()
        }
      })
    }
  }

  var fs$appendFile = fs.appendFile
  if (fs$appendFile)
    fs.appendFile = appendFile
  function appendFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null

    return go$appendFile(path, data, options, cb)

    function go$appendFile (path, data, options, cb) {
      return fs$appendFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$appendFile, [path, data, options, cb]])
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments)
          retry()
        }
      })
    }
  }

  var fs$readdir = fs.readdir
  fs.readdir = readdir
  function readdir (path, options, cb) {
    var args = [path]
    if (typeof options !== 'function') {
      args.push(options)
    } else {
      cb = options
    }
    args.push(go$readdir$cb)

    return go$readdir(args)

    function go$readdir$cb (err, files) {
      if (files && files.sort)
        files.sort()

      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
        enqueue([go$readdir, [args]])

      else {
        if (typeof cb === 'function')
          cb.apply(this, arguments)
        retry()
      }
    }
  }

  function go$readdir (args) {
    return fs$readdir.apply(fs, args)
  }

  if (process.version.substr(0, 4) === 'v0.8') {
    var legStreams = legacy(fs)
    ReadStream = legStreams.ReadStream
    WriteStream = legStreams.WriteStream
  }

  var fs$ReadStream = fs.ReadStream
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype)
    ReadStream.prototype.open = ReadStream$open
  }

  var fs$WriteStream = fs.WriteStream
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype)
    WriteStream.prototype.open = WriteStream$open
  }

  Object.defineProperty(fs, 'ReadStream', {
    get: function () {
      return ReadStream
    },
    set: function (val) {
      ReadStream = val
    },
    enumerable: true,
    configurable: true
  })
  Object.defineProperty(fs, 'WriteStream', {
    get: function () {
      return WriteStream
    },
    set: function (val) {
      WriteStream = val
    },
    enumerable: true,
    configurable: true
  })

  // legacy names
  var FileReadStream = ReadStream
  Object.defineProperty(fs, 'FileReadStream', {
    get: function () {
      return FileReadStream
    },
    set: function (val) {
      FileReadStream = val
    },
    enumerable: true,
    configurable: true
  })
  var FileWriteStream = WriteStream
  Object.defineProperty(fs, 'FileWriteStream', {
    get: function () {
      return FileWriteStream
    },
    set: function (val) {
      FileWriteStream = val
    },
    enumerable: true,
    configurable: true
  })

  function ReadStream (path, options) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments)
  }

  function ReadStream$open () {
    var that = this
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy()

        that.emit('error', err)
      } else {
        that.fd = fd
        that.emit('open', fd)
        that.read()
      }
    })
  }

  function WriteStream (path, options) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments)
  }

  function WriteStream$open () {
    var that = this
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        that.destroy()
        that.emit('error', err)
      } else {
        that.fd = fd
        that.emit('open', fd)
      }
    })
  }

  function createReadStream (path, options) {
    return new fs.ReadStream(path, options)
  }

  function createWriteStream (path, options) {
    return new fs.WriteStream(path, options)
  }

  var fs$open = fs.open
  fs.open = open
  function open (path, flags, mode, cb) {
    if (typeof mode === 'function')
      cb = mode, mode = null

    return go$open(path, flags, mode, cb)

    function go$open (path, flags, mode, cb) {
      return fs$open(path, flags, mode, function (err, fd) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$open, [path, flags, mode, cb]])
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments)
          retry()
        }
      })
    }
  }

  return fs
}

function enqueue (elem) {
  debug('ENQUEUE', elem[0].name, elem[1])
  global[gracefulQueue].push(elem)
}

function retry () {
  var elem = global[gracefulQueue].shift()
  if (elem) {
    debug('RETRY', elem[0].name, elem[1])
    elem[0].apply(null, elem[1])
  }
}

},{"./clone.js":73,"./legacy-streams.js":75,"./polyfills.js":76,"assert":undefined,"fs":undefined,"util":undefined}],75:[function(require,module,exports){
var Stream = require('stream').Stream

module.exports = legacy

function legacy (fs) {
  return {
    ReadStream: ReadStream,
    WriteStream: WriteStream
  }

  function ReadStream (path, options) {
    if (!(this instanceof ReadStream)) return new ReadStream(path, options);

    Stream.call(this);

    var self = this;

    this.path = path;
    this.fd = null;
    this.readable = true;
    this.paused = false;

    this.flags = 'r';
    this.mode = 438; /*=0666*/
    this.bufferSize = 64 * 1024;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.encoding) this.setEncoding(this.encoding);

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.end === undefined) {
        this.end = Infinity;
      } else if ('number' !== typeof this.end) {
        throw TypeError('end must be a Number');
      }

      if (this.start > this.end) {
        throw new Error('start must be <= end');
      }

      this.pos = this.start;
    }

    if (this.fd !== null) {
      process.nextTick(function() {
        self._read();
      });
      return;
    }

    fs.open(this.path, this.flags, this.mode, function (err, fd) {
      if (err) {
        self.emit('error', err);
        self.readable = false;
        return;
      }

      self.fd = fd;
      self.emit('open', fd);
      self._read();
    })
  }

  function WriteStream (path, options) {
    if (!(this instanceof WriteStream)) return new WriteStream(path, options);

    Stream.call(this);

    this.path = path;
    this.fd = null;
    this.writable = true;

    this.flags = 'w';
    this.encoding = 'binary';
    this.mode = 438; /*=0666*/
    this.bytesWritten = 0;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.start < 0) {
        throw new Error('start must be >= zero');
      }

      this.pos = this.start;
    }

    this.busy = false;
    this._queue = [];

    if (this.fd === null) {
      this._open = fs.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
      this.flush();
    }
  }
}

},{"stream":undefined}],76:[function(require,module,exports){
var constants = require('constants')

var origCwd = process.cwd
var cwd = null

var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform

process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process)
  return cwd
}
try {
  process.cwd()
} catch (er) {}

var chdir = process.chdir
process.chdir = function(d) {
  cwd = null
  chdir.call(process, d)
}

module.exports = patch

function patch (fs) {
  // (re-)implement some things that are known busted or missing.

  // lchmod, broken prior to 0.6.2
  // back-port the fix here.
  if (constants.hasOwnProperty('O_SYMLINK') &&
      process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs)
  }

  // lutimes implementation, or no-op
  if (!fs.lutimes) {
    patchLutimes(fs)
  }

  // https://github.com/isaacs/node-graceful-fs/issues/4
  // Chown should not fail on einval or eperm if non-root.
  // It should not fail on enosys ever, as this just indicates
  // that a fs doesn't support the intended operation.

  fs.chown = chownFix(fs.chown)
  fs.fchown = chownFix(fs.fchown)
  fs.lchown = chownFix(fs.lchown)

  fs.chmod = chmodFix(fs.chmod)
  fs.fchmod = chmodFix(fs.fchmod)
  fs.lchmod = chmodFix(fs.lchmod)

  fs.chownSync = chownFixSync(fs.chownSync)
  fs.fchownSync = chownFixSync(fs.fchownSync)
  fs.lchownSync = chownFixSync(fs.lchownSync)

  fs.chmodSync = chmodFixSync(fs.chmodSync)
  fs.fchmodSync = chmodFixSync(fs.fchmodSync)
  fs.lchmodSync = chmodFixSync(fs.lchmodSync)

  fs.stat = statFix(fs.stat)
  fs.fstat = statFix(fs.fstat)
  fs.lstat = statFix(fs.lstat)

  fs.statSync = statFixSync(fs.statSync)
  fs.fstatSync = statFixSync(fs.fstatSync)
  fs.lstatSync = statFixSync(fs.lstatSync)

  // if lchmod/lchown do not exist, then make them no-ops
  if (!fs.lchmod) {
    fs.lchmod = function (path, mode, cb) {
      if (cb) process.nextTick(cb)
    }
    fs.lchmodSync = function () {}
  }
  if (!fs.lchown) {
    fs.lchown = function (path, uid, gid, cb) {
      if (cb) process.nextTick(cb)
    }
    fs.lchownSync = function () {}
  }

  // on Windows, A/V software can lock the directory, causing this
  // to fail with an EACCES or EPERM if the directory contains newly
  // created files.  Try again on failure, for up to 60 seconds.

  // Set the timeout this long because some Windows Anti-Virus, such as Parity
  // bit9, may lock files for up to a minute, causing npm package install
  // failures. Also, take care to yield the scheduler. Windows scheduling gives
  // CPU to a busy looping process, which can cause the program causing the lock
  // contention to be starved of CPU by node, so the contention doesn't resolve.
  if (platform === "win32") {
    fs.rename = (function (fs$rename) { return function (from, to, cb) {
      var start = Date.now()
      var backoff = 0;
      fs$rename(from, to, function CB (er) {
        if (er
            && (er.code === "EACCES" || er.code === "EPERM")
            && Date.now() - start < 60000) {
          setTimeout(function() {
            fs.stat(to, function (stater, st) {
              if (stater && stater.code === "ENOENT")
                fs$rename(from, to, CB);
              else
                cb(er)
            })
          }, backoff)
          if (backoff < 100)
            backoff += 10;
          return;
        }
        if (cb) cb(er)
      })
    }})(fs.rename)
  }

  // if read() returns EAGAIN, then just try it again.
  fs.read = (function (fs$read) {
    function read (fd, buffer, offset, length, position, callback_) {
      var callback
      if (callback_ && typeof callback_ === 'function') {
        var eagCounter = 0
        callback = function (er, _, __) {
          if (er && er.code === 'EAGAIN' && eagCounter < 10) {
            eagCounter ++
            return fs$read.call(fs, fd, buffer, offset, length, position, callback)
          }
          callback_.apply(this, arguments)
        }
      }
      return fs$read.call(fs, fd, buffer, offset, length, position, callback)
    }

    // This ensures `util.promisify` works as it does for native `fs.read`.
    read.__proto__ = fs$read
    return read
  })(fs.read)

  fs.readSync = (function (fs$readSync) { return function (fd, buffer, offset, length, position) {
    var eagCounter = 0
    while (true) {
      try {
        return fs$readSync.call(fs, fd, buffer, offset, length, position)
      } catch (er) {
        if (er.code === 'EAGAIN' && eagCounter < 10) {
          eagCounter ++
          continue
        }
        throw er
      }
    }
  }})(fs.readSync)

  function patchLchmod (fs) {
    fs.lchmod = function (path, mode, callback) {
      fs.open( path
             , constants.O_WRONLY | constants.O_SYMLINK
             , mode
             , function (err, fd) {
        if (err) {
          if (callback) callback(err)
          return
        }
        // prefer to return the chmod error, if one occurs,
        // but still try to close, and report closing errors if they occur.
        fs.fchmod(fd, mode, function (err) {
          fs.close(fd, function(err2) {
            if (callback) callback(err || err2)
          })
        })
      })
    }

    fs.lchmodSync = function (path, mode) {
      var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode)

      // prefer to return the chmod error, if one occurs,
      // but still try to close, and report closing errors if they occur.
      var threw = true
      var ret
      try {
        ret = fs.fchmodSync(fd, mode)
        threw = false
      } finally {
        if (threw) {
          try {
            fs.closeSync(fd)
          } catch (er) {}
        } else {
          fs.closeSync(fd)
        }
      }
      return ret
    }
  }

  function patchLutimes (fs) {
    if (constants.hasOwnProperty("O_SYMLINK")) {
      fs.lutimes = function (path, at, mt, cb) {
        fs.open(path, constants.O_SYMLINK, function (er, fd) {
          if (er) {
            if (cb) cb(er)
            return
          }
          fs.futimes(fd, at, mt, function (er) {
            fs.close(fd, function (er2) {
              if (cb) cb(er || er2)
            })
          })
        })
      }

      fs.lutimesSync = function (path, at, mt) {
        var fd = fs.openSync(path, constants.O_SYMLINK)
        var ret
        var threw = true
        try {
          ret = fs.futimesSync(fd, at, mt)
          threw = false
        } finally {
          if (threw) {
            try {
              fs.closeSync(fd)
            } catch (er) {}
          } else {
            fs.closeSync(fd)
          }
        }
        return ret
      }

    } else {
      fs.lutimes = function (_a, _b, _c, cb) { if (cb) process.nextTick(cb) }
      fs.lutimesSync = function () {}
    }
  }

  function chmodFix (orig) {
    if (!orig) return orig
    return function (target, mode, cb) {
      return orig.call(fs, target, mode, function (er) {
        if (chownErOk(er)) er = null
        if (cb) cb.apply(this, arguments)
      })
    }
  }

  function chmodFixSync (orig) {
    if (!orig) return orig
    return function (target, mode) {
      try {
        return orig.call(fs, target, mode)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }


  function chownFix (orig) {
    if (!orig) return orig
    return function (target, uid, gid, cb) {
      return orig.call(fs, target, uid, gid, function (er) {
        if (chownErOk(er)) er = null
        if (cb) cb.apply(this, arguments)
      })
    }
  }

  function chownFixSync (orig) {
    if (!orig) return orig
    return function (target, uid, gid) {
      try {
        return orig.call(fs, target, uid, gid)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }

  function statFix (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options, cb) {
      if (typeof options === 'function') {
        cb = options
        options = null
      }
      function callback (er, stats) {
        if (stats) {
          if (stats.uid < 0) stats.uid += 0x100000000
          if (stats.gid < 0) stats.gid += 0x100000000
        }
        if (cb) cb.apply(this, arguments)
      }
      return options ? orig.call(fs, target, options, callback)
        : orig.call(fs, target, callback)
    }
  }

  function statFixSync (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options) {
      var stats = options ? orig.call(fs, target, options)
        : orig.call(fs, target)
      if (stats.uid < 0) stats.uid += 0x100000000
      if (stats.gid < 0) stats.gid += 0x100000000
      return stats;
    }
  }

  // ENOSYS means that the fs doesn't support the op. Just ignore
  // that, because it doesn't matter.
  //
  // if there's no getuid, or if getuid() is something other
  // than 0, and the error is EINVAL or EPERM, then just ignore
  // it.
  //
  // This specific case is a silent failure in cp, install, tar,
  // and most other unix tools that manage permissions.
  //
  // When running as root, or if other types of errors are
  // encountered, then it's strict.
  function chownErOk (er) {
    if (!er)
      return true

    if (er.code === "ENOSYS")
      return true

    var nonroot = !process.getuid || process.getuid() !== 0
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true
    }

    return false
  }
}

},{"constants":undefined}],77:[function(require,module,exports){
const parse = require('./parse')
const stringify = require('./stringify')

const JSON5 = {
    parse,
    stringify,
}

module.exports = JSON5

},{"./parse":78,"./stringify":79}],78:[function(require,module,exports){
const util = require('./util')

let source
let parseState
let stack
let pos
let line
let column
let token
let key
let root

module.exports = function parse (text, reviver) {
    source = String(text)
    parseState = 'start'
    stack = []
    pos = 0
    line = 1
    column = 0
    token = undefined
    key = undefined
    root = undefined

    do {
        token = lex()

        // This code is unreachable.
        // if (!parseStates[parseState]) {
        //     throw invalidParseState()
        // }

        parseStates[parseState]()
    } while (token.type !== 'eof')

    if (typeof reviver === 'function') {
        return internalize({'': root}, '', reviver)
    }

    return root
}

function internalize (holder, name, reviver) {
    const value = holder[name]
    if (value != null && typeof value === 'object') {
        for (const key in value) {
            const replacement = internalize(value, key, reviver)
            if (replacement === undefined) {
                delete value[key]
            } else {
                value[key] = replacement
            }
        }
    }

    return reviver.call(holder, name, value)
}

let lexState
let buffer
let doubleQuote
let sign
let c

function lex () {
    lexState = 'default'
    buffer = ''
    doubleQuote = false
    sign = 1

    for (;;) {
        c = peek()

        // This code is unreachable.
        // if (!lexStates[lexState]) {
        //     throw invalidLexState(lexState)
        // }

        const token = lexStates[lexState]()
        if (token) {
            return token
        }
    }
}

function peek () {
    if (source[pos]) {
        return String.fromCodePoint(source.codePointAt(pos))
    }
}

function read () {
    const c = peek()

    if (c === '\n') {
        line++
        column = 0
    } else if (c) {
        column += c.length
    } else {
        column++
    }

    if (c) {
        pos += c.length
    }

    return c
}

const lexStates = {
    default () {
        switch (c) {
        case '\t':
        case '\v':
        case '\f':
        case ' ':
        case '\u00A0':
        case '\uFEFF':
        case '\n':
        case '\r':
        case '\u2028':
        case '\u2029':
            read()
            return

        case '/':
            read()
            lexState = 'comment'
            return

        case undefined:
            read()
            return newToken('eof')
        }

        if (util.isSpaceSeparator(c)) {
            read()
            return
        }

        // This code is unreachable.
        // if (!lexStates[parseState]) {
        //     throw invalidLexState(parseState)
        // }

        return lexStates[parseState]()
    },

    comment () {
        switch (c) {
        case '*':
            read()
            lexState = 'multiLineComment'
            return

        case '/':
            read()
            lexState = 'singleLineComment'
            return
        }

        throw invalidChar(read())
    },

    multiLineComment () {
        switch (c) {
        case '*':
            read()
            lexState = 'multiLineCommentAsterisk'
            return

        case undefined:
            throw invalidChar(read())
        }

        read()
    },

    multiLineCommentAsterisk () {
        switch (c) {
        case '*':
            read()
            return

        case '/':
            read()
            lexState = 'default'
            return

        case undefined:
            throw invalidChar(read())
        }

        read()
        lexState = 'multiLineComment'
    },

    singleLineComment () {
        switch (c) {
        case '\n':
        case '\r':
        case '\u2028':
        case '\u2029':
            read()
            lexState = 'default'
            return

        case undefined:
            read()
            return newToken('eof')
        }

        read()
    },

    value () {
        switch (c) {
        case '{':
        case '[':
            return newToken('punctuator', read())

        case 'n':
            read()
            literal('ull')
            return newToken('null', null)

        case 't':
            read()
            literal('rue')
            return newToken('boolean', true)

        case 'f':
            read()
            literal('alse')
            return newToken('boolean', false)

        case '-':
        case '+':
            if (read() === '-') {
                sign = -1
            }

            lexState = 'sign'
            return

        case '.':
            buffer = read()
            lexState = 'decimalPointLeading'
            return

        case '0':
            buffer = read()
            lexState = 'zero'
            return

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            buffer = read()
            lexState = 'decimalInteger'
            return

        case 'I':
            read()
            literal('nfinity')
            return newToken('numeric', Infinity)

        case 'N':
            read()
            literal('aN')
            return newToken('numeric', NaN)

        case '"':
        case "'":
            doubleQuote = (read() === '"')
            buffer = ''
            lexState = 'string'
            return
        }

        throw invalidChar(read())
    },

    identifierNameStartEscape () {
        if (c !== 'u') {
            throw invalidChar(read())
        }

        read()
        const u = unicodeEscape()
        switch (u) {
        case '$':
        case '_':
            break

        default:
            if (!util.isIdStartChar(u)) {
                throw invalidIdentifier()
            }

            break
        }

        buffer += u
        lexState = 'identifierName'
    },

    identifierName () {
        switch (c) {
        case '$':
        case '_':
        case '\u200C':
        case '\u200D':
            buffer += read()
            return

        case '\\':
            read()
            lexState = 'identifierNameEscape'
            return
        }

        if (util.isIdContinueChar(c)) {
            buffer += read()
            return
        }

        return newToken('identifier', buffer)
    },

    identifierNameEscape () {
        if (c !== 'u') {
            throw invalidChar(read())
        }

        read()
        const u = unicodeEscape()
        switch (u) {
        case '$':
        case '_':
        case '\u200C':
        case '\u200D':
            break

        default:
            if (!util.isIdContinueChar(u)) {
                throw invalidIdentifier()
            }

            break
        }

        buffer += u
        lexState = 'identifierName'
    },

    sign () {
        switch (c) {
        case '.':
            buffer = read()
            lexState = 'decimalPointLeading'
            return

        case '0':
            buffer = read()
            lexState = 'zero'
            return

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            buffer = read()
            lexState = 'decimalInteger'
            return

        case 'I':
            read()
            literal('nfinity')
            return newToken('numeric', sign * Infinity)

        case 'N':
            read()
            literal('aN')
            return newToken('numeric', NaN)
        }

        throw invalidChar(read())
    },

    zero () {
        switch (c) {
        case '.':
            buffer += read()
            lexState = 'decimalPoint'
            return

        case 'e':
        case 'E':
            buffer += read()
            lexState = 'decimalExponent'
            return

        case 'x':
        case 'X':
            buffer += read()
            lexState = 'hexadecimal'
            return
        }

        return newToken('numeric', sign * 0)
    },

    decimalInteger () {
        switch (c) {
        case '.':
            buffer += read()
            lexState = 'decimalPoint'
            return

        case 'e':
        case 'E':
            buffer += read()
            lexState = 'decimalExponent'
            return
        }

        if (util.isDigit(c)) {
            buffer += read()
            return
        }

        return newToken('numeric', sign * Number(buffer))
    },

    decimalPointLeading () {
        if (util.isDigit(c)) {
            buffer += read()
            lexState = 'decimalFraction'
            return
        }

        throw invalidChar(read())
    },

    decimalPoint () {
        switch (c) {
        case 'e':
        case 'E':
            buffer += read()
            lexState = 'decimalExponent'
            return
        }

        if (util.isDigit(c)) {
            buffer += read()
            lexState = 'decimalFraction'
            return
        }

        return newToken('numeric', sign * Number(buffer))
    },

    decimalFraction () {
        switch (c) {
        case 'e':
        case 'E':
            buffer += read()
            lexState = 'decimalExponent'
            return
        }

        if (util.isDigit(c)) {
            buffer += read()
            return
        }

        return newToken('numeric', sign * Number(buffer))
    },

    decimalExponent () {
        switch (c) {
        case '+':
        case '-':
            buffer += read()
            lexState = 'decimalExponentSign'
            return
        }

        if (util.isDigit(c)) {
            buffer += read()
            lexState = 'decimalExponentInteger'
            return
        }

        throw invalidChar(read())
    },

    decimalExponentSign () {
        if (util.isDigit(c)) {
            buffer += read()
            lexState = 'decimalExponentInteger'
            return
        }

        throw invalidChar(read())
    },

    decimalExponentInteger () {
        if (util.isDigit(c)) {
            buffer += read()
            return
        }

        return newToken('numeric', sign * Number(buffer))
    },

    hexadecimal () {
        if (util.isHexDigit(c)) {
            buffer += read()
            lexState = 'hexadecimalInteger'
            return
        }

        throw invalidChar(read())
    },

    hexadecimalInteger () {
        if (util.isHexDigit(c)) {
            buffer += read()
            return
        }

        return newToken('numeric', sign * Number(buffer))
    },

    string () {
        switch (c) {
        case '\\':
            read()
            buffer += escape()
            return

        case '"':
            if (doubleQuote) {
                read()
                return newToken('string', buffer)
            }

            buffer += read()
            return

        case "'":
            if (!doubleQuote) {
                read()
                return newToken('string', buffer)
            }

            buffer += read()
            return

        case '\n':
        case '\r':
            throw invalidChar(read())

        case '\u2028':
        case '\u2029':
            separatorChar(c)
            break

        case undefined:
            throw invalidChar(read())
        }

        buffer += read()
    },

    start () {
        switch (c) {
        case '{':
        case '[':
            return newToken('punctuator', read())

        // This code is unreachable since the default lexState handles eof.
        // case undefined:
        //     return newToken('eof')
        }

        lexState = 'value'
    },

    beforePropertyName () {
        switch (c) {
        case '$':
        case '_':
            buffer = read()
            lexState = 'identifierName'
            return

        case '\\':
            read()
            lexState = 'identifierNameStartEscape'
            return

        case '}':
            return newToken('punctuator', read())

        case '"':
        case "'":
            doubleQuote = (read() === '"')
            lexState = 'string'
            return
        }

        if (util.isIdStartChar(c)) {
            buffer += read()
            lexState = 'identifierName'
            return
        }

        throw invalidChar(read())
    },

    afterPropertyName () {
        if (c === ':') {
            return newToken('punctuator', read())
        }

        throw invalidChar(read())
    },

    beforePropertyValue () {
        lexState = 'value'
    },

    afterPropertyValue () {
        switch (c) {
        case ',':
        case '}':
            return newToken('punctuator', read())
        }

        throw invalidChar(read())
    },

    beforeArrayValue () {
        if (c === ']') {
            return newToken('punctuator', read())
        }

        lexState = 'value'
    },

    afterArrayValue () {
        switch (c) {
        case ',':
        case ']':
            return newToken('punctuator', read())
        }

        throw invalidChar(read())
    },

    end () {
        // This code is unreachable since it's handled by the default lexState.
        // if (c === undefined) {
        //     read()
        //     return newToken('eof')
        // }

        throw invalidChar(read())
    },
}

function newToken (type, value) {
    return {
        type,
        value,
        line,
        column,
    }
}

function literal (s) {
    for (const c of s) {
        const p = peek()

        if (p !== c) {
            throw invalidChar(read())
        }

        read()
    }
}

function escape () {
    const c = peek()
    switch (c) {
    case 'b':
        read()
        return '\b'

    case 'f':
        read()
        return '\f'

    case 'n':
        read()
        return '\n'

    case 'r':
        read()
        return '\r'

    case 't':
        read()
        return '\t'

    case 'v':
        read()
        return '\v'

    case '0':
        read()
        if (util.isDigit(peek())) {
            throw invalidChar(read())
        }

        return '\0'

    case 'x':
        read()
        return hexEscape()

    case 'u':
        read()
        return unicodeEscape()

    case '\n':
    case '\u2028':
    case '\u2029':
        read()
        return ''

    case '\r':
        read()
        if (peek() === '\n') {
            read()
        }

        return ''

    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
        throw invalidChar(read())

    case undefined:
        throw invalidChar(read())
    }

    return read()
}

function hexEscape () {
    let buffer = ''
    let c = peek()

    if (!util.isHexDigit(c)) {
        throw invalidChar(read())
    }

    buffer += read()

    c = peek()
    if (!util.isHexDigit(c)) {
        throw invalidChar(read())
    }

    buffer += read()

    return String.fromCodePoint(parseInt(buffer, 16))
}

function unicodeEscape () {
    let buffer = ''
    let count = 4

    while (count-- > 0) {
        const c = peek()
        if (!util.isHexDigit(c)) {
            throw invalidChar(read())
        }

        buffer += read()
    }

    return String.fromCodePoint(parseInt(buffer, 16))
}

const parseStates = {
    start () {
        if (token.type === 'eof') {
            throw invalidEOF()
        }

        push()
    },

    beforePropertyName () {
        switch (token.type) {
        case 'identifier':
        case 'string':
            key = token.value
            parseState = 'afterPropertyName'
            return

        case 'punctuator':
            // This code is unreachable since it's handled by the lexState.
            // if (token.value !== '}') {
            //     throw invalidToken()
            // }

            pop()
            return

        case 'eof':
            throw invalidEOF()
        }

        // This code is unreachable since it's handled by the lexState.
        // throw invalidToken()
    },

    afterPropertyName () {
        // This code is unreachable since it's handled by the lexState.
        // if (token.type !== 'punctuator' || token.value !== ':') {
        //     throw invalidToken()
        // }

        if (token.type === 'eof') {
            throw invalidEOF()
        }

        parseState = 'beforePropertyValue'
    },

    beforePropertyValue () {
        if (token.type === 'eof') {
            throw invalidEOF()
        }

        push()
    },

    beforeArrayValue () {
        if (token.type === 'eof') {
            throw invalidEOF()
        }

        if (token.type === 'punctuator' && token.value === ']') {
            pop()
            return
        }

        push()
    },

    afterPropertyValue () {
        // This code is unreachable since it's handled by the lexState.
        // if (token.type !== 'punctuator') {
        //     throw invalidToken()
        // }

        if (token.type === 'eof') {
            throw invalidEOF()
        }

        switch (token.value) {
        case ',':
            parseState = 'beforePropertyName'
            return

        case '}':
            pop()
        }

        // This code is unreachable since it's handled by the lexState.
        // throw invalidToken()
    },

    afterArrayValue () {
        // This code is unreachable since it's handled by the lexState.
        // if (token.type !== 'punctuator') {
        //     throw invalidToken()
        // }

        if (token.type === 'eof') {
            throw invalidEOF()
        }

        switch (token.value) {
        case ',':
            parseState = 'beforeArrayValue'
            return

        case ']':
            pop()
        }

        // This code is unreachable since it's handled by the lexState.
        // throw invalidToken()
    },

    end () {
        // This code is unreachable since it's handled by the lexState.
        // if (token.type !== 'eof') {
        //     throw invalidToken()
        // }
    },
}

function push () {
    let value

    switch (token.type) {
    case 'punctuator':
        switch (token.value) {
        case '{':
            value = {}
            break

        case '[':
            value = []
            break
        }

        break

    case 'null':
    case 'boolean':
    case 'numeric':
    case 'string':
        value = token.value
        break

    // This code is unreachable.
    // default:
    //     throw invalidToken()
    }

    if (root === undefined) {
        root = value
    } else {
        const parent = stack[stack.length - 1]
        if (Array.isArray(parent)) {
            parent.push(value)
        } else {
            parent[key] = value
        }
    }

    if (value !== null && typeof value === 'object') {
        stack.push(value)

        if (Array.isArray(value)) {
            parseState = 'beforeArrayValue'
        } else {
            parseState = 'beforePropertyName'
        }
    } else {
        const current = stack[stack.length - 1]
        if (current == null) {
            parseState = 'end'
        } else if (Array.isArray(current)) {
            parseState = 'afterArrayValue'
        } else {
            parseState = 'afterPropertyValue'
        }
    }
}

function pop () {
    stack.pop()

    const current = stack[stack.length - 1]
    if (current == null) {
        parseState = 'end'
    } else if (Array.isArray(current)) {
        parseState = 'afterArrayValue'
    } else {
        parseState = 'afterPropertyValue'
    }
}

// This code is unreachable.
// function invalidParseState () {
//     return new Error(`JSON5: invalid parse state '${parseState}'`)
// }

// This code is unreachable.
// function invalidLexState (state) {
//     return new Error(`JSON5: invalid lex state '${state}'`)
// }

function invalidChar (c) {
    if (c === undefined) {
        return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
    }

    return syntaxError(`JSON5: invalid character '${formatChar(c)}' at ${line}:${column}`)
}

function invalidEOF () {
    return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
}

// This code is unreachable.
// function invalidToken () {
//     if (token.type === 'eof') {
//         return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
//     }

//     const c = String.fromCodePoint(token.value.codePointAt(0))
//     return syntaxError(`JSON5: invalid character '${formatChar(c)}' at ${line}:${column}`)
// }

function invalidIdentifier () {
    column -= 5
    return syntaxError(`JSON5: invalid identifier character at ${line}:${column}`)
}

function separatorChar (c) {
    console.warn(`JSON5: '${formatChar(c)}' in strings is not valid ECMAScript; consider escaping`)
}

function formatChar (c) {
    const replacements = {
        "'": "\\'",
        '"': '\\"',
        '\\': '\\\\',
        '\b': '\\b',
        '\f': '\\f',
        '\n': '\\n',
        '\r': '\\r',
        '\t': '\\t',
        '\v': '\\v',
        '\0': '\\0',
        '\u2028': '\\u2028',
        '\u2029': '\\u2029',
    }

    if (replacements[c]) {
        return replacements[c]
    }

    if (c < ' ') {
        const hexString = c.charCodeAt(0).toString(16)
        return '\\x' + ('00' + hexString).substring(hexString.length)
    }

    return c
}

function syntaxError (message) {
    const err = new SyntaxError(message)
    err.lineNumber = line
    err.columnNumber = column
    return err
}

},{"./util":81}],79:[function(require,module,exports){
const util = require('./util')

module.exports = function stringify (value, replacer, space) {
    const stack = []
    let indent = ''
    let propertyList
    let replacerFunc
    let gap = ''
    let quote

    if (
        replacer != null &&
        typeof replacer === 'object' &&
        !Array.isArray(replacer)
    ) {
        space = replacer.space
        quote = replacer.quote
        replacer = replacer.replacer
    }

    if (typeof replacer === 'function') {
        replacerFunc = replacer
    } else if (Array.isArray(replacer)) {
        propertyList = []
        for (const v of replacer) {
            let item

            if (typeof v === 'string') {
                item = v
            } else if (
                typeof v === 'number' ||
                v instanceof String ||
                v instanceof Number
            ) {
                item = String(v)
            }

            if (item !== undefined && propertyList.indexOf(item) < 0) {
                propertyList.push(item)
            }
        }
    }

    if (space instanceof Number) {
        space = Number(space)
    } else if (space instanceof String) {
        space = String(space)
    }

    if (typeof space === 'number') {
        if (space > 0) {
            space = Math.min(10, Math.floor(space))
            gap = '          '.substr(0, space)
        }
    } else if (typeof space === 'string') {
        gap = space.substr(0, 10)
    }

    return serializeProperty('', {'': value})

    function serializeProperty (key, holder) {
        let value = holder[key]
        if (value != null) {
            if (typeof value.toJSON5 === 'function') {
                value = value.toJSON5(key)
            } else if (typeof value.toJSON === 'function') {
                value = value.toJSON(key)
            }
        }

        if (replacerFunc) {
            value = replacerFunc.call(holder, key, value)
        }

        if (value instanceof Number) {
            value = Number(value)
        } else if (value instanceof String) {
            value = String(value)
        } else if (value instanceof Boolean) {
            value = value.valueOf()
        }

        switch (value) {
        case null: return 'null'
        case true: return 'true'
        case false: return 'false'
        }

        if (typeof value === 'string') {
            return quoteString(value, false)
        }

        if (typeof value === 'number') {
            return String(value)
        }

        if (typeof value === 'object') {
            return Array.isArray(value) ? serializeArray(value) : serializeObject(value)
        }

        return undefined
    }

    function quoteString (value) {
        const quotes = {
            "'": 0.1,
            '"': 0.2,
        }

        const replacements = {
            "'": "\\'",
            '"': '\\"',
            '\\': '\\\\',
            '\b': '\\b',
            '\f': '\\f',
            '\n': '\\n',
            '\r': '\\r',
            '\t': '\\t',
            '\v': '\\v',
            '\0': '\\0',
            '\u2028': '\\u2028',
            '\u2029': '\\u2029',
        }

        let product = ''

        for (let i = 0; i < value.length; i++) {
            const c = value[i]
            switch (c) {
            case "'":
            case '"':
                quotes[c]++
                product += c
                continue

            case '\0':
                if (util.isDigit(value[i + 1])) {
                    product += '\\x00'
                    continue
                }
            }

            if (replacements[c]) {
                product += replacements[c]
                continue
            }

            if (c < ' ') {
                let hexString = c.charCodeAt(0).toString(16)
                product += '\\x' + ('00' + hexString).substring(hexString.length)
                continue
            }

            product += c
        }

        const quoteChar = quote || Object.keys(quotes).reduce((a, b) => (quotes[a] < quotes[b]) ? a : b)

        product = product.replace(new RegExp(quoteChar, 'g'), replacements[quoteChar])

        return quoteChar + product + quoteChar
    }

    function serializeObject (value) {
        if (stack.indexOf(value) >= 0) {
            throw TypeError('Converting circular structure to JSON5')
        }

        stack.push(value)

        let stepback = indent
        indent = indent + gap

        let keys = propertyList || Object.keys(value)
        let partial = []
        for (const key of keys) {
            const propertyString = serializeProperty(key, value)
            if (propertyString !== undefined) {
                let member = serializeKey(key) + ':'
                if (gap !== '') {
                    member += ' '
                }
                member += propertyString
                partial.push(member)
            }
        }

        let final
        if (partial.length === 0) {
            final = '{}'
        } else {
            let properties
            if (gap === '') {
                properties = partial.join(',')
                final = '{' + properties + '}'
            } else {
                let separator = ',\n' + indent
                properties = partial.join(separator)
                final = '{\n' + indent + properties + ',\n' + stepback + '}'
            }
        }

        stack.pop()
        indent = stepback
        return final
    }

    function serializeKey (key) {
        if (key.length === 0) {
            return quoteString(key, true)
        }

        const firstChar = String.fromCodePoint(key.codePointAt(0))
        if (!util.isIdStartChar(firstChar)) {
            return quoteString(key, true)
        }

        for (let i = firstChar.length; i < key.length; i++) {
            if (!util.isIdContinueChar(String.fromCodePoint(key.codePointAt(i)))) {
                return quoteString(key, true)
            }
        }

        return key
    }

    function serializeArray (value) {
        if (stack.indexOf(value) >= 0) {
            throw TypeError('Converting circular structure to JSON5')
        }

        stack.push(value)

        let stepback = indent
        indent = indent + gap

        let partial = []
        for (let i = 0; i < value.length; i++) {
            const propertyString = serializeProperty(String(i), value)
            partial.push((propertyString !== undefined) ? propertyString : 'null')
        }

        let final
        if (partial.length === 0) {
            final = '[]'
        } else {
            if (gap === '') {
                let properties = partial.join(',')
                final = '[' + properties + ']'
            } else {
                let separator = ',\n' + indent
                let properties = partial.join(separator)
                final = '[\n' + indent + properties + ',\n' + stepback + ']'
            }
        }

        stack.pop()
        indent = stepback
        return final
    }
}

},{"./util":81}],80:[function(require,module,exports){
// This is a generated file. Do not edit.
module.exports.Space_Separator = /[\u1680\u2000-\u200A\u202F\u205F\u3000]/
module.exports.ID_Start = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/
module.exports.ID_Continue = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDE00-\uDE3E\uDE47\uDE50-\uDE83\uDE86-\uDE99\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/

},{}],81:[function(require,module,exports){
const unicode = require('../lib/unicode')

module.exports = {
    isSpaceSeparator (c) {
        return typeof c === 'string' && unicode.Space_Separator.test(c)
    },

    isIdStartChar (c) {
        return typeof c === 'string' && (
            (c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
        (c === '$') || (c === '_') ||
        unicode.ID_Start.test(c)
        )
    },

    isIdContinueChar (c) {
        return typeof c === 'string' && (
            (c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
        (c >= '0' && c <= '9') ||
        (c === '$') || (c === '_') ||
        (c === '\u200C') || (c === '\u200D') ||
        unicode.ID_Continue.test(c)
        )
    },

    isDigit (c) {
        return typeof c === 'string' && /[0-9]/.test(c)
    },

    isHexDigit (c) {
        return typeof c === 'string' && /[0-9A-Fa-f]/.test(c)
    },
}

},{"../lib/unicode":80}],82:[function(require,module,exports){
'use strict';

var parse = require('./parse'),
    stringify = require('./stringify'),
    traverse = require('./traverse');

exports.parse = parse;
exports.stringify = stringify;
exports.traverse = traverse;
exports.p = parse;
exports.s = stringify;
exports.t = traverse;

},{"./parse":83,"./stringify":84,"./traverse":85}],83:[function(require,module,exports){
'use strict';

var parser = require('sax').parser;

function parse(data, config) {
    var res = [],
        stack = [],
        pointer = res,
        trim = true,
        p;

    var strict = true;
    if (config && (config.strict !== undefined)) {
        strict = config.strict;
    }

    if (config !== undefined) {
        if (config.trim !== undefined) {
            trim = config.trim;
        }
    }

    p = parser(strict);

    p.ontext = function (e) {
        if ((trim === false) || (e.trim() !== '')) {
            pointer.push(e);
        }
    };

    p.onopentag = function (e) {
        var leaf;
        leaf = [e.name, e.attributes];
        stack.push(pointer);
        pointer.push(leaf);
        pointer = leaf;

    };

    p.onclosetag = function () {
        pointer = stack.pop();
    };

    p.oncdata = function (e) {
        if ((trim === false) || (e.trim() !== '')) {
            pointer.push('<![CDATA[' + e + ']]>');
        }
    };

    p.write(data).close();
    return res[0];
}

module.exports = parse;

},{"sax":90}],84:[function(require,module,exports){
'use strict';

function isObject (o) {
    return o && Object.prototype.toString.call(o) === '[object Object]';
}

function indenter (indentation) {
    var space = ' '.repeat(indentation);
    return function (txt) {
        var arr, res = [];

        if (typeof txt !== 'string') {
            return txt;
        }

        arr = txt.split('\n');

        if (arr.length === 1) {
            return space + txt;
        }

        arr.forEach(function (e) {
            if (e.trim() === '') {
                res.push(e);
                return;
            }
            res.push(space + e);
        });

        return res.join('\n');
    };
}

function clean (txt) {
    var arr = txt.split('\n');
    var res = [];
    arr.forEach(function (e) {
        if (e.trim() === '') {
            return;
        }
        res.push(e);
    });
    return res.join('\n');
}

function stringify (a, indentation) {

    var cr = '';
    var indent = function (t) { return t; };

    if (indentation > 0) {
        cr = '\n';
        indent = indenter(indentation);
    }

    function rec (a) {
        var res, body, isEmpty, isFlat;

        body = '';
        isFlat = true;
        isEmpty = a.some(function (e, i, arr) {
            if (i === 0) {
                res = '<' + e;
                if (arr.length === 1) {
                    return true;
                }
                return;
            }

            if (i === 1) {
                if (isObject(e)) {
                    Object.keys(e).forEach(function (key) {
                        res += ' ' + key + '="' + e[key] + '"';
                    });
                    if (arr.length === 2) {
                        return true;
                    }
                    res += '>';
                    return;
                } else {
                    res += '>';
                }
            }

            switch (typeof e) {
            case 'string':
            case 'number':
            case 'boolean':
            case 'undefined':
                body += e + cr;
                return;
            }

            isFlat = false;
            body += rec(e);
        });

        if (isEmpty) {
            return res + '/>' + cr; // short form
        } else {
            if (isFlat) {
                return res + clean(body) + '</' + a[0] + '>' + cr;
            } else {
                return res + cr + indent(body) + '</' + a[0] + '>' + cr;
            }
        }
    }

    return rec(a);
}

module.exports = stringify;

},{}],85:[function(require,module,exports){
'use strict';

function traverse(origin, callbacks) {
    var empty = function () {};
    var enter = empty;
    var leave = empty;

    function skipFn() {
        this._skip = true;
    }

    function removeFn() {
        this._remove = true;
    }

    function nameFn(name) {
        this._name = name;
    }

    function replaceFn(node) {
        this._replace = node;
    }

    function rec(tree, parent) {
        var type,
            node = { attr: {}, full: tree },
            cxt = {
                name: nameFn,
                skip: skipFn,
                // break: breakFn,
                remove: removeFn,
                replace: replaceFn,

                _name: undefined,
                _skip: false,
                // _break: false,
                _remove: false,
                _replace: undefined
            },
            e1IsNotAnObject = true,
            index,
            ilen,
            returnRes;

        if (tree === undefined) return;
        if (tree === null) return;
        if (tree === true) return;
        if (tree === false) return;

        type = Object.prototype.toString.call(tree);

        switch (type) {
        case '[object String]':
        case '[object Number]':
            return;

        case '[object Array]':
            tree.some(function (e, i) {
                if (i === 0) {
                    node.name = e;
                    return false;
                }
                if (i === 1) {
                    if (
                        Object.prototype.toString.call(e) === '[object Object]'
                    ) {
                        e1IsNotAnObject = false;
                        node.attr = e;
                    }
                    return true;
                }
            });

            enter.call(cxt, node, parent);
            if (cxt._name) {
                tree[0] = cxt._name;
            }

            if (cxt._replace) {
                return cxt._replace;
            } else
            if (cxt._remove) {
                return null;
            } else
            if (!cxt._skip) {

                index = 0;
                ilen = tree.length;
                while (index < ilen) {
                    if ((index > 1) || ((index === 1) && e1IsNotAnObject)) {
                        returnRes = rec(tree[index], node);
                        if (returnRes === null) {
                            tree.splice(index, 1);
                            ilen -= 1;
                            continue;
                        }
                        if (returnRes) {
                            tree[index] = returnRes;
                        }
                    }
                    index += 1;
                }

                leave.call(cxt, node, parent);
                if (cxt._name) {
                    tree[0] = cxt._name;
                }
                if (cxt._replace) {
                    return cxt._replace;
                } else
                if (cxt._remove) {
                    return null;
                }
            }
        }
    }

    if (callbacks) {
        if (callbacks.enter) {
            enter = callbacks.enter;
        }
        if (callbacks.leave) {
            leave = callbacks.leave;
        }
    }

    rec(origin, undefined);
}

module.exports = traverse;

},{}],86:[function(require,module,exports){
'use strict';
const pTry = require('p-try');

const pLimit = concurrency => {
	if (!((Number.isInteger(concurrency) || concurrency === Infinity) && concurrency > 0)) {
		return Promise.reject(new TypeError('Expected `concurrency` to be a number from 1 and up'));
	}

	const queue = [];
	let activeCount = 0;

	const next = () => {
		activeCount--;

		if (queue.length > 0) {
			queue.shift()();
		}
	};

	const run = (fn, resolve, ...args) => {
		activeCount++;

		const result = pTry(fn, ...args);

		resolve(result);

		result.then(next, next);
	};

	const enqueue = (fn, resolve, ...args) => {
		if (activeCount < concurrency) {
			run(fn, resolve, ...args);
		} else {
			queue.push(run.bind(null, fn, resolve, ...args));
		}
	};

	const generator = (fn, ...args) => new Promise(resolve => enqueue(fn, resolve, ...args));
	Object.defineProperties(generator, {
		activeCount: {
			get: () => activeCount
		},
		pendingCount: {
			get: () => queue.length
		},
		clearQueue: {
			value: () => {
				queue.length = 0;
			}
		}
	});

	return generator;
};

module.exports = pLimit;
module.exports.default = pLimit;

},{"p-try":87}],87:[function(require,module,exports){
'use strict';

const pTry = (fn, ...arguments_) => new Promise(resolve => {
	resolve(fn(...arguments_));
});

module.exports = pTry;
// TODO: remove this in the next major version
module.exports.default = pTry;

},{}],88:[function(require,module,exports){
'use strict';

var fs = require('fs'),
  join = require('path').join,
  resolve = require('path').resolve,
  dirname = require('path').dirname,
  defaultOptions = {
    extensions: ['js', 'json', 'coffee'],
    recurse: true,
    rename: function (name) {
      return name;
    },
    visit: function (obj) {
      return obj;
    }
  };

function checkFileInclusion(path, filename, options) {
  return (
    // verify file has valid extension
    (new RegExp('\\.(' + options.extensions.join('|') + ')$', 'i').test(filename)) &&

    // if options.include is a RegExp, evaluate it and make sure the path passes
    !(options.include && options.include instanceof RegExp && !options.include.test(path)) &&

    // if options.include is a function, evaluate it and make sure the path passes
    !(options.include && typeof options.include === 'function' && !options.include(path, filename)) &&

    // if options.exclude is a RegExp, evaluate it and make sure the path doesn't pass
    !(options.exclude && options.exclude instanceof RegExp && options.exclude.test(path)) &&

    // if options.exclude is a function, evaluate it and make sure the path doesn't pass
    !(options.exclude && typeof options.exclude === 'function' && options.exclude(path, filename))
  );
}

function requireDirectory(m, path, options) {
  var retval = {};

  // path is optional
  if (path && !options && typeof path !== 'string') {
    options = path;
    path = null;
  }

  // default options
  options = options || {};
  for (var prop in defaultOptions) {
    if (typeof options[prop] === 'undefined') {
      options[prop] = defaultOptions[prop];
    }
  }

  // if no path was passed in, assume the equivelant of __dirname from caller
  // otherwise, resolve path relative to the equivalent of __dirname
  path = !path ? dirname(m.filename) : resolve(dirname(m.filename), path);

  // get the path of each file in specified directory, append to current tree node, recurse
  fs.readdirSync(path).forEach(function (filename) {
    var joined = join(path, filename),
      files,
      key,
      obj;

    if (fs.statSync(joined).isDirectory() && options.recurse) {
      // this node is a directory; recurse
      files = requireDirectory(m, joined, options);
      // exclude empty directories
      if (Object.keys(files).length) {
        retval[options.rename(filename, joined, filename)] = files;
      }
    } else {
      if (joined !== m.filename && checkFileInclusion(joined, filename, options)) {
        // hash node key shouldn't include file extension
        key = filename.substring(0, filename.lastIndexOf('.'));
        obj = m.require(joined);
        retval[options.rename(key, joined, filename)] = options.visit(obj, joined, filename) || obj;
      }
    }
  });

  return retval;
}

module.exports = requireDirectory;
module.exports.defaults = defaultOptions;

},{"fs":undefined,"path":undefined}],89:[function(require,module,exports){
module.exports = function (_require) {
  _require = _require || require
  var main = _require.main
  if (main && isIISNode(main)) return handleIISNode(main)
  else return main ? main.filename : process.cwd()
}

function isIISNode (main) {
  return /\\iisnode\\/.test(main.filename)
}

function handleIISNode (main) {
  if (!main.children.length) {
    return main.filename
  } else {
    return main.children[0].filename
  }
}

},{}],90:[function(require,module,exports){
;(function (sax) { // wrapper for non-node envs
  sax.parser = function (strict, opt) { return new SAXParser(strict, opt) }
  sax.SAXParser = SAXParser
  sax.SAXStream = SAXStream
  sax.createStream = createStream

  // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
  // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
  // since that's the earliest that a buffer overrun could occur.  This way, checks are
  // as rare as required, but as often as necessary to ensure never crossing this bound.
  // Furthermore, buffers are only tested at most once per write(), so passing a very
  // large string into write() might have undesirable effects, but this is manageable by
  // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
  // edge case, result in creating at most one complete copy of the string passed in.
  // Set to Infinity to have unlimited buffers.
  sax.MAX_BUFFER_LENGTH = 64 * 1024

  var buffers = [
    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
    'procInstName', 'procInstBody', 'entity', 'attribName',
    'attribValue', 'cdata', 'script'
  ]

  sax.EVENTS = [
    'text',
    'processinginstruction',
    'sgmldeclaration',
    'doctype',
    'comment',
    'opentagstart',
    'attribute',
    'opentag',
    'closetag',
    'opencdata',
    'cdata',
    'closecdata',
    'error',
    'end',
    'ready',
    'script',
    'opennamespace',
    'closenamespace'
  ]

  function SAXParser (strict, opt) {
    if (!(this instanceof SAXParser)) {
      return new SAXParser(strict, opt)
    }

    var parser = this
    clearBuffers(parser)
    parser.q = parser.c = ''
    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH
    parser.opt = opt || {}
    parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags
    parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase'
    parser.tags = []
    parser.closed = parser.closedRoot = parser.sawRoot = false
    parser.tag = parser.error = null
    parser.strict = !!strict
    parser.noscript = !!(strict || parser.opt.noscript)
    parser.state = S.BEGIN
    parser.strictEntities = parser.opt.strictEntities
    parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES)
    parser.attribList = []

    // namespaces form a prototype chain.
    // it always points at the current tag,
    // which protos to its parent tag.
    if (parser.opt.xmlns) {
      parser.ns = Object.create(rootNS)
    }

    // mostly just for error reporting
    parser.trackPosition = parser.opt.position !== false
    if (parser.trackPosition) {
      parser.position = parser.line = parser.column = 0
    }
    emit(parser, 'onready')
  }

  if (!Object.create) {
    Object.create = function (o) {
      function F () {}
      F.prototype = o
      var newf = new F()
      return newf
    }
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      var a = []
      for (var i in o) if (o.hasOwnProperty(i)) a.push(i)
      return a
    }
  }

  function checkBufferLength (parser) {
    var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10)
    var maxActual = 0
    for (var i = 0, l = buffers.length; i < l; i++) {
      var len = parser[buffers[i]].length
      if (len > maxAllowed) {
        // Text/cdata nodes can get big, and since they're buffered,
        // we can get here under normal conditions.
        // Avoid issues by emitting the text node now,
        // so at least it won't get any bigger.
        switch (buffers[i]) {
          case 'textNode':
            closeText(parser)
            break

          case 'cdata':
            emitNode(parser, 'oncdata', parser.cdata)
            parser.cdata = ''
            break

          case 'script':
            emitNode(parser, 'onscript', parser.script)
            parser.script = ''
            break

          default:
            error(parser, 'Max buffer length exceeded: ' + buffers[i])
        }
      }
      maxActual = Math.max(maxActual, len)
    }
    // schedule the next check for the earliest possible buffer overrun.
    var m = sax.MAX_BUFFER_LENGTH - maxActual
    parser.bufferCheckPosition = m + parser.position
  }

  function clearBuffers (parser) {
    for (var i = 0, l = buffers.length; i < l; i++) {
      parser[buffers[i]] = ''
    }
  }

  function flushBuffers (parser) {
    closeText(parser)
    if (parser.cdata !== '') {
      emitNode(parser, 'oncdata', parser.cdata)
      parser.cdata = ''
    }
    if (parser.script !== '') {
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }
  }

  SAXParser.prototype = {
    end: function () { end(this) },
    write: write,
    resume: function () { this.error = null; return this },
    close: function () { return this.write(null) },
    flush: function () { flushBuffers(this) }
  }

  var Stream
  try {
    Stream = require('stream').Stream
  } catch (ex) {
    Stream = function () {}
  }

  var streamWraps = sax.EVENTS.filter(function (ev) {
    return ev !== 'error' && ev !== 'end'
  })

  function createStream (strict, opt) {
    return new SAXStream(strict, opt)
  }

  function SAXStream (strict, opt) {
    if (!(this instanceof SAXStream)) {
      return new SAXStream(strict, opt)
    }

    Stream.apply(this)

    this._parser = new SAXParser(strict, opt)
    this.writable = true
    this.readable = true

    var me = this

    this._parser.onend = function () {
      me.emit('end')
    }

    this._parser.onerror = function (er) {
      me.emit('error', er)

      // if didn't throw, then means error was handled.
      // go ahead and clear error, so we can write again.
      me._parser.error = null
    }

    this._decoder = null

    streamWraps.forEach(function (ev) {
      Object.defineProperty(me, 'on' + ev, {
        get: function () {
          return me._parser['on' + ev]
        },
        set: function (h) {
          if (!h) {
            me.removeAllListeners(ev)
            me._parser['on' + ev] = h
            return h
          }
          me.on(ev, h)
        },
        enumerable: true,
        configurable: false
      })
    })
  }

  SAXStream.prototype = Object.create(Stream.prototype, {
    constructor: {
      value: SAXStream
    }
  })

  SAXStream.prototype.write = function (data) {
    if (typeof Buffer === 'function' &&
      typeof Buffer.isBuffer === 'function' &&
      Buffer.isBuffer(data)) {
      if (!this._decoder) {
        var SD = require('string_decoder').StringDecoder
        this._decoder = new SD('utf8')
      }
      data = this._decoder.write(data)
    }

    this._parser.write(data.toString())
    this.emit('data', data)
    return true
  }

  SAXStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) {
      this.write(chunk)
    }
    this._parser.end()
    return true
  }

  SAXStream.prototype.on = function (ev, handler) {
    var me = this
    if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
      me._parser['on' + ev] = function () {
        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments)
        args.splice(0, 0, ev)
        me.emit.apply(me, args)
      }
    }

    return Stream.prototype.on.call(me, ev, handler)
  }

  // this really needs to be replaced with character classes.
  // XML allows all manner of ridiculous numbers and digits.
  var CDATA = '[CDATA['
  var DOCTYPE = 'DOCTYPE'
  var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
  var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'
  var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE }

  // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
  // This implementation works on strings, a single character at a time
  // as such, it cannot ever support astral-plane characters (10000-EFFFF)
  // without a significant breaking change to either this  parser, or the
  // JavaScript language.  Implementation of an emoji-capable xml parser
  // is left as an exercise for the reader.
  var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/

  var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

  var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
  var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

  function isWhitespace (c) {
    return c === ' ' || c === '\n' || c === '\r' || c === '\t'
  }

  function isQuote (c) {
    return c === '"' || c === '\''
  }

  function isAttribEnd (c) {
    return c === '>' || isWhitespace(c)
  }

  function isMatch (regex, c) {
    return regex.test(c)
  }

  function notMatch (regex, c) {
    return !isMatch(regex, c)
  }

  var S = 0
  sax.STATE = {
    BEGIN: S++, // leading byte order mark or whitespace
    BEGIN_WHITESPACE: S++, // leading whitespace
    TEXT: S++, // general stuff
    TEXT_ENTITY: S++, // &amp and such.
    OPEN_WAKA: S++, // <
    SGML_DECL: S++, // <!BLARG
    SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
    DOCTYPE: S++, // <!DOCTYPE
    DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
    DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
    DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
    COMMENT_STARTING: S++, // <!-
    COMMENT: S++, // <!--
    COMMENT_ENDING: S++, // <!-- blah -
    COMMENT_ENDED: S++, // <!-- blah --
    CDATA: S++, // <![CDATA[ something
    CDATA_ENDING: S++, // ]
    CDATA_ENDING_2: S++, // ]]
    PROC_INST: S++, // <?hi
    PROC_INST_BODY: S++, // <?hi there
    PROC_INST_ENDING: S++, // <?hi "there" ?
    OPEN_TAG: S++, // <strong
    OPEN_TAG_SLASH: S++, // <strong /
    ATTRIB: S++, // <a
    ATTRIB_NAME: S++, // <a foo
    ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
    ATTRIB_VALUE: S++, // <a foo=
    ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
    ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
    ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
    ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
    ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
    CLOSE_TAG: S++, // </a
    CLOSE_TAG_SAW_WHITE: S++, // </a   >
    SCRIPT: S++, // <script> ...
    SCRIPT_ENDING: S++ // <script> ... <
  }

  sax.XML_ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'"
  }

  sax.ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'",
    'AElig': 198,
    'Aacute': 193,
    'Acirc': 194,
    'Agrave': 192,
    'Aring': 197,
    'Atilde': 195,
    'Auml': 196,
    'Ccedil': 199,
    'ETH': 208,
    'Eacute': 201,
    'Ecirc': 202,
    'Egrave': 200,
    'Euml': 203,
    'Iacute': 205,
    'Icirc': 206,
    'Igrave': 204,
    'Iuml': 207,
    'Ntilde': 209,
    'Oacute': 211,
    'Ocirc': 212,
    'Ograve': 210,
    'Oslash': 216,
    'Otilde': 213,
    'Ouml': 214,
    'THORN': 222,
    'Uacute': 218,
    'Ucirc': 219,
    'Ugrave': 217,
    'Uuml': 220,
    'Yacute': 221,
    'aacute': 225,
    'acirc': 226,
    'aelig': 230,
    'agrave': 224,
    'aring': 229,
    'atilde': 227,
    'auml': 228,
    'ccedil': 231,
    'eacute': 233,
    'ecirc': 234,
    'egrave': 232,
    'eth': 240,
    'euml': 235,
    'iacute': 237,
    'icirc': 238,
    'igrave': 236,
    'iuml': 239,
    'ntilde': 241,
    'oacute': 243,
    'ocirc': 244,
    'ograve': 242,
    'oslash': 248,
    'otilde': 245,
    'ouml': 246,
    'szlig': 223,
    'thorn': 254,
    'uacute': 250,
    'ucirc': 251,
    'ugrave': 249,
    'uuml': 252,
    'yacute': 253,
    'yuml': 255,
    'copy': 169,
    'reg': 174,
    'nbsp': 160,
    'iexcl': 161,
    'cent': 162,
    'pound': 163,
    'curren': 164,
    'yen': 165,
    'brvbar': 166,
    'sect': 167,
    'uml': 168,
    'ordf': 170,
    'laquo': 171,
    'not': 172,
    'shy': 173,
    'macr': 175,
    'deg': 176,
    'plusmn': 177,
    'sup1': 185,
    'sup2': 178,
    'sup3': 179,
    'acute': 180,
    'micro': 181,
    'para': 182,
    'middot': 183,
    'cedil': 184,
    'ordm': 186,
    'raquo': 187,
    'frac14': 188,
    'frac12': 189,
    'frac34': 190,
    'iquest': 191,
    'times': 215,
    'divide': 247,
    'OElig': 338,
    'oelig': 339,
    'Scaron': 352,
    'scaron': 353,
    'Yuml': 376,
    'fnof': 402,
    'circ': 710,
    'tilde': 732,
    'Alpha': 913,
    'Beta': 914,
    'Gamma': 915,
    'Delta': 916,
    'Epsilon': 917,
    'Zeta': 918,
    'Eta': 919,
    'Theta': 920,
    'Iota': 921,
    'Kappa': 922,
    'Lambda': 923,
    'Mu': 924,
    'Nu': 925,
    'Xi': 926,
    'Omicron': 927,
    'Pi': 928,
    'Rho': 929,
    'Sigma': 931,
    'Tau': 932,
    'Upsilon': 933,
    'Phi': 934,
    'Chi': 935,
    'Psi': 936,
    'Omega': 937,
    'alpha': 945,
    'beta': 946,
    'gamma': 947,
    'delta': 948,
    'epsilon': 949,
    'zeta': 950,
    'eta': 951,
    'theta': 952,
    'iota': 953,
    'kappa': 954,
    'lambda': 955,
    'mu': 956,
    'nu': 957,
    'xi': 958,
    'omicron': 959,
    'pi': 960,
    'rho': 961,
    'sigmaf': 962,
    'sigma': 963,
    'tau': 964,
    'upsilon': 965,
    'phi': 966,
    'chi': 967,
    'psi': 968,
    'omega': 969,
    'thetasym': 977,
    'upsih': 978,
    'piv': 982,
    'ensp': 8194,
    'emsp': 8195,
    'thinsp': 8201,
    'zwnj': 8204,
    'zwj': 8205,
    'lrm': 8206,
    'rlm': 8207,
    'ndash': 8211,
    'mdash': 8212,
    'lsquo': 8216,
    'rsquo': 8217,
    'sbquo': 8218,
    'ldquo': 8220,
    'rdquo': 8221,
    'bdquo': 8222,
    'dagger': 8224,
    'Dagger': 8225,
    'bull': 8226,
    'hellip': 8230,
    'permil': 8240,
    'prime': 8242,
    'Prime': 8243,
    'lsaquo': 8249,
    'rsaquo': 8250,
    'oline': 8254,
    'frasl': 8260,
    'euro': 8364,
    'image': 8465,
    'weierp': 8472,
    'real': 8476,
    'trade': 8482,
    'alefsym': 8501,
    'larr': 8592,
    'uarr': 8593,
    'rarr': 8594,
    'darr': 8595,
    'harr': 8596,
    'crarr': 8629,
    'lArr': 8656,
    'uArr': 8657,
    'rArr': 8658,
    'dArr': 8659,
    'hArr': 8660,
    'forall': 8704,
    'part': 8706,
    'exist': 8707,
    'empty': 8709,
    'nabla': 8711,
    'isin': 8712,
    'notin': 8713,
    'ni': 8715,
    'prod': 8719,
    'sum': 8721,
    'minus': 8722,
    'lowast': 8727,
    'radic': 8730,
    'prop': 8733,
    'infin': 8734,
    'ang': 8736,
    'and': 8743,
    'or': 8744,
    'cap': 8745,
    'cup': 8746,
    'int': 8747,
    'there4': 8756,
    'sim': 8764,
    'cong': 8773,
    'asymp': 8776,
    'ne': 8800,
    'equiv': 8801,
    'le': 8804,
    'ge': 8805,
    'sub': 8834,
    'sup': 8835,
    'nsub': 8836,
    'sube': 8838,
    'supe': 8839,
    'oplus': 8853,
    'otimes': 8855,
    'perp': 8869,
    'sdot': 8901,
    'lceil': 8968,
    'rceil': 8969,
    'lfloor': 8970,
    'rfloor': 8971,
    'lang': 9001,
    'rang': 9002,
    'loz': 9674,
    'spades': 9824,
    'clubs': 9827,
    'hearts': 9829,
    'diams': 9830
  }

  Object.keys(sax.ENTITIES).forEach(function (key) {
    var e = sax.ENTITIES[key]
    var s = typeof e === 'number' ? String.fromCharCode(e) : e
    sax.ENTITIES[key] = s
  })

  for (var s in sax.STATE) {
    sax.STATE[sax.STATE[s]] = s
  }

  // shorthand
  S = sax.STATE

  function emit (parser, event, data) {
    parser[event] && parser[event](data)
  }

  function emitNode (parser, nodeType, data) {
    if (parser.textNode) closeText(parser)
    emit(parser, nodeType, data)
  }

  function closeText (parser) {
    parser.textNode = textopts(parser.opt, parser.textNode)
    if (parser.textNode) emit(parser, 'ontext', parser.textNode)
    parser.textNode = ''
  }

  function textopts (opt, text) {
    if (opt.trim) text = text.trim()
    if (opt.normalize) text = text.replace(/\s+/g, ' ')
    return text
  }

  function error (parser, er) {
    closeText(parser)
    if (parser.trackPosition) {
      er += '\nLine: ' + parser.line +
        '\nColumn: ' + parser.column +
        '\nChar: ' + parser.c
    }
    er = new Error(er)
    parser.error = er
    emit(parser, 'onerror', er)
    return parser
  }

  function end (parser) {
    if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag')
    if ((parser.state !== S.BEGIN) &&
      (parser.state !== S.BEGIN_WHITESPACE) &&
      (parser.state !== S.TEXT)) {
      error(parser, 'Unexpected end')
    }
    closeText(parser)
    parser.c = ''
    parser.closed = true
    emit(parser, 'onend')
    SAXParser.call(parser, parser.strict, parser.opt)
    return parser
  }

  function strictFail (parser, message) {
    if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
      throw new Error('bad call to strictFail')
    }
    if (parser.strict) {
      error(parser, message)
    }
  }

  function newTag (parser) {
    if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]()
    var parent = parser.tags[parser.tags.length - 1] || parser
    var tag = parser.tag = { name: parser.tagName, attributes: {} }

    // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
    if (parser.opt.xmlns) {
      tag.ns = parent.ns
    }
    parser.attribList.length = 0
    emitNode(parser, 'onopentagstart', tag)
  }

  function qname (name, attribute) {
    var i = name.indexOf(':')
    var qualName = i < 0 ? [ '', name ] : name.split(':')
    var prefix = qualName[0]
    var local = qualName[1]

    // <x "xmlns"="http://foo">
    if (attribute && name === 'xmlns') {
      prefix = 'xmlns'
      local = ''
    }

    return { prefix: prefix, local: local }
  }

  function attrib (parser) {
    if (!parser.strict) {
      parser.attribName = parser.attribName[parser.looseCase]()
    }

    if (parser.attribList.indexOf(parser.attribName) !== -1 ||
      parser.tag.attributes.hasOwnProperty(parser.attribName)) {
      parser.attribName = parser.attribValue = ''
      return
    }

    if (parser.opt.xmlns) {
      var qn = qname(parser.attribName, true)
      var prefix = qn.prefix
      var local = qn.local

      if (prefix === 'xmlns') {
        // namespace binding attribute. push the binding into scope
        if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
          strictFail(parser,
            'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue)
        } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
          strictFail(parser,
            'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue)
        } else {
          var tag = parser.tag
          var parent = parser.tags[parser.tags.length - 1] || parser
          if (tag.ns === parent.ns) {
            tag.ns = Object.create(parent.ns)
          }
          tag.ns[local] = parser.attribValue
        }
      }

      // defer onattribute events until all attributes have been seen
      // so any new bindings can take effect. preserve attribute order
      // so deferred events can be emitted in document order
      parser.attribList.push([parser.attribName, parser.attribValue])
    } else {
      // in non-xmlns mode, we can emit the event right away
      parser.tag.attributes[parser.attribName] = parser.attribValue
      emitNode(parser, 'onattribute', {
        name: parser.attribName,
        value: parser.attribValue
      })
    }

    parser.attribName = parser.attribValue = ''
  }

  function openTag (parser, selfClosing) {
    if (parser.opt.xmlns) {
      // emit namespace binding events
      var tag = parser.tag

      // add namespace info to tag
      var qn = qname(parser.tagName)
      tag.prefix = qn.prefix
      tag.local = qn.local
      tag.uri = tag.ns[qn.prefix] || ''

      if (tag.prefix && !tag.uri) {
        strictFail(parser, 'Unbound namespace prefix: ' +
          JSON.stringify(parser.tagName))
        tag.uri = qn.prefix
      }

      var parent = parser.tags[parser.tags.length - 1] || parser
      if (tag.ns && parent.ns !== tag.ns) {
        Object.keys(tag.ns).forEach(function (p) {
          emitNode(parser, 'onopennamespace', {
            prefix: p,
            uri: tag.ns[p]
          })
        })
      }

      // handle deferred onattribute events
      // Note: do not apply default ns to attributes:
      //   http://www.w3.org/TR/REC-xml-names/#defaulting
      for (var i = 0, l = parser.attribList.length; i < l; i++) {
        var nv = parser.attribList[i]
        var name = nv[0]
        var value = nv[1]
        var qualName = qname(name, true)
        var prefix = qualName.prefix
        var local = qualName.local
        var uri = prefix === '' ? '' : (tag.ns[prefix] || '')
        var a = {
          name: name,
          value: value,
          prefix: prefix,
          local: local,
          uri: uri
        }

        // if there's any attributes with an undefined namespace,
        // then fail on them now.
        if (prefix && prefix !== 'xmlns' && !uri) {
          strictFail(parser, 'Unbound namespace prefix: ' +
            JSON.stringify(prefix))
          a.uri = prefix
        }
        parser.tag.attributes[name] = a
        emitNode(parser, 'onattribute', a)
      }
      parser.attribList.length = 0
    }

    parser.tag.isSelfClosing = !!selfClosing

    // process the tag
    parser.sawRoot = true
    parser.tags.push(parser.tag)
    emitNode(parser, 'onopentag', parser.tag)
    if (!selfClosing) {
      // special case for <script> in non-strict mode.
      if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
        parser.state = S.SCRIPT
      } else {
        parser.state = S.TEXT
      }
      parser.tag = null
      parser.tagName = ''
    }
    parser.attribName = parser.attribValue = ''
    parser.attribList.length = 0
  }

  function closeTag (parser) {
    if (!parser.tagName) {
      strictFail(parser, 'Weird empty close tag.')
      parser.textNode += '</>'
      parser.state = S.TEXT
      return
    }

    if (parser.script) {
      if (parser.tagName !== 'script') {
        parser.script += '</' + parser.tagName + '>'
        parser.tagName = ''
        parser.state = S.SCRIPT
        return
      }
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }

    // first make sure that the closing tag actually exists.
    // <a><b></c></b></a> will close everything, otherwise.
    var t = parser.tags.length
    var tagName = parser.tagName
    if (!parser.strict) {
      tagName = tagName[parser.looseCase]()
    }
    var closeTo = tagName
    while (t--) {
      var close = parser.tags[t]
      if (close.name !== closeTo) {
        // fail the first time in strict mode
        strictFail(parser, 'Unexpected close tag')
      } else {
        break
      }
    }

    // didn't find it.  we already failed for strict, so just abort.
    if (t < 0) {
      strictFail(parser, 'Unmatched closing tag: ' + parser.tagName)
      parser.textNode += '</' + parser.tagName + '>'
      parser.state = S.TEXT
      return
    }
    parser.tagName = tagName
    var s = parser.tags.length
    while (s-- > t) {
      var tag = parser.tag = parser.tags.pop()
      parser.tagName = parser.tag.name
      emitNode(parser, 'onclosetag', parser.tagName)

      var x = {}
      for (var i in tag.ns) {
        x[i] = tag.ns[i]
      }

      var parent = parser.tags[parser.tags.length - 1] || parser
      if (parser.opt.xmlns && tag.ns !== parent.ns) {
        // remove namespace bindings introduced by tag
        Object.keys(tag.ns).forEach(function (p) {
          var n = tag.ns[p]
          emitNode(parser, 'onclosenamespace', { prefix: p, uri: n })
        })
      }
    }
    if (t === 0) parser.closedRoot = true
    parser.tagName = parser.attribValue = parser.attribName = ''
    parser.attribList.length = 0
    parser.state = S.TEXT
  }

  function parseEntity (parser) {
    var entity = parser.entity
    var entityLC = entity.toLowerCase()
    var num
    var numStr = ''

    if (parser.ENTITIES[entity]) {
      return parser.ENTITIES[entity]
    }
    if (parser.ENTITIES[entityLC]) {
      return parser.ENTITIES[entityLC]
    }
    entity = entityLC
    if (entity.charAt(0) === '#') {
      if (entity.charAt(1) === 'x') {
        entity = entity.slice(2)
        num = parseInt(entity, 16)
        numStr = num.toString(16)
      } else {
        entity = entity.slice(1)
        num = parseInt(entity, 10)
        numStr = num.toString(10)
      }
    }
    entity = entity.replace(/^0+/, '')
    if (isNaN(num) || numStr.toLowerCase() !== entity) {
      strictFail(parser, 'Invalid character entity')
      return '&' + parser.entity + ';'
    }

    return String.fromCodePoint(num)
  }

  function beginWhiteSpace (parser, c) {
    if (c === '<') {
      parser.state = S.OPEN_WAKA
      parser.startTagPosition = parser.position
    } else if (!isWhitespace(c)) {
      // have to process this as a text node.
      // weird, but happens.
      strictFail(parser, 'Non-whitespace before first tag.')
      parser.textNode = c
      parser.state = S.TEXT
    }
  }

  function charAt (chunk, i) {
    var result = ''
    if (i < chunk.length) {
      result = chunk.charAt(i)
    }
    return result
  }

  function write (chunk) {
    var parser = this
    if (this.error) {
      throw this.error
    }
    if (parser.closed) {
      return error(parser,
        'Cannot write after close. Assign an onready handler.')
    }
    if (chunk === null) {
      return end(parser)
    }
    if (typeof chunk === 'object') {
      chunk = chunk.toString()
    }
    var i = 0
    var c = ''
    while (true) {
      c = charAt(chunk, i++)
      parser.c = c

      if (!c) {
        break
      }

      if (parser.trackPosition) {
        parser.position++
        if (c === '\n') {
          parser.line++
          parser.column = 0
        } else {
          parser.column++
        }
      }

      switch (parser.state) {
        case S.BEGIN:
          parser.state = S.BEGIN_WHITESPACE
          if (c === '\uFEFF') {
            continue
          }
          beginWhiteSpace(parser, c)
          continue

        case S.BEGIN_WHITESPACE:
          beginWhiteSpace(parser, c)
          continue

        case S.TEXT:
          if (parser.sawRoot && !parser.closedRoot) {
            var starti = i - 1
            while (c && c !== '<' && c !== '&') {
              c = charAt(chunk, i++)
              if (c && parser.trackPosition) {
                parser.position++
                if (c === '\n') {
                  parser.line++
                  parser.column = 0
                } else {
                  parser.column++
                }
              }
            }
            parser.textNode += chunk.substring(starti, i - 1)
          }
          if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
            parser.state = S.OPEN_WAKA
            parser.startTagPosition = parser.position
          } else {
            if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
              strictFail(parser, 'Text data outside of root node.')
            }
            if (c === '&') {
              parser.state = S.TEXT_ENTITY
            } else {
              parser.textNode += c
            }
          }
          continue

        case S.SCRIPT:
          // only non-strict
          if (c === '<') {
            parser.state = S.SCRIPT_ENDING
          } else {
            parser.script += c
          }
          continue

        case S.SCRIPT_ENDING:
          if (c === '/') {
            parser.state = S.CLOSE_TAG
          } else {
            parser.script += '<' + c
            parser.state = S.SCRIPT
          }
          continue

        case S.OPEN_WAKA:
          // either a /, ?, !, or text is coming next.
          if (c === '!') {
            parser.state = S.SGML_DECL
            parser.sgmlDecl = ''
          } else if (isWhitespace(c)) {
            // wait for it...
          } else if (isMatch(nameStart, c)) {
            parser.state = S.OPEN_TAG
            parser.tagName = c
          } else if (c === '/') {
            parser.state = S.CLOSE_TAG
            parser.tagName = ''
          } else if (c === '?') {
            parser.state = S.PROC_INST
            parser.procInstName = parser.procInstBody = ''
          } else {
            strictFail(parser, 'Unencoded <')
            // if there was some whitespace, then add that in.
            if (parser.startTagPosition + 1 < parser.position) {
              var pad = parser.position - parser.startTagPosition
              c = new Array(pad).join(' ') + c
            }
            parser.textNode += '<' + c
            parser.state = S.TEXT
          }
          continue

        case S.SGML_DECL:
          if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
            emitNode(parser, 'onopencdata')
            parser.state = S.CDATA
            parser.sgmlDecl = ''
            parser.cdata = ''
          } else if (parser.sgmlDecl + c === '--') {
            parser.state = S.COMMENT
            parser.comment = ''
            parser.sgmlDecl = ''
          } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
            parser.state = S.DOCTYPE
            if (parser.doctype || parser.sawRoot) {
              strictFail(parser,
                'Inappropriately located doctype declaration')
            }
            parser.doctype = ''
            parser.sgmlDecl = ''
          } else if (c === '>') {
            emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl)
            parser.sgmlDecl = ''
            parser.state = S.TEXT
          } else if (isQuote(c)) {
            parser.state = S.SGML_DECL_QUOTED
            parser.sgmlDecl += c
          } else {
            parser.sgmlDecl += c
          }
          continue

        case S.SGML_DECL_QUOTED:
          if (c === parser.q) {
            parser.state = S.SGML_DECL
            parser.q = ''
          }
          parser.sgmlDecl += c
          continue

        case S.DOCTYPE:
          if (c === '>') {
            parser.state = S.TEXT
            emitNode(parser, 'ondoctype', parser.doctype)
            parser.doctype = true // just remember that we saw it.
          } else {
            parser.doctype += c
            if (c === '[') {
              parser.state = S.DOCTYPE_DTD
            } else if (isQuote(c)) {
              parser.state = S.DOCTYPE_QUOTED
              parser.q = c
            }
          }
          continue

        case S.DOCTYPE_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.q = ''
            parser.state = S.DOCTYPE
          }
          continue

        case S.DOCTYPE_DTD:
          parser.doctype += c
          if (c === ']') {
            parser.state = S.DOCTYPE
          } else if (isQuote(c)) {
            parser.state = S.DOCTYPE_DTD_QUOTED
            parser.q = c
          }
          continue

        case S.DOCTYPE_DTD_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.state = S.DOCTYPE_DTD
            parser.q = ''
          }
          continue

        case S.COMMENT:
          if (c === '-') {
            parser.state = S.COMMENT_ENDING
          } else {
            parser.comment += c
          }
          continue

        case S.COMMENT_ENDING:
          if (c === '-') {
            parser.state = S.COMMENT_ENDED
            parser.comment = textopts(parser.opt, parser.comment)
            if (parser.comment) {
              emitNode(parser, 'oncomment', parser.comment)
            }
            parser.comment = ''
          } else {
            parser.comment += '-' + c
            parser.state = S.COMMENT
          }
          continue

        case S.COMMENT_ENDED:
          if (c !== '>') {
            strictFail(parser, 'Malformed comment')
            // allow <!-- blah -- bloo --> in non-strict mode,
            // which is a comment of " blah -- bloo "
            parser.comment += '--' + c
            parser.state = S.COMMENT
          } else {
            parser.state = S.TEXT
          }
          continue

        case S.CDATA:
          if (c === ']') {
            parser.state = S.CDATA_ENDING
          } else {
            parser.cdata += c
          }
          continue

        case S.CDATA_ENDING:
          if (c === ']') {
            parser.state = S.CDATA_ENDING_2
          } else {
            parser.cdata += ']' + c
            parser.state = S.CDATA
          }
          continue

        case S.CDATA_ENDING_2:
          if (c === '>') {
            if (parser.cdata) {
              emitNode(parser, 'oncdata', parser.cdata)
            }
            emitNode(parser, 'onclosecdata')
            parser.cdata = ''
            parser.state = S.TEXT
          } else if (c === ']') {
            parser.cdata += ']'
          } else {
            parser.cdata += ']]' + c
            parser.state = S.CDATA
          }
          continue

        case S.PROC_INST:
          if (c === '?') {
            parser.state = S.PROC_INST_ENDING
          } else if (isWhitespace(c)) {
            parser.state = S.PROC_INST_BODY
          } else {
            parser.procInstName += c
          }
          continue

        case S.PROC_INST_BODY:
          if (!parser.procInstBody && isWhitespace(c)) {
            continue
          } else if (c === '?') {
            parser.state = S.PROC_INST_ENDING
          } else {
            parser.procInstBody += c
          }
          continue

        case S.PROC_INST_ENDING:
          if (c === '>') {
            emitNode(parser, 'onprocessinginstruction', {
              name: parser.procInstName,
              body: parser.procInstBody
            })
            parser.procInstName = parser.procInstBody = ''
            parser.state = S.TEXT
          } else {
            parser.procInstBody += '?' + c
            parser.state = S.PROC_INST_BODY
          }
          continue

        case S.OPEN_TAG:
          if (isMatch(nameBody, c)) {
            parser.tagName += c
          } else {
            newTag(parser)
            if (c === '>') {
              openTag(parser)
            } else if (c === '/') {
              parser.state = S.OPEN_TAG_SLASH
            } else {
              if (!isWhitespace(c)) {
                strictFail(parser, 'Invalid character in tag name')
              }
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.OPEN_TAG_SLASH:
          if (c === '>') {
            openTag(parser, true)
            closeTag(parser)
          } else {
            strictFail(parser, 'Forward-slash in opening tag not followed by >')
            parser.state = S.ATTRIB
          }
          continue

        case S.ATTRIB:
          // haven't read the attribute name yet.
          if (isWhitespace(c)) {
            continue
          } else if (c === '>') {
            openTag(parser)
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH
          } else if (isMatch(nameStart, c)) {
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE
          } else if (c === '>') {
            strictFail(parser, 'Attribute without value')
            parser.attribValue = parser.attribName
            attrib(parser)
            openTag(parser)
          } else if (isWhitespace(c)) {
            parser.state = S.ATTRIB_NAME_SAW_WHITE
          } else if (isMatch(nameBody, c)) {
            parser.attribName += c
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME_SAW_WHITE:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE
          } else if (isWhitespace(c)) {
            continue
          } else {
            strictFail(parser, 'Attribute without value')
            parser.tag.attributes[parser.attribName] = ''
            parser.attribValue = ''
            emitNode(parser, 'onattribute', {
              name: parser.attribName,
              value: ''
            })
            parser.attribName = ''
            if (c === '>') {
              openTag(parser)
            } else if (isMatch(nameStart, c)) {
              parser.attribName = c
              parser.state = S.ATTRIB_NAME
            } else {
              strictFail(parser, 'Invalid attribute name')
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.ATTRIB_VALUE:
          if (isWhitespace(c)) {
            continue
          } else if (isQuote(c)) {
            parser.q = c
            parser.state = S.ATTRIB_VALUE_QUOTED
          } else {
            strictFail(parser, 'Unquoted attribute value')
            parser.state = S.ATTRIB_VALUE_UNQUOTED
            parser.attribValue = c
          }
          continue

        case S.ATTRIB_VALUE_QUOTED:
          if (c !== parser.q) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_Q
            } else {
              parser.attribValue += c
            }
            continue
          }
          attrib(parser)
          parser.q = ''
          parser.state = S.ATTRIB_VALUE_CLOSED
          continue

        case S.ATTRIB_VALUE_CLOSED:
          if (isWhitespace(c)) {
            parser.state = S.ATTRIB
          } else if (c === '>') {
            openTag(parser)
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH
          } else if (isMatch(nameStart, c)) {
            strictFail(parser, 'No whitespace between attributes')
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_VALUE_UNQUOTED:
          if (!isAttribEnd(c)) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_U
            } else {
              parser.attribValue += c
            }
            continue
          }
          attrib(parser)
          if (c === '>') {
            openTag(parser)
          } else {
            parser.state = S.ATTRIB
          }
          continue

        case S.CLOSE_TAG:
          if (!parser.tagName) {
            if (isWhitespace(c)) {
              continue
            } else if (notMatch(nameStart, c)) {
              if (parser.script) {
                parser.script += '</' + c
                parser.state = S.SCRIPT
              } else {
                strictFail(parser, 'Invalid tagname in closing tag.')
              }
            } else {
              parser.tagName = c
            }
          } else if (c === '>') {
            closeTag(parser)
          } else if (isMatch(nameBody, c)) {
            parser.tagName += c
          } else if (parser.script) {
            parser.script += '</' + parser.tagName
            parser.tagName = ''
            parser.state = S.SCRIPT
          } else {
            if (!isWhitespace(c)) {
              strictFail(parser, 'Invalid tagname in closing tag')
            }
            parser.state = S.CLOSE_TAG_SAW_WHITE
          }
          continue

        case S.CLOSE_TAG_SAW_WHITE:
          if (isWhitespace(c)) {
            continue
          }
          if (c === '>') {
            closeTag(parser)
          } else {
            strictFail(parser, 'Invalid characters in closing tag')
          }
          continue

        case S.TEXT_ENTITY:
        case S.ATTRIB_VALUE_ENTITY_Q:
        case S.ATTRIB_VALUE_ENTITY_U:
          var returnState
          var buffer
          switch (parser.state) {
            case S.TEXT_ENTITY:
              returnState = S.TEXT
              buffer = 'textNode'
              break

            case S.ATTRIB_VALUE_ENTITY_Q:
              returnState = S.ATTRIB_VALUE_QUOTED
              buffer = 'attribValue'
              break

            case S.ATTRIB_VALUE_ENTITY_U:
              returnState = S.ATTRIB_VALUE_UNQUOTED
              buffer = 'attribValue'
              break
          }

          if (c === ';') {
            parser[buffer] += parseEntity(parser)
            parser.entity = ''
            parser.state = returnState
          } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
            parser.entity += c
          } else {
            strictFail(parser, 'Invalid character in entity name')
            parser[buffer] += '&' + parser.entity + c
            parser.entity = ''
            parser.state = returnState
          }

          continue

        default:
          throw new Error(parser, 'Unknown state: ' + parser.state)
      }
    } // while

    if (parser.position >= parser.bufferCheckPosition) {
      checkBufferLength(parser)
    }
    return parser
  }

  /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
  /* istanbul ignore next */
  if (!String.fromCodePoint) {
    (function () {
      var stringFromCharCode = String.fromCharCode
      var floor = Math.floor
      var fromCodePoint = function () {
        var MAX_SIZE = 0x4000
        var codeUnits = []
        var highSurrogate
        var lowSurrogate
        var index = -1
        var length = arguments.length
        if (!length) {
          return ''
        }
        var result = ''
        while (++index < length) {
          var codePoint = Number(arguments[index])
          if (
            !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
            codePoint < 0 || // not a valid Unicode code point
            codePoint > 0x10FFFF || // not a valid Unicode code point
            floor(codePoint) !== codePoint // not an integer
          ) {
            throw RangeError('Invalid code point: ' + codePoint)
          }
          if (codePoint <= 0xFFFF) { // BMP code point
            codeUnits.push(codePoint)
          } else { // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000
            highSurrogate = (codePoint >> 10) + 0xD800
            lowSurrogate = (codePoint % 0x400) + 0xDC00
            codeUnits.push(highSurrogate, lowSurrogate)
          }
          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
            result += stringFromCharCode.apply(null, codeUnits)
            codeUnits.length = 0
          }
        }
        return result
      }
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(String, 'fromCodePoint', {
          value: fromCodePoint,
          configurable: true,
          writable: true
        })
      } else {
        String.fromCodePoint = fromCodePoint
      }
    }())
  }
})(typeof exports === 'undefined' ? this.sax = {} : exports)

},{"stream":undefined,"string_decoder":undefined}],91:[function(require,module,exports){
module.exports = function (blocking) {
  [process.stdout, process.stderr].forEach(function (stream) {
    if (stream._handle && stream.isTTY && typeof stream._handle.setBlocking === 'function') {
      stream._handle.setBlocking(blocking)
    }
  })
}

},{}],92:[function(require,module,exports){
'use strict';

var parse = require('./parse'),
    reparse = require('./reparse');

exports.parse = parse;
exports.reparse = reparse;

},{"./parse":93,"./reparse":94}],93:[function(require,module,exports){
'use strict';

var token = /<o>|<ins>|<s>|<sub>|<sup>|<b>|<i>|<tt>|<\/o>|<\/ins>|<\/s>|<\/sub>|<\/sup>|<\/b>|<\/i>|<\/tt>/;

function update (s, cmd) {
    if (cmd.add) {
        cmd.add.split(';').forEach(function (e) {
            var arr = e.split(' ');
            s[arr[0]][arr[1]] = true;
        });
    }
    if (cmd.del) {
        cmd.del.split(';').forEach(function (e) {
            var arr = e.split(' ');
            delete s[arr[0]][arr[1]];
        });
    }
}

var trans = {
    '<o>'    : { add: 'text-decoration overline' },
    '</o>'   : { del: 'text-decoration overline' },

    '<ins>'  : { add: 'text-decoration underline' },
    '</ins>' : { del: 'text-decoration underline' },

    '<s>'    : { add: 'text-decoration line-through' },
    '</s>'   : { del: 'text-decoration line-through' },

    '<b>'    : { add: 'font-weight bold' },
    '</b>'   : { del: 'font-weight bold' },

    '<i>'    : { add: 'font-style italic' },
    '</i>'   : { del: 'font-style italic' },

    '<sub>'  : { add: 'baseline-shift sub;font-size .7em' },
    '</sub>' : { del: 'baseline-shift sub;font-size .7em' },

    '<sup>'  : { add: 'baseline-shift super;font-size .7em' },
    '</sup>' : { del: 'baseline-shift super;font-size .7em' },

    '<tt>'   : { add: 'font-family monospace' },
    '</tt>'  : { del: 'font-family monospace' }
};

function dump (s) {
    return Object.keys(s).reduce(function (pre, cur) {
        var keys = Object.keys(s[cur]);
        if (keys.length > 0) {
            pre[cur] = keys.join(' ');
        }
        return pre;
    }, {});
}

function parse (str) {
    var state, res, i, m, a;

    if (str === undefined) {
        return [];
    }

    if (typeof str === 'number') {
        return [str + ''];
    }

    if (typeof str !== 'string') {
        return [str];
    }

    res = [];

    state = {
        'text-decoration': {},
        'font-weight': {},
        'font-style': {},
        'baseline-shift': {},
        'font-size': {},
        'font-family': {}
    };

    while (true) {
        i = str.search(token);

        if (i === -1) {
            res.push(['tspan', dump(state), str]);
            return res;
        }

        if (i > 0) {
            a = str.slice(0, i);
            res.push(['tspan', dump(state), a]);
        }

        m = str.match(token)[0];

        update(state, trans[m]);

        str = str.slice(i + m.length);

        if (str.length === 0) {
            return res;
        }
    }
}

module.exports = parse;
/* eslint no-constant-condition: 0 */

},{}],94:[function(require,module,exports){
'use strict';

var parse = require('./parse');

function deDash (str) {
    var m = str.match(/(\w+)-(\w)(\w+)/);
    if (m === null) {
        return str;
    }
    var newStr = m[1] + m[2].toUpperCase() + m[3];
    return newStr;
}

function reparse (React) {

    var $ = React.createElement;

    function reTspan (e, i) {
        var tag = e[0];
        var attr = e[1];

        var newAttr = Object.keys(attr).reduce(function (res, key) {
            var newKey = deDash(key);
            res[newKey] = attr[key];
            return res;
        }, {});

        var body = e[2];
        newAttr.key = i;
        return $(tag, newAttr, body);
    }

    return function (str) {
        return parse(str).map(reTspan);
    };
}

module.exports = reparse;

},{"./parse":93}],95:[function(require,module,exports){
'use strict'

module.exports = function whichModule (exported) {
  for (var i = 0, files = Object.keys(require.cache), mod; i < files.length; i++) {
    mod = require.cache[files[i]]
    if (mod.exports === exported) return mod
  }
  return null
}

},{}],96:[function(require,module,exports){
var fs = require('fs')
var path = require('path')
var util = require('util')

function Y18N (opts) {
  // configurable options.
  opts = opts || {}
  this.directory = opts.directory || './locales'
  this.updateFiles = typeof opts.updateFiles === 'boolean' ? opts.updateFiles : true
  this.locale = opts.locale || 'en'
  this.fallbackToLanguage = typeof opts.fallbackToLanguage === 'boolean' ? opts.fallbackToLanguage : true

  // internal stuff.
  this.cache = {}
  this.writeQueue = []
}

Y18N.prototype.__ = function () {
  if (typeof arguments[0] !== 'string') {
    return this._taggedLiteral.apply(this, arguments)
  }
  var args = Array.prototype.slice.call(arguments)
  var str = args.shift()
  var cb = function () {} // start with noop.

  if (typeof args[args.length - 1] === 'function') cb = args.pop()
  cb = cb || function () {} // noop.

  if (!this.cache[this.locale]) this._readLocaleFile()

  // we've observed a new string, update the language file.
  if (!this.cache[this.locale][str] && this.updateFiles) {
    this.cache[this.locale][str] = str

    // include the current directory and locale,
    // since these values could change before the
    // write is performed.
    this._enqueueWrite([this.directory, this.locale, cb])
  } else {
    cb()
  }

  return util.format.apply(util, [this.cache[this.locale][str] || str].concat(args))
}

Y18N.prototype._taggedLiteral = function (parts) {
  var args = arguments
  var str = ''
  parts.forEach(function (part, i) {
    var arg = args[i + 1]
    str += part
    if (typeof arg !== 'undefined') {
      str += '%s'
    }
  })
  return this.__.apply(null, [str].concat([].slice.call(arguments, 1)))
}

Y18N.prototype._enqueueWrite = function (work) {
  this.writeQueue.push(work)
  if (this.writeQueue.length === 1) this._processWriteQueue()
}

Y18N.prototype._processWriteQueue = function () {
  var _this = this
  var work = this.writeQueue[0]

  // destructure the enqueued work.
  var directory = work[0]
  var locale = work[1]
  var cb = work[2]

  var languageFile = this._resolveLocaleFile(directory, locale)
  var serializedLocale = JSON.stringify(this.cache[locale], null, 2)

  fs.writeFile(languageFile, serializedLocale, 'utf-8', function (err) {
    _this.writeQueue.shift()
    if (_this.writeQueue.length > 0) _this._processWriteQueue()
    cb(err)
  })
}

Y18N.prototype._readLocaleFile = function () {
  var localeLookup = {}
  var languageFile = this._resolveLocaleFile(this.directory, this.locale)

  try {
    localeLookup = JSON.parse(fs.readFileSync(languageFile, 'utf-8'))
  } catch (err) {
    if (err instanceof SyntaxError) {
      err.message = 'syntax error in ' + languageFile
    }

    if (err.code === 'ENOENT') localeLookup = {}
    else throw err
  }

  this.cache[this.locale] = localeLookup
}

Y18N.prototype._resolveLocaleFile = function (directory, locale) {
  var file = path.resolve(directory, './', locale + '.json')
  if (this.fallbackToLanguage && !this._fileExistsSync(file) && ~locale.lastIndexOf('_')) {
    // attempt fallback to language only
    var languageFile = path.resolve(directory, './', locale.split('_')[0] + '.json')
    if (this._fileExistsSync(languageFile)) file = languageFile
  }
  return file
}

// this only exists because fs.existsSync() "will be deprecated"
// see https://nodejs.org/api/fs.html#fs_fs_existssync_path
Y18N.prototype._fileExistsSync = function (file) {
  try {
    return fs.statSync(file).isFile()
  } catch (err) {
    return false
  }
}

Y18N.prototype.__n = function () {
  var args = Array.prototype.slice.call(arguments)
  var singular = args.shift()
  var plural = args.shift()
  var quantity = args.shift()

  var cb = function () {} // start with noop.
  if (typeof args[args.length - 1] === 'function') cb = args.pop()

  if (!this.cache[this.locale]) this._readLocaleFile()

  var str = quantity === 1 ? singular : plural
  if (this.cache[this.locale][singular]) {
    str = this.cache[this.locale][singular][quantity === 1 ? 'one' : 'other']
  }

  // we've observed a new string, update the language file.
  if (!this.cache[this.locale][singular] && this.updateFiles) {
    this.cache[this.locale][singular] = {
      one: singular,
      other: plural
    }

    // include the current directory and locale,
    // since these values could change before the
    // write is performed.
    this._enqueueWrite([this.directory, this.locale, cb])
  } else {
    cb()
  }

  // if a %d placeholder is provided, add quantity
  // to the arguments expanded by util.format.
  var values = [str]
  if (~str.indexOf('%d')) values.push(quantity)

  return util.format.apply(util, values.concat(args))
}

Y18N.prototype.setLocale = function (locale) {
  this.locale = locale
}

Y18N.prototype.getLocale = function () {
  return this.locale
}

Y18N.prototype.updateLocale = function (obj) {
  if (!this.cache[this.locale]) this._readLocaleFile()

  for (var key in obj) {
    this.cache[this.locale][key] = obj[key]
  }
}

module.exports = function (opts) {
  var y18n = new Y18N(opts)

  // bind all functions to y18n, so that
  // they can be used in isolation.
  for (var key in y18n) {
    if (typeof y18n[key] === 'function') {
      y18n[key] = y18n[key].bind(y18n)
    }
  }

  return y18n
}

},{"fs":undefined,"path":undefined,"util":undefined}],97:[function(require,module,exports){
'use strict'
// classic singleton yargs API, to use yargs
// without running as a singleton do:
// require('yargs/yargs')(process.argv.slice(2))
const yargs = require('./yargs')
const processArgv = require('./lib/process-argv')

Argv(processArgv.getProcessArgvWithoutBin())

module.exports = Argv

function Argv (processArgs, cwd) {
  const argv = yargs(processArgs, cwd, require)
  singletonify(argv)
  return argv
}

/*  Hack an instance of Argv with process.argv into Argv
    so people can do
    require('yargs')(['--beeble=1','-z','zizzle']).argv
    to parse a list of args and
    require('yargs').argv
    to get a parsed version of process.argv.
*/
function singletonify (inst) {
  Object.keys(inst).forEach((key) => {
    if (key === 'argv') {
      Argv.__defineGetter__(key, inst.__lookupGetter__(key))
    } else if (typeof inst[key] === 'function') {
      Argv[key] = inst[key].bind(inst)
    } else {
      Argv.__defineGetter__('$0', () => {
        return inst.$0
      })
      Argv.__defineGetter__('parsed', () => {
        return inst.parsed
      })
    }
  })
}

},{"./lib/process-argv":107,"./yargs":129}],98:[function(require,module,exports){

'use strict'
const fs = require('fs')
const path = require('path')
const YError = require('./yerror')

let previouslyVisitedConfigs = []

function checkForCircularExtends (cfgPath) {
  if (previouslyVisitedConfigs.indexOf(cfgPath) > -1) {
    throw new YError(`Circular extended configurations: '${cfgPath}'.`)
  }
}

function getPathToDefaultConfig (cwd, pathToExtend) {
  return path.resolve(cwd, pathToExtend)
}

function mergeDeep (config1, config2) {
  const target = {}
  const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj)
  Object.assign(target, config1)
  for (const key of Object.keys(config2)) {
    if (isObject(config2[key]) && isObject(target[key])) {
      target[key] = mergeDeep(config1[key], config2[key])
    } else {
      target[key] = config2[key]
    }
  }
  return target
}

function applyExtends (config, cwd, mergeExtends) {
  let defaultConfig = {}

  if (Object.prototype.hasOwnProperty.call(config, 'extends')) {
    if (typeof config.extends !== 'string') return defaultConfig
    const isPath = /\.json|\..*rc$/.test(config.extends)
    let pathToDefault = null
    if (!isPath) {
      try {
        pathToDefault = require.resolve(config.extends)
      } catch (err) {
        // most likely this simply isn't a module.
      }
    } else {
      pathToDefault = getPathToDefaultConfig(cwd, config.extends)
    }
    // maybe the module uses key for some other reason,
    // err on side of caution.
    if (!pathToDefault && !isPath) return config

    checkForCircularExtends(pathToDefault)

    previouslyVisitedConfigs.push(pathToDefault)

    defaultConfig = isPath ? JSON.parse(fs.readFileSync(pathToDefault, 'utf8')) : require(config.extends)
    delete config.extends
    defaultConfig = applyExtends(defaultConfig, path.dirname(pathToDefault), mergeExtends)
  }

  previouslyVisitedConfigs = []

  return mergeExtends ? mergeDeep(defaultConfig, config) : Object.assign({}, defaultConfig, config)
}

module.exports = applyExtends

},{"./yerror":110,"fs":undefined,"path":undefined}],99:[function(require,module,exports){
'use strict'

// hoisted due to circular dependency on command.
module.exports = argsert
const command = require('./command')()
const YError = require('./yerror')

const positionName = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth']
function argsert (expected, callerArguments, length) {
  // TODO: should this eventually raise an exception.
  try {
    // preface the argument description with "cmd", so
    // that we can run it through yargs' command parser.
    let position = 0
    let parsed = { demanded: [], optional: [] }
    if (typeof expected === 'object') {
      length = callerArguments
      callerArguments = expected
    } else {
      parsed = command.parseCommand(`cmd ${expected}`)
    }
    const args = [].slice.call(callerArguments)

    while (args.length && args[args.length - 1] === undefined) args.pop()
    length = length || args.length

    if (length < parsed.demanded.length) {
      throw new YError(`Not enough arguments provided. Expected ${parsed.demanded.length} but received ${args.length}.`)
    }

    const totalCommands = parsed.demanded.length + parsed.optional.length
    if (length > totalCommands) {
      throw new YError(`Too many arguments provided. Expected max ${totalCommands} but received ${length}.`)
    }

    parsed.demanded.forEach((demanded) => {
      const arg = args.shift()
      const observedType = guessType(arg)
      const matchingTypes = demanded.cmd.filter(type => type === observedType || type === '*')
      if (matchingTypes.length === 0) argumentTypeError(observedType, demanded.cmd, position, false)
      position += 1
    })

    parsed.optional.forEach((optional) => {
      if (args.length === 0) return
      const arg = args.shift()
      const observedType = guessType(arg)
      const matchingTypes = optional.cmd.filter(type => type === observedType || type === '*')
      if (matchingTypes.length === 0) argumentTypeError(observedType, optional.cmd, position, true)
      position += 1
    })
  } catch (err) {
    console.warn(err.stack)
  }
}

function guessType (arg) {
  if (Array.isArray(arg)) {
    return 'array'
  } else if (arg === null) {
    return 'null'
  }
  return typeof arg
}

function argumentTypeError (observedType, allowedTypes, position, optional) {
  throw new YError(`Invalid ${positionName[position] || 'manyith'} argument. Expected ${allowedTypes.join(' or ')} but received ${observedType}.`)
}

},{"./command":100,"./yerror":110}],100:[function(require,module,exports){
'use strict'

const inspect = require('util').inspect
const isPromise = require('./is-promise')
const { applyMiddleware, commandMiddlewareFactory } = require('./middleware')
const path = require('path')
const Parser = require('yargs-parser')

const DEFAULT_MARKER = /(^\*)|(^\$0)/

// handles parsing positional arguments,
// and populating argv with said positional
// arguments.
module.exports = function command (yargs, usage, validation, globalMiddleware) {
  const self = {}
  let handlers = {}
  let aliasMap = {}
  let defaultCommand
  globalMiddleware = globalMiddleware || []

  self.addHandler = function addHandler (cmd, description, builder, handler, commandMiddleware) {
    let aliases = []
    const middlewares = commandMiddlewareFactory(commandMiddleware)
    handler = handler || (() => {})

    if (Array.isArray(cmd)) {
      aliases = cmd.slice(1)
      cmd = cmd[0]
    } else if (typeof cmd === 'object') {
      let command = (Array.isArray(cmd.command) || typeof cmd.command === 'string') ? cmd.command : moduleName(cmd)
      if (cmd.aliases) command = [].concat(command).concat(cmd.aliases)
      self.addHandler(command, extractDesc(cmd), cmd.builder, cmd.handler, cmd.middlewares)
      return
    }

    // allow a module to be provided instead of separate builder and handler
    if (typeof builder === 'object' && builder.builder && typeof builder.handler === 'function') {
      self.addHandler([cmd].concat(aliases), description, builder.builder, builder.handler, builder.middlewares)
      return
    }

    // parse positionals out of cmd string
    const parsedCommand = self.parseCommand(cmd)

    // remove positional args from aliases only
    aliases = aliases.map(alias => self.parseCommand(alias).cmd)

    // check for default and filter out '*''
    let isDefault = false
    const parsedAliases = [parsedCommand.cmd].concat(aliases).filter((c) => {
      if (DEFAULT_MARKER.test(c)) {
        isDefault = true
        return false
      }
      return true
    })

    // standardize on $0 for default command.
    if (parsedAliases.length === 0 && isDefault) parsedAliases.push('$0')

    // shift cmd and aliases after filtering out '*'
    if (isDefault) {
      parsedCommand.cmd = parsedAliases[0]
      aliases = parsedAliases.slice(1)
      cmd = cmd.replace(DEFAULT_MARKER, parsedCommand.cmd)
    }

    // populate aliasMap
    aliases.forEach((alias) => {
      aliasMap[alias] = parsedCommand.cmd
    })

    if (description !== false) {
      usage.command(cmd, description, isDefault, aliases)
    }

    handlers[parsedCommand.cmd] = {
      original: cmd,
      description: description,
      handler,
      builder: builder || {},
      middlewares,
      demanded: parsedCommand.demanded,
      optional: parsedCommand.optional
    }

    if (isDefault) defaultCommand = handlers[parsedCommand.cmd]
  }

  self.addDirectory = function addDirectory (dir, context, req, callerFile, opts) {
    opts = opts || {}
    // disable recursion to support nested directories of subcommands
    if (typeof opts.recurse !== 'boolean') opts.recurse = false
    // exclude 'json', 'coffee' from require-directory defaults
    if (!Array.isArray(opts.extensions)) opts.extensions = ['js']
    // allow consumer to define their own visitor function
    const parentVisit = typeof opts.visit === 'function' ? opts.visit : o => o
    // call addHandler via visitor function
    opts.visit = function visit (obj, joined, filename) {
      const visited = parentVisit(obj, joined, filename)
      // allow consumer to skip modules with their own visitor
      if (visited) {
        // check for cyclic reference
        // each command file path should only be seen once per execution
        if (~context.files.indexOf(joined)) return visited
        // keep track of visited files in context.files
        context.files.push(joined)
        self.addHandler(visited)
      }
      return visited
    }
    require('require-directory')({ require: req, filename: callerFile }, dir, opts)
  }

  // lookup module object from require()d command and derive name
  // if module was not require()d and no name given, throw error
  function moduleName (obj) {
    const mod = require('which-module')(obj)
    if (!mod) throw new Error(`No command name given for module: ${inspect(obj)}`)
    return commandFromFilename(mod.filename)
  }

  // derive command name from filename
  function commandFromFilename (filename) {
    return path.basename(filename, path.extname(filename))
  }

  function extractDesc (obj) {
    for (let keys = ['describe', 'description', 'desc'], i = 0, l = keys.length, test; i < l; i++) {
      test = obj[keys[i]]
      if (typeof test === 'string' || typeof test === 'boolean') return test
    }
    return false
  }

  self.parseCommand = function parseCommand (cmd) {
    const extraSpacesStrippedCommand = cmd.replace(/\s{2,}/g, ' ')
    const splitCommand = extraSpacesStrippedCommand.split(/\s+(?![^[]*]|[^<]*>)/)
    const bregex = /\.*[\][<>]/g
    const parsedCommand = {
      cmd: (splitCommand.shift()).replace(bregex, ''),
      demanded: [],
      optional: []
    }
    splitCommand.forEach((cmd, i) => {
      let variadic = false
      cmd = cmd.replace(/\s/g, '')
      if (/\.+[\]>]/.test(cmd) && i === splitCommand.length - 1) variadic = true
      if (/^\[/.test(cmd)) {
        parsedCommand.optional.push({
          cmd: cmd.replace(bregex, '').split('|'),
          variadic
        })
      } else {
        parsedCommand.demanded.push({
          cmd: cmd.replace(bregex, '').split('|'),
          variadic
        })
      }
    })
    return parsedCommand
  }

  self.getCommands = () => Object.keys(handlers).concat(Object.keys(aliasMap))

  self.getCommandHandlers = () => handlers

  self.hasDefaultCommand = () => !!defaultCommand

  self.runCommand = function runCommand (command, yargs, parsed, commandIndex) {
    let aliases = parsed.aliases
    const commandHandler = handlers[command] || handlers[aliasMap[command]] || defaultCommand
    const currentContext = yargs.getContext()
    let numFiles = currentContext.files.length
    const parentCommands = currentContext.commands.slice()

    // what does yargs look like after the builder is run?
    let innerArgv = parsed.argv
    let innerYargs = null
    let positionalMap = {}
    if (command) {
      currentContext.commands.push(command)
      currentContext.fullCommands.push(commandHandler.original)
    }
    if (typeof commandHandler.builder === 'function') {
      // a function can be provided, which builds
      // up a yargs chain and possibly returns it.
      innerYargs = commandHandler.builder(yargs.reset(parsed.aliases))
      if (!innerYargs || (typeof innerYargs._parseArgs !== 'function')) {
        innerYargs = yargs
      }
      if (shouldUpdateUsage(innerYargs)) {
        innerYargs.getUsageInstance().usage(
          usageFromParentCommandsCommandHandler(parentCommands, commandHandler),
          commandHandler.description
        )
      }
      innerArgv = innerYargs._parseArgs(null, null, true, commandIndex)
      aliases = innerYargs.parsed.aliases
    } else if (typeof commandHandler.builder === 'object') {
      // as a short hand, an object can instead be provided, specifying
      // the options that a command takes.
      innerYargs = yargs.reset(parsed.aliases)
      if (shouldUpdateUsage(innerYargs)) {
        innerYargs.getUsageInstance().usage(
          usageFromParentCommandsCommandHandler(parentCommands, commandHandler),
          commandHandler.description
        )
      }
      Object.keys(commandHandler.builder).forEach((key) => {
        innerYargs.option(key, commandHandler.builder[key])
      })
      innerArgv = innerYargs._parseArgs(null, null, true, commandIndex)
      aliases = innerYargs.parsed.aliases
    }

    if (!yargs._hasOutput()) {
      positionalMap = populatePositionals(commandHandler, innerArgv, currentContext, yargs)
    }

    const middlewares = globalMiddleware.slice(0).concat(commandHandler.middlewares)
    applyMiddleware(innerArgv, yargs, middlewares, true)

    // we apply validation post-hoc, so that custom
    // checks get passed populated positional arguments.
    if (!yargs._hasOutput()) yargs._runValidation(innerArgv, aliases, positionalMap, yargs.parsed.error)

    if (commandHandler.handler && !yargs._hasOutput()) {
      yargs._setHasOutput()
      // to simplify the parsing of positionals in commands,
      // we temporarily populate '--' rather than _, with arguments
      const populateDoubleDash = !!yargs.getOptions().configuration['populate--']
      if (!populateDoubleDash) yargs._copyDoubleDash(innerArgv)

      innerArgv = applyMiddleware(innerArgv, yargs, middlewares, false)
      let handlerResult
      if (isPromise(innerArgv)) {
        handlerResult = innerArgv.then(argv => commandHandler.handler(argv))
      } else {
        handlerResult = commandHandler.handler(innerArgv)
      }

      const handlerFinishCommand = yargs.getHandlerFinishCommand()
      if (isPromise(handlerResult)) {
        yargs.getUsageInstance().cacheHelpMessage()
        handlerResult
          .then(value => {
            if (handlerFinishCommand) {
              handlerFinishCommand(value)
            }
          })
          .catch(error => {
            try {
              yargs.getUsageInstance().fail(null, error)
            } catch (err) {
            // fail's throwing would cause an unhandled rejection.
            }
          })
          .then(() => {
            yargs.getUsageInstance().clearCachedHelpMessage()
          })
      } else {
        if (handlerFinishCommand) {
          handlerFinishCommand(handlerResult)
        }
      }
    }

    if (command) {
      currentContext.commands.pop()
      currentContext.fullCommands.pop()
    }
    numFiles = currentContext.files.length - numFiles
    if (numFiles > 0) currentContext.files.splice(numFiles * -1, numFiles)

    return innerArgv
  }

  function shouldUpdateUsage (yargs) {
    return !yargs.getUsageInstance().getUsageDisabled() &&
      yargs.getUsageInstance().getUsage().length === 0
  }

  function usageFromParentCommandsCommandHandler (parentCommands, commandHandler) {
    const c = DEFAULT_MARKER.test(commandHandler.original) ? commandHandler.original.replace(DEFAULT_MARKER, '').trim() : commandHandler.original
    const pc = parentCommands.filter((c) => { return !DEFAULT_MARKER.test(c) })
    pc.push(c)
    return `$0 ${pc.join(' ')}`
  }

  self.runDefaultBuilderOn = function (yargs) {
    if (shouldUpdateUsage(yargs)) {
      // build the root-level command string from the default string.
      const commandString = DEFAULT_MARKER.test(defaultCommand.original)
        ? defaultCommand.original : defaultCommand.original.replace(/^[^[\]<>]*/, '$0 ')
      yargs.getUsageInstance().usage(
        commandString,
        defaultCommand.description
      )
    }
    const builder = defaultCommand.builder
    if (typeof builder === 'function') {
      builder(yargs)
    } else {
      Object.keys(builder).forEach((key) => {
        yargs.option(key, builder[key])
      })
    }
  }

  // transcribe all positional arguments "command <foo> <bar> [apple]"
  // onto argv.
  function populatePositionals (commandHandler, argv, context, yargs) {
    argv._ = argv._.slice(context.commands.length) // nuke the current commands
    const demanded = commandHandler.demanded.slice(0)
    const optional = commandHandler.optional.slice(0)
    const positionalMap = {}

    validation.positionalCount(demanded.length, argv._.length)

    while (demanded.length) {
      const demand = demanded.shift()
      populatePositional(demand, argv, positionalMap)
    }

    while (optional.length) {
      const maybe = optional.shift()
      populatePositional(maybe, argv, positionalMap)
    }

    argv._ = context.commands.concat(argv._)

    postProcessPositionals(argv, positionalMap, self.cmdToParseOptions(commandHandler.original))

    return positionalMap
  }

  function populatePositional (positional, argv, positionalMap, parseOptions) {
    const cmd = positional.cmd[0]
    if (positional.variadic) {
      positionalMap[cmd] = argv._.splice(0).map(String)
    } else {
      if (argv._.length) positionalMap[cmd] = [String(argv._.shift())]
    }
  }

  // we run yargs-parser against the positional arguments
  // applying the same parsing logic used for flags.
  function postProcessPositionals (argv, positionalMap, parseOptions) {
    // combine the parsing hints we've inferred from the command
    // string with explicitly configured parsing hints.
    const options = Object.assign({}, yargs.getOptions())
    options.default = Object.assign(parseOptions.default, options.default)
    options.alias = Object.assign(parseOptions.alias, options.alias)
    options.array = options.array.concat(parseOptions.array)
    delete options.config //  don't load config when processing positionals.

    const unparsed = []
    Object.keys(positionalMap).forEach((key) => {
      positionalMap[key].map((value) => {
        if (options.configuration['unknown-options-as-args']) options.key[key] = true
        unparsed.push(`--${key}`)
        unparsed.push(value)
      })
    })

    // short-circuit parse.
    if (!unparsed.length) return

    const config = Object.assign({}, options.configuration, {
      'populate--': true
    })
    const parsed = Parser.detailed(unparsed, Object.assign({}, options, {
      configuration: config
    }))

    if (parsed.error) {
      yargs.getUsageInstance().fail(parsed.error.message, parsed.error)
    } else {
      // only copy over positional keys (don't overwrite
      // flag arguments that were already parsed).
      const positionalKeys = Object.keys(positionalMap)
      Object.keys(positionalMap).forEach((key) => {
        [].push.apply(positionalKeys, parsed.aliases[key])
      })

      Object.keys(parsed.argv).forEach((key) => {
        if (positionalKeys.indexOf(key) !== -1) {
          // any new aliases need to be placed in positionalMap, which
          // is used for validation.
          if (!positionalMap[key]) positionalMap[key] = parsed.argv[key]
          argv[key] = parsed.argv[key]
        }
      })
    }
  }

  self.cmdToParseOptions = function (cmdString) {
    const parseOptions = {
      array: [],
      default: {},
      alias: {},
      demand: {}
    }

    const parsed = self.parseCommand(cmdString)
    parsed.demanded.forEach((d) => {
      const cmds = d.cmd.slice(0)
      const cmd = cmds.shift()
      if (d.variadic) {
        parseOptions.array.push(cmd)
        parseOptions.default[cmd] = []
      }
      cmds.forEach((c) => {
        parseOptions.alias[cmd] = c
      })
      parseOptions.demand[cmd] = true
    })

    parsed.optional.forEach((o) => {
      const cmds = o.cmd.slice(0)
      const cmd = cmds.shift()
      if (o.variadic) {
        parseOptions.array.push(cmd)
        parseOptions.default[cmd] = []
      }
      cmds.forEach((c) => {
        parseOptions.alias[cmd] = c
      })
    })

    return parseOptions
  }

  self.reset = () => {
    handlers = {}
    aliasMap = {}
    defaultCommand = undefined
    return self
  }

  // used by yargs.parse() to freeze
  // the state of commands such that
  // we can apply .parse() multiple times
  // with the same yargs instance.
  const frozens = []
  self.freeze = () => {
    const frozen = {}
    frozens.push(frozen)
    frozen.handlers = handlers
    frozen.aliasMap = aliasMap
    frozen.defaultCommand = defaultCommand
  }
  self.unfreeze = () => {
    const frozen = frozens.pop()
    handlers = frozen.handlers
    aliasMap = frozen.aliasMap
    defaultCommand = frozen.defaultCommand
  }

  return self
}

},{"./is-promise":103,"./middleware":105,"path":undefined,"require-directory":88,"util":undefined,"which-module":95,"yargs-parser":127}],101:[function(require,module,exports){
exports.completionShTemplate =
`###-begin-{{app_name}}-completions-###
#
# yargs command completion script
#
# Installation: {{app_path}} {{completion_command}} >> ~/.bashrc
#    or {{app_path}} {{completion_command}} >> ~/.bash_profile on OSX.
#
_yargs_completions()
{
    local cur_word args type_list

    cur_word="\${COMP_WORDS[COMP_CWORD]}"
    args=("\${COMP_WORDS[@]}")

    # ask yargs to generate completions.
    type_list=$({{app_path}} --get-yargs-completions "\${args[@]}")

    COMPREPLY=( $(compgen -W "\${type_list}" -- \${cur_word}) )

    # if no match was found, fall back to filename completion
    if [ \${#COMPREPLY[@]} -eq 0 ]; then
      COMPREPLY=()
    fi

    return 0
}
complete -o default -F _yargs_completions {{app_name}}
###-end-{{app_name}}-completions-###
`

exports.completionZshTemplate = `###-begin-{{app_name}}-completions-###
#
# yargs command completion script
#
# Installation: {{app_path}} {{completion_command}} >> ~/.zshrc
#    or {{app_path}} {{completion_command}} >> ~/.zsh_profile on OSX.
#
_{{app_name}}_yargs_completions()
{
  local reply
  local si=$IFS
  IFS=$'\n' reply=($(COMP_CWORD="$((CURRENT-1))" COMP_LINE="$BUFFER" COMP_POINT="$CURSOR" {{app_path}} --get-yargs-completions "\${words[@]}"))
  IFS=$si
  _describe 'values' reply
}
compdef _{{app_name}}_yargs_completions {{app_name}}
###-end-{{app_name}}-completions-###
`

},{}],102:[function(require,module,exports){
'use strict'
const path = require('path')

// add bash completions to your
//  yargs-powered applications.
module.exports = function completion (yargs, usage, command) {
  const self = {
    completionKey: 'get-yargs-completions'
  }

  let aliases
  self.setParsed = function setParsed (parsed) {
    aliases = parsed.aliases
  }

  const zshShell = (process.env.SHELL && process.env.SHELL.indexOf('zsh') !== -1) ||
    (process.env.ZSH_NAME && process.env.ZSH_NAME.indexOf('zsh') !== -1)
  // get a list of completion commands.
  // 'args' is the array of strings from the line to be completed
  self.getCompletion = function getCompletion (args, done) {
    const completions = []
    const current = args.length ? args[args.length - 1] : ''
    const argv = yargs.parse(args, true)
    const parentCommands = yargs.getContext().commands

    // a custom completion function can be provided
    // to completion().
    if (completionFunction) {
      if (completionFunction.length < 3) {
        const result = completionFunction(current, argv)

        // promise based completion function.
        if (typeof result.then === 'function') {
          return result.then((list) => {
            process.nextTick(() => { done(list) })
          }).catch((err) => {
            process.nextTick(() => { throw err })
          })
        }

        // synchronous completion function.
        return done(result)
      } else {
        // asynchronous completion function
        return completionFunction(current, argv, (completions) => {
          done(completions)
        })
      }
    }

    const handlers = command.getCommandHandlers()
    for (let i = 0, ii = args.length; i < ii; ++i) {
      if (handlers[args[i]] && handlers[args[i]].builder) {
        const builder = handlers[args[i]].builder
        if (typeof builder === 'function') {
          const y = yargs.reset()
          builder(y)
          return y.argv
        }
      }
    }

    if (!current.match(/^-/) && parentCommands[parentCommands.length - 1] !== current) {
      usage.getCommands().forEach((usageCommand) => {
        const commandName = command.parseCommand(usageCommand[0]).cmd
        if (args.indexOf(commandName) === -1) {
          if (!zshShell) {
            completions.push(commandName)
          } else {
            const desc = usageCommand[1] || ''
            completions.push(commandName.replace(/:/g, '\\:') + ':' + desc)
          }
        }
      })
    }

    if (current.match(/^-/) || (current === '' && completions.length === 0)) {
      const descs = usage.getDescriptions()
      const options = yargs.getOptions()
      Object.keys(options.key).forEach((key) => {
        const negable = !!options.configuration['boolean-negation'] && options.boolean.includes(key)
        // If the key and its aliases aren't in 'args', add the key to 'completions'
        let keyAndAliases = [key].concat(aliases[key] || [])
        if (negable) keyAndAliases = keyAndAliases.concat(keyAndAliases.map(key => `no-${key}`))

        function completeOptionKey (key) {
          const notInArgs = keyAndAliases.every(val => args.indexOf(`--${val}`) === -1)
          if (notInArgs) {
            const startsByTwoDashes = s => /^--/.test(s)
            const isShortOption = s => /^[^0-9]$/.test(s)
            const dashes = !startsByTwoDashes(current) && isShortOption(key) ? '-' : '--'
            if (!zshShell) {
              completions.push(dashes + key)
            } else {
              const desc = descs[key] || ''
              completions.push(dashes + `${key.replace(/:/g, '\\:')}:${desc.replace('__yargsString__:', '')}`)
            }
          }
        }

        completeOptionKey(key)
        if (negable && !!options.default[key]) completeOptionKey(`no-${key}`)
      })
    }

    done(completions)
  }

  // generate the completion script to add to your .bashrc.
  self.generateCompletionScript = function generateCompletionScript ($0, cmd) {
    const templates = require('./completion-templates')
    let script = zshShell ? templates.completionZshTemplate : templates.completionShTemplate
    const name = path.basename($0)

    // add ./to applications not yet installed as bin.
    if ($0.match(/\.js$/)) $0 = `./${$0}`

    script = script.replace(/{{app_name}}/g, name)
    script = script.replace(/{{completion_command}}/g, cmd)
    return script.replace(/{{app_path}}/g, $0)
  }

  // register a function to perform your own custom
  // completions., this function can be either
  // synchrnous or asynchronous.
  let completionFunction = null
  self.registerFunction = (fn) => {
    completionFunction = fn
  }

  return self
}

},{"./completion-templates":101,"path":undefined}],103:[function(require,module,exports){
module.exports = function isPromise (maybePromise) {
  return !!maybePromise && !!maybePromise.then && (typeof maybePromise.then === 'function')
}

},{}],104:[function(require,module,exports){
/*
Copyright (c) 2011 Andrei Mackenzie

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// levenshtein distance algorithm, pulled from Andrei Mackenzie's MIT licensed.
// gist, which can be found here: https://gist.github.com/andrei-m/982927
'use strict'
// Compute the edit distance between the two given strings
module.exports = function levenshtein (a, b) {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix = []

  // increment along the first column of each row
  let i
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  // increment each column in the first row
  let j
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  // Fill in the rest of the matrix
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1)) // deletion
      }
    }
  }

  return matrix[b.length][a.length]
}

},{}],105:[function(require,module,exports){
'use strict'

// hoisted due to circular dependency on command.
module.exports = {
  applyMiddleware,
  commandMiddlewareFactory,
  globalMiddlewareFactory
}
const isPromise = require('./is-promise')
const argsert = require('./argsert')

function globalMiddlewareFactory (globalMiddleware, context) {
  return function (callback, applyBeforeValidation = false) {
    argsert('<array|function> [boolean]', [callback, applyBeforeValidation], arguments.length)
    if (Array.isArray(callback)) {
      for (let i = 0; i < callback.length; i++) {
        if (typeof callback[i] !== 'function') {
          throw Error('middleware must be a function')
        }
        callback[i].applyBeforeValidation = applyBeforeValidation
      }
      Array.prototype.push.apply(globalMiddleware, callback)
    } else if (typeof callback === 'function') {
      callback.applyBeforeValidation = applyBeforeValidation
      globalMiddleware.push(callback)
    }
    return context
  }
}

function commandMiddlewareFactory (commandMiddleware) {
  if (!commandMiddleware) return []
  return commandMiddleware.map(middleware => {
    middleware.applyBeforeValidation = false
    return middleware
  })
}

function applyMiddleware (argv, yargs, middlewares, beforeValidation) {
  const beforeValidationError = new Error('middleware cannot return a promise when applyBeforeValidation is true')
  return middlewares
    .reduce((accumulation, middleware) => {
      if (middleware.applyBeforeValidation !== beforeValidation) {
        return accumulation
      }

      if (isPromise(accumulation)) {
        return accumulation
          .then(initialObj =>
            Promise.all([initialObj, middleware(initialObj, yargs)])
          )
          .then(([initialObj, middlewareObj]) =>
            Object.assign(initialObj, middlewareObj)
          )
      } else {
        const result = middleware(argv, yargs)
        if (beforeValidation && isPromise(result)) throw beforeValidationError

        return isPromise(result)
          ? result.then(middlewareObj => Object.assign(accumulation, middlewareObj))
          : Object.assign(accumulation, result)
      }
    }, argv)
}

},{"./argsert":99,"./is-promise":103}],106:[function(require,module,exports){
'use strict'
module.exports = function objFilter (original, filter) {
  const obj = {}
  filter = filter || ((k, v) => true)
  Object.keys(original || {}).forEach((key) => {
    if (filter(key, original[key])) {
      obj[key] = original[key]
    }
  })
  return obj
}

},{}],107:[function(require,module,exports){
function getProcessArgvBinIndex () {
  // The binary name is the first command line argument for:
  // - bundled Electron apps: bin argv1 argv2 ... argvn
  if (isBundledElectronApp()) return 0
  // or the second one (default) for:
  // - standard node apps: node bin.js argv1 argv2 ... argvn
  // - unbundled Electron apps: electron bin.js argv1 arg2 ... argvn
  return 1
}

function isBundledElectronApp () {
  // process.defaultApp is either set by electron in an electron unbundled app, or undefined
  // see https://github.com/electron/electron/blob/master/docs/api/process.md#processdefaultapp-readonly
  return isElectronApp() && !process.defaultApp
}

function isElectronApp () {
  // process.versions.electron is either set by electron, or undefined
  // see https://github.com/electron/electron/blob/master/docs/api/process.md#processversionselectron-readonly
  return !!process.versions.electron
}

function getProcessArgvWithoutBin () {
  return process.argv.slice(getProcessArgvBinIndex() + 1)
}

function getProcessArgvBin () {
  return process.argv[getProcessArgvBinIndex()]
}

module.exports = {
  getProcessArgvBin,
  getProcessArgvWithoutBin
}

},{}],108:[function(require,module,exports){
'use strict'
// this file handles outputting usage instructions,
// failures, etc. keeps logging in one place.
const decamelize = require('decamelize')
const stringWidth = require('string-width')
const objFilter = require('./obj-filter')
const path = require('path')
const setBlocking = require('set-blocking')
const YError = require('./yerror')

module.exports = function usage (yargs, y18n) {
  const __ = y18n.__
  const self = {}

  // methods for ouputting/building failure message.
  const fails = []
  self.failFn = function failFn (f) {
    fails.push(f)
  }

  let failMessage = null
  let showHelpOnFail = true
  self.showHelpOnFail = function showHelpOnFailFn (enabled, message) {
    if (typeof enabled === 'string') {
      message = enabled
      enabled = true
    } else if (typeof enabled === 'undefined') {
      enabled = true
    }
    failMessage = message
    showHelpOnFail = enabled
    return self
  }

  let failureOutput = false
  self.fail = function fail (msg, err) {
    const logger = yargs._getLoggerInstance()

    if (fails.length) {
      for (let i = fails.length - 1; i >= 0; --i) {
        fails[i](msg, err, self)
      }
    } else {
      if (yargs.getExitProcess()) setBlocking(true)

      // don't output failure message more than once
      if (!failureOutput) {
        failureOutput = true
        if (showHelpOnFail) {
          yargs.showHelp('error')
          logger.error()
        }
        if (msg || err) logger.error(msg || err)
        if (failMessage) {
          if (msg || err) logger.error('')
          logger.error(failMessage)
        }
      }

      err = err || new YError(msg)
      if (yargs.getExitProcess()) {
        return yargs.exit(1)
      } else if (yargs._hasParseCallback()) {
        return yargs.exit(1, err)
      } else {
        throw err
      }
    }
  }

  // methods for ouputting/building help (usage) message.
  let usages = []
  let usageDisabled = false
  self.usage = (msg, description) => {
    if (msg === null) {
      usageDisabled = true
      usages = []
      return
    }
    usageDisabled = false
    usages.push([msg, description || ''])
    return self
  }
  self.getUsage = () => {
    return usages
  }
  self.getUsageDisabled = () => {
    return usageDisabled
  }

  self.getPositionalGroupName = () => {
    return __('Positionals:')
  }

  let examples = []
  self.example = (cmd, description) => {
    examples.push([cmd, description || ''])
  }

  let commands = []
  self.command = function command (cmd, description, isDefault, aliases) {
    // the last default wins, so cancel out any previously set default
    if (isDefault) {
      commands = commands.map((cmdArray) => {
        cmdArray[2] = false
        return cmdArray
      })
    }
    commands.push([cmd, description || '', isDefault, aliases])
  }
  self.getCommands = () => commands

  let descriptions = {}
  self.describe = function describe (key, desc) {
    if (typeof key === 'object') {
      Object.keys(key).forEach((k) => {
        self.describe(k, key[k])
      })
    } else {
      descriptions[key] = desc
    }
  }
  self.getDescriptions = () => descriptions

  let epilogs = []
  self.epilog = (msg) => {
    epilogs.push(msg)
  }

  let wrapSet = false
  let wrap
  self.wrap = (cols) => {
    wrapSet = true
    wrap = cols
  }

  function getWrap () {
    if (!wrapSet) {
      wrap = windowWidth()
      wrapSet = true
    }

    return wrap
  }

  const deferY18nLookupPrefix = '__yargsString__:'
  self.deferY18nLookup = str => deferY18nLookupPrefix + str

  const defaultGroup = __('Options:')
  self.help = function help () {
    if (cachedHelpMessage) return cachedHelpMessage
    normalizeAliases()

    // handle old demanded API
    const base$0 = yargs.customScriptName ? yargs.$0 : path.basename(yargs.$0)
    const demandedOptions = yargs.getDemandedOptions()
    const demandedCommands = yargs.getDemandedCommands()
    const deprecatedOptions = yargs.getDeprecatedOptions()
    const groups = yargs.getGroups()
    const options = yargs.getOptions()

    let keys = []
    keys = keys.concat(Object.keys(descriptions))
    keys = keys.concat(Object.keys(demandedOptions))
    keys = keys.concat(Object.keys(demandedCommands))
    keys = keys.concat(Object.keys(options.default))
    keys = keys.filter(filterHiddenOptions)
    keys = Object.keys(keys.reduce((acc, key) => {
      if (key !== '_') acc[key] = true
      return acc
    }, {}))

    const theWrap = getWrap()
    const ui = require('cliui')({
      width: theWrap,
      wrap: !!theWrap
    })

    // the usage string.
    if (!usageDisabled) {
      if (usages.length) {
        // user-defined usage.
        usages.forEach((usage) => {
          ui.div(`${usage[0].replace(/\$0/g, base$0)}`)
          if (usage[1]) {
            ui.div({ text: `${usage[1]}`, padding: [1, 0, 0, 0] })
          }
        })
        ui.div()
      } else if (commands.length) {
        let u = null
        // demonstrate how commands are used.
        if (demandedCommands._) {
          u = `${base$0} <${__('command')}>\n`
        } else {
          u = `${base$0} [${__('command')}]\n`
        }
        ui.div(`${u}`)
      }
    }

    // your application's commands, i.e., non-option
    // arguments populated in '_'.
    if (commands.length) {
      ui.div(__('Commands:'))

      const context = yargs.getContext()
      const parentCommands = context.commands.length ? `${context.commands.join(' ')} ` : ''

      if (yargs.getParserConfiguration()['sort-commands'] === true) {
        commands = commands.sort((a, b) => a[0].localeCompare(b[0]))
      }

      commands.forEach((command) => {
        const commandString = `${base$0} ${parentCommands}${command[0].replace(/^\$0 ?/, '')}` // drop $0 from default commands.
        ui.span(
          {
            text: commandString,
            padding: [0, 2, 0, 2],
            width: maxWidth(commands, theWrap, `${base$0}${parentCommands}`) + 4
          },
          { text: command[1] }
        )
        const hints = []
        if (command[2]) hints.push(`[${__('default')}]`)
        if (command[3] && command[3].length) {
          hints.push(`[${__('aliases:')} ${command[3].join(', ')}]`)
        }
        if (hints.length) {
          ui.div({ text: hints.join(' '), padding: [0, 0, 0, 2], align: 'right' })
        } else {
          ui.div()
        }
      })

      ui.div()
    }

    // perform some cleanup on the keys array, making it
    // only include top-level keys not their aliases.
    const aliasKeys = (Object.keys(options.alias) || [])
      .concat(Object.keys(yargs.parsed.newAliases) || [])

    keys = keys.filter(key => !yargs.parsed.newAliases[key] && aliasKeys.every(alias => (options.alias[alias] || []).indexOf(key) === -1))

    // populate 'Options:' group with any keys that have not
    // explicitly had a group set.
    if (!groups[defaultGroup]) groups[defaultGroup] = []
    addUngroupedKeys(keys, options.alias, groups)

    // display 'Options:' table along with any custom tables:
    Object.keys(groups).forEach((groupName) => {
      if (!groups[groupName].length) return

      // if we've grouped the key 'f', but 'f' aliases 'foobar',
      // normalizedKeys should contain only 'foobar'.
      const normalizedKeys = groups[groupName].filter(filterHiddenOptions).map((key) => {
        if (~aliasKeys.indexOf(key)) return key
        for (let i = 0, aliasKey; (aliasKey = aliasKeys[i]) !== undefined; i++) {
          if (~(options.alias[aliasKey] || []).indexOf(key)) return aliasKey
        }
        return key
      })

      if (normalizedKeys.length < 1) return

      ui.div(groupName)

      // actually generate the switches string --foo, -f, --bar.
      const switches = normalizedKeys.reduce((acc, key) => {
        acc[key] = [key].concat(options.alias[key] || [])
          .map(sw => {
            // for the special positional group don't
            // add '--' or '-' prefix.
            if (groupName === self.getPositionalGroupName()) return sw
            else {
              return (
                // matches yargs-parser logic in which single-digits
                // aliases declared with a boolean type are now valid
                /^[0-9]$/.test(sw)
                  ? ~options.boolean.indexOf(key) ? '-' : '--'
                  : sw.length > 1 ? '--' : '-'
              ) + sw
            }
          })
          .join(', ')

        return acc
      }, {})

      normalizedKeys.forEach((key) => {
        const kswitch = switches[key]
        let desc = descriptions[key] || ''
        let type = null

        if (~desc.lastIndexOf(deferY18nLookupPrefix)) desc = __(desc.substring(deferY18nLookupPrefix.length))

        if (~options.boolean.indexOf(key)) type = `[${__('boolean')}]`
        if (~options.count.indexOf(key)) type = `[${__('count')}]`
        if (~options.string.indexOf(key)) type = `[${__('string')}]`
        if (~options.normalize.indexOf(key)) type = `[${__('string')}]`
        if (~options.array.indexOf(key)) type = `[${__('array')}]`
        if (~options.number.indexOf(key)) type = `[${__('number')}]`

        const extra = [
          (key in deprecatedOptions) ? (
            typeof deprecatedOptions[key] === 'string'
              ? `[${__('deprecated: %s', deprecatedOptions[key])}]`
              : `[${__('deprecated')}]`
          ) : null,
          type,
          (key in demandedOptions) ? `[${__('required')}]` : null,
          options.choices && options.choices[key] ? `[${__('choices:')} ${
            self.stringifiedValues(options.choices[key])}]` : null,
          defaultString(options.default[key], options.defaultDescription[key])
        ].filter(Boolean).join(' ')

        ui.span(
          { text: kswitch, padding: [0, 2, 0, 2], width: maxWidth(switches, theWrap) + 4 },
          desc
        )

        if (extra) ui.div({ text: extra, padding: [0, 0, 0, 2], align: 'right' })
        else ui.div()
      })

      ui.div()
    })

    // describe some common use-cases for your application.
    if (examples.length) {
      ui.div(__('Examples:'))

      examples.forEach((example) => {
        example[0] = example[0].replace(/\$0/g, base$0)
      })

      examples.forEach((example) => {
        if (example[1] === '') {
          ui.div(
            {
              text: example[0],
              padding: [0, 2, 0, 2]
            }
          )
        } else {
          ui.div(
            {
              text: example[0],
              padding: [0, 2, 0, 2],
              width: maxWidth(examples, theWrap) + 4
            }, {
              text: example[1]
            }
          )
        }
      })

      ui.div()
    }

    // the usage string.
    if (epilogs.length > 0) {
      const e = epilogs.map(epilog => epilog.replace(/\$0/g, base$0)).join('\n')
      ui.div(`${e}\n`)
    }

    // Remove the trailing white spaces
    return ui.toString().replace(/\s*$/, '')
  }

  // return the maximum width of a string
  // in the left-hand column of a table.
  function maxWidth (table, theWrap, modifier) {
    let width = 0

    // table might be of the form [leftColumn],
    // or {key: leftColumn}
    if (!Array.isArray(table)) {
      table = Object.keys(table).map(key => [table[key]])
    }

    table.forEach((v) => {
      width = Math.max(
        stringWidth(modifier ? `${modifier} ${v[0]}` : v[0]),
        width
      )
    })

    // if we've enabled 'wrap' we should limit
    // the max-width of the left-column.
    if (theWrap) width = Math.min(width, parseInt(theWrap * 0.5, 10))

    return width
  }

  // make sure any options set for aliases,
  // are copied to the keys being aliased.
  function normalizeAliases () {
    // handle old demanded API
    const demandedOptions = yargs.getDemandedOptions()
    const options = yargs.getOptions()

    ;(Object.keys(options.alias) || []).forEach((key) => {
      options.alias[key].forEach((alias) => {
        // copy descriptions.
        if (descriptions[alias]) self.describe(key, descriptions[alias])
        // copy demanded.
        if (alias in demandedOptions) yargs.demandOption(key, demandedOptions[alias])
        // type messages.
        if (~options.boolean.indexOf(alias)) yargs.boolean(key)
        if (~options.count.indexOf(alias)) yargs.count(key)
        if (~options.string.indexOf(alias)) yargs.string(key)
        if (~options.normalize.indexOf(alias)) yargs.normalize(key)
        if (~options.array.indexOf(alias)) yargs.array(key)
        if (~options.number.indexOf(alias)) yargs.number(key)
      })
    })
  }

  // if yargs is executing an async handler, we take a snapshot of the
  // help message to display on failure:
  let cachedHelpMessage
  self.cacheHelpMessage = function () {
    cachedHelpMessage = this.help()
  }

  // however this snapshot must be cleared afterwards
  // not to be be used by next calls to parse
  self.clearCachedHelpMessage = function () {
    cachedHelpMessage = undefined
  }

  // given a set of keys, place any keys that are
  // ungrouped under the 'Options:' grouping.
  function addUngroupedKeys (keys, aliases, groups) {
    let groupedKeys = []
    let toCheck = null
    Object.keys(groups).forEach((group) => {
      groupedKeys = groupedKeys.concat(groups[group])
    })

    keys.forEach((key) => {
      toCheck = [key].concat(aliases[key])
      if (!toCheck.some(k => groupedKeys.indexOf(k) !== -1)) {
        groups[defaultGroup].push(key)
      }
    })
    return groupedKeys
  }

  function filterHiddenOptions (key) {
    return yargs.getOptions().hiddenOptions.indexOf(key) < 0 || yargs.parsed.argv[yargs.getOptions().showHiddenOpt]
  }

  self.showHelp = (level) => {
    const logger = yargs._getLoggerInstance()
    if (!level) level = 'error'
    const emit = typeof level === 'function' ? level : logger[level]
    emit(self.help())
  }

  self.functionDescription = (fn) => {
    const description = fn.name ? decamelize(fn.name, '-') : __('generated-value')
    return ['(', description, ')'].join('')
  }

  self.stringifiedValues = function stringifiedValues (values, separator) {
    let string = ''
    const sep = separator || ', '
    const array = [].concat(values)

    if (!values || !array.length) return string

    array.forEach((value) => {
      if (string.length) string += sep
      string += JSON.stringify(value)
    })

    return string
  }

  // format the default-value-string displayed in
  // the right-hand column.
  function defaultString (value, defaultDescription) {
    let string = `[${__('default:')} `

    if (value === undefined && !defaultDescription) return null

    if (defaultDescription) {
      string += defaultDescription
    } else {
      switch (typeof value) {
        case 'string':
          string += `"${value}"`
          break
        case 'object':
          string += JSON.stringify(value)
          break
        default:
          string += value
      }
    }

    return `${string}]`
  }

  // guess the width of the console window, max-width 80.
  function windowWidth () {
    const maxWidth = 80
    // CI is not a TTY
    /* c8 ignore next 2 */
    if (typeof process === 'object' && process.stdout && process.stdout.columns) {
      return Math.min(maxWidth, process.stdout.columns)
    } else {
      return maxWidth
    }
  }

  // logic for displaying application version.
  let version = null
  self.version = (ver) => {
    version = ver
  }

  self.showVersion = () => {
    const logger = yargs._getLoggerInstance()
    logger.log(version)
  }

  self.reset = function reset (localLookup) {
    // do not reset wrap here
    // do not reset fails here
    failMessage = null
    failureOutput = false
    usages = []
    usageDisabled = false
    epilogs = []
    examples = []
    commands = []
    descriptions = objFilter(descriptions, (k, v) => !localLookup[k])
    return self
  }

  const frozens = []
  self.freeze = function freeze () {
    const frozen = {}
    frozens.push(frozen)
    frozen.failMessage = failMessage
    frozen.failureOutput = failureOutput
    frozen.usages = usages
    frozen.usageDisabled = usageDisabled
    frozen.epilogs = epilogs
    frozen.examples = examples
    frozen.commands = commands
    frozen.descriptions = descriptions
  }
  self.unfreeze = function unfreeze () {
    const frozen = frozens.pop()
    failMessage = frozen.failMessage
    failureOutput = frozen.failureOutput
    usages = frozen.usages
    usageDisabled = frozen.usageDisabled
    epilogs = frozen.epilogs
    examples = frozen.examples
    commands = frozen.commands
    descriptions = frozen.descriptions
  }

  return self
}

},{"./obj-filter":106,"./yerror":110,"cliui":113,"decamelize":39,"path":undefined,"set-blocking":91,"string-width":124}],109:[function(require,module,exports){
'use strict'
const argsert = require('./argsert')
const objFilter = require('./obj-filter')
const specialKeys = ['$0', '--', '_']

// validation-type-stuff, missing params,
// bad implications, custom checks.
module.exports = function validation (yargs, usage, y18n) {
  const __ = y18n.__
  const __n = y18n.__n
  const self = {}

  // validate appropriate # of non-option
  // arguments were provided, i.e., '_'.
  self.nonOptionCount = function nonOptionCount (argv) {
    const demandedCommands = yargs.getDemandedCommands()
    // don't count currently executing commands
    const _s = argv._.length - yargs.getContext().commands.length

    if (demandedCommands._ && (_s < demandedCommands._.min || _s > demandedCommands._.max)) {
      if (_s < demandedCommands._.min) {
        if (demandedCommands._.minMsg !== undefined) {
          usage.fail(
            // replace $0 with observed, $1 with expected.
            demandedCommands._.minMsg ? demandedCommands._.minMsg.replace(/\$0/g, _s).replace(/\$1/, demandedCommands._.min) : null
          )
        } else {
          usage.fail(
            __n(
              'Not enough non-option arguments: got %s, need at least %s',
              'Not enough non-option arguments: got %s, need at least %s',
              _s,
              _s,
              demandedCommands._.min
            )
          )
        }
      } else if (_s > demandedCommands._.max) {
        if (demandedCommands._.maxMsg !== undefined) {
          usage.fail(
            // replace $0 with observed, $1 with expected.
            demandedCommands._.maxMsg ? demandedCommands._.maxMsg.replace(/\$0/g, _s).replace(/\$1/, demandedCommands._.max) : null
          )
        } else {
          usage.fail(
            __n(
              'Too many non-option arguments: got %s, maximum of %s',
              'Too many non-option arguments: got %s, maximum of %s',
              _s,
              _s,
              demandedCommands._.max
            )
          )
        }
      }
    }
  }

  // validate the appropriate # of <required>
  // positional arguments were provided:
  self.positionalCount = function positionalCount (required, observed) {
    if (observed < required) {
      usage.fail(
        __n(
          'Not enough non-option arguments: got %s, need at least %s',
          'Not enough non-option arguments: got %s, need at least %s',
          observed,
          observed,
          required
        )
      )
    }
  }

  // make sure all the required arguments are present.
  self.requiredArguments = function requiredArguments (argv) {
    const demandedOptions = yargs.getDemandedOptions()
    let missing = null

    Object.keys(demandedOptions).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(argv, key) || typeof argv[key] === 'undefined') {
        missing = missing || {}
        missing[key] = demandedOptions[key]
      }
    })

    if (missing) {
      const customMsgs = []
      Object.keys(missing).forEach((key) => {
        const msg = missing[key]
        if (msg && customMsgs.indexOf(msg) < 0) {
          customMsgs.push(msg)
        }
      })

      const customMsg = customMsgs.length ? `\n${customMsgs.join('\n')}` : ''

      usage.fail(__n(
        'Missing required argument: %s',
        'Missing required arguments: %s',
        Object.keys(missing).length,
        Object.keys(missing).join(', ') + customMsg
      ))
    }
  }

  // check for unknown arguments (strict-mode).
  self.unknownArguments = function unknownArguments (argv, aliases, positionalMap) {
    const commandKeys = yargs.getCommandInstance().getCommands()
    const unknown = []
    const currentContext = yargs.getContext()

    Object.keys(argv).forEach((key) => {
      if (specialKeys.indexOf(key) === -1 &&
        !Object.prototype.hasOwnProperty.call(positionalMap, key) &&
        !Object.prototype.hasOwnProperty.call(yargs._getParseContext(), key) &&
        !self.isValidAndSomeAliasIsNotNew(key, aliases)
      ) {
        unknown.push(key)
      }
    })

    if ((currentContext.commands.length > 0) || (commandKeys.length > 0)) {
      argv._.slice(currentContext.commands.length).forEach((key) => {
        if (commandKeys.indexOf(key) === -1) {
          unknown.push(key)
        }
      })
    }

    if (unknown.length > 0) {
      usage.fail(__n(
        'Unknown argument: %s',
        'Unknown arguments: %s',
        unknown.length,
        unknown.join(', ')
      ))
    }
  }

  self.unknownCommands = function unknownCommands (argv, aliases, positionalMap) {
    const commandKeys = yargs.getCommandInstance().getCommands()
    const unknown = []
    const currentContext = yargs.getContext()

    if ((currentContext.commands.length > 0) || (commandKeys.length > 0)) {
      argv._.slice(currentContext.commands.length).forEach((key) => {
        if (commandKeys.indexOf(key) === -1) {
          unknown.push(key)
        }
      })
    }

    if (unknown.length > 0) {
      usage.fail(__n(
        'Unknown command: %s',
        'Unknown commands: %s',
        unknown.length,
        unknown.join(', ')
      ))
      return true
    } else {
      return false
    }
  }

  // check for a key that is not an alias, or for which every alias is new,
  // implying that it was invented by the parser, e.g., during camelization
  self.isValidAndSomeAliasIsNotNew = function isValidAndSomeAliasIsNotNew (key, aliases) {
    if (!Object.prototype.hasOwnProperty.call(aliases, key)) {
      return false
    }
    const newAliases = yargs.parsed.newAliases
    for (const a of [key, ...aliases[key]]) {
      if (!Object.prototype.hasOwnProperty.call(newAliases, a) || !newAliases[key]) {
        return true
      }
    }
    return false
  }

  // validate arguments limited to enumerated choices
  self.limitedChoices = function limitedChoices (argv) {
    const options = yargs.getOptions()
    const invalid = {}

    if (!Object.keys(options.choices).length) return

    Object.keys(argv).forEach((key) => {
      if (specialKeys.indexOf(key) === -1 &&
        Object.prototype.hasOwnProperty.call(options.choices, key)) {
        [].concat(argv[key]).forEach((value) => {
          // TODO case-insensitive configurability
          if (options.choices[key].indexOf(value) === -1 &&
              value !== undefined) {
            invalid[key] = (invalid[key] || []).concat(value)
          }
        })
      }
    })

    const invalidKeys = Object.keys(invalid)

    if (!invalidKeys.length) return

    let msg = __('Invalid values:')
    invalidKeys.forEach((key) => {
      msg += `\n  ${__(
        'Argument: %s, Given: %s, Choices: %s',
        key,
        usage.stringifiedValues(invalid[key]),
        usage.stringifiedValues(options.choices[key])
      )}`
    })
    usage.fail(msg)
  }

  // custom checks, added using the `check` option on yargs.
  let checks = []
  self.check = function check (f, global) {
    checks.push({
      func: f,
      global
    })
  }

  self.customChecks = function customChecks (argv, aliases) {
    for (let i = 0, f; (f = checks[i]) !== undefined; i++) {
      const func = f.func
      let result = null
      try {
        result = func(argv, aliases)
      } catch (err) {
        usage.fail(err.message ? err.message : err, err)
        continue
      }

      if (!result) {
        usage.fail(__('Argument check failed: %s', func.toString()))
      } else if (typeof result === 'string' || result instanceof Error) {
        usage.fail(result.toString(), result)
      }
    }
  }

  // check implications, argument foo implies => argument bar.
  let implied = {}
  self.implies = function implies (key, value) {
    argsert('<string|object> [array|number|string]', [key, value], arguments.length)

    if (typeof key === 'object') {
      Object.keys(key).forEach((k) => {
        self.implies(k, key[k])
      })
    } else {
      yargs.global(key)
      if (!implied[key]) {
        implied[key] = []
      }
      if (Array.isArray(value)) {
        value.forEach((i) => self.implies(key, i))
      } else {
        implied[key].push(value)
      }
    }
  }
  self.getImplied = function getImplied () {
    return implied
  }

  function keyExists (argv, val) {
    // convert string '1' to number 1
    const num = Number(val)
    val = isNaN(num) ? val : num

    if (typeof val === 'number') {
      // check length of argv._
      val = argv._.length >= val
    } else if (val.match(/^--no-.+/)) {
      // check if key/value doesn't exist
      val = val.match(/^--no-(.+)/)[1]
      val = !argv[val]
    } else {
      // check if key/value exists
      val = argv[val]
    }
    return val
  }

  self.implications = function implications (argv) {
    const implyFail = []

    Object.keys(implied).forEach((key) => {
      const origKey = key
      ;(implied[key] || []).forEach((value) => {
        let key = origKey
        const origValue = value
        key = keyExists(argv, key)
        value = keyExists(argv, value)

        if (key && !value) {
          implyFail.push(` ${origKey} -> ${origValue}`)
        }
      })
    })

    if (implyFail.length) {
      let msg = `${__('Implications failed:')}\n`

      implyFail.forEach((value) => {
        msg += (value)
      })

      usage.fail(msg)
    }
  }

  let conflicting = {}
  self.conflicts = function conflicts (key, value) {
    argsert('<string|object> [array|string]', [key, value], arguments.length)

    if (typeof key === 'object') {
      Object.keys(key).forEach((k) => {
        self.conflicts(k, key[k])
      })
    } else {
      yargs.global(key)
      if (!conflicting[key]) {
        conflicting[key] = []
      }
      if (Array.isArray(value)) {
        value.forEach((i) => self.conflicts(key, i))
      } else {
        conflicting[key].push(value)
      }
    }
  }
  self.getConflicting = () => conflicting

  self.conflicting = function conflictingFn (argv) {
    Object.keys(argv).forEach((key) => {
      if (conflicting[key]) {
        conflicting[key].forEach((value) => {
          // we default keys to 'undefined' that have been configured, we should not
          // apply conflicting check unless they are a value other than 'undefined'.
          if (value && argv[key] !== undefined && argv[value] !== undefined) {
            usage.fail(__('Arguments %s and %s are mutually exclusive', key, value))
          }
        })
      }
    })
  }

  self.recommendCommands = function recommendCommands (cmd, potentialCommands) {
    const distance = require('./levenshtein')
    const threshold = 3 // if it takes more than three edits, let's move on.
    potentialCommands = potentialCommands.sort((a, b) => b.length - a.length)

    let recommended = null
    let bestDistance = Infinity
    for (let i = 0, candidate; (candidate = potentialCommands[i]) !== undefined; i++) {
      const d = distance(cmd, candidate)
      if (d <= threshold && d < bestDistance) {
        bestDistance = d
        recommended = candidate
      }
    }
    if (recommended) usage.fail(__('Did you mean %s?', recommended))
  }

  self.reset = function reset (localLookup) {
    implied = objFilter(implied, (k, v) => !localLookup[k])
    conflicting = objFilter(conflicting, (k, v) => !localLookup[k])
    checks = checks.filter(c => c.global)
    return self
  }

  const frozens = []
  self.freeze = function freeze () {
    const frozen = {}
    frozens.push(frozen)
    frozen.implied = implied
    frozen.checks = checks
    frozen.conflicting = conflicting
  }
  self.unfreeze = function unfreeze () {
    const frozen = frozens.pop()
    implied = frozen.implied
    checks = frozen.checks
    conflicting = frozen.conflicting
  }

  return self
}

},{"./argsert":99,"./levenshtein":104,"./obj-filter":106}],110:[function(require,module,exports){
'use strict'
function YError (msg) {
  this.name = 'YError'
  this.message = msg || 'yargs error'
  Error.captureStackTrace(this, YError)
}

YError.prototype = Object.create(Error.prototype)
YError.prototype.constructor = YError

module.exports = YError

},{}],111:[function(require,module,exports){
'use strict';

module.exports = ({onlyFirst = false} = {}) => {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
	].join('|');

	return new RegExp(pattern, onlyFirst ? undefined : 'g');
};

},{}],112:[function(require,module,exports){
'use strict';

const wrapAnsi16 = (fn, offset) => (...args) => {
	const code = fn(...args);
	return `\u001B[${code + offset}m`;
};

const wrapAnsi256 = (fn, offset) => (...args) => {
	const code = fn(...args);
	return `\u001B[${38 + offset};5;${code}m`;
};

const wrapAnsi16m = (fn, offset) => (...args) => {
	const rgb = fn(...args);
	return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
};

const ansi2ansi = n => n;
const rgb2rgb = (r, g, b) => [r, g, b];

const setLazyProperty = (object, property, get) => {
	Object.defineProperty(object, property, {
		get: () => {
			const value = get();

			Object.defineProperty(object, property, {
				value,
				enumerable: true,
				configurable: true
			});

			return value;
		},
		enumerable: true,
		configurable: true
	});
};

/** @type {typeof import('color-convert')} */
let colorConvert;
const makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
	if (colorConvert === undefined) {
		colorConvert = require('color-convert');
	}

	const offset = isBackground ? 10 : 0;
	const styles = {};

	for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
		const name = sourceSpace === 'ansi16' ? 'ansi' : sourceSpace;
		if (sourceSpace === targetSpace) {
			styles[name] = wrap(identity, offset);
		} else if (typeof suite === 'object') {
			styles[name] = wrap(suite[targetSpace], offset);
		}
	}

	return styles;
};

function assembleStyles() {
	const codes = new Map();
	const styles = {
		modifier: {
			reset: [0, 0],
			// 21 isn't widely supported and 22 does the same thing
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],

			// Bright color
			blackBright: [90, 39],
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39]
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],

			// Bright color
			bgBlackBright: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49]
		}
	};

	// Alias bright black as gray (and grey)
	styles.color.gray = styles.color.blackBright;
	styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
	styles.color.grey = styles.color.blackBright;
	styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	setLazyProperty(styles.color, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, false));
	setLazyProperty(styles.color, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, false));
	setLazyProperty(styles.color, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, false));
	setLazyProperty(styles.bgColor, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, true));
	setLazyProperty(styles.bgColor, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, true));
	setLazyProperty(styles.bgColor, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, true));

	return styles;
}

// Make the export immutable
Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});

},{"color-convert":115}],113:[function(require,module,exports){
'use strict'

const stringWidth = require('string-width')
const stripAnsi = require('strip-ansi')
const wrap = require('wrap-ansi')

const align = {
  right: alignRight,
  center: alignCenter
}
const top = 0
const right = 1
const bottom = 2
const left = 3

class UI {
  constructor (opts) {
    this.width = opts.width
    this.wrap = opts.wrap
    this.rows = []
  }

  span (...args) {
    const cols = this.div(...args)
    cols.span = true
  }

  resetOutput () {
    this.rows = []
  }

  div (...args) {
    if (args.length === 0) {
      this.div('')
    }

    if (this.wrap && this._shouldApplyLayoutDSL(...args)) {
      return this._applyLayoutDSL(args[0])
    }

    const cols = args.map(arg => {
      if (typeof arg === 'string') {
        return this._colFromString(arg)
      }

      return arg
    })

    this.rows.push(cols)
    return cols
  }

  _shouldApplyLayoutDSL (...args) {
    return args.length === 1 && typeof args[0] === 'string' &&
      /[\t\n]/.test(args[0])
  }

  _applyLayoutDSL (str) {
    const rows = str.split('\n').map(row => row.split('\t'))
    let leftColumnWidth = 0

    // simple heuristic for layout, make sure the
    // second column lines up along the left-hand.
    // don't allow the first column to take up more
    // than 50% of the screen.
    rows.forEach(columns => {
      if (columns.length > 1 && stringWidth(columns[0]) > leftColumnWidth) {
        leftColumnWidth = Math.min(
          Math.floor(this.width * 0.5),
          stringWidth(columns[0])
        )
      }
    })

    // generate a table:
    //  replacing ' ' with padding calculations.
    //  using the algorithmically generated width.
    rows.forEach(columns => {
      this.div(...columns.map((r, i) => {
        return {
          text: r.trim(),
          padding: this._measurePadding(r),
          width: (i === 0 && columns.length > 1) ? leftColumnWidth : undefined
        }
      }))
    })

    return this.rows[this.rows.length - 1]
  }

  _colFromString (text) {
    return {
      text,
      padding: this._measurePadding(text)
    }
  }

  _measurePadding (str) {
    // measure padding without ansi escape codes
    const noAnsi = stripAnsi(str)
    return [0, noAnsi.match(/\s*$/)[0].length, 0, noAnsi.match(/^\s*/)[0].length]
  }

  toString () {
    const lines = []

    this.rows.forEach(row => {
      this.rowToString(row, lines)
    })

    // don't display any lines with the
    // hidden flag set.
    return lines
      .filter(line => !line.hidden)
      .map(line => line.text)
      .join('\n')
  }

  rowToString (row, lines) {
    this._rasterize(row).forEach((rrow, r) => {
      let str = ''
      rrow.forEach((col, c) => {
        const { width } = row[c] // the width with padding.
        const wrapWidth = this._negatePadding(row[c]) // the width without padding.

        let ts = col // temporary string used during alignment/padding.

        if (wrapWidth > stringWidth(col)) {
          ts += ' '.repeat(wrapWidth - stringWidth(col))
        }

        // align the string within its column.
        if (row[c].align && row[c].align !== 'left' && this.wrap) {
          ts = align[row[c].align](ts, wrapWidth)
          if (stringWidth(ts) < wrapWidth) {
            ts += ' '.repeat(width - stringWidth(ts) - 1)
          }
        }

        // apply border and padding to string.
        const padding = row[c].padding || [0, 0, 0, 0]
        if (padding[left]) {
          str += ' '.repeat(padding[left])
        }

        str += addBorder(row[c], ts, '| ')
        str += ts
        str += addBorder(row[c], ts, ' |')
        if (padding[right]) {
          str += ' '.repeat(padding[right])
        }

        // if prior row is span, try to render the
        // current row on the prior line.
        if (r === 0 && lines.length > 0) {
          str = this._renderInline(str, lines[lines.length - 1])
        }
      })

      // remove trailing whitespace.
      lines.push({
        text: str.replace(/ +$/, ''),
        span: row.span
      })
    })

    return lines
  }

  // if the full 'source' can render in
  // the target line, do so.
  _renderInline (source, previousLine) {
    const leadingWhitespace = source.match(/^ */)[0].length
    const target = previousLine.text
    const targetTextWidth = stringWidth(target.trimRight())

    if (!previousLine.span) {
      return source
    }

    // if we're not applying wrapping logic,
    // just always append to the span.
    if (!this.wrap) {
      previousLine.hidden = true
      return target + source
    }

    if (leadingWhitespace < targetTextWidth) {
      return source
    }

    previousLine.hidden = true

    return target.trimRight() + ' '.repeat(leadingWhitespace - targetTextWidth) + source.trimLeft()
  }

  _rasterize (row) {
    const rrows = []
    const widths = this._columnWidths(row)
    let wrapped

    // word wrap all columns, and create
    // a data-structure that is easy to rasterize.
    row.forEach((col, c) => {
      // leave room for left and right padding.
      col.width = widths[c]
      if (this.wrap) {
        wrapped = wrap(col.text, this._negatePadding(col), { hard: true }).split('\n')
      } else {
        wrapped = col.text.split('\n')
      }

      if (col.border) {
        wrapped.unshift('.' + '-'.repeat(this._negatePadding(col) + 2) + '.')
        wrapped.push("'" + '-'.repeat(this._negatePadding(col) + 2) + "'")
      }

      // add top and bottom padding.
      if (col.padding) {
        wrapped.unshift(...new Array(col.padding[top] || 0).fill(''))
        wrapped.push(...new Array(col.padding[bottom] || 0).fill(''))
      }

      wrapped.forEach((str, r) => {
        if (!rrows[r]) {
          rrows.push([])
        }

        const rrow = rrows[r]

        for (let i = 0; i < c; i++) {
          if (rrow[i] === undefined) {
            rrow.push('')
          }
        }

        rrow.push(str)
      })
    })

    return rrows
  }

  _negatePadding (col) {
    let wrapWidth = col.width
    if (col.padding) {
      wrapWidth -= (col.padding[left] || 0) + (col.padding[right] || 0)
    }

    if (col.border) {
      wrapWidth -= 4
    }

    return wrapWidth
  }

  _columnWidths (row) {
    if (!this.wrap) {
      return row.map(col => {
        return col.width || stringWidth(col.text)
      })
    }

    let unset = row.length
    let remainingWidth = this.width

    // column widths can be set in config.
    const widths = row.map(col => {
      if (col.width) {
        unset--
        remainingWidth -= col.width
        return col.width
      }

      return undefined
    })

    // any unset widths should be calculated.
    const unsetWidth = unset ? Math.floor(remainingWidth / unset) : 0

    return widths.map((w, i) => {
      if (w === undefined) {
        return Math.max(unsetWidth, _minWidth(row[i]))
      }

      return w
    })
  }
}

function addBorder (col, ts, style) {
  if (col.border) {
    if (/[.']-+[.']/.test(ts)) {
      return ''
    }

    if (ts.trim().length !== 0) {
      return style
    }

    return '  '
  }

  return ''
}

// calculates the minimum width of
// a column, based on padding preferences.
function _minWidth (col) {
  const padding = col.padding || []
  const minWidth = 1 + (padding[left] || 0) + (padding[right] || 0)
  if (col.border) {
    return minWidth + 4
  }

  return minWidth
}

function getWindowWidth () {
  /* istanbul ignore next: depends on terminal */
  if (typeof process === 'object' && process.stdout && process.stdout.columns) {
    return process.stdout.columns
  }
}

function alignRight (str, width) {
  str = str.trim()
  const strWidth = stringWidth(str)

  if (strWidth < width) {
    return ' '.repeat(width - strWidth) + str
  }

  return str
}

function alignCenter (str, width) {
  str = str.trim()
  const strWidth = stringWidth(str)

  /* istanbul ignore next */
  if (strWidth >= width) {
    return str
  }

  return ' '.repeat((width - strWidth) >> 1) + str
}

module.exports = function (opts = {}) {
  return new UI({
    width: opts.width || getWindowWidth() || /* istanbul ignore next */ 80,
    wrap: opts.wrap !== false
  })
}

},{"string-width":124,"strip-ansi":125,"wrap-ansi":126}],114:[function(require,module,exports){
/* MIT license */
/* eslint-disable no-mixed-operators */
const cssKeywords = require('color-name');

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

const reverseKeywords = {};
for (const key of Object.keys(cssKeywords)) {
	reverseKeywords[cssKeywords[key]] = key;
}

const convert = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

module.exports = convert;

// Hide .channels and .labels properties
for (const model of Object.keys(convert)) {
	if (!('channels' in convert[model])) {
		throw new Error('missing channels property: ' + model);
	}

	if (!('labels' in convert[model])) {
		throw new Error('missing channel labels property: ' + model);
	}

	if (convert[model].labels.length !== convert[model].channels) {
		throw new Error('channel and label counts mismatch: ' + model);
	}

	const {channels, labels} = convert[model];
	delete convert[model].channels;
	delete convert[model].labels;
	Object.defineProperty(convert[model], 'channels', {value: channels});
	Object.defineProperty(convert[model], 'labels', {value: labels});
}

convert.rgb.hsl = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);
	const delta = max - min;
	let h;
	let s;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	const l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	let rdif;
	let gdif;
	let bdif;
	let h;
	let s;

	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const v = Math.max(r, g, b);
	const diff = v - Math.min(r, g, b);
	const diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = 0;
		s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}

		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	const r = rgb[0];
	const g = rgb[1];
	let b = rgb[2];
	const h = convert.rgb.hsl(rgb)[0];
	const w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;

	const k = Math.min(1 - r, 1 - g, 1 - b);
	const c = (1 - r - k) / (1 - k) || 0;
	const m = (1 - g - k) / (1 - k) || 0;
	const y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

function comparativeDistance(x, y) {
	/*
		See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
	*/
	return (
		((x[0] - y[0]) ** 2) +
		((x[1] - y[1]) ** 2) +
		((x[2] - y[2]) ** 2)
	);
}

convert.rgb.keyword = function (rgb) {
	const reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	let currentClosestDistance = Infinity;
	let currentClosestKeyword;

	for (const keyword of Object.keys(cssKeywords)) {
		const value = cssKeywords[keyword];

		// Compute comparative distance
		const distance = comparativeDistance(rgb, value);

		// Check if its less, if so set as closest
		if (distance < currentClosestDistance) {
			currentClosestDistance = distance;
			currentClosestKeyword = keyword;
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert.rgb.xyz = function (rgb) {
	let r = rgb[0] / 255;
	let g = rgb[1] / 255;
	let b = rgb[2] / 255;

	// Assume sRGB
	r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
	g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
	b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

	const x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	const y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	const z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	const xyz = convert.rgb.xyz(rgb);
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	const h = hsl[0] / 360;
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;
	let t2;
	let t3;
	let val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	const t1 = 2 * l - t2;

	const rgb = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}

		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	const h = hsl[0];
	let s = hsl[1] / 100;
	let l = hsl[2] / 100;
	let smin = s;
	const lmin = Math.max(l, 0.01);

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	const v = (l + s) / 2;
	const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	const h = hsv[0] / 60;
	const s = hsv[1] / 100;
	let v = hsv[2] / 100;
	const hi = Math.floor(h) % 6;

	const f = h - Math.floor(h);
	const p = 255 * v * (1 - s);
	const q = 255 * v * (1 - (s * f));
	const t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	const h = hsv[0];
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;
	const vmin = Math.max(v, 0.01);
	let sl;
	let l;

	l = (2 - s) * v;
	const lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	const h = hwb[0] / 360;
	let wh = hwb[1] / 100;
	let bl = hwb[2] / 100;
	const ratio = wh + bl;
	let f;

	// Wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	const i = Math.floor(6 * h);
	const v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	const n = wh + f * (v - wh); // Linear interpolation

	let r;
	let g;
	let b;
	/* eslint-disable max-statements-per-line,no-multi-spaces */
	switch (i) {
		default:
		case 6:
		case 0: r = v;  g = n;  b = wh; break;
		case 1: r = n;  g = v;  b = wh; break;
		case 2: r = wh; g = v;  b = n; break;
		case 3: r = wh; g = n;  b = v; break;
		case 4: r = n;  g = wh; b = v; break;
		case 5: r = v;  g = wh; b = n; break;
	}
	/* eslint-enable max-statements-per-line,no-multi-spaces */

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	const c = cmyk[0] / 100;
	const m = cmyk[1] / 100;
	const y = cmyk[2] / 100;
	const k = cmyk[3] / 100;

	const r = 1 - Math.min(1, c * (1 - k) + k);
	const g = 1 - Math.min(1, m * (1 - k) + k);
	const b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	const x = xyz[0] / 100;
	const y = xyz[1] / 100;
	const z = xyz[2] / 100;
	let r;
	let g;
	let b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// Assume sRGB
	r = r > 0.0031308
		? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let x;
	let y;
	let z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	const y2 = y ** 3;
	const x2 = x ** 3;
	const z2 = z ** 3;
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let h;

	const hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	const c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	const l = lch[0];
	const c = lch[1];
	const h = lch[2];

	const hr = h / 360 * 2 * Math.PI;
	const a = c * Math.cos(hr);
	const b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args, saturation = null) {
	const [r, g, b] = args;
	let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	let ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// Optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	const r = args[0];
	const g = args[1];
	const b = args[2];

	// We use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	const ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	let color = args % 10;

	// Handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	const mult = (~~(args > 50) + 1) * 0.5;
	const r = ((color & 1) * mult) * 255;
	const g = (((color >> 1) & 1) * mult) * 255;
	const b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// Handle greyscale
	if (args >= 232) {
		const c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	let rem;
	const r = Math.floor(args / 36) / 5 * 255;
	const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	const b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	const integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	let colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(char => {
			return char + char;
		}).join('');
	}

	const integer = parseInt(colorString, 16);
	const r = (integer >> 16) & 0xFF;
	const g = (integer >> 8) & 0xFF;
	const b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const max = Math.max(Math.max(r, g), b);
	const min = Math.min(Math.min(r, g), b);
	const chroma = (max - min);
	let grayscale;
	let hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;

	const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

	let f = 0;
	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;

	const c = s * v;
	let f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	const h = hcg[0] / 360;
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	const pure = [0, 0, 0];
	const hi = (h % 1) * 6;
	const v = hi % 1;
	const w = 1 - v;
	let mg = 0;

	/* eslint-disable max-statements-per-line */
	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}
	/* eslint-enable max-statements-per-line */

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const v = c + g * (1.0 - c);
	let f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const l = g * (1.0 - c) + 0.5 * c;
	let s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;
	const v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	const w = hwb[1] / 100;
	const b = hwb[2] / 100;
	const v = 1 - b;
	const c = v - w;
	let g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hsv = convert.gray.hsl;

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	const val = Math.round(gray[0] / 100 * 255) & 0xFF;
	const integer = (val << 16) + (val << 8) + val;

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};

},{"color-name":117}],115:[function(require,module,exports){
const conversions = require('./conversions');
const route = require('./route');

const convert = {};

const models = Object.keys(conversions);

function wrapRaw(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];
		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		return fn(args);
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];

		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		const result = fn(args);

		// We're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (let len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(fromModel => {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	const routes = route(fromModel);
	const routeModels = Object.keys(routes);

	routeModels.forEach(toModel => {
		const fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;

},{"./conversions":114,"./route":116}],116:[function(require,module,exports){
const conversions = require('./conversions');

/*
	This function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	const graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	const models = Object.keys(conversions);

	for (let len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	const graph = buildGraph();
	const queue = [fromModel]; // Unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		const current = queue.pop();
		const adjacents = Object.keys(conversions[current]);

		for (let len = adjacents.length, i = 0; i < len; i++) {
			const adjacent = adjacents[i];
			const node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	const path = [graph[toModel].parent, toModel];
	let fn = conversions[graph[toModel].parent][toModel];

	let cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

module.exports = function (fromModel) {
	const graph = deriveBFS(fromModel);
	const conversion = {};

	const models = Object.keys(graph);
	for (let len = models.length, i = 0; i < len; i++) {
		const toModel = models[i];
		const node = graph[toModel];

		if (node.parent === null) {
			// No possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};


},{"./conversions":114}],117:[function(require,module,exports){
'use strict'

module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};

},{}],118:[function(require,module,exports){
"use strict";

module.exports = function () {
  // https://mths.be/emoji
  return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
};

},{}],119:[function(require,module,exports){
'use strict';
const path = require('path');
const locatePath = require('locate-path');
const pathExists = require('path-exists');

const stop = Symbol('findUp.stop');

module.exports = async (name, options = {}) => {
	let directory = path.resolve(options.cwd || '');
	const {root} = path.parse(directory);
	const paths = [].concat(name);

	const runMatcher = async locateOptions => {
		if (typeof name !== 'function') {
			return locatePath(paths, locateOptions);
		}

		const foundPath = await name(locateOptions.cwd);
		if (typeof foundPath === 'string') {
			return locatePath([foundPath], locateOptions);
		}

		return foundPath;
	};

	// eslint-disable-next-line no-constant-condition
	while (true) {
		// eslint-disable-next-line no-await-in-loop
		const foundPath = await runMatcher({...options, cwd: directory});

		if (foundPath === stop) {
			return;
		}

		if (foundPath) {
			return path.resolve(directory, foundPath);
		}

		if (directory === root) {
			return;
		}

		directory = path.dirname(directory);
	}
};

module.exports.sync = (name, options = {}) => {
	let directory = path.resolve(options.cwd || '');
	const {root} = path.parse(directory);
	const paths = [].concat(name);

	const runMatcher = locateOptions => {
		if (typeof name !== 'function') {
			return locatePath.sync(paths, locateOptions);
		}

		const foundPath = name(locateOptions.cwd);
		if (typeof foundPath === 'string') {
			return locatePath.sync([foundPath], locateOptions);
		}

		return foundPath;
	};

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const foundPath = runMatcher({...options, cwd: directory});

		if (foundPath === stop) {
			return;
		}

		if (foundPath) {
			return path.resolve(directory, foundPath);
		}

		if (directory === root) {
			return;
		}

		directory = path.dirname(directory);
	}
};

module.exports.exists = pathExists;

module.exports.sync.exists = pathExists.sync;

module.exports.stop = stop;

},{"locate-path":121,"path":undefined,"path-exists":123}],120:[function(require,module,exports){
/* eslint-disable yoda */
'use strict';

const isFullwidthCodePoint = codePoint => {
	if (Number.isNaN(codePoint)) {
		return false;
	}

	// Code points are derived from:
	// http://www.unix.org/Public/UNIDATA/EastAsianWidth.txt
	if (
		codePoint >= 0x1100 && (
			codePoint <= 0x115F || // Hangul Jamo
			codePoint === 0x2329 || // LEFT-POINTING ANGLE BRACKET
			codePoint === 0x232A || // RIGHT-POINTING ANGLE BRACKET
			// CJK Radicals Supplement .. Enclosed CJK Letters and Months
			(0x2E80 <= codePoint && codePoint <= 0x3247 && codePoint !== 0x303F) ||
			// Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
			(0x3250 <= codePoint && codePoint <= 0x4DBF) ||
			// CJK Unified Ideographs .. Yi Radicals
			(0x4E00 <= codePoint && codePoint <= 0xA4C6) ||
			// Hangul Jamo Extended-A
			(0xA960 <= codePoint && codePoint <= 0xA97C) ||
			// Hangul Syllables
			(0xAC00 <= codePoint && codePoint <= 0xD7A3) ||
			// CJK Compatibility Ideographs
			(0xF900 <= codePoint && codePoint <= 0xFAFF) ||
			// Vertical Forms
			(0xFE10 <= codePoint && codePoint <= 0xFE19) ||
			// CJK Compatibility Forms .. Small Form Variants
			(0xFE30 <= codePoint && codePoint <= 0xFE6B) ||
			// Halfwidth and Fullwidth Forms
			(0xFF01 <= codePoint && codePoint <= 0xFF60) ||
			(0xFFE0 <= codePoint && codePoint <= 0xFFE6) ||
			// Kana Supplement
			(0x1B000 <= codePoint && codePoint <= 0x1B001) ||
			// Enclosed Ideographic Supplement
			(0x1F200 <= codePoint && codePoint <= 0x1F251) ||
			// CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
			(0x20000 <= codePoint && codePoint <= 0x3FFFD)
		)
	) {
		return true;
	}

	return false;
};

module.exports = isFullwidthCodePoint;
module.exports.default = isFullwidthCodePoint;

},{}],121:[function(require,module,exports){
'use strict';
const path = require('path');
const fs = require('fs');
const {promisify} = require('util');
const pLocate = require('p-locate');

const fsStat = promisify(fs.stat);
const fsLStat = promisify(fs.lstat);

const typeMappings = {
	directory: 'isDirectory',
	file: 'isFile'
};

function checkType({type}) {
	if (type in typeMappings) {
		return;
	}

	throw new Error(`Invalid type specified: ${type}`);
}

const matchType = (type, stat) => type === undefined || stat[typeMappings[type]]();

module.exports = async (paths, options) => {
	options = {
		cwd: process.cwd(),
		type: 'file',
		allowSymlinks: true,
		...options
	};
	checkType(options);
	const statFn = options.allowSymlinks ? fsStat : fsLStat;

	return pLocate(paths, async path_ => {
		try {
			const stat = await statFn(path.resolve(options.cwd, path_));
			return matchType(options.type, stat);
		} catch (_) {
			return false;
		}
	}, options);
};

module.exports.sync = (paths, options) => {
	options = {
		cwd: process.cwd(),
		allowSymlinks: true,
		type: 'file',
		...options
	};
	checkType(options);
	const statFn = options.allowSymlinks ? fs.statSync : fs.lstatSync;

	for (const path_ of paths) {
		try {
			const stat = statFn(path.resolve(options.cwd, path_));

			if (matchType(options.type, stat)) {
				return path_;
			}
		} catch (_) {
		}
	}
};

},{"fs":undefined,"p-locate":122,"path":undefined,"util":undefined}],122:[function(require,module,exports){
'use strict';
const pLimit = require('p-limit');

class EndError extends Error {
	constructor(value) {
		super();
		this.value = value;
	}
}

// The input can also be a promise, so we await it
const testElement = async (element, tester) => tester(await element);

// The input can also be a promise, so we `Promise.all()` them both
const finder = async element => {
	const values = await Promise.all(element);
	if (values[1] === true) {
		throw new EndError(values[0]);
	}

	return false;
};

const pLocate = async (iterable, tester, options) => {
	options = {
		concurrency: Infinity,
		preserveOrder: true,
		...options
	};

	const limit = pLimit(options.concurrency);

	// Start all the promises concurrently with optional limit
	const items = [...iterable].map(element => [element, limit(testElement, element, tester)]);

	// Check the promises either serially or concurrently
	const checkLimit = pLimit(options.preserveOrder ? 1 : Infinity);

	try {
		await Promise.all(items.map(element => checkLimit(finder, element)));
	} catch (error) {
		if (error instanceof EndError) {
			return error.value;
		}

		throw error;
	}
};

module.exports = pLocate;
// TODO: Remove this for the next major release
module.exports.default = pLocate;

},{"p-limit":86}],123:[function(require,module,exports){
'use strict';
const fs = require('fs');
const {promisify} = require('util');

const pAccess = promisify(fs.access);

module.exports = async path => {
	try {
		await pAccess(path);
		return true;
	} catch (_) {
		return false;
	}
};

module.exports.sync = path => {
	try {
		fs.accessSync(path);
		return true;
	} catch (_) {
		return false;
	}
};

},{"fs":undefined,"util":undefined}],124:[function(require,module,exports){
'use strict';
const stripAnsi = require('strip-ansi');
const isFullwidthCodePoint = require('is-fullwidth-code-point');
const emojiRegex = require('emoji-regex');

const stringWidth = string => {
	string = string.replace(emojiRegex(), '  ');

	if (typeof string !== 'string' || string.length === 0) {
		return 0;
	}

	string = stripAnsi(string);

	let width = 0;

	for (let i = 0; i < string.length; i++) {
		const code = string.codePointAt(i);

		// Ignore control characters
		if (code <= 0x1F || (code >= 0x7F && code <= 0x9F)) {
			continue;
		}

		// Ignore combining characters
		if (code >= 0x300 && code <= 0x36F) {
			continue;
		}

		// Surrogates
		if (code > 0xFFFF) {
			i++;
		}

		width += isFullwidthCodePoint(code) ? 2 : 1;
	}

	return width;
};

module.exports = stringWidth;
// TODO: remove this in the next major version
module.exports.default = stringWidth;

},{"emoji-regex":118,"is-fullwidth-code-point":120,"strip-ansi":125}],125:[function(require,module,exports){
'use strict';
const ansiRegex = require('ansi-regex');

module.exports = string => typeof string === 'string' ? string.replace(ansiRegex(), '') : string;

},{"ansi-regex":111}],126:[function(require,module,exports){
'use strict';
const stringWidth = require('string-width');
const stripAnsi = require('strip-ansi');
const ansiStyles = require('ansi-styles');

const ESCAPES = new Set([
	'\u001B',
	'\u009B'
]);

const END_CODE = 39;

const wrapAnsi = code => `${ESCAPES.values().next().value}[${code}m`;

// Calculate the length of words split on ' ', ignoring
// the extra characters added by ansi escape codes
const wordLengths = string => string.split(' ').map(character => stringWidth(character));

// Wrap a long word across multiple rows
// Ansi escape codes do not count towards length
const wrapWord = (rows, word, columns) => {
	const characters = [...word];

	let isInsideEscape = false;
	let visible = stringWidth(stripAnsi(rows[rows.length - 1]));

	for (const [index, character] of characters.entries()) {
		const characterLength = stringWidth(character);

		if (visible + characterLength <= columns) {
			rows[rows.length - 1] += character;
		} else {
			rows.push(character);
			visible = 0;
		}

		if (ESCAPES.has(character)) {
			isInsideEscape = true;
		} else if (isInsideEscape && character === 'm') {
			isInsideEscape = false;
			continue;
		}

		if (isInsideEscape) {
			continue;
		}

		visible += characterLength;

		if (visible === columns && index < characters.length - 1) {
			rows.push('');
			visible = 0;
		}
	}

	// It's possible that the last row we copy over is only
	// ansi escape characters, handle this edge-case
	if (!visible && rows[rows.length - 1].length > 0 && rows.length > 1) {
		rows[rows.length - 2] += rows.pop();
	}
};

// Trims spaces from a string ignoring invisible sequences
const stringVisibleTrimSpacesRight = str => {
	const words = str.split(' ');
	let last = words.length;

	while (last > 0) {
		if (stringWidth(words[last - 1]) > 0) {
			break;
		}

		last--;
	}

	if (last === words.length) {
		return str;
	}

	return words.slice(0, last).join(' ') + words.slice(last).join('');
};

// The wrap-ansi module can be invoked in either 'hard' or 'soft' wrap mode
//
// 'hard' will never allow a string to take up more than columns characters
//
// 'soft' allows long words to expand past the column length
const exec = (string, columns, options = {}) => {
	if (options.trim !== false && string.trim() === '') {
		return '';
	}

	let pre = '';
	let ret = '';
	let escapeCode;

	const lengths = wordLengths(string);
	let rows = [''];

	for (const [index, word] of string.split(' ').entries()) {
		if (options.trim !== false) {
			rows[rows.length - 1] = rows[rows.length - 1].trimLeft();
		}

		let rowLength = stringWidth(rows[rows.length - 1]);

		if (index !== 0) {
			if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
				// If we start with a new word but the current row length equals the length of the columns, add a new row
				rows.push('');
				rowLength = 0;
			}

			if (rowLength > 0 || options.trim === false) {
				rows[rows.length - 1] += ' ';
				rowLength++;
			}
		}

		// In 'hard' wrap mode, the length of a line is never allowed to extend past 'columns'
		if (options.hard && lengths[index] > columns) {
			const remainingColumns = (columns - rowLength);
			const breaksStartingThisLine = 1 + Math.floor((lengths[index] - remainingColumns - 1) / columns);
			const breaksStartingNextLine = Math.floor((lengths[index] - 1) / columns);
			if (breaksStartingNextLine < breaksStartingThisLine) {
				rows.push('');
			}

			wrapWord(rows, word, columns);
			continue;
		}

		if (rowLength + lengths[index] > columns && rowLength > 0 && lengths[index] > 0) {
			if (options.wordWrap === false && rowLength < columns) {
				wrapWord(rows, word, columns);
				continue;
			}

			rows.push('');
		}

		if (rowLength + lengths[index] > columns && options.wordWrap === false) {
			wrapWord(rows, word, columns);
			continue;
		}

		rows[rows.length - 1] += word;
	}

	if (options.trim !== false) {
		rows = rows.map(stringVisibleTrimSpacesRight);
	}

	pre = rows.join('\n');

	for (const [index, character] of [...pre].entries()) {
		ret += character;

		if (ESCAPES.has(character)) {
			const code = parseFloat(/\d[^m]*/.exec(pre.slice(index, index + 4)));
			escapeCode = code === END_CODE ? null : code;
		}

		const code = ansiStyles.codes.get(Number(escapeCode));

		if (escapeCode && code) {
			if (pre[index + 1] === '\n') {
				ret += wrapAnsi(code);
			} else if (character === '\n') {
				ret += wrapAnsi(escapeCode);
			}
		}
	}

	return ret;
};

// For each newline, invoke the method separately
module.exports = (string, columns, options) => {
	return String(string)
		.normalize()
		.replace(/\r\n/g, '\n')
		.split('\n')
		.map(line => exec(line, columns, options))
		.join('\n');
};

},{"ansi-styles":112,"string-width":124,"strip-ansi":125}],127:[function(require,module,exports){
const camelCase = require('camelcase')
const decamelize = require('decamelize')
const path = require('path')
const tokenizeArgString = require('./lib/tokenize-arg-string')
const util = require('util')

function parse (args, opts) {
  opts = Object.assign(Object.create(null), opts)
  // allow a string argument to be passed in rather
  // than an argv array.
  args = tokenizeArgString(args)

  // aliases might have transitive relationships, normalize this.
  const aliases = combineAliases(Object.assign(Object.create(null), opts.alias))
  const configuration = Object.assign({
    'boolean-negation': true,
    'camel-case-expansion': true,
    'combine-arrays': false,
    'dot-notation': true,
    'duplicate-arguments-array': true,
    'flatten-duplicate-arrays': true,
    'greedy-arrays': true,
    'halt-at-non-option': false,
    'nargs-eats-options': false,
    'negation-prefix': 'no-',
    'parse-numbers': true,
    'populate--': false,
    'set-placeholder-key': false,
    'short-option-groups': true,
    'strip-aliased': false,
    'strip-dashed': false,
    'unknown-options-as-args': false
  }, opts.configuration)
  const defaults = Object.assign(Object.create(null), opts.default)
  const configObjects = opts.configObjects || []
  const envPrefix = opts.envPrefix
  const notFlagsOption = configuration['populate--']
  const notFlagsArgv = notFlagsOption ? '--' : '_'
  const newAliases = Object.create(null)
  const defaulted = Object.create(null)
  // allow a i18n handler to be passed in, default to a fake one (util.format).
  const __ = opts.__ || util.format
  const flags = {
    aliases: Object.create(null),
    arrays: Object.create(null),
    bools: Object.create(null),
    strings: Object.create(null),
    numbers: Object.create(null),
    counts: Object.create(null),
    normalize: Object.create(null),
    configs: Object.create(null),
    nargs: Object.create(null),
    coercions: Object.create(null),
    keys: []
  }
  const negative = /^-([0-9]+(\.[0-9]+)?|\.[0-9]+)$/
  const negatedBoolean = new RegExp('^--' + configuration['negation-prefix'] + '(.+)')

  ;[].concat(opts.array).filter(Boolean).forEach(function (opt) {
    const key = opt.key || opt

    // assign to flags[bools|strings|numbers]
    const assignment = Object.keys(opt).map(function (key) {
      return ({
        boolean: 'bools',
        string: 'strings',
        number: 'numbers'
      })[key]
    }).filter(Boolean).pop()

    // assign key to be coerced
    if (assignment) {
      flags[assignment][key] = true
    }

    flags.arrays[key] = true
    flags.keys.push(key)
  })

  ;[].concat(opts.boolean).filter(Boolean).forEach(function (key) {
    flags.bools[key] = true
    flags.keys.push(key)
  })

  ;[].concat(opts.string).filter(Boolean).forEach(function (key) {
    flags.strings[key] = true
    flags.keys.push(key)
  })

  ;[].concat(opts.number).filter(Boolean).forEach(function (key) {
    flags.numbers[key] = true
    flags.keys.push(key)
  })

  ;[].concat(opts.count).filter(Boolean).forEach(function (key) {
    flags.counts[key] = true
    flags.keys.push(key)
  })

  ;[].concat(opts.normalize).filter(Boolean).forEach(function (key) {
    flags.normalize[key] = true
    flags.keys.push(key)
  })

  Object.keys(opts.narg || {}).forEach(function (k) {
    flags.nargs[k] = opts.narg[k]
    flags.keys.push(k)
  })

  Object.keys(opts.coerce || {}).forEach(function (k) {
    flags.coercions[k] = opts.coerce[k]
    flags.keys.push(k)
  })

  if (Array.isArray(opts.config) || typeof opts.config === 'string') {
    ;[].concat(opts.config).filter(Boolean).forEach(function (key) {
      flags.configs[key] = true
    })
  } else {
    Object.keys(opts.config || {}).forEach(function (k) {
      flags.configs[k] = opts.config[k]
    })
  }

  // create a lookup table that takes into account all
  // combinations of aliases: {f: ['foo'], foo: ['f']}
  extendAliases(opts.key, aliases, opts.default, flags.arrays)

  // apply default values to all aliases.
  Object.keys(defaults).forEach(function (key) {
    (flags.aliases[key] || []).forEach(function (alias) {
      defaults[alias] = defaults[key]
    })
  })

  let error = null
  checkConfiguration()

  let notFlags = []

  const argv = Object.assign(Object.create(null), { _: [] })
  // TODO(bcoe): for the first pass at removing object prototype  we didn't
  // remove all prototypes from objects returned by this API, we might want
  // to gradually move towards doing so.
  const argvReturn = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    let broken
    let key
    let letters
    let m
    let next
    let value

    // any unknown option (except for end-of-options, "--")
    if (arg !== '--' && isUnknownOptionAsArg(arg)) {
      argv._.push(arg)
    // -- separated by =
    } else if (arg.match(/^--.+=/) || (
      !configuration['short-option-groups'] && arg.match(/^-.+=/)
    )) {
      // Using [\s\S] instead of . because js doesn't support the
      // 'dotall' regex modifier. See:
      // http://stackoverflow.com/a/1068308/13216
      m = arg.match(/^--?([^=]+)=([\s\S]*)$/)

      // arrays format = '--f=a b c'
      if (checkAllAliases(m[1], flags.arrays)) {
        i = eatArray(i, m[1], args, m[2])
      } else if (checkAllAliases(m[1], flags.nargs) !== false) {
        // nargs format = '--f=monkey washing cat'
        i = eatNargs(i, m[1], args, m[2])
      } else {
        setArg(m[1], m[2])
      }
    } else if (arg.match(negatedBoolean) && configuration['boolean-negation']) {
      key = arg.match(negatedBoolean)[1]
      setArg(key, checkAllAliases(key, flags.arrays) ? [false] : false)

    // -- separated by space.
    } else if (arg.match(/^--.+/) || (
      !configuration['short-option-groups'] && arg.match(/^-[^-]+/)
    )) {
      key = arg.match(/^--?(.+)/)[1]

      if (checkAllAliases(key, flags.arrays)) {
        // array format = '--foo a b c'
        i = eatArray(i, key, args)
      } else if (checkAllAliases(key, flags.nargs) !== false) {
        // nargs format = '--foo a b c'
        // should be truthy even if: flags.nargs[key] === 0
        i = eatNargs(i, key, args)
      } else {
        next = args[i + 1]

        if (next !== undefined && (!next.match(/^-/) ||
          next.match(negative)) &&
          !checkAllAliases(key, flags.bools) &&
          !checkAllAliases(key, flags.counts)) {
          setArg(key, next)
          i++
        } else if (/^(true|false)$/.test(next)) {
          setArg(key, next)
          i++
        } else {
          setArg(key, defaultValue(key))
        }
      }

    // dot-notation flag separated by '='.
    } else if (arg.match(/^-.\..+=/)) {
      m = arg.match(/^-([^=]+)=([\s\S]*)$/)
      setArg(m[1], m[2])

    // dot-notation flag separated by space.
    } else if (arg.match(/^-.\..+/) && !arg.match(negative)) {
      next = args[i + 1]
      key = arg.match(/^-(.\..+)/)[1]

      if (next !== undefined && !next.match(/^-/) &&
        !checkAllAliases(key, flags.bools) &&
        !checkAllAliases(key, flags.counts)) {
        setArg(key, next)
        i++
      } else {
        setArg(key, defaultValue(key))
      }
    } else if (arg.match(/^-[^-]+/) && !arg.match(negative)) {
      letters = arg.slice(1, -1).split('')
      broken = false

      for (let j = 0; j < letters.length; j++) {
        next = arg.slice(j + 2)

        if (letters[j + 1] && letters[j + 1] === '=') {
          value = arg.slice(j + 3)
          key = letters[j]

          if (checkAllAliases(key, flags.arrays)) {
            // array format = '-f=a b c'
            i = eatArray(i, key, args, value)
          } else if (checkAllAliases(key, flags.nargs) !== false) {
            // nargs format = '-f=monkey washing cat'
            i = eatNargs(i, key, args, value)
          } else {
            setArg(key, value)
          }

          broken = true
          break
        }

        if (next === '-') {
          setArg(letters[j], next)
          continue
        }

        // current letter is an alphabetic character and next value is a number
        if (/[A-Za-z]/.test(letters[j]) &&
          /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
          setArg(letters[j], next)
          broken = true
          break
        }

        if (letters[j + 1] && letters[j + 1].match(/\W/)) {
          setArg(letters[j], next)
          broken = true
          break
        } else {
          setArg(letters[j], defaultValue(letters[j]))
        }
      }

      key = arg.slice(-1)[0]

      if (!broken && key !== '-') {
        if (checkAllAliases(key, flags.arrays)) {
          // array format = '-f a b c'
          i = eatArray(i, key, args)
        } else if (checkAllAliases(key, flags.nargs) !== false) {
          // nargs format = '-f a b c'
          // should be truthy even if: flags.nargs[key] === 0
          i = eatNargs(i, key, args)
        } else {
          next = args[i + 1]

          if (next !== undefined && (!/^(-|--)[^-]/.test(next) ||
            next.match(negative)) &&
            !checkAllAliases(key, flags.bools) &&
            !checkAllAliases(key, flags.counts)) {
            setArg(key, next)
            i++
          } else if (/^(true|false)$/.test(next)) {
            setArg(key, next)
            i++
          } else {
            setArg(key, defaultValue(key))
          }
        }
      }
    } else if (arg.match(/^-[0-9]$/) &&
      arg.match(negative) &&
      checkAllAliases(arg.slice(1), flags.bools)) {
      // single-digit boolean alias, e.g: xargs -0
      key = arg.slice(1)
      setArg(key, defaultValue(key))
    } else if (arg === '--') {
      notFlags = args.slice(i + 1)
      break
    } else if (configuration['halt-at-non-option']) {
      notFlags = args.slice(i)
      break
    } else {
      argv._.push(maybeCoerceNumber('_', arg))
    }
  }

  // order of precedence:
  // 1. command line arg
  // 2. value from env var
  // 3. value from config file
  // 4. value from config objects
  // 5. configured default value
  applyEnvVars(argv, true) // special case: check env vars that point to config file
  applyEnvVars(argv, false)
  setConfig(argv)
  setConfigObjects()
  applyDefaultsAndAliases(argv, flags.aliases, defaults, true)
  applyCoercions(argv)
  if (configuration['set-placeholder-key']) setPlaceholderKeys(argv)

  // for any counts either not in args or without an explicit default, set to 0
  Object.keys(flags.counts).forEach(function (key) {
    if (!hasKey(argv, key.split('.'))) setArg(key, 0)
  })

  // '--' defaults to undefined.
  if (notFlagsOption && notFlags.length) argv[notFlagsArgv] = []
  notFlags.forEach(function (key) {
    argv[notFlagsArgv].push(key)
  })

  if (configuration['camel-case-expansion'] && configuration['strip-dashed']) {
    Object.keys(argv).filter(key => key !== '--' && key.includes('-')).forEach(key => {
      delete argv[key]
    })
  }

  if (configuration['strip-aliased']) {
    ;[].concat(...Object.keys(aliases).map(k => aliases[k])).forEach(alias => {
      if (configuration['camel-case-expansion']) {
        delete argv[alias.split('.').map(prop => camelCase(prop)).join('.')]
      }

      delete argv[alias]
    })
  }

  // how many arguments should we consume, based
  // on the nargs option?
  function eatNargs (i, key, args, argAfterEqualSign) {
    let ii
    let toEat = checkAllAliases(key, flags.nargs)
    // NaN has a special meaning for the array type, indicating that one or
    // more values are expected.
    toEat = isNaN(toEat) ? 1 : toEat

    if (toEat === 0) {
      if (!isUndefined(argAfterEqualSign)) {
        error = Error(__('Argument unexpected for: %s', key))
      }
      setArg(key, defaultValue(key))
      return i
    }

    let available = isUndefined(argAfterEqualSign) ? 0 : 1
    if (configuration['nargs-eats-options']) {
      // classic behavior, yargs eats positional and dash arguments.
      if (args.length - (i + 1) + available < toEat) {
        error = Error(__('Not enough arguments following: %s', key))
      }
      available = toEat
    } else {
      // nargs will not consume flag arguments, e.g., -abc, --foo,
      // and terminates when one is observed.
      for (ii = i + 1; ii < args.length; ii++) {
        if (!args[ii].match(/^-[^0-9]/) || args[ii].match(negative) || isUnknownOptionAsArg(args[ii])) available++
        else break
      }
      if (available < toEat) error = Error(__('Not enough arguments following: %s', key))
    }

    let consumed = Math.min(available, toEat)
    if (!isUndefined(argAfterEqualSign) && consumed > 0) {
      setArg(key, argAfterEqualSign)
      consumed--
    }
    for (ii = i + 1; ii < (consumed + i + 1); ii++) {
      setArg(key, args[ii])
    }

    return (i + consumed)
  }

  // if an option is an array, eat all non-hyphenated arguments
  // following it... YUM!
  // e.g., --foo apple banana cat becomes ["apple", "banana", "cat"]
  function eatArray (i, key, args, argAfterEqualSign) {
    let argsToSet = []
    let next = argAfterEqualSign || args[i + 1]
    // If both array and nargs are configured, enforce the nargs count:
    const nargsCount = checkAllAliases(key, flags.nargs)

    if (checkAllAliases(key, flags.bools) && !(/^(true|false)$/.test(next))) {
      argsToSet.push(true)
    } else if (isUndefined(next) ||
        (isUndefined(argAfterEqualSign) && /^-/.test(next) && !negative.test(next) && !isUnknownOptionAsArg(next))) {
      // for keys without value ==> argsToSet remains an empty []
      // set user default value, if available
      if (defaults[key] !== undefined) {
        const defVal = defaults[key]
        argsToSet = Array.isArray(defVal) ? defVal : [defVal]
      }
    } else {
      // value in --option=value is eaten as is
      if (!isUndefined(argAfterEqualSign)) {
        argsToSet.push(processValue(key, argAfterEqualSign))
      }
      for (let ii = i + 1; ii < args.length; ii++) {
        if ((!configuration['greedy-arrays'] && argsToSet.length > 0) ||
          (nargsCount && argsToSet.length >= nargsCount)) break
        next = args[ii]
        if (/^-/.test(next) && !negative.test(next) && !isUnknownOptionAsArg(next)) break
        i = ii
        argsToSet.push(processValue(key, next))
      }
    }

    // If both array and nargs are configured, create an error if less than
    // nargs positionals were found. NaN has special meaning, indicating
    // that at least one value is required (more are okay).
    if ((nargsCount && argsToSet.length < nargsCount) ||
        (isNaN(nargsCount) && argsToSet.length === 0)) {
      error = Error(__('Not enough arguments following: %s', key))
    }

    setArg(key, argsToSet)
    return i
  }

  function setArg (key, val) {
    if (/-/.test(key) && configuration['camel-case-expansion']) {
      const alias = key.split('.').map(function (prop) {
        return camelCase(prop)
      }).join('.')
      addNewAlias(key, alias)
    }

    const value = processValue(key, val)
    const splitKey = key.split('.')
    setKey(argv, splitKey, value)

    // handle populating aliases of the full key
    if (flags.aliases[key]) {
      flags.aliases[key].forEach(function (x) {
        x = x.split('.')
        setKey(argv, x, value)
      })
    }

    // handle populating aliases of the first element of the dot-notation key
    if (splitKey.length > 1 && configuration['dot-notation']) {
      ;(flags.aliases[splitKey[0]] || []).forEach(function (x) {
        x = x.split('.')

        // expand alias with nested objects in key
        const a = [].concat(splitKey)
        a.shift() // nuke the old key.
        x = x.concat(a)

        setKey(argv, x, value)
      })
    }

    // Set normalize getter and setter when key is in 'normalize' but isn't an array
    if (checkAllAliases(key, flags.normalize) && !checkAllAliases(key, flags.arrays)) {
      const keys = [key].concat(flags.aliases[key] || [])
      keys.forEach(function (key) {
        Object.defineProperty(argvReturn, key, {
          enumerable: true,
          get () {
            return val
          },
          set (value) {
            val = typeof value === 'string' ? path.normalize(value) : value
          }
        })
      })
    }
  }

  function addNewAlias (key, alias) {
    if (!(flags.aliases[key] && flags.aliases[key].length)) {
      flags.aliases[key] = [alias]
      newAliases[alias] = true
    }
    if (!(flags.aliases[alias] && flags.aliases[alias].length)) {
      addNewAlias(alias, key)
    }
  }

  function processValue (key, val) {
    // strings may be quoted, clean this up as we assign values.
    if (typeof val === 'string' &&
      (val[0] === "'" || val[0] === '"') &&
      val[val.length - 1] === val[0]
    ) {
      val = val.substring(1, val.length - 1)
    }

    // handle parsing boolean arguments --foo=true --bar false.
    if (checkAllAliases(key, flags.bools) || checkAllAliases(key, flags.counts)) {
      if (typeof val === 'string') val = val === 'true'
    }

    let value = Array.isArray(val)
      ? val.map(function (v) { return maybeCoerceNumber(key, v) })
      : maybeCoerceNumber(key, val)

    // increment a count given as arg (either no value or value parsed as boolean)
    if (checkAllAliases(key, flags.counts) && (isUndefined(value) || typeof value === 'boolean')) {
      value = increment
    }

    // Set normalized value when key is in 'normalize' and in 'arrays'
    if (checkAllAliases(key, flags.normalize) && checkAllAliases(key, flags.arrays)) {
      if (Array.isArray(val)) value = val.map(path.normalize)
      else value = path.normalize(val)
    }
    return value
  }

  function maybeCoerceNumber (key, value) {
    if (!checkAllAliases(key, flags.strings) && !checkAllAliases(key, flags.bools) && !Array.isArray(value)) {
      const shouldCoerceNumber = isNumber(value) && configuration['parse-numbers'] && (
        Number.isSafeInteger(Math.floor(value))
      )
      if (shouldCoerceNumber || (!isUndefined(value) && checkAllAliases(key, flags.numbers))) value = Number(value)
    }
    return value
  }

  // set args from config.json file, this should be
  // applied last so that defaults can be applied.
  function setConfig (argv) {
    const configLookup = Object.create(null)

    // expand defaults/aliases, in-case any happen to reference
    // the config.json file.
    applyDefaultsAndAliases(configLookup, flags.aliases, defaults)

    Object.keys(flags.configs).forEach(function (configKey) {
      const configPath = argv[configKey] || configLookup[configKey]
      if (configPath) {
        try {
          let config = null
          const resolvedConfigPath = path.resolve(process.cwd(), configPath)

          if (typeof flags.configs[configKey] === 'function') {
            try {
              config = flags.configs[configKey](resolvedConfigPath)
            } catch (e) {
              config = e
            }
            if (config instanceof Error) {
              error = config
              return
            }
          } else {
            config = require(resolvedConfigPath)
          }

          setConfigObject(config)
        } catch (ex) {
          if (argv[configKey]) error = Error(__('Invalid JSON config file: %s', configPath))
        }
      }
    })
  }

  // set args from config object.
  // it recursively checks nested objects.
  function setConfigObject (config, prev) {
    Object.keys(config).forEach(function (key) {
      const value = config[key]
      const fullKey = prev ? prev + '.' + key : key

      // if the value is an inner object and we have dot-notation
      // enabled, treat inner objects in config the same as
      // heavily nested dot notations (foo.bar.apple).
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && configuration['dot-notation']) {
        // if the value is an object but not an array, check nested object
        setConfigObject(value, fullKey)
      } else {
        // setting arguments via CLI takes precedence over
        // values within the config file.
        if (!hasKey(argv, fullKey.split('.')) || (checkAllAliases(fullKey, flags.arrays) && configuration['combine-arrays'])) {
          setArg(fullKey, value)
        }
      }
    })
  }

  // set all config objects passed in opts
  function setConfigObjects () {
    if (typeof configObjects === 'undefined') return
    configObjects.forEach(function (configObject) {
      setConfigObject(configObject)
    })
  }

  function applyEnvVars (argv, configOnly) {
    if (typeof envPrefix === 'undefined') return

    const prefix = typeof envPrefix === 'string' ? envPrefix : ''
    Object.keys(process.env).forEach(function (envVar) {
      if (prefix === '' || envVar.lastIndexOf(prefix, 0) === 0) {
        // get array of nested keys and convert them to camel case
        const keys = envVar.split('__').map(function (key, i) {
          if (i === 0) {
            key = key.substring(prefix.length)
          }
          return camelCase(key)
        })

        if (((configOnly && flags.configs[keys.join('.')]) || !configOnly) && !hasKey(argv, keys)) {
          setArg(keys.join('.'), process.env[envVar])
        }
      }
    })
  }

  function applyCoercions (argv) {
    let coerce
    const applied = new Set()
    Object.keys(argv).forEach(function (key) {
      if (!applied.has(key)) { // If we haven't already coerced this option via one of its aliases
        coerce = checkAllAliases(key, flags.coercions)
        if (typeof coerce === 'function') {
          try {
            const value = maybeCoerceNumber(key, coerce(argv[key]))
            ;([].concat(flags.aliases[key] || [], key)).forEach(ali => {
              applied.add(ali)
              argv[ali] = value
            })
          } catch (err) {
            error = err
          }
        }
      }
    })
  }

  function setPlaceholderKeys (argv) {
    flags.keys.forEach((key) => {
      // don't set placeholder keys for dot notation options 'foo.bar'.
      if (~key.indexOf('.')) return
      if (typeof argv[key] === 'undefined') argv[key] = undefined
    })
    return argv
  }

  function applyDefaultsAndAliases (obj, aliases, defaults, canLog = false) {
    Object.keys(defaults).forEach(function (key) {
      if (!hasKey(obj, key.split('.'))) {
        setKey(obj, key.split('.'), defaults[key])
        if (canLog) defaulted[key] = true

        ;(aliases[key] || []).forEach(function (x) {
          if (hasKey(obj, x.split('.'))) return
          setKey(obj, x.split('.'), defaults[key])
        })
      }
    })
  }

  function hasKey (obj, keys) {
    let o = obj

    if (!configuration['dot-notation']) keys = [keys.join('.')]

    keys.slice(0, -1).forEach(function (key) {
      o = (o[key] || {})
    })

    const key = keys[keys.length - 1]

    if (typeof o !== 'object') return false
    else return key in o
  }

  function setKey (obj, keys, value) {
    let o = obj

    if (!configuration['dot-notation']) keys = [keys.join('.')]

    keys.slice(0, -1).forEach(function (key, index) {
      // TODO(bcoe): in the next major version of yargs, switch to
      // Object.create(null) for dot notation:
      key = sanitizeKey(key)

      if (typeof o === 'object' && o[key] === undefined) {
        o[key] = {}
      }

      if (typeof o[key] !== 'object' || Array.isArray(o[key])) {
        // ensure that o[key] is an array, and that the last item is an empty object.
        if (Array.isArray(o[key])) {
          o[key].push({})
        } else {
          o[key] = [o[key], {}]
        }

        // we want to update the empty object at the end of the o[key] array, so set o to that object
        o = o[key][o[key].length - 1]
      } else {
        o = o[key]
      }
    })

    // TODO(bcoe): in the next major version of yargs, switch to
    // Object.create(null) for dot notation:
    const key = sanitizeKey(keys[keys.length - 1])

    const isTypeArray = checkAllAliases(keys.join('.'), flags.arrays)
    const isValueArray = Array.isArray(value)
    let duplicate = configuration['duplicate-arguments-array']

    // nargs has higher priority than duplicate
    if (!duplicate && checkAllAliases(key, flags.nargs)) {
      duplicate = true
      if ((!isUndefined(o[key]) && flags.nargs[key] === 1) || (Array.isArray(o[key]) && o[key].length === flags.nargs[key])) {
        o[key] = undefined
      }
    }

    if (value === increment) {
      o[key] = increment(o[key])
    } else if (Array.isArray(o[key])) {
      if (duplicate && isTypeArray && isValueArray) {
        o[key] = configuration['flatten-duplicate-arrays'] ? o[key].concat(value) : (Array.isArray(o[key][0]) ? o[key] : [o[key]]).concat([value])
      } else if (!duplicate && Boolean(isTypeArray) === Boolean(isValueArray)) {
        o[key] = value
      } else {
        o[key] = o[key].concat([value])
      }
    } else if (o[key] === undefined && isTypeArray) {
      o[key] = isValueArray ? value : [value]
    } else if (duplicate && !(
      o[key] === undefined ||
        checkAllAliases(key, flags.counts) ||
        checkAllAliases(key, flags.bools)
    )) {
      o[key] = [o[key], value]
    } else {
      o[key] = value
    }
  }

  // extend the aliases list with inferred aliases.
  function extendAliases (...args) {
    args.forEach(function (obj) {
      Object.keys(obj || {}).forEach(function (key) {
        // short-circuit if we've already added a key
        // to the aliases array, for example it might
        // exist in both 'opts.default' and 'opts.key'.
        if (flags.aliases[key]) return

        flags.aliases[key] = [].concat(aliases[key] || [])
        // For "--option-name", also set argv.optionName
        flags.aliases[key].concat(key).forEach(function (x) {
          if (/-/.test(x) && configuration['camel-case-expansion']) {
            const c = camelCase(x)
            if (c !== key && flags.aliases[key].indexOf(c) === -1) {
              flags.aliases[key].push(c)
              newAliases[c] = true
            }
          }
        })
        // For "--optionName", also set argv['option-name']
        flags.aliases[key].concat(key).forEach(function (x) {
          if (x.length > 1 && /[A-Z]/.test(x) && configuration['camel-case-expansion']) {
            const c = decamelize(x, '-')
            if (c !== key && flags.aliases[key].indexOf(c) === -1) {
              flags.aliases[key].push(c)
              newAliases[c] = true
            }
          }
        })
        flags.aliases[key].forEach(function (x) {
          flags.aliases[x] = [key].concat(flags.aliases[key].filter(function (y) {
            return x !== y
          }))
        })
      })
    })
  }

  // return the 1st set flag for any of a key's aliases (or false if no flag set)
  function checkAllAliases (key, flag) {
    const toCheck = [].concat(flags.aliases[key] || [], key)
    const keys = Object.keys(flag)
    const setAlias = toCheck.find(key => keys.includes(key))
    return setAlias ? flag[setAlias] : false
  }

  function hasAnyFlag (key) {
    const toCheck = [].concat(Object.keys(flags).map(k => flags[k]))
    return toCheck.some(function (flag) {
      return Array.isArray(flag) ? flag.includes(key) : flag[key]
    })
  }

  function hasFlagsMatching (arg, ...patterns) {
    const toCheck = [].concat(...patterns)
    return toCheck.some(function (pattern) {
      const match = arg.match(pattern)
      return match && hasAnyFlag(match[1])
    })
  }

  // based on a simplified version of the short flag group parsing logic
  function hasAllShortFlags (arg) {
    // if this is a negative number, or doesn't start with a single hyphen, it's not a short flag group
    if (arg.match(negative) || !arg.match(/^-[^-]+/)) { return false }
    let hasAllFlags = true
    let next
    const letters = arg.slice(1).split('')
    for (let j = 0; j < letters.length; j++) {
      next = arg.slice(j + 2)

      if (!hasAnyFlag(letters[j])) {
        hasAllFlags = false
        break
      }

      if ((letters[j + 1] && letters[j + 1] === '=') ||
        next === '-' ||
        (/[A-Za-z]/.test(letters[j]) && /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) ||
        (letters[j + 1] && letters[j + 1].match(/\W/))) {
        break
      }
    }
    return hasAllFlags
  }

  function isUnknownOptionAsArg (arg) {
    return configuration['unknown-options-as-args'] && isUnknownOption(arg)
  }

  function isUnknownOption (arg) {
    // ignore negative numbers
    if (arg.match(negative)) { return false }
    // if this is a short option group and all of them are configured, it isn't unknown
    if (hasAllShortFlags(arg)) { return false }
    // e.g. '--count=2'
    const flagWithEquals = /^-+([^=]+?)=[\s\S]*$/
    // e.g. '-a' or '--arg'
    const normalFlag = /^-+([^=]+?)$/
    // e.g. '-a-'
    const flagEndingInHyphen = /^-+([^=]+?)-$/
    // e.g. '-abc123'
    const flagEndingInDigits = /^-+([^=]+?\d+)$/
    // e.g. '-a/usr/local'
    const flagEndingInNonWordCharacters = /^-+([^=]+?)\W+.*$/
    // check the different types of flag styles, including negatedBoolean, a pattern defined near the start of the parse method
    return !hasFlagsMatching(arg, flagWithEquals, negatedBoolean, normalFlag, flagEndingInHyphen, flagEndingInDigits, flagEndingInNonWordCharacters)
  }

  // make a best effor to pick a default value
  // for an option based on name and type.
  function defaultValue (key) {
    if (!checkAllAliases(key, flags.bools) &&
        !checkAllAliases(key, flags.counts) &&
        `${key}` in defaults) {
      return defaults[key]
    } else {
      return defaultForType(guessType(key))
    }
  }

  // return a default value, given the type of a flag.,
  // e.g., key of type 'string' will default to '', rather than 'true'.
  function defaultForType (type) {
    const def = {
      boolean: true,
      string: '',
      number: undefined,
      array: []
    }

    return def[type]
  }

  // given a flag, enforce a default type.
  function guessType (key) {
    let type = 'boolean'
    if (checkAllAliases(key, flags.strings)) type = 'string'
    else if (checkAllAliases(key, flags.numbers)) type = 'number'
    else if (checkAllAliases(key, flags.bools)) type = 'boolean'
    else if (checkAllAliases(key, flags.arrays)) type = 'array'
    return type
  }

  function isNumber (x) {
    if (x === null || x === undefined) return false
    // if loaded from config, may already be a number.
    if (typeof x === 'number') return true
    // hexadecimal.
    if (/^0x[0-9a-f]+$/i.test(x)) return true
    // don't treat 0123 as a number; as it drops the leading '0'.
    if (x.length > 1 && x[0] === '0') return false
    return /^[-]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x)
  }

  function isUndefined (num) {
    return num === undefined
  }

  // check user configuration settings for inconsistencies
  function checkConfiguration () {
    // count keys should not be set as array/narg
    Object.keys(flags.counts).find(key => {
      if (checkAllAliases(key, flags.arrays)) {
        error = Error(__('Invalid configuration: %s, opts.count excludes opts.array.', key))
        return true
      } else if (checkAllAliases(key, flags.nargs)) {
        error = Error(__('Invalid configuration: %s, opts.count excludes opts.narg.', key))
        return true
      }
    })
  }

  return {
    argv: Object.assign(argvReturn, argv),
    error: error,
    aliases: Object.assign({}, flags.aliases),
    newAliases: Object.assign({}, newAliases),
    defaulted: Object.assign({}, defaulted),
    configuration: configuration
  }
}

// if any aliases reference each other, we should
// merge them together.
function combineAliases (aliases) {
  const aliasArrays = []
  const combined = Object.create(null)
  let change = true

  // turn alias lookup hash {key: ['alias1', 'alias2']} into
  // a simple array ['key', 'alias1', 'alias2']
  Object.keys(aliases).forEach(function (key) {
    aliasArrays.push(
      [].concat(aliases[key], key)
    )
  })

  // combine arrays until zero changes are
  // made in an iteration.
  while (change) {
    change = false
    for (let i = 0; i < aliasArrays.length; i++) {
      for (let ii = i + 1; ii < aliasArrays.length; ii++) {
        const intersect = aliasArrays[i].filter(function (v) {
          return aliasArrays[ii].indexOf(v) !== -1
        })

        if (intersect.length) {
          aliasArrays[i] = aliasArrays[i].concat(aliasArrays[ii])
          aliasArrays.splice(ii, 1)
          change = true
          break
        }
      }
    }
  }

  // map arrays back to the hash-lookup (de-dupe while
  // we're at it).
  aliasArrays.forEach(function (aliasArray) {
    aliasArray = aliasArray.filter(function (v, i, self) {
      return self.indexOf(v) === i
    })
    combined[aliasArray.pop()] = aliasArray
  })

  return combined
}

// this function should only be called when a count is given as an arg
// it is NOT called to set a default value
// thus we can start the count at 1 instead of 0
function increment (orig) {
  return orig !== undefined ? orig + 1 : 1
}

function Parser (args, opts) {
  const result = parse(args.slice(), opts)
  return result.argv
}

// parse arguments and return detailed
// meta information, aliases, etc.
Parser.detailed = function (args, opts) {
  return parse(args.slice(), opts)
}

// TODO(bcoe): in the next major version of yargs, switch to
// Object.create(null) for dot notation:
function sanitizeKey (key) {
  if (key === '__proto__') return '___proto___'
  return key
}

module.exports = Parser

},{"./lib/tokenize-arg-string":128,"camelcase":38,"decamelize":39,"path":undefined,"util":undefined}],128:[function(require,module,exports){
// take an un-split argv string and tokenize it.
module.exports = function (argString) {
  if (Array.isArray(argString)) {
    return argString.map(e => typeof e !== 'string' ? e + '' : e)
  }

  argString = argString.trim()

  let i = 0
  let prevC = null
  let c = null
  let opening = null
  const args = []

  for (let ii = 0; ii < argString.length; ii++) {
    prevC = c
    c = argString.charAt(ii)

    // split on spaces unless we're in quotes.
    if (c === ' ' && !opening) {
      if (!(prevC === ' ')) {
        i++
      }
      continue
    }

    // don't split the string if we're in matching
    // opening or closing single and double quotes.
    if (c === opening) {
      opening = null
    } else if ((c === "'" || c === '"') && !opening) {
      opening = c
    }

    if (!args[i]) args[i] = ''
    args[i] += c
  }

  return args
}

},{}],129:[function(require,module,exports){
(function (__dirname){
'use strict'

// an async function fails early in Node.js versions prior to 8.
async function requiresNode8OrGreater () {}
requiresNode8OrGreater()

const argsert = require('./lib/argsert')
const fs = require('fs')
const Command = require('./lib/command')
const Completion = require('./lib/completion')
const Parser = require('yargs-parser')
const path = require('path')
const Usage = require('./lib/usage')
const Validation = require('./lib/validation')
const Y18n = require('y18n')
const objFilter = require('./lib/obj-filter')
const setBlocking = require('set-blocking')
const applyExtends = require('./lib/apply-extends')
const { globalMiddlewareFactory } = require('./lib/middleware')
const YError = require('./lib/yerror')
const processArgv = require('./lib/process-argv')

exports = module.exports = Yargs
function Yargs (processArgs, cwd, parentRequire) {
  processArgs = processArgs || [] // handle calling yargs().

  const self = {}
  let command = null
  let completion = null
  let groups = {}
  const globalMiddleware = []
  let output = ''
  const preservedGroups = {}
  let usage = null
  let validation = null
  let handlerFinishCommand = null

  const y18n = Y18n({
    directory: path.resolve(__dirname, './locales'),
    updateFiles: false
  })

  self.middleware = globalMiddlewareFactory(globalMiddleware, self)

  if (!cwd) cwd = process.cwd()

  self.scriptName = function (scriptName) {
    self.customScriptName = true
    self.$0 = scriptName
    return self
  }

  // ignore the node bin, specify this in your
  // bin file with #!/usr/bin/env node
  if (/\b(node|iojs|electron)(\.exe)?$/.test(process.argv[0])) {
    self.$0 = process.argv.slice(1, 2)
  } else {
    self.$0 = process.argv.slice(0, 1)
  }

  self.$0 = self.$0
    .map((x, i) => {
      const b = rebase(cwd, x)
      return x.match(/^(\/|([a-zA-Z]:)?\\)/) && b.length < x.length ? b : x
    })
    .join(' ').trim()

  if (process.env._ !== undefined && processArgv.getProcessArgvBin() === process.env._) {
    self.$0 = process.env._.replace(
      `${path.dirname(process.execPath)}/`, ''
    )
  }

  // use context object to keep track of resets, subcommand execution, etc
  // submodules should modify and check the state of context as necessary
  const context = { resets: -1, commands: [], fullCommands: [], files: [] }
  self.getContext = () => context

  // puts yargs back into an initial state. any keys
  // that have been set to "global" will not be reset
  // by this action.
  let options
  self.resetOptions = self.reset = function resetOptions (aliases) {
    context.resets++
    aliases = aliases || {}
    options = options || {}
    // put yargs back into an initial state, this
    // logic is used to build a nested command
    // hierarchy.
    const tmpOptions = {}
    tmpOptions.local = options.local ? options.local : []
    tmpOptions.configObjects = options.configObjects ? options.configObjects : []

    // if a key has been explicitly set as local,
    // we should reset it before passing options to command.
    const localLookup = {}
    tmpOptions.local.forEach((l) => {
      localLookup[l] = true
      ;(aliases[l] || []).forEach((a) => {
        localLookup[a] = true
      })
    })

    // add all groups not set to local to preserved groups
    Object.assign(
      preservedGroups,
      Object.keys(groups).reduce((acc, groupName) => {
        const keys = groups[groupName].filter(key => !(key in localLookup))
        if (keys.length > 0) {
          acc[groupName] = keys
        }
        return acc
      }, {})
    )
    // groups can now be reset
    groups = {}

    const arrayOptions = [
      'array', 'boolean', 'string', 'skipValidation',
      'count', 'normalize', 'number',
      'hiddenOptions'
    ]

    const objectOptions = [
      'narg', 'key', 'alias', 'default', 'defaultDescription',
      'config', 'choices', 'demandedOptions', 'demandedCommands', 'coerce',
      'deprecatedOptions'
    ]

    arrayOptions.forEach((k) => {
      tmpOptions[k] = (options[k] || []).filter(k => !localLookup[k])
    })

    objectOptions.forEach((k) => {
      tmpOptions[k] = objFilter(options[k], (k, v) => !localLookup[k])
    })

    tmpOptions.envPrefix = options.envPrefix
    options = tmpOptions

    // if this is the first time being executed, create
    // instances of all our helpers -- otherwise just reset.
    usage = usage ? usage.reset(localLookup) : Usage(self, y18n)
    validation = validation ? validation.reset(localLookup) : Validation(self, usage, y18n)
    command = command ? command.reset() : Command(self, usage, validation, globalMiddleware)
    if (!completion) completion = Completion(self, usage, command)

    completionCommand = null
    output = ''
    exitError = null
    hasOutput = false
    self.parsed = false

    return self
  }
  self.resetOptions()

  // temporary hack: allow "freezing" of reset-able state for parse(msg, cb)
  const frozens = []
  function freeze () {
    const frozen = {}
    frozens.push(frozen)
    frozen.options = options
    frozen.configObjects = options.configObjects.slice(0)
    frozen.exitProcess = exitProcess
    frozen.groups = groups
    usage.freeze()
    validation.freeze()
    command.freeze()
    frozen.strict = strict
    frozen.strictCommands = strictCommands
    frozen.completionCommand = completionCommand
    frozen.output = output
    frozen.exitError = exitError
    frozen.hasOutput = hasOutput
    frozen.parsed = self.parsed
    frozen.parseFn = parseFn
    frozen.parseContext = parseContext
    frozen.handlerFinishCommand = handlerFinishCommand
  }
  function unfreeze () {
    const frozen = frozens.pop()
    options = frozen.options
    options.configObjects = frozen.configObjects
    exitProcess = frozen.exitProcess
    groups = frozen.groups
    output = frozen.output
    exitError = frozen.exitError
    hasOutput = frozen.hasOutput
    self.parsed = frozen.parsed
    usage.unfreeze()
    validation.unfreeze()
    command.unfreeze()
    strict = frozen.strict
    strictCommands = frozen.strictCommands
    completionCommand = frozen.completionCommand
    parseFn = frozen.parseFn
    parseContext = frozen.parseContext
    handlerFinishCommand = frozen.handlerFinishCommand
  }

  self.boolean = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('boolean', keys)
    return self
  }

  self.array = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('array', keys)
    return self
  }

  self.number = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('number', keys)
    return self
  }

  self.normalize = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('normalize', keys)
    return self
  }

  self.count = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('count', keys)
    return self
  }

  self.string = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('string', keys)
    return self
  }

  self.requiresArg = function (keys, value) {
    argsert('<array|string|object> [number]', [keys], arguments.length)
    // If someone configures nargs at the same time as requiresArg,
    // nargs should take precedent,
    // see: https://github.com/yargs/yargs/pull/1572
    // TODO: make this work with aliases, using a check similar to
    // checkAllAliases() in yargs-parser.
    if (typeof keys === 'string' && options.narg[keys]) {
      return self
    } else {
      populateParserHintObject(self.requiresArg, false, 'narg', keys, NaN)
    }
    return self
  }

  self.skipValidation = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('skipValidation', keys)
    return self
  }

  function populateParserHintArray (type, keys, value) {
    keys = [].concat(keys)
    keys.forEach((key) => {
      key = sanitizeKey(key)
      options[type].push(key)
    })
  }

  self.nargs = function (key, value) {
    argsert('<string|object|array> [number]', [key, value], arguments.length)
    populateParserHintObject(self.nargs, false, 'narg', key, value)
    return self
  }

  self.choices = function (key, value) {
    argsert('<object|string|array> [string|array]', [key, value], arguments.length)
    populateParserHintObject(self.choices, true, 'choices', key, value)
    return self
  }

  self.alias = function (key, value) {
    argsert('<object|string|array> [string|array]', [key, value], arguments.length)
    populateParserHintObject(self.alias, true, 'alias', key, value)
    return self
  }

  // TODO: actually deprecate self.defaults.
  self.default = self.defaults = function (key, value, defaultDescription) {
    argsert('<object|string|array> [*] [string]', [key, value, defaultDescription], arguments.length)
    if (defaultDescription) options.defaultDescription[key] = defaultDescription
    if (typeof value === 'function') {
      if (!options.defaultDescription[key]) options.defaultDescription[key] = usage.functionDescription(value)
      value = value.call()
    }
    populateParserHintObject(self.default, false, 'default', key, value)
    return self
  }

  self.describe = function (key, desc) {
    argsert('<object|string|array> [string]', [key, desc], arguments.length)
    populateParserHintObject(self.describe, false, 'key', key, true)
    usage.describe(key, desc)
    return self
  }

  self.demandOption = function (keys, msg) {
    argsert('<object|string|array> [string]', [keys, msg], arguments.length)
    populateParserHintObject(self.demandOption, false, 'demandedOptions', keys, msg)
    return self
  }

  self.coerce = function (keys, value) {
    argsert('<object|string|array> [function]', [keys, value], arguments.length)
    populateParserHintObject(self.coerce, false, 'coerce', keys, value)
    return self
  }

  function populateParserHintObject (builder, isArray, type, key, value) {
    if (Array.isArray(key)) {
      const temp = Object.create(null)
      // an array of keys with one value ['x', 'y', 'z'], function parse () {}
      key.forEach((k) => {
        temp[k] = value
      })
      builder(temp)
    } else if (typeof key === 'object') {
      // an object of key value pairs: {'x': parse () {}, 'y': parse() {}}
      Object.keys(key).forEach((k) => {
        builder(k, key[k])
      })
    } else {
      key = sanitizeKey(key)
      // a single key value pair 'x', parse() {}
      if (isArray) {
        options[type][key] = (options[type][key] || []).concat(value)
      } else {
        options[type][key] = value
      }
    }
  }

  // TODO(bcoe): in future major versions move more objects towards
  // Object.create(null):
  function sanitizeKey (key) {
    if (key === '__proto__') return '___proto___'
    return key
  }

  function deleteFromParserHintObject (optionKey) {
    // delete from all parsing hints:
    // boolean, array, key, alias, etc.
    Object.keys(options).forEach((hintKey) => {
      const hint = options[hintKey]
      if (Array.isArray(hint)) {
        if (~hint.indexOf(optionKey)) hint.splice(hint.indexOf(optionKey), 1)
      } else if (typeof hint === 'object') {
        delete hint[optionKey]
      }
    })
    // now delete the description from usage.js.
    delete usage.getDescriptions()[optionKey]
  }

  self.config = function config (key, msg, parseFn) {
    argsert('[object|string] [string|function] [function]', [key, msg, parseFn], arguments.length)
    // allow a config object to be provided directly.
    if (typeof key === 'object') {
      key = applyExtends(key, cwd, self.getParserConfiguration()['deep-merge-config'])
      options.configObjects = (options.configObjects || []).concat(key)
      return self
    }

    // allow for a custom parsing function.
    if (typeof msg === 'function') {
      parseFn = msg
      msg = null
    }

    key = key || 'config'
    self.describe(key, msg || usage.deferY18nLookup('Path to JSON config file'))
    ;(Array.isArray(key) ? key : [key]).forEach((k) => {
      options.config[k] = parseFn || true
    })

    return self
  }

  self.example = function (cmd, description) {
    argsert('<string> [string]', [cmd, description], arguments.length)
    usage.example(cmd, description)
    return self
  }

  self.command = function (cmd, description, builder, handler, middlewares) {
    argsert('<string|array|object> [string|boolean] [function|object] [function] [array]', [cmd, description, builder, handler, middlewares], arguments.length)
    command.addHandler(cmd, description, builder, handler, middlewares)
    return self
  }

  self.commandDir = function (dir, opts) {
    argsert('<string> [object]', [dir, opts], arguments.length)
    const req = parentRequire || require
    command.addDirectory(dir, self.getContext(), req, require('get-caller-file')(), opts)
    return self
  }

  // TODO: deprecate self.demand in favor of
  // .demandCommand() .demandOption().
  self.demand = self.required = self.require = function demand (keys, max, msg) {
    // you can optionally provide a 'max' key,
    // which will raise an exception if too many '_'
    // options are provided.
    if (Array.isArray(max)) {
      max.forEach((key) => {
        self.demandOption(key, msg)
      })
      max = Infinity
    } else if (typeof max !== 'number') {
      msg = max
      max = Infinity
    }

    if (typeof keys === 'number') {
      self.demandCommand(keys, max, msg, msg)
    } else if (Array.isArray(keys)) {
      keys.forEach((key) => {
        self.demandOption(key, msg)
      })
    } else {
      if (typeof msg === 'string') {
        self.demandOption(keys, msg)
      } else if (msg === true || typeof msg === 'undefined') {
        self.demandOption(keys)
      }
    }

    return self
  }

  self.demandCommand = function demandCommand (min, max, minMsg, maxMsg) {
    argsert('[number] [number|string] [string|null|undefined] [string|null|undefined]', [min, max, minMsg, maxMsg], arguments.length)

    if (typeof min === 'undefined') min = 1

    if (typeof max !== 'number') {
      minMsg = max
      max = Infinity
    }

    self.global('_', false)

    options.demandedCommands._ = {
      min,
      max,
      minMsg,
      maxMsg
    }

    return self
  }

  self.getDemandedOptions = () => {
    argsert([], 0)
    return options.demandedOptions
  }

  self.getDemandedCommands = () => {
    argsert([], 0)
    return options.demandedCommands
  }

  self.deprecateOption = function deprecateOption (option, message) {
    argsert('<string> [string|boolean]', [option, message], arguments.length)
    options.deprecatedOptions[option] = message
    return self
  }

  self.getDeprecatedOptions = () => {
    argsert([], 0)
    return options.deprecatedOptions
  }

  self.implies = function (key, value) {
    argsert('<string|object> [number|string|array]', [key, value], arguments.length)
    validation.implies(key, value)
    return self
  }

  self.conflicts = function (key1, key2) {
    argsert('<string|object> [string|array]', [key1, key2], arguments.length)
    validation.conflicts(key1, key2)
    return self
  }

  self.usage = function (msg, description, builder, handler) {
    argsert('<string|null|undefined> [string|boolean] [function|object] [function]', [msg, description, builder, handler], arguments.length)

    if (description !== undefined) {
      // .usage() can be used as an alias for defining
      // a default command.
      if ((msg || '').match(/^\$0( |$)/)) {
        return self.command(msg, description, builder, handler)
      } else {
        throw new YError('.usage() description must start with $0 if being used as alias for .command()')
      }
    } else {
      usage.usage(msg)
      return self
    }
  }

  self.epilogue = self.epilog = function (msg) {
    argsert('<string>', [msg], arguments.length)
    usage.epilog(msg)
    return self
  }

  self.fail = function (f) {
    argsert('<function>', [f], arguments.length)
    usage.failFn(f)
    return self
  }

  self.onFinishCommand = function (f) {
    argsert('<function>', [f], arguments.length)
    handlerFinishCommand = f
    return self
  }

  self.getHandlerFinishCommand = () => handlerFinishCommand

  self.check = function (f, _global) {
    argsert('<function> [boolean]', [f, _global], arguments.length)
    validation.check(f, _global !== false)
    return self
  }

  self.global = function global (globals, global) {
    argsert('<string|array> [boolean]', [globals, global], arguments.length)
    globals = [].concat(globals)
    if (global !== false) {
      options.local = options.local.filter(l => globals.indexOf(l) === -1)
    } else {
      globals.forEach((g) => {
        if (options.local.indexOf(g) === -1) options.local.push(g)
      })
    }
    return self
  }

  self.pkgConf = function pkgConf (key, rootPath) {
    argsert('<string> [string]', [key, rootPath], arguments.length)
    let conf = null
    // prefer cwd to require-main-filename in this method
    // since we're looking for e.g. "nyc" config in nyc consumer
    // rather than "yargs" config in nyc (where nyc is the main filename)
    const obj = pkgUp(rootPath || cwd)

    // If an object exists in the key, add it to options.configObjects
    if (obj[key] && typeof obj[key] === 'object') {
      conf = applyExtends(obj[key], rootPath || cwd, self.getParserConfiguration()['deep-merge-config'])
      options.configObjects = (options.configObjects || []).concat(conf)
    }

    return self
  }

  const pkgs = {}
  function pkgUp (rootPath) {
    const npath = rootPath || '*'
    if (pkgs[npath]) return pkgs[npath]
    const findUp = require('find-up')

    let obj = {}
    try {
      let startDir = rootPath || require('require-main-filename')(parentRequire || require)

      // When called in an environment that lacks require.main.filename, such as a jest test runner,
      // startDir is already process.cwd(), and should not be shortened.
      // Whether or not it is _actually_ a directory (e.g., extensionless bin) is irrelevant, find-up handles it.
      if (!rootPath && path.extname(startDir)) {
        startDir = path.dirname(startDir)
      }

      const pkgJsonPath = findUp.sync('package.json', {
        cwd: startDir
      })
      obj = JSON.parse(fs.readFileSync(pkgJsonPath))
    } catch (noop) {}

    pkgs[npath] = obj || {}
    return pkgs[npath]
  }

  let parseFn = null
  let parseContext = null
  self.parse = function parse (args, shortCircuit, _parseFn) {
    argsert('[string|array] [function|boolean|object] [function]', [args, shortCircuit, _parseFn], arguments.length)
    freeze()
    if (typeof args === 'undefined') {
      const argv = self._parseArgs(processArgs)
      const tmpParsed = self.parsed
      unfreeze()
      // TODO: remove this compatibility hack when we release yargs@15.x:
      self.parsed = tmpParsed
      return argv
    }

    // a context object can optionally be provided, this allows
    // additional information to be passed to a command handler.
    if (typeof shortCircuit === 'object') {
      parseContext = shortCircuit
      shortCircuit = _parseFn
    }

    // by providing a function as a second argument to
    // parse you can capture output that would otherwise
    // default to printing to stdout/stderr.
    if (typeof shortCircuit === 'function') {
      parseFn = shortCircuit
      shortCircuit = null
    }
    // completion short-circuits the parsing process,
    // skipping validation, etc.
    if (!shortCircuit) processArgs = args

    if (parseFn) exitProcess = false

    const parsed = self._parseArgs(args, shortCircuit)
    completion.setParsed(self.parsed)
    if (parseFn) parseFn(exitError, parsed, output)
    unfreeze()

    return parsed
  }

  self._getParseContext = () => parseContext || {}

  self._hasParseCallback = () => !!parseFn

  self.option = self.options = function option (key, opt) {
    argsert('<string|object> [object]', [key, opt], arguments.length)
    if (typeof key === 'object') {
      Object.keys(key).forEach((k) => {
        self.options(k, key[k])
      })
    } else {
      if (typeof opt !== 'object') {
        opt = {}
      }

      options.key[key] = true // track manually set keys.

      if (opt.alias) self.alias(key, opt.alias)

      const deprecate = opt.deprecate || opt.deprecated

      if (deprecate) {
        self.deprecateOption(key, deprecate)
      }

      const demand = opt.demand || opt.required || opt.require

      // A required option can be specified via "demand: true".
      if (demand) {
        self.demand(key, demand)
      }

      if (opt.demandOption) {
        self.demandOption(key, typeof opt.demandOption === 'string' ? opt.demandOption : undefined)
      }

      if ('conflicts' in opt) {
        self.conflicts(key, opt.conflicts)
      }

      if ('default' in opt) {
        self.default(key, opt.default)
      }

      if ('implies' in opt) {
        self.implies(key, opt.implies)
      }

      if ('nargs' in opt) {
        self.nargs(key, opt.nargs)
      }

      if (opt.config) {
        self.config(key, opt.configParser)
      }

      if (opt.normalize) {
        self.normalize(key)
      }

      if ('choices' in opt) {
        self.choices(key, opt.choices)
      }

      if ('coerce' in opt) {
        self.coerce(key, opt.coerce)
      }

      if ('group' in opt) {
        self.group(key, opt.group)
      }

      if (opt.boolean || opt.type === 'boolean') {
        self.boolean(key)
        if (opt.alias) self.boolean(opt.alias)
      }

      if (opt.array || opt.type === 'array') {
        self.array(key)
        if (opt.alias) self.array(opt.alias)
      }

      if (opt.number || opt.type === 'number') {
        self.number(key)
        if (opt.alias) self.number(opt.alias)
      }

      if (opt.string || opt.type === 'string') {
        self.string(key)
        if (opt.alias) self.string(opt.alias)
      }

      if (opt.count || opt.type === 'count') {
        self.count(key)
      }

      if (typeof opt.global === 'boolean') {
        self.global(key, opt.global)
      }

      if (opt.defaultDescription) {
        options.defaultDescription[key] = opt.defaultDescription
      }

      if (opt.skipValidation) {
        self.skipValidation(key)
      }

      const desc = opt.describe || opt.description || opt.desc
      self.describe(key, desc)
      if (opt.hidden) {
        self.hide(key)
      }

      if (opt.requiresArg) {
        self.requiresArg(key)
      }
    }

    return self
  }
  self.getOptions = () => options

  self.positional = function (key, opts) {
    argsert('<string> <object>', [key, opts], arguments.length)
    if (context.resets === 0) {
      throw new YError(".positional() can only be called in a command's builder function")
    }

    // .positional() only supports a subset of the configuration
    // options available to .option().
    const supportedOpts = ['default', 'defaultDescription', 'implies', 'normalize',
      'choices', 'conflicts', 'coerce', 'type', 'describe',
      'desc', 'description', 'alias']
    opts = objFilter(opts, (k, v) => {
      let accept = supportedOpts.indexOf(k) !== -1
      // type can be one of string|number|boolean.
      if (k === 'type' && ['string', 'number', 'boolean'].indexOf(v) === -1) accept = false
      return accept
    })

    // copy over any settings that can be inferred from the command string.
    const fullCommand = context.fullCommands[context.fullCommands.length - 1]
    const parseOptions = fullCommand ? command.cmdToParseOptions(fullCommand) : {
      array: [],
      alias: {},
      default: {},
      demand: {}
    }
    Object.keys(parseOptions).forEach((pk) => {
      if (Array.isArray(parseOptions[pk])) {
        if (parseOptions[pk].indexOf(key) !== -1) opts[pk] = true
      } else {
        if (parseOptions[pk][key] && !(pk in opts)) opts[pk] = parseOptions[pk][key]
      }
    })
    self.group(key, usage.getPositionalGroupName())
    return self.option(key, opts)
  }

  self.group = function group (opts, groupName) {
    argsert('<string|array> <string>', [opts, groupName], arguments.length)
    const existing = preservedGroups[groupName] || groups[groupName]
    if (preservedGroups[groupName]) {
      // we now only need to track this group name in groups.
      delete preservedGroups[groupName]
    }

    const seen = {}
    groups[groupName] = (existing || []).concat(opts).filter((key) => {
      if (seen[key]) return false
      return (seen[key] = true)
    })
    return self
  }
  // combine explicit and preserved groups. explicit groups should be first
  self.getGroups = () => Object.assign({}, groups, preservedGroups)

  // as long as options.envPrefix is not undefined,
  // parser will apply env vars matching prefix to argv
  self.env = function (prefix) {
    argsert('[string|boolean]', [prefix], arguments.length)
    if (prefix === false) options.envPrefix = undefined
    else options.envPrefix = prefix || ''
    return self
  }

  self.wrap = function (cols) {
    argsert('<number|null|undefined>', [cols], arguments.length)
    usage.wrap(cols)
    return self
  }

  let strict = false
  self.strict = function (enabled) {
    argsert('[boolean]', [enabled], arguments.length)
    strict = enabled !== false
    return self
  }
  self.getStrict = () => strict

  let strictCommands = false
  self.strictCommands = function (enabled) {
    argsert('[boolean]', [enabled], arguments.length)
    strictCommands = enabled !== false
    return self
  }
  self.getStrictCommands = () => strictCommands

  let parserConfig = {}
  self.parserConfiguration = function parserConfiguration (config) {
    argsert('<object>', [config], arguments.length)
    parserConfig = config
    return self
  }
  self.getParserConfiguration = () => parserConfig

  self.showHelp = function (level) {
    argsert('[string|function]', [level], arguments.length)
    if (!self.parsed) self._parseArgs(processArgs) // run parser, if it has not already been executed.
    if (command.hasDefaultCommand()) {
      context.resets++ // override the restriction on top-level positoinals.
      command.runDefaultBuilderOn(self, true)
    }
    usage.showHelp(level)
    return self
  }

  let versionOpt = null
  self.version = function version (opt, msg, ver) {
    const defaultVersionOpt = 'version'
    argsert('[boolean|string] [string] [string]', [opt, msg, ver], arguments.length)

    // nuke the key previously configured
    // to return version #.
    if (versionOpt) {
      deleteFromParserHintObject(versionOpt)
      usage.version(undefined)
      versionOpt = null
    }

    if (arguments.length === 0) {
      ver = guessVersion()
      opt = defaultVersionOpt
    } else if (arguments.length === 1) {
      if (opt === false) { // disable default 'version' key.
        return self
      }
      ver = opt
      opt = defaultVersionOpt
    } else if (arguments.length === 2) {
      ver = msg
      msg = null
    }

    versionOpt = typeof opt === 'string' ? opt : defaultVersionOpt
    msg = msg || usage.deferY18nLookup('Show version number')

    usage.version(ver || undefined)
    self.boolean(versionOpt)
    self.describe(versionOpt, msg)
    return self
  }

  function guessVersion () {
    const obj = pkgUp()

    return obj.version || 'unknown'
  }

  let helpOpt = null
  self.addHelpOpt = self.help = function addHelpOpt (opt, msg) {
    const defaultHelpOpt = 'help'
    argsert('[string|boolean] [string]', [opt, msg], arguments.length)

    // nuke the key previously configured
    // to return help.
    if (helpOpt) {
      deleteFromParserHintObject(helpOpt)
      helpOpt = null
    }

    if (arguments.length === 1) {
      if (opt === false) return self
    }

    // use arguments, fallback to defaults for opt and msg
    helpOpt = typeof opt === 'string' ? opt : defaultHelpOpt
    self.boolean(helpOpt)
    self.describe(helpOpt, msg || usage.deferY18nLookup('Show help'))
    return self
  }

  const defaultShowHiddenOpt = 'show-hidden'
  options.showHiddenOpt = defaultShowHiddenOpt
  self.addShowHiddenOpt = self.showHidden = function addShowHiddenOpt (opt, msg) {
    argsert('[string|boolean] [string]', [opt, msg], arguments.length)

    if (arguments.length === 1) {
      if (opt === false) return self
    }

    const showHiddenOpt = typeof opt === 'string' ? opt : defaultShowHiddenOpt
    self.boolean(showHiddenOpt)
    self.describe(showHiddenOpt, msg || usage.deferY18nLookup('Show hidden options'))
    options.showHiddenOpt = showHiddenOpt
    return self
  }

  self.hide = function hide (key) {
    argsert('<string|object>', [key], arguments.length)
    options.hiddenOptions.push(key)
    return self
  }

  self.showHelpOnFail = function showHelpOnFail (enabled, message) {
    argsert('[boolean|string] [string]', [enabled, message], arguments.length)
    usage.showHelpOnFail(enabled, message)
    return self
  }

  var exitProcess = true
  self.exitProcess = function (enabled) {
    argsert('[boolean]', [enabled], arguments.length)
    if (typeof enabled !== 'boolean') {
      enabled = true
    }
    exitProcess = enabled
    return self
  }
  self.getExitProcess = () => exitProcess

  var completionCommand = null
  self.completion = function (cmd, desc, fn) {
    argsert('[string] [string|boolean|function] [function]', [cmd, desc, fn], arguments.length)

    // a function to execute when generating
    // completions can be provided as the second
    // or third argument to completion.
    if (typeof desc === 'function') {
      fn = desc
      desc = null
    }

    // register the completion command.
    completionCommand = cmd || completionCommand || 'completion'
    if (!desc && desc !== false) {
      desc = 'generate completion script'
    }
    self.command(completionCommand, desc)

    // a function can be provided
    if (fn) completion.registerFunction(fn)

    return self
  }

  self.showCompletionScript = function ($0, cmd) {
    argsert('[string] [string]', [$0, cmd], arguments.length)
    $0 = $0 || self.$0
    _logger.log(completion.generateCompletionScript($0, cmd || completionCommand || 'completion'))
    return self
  }

  self.getCompletion = function (args, done) {
    argsert('<array> <function>', [args, done], arguments.length)
    completion.getCompletion(args, done)
  }

  self.locale = function (locale) {
    argsert('[string]', [locale], arguments.length)
    if (arguments.length === 0) {
      guessLocale()
      return y18n.getLocale()
    }
    detectLocale = false
    y18n.setLocale(locale)
    return self
  }

  self.updateStrings = self.updateLocale = function (obj) {
    argsert('<object>', [obj], arguments.length)
    detectLocale = false
    y18n.updateLocale(obj)
    return self
  }

  let detectLocale = true
  self.detectLocale = function (detect) {
    argsert('<boolean>', [detect], arguments.length)
    detectLocale = detect
    return self
  }
  self.getDetectLocale = () => detectLocale

  var hasOutput = false
  var exitError = null
  // maybe exit, always capture
  // context about why we wanted to exit.
  self.exit = (code, err) => {
    hasOutput = true
    exitError = err
    if (exitProcess) process.exit(code)
  }

  // we use a custom logger that buffers output,
  // so that we can print to non-CLIs, e.g., chat-bots.
  const _logger = {
    log () {
      const args = []
      for (let i = 0; i < arguments.length; i++) args.push(arguments[i])
      if (!self._hasParseCallback()) console.log.apply(console, args)
      hasOutput = true
      if (output.length) output += '\n'
      output += args.join(' ')
    },
    error () {
      const args = []
      for (let i = 0; i < arguments.length; i++) args.push(arguments[i])
      if (!self._hasParseCallback()) console.error.apply(console, args)
      hasOutput = true
      if (output.length) output += '\n'
      output += args.join(' ')
    }
  }
  self._getLoggerInstance = () => _logger
  // has yargs output an error our help
  // message in the current execution context.
  self._hasOutput = () => hasOutput

  self._setHasOutput = () => {
    hasOutput = true
  }

  let recommendCommands
  self.recommendCommands = function (recommend) {
    argsert('[boolean]', [recommend], arguments.length)
    recommendCommands = typeof recommend === 'boolean' ? recommend : true
    return self
  }

  self.getUsageInstance = () => usage

  self.getValidationInstance = () => validation

  self.getCommandInstance = () => command

  self.terminalWidth = () => {
    argsert([], 0)
    return typeof process.stdout.columns !== 'undefined' ? process.stdout.columns : null
  }

  Object.defineProperty(self, 'argv', {
    get: () => self._parseArgs(processArgs),
    enumerable: true
  })

  self._parseArgs = function parseArgs (args, shortCircuit, _calledFromCommand, commandIndex) {
    let skipValidation = !!_calledFromCommand
    args = args || processArgs

    options.__ = y18n.__
    options.configuration = self.getParserConfiguration()

    const populateDoubleDash = !!options.configuration['populate--']
    const config = Object.assign({}, options.configuration, {
      'populate--': true
    })
    const parsed = Parser.detailed(args, Object.assign({}, options, {
      configuration: config
    }))

    let argv = parsed.argv
    if (parseContext) argv = Object.assign({}, argv, parseContext)
    const aliases = parsed.aliases

    argv.$0 = self.$0
    self.parsed = parsed

    try {
      guessLocale() // guess locale lazily, so that it can be turned off in chain.

      // while building up the argv object, there
      // are two passes through the parser. If completion
      // is being performed short-circuit on the first pass.
      if (shortCircuit) {
        return (populateDoubleDash || _calledFromCommand) ? argv : self._copyDoubleDash(argv)
      }

      // if there's a handler associated with a
      // command defer processing to it.
      if (helpOpt) {
        // consider any multi-char helpOpt alias as a valid help command
        // unless all helpOpt aliases are single-char
        // note that parsed.aliases is a normalized bidirectional map :)
        const helpCmds = [helpOpt]
          .concat(aliases[helpOpt] || [])
          .filter(k => k.length > 1)
        // check if help should trigger and strip it from _.
        if (~helpCmds.indexOf(argv._[argv._.length - 1])) {
          argv._.pop()
          argv[helpOpt] = true
        }
      }

      const handlerKeys = command.getCommands()
      const requestCompletions = completion.completionKey in argv
      const skipRecommendation = argv[helpOpt] || requestCompletions
      const skipDefaultCommand = skipRecommendation && (handlerKeys.length > 1 || handlerKeys[0] !== '$0')

      if (argv._.length) {
        if (handlerKeys.length) {
          let firstUnknownCommand
          for (let i = (commandIndex || 0), cmd; argv._[i] !== undefined; i++) {
            cmd = String(argv._[i])
            if (~handlerKeys.indexOf(cmd) && cmd !== completionCommand) {
              // commands are executed using a recursive algorithm that executes
              // the deepest command first; we keep track of the position in the
              // argv._ array that is currently being executed.
              const innerArgv = command.runCommand(cmd, self, parsed, i + 1)
              return populateDoubleDash ? innerArgv : self._copyDoubleDash(innerArgv)
            } else if (!firstUnknownCommand && cmd !== completionCommand) {
              firstUnknownCommand = cmd
              break
            }
          }

          // run the default command, if defined
          if (command.hasDefaultCommand() && !skipDefaultCommand) {
            const innerArgv = command.runCommand(null, self, parsed)
            return populateDoubleDash ? innerArgv : self._copyDoubleDash(innerArgv)
          }

          // recommend a command if recommendCommands() has
          // been enabled, and no commands were found to execute
          if (recommendCommands && firstUnknownCommand && !skipRecommendation) {
            validation.recommendCommands(firstUnknownCommand, handlerKeys)
          }
        }

        // generate a completion script for adding to ~/.bashrc.
        if (completionCommand && ~argv._.indexOf(completionCommand) && !requestCompletions) {
          if (exitProcess) setBlocking(true)
          self.showCompletionScript()
          self.exit(0)
        }
      } else if (command.hasDefaultCommand() && !skipDefaultCommand) {
        const innerArgv = command.runCommand(null, self, parsed)
        return populateDoubleDash ? innerArgv : self._copyDoubleDash(innerArgv)
      }

      // we must run completions first, a user might
      // want to complete the --help or --version option.
      if (requestCompletions) {
        if (exitProcess) setBlocking(true)

        // we allow for asynchronous completions,
        // e.g., loading in a list of commands from an API.
        const completionArgs = args.slice(args.indexOf(`--${completion.completionKey}`) + 1)
        completion.getCompletion(completionArgs, (completions) => {
          ;(completions || []).forEach((completion) => {
            _logger.log(completion)
          })

          self.exit(0)
        })
        return (populateDoubleDash || _calledFromCommand) ? argv : self._copyDoubleDash(argv)
      }

      // Handle 'help' and 'version' options
      // if we haven't already output help!
      if (!hasOutput) {
        Object.keys(argv).forEach((key) => {
          if (key === helpOpt && argv[key]) {
            if (exitProcess) setBlocking(true)

            skipValidation = true
            self.showHelp('log')
            self.exit(0)
          } else if (key === versionOpt && argv[key]) {
            if (exitProcess) setBlocking(true)

            skipValidation = true
            usage.showVersion()
            self.exit(0)
          }
        })
      }

      // Check if any of the options to skip validation were provided
      if (!skipValidation && options.skipValidation.length > 0) {
        skipValidation = Object.keys(argv).some(key => options.skipValidation.indexOf(key) >= 0 && argv[key] === true)
      }

      // If the help or version options where used and exitProcess is false,
      // or if explicitly skipped, we won't run validations.
      if (!skipValidation) {
        if (parsed.error) throw new YError(parsed.error.message)

        // if we're executed via bash completion, don't
        // bother with validation.
        if (!requestCompletions) {
          self._runValidation(argv, aliases, {}, parsed.error)
        }
      }
    } catch (err) {
      if (err instanceof YError) usage.fail(err.message, err)
      else throw err
    }

    return (populateDoubleDash || _calledFromCommand) ? argv : self._copyDoubleDash(argv)
  }

  // to simplify the parsing of positionals in commands,
  // we temporarily populate '--' rather than _, with arguments
  // after the '--' directive. After the parse, we copy these back.
  self._copyDoubleDash = function (argv) {
    if (!argv._ || !argv['--']) return argv
    argv._.push.apply(argv._, argv['--'])

    // TODO(bcoe): refactor command parsing such that this delete is not
    // necessary: https://github.com/yargs/yargs/issues/1482
    try {
      delete argv['--']
    } catch (_err) {}

    return argv
  }

  self._runValidation = function runValidation (argv, aliases, positionalMap, parseErrors) {
    if (parseErrors) throw new YError(parseErrors.message)
    validation.nonOptionCount(argv)
    validation.requiredArguments(argv)
    let failedStrictCommands = false
    if (strictCommands) {
      failedStrictCommands = validation.unknownCommands(argv, aliases, positionalMap)
    }
    if (strict && !failedStrictCommands) {
      validation.unknownArguments(argv, aliases, positionalMap)
    }
    validation.customChecks(argv, aliases)
    validation.limitedChoices(argv)
    validation.implications(argv)
    validation.conflicting(argv)
  }

  function guessLocale () {
    if (!detectLocale) return
    const locale = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || process.env.LANGUAGE || 'en_US'
    self.locale(locale.replace(/[.:].*/, ''))
  }

  // an app should almost always have --version and --help,
  // if you *really* want to disable this use .help(false)/.version(false).
  self.help()
  self.version()

  return self
}

// allow consumers to directly use the version of yargs-parser used by yargs
exports.Parser = Parser

// rebase an absolute path to a relative one with respect to a base directory
// exported for tests
exports.rebase = rebase
function rebase (base, dir) {
  return path.relative(base, dir)
}

}).call(this,require("path").join(__dirname,"node_modules","yargs"))
},{"./lib/apply-extends":98,"./lib/argsert":99,"./lib/command":100,"./lib/completion":102,"./lib/middleware":105,"./lib/obj-filter":106,"./lib/process-argv":107,"./lib/usage":108,"./lib/validation":109,"./lib/yerror":110,"find-up":119,"fs":undefined,"get-caller-file":72,"path":undefined,"require-main-filename":89,"set-blocking":91,"y18n":96,"yargs-parser":127}],130:[function(require,module,exports){
module.exports={
  "name": "wavedrom",
  "version": "2.3.2",
  "description": "Digital timing diagram in your browser",
  "homepage": "http://wavedrom.com",
  "author": "alex.drom@gmail.com",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/wavedrom/wavedrom.git"
  },
  "bugs": {
    "url": "https://github.com/wavedrom/wavedrom/issues"
  },
  "bin": {
    "wavedrom": "./bin/cli.js"
  },
  "main": "./lib",
  "unpkg": "wavedrom.unpkg.js",
  "files": [
    "bin/cli.js",
    "wavedrom.js",
    "wavedrom.min.js",
    "wavedrom.unpkg.js",
    "LICENSE",
    "lib/**",
    "skins/**"
  ],
  "scripts": {
    "test": "grunt",
    "eslint": "eslint lib/*.js",
    "unpkg": "browserify --standalone wavedrom lib/index.js > wavedrom.unpkg.js",
    "cli": "bash -c \"{ echo '#!/usr/bin/env node' ; browserify --node bin/cli.js ; } > bin/wavedrom.js ; chmod +x bin/wavedrom.js \"",
    "prepare": "npm run test && npm run unpkg",
    "cover": "nyc -r=text -r=lcov mocha"
  },
  "keywords": [
    "waveform",
    "verilog",
    "RTL"
  ],
  "devDependencies": {
    "@drom/eslint-config": "^0.10.0",
    "browserify": "^16.5.1",
    "chai": "^4.2.0",
    "eslint": "^6.8.0",
    "grunt": "^1.1.0",
    "grunt-browserify": "^5.3.0",
    "grunt-cli": "^1.3.2",
    "grunt-contrib-clean": "^2.0.0",
    "grunt-contrib-concat": "^1.0.1",
    "grunt-contrib-uglify": "^4.0.1",
    "grunt-eslint": "^22.0.0",
    "js-beautify": "^1.11.0",
    "jsof": "^0.3.2",
    "mocha": "^7.1.1",
    "nyc": "^15.0.1"
  },
  "dependencies": {
    "bit-field": "^1.2.1",
    "fs-extra": "^9.0.0",
    "json5": "^2.1.3",
    "onml": "^1.2.0",
    "tspan": "^0.3.6",
    "yargs": "^15.3.1"
  },
  "eslintConfig": {
    "extends": "@drom/eslint-config/eslint4/node4",
    "rules": {
      "camelcase": 0
    }
  }
}

},{}],131:[function(require,module,exports){
var WaveSkin=WaveSkin||{};WaveSkin.default=["svg",{"id":"svg","xmlns":"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink","height":"0"},["style",{"type":"text/css"},"text{font-size:11pt;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;text-align:center;fill-opacity:1;font-family:Helvetica}.muted{fill:#aaa}.warning{fill:#f6b900}.error{fill:#f60000}.info{fill:#0041c4}.success{fill:#00ab00}.h1{font-size:33pt;font-weight:bold}.h2{font-size:27pt;font-weight:bold}.h3{font-size:20pt;font-weight:bold}.h4{font-size:14pt;font-weight:bold}.h5{font-size:11pt;font-weight:bold}.h6{font-size:8pt;font-weight:bold}.s1{fill:none;stroke:#000;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}.s2{fill:none;stroke:#000;stroke-width:0.5;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}.s3{color:#000;fill:none;stroke:#000;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:1, 3;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s4{color:#000;fill:none;stroke:#000;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible}.s5{fill:#fff;stroke:none}.s6{fill:#000;fill-opacity:1;stroke:none}.s7{color:#000;fill:#fff;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s8{color:#000;fill:#ffffb4;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s9{color:#000;fill:#ffe0b9;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s10{color:#000;fill:#b9e0ff;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s11{color:#000;fill:#ccfdfe;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s12{color:#000;fill:#cdfdc5;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s13{color:#000;fill:#f0c1fb;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s14{color:#000;fill:#f5c2c0;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s15{fill:#0041c4;fill-opacity:1;stroke:none}.s16{fill:none;stroke:#0041c4;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}"],["defs",["g",{"id":"socket"},["rect",{"y":"15","x":"6","height":"20","width":"20"}]],["g",{"id":"pclk"},["path",{"d":"M0,20 0,0 20,0","class":"s1"}]],["g",{"id":"nclk"},["path",{"d":"m0,0 0,20 20,0","class":"s1"}]],["g",{"id":"000"},["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"0m0"},["path",{"d":"m0,20 3,0 3,-10 3,10 11,0","class":"s1"}]],["g",{"id":"0m1"},["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"0mx"},["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 5,20","class":"s2"}],["path",{"d":"M20,0 4,16","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"0md"},["path",{"d":"m8,20 10,0","class":"s3"}],["path",{"d":"m0,20 5,0","class":"s1"}]],["g",{"id":"0mu"},["path",{"d":"m0,20 3,0 C 7,10 10.107603,0 20,0","class":"s1"}]],["g",{"id":"0mz"},["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"111"},["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"1m0"},["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}]],["g",{"id":"1m1"},["path",{"d":"M0,0 3,0 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"1mx"},["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 5,5","class":"s2"}],["path",{"d":"M3.5,1.5 5,0","class":"s2"}]],["g",{"id":"1md"},["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}]],["g",{"id":"1mu"},["path",{"d":"M0,0 5,0","class":"s1"}],["path",{"d":"M8,0 18,0","class":"s3"}]],["g",{"id":"1mz"},["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}]],["g",{"id":"xxx"},["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 10,0","class":"s2"}],["path",{"d":"M0,15 15,0","class":"s2"}],["path",{"d":"M0,20 20,0","class":"s2"}],["path",{"d":"M5,20 20,5","class":"s2"}],["path",{"d":"M10,20 20,10","class":"s2"}],["path",{"d":"m15,20 5,-5","class":"s2"}]],["g",{"id":"xm0"},["path",{"d":"M0,0 4,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,5 4,1","class":"s2"}],["path",{"d":"M0,10 5,5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 7,13","class":"s2"}],["path",{"d":"M5,20 8,17","class":"s2"}]],["g",{"id":"xm1"},["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 4,20 9,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 9,1","class":"s2"}],["path",{"d":"M0,15 7,8","class":"s2"}],["path",{"d":"M0,20 5,15","class":"s2"}]],["g",{"id":"xmx"},["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 10,0","class":"s2"}],["path",{"d":"M0,15 15,0","class":"s2"}],["path",{"d":"M0,20 20,0","class":"s2"}],["path",{"d":"M5,20 20,5","class":"s2"}],["path",{"d":"M10,20 20,10","class":"s2"}],["path",{"d":"m15,20 5,-5","class":"s2"}]],["g",{"id":"xmd"},["path",{"d":"m0,0 4,0 c 3,10 6,20 16,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,5 4,1","class":"s2"}],["path",{"d":"M0,10 5.5,4.5","class":"s2"}],["path",{"d":"M0,15 6.5,8.5","class":"s2"}],["path",{"d":"M0,20 8,12","class":"s2"}],["path",{"d":"m5,20 5,-5","class":"s2"}],["path",{"d":"m10,20 2.5,-2.5","class":"s2"}]],["g",{"id":"xmu"},["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"m0,20 4,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 10,0","class":"s2"}],["path",{"d":"M0,15 10,5","class":"s2"}],["path",{"d":"M0,20 6,14","class":"s2"}]],["g",{"id":"xmz"},["path",{"d":"m0,0 4,0 c 6,10 11,10 16,10","class":"s1"}],["path",{"d":"m0,20 4,0 C 10,10 15,10 20,10","class":"s1"}],["path",{"d":"M0,5 4.5,0.5","class":"s2"}],["path",{"d":"M0,10 6.5,3.5","class":"s2"}],["path",{"d":"M0,15 8.5,6.5","class":"s2"}],["path",{"d":"M0,20 11.5,8.5","class":"s2"}]],["g",{"id":"ddd"},["path",{"d":"m0,20 20,0","class":"s3"}]],["g",{"id":"dm0"},["path",{"d":"m0,20 10,0","class":"s3"}],["path",{"d":"m12,20 8,0","class":"s1"}]],["g",{"id":"dm1"},["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"dmx"},["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 5,20","class":"s2"}],["path",{"d":"M20,0 4,16","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"dmd"},["path",{"d":"m0,20 20,0","class":"s3"}]],["g",{"id":"dmu"},["path",{"d":"m0,20 3,0 C 7,10 10.107603,0 20,0","class":"s1"}]],["g",{"id":"dmz"},["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"uuu"},["path",{"d":"M0,0 20,0","class":"s3"}]],["g",{"id":"um0"},["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}]],["g",{"id":"um1"},["path",{"d":"M0,0 10,0","class":"s3"}],["path",{"d":"m12,0 8,0","class":"s1"}]],["g",{"id":"umx"},["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 5,5","class":"s2"}],["path",{"d":"M3.5,1.5 5,0","class":"s2"}]],["g",{"id":"umd"},["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}]],["g",{"id":"umu"},["path",{"d":"M0,0 20,0","class":"s3"}]],["g",{"id":"umz"},["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s4"}]],["g",{"id":"zzz"},["path",{"d":"m0,10 20,0","class":"s1"}]],["g",{"id":"zm0"},["path",{"d":"m0,10 6,0 3,10 11,0","class":"s1"}]],["g",{"id":"zm1"},["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"zmx"},["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 6.5,8.5","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"zmd"},["path",{"d":"m0,10 7,0 c 3,5 8,10 13,10","class":"s1"}]],["g",{"id":"zmu"},["path",{"d":"m0,10 7,0 C 10,5 15,0 20,0","class":"s1"}]],["g",{"id":"zmz"},["path",{"d":"m0,10 20,0","class":"s1"}]],["g",{"id":"gap"},["path",{"d":"m7,-2 -4,0 c -5,0 -5,24 -10,24 l 4,0 C 2,22 2,-2 7,-2 z","class":"s5"}],["path",{"d":"M-7,22 C -2,22 -2,-2 3,-2","class":"s1"}],["path",{"d":"M-3,22 C 2,22 2,-2 7,-2","class":"s1"}]],["g",{"id":"Pclk"},["path",{"d":"M-3,12 0,3 3,12 C 1,11 -1,11 -3,12 z","class":"s6"}],["path",{"d":"M0,20 0,0 20,0","class":"s1"}]],["g",{"id":"Nclk"},["path",{"d":"M-3,8 0,17 3,8 C 1,9 -1,9 -3,8 z","class":"s6"}],["path",{"d":"m0,0 0,20 20,0","class":"s1"}]],["g",{"id":"0mv-2"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s7"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-2"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s7"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-2"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s7"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-2"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s7"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-2"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s7"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-2"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s7"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-2"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s7"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-2"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-2"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s7"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-2"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s7"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-2"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s7"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-3"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s8"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-3"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s8"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-3"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s8"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-3"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s8"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-3"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s8"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-3"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s8"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-3"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s8"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-3"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-3"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s8"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-3"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s8"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-3"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s8"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-4"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s9"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-4"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s9"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-4"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s9"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-4"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s9"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-4"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s9"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-4"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s9"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-4"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s9"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-4"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-4"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s9"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-4"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s9"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-4"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s9"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-5"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s10"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-5"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s10"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-5"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s10"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-5"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s10"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-5"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s10"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-5"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s10"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-5"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s10"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-5"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-5"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s10"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-5"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s10"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-5"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s10"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-6"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s11"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-6"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s11"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-6"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s11"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-6"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s11"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-6"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s11"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-6"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s11"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-6"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s11"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-6"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-6"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s11"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-6"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s11"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-6"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s11"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-7"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s12"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-7"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s12"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-7"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s12"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-7"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s12"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-7"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s12"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-7"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s12"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-7"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s12"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-7"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-7"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s12"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-7"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s12"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-7"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s12"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-8"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s13"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-8"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s13"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-8"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s13"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-8"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s13"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-8"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s13"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-8"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s13"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-8"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s13"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-8"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-8"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s13"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-8"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s13"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-8"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s13"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-9"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s14"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-9"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s14"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-9"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s14"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-9"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s14"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-9"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s14"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-9"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s14"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-9"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s14"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-9"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-9"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s14"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-9"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s14"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-9"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s14"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"vmv-2-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"arrow0"},["path",{"d":"m-12,-3 9,3 -9,3 c 1,-2 1,-4 0,-6 z","class":"s15"}],["path",{"d":"M0,0 -15,0","class":"s16"}]],["marker",{"id":"arrowhead","style":"fill:#0041c4","markerHeight":"7","markerWidth":"10","markerUnits":"strokeWidth","viewBox":"0 -4 11 8","refX":"15","refY":"0","orient":"auto"},["path",{"d":"M0 -4 11 0 0 4z"}]],["marker",{"id":"arrowtail","style":"fill:#0041c4","markerHeight":"7","markerWidth":"10","markerUnits":"strokeWidth","viewBox":"-11 -4 11 8","refX":"-15","refY":"0","orient":"auto"},["path",{"d":"M0 -4 -11 0 0 4z"}]]],["g",{"id":"waves"},["g",{"id":"lanes"}],["g",{"id":"groups"}]]];
try { module.exports = WaveSkin; } catch(err) {}


},{}],132:[function(require,module,exports){
var WaveSkin=WaveSkin||{};WaveSkin.lowkey=["svg",{"id":"svg","xmlns":"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink","height":"0"},["style",{"type":"text/css"},"text{font-size:11pt;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;text-align:center;fill-opacity:1;font-family:Helvetica}.muted{fill:#aaa}.warning{fill:#f6b900}.error{fill:#f60000}.info{fill:#0041c4}.success{fill:#00ab00}.h1{font-size:33pt;font-weight:bold}.h2{font-size:27pt;font-weight:bold}.h3{font-size:20pt;font-weight:bold}.h4{font-size:14pt;font-weight:bold}.h5{font-size:11pt;font-weight:bold}.h6{font-size:8pt;font-weight:bold}.s1{fill:none;stroke:#606060;stroke-width:0.75px;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}.s2{fill:none;stroke:#606060;stroke-width:0.5;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}.s3{color:#000;fill:none;stroke:#606060;stroke-width:0.75px;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:1, 3;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s4{color:#000;fill:none;stroke:#606060;stroke-width:0.75px;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible}.s5{fill:#ffffff;stroke:none}.s6{fill:#606060;fill-opacity:1;stroke:none}.s7{color:#000;fill:#fff;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s8{color:#000;fill:#eaeaea;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s9{color:#000;fill:#d7d7d7;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s10{color:#000;fill:#c0c0c0;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s11{color:#000;fill:#b0b0b0;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s12{color:#000;fill:#a0a0a0;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s13{color:#000;fill:#909090;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s14{color:#000;fill:#808080;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s15{fill:#0041c4;fill-opacity:1;stroke:none}.s16{fill:none;stroke:#0041c4;stroke-width:0.75px;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}"],["defs",["g",{"id":"socket"},["rect",{"y":"15","x":"6","height":"20","width":"20","style":"fill:#606060;stroke:#606060;stroke-width:0.5"}]],["g",{"id":"pclk"},["path",{"d":"M0,20 0,0 20,0","class":"s1"}]],["g",{"id":"nclk"},["path",{"d":"m0,0 0,20 20,0","class":"s1"}]],["g",{"id":"000"},["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"0m0"},["path",{"d":"m0,20 3,0 3,-10 3,10 11,0","class":"s1"}]],["g",{"id":"0m1"},["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"0mx"},["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 5,20","class":"s2"}],["path",{"d":"M20,0 4,16","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"0md"},["path",{"d":"m8,20 10,0","class":"s3"}],["path",{"d":"m0,20 5,0","class":"s1"}]],["g",{"id":"0mu"},["path",{"d":"m0,20 3,0 C 7,10 10.107603,0 20,0","class":"s1"}]],["g",{"id":"0mz"},["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"111"},["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"1m0"},["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}]],["g",{"id":"1m1"},["path",{"d":"M0,0 3,0 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"1mx"},["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 5,5","class":"s2"}],["path",{"d":"M3.5,1.5 5,0","class":"s2"}]],["g",{"id":"1md"},["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}]],["g",{"id":"1mu"},["path",{"d":"M0,0 5,0","class":"s1"}],["path",{"d":"M8,0 18,0","class":"s3"}]],["g",{"id":"1mz"},["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}]],["g",{"id":"xxx"},["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 10,0","class":"s2"}],["path",{"d":"M0,15 15,0","class":"s2"}],["path",{"d":"M0,20 20,0","class":"s2"}],["path",{"d":"M5,20 20,5","class":"s2"}],["path",{"d":"M10,20 20,10","class":"s2"}],["path",{"d":"m15,20 5,-5","class":"s2"}]],["g",{"id":"xm0"},["path",{"d":"M0,0 4,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,5 4,1","class":"s2"}],["path",{"d":"M0,10 5,5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 7,13","class":"s2"}],["path",{"d":"M5,20 8,17","class":"s2"}]],["g",{"id":"xm1"},["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 4,20 9,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 9,1","class":"s2"}],["path",{"d":"M0,15 7,8","class":"s2"}],["path",{"d":"M0,20 5,15","class":"s2"}]],["g",{"id":"xmx"},["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 10,0","class":"s2"}],["path",{"d":"M0,15 15,0","class":"s2"}],["path",{"d":"M0,20 20,0","class":"s2"}],["path",{"d":"M5,20 20,5","class":"s2"}],["path",{"d":"M10,20 20,10","class":"s2"}],["path",{"d":"m15,20 5,-5","class":"s2"}]],["g",{"id":"xmd"},["path",{"d":"m0,0 4,0 c 3,10 6,20 16,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,5 4,1","class":"s2"}],["path",{"d":"M0,10 5.5,4.5","class":"s2"}],["path",{"d":"M0,15 6.5,8.5","class":"s2"}],["path",{"d":"M0,20 8,12","class":"s2"}],["path",{"d":"m5,20 5,-5","class":"s2"}],["path",{"d":"m10,20 2.5,-2.5","class":"s2"}]],["g",{"id":"xmu"},["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"m0,20 4,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 10,0","class":"s2"}],["path",{"d":"M0,15 10,5","class":"s2"}],["path",{"d":"M0,20 6,14","class":"s2"}]],["g",{"id":"xmz"},["path",{"d":"m0,0 4,0 c 6,10 11,10 16,10","class":"s1"}],["path",{"d":"m0,20 4,0 C 10,10 15,10 20,10","class":"s1"}],["path",{"d":"M0,5 4.5,0.5","class":"s2"}],["path",{"d":"M0,10 6.5,3.5","class":"s2"}],["path",{"d":"M0,15 8.5,6.5","class":"s2"}],["path",{"d":"M0,20 11.5,8.5","class":"s2"}]],["g",{"id":"ddd"},["path",{"d":"m0,20 20,0","class":"s3"}]],["g",{"id":"dm0"},["path",{"d":"m0,20 10,0","class":"s3"}],["path",{"d":"m12,20 8,0","class":"s1"}]],["g",{"id":"dm1"},["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"dmx"},["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 5,20","class":"s2"}],["path",{"d":"M20,0 4,16","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"dmd"},["path",{"d":"m0,20 20,0","class":"s3"}]],["g",{"id":"dmu"},["path",{"d":"m0,20 3,0 C 7,10 10.107603,0 20,0","class":"s1"}]],["g",{"id":"dmz"},["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"uuu"},["path",{"d":"M0,0 20,0","class":"s3"}]],["g",{"id":"um0"},["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}]],["g",{"id":"um1"},["path",{"d":"M0,0 10,0","class":"s3"}],["path",{"d":"m12,0 8,0","class":"s1"}]],["g",{"id":"umx"},["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 5,5","class":"s2"}],["path",{"d":"M3.5,1.5 5,0","class":"s2"}]],["g",{"id":"umd"},["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}]],["g",{"id":"umu"},["path",{"d":"M0,0 20,0","class":"s3"}]],["g",{"id":"umz"},["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s4"}]],["g",{"id":"zzz"},["path",{"d":"m0,10 20,0","class":"s1"}]],["g",{"id":"zm0"},["path",{"d":"m0,10 6,0 3,10 11,0","class":"s1"}]],["g",{"id":"zm1"},["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"zmx"},["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 6.5,8.5","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"zmd"},["path",{"d":"m0,10 7,0 c 3,5 8,10 13,10","class":"s1"}]],["g",{"id":"zmu"},["path",{"d":"m0,10 7,0 C 10,5 15,0 20,0","class":"s1"}]],["g",{"id":"zmz"},["path",{"d":"m0,10 20,0","class":"s1"}]],["g",{"id":"gap"},["path",{"d":"m7,-2 -4,0 c -5,0 -5,24 -10,24 l 4,0 C 2,22 2,-2 7,-2 z","class":"s5"}],["path",{"d":"M-7,22 C -2,22 -2,-2 3,-2","class":"s1"}],["path",{"d":"M-3,22 C 2,22 2,-2 7,-2","class":"s1"}]],["g",{"id":"Pclk"},["path",{"d":"M-3,12 0,3 3,12 C 1,11 -1,11 -3,12 z","class":"s6"}],["path",{"d":"M0,20 0,0 20,0","class":"s1"}]],["g",{"id":"Nclk"},["path",{"d":"M-3,8 0,17 3,8 C 1,9 -1,9 -3,8 z","class":"s6"}],["path",{"d":"m0,0 0,20 20,0","class":"s1"}]],["g",{"id":"0mv-2"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s7"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-2"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s7"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-2"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s7"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-2"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s7"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-2"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s7"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-2"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s7"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-2"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s7"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-2"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-2"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s7"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-2"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s7"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-2"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s7"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-3"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s8"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-3"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s8"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-3"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s8"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-3"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s8"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-3"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s8"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-3"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s8"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-3"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s8"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-3"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-3"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s8"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-3"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s8"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-3"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s8"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-4"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s9"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-4"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s9"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-4"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s9"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-4"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s9"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-4"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s9"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-4"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s9"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-4"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s9"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-4"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-4"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s9"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-4"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s9"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-4"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s9"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-5"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s10"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-5"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s10"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-5"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s10"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-5"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s10"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-5"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s10"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-5"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s10"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-5"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s10"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-5"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-5"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s10"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-5"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s10"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-5"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s10"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-6"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s11"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-6"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s11"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-6"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s11"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-6"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s11"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-6"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s11"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-6"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s11"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-6"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s11"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-6"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-6"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s11"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-6"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s11"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-6"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s11"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-7"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s12"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-7"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s12"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-7"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s12"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-7"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s12"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-7"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s12"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-7"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s12"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-7"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s12"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-7"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-7"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s12"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-7"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s12"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-7"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s12"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-8"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s13"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-8"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s13"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-8"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s13"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-8"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s13"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-8"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s13"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-8"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s13"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-8"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s13"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-8"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-8"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s13"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-8"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s13"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-8"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s13"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-9"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s14"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-9"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s14"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-9"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s14"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-9"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s14"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-9"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s14"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-9"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s14"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-9"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s14"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-9"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-9"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s14"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-9"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s14"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-9"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s14"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"vmv-2-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"arrow0"},["path",{"d":"m-12,-3 9,3 -9,3 c 1,-2 1,-4 0,-6 z","class":"s15"}],["path",{"d":"M0,0 -15,0","class":"s16"}]],["marker",{"id":"arrowhead","style":"fill:#0041c4","markerHeight":"7","markerWidth":"10","markerUnits":"strokeWidth","viewBox":"0 -4 11 8","refX":"15","refY":"0","orient":"auto"},["path",{"d":"M0 -4 11 0 0 4z"}]],["marker",{"id":"arrowtail","style":"fill:#0041c4","markerHeight":"7","markerWidth":"10","markerUnits":"strokeWidth","viewBox":"-11 -4 11 8","refX":"-15","refY":"0","orient":"auto"},["path",{"d":"M0 -4 -11 0 0 4z"}]]],["g",{"id":"waves"},["g",{"id":"lanes"}],["g",{"id":"groups"}]]];
try { module.exports = WaveSkin; } catch(err) {}


},{}],133:[function(require,module,exports){
var WaveSkin=WaveSkin||{};WaveSkin.narrow=["svg",{"id":"svg","xmlns":"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink","height":"0"},["style",{"type":"text/css"},"text{font-size:11pt;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;text-align:center;fill-opacity:1;font-family:Helvetica}.muted{fill:#aaa}.warning{fill:#f6b900}.error{fill:#f60000}.info{fill:#0041c4}.success{fill:#00ab00}.h1{font-size:33pt;font-weight:bold}.h2{font-size:27pt;font-weight:bold}.h3{font-size:20pt;font-weight:bold}.h4{font-size:14pt;font-weight:bold}.h5{font-size:11pt;font-weight:bold}.h6{font-size:8pt;font-weight:bold}.s1{fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}.s2{fill:none;stroke:#000000;stroke-width:0.5;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}.s3{color:#000000;fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:1, 3;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s4{color:#000000;fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible}.s5{fill:#ffffff;stroke:none}.s6{fill:#000000;fill-opacity:1;stroke:none}.s7{color:#000000;fill:#fff;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s8{color:#000000;fill:#ffffb4;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s9{color:#000000;fill:#ffe0b9;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s10{color:#000000;fill:#b9e0ff;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s11{color:#000000;fill:#ccfdfe;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s12{color:#000000;fill:#cdfdc5;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s13{color:#000000;fill:#f0c1fb;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s14{color:#000000;fill:#f5c2c0;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}"],["defs",["g",{"id":"socket"},["rect",{"y":"15","x":"4","height":"20","width":"10"}]],["g",{"id":"pclk"},["path",{"d":"M 0,20 0,0 10,0","class":"s1"}]],["g",{"id":"nclk"},["path",{"d":"m 0,0 0,20 10,0","class":"s1"}]],["g",{"id":"000"},["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"0m0"},["path",{"d":"m 0,20 1,0 3,-10 3,10 3,0","class":"s1"}]],["g",{"id":"0m1"},["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"0mx"},["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 5,20","class":"s2"}],["path",{"d":"M 10,10 2,18","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"0md"},["path",{"d":"m 1,20 9,0","class":"s3"}],["path",{"d":"m 0,20 1,0","class":"s1"}]],["g",{"id":"0mu"},["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}]],["g",{"id":"0mz"},["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"111"},["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"1m0"},["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}]],["g",{"id":"1m1"},["path",{"d":"M 0,0 1,0 4,10 7,0 10,0","class":"s1"}]],["g",{"id":"1mx"},["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4.5,10.5","class":"s2"}],["path",{"d":"M 10,0 3,7","class":"s2"}],["path",{"d":"M 2,3 5,0","class":"s2"}]],["g",{"id":"1md"},["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}]],["g",{"id":"1mu"},["path",{"d":"M 0,0 1,0","class":"s1"}],["path",{"d":"m 1,0 9,0","class":"s3"}]],["g",{"id":"1mz"},["path",{"d":"m 0,0 1,0 c 2,4 6,10 9,10","class":"s1"}]],["g",{"id":"xxx"},["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,5 5,0","class":"s2"}],["path",{"d":"M 0,10 10,0","class":"s2"}],["path",{"d":"M 0,15 10,5","class":"s2"}],["path",{"d":"M 0,20 10,10","class":"s2"}],["path",{"d":"m 5,20 5,-5","class":"s2"}]],["g",{"id":"xm0"},["path",{"d":"M 0,0 1,0 7,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 4,11","class":"s2"}],["path",{"d":"M 0,20 5,15","class":"s2"}],["path",{"d":"M 5,20 6,19","class":"s2"}]],["g",{"id":"xm1"},["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}],["path",{"d":"M 0,5 5,0","class":"s2"}],["path",{"d":"M 0,10 6,4","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"xmx"},["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,5 5,0","class":"s2"}],["path",{"d":"M 0,10 10,0","class":"s2"}],["path",{"d":"M 0,15 10,5","class":"s2"}],["path",{"d":"M 0,20 10,10","class":"s2"}],["path",{"d":"m 5,20 5,-5","class":"s2"}]],["g",{"id":"xmd"},["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,5 1.5,3.5","class":"s2"}],["path",{"d":"M 0,10 2.5,7.5","class":"s2"}],["path",{"d":"M 0,15 3.5,11.5","class":"s2"}],["path",{"d":"M 0,20 5,15","class":"s2"}],["path",{"d":"M 5,20 7,18","class":"s2"}]],["g",{"id":"xmu"},["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,5 5,0","class":"s2"}],["path",{"d":"M 0,10 5,5","class":"s2"}],["path",{"d":"M 0,15 2,13","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"xmz"},["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 4,6","class":"s2"}],["path",{"d":"m 0,15.5 6,-7","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"ddd"},["path",{"d":"m 0,20 10,0","class":"s3"}]],["g",{"id":"dm0"},["path",{"d":"m 0,20 7,0","class":"s3"}],["path",{"d":"m 7,20 3,0","class":"s1"}]],["g",{"id":"dm1"},["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"dmx"},["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 5,20","class":"s2"}],["path",{"d":"M 10,10 1.5,18.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"dmd"},["path",{"d":"m 0,20 10,0","class":"s3"}]],["g",{"id":"dmu"},["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}]],["g",{"id":"dmz"},["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"uuu"},["path",{"d":"M 0,0 10,0","class":"s3"}]],["g",{"id":"um0"},["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}]],["g",{"id":"um1"},["path",{"d":"M 0,0 7,0","class":"s3"}],["path",{"d":"m 7,0 3,0","class":"s1"}]],["g",{"id":"umx"},["path",{"d":"M 1.4771574,0 7,20 l 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4.5,10.5","class":"s2"}],["path",{"d":"M 10,0 3.5,6.5","class":"s2"}],["path",{"d":"M 2.463621,2.536379 5,0","class":"s2"}]],["g",{"id":"umd"},["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}]],["g",{"id":"umu"},["path",{"d":"M 0,0 10,0","class":"s3"}]],["g",{"id":"umz"},["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s4"}]],["g",{"id":"zzz"},["path",{"d":"m 0,10 10,0","class":"s1"}]],["g",{"id":"zm0"},["path",{"d":"m 0,10 1,0 4,10 5,0","class":"s1"}]],["g",{"id":"zm1"},["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"zmx"},["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}],["path",{"d":"M 10,15 5,20","class":"s2"}],["path",{"d":"M 10,10 4,16","class":"s2"}],["path",{"d":"M 10,5 2.5,12.5","class":"s2"}],["path",{"d":"M 10,0 2,8","class":"s2"}]],["g",{"id":"zmd"},["path",{"d":"m 0,10 1,0 c 2,6 6,10 9,10","class":"s1"}]],["g",{"id":"zmu"},["path",{"d":"m 0,10 1,0 C 3,4 7,0 10,0","class":"s1"}]],["g",{"id":"zmz"},["path",{"d":"m 0,10 10,0","class":"s1"}]],["g",{"id":"gap"},["path",{"d":"m 7,-2 -4,0 c -5,0 -5,24 -10,24 l 4,0 C 2,22 2,-2 7,-2 z","class":"s5"}],["path",{"d":"M -7,22 C -2,22 -2,-2 3,-2","class":"s1"}],["path",{"d":"M -3,22 C 2,22 2,-2 7,-2","class":"s1"}]],["g",{"id":"Pclk"},["path",{"d":"M -3,12 0,3 3,12 C 1,11 -1,11 -3,12 z","class":"s6"}],["path",{"d":"M 0,20 0,0 10,0","class":"s1"}]],["g",{"id":"Nclk"},["path",{"d":"M -3,8 0,17 3,8 C 1,9 -1,9 -3,8 z","class":"s6"}],["path",{"d":"m 0,0 0,20 10,0","class":"s1"}]],["g",{"id":"0mv-2"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s7"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-2"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s7"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-2"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s7"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-2"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s7"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-2"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s7"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-2"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s7"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-2"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s7"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-2"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s7"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-2"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-2"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s7"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-2"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s7"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-2"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s7"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"0mv-3"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s8"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-3"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s8"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-3"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s8"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-3"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s8"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-3"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s8"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-3"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s8"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-3"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s8"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-3"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s8"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-3"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-3"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s8"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-3"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s8"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-3"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s8"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"0mv-4"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s9"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-4"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s9"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-4"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s9"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-4"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s9"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-4"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s9"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-4"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s9"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-4"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s9"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-4"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s9"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-4"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-4"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s9"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-4"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s9"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-4"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s9"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"0mv-5"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s10"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-5"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s10"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-5"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s10"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-5"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s10"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-5"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s10"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-5"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s10"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-5"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s10"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-5"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s10"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-5"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-5"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s10"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-5"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s10"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-5"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s10"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"0mv-6"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s11"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-6"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s11"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-6"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s11"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-6"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s11"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-6"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s11"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-6"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s11"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-6"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s11"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-6"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s11"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-6"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-6"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s11"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-6"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s11"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-6"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s11"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"0mv-7"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s12"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-7"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s12"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-7"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s12"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-7"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s12"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-7"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s12"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-7"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s12"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-7"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s12"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-7"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s12"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-7"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-7"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s12"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-7"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s12"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-7"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s12"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"0mv-8"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s13"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-8"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s13"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-8"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s13"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-8"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s13"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-8"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s13"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-8"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s13"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-8"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s13"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-8"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s13"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-8"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-8"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s13"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-8"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s13"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-8"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s13"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"0mv-9"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s14"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-9"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s14"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-9"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s14"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-9"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s14"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-9"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s14"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-9"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s14"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-9"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s14"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-9"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s14"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-9"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-9"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s14"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-9"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s14"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-9"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s14"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"vmv-2-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-2-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-2-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-2-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-2-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-2-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-2-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-2-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["marker",{"id":"arrowhead","style":"fill:#0041c4","markerHeight":"7","markerWidth":"10","markerUnits":"strokeWidth","viewBox":"0 -4 11 8","refX":"15","refY":"0","orient":"auto"},["path",{"d":"M0 -4 11 0 0 4z"}]],["marker",{"id":"arrowtail","style":"fill:#0041c4","markerHeight":"7","markerWidth":"10","markerUnits":"strokeWidth","viewBox":"-11 -4 11 8","refX":"-15","refY":"0","orient":"auto"},["path",{"d":"M0 -4 -11 0 0 4z"}]]],["g",{"id":"waves"},["g",{"id":"lanes"}],["g",{"id":"groups"}]]];
try { module.exports = WaveSkin; } catch(err) {}


},{}]},{},[1]);
