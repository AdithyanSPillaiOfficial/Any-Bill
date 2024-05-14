function fetchItemDetails() {
    const productIdInput = document.getElementById("productId");
    const productId = parseInt(productIdInput.value);

    const item = inventory.find((item) => item.id === productId);

    if (item) {
        const itemNameInput = document.getElementById("itemName");
        const itemPriceInput = document.getElementById("itemPrice");

        itemNameInput.value = item.name;
        itemPriceInput.value = item.price;
    } else {
        alert("Product not found!");
    }
}

function showSuggetions() {
    const searchTerm = document.getElementById("productId").value.toLowerCase();
    const filteredInventory = inventory.filter(
        (item) =>
            item.name.toLowerCase().includes(searchTerm) ||
            String(item.id).includes(searchTerm),
    );
    showSuggestions(filteredInventory);
}

function showSuggestions(input) {
    const dropdown = document.getElementById("suggestionDropdown");
    dropdown.innerHTML = "";

    if (input.length === 0) {
        dropdown.style.display = "none";
        return;
    }
    dropdown.style.display = "block";
    input.forEach((suggestion) => {
        const suggestionItem = document.createElement("div");
        suggestionItem.classList.add("suggestion-item", "px-4", "py-2");
        suggestionItem.textContent = `${suggestion.id} - ${suggestion.name}`;
        suggestionItem.addEventListener("click", () => {
            document.getElementById("productId").value = suggestion.id;
            dropdown.style.display = "none";
            fetchItemDetails();
        });
        dropdown.appendChild(suggestionItem);
    });
}

// Close suggestions dropdown when clicking outside
window.addEventListener("click", (event) => {
    const dropdown = document.getElementById("suggestionDropdown");
    if (!event.target.matches("#inputBox")) {
        dropdown.style.display = "none";
    }
});

// Keyboard navigation
let selectedIndex = -1;
document.getElementById("productId").addEventListener("keydown", (event) => {
    const dropdown = document.getElementById("suggestionDropdown");
    const items = dropdown.querySelectorAll(".suggestion-item");
    if (event.key === "ArrowDown") {
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelected();
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateSelected();
    } else if (event.key === "Enter") {
        event.preventDefault();
        if (selectedIndex !== -1) {
            document.getElementById("productId").value =
                items[selectedIndex].textContent;
            fetchItemDetails();
            dropdown.style.display = "none";
        }
    } else if (event.key === "Tab") {
        event.preventDefault(); // Prevent default tab behavior (moving focus)
        document.getElementById("quantity").focus(); // Focus on the next input box
    }
});

document
    .getElementById("addItemBtn")
    .addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default tab behavior (moving focus)
            addItemToBill();
            document.getElementById("productId").value = "";
            document.getElementById("productId").focus(); // Focus on the next input box
        }
    });

// Function to update selected item style
function updateSelected() {
    const dropdown = document.getElementById("suggestionDropdown");
    const items = dropdown.querySelectorAll(".suggestion-item");
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add("bg-gray-200");
        } else {
            item.classList.remove("bg-gray-200");
        }
    });
}

let billItems = [];
let totalAmount = 0;

function addItemToBill() {
    const productIdInput = document.getElementById("productId");
    const productId = parseInt(productIdInput.value);
    const item = inventory.find((item) => item.id === productId);

    if (!item) {
        alert("Product not found!");
        return;
    }

    const quantityInput = document.getElementById("quantity");
    const quantity = parseInt(quantityInput.value);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Please provide a valid quantity.");
        return;
    }

    if (quantity > item.quantity) {
        alert("Insufficient quantity in inventory.");
        return;
    }

    // Add item to bill
    billItems.push({ item, quantity });

    // Update total amount
    totalAmount += item.price * quantity;

    // Display added item in the bill items list
    renderBillItems();

    // Update total amount on screen
    updateTotalAmount();
}

