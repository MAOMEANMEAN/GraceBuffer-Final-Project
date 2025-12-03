
export function cardProduct(products) {
    return `
        <div id="card-${products.id}" 
             class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
            <><div class="relative overflow-hidden">
                     <img src="${products.image || 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400&h=300&fit=crop'}"
                         alt="${products.title}"
                         class="w-full  object-cover group-hover:scale-105 transition-transform duration-300">
                         <div class="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">
                             $${products.price}
                         </div>
                     </></div><div class="p-6">
                         <h3 class="text-xl font-semibold text-gray-800 line-clamp-1 mb-2 group-hover:text-secondary transition-colors">
                             ${products.title}
                         </h3>
                         <p class="text-gray-600 mb-4 line-clamp-2">
                             ${products.description}
                         </p>
                         <div class="flex justify-between items-center">
                             <span class="text-2xl font-bold text-secondary">$${products.price}</span>
                             <button class="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
                                 onclick="event.stopPropagation()">
                                 ADD TO CART
                             </button>
                         </div>
                     </div></>
        </div>
`
}

