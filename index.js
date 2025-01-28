const db = new PouchDB('my_database');

function addTodo(text) {
    const todo = {
        _id: '001',
        title: text,
        completed: false
    };
    db.put(todo, function callback(err, result) {
        if (!err) {
            console.log('Successfully posted a todo!');
        }
    });
}


function showTodos() {
    db.allDocs({ include_docs: true, descending: true }, function (err, doc) {
        console.log(doc.rows)
    });
}

function remove(id){
    db.get(id).then((doc) => {
        return db.remove(doc);
      }).then((response) => {
        console.log('Document deleted successfully:', response);
      }).catch((err) => {
        console.error('Error deleting document:', err);
      });
}

// addTodo('hai')
// remove('2025-01-28T08:54:43.420Z')
showTodos()

const ctx = document.getElementById('myChart');

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Moms', 'Listrik', 'Shophee'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3],
        backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
          ],
          hoverOffset: 4
      }]
    },
  });