# 🛡️ CifrAS Privacy & Security Policy

Last updated: **June 2026**

**CifrAS** takes your privacy very seriously. This Privacy Policy describes how we collect, use, protect, and store your information when you use our chord chart and transposition platform.

Our commitment is aligned with the **General Data Protection Law (LGPD - Brazil)** and international data protection best practices, including the **General Data Protection Regulation (GDPR - Europe)**.

## 1. What Data Do We Collect?

To ensure CifrAS functions properly and offers the best musical experience, we collect the minimum necessary data (Data Minimization Principle):

* **Account Data (Authentication):** Name, e-mail address, and encrypted password (securely managed via our identity provider).
* **Integration Data (Google Drive):** When you choose to connect CifrAS to your Google Drive to import documents, we request read access to your files. We only store the **Access Tokens** provided by Google (OAuth 2.0). **We do not store your Google password.**
* **Usage Data (Content):** Created chord charts, organized playlists, and UI preferences (e.g., Theater Mode, default transposition).

## 2. How Do We Use Your Data?

Your data is used strictly for the platform's operation:

* **Authentication:** To allow you to access your account from any device.
* **Chord Chart Import:** Your Google Drive token is used **exclusively** to list and extract text from the documents (Google Docs, DOCX) that you choose to import into the app.
* **Synchronization:** To keep your playlists and chord transposition settings saved in the cloud.

*CifrAS does not sell, rent, or share your personal data or imported files with advertisers or third parties for marketing purposes.*

## 3. How Do We Protect Your Data?

The security of your data is our technical priority. We have implemented the following security measures:

* **Encryption at Rest (LGPD/GDPR compliance):** All access tokens (such as the Google Drive *Refresh Token*) are strongly encrypted in our database (industry standard AES-256). Even in the event of a data breach, these tokens remain unreadable and protected.
* **Secure Communication:** All data traffic is protected by TLS/SSL (HTTPS).
* **Restricted Access:** The CifrAS database is protected with strict access policies and hosted on certified cloud infrastructure.

## 4. Third-Party Sharing

To operate the application, we rely on services provided by trusted cloud providers compliant with data protection laws:

* **Supabase:** For database storage (PostgreSQL) and authentication management (SSO and Login).
* **Google Cloud / Workspace:** Strictly for OAuth authentication and scoped access to the Google Drive API (when authorized by you).
* **Hosting Infrastructure (Fly.io):** Where our application servers are hosted.

## 5. Your Rights (According to LGPD and GDPR)

You have full control over your data. At any time, you can:

* **Right of Access:** Request a copy of all the data we hold about you.
* **Right to Rectification:** Update incorrect or outdated information in your profile.
* **Right to Erasure (Right to be Forgotten):** Permanently delete your account and all associated data (chord charts, playlists, integrations) from our servers.
* **Integration Revocation:** Disconnect Google Drive at any time through the app settings, which will immediately delete our access tokens. You can also revoke CifrAS's access directly from your Google account security panel.

## 6. Use of Cookies

We use only **Essential Cookies** (JWT tokens) required to keep your user session active and secure. CifrAS does not use third-party tracking cookies, advertising pixels, or invasive behavior analysis tools.

## 7. Contact and Data Protection Officer (DPO)

If you have questions about how we handle your data, wish to exercise your rights, or want to report a security concern, please contact us via the platform's official support email.
