import './styles/main.scss';
import App from './js/App';

document.addEventListener('DOMContentLoaded', () => {
    const appNode = document.getElementById('app');
    new App(appNode);
});
