# **Web Application Development**

**Project Mid Deliverable Assignment: Requirements Analysis, UX/UI Design & Mockups**

*Campus Marketplace Application*

Ryann Lacks | Ethan Olsen | Daniel Calle | Don Manuel Jose

*March 6th, 2026*

# **Deliverables**

## **Deliverable 1: Requirements Analysis (PDF)**

## **Use Case: UC-B01 — Register / Create Account**

| Use Case ID | UC-B01 |
| :---- | :---- |
| **Use Case Name** | Register / Create Account |
| **Screen** | Registration Page |
| **Actor** | Buyer (Primary User) |
| **Description** | A new university community member creates an account using their university email credentials |
| **Pre-conditions** | User is not logged in. User has a valid university email address. Registration page is accessible. |
| **Post-conditions (Success)** | A new user account is created and stored in the database. User is logged in automatically. User is redirected to the Home Page. A welcome confirmation is displayed. |
| **Post-conditions (Failure)** | Account is not created. User remains on the Registration Page. Appropriate error message is displayed. |
| **Main Flow (Basic Flow)** | 1\. User navigates to the Registration Page. 2\. User enters university email, display name, and password. 3\. System validates that the email domain is an approved university domain. 4\. System checks that the email is not already associated with an existing account. 5\. System hashes the password and stores the new user record. 6\. System creates an authenticated session for the user. 7\. System redirects the user to the Home Page and displays a welcome confirmation. |
| **Alternative Flow 1:** | User already has an account: 1\. User clicks “Sign In” on the registration form. 2\. System redirects to the Login Page. |
| **Alternative Flow 2:** | User cancels registration: 1\. User navigates away from the Registration Page without submitting. 2\. System does not create an account. |
| **Exception Flow 1:** | Invalid university email domain: 1\. System displays: “Only university email addresses are permitted.” 2\. Form fields remain populated; user may correct the email. |
| **Exception Flow 2:** | Email already registered: 1\. System displays: “An account with this email already exists.” 2\. User is prompted to log in or reset their password. |
| **Exception Flow 3:** | Missing required fields: 1\. System highlights missing fields and displays validation errors. 2\. Account is not created; user remains on the Registration Page. |
| **Exception Flow 4:** | Password fails policy: 1\. System displays password policy error (e.g., minimum length). 2\. Account is not created; user may revise password. |
| **Exception Flow 5:** | System/database error: 1\. System fails to create account due to internal error. 2\. System logs the error and displays a generic failure message. |
| **Business Rules** | Only university-domain emails (e.g., @wsu.edu) may register. Passwords must be at least 8 characters. |
| **Special Requirements (Optional section)** | Password must be transmitted securely (HTTPS) and stored as a hash. Registration form should preserve user input on validation errors. |
| **Frequency of Use** | Low — typically once per user. |
| **Priority** | Critical |

 

## **Use Case: UC-B02 — Log In**

| Use Case ID | UC-B02 |
| :---- | :---- |
| **Use Case Name** | Log In |
| **Screen** | Login Page |
| **Actor** | Buyer (Primary User) |
| **Description** | A registered user authenticates with the platform to access personalized features. |
| **Pre-conditions** | User has an existing account. User is not currently logged in. |
| **Post-conditions (Success)** | User session is established (JWT or session cookie). User is redirected to the Home Page or the page they attempted to access. |
| **Post-conditions (Failure)** | User is not logged in. System displays an error message and remains on the Login Page. |
| **Main Flow (Basic Flow)** | 1\. User navigates to the Login Page. 2\. User enters university email and password. 3\. System validates credentials against the stored password hash. 4\. System creates a session token (JWT or session cookie). 5\. System redirects the user to the Home Page (or prior destination). |
| **Alternative Flow 1:** | Forgot password: 1\. User clicks “Forgot Password.” 2\. System prompts for email and sends a password reset link. 3\. User resets their password via the emailed link. |
| **Alternative Flow 2:** | Already logged in: 1\. User attempts to access Login Page while authenticated. 2\. System redirects user to the Home Page (or dashboard). |
| **Alternative Flow 3:** | Redirect after protected page access: 1\. User attempts to access a protected page while not logged in. 2\. System redirects to Login Page. 3\. After successful login, system redirects back to the protected page. |
| **Exception Flow 1:** | Invalid credentials: 1\. System displays: “Incorrect email or password.” 2\. Password field is cleared; user may retry. |
| **Exception Flow 2:** | Account suspended by admin: 1\. System displays: “Your account has been suspended. Contact support.” 2\. Login is denied. |
| **Exception Flow 3:** | Missing required fields: 1\. System displays validation error (email/password required). 2\. Login is not attempted. |
| **Exception Flow 4:** | Too many failed attempts (optional): 1\. System temporarily locks login for the account or IP. 2\. System displays a lockout message. |
| **Exception Flow 5:** | System/auth service error: 1\. System cannot validate credentials due to internal error. 2\. System logs the error and displays a generic message. |
| **Business Rules** | Session expires after 24 hours of inactivity. |
| **Special Requirements (Optional section)** | Credentials must be transmitted securely (HTTPS). Do not reveal whether an email exists beyond generic error messages. |
| **Frequency of Use** | High — most sessions. |
| **Priority** | Critical |

 

## **Use Case: UC-B03 — Browse / Search for Items**

| Use Case ID | UC-B03 |
| :---- | :---- |
| **Use Case Name** | Browse / Search for Items |
| **Screen** | Product Listing Page |
| **Actor** | Buyer (Primary User) |
| **Description** | A buyer searches for items using keywords and optionally filters results by category, condition, or course number. |
| **Pre-conditions** | User is logged in. At least one active listing exists. |
| **Post-conditions (Success)** | A filtered list of matching listings is displayed. |
| **Post-conditions (Failure)** | System displays a “No results found” message or an error message if search fails. |
| **Main Flow (Basic Flow)** | 1\. User navigates to the Product Listing Page. 2\. User enters a keyword and/or selects filter options. 3\. System queries the database for active listings matching criteria. 4\. System renders matching listings as cards. 5\. User scrolls or paginates through results. |
| **Alternative Flow 1:** | Browse all (no keyword entered): 1\. System returns all active listings sorted by recency. |
| **Alternative Flow 2:** | User clears filters: 1\. User clicks “Clear Filters.” 2\. System returns to default browse view. |
| **Exception Flow 1:** | No listings match search criteria: 1\. System displays: “No results found. Try different keywords or filters.” |
| **Exception Flow 2:** | System/database error: 1\. System fails to retrieve listings. 2\. System displays a generic error and allows retry. |
| **Business Rules** | Search is case-insensitive. Only active (non-sold) listings appear in results by default. |
| **Special Requirements (Optional section)** | Listing results should load within an acceptable response time. Filters should be clearly visible and accessible. |
| **Frequency of Use** | High |
| **Priority** | High |

 

## **Use Case: UC-B04 — View Product Details**

| Use Case ID | UC-B04 |
| :---- | :---- |
| **Use Case Name** | View Product Details |
| **Screen** | Product Details Page |
| **Actor** | Buyer (Primary User) |
| **Description** | A buyer views the full details of a specific listing, including photos, description, price, condition, and seller information. |
| **Pre-conditions** | User is logged in. The listing exists and is active. |
| **Post-conditions (Success)** | Product details page is displayed with all relevant information. |
| **Post-conditions (Failure)** | System displays an error (e.g., 404\) and provides navigation back to browsing. |
| **Main Flow (Basic Flow)** | 1\. User clicks a listing card from the Product Listing Page. 2\. System fetches the full listing record. 3\. System displays images, title, price, condition, description, and seller info. 4\. User reviews the information. |
| **Alternative Flow 1:** | View seller profile: 1\. User clicks seller display name. 2\. System navigates to the public Seller Profile page. |
| **Exception Flow 1:** | Listing removed or unavailable: 1\. System displays: “This listing is no longer available.” 2\. System provides a “Browse other items” option. |
| **Exception Flow 2:** | Unauthorized view (own listing): 1\. System detects buyer is the listing owner. 2\. System redirects to Seller Dashboard (or listing management). |
| **Business Rules** | Buyers cannot view their own listings as buyers; they are redirected to their Seller Dashboard. |
| **Special Requirements (Optional section)** | Images should load reliably and be optimized for web delivery. Page should provide clear call-to-action buttons (e.g., Add to Cart). |
| **Frequency of Use** | High |
| **Priority** | High |

 

