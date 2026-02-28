import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="force-dark min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans"
            style={{ background: "linear-gradient(160deg, #0B1C2D 0%, #0F2540 40%, #091522 100%)" }}>
            {/* Background glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none -z-10"
                style={{ background: "radial-gradient(ellipse, rgba(212,175,55,0.07) 0%, transparent 70%)" }} />

            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-xl scale-125"
                        style={{ background: "rgba(212,175,55,0.2)" }} />
                    <div className="h-20 w-20 rounded-full overflow-hidden relative flex items-center justify-center"
                        style={{ border: "2px solid rgba(212,175,55,0.45)", boxShadow: "0 0 24px rgba(212,175,55,0.2)" }}>
                        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "rgba(212,175,55,0.8)" }} />
                    </div>
                </div>

                <h2 className="text-xl font-bold tracking-tight gold-gradient-text"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    Loading Dashboard...
                </h2>
            </div>
        </div>
    );
}
