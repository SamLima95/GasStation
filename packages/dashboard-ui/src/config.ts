export interface ServiceDef {
  name: string;
  key: string;
  url: string;
}

export const config = {
  port: parseInt(process.env.DASHBOARD_UI_PORT ?? "3010", 10),
};

export const services: ServiceDef[] = [
  { name: "Identity Service", key: "identity", url: process.env.IDENTITY_SERVICE_URL ?? "http://localhost:3001" },
  { name: "Catalog Service", key: "catalog", url: process.env.CATALOG_SERVICE_URL ?? "http://localhost:3002" },
  { name: "Stock Service", key: "stock", url: process.env.STOCK_SERVICE_URL ?? "http://localhost:3004" },
  { name: "Order Service", key: "order", url: process.env.ORDER_SERVICE_URL ?? "http://localhost:3005" },
  { name: "Financial Service", key: "financial", url: process.env.FINANCIAL_SERVICE_URL ?? "http://localhost:3006" },
  { name: "Logistics Service", key: "logistics", url: process.env.LOGISTICS_SERVICE_URL ?? "http://localhost:3007" },
  { name: "Audit Service", key: "audit", url: process.env.AUDIT_SERVICE_URL ?? "http://localhost:3008" },
  { name: "Dashboard Service", key: "dashboard", url: process.env.DASHBOARD_SERVICE_URL ?? "http://localhost:3009" },
];
