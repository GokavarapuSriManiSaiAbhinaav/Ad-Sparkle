/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export type ReportMember = {
    name: string;
    phone: string;
    upi_id?: string;
    payment_completed: boolean;
};

export async function generatePaymentReport(
    groupName: string,
    year: number,
    month: number,
    members: ReportMember[]
) {
    const doc = new jsPDF();
    const currentDate = format(new Date(), "PPp");

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(124, 58, 237); // #7C3AED Violet
    doc.text("AdSparkle", 105, 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(`Payment Report: ${groupName || "Group"}`, 105, 30, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    doc.text(`Period: ${monthNames[month - 1]} ${year}`, 105, 36, { align: "center" });
    doc.text(`Generated on: ${currentDate}`, 105, 42, { align: "center" });
    doc.text(`Admin: AdSparkle Admin`, 105, 48, { align: "center" });

    // Separate members
    const paidMembers = members.filter(m => m.payment_completed);
    const unpaidMembers = members.filter(m => !m.payment_completed);

    let startY = 60;

    // Paid Section
    if (paidMembers.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 163, 74); // Green
        doc.text("Paid Members", 14, startY);

        const paidRows = paidMembers.map((m, i) => [
            (i + 1).toString(),
            m.name,
            m.phone || "N/A",
            m.upi_id || "N/A",
            "Paid"
        ]);

        autoTable(doc, {
            startY: startY + 5,
            head: [["#", "Name", "Phone", "UPI ID", "Status"]],
            body: paidRows,
            theme: "grid",
            styles: { fontSize: 9 },
            headStyles: { fillColor: [22, 163, 74] },
        });

        startY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Unpaid Section
    if (unpaidMembers.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38); // Red
        doc.text("Unpaid Members", 14, startY);

        const unpaidRows = unpaidMembers.map((m, i) => [
            (i + 1).toString(),
            m.name,
            m.phone || "N/A",
            m.upi_id || "N/A",
            "Pending"
        ]);

        autoTable(doc, {
            startY: startY + 5,
            head: [["#", "Name", "Phone", "UPI ID", "Status"]],
            body: unpaidRows,
            theme: "grid",
            styles: { fontSize: 9 },
            headStyles: { fillColor: [220, 38, 38] },
        });

        startY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Summary
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("Summary", 14, startY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Total Members: ${members.length}`, 14, startY + 8);
    doc.text(`Total Paid: ${paidMembers.length}`, 14, startY + 14);
    doc.text(`Total Unpaid: ${unpaidMembers.length}`, 14, startY + 20);

    // Page numbers
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }

    // Save
    const cleanGroupName = (groupName || "Group").replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `AdSparkle_${cleanGroupName}_${monthNames[month - 1]}_${year}_Report.pdf`;
    doc.save(filename);
}
