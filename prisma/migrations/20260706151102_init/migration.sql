-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "phone" TEXT,
    "commissionRate" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expiresAt" DATETIME NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" DATETIME,
    "refreshTokenExpiresAt" DATETIME,
    "scope" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "customerType" TEXT NOT NULL DEFAULT 'BOOKING',
    "walkInName" TEXT,
    "walkInPhone" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "customerId" TEXT,
    "staffId" TEXT NOT NULL,
    CONSTRAINT "appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "appointment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "appointment_service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    CONSTRAINT "appointment_service_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appointment_service_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiptNumber" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "customerType" TEXT NOT NULL DEFAULT 'BOOKING',
    "walkInName" TEXT,
    "walkInPhone" TEXT,
    "commissionRate" REAL NOT NULL DEFAULT 0,
    "commissionAmount" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "staffId" TEXT NOT NULL,
    "customerId" TEXT,
    "appointmentId" TEXT,
    CONSTRAINT "transaction_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transaction_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transaction_item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "transaction_item_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transaction_item_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payroll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "baseSalary" REAL NOT NULL DEFAULT 0,
    "totalCommission" REAL NOT NULL DEFAULT 0,
    "totalDeductions" REAL NOT NULL DEFAULT 0,
    "totalBonuses" REAL NOT NULL DEFAULT 0,
    "netPay" REAL NOT NULL DEFAULT 0,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "staffId" TEXT NOT NULL,
    CONSTRAINT "payroll_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "salary_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "baseSalary" REAL NOT NULL,
    "commissionRate" REAL NOT NULL,
    "effectiveDate" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "staffId" TEXT NOT NULL,
    CONSTRAINT "salary_history_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "activity_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "business_setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "label" TEXT,
    "group" TEXT NOT NULL DEFAULT 'general',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- CreateIndex
CREATE INDEX "user_deletedAt_idx" ON "user"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "session_token_idx" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "service_isActive_idx" ON "service"("isActive");

-- CreateIndex
CREATE INDEX "service_deletedAt_idx" ON "service"("deletedAt");

-- CreateIndex
CREATE INDEX "appointment_date_idx" ON "appointment"("date");

-- CreateIndex
CREATE INDEX "appointment_staffId_date_idx" ON "appointment"("staffId", "date");

-- CreateIndex
CREATE INDEX "appointment_customerId_idx" ON "appointment"("customerId");

-- CreateIndex
CREATE INDEX "appointment_status_idx" ON "appointment"("status");

-- CreateIndex
CREATE INDEX "appointment_deletedAt_idx" ON "appointment"("deletedAt");

-- CreateIndex
CREATE INDEX "appointment_service_appointmentId_idx" ON "appointment_service"("appointmentId");

-- CreateIndex
CREATE INDEX "appointment_service_serviceId_idx" ON "appointment_service"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_service_appointmentId_serviceId_key" ON "appointment_service"("appointmentId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_receiptNumber_key" ON "transaction"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_appointmentId_key" ON "transaction"("appointmentId");

-- CreateIndex
CREATE INDEX "transaction_staffId_idx" ON "transaction"("staffId");

-- CreateIndex
CREATE INDEX "transaction_customerId_idx" ON "transaction"("customerId");

-- CreateIndex
CREATE INDEX "transaction_status_idx" ON "transaction"("status");

-- CreateIndex
CREATE INDEX "transaction_paidAt_idx" ON "transaction"("paidAt");

-- CreateIndex
CREATE INDEX "transaction_createdAt_idx" ON "transaction"("createdAt");

-- CreateIndex
CREATE INDEX "transaction_deletedAt_idx" ON "transaction"("deletedAt");

-- CreateIndex
CREATE INDEX "transaction_item_transactionId_idx" ON "transaction_item"("transactionId");

-- CreateIndex
CREATE INDEX "transaction_item_serviceId_idx" ON "transaction_item"("serviceId");

-- CreateIndex
CREATE INDEX "payroll_staffId_idx" ON "payroll"("staffId");

-- CreateIndex
CREATE INDEX "payroll_periodStart_periodEnd_idx" ON "payroll"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "payroll_isPaid_idx" ON "payroll"("isPaid");

-- CreateIndex
CREATE INDEX "salary_history_staffId_idx" ON "salary_history"("staffId");

-- CreateIndex
CREATE INDEX "salary_history_effectiveDate_idx" ON "salary_history"("effectiveDate");

-- CreateIndex
CREATE INDEX "activity_log_userId_idx" ON "activity_log"("userId");

-- CreateIndex
CREATE INDEX "activity_log_entity_entityId_idx" ON "activity_log"("entity", "entityId");

-- CreateIndex
CREATE INDEX "activity_log_createdAt_idx" ON "activity_log"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "business_setting_key_key" ON "business_setting"("key");

-- CreateIndex
CREATE INDEX "business_setting_key_idx" ON "business_setting"("key");

-- CreateIndex
CREATE INDEX "business_setting_group_idx" ON "business_setting"("group");
