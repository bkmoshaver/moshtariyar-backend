import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingBag, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  note?: string;
  createdAt: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders'); // Assuming this endpoint exists
      setOrders(data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // toast.error('خطا در دریافت سفارشات');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success('وضعیت سفارش تغییر کرد');
      fetchOrders();
    } catch (error) {
      toast.error('خطا در تغییر وضعیت');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500">تکمیل شده</Badge>;
      case 'cancelled': return <Badge variant="destructive">لغو شده</Badge>;
      default: return <Badge variant="secondary">در انتظار</Badge>;
    }
  };

  if (loading) return <div className="p-8 text-center">در حال بارگذاری...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">مدیریت سفارشات</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            لیست سفارشات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              هنوز سفارشی ثبت نشده است.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">شماره سفارش</TableHead>
                  <TableHead className="text-right">مشتری</TableHead>
                  <TableHead className="text-right">مبلغ کل</TableHead>
                  <TableHead className="text-right">تاریخ</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-center">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-xs">{order._id.slice(-6)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.customerName}</span>
                        <span className="text-xs text-muted-foreground">{order.customerPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell>{order.totalAmount.toLocaleString()} تومان</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString('fa-IR')}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>جزئیات سفارش</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                              <p><strong>مشتری:</strong> {order.customerName}</p>
                              <p><strong>تلفن:</strong> {order.customerPhone}</p>
                              {order.note && <p><strong>توضیحات:</strong> {order.note}</p>}
                            </div>
                            
                            <div className="border rounded-md p-2">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-right">کالا</TableHead>
                                    <TableHead className="text-center">تعداد</TableHead>
                                    <TableHead className="text-left">قیمت</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.items.map((item, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>{item.name}</TableCell>
                                      <TableCell className="text-center">{item.quantity}</TableCell>
                                      <TableCell className="text-left">{(item.price * item.quantity).toLocaleString()}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t">
                              <span className="font-bold">جمع کل:</span>
                              <span className="text-lg font-bold text-primary">{order.totalAmount.toLocaleString()} تومان</span>
                            </div>

                            <div className="flex gap-2 pt-4">
                              <Button 
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => updateStatus(order._id, 'completed')}
                                disabled={order.status === 'completed'}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                تکمیل سفارش
                              </Button>
                              <Button 
                                variant="destructive" 
                                className="flex-1"
                                onClick={() => updateStatus(order._id, 'cancelled')}
                                disabled={order.status === 'cancelled'}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                لغو سفارش
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
