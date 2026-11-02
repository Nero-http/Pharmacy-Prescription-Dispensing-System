import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PackagePlus, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { SharedData } from '@/types';

interface Medicine {
    id: number;
    medicine_sku: string;
    medicine_brand: string;
    generic_name: string;
    dosage_mg: number;
    stock_quantity: number;
    unit_price: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface MedicinePage {
    data: Medicine[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface MedicineIndexProps {
    medicines: MedicinePage;
    search: string;
}

const amount = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function StockBadge({ quantity }: { quantity: number }) {
    const status = quantity === 0
        ? { label: 'Out of stock', style: 'bg-red-50 text-red-700' }
        : quantity <= 10
          ? { label: 'Low stock', style: 'bg-amber-50 text-amber-800' }
          : { label: 'In stock', style: 'bg-emerald-50 text-emerald-800' };

    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.style}`}>{status.label}</span>;
}

export default function MedicineIndex({ medicines, search }: MedicineIndexProps) {
    const [query, setQuery] = useState(search);
    const { flash } = usePage<SharedData>().props;

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(route('medicines.index'), { search: query }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Medicine Management', href: route('medicines.index') }]}>
            <Head title="Medicine Management" />
            <main className="space-y-6 p-4 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">Inventory</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Medicine Management</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Manage your catalog, pricing, and available stock.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('medicines.create')}><PackagePlus /> Add medicine</Link>
                    </Button>
                </div>

                <Card className="rounded-xl shadow-sm">
                    <CardContent className="p-4 md:p-6">
                        {flash.success && (
                            <div role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                                {flash.success}
                            </div>
                        )}
                        <form onSubmit={submitSearch} className="mb-5 flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                                <Input
                                    aria-label="Search medicines"
                                    className="pl-9"
                                    placeholder="Search by SKU, brand, or generic name"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="outline">Search inventory</Button>
                        </form>

                        {medicines.data.length === 0 ? (
                            <div className="rounded-lg border border-dashed bg-muted/20 px-6 py-14 text-center">
                                <PackagePlus className="mx-auto size-9 text-muted-foreground" />
                                <h2 className="mt-4 font-semibold">{search ? 'No matching medicines' : 'Your medicine catalog is empty'}</h2>
                                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                                    {search ? 'Try another SKU, brand, or generic name.' : 'Add your first medicine to start tracking stock and dispensing activity.'}
                                </p>
                                {!search && (
                                    <Button className="mt-5" asChild>
                                        <Link href={route('medicines.create')}><PackagePlus /> Add first medicine</Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[760px] text-left text-sm">
                                        <thead>
                                            <tr className="border-b text-xs tracking-wide text-muted-foreground uppercase">
                                                <th className="px-3 py-3 font-medium">Medicine</th>
                                                <th className="px-3 py-3 font-medium">SKU</th>
                                                <th className="px-3 py-3 font-medium">Price</th>
                                                <th className="px-3 py-3 font-medium">Available stock</th>
                                                <th className="px-3 py-3 font-medium">Status</th>
                                                <th className="px-3 py-3 text-right font-medium">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {medicines.data.map((medicine) => (
                                                <tr key={medicine.id} className="hover:bg-muted/30">
                                                    <td className="px-3 py-4">
                                                        <p className="font-medium">{medicine.medicine_brand}</p>
                                                        <p className="mt-0.5 text-xs text-muted-foreground">{medicine.generic_name} · {medicine.dosage_mg} mg</p>
                                                    </td>
                                                    <td className="px-3 py-4 font-mono text-xs text-muted-foreground">{medicine.medicine_sku}</td>
                                                    <td className="px-3 py-4 font-medium tabular-nums">{amount.format(Number(medicine.unit_price))}</td>
                                                    <td className="px-3 py-4 tabular-nums">{medicine.stock_quantity.toLocaleString()} units</td>
                                                    <td className="px-3 py-4"><StockBadge quantity={medicine.stock_quantity} /></td>
                                                    <td className="px-3 py-4 text-right">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={route('medicines.edit', medicine.id)}>Edit</Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {medicines.data.length} of {medicines.total} medicines
                                    </p>
                                    {medicines.last_page > 1 && (
                                        <nav className="flex flex-wrap gap-1" aria-label="Medicine pages">
                                            {medicines.links.map((link, index) => (
                                                link.url ? (
                                                    <Link
                                                        key={`${link.label}-${index}`}
                                                        href={link.url}
                                                        preserveScroll
                                                        className={`rounded-md border px-3 py-1.5 text-sm ${link.active ? 'border-primary bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ) : (
                                                    <span
                                                        key={`${link.label}-${index}`}
                                                        className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground opacity-50"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                )
                                            ))}
                                        </nav>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
