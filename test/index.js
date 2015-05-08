var Q = require('q');
var assert = require('assert');
var Parser = require('../index.js');

it('simple', function() {
    var parser = Parser();
    parser.registerLineProcessor(/^\d+/, function(line, number, result) {
        result.push(number);
    });
    return parser.parse('foo\n1\nbar\n2\nbaz', []).then(function(result) {
        assert.deepEqual(result, ['1', '2']);
    });
});

it('recursively', function() {
    var parser = Parser();
    parser.registerLineProcessor(/^\*(\d+)/, function(line, match, number, result) {
        result.push(number);
    });
    parser.registerLineProcessor(/^\d+/, function(line, number) {
        return '*' + (number * number) + '\n';
    });
    return parser.parse('foo\n2\nbar\n3\nbaz', []).then(function(result) {
        assert.deepEqual(result, ['4', '9']);
    });
});

it('recursively promise', function() {
    var parser = Parser();
    parser.registerLineProcessor(/^\*(\d+)/, function(line, match, number, result) {
        result.push(number);
    });
    parser.registerLineProcessor(/^\d+/, function(line, number) {
        return Q.Promise(function(resolve) {
            setTimeout(function() {
                resolve('*' + (number * number) + '\n');
            }, 200);
        });
    });
    return parser.parse('foo\n2\nbar\n3\nbaz', []).then(function(result) {
        assert.deepEqual(result, ['4', '9']);
    });
});
