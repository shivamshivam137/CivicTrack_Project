/**
 * Role-based route protection for ALL /admin/* pages
 * Firebase v9 (modular)
 *
 * Behavior:
 * - Not logged in  → redirect to /public/login.html
 * - Logged in, not admin → redirect to /public/dashboard.html
 * - Logged in, admin → allow access
 */

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { app } from "../../firebase/firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Run guard only on admin pages
const isAdminRoute = window.location.pathname.startsWith("/admin/");

if (isAdminRoute) {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // Not authenticated
            window.location.replace("/public/login.html");
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // No role record → treat as non-admin
                window.location.replace("/public/dashboard.html");
                return;
            }

            const { role } = userSnap.data();

            if (role !== "admin") {
                // Authenticated but not admin
                window.location.replace("/public/dashboard.html");
                return;
            }

            // ✅ Admin verified → allow page load

        } catch (error) {
            console.error("Role guard error:", error);
            window.location.replace("/public/login.html");
        }
    });
}
