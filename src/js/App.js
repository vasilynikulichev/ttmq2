import api from '../api/Api';
import DBInterface from '../helpers/DBInterface';
import parseDate from '../helpers/parseDate';
import Select from './Select';
import chartInstance from './Chart';
import {monthNames} from '../constants';

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
        let days = [];

        data.forEach((day, index) => {
            let {year: currentYear, month: currentMonth} = parseDate(day.t);

            if (month !== currentMonth || index === data.length - 1) {
                store.add({
                    t: `${year}-${month}`,
                    max: Math.max(...days),
                    min: Math.min(...days),
                    days,
                });
                month = currentMonth;
                year = currentYear;
                days = []
            }

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
        const selectOptions = this.getSelectOptions(this.yearMin, this.yearMax);

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
                                        ${selectOptions}
                                    </ul>
                                </div>
                                <div class="date__item select" id="date-to">
                                    <button class="select__title">Выберите</button>
                                    <ul class="select__list">
                                        ${selectOptions}
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
        chartInstance.init('chart', this.preprocessingData(this.data));
    }

    addSelectEvent(selectId, value) {
        const selectNode = document.getElementById(selectId);

        new Select(selectNode, {value});

        selectNode.addEventListener('select', ({target, detail}) => {
            const targetId = target.attributes.id.nodeValue;
            const isDateFrom = targetId === 'date-from';

            if (isDateFrom) {
                this.selectedMinYear = detail;
                this.setSelectLimit('date-to', this.selectedMinYear, this.yearMax);
            } else {
                this.selectedMaxYear = detail;
                this.setSelectLimit('date-from', this.yearMin, this.selectedMaxYear);
            }

            this.updateChart();
        });
    }

    setSelectLimit(id, min, max) {
        const select = document.getElementById(id);
        const selectList = select.querySelector('.select__list');

        selectList.innerHTML = this.getSelectOptions(min, max);
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
        chartInstance.updateData(this.preprocessingData(this.data));
    }

    preprocessingData(data) {
        const yearRange = Math.round(data.length / 12);
        let newData = [];

        if (yearRange > 30) {
            let {year} = parseDate(data[0].t);
            let min = data[0].min;
            let max = data[0].max;

            data.forEach((item, index) => {
                let {year: currentYear} = parseDate(item.t);

                if (year !== currentYear || index === data.length - 1) {
                    newData.push({
                        x: year,
                        y: max,
                    });
                    newData.push({
                        x: year,
                        y: min,
                    });
                    min = item.min;
                    max = item.max;
                    year = currentYear;
                }

                if (item.max > max) {
                    max = item.max;
                }

                if (item.min < min) {
                    min = item.min;
                }
            });
        }

        if (yearRange > 5 && yearRange <= 30) {
            data.forEach((item) => {
                let {year} = parseDate(item.t);

                newData.push({
                    x: year,
                    y: Math.max(...item.days),
                });
                newData.push({
                    x: year,
                    y: Math.min(...item.days),
                });
            });
        }

        if (yearRange <= 5) {
            data.forEach((item) => {
                let {year, month} = parseDate(item.t);
                const monthIndex = parseInt(month) - 1;

                item.days.forEach((day) => {
                    newData.push({
                        x: `${monthNames[monthIndex]} ${year}`,
                        y: day,
                    });
                })
            });
        }

        return newData;
    }
}
