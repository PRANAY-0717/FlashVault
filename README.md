
# FlashVault 🔒
### "This Message Will Self-Destruct"
**Share sensitive information with confidence using military-grade encryption and automatic deletion.**

---

## 📖 Executive Summary
In an era of persistent digital footprints, **FlashVault** provides a secure, ephemeral communication channel for sensitive data. Whether you are sharing passwords, API keys, or confidential notes, standard messaging apps and emails leave permanent logs. FlashVault solves this by generating a unique, encrypted link that **self-destructs** after a single view or a set expiration time. Once the message is viewed, it is permanently erased from the server, ensuring that your secrets remain secret.

## ✨ Key Features
*   **AES-256-CBC Encryption**: Data is encrypted at rest using the Advanced Encryption Standard (AES) with a 256-bit key and Cipher Block Chaining (CBC) mode, satisfying military and enterprise security standards.
*   **One-Time View (Burn-on-Read)**: The core "View Once" mechanism ensures that as soon as a message is retrieved, it is strictly and immediately deleted from the database.
*   **Customizable Expiration**: Users can set validity periods (e.g., 5 minutes, 1 hour) to ensure links do not remain active indefinitely, even if unread.
*   **Zero-Knowledge Architecture (At-Rest)**: The encryption key is stored only in the application environment, not in the database. A database compromise reveals only encrypted gibberish.
*   **Minimalist Interface**: A clean, distraction-free UI focused purely on speed and security.

## 🚀 Real-World Use Cases

### 1. Secure Password Sharing
**Problem:** An IT administrator needs to send a temporary password to a new employee. Sending it via email or Slack leaves a permanent record of the credential in plain text logs.
**Solution:** The admin creates a FlashVault link containing the password. The employee clicks the link, copies the password, and the link immediately becomes invalid. No trace remains in email servers or chat logs.

### 2. API Key & Secret Distribution
**Problem:** Developers often need to share environment variables or API secrets with team members. Hardcoding them in git or pasting them in chat is a major security risk.
**Solution:** The developer pastes the secret into FlashVault, sets a 15-minute expiration, and shares the link. The peer retrieves the key, and the secret is wiped from the intermediary storage instantly.

### 3. Confidential Legal or HR Communication
**Problem:** HR needs to send a sensitive salary figure or personal note to a manager. They want to ensure that forwarding the email chain doesn't accidentally expose this specific detail.
**Solution:** The sensitive figure is sent via FlashVault. The email body remains generic ("Here is the data you requested: [Link]"), while the sensitive data is ephemeral and cannot be referenced later.

---

## 🛠️ How It Works (Technical Deep Dive)

FlashVault serves as a secure broker between the sender and the recipient, ensuring data exists only as long as necessary.

### Architecture & Data Flow
1.  **Encryption (Sender Side Logic)**:
    *   User inputs `Secret Text` and `Validity Duration`.
    *   Server generates a unique 16-byte **Initialization Vector (IV)**.
    *   Text is encrypted using **AES-256-CBC** with a server-side `MY_SECRET_KEY`.
    *   **Stored Data**: The database (Supabase) receives `{ encryptedText: "iv:ciphertext", expirationTime, viewLimit }`. The raw secret *never* touches the disk in plain text.

2.  **Storage (Supabase/PostgreSQL)**:
    *   FlashVault uses **Supabase** as the backend service.
    *   The `FlashTexts` table holds the encrypted payloads.
    *   Row-Level Security (RLS) policies (if enabled) can further restrict access.

3.  **Retrieval & Destruction (Recipient Side Logic)**:
    *   Recipient clicks the unique link (e.g., `/secret/:id`).
    *   **Validation**: Server checks if the ID exists and if `Current Time < Expiration Time`.
    *   **The "Burn"**: Identify the record -> **DECRYPT** the payload -> **DELETE** the record from the database.
    *   **Atomic Operation**: The deletion happens effectively simultaneously with the retrieval to prevent race conditions or double-viewing (implementation dependent).
    *   **Presentation**: The decrypted text is rendered to the user *once*. Refreshing the page returns a 404 or "Expired" message.

### Tech Stack
*   **Runtime**: **Node.js** (chosen for non-blocking I/O and rapid handling of concurrent requests).
*   **Framework**: **Express.js** (backend routing and middleware).
*   **Database**: **Supabase** (PostgreSQL-based, chosen for reliability and speed).
*   **Templating**: **EJS** (Server-side rendering for secure, dynamic view generation without complex client-side state).
*   **Encryption**: **Node.js Crypto Module** (Native, high-performance cryptographic primitives).

---

## 🚀 Live Demo

**Try it out here:** [https://flashvaultpranay.vercel.app](https://flashvaultpranay.vercel.app)

---
---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ for privacy enthusiasts.*
