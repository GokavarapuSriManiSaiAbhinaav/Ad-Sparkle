import { verifyAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Check session and admin status securely on the server
    const { isAdmin } = await verifyAdmin();

    // 2. Redirect to login if user is not authenticated or not an admin
    if (!isAdmin) {
        redirect("/login");
    }

    // 3. Render dashboard content
    return <>{children}</>;
}
