var iclass = require('iclass');
var {Writable} = require('stream');

module.exports = function(trimLines) {
    return new module.exports.Parser(trimLines);
};

module.exports.Parser = iclass.create(Writable, {
    constructor: function(trimLines) {
        Writable.call(this, {decodeStrings: false});

        this._trimLines = trimLines;
        this._processors = [];
        this._tail = '';
    },

    registerLineProcessor: function(pattern, fn) {
        this._processors.unshift({pattern: pattern, fn: fn});
    },


    _write: function(chunk, enc, callback) {
        var isEnd = false;
        if (chunk == null) {
            isEnd = true;
        } else {
            this._tail += chunk;
        }

        var next = () => {
            var newLineIndex = this._tail.indexOf('\n');
            if (newLineIndex > -1 || (isEnd && this._tail.length > 0)) {
                if (newLineIndex == -1) {
                    newLineIndex = this._tail.length;
                }
                var line = this._tail.substring(0, newLineIndex + 1);
                this._tail = this._tail.substring(newLineIndex + 1);

                var preparedLine = this._trimLines ? line.trim() : line;
                return Promise.resolve().then(() => {
                    for (var i = 0; i < this._processors.length; i++) {
                        var matches = preparedLine.match(this._processors[i].pattern);
                        if (matches) {
                            return Promise.resolve().then(() => {
                                return this._processors[i].fn.apply(null, matches.concat([line]));
                            }).then((processorResult) => {
                                if (typeof processorResult == 'string') {
                                    this._tail = processorResult + this._tail;
                                }
                            });
                        }
                    }
                }).then(next);
            }
        };

        Promise.resolve(next()).then(() => {
            callback();
        }).catch(callback);
    }
});
