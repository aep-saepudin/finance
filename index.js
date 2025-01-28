const db = new PouchDB('my_database');

function showAll() {
    return db.allDocs({ include_docs: true, descending: true }, function (err, doc) {
        console.log(doc.rows)
    });
}

function createTransaction({ name, amount, category }) {
    const transaction = {
        _id: uniqID(),
        name: name,
        type: 'transaction',
        amount: amount,
        date: new Date(),
        category: category
    };
    return db.put(transaction, function callback(err, result) {
        if (!err) {
            console.log('Successfully posted a todo!');
        }
    });
}

function createCategory({ name }) {
    const category = {
        _id: uniqID(),
        type: 'category',
        name: name,
    };

    return db.put(category)
}

async function listType({ type = 'category' }) {
    try {
        const result = await db.find({
            selector: { type: type }, // Filter by 'type' field
        });
        return result.docs
    } catch (err) {
        console.error('Error:', err);
    }
}

async function searchCategory({ name }) {
    try {
        const result = await db.find({
            selector: {
                type: 'category',
                name: name
            }, // Filter by 'type' field
        });
        console.log(result)
        return result.docs[0]
    } catch (err) {
        console.error('Error:', err);
    }
}

async function remove(id) {
    try {
        const doc = await db.get(id);
        const response = await db.remove(doc);
        console.log('Document deleted successfully:', response);
    } catch (err) {
        console.error('Error deleting document:', err);
    }
}

function uniqID() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

async function deleteAllDocuments() {
    try {
        const result = await db.allDocs({ include_docs: true });

        // Delete each document by its ID
        const deletePromises = result.rows.map(row => {
            return db.remove(row.doc);
        });

        // Wait for all deletions to complete
        await Promise.all(deletePromises);
        console.log('All documents deleted');
    } catch (error) {
        console.error('Error deleting documents:', error);
    }
}

// render category
async function renderCategory() {
    const list_category = await listType({ type: 'category' })
    const categoryInput = document.getElementById('category-list');
    categoryInput.innerHTML = '';
    list_category.forEach((category) => {
        const option = document.createElement('option');
        option.value = category.name;
        option.text = category.name;
        categoryInput.appendChild(option);
    });
}

// render transaction
async function renderTransaction() {
    const list = await listType({ type: 'transaction' })
    const container = document.getElementById('transaction-list');
    container.innerHTML = '';
    list.forEach((transaction) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row">${transaction._id} <button onclick="deleteRow('${transaction._id}')"> Delete </button></th>
            <td>${transaction.name}</td>
            <td>${transaction.amount}</td>
            <td>${transaction.category}</td>
        `
        container.appendChild(row);
    });
}

// Handle delete row
function deleteRow(id) {
    remove(id)
        .then(() => {
            alert('Transaction Deleted')
            renderTransaction();
            updateChart(chart);
        })
}

// render chart
function renderChart() {
    const ctx = document.getElementById('myChart');
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Moms', 'Listrik', 'Shophee'],
            datasets: [{
                label: '# of Votes',
                data: [100, 100, 2],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ],
                hoverOffset: 4
            }]
        },
    });

    return chart
}

async function updateChart(chart) {  
    let list_category = await listType({ type: 'category' })      
    list_category = list_category.map((category) => category.name)
    const list_transaction = await listType({ type: 'transaction' })
    chart.data.labels = list_category
    
    const result = _(list_transaction)
        .groupBy('category')  // Group by 'category'
        .mapValues(transactions => 
            _.sumBy(transactions, transaction => parseFloat(transaction.amount))  // Sum the amounts in each category
        )
        .value();

    const matchedResults = list_category.map(category => result[category] || 0); 
    chart.data.datasets[0].data = matchedResults
    chart.update();
} 

async function renderTotalAmount() {
    const totalAmount = document.getElementById('total-amount-label');
    const list_transaction = await listType({ type: 'transaction' })
    const total = _.sumBy(list_transaction, transaction => parseFloat(transaction.amount))
    totalAmount.innerText = Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total) // format total
}

(async () => {
    // await deleteAllDocuments();

    window.chart = renderChart();
    // updateChart(chart);

    const response = await db.createIndex({
        index: { fields: ['type', 'name'] }
    });

    renderCategory();
    renderTransaction();
    renderTotalAmount();

    // handle create category
    const categorySubmit = document.getElementById('category-submit');
    categorySubmit.addEventListener('click', () => {
        const category = document.getElementById('category-name-input').value;
        createCategory({ name: category })
            .then(() => {
                alert('Category Created')
                renderCategory();
            })
    });

    // handle delete category
    const categoryDeleteSubmit = document.getElementById('category-delete-submit');
    categoryDeleteSubmit.addEventListener('click', async (e) => {
        const category = document.getElementById('category-name-input').value;
        const findCategory = await searchCategory({ name: category })
        remove(findCategory._id)
            .then(() => {
                alert('Category Deleted')
                renderCategory();
            })
    });

    // handle add transaction
    const transactionSubmit = document.getElementById('transaction-submit');
    transactionSubmit.addEventListener('click', () => {
        const name = document.getElementById('transaction-name-input').value;
        const amount = document.getElementById('transaction-amount-input').value;
        const category = document.getElementById('category-list').value;
        createTransaction({ name, amount, category })
            .then(() => {
                alert('Transaction Created')
                renderTransaction();
                updateChart(chart);
            })
    });
    

})()


