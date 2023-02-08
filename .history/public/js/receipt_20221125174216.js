let sales = [];
let grandTotal = 0;
function doMath() {
  const numOne = document.getElementById("quantity").value;
  const numTwo = document.getElementById("price").value;
  const theProduct = parseInt(numOne) * parseInt(numTwo);
  const totalPrice = document.getElementById("total");

  if (theProduct) {
    totalPrice.innerHTML = "Total Price :" + theProduct;
  }
}

function saveArray(e) {
  e.preventDefault();
  const item = document.getElementById("item").value;
  const quantity = parseFloat(document.getElementById("quantity").value);
  const price = parseFloat(document.getElementById("price").value);
  const total = parseFloat(
    (parseFloat(quantity) * parseFloat(price)).toFixed(2)
  );
  if (total) {
    document.querySelector("tbody").innerHTML = "";
    const newElement = {
      item,
      quantity,
      price,
      total,
    };
    const elementExists = sales.find(
      (eachElement) => eachElement.item == newElement.item
    );
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
    console.log(sales);
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
      content += `<td><button id=${sale.item} class="btn delbtn" onclick="toggleDelete(this)">Rmv</button></td>`;
      tr.innerHTML = content;
      tbody.appendChild(tr);
    });
    document.getElementById("total").innerHTML = "";

    document.getElementById("grandTotal").innerHTML =
      "Grand Total #" + grandTotal;
  }
}

function toggleDelete(o) {
  var p = o.parentNode.parentNode;
  p.parentNode.removeChild(p);
  sales.find((s) => {
    if (s.item == o.id) {
      console.log(s);
      let itemIndex = sales.indexOf(s);
      console.log(s.total);
      grandTotal -= parseFloat(s.total);
      sales.splice(itemIndex, 1);
      document.getElementById("grandTotal").innerHTML =
        "Grand Total :  #" + grandTotal.toFixed(2);
    }
  });
}

document.getElementById("submitReceipt").addEventListener("click", function () {
  const payment = document.getElementById("payment").value;
  if (payment) {
    fetch("/receipt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sales, grandTotal, payment }),
    })
      .then((response) => {
        console.log(response);
        return response.blob();
      })
      .then((data) => {
        console.log(data);
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
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
});
