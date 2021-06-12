class Chart {
    canvasNode;
    paddingLeft = 30;
    paddingRight = 10;
    paddingBottom = 30;
    paddingTop = 10;
    ctx;
    height;
    width;
    maxY;
    minY;
    dataLength;
    rootNode;
    data;

    init(rootId, data) {
        this.rootNode = document.getElementById(rootId);
        this.processingData(data);

        this.getSize();
        this.createCanvasNode();
        this.appendCanvas();
        this.getCtx();
        this.render();
    }

    updateData(data) {
        this.processingData(data);
        this.clear();
        this.render();
    }

    processingData(data) {
        this.data = data;
        this.dataLength = data.length;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height)
    }

    getSize() {
        const {height, width} = this.rootNode.getBoundingClientRect();

        this.height = height;
        this.width = width
    }

    createCanvasNode () {
        this.canvasNode = document.createElement('canvas');
        this.canvasNode.setAttribute('height', this.height);
        this.canvasNode.setAttribute('width', this.width);
    }

    appendCanvas() {
        this.rootNode.appendChild(this.canvasNode);
    }

    getCtx() {
        this.ctx = this.canvasNode.getContext('2d');
    }

    render() {
        this.getExtremeValues();
        this.renderLeftValues();
        // this.renderBottomValues();
        this.renderHorizontalLines();
        this.renderGraph();
        // this.renderDots();
    }

    getXPixel(value) {
        return ((this.width - (this.paddingLeft + this.paddingRight)) / (this.dataLength - 1)) * value + ((this.paddingLeft - this.paddingRight) * 1.5);
    }

    getYPixel(value) {
        return this.height - (((this.height - this.paddingBottom - this.paddingTop) / (this.maxY - this.minY)) * (value - this.minY)) - this.paddingBottom;
    }

    getExtremeValues() {
        let min = 0;
        let max = 0;

        this.data.forEach((item) => {
            if (item.max > max) {
                max = item.max;
            }

            if (item.min < min) {
                min = item.min;
            }
        });

        this.minY = min - (10 + min % 5);
        this.maxY = max + (10 - max % 10);
    }

    renderLeftValues() {
        this.ctx.fillStyle = 'black';
        this.ctx.font = this.ctx.font.replace(/\d+px/, '14px');
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';

        for (let i = this.minY; i <= this.maxY; i += 10) {
            this.ctx.fillText(i, this.paddingLeft - 10, this.getYPixel(i));
        }
    }

    renderBottomValues() {
        this.ctx.fillStyle = 'black';
        this.ctx.font = this.ctx.font.replace(/\d+px/, '14px');

        for (let i = 0; i < this.dataLength; i ++) {
            this.ctx.fillText(i + 1, this.getXPixel(i), this.height - this.paddingBottom + 20);
        }
    }

    renderHorizontalLines() {
        this.ctx.strokeStyle = '#85a3cc';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        for (let i = this.minY; i <= this.maxY; i += 10) {
            this.ctx.moveTo(this.getXPixel(0), this.getYPixel(i));
            this.ctx.lineTo(this.width - this.paddingRight, this.getYPixel(i));
        }

        this.ctx.stroke();
    }

    renderGraph() {
        const lineWidth = 2;

        this.ctx.strokeStyle = '#d0dff2';
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(this.getXPixel(0), this.getYPixel(this.data[0].avg));

        for (let i = 1; i < this.dataLength; i ++) {
            // const x1 = Math.floor(this.getXPixel(i - 1));
            // const y1 = this.getYPixel(this.data[i - 1].v);
            const x2 = Math.floor(this.getXPixel(i));
            const y2 = this.getYPixel(this.data[i].avg);
            // const k = 30;
            // const minYPixel = this.getYPixel(this.minY);
            // const secondArg = {x: x2, y: y2};

            // if (this.data[i - 1].v > this.data[i].v) {
            //     this.ctx.bezierCurveTo(x1 + k, y1, x2 - k, y2, x2, y2);
            //     secondArg.k = k;
            // } else if (this.data[i - 1].v < this.data[i].v) {
            //     this.ctx.bezierCurveTo(x1 + k, y1, x2 - k, y2, x2, y2);
            //     secondArg.k = k;
            // } else {
                this.ctx.lineTo(x2, y2);
            // }
        }

        this.ctx.stroke();
    }

    renderDots() {
        for (let i = 0; i < this.dataLength; i ++) {
            this.ctx.fillStyle = '#f7f9fc';
            this.ctx.beginPath();
            this.ctx.arc(this.getXPixel(i), this.getYPixel(this.data[i]), 5, 0, Math.PI * 2, true);
            this.ctx.fill();

            this.ctx.fillStyle = '#468efb';

            this.ctx.beginPath();
            this.ctx.arc(this.getXPixel(i), this.getYPixel(this.data[i]), 2, 0, Math.PI * 2, true);
            this.ctx.fill();
        }
    }
}

const chartInstance = new Chart();

export default chartInstance;
