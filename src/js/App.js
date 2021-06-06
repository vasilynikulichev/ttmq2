import api from '../api/Api';
import DBInterface from '../helpers/DBInterface';
import parseDate from '../helpers/parseDate';
import Select from './Select';

export default class App {
    DB;
    yearMin;
    yearMax;

    constructor(rootNode) {
        this.rootNode = rootNode;

        this.init();
    }

    async init() {
        await this.connectDB();
        const data = await this.getData('temperature');
        await this.getMinAndMaxYear(data);
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
        let dayInMonth = 0;

        data.forEach((day) => {
            let {year: currentYear, month: currentMonth} = parseDate(day.t);

            if (month !== currentMonth) {
                store.add({
                    t: `${year}-${month}`,
                    v: parseInt((sumTemperatureForMonth / dayInMonth) * 100) / 100,
                });
                month = currentMonth;
                year = currentYear;
                sumTemperatureForMonth = null;
                dayInMonth = 0;
            }

            sumTemperatureForMonth += day.v;
            dayInMonth++;
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

    getMinAndMaxYear(data) {
        let {year: yearMin} = parseDate(data[0].t);
        let {year: yearMax} = parseDate(data[data.length - 1].t);
        this.yearMin = yearMin;
        this.yearMax = yearMax;
    }

    getTemplate() {
        return (
            `<div class="container">
                <div class="archive">
                    <h1 class="archive__title">Архив метеослужбы</h1>
                    <div class="archive__info">
                        <div class="archive__type type">
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
    }

    addSelectEvent(selectId, value) {
        const selectNode = document.getElementById(selectId);

        new Select(selectNode, {value});
    }
}
