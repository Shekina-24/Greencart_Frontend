'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getStoredTokens } from "@/lib/auth/tokens";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type {
  CartItem,
  CatalogueFilters,
  CatalogueSort,
  DashboardMetrics,
  Product
} from "@/lib/types";
import { fetchProducts, fetchProductById } from "@/lib/services/products";
import {
  fetchCart,
  setCartItems as setRemoteCartItems,
  clearCart as clearRemoteCart,
  type CartItemRead
} from "@/lib/services/cart";
import { createOrder } from "@/lib/services/orders";
import { initPayment } from "@/lib/services/payments";

const BASE_FILTERS: CatalogueFilters = {
  category: "",
  region: "",
  availability: "",
  query: "",
  priceMin: null,
  priceMax: null,
  dlcMaxDays: null,
  sort: "newest"
};

const BASE_METRICS: DashboardMetrics = {
  orders: 0,
  co2: 0,
  savings: 0,
  weeklySavings: 0
};

const PAGE_SIZE = 12;
const AVAILABILITY_FETCH_LIMIT = 100;
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop";

export type AuthMode = "login" | "register" | null;

export interface ShoppingExperience {
  filters: CatalogueFilters;
  setFilters: (filters: CatalogueFilters) => void;
  resetFilters: () => void;
  categories: string[];
  regions: string[];
  featuredProducts: Product[];
  filteredProducts: Product[];
  totalProducts: number;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  isLoadingProducts: boolean;
  cartItems: CartItem[];
  cartCount: number;
  cartTotals: {
    totalPrice: number;
    totalCo2: number;
  };
  isCartSyncing: boolean;
  cartError: string | null;
  addToCart: (product: Product) => void;
  decreaseItem: (id: number) => void;
  increaseItem: (id: number) => void;
  removeItem: (id: number) => void;
  emptyCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  selectedProduct: Product | null;
  openProduct: (product: Product) => void;
  closeProduct: () => void;
  handleCheckout: () => void;
  metrics: DashboardMetrics;
  simulateWeek: () => void;
  totalCo2: number;
  totalSavings: number;
  producersCount: number;
  authModal: AuthMode;
  openAuthModal: (mode: Exclude<AuthMode, null>) => void;
  closeAuthModal: () => void;
  checkoutSuccess: string | null;
}

const mergeOptions = (current: string[], incoming: (string | undefined)[]): string[] => {
  const next = new Set(current);
  incoming.forEach((value) => {
    if (value) {
      next.add(value);
    }
  });
  return Array.from(next).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
};

const normaliseNumber = (value: number | null): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const shouldFetchAllForAvailability = (filters: CatalogueFilters): boolean =>
  filters.availability !== "";

const buildFetchParams = (filters: CatalogueFilters, page: number) => {
  const availabilityMode = shouldFetchAllForAvailability(filters);
  const limit = availabilityMode ? AVAILABILITY_FETCH_LIMIT : PAGE_SIZE;
  const offset = availabilityMode ? 0 : (page - 1) * PAGE_SIZE;

  return {
    query: filters.query || undefined,
    category: filters.category || undefined,
    region: filters.region || undefined,
    dlcWithinDays: normaliseNumber(filters.dlcMaxDays),
    priceMin: normaliseNumber(filters.priceMin),
    priceMax: normaliseNumber(filters.priceMax),
    limit,
    offset,
    sort: filters.sort as CatalogueSort
  };
};

const computeTotals = (items: CartItem[]) =>
  items.reduce(
    (acc, item) => {
      acc.totalPrice += item.price * item.quantity;
      acc.totalCo2 += item.co2Saved * item.quantity;
      return acc;
    },
    { totalPrice: 0, totalCo2: 0 }
  );

const randomIdempotencyKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `order-${Date.now()}-${Math.random()}`;

