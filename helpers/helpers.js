
const math = {
    precision: function (number) {
        return (number + "").split(".")[1]?.length ?? 1;
    },
    exponent: function (first_precision, second_precision) {
        const exponent = (first_precision > second_precision) ? first_precision : second_precision;
        return exponent;
    },
    power: function (base, exponent) {
        return Math.pow(base, exponent);
    },
    add: function (first_number, second_number) {
        const first_precision = this.precision(first_number);
        const second_precision = this.precision(second_number);

        const base = 10;
        const exponent = this.exponent(first_precision, second_precision);
        const power = this.power(base, exponent);

        const add = (first_number * power) + (second_number * power);

        const result = Number((add / Math.pow(base, exponent)).toFixed(8));

        return result;
    },
    minus: function (first_number, second_number) {
        const first_precision = this.precision(first_number);
        const second_precision = this.precision(second_number);

        const base = 10;
        const exponent = this.exponent(first_precision, second_precision);
        const power = this.power(base, exponent);

        const minus = (first_number * power) - (second_number * power);

        const result = Number((minus / Math.pow(base, exponent)).toFixed(8));

        return result;
    },
    multiply: function (first_number, second_number) {
        const first_precision = this.precision(first_number);
        const second_precision = this.precision(second_number);

        const base = 10;
        const exponent = this.exponent(first_precision, second_precision);
        const power = this.power(base, exponent);

        const multiply = (first_number * power) * (second_number * power);

        const result = Number((multiply / Math.pow(base, (exponent + exponent))).toFixed(8));

        return result;
    },
    divide: function (first_number, second_number) {
        const first_precision = this.precision(first_number);
        const second_precision = this.precision(second_number);

        const base = 10;
        const exponent = this.exponent(first_precision, second_precision);
        const power = this.power(base, exponent);

        const divide = (first_number * power) / (second_number * power);

        const result = Number(divide.toFixed(8));

        return result;
    }
};

module.exports = { math };