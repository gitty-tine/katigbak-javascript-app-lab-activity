let cart = [];

const itemForm = document.querySelector("#item-form");
const itemName = document.querySelector("#item-name");
const itemPrice = document.querySelector("#item-price");
const itemQuantity = document.querySelector("#item-quantity");
const cartItems = document.querySelector("#cart-items");
const itemCount = document.querySelector("#item-count");
const formMessage = document.querySelector("#form-message");
const budgetInput = document.querySelector("#budget");
const budgetAlert = document.querySelector("#budget-alert");
const calculatorDisplay = document.querySelector("#calculator-display");
const calculatorMessage = document.querySelector("#calculator-message");
const currentTime = document.querySelector("#current-time");
const themeToggle = document.querySelector("#theme-toggle");

let calculatorValue = "0";
let firstNumber = null;
let selectedOperation = "";
let waitingForNumber = false;


function formatPeso(amount) {
    return `₱${amount.toFixed(2)}`;
}

function escapeHtml(text) {
    const el = document.createElement("span");
    el.textContent = text;
    return el.innerHTML;
}

function cartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}


function updateTotals() {
    const total = cartTotal();
    const budget = Number(budgetInput.value);

    document.querySelector("#total").textContent = formatPeso(total);

    if (budget > 0 && total > budget) {
        budgetAlert.textContent = `Over budget by ${formatPeso(total - budget)}.`;
        budgetAlert.classList.add("is-over-budget");
    } else if (budget > 0) {
        budgetAlert.textContent = `You have ${formatPeso(budget - total)} left in your budget.`;
        budgetAlert.classList.remove("is-over-budget");
    } else {
        budgetAlert.textContent = "";
        budgetAlert.classList.remove("is-over-budget");
    }
}

function displayCart() {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = '<tr class="empty-row"><td colspan="5">Your cart is empty.</td></tr>';
    } else {
        cart.forEach((item, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="item-name-cell">${escapeHtml(item.name)}</td>
                <td class="item-price-cell">${formatPeso(item.price)}</td>
                <td>${item.quantity}</td>
                <td class="subtotal-cell">${formatPeso(item.price * item.quantity)}</td>
                <td><button class="remove-button" type="button" data-index="${index}" aria-label="Remove ${escapeHtml(item.name)}">×</button></td>
            `;
            cartItems.appendChild(row);
        });
    }

    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    itemCount.textContent = `${totalQty} ${totalQty === 1 ? "item" : "items"}`;
    updateTotals();
}


itemForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = itemName.value.trim();
    const price = Number(itemPrice.value);
    const quantity = Number(itemQuantity.value);

    if (name === "") {
        formMessage.textContent = "Please enter an item name.";
        itemName.focus();
        return;
    }
    if (!Number.isFinite(price) || price <= 0) {
        formMessage.textContent = "Please enter a price greater than ₱0.00.";
        itemPrice.focus();
        return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
        formMessage.textContent = "Please enter a whole-number quantity.";
        itemQuantity.focus();
        return;
    }

    cart.push({ name, price, quantity });
    formMessage.textContent = "Item added to your cart.";
    itemForm.reset();
    itemQuantity.value = "1";
    displayCart();
    itemName.focus();
});

cartItems.addEventListener("click", (event) => {
    const btn = event.target.closest(".remove-button");
    if (!btn) return;
    cart.splice(Number(btn.dataset.index), 1);
    displayCart();
});

budgetInput.addEventListener("input", updateTotals);


document.querySelector("#reset-button").addEventListener("click", () => {
    if (!window.confirm("Clear all items from your cart?")) return;

    cart = [];
    itemForm.reset();
    itemQuantity.value = "1";
    document.querySelector("#store-name").value = "";
    budgetInput.value = "";
    formMessage.textContent = "";
    displayCart();
    itemName.focus();
});


function updateClock() {
    currentTime.textContent = new Intl.DateTimeFormat("en-PH", {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date());
}


function updateThemeButton() {
    const dark = document.body.classList.contains("dark-mode");
    themeToggle.textContent = dark ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("cart-desk-theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    updateThemeButton();
});

if (localStorage.getItem("cart-desk-theme") === "dark") {
    document.body.classList.add("dark-mode");
}


function calculateAnswer(a, b, op) {
    if (op === "add")      return a + b;
    if (op === "subtract") return a - b;
    if (op === "multiply") return a * b;
    if (op === "divide")   return b === 0 ? null : a / b;
    return b;
}

function showCalculatorValue() {
    calculatorDisplay.textContent = calculatorValue;
}

function addCalculatorNumber(number) {
    if (waitingForNumber) {
        calculatorValue  = number === "." ? "0." : number;
        waitingForNumber = false;
    } else if (number === "." && calculatorValue.includes(".")) {
        return;
    } else if (calculatorValue === "0" && number !== ".") {
        calculatorValue = number;
    } else {
        calculatorValue += number;
    }
    calculatorMessage.textContent = "";
    showCalculatorValue();
}

function chooseCalculatorOperation(operation) {
    firstNumber = Number(calculatorValue);
    selectedOperation = operation;
    waitingForNumber  = true;
}

function finishCalculator() {
    if (selectedOperation === "" || firstNumber === null) return;

    const answer = calculateAnswer(firstNumber, Number(calculatorValue), selectedOperation);

    if (answer === null) {
        calculatorMessage.textContent = "You cannot divide by zero.";
        calculatorValue = "0";
    } else {
        calculatorValue = String(Number(answer.toFixed(8)));
    }

    firstNumber = null;
    selectedOperation = "";
    waitingForNumber  = true;
    showCalculatorValue();
}

function clearCalculator() {
    calculatorValue = "0";
    firstNumber = null;
    selectedOperation = "";
    waitingForNumber = false;
    calculatorMessage.textContent = "";
    showCalculatorValue();
}

document.querySelector(".calculator-buttons").addEventListener("click", (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    if (btn.dataset.number !== undefined) addCalculatorNumber(btn.dataset.number);
    if (btn.dataset.operation)               chooseCalculatorOperation(btn.dataset.operation);
    if (btn.dataset.action === "equals")     finishCalculator();
    if (btn.dataset.action === "clear")      clearCalculator();
});

document.querySelector("#calculatorOffcanvas").addEventListener("hidden.bs.offcanvas", clearCalculator);


displayCart();
updateClock();
updateThemeButton();
setInterval(updateClock, 30000);