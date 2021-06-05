import createNode from '../helpers/createNode';

export default class Chart {
    canvasNode;
    paddingLeft = 30;
    paddingBottom = 30;
    paddingRight = 10;
    ctx;
    height;
    width;
    maxY;
    minY;
    dataLength;

    constructor(rootNode, data) {
        this.rootNode = rootNode;
        this.data = data;
        this.dataLength = data.length;

        this.init();
    }

    init() {
        this.getSize();
        this.createCanvasNode();
        this.appendCanvas();
        this.getCtx();
        this.render();

    }

    getSize() {
        const {height, width} = this.rootNode.getBoundingClientRect();

        this.height = height;
        this.width = width
    }

    createCanvasNode () {
        this.canvasNode = createNode({
            tag: 'canvas',
            attributes: {
                height: this.height,
                width: this.width,
            }
        });
    }

    appendCanvas() {
        this.rootNode.appendChild(this.canvasNode);
    }

    getCtx() {
        this.ctx = this.canvasNode.getContext('2d');
    }

    render() {
        this.getMinY();
        this.getMaxY();
        this.renderLeftValues();
        this.renderBottomValues();
        this.renderHorizontalLines();
        this.renderGraph();
        // this.renderDots();
    }

    getXPixel(value) {
        return ((this.width - (this.paddingLeft + this.paddingRight)) / (this.dataLength - 1)) * value + ((this.paddingLeft - this.paddingRight) * 1.5);
    }

    getYPixel(value) {
        return this.height - (((this.height - this.paddingBottom) / (this.maxY - this.minY)) * (value - this.minY)) - this.paddingBottom;
    }

    getMinY() {
        const minData = Math.min(...this.data);
        this.minY = minData - (10 + minData % 5);
    }

    getMaxY() {
        const maxData = Math.max(...this.data);
        this.maxY = maxData + (10 - maxData % 10);
    }

    renderLeftValues() {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = this.ctx.font.replace(/\d+px/, '14px');
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';

        for (let i = this.minY; i < this.maxY; i += 10) {
            this.ctx.fillText(i, this.paddingLeft - 10, this.getYPixel(i));
        }
    }

    renderBottomValues() {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = this.ctx.font.replace(/\d+px/, '14px');

        for (let i = 0; i < this.dataLength; i ++) {
            this.ctx.fillText(i + 1, this.getXPixel(i), this.height - this.paddingBottom + 20);
        }
    }

    renderHorizontalLines() {
        this.ctx.strokeStyle = '#85a3cc';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        for (let i = this.minY; i < this.maxY; i += 10) {
            this.ctx.moveTo(this.getXPixel(0), this.getYPixel(i));
            this.ctx.lineTo(this.width - this.paddingRight, this.getYPixel(i));
        }

        this.ctx.stroke();
    }

    renderGraph() {
        const lineWidth = 3;

        this.ctx.strokeStyle = '#d0dff2';
        this.ctx.lineWidth = lineWidth;

        for (let i = 1; i < this.dataLength; i ++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.getXPixel(i - 1), this.getYPixel(this.data[i - 1]));

            const x1 = Math.floor(this.getXPixel(i - 1));
            const y1 = this.getYPixel(this.data[i - 1]);
            const x2 = Math.floor(this.getXPixel(i));
            const y2 = this.getYPixel(this.data[i]);
            const k = 30;
            // const minYPixel = this.getYPixel(this.minY);
            const secondArg = {x: x2, y: y2};

            if (this.data[i - 1] > this.data[i]) {
                this.ctx.bezierCurveTo(x1 + k, y1, x2 - k, y2, x2, y2);
                secondArg.k = k;
            } else if (this.data[i - 1] < this.data[i]) {
                this.ctx.bezierCurveTo(x1 + k, y1, x2 - k, y2, x2, y2);
                secondArg.k = k;
            } else {
                this.ctx.lineTo(x2, y2);
            }

            this.ctx.stroke();

            // this.addFill(
            //     lineWidth,
            //     {x: x1, y: y1},
            //     secondArg,
            //     {x: x2, y: minYPixel},
            //     {x: x1, y: minYPixel}
            // );
        }
    }

    // addFill(lineWidth, ...args) {
    //     this.ctx.fillStyle = 'rgba(130, 175, 230, 0.8)';
    //     this.ctx.beginPath();
    //     this.ctx.moveTo(args[0].x, args[0].y + lineWidth / 2);
    //
    //     for (let i = 1; i < args.length; i++) {
    //         if (args[i].k !== undefined) {
    //             this.ctx.bezierCurveTo(args[i - 1].x + args[i].k, args[i - 1].y, args[i].x - args[i].k, args[i].y, args[i].x, args[i].y + lineWidth / 2);
    //         }
    //
    //         this.ctx.lineTo(args[i].x, args[i].y + lineWidth / 2);
    //     }
    //
    //     this.ctx.fill();
    // }

    // renderDots() {
    //     for (let i = 0; i < this.dataLength; i ++) {
    //         this.ctx.fillStyle = '#f7f9fc';
    //         this.ctx.beginPath();
    //         this.ctx.arc(this.getXPixel(i), this.getYPixel(this.data[i]), 5, 0, Math.PI * 2, true);
    //         this.ctx.fill();
    //
    //         this.ctx.fillStyle = '#468efb';
    //
    //         this.ctx.beginPath();
    //         this.ctx.arc(this.getXPixel(i), this.getYPixel(this.data[i]), 2, 0, Math.PI * 2, true);
    //         this.ctx.fill();
    //     }
    // }
}
