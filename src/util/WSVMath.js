

export default class WSVMath {
    // https://stackoverflow.com/questions/846221/logarithmic-slider
    static lin2log(value, imin, imax, omin, omax) {
        // The result should be between min and max
        const minv = Math.log(omin);
        const maxv = Math.log(omax);

        // calculate adjustment factor
        const scale = (maxv - minv) / (imax - imin);

        return Math.exp(minv + scale * (value - imin));
    }
}

