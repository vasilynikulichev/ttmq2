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
        this.renderBottomValues();
        this.renderHorizontalLines();
        this.renderVerticalLines();
        this.renderGraph();
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
            if (item.y > max) {
                max = item.y;
            }

            if (item.y < min) {
                min = item.y;
            }
        });

        this.minY = min !== 0 ? min - (10 + min % 5) : 0;
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
        let i = 0;
        let step = (this.dataLength - 1) / 11;
        const yPixel = this.height - this.paddingBottom;

        this.ctx.fillStyle = 'black';
        this.ctx.font = this.ctx.font.replace(/\d+px/, '14px');
        this.ctx.strokeStyle = '#85a3cc';

        while (i <= this.dataLength) {
            const roundIndex = Math.round(i);
            const xPixel = this.getXPixel(i);

            this.ctx.textAlign = 'center';

            if (roundIndex === 0) {
                this.ctx.textAlign = 'start';
            }

            if (i + step > this.dataLength) {
                this.ctx.textAlign = 'end';
            }

            this.ctx.fillText(this.data[roundIndex].x, xPixel, yPixel + 20);

            this.ctx.beginPath();
            this.ctx.moveTo(xPixel, yPixel + 10);
            this.ctx.lineTo(xPixel, yPixel);
            this.ctx.stroke();

            i = i + step;
        }
    }

    renderHorizontalLines() {
        const xPixel = this.getXPixel(0);

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#85a3cc';

        for (let i = this.minY; i <= this.maxY; i += 10) {
            const yPixel = this.getYPixel(i);

            this.ctx.moveTo(xPixel, yPixel);
            this.ctx.lineTo(this.width - this.paddingRight, yPixel);
        }

        this.ctx.stroke();
    }

    renderVerticalLines() {
        const xLeftPixel = this.getXPixel(0);
        const xRightPixel = this.width - this.paddingRight;
        const yEndPixel = this.height - this.paddingBottom;

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#85a3cc';

        this.ctx.moveTo(xLeftPixel, this.paddingTop);
        this.ctx.lineTo(xLeftPixel, yEndPixel);

        this.ctx.moveTo(xRightPixel, this.paddingTop);
        this.ctx.lineTo(xRightPixel, yEndPixel);

        this.ctx.stroke();
    }

    renderGraph() {
        this.ctx.strokeStyle = '#2178e5';
        this.ctx.beginPath();
        this.ctx.moveTo(this.getXPixel(0), this.getYPixel(this.data[0].y));

        for (let i = 1; i < this.dataLength; i ++) {
            const x = Math.floor(this.getXPixel(i));
            const y = this.getYPixel(this.data[i].y);

            this.ctx.lineTo(x, y);
        }

        this.ctx.stroke();
    }
}

const chartInstance = new Chart();

export default chartInstance;
