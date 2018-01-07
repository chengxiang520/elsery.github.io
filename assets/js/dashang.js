function QR8bitByte(a) {
    this.mode = QRMode.MODE_8BIT_BYTE;
    this.data = a
}
QR8bitByte.prototype = {
    getLength: function(a) {
        return this.data.length
    },
    write: function(a) {
        for (var b = 0; b < this.data.length; b++)
            a.put(this.data.charCodeAt(b), 8)
    }
};
function QRCode(a, b) {
    this.typeNumber = a;
    this.errorCorrectLevel = b;
    this.modules = null;
    this.moduleCount = 0;
    this.dataCache = null;
    this.dataList = []
}
QRCode.prototype = {
    addData: function(a) {
        a = new QR8bitByte(a);
        this.dataList.push(a);
        this.dataCache = null
    },
    isDark: function(a, b) {
        if (0 > a || this.moduleCount <= a || 0 > b || this.moduleCount <= b)
            throw Error(a + "," + b);
        return this.modules[a][b]
    },
    getModuleCount: function() {
        return this.moduleCount
    },
    make: function() {
        if (1 > this.typeNumber) {
            for (var a = 1, a = 1; 40 > a; a++) {
                for (var b = QRRSBlock.getRSBlocks(a, this.errorCorrectLevel), d = new QRBitBuffer, c = 0, e = 0; e < b.length; e++)
                    c += b[e].dataCount;
                for (e = 0; e < this.dataList.length; e++)
                    b = this.dataList[e],
                    d.put(b.mode, 4),
                    d.put(b.getLength(), QRUtil.getLengthInBits(b.mode, a)),
                    b.write(d);
                if (d.getLengthInBits() <= 8 * c)
                    break
            }
            this.typeNumber = a
        }
        this.makeImpl(!1, this.getBestMaskPattern())
    },
    makeImpl: function(a, b) {
        this.moduleCount = 4 * this.typeNumber + 17;
        this.modules = Array(this.moduleCount);
        for (var d = 0; d < this.moduleCount; d++) {
            this.modules[d] = Array(this.moduleCount);
            for (var c = 0; c < this.moduleCount; c++)
                this.modules[d][c] = null
        }
        this.setupPositionProbePattern(0, 0);
        this.setupPositionProbePattern(this.moduleCount - 7, 0);
        this.setupPositionProbePattern(0, this.moduleCount - 7);
        this.setupPositionAdjustPattern();
        this.setupTimingPattern();
        this.setupTypeInfo(a, b);
        7 <= this.typeNumber && this.setupTypeNumber(a);
        null == this.dataCache && (this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList));
        this.mapData(this.dataCache, b)
    },
    setupPositionProbePattern: function(a, b) {
        for (var d = -1; 7 >= d; d++)
            if (!(-1 >= a + d || this.moduleCount <= a + d))
                for (var c = -1; 7 >= c; c++)
                    -1 >= b + c || this.moduleCount <= b + c || (this.modules[a + d][b + c] = 0 <= d && 6 >= d && (0 == c || 6 == c) || 0 <= c && 6 >= c && (0 == d || 6 == d) || 2 <= d && 4 >= d && 2 <= c && 4 >= c ? !0 : !1)
    },
    getBestMaskPattern: function() {
        for (var a = 0, b = 0, d = 0; 8 > d; d++) {
            this.makeImpl(!0, d);
            var c = QRUtil.getLostPoint(this);
            if (0 == d || a > c)
                a = c,
                b = d
        }
        return b
    },
    createMovieClip: function(a, b, d) {
        a = a.createEmptyMovieClip(b, d);
        this.make();
        for (b = 0; b < this.modules.length; b++) {
            d = 1 * b;
            for (var c = 0; c < this.modules[b].length; c++) {
                var e = 1 * c;
                this.modules[b][c] && (a.beginFill(0, 100),
                a.moveTo(e, d),
                a.lineTo(e + 1, d),
                a.lineTo(e + 1, d + 1),
                a.lineTo(e, d + 1),
                a.endFill())
            }
        }
        return a
    },
    setupTimingPattern: function() {
        for (var a = 8; a < this.moduleCount - 8; a++)
            null == this.modules[a][6] && (this.modules[a][6] = 0 == a % 2);
        for (a = 8; a < this.moduleCount - 8; a++)
            null == this.modules[6][a] && (this.modules[6][a] = 0 == a % 2)
    },
    setupPositionAdjustPattern: function() {
        for (var a = QRUtil.getPatternPosition(this.typeNumber), b = 0; b < a.length; b++)
            for (var d = 0; d < a.length; d++) {
                var c = a[b]
                  , e = a[d];
                if (null == this.modules[c][e])
                    for (var f = -2; 2 >= f; f++)
                        for (var h = -2; 2 >= h; h++)
                            this.modules[c + f][e + h] = -2 == f || 2 == f || -2 == h || 2 == h || 0 == f && 0 == h ? !0 : !1
            }
    },
    setupTypeNumber: function(a) {
        for (var b = QRUtil.getBCHTypeNumber(this.typeNumber), d = 0; 18 > d; d++) {
            var c = !a && 1 == (b >> d & 1);
            this.modules[Math.floor(d / 3)][d % 3 + this.moduleCount - 8 - 3] = c
        }
        for (d = 0; 18 > d; d++)
            c = !a && 1 == (b >> d & 1),
            this.modules[d % 3 + this.moduleCount - 8 - 3][Math.floor(d / 3)] = c
    },
    setupTypeInfo: function(a, b) {
        for (var d = QRUtil.getBCHTypeInfo(this.errorCorrectLevel << 3 | b), c = 0; 15 > c; c++) {
            var e = !a && 1 == (d >> c & 1);
            6 > c ? this.modules[c][8] = e : 8 > c ? this.modules[c + 1][8] = e : this.modules[this.moduleCount - 15 + c][8] = e
        }
        for (c = 0; 15 > c; c++)
            e = !a && 1 == (d >> c & 1),
            8 > c ? this.modules[8][this.moduleCount - c - 1] = e : 9 > c ? this.modules[8][15 - c - 1 + 1] = e : this.modules[8][15 - c - 1] = e;
        this.modules[this.moduleCount - 8][8] = !a
    },
    mapData: function(a, b) {
        for (var d = -1, c = this.moduleCount - 1, e = 7, f = 0, h = this.moduleCount - 1; 0 < h; h -= 2)
            for (6 == h && h--; ; ) {
                for (var g = 0; 2 > g; g++)
                    if (null == this.modules[c][h - g]) {
                        var k = !1;
                        f < a.length && (k = 1 == (a[f] >>> e & 1));
                        QRUtil.getMask(b, c, h - g) && (k = !k);
                        this.modules[c][h - g] = k;
                        e--;
                        -1 == e && (f++,
                        e = 7)
                    }
                c += d;
                if (0 > c || this.moduleCount <= c) {
                    c -= d;
                    d = -d;
                    break
                }
            }
    }
};
QRCode.PAD0 = 236;
QRCode.PAD1 = 17;
QRCode.createData = function(a, b, d) {
    b = QRRSBlock.getRSBlocks(a, b);
    for (var c = new QRBitBuffer, e = 0; e < d.length; e++) {
        var f = d[e];
        c.put(f.mode, 4);
        c.put(f.getLength(), QRUtil.getLengthInBits(f.mode, a));
        f.write(c)
    }
    for (e = a = 0; e < b.length; e++)
        a += b[e].dataCount;
    if (c.getLengthInBits() > 8 * a)
        throw Error("code length overflow. (" + c.getLengthInBits() + "\x3e" + 8 * a + ")");
    for (c.getLengthInBits() + 4 <= 8 * a && c.put(0, 4); 0 != c.getLengthInBits() % 8; )
        c.putBit(!1);
    for (; !(c.getLengthInBits() >= 8 * a); ) {
        c.put(QRCode.PAD0, 8);
        if (c.getLengthInBits() >= 8 * a)
            break;
        c.put(QRCode.PAD1, 8)
    }
    return QRCode.createBytes(c, b)
}
;
QRCode.createBytes = function(a, b) {
    for (var d = 0, c = 0, e = 0, f = Array(b.length), h = Array(b.length), g = 0; g < b.length; g++) {
        var k = b[g].dataCount
          , m = b[g].totalCount - k
          , c = Math.max(c, k)
          , e = Math.max(e, m);
        f[g] = Array(k);
        for (var l = 0; l < f[g].length; l++)
            f[g][l] = 255 & a.buffer[l + d];
        d += k;
        l = QRUtil.getErrorCorrectPolynomial(m);
        k = (new QRPolynomial(f[g],l.getLength() - 1)).mod(l);
        h[g] = Array(l.getLength() - 1);
        for (l = 0; l < h[g].length; l++)
            m = l + k.getLength() - h[g].length,
            h[g][l] = 0 <= m ? k.get(m) : 0
    }
    for (l = g = 0; l < b.length; l++)
        g += b[l].totalCount;
    d = Array(g);
    for (l = k = 0; l < c; l++)
        for (g = 0; g < b.length; g++)
            l < f[g].length && (d[k++] = f[g][l]);
    for (l = 0; l < e; l++)
        for (g = 0; g < b.length; g++)
            l < h[g].length && (d[k++] = h[g][l]);
    return d
}
;
for (var QRMode = {
    MODE_NUMBER: 1,
    MODE_ALPHA_NUM: 2,
    MODE_8BIT_BYTE: 4,
    MODE_KANJI: 8
}, QRErrorCorrectLevel = {
    L: 1,
    M: 0,
    Q: 3,
    H: 2
}, QRMaskPattern = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
}, QRUtil = {
    PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],
    G15: 1335,
    G18: 7973,
    G15_MASK: 21522,
    getBCHTypeInfo: function(a) {
        for (var b = a << 10; 0 <= QRUtil.getBCHDigit(b) - QRUtil.getBCHDigit(QRUtil.G15); )
            b ^= QRUtil.G15 << QRUtil.getBCHDigit(b) - QRUtil.getBCHDigit(QRUtil.G15);
        return (a << 10 | b) ^ QRUtil.G15_MASK
    },
    getBCHTypeNumber: function(a) {
        for (var b = a << 12; 0 <= QRUtil.getBCHDigit(b) - QRUtil.getBCHDigit(QRUtil.G18); )
            b ^= QRUtil.G18 << QRUtil.getBCHDigit(b) - QRUtil.getBCHDigit(QRUtil.G18);
        return a << 12 | b
    },
    getBCHDigit: function(a) {
        for (var b = 0; 0 != a; )
            b++,
            a >>>= 1;
        return b
    },
    getPatternPosition: function(a) {
        return QRUtil.PATTERN_POSITION_TABLE[a - 1]
    },
    getMask: function(a, b, d) {
        switch (a) {
        case QRMaskPattern.PATTERN000:
            return 0 == (b + d) % 2;
        case QRMaskPattern.PATTERN001:
            return 0 == b % 2;
        case QRMaskPattern.PATTERN010:
            return 0 == d % 3;
        case QRMaskPattern.PATTERN011:
            return 0 == (b + d) % 3;
        case QRMaskPattern.PATTERN100:
            return 0 == (Math.floor(b / 2) + Math.floor(d / 3)) % 2;
        case QRMaskPattern.PATTERN101:
            return 0 == b * d % 2 + b * d % 3;
        case QRMaskPattern.PATTERN110:
            return 0 == (b * d % 2 + b * d % 3) % 2;
        case QRMaskPattern.PATTERN111:
            return 0 == (b * d % 3 + (b + d) % 2) % 2;
        default:
            throw Error("bad maskPattern:" + a);
        }
    },
    getErrorCorrectPolynomial: function(a) {
        for (var b = new QRPolynomial([1],0), d = 0; d < a; d++)
            b = b.multiply(new QRPolynomial([1, QRMath.gexp(d)],0));
        return b
    },
    getLengthInBits: function(a, b) {
        if (1 <= b && 10 > b)
            switch (a) {
            case QRMode.MODE_NUMBER:
                return 10;
            case QRMode.MODE_ALPHA_NUM:
                return 9;
            case QRMode.MODE_8BIT_BYTE:
                return 8;
            case QRMode.MODE_KANJI:
                return 8;
            default:
                throw Error("mode:" + a);
            }
        else if (27 > b)
            switch (a) {
            case QRMode.MODE_NUMBER:
                return 12;
            case QRMode.MODE_ALPHA_NUM:
                return 11;
            case QRMode.MODE_8BIT_BYTE:
                return 16;
            case QRMode.MODE_KANJI:
                return 10;
            default:
                throw Error("mode:" + a);
            }
        else if (41 > b)
            switch (a) {
            case QRMode.MODE_NUMBER:
                return 14;
            case QRMode.MODE_ALPHA_NUM:
                return 13;
            case QRMode.MODE_8BIT_BYTE:
                return 16;
            case QRMode.MODE_KANJI:
                return 12;
            default:
                throw Error("mode:" + a);
            }
        else
            throw Error("type:" + b);
    },
    getLostPoint: function(a) {
        for (var b = a.getModuleCount(), d = 0, c = 0; c < b; c++)
            for (var e = 0; e < b; e++) {
                for (var f = 0, h = a.isDark(c, e), g = -1; 1 >= g; g++)
                    if (!(0 > c + g || b <= c + g))
                        for (var k = -1; 1 >= k; k++)
                            0 > e + k || b <= e + k || 0 == g && 0 == k || h != a.isDark(c + g, e + k) || f++;
                5 < f && (d += 3 + f - 5)
            }
        for (c = 0; c < b - 1; c++)
            for (e = 0; e < b - 1; e++)
                if (f = 0,
                a.isDark(c, e) && f++,
                a.isDark(c + 1, e) && f++,
                a.isDark(c, e + 1) && f++,
                a.isDark(c + 1, e + 1) && f++,
                0 == f || 4 == f)
                    d += 3;
        for (c = 0; c < b; c++)
            for (e = 0; e < b - 6; e++)
                a.isDark(c, e) && !a.isDark(c, e + 1) && a.isDark(c, e + 2) && a.isDark(c, e + 3) && a.isDark(c, e + 4) && !a.isDark(c, e + 5) && a.isDark(c, e + 6) && (d += 40);
        for (e = 0; e < b; e++)
            for (c = 0; c < b - 6; c++)
                a.isDark(c, e) && !a.isDark(c + 1, e) && a.isDark(c + 2, e) && a.isDark(c + 3, e) && a.isDark(c + 4, e) && !a.isDark(c + 5, e) && a.isDark(c + 6, e) && (d += 40);
        for (e = f = 0; e < b; e++)
            for (c = 0; c < b; c++)
                a.isDark(c, e) && f++;
        a = Math.abs(100 * f / b / b - 50) / 5;
        return d + 10 * a
    }
}, QRMath = {
    glog: function(a) {
        if (1 > a)
            throw Error("glog(" + a + ")");
        return QRMath.LOG_TABLE[a]
    },
    gexp: function(a) {
        for (; 0 > a; )
            a += 255;
        for (; 256 <= a; )
            a -= 255;
        return QRMath.EXP_TABLE[a]
    },
    EXP_TABLE: Array(256),
    LOG_TABLE: Array(256)
}, i = 0; 8 > i; i++)
    QRMath.EXP_TABLE[i] = 1 << i;
