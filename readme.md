# Line-by-line recursively parser

Parser is Writable stream.

### Simple

    var parser = require('lblr-parser')();
    parser.registerLineProcessor(/^#(\d+)/, function(match, number) {
        console.log(number);
    });
    parser.end(['foo', '#1', 'bar', '#2', 'baz'].join('\n'));
    // result: 1, 2

### Recursively

    var parser = require('lblr-parser')();
    parser.registerLineProcessor(/^#(\d+)/, function(match, number) {
        console.log(number);
    });
    parser.registerLineProcessor(/^\d+/, function(number) {
        return '#' + (number * number) + '\n';
    });
    parser.end(['foo', '#1', 'bar', '#2', 'baz', '3'].join(\n));
    // result: 1, 2, 9

### Recursively async

    var parser = require('lblr-parser')();
    parser.registerLineProcessor(/^#(\d+)/, function(match, number) {
        console.log(number);
    });
    parser.registerLineProcessor(/^\d+/, function(number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('#' + (number * number) + '\n');
            }, 200);
        });
    });
    parser.end(['foo', '#1', 'bar', '#2', 'baz', '3'].join('\n'));
    // result: 1, 2, 9


## API

* `Constructor([boolean, optional] trimLine)`
* `parser.registerLineProcessor([RegExp] pattern, [Function] fn)`. Fn arguments: line, RegExp.$0, RegExp.$1, ..., meta
