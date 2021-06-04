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

            for (let i = 0; i < data.length; i++) {
                precipitationStore.add(data[i]);
            }
        };
    }

    getData();
});