for (i = 8; 256 > i; i++)
    QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
for (i = 0; 255 > i; i++)
    QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
function QRPolynomial(a, b) {
    if (void 0 == a.length)
        throw Error(a.length + "/" + b);
    for (var d = 0; d < a.length && 0 == a[d]; )
        d++;
    this.num = Array(a.length - d + b);
    for (var c = 0; c < a.length - d; c++)
        this.num[c] = a[c + d]
}
QRPolynomial.prototype = {
    get: function(a) {
        return this.num[a]
    },
    getLength: function() {
        return this.num.length
    },
    multiply: function(a) {
        for (var b = Array(this.getLength() + a.getLength() - 1), d = 0; d < this.getLength(); d++)
            for (var c = 0; c < a.getLength(); c++)
                b[d + c] ^= QRMath.gexp(QRMath.glog(this.get(d)) + QRMath.glog(a.get(c)));
        return new QRPolynomial(b,0)
    },
    mod: function(a) {
        if (0 > this.getLength() - a.getLength())
            return this;
        for (var b = QRMath.glog(this.get(0)) - QRMath.glog(a.get(0)), d = Array(this.getLength()), c = 0; c < this.getLength(); c++)
            d[c] = this.get(c);
        for (c = 0; c < a.getLength(); c++)
            d[c] ^= QRMath.gexp(QRMath.glog(a.get(c)) + b);
        return (new QRPolynomial(d,0)).mod(a)
    }
};
function QRRSBlock(a, b) {
    this.totalCount = a;
    this.dataCount = b
}
QRRSBlock.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];
QRRSBlock.getRSBlocks = function(a, b) {
    var d = QRRSBlock.getRsBlockTable(a, b);
    if (void 0 == d)
        throw Error("bad rs block @ typeNumber:" + a + "/errorCorrectLevel:" + b);
    for (var c = d.length / 3, e = [], f = 0; f < c; f++)
        for (var h = d[3 * f + 0], g = d[3 * f + 1], k = d[3 * f + 2], m = 0; m < h; m++)
            e.push(new QRRSBlock(g,k));
    return e
}
;
QRRSBlock.getRsBlockTable = function(a, b) {
    switch (b) {
    case QRErrorCorrectLevel.L:
        return QRRSBlock.RS_BLOCK_TABLE[4 * (a - 1) + 0];
    case QRErrorCorrectLevel.M:
        return QRRSBlock.RS_BLOCK_TABLE[4 * (a - 1) + 1];
    case QRErrorCorrectLevel.Q:
        return QRRSBlock.RS_BLOCK_TABLE[4 * (a - 1) + 2];
    case QRErrorCorrectLevel.H:
        return QRRSBlock.RS_BLOCK_TABLE[4 * (a - 1) + 3]
    }
}
;
function QRBitBuffer() {
    this.buffer = [];
    this.length = 0
}
QRBitBuffer.prototype = {
    get: function(a) {
        return 1 == (this.buffer[Math.floor(a / 8)] >>> 7 - a % 8 & 1)
    },
    put: function(a, b) {
        for (var d = 0; d < b; d++)
            this.putBit(1 == (a >>> b - d - 1 & 1))
    },
    getLengthInBits: function() {
        return this.length
    },
    putBit: function(a) {
        var b = Math.floor(this.length / 8);
        this.buffer.length <= b && this.buffer.push(0);
        a && (this.buffer[b] |= 128 >>> this.length % 8);
        this.length++
    }
};
var tctipUtil = {
    createElement: function(a, b, d) {
        b = document.createElement(b || "div");
        for (var c in a)
            "style" == c ? b[c].cssText = a[c] : b[c] = a[c];
        return (d || document.body).appendChild(b)
    },
    getElementsByClassName: function(a, b) {
        b = b || document;
        if (b.getElementsByClassName)
            return b.getElementsByClassName(a);
        var d = [], c = b.getElementsByTagName("*"), e = c.length, f = RegExp("(^|\\s)" + a + "(\\s|$)"), h, g;
        for (g = h = 0; h < e; h++)
            f.test(c[h].className) && (d[g] = c[h],
            g++);
        return d
    },
    getTextKey: function() {
        return "firefox" == tctipUtil.getExplorer() ? "textContent" : "innerText"
    },
    getExplorer: function() {
        var a = window.navigator.userAgent.toLowerCase();
        if (0 <= a.indexOf("msie"))
            return "ie";
        if (0 <= a.indexOf("firefox"))
            return "firefox";
        if (0 <= a.indexOf("chrome"))
            return "chrome";
        if (0 <= a.indexOf("opera"))
            return "opera";
        if (0 <= a.indexOf("safari"))
            return "safari"
    },
    addLoadEvent: function(a) {
        if ("function" != typeof window.onload)
            window.onload = a;
        else {
            var b = window.onload;
            window.onload = function() {
                b();
                a()
            }
        }
    },
    isSupportCanvas: function() {
        try {
            return document.createElement("canvas").getContext("2d"),
            !0
        } catch (a) {
            return !1
        }
    },
    isMouseLeaveOrEnter: function(a, b) {
        if ("mouseout" != a.type && "mouseover" != a.type)
            return !1;
        for (var d = a.relatedTarget ? a.relatedTarget : "mouseout" == a.type ? a.toElement : a.fromElement; d && d != b; )
            d = d.parentNode;
        return d != b
    },
    currentEvent: function() {
        if (document.all)
            return window.event;
        for (func = tctipUtil.currentEvent.caller; null != func; ) {
            var a = func.arguments[0];
            if (a && (a.constructor == Event || a.constructor == MouseEvent || "object" == typeof a && a.preventDefault && a.stopPropagation))
                return a;
            func = func.caller
        }
        return null
    },
    mergeArray: function(a, b, d) {
        for (var c in b)
            if (a.hasOwnProperty(c) || d)
                a[c] = b[c];
        return a
    },
    animate: function(a, b, d) {
        for (var c in a)
            b.style[c] = a[c]
    },
    staticUrl: function(a, b) {
        if ("" !== a && "http" != b.substring(0, 4)) {
            var d = a.length;
            "/" == a[d - 1] && (a = a.substring(0, d - 1));
            "/" == b[0] && (b = b.substr(1));
            return a + "/" + b
        }
        return b
    },
    generateQR: function(a, b) {
        "string" === typeof a && (a = {
            text: a
        });
        a = tctipUtil.mergeArray({
            render: "canvas",
            width: 256,
            height: 256,
            typeNumber: -1,
            correctLevel: QRErrorCorrectLevel.H,
            background: "#ffffff",
            foreground: "#000000"
        }, a, !0);
        var d = function() {
            var b = new QRCode(a.typeNumber,a.correctLevel);
            b.addData(a.text);
            b.make();
            var d = document.createElement("table");
            d.style.width = a.width + "px";
            d.style.height = a.height + "px";
            d.style.border = "0px";
            d.style.borderCollapse = "collapse";
            d.style.backgroundColor = a.background;
            for (var f = a.width / b.getModuleCount(), h = a.height / b.getModuleCount(), g = 0; g < b.getModuleCount(); g++) {
                var k = $table.insertRow(-1);
                g.style.height = h + "px";
                for (var m = 0; m < b.getModuleCount(); m++)
                    k.insertCell(-1),
                    cell.style.width = f + "px",
                    cell.style.backgroundColor = b.isDark(g, m) ? a.foreground : a.background
            }
            return d
        }
          , d = "canvas" == a.render ? function() {
            var b = new QRCode(a.typeNumber,a.correctLevel);
            b.addData(a.text);
            b.make();
            var d = document.createElement("canvas");
            d.width = a.width;
            d.height = a.height;
            for (var f = d.getContext("2d"), h = a.width / b.getModuleCount(), g = a.height / b.getModuleCount(), k = 0; k < b.getModuleCount(); k++)
                for (var m = 0; m < b.getModuleCount(); m++) {
                    f.fillStyle = b.isDark(k, m) ? a.foreground : a.background;
                    var l = Math.ceil((m + 1) * h) - Math.floor(m * h)
                      , n = Math.ceil((k + 1) * h) - Math.floor(k * h);
                    f.fillRect(Math.round(m * h), Math.round(k * g), l, n)
                }
            return d
        }() : d();
        return b.insertBefore(d, b.firstChild)
    }
}
  , tctip = window.tctip || {
    myConfig: {
        imagePrefix: "",
        cssPrefix: "",
        staticPrefix: "",
        buttonImageId: "3",
        buttonTip: "dashang",
        cssUrl: "css/myRewards.css"
    },
    listConfig: {
        alipay: {
            icon: "img/alipay.png",
            name: "\u652f\u4ed8\u5b9d",
            desc: "\u652f\u4ed8\u5b9d\u6253\u8d4f",
            className: ""
        },
        tenpay: {
            icon: "img/tenpay.png",
            name: "\u8d22\u4ed8\u901a",
            desc: "\u8d22\u4ed8\u901a\u6253\u8d4f",
            className: ""
        },
        weixin: {
            icon: "img/weixin.png",
            name: "\u5fae\u4fe1",
            desc: "\u5fae\u4fe1\u6253\u8d4f",
            className: ""
        },
        bitcoin: {
            icon: "img/bitcoin.png",
            name: "\u6bd4\u7279\u5e01",
            desc: "\u6bd4\u7279\u5e01\u6253\u8d4f",
            className: ""
        },
        litecoin: {
            icon: "img/litecoin.png",
            name: "\u83b1\u7279\u5e01",
            desc: "\u83b1\u7279\u5e01\u6253\u8d4f",
            className: ""
        },
        dogecoin: {
            icon: "img/dogecoin.png",
            name: "\u72d7\u72d7\u5e01",
            desc: "\u72d7\u72d7\u5e01\u6253\u8d4f",
            className: ""
        }
    },
    myRewards: null,
    myRewardsBtn: null,
    myRewardsMain: null,
    myRewardsbox: null,
    myRewardsList: null,
    myRewardsDetail: null,
    myRewardsListUl: null,
    myRewardsUbox: null,
    currentLi: null,
    currentData: null,
    imageUrl: function(a) {
        return tctipUtil.staticUrl(tctip.myConfig.staticPrefix || tctip.myConfig.imagePrefix, a)
    },
    cssUrl: function(a) {
        return tctipUtil.staticUrl(tctip.myConfig.staticPrefix || tctip.myConfig.cssPrefix, a)
    },
    buttonImageUrl: function() {
        return tctip.imageUrl("img/" + tctip.myConfig.buttonTip + "/tab_" + tctip.myConfig.buttonImageId + ".png")
    },
    generateMyConfig: function() {
        tctip.myConfig = tctipUtil.mergeArray(tctip.myConfig, tctipConfig);
        var a = [], b = 0, d = !1, c;
        for (c in tctipConfig.list) {
            var e = tctip.listConfig.hasOwnProperty(c) ? tctipUtil.mergeArray(tctip.listConfig[c], tctipConfig.list[c], !0) : tctipConfig.list[c];
            "myR-on" == e.className && (d = !0);
            a.push(e);
            b += 1;
            if (5 <= b)
                break
        }
        !1 == d && (a[0].className = "myR-on");
        tctip.myConfig.list = a
    },
    generateMyRewards: function() {
        this.myRewards = tctipUtil.createElement({
            id: "myRewards",
            className: "myRewards",
            onmouseover: function() {
                tctip.showTctip(this)
            },
            onmouseout: function() {
                tctip.hideTctip(this)
            }
        });
        this.generateLeftBtn();
        this.generateMyRewardsMain()
    },
    generateLeftBtn: function() {
        this.myRewardsBtn = tctipUtil.createElement({
            className: "btn-myRewards",
            href: "javascript:;"
        }, "a", this.myRewards);
        tctipUtil.createElement({
            className: "png",
            src: tctip.buttonImageUrl()
        }, "img", this.myRewardsBtn)
    },
    showTctip: function(a) {
        var b = tctipUtil.currentEvent();
        tctipUtil.isMouseLeaveOrEnter(b, a) && tctipUtil.animate({
            width: "240px"
        }, tctip.myRewards, 200)
    },
    hideTctip: function(a) {
        var b = tctipUtil.currentEvent();
        tctipUtil.isMouseLeaveOrEnter(b, a) && tctipUtil.animate({
            width: "0px"
        }, tctip.myRewards, 200)
    },
    generateMyRewardsMain: function() {
        this.myRewardsMain = tctipUtil.createElement({
            className: "myRewards-main"
        }, "div", this.myRewards);
        var a = {
            className: "myR-h"
        };
        a[tctipUtil.getTextKey()] = "\u559c\u6b22\u8bf7\u6253\u8d4f";
        tctipUtil.createElement(a, "h1", this.myRewardsMain);
        this.generateMyRewardsbox();
        var b = tctipUtil.createElement({
            className: "myR-bot"
        }, "p", this.myRewardsMain)
    },
    generateMyRewardsbox: function() {
        this.myRewardsbox = tctipUtil.createElement({
            className: "myRewardsbox"
        }, "div", this.myRewardsMain);
        this.generateMyRewardsList();
        this.generateMyRewardsDetail()
    },
    generateMyRewardsList: function() {
        this.myRewardsList = tctipUtil.createElement({
            className: "myRewards-list"
        }, "div", this.myRewardsbox);
        this.myRewardsListUl = 5 <= tctip.myConfig.list.length ? tctipUtil.createElement({}, "ul", this.myRewardsList) : tctipUtil.createElement({
            className: "not-full"
        }, "ul", this.myRewardsList);
        for (var a = 0; 5 > a && tctip.myConfig.list.hasOwnProperty(a); a++) {
            var b = tctip.myConfig.list[a]
              , d = tctipUtil.createElement({
                className: b.className
            }, "li", this.myRewardsListUl)
              , c = null;
            (function() {
                var e = b
                  , f = {
                    href: "javascript:;",
                    onmouseover: function() {
                        tctip.leftMouseover(this, e)
                    }
                };
                f[tctipUtil.getTextKey()] = b.name;
                4 == a && (f.className = "fifth");
                c = tctipUtil.createElement(f, "a", d)
            }
            )();
            "myR-on" == b.className && (this.currentLi = d,
            this.currentData = b);
            tctipUtil.createElement({
                className: "png",
                src: tctip.imageUrl(b.icon),
                alt: b.name
            }, "img", c)
        }
    },
    generateMyRewardsDetail: function() {
        tctip.myRewardsDetail && tctip.myRewardsbox.removeChild(tctip.myRewardsDetail);
        this.myRewardsDetail = tctipUtil.createElement({
            className: "myRewards-detail"
        }, "div", this.myRewardsbox);
        this.myRewardsUbox = tctipUtil.createElement({
            className: "myRewards-ubox"
        }, "div", this.myRewardsDetail);
        var a = {
            className: "myRewards-code-tit"
        };
        a[tctipUtil.getTextKey()] = "\u626b\u63cf\u4e8c\u7ef4\u7801\u6253\u8d4f";
        tctipUtil.createElement(a, "p", this.myRewardsUbox);
        a = tctipUtil.createElement({
            className: "myRewards-code"
        }, "div", this.myRewardsUbox);
        if (tctip.currentData.hasOwnProperty("qrimg")) {
            tctipUtil.createElement({
                src: tctip.imageUrl(tctip.currentData.qrimg)
            }, "img", a);
            a = {
                className: "myRewards-account"
            };
            a[tctipUtil.getTextKey()] = tctip.currentData.desc || tctip.currentData.name;
            var b = tctipUtil.createElement(a, "p", this.myRewardsUbox)
        } else
            tctip.currentData.hasOwnProperty("account") && (tctipUtil.generateQR({
                render: tctipUtil.isSupportCanvas() ? "canvas" : "table",
                text: tctip.currentData.account,
                width: 106,
                height: 106
            }, a),
            a = {
                className: "myRewards-account"
            },
            a[tctipUtil.getTextKey()] = tctip.currentData.desc || tctip.currentData.name,
            b = tctipUtil.createElement(a, "p", this.myRewardsUbox),
            a = {},
            a[tctipUtil.getTextKey()] = tctip.currentData.account,
            tctipUtil.createElement({}, "br", b),
            tctipUtil.createElement(a, "span", b))
    },
    leftMouseover: function(a, b) {
        tctip.currentLi.className = "";
        a.parentNode.className = "myR-on";
        tctip.currentLi = a.parentNode;
        tctip.currentData = b;
        tctip.generateMyRewardsDetail()
    },
    loadCss: function() {
        tctipUtil.createElement({
            type: "text/css",
            rel: "stylesheet",
            href: tctip.cssUrl(tctip.myConfig.cssUrl)
        }, "link")
    },
    stat: function() {
        tctipUtil.createElement({
            src: "http://stat.tctip.com/stat/index"
        }, "script")
    },
    init: function() {
        document.body ? (tctip.generateMyConfig(),
        tctip.loadCss(),
        tctip.generateMyRewards(),
        tctip.stat()) : setTimeout(tctip.init, 0)
    }
};
tctip.init();
