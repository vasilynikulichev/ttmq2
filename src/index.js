import './styles/main.scss';
import api from './api/Api';

document.addEventListener('DOMContentLoaded', () => {
    // const appNode = document.getElementById('app');
    // new App(appNode);

    const getData = async () => {
        const {data} = await api.getPrecipitation();

        console.log(data);

        let openRequest = indexedDB.open('app', 1);

        openRequest.onupgradeneeded = function() {
            let db = openRequest.result;

            if (!db.objectStoreNames.contains('precipitation')) {
                db.createObjectStore('precipitation', {keyPath: 't'});
            }
        };

        openRequest.onerror = function() {
            console.error("Error", openRequest.error);
        };

        openRequest.onsuccess = async () => {
            let db = openRequest.result;

            let transaction = db.transaction('precipitation', 'readwrite');
            let precipitationStore = transaction.objectStore('precipitation');

            let month = data[0].t.split('-')[1];
            let year = data[0].t.split('-')[0];
            let sumTemperatureForMonth = null;
            let dayInMonth = 0;

            data.forEach((day) => {
                let currentDate = day.t.split('-');
                let currentYear = currentDate[0];
                let currentMonth = currentDate[1];

                if (month !== currentMonth) {
                    precipitationStore.add({
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
        };
    }

    getData();
});
