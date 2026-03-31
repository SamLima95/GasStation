/**
 * Constantes para RabbitMQ: exchanges e filas compartilhados.
 * Centralize aqui para manter contrato entre publicadores e consumidores.
 */
export const EXCHANGE_USER_EVENTS = "user.events";
export const QUEUE_USER_CREATED_CATALOG = "catalog.user_created";
/** Fila para mensagens UserCreated que excederam MAX_RETRIES (dead-letter / inspeção). */
export const QUEUE_USER_CREATED_CATALOG_FAILED = "catalog.user_created.failed";
export const QUEUE_USER_CREATED_STOCK = "stock.user_created";
export const QUEUE_USER_CREATED_STOCK_FAILED = "stock.user_created.failed";
export const QUEUE_USER_CREATED_ORDER = "order.user_created";
export const QUEUE_USER_CREATED_ORDER_FAILED = "order.user_created.failed";
export const EXCHANGE_ORDER_EVENTS = "order.events";
export const ORDER_CREATED_EVENT = "order_created";
export const ORDER_CONFIRMED_EVENT = "order_confirmed";
export const QUEUE_USER_CREATED_FINANCIAL = "financial.user_created";
export const QUEUE_USER_CREATED_FINANCIAL_FAILED = "financial.user_created.failed";
export const QUEUE_ORDER_CONFIRMED_FINANCIAL = "financial.order_confirmed";
export const QUEUE_ORDER_CONFIRMED_FINANCIAL_FAILED = "financial.order_confirmed.failed";
export const EXCHANGE_FINANCIAL_EVENTS = "financial.events";
export const PAYMENT_RECEIVED_EVENT = "payment_received";
export const CUSTOMER_DEFAULTED_EVENT = "customer_defaulted";
export const QUEUE_USER_CREATED_LOGISTICS = "logistics.user_created";
export const QUEUE_USER_CREATED_LOGISTICS_FAILED = "logistics.user_created.failed";
export const QUEUE_ORDER_CONFIRMED_LOGISTICS = "logistics.order_confirmed";
export const QUEUE_ORDER_CONFIRMED_LOGISTICS_FAILED = "logistics.order_confirmed.failed";
export const EXCHANGE_LOGISTICS_EVENTS = "logistics.events";
export const DELIVERY_CONFIRMED_EVENT = "delivery_confirmed";
