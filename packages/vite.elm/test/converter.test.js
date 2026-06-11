import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { convertReactComponent, convertReactProject, SHADCN_COMPONENTS } from '../src/converter.js';

const sample = String.raw`
"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DemoCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent>
        <Form>
          <FormField name="email">
            <FormItem>
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormControl><Input id="email" type="email" placeholder="m@example.com" /></FormControl>
            </FormItem>
          </FormField>
        </Form>
        <Dialog>
          <DialogTrigger asChild><Button variant="outline" onClick={() => null}>Open</Button></DialogTrigger>
          <DialogContent>Dialog body</DialogContent>
        </Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
          <DropdownMenuContent><DropdownMenuItem>Profile</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu>
        <Table>
          <TableHeader><TableRow><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody><TableRow><TableCell><Badge variant="secondary">Paid</Badge></TableCell></TableRow></TableBody>
        </Table>
        <Avatar><AvatarImage src="/avatar.png" alt="User" /><AvatarFallback>AA</AvatarFallback></Avatar>
        <Tabs defaultValue="account"><TabsList><TabsTrigger value="account">Account</TabsTrigger></TabsList><TabsContent value="account">Settings</TabsContent></Tabs>
      </CardContent>
    </Card>
  )
}
`;

test('documents exactly ten shadcn/ui mapping families', () => {
  assert.deepEqual(SHADCN_COMPONENTS, ['Button', 'Card', 'Input', 'Dialog', 'DropdownMenu', 'Form', 'Table', 'Badge', 'Avatar', 'Tabs']);
});

test('converts common shadcn/ui TSX components into Elm Html nodes', () => {
  const elm = convertReactComponent(sample, { moduleName: 'DemoCard' });
  assert.match(elm, /module DemoCard exposing \(view\)/);
  assert.match(elm, /Html\.button \[ Attr\.class "shadcn-button shadcn-button-outline"/);
  assert.match(elm, /Html\.input \[ Attr\.class "shadcn-input"/);
  assert.match(elm, /Html\.form \[ Attr\.class "shadcn-form"/);
  assert.match(elm, /Html\.table \[ Attr\.class "shadcn-table"/);
  assert.match(elm, /Html\.span \[ Attr\.class "shadcn-badge shadcn-badge-secondary"/);
  assert.match(elm, /Html\.img \[ Attr\.class "shadcn-avatar-image"/);
  assert.match(elm, /Attr\.attribute "data-react-onclick" "TODO: map event to Elm Msg"/);
  assert.doesNotMatch(elm, /converted-react-component--unsupported/);
});

test('scans React TSX projects and writes Elm modules', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vite-elm-converter-'));
  const input = path.join(root, 'src');
  const output = path.join(root, 'elm');
  fs.mkdirSync(input, { recursive: true });
  fs.writeFileSync(path.join(input, 'demo.tsx'), sample);
  fs.writeFileSync(path.join(input, 'plain.ts'), 'export const value = 1;');

  const converted = convertReactProject(input, output);

  assert.equal(converted.length, 1);
  assert.equal(path.basename(converted[0].output), 'Demo.elm');
  assert.match(fs.readFileSync(converted[0].output, 'utf8'), /shadcn\/ui mappings covered/);
});