## **Use Case: UC-B05 — Add Item to Cart**

| Use Case ID | UC-B05 |
| :---- | :---- |
| **Use Case Name** | Add Item to Cart |
| **Screen** | Product Details Page / Shopping Cart Page |
| **Actor** | Buyer (Primary User) |
| **Description** | A buyer adds one or more items to their shopping cart in preparation for checkout. |
| **Pre-conditions** | User is logged in. The listing is active and available. |
| **Post-conditions (Success)** | Item is added to the buyer’s cart. Cart icon updates to reflect item count. |
| **Post-conditions (Failure)** | Item is not added to cart. System displays an error message. |
| **Main Flow (Basic Flow)** | 1\. User is on the Product Details Page. 2\. User clicks “Add to Cart.” 3\. System adds the item to the user’s cart (session or database). 4\. System updates the cart count indicator. 5\. System displays a confirmation (toast/message). |
| **Alternative Flow 1:** | View cart: 1\. User clicks cart icon in navigation bar. 2\. System navigates to the Shopping Cart Page. |
| **Alternative Flow 2:** | Item already in cart: 1\. System detects duplicate cart entry. 2\. System keeps one entry and notifies user (or updates quantity if supported). |
| **Exception Flow 1:** | Item sold (race condition): 1\. System displays: “Sorry, this item was just purchased by another buyer.” 2\. System prevents add-to-cart (or removes item if already added). |
| **Exception Flow 2:** | Buyer attempts to add own listing: 1\. System blocks action and displays an error message. |
| **Exception Flow 3:** | System/cart persistence error: 1\. System fails to update cart due to internal error. 2\. System displays a generic error and allows retry. |
| **Business Rules** | A buyer cannot add their own listing to their cart. Cart persists across sessions for logged-in users. |
| **Special Requirements (Optional section)** | Cart updates should be near-instant and reflected in the UI. Cart should remain consistent across page refreshes for logged-in users. |
| **Frequency of Use** | High |
| **Priority** | High |

 

## **Use Case: UC-B06 — Checkout & Place Order**

| Use Case ID | UC-B06 |
| :---- | :---- |
| **Use Case Name** | Checkout & Place Order |
| **Screen** | Checkout Page / Order Confirmation Page |
| **Actor** | Buyer (Primary User) |
| **Description** | A buyer proceeds through a simulated checkout flow to place an order for items in their cart. |
| **Pre-conditions** | User is logged in. Cart contains at least one active item. |
| **Post-conditions (Success)** | Order record is created in the database. Listing status is updated to “Sold.” Buyer is shown an order confirmation with order ID. |
| **Post-conditions (Failure)** | Order is not created. System displays an error and cart remains (minus unavailable items if applicable). |
| **Main Flow (Basic Flow)** | 1\. User navigates to Checkout Page from Shopping Cart Page. 2\. System displays cart summary and total. 3\. User selects pickup/shipping preference (simulated). 4\. User clicks “Place Order.” 5\. System creates an order record and marks listing(s) as sold. 6\. System redirects to Order Confirmation Page. |
| **Alternative Flow 1:** | Item sold before checkout: 1\. System alerts buyer which item(s) are no longer available. 2\. System removes those items from cart. 3\. Buyer proceeds with remaining items or cancels. |
| **Alternative Flow 2:** | Buyer returns to cart: 1\. Buyer clicks “Back to Cart.” 2\. System returns to Shopping Cart Page without placing order. |
| **Exception Flow 1:** | Cart empty at checkout: 1\. System prevents order placement and redirects to browsing or cart. |
| **Exception Flow 2:** | System/database error creating order: 1\. System logs error and shows generic failure message. |
| **Business Rules** | No real payment integration; checkout is simulated. Orders cannot be cancelled once placed (MVP scope). |
| **Special Requirements (Optional section)** | Order creation must be atomic to avoid double-selling items. Confirmation page should show order ID and purchased items. |
| **Frequency of Use** | Medium |
| **Priority** | High |

 

## **Use Case: UC-B07 — View Order History**

| Use Case ID | UC-B07 |
| :---- | :---- |
| **Use Case Name** | View Order History |
| **Screen** | Order History Page |
| **Actor** | Buyer (Primary User) |
| **Description** | A buyer reviews all their past orders, including order status, item details, and date of purchase. |
| **Pre-conditions** | User is logged in. |
| **Post-conditions (Success)** | A list of the buyer’s past orders is displayed with relevant details. |
| **Post-conditions (Failure)** | If orders cannot be retrieved, an error message is shown and no data is modified. |
| **Main Flow (Basic Flow)** | 1\. User navigates to Order History Page. 2\. System queries orders associated with the user. 3\. System displays orders sorted by most recent. 4\. User may select an order to view more details. |
| **Alternative Flow 1:** | No orders placed: 1\. System displays: “You haven’t placed any orders yet.” 2\. System provides link to browse listings. |
| **Alternative Flow 2:** | Filter/sort orders (optional): 1\. User selects sort or filter options. 2\. System updates order list accordingly. |
| **Exception Flow 1:** | System/database retrieval error: 1\. System logs error and displays a generic failure message. |
| **Business Rules** | Order history is read-only for buyers. |
| **Special Requirements (Optional section)** | Order list should support pagination if many orders exist. Sensitive order details should be shown only to the authenticated buyer. |
| **Frequency of Use** | Medium |
| **Priority** | Medium to High |

## **Use Case: UC-B08 — Manage Profile**

| Use Case ID | UC-B08 |
| :---- | :---- |
| **Use Case Name** | Manage Profile |
| **Screen** | Profile / Account Settings Page |
| **Actor** | Buyer |
| **Description** | The Buyer views and updates their account profile information (e.g., name, email, password, contact info, preferences). The system validates changes and saves updates to the user’s account. |
| **Pre-conditions** | Buyer has an existing account Buyer is authenticated (logged in) Profile / Account Settings page is accessible to the Buyer |
| **Post-conditions (Success)** | Updated profile information is stored in the system Buyer sees a confirmation that changes were saved Any relevant session/account data is updated |
| **Post-conditions (Failure)** | No valid changes are saved Buyer remains on the Profile / Account Settings page (or is returned there) Buyer sees an error message describing what must be fixed or what failed |
| **Main Flow (Basic Flow)** | **1\.** Buyer navigates to the Profile / Account settings page. **2\.** System displays current profile information and editable fields. **3\.** Buyer edits one or more profile fields (e.g., name, email, phone, address, preferences). **4\.** Buyer selects Save / Update Profile. **5\.** System validates the submitted fields. **6\.** System updates the Buyer’s profile in the database. **7\.** System displays a success message (e.g., “Profile updated successfully.”). **8\.** Use case ends. |
| **Alternative Flow 1:  Buyer Cancels Changes** | **Trigger:** Buyer decides not to save updates. **4a.** Buyer selects Cancel (or navigates away). **4b.** System discards unsaved changes. **4c.** System returns Buyer to the last page or reloads the profile with original values. |
| **Alternative Flow 2:  Buyer Updates Password** | **Trigger:** Buyer chooses to change password. **3a.** Buyer enters Current Password, New Password, and Confirm New Password. **3b.** Buyer selects Save / Update Profile. **3c.** System verifies the current password is correct. **3d.** System validates password policy rules (length/complexity) **3e.** System updates the password and confirms success. **3f.** Flow continues at Step 7\. |
| **Alternative Flow 3:  Buyer Updates Email (Requires Verification)** | **Trigger:** Buyer changes email address. **3a.** Buyer enters a new email address. **3b.** Buyer selects Save / Update Profile. **3c.** System validates email format and checks uniqueness. **3d.** System sends a verification email to the new address. **3e.** System marks email as unverified until confirmed. **3f.** System notifies Buyer to verify the new email. **3g.** Flow continues at Step 7 (with “verification pending” message). |
| **Exception Flow 1:  Validation Error (Invalid Input)** | **Trigger:** One or more fields fail validation (empty required field, invalid format). **5a.** System detects invalid/missing required data. **5b.** System highlights invalid fields and displays specific error messages. **5c.** System does not save changes. **5d.** Flow continues at Step 3\. |
| **Exception Flow 2: Email Already In Use**  | **Trigger:** Buyer enters an email already associated with another account. **5a.** System checks email uniqueness and finds it is already in use. **5b.** System displays “Email already in use” error. **5c.** System does not save changes. **5d.** Flow continues at Step 3\. |
| **Exception Flow 3:  Incorrect Current Password** | **Trigger:** Buyer attempts password update but current password is wrong. **5a.** System verifies current password and fails. **5b.** System displays “Current password incorrect.” **5c.** System does not update password. **5d.** Flow continues at Step 3\. |
| **Exception Flow 4:  System/Database Error During Save** | **Trigger:** Database write fails or server error occurs. **6a.** System fails to update profile due to internal error. **6b.** System logs the error for administrators. **6c.** System displays a generic failure message (e.g., “Unable to save changes right now.”). **6d.** Flow continues: Use case ends (failure). |
| **Business Rules** | Required fields (if applicable) must not be blank (e.g., name, email). Email must be in valid format and unique to one account. Password changes require the current password and must meet password policy rules. If email verification is required, new email is not fully active until verified. Profile updates must only be allowed for the authenticated Buyer’s own account. |
| **Special Requirements (Optional section)** | Password fields must be masked and transmitted securely (HTTPS). Audit/logging: profile changes (especially email/password) should be logged. Error messages should not reveal sensitive info (e.g., don’t confirm existence of accounts beyond “email in use” if your policy avoids that). Page should be accessible (keyboard navigation, clear field labels, readable error messages). |
| **Frequency of Use** | Medium — Buyers update profiles occasionally (new address, new email, password changes), but not every session. |
| **Priority** | High — Account/profile management is core to user trust and account maintenance; required for real-world usability. |

