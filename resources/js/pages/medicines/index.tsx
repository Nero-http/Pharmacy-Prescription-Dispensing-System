import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { PackagePlus, Pencil, Pill, Search, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';

interface Medicine {
    id: number;
    medicine_sku: string;
    medicine_brand: string;
    generic_name: string;
    dosage_mg: number;
    dosage_form: string | null;
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
    from: number | null;
    links: PaginationLink[];
}

interface MedicineIndexProps {
    medicines: MedicinePage;
    search: string;
    stockStatus: StockStatus;
    stockCounts: Record<StockStatus, number>;
    lowStockThreshold: number;
}

type StockStatus = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

const stockFilters: { value: StockStatus; label: string }[] = [
    { value: 'all', label: 'All Medicines' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
];

const amount = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function StockBadge({ quantity, threshold }: { quantity: number; threshold: number }) {
    if (quantity === 0) {
        return <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">Out of stock</span>;
    }
    if (quantity <= threshold) {
        return <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">Low stock</span>;
    }
    return <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">In stock</span>;
}

export default function MedicineIndex({ medicines, search, stockStatus, stockCounts, lowStockThreshold }: MedicineIndexProps) {
    const [query, setQuery] = useState(search);
    const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null);
    const { flash } = usePage<SharedData>().props;
    const { delete: destroy, processing: deleting } = useForm();

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(route('medicines.index'), { search: query, stock_status: stockStatus }, { preserveState: true, replace: true });
    }

    function handleDelete() {
        if (!deleteTarget) return;
        destroy(route('medicines.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Medicine Management', href: route('medicines.index') }]}>
            <Head title="Medicine Management" />

            <AlertDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open && !deleting) setDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete medicine?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{deleteTarget?.medicine_brand}</strong> will be removed from active medicine lists. Existing dispensing history
                            and this medicine&apos;s records will be preserved.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? 'Deleting…' : 'Delete medicine'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <main className="ppds-page">
                <div className="ppds-page-heading">
                    <div>
                        <p className="text-primary text-sm font-medium">Inventory</p>
                        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Medicine Management</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Manage your medicine catalog, pricing, and available stock.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('medicines.create')}>
                            <PackagePlus className="size-4" />
                            Add medicine
                        </Link>
                    </Button>
                </div>

                <Card className="rounded-xl shadow-sm">
                    <CardContent className="p-4 md:p-6">
                        {flash.success && (
                            <div
                                role="status"
                                className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
                            >
                                {flash.success}
                            </div>
                        )}

                        <form onSubmit={submitSearch} className="mb-5 flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden="true" />
                                <Input
                                    aria-label="Search medicines"
                                    className="pl-9"
                                    placeholder="Search by SKU, brand, or generic name"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="outline">
                                Search
                            </Button>
                            {(search || query) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setQuery('');
                                        router.get(route('medicines.index'), { stock_status: stockStatus }, { preserveState: true, replace: true });
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>

                        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter medicines by stock status">
                            {stockFilters.map((filter) => (
                                <Button
                                    key={filter.value}
                                    type="button"
                                    variant={stockStatus === filter.value ? 'default' : 'outline'}
                                    aria-pressed={stockStatus === filter.value}
                                    onClick={() =>
                                        router.get(
                                            route('medicines.index'),
                                            {
                                                search,
                                                stock_status: filter.value,
                                            },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                                replace: true,
                                            },
                                        )
                                    }
                                >
                                    {filter.label}
                                    <span className="ml-1 tabular-nums">{stockCounts[filter.value]}</span>
                                </Button>
                            ))}
                        </div>

                        {medicines.data.length === 0 ? (
                            <div className="bg-muted/20 rounded-lg border border-dashed px-6 py-14 text-center">
                                <Pill className="text-muted-foreground mx-auto size-9" />
                                <h2 className="mt-4 font-semibold">
                                    {medicines.total === 0 && !search && stockStatus === 'all'
                                        ? 'Your medicine catalog is empty'
                                        : 'No matching medicines'}
                                </h2>
                                <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
                                    {medicines.total === 0 && !search && stockStatus === 'all'
                                        ? 'Add your first medicine to start tracking stock and dispensing activity.'
                                        : search
                                          ? 'Try another SKU, brand, or generic name.'
                                          : 'Try another stock filter or adjust your search.'}
                                </p>
                                {medicines.total === 0 && !search && stockStatus === 'all' && (
                                    <Button className="mt-5" asChild>
                                        <Link href={route('medicines.create')}>
                                            <PackagePlus className="size-4" />
                                            Add first medicine
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[760px] text-left text-sm">
                                        <thead>
                                            <tr className="text-muted-foreground border-b text-xs font-medium tracking-wide uppercase">
                                                <th className="px-3 py-3">#</th>
                                                <th className="px-3 py-3">Medicine</th>
                                                <th className="px-3 py-3">SKU</th>
                                                <th className="px-3 py-3">Form</th>
                                                <th className="px-3 py-3 text-right">Unit price</th>
                                                <th className="px-3 py-3 text-right">Stock</th>
                                                <th className="px-3 py-3">Status</th>
                                                <th className="px-3 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {medicines.data.map((medicine, index) => {
                                                const rowNumber = (medicines.from ?? 1) + index;
                                                return (
                                                    <tr key={medicine.id} className="hover:bg-muted/30">
                                                        <td className="text-muted-foreground px-3 py-3.5 tabular-nums">{rowNumber}</td>
                                                        <td className="px-3 py-3.5">
                                                            <p className="font-medium">{medicine.medicine_brand}</p>
                                                            <p className="text-muted-foreground mt-0.5 text-xs">
                                                                {medicine.generic_name} · {medicine.dosage_mg} mg
                                                            </p>
                                                        </td>
                                                        <td className="text-muted-foreground px-3 py-3.5 font-mono text-xs">
                                                            {medicine.medicine_sku}
                                                        </td>
                                                        <td className="text-muted-foreground px-3 py-3.5 text-sm">
                                                            {medicine.dosage_form ?? <span className="italic opacity-50">—</span>}
                                                        </td>
                                                        <td className="px-3 py-3.5 text-right font-medium tabular-nums">
                                                            {amount.format(Number(medicine.unit_price))}
                                                        </td>
                                                        <td className="px-3 py-3.5 text-right tabular-nums">
                                                            {medicine.stock_quantity.toLocaleString()}
                                                        </td>
                                                        <td className="px-3 py-3.5">
                                                            <StockBadge quantity={medicine.stock_quantity} threshold={lowStockThreshold} />
                                                        </td>
                                                        <td className="px-3 py-3.5 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button variant="outline" size="sm" asChild>
                                                                    <Link href={route('medicines.edit', medicine.id)}>
                                                                        <Pencil className="size-3.5" />
                                                                        Edit
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-destructive hover:text-destructive"
                                                                    onClick={() => setDeleteTarget(medicine)}
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-muted-foreground text-sm">
                                        Showing {medicines.data.length} of {medicines.total} medicine
                                        {medicines.total !== 1 ? 's' : ''}
                                    </p>
                                    {medicines.last_page > 1 && (
                                        <nav className="flex flex-wrap gap-1" aria-label="Medicine pages">
                                            {medicines.links.map((link, i) =>
                                                link.url ? (
                                                    <Link
                                                        key={i}
                                                        href={link.url}
                                                        preserveScroll
                                                        className={`rounded-md border px-3 py-1.5 text-sm ${
                                                            link.active
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'bg-background text-foreground hover:bg-muted'
                                                        }`}
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        key={i}
                                                        className="text-muted-foreground rounded-md border px-3 py-1.5 text-sm opacity-50"
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                ),
                                            )}
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
