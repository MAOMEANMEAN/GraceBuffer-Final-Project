// components/cart-item.js
// Cart Item Component - Matches Your Design

export function createCartItem(item) {
    const subtotal = (item.price * item.qty).toFixed(2);
    
    return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow" data-item-id="${item.id || item.uuid}">
            <div class="flex gap-4">
                
                <!-- Product Image -->
                <div class="w-24 h-24 flex-shrink-0">
                    <img 
                        src="${item.image || '../assets/images/placeholder.jpg'}" 
                        alt="${item.name || item.product?.name}"
                        class="w-full h-full object-cover rounded-lg"
                        onerror="this.src='../assets/images/placeholder.jpg'"
                    >
                </div>

                <!-- Product Details -->
                <div class="flex-grow">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-bold text-primary-text-color mb-1">
                                ${item.name || item.product?.name}
                            </h3>
                            <p class="text-sm text-secondary-text-color">${item.category || 'Product'}</p>
                            <p class="text-secondary font-bold mt-2">$${Number(item.price).toFixed(2)}</p>
                        </div>
                        
                        <!-- Remove Button -->
                        <button 
                            onclick="removeFromCart('${item.id || item.uuid}')"
                            class="text-red-500 hover:text-red-700 transition-colors"
                            title="Remove item"
                        >
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- Quantity Controls -->
                    <div class="flex items-center gap-4 mt-4">
                        <span class="text-sm text-secondary-text-color font-medium">Quantity:</span>
                        <div class="flex items-center border-2 border-gray-300 rounded-lg">
                            <button 
                                onclick="decreaseQuantity('${item.id || item.uuid}', ${item.qty})"
                                class="px-3 py-1 hover:bg-gray-100 transition-colors ${item.qty <= 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                                ${item.qty <= 1 ? 'disabled' : ''}
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                                </svg>
                            </button>
                            
                            <span class="px-4 py-1 border-l-2 border-r-2 border-gray-300 font-semibold min-w-[3rem] text-center">
                                ${item.qty}
                            </span>
                            
                            <button 
                                onclick="increaseQuantity('${item.id || item.uuid}', ${item.qty})"
                                class="px-3 py-1 hover:bg-gray-100 transition-colors"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                            </button>
                        </div>

                        <!-- Subtotal -->
                        <div class="ml-auto">
                            <span class="text-sm text-secondary-text-color">Subtotal:</span>
                            <span class="text-lg font-bold text-secondary ml-2">$${subtotal}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}