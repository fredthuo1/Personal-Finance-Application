const categories = require('./categories');

const classifyTransaction = (description, existingCategory) => {
    if (!description || typeof description !== 'string') {
        console.error(`Invalid description: ${description}`);
        return existingCategory && existingCategory.trim() !== '' ? existingCategory : 'Others';
    }

    const descriptionLower = description.toLowerCase();

    for (const categoryObj of categories) {
        for (const keyword of categoryObj.keywords) {
            if (descriptionLower.includes(keyword)) {
                return categoryObj.category;
            }
        }
    }

    if (existingCategory && existingCategory.trim() !== '') {
        return existingCategory;
    }

    return 'Others';
};

module.exports = classifyTransaction;