## **Use Case: UC-B09 — Contact Seller**

| Use Case ID | UC-B09 |
| :---- | :---- |
| **Use Case Name** | Contact Seller |
| **Screen** | Product Page → Messaging Page |
| **Actor** | Buyer (Primary User) |
| **Description** | A buyer sends a message to the seller regarding a specific listing to ask questions, negotiate, or arrange meetup details. |
| **Pre-conditions** | Buyer is logged in. The listing exists and is active. Buyer is not the owner of the listing. |
| **Post-conditions (Success)** | Message is sent and stored in the system. Seller receives a notification of the new message. Buyer is shown a confirmation that the message was sent. A conversation thread is created (or updated) between the buyer and seller for that listing. |
| **Post-conditions (Failure)** | Message is not sent. Buyer remains on the Messaging Page with an error message displayed. |
| **Main Flow (Basic Flow)** | 1\. Buyer navigates to the Product Page for a listing. 2\. Buyer clicks the "Contact Seller" button. 3\. System redirects the buyer to the Messaging Page with a pre-populated reference to the listing. 4\. Buyer types their message in the message input field. 5\. Buyer clicks "Send". 6\. System validates that the message is not empty. 7\. System stores the message and creates or updates the conversation thread. 8\. System sends a notification to the seller. 9\. System displays a confirmation to the buyer (e.g., "Message sent\!"). 10\. Use case ends. |
| **Alternative Flow 1:** | Buyer Already Has a Conversation with Seller: Trigger: A thread already exists for this listing. 3a. System opens the existing conversation thread. 3b. Flow continues at Step 4\. |
| **Alternative Flow 2:** | Buyer Navigates Away Before Sending: Trigger: Buyer leaves the Messaging Page without sending. 4a. No message is sent; use case ends. |
| **Alternative Flow 3:** | N/A |
| **Alternative Flow 4:** | N/A |
| **Exception Flow 1:** | Empty Message Submitted: Trigger: Buyer clicks "Send" with an empty field. 6a. System displays: "Message cannot be empty." 6b. Flow continues at Step 4\. |
| **Exception Flow 2:** | Message Exceeds Character Limit: 6a. System displays a character limit validation error. 6b. Message is not sent; buyer may shorten the message. |
| **Exception Flow 3:** | System/Database Error Saving Message: 7a. System logs the error. 7b. System displays: "Unable to send message. Please try again." |
| **Exception Flow 4:** | N/A |
| **Exception Flow 5:** | N/A |
| **Exception Flow 6:** | N/A |
| **Business Rules** | A buyer cannot contact themselves (cannot message the seller of their own listing). Messages are associated with a specific listing for context. Message content must comply with marketplace communication policies. |
| **Special Requirements (Optional section)** | Messages must be transmitted securely (HTTPS). Messaging page should display the listing title/thumbnail for context. |
| **Frequency of Use** | Medium — Buyers message sellers when they have questions or want to arrange a transaction. |
| **Priority** | High — Messaging is essential for peer-to-peer marketplace transactions. |

## **Use Case: UC-B10 — Request Order Cancellation**

| Use Case ID | UC-B10 |
| :---- | :---- |
| **Use Case Name** | Request Order Cancellation |
| **Screen** | Order History Page / Order Details Page |
| **Actor** | Buyer (Primary User) |
| **Description** | A buyer submits a cancellation request for a placed order that has not yet been fulfilled, providing a reason for the cancellation. |
| **Pre-conditions** | Buyer is logged in. The order exists and belongs to the buyer. Order status is "Pending" (not yet fulfilled). |
| **Post-conditions (Success)** | Cancellation request is submitted and stored. Order status is updated to "Cancellation Requested." Seller is notified of the cancellation request. Buyer receives confirmation that the request was submitted. |
| **Post-conditions (Failure)** | Cancellation request is not submitted. Order status remains unchanged. Buyer receives an error message. |
| **Main Flow (Basic Flow)** | 1\. Buyer navigates to the Order History Page. 2\. Buyer selects the order they wish to cancel. 3\. System displays the Order Details Page. 4\. Buyer clicks "Request Cancellation." 5\. System checks that the order is in "Pending" status. 6\. System displays a cancellation request form prompting for a reason. 7\. Buyer enters a cancellation reason and confirms. 8\. System updates the order status to "Cancellation Requested." 9\. System notifies the seller of the request. 10\. System displays a confirmation message to the buyer. 11\. Use case ends. |
| **Alternative Flow 1:** | Buyer Cancels the Request Before Submitting: 7a. Buyer clicks Cancel on the cancellation form. 7b. System returns to the Order Details Page with no changes made. |
| **Alternative Flow 2:** | Order Already Fulfilled Before Request: 5a. System detects the order is no longer "Pending." 5b. System displays: "This order has already been fulfilled and cannot be cancelled." 5c. Use case ends. |
| **Alternative Flow 3:** | N/A |
| **Alternative Flow 4:** | N/A |
| **Exception Flow 1:** | Cancellation Request Already Exists: 4a. System detects an existing pending request for this order. 4b. System displays: "A cancellation request is already pending seller review." 4c. No duplicate request is created. |
| **Exception Flow 2:** | Missing Cancellation Reason: 7a. System highlights the reason field and displays: "Please provide a reason for cancellation." 7b. Request is not submitted; buyer may enter a reason and retry. |
| **Exception Flow 3:** | System/Database Error Processing Request: 8a. System logs the error. 8b. System displays: "Unable to submit cancellation request. Please try again." 8c. Order status remains unchanged. |
| **Exception Flow 4:** | N/A |
| **Exception Flow 5:** | N/A |
| **Exception Flow 6:** | N/A |
| **Business Rules** | Cancellation requests can only be submitted for orders in "Pending" status. Only the buyer who placed the order may request cancellation. A buyer may only have one active cancellation request per order at a time. Approval or denial is at the discretion of the seller (see UC-S08). |
| **Special Requirements (Optional section)** | Cancellation request form should clearly display order details for context. Buyer should be notified when seller responds. |
| **Frequency of Use** | Low — Cancellations are relatively infrequent but important to handle gracefully. |
| **Priority** | Medium — Necessary for buyer trust and order lifecycle management. |

## **Use Case: UC-S01 — Create a Listing**

