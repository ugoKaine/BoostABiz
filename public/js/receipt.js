// safe-escape for putting product names into attributes
function escapeAttr(s) {
  if (typeof s !== "string") return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

let sales = [];
let grandTotal = 0;

// ✅ Enable or disable "Generate Receipt" button
function updateGenerateButtonState() {
  const btn = document.getElementById("submitReceipt");
  if (!btn) return;
  btn.disabled = sales.length === 0;
}


function updatePriceFromInput() {
  const input = document.getElementById("productInput");
  const selectedValue = input.value.trim();
  const dataList = document.getElementById("productList");
  const options = dataList.getElementsByTagName("option");

  let matchedPrice = null;

  for (let opt of options) {
    if (opt.value.toLowerCase() === selectedValue.toLowerCase()) {
      matchedPrice = opt.getAttribute("data-price");
      break;
    }
  }

  if (matchedPrice) {
    document.getElementById("price").value = matchedPrice;
  } else {
    document.getElementById("price").value = "";
  }
}

function doMath() {
  const numOne = document.getElementById("quantity").value;
  const numTwo = document.querySelector("input[id=price]").value;
  const theProduct = parseInt(numOne) * parseInt(numTwo);
  const totalPrice = document.getElementById("total");

  if (theProduct) {
    totalPrice.textContent = "Total Price :" + theProduct;
  }
}

function saveArray(e) {
  e.preventDefault();
  const item = document.getElementById("productInput").value.trim();

  const quantity = parseFloat(document.getElementById("quantity").value);
  const price = parseFloat(document.getElementById("price").value);
  const total = parseFloat((parseFloat(quantity) * parseFloat(price)).toFixed(2));

  if (total) {
    document.querySelector("tbody").innerHTML = "";
    const newElement = { item, quantity, price, total };

    const elementExists = sales.find((eachElement) => eachElement.item === newElement.item);
    if (elementExists) {
      sales = sales.map((element) => {
        if (element.item == newElement.item) {
          element.quantity += parseFloat(newElement.quantity);
          element.total += parseFloat(newElement.total);
        }
        return element;
      });
    } else {
      sales.push(newElement);
    }

    grandTotal += parseInt(total);
    document.getElementById("formP").reset();

    let tbody = document.querySelector("tbody");
       sales.forEach((sale) => {
      let tr = document.createElement("tr");
      let content =
        "<td>" +
        sale.item +
        "</td><td>" +
        sale.quantity +
        "</td><td>" +
        sale.price +
        "</td><td>" +
        sale.total +
        "</td>";
      // replace id usage with data-item attribute
      content += `<td><button type="button" data-item="${escapeAttr(sale.item)}" class="btn delbtn" onclick="toggleDelete(this)">Del</button></td>`;
      tr.innerHTML = content;
      tbody.appendChild(tr);
    });


    document.getElementById("total").innerHTML = "";
    document.getElementById("grandTotal").innerHTML = "Grand Total #" + grandTotal;

    // ✅ Enable the button now that there's at least one sale
    updateGenerateButtonState();
  }
}

function toggleDelete(btn) {
  // btn is the <button> element passed from onclick="toggleDelete(this)"
  const row = btn.closest("tr");
  const itemName = btn.getAttribute("data-item");

  // remove from sales array
  const saleIndex = sales.findIndex((s) => s.item === itemName);
  if (saleIndex !== -1) {
    // subtract the total of that sale
    grandTotal -= parseFloat(sales[saleIndex].total) || 0;
    // ensure grandTotal never becomes NaN
    if (!isFinite(grandTotal)) grandTotal = 0;
    sales.splice(saleIndex, 1);
  }

  // remove row from DOM
  if (row) row.remove();

  // update displayed grand total or clear it
  const gtEl = document.getElementById("grandTotal");
  if (sales.length > 0) {
    gtEl.innerHTML = "Grand Total: #" + grandTotal.toFixed(2);
  } else {
    gtEl.innerHTML = "";
  }

  // update button state
  updateGenerateButtonState();
}



// ✅ Run on page load
document.addEventListener("DOMContentLoaded", () => {
  updateGenerateButtonState();
});

document.getElementById("submitReceipt").addEventListener("click", function () {
  const payment = document.getElementById("payment").value;
  const customerName = document.getElementById("customerName").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const address = document.getElementById("address").value;

  // ✅ Prevent clicking when no items are in sales
  if (sales.length === 0) {
    alert("Please add at least one item before generating a receipt.");
    return;
  }

  if (payment) {
  fetch("/receipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sales,
      grandTotal,
      payment,
      customerName,
      phoneNumber,
      address,
    }),
  })
    .then(async (response) => {
      // ✅ Handle backend validation errors (e.g. insufficient stock)
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Error processing receipt.");
        throw new Error(errorData.message);
      }
      return response.blob(); // success → get PDF
    })
    .then((data) => {
      // ✅ Open PDF in new tab
      var url = window.URL.createObjectURL(data);
      var anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.click();

      // ✅ Reset everything
      sales.length = 0;
      grandTotal = 0;
      document.querySelector("tbody").innerHTML = "";
      document.getElementById("grandTotal").innerHTML = "";
      document.getElementById("payment").value = "";
      document.getElementById("customerName").value = "";
      document.getElementById("phoneNumber").value = "";
      document.getElementById("address").value = "";

      // ✅ Disable button again after submission
      updateGenerateButtonState();
    })
    .catch((error) => {
      console.error("Error:", error);
      });
  } else {
    alert("Please select a payment method.");
  }
});