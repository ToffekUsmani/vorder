
import React from 'react';
import { 
  ShoppingCart as CartIcon, 
  X, 
  Plus, 
  Minus, 
  CreditCard,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Product } from './ProductCard';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onClose,
  onAdd,
  onRemove,
  onCheckout,
  isOpen
}) => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[90%] sm:w-[400px] sm:max-w-md flex flex-col h-full" side="right">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl flex items-center gap-2">
            <CartIcon className="h-6 w-6" />
            Your Cart
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
          </SheetTitle>
        </SheetHeader>
        
        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-grow py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4 p-2 rounded-lg bg-secondary">
                    <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => onRemove(item.product.id)}
                        className="h-8 w-8 rounded-md"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => onAdd(item.product)}
                        className="h-8 w-8 rounded-md"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between text-lg font-medium">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <Button 
                className="w-full"
                size="lg"
                onClick={onCheckout}
              >
                <CreditCard className="mr-2 h-5 w-5" /> Checkout
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onClose}
              >
                <ArrowLeft className="mr-2 h-5 w-5" /> Continue Shopping
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-grow space-y-4 py-12">
            <div className="rounded-full bg-muted p-6">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium">Your cart is empty</h3>
            <p className="text-muted-foreground text-center">
              Try saying "Add apples to my cart" or browse the products to add items
            </p>
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="mr-2 h-5 w-5" /> Start Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCart;
