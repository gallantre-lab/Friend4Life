# Firestore Security Specification

This document details the security specification, invariants, and adversarial payloads for testing the Firestore Security Rules of the Friend4Life application.

## 1. Data Invariants
- **Schema Integrity**: The document under the `local_storage` collection must exactly have the keys `value`, `updatedAt`, and `clientId`. No arbitrary injection of phantom variables is permitted.
- **Value Limits**: The string size of `value` must be checked up to 1,048,576 characters to prevent denial-of-wallet payload blowing attacks.
- **Key Bounds**: Keys must be valid alpha-numeric strings representing stored application state.

## 2. The "Dirty Dozen" Payloads
1. **Payload 1: Empty Key / Malformed Path** (e.g. injecting bad path characters like `/` or extremely long ID).
2. **Payload 2: Missing `value` Field** on document creation.
3. **Payload 3: Extra Field (Ghost Field) Injection** (e.g. adding `isAdmin: true` to the local storage payload).
4. **Payload 4: Wrong Type for `value`** (e.g. `value` is a boolean instead of string).
5. **Payload 5: Wrong Type for `updatedAt`** (e.g. `updatedAt` is a string instead of number).
6. **Payload 6: Wrong Type for `clientId`** (e.g. `clientId` is an object instead of string).
7. **Payload 7: Excessively Large `value`** (e.g. 5MB of junk data).
8. **Payload 8: Missing `updatedAt` Field** on create.
9. **Payload 9: Missing `clientId` Field** on create.
10. **Payload 10: Injecting an array into `value`**.
11. **Payload 11: Key with special script-injection characters** in document ID.
12. **Payload 12: Write to non-existent collection path** (e.g. trying to write to `/admins/` collection).

## 3. Test Runner Concept (firestore.rules.test.ts)
A companion unit testing suite to evaluate that these operations correctly return `PERMISSION_DENIED` on the security rules.
