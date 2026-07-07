import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminApi } from "@/api/realApi";
import type { User } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/app/admin/users")({ component: Users });

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => { adminApi.listUsers().then(setUsers); }, []);
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Users</h1>
      <Card className="mt-6 p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
          <TableBody>{users.map(u => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell><Badge variant="outline" className="capitalize">{u.role}</Badge></TableCell>
              <TableCell className="text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </Card>
    </div>
  );
}
