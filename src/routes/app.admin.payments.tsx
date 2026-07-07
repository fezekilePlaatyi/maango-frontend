import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { paymentsApi } from "@/api/realApi";
import type { Invoice } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currency } from "@/lib/permissions";

export const Route = createFileRoute("/app/admin/payments")({ component: AdminPayments });

function AdminPayments() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  useEffect(() => { paymentsApi.listAllInvoices().then(setInvoices); }, []);
  const total = invoices.filter(i => i.status === "paid").reduce((a, b) => a + b.amount, 0);
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Payments</h1>
      <Card className="mt-6 p-5"><div className="text-xs text-muted-foreground">Total revenue</div><div className="font-display text-3xl">{currency(total)}</div></Card>
      <Card className="mt-4 p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Pro</TableHead><TableHead>Plan</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{invoices.map(i => (
            <TableRow key={i.id}><TableCell>{new Date(i.date).toLocaleDateString()}</TableCell><TableCell className="text-muted-foreground">{i.proId}</TableCell><TableCell className="capitalize">{i.plan}</TableCell><TableCell>{currency(i.amount)}</TableCell><TableCell><Badge className={i.status === "paid" ? "bg-leaf text-leaf-foreground border-0" : ""}>{i.status}</Badge></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </Card>
    </div>
  );
}