| Use Case ID | UC-S01 |
| :---- | :---- |
| **Use Case Name** | Create a Listing |
| **Screen** | Create Listing Page / Seller Dashboard |
| **Actor** | Seller |
| **Description** | The Seller creates a new product/service listing by entering listing details (title, description, price, category, images, inventory/availability, etc.). The system validates the input, saves the listing, and makes it available according to the chosen publish status. |
| **Pre-conditions** | Seller has an existing seller-enabled account. Seller is authenticated (logged in). Seller has access to the Seller Dashboard / Create Listing page. |
| **Post-conditions (Success)** | A new listing record is created and stored in the system. Listing is saved with the selected status (e.g., Draft or Published). Seller receives confirmation that the listing was created. The listing appears in the Seller’s listing management view. |
| **Post-conditions (Failure)** | No listing is created (or no publish occurs if validation fails). Any invalid data is not saved (or is saved only as an incomplete draft if your system allows). Seller is shown an error message and remains on the Create Listing page with inputs preserved where possible. |
| **Main Flow (Basic Flow)** | **1\.** Seller navigates to the Seller Dashboard. **2\.** Seller selects Create Listing. **3\.** System displays the Create Listing form. **4\.** Seller enters listing details (e.g., title, description, category, price, quantity/availability). **5\.** Seller uploads one or more images (if supported). **6\.** Seller selects Publish (or the primary “Create” action). **7\.** System validates all listing inputs. **8\.** System saves the new listing in the database with status Published. **9\.** System displays a success confirmation and shows the new listing in the Seller’s listings. **10\.** Use case ends. |
| **Alternative Flow 1:  Save as Draft Instead of Publish** | **Trigger:** Seller wants to save work without publishing. **6a.** Seller selects Save Draft. **6b.** System validates required draft-minimum fields (if applicable). **6c.** System saves the listing with status Draft. **6d.** System displays confirmation that the draft was saved. **6e.** Flow continues: Use case ends. |
| **Alternative Flow 2: Create Listing Without Images**  | **Trigger:** Seller does not upload images. **5a.** Seller skips image upload. **5b.** Seller selects Publish. **5c.** System validates remaining inputs. **5d.** System saves the listing (optionally with a default placeholder image). **5e.** Flow continues at Step 9\. |
| **Alternative Flow 3: Seller Previews Listing Before Publishing** | **Trigger:** Seller wants to preview how the listing will appear. **5a.** Seller selects Preview. **5b.** System renders a preview page with the entered information. **5c.** Seller selects Edit to return to the form or Publish to continue. **5d.** Flow continues: Return to Step 4 (edit) or resume at Step 7 (publish). |
| **Exception Flow 1: Missing Required Fields**  | **Trigger:** Required fields are blank (e.g., title, price, category). **7a.** System detects missing required fields. **7b.** System highlights missing fields and displays specific error messages. **7c.** System does not publish the listing. **7d.** Flow continues/returns to Step 4\. |
| **Exception Flow 2:  Invalid Price or Quantity** | **Trigger:** Price/quantity is negative, non-numeric, or outside allowed bounds. **7a.** System validates numeric fields and detects invalid values. **7b.** System displays a validation error (e.g., “Price must be a positive number”). **7c.** System does not publish the listing. **7d.** Flow continues/returns to Step 4\. |
| **Exception Flow 3:  Image Upload Fails** | **Trigger:** Image file type/size is invalid or upload fails due to network/server error. **5a.** System rejects the image upload or upload fails. **5b.** System displays an error (e.g., “Unsupported file type” / “Upload failed, try again”). **5c.** Seller may retry upload or remove the image. **5d.** Flow continues: Return to Step 5 (retry) or proceed to Step 6 (skip images). |
| **Exception Flow 4:  System/Database Error During Save** | **Trigger:** Database write fails or internal server error occurs. **8a.** System fails to create the listing. **8b.** System logs the error for administrators. **8c.** System displays a generic failure message (e.g., “Unable to create listing right now.”). **8d.** Flow continues: Use case ends (failure). |
| **Business Rules** | Listing must include required fields (commonly: title, category, price; possibly description and at least one image depending on policy). Price must be a valid currency amount within allowed bounds. Quantity/availability must be non-negative (if inventory is tracked). Uploaded images must meet file type/size limits. Only authenticated sellers may create listings. Published listings must comply with marketplace content rules (prohibited items, banned language, etc.) if applicable. |
| **Special Requirements (Optional section)** | Images must upload securely and be stored in a reliable media store (with virus/malware scanning if required). Form should preserve entered data on validation errors. Accessibility: labels, keyboard navigation, clear error text. Performance: listing creation should complete within an acceptable time threshold (e.g., under a few seconds excluding image upload). |
| **Frequency of Use** | Medium — Sellers create listings periodically (more often for active sellers, less often for casual sellers). |
| **Priority** | Critical \- Core business functionality |

## **Use Case: UC-S02 — Edit a Listing**

| Use Case ID | UC-S02 |
| :---- | :---- |
| **Use Case Name** | Edit a Listing |
| **Screen** | Edit Listing Page / Seller Dashboard |
| **Actor** | Seller |
| **Description** | The Seller modifies an existing listing’s details (e.g., title, description, price, quantity, images, status). The system validates the updated information and saves the changes. |
| **Pre-conditions** | Seller has an existing seller-enabled account. Seller is authenticated (logged in). The listing already exists in the system. Seller has permission to edit the selected listing (owns the listing). |
| **Post-conditions (Success)** | Updated listing information is stored in the system. Changes are reflected in the marketplace view (if listing is published). Seller receives confirmation that the listing was updated. |
| **Post-conditions (Failure)** | No invalid updates are saved. Original listing data remains unchanged. Seller remains on the Edit Listing page with error messages displayed. |
| **Main Flow (Basic Flow)** | **1\.** Seller navigates to the Seller Dashboard. **2\.** Seller selects one of their existing listings. **3\.** Seller selects Edit. **4\.** System displays the Edit Listing page populated with current listing details. **5\.** Seller modifies one or more fields (e.g., price, description, quantity, images). **6\.** Seller selects Save Changes. **7\.** System validates updated inputs. **8\.** System updates the listing in the database. **9\.** System displays a confirmation message (e.g., “Listing updated successfully.”). **10\.** Use case ends. |
| **Alternative Flow 1:  Save as Draft** | **Trigger:** Seller changes listing status to Draft. **5a.** Seller modifies the listing and selects Save as Draft. **5b.** System validates minimum required fields. **5c.** System updates listing status to Draft. **5d.** System confirms draft save. **5e.** Flow continues: Use case ends. |
| **Alternative Flow 2:  Update Only Price or Quantity** | **Trigger:** Seller only adjusts inventory or price. **5a.** Seller edits only the price and/or quantity field. **5b.** Seller selects Save Changes. **5c.** System validates numeric values. **5d.** System updates only modified fields. **5e.** Flow continues at Step 9\. |
| **Alternative Flow 3: Remove or Replace Image**  | **Trigger:** Seller wants to change listing images. **5a.** Seller selects an existing image to remove or uploads a replacement. **5b.** System processes image removal or upload. **5c.** Seller selects Save Changes. **5d.** Flow continues at Step 7\. |
| **Alternative Flow 4:  Unpublish Listing** | **Trigger:** Seller changes listing status to Unpublished/Inactive. **5a.** Seller selects Unpublish. **5b.** Seller confirms action. **5c.** System updates listing status to Inactive. **5d.** Listing is no longer visible to Buyers. **5e.** Flow continues at Step 9\. |
| **Exception Flow 1:  Missing Required Fields** | **Trigger:** Seller removes required information (e.g., deletes title or sets price to blank). **7a.** System detects missing required data. **7b.** System highlights invalid fields and displays error messages. **7c.** System does not save changes. **7d.** Flow continues/returns to Step 5\. |
| **Exception Flow 2:  Invalid Price or Quantity** | **Trigger:** Price or quantity is negative, non-numeric, or outside allowed bounds. **7a.** System detects invalid numeric values. **7b.** System displays validation error. **7c.** System does not update listing. **7d.** Flow continues/returns to Step 5\. |
| **Exception Flow 3:  Image Upload Failure** | **Trigger:** Image upload fails due to file type/size limit or network/server issue. **5a.** Upload attempt fails. **5b.** System displays error message. **5c.** Seller may retry upload or remove image. **5d.** Flow continues/returns to Step 5\. |
| **Exception Flow 4:  Unauthorized Edit Attempt** | **Trigger:** Seller attempts to edit a listing they do not own. **2a.** System verifies ownership and detects mismatch. **2b.** System denies access. **2c.** System displays an authorization error. **2d.** Use case ends (failure). |
| **Exception Flow 5:  System/Database Error During Save** | **Trigger:** Database update fails. **8a.** System encounters internal error. **8b.** System logs the error. **8c.** System displays generic failure message. **8d.** Flow continues: Use case ends (failure). |
| **Business Rules** | Only the listing owner may edit a listing. Required fields must remain valid for a published listing. Price must be a valid positive currency value. Quantity must be zero or greater (if inventory tracked). Image uploads must meet file type and size requirements. Marketplace policy rules must still be satisfied after edits. |
| **Special Requirements (Optional section)** | System should maintain version history or audit logs of listing edits. Changes to published listings should reflect in buyer view promptly. Sensitive actions (e.g., unpublish) may require confirmation. Page should preserve user input if validation fails. |
| **Frequency of Use** | Medium to High — Sellers may frequently adjust price, inventory, or descriptions, especially active sellers. |
| **Priority** | Critical \- Core business functionality |

