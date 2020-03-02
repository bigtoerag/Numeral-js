// numeral.js format configuration
// format : bits
// author : Marcus Booth

(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['../numeral'], factory);
    } else if (typeof module === 'object' && module.exports) {
        factory(require('../numeral'));
    } else {
        factory(global.numeral);
    }
}(this, function (numeral) {
    var Decimal = {
            base: 1000,
            suffixes: ['b', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb']
        },
        binary = {
            base: 1024,
            suffixes: ['b', 'Kib', 'Mib', 'Gib', 'Tib', 'Pib', 'Eib', 'Zib', 'Yib']
        };

    var allSuffixes =  decimal.suffixes.concat(binary.suffixes.filter(function (item) {
            return decimal.suffixes.indexOf(item) < 0;
        }));
        var unformatRegex = allSuffixes.join('|');
        // Allow support for BPS (http://www.investopedia.com/terms/b/basispoint.asp)
        unformatRegex = '(' + unformatRegex.replace('B', 'B(?!PS)') + ')';

    numeral.register('format', 'bits', {
        regexps: {
            format: /([0\s]i?b)/,
            unformat: new RegExp(unformatRegex)
        },
        format: function(value, format, roundingFunction) {
            var output,
                bits = numeral._.includes(format, 'ib') ? binary : decimal,
                suffix = numeral._.includes(format, ' b') || numeral._.includes(format, ' ib') ? ' ' : '',
                power,
                min,
                max;

            // check for space before
            format = format.replace(/\s?i?b/, '');

            for (power = 0; power <= bits.suffixes.length; power++) {
                min = Math.pow(bits.base, power);
                max = Math.pow(bits.base, power + 1);

                if (value === null || value === 0 || value >= min && value < max) {
                    suffix += bits.suffixes[power];

                    if (min > 0) {
                        value = value / min;
                    }

                    break;
                }
            }

            output = numeral._.numberToFormat(value, format, roundingFunction);

            return output + suffix;
        },
        unformat: function(string) {
            var value = numeral._.stringToNumber(string),
                power,
                bitsMultiplier;

            if (value) {
                for (power = decimal.suffixes.length - 1; power >= 0; power--) {
                    if (numeral._.includes(string, decimal.suffixes[power])) {
                        bitsMultiplier = Math.pow(decimal.base, power);

                        break;
                    }

                    if (numeral._.includes(string, binary.suffixes[power])) {
                        bitsMultiplier = Math.pow(binary.base, power);

                        break;
                    }
                }

                value *= (bitsMultiplier || 1);
            }

            return value;
        }
    });
}));
