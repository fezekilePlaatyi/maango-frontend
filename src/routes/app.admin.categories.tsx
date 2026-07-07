import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminApi } from "@/api/realApi";
import type { Category } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/admin/categories")({ component: Categories });

function Categories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [name, setName] = useState("");
  useEffect(() => { adminApi.listCategories().then(setCats); }, []);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    const c = await adminApi.addCategory(name);
    setCats(x => [...x, c]);
    setName("");
    toast.success("Category added");
  }
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Service categories</h1>
      <form onSubmit={add} className="mt-6 flex gap-2 max-w-md">
        <Input placeholder="New category name" value={name} onChange={e => setName(e.target.value)} />
        <Button variant="mango">Add</Button>
      </form>
      <div className="mt-6 grid gap-2 sm:grid-cols-3 md:grid-cols-4">
        {cats.map(c => <Card key={c.id} className="p-4">{c.name}</Card>)}
      </div>
    </div>
  );
}
