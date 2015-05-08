var Q = require('q');

module.exports = function(trimLines) {
    return new LBLRParser(trimLines);
};

var LBLRParser = function(trimLines) {
    this._trimLines = trimLines;
    this._processors = [];
};

LBLRParser.prototype.parse = function(input, meta) {
    var processors = this._processors;
    var trimLines = this._trimLines;
    return Q.Promise(function(resolve, reject) {
        (function next() {
            while (input.length) {
                var lnIndex = input.indexOf('\n');
                if (lnIndex == -1) {
                    lnIndex = input.length;
                }
                var line = input.substr(0, lnIndex + 1);
                input = input.substr(lnIndex + 1);
                var preparedLine = trimLines ? line.trim() : line;
                for (var i = 0; i < processors.length; i++) {
                    var matches = preparedLine.match(processors[i].pattern);
                    if (matches) {
                        var processorResult = processors[i].fn.apply(null, [line].concat(matches).concat([meta]));
                        if (processorResult && typeof processorResult.then == 'function') {
                            processorResult.then(function(result) {
                                if (typeof result == 'string') {
                                    input = result + input;
                                }
                                next();
                            }, function(err) {
                                reject(err);
                            });
                            return;
                        }
                        if (typeof processorResult == 'string') {
                            input = processorResult + input;
                        }
                        break;
                    }
                }
            }
            setImmediate(function() {
                resolve(meta);
            });
        })();
    });
};

LBLRParser.prototype.registerLineProcessor = function(pattern, fn) {
    this._processors.unshift({
        pattern: pattern,
        fn: fn
    });
};


exports.Parser = LBLRParser;
