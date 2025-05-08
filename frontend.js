const form = document.getElementById('transaction-form');
const chartCanvas = document.getElementById('chart');
let myChart;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const transaction = {
    type: document.getElementById('type').value,
    amount: Number(document.getElementById('amount').value),
    category: document.getElementById('category').value
  };

  // 儲存到後端
  await fetch('http://localhost:5000/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction)
  });

  form.reset();
  fetchAndRender();
});

async function fetchAndRender() {
  const res = await fetch('http://localhost:5000/api/transactions');
  const data = await res.json();

  const summary = {};
  data.forEach(item => {
    const key = item.category;
    const val = item.type === 'income' ? item.amount : -item.amount;
    summary[key] = (summary[key] || 0) + val;
  });

  const labels = Object.keys(summary);
  const values = Object.values(summary);

  if (myChart) myChart.destroy();
  myChart = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: '收支分析',
        data: values,
        backgroundColor: [
          '#ffb6b9', '#fcd5ce', '#b5ead7', '#ffdac1', '#cdb4db', '#ffc6ff'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

fetchAndRender();