## **Use Case: UC-S03 — Delete / Deactivate a Listing**

| Use Case ID | UC-S03 |
| :---- | :---- |
| **Use Case Name** | Delete / Deactivate a Listing |
| **Screen** | Seller Dashboard |
| **Actor** | Seller |
| **Description** | The Seller removes a listing from active marketplace visibility by either permanently deleting it or deactivating/unpublishing it so it is no longer visible to Buyers. |
| **Pre-conditions** | Seller has an existing seller-enabled account. Seller is authenticated (logged in). The listing exists in the system. Seller owns the listing and has permission to modify it. |
| **Post-conditions (Success)** | **If Deactivated:**      Listing status is updated to Inactive/Unpublished.      Listing is no longer visible in buyer search/results.      Listing remains stored in the database for potential reactivation. **If Deleted:**      Listing record is removed (or marked as deleted in system).      Listing is no longer accessible in Seller Dashboard.      Any related references are handled according to business rules (e.g., completed orders preserved). |
| **Post-conditions (Failure)** | Listing remains unchanged. Seller receives an error message explaining why deletion/deactivation failed. Seller remains on the Seller Dashboard. |
| **Main Flow (Basic Flow)** | **1\.** Seller navigates to the Seller Dashboard. **2\.** System displays the Seller’s listings. **3\.** Seller selects a listing. **4\.** Seller selects Deactivate / Unpublish. **5\.** System prompts Seller for confirmation. **6\.** Seller confirms the action. **7\.** System updates the listing status to Inactive. **8\.** System displays confirmation message. **9\.** Listing is no longer visible to Buyers. **10\.** Use case ends. |
| **Alternative Flow 1:  Permanent Delete Instead of Deactivate** | **Trigger:** Seller selects Delete Permanently. **4a.** Seller selects Delete. **4b.** System displays warning message (e.g., “This action cannot be undone.”). **4c.** Seller confirms deletion. **4d.** System removes or flags the listing as deleted in the database. **4e.** System displays confirmation message. **4f.** Flow continues: Use case ends. |
| **Alternative Flow 2: Seller Cancels Deletion**  | **Trigger:** Seller reconsiders at confirmation prompt. **5a.** Seller selects Cancel. **5b.** System closes confirmation dialog. **5c.** No changes are made to listing. **5d.** Flow continues: Use case ends. |
| **Exception Flow 1:  Unauthorized Access** | **Trigger:** Seller attempts to delete a listing they do not own. **3a.** System verifies listing ownership. **3b.** System denies access. **3c.** System displays authorization error. **3d.** Use case ends (failure). |
| **Exception Flow 2:  System/Database Error** | **Trigger:** System fails while updating listing status. **7a.** System encounters database/server error. **7b.** System logs the error. **7c.** System displays generic failure message (e.g., “Unable to complete request at this time.”). **7d.** Flow continues: Use case ends (failure). |
| **Business Rules** | Only the listing owner may deactivate or delete a listing. Deactivation removes listing visibility but retains data. Permanent deletion may be restricted by system policy (soft delete recommended for audit). Confirmation is required before irreversible actions. |
| **Special Requirements (Optional section)** | System should maintain audit logs of deletion/deactivation actions. Deactivated listings should not appear in buyer search results. If soft-delete is implemented, records must be recoverable by administrators. Confirmation prompts must clearly indicate consequences of action. |
| **Frequency of Use** | Medium — Sellers may occasionally deactivate listings, but permanent deletion is less frequent. |
| **Priority** | Medium to High — Necessary for proper inventory and listing lifecycle management, but not as critical as listing creation or editing. |

## **Use Case: UC-S04 — View Incoming Orders**

| Use Case ID | UC-S04 |
| :---- | :---- |
| **Use Case Name** | View Incoming Orders |
| **Screen** | Seller Dashboard (Orders Tab) |
| **Actor** | Seller |
| **Description** | The Seller views incoming orders placed by Buyers for their listings. The system displays order details, status, and relevant buyer/shipping/payment information so the Seller can process fulfillment. |
| **Pre-conditions** | Seller has an existing seller-enabled account. Seller is authenticated (logged in). At least one order exists in the system associated with the Seller’s listings (for order display to occur). |
| **Post-conditions (Success)** | Seller can view a list of incoming orders. Seller can access detailed information for each selected order. No data is modified unless Seller performs additional actions (e.g., mark as shipped). |
| **Post-conditions (Failure)** | Orders are not displayed due to error or authorization issue. Seller receives an error message. No changes are made to order data. |
| **Main Flow (Basic Flow)** | **1\.** Seller navigates to the Seller Dashboard. **2\.** Seller selects the Orders tab. **3\.** System retrieves orders associated with the Seller. **4\.** System displays a list of incoming orders (e.g., order ID, buyer name, item, date, status). **5\.** Seller selects a specific order. **6\.** System displays detailed order information (items purchased, quantity, total price, shipping address, order status). **7\.** Seller reviews order details. **8\.** Use case ends. |
| **Alternative Flow 1: Filter Orders**  | **Trigger:** Seller wants to view specific order types. **4a.** Seller applies filters (e.g., Pending, Shipped, Completed, Date Range). **4b.** System filters order list based on selected criteria. **4c.** System updates the displayed results. **4d.** Flow continues at Step 5\. |
| **Alternative Flow 2:  Search for Specific Order** | **Trigger:** Seller enters an order ID or keyword. **4a.** Seller enters search term. **4b.** System searches order records associated with Seller. **4c.** System displays matching order(s). **4d.** Flow continues at Step 5\. |
| **Alternative Flow 3:  Sort Orders** | **Trigger:** Seller chooses sorting option. **4a.** Seller selects sort criteria (e.g., newest first, highest value, status). **4b.** System reorders the list accordingly. **4c.** Flow continues at Step 5\. |
| **Alternative Flow 4:  No Orders Available** | **Trigger:** Seller has no incoming orders. **3a.** System finds no associated orders. **3b.** System displays message (e.g., “No incoming orders.”). **3c.** Use case ends. |
| **Exception Flow 1:  Unauthorized Access** | **Trigger:** Seller attempts to access orders not associated with their account. **3a.** System verifies order ownership. **3b.** System denies access. **3c.** System displays authorization error. **3d.** Use case ends (failure). |
| **Exception Flow 2:  System/Database Retrieval Error** | **Trigger:** System fails while retrieving order data. **3a.** System encounters database/server error. **3b.** System logs the error. **3c.** System displays generic error message (e.g., “Unable to retrieve orders at this time.”). **3d.** Use case ends (failure). |
| **Exception Flow 3:  Order Detail Retrieval Failure** | **Trigger:** System fails while retrieving selected order details. **6a.** System encounters error retrieving detailed information. **6b.** System displays error message. **6c.** System returns to order list view. **6d.** Flow continues at Step 4\. |
| **Business Rules** | Sellers may only view orders associated with their own listings. Order information must reflect accurate transaction data. Order status must be displayed according to system-defined status categories (e.g., Pending, Paid, Shipped, Completed, Cancelled). Sensitive buyer information must only be shown as required for fulfillment. |
| **Special Requirements (Optional section)** | Order data must be transmitted securely (HTTPS). Personally identifiable information (PII) must be handled in compliance with privacy regulations. Order list should support pagination if order volume is large. Performance requirement: Order list should load within acceptable response time under normal system load. |
| **Frequency of Use** | High — Active Sellers will frequently check incoming orders to fulfill and manage transactions. |
| **Priority** | High — Viewing incoming orders is essential for Seller operations and order fulfillment; core functionality of the marketplace system. |

## **Use Case: UC-S05 — View Seller Dashboard**

