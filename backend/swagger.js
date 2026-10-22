const swaggerUi = require('swagger-ui-express');

const customCss = `
  .swagger-ui .topbar { 
    background-color: #121212; 
    border-bottom: 2px solid #C5A880; 
    padding: 12px 0;
  }
  .swagger-ui .topbar .topbar-wrapper {
    max-width: 1400px;
  }
  .swagger-ui .topbar .topbar-wrapper a span {
    color: #FFFFFF;
    font-weight: 800;
    font-size: 18px;
    letter-spacing: 1px;
  }
  .swagger-ui .topbar .topbar-wrapper a span::after {
    content: " • Enterprise E-Commerce Platform API";
    color: #C5A880;
    font-size: 13px;
    font-weight: 600;
    margin-left: 8px;
  }
  .swagger-ui .info {
    margin: 30px 0 20px 0;
    padding: 24px;
    background: #FAF9F6;
    border-radius: 16px;
    border: 1px solid #EAE8E2;
  }
  .swagger-ui .info .title {
    color: #121212;
    font-weight: 800;
    font-size: 32px;
  }
  .swagger-ui .info .description {
    font-size: 14px;
    color: #4A4A4A;
    line-height: 1.6;
  }
  .swagger-ui .opblock.opblock-get {
    border-color: #0D9488;
    background: rgba(13, 148, 136, 0.05);
  }
  .swagger-ui .opblock.opblock-get .opblock-summary-method {
    background: #0D9488;
  }
  .swagger-ui .opblock.opblock-post {
    border-color: #4F46E5;
    background: rgba(79, 70, 229, 0.05);
  }
  .swagger-ui .opblock.opblock-post .opblock-summary-method {
    background: #4F46E5;
  }
  .swagger-ui .opblock.opblock-put {
    border-color: #D97706;
    background: rgba(217, 119, 6, 0.05);
  }
  .swagger-ui .opblock.opblock-put .opblock-summary-method {
    background: #D97706;
  }
  .swagger-ui .opblock.opblock-delete {
    border-color: #E11D48;
    background: rgba(225, 29, 72, 0.05);
  }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method {
    background: #E11D48;
  }
  .swagger-ui .opblock.opblock-patch {
    border-color: #0284C7;
    background: rgba(2, 132, 199, 0.05);
  }
  .swagger-ui .opblock.opblock-patch .opblock-summary-method {
    background: #0284C7;
  }
  .swagger-ui .btn.execute {
    background-color: #121212;
    border-color: #121212;
    color: #FFFFFF;
    font-weight: 700;
    border-radius: 8px;
  }
  .swagger-ui .btn.execute:hover {
    background-color: #C5A880;
    border-color: #C5A880;
  }
`;

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Ghar Sansar Enterprise API',
    version: '2.5.0',
    description: `
### Luxury Home & Kitchen Store — Omnichannel E-Commerce Engine
Welcome to the official developer documentation for the **Ghar Sansar** backend ecosystem, designed to power high-scale enterprise experiences across **Web (React/Vite)**, **Mobile App (iOS/Android Expo)**, and **Admin POS Terminals**.

#### Architecture Highlights (Flipkart & Amazon Grade):
- **Universal Multi-Channel Integration:** Unified APIs with unified authentication, cart syncing, and push alerts.
- **Dynamic Coupons & Promotions Engine:** Real-time coupon validation, min-cart checks, and instant price reduction.
- **Logistics & Shiprocket/AWB Tracking:** Automated courier assignment, tracking checkpoints, and pincode serviceability.
- **Live Inventory & Pagination:** High-performance catalog browsing with resilient image normalization and caching.
- **Real-Time Push Notifications:** Instant broadcast and order milestones via Expo Notifications.
    `,
    termsOfService: 'https://gharsansar.store/terms',
    contact: {
      name: 'Ghar Sansar Engineering Team',
      email: 'tech@gharsansar.store',
      url: 'https://gharsansar.store'
    },
    license: {
      name: 'Proprietary Commercial License',
      url: 'https://gharsansar.store/license'
    }
  },
  servers: [
    {
      url: 'http://localhost:5001',
      description: 'Localhost Development Server'
    },
    {
      url: 'http://192.168.29.12:5001',
      description: 'LAN Physical Device Server (Wi-Fi)'
    },
    {
      url: 'https://backend.gharsansar.store',
      description: 'Production Cloud Cluster'
    }
  ],
  tags: [
    { name: 'Coupons & Promotions', description: 'Enterprise promotional codes, percentage discounts, and cart validation' },
    { name: 'Products & Catalog', description: 'Product listings, multi-level categories, search autocomplete, and return gifts' },
    { name: 'Flash Sale & Banners', description: 'Timed lightning deals, countdown clocks, and hero banners' },
    { name: 'Orders & Checkout', description: 'Order placement, invoice generation, status transitions, and courier assignment' },
    { name: 'Shipping & Logistics', description: 'Pincode delivery verification, shipping label creation, and live AWB tracking' },
    { name: 'Authentication & Profile', description: 'User registration, JWT login, Google OAuth, and profile management' },
    { name: 'Wishlist', description: 'Cross-platform customer wishlist synchronization' },
    { name: 'Customer Notifications', description: 'In-app notification feeds and Expo push notification token registration' },
    { name: 'Reviews & Ratings', description: 'Verified customer feedback, star ratings, and photo reviews' },
    { name: 'Support & Live Chat', description: 'Instant messaging between customer and concierge team' },
    { name: 'CMS & Analytics', description: 'Homepage layout builder, collection banners, and hit tracking' },
    { name: 'Health & System', description: 'Liveness probes, server diagnostics, and auto-pull triggers' }
  ],
  paths: {
    // ----------------------------------------------------------------------
    // COUPONS & PROMOTIONS
    // ----------------------------------------------------------------------
    '/api/coupons': {
      get: {
        tags: ['Coupons & Promotions'],
        summary: 'List all active coupons and promotional offers',
        description: 'Returns available discounts (Flipkart/Amazon style) for both Web and Mobile apps, including min cart value, max savings, and terms.',
        responses: {
          200: {
            description: 'List of active coupons',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'number', example: 6 },
                    coupons: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Coupon' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Coupons & Promotions'],
        summary: 'Create a new promotional coupon (Admin)',
        description: 'Enables administrators to create new seasonal or partner coupons.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CouponInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Coupon created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Coupon created successfully' },
                    coupon: { $ref: '#/components/schemas/Coupon' }
                  }
                }
              }
            }
          },
          400: { description: 'Missing required coupon parameters' }
        }
      }
    },
    '/api/coupons/validate': {
      post: {
        tags: ['Coupons & Promotions'],
        summary: 'Validate coupon code and calculate savings',
        description: 'Tests if a promo code is valid for a given cart subtotal and calculates the exact discount amount, net total, and savings breakdown.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'cartTotal'],
                properties: {
                  code: { type: 'string', example: 'GHARLUXE' },
                  cartTotal: { type: 'number', example: 1499 },
                  userId: { type: 'string', example: 'usr_102' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Validation result and savings breakdown',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    valid: { type: 'boolean', example: true },
                    code: { type: 'string', example: 'GHARLUXE' },
                    discount: { type: 'number', example: 150 },
                    cartTotal: { type: 'number', example: 1499 },
                    finalTotal: { type: 'number', example: 1349 },
                    savingsMessage: { type: 'string', example: 'You saved ₹150 with code GHARLUXE!' },
                    coupon: { $ref: '#/components/schemas/Coupon' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Coupon invalid or criteria not met',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    valid: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'FESTIVE500 requires a minimum order of ₹2,499' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/coupons/apply': {
      post: {
        tags: ['Coupons & Promotions'],
        summary: 'Apply coupon to cart order (Universal Web & App)',
        description: 'Applies the coupon and returns an itemized checkout price summary ready for payment gateway invocation.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'items'],
                properties: {
                  code: { type: 'string', example: 'FESTIVE500' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        productId: { type: 'string', example: 'prod-cello-12-pcs-soup-set-1' },
                        price: { type: 'number', example: 749 },
                        quantity: { type: 'number', example: 4 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Itemized checkout summary with applied coupon',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    subtotal: { type: 'number', example: 2996 },
                    discount: { type: 'number', example: 500 },
                    deliveryFee: { type: 'number', example: 0 },
                    totalPayable: { type: 'number', example: 2496 },
                    couponCode: { type: 'string', example: 'FESTIVE500' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/coupons/{code}': {
      delete: {
        tags: ['Coupons & Promotions'],
        summary: 'Delete or deactivate promo code (Admin)',
        parameters: [
          { name: 'code', in: 'path', required: true, schema: { type: 'string' }, example: 'GHARLUXE' }
        ],
        responses: {
          200: { description: 'Coupon removed successfully' },
          404: { description: 'Coupon not found' }
        }
      }
    },

    // ----------------------------------------------------------------------
    // PRODUCTS & CATALOG
    // ----------------------------------------------------------------------
    '/api/products': {
      get: {
        tags: ['Products & Catalog'],
        summary: 'Get complete categorized catalog',
        description: 'Retrieves full hierarchy of products arranged by parent category and subcategories.',
        responses: {
          200: {
            description: 'Array of categories with subcategories and items',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/CategoryCatalog' }
                }
              }
            }
          }
        }
      }
    },
    '/api/products/categories': {
      get: {
        tags: ['Products & Catalog'],
        summary: 'Get product categories with live item count and art',
        description: 'Provides high-level category summaries for homepage carousel circles.',
        responses: {
          200: {
            description: 'List of categories with thumbnail and item counts',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', example: 'Cello' },
                      image: { type: 'string', example: 'http://192.168.29.12:5001/products/cello_prod/bowl.webp' },
                      count: { type: 'number', example: 26 }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/products/paginated': {
      get: {
        tags: ['Products & Catalog'],
        summary: 'Paginated product feed (Infinite Scroll)',
        description: 'Provides paginated feed with category filtering, ratings, review counts, and match percentages.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Items per page' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category name (e.g. Cello, Garlands)' }
        ],
        responses: {
          200: {
            description: 'Paginated product response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 605 },
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 10 },
                    totalPages: { type: 'integer', example: 61 },
                    hasMore: { type: 'boolean', example: true },
                    products: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Product' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/products/search': {
      get: {
        tags: ['Products & Catalog'],
        summary: 'Search products and categories autocomplete',
        description: 'High-speed fuzzy search across titles, descriptions, categories, and subcategories.',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search query string' }
        ],
        responses: {
          200: {
            description: 'Matched products and categories',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                    categories: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/return_gifts': {
      get: {
        tags: ['Products & Catalog'],
        summary: 'Browse return gifts collection with multi-filters',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'material', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['priceLow', 'priceHigh', 'newest'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: {
          200: { description: 'Filtered list of return gifts' }
        }
      },
      post: {
        tags: ['Products & Catalog'],
        summary: 'Create return gift item (Admin)',
        responses: { 201: { description: 'Item created' } }
      }
    },

    // ----------------------------------------------------------------------
    // FLASH SALE & BANNERS
    // ----------------------------------------------------------------------
    '/api/flashsale': {
      get: {
        tags: ['Flash Sale & Banners'],
        summary: 'Get active flash sale and countdown timer',
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    expiryTime: { type: 'string', example: '2026-10-16T12:00:00.000Z' },
                    products: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Flash Sale & Banners'],
        summary: 'Update flash sale deals and expiration time (Admin)',
        responses: { 200: { description: 'Flash sale updated' } }
      }
    },
    '/api/banners': {
      get: {
        tags: ['Flash Sale & Banners'],
        summary: 'Get promotional hero banners',
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      title: { type: 'string' },
                      subtitle: { type: 'string' },
                      image: { type: 'string' },
                      link: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    // ----------------------------------------------------------------------
    // ORDERS & CHECKOUT
    // ----------------------------------------------------------------------
    '/api/orders': {
      get: {
        tags: ['Orders & Checkout'],
        summary: 'List orders history with status and tracking',
        parameters: [
          { name: 'userId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Order' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Orders & Checkout'],
        summary: 'Place new e-commerce order',
        description: 'Creates order record, triggers internal notification and registers shipment.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrderInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Order placed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    orderId: { type: 'string', example: 'GS-94281' },
                    awb: { type: 'string', example: '128539103940' },
                    order: { $ref: '#/components/schemas/Order' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/orders/{id}/status': {
      patch: {
        tags: ['Orders & Checkout'],
        summary: 'Update order lifecycle status',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Status updated' } }
      }
    },

    // ----------------------------------------------------------------------
    // SHIPPING & LOGISTICS
    // ----------------------------------------------------------------------
    '/api/shipping/serviceability': {
      get: {
        tags: ['Shipping & Logistics'],
        summary: 'Check delivery serviceability for Pincode',
        parameters: [
          { name: 'pincode', in: 'query', required: true, schema: { type: 'string' }, example: '500033' }
        ],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    serviceable: { type: 'boolean', example: true },
                    pincode: { type: 'string', example: '500033' },
                    city: { type: 'string', example: 'Hyderabad' },
                    estimatedDays: { type: 'string', example: '2-3 business days' },
                    codAvailable: { type: 'boolean', example: true },
                    courierPartner: { type: 'string', example: 'BlueDart Air Express' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/shipping/track/{awb}': {
      get: {
        tags: ['Shipping & Logistics'],
        summary: 'Live shipment tracking by AWB code',
        parameters: [
          { name: 'awb', in: 'path', required: true, schema: { type: 'string' }, example: '98765432101' }
        ],
        responses: {
          200: {
            description: 'Live tracking details and checkpoints',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TrackingData' }
              }
            }
          }
        }
      }
    },

    // ----------------------------------------------------------------------
    // AUTHENTICATION & PROFILE
    // ----------------------------------------------------------------------
    '/api/auth/register': {
      post: {
        tags: ['Authentication & Profile'],
        summary: 'Register new customer account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  name: { type: 'string', example: 'Sharmila Konapala' },
                  email: { type: 'string', example: 'customer@gharsansar.store' },
                  password: { type: 'string', example: 'SecurePass@123' },
                  phone: { type: 'string', example: '+91 9876543210' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Account registered' }, 400: { description: 'User exists' } }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication & Profile'],
        summary: 'Authenticate customer / admin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'customer@gharsansar.store' },
                  password: { type: 'string', example: 'SecurePass@123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        role: { type: 'string', example: 'customer' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    // ----------------------------------------------------------------------
    // WISHLIST
    // ----------------------------------------------------------------------
    '/api/mobile/wishlist': {
      get: {
        tags: ['Wishlist'],
        summary: 'Get customer wishlist product IDs',
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    wishlist: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/mobile/wishlist/toggle': {
      post: {
        tags: ['Wishlist'],
        summary: 'Toggle product in wishlist (Add/Remove)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId'],
                properties: {
                  productId: { type: 'string', example: 'prod-cello-12-pcs-soup-set-1' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Updated wishlist array' } }
      }
    },

    // ----------------------------------------------------------------------
    // NOTIFICATIONS & PUSH
    // ----------------------------------------------------------------------
    '/api/mobile/notifications': {
      get: {
        tags: ['Customer Notifications'],
        summary: 'Get customer notifications feed',
        parameters: [
          { name: 'userId', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'List of notifications' } }
      }
    },
    '/api/mobile/push-token': {
      post: {
        tags: ['Customer Notifications'],
        summary: 'Register Expo Push Notification token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: {
                  token: { type: 'string', example: 'ExponentPushToken[xxxxxxxxxxxxxx]' },
                  userId: { type: 'string', example: 'usr_102' },
                  deviceId: { type: 'string', example: 'iPhone15Pro' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Push token registered' } }
      }
    },

    // ----------------------------------------------------------------------
    // REVIEWS & RATINGS
    // ----------------------------------------------------------------------
    '/api/reviews/{productId}': {
      get: {
        tags: ['Reviews & Ratings'],
        summary: 'Get customer ratings and reviews for product',
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    rating_average: { type: 'number', example: 4.8 },
                    rating_count: { type: 'number', example: 42 },
                    reviews: { type: 'array', items: { $ref: '#/components/schemas/Review' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Reviews & Ratings'],
        summary: 'Post verified product review',
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'rating', 'comment'],
                properties: {
                  name: { type: 'string', example: 'Aravind K.' },
                  rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
                  comment: { type: 'string', example: 'Superb quality and luxury finish!' },
                  image: { type: 'string', example: '' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Review posted' } }
      }
    },

    // ----------------------------------------------------------------------
    // HEALTH & SYSTEM
    // ----------------------------------------------------------------------
    '/api/health': {
      get: {
        tags: ['Health & System'],
        summary: 'System health check & liveness probe',
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    port: { type: 'number', example: 5001 },
                    timestamp: { type: 'string', example: '2026-10-15T14:30:00.000Z' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Coupon: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'coup_1' },
          code: { type: 'string', example: 'GHARLUXE' },
          title: { type: 'string', example: '10% Luxury Home Discount' },
          description: { type: 'string', example: 'Get 10% instant discount on premium dinnerware & decor' },
          discountType: { type: 'string', enum: ['percentage', 'flat', 'free_shipping'], example: 'percentage' },
          discountValue: { type: 'number', example: 10 },
          maxDiscount: { type: 'number', example: 1000 },
          minOrderValue: { type: 'number', example: 799 },
          badge: { type: 'string', example: 'BESTSELLER' },
          category: { type: 'string', example: 'all' },
          validTill: { type: 'string', example: '2027-12-31T23:59:59.000Z' },
          isActive: { type: 'boolean', example: true },
          terms: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      CouponInput: {
        type: 'object',
        required: ['code', 'title', 'discountType', 'discountValue'],
        properties: {
          code: { type: 'string', example: 'FESTIVE2026' },
          title: { type: 'string', example: 'Festive Special 20%' },
          description: { type: 'string', example: 'Save 20% on Diwali luxury collections' },
          discountType: { type: 'string', enum: ['percentage', 'flat', 'free_shipping'], example: 'percentage' },
          discountValue: { type: 'number', example: 20 },
          maxDiscount: { type: 'number', example: 1500 },
          minOrderValue: { type: 'number', example: 1999 },
          badge: { type: 'string', example: 'LIMITED TIME' },
          category: { type: 'string', example: 'all' },
          terms: { type: 'array', items: { type: 'string' } }
        }
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'prod-cello-12-pcs-soup-set-1' },
          title: { type: 'string', example: 'Cello 12 Pcs Soup Set' },
          price: { type: 'number', example: 749 },
          actPrice: { type: 'number', example: 999 },
          image: { type: 'string', example: 'http://192.168.29.12:5001/products/cello_prod/cello_12_pcs_soup_set.webp' },
          category: { type: 'string', example: 'Cello' },
          subCategory: { type: 'string', example: 'Dinnerware' },
          rating: { type: 'number', example: 4.8 },
          reviewsCount: { type: 'number', example: 24 },
          matchPercent: { type: 'number', example: 95 }
        }
      },
      CategoryCatalog: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Cello' },
          subcategories: { type: 'array', items: { type: 'object' } }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'GS-89240' },
          userId: { type: 'string', example: 'usr_102' },
          total: { type: 'number', example: 2198 },
          status: { type: 'string', example: 'In Transit' },
          awb: { type: 'string', example: '98765432101' },
          items: { type: 'string', example: 'Cello 12 Pcs Soup Set x1' },
          date: { type: 'string', example: '2026-10-15T14:00:00.000Z' }
        }
      },
      OrderInput: {
        type: 'object',
        required: ['items', 'total', 'shippingAddress'],
        properties: {
          userId: { type: 'string', example: 'usr_102' },
          items: { type: 'array', items: { type: 'object' } },
          total: { type: 'number', example: 2198 },
          couponCode: { type: 'string', example: 'GHARLUXE' },
          paymentMethod: { type: 'string', example: 'UPI' },
          shippingAddress: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Sharmila Konapala' },
              address: { type: 'string', example: 'Flat 402, Jubilee Hills' },
              city: { type: 'string', example: 'Hyderabad' },
              pincode: { type: 'string', example: '500033' },
              phone: { type: 'string', example: '+91 9876543210' }
            }
          }
        }
      },
      TrackingData: {
        type: 'object',
        properties: {
          awb: { type: 'string', example: '98765432101' },
          status: { type: 'string', example: 'In Transit' },
          expectedDate: { type: 'string', example: '2026-10-18T18:00:00.000Z' },
          checkpoints: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'In Transit' },
                location: { type: 'string', example: 'Gurgaon Hub' },
                timestamp: { type: 'string', example: '2026-10-15T10:00:00.000Z' },
                description: { type: 'string', example: 'Shipment departed transit facility' }
              }
            }
          }
        }
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'review_17829102' },
          name: { type: 'string', example: 'Aravind K.' },
          rating: { type: 'number', example: 5 },
          comment: { type: 'string', example: 'Exceptional craftsmanship and sturdy build.' },
          date: { type: 'string', example: 'October 14, 2026' },
          verified: { type: 'boolean', example: true }
        }
      }
    }
  }
};

const setupSwagger = (app) => {
  // Swagger UI route
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss,
      customSiteTitle: 'Ghar Sansar Enterprise API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        filter: true,
        displayRequestDuration: true,
        docExpansion: 'list'
      }
    })
  );

  // Raw JSON specification route for automated tools / Postman import
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Friendly redirects
  app.get('/docs', (req, res) => res.redirect('/api-docs'));
  app.get('/swagger', (req, res) => res.redirect('/api-docs'));
};

module.exports = { setupSwagger, swaggerSpec };
