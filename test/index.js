var assert = require('assert');
var createParser = require('..');
var {Readable} = require('stream');
var fs = require('fs');
var path = require('path');

it('simple', function(callback) {
    var parser = createParser();
    var result = [];
    parser.on('complete', () => {
        try {
            assert.deepEqual(result, ['1', '2']);
        } catch (e) {
            return callback(e);
        }
        callback();
    });
    parser.on('error', callback);

    parser.registerLineProcessor(/^\d+/, function(number) {
        result.push(number);
    });
    parser.write('foo\n');
    parser.write('1\n');
    parser.write('foo\n');
    parser.write('2\n');
    parser.write('foo\n');
    parser.end('bar');
});

it('last line', function(callback) {
    var parser = createParser();
    var result = [];
    parser.on('complete', () => {
        try {
            assert.deepEqual(result, ['2', '3']);
        } catch (e) {
            return callback(e);
        }
        callback();
    });
    parser.on('error', callback);

    parser.registerLineProcessor(/^\d+/, function(number) {
        result.push(number);
    });
    parser.end('foo\n2\nbar\n3');
});

it('big chunk', function(callback) {
    var parser = createParser();
    var result = [];
    parser.on('complete', () => {
        try {
            assert.deepEqual(result, ['1', '2']);
        } catch (e) {
            return callback(e);
        }
        callback();
    });
    parser.on('error', callback);

    parser.registerLineProcessor(/^\d+/, function(number) {
        result.push(number);
    });
    parser.end('foo\n1\nfoo\n2\nfoo\n');
});

it('recursively', function(callback) {
    var parser = createParser();
    var result = [];
    parser.on('complete', () => {
        try {
            assert.deepEqual(result, ['4', '9']);
        } catch (e) {
            return callback(e);
        }
        callback();
    });
    parser.on('error', callback);

    parser.registerLineProcessor(/^\*(\d+)/, function(match, number) {
        result.push(number);
    });
    parser.registerLineProcessor(/^\d+/, function(number) {
        return '*' + (number * number) + '\n';
    });
    parser.end('foo\n2\nbar\n3\nbaz');
});

it('recursively promise', function(callback) {
    var parser = createParser();
    var result = [];
    parser.on('complete', () => {
        try {
            assert.deepEqual(result, ['4', '9']);
        } catch (e) {
            return callback(e);
        }
        callback();
    });
    parser.on('error', callback);

    parser.registerLineProcessor(/^\*(\d+)/, function(match, number) {
        result.push(number);
    });
    parser.registerLineProcessor(/^\d+/, function(number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('*' + (number * number) + '\n');
            }, 20);
        });
    });
    parser.end('foo\n2\nbar\n3\nbaz');
});

it('processors sorting', function(callback) {
    var parser = createParser();
    var result = [];
    parser.on('complete', () => {
        try {
            assert.deepEqual(result, ['2', '3']);
        } catch (e) {
            return callback(e);
        }
        callback();
    });
    parser.on('error', callback);

    parser.registerLineProcessor(/^\d+/, function() {

    });
    parser.registerLineProcessor(/^\d+/, function(number) {
        result.push(number);
    });
    parser.end('foo\n2\nbar\n3\nbaz');
});

it('pipe', function(callback) {
    var parser = createParser();
    var result = [];
    parser.on('complete', () => {
        try {
            assert.deepEqual(result, ['2', '3']);
        } catch (e) {
            return callback(e);
        }
        callback();
    });
    parser.on('error', callback);

    parser.registerLineProcessor(/^\d+/, function(number) {
        result.push(number);
    });

    var readable = new Readable();
    readable.push('foo\n2\nbar\n3\nbaz');
    readable.push(null);
    readable.pipe(parser);
});

it('file', function(callback) {
    var parser = createParser();
    var result = [];
    parser.on('complete', () => {
        try {
            assert.deepEqual(result, ['2', '3']);
        } catch (e) {
            return callback(e);
        }
        callback();
    });
    parser.on('error', callback);

    parser.registerLineProcessor(/^\d+/, function(number) {
        result.push(number);
    });

    fs.createReadStream(path.join(__dirname, 'test.txt'), 'utf8').pipe(parser);
});
