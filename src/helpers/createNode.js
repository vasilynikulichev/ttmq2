const createNode = ({tag = 'div', attributes = {}, children = ''}) => {
    const node = document.createElement(tag);
    const attrKeysArr = Object.keys(attributes);

    if (attrKeysArr.length) {
        for (let i = 0; i < attrKeysArr.length; i++) {
            const attrKey = attrKeysArr[i];
            let attrValue = attributes[attrKey];

            attrValue = !Array.isArray(attrValue) ? attrValue : attrValue.join(' ');

            node.setAttribute(attrKey, attrValue);
        }
    }

    if (typeof children === 'string') {
        node.innerHTML = children;
        return node;
    }

    for (let i = 0; i < children.length; i++) {
        node.appendChild(createNode(children[i]));
    }

    return node;
};

export default createNode;