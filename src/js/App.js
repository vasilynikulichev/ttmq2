import api from '../api/Api';
import DBInterface from '../helpers/DBInterface';
import parseDate from '../helpers/parseDate';
import Select from './Select';
import chartInstance from './Chart';

export default class App {
    DB;
    yearMin;
    yearMax;
    selectedMinYear;
    selectedMaxYear;
    selectedType = 'temperature';
    data;

    constructor(rootNode) {
        this.rootNode = rootNode;

        this.init();
    }

    async init() {
        await this.connectDB();
        this.data = await this.getData(this.selectedType);
        await this.calcMinAndMaxYear(this.data);
        this.render();
    }

    async connectDB() {
        this.DB = await DBInterface.connect({DBName: 'app'}, [{
            name: 'precipitation',
            params: {
                keyPath: 't'
            }
        }, {
            name: 'temperature',
            params: {
                keyPath: 't'
            }
        }]);
    }

    async getData(storeName, range = null) {
        const result = await this.getDbData(storeName, range);

        if (result.length) {
            return result;
        }

        const {data} = await api[storeName === 'temperature' ? 'getTemperature': 'getPrecipitation']();
        const store = DBInterface.getStore(this.DB, storeName);

        let {year, month} = parseDate(data[0].t);
        let sumTemperatureForMonth = null;
        let days = [];

        data.forEach((day) => {
            let {year: currentYear, month: currentMonth} = parseDate(day.t);

            if (month !== currentMonth) {
                store.add({
                    time: `${year}-${month}`,
                    avg: parseInt((sumTemperatureForMonth / days.length) * 100) / 100,
                    max: Math.max(...days),
                    min: Math.min(...days),
                    days,
                });
                month = currentMonth;
                year = currentYear;
                sumTemperatureForMonth = null;
                days = []
            }

            sumTemperatureForMonth += day.v;
            days.push(day.v);
        });

        return await this.getData(storeName, range);
    }

    async getDbData(storeName, range = null) {
        const store = DBInterface.getStore(this.DB, storeName);

        if (range) {
            return await DBInterface.getRange(store, range)
        } else {
            return await DBInterface.getAll(store);
        }
    }

    calcMinAndMaxYear(data) {
        let {year: yearMin} = parseDate(data[0].t);
        let {year: yearMax} = parseDate(data[data.length - 1].t);
        this.yearMin = yearMin;
        this.yearMax = yearMax;
        this.selectedMinYear = yearMin;
        this.selectedMaxYear = yearMax;
    }

    getTemplate() {
        return (
            `<div class="container">
                <div class="archive">
                    <h1 class="archive__title">Архив метеослужбы</h1>
                    <div class="archive__info">
                        <div class="archive__type type" id="type">
                            <label class="type__item">
                                <input type="radio" name="type" value="temperature" checked>
                                <span>Температура</span>
                            </label>
                            <label class="type__item">
                                <input type="radio" name="type" value="precipitation">
                                <span>Осадки</span>
                            </label>
                        </div>
                        <div class="archive__visualization visualization">
                            <div class="visualization__date date">
                                <div class="date__item select" id="date-from">
                                    <button class="select__title">Выберите</button>
                                    <ul class="select__list">
                                        ${this.getSelectOptions(this.yearMin, this.yearMax)}
                                    </ul>
                                </div>
                                <div class="date__item select" id="date-to">
                                    <button class="select__title">Выберите</button>
                                    <ul class="select__list">
                                        ${this.getSelectOptions(this.yearMin, this.yearMax)}
                                    </ul>
                                </div>
                            </div>
                            <div class="visualization__chart chart" id="chart"></div>
                        </div>
                    </div>
                </div>
            </div>`
        );
    }

    getSelectOptions(from, to) {
        let template = '';

        for (let i = from; i <= to; i++) {
            template += `<li class="select__option" data-value="${i}">${i}</li>`;
        }

        return template;
    }

    render () {
        this.rootNode.insertAdjacentHTML('beforeend', this.getTemplate());
        this.addSelectEvent('date-from', this.yearMin);
        this.addSelectEvent('date-to', this.yearMax);
        this.addTypeEvent();
        chartInstance.init('chart', this.data);
    }

    addSelectEvent(selectId, value) {
        const selectNode = document.getElementById(selectId);

        new Select(selectNode, {value});

        selectNode.addEventListener('select', ({target, detail}) => {
            const targetId = target.attributes.id.nodeValue;
            const isDateFrom = targetId === 'date-from';
            let oppositeId;

            if (isDateFrom) {
                oppositeId = 'date-to';
                this.selectedMinYear = detail;
            } else {
                oppositeId = 'date-from';
                this.selectedMaxYear = detail;
            }

            const select = document.getElementById(oppositeId);
            const selectList = select.querySelector('.select__list');

            selectList.innerHTML = this.getSelectOptions(this.selectedMinYear, this.selectedMaxYear);

            this.updateChart();
        });
    }

    addTypeEvent() {
        const typeNode = document.getElementById('type');

        typeNode.addEventListener('click', ({target}) => {
            const {tagName, value} = target;

            if (tagName.toLowerCase() === 'input') {
                this.selectedType = value;
                this.updateChart();
            }
        });
    }

    async updateChart() {
        this.data = await this.getData(this.selectedType, {from: `${this.selectedMinYear}-01`, to: `${this.selectedMaxYear}-12`});
        chartInstance.updateData(this.data);
    }
}