function deleteItemFromBill(index) {
    const deletedItem = billItems.splice(index, 1)[0];
    if (deletedItem) {
        totalAmount -= deletedItem.item.price * deletedItem.quantity;
    }

    // Update total amount on screen
    updateTotalAmount();

    // Display updated bill items list
    renderBillItems();
}

function updateTotalAmount() {
    let totalAmountContainer = document.getElementById("totalAmount");
    if (!totalAmountContainer) {
        totalAmountContainer = document.createElement("div");
        totalAmountContainer.id = "totalAmount";
        document.getElementById("billItems").appendChild(totalAmountContainer);
    }
    totalAmountContainer.textContent = `Total Amount: $${totalAmount}`;
}

function renderBillItems() {
    const billItemsContainer = document.getElementById("billItems");
    billItemsContainer.innerHTML = "";

    // Create table element
    const table = document.createElement("table");
    table.classList.add("table", "table-striped", "table-hover", "table-bordered");

    // Create table header
    const headerRow = document.createElement("tr");
    const headers = ["Item", "Price", "Quantity", "Total"];
    headers.forEach(headerText => {
        const headerCell = document.createElement("th");
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });
    table.appendChild(headerRow);

    // Populate table with bill items
    billItems.forEach((billItem, index) => {
        const item = billItem.item;
        const quantity = billItem.quantity;

        const row = document.createElement("tr");

        // Item cell
        const itemCell = document.createElement("td");
        itemCell.textContent = item.name;
        row.appendChild(itemCell);

        // Price cell
        const priceCell = document.createElement("td");
        priceCell.textContent = `$${item.price.toFixed(2)}`;
        row.appendChild(priceCell);

        // Quantity cell
        const quantityCell = document.createElement("td");
        quantityCell.textContent = quantity;
        row.appendChild(quantityCell);

        // Total cell
        const totalCell = document.createElement("td");
        const total = item.price * quantity;
        totalCell.textContent = `$${total.toFixed(2)}`;
        row.appendChild(totalCell);

        table.appendChild(row);
    });

    billItemsContainer.appendChild(table);

    // Update total amount on screen
    updateTotalAmount();
}

function saveBill() {
    if (billItems.length === 0) {
        alert("No items in the bill.");
        return;
    }

    // Subtract billed items from inventory
    billItems.forEach((billItem) => {
        const item = billItem.item;
        const quantity = billItem.quantity;
        const index = inventory.findIndex((invItem) => invItem.id === item.id);
        if (index !== -1) {
            inventory[index].quantity -= quantity;
        }
    });

    // Save inventory to local storage
    saveInventory();

    // Generate PDF bill
    const doc = new jsPDF();
    let yOffset = 10;

    // Title
    doc.setFontSize(22);
    doc.text("Invoice", 105, yOffset, { align: 'center' });
    yOffset += 15;

    // Table headers
    doc.setFontSize(12);
    doc.text("Item", 10, yOffset);
    doc.text("Quantity", 70, yOffset);
    doc.text("Price", 110, yOffset);
    doc.text("Total", 160, yOffset);
    yOffset += 7;

    // Bill Items in table format
    billItems.forEach((billItem, index) => {
        const item = billItem.item;
        const quantity = billItem.quantity;

        doc.text(item.name, 10, yOffset);
        doc.text(quantity.toString(), 70, yOffset);
        doc.text(`$${item.price.toFixed(2)}`, 110, yOffset);
        doc.text(`$${(item.price * quantity).toFixed(2)}`, 160, yOffset);

        yOffset += 10;
    });

    // Total Amount
    doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 10, yOffset + 10);

    // Output PDF
    //doc.save('invoice.pdf');
    // Open PDF in a new window
    const pdfDataUri = doc.output("datauristring");
    window.open(pdfDataUri);
}

document
    .getElementById("fetchItemBtn")
    .addEventListener("click", fetchItemDetails);
document.getElementById("addItemBtn").addEventListener("click", addItemToBill);
document.getElementById("saveBillBtn").addEventListener("click", saveBill);
