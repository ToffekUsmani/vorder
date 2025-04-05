
import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from './ProductCard';

interface CartItem {
  product: Product;
  quantity: number;
}

interface ShoppingCartProps {
  items: CartItem[];
  onClose: () => void;
  onAdd: (product: Product) => void;
  onRemove: (productId: number) => void;
  onCheckout: () => void;
  isOpen: boolean;
  className?: string; // Added className prop to fix the error
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ 
  items, 
  onClose, 
  onAdd, 
  onRemove, 
  onCheckout, 
  isOpen,
  className 
}) => {
  if (!isOpen) return null;
  
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className={`w-full max-w-md bg-white h-full overflow-y-auto ${className}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <ShoppingBag className="mr-2" /> Shopping Cart
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close cart"
          >
            <X />
          </button>
        </div>
        
        {items.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Button variant="outline" onClick={onClose}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                    <div>
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-gray-600 text-sm">${item.product.price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                      aria-label={`Remove one ${item.product.name}`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    
                    <span className="w-8 text-center">{item.quantity}</span>
                    
                    <button
                      onClick={() => onAdd(item.product)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                      aria-label={`Add one more ${item.product.name}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t p-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-bold">${totalPrice.toFixed(2)}</span>
              </div>
              
              <Button onClick={onCheckout} className="w-full">
                Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
