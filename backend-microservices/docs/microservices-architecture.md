# MeriGauMata Microservices Architecture

## Overview

This document describes the complete microservices architecture for the MeriGauMata e-commerce platform, including internal/external communication patterns and Next.js frontend integration.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Next.js)                               │
│                              :3000, :3001                                    │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ HTTP/REST
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (gateway-service)                        │
│                              :3000                                          │
│                   ┌─────────────────────────────────┐                       │
│                   │   Routes to microservices       │                       │
│                   │   - /auth/* → auth-service      │                       │
│                   │   - /products/* → product-svc   │                       │
│                   │   - /cart/* → cart-service      │                       │
│                   │   - /orders/* → order-service   │                       │
│                   │   - /users/* → user-service     │                       │
│                   │   - /payments/* → payment-svc  │                       │
│                   │   - /content/* → content-svc    │                       │
│                   │   - /events/* → event-service   │                       │
│                   │   - /analytics/* → analytics    │                       │
│                   └─────────────────────────────────┘                       │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ HTTP + gRPC
         ┌───────────┬───────────┼───────────┬───────────┬───────────┐
         ▼           ▼           ▼           ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │   AUTH  │ │ PRODUCT │ │  CART   │ │  ORDER  │ │  USER   │ │ PAYMENT │
    │ SERVICE │ │ SERVICE │ │ SERVICE │ │ SERVICE │ │ SERVICE │ │ SERVICE │
    │  :3001  │ │  :3002  │ │  :3003  │ │  :3004  │ │  :3005  │ │  :3006  │
    └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
         │           │           │           │           │           │
         └───────────┴─────┬─────┴───────────┴─────┬─────┴───────────┘
                           │ gRPC
         ┌─────────────────┼─────────────────┬─────────────────┐
         ▼                 ▼                 ▼                 ▼
   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
   │  CONTENT  │   │  STORAGE  │   │   EVENT   │   │COMMUNICA- │
   │  SERVICE  │   │  SERVICE  │   │  SERVICE  │   │   TION    │
   │  :3007    │   │  :3008    │   │  :3009    │   │  :3010    │
   └───────────┘   └───────────┘   └───────────┘   └───────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌───────────┐   ┌───────────┐   ┌───────────┐
   │ ANALYTICS │   │   CRON    │   │   gRPC    │
   │  SERVICE  │   │  SERVICE  │   │  Gateway  │
   │  :3011    │   │  :3012    │   │           │
   └───────────┘   └───────────┘   └───────────┘
```

---

## Service Catalog

### Core Services

#### 1. Auth Service (Port: 3001)
**Purpose:** Authentication, authorization, and session management

**Endpoints:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/otp/send` - Send OTP
- `POST /auth/otp/verify` - Verify OTP
- `POST /auth/oauth/google` - Google OAuth
- `POST /auth/oauth/facebook` - Facebook OAuth
- `GET /auth/sessions` - Get user sessions
- `DELETE /auth/sessions/:id` - Delete session

**Database Schema:** `auth` (users, sessions, oauth_providers, otps)

**Dependencies:**
- Identity Repository
- Session Repository
- JWT Service

---

#### 2. Product Service (Port: 3002)
**Purpose:** Product catalog, inventory management, categories

**Endpoints:**
- `GET /products` - List products
- `GET /products/:id` - Get product details
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)
- `GET /categories` - List categories
- `GET /products/:id/variants` - Get product variants
- `POST /products/:id/variants` - Create variant (admin)
- `GET /inventory` - Get inventory logs
- `POST /inventory/adjust` - Adjust inventory (admin)
- `GET /reviews` - Get product reviews
- `POST /reviews` - Add review
- `GET /delivery/zones` - Get delivery zones

**Database Schema:** `product` (categories, products, product_images, product_variants, inventory_logs, reviews, delivery_zones, delivery_charges, delivery_partners)

---

#### 3. Cart Service (Port: 3003)
**Purpose:** Shopping cart management and coupon validation

**Endpoints:**
- `GET /cart` - Get user cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/:id` - Update cart item
- `DELETE /cart/items/:id` - Remove cart item
- `POST /cart/apply-coupon` - Apply coupon
- `POST /cart/validate-coupon` - Validate coupon
- `POST /cart/checkout` - Initiate checkout
- `GET /coupons` - List coupons (admin)
- `POST /coupons` - Create coupon (admin)

**Database Schema:** `cart` (carts, cart_items, coupons, applied_coupons)

**Dependencies:**
- Product Service (via gRPC)
- Payment Service (via gRPC)

---

#### 4. Order Service (Port: 3004)
**Purpose:** Order processing, returns, and invoicing

**Endpoints:**
- `GET /orders` - List user orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `PUT /orders/:id/status` - Update order status (admin)
- `POST /orders/:id/cancel` - Cancel order
- `GET /returns` - List returns
- `POST /returns` - Create return request
- `PUT /returns/:id/status` - Update return status (admin)
- `GET /invoices` - List invoices
- `GET /invoices/:id` - Get invoice PDF

**Database Schema:** `orders` (orders, order_items, returns, return_items, return_qc_results, invoices)

**Dependencies:**
- Cart Service (via gRPC)
- Payment Service (via gRPC)
- User Service (via gRPC)

---

#### 5. User Service (Port: 3005)
**Purpose:** User profile, addresses, and account management

**Endpoints:**
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `GET /addresses` - List addresses
- `POST /addresses` - Add address
- `PUT /addresses/:id` - Update address
- `DELETE /addresses/:id` - Delete address
- `GET /settings` - Get user settings
- `PUT /settings` - Update settings
- `GET /managers` - List managers (admin)
- `POST /managers` - Create manager (admin)
- `POST /account-deletion` - Request account deletion

**Database Schema:** `users` (profiles, addresses, store_settings, managers, manager_permissions, account_deletions)

---

#### 6. Payment Service (Port: 3006)
**Purpose:** Payment processing, refunds, and webhook handling

**Endpoints:**
- `POST /payments` - Create payment
- `GET /payments/:id` - Get payment status
- `POST /payments/:id/refund` - Process refund (admin)
- `POST /webhooks/razorpay` - Razorpay webhook
- `POST /webhooks/stripe` - Stripe webhook
- `GET /refunds` - List refunds (admin)

**Database Schema:** `payments` (payments, refunds, webhook_logs)

**Dependencies:**
- Order Service (via gRPC)

---

### Content Services

#### 7. Content Service (Port: 3007)
**Purpose:** CMS functionality - blogs, pages, policies, translations

**Endpoints:**
- `GET /blogs` - List blogs
- `GET /blogs/:slug` - Get blog post
- `POST /blogs` - Create blog (admin)
- `GET /pages` - List pages
- `GET /pages/:slug` - Get page
- `GET /policies` - List policies
- `GET /faqs` - List FAQs
- `GET /gallery` - List galleries
- `GET /testimonials` - List testimonials
- `GET /geo/countries` - List countries
- `GET /geo/states/:countryId` - List states
- `GET /geo/cities/:stateId` - List cities
- `GET /translations` - Get translations
- `POST /translations` - Add translation (admin)
- `GET /about` - Get about content

**Database Schema:** `content` (blogs, faqs, galleries, pages, policies, testimonials, social_media, comments, countries, states, cities, pin_codes, contact_info, bank_details, translations, translation_metadata, about_cards, impact_stats, timeline_events, team_members, future_goals, about_settings)

---

#### 8. Storage Service (Port: 3008)
**Purpose:** File uploads and management

**Endpoints:**
- `POST /upload` - Upload file
- `GET /files/:id` - Get file info
- `DELETE /files/:id` - Delete file
- `GET /files` - List files

**Database Schema:** `storage` (files)

**Storage:** Supabase Storage / AWS S3

---

#### 9. Event Service (Port: 3009)
**Purpose:** Events and donations management

**Endpoints:**
- `GET /events` - List events
- `GET /events/:id` - Get event details
- `POST /events` - Create event (admin)
- `POST /events/:id/register` - Register for event
- `GET /donations` - List donations
- `POST /donations` - Make donation

**Database Schema:** `events` (events, event_registrations, donations)

---

### Supporting Services

#### 10. Analytics Service (Port: 3011)
**Purpose:** Logging, auditing, and real-time events

**Endpoints:**
- `GET /analytics/audit` - Get audit logs (admin)
- `GET /analytics/requests` - Get request logs (admin)
- `GET /realtime/events` - Get realtime events
- `POST /realtime/emit` - Emit realtime event

**Database Schema:** `analytics` (audit_logs, request_logs, realtime_events, realtime_subscriptions)

---

#### 11. Communication Service (Port: 3010)
**Purpose:** Email, notifications, and contact messages

**Endpoints:**
- `POST /email/send` - Send email
- `GET /email/templates` - List email templates
- `POST /email/templates` - Create template (admin)
- `GET /notifications` - Get user notifications
- `POST /contact` - Submit contact form
- `GET /admin/alerts` - Get admin alerts (admin)

**Database Schema:** `communication` (email_templates, email_queue, contact_messages, notifications, admin_alerts)

---

#### 12. Cron Service (Port: 3012)
**Purpose:** Scheduled jobs and task management

**Endpoints:**
- `GET /jobs` - List cron jobs (admin)
- `POST /jobs` - Create cron job (admin)
- `GET /jobs/:id/runs` - Get job runs

**Database Schema:** `cron` (cron_jobs, job_runs)

---

## Communication Patterns

### 1. External Communication (Client to Services)

All external API calls go through the **API Gateway** which routes requests to appropriate services.

```
Client → API Gateway → Service
```

**Protocol:** HTTP/REST

**Authentication:** JWT Bearer Token in Authorization header

**Request Format:**
```http
GET /products HTTP/1.1
Host: api.merigaumata.com
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

### 2. Internal Communication (Service to Service)

Services communicate with each other using **gRPC** for performance-critical operations.

```
Service A → gRPC Client → gRPC Server → Service B
```

**Protocol:** gRPC/Protocol Buffers

**Available Services:**
```proto
service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc ValidateToken(ValidateTokenRequest) returns (ValidateTokenResponse);
}

service ProductService {
  rpc GetProduct(GetProductRequest) returns (GetProductResponse);
  rpc UpdateStock(UpdateStockRequest) returns (UpdateStockResponse);
}

service CartService {
  rpc GetCart(GetCartRequest) returns (GetCartResponse);
  rpc ValidateCoupon(ValidateCouponRequest) returns (ValidateCouponResponse);
}

service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (CreateOrderResponse);
  rpc UpdateOrderStatus(UpdateOrderStatusRequest) returns (UpdateOrderStatusResponse);
}

service PaymentService {
  rpc CreatePayment(CreatePaymentRequest) returns (CreatePaymentResponse);
  rpc VerifyPayment(VerifyPaymentRequest) returns (VerifyPaymentResponse);
}

service NotificationService {
  rpc SendEmail(SendEmailRequest) returns (SendEmailResponse);
  rpc SendNotification(SendNotificationRequest) returns (SendNotificationResponse);
}
```

---

### 3. gRPC Client Implementation

**Service Registry (environment variables):**
```env
USER_SERVICE_HOST=auth-service
USER_SERVICE_PORT=3001
PRODUCT_SERVICE_HOST=product-service
PRODUCT_SERVICE_PORT=3002
```

**Usage Example:**
```typescript
import { GrpcClientFactory } from '@merigaumata/grpc-client';

@Injectable()
export class OrderService {
  private userClient: any;
  
  constructor(private grpcFactory: GrpcClientFactory) {
    this.userClient = this.grpcFactory.create({
      service: 'user',
      host: process.env.USER_SERVICE_HOST,
      port: parseInt(process.env.USER_SERVICE_PORT),
    });
  }
  
  async validateUser(userId: string) {
    return new Promise((resolve, reject) => {
      this.userClient.getUser({ id: userId }, (err, response) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  }
}
```

---

## Database Schema Strategy

Each service has its own database schema in Supabase PostgreSQL:

| Service | Schema | Purpose |
|---------|--------|---------|
| Auth | `auth` | User authentication |
| Product | `product` | Products & inventory |
| Cart | `cart` | Shopping cart |
| Order | `orders` | Orders & returns |
| User | `users` | User profiles |
| Payment | `payments` | Payment processing |
| Content | `content` | CMS content |
| Storage | `storage` | File metadata |
| Event | `events` | Events & donations |
| Analytics | `analytics` | Logs & events |
| Communication | `communication` | Email & notifications |
| Cron | `cron` | Job scheduling |

---

## Next.js Frontend Integration

### 1. API Client Configuration

**`lib/api.ts`:**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.merigaumata.com';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: RegisterDTO) {
    return this.request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Products
  async getProducts(params?: ProductQueryParams) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ products: Product[]; total: number }>(
      `/products?${query}`
    );
  }

  async getProduct(id: string) {
    return this.request<{ product: Product }>(`/products/${id}`);
  }

  // Cart
  async getCart() {
    return this.request<{ cart: Cart }>('/cart');
  }

  async addToCart(productId: string, quantity: number, variantId?: string) {
    return this.request<{ cart: Cart }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity, variant_id: variantId }),
    });
  }

  // Orders
  async getOrders() {
    return this.request<{ orders: Order[] }>('/orders');
  }

  async createOrder(data: CreateOrderDTO) {
    return this.request<{ order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payments
  async createPayment(orderId: string) {
    return this.request<{ paymentId: string; paymentLink: string }>(
      '/payments',
      { method: 'POST', body: JSON.stringify({ order_id: orderId }) }
    );
  }
}

export const api = new ApiClient(API_BASE_URL);
```

---

### 2. Authentication Integration

**`lib/auth.ts`:**
```typescript
import { api } from './api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const auth = {
  async login(email: string, password: string) {
    const { accessToken, user } = await api.login(email, password);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    api.setToken(accessToken);
    return user;
  },

  async register(data: { email: string; password: string; name: string }) {
    const { user } = await api.register(data);
    return user;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    api.setToken('');
  },

  getUser(): AuthUser | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  init() {
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
    }
  },

  async refreshToken() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const { accessToken } = await response.json();
    localStorage.setItem('token', accessToken);
    api.setToken(accessToken);
  },
};

if (typeof window !== 'undefined') {
  auth.init();
}
```

---

### 3. React Hooks for API

**`hooks/useProducts.ts`:**
```typescript
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useProducts(params?: ProductQueryParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const { products } = await api.getProducts(params);
        setProducts(products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [params?.category, params?.search, params?.page]);

  return { products, loading, error };
}
```

**`hooks/useCart.ts`:**
```typescript
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      const { cart } = await api.getCart();
      setCart(cart);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId: string, quantity: number, variantId?: string) => {
    const { cart } = await api.addToCart(productId, quantity, variantId);
    setCart(cart);
  };

  return { cart, loading, addItem, refreshCart };
}
```

---

### 4. Environment Variables

**`.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://api.merigaumata.com
NEXT_PUBLIC_GATEWAY_URL=https://gateway.merigaumata.com

# Optional: For development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

### 5. Server-Side Rendering with API

**`app/products/[slug]/page.tsx`:**
```typescript
import { api } from '@/lib/api';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { product } = await api.getProduct(params.slug);
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { product } = await api.getProduct(params.slug);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCartButton product={product} />
    </div>
  );
}
```

---

## Error Handling

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

### Frontend Error Handling
```typescript
try {
  await api.getProducts();
} catch (err) {
  if (err.message === 'Unauthorized') {
    // Redirect to login
    router.push('/login');
  } else if (err.message === 'Network Error') {
    // Show offline message
    toast.error('Please check your internet connection');
  }
}
```

---

## Rate Limiting

The API Gateway implements rate limiting:
- **Default:** 1000 requests per 15 minutes
- **Authenticated:** Higher limits based on user tier
- **Endpoints:** `/auth/*` has stricter limits

---

## WebSocket for Real-time Updates

For real-time features (notifications, order status):

```typescript
// lib/socket.ts
class SocketClient {
  private socket: WebSocket | null = null;

  connect(token: string) {
    this.socket = new WebSocket(
      `wss://api.merigaumata.com/ws?token=${token}`
    );
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ORDER_STATUS') {
        updateOrderStatus(data.payload);
      }
    };
  }

  subscribe(channel: string) {
    this.socket?.send(JSON.stringify({ action: 'subscribe', channel }));
  }
}

export const socket = new SocketClient();
```

---

## Security

### API Security
1. **JWT Authentication** - Bearer token in Authorization header
2. **Rate Limiting** - Prevent abuse
3. **Input Validation** - Zod/class-validator
4. **CORS** - Whitelist allowed origins
5. **Helmet** - Security headers
6. **CSRF** - Token-based protection

### Environment Security
```env
# Never commit secrets
JWT_SECRET=<random-32-char-string>
RAZORPAY_KEY_SECRET=<secret>
SUPABASE_SERVICE_KEY=<secret>
```

---

## Monitoring & Logging

### Request Logging
All services log:
- Request/response bodies
- Response times
- Error stack traces

### Health Checks
- `GET /health` - Service health status
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

---

## Service Discovery

In production, services discover each other through:

1. **Environment Variables** - Static service URLs
2. **Service Mesh** - Kubernetes/Docker Compose
3. **Service Registry** - Consul/Eureka (optional)

---

## Summary

This microservices architecture provides:

1. **Scalability** - Each service can scale independently
2. **Maintainability** - Small, focused teams per service
3. **Reliability** - Service isolation prevents cascading failures
4. **Flexibility** - Mix of REST (external) and gRPC (internal) communication
5. **Developer Experience** - Clear boundaries, shared packages, comprehensive documentation

For deployment instructions, see [Deployment Guide](./deployment.md).