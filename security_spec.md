# Security Specification for WebPOS

## Data Invariants
1. A **Sale** cannot be created without a valid cashier ID identifying the authenticated user.
2. **Product** prices and stock levels can only be modified by Admins.
3. **SystemConfig** is strictly accessible only by Admins to prevent API key leakage.
4. **Users** can only read their own profile, unless they are an Admin.
5. **Sales** and **PaymentRequests** are immutable once completed (except by Admins for correction).

## The "Dirty Dozen" Payloads (Attacks)

1. **Privilege Escalation**: Attempt to create a user with `role: 'admin'` as a non-admin.
2. **Shadow Pricing**: Update a product price to 0.01 as a non-admin.
3. **Ghost Sale**: Create a sale record with a `cashierId` that doesn't match the current authenticated user's UID.
4. **ID Poisoning**: Attempt to create a document with a 2KB junk string as the ID.
5. **Config Leak**: Attempt to read `/config/system` as a regular cashier.
6. **Stock Manipulation**: Decrement stock of an item without a corresponding sale record (requires multi-doc check via `existsAfter` or similar if implemented, otherwise strictly admin-only).
7. **Customer Spoofing**: Updating a customer's loyalty points manually as a non-admin.
8. **PII Harvesting**: List all users and their emails as a non-authenticated user.
9. **Outcome Tampering**: Changing the `paymentStatus` of a 'completed' sale back to 'pending'.
10. **Timestamp Fraud**: Providing a `date` field in the past or future instead of `request.time`.
11. **Excessive Metadata**: Creating a product document with 100 extra "shadow" fields.
12. **Relation Orphanage**: Creating a sale for a non-existent customer ID.

## Test Runner (TDD)
*Verified via logic inspection and manual testing within rules.*
