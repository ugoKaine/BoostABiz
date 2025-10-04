let sales = [];
let grandTotal = 0;

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
  // const selectedProduct = document.querySelector("select[id=products]");
  // const item = selectedProduct.options[selectedProduct.selectedIndex].text;
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
      content += `<td><button id=${sale.item} class="btn delbtn" onclick="toggleDelete(this)">Del</button></td>`;
      tr.innerHTML = content;
      tbody.appendChild(tr);
    });
    document.getElementById("total").innerHTML = "";
    document.getElementById("grandTotal").innerHTML = "Grand Total #" + grandTotal;
  }
}

function toggleDelete(o) {
  var p = o.parentNode.parentNode;
  p.parentNode.removeChild(p);
  sales.find((s) => {
    if (s.item == o.id) {
      let itemIndex = sales.indexOf(s);
      grandTotal -= parseFloat(s.total);
      sales.splice(itemIndex, 1);
      document.getElementById("grandTotal").innerHTML =
        "Grand Total :  #" + grandTotal.toFixed(2);
    }
  });
}

document.getElementById("submitReceipt").addEventListener("click", function () {
  const payment = document.getElementById("payment").value;
  const customerName = document.getElementById("customerName").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const address = document.getElementById("address").value;

  if (payment) {
    fetch("/receipt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sales,
        grandTotal,
        payment,
        customerName,
        phoneNumber,
        address,
      }),
    })
      .then((response) => response.blob())
      .then((data) => {
        var url = window.URL.createObjectURL(data),
          anchor = document.createElement("a");
        anchor.href = url;
        anchor.target = "_blank";
        anchor.click();
        sales.length = 0;
        grandTotal = 0;
        document.querySelector("tbody").innerHTML = "";
        document.getElementById("grandTotal").innerHTML = "";
        document.getElementById("payment").value = "";
        document.getElementById("customerName").value = "";
        document.getElementById("phoneNumber").value = "";
        document.getElementById("address").value = "";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    alert("Please select a payment method.");
  }
});