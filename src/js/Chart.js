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
        let step = (this.dataLength - 1) / 12;
        let i = 0;
        this.ctx.fillStyle = 'black';
        this.ctx.textAlign = 'center';
        this.ctx.font = this.ctx.font.replace(/\d+px/, '14px');

        // if (this.dataLength > 10) {
        //     step = Math.round(this.dataLength / 10);
        // }

        while(i <= this.dataLength) {
            const roundIndex = Math.round(i);
            if (roundIndex === 0) {
                this.ctx.textAlign = 'start';
            }
            console.log(i, roundIndex, this.dataLength);
            if (i + step > this.dataLength) {
                this.ctx.textAlign = 'end';
            }

            this.ctx.fillText(this.data[roundIndex].x, this.getXPixel(roundIndex), this.height - this.paddingBottom + 20);
            i = i + step;
        }

        // this.ctx.fillText(this.data[this.dataLength - 1].x, this.getXPixel(this.dataLength - 1), this.height - this.paddingBottom + 20);
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
        this.ctx.moveTo(this.getXPixel(0), this.getYPixel(this.data[0].y));

        for (let i = 1; i < this.dataLength; i ++) {
            const x = Math.floor(this.getXPixel(i));
            const y = this.getYPixel(this.data[i].y);
            this.ctx.lineTo(x, y);
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
