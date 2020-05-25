import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@GoMarketPlace:cart');

      if (cart) {
        setProducts(JSON.parse(cart));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productsArray = [...products];

      const index = products.findIndex(item => item.id === product.id);

      if (index >= 0) {
        const item = productsArray[index];
        item.quantity += 1;
        productsArray.splice(index, 1, item);
      } else {
        const newProduct = {
          ...product,
          quantity: 1,
        };
        productsArray.push(newProduct);
      }

      setProducts(productsArray);
      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsArray = [...products];
      const index = productsArray.findIndex(product => product.id === id);

      const item = productsArray[index];

      item.quantity += 1;

      productsArray.splice(index, 1, item);

      setProducts(productsArray);
      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsArray = [...products];
      const index = productsArray.findIndex(product => product.id === id);

      const item = productsArray[index];

      if (item.quantity - 1 > 0) {
        item.quantity -= 1;

        productsArray.splice(index, 1, item);
        setProducts(productsArray);
      } else {
        setProducts(products.filter(product => product.id !== id));
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
