import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import roleRoutes from "./routes/role.routes";
import userSessionRoutes from "./routes/userSession.routes";
import userAddressRoutes from "./routes/userAddress.routes";
import permissionRoutes from "./routes/permission.routes";
import rolePermissionRoutes from "./routes/rolePermission.routes";
import roomTypeRoutes from "./routes/roomType.routes";
import roomRoutes from "./routes/room.routes";
import roomPricingRoutes from "./routes/roomPricing.routes";
import roomAvailabilityRoutes from "./routes/roomAvailability.routes";
import hotelImageRoutes from "./routes/hotelImage.routes";
import hotelAmenityRoutes from "./routes/hotelAmenity.routes";
import bookingPaymentRoutes from "./routes/bookingPayment.routes";
import reviewRoutes from "./routes/review.routes";
import hotelFacilityRoutes from "./routes/hotelFacility.routes";
import notificationRoutes from "./routes/notification.routes";
import auditLogRoutes from "./routes/auditLog.routes";
import transactionLogRoutes from "./routes/transactionLog.routes";
import countryRoutes from "./routes/country.routes";
import stateRoutes from "./routes/state.routes";
import cityRoutes from "./routes/city.routes";
import currencyRoutes from "./routes/currency.routes";
import paymentMethodRoutes from "./routes/paymentMethod.routes";
import paymentRoutes from "./routes/payment.routes";
import hotelRoutes from "./routes/hotel.routes";
import bookingRoutes from "./routes/booking.routes";
// New enterprise routes
import roomLockRoutes from "./routes/roomLock.routes";
import pricingRuleRoutes from "./routes/pricingRule.routes";
import refundRoutes from "./routes/refund.routes";
import refundPolicyRoutes from "./routes/refundPolicy.routes";
import paymentGatewayRoutes from "./routes/paymentGateway.routes";
import paymentTransactionRoutes from "./routes/paymentTransaction.routes";
import priceCalculationRoutes from "./routes/priceCalculation.routes";
import taxCalculationRoutes from "./routes/taxCalculation.routes";
import systemMetricsRoutes from "./routes/systemMetrics.routes";

dotenv.config();

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:3001", "ws://localhost:3000", "ws://localhost:3001", "http://localhost:3000/.well-known/appspecific/com.chrome.devtools.json", "https://chrome-devtools-frontend.appspot.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "data:"],
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'hotel-booking-api'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/sessions', userSessionRoutes);
app.use('/api/addresses', userAddressRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/role-permissions', rolePermissionRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-pricing', roomPricingRoutes);
app.use('/api/room-availability', roomAvailabilityRoutes);
app.use('/api/hotel-images', hotelImageRoutes);
app.use('/api/hotel-amenities', hotelAmenityRoutes);
app.use('/api/booking-payments', bookingPaymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/hotel-facilities', hotelFacilityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/transaction-logs', transactionLogRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
// New enterprise routes
app.use('/api/room-locks', roomLockRoutes);
app.use('/api/pricing-rules', pricingRuleRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/refund-policies', refundPolicyRoutes);
app.use('/api/payment-gateways', paymentGatewayRoutes);
app.use('/api/payment-transactions', paymentTransactionRoutes);
app.use('/api/price-calculation', priceCalculationRoutes);
app.use('/api/tax-calculation', taxCalculationRoutes);
app.use('/api/system-metrics', systemMetricsRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Hotel Booking API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      roles: '/api/roles',
      sessions: '/api/sessions',
      addresses: '/api/addresses',
      permissions: '/api/permissions',
      rolePermissions: '/api/role-permissions',
      roomTypes: '/api/room-types',
      rooms: '/api/rooms',
      roomPricing: '/api/room-pricing',
      roomAvailability: '/api/room-availability',
      hotelImages: '/api/hotel-images',
      hotelAmenities: '/api/hotel-amenities',
      bookingPayments: '/api/booking-payments',
      reviews: '/api/reviews',
      hotelFacilities: '/api/hotel-facilities',
      notifications: '/api/notifications',
      auditLogs: '/api/audit-logs',
      transactionLogs: '/api/transaction-logs',
      countries: '/api/countries',
      states: '/api/states',
      cities: '/api/cities',
      currencies: '/api/currencies',
      paymentMethods: '/api/payment-methods',
      payments: '/api/payments',
      hotels: '/api/hotels',
      bookings: '/api/bookings',
      // New enterprise endpoints
      roomLocks: '/api/room-locks',
      pricingRules: '/api/pricing-rules',
      refunds: '/api/refunds',
      refundPolicies: '/api/refund-policies',
      paymentGateways: '/api/payment-gateways',
      paymentTransactions: '/api/payment-transactions'
    }
  });
});

export default app;
