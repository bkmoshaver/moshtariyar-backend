import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShoppingBag, MapPin, Phone, Clock, Package, Scissors, X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import api from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface StoreData {
  _id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  branding: {
    logo?: string;
    banner?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  giftSettings: {
    enabled: boolean;
    percentage: number;
  };
  stats: {
    totalServices: number;
  };
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  type: 'product' | 'service';
  stock: number;
  image?: string;
}

export default function PublicStore() {
  const [, params] = useRoute('/s/:slug');
  const slug = params?.slug;
  
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'product' | 'service'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cart & Checkout
  const { items, addItem, removeItem, updateQuantity, totalItems, totalAmount, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: '', phone: '', note: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      maxQuantity: product.stock
    });
    setSelectedProduct(null);
    // Toast is handled in CartContext
  };

  const handleCheckout = async () => {
    if (!checkoutData.name || !checkoutData.phone) {
      toast.error('لطفاً نام و شماره تماس خود را وارد کنید');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/public/orders', {
        tenantId: store?._id, // This will be handled by backend via slug or passed explicitly
        slug: slug, // Pass slug to help backend identify tenant
        customerName: checkoutData.name,
        customerPhone: checkoutData.phone,
        items: items.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.price,
          title: item.title
        })),
        note: checkoutData.note
      });

      toast.success('سفارش شما با موفقیت ثبت شد');
      clearCart();
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setCheckoutData({ name: '', phone: '', note: '' });
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error(err.response?.data?.message || 'خطا در ثبت سفارش');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        // Fetch store info
        const storeRes = await api.get(`/public/store/${slug}`);
        setStore(storeRes.data);

        // Fetch products
        const productsRes = await api.get(`/products/public/${slug}`);
        if (productsRes.data.success) {
          setProducts(productsRes.data.data);
          setFilteredProducts(productsRes.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'خطا در دریافت اطلاعات فروشگاه');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.type === filterType));
    }
  }, [filterType, products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">فروشگاه یافت نشد</h1>
        <p className="text-gray-600">{error || 'فروشگاهی با این آدرس وجود ندارد'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
      {/* Header / Banner */}
      <div className="bg-white shadow-sm">
        {store.branding.banner && (
          <div className="w-full h-48 md:h-64 relative">
            <img 
              src={store.branding.banner} 
              alt={store.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}
        
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center gap-6 -mt-12 md:-mt-16 relative z-10">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white shadow-lg p-1 flex items-center justify-center overflow-hidden">
              {store.branding.logo ? (
                <img src={store.branding.logo} alt={store.name} className="w-full h-full object-contain rounded-xl" />
              ) : (
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                {store.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{store.address}</span>
                  </div>
                )}
                {store.stats.totalServices > 0 && (
                  <div className="flex items-center gap-1">
                    <Scissors className="w-4 h-4" />
                    <span>{store.stats.totalServices} خدمت انجام شده</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar / Filters */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">دسته‌بندی‌ها</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant={filterType === 'all' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setFilterType('all')}
                >
                  همه موارد
                </Button>
                <Button 
                  variant={filterType === 'product' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setFilterType('product')}
                >
                  محصولات
                </Button>
                <Button 
                  variant={filterType === 'service' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setFilterType('service')}
                >
                  خدمات
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">هیچ محصول یا خدمتی یافت نشد</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden group"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          {product.type === 'product' ? (
                            <Package className="w-12 h-12" />
                          ) : (
                            <Scissors className="w-12 h-12" />
                          )}
                        </div>
                      )}
                      {product.stock === 0 && product.type === 'product' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold px-3 py-1 bg-red-500 rounded-full text-sm">
                            ناموجود
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{product.title}</h3>
                        <Badge variant={product.type === 'product' ? 'default' : 'secondary'} className="text-xs">
                          {product.type === 'product' ? 'کالا' : 'خدمت'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          {product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              {product.originalPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="font-bold text-blue-600 text-lg">
                            {product.price.toLocaleString()} <span className="text-xs font-normal text-gray-500">تومان</span>
                          </span>
                        </div>
                        
                        {product.type === 'product' && product.stock === 0 ? (
                          <Badge variant="outline" className="text-red-500 border-red-200">ناموجود</Badge>
                        ) : (
                          <Button size="sm" variant="outline">مشاهده</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">اطلاعات تماس</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{store.address || 'آدرس ثبت نشده'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span dir="ltr" className="text-right w-full">{store.phone || 'شماره تماس ثبت نشده'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>ساعات کاری ثبت نشده</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-md z-[100]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedProduct?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
              {selectedProduct?.image ? (
                <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  {selectedProduct?.type === 'product' ? (
                    <Package className="w-16 h-16" />
                  ) : (
                    <Scissors className="w-16 h-16" />
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={selectedProduct?.type === 'product' ? 'default' : 'secondary'}>
                  {selectedProduct?.type === 'product' ? 'کالا' : 'خدمت'}
                </Badge>
                <div className="flex flex-col items-end">
                  {selectedProduct?.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {selectedProduct.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="font-bold text-blue-600 text-xl">
                    {selectedProduct?.price.toLocaleString()} <span className="text-xs font-normal text-gray-500">تومان</span>
                  </span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">
                {selectedProduct?.description || 'توضیحات بیشتری ثبت نشده است.'}
              </p>

              {selectedProduct?.type === 'product' && (
                <div className="pt-2">
                  <span className={`text-sm ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedProduct.stock > 0 ? `موجود در انبار: ${selectedProduct.stock} عدد` : 'ناموجود'}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <Button 
                className="w-full" 
                disabled={selectedProduct?.type === 'product' && selectedProduct.stock === 0}
                onClick={() => selectedProduct && handleAddToCart(selectedProduct)}
              >
                افزودن به سبد خرید
              </Button>
              <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                بستن
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <Button
          className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-xl z-50 flex items-center justify-center"
          onClick={() => setIsCartOpen(true)}
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            <Badge className="absolute -top-3 -right-3 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-red-500 hover:bg-red-600">
              {totalItems}
            </Badge>
          </div>
        </Button>
      )}

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md flex flex-col z-[100]" dir="rtl">
          <SheetHeader>
            <SheetTitle>سبد خرید</SheetTitle>
            <SheetDescription>
              {totalItems} محصول در سبد خرید شماست
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                سبد خرید شما خالی است
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.price.toLocaleString()} تومان
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-4 text-center text-sm">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <SheetFooter className="border-t pt-4 flex-col gap-4 sm:flex-col sm:space-x-0">
            <div className="flex items-center justify-between w-full font-bold text-lg">
              <span>جمع کل:</span>
              <span>{totalAmount.toLocaleString()} تومان</span>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              disabled={items.length === 0}
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
            >
              تکمیل خرید
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[425px] z-[100]" dir="rtl">
          <DialogHeader>
            <DialogTitle>نهایی کردن سفارش</DialogTitle>
            <DialogDescription>
              لطفاً اطلاعات تماس خود را وارد کنید تا فروشگاه با شما تماس بگیرد.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">نام و نام خانوادگی</Label>
              <Input
                id="name"
                value={checkoutData.name}
                onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                placeholder="مثال: علی محمدی"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">شماره تماس</Label>
              <Input
                id="phone"
                value={checkoutData.phone}
                onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                placeholder="مثال: 0912..."
                dir="ltr"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">توضیحات (اختیاری)</Label>
              <Input
                id="note"
                value={checkoutData.note}
                onChange={(e) => setCheckoutData({ ...checkoutData, note: e.target.value })}
                placeholder="توضیحات اضافی..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              انصراف
            </Button>
            <Button onClick={handleCheckout} disabled={submitting}>
              {submitting ? 'در حال ثبت...' : 'ثبت سفارش'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
