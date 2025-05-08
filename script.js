// 1️⃣ DOM 元素
const incomeForm = document.getElementById('income-form');
const salaryInput = document.getElementById('salary');
const parttimeInput = document.getElementById('parttime');
const investmentInput = document.getElementById('investment');
const otherInput = document.getElementById('other');
const transactionForm = document.getElementById("transaction-form");

// 2️⃣ 記帳資料儲存陣列
const transactions = [];

// 3️⃣ 監聽收入表單送出事件（來源是下方欄位）
incomeForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const salary = parseFloat(salaryInput.value) || 0;
  const parttime = parseFloat(parttimeInput.value) || 0;
  const investment = parseFloat(investmentInput.value) || 0;
  const other = parseFloat(otherInput.value) || 0;

  if (salary === 0 && parttime === 0 && investment === 0 && other === 0) {
    alert('請至少輸入一筆收入金額');
    return;
  }

  if (salary > 0) transactions.push({ type: 'income', category: '薪資', amount: salary });
  if (parttime > 0) transactions.push({ type: 'income', category: '兼職', amount: parttime });
  if (investment > 0) transactions.push({ type: 'income', category: '投資收益', amount: investment });
  if (other > 0) transactions.push({ type: 'income', category: '其他', amount: other });

  incomeForm.reset();
  updateIncomeChart();
  updateTotals(); // ✅ 手動輸入也觸發更新
});

// 4️⃣ 圓餅圖：分類加總（可選）
function calculateIncomeSummary() {
  const summary = {};
  transactions.forEach(tx => {
    if (tx.type === 'income') {
      if (!summary[tx.category]) summary[tx.category] = 0;
      summary[tx.category] += tx.amount;
    }
  });
  return summary;
}

let incomeChart;
function updateIncomeChart() {
  const ctx = document.getElementById('incomeChart');
  if (!ctx) return;
  const summary = calculateIncomeSummary();
  const labels = Object.keys(summary);
  const data = Object.values(summary);

  if (incomeChart) incomeChart.destroy();
  incomeChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#ffb6b9', '#cdb4db', '#ffdac1', '#a2d2ff']
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// 5️⃣ 新增記帳（來自上方「新增記帳」區）
transactionForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const type = document.getElementById("type").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value.trim();

  if (isNaN(amount) || category === "") {
    alert("請填寫金額與分類");
    return;
  }

  // 分類對照
  const incomeCategoryMap = {
    "薪資": "salary",
    "兼職": "parttime",
    "投資收益": "investment",
    "其他": "other"
  };
  const expenseCategoryMap = {
    "餐飲": "food",
    "交通": "transport",
    "娛樂": "entertainment",
    "其他": "expense-other"
  };
  const categoryMaps = {
    income: incomeCategoryMap,
    expense: expenseCategoryMap
  };

  const mapToUse = categoryMaps[type];
  const matchedKey = Object.keys(mapToUse).find(key => category.includes(key));
  const inputId = matchedKey ? mapToUse[matchedKey] : (type === 'income' ? "other" : "expense-other");
  const targetInput = document.getElementById(inputId);
  const current = parseFloat(targetInput.value) || 0;
  targetInput.value = current + amount;

  document.getElementById("amount").value = "";
  document.getElementById("category").value = "";

  updateTotals();
});

// 6️⃣ 總額與結餘計算
const incomeIds = ["salary", "parttime", "investment", "other"];
const expenseIds = ["food", "transport", "entertainment", "expense-other"];

const incomeTotalEl = document.getElementById("income-total");
const expenseTotalEl = document.getElementById("expense-total");
const netBalanceEl = document.getElementById("net-balance");

function updateTotals() {
  let incomeSum = 0;
  let expenseSum = 0;

  incomeIds.forEach(id => {
    const val = parseFloat(document.getElementById(id).value) || 0;
    incomeSum += val;
  });
  expenseIds.forEach(id => {
    const val = parseFloat(document.getElementById(id).value) || 0;
    expenseSum += val;
  });

  const net = incomeSum - expenseSum;
  incomeTotalEl.textContent = incomeSum.toLocaleString();
  expenseTotalEl.textContent = expenseSum.toLocaleString();
  netBalanceEl.textContent = net.toLocaleString();

  if (net < 0) {
    netBalanceEl.style.color = "#c0392b";
    netBalanceEl.textContent += "（超出預算）";
  } else {
    netBalanceEl.style.color = "#27ae60";
  }
}

// 7️⃣ 初始化事件
window.addEventListener('DOMContentLoaded', () => {
  updateIncomeChart();
  updateTotals();
  [...incomeIds, ...expenseIds].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.addEventListener("input", updateTotals);
  });
});

// 8️⃣ 清除按鈕
document.getElementById("reset-button").addEventListener("click", () => {
  incomeIds.concat(expenseIds).forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });
  updateTotals();
});