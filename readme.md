# Line-by-line recursively parser

### Simple

    var parser = require('parser')();
    parser.registerLineProcessor(/^#(\d+)/, function(line, match, number) {
        console.log(number);
    });
    parser.parse(['foo', '#1', 'bar', '#2', 'baz'].join('\n'));
    // result: 1, 2

### Recursively

    var parser = require('parser')();
    parser.registerLineProcessor(/^#(\d+)/, function(line, match, number) {
        console.log(number);
    });
    parser.registerLineProcessor(/^\d+/, function(line, number) {
        return '#' + (number * number) + '\n';
    });
    parser.parse(['foo', '#1', 'bar', '#2', 'baz', '3']);
    // result: 1, 2, 9

### Recursively async

    var parser = require('parser')();
    parser.registerLineProcessor(/^#(\d+)/, function(line, match, number) {
        console.log(number);
    });
    parser.registerLineProcessor(/^\d+/, function(line, number) {
        return Q.Promise(function(resolve) {
            setTimeout(function() {
                resolve('#' + (number * number) + '\n');
            }, 200);
        });
    });
    parser.parse(['foo', '#1', 'bar', '#2', 'baz', '3']).then(function() {
        console.log('end');
    });
    // result: 1, 2, 9, end

### Meta data

    var parser = Parser();
    parser.registerLineProcessor(/^\d+/, function(line, number, meta) {
        meta.push(number);
    });
    var metaData = [];
    return parser.parse('foo\n1\nbar\n2\nbaz', metaData).then(function(meta) {
        console.log(meta);
    });
    // result: ['1', '2']

### Trim lines

    var parser = require('parser')(true);
    parser.registerLineProcessor(/^#(\d+)/, function(line, match, number) {
        console.log(number);
    });
    parser.parse(['foo', '   #1   ', 'bar', '   #2   ', 'baz'].join('\n'));
    // result: 1, 2


## API

* `Constructor([boolean, optional] trimLine)`
* `parser.registerLineProcessor([RegExp] pattern, [Function] fn)`. Fn arguments: line, RegExp.$0, RegExp.$1, ..., meta
* `[Promise] parser.parse([string] input)`
