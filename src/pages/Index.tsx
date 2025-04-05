
import React, { useEffect, useState, useRef } from 'react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoiceAssistant from '@/components/VoiceAssistant';
import ProductCard, { Product } from '@/components/ProductCard';
import ShoppingCart from '@/components/ShoppingCart';
import { products, categories, findProductsByName, findProductsByCategory } from '@/data/products';
import VoiceService from '@/services/VoiceService';
import { processCommand } from '@/utils/commandProcessor';
import { Search, ShoppingBag, HelpCircle } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [focusedProductId, setFocusedProductId] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const voiceServiceRef = useRef<VoiceService | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize voice service
  useEffect(() => {
    voiceServiceRef.current = new VoiceService({
      onResult: handleVoiceResult,
      onEnd: () => setIsListening(false),
      onError: (error) => {
        console.error('Voice error:', error);
        toast.error('Voice assistant error', { description: error });
        setIsListening(false);
      }
    });

    // Welcome message
    setTimeout(() => {
      speak("Welcome to Voice Grocer Aid. You can say 'help' to learn what I can do.");
    }, 1000);

    return () => {
      if (isListening && voiceServiceRef.current) {
        voiceServiceRef.current.stopListening();
      }
    };
  }, []);

  // Check if voice service is speaking
  useEffect(() => {
    const checkSpeaking = () => {
      if (voiceServiceRef.current) {
        setIsSpeaking(voiceServiceRef.current.isSpeaking());
      }
    };

    const interval = setInterval(checkSpeaking, 100);
    return () => clearInterval(interval);
  }, []);

  const speak = (text: string) => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.speak(text);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (voiceServiceRef.current) {
        voiceServiceRef.current.stopListening();
      }
      setIsListening(false);
    } else {
      if (voiceServiceRef.current) {
        voiceServiceRef.current.startListening();
      }
      setIsListening(true);
    }
  };

  const toggleMute = () => {
    if (voiceServiceRef.current) {
      const newMutedState = voiceServiceRef.current.toggleMute();
      setIsMuted(newMutedState);
      toast(newMutedState ? "Voice assistant muted" : "Voice assistant unmuted");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = findProductsByName(query);
    setFilteredProducts(results);
    setActiveCategory('all');
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
    setFilteredProducts(findProductsByCategory(categoryId));
  };

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
    
    toast.success(`Added to cart`, { description: product.name });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === productId);
      
      if (!existingItem) return prevCart;
      
      if (existingItem.quantity === 1) {
        return prevCart.filter(item => item.product.id !== productId);
      } else {
        return prevCart.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      }
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      speak('Your cart is empty. Please add items before checking out.');
      return;
    }
    
    // In a real app, this would navigate to a checkout page or process payment
    toast.success('Taking you to checkout');
    speak('Taking you to checkout. Your total is ' + getCartTotal().toFixed(2) + ' dollars.');
    
    // Simulate a checkout process
    setTimeout(() => {
      setCart([]);
      setIsCartOpen(false);
      toast.success('Purchase complete! Thank you for shopping with us.');
      speak('Thank you for your purchase! Your order will be delivered soon.');
    }, 3000);
  };

  const handleVoiceResult = (transcript: string) => {
    setLastCommand(transcript);
    console.log('Voice command received:', transcript);
    
    // Process the command
    const result = processCommand(transcript, products);
    console.log('Command result:', result);
    
    // Provide audio feedback
    speak(result.response);
    
    // Take action based on the command type
    switch (result.action) {
      case 'search':
        if (result.data?.query) {
          handleSearch(result.data.query);
        } else if (result.data?.category) {
          handleCategoryChange(result.data.category);
        }
        break;
        
      case 'add':
        if (result.data?.product) {
          const quantity = result.data.quantity || 1;
          for (let i = 0; i < quantity; i++) {
            handleAddToCart(result.data.product);
          }
        }
        break;
        
      case 'remove':
        if (result.data?.product) {
          handleRemoveFromCart(result.data.product.id);
        }
        break;
        
      case 'checkout':
        handleCheckout();
        break;
        
      case 'help':
        // Help is handled by the voice response
        break;
    }
  };

  const getCartItemQuantity = (productId: number): number => {
    const item = cart.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const getCartTotal = (): number => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            <h1 className="text-xl font-bold">Voice Grocer Aid</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => speak("Welcome to Voice Grocer Aid. You can say 'help' to learn what I can do.")}
            >
              <HelpCircle className="h-4 w-4 mr-1" /> 
              Help
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="w-full sm:w-auto">
              <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
                <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto sm:h-10 overflow-x-auto p-1">
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="text-xs sm:text-sm"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-24">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={handleAddToCart}
                onRemove={handleRemoveFromCart}
                quantity={getCartItemQuantity(product.id)}
                focused={focusedProductId === product.id}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-muted-foreground">
                Try a different search term or category
              </p>
            </div>
          )}
        </div>
      </main>
      
      <VoiceAssistant
        isListening={isListening}
        isSpeaking={isSpeaking}
        toggleListening={toggleListening}
        toggleMute={toggleMute}
        isMuted={isMuted}
        lastCommand={lastCommand}
        cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <ShoppingCart
        items={cart}
        onClose={() => setIsCartOpen(false)}
        onAdd={handleAddToCart}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
        isOpen={isCartOpen}
      />
    </div>
  );
};

export default Index;
