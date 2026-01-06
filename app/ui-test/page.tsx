"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UiTestPage() {
  const [open, setOpen] = useState(false);
  const [condition, setCondition] = useState<string | undefined>();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 py-10">
      <h1 className="text-xl font-semibold tracking-tight">UI Test</h1>

      <Card>
        <CardHeader>
          <CardTitle>shadcn/ui smoke test</CardTitle>
          <CardDescription>Verifies base components render and behave.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button type="button" onClick={() => setOpen(true)}>
              Open dialog
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  Open via trigger
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog</DialogTitle>
                  <DialogDescription>Radix dialog renders correctly.</DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>

          <Input placeholder="Input component" />

          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </main>
  );
}

