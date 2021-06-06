export default class Select {
    isOpen = false;

    constructor(selectNode, detail = {}) {
        this.selectNode = selectNode;
        this.detail = detail;

        this.init();
    }

    init() {
        if (this.detail && Object.keys(this.detail).length) {
            const {value} = this.detail;
            this.setValue(value);
        }

        this.selectNode.addEventListener('click', ({target}) => {
            if (target.className === 'select__title') {
                this.toggle();
            }

            if (target.className === 'select__option') {
                this.setValue(target.innerHTML, target.dataset.value);
                this.close();
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.selectNode.classList.add('open');
        document.addEventListener('click', (event) => this.onDocumentClick(event));
        this.isOpen = true;
    }

    close() {
        this.selectNode.classList.remove('open');
        document.removeEventListener('click', (event) => this.onDocumentClick(event));
        this.isOpen = false;
    }

    onDocumentClick(event) {
        !this.selectNode.contains(event.target) ? this.close() : '';
    }

    setValue(value) {
        this.selectNode.querySelector('.select__title').innerHTML = value;

        const customEvent = new CustomEvent('select', {
            bubbles: true,
            detail: value
        });

        this.selectNode.dispatchEvent(customEvent);
    }
}
