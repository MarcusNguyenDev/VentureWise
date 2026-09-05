---

# Coding Standards

## Purpose

This document defines the coding standards for the project to keep the codebase readable, consistent, and maintainable as the system grows.

The main principle is simple:

**Code should be self-explanatory.**

Anyone reading the code should be able to understand its purpose with minimal additional explanation.

---

# 1. Core Principles

### 1.1 Self-explanatory code

Code should describe its own intent through naming and structure.

Good

```ts
const user_schedule = await getUserSchedule(user_id);
```

Bad

```ts
const us = get(user_id);
```

---

### 1.2 Clarity over cleverness

Avoid clever tricks that reduce readability.

Readable code is easier to maintain, review, and debug.

---

### 1.3 Consistency across the codebase

Consistency is more important than individual preference. All team members must follow the same conventions.

---

### 1.4 Single responsibility

Functions, classes, and files should each serve one clear purpose.

---

# 2. Naming Conventions

## 2.1 Variables

Use **snake_case** for variables.

Examples:

```ts
const user_schedule = [];
const business_address = "";
const retry_count = 0;
```

### Rules

Names should clearly describe the stored value.

Avoid vague names.

Bad

```ts
const data = [];
const temp = {};
```

Good

```ts
const customer_invoice_list = [];
const login_attempt_count = 0;
```

---

# 2.2 Functions

Use **camelCase** for function names.

Examples:

```ts
function getUserProfile() {}

function calculateTotalAmount() {}

async function sendEmailNotification() {}
```

### Rules

Function names should usually start with a **verb**.

Good

```ts
createUser();
updateCustomerRecord();
validateAccessToken();
fetchPaymentHistory();
```

Bad

```ts
userData();
tokenCheck();
invoiceInfo();
```

---

# 2.3 Boolean Variables

Boolean names should read naturally.

Preferred prefixes:

- `is_`
- `has_`
- `can_`
- `should_`

Examples:

```ts
const is_active = true;
const has_permission = false;
const can_edit = true;
const should_retry = false;
```

---

# 2.4 Classes and Object Types

Use **PascalCase**.

Examples:

```ts
class PrototypeDto {}

class UserService {}

class PaymentGatewayClient {}
```

Applies to:

- DTOs
- Entities
- Services
- Controllers
- Validators
- Error classes
- Models

---

# 2.5 Interfaces and Types

Use **PascalCase**.

Examples:

```ts
interface UserProfile {}

type PaymentStatus = "pending" | "paid";
```

Avoid unnecessary prefixes.

Preferred

```ts
interface UserProfile {}
```

Not preferred

```ts
interface IUserProfile {}
```

---

# 2.6 Enums

Use **PascalCase** for enum names and **UPPER_SNAKE_CASE** for values.

Example:

```ts
enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}
```

---

# 2.7 Constants

Use **UPPER_SNAKE_CASE**.

Examples:

```ts
const MAX_RETRY_COUNT = 3;
const DEFAULT_PAGE_SIZE = 20;
const API_TIMEOUT_MS = 5000;
```

Constants should represent values that do not change during runtime.

---

# 3. File Naming Conventions

Use **snake_case** for filenames.

For structured file types, use dot separation.

Examples:

```
user.service.ts
user.controller.ts
get_user.dto.ts
update_user_profile.use_case.ts
payment_status.enum.ts
auth.middleware.ts
```

### Rules

File names should clearly describe the content.

Avoid generic names.

Bad

```
utils.ts
helpers.ts
common.ts
```

Better

```
validate_access_token.util.ts
calculate_invoice_total.util.ts
format_currency.util.ts
```

---

# 4. Folder Naming

Use **snake_case** for folders.

Examples:

```
user_management/
payment_processing/
shared_types/
email_templates/
```

Folders should represent logical system domains rather than technical leftovers.

---

# 5. Function Design

### 5.1 One responsibility per function

Functions should perform a single task.

Good

```ts
calculateDiscountedTotal();
```

Bad

```ts
processOrderAndSendEmail();
```

---

### 5.2 Avoid long functions

Large functions are difficult to read and maintain. Break complex logic into smaller functions.

---

### 5.3 Limit parameters

If a function requires too many parameters, use an object.

Bad

```ts
createUser(first_name, last_name, email, phone, address, postcode);
```

Better

```ts
createUser(user_details);
```

---

### 5.4 Avoid hidden side effects

Function names must reflect what they actually do.

Bad

```ts
getUserProfile();
```

If it also updates login state.

Better

```ts
getUserProfile();
updateLastLogin();
```

---

# 6. Comments and Documentation

## 6.1 Prefer readable code over comments

Bad

```ts
const x = getData(); // user profile
```

Better

```ts
const user_profile = getUserProfile();
```

---

## 6.2 Use comments when necessary

Useful cases:

- explaining non-obvious behaviour
- describing business rules
- documenting edge cases
- warning about third-party system behaviour

Example

```ts
// Third-party API returns HTTP 200 even when validation fails
```

---

## 6.3 Remove dead code

Do not leave commented-out code in the repository.

Use version control history instead.

Bad

```ts
// const old_result = legacyCalculation()
```

---

# 7. Import Structure

Group imports in this order:

1. Node modules
2. External libraries
3. Internal modules
4. Local files

Example

```ts
import express from "express";

import { Injectable } from "@nestjs/common";

import { UserService } from "@/services/user.service";

import { UserDto } from "./dto/user.dto";
```

---

# 8. DTO Naming

DTO files should clearly describe their purpose.

Examples

```
create_user.dto.ts
update_user_profile.dto.ts
get_user_response.dto.ts
```

DTO class names:

```ts
class CreateUserDto {}
class UpdateUserProfileDto {}
class GetUserResponseDto {}
```

---

# 9. Error Handling

Use **custom error classes** instead of throwing generic errors.

Bad

```ts
throw new Error("Invalid user");
```

Better

```ts
throw new InvalidUserError();
```

---

# 10. Logging

Logs should provide useful operational information.

Avoid vague logs.

Bad

```ts
console.log("error");
```

Good

```ts
logger.error("Failed to process payment", {
  user_id,
  payment_id,
});
```
