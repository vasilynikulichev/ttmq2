const parseDate = (str) => {
    const [year, month, day] = str.split('-');

    return {
        year,
        month,
        day,
    };
};

export default parseDate;