| Use Case ID | UC-S05 |
| :---- | :---- |
| **Use Case Name** | View Seller Dashboard |
| **Screen** | Seller Dashboard |
| **Actor** | Seller  |
| **Description** | The Seller accesses the Seller Dashboard to view an overview of their marketplace activity, including listings, incoming orders, sales metrics, and account-related information. |
| **Pre-conditions** | Seller has an existing seller-enabled account. Seller is authenticated (logged in). Seller account is in good standing (not suspended or restricted). |
| **Post-conditions (Success)** | Seller Dashboard is displayed with relevant summary information. Seller can access navigation options (Listings, Orders, Profile, etc.). No data is modified unless Seller performs additional actions. |
| **Post-conditions (Failure)** | Seller Dashboard is not displayed. Seller receives an error message explaining why access failed. No system data is modified. |
| **Main Flow (Basic Flow)** | **1\.** Seller logs into the system. **2\.** Seller selects Seller Dashboard (or is automatically redirected after login). **3\.** System verifies Seller permissions and account status. **4\.** System retrieves Seller-related data (active listings, order summaries, metrics). **5\.** System displays the Seller Dashboard with: Listings overview (total, active, inactive) Orders summary (pending, completed, recent orders) Sales metrics **6\.** Seller views dashboard information. **7\.** Use case ends. |
| **Alternative Flow 1:  Direct Access via URL** | **Trigger:** Seller enters dashboard URL directly. **1a.** Seller enters or bookmarks the Seller Dashboard URL. **1b.** System verifies authentication and authorization. **1c.** If authenticated, system displays dashboard. **1d.** Flow continues at Step 4\. |
| **Alternative Flow 2:  No Listings Yet** | **Trigger:** Seller has not created any listings. **4a.** System finds no listings associated with Seller. **4b.** System displays message (e.g., “You have no listings yet.”). **4c.** System provides option to Create Listing. **4d.** Flow continues at Step 6\. |
| **Alternative Flow 3:  No Orders Yet** | **Trigger:** Seller has no incoming orders. **4a.** System finds no associated orders. **4b.** System displays “No orders yet” message in order summary section. **4c.** Flow continues at Step 6\. |
| **Exception Flow 1: Unauthorized Access (Not Logged In)**  | **Trigger:** Seller attempts to access dashboard without authentication. **2a.** System detects no active session. **2b.** System redirects user to Login page. **2c.** Use case ends (failure). |
| **Exception Flow 2:  Seller Account Suspended or Restricted** | **Trigger:** Seller account is flagged or restricted. **3a.** System checks account status. **3b.** System denies access. **3c.** System displays notification (e.g., “Your seller account is currently suspended.”). **3d.** Use case ends (failure). |
| **Exception Flow 3:  System/Database Retrieval Error** | **Trigger:** System fails while retrieving dashboard data. **4a.** System encounters server/database error. **4b.** System logs the error. **4c.** System displays generic error message (e.g., “Unable to load dashboard at this time.”). **4d.** Use case ends (failure). |
| **Business Rules** | Only authenticated Sellers may access the Seller Dashboard. Dashboard must only display data associated with the logged-in Seller. Summary counts (orders, listings, sales) must reflect real-time or system-defined update intervals. Access may be restricted if seller account violates marketplace policies. |
| **Special Requirements (Optional section)** | Dashboard should load within acceptable performance thresholds. Data displayed must be accurate and consistent across related views (e.g., order counts match Orders tab). Sensitive financial information must be securely transmitted and properly formatted. UI should support responsive design (desktop/mobile access). |
| **Frequency of Use** | High — Sellers will frequently access the dashboard to monitor listings, orders, and performance. |
| **Priority** | High — The Seller Dashboard is the central hub for Seller operations and navigation within the marketplace system. |

## **Use Case: UC-S06 — Mark Order as Fulfilled**