export function useShoppingExperience(initialFilters?: Partial<CatalogueFilters>): ShoppingExperience {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const router = useRouter();

  const [filters, setFiltersState] = useState<CatalogueFilters>({
    ...BASE_FILTERS,
    ...(initialFilters ?? {})
  });
  const [page, setPageState] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [allFetchedItems, setAllFetchedItems] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotals, setCartTotals] = useState(() => computeTotals([]));
  const [isCartSyncing, setIsCartSyncing] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setCartOpen] = useState(false);
  const [authModal, setAuthModal] = useState<AuthMode>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>(BASE_METRICS);

  const productCache = useRef<Map<number, Product>>(new Map());
  const cartItemsRef = useRef<CartItem[]>([]);
  const syncSequence = useRef(0);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  useEffect(() => {
    setFiltersState({
      ...BASE_FILTERS,
      ...(initialFilters ?? {})
    });
    setPageState(1);
  }, [initialFilters]);

  const getProductFromCache = useCallback(async (productId: number): Promise<Product | null> => {
    const cached = productCache.current.get(productId);
    if (cached) {
      return cached;
    }
    try {
      const fetched = await fetchProductById(productId);
      if (fetched) {
        productCache.current.set(fetched.id, fetched);
        return fetched;
      }
    } catch (error) {
      console.error("[useShoppingExperience] Failed to fetch product", error);
    }
    return null;
  }, []);

  const mapCartItemFromApi = useCallback(
    async (apiItem: CartItemRead): Promise<CartItem> => {
      const product = (await getProductFromCache(apiItem.product_id)) ?? {
        id: apiItem.product_id,
        slug: String(apiItem.product_id),
        name: apiItem.product_title,
        price: apiItem.unit_price_cents / 100,
        region: "France",
        category: "Produit",
        availability: "normal",
        co2Saved: 0,
        dlcDays: 0,
        unit: "Unite",
        image: PLACEHOLDER_IMAGE,
        description: ""
      };

      return {
        ...product,
        price: apiItem.unit_price_cents / 100,
        priceCents: apiItem.unit_price_cents,
        quantity: apiItem.quantity
      };
    },
    [getProductFromCache]
  );

  const updateFilterOptions = useCallback((items: Product[]) => {
    setCategories((current) => mergeOptions(current, items.map((item) => item.category)));
    setRegions((current) => mergeOptions(current, items.map((item) => item.region)));
  }, []);

  const loadProducts = useCallback(
    async (activeFilters: CatalogueFilters, pageNumber: number) => {
      setIsLoadingProducts(true);
      try {
        const params = buildFetchParams(activeFilters, pageNumber);
        const result = await fetchProducts(params);

        updateFilterOptions(result.items);

        const availabilityFiltered =
          activeFilters.availability && activeFilters.availability.length > 0
            ? result.items.filter((item) => item.availability === activeFilters.availability)
            : result.items;

        const paginatedItems = shouldFetchAllForAvailability(activeFilters)
          ? availabilityFiltered.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE)
          : availabilityFiltered;

        setProducts(paginatedItems);
        setAllFetchedItems(availabilityFiltered);
        setTotalProducts(shouldFetchAllForAvailability(activeFilters) ? availabilityFiltered.length : result.total);
      } catch (error) {
        console.error("[useShoppingExperience] Failed to fetch products", error);
        setProducts([]);
        setAllFetchedItems([]);
        setTotalProducts(0);
      } finally {
        setIsLoadingProducts(false);
      }
    },
    [updateFilterOptions]
  );

  useEffect(() => {
    void loadProducts(filters, page);
  }, [filters, page, loadProducts]);

  const featuredProducts = useMemo(
    () => allFetchedItems.filter((item) => item.availability === "surplus").slice(0, 3),
    [allFetchedItems]
  );

  const totalCo2 = useMemo(
    () => allFetchedItems.reduce((sum, product) => sum + product.co2Saved, 0),
    [allFetchedItems]
  );

  const totalSavings = useMemo(
    () => allFetchedItems.reduce((sum, product) => sum + product.price, 0) * 3,
    [allFetchedItems]
  );

  const producersCount = 42;

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const syncCartFromApi = useCallback(async () => {
    const tokens = getStoredTokens();
    if (!tokens) {
      setCartTotals(computeTotals(cartItemsRef.current));
      return;
    }
    const requestId = ++syncSequence.current;
    setIsCartSyncing(true);
    setCartError(null);
    try {
      const response = await fetchCart(tokens.accessToken);
      const mapped = await Promise.all(response.items.map(mapCartItemFromApi));
      if (syncSequence.current !== requestId) {
        return;
      }
      setCartItems(mapped);
      setCartTotals({
        totalPrice: response.total_amount_cents / 100,
        totalCo2: computeTotals(mapped).totalCo2
      });
    } catch (error) {
      if (syncSequence.current !== requestId) {
        return;
      }
      console.error("[useShoppingExperience] Failed to load cart", error);
      setCartError("Impossible de synchroniser le panier. Vos ajouts restent locaux.");
      setCartTotals(computeTotals(cartItemsRef.current));
    } finally {
      if (syncSequence.current === requestId) {
        setIsCartSyncing(false);
      }
    }
  }, [mapCartItemFromApi]);

  const syncCartToApi = useCallback(
    async (nextItems: CartItem[], optimisticTotals: { totalPrice: number; totalCo2: number }) => {
      const tokens = getStoredTokens();
      if (!tokens) {
        setCartTotals(optimisticTotals);
        return;
      }
      const requestId = ++syncSequence.current;
      setIsCartSyncing(true);
      setCartError(null);
      try {
        const response = await setRemoteCartItems(
          tokens.accessToken,
          nextItems.map((item) => ({ productId: item.id, quantity: item.quantity }))
        );
        if (syncSequence.current !== requestId) {
          return;
        }
        const mapped = await Promise.all(response.items.map(mapCartItemFromApi));
        setCartItems(mapped);
        setCartTotals({
          totalPrice: response.total_amount_cents / 100,
          totalCo2: computeTotals(mapped).totalCo2
        });
        } catch (error) {
          if (syncSequence.current !== requestId) {
            return;
          }
          console.error("[useShoppingExperience] Failed to sync cart", error);
          // Try to surface backend detail (e.g., stock insuffisant)
          const detail =
            error && typeof error === "object" && "payload" in (error as any)
              ? (error as any).payload && typeof (error as any).payload === "object" && "detail" in (error as any).payload
                ? (error as any).payload.detail
                : null
              : null;
          const message = typeof detail === "string" ? detail : "Synchronisation du panier impossible. Vos modifications restent locales.";
          setCartError(message);
          setCartTotals(optimisticTotals);
          setCartItems(nextItems);
        } finally {
        if (syncSequence.current === requestId) {
          setIsCartSyncing(false);
        }
      }
    },
    [mapCartItemFromApi]
  );

  useEffect(() => {
    if (isAuthenticated) {
      void syncCartFromApi();
    } else {
      setCartTotals(computeTotals(cartItemsRef.current));
    }
  }, [isAuthenticated, syncCartFromApi]);

  const applyCartUpdate = useCallback(
    (updater: (items: CartItem[]) => CartItem[]) => {
      setCartItems((current) => {
        const next = updater(current);
        const totals = computeTotals(next);
        setCheckoutSuccess(null);
        setCartTotals(totals);
        if (isAuthenticated) {
          void syncCartToApi(next, totals);
        }
        return next;
      });
    },
    [isAuthenticated, syncCartToApi]
  );

  const addToCart = useCallback(
    (product: Product) => {
      applyCartUpdate((items) => {
        const existing = items.find((item) => item.id === product.id);
        if (existing) {
          return items.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        const newItem: CartItem = { ...product, quantity: 1 };
        return [...items, newItem];
      });
    },
    [applyCartUpdate]
  );

  const decreaseItem = useCallback(
    (id: number) => {
      applyCartUpdate((items) =>
        items
          .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
          .filter((item) => item.quantity > 0)
      );
    },
    [applyCartUpdate]
  );

  const increaseItem = useCallback(
    (id: number) => {
      applyCartUpdate((items) =>
        items.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
      );
    },
    [applyCartUpdate]
  );

  const removeItem = useCallback(
    (id: number) => {
      applyCartUpdate((items) => items.filter((item) => item.id !== id));
    },
    [applyCartUpdate]
  );

  const emptyCart = useCallback(() => {
    applyCartUpdate(() => []);
    if (isAuthenticated) {
      const tokens = getStoredTokens();
      if (tokens) {
        void clearRemoteCart(tokens.accessToken);
      }
    }
  }, [applyCartUpdate, isAuthenticated]);

  const openCart = useCallback(() => {
    setCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setCartOpen(false);
  }, []);

  const openProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const closeProduct = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const handleCheckout = useCallback(() => {
    if (cartItemsRef.current.length === 0) {
      return;
    }

    if (!isAuthenticated) {
      setAuthModal("login");
      return;
    }

    const tokens = getStoredTokens();
    if (!tokens) {
      setAuthModal("login");
      return;
    }

    const payload = {
      items: cartItemsRef.current.map((item) => ({
        product_id: item.id,
        quantity: item.quantity
      }))
    };

    setCheckoutSuccess(null);
    setIsCartSyncing(true);
    setCartError(null);
    void createOrder(tokens.accessToken, payload, randomIdempotencyKey())
      .then(async (order) => {
        // Try to initialize Stripe checkout session
        try {
          const origin = window.location.origin;
          const session = await initPayment(tokens.accessToken, {
            order_id: order.id,
            provider: "stripe",
            success_url: `${origin}/payment/success`,
            cancel_url: `${origin}/payment/cancel`
          });
          // Redirect to hosted checkout
          window.location.href = session.checkout_url;
          return; // Stop local flow; webhook will update order
        } catch (paymentError) {
          console.warn("[useShoppingExperience] Stripe init failed, falling back to manual flow", paymentError);
        }

        // Fallback: manual confirmation flow
        setCartItems([]);
        setCartTotals({ totalPrice: 0, totalCo2: 0 });
        setMetrics((current) => ({
          orders: current.orders + 1,
          co2: current.co2 + order.totalImpactCo2Grams / 1000,
          savings: current.savings + order.totalAmountCents / 100,
          weeklySavings: current.weeklySavings
        }));
        setCartOpen(false);
        setCheckoutSuccess(
          `Commande #${order.id} validee ! Total ${(order.totalAmountCents / 100).toFixed(2)} ${order.currency}. Merci pour votre achat.`
        );
        try {
          const { trackPurchase } = await import("@/lib/analyticsEvents");
          trackPurchase({ orderId: order.id, currency: order.currency, totalCents: order.totalAmountCents });
        } catch {}
        try {
          await clearRemoteCart(tokens.accessToken);
        } catch (clearError) {
          console.error("[useShoppingExperience] Failed to clear remote cart after order", clearError);
          setCartError("Le panier distant n'a pas pu etre nettoye. Actualisez la page si besoin.");
        }
        await syncCartFromApi();
        try {
          router.push(`/compte/commandes?order=${order.id}&success=1`);
        } catch {
          // ignore router errors
        }
      })
      .catch((error) => {
        console.error("[useShoppingExperience] Checkout failed", error);
        setCartError("Impossible de finaliser la commande. Merci de reessayer.");
        setCheckoutSuccess(null);
      })
      .finally(() => {
        setIsCartSyncing(false);
      });
  }, [isAuthenticated, syncCartFromApi]);

  const simulateWeek = useCallback(() => {
    const addition = 8 + Math.random() * 22;
    setMetrics((current) => ({
      ...current,
      weeklySavings: current.weeklySavings + addition
    }));
  }, []);

  const setFilters = useCallback((nextFilters: CatalogueFilters) => {
    setPageState(1);
    setFiltersState(nextFilters);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(BASE_FILTERS);
    setPageState(1);
  }, []);

  const openAuthModal = useCallback((mode: Exclude<AuthMode, null>) => {
    setAuthModal(mode);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal(null);
  }, []);

  return {
    filters,
    setFilters,
    resetFilters,
    categories,
    regions,
    featuredProducts,
    filteredProducts: products,
    totalProducts,
    page,
    pageSize: PAGE_SIZE,
    setPage: setPageState,
    isLoadingProducts,
    cartItems,
    cartCount,
    cartTotals,
    isCartSyncing,
    cartError,
    addToCart,
    decreaseItem,
    increaseItem,
    removeItem,
    emptyCart,
    isCartOpen,
    openCart,
    closeCart,
    selectedProduct,
    openProduct,
    closeProduct,
    handleCheckout,
    metrics,
    simulateWeek,
    totalCo2,
    totalSavings,
    producersCount,
    authModal,
    openAuthModal,
    closeAuthModal,
    checkoutSuccess
  };
}
