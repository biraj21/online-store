import PDFDocument from "pdfkit";
import { splitDatetime } from "./helpers.js";

export default function createInvoice(order) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();

        const buffer = [];
        doc.on("data", (chunk) => buffer.push(chunk));
        doc.on("end", () => {
            resolve({
                name: `Node Shop Invoice-${order.id} ${order.orderDate.toDateString()}.pdf`,
                buffer: Buffer.concat(buffer),
            });
        });

        doc.fontSize(24);
        doc.font("Helvetica-Bold");
        doc.text("Node Shop", { align: "center", underline: true });

        doc.fontSize(12);
        doc.font("Helvetica");
        doc.text(`\nOrder id: ${order.id}`);
        doc.text(`Order date: ${splitDatetime(order.orderDate).join(", ")}`);

        doc.fontSize(16);
        doc.font("Helvetica-Bold");
        doc.text("\nOrder Details", { align: "center", underline: true });

        doc.fontSize(12);
        doc.text("Product", { underline: true });
        doc.moveUp();
        doc.text("Unit Cost (INR)", { align: "right", underline: true });

        doc.font("Helvetica");
        let totalAmount = 0;
        for (const item of order.items) {
            doc.text(`${item.quantity} x ${item.name}`, { width: 350 });
            doc.moveUp();
            doc.text(`${item.price}`, { align: "right" });
            totalAmount += item.quantity * item.price;
        }

        doc.text("Total Amount", { align: "center" });
        doc.moveUp();
        doc.text(`${totalAmount}`, { align: "right" });

        doc.fontSize(8);
        doc.text("\n\nThis is a computer generated document.", { align: "center" });

        doc.end();
    });
}