| Use Case ID | UC-S06 |
| :---- | :---- |
| **Use Case Name** | Mark Order as Fulfilled |
| **Screen** | Seller Dashboard (Orders tab) |
| **Actor** | Seller (Secondary User) |
| **Description** | A seller indicates that they have handed off an item to the buyer, updating the order status.  |
| **Pre-conditions** | \-User is logged in. \-An order exists for the seller’s listing with status “Pending.” |
| **Post-conditions (Success)** | \-Order status is updated to “Fulfilled” \-Buyer can see the updated status in their Order history.  |
| **Post-conditions (Failure)** | \-Order status remains unchanged (still Pending\_ with no partial updates \-Buyer sees no change in their Order History |
| **Main Flow (Basic Flow)** | Seller navigates to the Orders tab of the Seller Dashboard Seller locates a “Pending” order and clicks “Mark as Fulfilled” System displays a confirmation: “Confirm that the item has been delivered/picked up?” Seller confirms System updates the order status to “Fulfilled”. |
| **Alternative Flow 1:**  | Order is not in “Pending” status: System detects the order status is not “Pending” System displays: “Only pending orders can be marked as fulfilled”.  Action is blocked and no changes are saved. |
| **Alternative Flow 2:**  | Network or server error during update: Seller confirms fulfillment System attempts to update order status but fails due to server/network issue System displays: “Unable to update order status. Please try again”. System logs the error Order remains in its previous state |
| **Alternative Flow 3:**  | Seller session expires: Seller clicks “Mark as fulfilled” but their session is invalid/expired System redirects to the login page System displays: “Your session has expired. Please log in again”. Action is not completed.  |
| **Business Rules** | \-Only pending orders can be marked as fulfilled.  |
| **Frequency of Use** | Medium |
| **Priority** | Medium |

## **Use Case: UC-S07 — Respond to Buyer Message**

| Use Case ID | UC-S07 |
| :---- | :---- |
| **Use Case Name** | Respond to Buyer Message |
| **Screen** | Seller Dashboard (Messaging Window/Tab) |
| **Actor** | Seller |
| **Description** | A seller reads a message from a buyer and sends a reply through the messaging interface within the Seller Dashboard. |
| **Pre-conditions** | Seller is logged in. At least one unread or existing message from a buyer exists in the seller's inbox. |
| **Post-conditions (Success)** | Seller's reply is stored and delivered to the buyer. Conversation thread is updated with the new reply. Buyer receives a notification of the seller's response. |
| **Post-conditions (Failure)** | Reply is not sent. Seller remains in the messaging view with an error message displayed. Conversation thread is unchanged. |
| **Main Flow (Basic Flow)** | 1\. Seller navigates to the Seller Dashboard. 2\. Seller selects the Messaging tab/window. 3\. System displays a list of active conversations with buyers. 4\. Seller selects a conversation. 5\. System displays the full conversation thread for that listing. 6\. Seller reads the buyer's message. 7\. Seller types a reply in the message input field. 8\. Seller clicks "Send". 9\. System validates that the reply is not empty. 10\. System stores the reply and updates the conversation thread. 11\. System sends a notification to the buyer. 12\. Use case ends. |
| **Alternative Flow 1:** | Seller Has No Messages: Trigger: No conversations exist. 3a. System displays: "No messages yet." 3b. Use case ends. |
| **Alternative Flow 2:** | Seller Closes Without Replying: Trigger: Seller navigates away without responding. 7a. No reply is saved; conversation thread is unchanged. |
| **Alternative Flow 3:** | N/A |
| **Alternative Flow 4:** | N/A |
| **Exception Flow 1:** | Empty Reply Submitted: Trigger: Seller clicks "Send" with empty reply field. 9a. System displays: "Reply cannot be empty." 9b. Flow continues at Step 7\. |
| **Exception Flow 2:** | Reply Exceeds Character Limit: 9a. System displays character limit validation error. 9b. Reply not sent; seller may shorten the message. |
| **Exception Flow 3:** | System/Database Error Saving Reply: 10a. System logs the error. 10b. System displays: "Unable to send reply. Please try again." |
| **Business Rules** | Sellers may only view and reply to conversations associated with their own listings. Reply content must comply with marketplace communication policies. Conversation threads are listed in order of most recent activity. |
| **Special Requirements (Optional section)** | Messaging interface should display listing context (title, thumbnail) alongside the conversation. Unread messages should be clearly indicated. |
| **Frequency of Use** | Medium — Active sellers respond to buyer inquiries regularly. |
| **Priority** | High — Responsive communication is critical to completing marketplace transactions. |

 **Use Case: UC-S08 — Approve / Deny Cancellation**

| Use Case ID | UC-S08 |
| :---- | :---- |
| **Use Case Name** | Approve / Deny Cancellation |
| **Screen** | Seller Dashboard (Orders Tab) |
| **Actor** | Seller |
| **Description** | A seller reviews a buyer-submitted order cancellation request and either approves or denies it, updating the order status accordingly. |
| **Pre-conditions** | Seller is logged in. An order with status "Cancellation Requested" exists for one of the seller's listings. |
| **Post-conditions (Success)** | If approved: Order status is updated to "Cancelled." Buyer is notified. If denied: Order status reverts to "Pending." Buyer is notified. Seller's decision is recorded and logged for audit purposes. |
| **Post-conditions (Failure)** | Seller's decision is not processed. Order status remains "Cancellation Requested." Seller receives an error message. |
| **Main Flow (Basic Flow)** | 1\. Seller navigates to the Seller Dashboard. 2\. Seller selects the Orders tab. 3\. System displays orders, with "Cancellation Requested" orders highlighted. 4\. Seller selects the order with the cancellation request. 5\. System displays Order Details including the buyer's cancellation reason. 6\. Seller clicks "Approve Cancellation" or "Deny Cancellation." 7\. System prompts Seller to confirm the selected action. 8\. Seller confirms. 9\. If approved: System updates order status to "Cancelled." 10\. If denied: System reverts order status to "Pending." 11\. System notifies the buyer of the seller's decision. 12\. System logs the action. 13\. Use case ends. |
| **Alternative Flow 1:** | Seller Has No Cancellation Requests: 3a. No cancellation-flagged orders are displayed. 3b. Seller views other order statuses as normal; use case ends. |
| **Alternative Flow 2:** | Seller Ignores Request (Takes No Action): 6a. Seller navigates away without selecting an action. 6b. Order status remains "Cancellation Requested" until seller responds or admin intervenes. |
| **Alternative Flow 3:** | N/A |
| **Alternative Flow 4:** | N/A |
| **Exception Flow 1:** | Order Status Changed Before Seller Responds: 6a. System detects order is no longer in "Cancellation Requested" status. 6b. System displays: "This order's status has changed. Please refresh to view the latest status." 6c. Seller's action is blocked. |
| **Exception Flow 2:** | System/Database Error Processing Decision: 9a. System logs the error. 9b. System displays: "Unable to process your decision. Please try again." 9c. Order status remains unchanged. |
| **Exception Flow 3:** | Seller Session Expires Before Confirming: 8a. System detects the expired session. 8b. System redirects to Login Page with: "Your session has expired. Please log in again." 8c. Action is not completed; order status is unchanged. |
| **Business Rules** | Only the seller who owns the listing may approve or deny the cancellation. A seller may only act on orders in "Cancellation Requested" status. Approving a cancellation returns the listing to "Active" status. All approve/deny actions are logged for audit and dispute resolution. |
| **Special Requirements (Optional section)** | Cancellation requests should be clearly highlighted in the Orders tab. Sellers should see the buyer's stated reason before deciding. |
| **Frequency of Use** | Low — Mirrors the frequency of buyer cancellation requests (UC-B11). |
| **Priority** | Medium — Required for a complete order cancellation workflow; supports buyer-seller trust. |

## **Use Case: UC-A01 — Admin Login**

| Use Case ID | UC-A01 |
| :---- | :---- |
| **Use Case Name** | Admin Login |
| **Screen** | Admin Login |
| **Actor** | Admin |
| **Description** | An administrator authenticates into the admin portal with elevated privileges.  |
| **Pre-conditions** | \-Admin account exists in the system \-Admin is not currently logged in |
| **Post-conditions (Success)** | \-Admin session is established with admin-level permissions. \-Admin is redirected to the Admin Dashboard. |
| **Post-conditions (Failure)** | \-No Admin session token is created; prior session (if any) remains invalid. Admin is not redirected to the Admin dashboard; remains on the login page.  |
| **Main Flow (Basic Flow)** | Admin navigates to /admin/login. Admin enters admin credentials. System validates credentials and checks that the user role is “admin” System creates an admin session token. Admin is redirected to the Admin Dashboard.  |
| **Alternative Flow 1:**  | Invalid credentials:  System displays: “Invalid credentials.”  Login is denied.  |
| **Alternative Flow 2:**  | Non-admin user attempts admin login:  System denies access regardless of valid credentials.  System logs the unauthorized attempt. |
| **Alternative Flow 3:**  | Account locked due to too many failed attempts: Admin enters incorrect credentials too many times System detects threshold exceeded. The system locks the account temporarily. System displays: “Too many failed attempts. Your account has been temporarily locked”. |
| **Alternative Flow 4:**  | Missing required fields: Admin submits login form with empty email or password. System display: “Email and password are required” Login is not attempted |
| **Business Rules** | \-Admin portal is only accessible via /admin routes with an admin-role JWT. \-All admin actions are logged in an audit trail. |
| **Frequency of Use** | Medium |
| **Priority** | High |

## **Use Case: UC-A02 — View Admin Dashboard**

| Use Case ID | UC-A02 |
| :---- | :---- |
| **Use Case Name** | View Admin Dashboard |
| **Screen** | Admin Dashboard |
| **Actor** | Admin |
| **Description** | The admin views a high-level overview of platform activity including user counts, listing counts, and recent orders |
| **Pre-conditions** | Admin is logged in. |
| **Post-conditions (Success)** | Admin Dashboard is rendered with live platform metrics. |
| **Post-conditions (Failure)** | \-No change to platform data (read-only view failed) |
| **Main Flow (Basic Flow)** | Admin navigates to the Admin Dashboard (default landing after login). System queries aggregate metrics: total registered users, active listings, total orders, and flagged content count. System renders summary cards and a recent activity feed. Admin may drill into any section via sidebar navigation. |
| **Alternative Flow 1:**  | Admin session expired: Admin attempts to access dashboard System detects expired or missing admin session token. System redirects to the admin login page with the message: “Your session has expired. Please log in again”. |
| **Alternative Flow 2:**  | Unauthorized role:  A logged in user attempts to access admin dashboard but is not an admin System denies access System logs unauthorized access attempt The system redirects to the main site with the message: “Access denied”. |
| **Business Rules** | Dashboard data refreshes on each page load. |
| **Frequency of Use** |  |
| **Priority** |  |

## **Use Case: UC-A03 — Manage Users (View, Suspend, Reinstate)**

| Use Case ID | UC-A03 |
| :---- | :---- |
| **Use Case Name** | Manage Users (View, Suspend, Reinstate) |
| **Screen** | Admin User Management Page |
| **Actor** | Admin |
| **Description** | An admin views all registered users and can suspend or reinstate accounts that violate platform policies. |
| **Pre-conditions** | Admin is logged in. |
| **Post-conditions (Success)** | User account status is updated; suspended users cannot log in. |
| **Post-conditions (Failure)** | \-User records remain unchanged |
| **Main Flow (Basic Flow)** | Admin navigates to User Management in the Admin Dashboard. System displays a paginated, searchable table of all users (name, email, role, status, join date). Admin searches or filters for a specific user. Admin clicks on a user to view their profile details, listing history, and order history. Admin clicks "Suspend Account." System displays a confirmation dialog requesting a reason. Admin enters reason and confirms. System sets the user's status to "Suspended" and invalidates any active sessions for that user. |
| **Alternative Flow 1:**  | Admin reinstates a suspended user:  Admin locates the suspended user. Admin clicks “Reinstate Account”.  The system sets user status back to “Active”.  |
| **Alternative Flow 2:**  | Unable to load user list: System fails to fetch user list due to a service/database issue. System displays: “Unable to load user data. Please try again later”. Table loads empty. |
| **Business Rules** | \- Suspension reason is stored in the audit log. \- Suspended users see a message explaining their suspension upon attempted login. |
| **Frequency of Use** | Medium |
| **Priority** | High |

## **Use Case: UC-A04 — Manage Listings (View, Remove, Restore)**

| Use Case ID | UC-A04 |
| :---- | :---- |
| **Use Case Name** | Manage Listings (View, Remove, Restore) |
| **Screen** | Admin Listing Management Page |
| **Actor** | Admin |
| **Description** | An admin can view all listings on the platform, including inactive and removed ones, and can remove inappropriate listings or restore falsely removed ones. |
| **Pre-conditions** | Admin is logged in. |
| **Post-conditions (Success)** | Listing status is updated as directed by the admin. |
| **Post-conditions (Failure)** | \-Listing retains its prior status |
| **Main Flow (Basic Flow)** | Admin navigates to Listing Management. System displays all listings with filter options (All, Active, Sold, Removed, Flagged). Admin searches for a specific listing or filters by category/status. Admin reviews listing details. Admin clicks "Remove Listing" for a policy-violating item. System prompts for a removal reason. Admin enters reason and confirms. System sets listing status to "Admin Removed" and hides it from buyers. |
| **Alternative Flow 1:**  | Admin restores a listing:  Admin locates a “Removed” listing.  Admin clicks “Restore”.  System sets listing status to “Active”. |
| **Business Rules** | \-Admin-removed listings show as "Removed by Marketplace" to the seller. \-Removal reasons are stored in the audit log. |
| **Frequency of Use** |  |
| **Priority** |  |

## **Use Case: UC-A05 — View All Orders**

| Use Case ID | UC-A05 |
| :---- | :---- |
| **Use Case Name** | View All Orders |
| **Screen** | Admin Order Management |
| **Actor** | Admin |
| **Description** | An admin can view all orders across the platform for monitoring and dispute resolution. |
| **Pre-conditions** | Admin is logged in |
| **Post-conditions (Success)** | Order list is displayed with full details. |
| **Post-conditions (Failure)** | No order data is modified; read-only access failed clearly. |
| **Main Flow (Basic Flow)** | Admin navigates to Order Management. System displays all orders across all users with filters (date range, status, user). Admin clicks on a specific order to view buyer, seller, item, price, and timestamps. Admin may update order status in exceptional cases (e.g., dispute resolution) by selecting a new status and providing a reason. |
| **Alternative Flow 1:**  |  |
| **Alternative Flow 2:**  |  |
| **Alternative Flow 3:**  |  |
| **Alternative Flow 4:**  |  |
| **Exception Flow 1:**  |  |
| **Exception Flow 2:**  |  |
| **Exception Flow 3:**  |  |
| **Exception Flow 4:**  |  |
| **Exception Flow 5:**  |  |
| **Exception Flow 6:**  |  |
| **Business Rules** | All admin order modifications are logged. |
| **Special Requirements (Optional section)** |  |
| **Frequency of Use** |  |
| **Priority** |  |

## **Use Case: UC-A06 — View Platform Analytics**

| Use Case ID | UC-A06 |
| :---- | :---- |
| **Use Case Name** | View Platform Analytics  |
| **Screen** | Admin Analytics Page |
| **Actor** | Admin |
| **Description** | An admin views platform-wide analytics such as top categories, most active sellers, and transaction volume over time. |
| **Pre-conditions** | Admin is logged in. |
| **Post-conditions (Success)** | Analytics data and visualizations are rendered. |
| **Post-conditions (Failure)** | No order displayed ; read-only access failed clearly |
| **Main Flow (Basic Flow)** | Admin navigates to the Analytics section of the Admin Dashboard. System aggregates data: listings by category, orders per time period, new user registrations per week, and top sellers. System renders summary statistics and simple charts. Admin may filter by date range. |
| **Alternative Flow 1:**  |  |
| **Alternative Flow 2:**  |  |
| **Alternative Flow 3:**  |  |
| **Alternative Flow 4:**  |  |
| **Exception Flow 1:**  |  |
| **Exception Flow 2:**  |  |
| **Exception Flow 3:**  |  |
| **Exception Flow 4:**  |  |
| **Exception Flow 5:**  |  |
| **Exception Flow 6:**  |  |
| **Business Rules** | Analytics are read-only. |
| **Special Requirements (Optional section)** |  |
| **Frequency of Use** |  |
| **Priority** |  |

## **Use Case: UC-A07 — Review Reported Messages**

| Use Case ID | UC-A07 |
| :---- | :---- |
| **Use Case Name** | Review Reported Messages |
| **Screen** | Admin Dashboard → Reported Messages Queue Window |
| **Actor** | Admin |
| **Description** | An admin reviews messages flagged by users as inappropriate or policy-violating, and takes appropriate action (dismiss, warn, or suspend). |
| **Pre-conditions** | Admin is logged in. At least one message has been reported and is in the Reported Messages Queue. |
| **Post-conditions (Success)** | Admin has reviewed the reported message. Appropriate action has been taken (dismissed, warning issued, or account suspended). Action is logged in the admin audit trail. |
| **Post-conditions (Failure)** | No action is taken. Admin receives an error message if the system fails. Reported message remains in the queue. |
| **Main Flow (Basic Flow)** | 1\. Admin navigates to the Admin Dashboard. 2\. Admin selects the Reported Messages Queue. 3\. System displays a list of reported messages with reporter info, content, and listing context. 4\. Admin selects a reported message to review. 5\. System displays the full conversation thread and the flagged message. 6\. Admin reviews the message for policy violations. 7\. Admin selects an action: Dismiss Report, Issue Warning to Sender, or Suspend Sender Account. 8\. System prompts Admin to confirm the selected action. 9\. Admin confirms. 10\. System processes the action and removes the report from the active queue. 11\. System logs the action in the audit trail. 12\. Use case ends. |
| **Alternative Flow 1:** | No Reported Messages in Queue: 3a. System displays: "No reported messages at this time." 3b. Use case ends. |
| **Alternative Flow 2:** | Admin Dismisses Reports in Batch: 7a. Admin selects multiple reports and chooses Dismiss Selected. 7b. System prompts for confirmation. 7c. System marks all selected as dismissed and logs each action. |
| **Alternative Flow 3:** | N/A |
| **Alternative Flow 4:** | N/A |
| **Exception Flow 1:** | System Fails to Load Reported Messages: 3a. System logs the error. 3b. System displays: "Unable to load reported messages. Please try again later." |
| **Exception Flow 2:** | System Fails to Process Action: 10a. System logs the error. 10b. System displays: "Unable to process action. Please try again." 10c. Reported message remains in the queue. |
| **Exception Flow 3:** | Conversation or Message No Longer Exists: 4a. System detects the message no longer exists. 4b. System displays: "This message is no longer available." 4c. Report is automatically removed from the queue. |
| **Exception Flow 4:** | N/A |
| **Exception Flow 5:** | N/A |
| **Exception Flow 6:** | N/A |
| **Business Rules** | All admin actions on reported messages must be logged in the audit trail. A dismissed report does not notify the reporter or reported user. Issuing a warning sends an automated notification to the offending user. Suspending a sender account follows the same process as UC-A03. |
| **Special Requirements (Optional section)** | Reported messages queue should be sortable by date reported. Admin should be able to see the full conversation thread for context. |
| **Frequency of Use** | Low to Medium — Admins review reports reactively as they are submitted. |
| **Priority** | Medium — Important for platform safety and policy enforcement. |

# **Appendix B: Sample Marketplace Use Cases and Screens**

This appendix provides a concrete, albeit rough, example of the number of use cases and screens required for a simple marketplace application with three user roles: Customer, Vendor, and Admin. This is meant to help you gauge the appropriate scope for your project.

## **Customer Role**

**Use Cases (7-8):**

1. Browse and search products  
2. View product details  
3. Manage shopping cart (add, update, remove items)  
4. Checkout and payment  
5. View order history  
6. View and track individual order details  
7. Update profile information  
8. Write product reviews

**Screens (8-10):**

1. Home page with product browsing  
2. Search results page  
3. Product details page  
4. Shopping cart page  
5. Checkout page  
6. Order confirmation page  
7. Order history page  
8. Individual order details page  
9. Profile and account settings page  
10. Review submission page

## **Vendor Role**

**Use Cases (6-7):**

1. Register as vendor  
2. Add new product listing  
3. Edit, update, or delete product  
4. View and manage incoming orders  
5. Update order status and shipping information  
6. View sales analytics and reports  
7. Update vendor profile

**Screens (7-8):**

1. Vendor dashboard  
2. Add product page  
3. Edit product page  
4. Product inventory list  
5. Order management page  
6. Individual order details page  
7. Sales analytics page  
8. Vendor profile page

## **Admin Role**

**Use Cases (5-6):**

1. View and manage users (ban, unban, view details)  
2. Manage vendors (approve, suspend, view)  
3. Moderate product listings (approve, reject, remove)  
4. Moderate reviews and content  
5. View system analytics  
6. Configure system settings

**Screens (6-7):**

1. Admin dashboard  
2. User management page  
3. Vendor management page  
4. Product moderation page  
5. Content moderation page  
6. System analytics page  
7. Settings and configuration page

## **Summary for Simple Marketplace**

**Total Use Cases:** 18-21 use cases

**Total Screens:** 21-25 screens

**Key Takeaway:** Even a relatively simple marketplace application requires approximately 20 use cases and 25 screens to provide adequate coverage. This should give you a sense of the scope expected. If your application is simpler, you should still aim for at least 15 use cases and 15 screens minimum. If your application is more complex, you will need more than 15, and don’t stop at 15\.