import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, PackagePlus, Save } from 'lucide-react';
import type { FormEvent } from 'react';

interface Medicine {
    id: number;
    medicine_sku: string;
    medicine_brand: string;
    generic_name: string;
    dosage_mg: number;
    stock_quantity: number;
    unit_price: string;
}

interface MedicineFormData {
    [key: string]: string;
    medicine_sku: string;
    medicine_brand: string;
    generic_name: string;
    dosage_mg: string;
    stock_quantity: string;
    unit_price: string;
}

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
    return <Label htmlFor={htmlFor}>{children} <span className="text-destructive" aria-label="required">*</span></Label>;
}

export default function MedicineForm({ medicine }: { medicine: Medicine | null }) {
    const editing = medicine !== null;
    const { data, setData, post, put, processing, errors } = useForm<MedicineFormData>({
        medicine_sku: medicine?.medicine_sku ?? '',
        medicine_brand: medicine?.medicine_brand ?? '',
        generic_name: medicine?.generic_name ?? '',
        dosage_mg: medicine ? String(medicine.dosage_mg) : '',
        stock_quantity: medicine ? String(medicine.stock_quantity) : '',
        unit_price: medicine?.unit_price ?? '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (editing) {
            put(route('medicines.update', medicine.id));
        } else {
            post(route('medicines.store'));
        }
    }

    const title = editing ? 'Edit medicine' : 'Add medicine';

    return (
        <AppLayout breadcrumbs={[
            { title: 'Medicine Management', href: route('medicines.index') },
            { title, href: editing ? route('medicines.edit', medicine.id) : route('medicines.create') },
        ]}>
            <Head title={title} />
            <main className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
                <div>
                    <Button variant="ghost" size="sm" className="-ml-3 mb-3" asChild>
                        <Link href={route('medicines.index')}><ArrowLeft /> Back to medicines</Link>
                    </Button>
                    <p className="text-sm font-medium text-primary">Inventory details</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {editing ? 'Update medicine information, pricing, and current stock.' : 'Add a medicine to the catalog with its current stock and unit price.'}
                    </p>
                </div>

                <Card className="rounded-xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><PackagePlus className="size-5 text-primary" /> Medicine information</CardTitle>
                        <CardDescription>Fields marked with <span className="text-destructive">*</span> are required.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="medicine_sku">Medicine SKU</RequiredLabel>
                                    <Input id="medicine_sku" required maxLength={100} autoComplete="off" placeholder="e.g. MED-001" value={data.medicine_sku} onChange={(event) => setData('medicine_sku', event.target.value)} />
                                    <p className="text-xs text-muted-foreground">Letters, numbers, hyphens, and underscores.</p>
                                    <InputError message={errors.medicine_sku} />
                                </div>
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="medicine_brand">Brand name</RequiredLabel>
                                    <Input id="medicine_brand" required maxLength={255} placeholder="e.g. Paracetamol" value={data.medicine_brand} onChange={(event) => setData('medicine_brand', event.target.value)} />
                                    <InputError message={errors.medicine_brand} />
                                </div>
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="generic_name">Generic name</RequiredLabel>
                                    <Input id="generic_name" required maxLength={255} placeholder="e.g. Acetaminophen" value={data.generic_name} onChange={(event) => setData('generic_name', event.target.value)} />
                                    <InputError message={errors.generic_name} />
                                </div>
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="dosage_mg">Dosage (mg)</RequiredLabel>
                                    <Input id="dosage_mg" type="number" inputMode="numeric" min="1" max="100000" step="1" required value={data.dosage_mg} onChange={(event) => setData('dosage_mg', event.target.value)} />
                                    <InputError message={errors.dosage_mg} />
                                </div>
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="stock_quantity">Stock quantity</RequiredLabel>
                                    <Input id="stock_quantity" type="number" inputMode="numeric" min="0" max="100000" step="1" required value={data.stock_quantity} onChange={(event) => setData('stock_quantity', event.target.value)} />
                                    <InputError message={errors.stock_quantity} />
                                </div>
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="unit_price">Unit price</RequiredLabel>
                                    <Input id="unit_price" type="number" inputMode="decimal" min="0" max="10000" step="0.01" required value={data.unit_price} onChange={(event) => setData('unit_price', event.target.value)} />
                                    <InputError message={errors.unit_price} />
                                </div>
                            </div>
                            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" asChild><Link href={route('medicines.index')}>Cancel</Link></Button>
                                <Button type="submit" disabled={processing}><Save /> {processing ? 'Saving…' : editing ? 'Save changes' : 'Add medicine'}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
