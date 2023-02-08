const sales = [];
let grandTotal = 0;
const btn = document.getElementById("btn");
// let today = new Date().toLocaleDateString();
document.getElementById("date").innerHTML = new Date().toLocaleDateString();
function doMath() {
  const numOne = document.getElementById("quantity").value;
  const numTwo = document.getElementById("price").value;
  const theProduct = parseInt(numOne) * parseInt(numTwo);
  const totalPrice = document.getElementById("total");

  if (theProduct) {
    totalPrice.innerHTML = theProduct;
  }
}

function saveArray(e) {
  e.preventDefault();
  const item = document.getElementById("item").value;
  const quantity = document.getElementById("quantity").value;
  const price = document.getElementById("price").value;
  const total = parseInt(quantity) * parseInt(price);
  if (total) {
    sales.push({ item, quantity, price, total });
    grandTotal += parseInt(total);
    document.getElementById("formP").reset();

    document.getElementById("itemm").innerHTML += item + "<br>";
    document.getElementById("quantityy").innerHTML += quantity + "<br>";
    document.getElementById("pricee").innerHTML += price + "<br>";
    document.getElementById("totall").innerHTML += total + "<br>";
    document.getElementById("btn").innerHTML += "btn" + "<br>";

    document.getElementById("total").innerHTML = "";

    document.getElementById("grandTotal").innerHTML =
      "Grand Total #" + grandTotal;
  }
}
document.getElementById("submitReceipt").addEventListener("click", function () {
  fetch("/receipt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sales, grandTotal }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      sales.length = 0;
      grandTotal = 0;
      document.getElementById("itemm").innerHTML = "";
      document.getElementById("quantityy").innerHTML = "";
      document.getElementById("pricee").innerHTML = "";
      document.getElementById("totall").innerHTML = "";
      document.getElementById("total").innerHTML = "";
      document.getElementById("grandTotal").innerHTML = "";
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
