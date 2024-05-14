let inventory = [];

// Check if inventory exists in local storage, and load it if available
const storedInventory = localStorage.getItem("inventory");
if (storedInventory) {
    inventory = JSON.parse(storedInventory);
}

function saveInventory() {
    localStorage.setItem("inventory", JSON.stringify(inventory));
}

function renderInventory(filteredInventory = null) {
    const inventoryList = document.getElementById("inventoryList");
    inventoryList.innerHTML = "";

    const items = filteredInventory || inventory;

    items.forEach((item, index) => {
        const itemElement = document.createElement("div");
        itemElement.classList.add(
            "border",
            "border-gray-300",
            "rounded",
            "p-4",
            "mb-4",
            "flex",
            "justify-between",
            "items-center",
        );

        const itemId = document.createElement("span");
        itemId.textContent = `ID: ${item.id}`;
        itemId.classList.add("text-sm", "font-semibold", "text-gray-600");
        itemElement.appendChild(itemId);

        const itemName = document.createElement("span");
        itemName.textContent = item.name;
        itemName.classList.add("text-lg", "font-semibold");
        itemElement.appendChild(itemName);

        const itemPrice = document.createElement("span");
        itemPrice.textContent = `Price: $${item.price}`;
        itemElement.appendChild(itemPrice);

        const itemQuantity = document.createElement("span");
        itemQuantity.textContent = `Quantity: ${item.quantity}`;
        itemElement.appendChild(itemQuantity);

        const itemActions = document.createElement("div");
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add(
            "px-3",
            "py-1",
            "bg-blue-500",
            "text-white",
            "rounded",
            "hover:bg-blue-600",
            "mr-2",
        );
        editButton.addEventListener("click", () => openEditProductPopup((item.id)-1));
        itemActions.appendChild(editButton);

        const addButton = document.createElement("button");
        addButton.textContent = "Add Stock";
        addButton.classList.add(
            "px-3",
            "py-1",
            "bg-green-500",
            "text-white",
            "rounded",
            "hover:bg-green-600",
        );
        addButton.addEventListener("click", () => openAddStockPopup((item.id)-1));
        itemActions.appendChild(addButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add(
            "px-3",
            "py-1",
            "bg-red-500",
            "text-white",
            "rounded",
            "hover:bg-red-600",
            "ml-2",
        );
        deleteButton.addEventListener("click", () => deleteProduct((item.id)-1));
        itemActions.appendChild(deleteButton);

        itemElement.appendChild(itemActions);

        inventoryList.appendChild(itemElement);
    });
}

function deleteProduct(index) {
    inventory.splice(index, 1); // Remove product from inventory array
    saveInventory(); // Save inventory to local storage
    renderInventory(); // Re-render inventory list
}

// Function to open edit product popup
function openEditProductPopup(index) {
    const product = inventory[index];

    // Update popup inputs with current product details
    document.getElementById("editProductName").value = product.name;
    document.getElementById("editProductPrice").value = product.price;
    document.getElementById("editProductQuantity").value = product.quantity;

    // Open popup
    document.getElementById("editProductPopup").style.display = "block";

    // Save index of the product being edited
    document.getElementById("editProductIndex").value = index;
}

// Function to save edited product details
function saveEditedProduct() {
    const index = document.getElementById("editProductIndex").value;
    const name = document.getElementById("editProductName").value;
    const price = parseFloat(document.getElementById("editProductPrice").value);
    const quantity = parseInt(
        document.getElementById("editProductQuantity").value,
    );

    if (name && !isNaN(price) && !isNaN(quantity) && quantity >= 0) {
        // Update product details
        inventory[index].name = name;
        inventory[index].price = price;
        inventory[index].quantity = quantity;

        saveInventory(); // Save inventory to local storage
        renderInventory(); // Re-render inventory list

        // Close popup
        document.getElementById("editProductPopup").style.display = "none";
    } else {
        alert("Please provide valid product details.");
    }
}

// Function to open add stock popup
function openAddStockPopup(index) {
    const product = inventory[index];

    // Update popup inputs with current product details
    document.getElementById("addStockProductName").textContent = product.name;
    document.getElementById("addStockProductId").value = product.id;
    document.getElementById("addStockProductQuantity").value = "";

    // Open popup
    document.getElementById("addStockPopup").style.display = "block";
}

// Function to save added stock
function saveAddedStock() {
    const index = parseInt(document.getElementById("addStockProductId").value);
    const quantity = parseInt(
        document.getElementById("addStockProductQuantity").value,
    );

    if (!isNaN(quantity) && quantity > 0) {
        // Update stock quantity
        inventory[index - 1].quantity += quantity;

        saveInventory(); // Save inventory to local storage
        renderInventory(); // Re-render inventory list

        // Close popup
        document.getElementById("addStockPopup").style.display = "none";
    } else {
        alert("Please provide a valid quantity to add.");
    }
}

// Function to search inventory items
function searchInventory() {
    const searchTerm = document
        .getElementById("searchTerm")
        .value.toLowerCase();
    const filteredInventory = inventory.filter(
        (item) =>
            item.name.toLowerCase().includes(searchTerm) ||
            String(item.id).includes(searchTerm),
    );
    renderInventory(filteredInventory);
}

// Function to open add product popup
function openAddProductPopup() {
    // Clear previous input values
    document.getElementById("newProductName").value = "";
    document.getElementById("newProductPrice").value = "";
    document.getElementById("newProductQuantity").value = "";

    // Open popup
    document.getElementById("addProductPopup").style.display = "block";
}

// Function to save new product
function saveNewProduct() {
    const name = document.getElementById("newProductName").value;
    const price = parseFloat(document.getElementById("newProductPrice").value);
    const quantity = parseInt(
        document.getElementById("newProductQuantity").value,
    );

    if (name && !isNaN(price) && !isNaN(quantity) && quantity >= 0) {
        // Generate new product ID
        const id = inventory.length + 1;

        // Create new product object
        const newProduct = { id, name, price, quantity };

        // Add new product to inventory
        inventory.push(newProduct);

        saveInventory(); // Save inventory to local storage
        renderInventory(); // Re-render inventory list

        // Close popup
        document.getElementById("addProductPopup").style.display = "none";
    } else {
        alert("Please provide valid product details.");
    }
}

// Initialize with some dummy data for demonstration
if (inventory.length === 0) {
    inventory.push({ id: 1, name: "Product A", price: 20.5, quantity: 10 });
    inventory.push({ id: 2, name: "Product B", price: 15.75, quantity: 20 });
    inventory.push({ id: 3, name: "Product C", price: 30, quantity: 15 });
    saveInventory();
}

// Render initial inventory
renderInventory();
